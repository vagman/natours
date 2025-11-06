import morgan from 'morgan';
import express from 'express';
import qs from 'qs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { fileURLToPath } from 'node:url';
import path from 'node:path';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import viewRouter from './routes/viewRoutes.js';

const app = express();

// Base path to project folder
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ------------ 1) Middleware Functions -------------
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers with CSP configuration
const fontSrcUrls = [
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/',
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.stripe.com'], // allow Stripe API calls
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com/'],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://*.tile.openstreetmap.org',
        'https://a.tile.openstreetmap.org',
        'https://b.tile.openstreetmap.org',
        'https://c.tile.openstreetmap.org',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
      // FIX: allow Stripe iframes created by Stripe.js
      frameSrc: [
        "'self'",
        'https://js.stripe.com',
        'https://hooks.stripe.com',
        'https://checkout.stripe.com',
      ],
      // childSrc for older browsers (fallback for frameSrc)
      childSrc: [
        "'self'",
        'https://js.stripe.com',
        'https://hooks.stripe.com',
        'https://checkout.stripe.com',
      ],
    },
  }),
);

// Development Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Set query parser AFTER body parser
app.set('query parser', str => qs.parse(str));

// FIX: Make req.query writable before mongoSanitize (EXPRESS 5 COMPATIBILITY)
app.use((req, res, next) => {
  // Create a writable copy of req.query
  const queryObj = { ...req.query };

  // Redefine req.query as a writable property
  Object.defineProperty(req, 'query', {
    value: queryObj,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  next();
});

// Data sanitization against NoSQL query injection - configure for Express 5
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Compress all responses sent to clients
app.use(compression());

// Test middleware
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

// ------------- 3) Routes -------------
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Fix for Express 5: Replace app.all('*', ...) with catch-all middleware
app.use((request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

// ERROR-HANDLING MIDDLEWARE
app.use(globalErrorHandler);

export default app;

# Natours API

A production-grade Node.js/Express REST API for a fictional tour booking platform. It covers real-world features like authentication, authorization, file uploads, image processing, geospatial queries, security hardening, and (optionally) Stripe payments.

## Tech Stack
- Node.js, Express
- MongoDB, Mongoose
- JWT authentication (HTTP-only cookies + Bearer tokens)
- Multer + Sharp (image upload & resize)
- MongoDB geospatial queries
- Security: Helmet, rate limiting, sanitization (NoSQL, XSS), HPP
- Nodemailer for transactional emails (password reset, etc.)
- Stripe (optional) for payments and webhooks

## Core Features
- Tours
  - CRUD tours, image upload/resize for cover and gallery
  - Stats (aggregation), monthly plan, top 5 cheap, alias routes
  - Geospatial: find tours within radius, distances from a point
- Users
  - Signup, login, logout, protect routes, role-based access (user, guide, lead-guide, admin)
  - Update profile, upload avatar, change password, password reset via email
- Reviews
  - Nested routes (reviews on tours), ratings average/count per tour
- Bookings (optional)
  - Create booking (Stripe), secure webhook handling, user booking history

## API Routes (summary)
- Tours
  - GET/POST /api/v1/tours
  - GET/PATCH/DELETE /api/v1/tours/:id
  - GET /api/v1/tours/top-5-cheap
  - GET /api/v1/tours/tour-stats
  - GET /api/v1/tours/monthly-plan/:year  (restricted to guide/lead-guide/admin)
  - GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit
  - GET /api/v1/tours/distances/:latlng/unit/:unit
- Users
  - POST /api/v1/users/signup
  - POST /api/v1/users/login
  - GET /api/v1/users/logout
  - POST /api/v1/users/forgotPassword
  - PATCH /api/v1/users/resetPassword/:token
  - PATCH /api/v1/users/updateMyPassword
  - GET/PATCH /api/v1/users/me
  - GET/POST /api/v1/users  (admin)
  - GET/PATCH/DELETE /api/v1/users/:id  (admin)
- Reviews
  - GET/POST /api/v1/tours/:tourId/reviews
  - GET/POST /api/v1/reviews
  - GET/PATCH/DELETE /api/v1/reviews/:id
- Bookings
  - GET/POST /api/v1/bookings  (admin/lead-guide)
  - GET/PATCH/DELETE /api/v1/bookings/:id  (admin/lead-guide)

Note: Protected routes require Authorization (JWT). Some routes are restricted by role.

## Requirements
- Node.js: v.24.11.0
- MongoDB v.8.0.15 (Atlas)

## Setup
1) Install dependencies
npm install

3) Run the app
# Run development mode
```npm run start:dev```

# Run production mode
```npm run start:prod```
App runs at: ```http://localhost:3000```

## Common Scripts (adjust if different in your package.json)
- npm run dev — start in development (e.g., nodemon server.js)
- npm start — start in production (e.g., NODE_ENV=production node server.js)
- npm test — run tests (if configured)
- npm run lint — ESLint
- npm run format — Prettier
- npm run seed:import — import sample data (if script exists)
- npm run seed:delete — delete sample data (if script exists)

## Populate db with sample data
1. Move to directory: ```cd .\dev-data\data```

2. Delete MongoDB data: ```node import-dev-data.js --delete```

3. Comment the following pre-save middleware in ```\models\userModel.js```:
```JavaScript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
```
4. Reuploading data: ```node import-dev-data.js --import```

5. Remove comments so encryption works normally again when signing up as a new user.

6. Check with MongoDB Compass just to make sure: Ctrl + R for a refresh.

## Security & Hardening
- Helmet, rate limiting, xss-clean, hpp, express-mongo-sanitize
- CORS configured for API usage
- HTTP-only cookies for auth in browsers

## Development Notes
- Use Postman/Insomnia to exercise endpoints (JWT required for protected routes).
- Image uploads (users/tours) require multipart/form-data (Multer).
- Stripe webhook endpoint must receive the raw body; configure your server accordingly and set STRIPE_WEBHOOK_SECRET.
 tip: attach to Node process or launch with your server entry file (e.g., server.js or app.js).

## License
MIT

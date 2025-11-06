import AppError from './../utils/appError.js';

const handleCastErrorDB = error => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = error => {
  const value = error.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, request, response) => {
  // A) API
  if (request.originalUrl.startsWith('/api')) {
    response.status(error.statusCode || 500).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // B) RENDERED WEBSITE
    console.error('ERROR 💥', error);
    response.status(error.statusCode || 500).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
};

const handleValidationErrorDB = error => {
  const errors = Object.values(error.errors).map(
    singleError => singleError.message,
  );

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorProd = (error, request, response) => {
  // A) API
  if (request.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', error);
    // 2) Send generic message
    return response.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (error.isOperational) {
    console.log(error);
    return response.status(error.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: error.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', error);
  // 2) Send generic message
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

const globalErrorHandler = (error, request, response, next) => {
  (response.status(error.statusCode || 500),
    (error.status = error.status || 'error'));

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, request, response);
  } else {
    // Hide error details in production
    let errorProduction = Object.assign(error);

    if (error.name === 'CastError') errorProduction = handleCastErrorDB(error);
    if (error.code === 11000) errorProduction = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      errorProduction = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') errorProduction = handleJWTError();
    if (error.name === 'TokenExpiredError')
      errorProduction = handleJWTExpiredError();

    sendErrorProd(errorProduction, request, response);
  }
};

export default globalErrorHandler;

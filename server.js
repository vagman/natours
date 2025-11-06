import app from './app.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

process.on('uncaughtException', error => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(error.name, error.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });
const dbConnectionString = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(dbConnectionString).then(() => {
  console.log('DB connection successful!');
});

// ------------- 4) Start Server -------------
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});

process.on('unhandledRejection', error => {
  console.log(error.name, error.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

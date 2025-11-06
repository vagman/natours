/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import Tour from '../../models/tourModel.js';
import User from '../../models/userModel.js';
import Review from '../../models/reviewModel.js';

dotenv.config({ path: '../../.env' });
const dbConnectionString = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(dbConnectionString)
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch(error => {
    console.error('DB connection error:', error.message);
  });

// Reading JSON File
const __dirname = dirname(fileURLToPath(import.meta.url));
const tours = JSON.parse(readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(readFileSync(`${__dirname}/reviews.json`));

// Import Data to MongoDB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('Data successfully loaded!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

// Delete All Data From MongoDB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data successfully deleted!');
    process.exit();
  } catch (error) {
    console.error(`ERROR while deleting: ${error}`);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

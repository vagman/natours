// Challenge: create the Review Model: review / rating / createdAt / ref to tour / ref to user
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import Tour from './tourModel.js';

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
      trim: true,
      maxlength: [500, 'A review must have less or equal than 500 characters'],
      minlength: [10, 'A review must have more or equal than 10 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating can not be empty!'],
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true,
  },
);

// Preventing duplicate reviews: one user, one review per tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // Turning off tour populate on reviews for performance optimization

  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calculateAverageRatings = async function (tourId) {
  const statistics = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numberOfRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  if (statistics.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: statistics[0].numberOfRatings,
      ratingsAverage: statistics[0].averageRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // This points to the current review
  this.constructor.calculateAverageRatings(this.tour);
});

// Handle updates and deletions of reviews
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calculateAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;

// POST /tour/(tour_id)123asdf4.../reviews
// GET /tour/(tour_id)123asdf4.../reviews
// GET /tour/(tour_id)123asdf4.../reviews/(review_id)123asdf4...

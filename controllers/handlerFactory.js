import AppError from './../utils/appError.js';
import catchAsync from './../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

export const deleteOne = Model =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndDelete(request.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    response.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = Model =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    response.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const createOne = Model =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });

export const getOne = (Model, populateOptions) =>
  catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    response.status(200).json({
      status: 'success',
      data: doc,
    });
  });

export const getAll = Model =>
  catchAsync(async (request, response, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (request.params.tourId) filter = { tour: request.params.tourId };

    const features = new APIFeatures(Model.find(filter), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    response.status(200).json({
      status: 'success',
      requestedAt: request.requestTime,
      result: doc.length,
      data: doc,
    });
  });

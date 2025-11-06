import multer from 'multer';
import sharp from 'sharp';

import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import * as factory from './handlerFactory.js';

// const multerStorage = multer.diskStorage({
//   destination: (request, file, callback) => {
//     callback(null, 'public/img/users');
//   },
//   filename: (request, file, callback) => {
//     // user-657495948asd885494-12312312321.jpeg
//     const extension = file.mimetype.split('/')[1];
//     callback(null, `user-${request.user.id}-${Date.now()}.${extension}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (request, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload only images.', 400),
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (request, response, next) => {
  if (!request.file) return next();

  request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

  await sharp(request.file.buffer)
    .resize(500, 500) // width, height
    .toFormat('jpeg') // convert to jpeg
    .jpeg({ quality: 90 }) // set quality to 90%
    .toFile(`public/img/users/${request.file.filename}`); // save to disk

  next();
});

const filterObject = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach(element => {
    if (allowedFields.includes(element)) newObject[element] = obj[element];
  });
  return newObject;
};

const getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

const updateCurrentUserData = catchAsync(async (request, response, next) => {
  // 1) Create error if user POSTs password data
  if (request.body.password || request.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObject(request.body, 'name', 'email');
  if (request.file) filteredBody.photo = request.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );

  response.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

const createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please use /signup instead',
  });
};

const deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: 'success',
    data: null,
  });
});

const getAllUsers = factory.getAll(User);
const deleteUser = factory.deleteOne(User);
const getUser = factory.getOne(User);
// Do NOT update passwords with this!
const updateUser = factory.updateOne(User);

export {
  uploadUserPhoto,
  resizeUserPhoto,
  getMe,
  getAllUsers,
  updateCurrentUserData,
  createUser,
  getUser,
  updateUser,
  deleteMe,
  deleteUser,
};

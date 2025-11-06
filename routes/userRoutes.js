import express from 'express';
import {
  getMe,
  getAllUsers,
  createUser,
  updateCurrentUserData,
  getUser,
  updateUser,
  deleteMe,
  deleteUser,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/userController.js';
import {
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.get('/me', getMe, getUser);

router.patch('/updateMyPassword', updatePassword);
router.patch(
  '/updateMe',
  uploadUserPhoto,
  resizeUserPhoto,
  updateCurrentUserData,
);
router.delete('/deleteMe', deleteMe);

// Admin routes
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;

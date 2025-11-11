import express from 'express';
import {
  getOverview,
  getTour,
  getMyTours,
  getLoginForm,
  getAccount,
  updateUserData,
} from '../controllers/viewsController.js';
import { protect, isLoggedIn } from '../controllers/authController.js';

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);

router.post('/submit-user-data', protect, updateUserData);

export default router;

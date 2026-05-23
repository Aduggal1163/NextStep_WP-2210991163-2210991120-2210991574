import { Router } from 'express';
import { requireSignIn } from '../Middlewares/auth.middleware.js';
import {
  getAllUsers,
  getAllPlanners,
  getAllVendors,
  updateVendorStatus,
  updatePlannerStatus,
  updateUserStatus,
  assignPlannerToBooking,
  getAnalytics,
  getBookingStats,
} from '../Controller/Admin.controller.js';

const router = Router();

router.get('/users', requireSignIn, getAllUsers);
router.get('/planners', requireSignIn, getAllPlanners);
router.get('/vendors', requireSignIn, getAllVendors);
router.put('/vendor/:vendorId/status', requireSignIn, updateVendorStatus);
router.put('/planner/:plannerId/status', requireSignIn, updatePlannerStatus);
router.put('/user/:userId/status', requireSignIn, updateUserStatus);
router.put('/booking/:bookingId/assign-planner', requireSignIn, assignPlannerToBooking);
router.get('/analytics', requireSignIn, getAnalytics);
router.get('/booking-stats', requireSignIn, getBookingStats);

export default router;


import { Router } from 'express';
import { requireSignIn } from '../Middlewares/auth.middleware.js';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  assignPlanner,
  updateBookingStatus,
  assignVendors,
  getBooking,
} from '../Controller/Booking.controller.js';

const router = Router();

// User routes
router.post('/create', requireSignIn, createBooking);
router.get('/my-bookings', requireSignIn, getMyBookings);
router.get('/:bookingId', requireSignIn, getBooking);

// Planner/Admin routes
router.get('/all', requireSignIn, getAllBookings);
router.put('/:bookingId/assign-planner', requireSignIn, assignPlanner);
router.put('/:bookingId/status', requireSignIn, updateBookingStatus);
router.put('/:bookingId/assign-vendors', requireSignIn, assignVendors);

export default router;


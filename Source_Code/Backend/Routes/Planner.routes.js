import { Router } from 'express';
import { requireSignIn } from '../Middlewares/auth.middleware.js';
import {
  getMyBookings,
  createCustomPackage,
  suggestVendors,
  assignVendorsToBooking,
  getAllVendors,
  getCustomizationRequests,
  respondToCustomization,
} from '../Controller/Planner.controller.js';

const router = Router();

router.get('/my-bookings', requireSignIn, getMyBookings);
router.post('/create-package', requireSignIn, createCustomPackage);
router.post('/suggest-vendors', requireSignIn, suggestVendors);
router.put('/:bookingId/assign-vendors', requireSignIn, assignVendorsToBooking);
router.get('/vendors', requireSignIn, getAllVendors);
router.get('/:bookingId/customization-requests', requireSignIn, getCustomizationRequests);
router.put('/:bookingId/respond-customization', requireSignIn, respondToCustomization);

export default router;


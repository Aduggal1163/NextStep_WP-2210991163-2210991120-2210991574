import {Router} from 'express';
import { addReview, deleteReview, getAllPlanners, getAllVendors, guestDetails, profile, updateProfile, confirmBooking, getBookingProgress} from '../Controller/User.controller.js';
import { suggestVendors } from '../Controller/Planner.controller.js';
import {requireSignIn} from '../Middlewares/auth.middleware.js';

const router = Router();

router.post("/getProfile", requireSignIn, profile);
router.post("/updateProfile", requireSignIn, updateProfile);
router.post("/submitGuestDetails", requireSignIn, guestDetails);
router.get("/allVendors", requireSignIn, getAllVendors);
router.get("/allPlanner", requireSignIn, getAllPlanners);
router.post("/review/add", requireSignIn, addReview);
router.delete("/review/:reviewId", requireSignIn, deleteReview);
router.put("/booking/:bookingId/confirm", requireSignIn, confirmBooking);
router.get("/booking/:bookingId/progress", requireSignIn, getBookingProgress);
router.post("/suggest-vendors", requireSignIn, suggestVendors);

export default router;
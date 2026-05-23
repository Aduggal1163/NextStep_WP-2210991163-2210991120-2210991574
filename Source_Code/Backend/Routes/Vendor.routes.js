import { Router } from 'express';
import { requireSignIn } from '../Middlewares/auth.middleware.js';
import {
  getMyAssignments,
  getAssignment,
  addService,
  updateService,
  deleteService,
  getMyServices,
  updateAvailability,
  uploadDeliverables,
  submitInvoice,
  getMyReviews,
} from '../Controller/Vendor.controller.js';

const router = Router();

router.get('/my-assignments', requireSignIn, getMyAssignments);
router.get('/assignment/:bookingId', requireSignIn, getAssignment);
router.post('/service', requireSignIn, addService);
router.put('/service/:serviceId', requireSignIn, updateService);
router.delete('/service/:serviceId', requireSignIn, deleteService);
router.get('/services', requireSignIn, getMyServices);
router.put('/availability', requireSignIn, updateAvailability);
router.post('/:bookingId/deliverables', requireSignIn, uploadDeliverables);
router.post('/:bookingId/invoice', requireSignIn, submitInvoice);
router.get('/reviews', requireSignIn, getMyReviews);

export default router;


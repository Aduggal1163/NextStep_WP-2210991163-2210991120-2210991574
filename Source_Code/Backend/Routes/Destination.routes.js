import { Router } from 'express';
import { requireSignIn } from '../Middlewares/auth.middleware.js';
import {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../Controller/Destination.controller.js';

const router = Router();

// Public routes
router.get('/all', getAllDestinations);
router.get('/:destinationId', getDestination);

// Admin routes
router.post('/create', requireSignIn, createDestination);
router.put('/:destinationId', requireSignIn, updateDestination);
router.delete('/:destinationId', requireSignIn, deleteDestination);

export default router;


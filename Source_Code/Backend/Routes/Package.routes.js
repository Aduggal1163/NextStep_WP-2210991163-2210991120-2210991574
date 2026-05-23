import { Router } from 'express';
import { requireSignIn } from '../Middlewares/auth.middleware.js';
import {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
} from '../Controller/Package.controller.js';

const router = Router();

// Public routes
router.get('/all', getAllPackages);
router.get('/:packageId', getPackage);

// Planner/Admin routes
router.post('/create', requireSignIn, createPackage);
router.put('/:packageId', requireSignIn, updatePackage);

// Admin only routes
router.delete('/:packageId', requireSignIn, deletePackage);

export default router;


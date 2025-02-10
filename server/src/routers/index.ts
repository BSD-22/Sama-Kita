import { Router } from 'express';

import llmController from '../controllers/llmController';
import { authentication } from '../middlewares/authentication';
import errorHandler from '../middlewares/errorHandler';
import authRoutes from './auth';
import llmRoutes from './llm';
import paymentRoutes from './payment';
import propertyRoutes from './property';
import renterRoutes from './renter';
import roomRoutes from './room';

const router = Router();

// Public routes
router.use('/', authRoutes);
router.post('/llm', llmController.getResponsePublic);

// Protected routes
router.use(authentication);
router.use('/properties', propertyRoutes);
router.use('/renters', renterRoutes);
router.use('/payments', paymentRoutes);
router.use('/llm', llmRoutes);
router.use('/rooms', roomRoutes);

router.use(errorHandler);

export default router;

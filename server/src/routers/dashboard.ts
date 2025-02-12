import { Router } from 'express';

import dashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/performance', dashboardController.getPropertySummary);

export default router;

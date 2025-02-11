import { Router } from 'express';

import SubscriptionController from '../controllers/subscriptionController';
import { authentication } from '../middlewares/authentication';

const router = Router();

router.use(authentication);
router.get('/current', SubscriptionController.getCurrentSubscription);
router.post('/purchase', SubscriptionController.createSubscriptionPayment);
router.post('/notification', SubscriptionController.handlePaymentNotification);

export default router;

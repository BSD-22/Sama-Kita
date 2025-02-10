import { Router } from 'express';
import midtransController from '../controllers/midtransController';

const router = Router();

router.post('/midtrans-getaway-payment', midtransController.midtransPayment);
router.get('/check-payment-status/:orderId/renter/:renterId', midtransController.checkPaymentStatus);

export default router;

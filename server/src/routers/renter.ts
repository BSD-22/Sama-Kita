import { Router } from 'express';
import renterController from '../controllers/renterController';
import { upload } from '../helpers/multer';

const router = Router();

router.get('/', renterController.getRentersByUser);
router.post('/', upload.single('invoice'), renterController.addRentersExpenses);
router.get('/:id', renterController.getRenterById);
router.delete('/:id', renterController.deleteRenterById);

// Front Desk Routes
router.post('/add', renterController.addNewRenter);
router.put('/:id/end-contract', renterController.endRenterContract);
router.put('/:id/complete-payment', renterController.completeManualPayment);

export default router;

import { Router } from 'express';

import renterController from '../controllers/renterController';
import { upload } from '../helpers/multer';

const router = Router();

// Get all renters for the logged-in user
router.get('/', renterController.getRentersByUser);

// Get specific renter by ID
router.get('/:id', renterController.getRenterById);

// Update renter details
router.put('/:id', renterController.updateRenter);

// Add renter expenses
router.post('/expenses/:propertyId', upload.single('serviceInvoice'), renterController.addRentersExpenses);

// Delete renter
router.delete('/:id', renterController.deleteRenterById);

// Complete manual payment
router.put('/:id/complete-manual-payment', renterController.completeManualPayment);

// Front Desk Routes
router.post('/add', renterController.createRenter);
router.put('/:id/end-contract', renterController.endRenterContract);

// Get pending payments for a renter
router.get('/:id/pending-payments', renterController.getPendingPayments);

export default router;

import { Router } from 'express';
import OwnerExpensesController from '../controllers/ownerExpensesController';
import authentication from '../middlewares/authentication';

const router = Router();

router.use(authentication);

// Expense Settings Routes
router.post('/settings', OwnerExpensesController.createExpenseSetting);
router.get('/settings/property/:propertyId', OwnerExpensesController.getExpenseSettings);
router.patch('/settings/:id', OwnerExpensesController.updateExpenseSetting);
router.delete('/settings/:id', OwnerExpensesController.deleteExpenseSetting);

// Expenses Routes
router.get('/property/:propertyId', OwnerExpensesController.getOwnerExpenses);
router.patch('/:id/status', OwnerExpensesController.updateExpenseStatus);

export default router;

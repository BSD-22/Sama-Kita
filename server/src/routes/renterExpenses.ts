import { Router } from 'express';

import RenterExpensesController from '../controllers/renterExpensesController';
import authentication from '../middlewares/authentication';

const router = Router();

router.use(authentication);
router.patch('/:id', RenterExpensesController.updateExpense);

export default router;

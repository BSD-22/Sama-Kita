import { Router } from 'express';

import UserController from '../controllers/userController';
import { authentication } from '../middlewares/authentication';

const router = Router();

router.use(authentication);
router.get('/subscription', UserController.getSubscription);

export default router;

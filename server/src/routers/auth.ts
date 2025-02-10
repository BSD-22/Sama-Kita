import { Router } from 'express';
import authController from '../controllers/authController';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/otp', authController.loginOtp);
router.post('/login-google', authController.googleLogin);
router.post('/user', authController.getUserByEmail);
router.get('/logout', authController.handleLogout);

export default router;

import { Router } from 'express';
import authController from '../controllers/authController';
import errorHandler from '../middlewares/errorHandler';
import { authentication } from '../middlewares/authentication';
import llmController from '../controllers/llmController';
import propertyController from '../controllers/propertyController';
import { upload } from '../helpers/multer';
import midtransController from '../controllers/midtransController';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/otp', authController.loginOtp);
router.post('/login-google', authController.googleLogin);
router.post('/user', authController.getUserByEmail);
router.post('/llm', llmController.getResponsePublic);

router.use(authentication);
router.get('/logout', authController.handleLogout);
router.get('/all-data', propertyController.getAllData);
router.get('/response-graph-performance', llmController.getPropertySummary);
router.get('/properties', propertyController.getPropertyByUser);
router.get('/renters', propertyController.getRentersByProperty);
router.post('/renters', upload.single('invoice'), propertyController.addRentersExpenses);
router.get('/renter/:id', propertyController.getRenterById);
router.delete('/renter/:id', propertyController.deleteRenterById);
router.get('/occupancies', propertyController.getOcuppancies);
router.post('/midtrans-getaway-payment', midtransController.midtransPayment);
router.get('/check-payment-status/:orderId/renter/:renterId', midtransController.checkPaymentStatus);
// router.get('/renters/:id', propertyController.getRenterById);
// router.post('/transaction-list-midtrans', midtransController.getHistoryList);
router.get('/property/:id', propertyController.getPropertyById);
router.get('/property/rooms/:roomId', propertyController.getRoomById);
router.post('/property/:propertyId/add', upload.single('roomImage'), propertyController.addRoomByPropertyId);
router.put('/property/:propertyId/edit-room/:roomId', upload.single('roomImage'), propertyController.editRoomById);

router.use(errorHandler);

export default router;

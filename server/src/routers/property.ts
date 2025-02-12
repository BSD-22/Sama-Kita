import { Router } from 'express';

import OperationalSettingsController from '../controllers/operationalSettingsController';
import propertyController from '../controllers/propertyController';
import { upload } from '../helpers/multer';

const router = Router();

router.get('/all-data', propertyController.getAllData);
router.get('/', propertyController.getPropertyByUser);
router.post('/', upload.single('propertyImage'), propertyController.addProperty);
router.get('/:id', propertyController.getPropertyById);
router.get('/rooms/:roomId', propertyController.getRoomById);
router.post('/:propertyId/add', upload.single('roomImage'), propertyController.addRoomByPropertyId);
router.put('/:propertyId/edit-room/:roomId', upload.single('roomImage'), propertyController.editRoomById);
router.get('/occupancies', propertyController.getOcuppancies);
router.get('/:propertyId/operational-settings', OperationalSettingsController.getSettings);
router.post('/:propertyId/operational-settings', OperationalSettingsController.updateSettings);

export default router;

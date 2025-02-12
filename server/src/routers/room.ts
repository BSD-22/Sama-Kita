import { Router } from 'express';

import RoomController from '../controllers/roomController';
import { upload } from '../helpers/multer';

const router = Router();

router.get('/', RoomController.getRooms);
router.post('/', upload.single('roomImage'), RoomController.createRoom);
router.get('/properties/:propertyId', RoomController.getRoomsByPropertyId);
router.get('/:id', RoomController.getRoomById);
router.get('/:roomId/individual-rooms', RoomController.getIndividualRoomsByRoomId);
router.get('/properties/list', RoomController.getProperties);

export default router;

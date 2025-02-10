import { Router } from 'express';
import llmController from '../controllers/llmController';

const router = Router();

router.post('/llm', llmController.getResponsePublic);
router.get('/response-graph-performance', llmController.getPropertySummary);

export default router;

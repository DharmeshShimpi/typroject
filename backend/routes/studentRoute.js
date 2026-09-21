import express from 'express';
import { joinOrganization } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/join-organization', authMiddleware, joinOrganization);
export default router;
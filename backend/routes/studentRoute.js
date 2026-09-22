import express from 'express';
import {getMyOrganizations, joinOrganization } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/join-organization', authMiddleware, joinOrganization);
router.get('/my-organizations',authMiddleware,getMyOrganizations);
export default router;
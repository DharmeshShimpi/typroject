import express from 'express';
import {createGroup,getMyOrganizations,getOrganizationDetails, joinOrganization } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/join-organization', authMiddleware, joinOrganization);
router.get('/my-organizations',authMiddleware,getMyOrganizations);
router.post('/groups',authMiddleware,createGroup);
router.get('/organizations/:organizationId',authMiddleware,getOrganizationDetails);
export default router;
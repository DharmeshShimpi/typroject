import express from 'express';
import { joinOrganization, getMyOrganizations, getOrganizationDetails, createGroup, getMyProject } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/join-organization', authMiddleware, joinOrganization);
router.get('/my-organizations', authMiddleware, getMyOrganizations);
router.post('/create-project', authMiddleware, createGroup);
router.get('/my-project/:organizationId', authMiddleware, getMyProject);

export default router;
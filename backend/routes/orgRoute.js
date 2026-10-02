import express from 'express';
import { createOrganization, getMyOrganizations,getTeacherOrganizationOverview } from '../controllers/orgController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createOrganization);
router.get('/', authMiddleware, getMyOrganizations);
router.get('/:organizationId/overview', authMiddleware, getTeacherOrganizationOverview);

export default router;
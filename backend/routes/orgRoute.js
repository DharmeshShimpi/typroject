import express from 'express';
import { createOrganization, getMyOrganizations } from '../controllers/orgController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createOrganization);
router.get('/', authMiddleware, getMyOrganizations);

export default router;
import express from 'express';
import {auth, checkAuthentication} from '../middlewares/auth.middleware';
import { updateNotificationPreferences, getNotificationPreferences } from '../controllers/notificationPreferences.controller';

const router = express.Router();

// Get Notification Preferences
router.get('/notifications', [auth], getNotificationPreferences);

// Manage Notification Preferences
router.put('/notifications', [auth], updateNotificationPreferences);

export default router;



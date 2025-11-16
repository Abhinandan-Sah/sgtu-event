import express from 'express';
const router = express.Router();
import studentController from '../controllers/student.controller.js';
import { authenticateToken } from '../middleware/auth.js';

/**
 * Student Routes
 * Mix of public (login, register) and protected routes
 */

// Public routes
router.post('/login', studentController.login);
router.post('/register', studentController.register);

// Protected routes (require authentication)
router.post('/logout', authenticateToken, studentController.logout);
router.get('/profile', authenticateToken, studentController.getProfile);
router.put('/profile', authenticateToken, studentController.updateProfile);
router.get('/qr-code', authenticateToken, studentController.getQRCode);
router.get('/check-in-history', authenticateToken, studentController.getCheckInHistory);

// Stall interaction routes (self-service inside event)
router.post('/scan-stall', authenticateToken, studentController.scanStall);
router.post('/submit-feedback', authenticateToken, studentController.submitFeedback);
router.get('/my-visits', authenticateToken, studentController.getMyVisits);

export default router;

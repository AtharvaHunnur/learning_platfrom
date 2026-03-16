import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Student Routes
router.post('/student/chat', authenticateToken, AIController.studentChat);
router.get('/student/suggestions', authenticateToken, AIController.studentSuggestions);

// Admin Routes
router.post('/admin/assist', authenticateToken, requireAdmin, AIController.adminAssist);

export default router;

import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Student: Enroll with (Simulated) Payment
router.post('/enroll', authenticateToken, async (req, res) => {
  try {
    const { subjectId, amount } = req.body;
    const userId = BigInt((req as any).user.userId);
    const sid = BigInt(subjectId);

    // 1. Create a simulated payment record
    const payment = await prisma.payments.create({
      data: {
        user_id: userId,
        subject_id: sid,
        amount: amount,
        transaction_id: `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: 'completed'
      }
    });

    // 2. Create enrollment
    const enrollment = await prisma.enrollments.upsert({
      where: { user_id_subject_id: { user_id: userId, subject_id: sid } },
      update: {},
      create: { user_id: userId, subject_id: sid }
    });

    // 3. Increment subject enrollment count
    await prisma.subjects.update({
      where: { id: sid },
      data: { enrollment_count: { increment: 1 } }
    });

    res.json({ message: 'Enrolled and Paid successfully', enrollment, payment });
  } catch (error: any) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Enrollment failed', details: error.message });
  }
});

// Student: Get Payment History
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = BigInt((req as any).user.userId);
    const history = await prisma.payments.findMany({
      where: { user_id: userId },
      include: {
        subjects: { select: { title: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;

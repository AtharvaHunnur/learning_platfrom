import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// /api/admin/stats
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalStudents = await prisma.users.count({ where: { role: 'student' } });
    const totalCourses = await prisma.subjects.count(); // All courses
    const totalEnrollments = await prisma.enrollments.count();
    const totalVideos = await prisma.videos.count();
    
    // Revenue calculation
    const courses = await prisma.subjects.findMany({
      select: {
        price: true,
        _count: {
          select: { enrollments: true }
        }
      }
    });

    let totalRevenue = 0;
    courses.forEach(c => {
      totalRevenue += (Number(c.price) * c._count.enrollments);
    });

    res.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalVideos,
      totalRevenue
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// /api/admin/stats/activity
router.get('/activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Recent enrollments
    const recentEnrollments = await prisma.enrollments.findMany({
      take: 5,
      orderBy: { enrolled_at: 'desc' },
      include: {
        users: { select: { name: true, email: true } },
        subjects: { select: { title: true } }
      }
    });

    // Recent user registrations
    const recentUsers = await prisma.users.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: { name: true, email: true, created_at: true, role: true }
    });

    // Format for dashboard
    const activity = [
      ...recentEnrollments.map(e => ({
        id: `enroll-${e.id}`,
        type: 'enrollment',
        user: e.users?.name || 'Unknown',
        email: e.users?.email || '',
        target: e.subjects?.title || 'Unknown Course',
        timestamp: e.enrolled_at
      })),
      ...recentUsers.map(u => ({
        id: `user-${u.email}`,
        type: 'registration',
        user: u.name,
        email: u.email,
        target: u.role,
        timestamp: u.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()).slice(0, 10);

    res.json(activity);
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// /api/admin/stats/trends
router.get('/trends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const count = await prisma.enrollments.count({
        where: {
          enrolled_at: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      last7Days.push({
        date: startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        enrollments: count
      });
    }
    res.json(last7Days);
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Get My Profile (Student / Admin)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: BigInt((req as any).user.userId) },
      select: { id: true, name: true, email: true, role: true, created_at: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student: Get Profile Summary (Counts)
router.get('/profile-summary', authenticateToken, async (req, res) => {
  try {
    const userId = BigInt((req as any).user.userId);
    
    const enrollmentsCount = await prisma.enrollments.count({
      where: { user_id: userId }
    });

    const enrollments = await prisma.enrollments.findMany({
      where: { user_id: userId },
      include: {
        subjects: {
          include: {
            sections: {
              include: {
                videos: {
                  include: {
                    video_progress: {
                      where: { user_id: userId }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    let completedCourses = 0;
    enrollments.forEach(e => {
      const subject = e.subjects;
      if (!subject) return;

      let totalVideos = 0;
      let completedVideos = 0;

      subject.sections.forEach(s => {
        s.videos.forEach(v => {
          totalVideos++;
          if (v.video_progress[0]?.is_completed) {
            completedVideos++;
          }
        });
      });

      if (totalVideos > 0 && completedVideos === totalVideos) {
        completedCourses++;
      }
    });

    res.json({
      totalEnrolled: enrollmentsCount,
      completedCourses
    });
  } catch (error) {
    console.error('Profile summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get All Users with Progress Summary
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const usersList = await prisma.users.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        created_at: true,
        _count: {
          select: { enrollments: true }
        },
        enrollments: {
          include: {
            subjects: {
              include: {
                sections: {
                  include: {
                    videos: {
                      include: {
                        video_progress: true // We'll filter this in JS or better query
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedUsers = usersList.map(u => {
      let totalVideosInEnrolled = 0;
      let completedVideos = 0;

      u.enrollments.forEach(e => {
        e.subjects?.sections.forEach(s => {
          s.videos.forEach(v => {
            totalVideosInEnrolled++;
            // Check if this specific user completed this video
            const progress = v.video_progress.find(p => p.user_id === u.id);
            if (progress?.is_completed) {
              completedVideos++;
            }
          });
        });
      });

      const avgProgress = totalVideosInEnrolled > 0 
        ? Math.round((completedVideos / totalVideosInEnrolled) * 100) 
        : 0;

      return {
        id: u.id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
        enrollmentCount: u._count.enrollments,
        progress: avgProgress
      };
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create User
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: role as any
      }
    });

    res.status(201).json({ 
      message: 'User created successfully', 
      user: { id: user.id.toString(), name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Admin: Edit User
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const updatedUser = await prisma.users.update({
      where: { id: BigInt(id as string) },
      data: { name, email, role }
    });
    
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Admin: Delete User
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.users.delete({
      where: { id: BigInt(id as string) }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin: Warn User (Sends a warning notification to the database or email simulation)
router.post('/:id/warn', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.users.findUnique({ where: { id: BigInt(id as string) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    console.log(`[WARNING ISSUED] Admin warned learner ${user.email}. Reason: ${reason}`);

    res.json({ message: 'Warning sent successfully' });
  } catch (error) {
    console.error('Warn user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Student: Check Enrollment & Progress Status
router.get('/status/:subjectId', authenticateToken, async (req, res) => {
  try {
    const subjectId = BigInt(req.params.subjectId as string);
    const userId = BigInt((req as any).user.userId);

    const enrollment = await prisma.enrollments.findUnique({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } }
    });

    if (!enrollment) return res.status(404).json({ error: 'Not enrolled' });

    // Also fetch all video progress for this subject
    const progress = await prisma.video_progress.findMany({
      where: {
        user_id: userId,
        videos: { section_id: { in: (await prisma.sections.findMany({ where: { subject_id: subjectId }, select: { id: true } })).map(s => s.id) } }
      }
    });

    // Serialize bigints
    const serializedProgress = progress.map(p => ({
      ...p,
      video_id: p.video_id?.toString() || '',
      user_id: p.user_id?.toString() || ''
    }));

    res.json({ enrolled: true, progress: serializedProgress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Student: Enroll in a Course
router.post('/enroll', authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.body;
    const userId = BigInt((req as any).user.userId);

    const enrollment = await prisma.enrollments.upsert({
      where: { user_id_subject_id: { user_id: userId, subject_id: BigInt(subjectId) } },
      update: {},
      create: { user_id: userId, subject_id: BigInt(subjectId) }
    });

    res.json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

// Student: Sync Video Progress (Anti Cheat mechanism)
router.post('/sync/:videoId', authenticateToken, async (req, res) => {
  try {
    const videoId = BigInt(req.params.videoId as string);
    const userId = BigInt((req as any).user.userId);
    const { position_seconds } = req.body;

    const video = await prisma.videos.findUnique({ where: { id: videoId } });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const currentProgress = await prisma.video_progress.findUnique({
      where: { user_id_video_id: { user_id: userId, video_id: videoId } }
    });

    const isVideoDone = position_seconds >= (video.duration_seconds || 0) * 0.95; // 95% threshold

    // Strict fast-forward prevention: 
    // They can only jump ahead by at most 10 seconds per ping, assuming ping rate is every 5-10s.
    // If they send a position 50 seconds ahead of last DB sync, block it.
    if (currentProgress) {
      if (!currentProgress.is_completed) {
        const jump = position_seconds - (currentProgress.last_position_seconds || 0);

        if (jump > 15) {
           return res.status(422).json({ 
             error: 'Fast-forward tracking detected. Please watch without skipping.',
             allowedPosition: currentProgress.last_position_seconds 
           });
        }
      }
    }

    const updated = await prisma.video_progress.upsert({
      where: { user_id_video_id: { user_id: userId, video_id: videoId } },
      update: {
        last_position_seconds: position_seconds,
        is_completed: currentProgress?.is_completed || isVideoDone,
        completed_at: (!currentProgress?.is_completed && isVideoDone) ? new Date() : currentProgress?.completed_at,
      },
      create: {
        user_id: userId,
        video_id: videoId,
        last_position_seconds: position_seconds,
        is_completed: isVideoDone,
        completed_at: isVideoDone ? new Date() : null,
      }
    });

    res.json({ progress: updated });
  } catch (error) {
    res.status(500).json({ error: 'Progress sync failed' });
  }
});

// Student: Get My Learnings (Enrolled courses with progress)
router.get('/my-learnings', authenticateToken, async (req, res) => {
  try {
    const userId = BigInt((req as any).user.userId);

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

    const coursesWithProgress = enrollments.map(e => {
      const subject = e.subjects;
      if (!subject) return null;

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

      const percentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      return {
        id: subject.id.toString(),
        title: subject.title,
        slug: subject.slug,
        thumbnail_url: subject.thumbnail_url,
        progress: percentage,
        totalVideos,
        completedVideos
      };
    }).filter(Boolean);

    res.json(coursesWithProgress);
  } catch (error) {
    console.error('My learnings error:', error);
    res.status(500).json({ error: 'Failed to fetch learnings' });
  }
});

export default router;

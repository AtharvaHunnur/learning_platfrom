import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Admin: Add Section to a Course
router.post('/sections', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { subject_id, title, order_index } = req.body;
    const newSection = await prisma.sections.create({
      data: {
        subject_id: BigInt(subject_id),
        title,
        order_index
      }
    });
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Admin: Add Video to a Section
router.post('/videos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { section_id, title, youtube_video_id, description, order_index, duration_seconds } = req.body;
    
    // Auto-compute duration from Youtube API in a real app if possible.
    const newVideo = await prisma.videos.create({
      data: {
        section_id: BigInt(section_id),
        title,
        youtube_video_id,
        description,
        order_index,
        duration_seconds: duration_seconds || 0,
      }
    });
    res.status(201).json(newVideo);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create video', details: error.message });
  }
});

// Admin: Update Video 
router.put('/videos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, youtube_video_id, description, order_index, duration_seconds } = req.body;
    const updatedVideo = await prisma.videos.update({
      where: { id: BigInt(req.params.id as string) },
      data: {
        title,
        youtube_video_id,
        description,
        order_index,
        duration_seconds,
      }
    });
    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update video' });
  }
});

export default router;

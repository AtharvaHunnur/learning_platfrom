import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Admin: Get all courses (including unpublished)
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const courses = await prisma.subjects.findMany({
      include: {
        users: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    // BigInts are already patched at top-level globally, but doing robust parse is fine.
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public / Student: List all published courses, with optional bestsellers filter
router.get('/', async (req, res) => {
  try {
    const { bestsellers } = req.query;
    
    const courses = await prisma.subjects.findMany({
      where: {
        is_published: true,
        ...(bestsellers === 'true' ? { is_bestseller: true } : {})
      },
      include: {
        users: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Public / Student: Get course details by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await prisma.subjects.findFirst({
      where: { slug }
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    // Also fetch sections with video counts
    const sections = await prisma.sections.findMany({
      where: { subject_id: course.id },
      include: { videos: true },
      orderBy: { order_index: 'asc' }
    });

    res.json({ ...course, sections });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Create new course
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, slug, headline, description, thumbnail_url, price } = req.body;
    
    const newCourse = await prisma.subjects.create({
      data: {
        title,
        slug,
        headline,
        description,
        thumbnail_url,
        price,
        created_by: BigInt((req as any).user.userId)
      }
    });

    res.status(201).json(newCourse);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create course', details: error.message });
  }
});

// Admin: Update course
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, slug, headline, description, thumbnail_url, price, is_published, is_bestseller } = req.body;
    
    const updatedCourse = await prisma.subjects.update({
      where: { id: BigInt(req.params.id as string) },
      data: { title, slug, headline, description, thumbnail_url, price, is_published, is_bestseller }
    });

    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Admin: Delete course
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subjects.delete({
      where: { id: BigInt(id as string) }
    });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;

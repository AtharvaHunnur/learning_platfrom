import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// /api/settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    let siteSettings = await prisma.settings.findFirst();
    if (!siteSettings) {
      // Create default if not exists
      siteSettings = await prisma.settings.create({
        data: {
          site_name: 'LMSPro',
          support_email: 'support@lmspro.com',
          maintenance_mode: false,
          allow_new_registrations: true
        }
      });
    }
    res.json(siteSettings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { site_name, support_email, maintenance_mode, allow_new_registrations } = req.body;
    
    let siteSettings = await prisma.settings.findFirst();
    
    if (siteSettings) {
      siteSettings = await prisma.settings.update({
        where: { id: siteSettings.id },
        data: { site_name, support_email, maintenance_mode, allow_new_registrations }
      });
    } else {
      siteSettings = await prisma.settings.create({
        data: { site_name, support_email, maintenance_mode, allow_new_registrations }
      });
    }
    
    res.json(siteSettings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

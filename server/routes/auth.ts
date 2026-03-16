import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Unified Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ error: `Unauthorized for role: ${role}` });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token_hash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expires_at: expiresAt
      }
    });

    res.json({ token: accessToken, refreshToken, user: { id: user.id.toString(), name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const roleMap: any = {
      learner: "student",
      admin: "admin",
      instructor: "instructor"
    };

    const normalizedRole = roleMap[role?.toLowerCase()] || "student";

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
        role: normalizedRole as any
      }
    });

    res.json(user);

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh Token Endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await prisma.refresh_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: { gt: new Date() }
      },
      include: { users: true }
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const accessToken = jwt.sign(
      { userId: storedToken.users.id.toString(), email: storedToken.users.email, role: storedToken.users.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout Endpoint
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(200).json({ message: 'Logged out' });

  try {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refresh_tokens.updateMany({
      where: { token_hash: tokenHash },
      data: { revoked_at: new Date() }
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

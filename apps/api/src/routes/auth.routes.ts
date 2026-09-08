import { Router } from 'express';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';
import { auditLog } from '../middleware/audit';

const router = Router();
const prisma = new PrismaClient();

router.post('/login', auditLog('AUTH', 'LOGIN'), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { roleAssignments: { include: { role: true } } }
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Account is not active' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '8h' }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  res.json({ token, user: { id: user.id, email: user.email, name: user.name, roleAssignments: user.roleAssignments } });
});

router.post('/logout', authenticateJWT, auditLog('AUTH', 'LOGOUT'), (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticateJWT, async (req: any, res) => {
  res.json(req.user);
});

export default router;

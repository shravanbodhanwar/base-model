import { prisma } from '../lib/prisma';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
// Using singleton prisma from lib/prisma

router.use(authenticateJWT);

router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany();
  res.json(projects);
});

router.get('/:id', async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
});

router.post('/', async (req, res) => {
  const project = await prisma.project.create({ data: req.body });
  res.status(201).json(project);
});

router.patch('/:id', async (req, res) => {
  const project = await prisma.project.update({ where: { id: req.params.id }, data: req.body });
  res.json(project);
});

router.get('/:id/members', async (req, res) => {
  const members = await prisma.roleAssignment.findMany({ where: { scopeType: 'PROJECT', scopeId: req.params.id }, include: { user: true } });
  res.json(members);
});

export default router;


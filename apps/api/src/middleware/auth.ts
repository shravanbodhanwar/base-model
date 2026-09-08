import { prisma } from '../lib/prisma';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Using singleton prisma from lib/prisma

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { roleAssignments: { include: { role: true } } }
      });
      if (!user) {
        return res.sendStatus(401);
      }
      req.user = user;
      next();
    } catch (err) {
      return res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
};


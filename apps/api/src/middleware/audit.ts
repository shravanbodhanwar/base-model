import { prisma } from '../lib/prisma';
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { PrismaClient, EventType, ScopeType } from '@prisma/client';

// Using singleton prisma from lib/prisma

export const auditLog = (eventType: EventType, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    res.on('finish', async () => {
      try {
        await prisma.auditEvent.create({
          data: {
            eventType,
            action,
            actorId: req.user?.id,
            actorRole: req.user?.roleAssignments?.[0]?.role?.name,
            ipAddress: req.ip,
            status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
            metadata: {
              method: req.method,
              url: req.originalUrl,
              statusCode: res.statusCode
            }
          }
        });
      } catch (err) {
        console.error('Audit log failed', err);
      }
    });
    next();
  };
};


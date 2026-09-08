import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requirePermission = (requiredPermission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hasPermission = req.user.roleAssignments.some((assignment: any) => 
      assignment.role.permissions.includes('ALL') || assignment.role.permissions.includes(requiredPermission)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden: Missing required permission' });
    }

    next();
  };
};

export const requireRole = (roleName: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const hasRole = req.user.roleAssignments.some((assignment: any) => assignment.role.name === roleName || assignment.role.name === 'ROOT_GOVERNANCE');

    if (!hasRole) return res.status(403).json({ error: 'Forbidden: Missing required role' });
    next();
  };
};

export const requireScope = (scopeCheck: (req: AuthRequest) => boolean) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    if (req.user.roleAssignments.some((a:any) => a.role.permissions.includes('ALL'))) return next();

    if (!scopeCheck(req)) {
      return res.status(403).json({ error: 'Forbidden: Out of scope' });
    }
    next();
  };
};

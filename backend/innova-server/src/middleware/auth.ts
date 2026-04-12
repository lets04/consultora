import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import type { AuthPayload, UserRole } from '../models/user.model.js';

export type { AuthPayload, UserRole } from '../models/user.model.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [name, ...valueParts] = part.trim().split('=');
    if (!name) return acc;
    acc[name] = decodeURIComponent(valueParts.join('='));
    return acc;
  }, {});
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  let token: string | undefined;

  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  } else {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.innova_token;
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }) as jwt.JwtPayload & { name?: string; role?: string };

    const role = decoded.role as UserRole | undefined;
    const name = (decoded.name ?? decoded.sub) as string;
    if (!name || (role !== 'admin' && role !== 'gerente')) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }
    req.auth = { sub: name, name, role };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }
    if (!allowed.includes(req.auth.role)) {
      res.status(403).json({ message: 'Sin permiso para este recurso' });
      return;
    }
    next();
  };
}

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

const CSRF_COOKIE = '_csrf';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Generate a cryptographically random CSRF token and set it as a cookie. */
export function generateCsrfToken(req: Request, res: Response): string {
  // Reuse existing cookie token if present
  const existing = req.cookies[CSRF_COOKIE] as string | undefined;
  if (existing) return existing;

  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // Must be readable by JS so the SPA can send it in a header
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return token;
}

/** Middleware: validate the CSRF token on state-changing requests. */
export function doubleCsrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies[CSRF_COOKIE] as string | undefined;
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  next();
}

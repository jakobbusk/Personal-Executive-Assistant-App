import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import type { Application } from 'express';

vi.mock('../src/middleware/csrf', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doubleCsrfProtection: (_req: any, _res: any, next: any) => next(),
  generateCsrfToken: vi.fn().mockReturnValue('test-csrf-token'),
}));

vi.mock('../src/config/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('pino-http', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: () => (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../src/db/prisma', () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    rssFeed: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    rssItem: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    summary: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    integration: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    calendarEvent: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    $on: vi.fn(),
  },
}));

vi.mock('../src/config/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 4001,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'test-secret-key-that-is-at-least-32-characters-long',
    JWT_EXPIRES_IN: '7d',
    ENCRYPTION_KEY: 'test-encryption-key-32-characters!',
    MAGIC_LINK_EXPIRES_IN: 15,
    EMAIL_FROM: 'test@example.com',
    CORS_ORIGIN: 'http://localhost:5173',
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX: 1000,
    SMTP_PORT: 587,
  },
}));

vi.mock('../src/services/email/email.service', () => ({
  emailService: {
    sendMagicLink: vi.fn().mockResolvedValue(undefined),
    sendSummary: vi.fn().mockResolvedValue(undefined),
  },
}));

let app: Application;

beforeAll(() => {
  app = createApp();
});

describe('GET /health', () => {
  it('returns 200 with ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/auth/magic-link', () => {
  it('returns 200 when valid email provided', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Magic link sent');
  });

  it('returns 400 when invalid email provided', async () => {
    const res = await request(app)
      .post('/api/auth/magic-link')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/rss/feeds', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/rss/feeds');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/summaries', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/summaries');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/integrations', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/integrations');
    expect(res.status).toBe(401);
  });
});

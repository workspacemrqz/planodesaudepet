import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
  process.env.SESSION_SECRET = 'test-secret-key';
});

afterAll(() => {
  // Cleanup if needed
});

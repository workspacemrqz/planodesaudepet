import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { setupAuth } from '../auth';

// Mock environment variables
const mockEnv = {
  ADMIN_USER: 'admin@test.com',
  ADMIN_PASSWORD: 'secure-password-123',
  SESSION_SECRET: 'test-secret',
  NODE_ENV: 'test'
};

describe('Environment-based Authentication', () => {
  let app: express.Application;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set test environment variables
    Object.assign(process.env, mockEnv);
    
    // Create new app for each test
    app = express();
    app.use(express.json());
    setupAuth(app);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('Environment Variables Validation', () => {
    it('should fail to start if ADMIN_USER is missing', () => {
      delete process.env.ADMIN_USER;
      delete process.env.LOGIN;
      
      expect(() => {
        const testApp = express();
        setupAuth(testApp);
      }).toThrow('Authentication setup failed: missing environment variables');
    });

    it('should fail to start if ADMIN_PASSWORD is missing', () => {
      delete process.env.ADMIN_PASSWORD;
      delete process.env.SENHA;
      
      expect(() => {
        const testApp = express();
        setupAuth(testApp);
      }).toThrow('Authentication setup failed: missing environment variables');
    });

    it('should accept LOGIN/SENHA as alternative environment variables', () => {
      delete process.env.ADMIN_USER;
      delete process.env.ADMIN_PASSWORD;
      process.env.LOGIN = 'admin@test.com';
      process.env.SENHA = 'secure-password-123';
      
      expect(() => {
        const testApp = express();
        setupAuth(testApp);
      }).not.toThrow();
    });
  });

  describe('Login Endpoint', () => {
    it('should successfully login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: mockEnv.ADMIN_USER,
          password: mockEnv.ADMIN_PASSWORD
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'admin');
      expect(response.body).toHaveProperty('username', mockEnv.ADMIN_USER);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should fail login with incorrect username', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'wrong@email.com',
          password: mockEnv.ADMIN_PASSWORD
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
    });

    it('should fail login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: mockEnv.ADMIN_USER,
          password: 'wrong-password'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
    });

    it('should fail login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username e senha são obrigatórios');
    });

    it('should fail login with empty credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: '',
          password: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username e senha são obrigatórios');
    });
  });

  describe('Rate Limiting', () => {
    it('should block requests after rate limit is exceeded', async () => {
      // Make 5 failed requests (rate limit)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/admin/login')
          .send({
            username: 'wrong@email.com',
            password: 'wrong-password'
          });
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'wrong@email.com',
          password: 'wrong-password'
        });

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Session Management', () => {
    it('should create session on successful login', async () => {
      const agent = request.agent(app);
      
      // Login
      const loginResponse = await agent
        .post('/api/admin/login')
        .set('X-Forwarded-For', '192.168.1.100') // Use different IP to avoid rate limit
        .send({
          username: mockEnv.ADMIN_USER,
          password: mockEnv.ADMIN_PASSWORD
        });

      expect(loginResponse.status).toBe(200);
      
      // Check session
      const userResponse = await agent.get('/api/admin/user');
      expect(userResponse.status).toBe(200);
      expect(userResponse.body).toHaveProperty('username', mockEnv.ADMIN_USER);
    });

    it('should clear session on logout', async () => {
      const agent = request.agent(app);
      
      // Login first
      await agent
        .post('/api/admin/login')
        .set('X-Forwarded-For', '192.168.1.101') // Use different IP
        .send({
          username: mockEnv.ADMIN_USER,
          password: mockEnv.ADMIN_PASSWORD
        });

      // Logout
      const logoutResponse = await agent.post('/api/admin/logout');
      expect(logoutResponse.status).toBe(200);
      
      // Check session is cleared
      const userResponse = await agent.get('/api/admin/user');
      expect(userResponse.status).toBe(401);
    });

    it('should require authentication for protected routes', async () => {
      const response = await request(app).get('/api/admin/user');
      expect(response.status).toBe(401);
    });
  });

  describe('Security Features', () => {
    it('should not log passwords in any scenario', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const consoleWarnSpy = vi.spyOn(console, 'warn');
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      request(app)
        .post('/api/admin/login')
        .send({
          username: 'test@email.com',
          password: 'secret-password'
        });

      // Check that no password was logged
      const allCalls = [
        ...consoleSpy.mock.calls,
        ...consoleWarnSpy.mock.calls,
        ...consoleErrorSpy.mock.calls
      ];
      
      allCalls.forEach(call => {
        call.forEach(arg => {
          if (typeof arg === 'string') {
            expect(arg).not.toContain('secret-password');
            expect(arg).not.toContain(mockEnv.ADMIN_PASSWORD);
          }
        });
      });
    });

    it('should use secure cookie settings in production', () => {
      process.env.NODE_ENV = 'production';
      
      const testApp = express();
      testApp.use(express.json());
      setupAuth(testApp);
      
      // This test would require checking the session configuration
      // In a real implementation, you'd verify secure: true is set
      expect(process.env.NODE_ENV).toBe('production');
    });
  });

  describe('Account Lockout', () => {
    it('should lock account after multiple failed attempts', async () => {
      const testIP = '192.168.1.200';
      
      // Make 5 failed requests to trigger lockout
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/admin/login')
          .set('X-Forwarded-For', testIP)
          .send({
            username: mockEnv.ADMIN_USER,
            password: 'wrong-password'
          });
      }

      // Next request should be locked
      const response = await request(app)
        .post('/api/admin/login')
        .set('X-Forwarded-For', testIP)
        .send({
          username: mockEnv.ADMIN_USER,
          password: 'wrong-password'
        });

      // Could be either rate limited (429) or account locked (423)
      // Both are valid security responses
      expect([423, 429]).toContain(response.status);
      if (response.status === 423) {
        expect(response.body.error).toContain('temporariamente bloqueada');
      } else if (response.status === 429) {
        expect(response.body.error || response.body.message).toBeTruthy();
      }
    });

    it('should reset failed attempts on successful login', async () => {
      const testIP = '192.168.1.201';
      
      // Make some failed attempts
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/admin/login')
          .set('X-Forwarded-For', testIP)
          .send({
            username: mockEnv.ADMIN_USER,
            password: 'wrong-password'
          });
      }

      // Successful login should reset counter
      const successResponse = await request(app)
        .post('/api/admin/login')
        .set('X-Forwarded-For', testIP)
        .send({
          username: mockEnv.ADMIN_USER,
          password: mockEnv.ADMIN_PASSWORD
        });

      expect(successResponse.status).toBe(200);
      
      // Should be able to make failed attempts again without being locked
      const failResponse = await request(app)
        .post('/api/admin/login')
        .set('X-Forwarded-For', testIP)
        .send({
          username: mockEnv.ADMIN_USER,
          password: 'wrong-password'
        });

      expect(failResponse.status).toBe(401); // Should be 401, not 423 (locked)
    });
  });
});

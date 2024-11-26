import request from 'supertest';
import app from '../app';
import {
  resetDatabase,
  seedDatabase,
  closeDatabase,
} from './scripts/setupTests';

describe('User Authentication API Tests', () => {
  let uniqueEmail: string = '';
  let jwtCookie: string = '';

  // Setup and teardown hooks
  beforeEach(async () => {
    await resetDatabase();
    await seedDatabase();
    uniqueEmail = `testuser_${Date.now()}@example.com`; // Ensure a unique email per test run
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: uniqueEmail,
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', uniqueEmail);
    });

    it('should not allow duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: uniqueEmail,
          password: 'password123',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: uniqueEmail,
          password: 'password456',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty(
        'message',
        'A user with this email already exists'
      );
    });

    it('should validate required fields during registration', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'John Doe',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty(
        'message',
        'Missing required fields: email'
      );
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: uniqueEmail,
          password: 'password123',
        });
    });

    it('should log in the user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', uniqueEmail);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/jwt=/);

      jwtCookie = cookies[0];
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        'message',
        'User not found / password incorrect'
      );
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        'message',
        'User not found / password incorrect'
      );
    });
  });

  describe('User Logout', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: uniqueEmail,
          password: 'password123',
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'password123',
        });

      jwtCookie = loginRes.headers['set-cookie'][0];
    });

    it('should log out the user and clear the JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', jwtCookie);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'User logged out');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/jwt=;/);
    });

    it('should handle logout without an active session', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'User logged out');
    });
  });

  describe('Token Validation', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: uniqueEmail,
          password: 'password123',
        });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'password123',
        });

      jwtCookie = loginRes.headers['set-cookie'][0];
    });

    it('should validate an authenticated session', async () => {
      const res = await request(app)
        .get('/api/auth/status')
        .set('Cookie', jwtCookie);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('loggedIn', true);
      expect(res.body).toHaveProperty('userId');
    });

    it('should reject an unauthenticated session', async () => {
      const res = await request(app).get('/api/auth/status');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('loggedIn', false);
      expect(res.body).toHaveProperty('userId', null);
    });
  });
});

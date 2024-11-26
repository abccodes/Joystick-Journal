import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import app from '../app';
import { Request, Response, NextFunction } from 'express';
import { User as UserInterface } from '../interfaces/User';
import {
  resetDatabase,
  seedDatabase,
  closeDatabase,
} from './scripts/setupTests';

// Mock Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL: '/api/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      const user: UserInterface = {
        id: 1,
        name: profile.displayName || 'Test User',
        email: profile.emails?.[0]?.value || 'testuser@gmail.com',
        password: '',
        profile_pic: '',
        theme_preference: 'light',
        user_data_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      done(null, user);
    }
  )
);

// Setup and teardown hooks
beforeEach(async () => {
  await resetDatabase();
  await seedDatabase();
  jest.spyOn(console, 'log').mockImplementation(() => {}); // Silence logs during tests
  jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence error logs during tests
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await closeDatabase();
});

// Define test suite for Google OAuth
describe('Google OAuth', () => {
  describe('Login Redirection', () => {
    it('should redirect to Google login page', async () => {
      const response = await request(app).get('/api/auth/google');

      expect(response.status).toBe(302);
      expect(response.headers.location).toMatch(/accounts\.google\.com/);
    });
  });

  describe('Callback Handling', () => {
    it('should handle Google callback and authenticate user', async () => {
      jest
        .spyOn(passport, 'authenticate')
        .mockImplementation(
          (
            strategy: string,
            options: any,
            callback?: (...args: any[]) => any
          ) => {
            return (req: Request, res: Response, next: NextFunction) => {
              if (callback) {
                const user: UserInterface = {
                  id: 1,
                  name: 'Test User',
                  email: 'testuser@gmail.com',
                  password: '',
                  theme_preference: 'light',
                  profile_pic: '',
                  user_data_id: null,
                  created_at: new Date(),
                  updated_at: new Date(),
                };
                callback(null, user, {}); // Simulate successful authentication
              } else {
                next();
              }
            };
          }
        );

      const response = await request(app).get('/api/auth/google/callback');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email', 'testuser@gmail.com');

      const cookies: string[] = Array.isArray(response.headers['set-cookie'])
        ? response.headers['set-cookie']
        : [response.headers['set-cookie']];
      expect(cookies).toBeDefined();

      const jwtCookie = cookies.find((cookie: string) =>
        cookie.startsWith('jwt=')
      );
      expect(jwtCookie).toBeDefined();
    });

    it('should handle authentication failure gracefully', async () => {
      jest
        .spyOn(passport, 'authenticate')
        .mockImplementation(
          (
            strategy: string,
            options: any,
            callback?: (
              err: Error | null,
              user: UserInterface | false,
              info: any
            ) => void
          ) => {
            return (req: Request, res: Response, next: NextFunction) => {
              if (callback) {
                callback(new Error('Authentication failed'), false, {}); // Simulate authentication failure
              } else {
                next();
              }
            };
          }
        );

      const response = await request(app).get('/api/auth/google/callback');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        'Google authentication failed'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should return 500 if passport setup is incorrect', async () => {
      jest
        .spyOn(passport, 'authenticate')
        .mockImplementation(() => {
          throw new Error('Passport strategy not configured correctly');
        });

      const response = await request(app).get('/api/auth/google/callback');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        'message',
        'Internal Server Error'
      );
    });

    it('should handle invalid callback URLs', async () => {
      const invalidCallbackUrl = '/api/auth/google/callback-invalid';
      const response = await request(app).get(invalidCallbackUrl);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Not Found');
    });
  });
});

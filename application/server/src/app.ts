import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { authenticate } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorMiddleware';
import path from 'path';
import authRouter from './routes/authRoutes';
import userDataRouter from './routes/userDataRoutes';
import userRouter from './routes/userRoutes';
import gameRouter from './routes/gameRoutes';
import reviewRouter from './routes/reviewRoutes';
import recommendations from './routes/recommendationRoutes';
import { getPool } from './connections/database';

dotenv.config();

// Create the Express app
const app = express();

/**
 * Middleware: Helmet
 * Description: Secures HTTP headers and adds a content security policy.
 */
app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'connect-src': ["'self'", 'http://127.0.0.1:8000'], // Add other sources if required
      },
    },
  })
);

/**
 * Middleware: CORS
 * Description: Restricts access to specified origins.
 */
const allowedOrigins = [
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'https://gameratings-63hlr9lx0-abccodes-projects.vercel.app/',
  // 'https://your-production-domain.com', // Uncomment for production
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Middleware: Cookie parser
app.use(cookieParser());

// Middleware: Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware: Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, '../../web/public')));

/**
 * Middleware: Passport.js
 * Description: Configures Google OAuth strategy for user authentication.
 */
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!, // Ensure GOOGLE_CLIENT_ID exists in .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Ensure GOOGLE_CLIENT_SECRET exists in .env
      callbackURL: '/api/auth/google/callback', // This route must match the authRouter configuration
    },
    (accessToken, refreshToken, profile: Profile, done) => {
      // Map profile to a User-compatible object
      const user = {
        id: Number(profile.id), // Convert string ID to number
        name: profile.displayName,
        email: profile.emails?.[0]?.value || '', // Use the first email if available
        profile_pic: profile.photos?.[0]?.value || null, // Use the first profile picture if available
      };

      return done(null, user);
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj: any, done) => {
  done(null, obj as Express.User);
});

/**
 * Error Handling Middleware
 */
app.use(errorHandler);

/**
 * Routes
 */
app.use('/api/auth', authRouter); // Authentication routes
app.use('/api/users', authenticate, userRouter); // User routes, protected with `authenticate`
app.use('/api/games', gameRouter); // Game routes
app.use('/api/userdata', userDataRouter); // User data routes
app.use('/api/reviews', reviewRouter); // Review routes
app.use('/api/recommendations', recommendations); // Recommendation routes

/**
 * Fallback route
 * Description: Root route that responds if no specific route is matched.
 */
app.get('/', (req, res) => {
  res.send('The server is working, but the index page isn’t loading.');
});

/**
 * Database Connection
 * Description: Test the connection pool initialization using `getPool`.
 */
try {
  const pool = getPool(); // Initialize the connection pool
  console.log('Database connection pool initialized successfully');
} catch (error) {
  console.error('Failed to initialize database connection pool:', error);
}

export default app;

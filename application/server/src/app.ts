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
import fs from 'fs';
import util from 'util';

dotenv.config();

// Promisify readFile to use async/await
const readFile = util.promisify(fs.readFile);

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
        'connect-src': ["'self'", 'http://127.0.0.1:8000'],
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
  'http://127.0.0.1:3000',
  'http://localhost:3306',
  'http://127.0.0.1:3306',
  'https://gameratings-63hlr9lx0-abccodes-projects.vercel.app/',
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
    (accessToken, refreshToken, profile, done) => {
      // Map Google profile to the current User interface
      const user = {
        id: 0, // Placeholder since Google doesn't provide numeric IDs
        name: profile.displayName || 'Google User', // Use displayName if available
        email: profile.emails?.[0]?.value || '', // Use the first email if available
        password: '', // Password isn't relevant for OAuth users
        profile_pic: profile.photos?.[0]?.value || null, // Use the first profile picture if available
        theme_preference: 'light', // Default value
        user_data_id: null, // Placeholder
        created_at: new Date(), // Placeholder
        updated_at: new Date(), // Placeholder
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
 * Function: initializeDatabase
 * Description: Runs the SQL initialization script to ensure required tables exist.
 */
async function initializeDatabase() {
  const pool = getPool();

  try {
      // Create the database
      await pool.query('CREATE DATABASE IF NOT EXISTS ratings_dev_db');
      console.log('Database created or already exists.');

      // Switch to the new database
      await pool.query('USE ratings_dev_db');
      console.log('Using database ratings_dev_db.');

      // Create tables and insert sample data
      const sql = fs.readFileSync('./scripts/DB.sql', 'utf8');
      const statements = sql.split(';').filter(stmt => stmt.trim());

      for (const stmt of statements) {
          await pool.query(stmt);
      }
      console.log('Database tables created successfully.');
  } catch (error) {
      console.error('Error initializing the database:', error);
      process.exit(1); // Exit the application if database initialization fails
  }
}


// Initialize database and start the server
initializeDatabase()
  .then(() => {
    app.listen(3306, () => {
      console.log('Server is running on port 3306');
    });
  })
  .catch((error) => {
    console.error('Server failed to start due to database initialization error:', error);
  });

/**
 * Routes
 */
app.use('/api/auth', authRouter);
app.use('/api/users', authenticate, userRouter);
app.use('/api/games', gameRouter);
app.use('/api/userdata', userDataRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/recommendations', recommendations);

// Fallback route
app.get('/', (req, res) => {
  res.send('The server is working, but the index page isn’t loading.');
});


export default app;

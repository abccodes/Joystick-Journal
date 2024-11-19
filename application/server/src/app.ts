import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { connectUserDB } from './connections/database';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { authenticate } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorMiddleware';
import authRouter from './routes/authRoutes';
import userDataRouter from './routes/userDataRoutes';
import userRouter from './routes/userRoutes';
import gameRouter from './routes/gameRoutes';
import reviewRoter from './routes/reviewRoutes';
import recommendationRouter from './routes/recommendationRoutes';

dotenv.config();

const app = express();
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

app.use(cookieParser());
app.use(helmet());

const allowedOrigins = [
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:8000',
  'https://gameratings-63hlr9lx0-abccodes-projects.vercel.app/',
];

// cors setup with allowed origins
app.use(
  cors({
    origin: function(origin, callback) {
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// google oauth setup with passport google strategy
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj: any, done) => {
  done(null, obj as Express.User);
});

connectUserDB();

app.use(errorHandler);

app.use('/api/auth', authRouter);
app.use('/api/users', authenticate, userRouter);
app.use('/api/games', gameRouter);
app.use('/api/userdata', userDataRouter);
app.use('/api/reviews', reviewRoter);
app.use('/api/recommendations', authenticate, recommendationRouter);

export default app;

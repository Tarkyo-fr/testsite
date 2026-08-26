import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import { initDb } from './db.js';

import authRoutes from './routes/auth.js';
import giveawayRoutes from './routes/giveaway.js';
import planningRoutes from './routes/planning.js';
import videosRoutes from './routes/videos.js';
import candidaturesRoutes from './routes/candidatures.js';
import profileRoutes from './routes/profile.js';
import communityRoutes from './routes/community.js';

dotenv.config();
await initDb();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(
  cookieSession({
    name: 'session',
    secret: process.env.SESSION_SECRET || 'dev-secret',
    maxAge: 30 * 24 * 60 * 60 * 1000
  })
);

app.use('/auth', authRoutes);
app.use('/api/giveaway', giveawayRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/candidatures', candidaturesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/community', communityRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API sur http://localhost:${port}`));

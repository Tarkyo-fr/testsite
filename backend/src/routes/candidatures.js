import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, isAdmin } from './helpers.js';

const router = Router();

// Mes candidatures
router.get('/mine', requireAuth, async (req, res) => {
  await db.read();
  const mine = db.data.candidatures.filter(c => c.userId === req.session.userId);
  res.json({ candidatures: mine });
});

router.post('/', requireAuth, async (req, res) => {
  const { message } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.id === req.session.userId);
  const candidature = {
    id: `cand-${Date.now()}`,
    userId: req.session.userId,
    discordUsername: user?.discordUsername,
    faceitLevel: user?.faceitLevel,
    message: message || '',
    status: 'en_attente',
    createdAt: new Date().toISOString()
  };
  db.data.candidatures.push(candidature);
  await db.write();
  res.json({ ok: true, candidature });
});

// --- admin ---
router.get('/', isAdmin, async (req, res) => {
  await db.read();
  res.json({ candidatures: db.data.candidatures });
});

router.put('/:id', isAdmin, async (req, res) => {
  const { status } = req.body; // 'acceptee' | 'refusee' | 'en_attente'
  await db.read();
  const c = db.data.candidatures.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Introuvable' });
  c.status = status;
  await db.write();
  res.json({ ok: true });
});

export default router;

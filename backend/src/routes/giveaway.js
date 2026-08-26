import { Router } from 'express';
import { db } from '../db.js';
import { isAdmin, requireAuth } from './helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  await db.read();
  const active = db.data.giveaways.find(g => g.active);
  if (!active) return res.json({ giveaway: null });
  res.json({
    giveaway: {
      id: active.id,
      title: active.title,
      description: active.description,
      image: active.image,
      endsAt: active.endsAt,
      participantCount: active.participants.length
    }
  });
});

router.post('/participate', requireAuth, async (req, res) => {
  await db.read();
  const active = db.data.giveaways.find(g => g.active);
  if (!active) return res.status(404).json({ error: 'Aucun giveaway actif' });
  if (!active.participants.includes(req.session.userId)) {
    active.participants.push(req.session.userId);
    await db.write();
  }
  res.json({ ok: true, participantCount: active.participants.length });
});

// --- admin ---
router.post('/', isAdmin, async (req, res) => {
  const { title, description, image, endsAt } = req.body;
  await db.read();
  db.data.giveaways.forEach(g => (g.active = false));
  db.data.giveaways.push({
    id: `gw-${Date.now()}`,
    title,
    description,
    image,
    endsAt,
    active: true,
    participants: []
  });
  await db.write();
  res.json({ ok: true });
});

export default router;

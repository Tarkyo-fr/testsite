import { Router } from 'express';
import { db } from '../db.js';
import { isAdmin } from './helpers.js';

const router = Router();

router.get('/', async (req, res) => {
  await db.read();
  res.json({
    planning: db.data.planning,
    tournageOuvert: db.data.tournageOuvert
  });
});

// --- admin ---
router.put('/', isAdmin, async (req, res) => {
  const { planning } = req.body; // [{ day, time, title, game }]
  await db.read();
  db.data.planning = planning;
  await db.write();
  res.json({ ok: true });
});

router.put('/tournage', isAdmin, async (req, res) => {
  const { active, message } = req.body;
  await db.read();
  db.data.tournageOuvert = { active, message };
  await db.write();
  res.json({ ok: true });
});

export default router;

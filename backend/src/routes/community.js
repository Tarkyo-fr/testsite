import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/stats', async (req, res) => {
  await db.read();
  const withProfile = db.data.users.filter(u => u.faceitLevel != null);
  const distribution = Array.from({ length: 10 }, (_, i) => i + 1).map(level => ({
    level,
    count: withProfile.filter(u => u.faceitLevel === level).length
  }));
  const avg = withProfile.length
    ? Math.round((withProfile.reduce((s, u) => s + u.faceitLevel, 0) / withProfile.length) * 10) / 10
    : null;
  const top = [...withProfile]
    .sort((a, b) => b.faceitLevel - a.faceitLevel)
    .slice(0, 10)
    .map(u => ({ discordUsername: u.discordUsername, faceitLevel: u.faceitLevel }));

  res.json({
    registeredMembers: db.data.users.length,
    profiledMembers: withProfile.length,
    averageLevel: avg,
    distribution,
    top
  });
});

router.get('/config', async (req, res) => {
  await db.read();
  res.json({ config: db.data.config });
});

router.get('/pointshop', async (req, res) => {
  await db.read();
  res.json({ rewards: db.data.pointshop.rewards });
});

export default router;

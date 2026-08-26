import { db } from '../db.js';

export function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Connexion Discord requise' });
  next();
}

export async function isAdmin(req, res, next) {
  await db.read();
  const user = db.data.users.find(u => u.id === req.session.userId);
  const adminIds = (process.env.ADMIN_DISCORD_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!user || !adminIds.includes(user.discordId)) {
    return res.status(403).json({ error: 'Réservé à l\'admin' });
  }
  next();
}

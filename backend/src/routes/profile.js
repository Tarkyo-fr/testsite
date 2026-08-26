import { Router } from 'express';
import fetch from 'node-fetch';
import { db } from '../db.js';
import { requireAuth } from './helpers.js';

const router = Router();

// Convertit un Elo Premier CS2 en "niveau Faceit équivalent" (1-10), approximation publique
function eloToFaceitLevel(elo) {
  const brackets = [800, 950, 1100, 1250, 1400, 1550, 1700, 1850, 2000];
  let level = 10;
  for (let i = 0; i < brackets.length; i++) {
    if (elo < brackets[i]) { level = i + 1; break; }
  }
  return level;
}

router.put('/', requireAuth, async (req, res) => {
  const { birthdate, faceitNoAccount } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.id === req.session.userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (birthdate) user.birthdate = birthdate;
  user.faceitNoAccount = !!faceitNoAccount;
  await db.write();
  res.json({ ok: true, user });
});

// Vérifie un lien de profil Faceit et récupère le niveau
router.post('/faceit/verify', requireAuth, async (req, res) => {
  const { profileUrl } = req.body;
  const match = /faceit\.com\/[a-z-]+\/players\/([^/?#]+)/i.exec(profileUrl || '');
  if (!match) return res.status(400).json({ error: 'Lien Faceit invalide' });
  const nickname = match[1];

  if (!process.env.FACEIT_API_KEY) {
    return res.status(200).json({
      ok: false,
      message: 'FACEIT_API_KEY absente du .env — branche https://developers.faceit.com pour activer la vérification automatique.'
    });
  }

  try {
    const r = await fetch(`https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`, {
      headers: { Authorization: `Bearer ${process.env.FACEIT_API_KEY}` }
    });
    const data = await r.json();
    const level = data.games?.cs2?.skill_level || data.games?.csgo?.skill_level || null;

    await db.read();
    const user = db.data.users.find(u => u.id === req.session.userId);
    user.faceitProfile = profileUrl;
    user.faceitLevel = level;
    user.faceitNoAccount = false;
    await db.write();

    res.json({ ok: true, level });
  } catch (err) {
    console.error('Faceit verify error', err);
    res.status(500).json({ error: 'Vérification Faceit impossible' });
  }
});

// Vérifie un lien CSStats.gg et récupère l'elo Premier (best effort, scraping du profil public)
router.post('/csstats/verify', requireAuth, async (req, res) => {
  const { profileUrl } = req.body;
  if (!/csstats\.gg\//i.test(profileUrl || '')) {
    return res.status(400).json({ error: 'Lien CSStats invalide' });
  }

  try {
    const r = await fetch(profileUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await r.text();
    const eloMatch = /Premier[^0-9]{0,40}([0-9]{3,5})/i.exec(html);
    const elo = eloMatch ? parseInt(eloMatch[1], 10) : null;

    await db.read();
    const user = db.data.users.find(u => u.id === req.session.userId);
    user.csstatsProfile = profileUrl;
    if (elo) {
      user.premierElo = elo;
      user.faceitLevel = user.faceitNoAccount ? eloToFaceitLevel(elo) : user.faceitLevel;
    }
    await db.write();

    res.json({
      ok: !!elo,
      elo,
      message: elo ? null : "Détection automatique impossible, l'Elo sera mis à jour plus tard — ton profil est quand même sauvegardé."
    });
  } catch (err) {
    console.error('CSStats verify error', err);
    res.status(200).json({ ok: false, message: 'Détection automatique indisponible, profil sauvegardé quand même.' });
  }
});

export default router;

import { Router } from 'express';
import fetch from 'node-fetch';
import { db } from '../db.js';

const router = Router();

// ---------- DISCORD ----------
router.get('/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify'
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get('/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.FRONTEND_URL}/profil?error=discord`);

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      })
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error('no token');

    const meRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    const me = await meRes.json();

    await db.read();
    let user = db.data.users.find(u => u.discordId === me.id);
    if (!user) {
      user = {
        id: me.id,
        discordId: me.id,
        discordUsername: `${me.username}`,
        avatar: me.avatar
          ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
          : null,
        twitchId: null,
        twitchLogin: null,
        faceitProfile: null,
        faceitLevel: null,
        csstatsProfile: null,
        premierElo: null,
        birthdate: null,
        createdAt: new Date().toISOString()
      };
      db.data.users.push(user);
    } else {
      user.discordUsername = me.username;
      user.avatar = me.avatar
        ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
        : null;
    }
    await db.write();

    req.session.userId = user.id;
    res.redirect(`${process.env.FRONTEND_URL}/profil`);
  } catch (err) {
    console.error('Discord OAuth error', err);
    res.redirect(`${process.env.FRONTEND_URL}/profil?error=discord`);
  }
});

router.post('/discord/logout', (req, res) => {
  req.session.userId = null;
  res.json({ ok: true });
});

// ---------- TWITCH ----------
router.get('/twitch', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: process.env.TWITCH_REDIRECT_URI,
    response_type: 'code',
    scope: 'user:read:email channel_points_read'
  });
  res.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`);
});

router.get('/twitch/callback', async (req, res) => {
  const { code } = req.query;
  if (!code || !req.session.userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/profil?error=twitch`);
  }
  try {
    const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.TWITCH_REDIRECT_URI
      })
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error('no token');

    const meRes = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID
      }
    });
    const meData = await meRes.json();
    const me = meData.data?.[0];

    await db.read();
    const user = db.data.users.find(u => u.id === req.session.userId);
    if (user && me) {
      user.twitchId = me.id;
      user.twitchLogin = me.login;
      user.twitchAccessToken = token.access_token; // needed later for reward lookups
      await db.write();
    }
    res.redirect(`${process.env.FRONTEND_URL}/profil`);
  } catch (err) {
    console.error('Twitch OAuth error', err);
    res.redirect(`${process.env.FRONTEND_URL}/profil?error=twitch`);
  }
});

router.post('/twitch/logout', async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.session.userId);
  if (user) {
    user.twitchId = null;
    user.twitchLogin = null;
    user.twitchAccessToken = null;
    await db.write();
  }
  res.json({ ok: true });
});

// ---------- SESSION / ME ----------
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  await db.read();
  const user = db.data.users.find(u => u.id === req.session.userId);
  if (!user) return res.json({ user: null });
  const { twitchAccessToken, ...safe } = user;
  res.json({ user: safe });
});

export default router;

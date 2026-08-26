const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export const api = {
  me: () => request('/auth/me'),
  discordLoginUrl: () => `${BASE}/auth/discord`,
  discordLogout: () => request('/auth/discord/logout', { method: 'POST' }),
  twitchLoginUrl: () => `${BASE}/auth/twitch`,
  twitchLogout: () => request('/auth/twitch/logout', { method: 'POST' }),

  giveaway: () => request('/api/giveaway'),
  participate: () => request('/api/giveaway/participate', { method: 'POST' }),

  planning: () => request('/api/planning'),

  videos: () => request('/api/videos'),

  myCandidatures: () => request('/api/candidatures/mine'),
  applyCandidature: message =>
    request('/api/candidatures', { method: 'POST', body: JSON.stringify({ message }) }),

  saveProfile: payload => request('/api/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  verifyFaceit: profileUrl =>
    request('/api/profile/faceit/verify', { method: 'POST', body: JSON.stringify({ profileUrl }) }),
  verifyCsstats: profileUrl =>
    request('/api/profile/csstats/verify', { method: 'POST', body: JSON.stringify({ profileUrl }) }),

  communityStats: () => request('/api/community/stats'),
  config: () => request('/api/community/config'),
  pointshop: () => request('/api/community/pointshop')
};

export const BASE_URL = BASE;

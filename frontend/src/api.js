// Tous les appels passent par des chemins relatifs (même origine que le
// frontend). En prod, Netlify les relaie vers le backend (voir
// scripts/gen-redirects.mjs) ; en local, c'est le proxy Vite (vite.config.js)
// qui les relaie vers http://localhost:4000. Le cookie de session reste
// ainsi "first-party" dans les deux cas, ce qui évite les blocages des
// navigateurs sur les cookies cross-site.

async function request(path, options = {}) {
  const res = await fetch(path, {
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
  discordLoginUrl: () => '/auth/discord',
  discordLogout: () => request('/auth/discord/logout', { method: 'POST' }),
  twitchLoginUrl: () => '/auth/twitch',
  twitchLogout: () => request('/auth/twitch/logout', { method: 'POST' }),

  giveaway: () => request('/api/giveaway'),
  participate: () => request('/api/giveaway/participate', { method: 'POST' }),

  planning: () => request('/api/planning'),

  videos: () => request('/api/videos'),

  myCandidatures: () => request('/api/candidatures/mine'),
  applyCandidature: message =>
    request('/api/candidatures', { method: 'POST', body: JSON.stringify({ message }) }),

  // --- admin (protégé côté backend par ADMIN_DISCORD_IDS) ---
  adminCandidatures: () => request('/api/candidatures'),
  adminUpdateCandidature: (id, status) =>
    request(`/api/candidatures/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminSavePlanning: planning =>
    request('/api/planning', { method: 'PUT', body: JSON.stringify({ planning }) }),
  adminSaveTournage: payload =>
    request('/api/planning/tournage', { method: 'PUT', body: JSON.stringify(payload) }),
  adminCreateGiveaway: payload =>
    request('/api/giveaway', { method: 'POST', body: JSON.stringify(payload) }),

  saveProfile: payload => request('/api/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  verifyFaceit: profileUrl =>
    request('/api/profile/faceit/verify', { method: 'POST', body: JSON.stringify({ profileUrl }) }),
  verifyCsstats: profileUrl =>
    request('/api/profile/csstats/verify', { method: 'POST', body: JSON.stringify({ profileUrl }) }),

  communityStats: () => request('/api/community/stats'),
  config: () => request('/api/community/config'),
  pointshop: () => request('/api/community/pointshop')
};

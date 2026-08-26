// Génère frontend/public/_redirects au moment du build Netlify.
// But : faire passer les appels API et OAuth par le même domaine que le
// frontend (proxy côté Netlify), pour que le cookie de session soit
// "first-party" et ne soit jamais bloqué par les protections anti-tracking
// des navigateurs (Safari ITP, Chrome...).
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendUrl = (process.env.BACKEND_URL || '').replace(/\/+$/, '');

if (!backendUrl) {
  console.warn(
    '[gen-redirects] Variable BACKEND_URL absente : les routes /api et /auth ne seront pas proxyées. ' +
    'Ajoute BACKEND_URL dans les variables d\'environnement Netlify (ex: https://ton-backend.up.railway.app).'
  );
}

const lines = [];
if (backendUrl) {
  lines.push(`/auth/*  ${backendUrl}/auth/:splat  200`);
  lines.push(`/api/*   ${backendUrl}/api/:splat   200`);
}
lines.push('/*       /index.html   200');

writeFileSync(path.join(__dirname, '..', 'public', '_redirects'), lines.join('\n') + '\n');
console.log('[gen-redirects] public/_redirects généré :\n' + lines.join('\n'));

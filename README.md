# Clone fonctionnel de guizzi.fr

Recréation des fonctionnalités du site (accueil, planning, config CS2/communauté, profil)
avec un vrai backend : Node/Express + base JSON (lowdb) + OAuth2 Discord/Twitch.

## Structure

```
backend/    API Express (auth, giveaway, planning, candidatures, profil, communauté)
frontend/   React + Vite + Tailwind
```

## Pages recréées

- **/** — avatar (hover), réseaux, giveaway du mois, teaser planning, dernières vidéos YouTube
- **/planning** — planning hebdo, bannière "tournage ouvert" → candidature, giveaway
- **/site** — Point Shop, config PC, settings CS2 (crosshair/résolution/viewmodel/autoexec copiables), extensions Faceit, stats communauté (niveau moyen, distribution, top niveaux)
- **/profil** — connexion Discord (obligatoire), mes candidatures, vérification Faceit, vérification CSStats (Elo Premier auto), infos perso, connexion Twitch + Point Shop

## Démarrage rapide

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Le site fonctionne dès le démarrage avec des données de démo (giveaway, config CS2).
Sans clés API, les fonctionnalités suivantes s'affichent en mode "non configuré" au lieu de planter :
- connexion Discord / Twitch (nécessite une app OAuth2 sur chaque plateforme)
- vérification Faceit (nécessite une clé sur developers.faceit.com)
- vidéos YouTube (nécessite une clé YouTube Data API v3)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvre http://localhost:5173

### 3. Personnalisation

- `frontend/src/siteConfig.js` : nom, avatar, liens de réseaux sociaux
- `backend/data/db.json` (généré au 1er lancement) : giveaway, planning, config CS2, extensions
- `backend/.env` : toutes les clés API (voir `.env.example` pour la liste complète et où les obtenir)

## Ce qui nécessite tes propres identifiants pour fonctionner "à l'identique"

| Fonctionnalité | Ce qu'il faut |
|---|---|
| Connexion Discord | App OAuth2 sur discord.com/developers |
| Connexion Twitch + Point Shop | App sur dev.twitch.tv, scope `channel_points_read`, EventSub à brancher si tu veux les rewards en temps réel |
| Vérification Faceit | Clé API sur developers.faceit.com |
| Elo CSStats.gg | Pas d'API officielle — la route fait un scraping best-effort de la page publique, à surveiller si CSStats change son HTML |
| Vidéos YouTube | Clé YouTube Data API v3 + ID de chaîne |

Le reste (planning, candidatures, giveaway, config CS2, stats de communauté) tourne
directement avec la base JSON fournie, sans clé externe.

## Déploiement

Le frontend (statique) va sur **Netlify**, le backend (serveur Node avec état) va sur
**Render** ou **Railway** — Netlify ne peut pas faire tourner un serveur Express avec sessions.

### Backend → Render
Le fichier `render.yaml` à la racine du repo permet un déploiement en un clic ("Blueprint").
Renseigne les variables d'environnement marquées `sync: false` dans le dashboard Render
après le premier déploiement (mêmes valeurs que `.env.example`).

### Backend → Railway (alternative)
Un `backend/railway.json` est fourni. Dans Railway : New Project → Deploy from GitHub repo →
Settings → Root Directory = `backend`. Ajoute les mêmes variables que `.env.example` dans
l'onglet Variables (pas besoin de `PORT`, Railway l'injecte automatiquement). Génère un domaine
public dans Settings → Networking.

⚠️ Railway (comme Render en plan gratuit) a un système de fichiers éphémère : `backend/data/db.json`
est réinitialisé à chaque redéploiement. Pour garder les données en prod, ajoute un volume monté
sur `backend/data`, ou migre lowdb vers une vraie base (Postgres/Railway DB).

### Frontend → Netlify
Le frontend et le backend sont hébergés séparément, donc le navigateur les voit comme deux
domaines différents. Pour éviter les soucis de cookie de session cross-domaine (bloqué par les
protections anti-tracking de Safari/Chrome), le frontend **proxy** ses appels `/api/*` et
`/auth/*` vers le backend via Netlify, au lieu de les appeler directement. Le cookie reste ainsi
"first-party" pour le navigateur.

1. Connecte le repo GitHub dans Netlify ("Import from Git") — `netlify.toml` configure déjà
   `base = frontend`, `command = npm run build`, `publish = dist`.
2. Ajoute la variable d'environnement Netlify `BACKEND_URL` = URL de ton backend (ex:
   `https://ton-backend.up.railway.app`, **sans slash final**). C'est utilisée au moment du
   build pour générer `public/_redirects`, qui relaie `/api/*` et `/auth/*` vers le backend.
3. Renseigne `DISCORD_REDIRECT_URI` et `TWITCH_REDIRECT_URI` côté **backend** avec l'URL
   **Netlify** (pas Railway) : `https://tonsite.netlify.app/auth/discord/callback` et
   `.../auth/twitch/callback`. Déclare ces mêmes redirect URIs dans les consoles développeur
   Discord et Twitch.
4. Renseigne `FRONTEND_URL` côté backend avec l'URL Netlify finale.

En local (`npm run dev` dans `frontend/`), le proxy équivalent est déjà configuré dans
`vite.config.js` (`/api` et `/auth` → `http://localhost:4000`) — aucune variable à ajouter.

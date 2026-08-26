import { useEffect, useState } from 'react';
import { siteConfig } from '../siteConfig.js';
import { api } from '../api.js';

export default function VideoGrid() {
  const [state, setState] = useState({ loading: true, videos: [], configured: true });

  useEffect(() => {
    api
      .videos()
      .then(({ videos, configured }) => setState({ loading: false, videos, configured }))
      .catch(() => setState({ loading: false, videos: [], configured: false }));
  }, []);

  return (
    <section className="mx-auto mt-16 max-w-5xl px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-flare">YouTube</p>
          <h2 className="font-display text-xl font-600">Dernières vidéos</h2>
        </div>
        <a href={siteConfig.socials.youtube} className="focus-ring text-sm text-muted hover:text-text">
          Chaîne
        </a>
      </div>

      {state.loading && <p className="mt-6 text-sm text-muted">Chargement des vidéos…</p>}

      {!state.loading && !state.configured && (
        <p className="mt-6 text-sm text-muted">
          Ajoute une clé YouTube Data API v3 côté backend pour afficher les vraies vidéos.
        </p>
      )}

      {!state.loading && state.configured && state.videos.length === 0 && (
        <p className="mt-6 text-sm text-muted">Aucune vidéo pour le moment.</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {state.videos.map(v => (
          <a
            key={v.id}
            href={v.url}
            target="_blank"
            rel="noreferrer"
            className="focus-ring group overflow-hidden rounded-md border border-line bg-surface"
          >
            <img src={v.thumbnail} alt={v.title} className="aspect-video w-full object-cover" />
            <p className="p-3 text-sm font-500 group-hover:text-flare">{v.title}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

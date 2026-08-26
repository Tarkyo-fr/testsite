import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../api.js';

function CopyButton({ text, label = 'Copier' }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="focus-ring rounded border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-signal hover:text-signal"
    >
      {copied ? 'Copié ✓' : label}
    </button>
  );
}

export default function Site() {
  const [config, setConfig] = useState(undefined);
  const [stats, setStats] = useState(undefined);

  useEffect(() => {
    api.config().then(({ config }) => setConfig(config)).catch(() => setConfig(null));
    api.communityStats().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div>
      <Navbar back />
      <main className="mx-auto max-w-3xl px-6 pb-16">
        <Link
          to="/profil"
          className="focus-ring mb-8 flex items-center justify-between rounded-md border border-line bg-surface px-5 py-4 hover:border-signal"
        >
          <div>
            <p className="font-display text-sm font-600">POINT SHOP</p>
            <p className="text-xs text-muted">Dépense tes points de chaîne Twitch pour des rewards exclusifs</p>
          </div>
          <span className="text-signal text-sm">Voir le shop →</span>
        </Link>

        <h2 className="font-display text-xl font-600">Ma Configuration</h2>
        <p className="text-sm text-muted">Clique pour découvrir les produits — liens affiliés</p>
        {config?.pcParts?.length ? (
          <ul className="mt-3 space-y-2">
            {config.pcParts.map((p, i) => (
              <li key={i} className="flex justify-between rounded border border-line bg-surface px-4 py-2 text-sm">
                <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-flare">{p.name}</a>
                <span className="text-muted">{p.price}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">— Aucune pièce publiée pour le moment —</p>
        )}

        <h2 className="mt-10 font-display text-xl font-600">Mes settings CS2</h2>
        <p className="text-sm text-muted">Copie en 1 clic mes réglages Counter-Strike 2</p>

        {config === undefined && <p className="mt-4 text-sm text-muted">Chargement…</p>}

        {config && (
          <>
            <div className="hud-frame mt-4 rounded-md bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-signal">Crosshair</p>
              <p className="mt-1 font-mono text-sm">{config.crosshairCode}</p>
              <p className="mt-1 text-xs text-muted">
                Dans ta console CS2 : <span className="font-mono">apply_crosshair_code [code]</span>
              </p>
              <div className="mt-3">
                <CopyButton text={config.crosshairCode} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="hud-frame rounded-md bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-signal">Résolution</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  <li>Résolution : <span className="text-text">{config.resolution}</span></li>
                  <li>Mode : <span className="text-text">{config.windowMode}</span></li>
                  <li>Aspect ratio : <span className="text-text">{config.aspectRatio}</span></li>
                  <li>Sensibilité : <span className="text-text">{config.sensitivity}</span></li>
                </ul>
              </div>

              <div className="hud-frame rounded-md bg-surface p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-signal">Viewmodel</p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-muted">{config.viewmodel}</pre>
                <div className="mt-3">
                  <CopyButton text={config.viewmodel} />
                </div>
              </div>
            </div>

            <div className="hud-frame mt-4 rounded-md bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-signal">Config complète — autoexec.cfg</p>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted">
                {config.autoexec}
              </pre>
              <div className="mt-3">
                <CopyButton text={config.autoexec} label="Copier la config complète" />
              </div>
            </div>
          </>
        )}

        <h2 className="mt-10 font-display text-xl font-600">Extensions Faceit</h2>
        <p className="text-sm text-muted">Extensions que j'utilise pour Faceit</p>
        {config?.extensions?.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {config.extensions.map((e, i) => (
              <a
                key={i}
                href={e.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="hud-frame focus-ring rounded-md bg-surface p-4 hover:border-signal"
              >
                <p className="font-display text-sm font-600">{e.name}</p>
                <p className="mt-1 text-xs text-muted">{e.desc}</p>
                <p className="mt-2 text-xs text-signal">Installer →</p>
              </a>
            ))}
          </div>
        ) : null}

        <h2 className="mt-10 font-display text-xl font-600">Niveau moyen de la communauté</h2>
        <p className="text-sm text-muted">Niveau Faceit des joueurs qui ont candidaté aux tournages</p>

        {stats === undefined && <p className="mt-4 text-sm text-muted">Chargement…</p>}
        {stats && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-md border border-line bg-surface p-4">
                <p className="font-display text-2xl">{stats.registeredMembers}</p>
                <p className="text-xs text-muted">Membres enregistrés</p>
              </div>
              <div className="rounded-md border border-line bg-surface p-4">
                <p className="font-display text-2xl">{stats.averageLevel ?? '—'}</p>
                <p className="text-xs text-muted">Niveau Faceit moyen</p>
              </div>
              <div className="rounded-md border border-line bg-surface p-4">
                <p className="font-display text-2xl">{stats.profiledMembers}</p>
                <p className="text-xs text-muted">Avec profil Faceit</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-signal">Distribution des niveaux Faceit</p>
              <div className="mt-2 flex items-end gap-1.5 h-28">
                {stats.distribution.map(d => (
                  <div key={d.level} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-flare/70"
                      style={{ height: `${Math.max(4, d.count * 10)}px` }}
                    />
                    <span className="text-[10px] text-muted">{d.level}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/profil"
              className="focus-ring mt-6 inline-block text-sm text-signal hover:underline"
            >
              Enregistre ton level & rejoins la communauté
            </Link>

            {stats.top.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.2em] text-signal">Top niveaux</p>
                <ol className="mt-2 space-y-1 text-sm">
                  {stats.top.map((u, i) => (
                    <li key={i} className="flex justify-between rounded bg-surface px-3 py-1.5">
                      <span className="text-muted">#{i + 1} {u.discordUsername}</span>
                      <span className="text-flare">Niv. {u.faceitLevel}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

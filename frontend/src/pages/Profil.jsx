import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Profil() {
  const { user, refresh } = useAuth();
  const [candidatures, setCandidatures] = useState([]);
  const [faceitUrl, setFaceitUrl] = useState('');
  const [faceitNoAccount, setFaceitNoAccount] = useState(false);
  const [faceitMsg, setFaceitMsg] = useState('');
  const [csstatsUrl, setCsstatsUrl] = useState('');
  const [csstatsMsg, setCsstatsMsg] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    if (user) {
      api.myCandidatures().then(({ candidatures }) => setCandidatures(candidatures)).catch(() => {});
      setFaceitUrl(user.faceitProfile || '');
      setFaceitNoAccount(!!user.faceitNoAccount);
      setCsstatsUrl(user.csstatsProfile || '');
      setBirthdate(user.birthdate || '');
      if (user.twitchId) {
        api.pointshop().then(({ rewards }) => setRewards(rewards)).catch(() => setRewards([]));
      }
    }
  }, [user]);

  async function handleVerifyFaceit() {
    setFaceitMsg('Vérification…');
    try {
      const r = await api.verifyFaceit(faceitUrl);
      setFaceitMsg(r.ok ? `Niveau détecté : ${r.level}` : r.message || 'Vérification indisponible');
      refresh();
    } catch (e) {
      setFaceitMsg(e.message);
    }
  }

  async function handleVerifyCsstats() {
    setCsstatsMsg('Vérification…');
    try {
      const r = await api.verifyCsstats(csstatsUrl);
      setCsstatsMsg(r.ok ? `Elo détecté : ${r.elo}` : r.message);
      refresh();
    } catch (e) {
      setCsstatsMsg(e.message);
    }
  }

  async function handleSave() {
    setSaveMsg('Sauvegarde…');
    try {
      await api.saveProfile({ birthdate, faceitNoAccount });
      setSaveMsg('Profil sauvegardé ✓');
      refresh();
    } catch (e) {
      setSaveMsg(e.message);
    }
  }

  return (
    <div>
      <Navbar back />
      <main className="mx-auto max-w-2xl px-6 pb-16">
        <h1 className="font-display text-xl font-600">Mon profil</h1>

        {user === undefined && <p className="mt-6 text-sm text-muted">Chargement…</p>}

        {user === null && (
          <div className="hud-frame mt-6 rounded-md bg-surface p-6 text-center">
            <p className="font-display text-lg font-600">Connexion requise</p>
            <p className="mt-2 text-sm text-muted">
              Connecte-toi avec Discord pour accéder à ton profil et candidater aux tournages.
            </p>
            <a
              href={api.discordLoginUrl()}
              className="focus-ring mt-4 inline-block rounded bg-flare px-5 py-2.5 font-display font-600 text-ink hover:opacity-90"
            >
              Se connecter avec Discord
            </a>
          </div>
        )}

        {user && (
          <>
            <div className="hud-frame mt-6 flex items-center justify-between rounded-md bg-surface p-4">
              <div className="flex items-center gap-3">
                {user.avatar && <img src={user.avatar} alt="" className="h-10 w-10 rounded-full" />}
                <div>
                  <p className="text-sm font-500">{user.discordUsername}</p>
                  <p className="text-xs text-muted">Connecté via Discord</p>
                </div>
              </div>
              <button
                onClick={async () => { await api.discordLogout(); refresh(); }}
                className="focus-ring text-xs text-muted hover:text-flare"
              >
                Déconnexion
              </button>
            </div>

            <section className="mt-8">
              <h2 className="font-display text-sm font-600 uppercase tracking-[0.15em] text-signal">
                Mes candidatures
              </h2>
              {candidatures.length === 0 ? (
                <p className="mt-2 text-sm text-muted">Aucune candidature envoyée pour le moment.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {candidatures.map(c => (
                    <li key={c.id} className="flex justify-between rounded border border-line bg-surface px-4 py-2 text-sm">
                      <span className="text-muted">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span
                        className={
                          c.status === 'acceptee'
                            ? 'text-signal'
                            : c.status === 'refusee'
                            ? 'text-flare'
                            : 'text-muted'
                        }
                      >
                        {c.status === 'acceptee' ? 'Acceptée' : c.status === 'refusee' ? 'Refusée' : 'En attente'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-8">
              <h2 className="font-display text-sm font-600 uppercase tracking-[0.15em] text-signal">Faceit</h2>
              <label className="mt-3 flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={faceitNoAccount}
                  onChange={e => setFaceitNoAccount(e.target.checked)}
                />
                Je n'ai pas de compte Faceit — je joue uniquement en Matchmaking Premier
              </label>

              {!faceitNoAccount && (
                <div className="mt-3">
                  <label className="text-xs text-muted">Lien profil Faceit *</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      value={faceitUrl}
                      onChange={e => setFaceitUrl(e.target.value)}
                      placeholder="https://www.faceit.com/fr/players/..."
                      className="focus-ring w-full rounded border border-line bg-surface px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleVerifyFaceit}
                      className="focus-ring shrink-0 rounded bg-signal px-4 py-2 text-sm font-600 text-ink"
                    >
                      Vérifier
                    </button>
                  </div>
                  {faceitMsg && <p className="mt-1 text-xs text-muted">{faceitMsg}</p>}
                  <p className="mt-1 text-xs text-muted">
                    Niveau détecté automatiquement — non modifiable.
                  </p>
                </div>
              )}
              {faceitNoAccount && (
                <p className="mt-2 text-xs text-muted">
                  Ton Elo CS2 Premier sera utilisé pour calculer ton niveau équivalent Faceit — remplis-le dans la section Statistiques ci-dessous.
                </p>
              )}
            </section>

            <section className="mt-8">
              <h2 className="font-display text-sm font-600 uppercase tracking-[0.15em] text-signal">Statistiques</h2>
              <label className="mt-3 block text-xs text-muted">CSStats — Lien de profil *</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={csstatsUrl}
                  onChange={e => setCsstatsUrl(e.target.value)}
                  placeholder="https://csstats.gg/player/..."
                  className="focus-ring w-full rounded border border-line bg-surface px-3 py-2 text-sm"
                />
                <button
                  onClick={handleVerifyCsstats}
                  className="focus-ring shrink-0 rounded bg-signal px-4 py-2 text-sm font-600 text-ink"
                >
                  Vérifier
                </button>
              </div>
              {csstatsMsg && <p className="mt-1 text-xs text-muted">{csstatsMsg}</p>}
              <p className="mt-1 text-xs text-muted">
                Elo CS2 Premier récupéré automatiquement : <span className="text-text">{user.premierElo ?? '—'}</span>
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-sm font-600 uppercase tracking-[0.15em] text-signal">Infos personnelles</h2>
              <label className="mt-3 block text-xs text-muted">Date de naissance *</label>
              <input
                type="date"
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
                className="focus-ring mt-1 rounded border border-line bg-surface px-3 py-2 text-sm"
              />
            </section>

            <button
              onClick={handleSave}
              className="focus-ring mt-6 w-full rounded bg-flare py-2.5 font-display font-600 text-ink hover:opacity-90"
            >
              Sauvegarder mon profil
            </button>
            {saveMsg && <p className="mt-2 text-center text-xs text-muted">{saveMsg}</p>}

            <section className="mt-10 rounded-md border border-line bg-surface p-5">
              <p className="font-display text-sm font-600">🎁 Point Shop</p>
              <p className="mt-1 text-sm text-muted">Tes rewards Point Shop</p>

              {!user.twitchId ? (
                <>
                  <p className="mt-2 text-xs text-muted">
                    Connecte-toi avec Twitch pour voir les rewards que tu as débloqués.
                  </p>
                  <a
                    href={api.twitchLoginUrl()}
                    className="focus-ring mt-3 inline-block rounded bg-[#9146FF] px-4 py-2 text-sm font-600 text-white hover:opacity-90"
                  >
                    Se connecter avec Twitch
                  </a>
                </>
              ) : (
                <>
                  {rewards === null && <p className="mt-2 text-xs text-muted">Chargement…</p>}
                  {rewards && rewards.length === 0 && (
                    <p className="mt-2 text-xs text-muted">Aucun reward débloqué pour le moment.</p>
                  )}
                  {rewards && rewards.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {rewards.map((r, i) => (
                        <li key={i} className="flex justify-between rounded bg-surface2 px-3 py-1.5">
                          <span>{r.title}</span>
                          <span className="text-muted">{r.cost} pts</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={async () => { await api.twitchLogout(); refresh(); }}
                    className="focus-ring mt-3 text-xs text-muted hover:text-flare"
                  >
                    Déconnecter Twitch
                  </button>
                </>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

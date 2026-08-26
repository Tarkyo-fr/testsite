import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const emptySlot = () => ({ day: 'Lundi', time: '', title: '', game: '' });

function Section({ title, children }) {
  return (
    <section className="hud-frame mt-8 rounded-md bg-surface p-5">
      <h2 className="font-display text-sm font-600 uppercase tracking-[0.15em] text-signal">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);

  const [planning, setPlanning] = useState([]);
  const [planningMsg, setPlanningMsg] = useState('');

  const [tournage, setTournage] = useState({ active: false, message: '' });
  const [tournageMsg, setTournageMsg] = useState('');

  const [giveawayForm, setGiveawayForm] = useState({ title: '', description: '', image: '', endsAt: '' });
  const [giveawayMsg, setGiveawayMsg] = useState('');

  const [candidatures, setCandidatures] = useState([]);

  useEffect(() => {
    if (user === undefined) return;
    if (user === null) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.planning(),
      api.adminCandidatures()
    ])
      .then(([planningRes, candidaturesRes]) => {
        setPlanning(planningRes.planning?.length ? planningRes.planning : [emptySlot()]);
        setTournage(planningRes.tournageOuvert || { active: false, message: '' });
        setCandidatures(candidaturesRes.candidatures);
        setLoading(false);
      })
      .catch(err => {
        if (err.message?.includes('403') || /admin/i.test(err.message)) setForbidden(true);
        setLoading(false);
      });
  }, [user]);

  function updateSlot(i, field, value) {
    setPlanning(p => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function savePlanning() {
    setPlanningMsg('Sauvegarde…');
    try {
      await api.adminSavePlanning(planning.filter(s => s.title.trim() || s.time.trim()));
      setPlanningMsg('Planning publié ✓');
    } catch (e) {
      setPlanningMsg(e.message);
    }
  }

  async function saveTournage() {
    setTournageMsg('Sauvegarde…');
    try {
      await api.adminSaveTournage(tournage);
      setTournageMsg('Mis à jour ✓');
    } catch (e) {
      setTournageMsg(e.message);
    }
  }

  async function createGiveaway() {
    setGiveawayMsg('Publication…');
    try {
      await api.adminCreateGiveaway(giveawayForm);
      setGiveawayMsg('Nouveau giveaway publié ✓ (remplace le précédent)');
      setGiveawayForm({ title: '', description: '', image: '', endsAt: '' });
    } catch (e) {
      setGiveawayMsg(e.message);
    }
  }

  async function setStatus(id, status) {
    await api.adminUpdateCandidature(id, status);
    setCandidatures(cs => cs.map(c => (c.id === id ? { ...c, status } : c)));
  }

  return (
    <div>
      <Navbar back />
      <main className="mx-auto max-w-2xl px-6 pb-16">
        <h1 className="font-display text-xl font-600">Administration</h1>

        {(user === undefined || loading) && <p className="mt-6 text-sm text-muted">Chargement…</p>}

        {user === null && !loading && (
          <div className="hud-frame mt-6 rounded-md bg-surface p-6 text-center">
            <p className="text-sm text-muted">Connecte-toi avec Discord pour accéder à l'administration.</p>
            <a
              href={api.discordLoginUrl()}
              className="focus-ring mt-4 inline-block rounded bg-flare px-5 py-2.5 font-display font-600 text-ink hover:opacity-90"
            >
              Se connecter avec Discord
            </a>
          </div>
        )}

        {user && forbidden && !loading && (
          <div className="hud-frame mt-6 rounded-md bg-surface p-6 text-center">
            <p className="text-sm text-muted">
              Ton compte Discord n'est pas dans <span className="font-mono text-xs">ADMIN_DISCORD_IDS</span> côté
              backend. Ajoute ton ID Discord à cette variable d'environnement pour débloquer cette page.
            </p>
          </div>
        )}

        {user && !forbidden && !loading && (
          <>
            <Section title="Planning de la semaine">
              <div className="space-y-3">
                {planning.map((slot, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr] gap-2 sm:grid-cols-[100px_80px_1fr_1fr_auto]">
                    <select
                      value={slot.day}
                      onChange={e => updateSlot(i, 'day', e.target.value)}
                      className="focus-ring rounded border border-line bg-surface2 px-2 py-1.5 text-sm"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input
                      value={slot.time}
                      onChange={e => updateSlot(i, 'time', e.target.value)}
                      placeholder="20h00"
                      className="focus-ring rounded border border-line bg-surface2 px-2 py-1.5 text-sm"
                    />
                    <input
                      value={slot.title}
                      onChange={e => updateSlot(i, 'title', e.target.value)}
                      placeholder="Titre (ex: Ranked CS2)"
                      className="focus-ring rounded border border-line bg-surface2 px-2 py-1.5 text-sm"
                    />
                    <input
                      value={slot.game}
                      onChange={e => updateSlot(i, 'game', e.target.value)}
                      placeholder="Jeu (optionnel)"
                      className="focus-ring rounded border border-line bg-surface2 px-2 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => setPlanning(p => p.filter((_, idx) => idx !== i))}
                      className="focus-ring rounded border border-line px-2 text-flare hover:border-flare"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setPlanning(p => [...p, emptySlot()])}
                  className="focus-ring rounded border border-line px-3 py-1.5 text-sm text-muted hover:border-signal hover:text-signal"
                >
                  + Ajouter un créneau
                </button>
                <button
                  onClick={savePlanning}
                  className="focus-ring rounded bg-signal px-4 py-1.5 text-sm font-600 text-ink"
                >
                  Publier le planning
                </button>
              </div>
              {planningMsg && <p className="mt-2 text-xs text-muted">{planningMsg}</p>}
            </Section>

            <Section title="Recrutement tournage">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={tournage.active}
                  onChange={e => setTournage(t => ({ ...t, active: e.target.checked }))}
                />
                Bannière "Un tournage est ouvert" visible sur /planning
              </label>
              <input
                value={tournage.message}
                onChange={e => setTournage(t => ({ ...t, message: e.target.value }))}
                placeholder="Message affiché (ex: Clique pour candidater → places limitées)"
                className="focus-ring mt-3 w-full rounded border border-line bg-surface2 px-3 py-2 text-sm"
              />
              <button
                onClick={saveTournage}
                className="focus-ring mt-3 rounded bg-signal px-4 py-1.5 text-sm font-600 text-ink"
              >
                Sauvegarder
              </button>
              {tournageMsg && <p className="mt-2 text-xs text-muted">{tournageMsg}</p>}
            </Section>

            <Section title="Nouveau giveaway">
              <p className="mb-3 text-xs text-muted">Publier un nouveau giveaway remplace celui en cours.</p>
              <div className="space-y-2">
                <input
                  value={giveawayForm.title}
                  onChange={e => setGiveawayForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Titre"
                  className="focus-ring w-full rounded border border-line bg-surface2 px-3 py-2 text-sm"
                />
                <textarea
                  value={giveawayForm.description}
                  onChange={e => setGiveawayForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  rows={2}
                  className="focus-ring w-full rounded border border-line bg-surface2 px-3 py-2 text-sm"
                />
                <input
                  value={giveawayForm.image}
                  onChange={e => setGiveawayForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="URL de l'image (optionnel)"
                  className="focus-ring w-full rounded border border-line bg-surface2 px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={giveawayForm.endsAt}
                  onChange={e => setGiveawayForm(f => ({ ...f, endsAt: e.target.value }))}
                  className="focus-ring rounded border border-line bg-surface2 px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={createGiveaway}
                disabled={!giveawayForm.title}
                className="focus-ring mt-3 rounded bg-flare px-4 py-1.5 text-sm font-600 text-ink disabled:opacity-50"
              >
                Publier
              </button>
              {giveawayMsg && <p className="mt-2 text-xs text-muted">{giveawayMsg}</p>}
            </Section>

            <Section title={`Candidatures (${candidatures.length})`}>
              {candidatures.length === 0 && <p className="text-sm text-muted">Aucune candidature pour le moment.</p>}
              <ul className="space-y-2">
                {candidatures.map(c => (
                  <li key={c.id} className="rounded border border-line bg-surface2 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-500">{c.discordUsername}</span>
                      <span className="text-xs text-muted">
                        {new Date(c.createdAt).toLocaleDateString('fr-FR')} · Niv. Faceit {c.faceitLevel ?? '—'}
                      </span>
                    </div>
                    {c.message && <p className="mt-1 text-xs text-muted">{c.message}</p>}
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setStatus(c.id, 'acceptee')}
                        className={`focus-ring rounded px-3 py-1 text-xs ${
                          c.status === 'acceptee' ? 'bg-signal text-ink' : 'border border-line text-muted hover:text-signal'
                        }`}
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => setStatus(c.id, 'refusee')}
                        className={`focus-ring rounded px-3 py-1 text-xs ${
                          c.status === 'refusee' ? 'bg-flare text-ink' : 'border border-line text-muted hover:text-flare'
                        }`}
                      >
                        Refuser
                      </button>
                      <button
                        onClick={() => setStatus(c.id, 'en_attente')}
                        className={`focus-ring rounded px-3 py-1 text-xs ${
                          c.status === 'en_attente' ? 'bg-surface2 border border-signal text-signal' : 'border border-line text-muted'
                        }`}
                      >
                        En attente
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

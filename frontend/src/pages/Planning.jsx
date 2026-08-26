import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import GiveawayCard from '../components/GiveawayCard.jsx';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function Planning() {
  const { user } = useAuth();
  const [planning, setPlanning] = useState(undefined);
  const [tournage, setTournage] = useState(null);
  const [applyState, setApplyState] = useState('idle');

  useEffect(() => {
    api
      .planning()
      .then(({ planning, tournageOuvert }) => {
        setPlanning(planning);
        setTournage(tournageOuvert);
      })
      .catch(() => setPlanning([]));
  }, []);

  async function handleApply() {
    if (!user) {
      window.location.href = api.discordLoginUrl();
      return;
    }
    setApplyState('loading');
    try {
      await api.applyCandidature('Candidature envoyée depuis la page planning');
      setApplyState('done');
    } catch {
      setApplyState('error');
    }
  }

  return (
    <div>
      <Navbar back />
      <main className="px-6 pb-16">
        <h1 className="text-center font-display text-2xl font-700">
          PLANNING <span className="block text-flare">DE LA SEMAINE</span>
        </h1>

        {planning === undefined && (
          <p className="mt-8 text-center text-sm text-muted">Chargement…</p>
        )}
        {planning && planning.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted">
            Aucun planning publié pour le moment.
            <br />
            Reviens bientôt !
          </p>
        )}
        {planning && planning.length > 0 && (
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {DAYS.map(day => {
              const slots = planning.filter(p => p.day === day);
              if (slots.length === 0) return null;
              return (
                <div key={day} className="hud-frame rounded-md bg-surface p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-signal">{day}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {slots.map((s, i) => (
                      <li key={i} className="flex justify-between text-muted">
                        <span>{s.time} — {s.title}</span>
                        {s.game && <span className="text-text">{s.game}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {tournage?.active && (
          <button
            onClick={handleApply}
            disabled={applyState === 'loading' || applyState === 'done'}
            className="focus-ring mx-auto mt-10 flex max-w-md flex-col items-start gap-1 rounded-md border border-flare/40 bg-flare/10 px-5 py-4 text-left transition-colors hover:bg-flare/15 disabled:opacity-70"
          >
            <span className="font-display text-sm font-600 text-flare">
              {applyState === 'done' ? 'Candidature envoyée ✓' : 'Un tournage est ouvert !'}
            </span>
            <span className="text-xs text-muted">
              {applyState === 'done'
                ? 'Réponse à venir par Discord.'
                : `${tournage.message} →`}
            </span>
          </button>
        )}

        <div className="mt-14">
          <GiveawayCard />
        </div>
      </main>
      <Footer />
    </div>
  );
}

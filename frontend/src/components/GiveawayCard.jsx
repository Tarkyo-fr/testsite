import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function GiveawayCard() {
  const { user } = useAuth();
  const [giveaway, setGiveaway] = useState(undefined);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    api
      .giveaway()
      .then(({ giveaway }) => setGiveaway(giveaway))
      .catch(() => setGiveaway(null));
  }, []);

  async function handleParticipate() {
    if (!user) {
      window.location.href = api.discordLoginUrl();
      return;
    }
    setStatus('loading');
    try {
      await api.participate();
      setStatus('done');
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-flare">Giveaway du mois</p>
      <h2 className="mt-1 text-center font-display text-2xl font-600">Giveaway mensuel</h2>

      <div className="hud-frame mt-6 rounded-md bg-surface p-5">
        {giveaway === undefined && (
          <p className="text-center text-sm text-muted">Chargement…</p>
        )}
        {giveaway === null && (
          <p className="text-center text-sm text-muted">Aucun giveaway en cours pour le moment.</p>
        )}
        {giveaway && (
          <>
            {giveaway.image && (
              <img
                src={giveaway.image}
                alt="Aperçu du giveaway"
                className="mb-4 h-40 w-full rounded object-cover"
              />
            )}
            <h3 className="font-display text-lg font-600">{giveaway.title}</h3>
            <p className="mt-1 text-sm text-muted">{giveaway.description}</p>
            <p className="mt-2 text-xs text-muted">{giveaway.participantCount} participant(s)</p>
            <button
              onClick={handleParticipate}
              disabled={status === 'loading' || status === 'done'}
              className="focus-ring mt-4 w-full rounded bg-flare py-2.5 font-display font-600 tracking-wide text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === 'done'
                ? 'Participation enregistrée ✓'
                : status === 'loading'
                ? 'Envoi…'
                : user
                ? 'Participer au Giveaway'
                : 'Se connecter pour participer'}
            </button>
            {status === 'error' && (
              <p className="mt-2 text-center text-xs text-flare">Une erreur est survenue, réessaie.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

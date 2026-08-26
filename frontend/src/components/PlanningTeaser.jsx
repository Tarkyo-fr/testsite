import { Link } from 'react-router-dom';

export default function PlanningTeaser() {
  return (
    <Link
      to="/planning"
      className="hud-frame focus-ring mx-auto block max-w-md rounded-md bg-surface p-5 text-center transition-colors hover:bg-surface2"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-signal">Planning</p>
      <p className="mt-1 font-display text-xl font-600">De la semaine</p>
      <p className="mt-2 text-sm text-muted">Clique pour voir le programme</p>
    </Link>
  );
}

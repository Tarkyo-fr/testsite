import { Link } from 'react-router-dom';
import { siteConfig } from '../siteConfig.js';

export default function Navbar({ back }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 md:px-10">
      {back ? (
        <Link to="/" className="text-sm text-muted hover:text-text transition-colors focus-ring">
          ← Retour
        </Link>
      ) : (
        <span className="text-sm text-muted">{siteConfig.name.toLowerCase()}.gg</span>
      )}
      <Link to="/" className="font-display text-xl font-700 tracking-widest text-text">
        {siteConfig.name}
      </Link>
      <div className="w-16" />
    </header>
  );
}

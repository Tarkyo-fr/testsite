import { siteConfig } from '../siteConfig.js';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line px-6 py-8 text-center text-sm text-muted md:px-10">
      <p>© {new Date().getFullYear()} {siteConfig.name} · Tous droits réservés</p>
      <div className="mt-2 flex justify-center gap-4">
        <a href={siteConfig.socials.youtube} className="hover:text-flare transition-colors focus-ring">YouTube</a>
        <a href={siteConfig.socials.twitch} className="hover:text-flare transition-colors focus-ring">Twitch</a>
        <a href={siteConfig.socials.instagram} className="hover:text-flare transition-colors focus-ring">Instagram</a>
        <a href={siteConfig.socials.discord} className="hover:text-flare transition-colors focus-ring">Discord</a>
      </div>
    </footer>
  );
}

import { siteConfig } from '../siteConfig.js';

const links = [
  { key: 'youtube', label: 'YouTube' },
  { key: 'twitch', label: 'Twitch' },
  { key: 'kick', label: 'Kick' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'discord', label: 'Discord' }
];

export default function SocialLinks() {
  return (
    <nav className="flex flex-wrap justify-center gap-3">
      {links.map(l => (
        <a
          key={l.key}
          href={siteConfig.socials[l.key]}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:border-flare hover:text-text focus-ring"
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}

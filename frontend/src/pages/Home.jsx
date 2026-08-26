import { Link } from 'react-router-dom';
import { useState } from 'react';
import { siteConfig } from '../siteConfig.js';
import SocialLinks from '../components/SocialLinks.jsx';
import GiveawayCard from '../components/GiveawayCard.jsx';
import PlanningTeaser from '../components/PlanningTeaser.jsx';
import VideoGrid from '../components/VideoGrid.jsx';

export default function Home() {
  const [hover, setHover] = useState(false);

  return (
    <main>
      <section className="flex flex-col items-center px-6 pb-14 pt-16 text-center">
        <div
          className="hud-frame relative h-28 w-28 overflow-hidden rounded-full border border-line"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <img
            src={hover ? siteConfig.avatarHover : siteConfig.avatar}
            alt={siteConfig.name}
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="mt-6 font-display text-4xl font-700 tracking-wide">{siteConfig.name}</h1>
        <p className="mt-1 text-muted">{siteConfig.tagline}</p>

        <div className="mt-6">
          <SocialLinks />
        </div>

        <Link
          to="/profil"
          className="focus-ring mt-4 text-sm text-signal hover:underline"
        >
          Mon profil
        </Link>
      </section>

      <div className="px-6">
        <GiveawayCard />
      </div>

      <section className="mx-auto mt-16 max-w-md px-6">
        <PlanningTeaser />
      </section>

      <VideoGrid />

      <div className="mx-auto mt-16 max-w-5xl px-6 text-center">
        <Link
          to="/site"
          className="focus-ring text-sm text-muted underline decoration-line underline-offset-4 hover:text-flare"
        >
          Config PC · Extensions · Stats communauté
        </Link>
      </div>
    </main>
  );
}

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'data', 'db.json');

const defaultData = {
  // Session <-> compte lié (Discord obligatoire, Twitch optionnel)
  users: [],
  // Candidatures aux tournages
  candidatures: [],
  // Un seul giveaway "actif" à la fois, historique conservé
  giveaways: [
    {
      id: 'demo-giveaway',
      title: 'Setup CS2 complet à gagner',
      description: 'Tente ta chance pour remporter un setup complet (souris, tapis, clavier).',
      image: '',
      active: true,
      participants: [],
      endsAt: null
    }
  ],
  // Planning hebdo : tableau de créneaux { day, time, title, game }
  planning: [],
  // Config CS2 affichée sur /site
  config: {
    crosshairCode: 'CSGO-CiaSu-H74tb-8MR2G-f3vzW-2hj5P',
    resolution: '1920 x 1080',
    windowMode: 'Fenêtré sans bordure',
    aspectRatio: '16:9',
    sensitivity: '1.0',
    viewmodel: 'viewmodel_fov 64; viewmodel_offset_x -1; viewmodel_offset_y -2; viewmodel_offset_z -1; cl_prefer_lefthanded 1',
    autoexec: 'viewmodel_fov 64\nviewmodel_offset_x -1\nviewmodel_offset_y -2\nviewmodel_offset_z -1\ncl_prefer_lefthanded 1\nsensitivity 1\nzoom_sensitivity_ratio 1',
    pcParts: [],
    peripherals: [],
    extensions: [
      { name: 'MappioFaceit', desc: 'Stats par map, probabilité de veto, positions adverses', url: '' },
      { name: 'Repeek', desc: 'Overlay temps réel, Elo gagné/perdu, winrate lobby', url: '' }
    ]
  },
  // Point Shop : rewards liés aux points de chaîne Twitch
  pointshop: {
    rewards: []
  },
  tournageOuvert: {
    active: true,
    message: 'Un tournage est ouvert ! Clique pour candidater — places limitées'
  }
};

export const db = new Low(new JSONFile(file), defaultData);

export async function initDb() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

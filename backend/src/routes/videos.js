import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();
let cache = { data: null, at: 0 };
const TTL = 10 * 60 * 1000; // 10 min

router.get('/', async (req, res) => {
  const { YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID } = process.env;

  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return res.json({
      videos: [],
      configured: false,
      message: 'Ajoute YOUTUBE_API_KEY et YOUTUBE_CHANNEL_ID dans .env pour afficher les vraies vidéos.'
    });
  }

  if (cache.data && Date.now() - cache.at < TTL) {
    return res.json({ videos: cache.data, configured: true });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&order=date&maxResults=6&type=video`;
    const r = await fetch(url);
    const data = await r.json();
    const videos = (data.items || []).map(v => ({
      id: v.id.videoId,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails?.medium?.url,
      publishedAt: v.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${v.id.videoId}`
    }));
    cache = { data: videos, at: Date.now() };
    res.json({ videos, configured: true });
  } catch (err) {
    console.error('YouTube API error', err);
    res.status(500).json({ videos: [], error: 'Impossible de récupérer les vidéos' });
  }
});

export default router;

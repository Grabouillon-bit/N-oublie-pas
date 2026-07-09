const { Redis } = require('@upstash/redis');

// Marche que la variable soit injectée sous le nom "KV_..." (ancien nommage
// Vercel KV conservé par compatibilité) ou "UPSTASH_REDIS_..." (nommage natif
// Upstash Marketplace) — selon ce que Vercel affiche dans tes variables d'env.
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = { redis };

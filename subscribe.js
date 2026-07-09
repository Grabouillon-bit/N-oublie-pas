const { redis } = require('./_redis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      res.status(400).json({ error: 'Invalid subscription' });
      return;
    }
    await redis.set('push:subscription', JSON.stringify(subscription));
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

const { redis } = require('./_redis');

function todayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const date = (req.body && req.body.date) || todayKey();
    await redis.set('history:' + date, '1');
    await redis.del('lastAttempt');
    res.status(200).json({ ok: true, date });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

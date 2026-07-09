const { redis } = require('./_redis');

const DEFAULTS = { alarmTime: '20:30', intervalMinutes: 60, name: '' };

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const raw = await redis.get('settings');
      const settings = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : DEFAULTS;
      res.status(200).json(settings);
      return;
    }
    if (req.method === 'POST') {
      const body = req.body || {};
      const settings = {
        alarmTime: body.alarmTime || DEFAULTS.alarmTime,
        intervalMinutes: Number(body.intervalMinutes) || DEFAULTS.intervalMinutes,
        name: (body.name || '').slice(0, 60),
      };
      await redis.set('settings', JSON.stringify(settings));
      res.status(200).json({ ok: true, settings });
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

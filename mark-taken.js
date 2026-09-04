const { redis } = require('./_redis');

// Même logique que check-and-notify.js : on calcule la date "vue à Paris",
// pas celle du serveur (UTC), pour que les deux fichiers s'accordent sur
// ce qu'est "aujourd'hui" — sinon un "pris" coché tard le soir pouvait ne
// pas correspondre à la même journée que celle vérifiée par le cron.
function todayKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
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

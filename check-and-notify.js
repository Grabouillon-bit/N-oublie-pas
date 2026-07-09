const webpush = require('web-push');
const { redis } = require('./_redis');

const DEFAULTS = { alarmTime: '20:30', intervalMinutes: 60, name: '' };

function todayKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

module.exports = async (req, res) => {
  // Protège l'endpoint : seul un appel avec la bonne clé peut déclencher un envoi.
  const key = req.query.key || (req.headers.authorization || '').replace('Bearer ', '');
  if (!process.env.CRON_KEY || key !== process.env.CRON_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:contact@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const rawSettings = await redis.get('settings');
    const settings = rawSettings
      ? (typeof rawSettings === 'string' ? JSON.parse(rawSettings) : rawSettings)
      : DEFAULTS;

    const now = new Date();
    const today = todayKey(now);

    const taken = await redis.get('history:' + today);
    if (taken) {
      res.status(200).json({ ok: true, skipped: 'already taken today' });
      return;
    }

    const [h, m] = String(settings.alarmTime).split(':').map(Number);
    const alarmDate = new Date(now);
    alarmDate.setHours(h, m, 0, 0);
    if (now < alarmDate) {
      res.status(200).json({ ok: true, skipped: 'before alarm time' });
      return;
    }

    const elapsedMin = Math.floor((now - alarmDate) / 60000);
    const intervalMinutes = Number(settings.intervalMinutes) || 60;
    const attempt = Math.floor(elapsedMin / intervalMinutes);

    const rawLast = await redis.get('lastAttempt');
    const last = rawLast
      ? (typeof rawLast === 'string' ? JSON.parse(rawLast) : rawLast)
      : { date: '', attempt: -1 };

    if (last.date === today && last.attempt >= attempt) {
      res.status(200).json({ ok: true, skipped: 'already notified this slot' });
      return;
    }

    const rawSub = await redis.get('push:subscription');
    if (!rawSub) {
      res.status(200).json({ ok: true, skipped: 'no subscription registered' });
      return;
    }
    const subscription = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub;

    const body = settings.name
      ? `${settings.name}, un petit rappel : as-tu pris ta pilule ce soir ?`
      : `As-tu pris ta pilule ce soir ?`;

    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({ title: "N'oublie pas 🌙", body, tag: 'pilule-reminder-' + attempt })
      );
    } catch (sendErr) {
      // Abonnement expiré ou révoqué côté iPhone : on l'efface pour éviter d'échouer en boucle.
      if (sendErr.statusCode === 404 || sendErr.statusCode === 410) {
        await redis.del('push:subscription');
        res.status(200).json({ ok: true, skipped: 'subscription expired, cleared' });
        return;
      }
      throw sendErr;
    }

    await redis.set('lastAttempt', JSON.stringify({ date: today, attempt }));
    res.status(200).json({ ok: true, sent: true, attempt });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
};

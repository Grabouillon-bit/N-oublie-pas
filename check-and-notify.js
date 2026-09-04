const webpush = require('web-push');
const { redis } = require('./_redis');

const DEFAULTS = { alarmTime: '20:30', intervalMinutes: 60, name: '' };

// Le serveur Vercel tourne en UTC, pas en heure de Paris. On calcule donc
// la date et l'heure "telles que vues à Paris" explicitement, plutôt que de
// se fier au fuseau du serveur (ce qui décalait tout de 1h ou 2h selon la
// saison, et faisait croire que l'heure de l'alarme n'était jamais atteinte).
function parisParts(d) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t).value;
  return {
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
    minutesOfDay: Number(get('hour')) * 60 + Number(get('minute')),
  };
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
    const { dateKey: today, minutesOfDay: nowMin } = parisParts(now);

    const taken = await redis.get('history:' + today);
    if (taken) {
      res.status(200).json({ ok: true, skipped: 'already taken today' });
      return;
    }

    const [h, m] = String(settings.alarmTime).split(':').map(Number);
    const alarmMin = h * 60 + m;
    if (nowMin < alarmMin) {
      res.status(200).json({ ok: true, skipped: 'before alarm time' });
      return;
    }

    const elapsedMin = nowMin - alarmMin;
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

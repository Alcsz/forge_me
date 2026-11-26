// Envoie le rappel du matin de Forge (notification push) à 8 h, heure de Paris.
// Le secret FORGE_PUSH contient un ou plusieurs codes de liaison copiés depuis l'appli.
import webpush from 'web-push';

const raw = (process.env.FORGE_PUSH || '').trim();
if (!raw) { console.log('Secret FORGE_PUSH absent : rien à envoyer.'); process.exit(0); }

const now = new Date();
const parisHour = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hourCycle: 'h23' }).format(now);
const offset = (parisHour - now.getUTCHours() + 24) % 24; // 1 en hiver, 2 en été

const sched = (process.env.SCHED || '').trim();
if (sched) {
  // Deux créneaux programmés (5 h 30 et 6 h 30 UTC) : on garde celui qui tombe à 7 h 30 à Paris.
  const want = offset === 2 ? '30 5 * * *' : '30 6 * * *';
  if (sched !== want) { console.log('Créneau de l’autre saison, on passe.'); process.exit(0); }
  const target = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8 - offset, 0, 0);
  const wait = target - Date.now();
  if (wait > 0 && wait < 3 * 3600e3) {
    console.log(`Attente de 8 h (${Math.round(wait / 1000)} s)`);
    await new Promise(r => setTimeout(r, wait));
  }
}

let sent = 0;
for (const code of raw.split(/\s+/).filter(Boolean)) {
  try {
    const k = JSON.parse(Buffer.from(code, 'base64url').toString());
    await webpush.sendNotification(k.s, JSON.stringify({ t: Date.now() }), {
      vapidDetails: { subject: k.u, publicKey: k.pub, privateKey: k.priv },
      TTL: 6 * 3600, urgency: 'high',
    });
    sent++; console.log('Rappel envoyé.');
  } catch (e) {
    console.error('Échec :', e.statusCode || '', e.body || e.message);
  }
}
if (!sent) process.exit(1);

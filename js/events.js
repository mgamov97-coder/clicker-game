const RANDOM_EVENTS = [
  {
    id: 'golden_skull',
    icon: '💀',
    title: 'Golden Skull!',
    desc: 'Catch it — earn 5 minutes of income!',
    duration: 8,
    reward() { return G.soulsPerSec * 300; },
    color: '#fbbf24',
  },
  {
    id: 'dark_portal',
    icon: '🌀',
    title: 'Dark Portal!',
    desc: 'Souls pour from the portal — click immediately!',
    duration: 10,
    reward() { return Math.max(G.soulsPerSec * 600, G.soulsPerClick * 500); },
    color: '#a855f7',
  },
  {
    id: 'plague_wave',
    icon: '☣️',
    title: 'Plague Wave!',
    desc: 'An epidemic mows down thousands — claim their souls!',
    duration: 7,
    reward() { return G.soulsPerSec * 180 + G.souls * 0.05; },
    color: '#4ade80',
  },
  {
    id: 'demon_lord',
    icon: '😈',
    title: 'Demon Lord!',
    desc: 'A great demon offers an alliance. Accept?',
    duration: 12,
    reward() { return G.soulsPerSec * 1200; },
    color: '#ef4444',
  },
  {
    id: 'cursed_relic',
    icon: '⚗️',
    title: 'Cursed Relic!',
    desc: 'An ancient artefact radiates darkness. Take it!',
    duration: 9,
    reward() { return G.soulsPerSec * 420; },
    color: '#818cf8',
  },
];

let eventTimer    = 0;
let eventInterval = 90 + Math.random() * 120;
let activeEvent   = null;
let eventTimeLeft = 0;

function tickEvents(dt) {
  if (activeEvent) {
    eventTimeLeft -= dt;
    const fill = document.getElementById('event-timer-fill');
    if (fill) fill.style.width = Math.max(0, (eventTimeLeft / activeEvent.duration) * 100) + '%';
    if (eventTimeLeft <= 0) dismissEvent();
    return;
  }
  eventTimer += dt;
  if (eventTimer >= eventInterval) {
    eventTimer    = 0;
    eventInterval = 90 + Math.random() * 120;
    spawnEvent();
  }
}

function spawnEvent() {
  const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  activeEvent   = ev;
  eventTimeLeft = ev.duration;

  const el = document.getElementById('random-event');
  document.getElementById('event-icon').textContent  = ev.icon;
  document.getElementById('event-title').textContent = ev.title;
  document.getElementById('event-desc').textContent  = ev.desc;
  el.style.setProperty('--event-color', ev.color);
  el.classList.remove('hidden');

  Sounds.event();
  addLog(`Event: ${ev.title}`, 'log-soul');
  el.onclick = claimEvent;
}

function claimEvent() {
  if (!activeEvent) return;
  const reward = Math.floor(activeEvent.reward());
  G.souls      += reward;
  G.soulsTotal += reward;

  showToast(`${activeEvent.icon} +${fmt(reward)} souls!`, 'toast-ach');
  addLog(`${activeEvent.title} — claimed ${fmt(reward)} souls`, 'log-soul');
  Sounds.buy();

  const el = document.getElementById('random-event');
  el.classList.add('claimed');
  setTimeout(() => { el.classList.remove('hidden', 'claimed'); activeEvent = null; }, 600);
  checkAchievements();
}

function dismissEvent() {
  document.getElementById('random-event').classList.add('hidden');
  activeEvent = null;
}

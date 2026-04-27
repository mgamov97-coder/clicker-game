const SPELLS = [
  {
    id: 'soul_burst',
    name: 'Soul Burst',
    icon: '💥',
    desc: 'Instantly gain 30 seconds of income',
    cooldown: 120,
    req: () => G.soulsPerSec >= 1,
    activate() {
      const bonus = G.soulsPerSec * 30;
      G.souls      += bonus;
      G.soulsTotal += bonus;
      addLog(`Soul Burst: +${fmt(bonus)} souls`, 'log-soul');
      showToast(`💥 Soul Burst: +${fmt(bonus)}`);
      Sounds.spell();
    },
  },
  {
    id: 'dark_ritual',
    name: 'Dark Ritual',
    icon: '🔮',
    desc: 'Click gives ×10 for 20 seconds',
    cooldown: 180,
    active: false,
    timer: 0,
    req: () => G.soulsTotal >= 500,
    activate() {
      this.active = true;
      this.timer  = 20;
      addLog('Dark Ritual activated!', 'log-soul');
      showToast('🔮 Click ×10 for 20 sec!');
      Sounds.spell();
    },
    tick(dt) {
      if (!this.active) return;
      this.timer -= dt;
      if (this.timer <= 0) { this.active = false; this.timer = 0; }
    },
    clickMult() { return this.active ? 10 : 1; },
  },
  {
    id: 'demon_summon',
    name: 'Demon Summon',
    icon: '😈',
    desc: 'Income ×5 for 15 seconds',
    cooldown: 300,
    active: false,
    timer: 0,
    req: () => G.soulsTotal >= 5_000,
    activate() {
      this.active = true;
      this.timer  = 15;
      addLog('Demon summoned! Income ×5 for 15 sec', 'log-soul');
      showToast('😈 Demon summoned! ×5 income!');
      Sounds.spell();
    },
    tick(dt) {
      if (!this.active) return;
      this.timer -= dt;
      if (this.timer <= 0) { this.active = false; this.timer = 0; }
    },
    incomeMult() { return this.active ? 5 : 1; },
  },
  {
    id: 'sacrifice',
    name: 'Sacrifice',
    icon: '🩸',
    desc: 'Spend 10% of souls — gain 200% back',
    cooldown: 60,
    req: () => G.souls >= 100,
    activate() {
      const cost = G.souls * 0.1;
      const gain = cost * 2;
      G.souls      = G.souls - cost + gain;
      G.soulsTotal += gain;
      addLog(`Sacrifice: +${fmt(gain)} souls`, 'log-soul');
      showToast(`🩸 +${fmt(gain)} souls!`);
      Sounds.spell();
    },
  },
  {
    id: 'time_freeze',
    name: 'Time Stop',
    icon: '⏳',
    desc: 'Buildings produce ×10 for 10 seconds',
    cooldown: 240,
    active: false,
    timer: 0,
    req: () => G.soulsTotal >= 50_000,
    activate() {
      this.active = true;
      this.timer  = 10;
      addLog('Time stopped! Production ×10', 'log-soul');
      showToast('⏳ Production ×10 for 10 sec!');
      Sounds.spell();
    },
    tick(dt) {
      if (!this.active) return;
      this.timer -= dt;
      if (this.timer <= 0) { this.active = false; this.timer = 0; }
    },
    incomeMult() { return this.active ? 10 : 1; },
  },
];

const spellCooldowns = {};
SPELLS.forEach(s => { spellCooldowns[s.id] = 0; });

function castSpell(id) {
  const spell = SPELLS.find(s => s.id === id);
  if (!spell || spellCooldowns[id] > 0 || !spell.req()) return;
  spell.activate();
  spellCooldowns[id] = spell.cooldown;
  UI.updateSpells();
}

function tickSpells(dt) {
  for (const spell of SPELLS) {
    if (spellCooldowns[spell.id] > 0)
      spellCooldowns[spell.id] = Math.max(0, spellCooldowns[spell.id] - dt);
    if (spell.tick) spell.tick(dt);
  }
}

function getSpellClickMult() {
  let m = 1;
  for (const s of SPELLS) if (s.clickMult) m *= s.clickMult();
  return m;
}

function getSpellIncomeMult() {
  let m = 1;
  for (const s of SPELLS) if (s.incomeMult) m *= s.incomeMult();
  return m;
}

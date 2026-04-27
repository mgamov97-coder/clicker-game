// ===== FORMATTING =====
function fmt(n) {
  n = Math.floor(n);
  if (n < 1_000)         return n.toString();
  if (n < 1_000_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n < 1e12)          return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n < 1e15)          return (n / 1e12).toFixed(2) + 'T';
  return n.toExponential(2);
}

function fmtDec(n) {
  if (n < 1_000) return n.toFixed(1);
  return fmt(n);
}

function fmtTime(sec) {
  sec = Math.ceil(sec);
  if (sec < 60)   return sec + 's';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ' + (sec % 60) + 's';
  return Math.floor(sec / 3600) + 'h';
}

// ===== LOG =====
const MAX_LOG = 60;
function addLog(text, cls = '') {
  const log = document.getElementById('event-log');
  const el  = document.createElement('div');
  el.className   = 'log-entry ' + cls;
  el.textContent = text;
  log.prepend(el);
  while (log.children.length > MAX_LOG) log.lastChild.remove();
}

// ===== TOASTS =====
function showToast(text, cls = '') {
  const c  = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className   = 'toast ' + cls;
  el.textContent = text;
  c.prepend(el);
  setTimeout(() => el.remove(), 3100);
}

// ===== CLICK FLOATS =====
function spawnClickFloat(e, amount) {
  const el = document.createElement('div');
  el.className   = 'click-float';
  el.textContent = '+' + fmtDec(amount);
  el.style.left  = (e.clientX - 20 + (Math.random() - 0.5) * 40) + 'px';
  el.style.top   = (e.clientY - 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
  spawnClickParticles(e.clientX, e.clientY, 8);
}

// ===== UI OBJECT =====
const UI = {
  updateHeader() {
    document.getElementById('souls-count').textContent    = fmt(G.souls);
    document.getElementById('souls-per-sec').textContent  = fmtDec(G.soulsPerSec);
    document.getElementById('souls-total').textContent    = fmt(G.soulsTotal);
    document.getElementById('prestige-bonus').textContent =
      '×' + (prestigeMultiplier() * kingdomsMultiplier()).toFixed(2);
    document.getElementById('click-power').textContent    = fmtDec(G.soulsPerClick);
  },

  // ===== BUILDINGS =====
  renderBuildings() {
    const list = document.getElementById('buildings-list');
    list.innerHTML = '';

    const bulkBar = document.createElement('div');
    bulkBar.id = 'bulk-bar';
    bulkBar.innerHTML = `
      <span class="bulk-label">Buy:</span>
      <button class="bulk-btn active" data-bulk="1">×1</button>
      <button class="bulk-btn" data-bulk="10">×10</button>
      <button class="bulk-btn" data-bulk="100">×100</button>`;
    list.appendChild(bulkBar);

    bulkBar.querySelectorAll('.bulk-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        bulkBar.querySelectorAll('.bulk-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateBuildings();
      });
    });

    for (const b of BUILDINGS) {
      const card = document.createElement('div');
      card.className = 'building-card locked';
      card.id = `bcard-${b.id}`;
      card.innerHTML = `
        <div class="building-icon">${b.icon}</div>
        <div class="building-info">
          <div class="building-name">${b.name}</div>
          <div class="building-desc">${b.desc}</div>
          <div class="building-income" id="binc-${b.id}"></div>
        </div>
        <div class="building-right">
          <div class="building-count" id="bcnt-${b.id}">0</div>
          <div class="building-cost"  id="bcost-${b.id}"></div>
        </div>`;
      card.addEventListener('click', () => { buyBuilding(b.id, currentBulk()); Sounds.buy(); });
      list.appendChild(card);
    }
  },

  updateBuildings() {
    for (const b of BUILDINGS) {
      const st   = G.buildings[b.id];
      const qty  = currentBulk();
      const cost = buildingCost(b.id, qty);
      const card = document.getElementById(`bcard-${b.id}`);
      if (!card) continue;

      const idx     = BUILDINGS.indexOf(b);
      const visible = idx === 0 || G.buildings[BUILDINGS[idx - 1].id].count >= 1;

      if (!visible) {
        card.className = 'building-card locked';
        document.getElementById(`bcnt-${b.id}`).textContent  = '0';
        document.getElementById(`bcost-${b.id}`).textContent = '';
        document.getElementById(`binc-${b.id}`).textContent  = '';
        continue;
      }

      const canAfford = G.souls >= cost;
      card.className  = 'building-card' + (canAfford ? ' can-afford' : '');

      document.getElementById(`bcnt-${b.id}`).textContent = st.count;

      const inc = b.baseIncome * st.count * upgradeMultiplierFor(b.id)
                  * prestigeMultiplier() * kingdomsMultiplier() * getSpellIncomeMult();
      document.getElementById(`binc-${b.id}`).textContent =
        st.count > 0 ? `${fmtDec(inc)} souls/s` : '';

      const costEl = document.getElementById(`bcost-${b.id}`);
      costEl.textContent = fmt(cost) + ' souls';
      costEl.className   = 'building-cost' + (canAfford ? '' : ' cant-afford');
    }
  },

  // ===== UPGRADES =====
  renderUpgrades() {
    const list = document.getElementById('upgrades-list');
    list.innerHTML = '';
    for (const u of UPGRADES) {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.id = `ucard-${u.id}`;
      card.innerHTML = `
        <div class="upgrade-icon">${u.icon}</div>
        <div class="upgrade-name">${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-cost" id="ucost-${u.id}">${fmt(u.cost)} souls</div>`;
      card.addEventListener('click', () => { buyUpgrade(u.id); Sounds.buy(); });
      list.appendChild(card);
    }
  },

  updateUpgrades() {
    for (const u of UPGRADES) {
      const card = document.getElementById(`ucard-${u.id}`);
      if (!card) continue;
      const bought    = G.upgrades.has(u.id);
      const visible   = !bought && isUpgradeVisible(u);
      const canAfford = !bought && G.souls >= u.cost;

      card.style.display = (visible || bought) ? '' : 'none';
      card.className = 'upgrade-card' + (bought ? ' bought' : canAfford ? ' can-afford' : '');

      const costEl = document.getElementById(`ucost-${u.id}`);
      costEl.textContent = bought ? '✓ Purchased' : fmt(u.cost) + ' souls';
      costEl.className   = 'upgrade-cost' + (canAfford || bought ? '' : ' cant-afford');
    }
  },

  // ===== SPELLS =====
  renderSpells() {
    const list = document.getElementById('spells-list');
    list.innerHTML = '';
    for (const s of SPELLS) {
      const btn = document.createElement('button');
      btn.className = 'spell-btn';
      btn.id = `spell-${s.id}`;
      btn.title = `${s.name}: ${s.desc}`;
      btn.innerHTML = `
        <span class="spell-icon">${s.icon}</span>
        <span class="spell-name">${s.name}</span>
        <div class="spell-cd" id="scd-${s.id}"></div>
        <div class="spell-cd-bar"><div class="spell-cd-fill" id="scdf-${s.id}"></div></div>`;
      btn.addEventListener('click', () => castSpell(s.id));
      list.appendChild(btn);
    }
  },

  updateSpells() {
    for (const s of SPELLS) {
      const btn  = document.getElementById(`spell-${s.id}`);
      const cdEl = document.getElementById(`scd-${s.id}`);
      const fill = document.getElementById(`scdf-${s.id}`);
      if (!btn) continue;

      const cd      = spellCooldowns[s.id];
      const ready   = cd <= 0 && s.req();
      const visible = s.req() || cd > 0;

      btn.style.display = visible ? '' : 'none';
      btn.disabled = !ready;
      btn.classList.toggle('spell-ready', ready);
      btn.classList.toggle('spell-active', !!(s.active));

      cdEl.textContent = cd > 0 ? fmtTime(cd) : '';
      if (fill) fill.style.width = cd > 0 ? ((1 - cd / s.cooldown) * 100) + '%' : '100%';
    }
  },

  // ===== KINGDOMS =====
  renderKingdoms() {
    const list = document.getElementById('kingdoms-list');
    list.innerHTML = '';
    for (const k of KINGDOMS) {
      const card = document.createElement('div');
      card.className = 'kingdom-card';
      card.id = `kcard-${k.id}`;
      card.innerHTML = `
        <div class="kingdom-icon">${k.icon}</div>
        <div class="kingdom-info">
          <div class="kingdom-name">${k.name}</div>
          <div class="kingdom-desc">${k.desc}</div>
          <div class="kingdom-req" id="kreq-${k.id}"></div>
        </div>
        <div class="kingdom-status" id="kstat-${k.id}"></div>`;
      list.appendChild(card);
    }
    this.updateKingdoms();
  },

  updateKingdoms() {
    if (!G.kingdoms) return;
    for (const k of KINGDOMS) {
      const card = document.getElementById(`kcard-${k.id}`);
      if (!card) continue;
      const owned = G.kingdoms.has(k.id);
      card.className = 'kingdom-card' + (owned ? ' owned' : '');
      document.getElementById(`kstat-${k.id}`).textContent = owned ? '⚔ Conquered' : '🔒';
      const pct = Math.min(100, (G.soulsTotal / k.req) * 100).toFixed(0);
      document.getElementById(`kreq-${k.id}`).textContent =
        owned ? `+${(k.bonus * 100).toFixed(0)}% income`
              : `${fmt(G.soulsTotal)} / ${fmt(k.req)} souls (${pct}%)`;
    }
  },

  // ===== ACHIEVEMENTS =====
  renderAchievements() {
    const list = document.getElementById('achievements-list');
    list.innerHTML = '';
    for (const a of ACHIEVEMENTS) {
      const card = document.createElement('div');
      card.className = 'achievement-card locked';
      card.id = `acard-${a.id}`;
      card.innerHTML = `
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>`;
      list.appendChild(card);
    }
  },

  updateAchievements() {
    for (const a of ACHIEVEMENTS) {
      const card = document.getElementById(`acard-${a.id}`);
      if (!card) continue;
      card.className = 'achievement-card ' + (G.achievements.has(a.id) ? 'unlocked' : 'locked');
    }
  },

  // ===== STATS =====
  updateStats() {
    const el = document.getElementById('stats-content');
    if (!el) return;
    const totalB = Object.values(G.buildings).reduce((s, b) => s + b.count, 0);
    const rows = [
      ['Total souls earned',      fmt(G.soulsTotal)],
      ['Current souls',           fmt(G.souls)],
      ['Souls per second',        fmtDec(G.soulsPerSec)],
      ['Souls per click',         fmtDec(G.soulsPerClick)],
      ['Buildings owned',         totalB],
      ['Curses learned',          G.upgrades.size + ' / ' + UPGRADES.length],
      ['Achievements unlocked',   G.achievements.size + ' / ' + ACHIEVEMENTS.length],
      ['Kingdoms conquered',      (G.kingdoms?.size ?? 0) + ' / ' + KINGDOMS.length],
      ['Prestige count',          G.prestigeCount],
      ['Dark Power',              G.darkPower],
      ['Prestige multiplier',     '×' + prestigeMultiplier().toFixed(2)],
      ['Kingdom multiplier',      '×' + kingdomsMultiplier().toFixed(2)],
      ['Total multiplier',        '×' + (prestigeMultiplier() * kingdomsMultiplier()).toFixed(2)],
    ];
    el.innerHTML = `<div class="stats-grid">${
      rows.map(([k, v]) => `<div class="stat-row"><span class="skey">${k}</span><span class="sval">${v}</span></div>`).join('')
    }</div>
    <div class="stats-buildings">
      <div class="panel-title" style="margin:16px 0 10px">Buildings</div>
      ${BUILDINGS.map(b => {
        const st = G.buildings[b.id];
        if (!st || st.count === 0) return '';
        const inc = b.baseIncome * st.count * upgradeMultiplierFor(b.id) * prestigeMultiplier() * kingdomsMultiplier();
        return `<div class="stat-row"><span class="skey">${b.icon} ${b.name}</span><span class="sval">${st.count} owned — ${fmtDec(inc)}/s</span></div>`;
      }).join('')}
    </div>`;
  },

  // ===== PRESTIGE =====
  updatePrestige() {
    const gain    = calcPrestigeGain();
    const newDP   = G.darkPower + gain;
    const newMult = (1 + newDP * 0.05).toFixed(2);

    document.getElementById('current-dark-power').textContent = G.darkPower;
    document.getElementById('gain-dark-power').textContent    = gain;
    document.getElementById('new-multiplier').textContent     = '×' + newMult;

    const btn = document.getElementById('prestige-btn');
    const req = document.getElementById('prestige-req');
    btn.disabled = G.soulsTotal < PRESTIGE_REQ;
    req.textContent = G.soulsTotal >= PRESTIGE_REQ
      ? `Ready! You will gain ${gain} Dark Power.`
      : `Required: ${fmt(PRESTIGE_REQ)} souls (you have ${fmt(G.soulsTotal)})`;
  },
};

function currentBulk() {
  const a = document.querySelector('.bulk-btn.active');
  return a ? parseInt(a.dataset.bulk) : 1;
}

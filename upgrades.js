const UPGRADES = [
  // --- Click ---
  { id: 'click1', icon: '👊', name: 'Double Strike',     desc: 'Click yields ×2 souls',              cost: 100,            affects: 'click',    mult: 2,   req: () => G.soulsTotal >= 50 },
  { id: 'click2', icon: '⚡', name: 'Dark Impulse',      desc: 'Click yields another ×2 souls',      cost: 5_000,          affects: 'click',    mult: 2,   req: () => G.soulsTotal >= 2_000 },
  { id: 'click3', icon: '💥', name: 'Darkness Blast',    desc: 'Click yields another ×3 souls',      cost: 50_000,         affects: 'click',    mult: 3,   req: () => G.soulsTotal >= 20_000 },
  { id: 'click4', icon: '☠️', name: 'Death Seal',        desc: 'Click yields another ×5 souls',      cost: 1_000_000,      affects: 'click',    mult: 5,   req: () => G.soulsTotal >= 500_000 },

  // --- Tomb ---
  { id: 'tomb1',  icon: '🦴', name: 'Better Bones',      desc: 'Tomb yields ×2 souls',               cost: 200,            affects: 'tomb',     mult: 2,   req: () => G.buildings.tomb?.count >= 1 },
  { id: 'tomb2',  icon: '💀', name: 'Skeleton Army',     desc: 'Tomb yields another ×3 souls',       cost: 2_000,          affects: 'tomb',     mult: 3,   req: () => G.buildings.tomb?.count >= 5 },

  // --- Dungeon ---
  { id: 'dung1',  icon: '⛓️', name: 'Heavy Chains',      desc: 'Dungeon yields ×2 souls',            cost: 1_500,          affects: 'dungeon',  mult: 2,   req: () => G.buildings.dungeon?.count >= 1 },
  { id: 'dung2',  icon: '🔑', name: 'Eternal Captivity', desc: 'Dungeon yields another ×3 souls',    cost: 15_000,         affects: 'dungeon',  mult: 3,   req: () => G.buildings.dungeon?.count >= 5 },

  // --- Altar ---
  { id: 'alt1',   icon: '🔮', name: 'Blood Ritual',      desc: 'Dark Altar yields ×2 souls',         cost: 10_000,         affects: 'altar',    mult: 2,   req: () => G.buildings.altar?.count >= 1 },
  { id: 'alt2',   icon: '🌑', name: 'Lunar Eclipse',     desc: 'Dark Altar yields another ×3 souls', cost: 100_000,        affects: 'altar',    mult: 3,   req: () => G.buildings.altar?.count >= 5 },

  // --- Necromancer ---
  { id: 'nec1',   icon: '📜', name: 'Dark Scripture',    desc: 'Necromancer Tower ×2',               cost: 40_000,         affects: 'necro',    mult: 2,   req: () => G.buildings.necro?.count >= 1 },
  { id: 'nec2',   icon: '🧟', name: 'Undead Legion',     desc: 'Necromancer Tower ×3',               cost: 400_000,        affects: 'necro',    mult: 3,   req: () => G.buildings.necro?.count >= 5 },

  // --- Plague ---
  { id: 'pla1',   icon: '🐀', name: 'Rat Swarms',        desc: 'Plague Well ×2',                     cost: 160_000,        affects: 'plague',   mult: 2,   req: () => G.buildings.plague?.count >= 1 },
  { id: 'pla2',   icon: '💀', name: 'Black Death',       desc: 'Plague Well ×3',                     cost: 1_600_000,      affects: 'plague',   mult: 3,   req: () => G.buildings.plague?.count >= 5 },

  // --- Vampires ---
  { id: 'vam1',   icon: '🩸', name: 'Blood Feast',       desc: 'Vampire Lair ×2',                    cost: 600_000,        affects: 'vampire',  mult: 2,   req: () => G.buildings.vampire?.count >= 1 },
  { id: 'vam2',   icon: '🌙', name: 'Night Lord',        desc: 'Vampire Lair ×3',                    cost: 6_000_000,      affects: 'vampire',  mult: 3,   req: () => G.buildings.vampire?.count >= 5 },

  // --- Global ---
  { id: 'all1',   icon: '🌑', name: 'Dark Sun',          desc: 'All income ×1.5',                    cost: 5_000_000,      affects: 'all',      mult: 1.5, req: () => G.soulsTotal >= 1_000_000 },
  { id: 'all2',   icon: '🌌', name: 'Apocalypse',        desc: 'All income ×2',                      cost: 100_000_000,    affects: 'all',      mult: 2,   req: () => G.soulsTotal >= 50_000_000 },
  { id: 'all3',   icon: '♾️', name: 'Infinite Darkness', desc: 'All income ×3',                      cost: 10_000_000_000, affects: 'all',      mult: 3,   req: () => G.soulsTotal >= 1_000_000_000 },
];

function upgradeMultiplierFor(target) {
  let mult = 1;
  for (const u of UPGRADES) {
    if (!G.upgrades.has(u.id)) continue;
    if (u.affects === target || u.affects === 'all') mult *= u.mult;
  }
  return mult;
}

function isUpgradeVisible(u) {
  return !G.upgrades.has(u.id) && u.req();
}

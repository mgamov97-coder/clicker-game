// ===== WEB AUDIO API SOUNDS =====
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type, duration, gainVal, detune = 0) {
  if (!soundEnabled) return;
  try {
    const ac  = getAudioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type      = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    osc.detune.setValueAtTime(detune, ac.currentTime);
    gain.gain.setValueAtTime(gainVal, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) {}
}

const Sounds = {
  click() {
    playTone(220, 'sine', 0.08, 0.15);
    playTone(330, 'sine', 0.05, 0.08, -20);
  },
  buy() {
    playTone(440, 'triangle', 0.1, 0.2);
    setTimeout(() => playTone(660, 'triangle', 0.12, 0.15), 60);
    setTimeout(() => playTone(880, 'triangle', 0.15, 0.1), 120);
  },
  achievement() {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 0.25, 0.12), i * 80);
    });
  },
  prestige() {
    [110, 138, 165, 220, 277, 330].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sawtooth', 0.3, 0.08), i * 60);
    });
  },
  spell() {
    playTone(180, 'sawtooth', 0.05, 0.1);
    playTone(360, 'sine', 0.3, 0.15, 10);
    setTimeout(() => playTone(540, 'sine', 0.2, 0.1), 80);
  },
  event() {
    playTone(800, 'sine', 0.05, 0.15);
    setTimeout(() => playTone(1000, 'sine', 0.15, 0.2), 50);
  },
};

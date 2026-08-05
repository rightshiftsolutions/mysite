/**
 * Premium Game & UI Sound Effects
 * Generates all sounds with the Web Audio API oscillator/noise nodes,
 * so no external mp3/wav assets are needed and nothing extra to load.
 * Respects a mute toggle stored in localStorage ('quiz_sound_muted').
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function isMuted() {
  return localStorage.getItem('quiz_sound_muted') === '1';
}

function setMuted(val) {
  localStorage.setItem('quiz_sound_muted', val ? '1' : '0');
}

function tone(freq, duration, type = 'sine', delay = 0, gainVal = 0.18) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  const startTime = ctx.currentTime + delay;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

// A short filtered-noise "tick/click" burst — used for crisp UI clicks and risers
function noiseBurst(duration = 0.05, delay = 0, gainVal = 0.12, filterFreq = 2200) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = filterFreq;

  const gain = ctx.createGain();
  const startTime = ctx.currentTime + delay;
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(startTime);
  noise.stop(startTime + duration + 0.02);
}

// Quick pitch-sweep — great for whooshes / sting risers
function sweep(freqFrom, freqTo, duration, type = 'sine', delay = 0, gainVal = 0.16) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  const startTime = ctx.currentTime + delay;
  osc.frequency.setValueAtTime(freqFrom, startTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), startTime + duration);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export const gameSound = {
  isMuted,
  setMuted,
  toggle() {
    const next = !isMuted();
    setMuted(next);
    return next;
  },

  // ---------- General UI feedback (used site-wide on buttons/links) ----------
  uiClick() {
    noiseBurst(0.045, 0, 0.1, 2600);
    tone(720, 0.05, 'triangle', 0, 0.05);
  },

  uiHover() {
    tone(980, 0.035, 'sine', 0, 0.028);
  },

  // ---------- Quiz / Game sounds ----------

  // soft click when an option is picked
  select() {
    tone(560, 0.09, 'triangle', 0, 0.16);
    noiseBurst(0.03, 0, 0.06, 3000);
  },

  // navigating between questions
  advance() {
    tone(440, 0.1, 'sine');
    tone(660, 0.1, 'sine', 0.08);
  },

  // lock-in sting (KBC style "final answer" confirm)
  lockIn() {
    tone(392, 0.12, 'sawtooth');
    tone(523, 0.12, 'sawtooth', 0.12);
    tone(659, 0.18, 'sawtooth', 0.24);
  },

  // correct answer chime — bright ascending major triad
  correct() {
    tone(659, 0.14, 'sine', 0, 0.16);
    tone(831, 0.14, 'sine', 0.08, 0.16);
    tone(988, 0.24, 'sine', 0.16, 0.18);
  },

  // wrong answer buzzer — descending dissonant tone
  wrong() {
    tone(220, 0.26, 'sawtooth', 0, 0.16);
    tone(146, 0.36, 'sawtooth', 0.14, 0.16);
  },

  // last-10-seconds tick
  tick(urgent = false) {
    tone(urgent ? 880 : 700, 0.06, 'square', 0, urgent ? 0.14 : 0.08);
  },

  // full quiz submitted successfully
  submitted() {
    tone(523, 0.12, 'sine');
    tone(659, 0.12, 'sine', 0.12);
    tone(784, 0.12, 'sine', 0.24);
    tone(1046, 0.3, 'sine', 0.36);
  },

  // game over sting (KBC elimination)
  gameOver() {
    tone(311, 0.3, 'sawtooth');
    tone(233, 0.3, 'sawtooth', 0.25);
    tone(155, 0.5, 'sawtooth', 0.5, 0.2);
  },

  // Bonus Points: coin/gem collect blip
  coin() {
    tone(988, 0.07, 'square', 0, 0.12);
    tone(1318, 0.12, 'square', 0.06, 0.12);
  },

  // No Negative Marking: soft, friendly "all good" ding
  softDing() {
    tone(660, 0.16, 'sine', 0, 0.13);
    tone(880, 0.16, 'sine', 0.05, 0.09);
  },

  // Negative Marking: sharper risk/warning blip
  riskWarning() {
    tone(180, 0.18, 'square', 0, 0.16);
    noiseBurst(0.05, 0, 0.06, 800);
  },

  // KBC: tension "locking in" sting while the answer is being verified
  locking() {
    tone(349, 0.5, 'triangle', 0, 0.1);
  },

  // Game start fanfare (used by quiz start + lucky spinner load)
  fanfare() {
    tone(523, 0.14, 'triangle');
    tone(659, 0.14, 'triangle', 0.12);
    tone(784, 0.22, 'triangle', 0.24);
    sweep(300, 900, 0.3, 'sawtooth', 0, 0.05);
  },

  // Big celebration flourish — spinner winner reveal / game completion
  celebration() {
    tone(523, 0.1, 'sine');
    tone(659, 0.1, 'sine', 0.1);
    tone(784, 0.1, 'sine', 0.2);
    tone(1046, 0.12, 'sine', 0.3);
    tone(1318, 0.35, 'sine', 0.42);
    sweep(200, 1400, 0.4, 'triangle', 0, 0.04);
  },

  // Lucky spinner — accelerating wheel tick
  spinTick() {
    tone(500, 0.03, 'square', 0, 0.06);
  },

  // Modal / panel open
  open() {
    sweep(300, 700, 0.15, 'sine', 0, 0.08);
  },

  // Modal / panel close
  close() {
    sweep(700, 300, 0.12, 'sine', 0, 0.07);
  },

  // Toggle switch flip
  toggleSound() {
    tone(800, 0.04, 'triangle', 0, 0.08);
  },

  // Page navigation whoosh
  pageTransition() {
    noiseBurst(0.12, 0, 0.05, 1200);
  }
};

export default gameSound;

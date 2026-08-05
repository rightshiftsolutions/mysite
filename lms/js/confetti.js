/**
 * Lightweight DOM-based confetti / particle burst utility.
 * No external library — small absolutely-positioned divs animated with
 * CSS keyframes (injected once). Used across the Games module (quiz
 * results, KBC correct answers, Lucky Spinner winner reveal, etc).
 */

let stylesInjected = false;

function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    .confetti-holder {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    .confetti-piece {
      position: absolute;
      will-change: transform, opacity;
      animation-fill-mode: forwards;
    }
    @keyframes confetti-fall {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translate(var(--dx), var(--dy)) rotate(var(--rot));
        opacity: 0;
      }
    }
    .particle-burst-piece {
      position: absolute;
      will-change: transform, opacity;
      animation: particle-pop var(--dur, 0.7s) ease-out forwards;
    }
    @keyframes particle-pop {
      0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; }
      60% { opacity: 1; }
      100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Full confetti burst — rectangular pieces falling with gravity + spin.
 * Great for game completion / KBC correct answers / spinner winner.
 */
export function burstConfetti({
  count = 70,
  colors = ['#f5c542', '#4f7cff', '#8b5cf6', '#22c55e', '#ef4444', '#ffffff'],
  originX = 50,
  originY = 30,
  spread = 100,
  duration = 1600
} = {}) {
  injectStyles();

  const holder = document.createElement('div');
  holder.className = 'confetti-holder';
  document.body.appendChild(holder);

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'confetti-piece';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const width = 5 + Math.random() * 6;
    const height = width * (0.35 + Math.random() * 0.4);
    const dx = (Math.random() - 0.5) * spread * 5;
    const dy = 250 + Math.random() * 350;
    const rot = Math.random() * 900 - 450;
    const delay = Math.random() * 0.2;
    const dur = 1.1 + Math.random() * 0.9;

    p.style.left = `${originX}%`;
    p.style.top = `${originY}%`;
    p.style.width = `${width}px`;
    p.style.height = `${height}px`;
    p.style.background = color;
    p.style.borderRadius = '2px';
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);
    p.style.setProperty('--rot', `${rot}deg`);
    p.style.animation = `confetti-fall ${dur}s ease-out ${delay}s forwards`;

    holder.appendChild(p);
  }

  setTimeout(() => holder.remove(), duration);
}

/**
 * Small radial particle pop — good for gem/coin bursts on Bonus Points,
 * or a quick sparkle on correct answers, anchored to a specific element.
 */
export function burstAt(target, {
  count = 14,
  colors = ['#facc15', '#f59e0b', '#fde68a'],
  glyph = null,
  radius = 60,
  duration = 700
} = {}) {
  injectStyles();
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const originXpx = rect.left + rect.width / 2;
  const originYpx = rect.top + rect.height / 2;

  const holder = document.createElement('div');
  holder.className = 'confetti-holder';
  document.body.appendChild(holder);

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = radius * (0.6 + Math.random() * 0.8);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const dur = (duration / 1000) * (0.8 + Math.random() * 0.4);

    const p = document.createElement('span');
    p.className = 'particle-burst-piece';
    p.style.left = `${originXpx}px`;
    p.style.top = `${originYpx}px`;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);
    p.style.setProperty('--dur', `${dur}s`);

    if (glyph) {
      p.textContent = glyph;
      p.style.fontSize = '16px';
      p.style.lineHeight = '1';
    } else {
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = '7px';
      p.style.height = '7px';
      p.style.borderRadius = '50%';
      p.style.background = color;
      p.style.boxShadow = `0 0 6px ${color}`;
    }

    holder.appendChild(p);
  }

  setTimeout(() => holder.remove(), duration + 150);
}

export default { burstConfetti, burstAt };

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
document.getElementById('year').textContent = new Date().getFullYear();

const dockTiles = document.querySelectorAll('.dock-tile');
const heroPreview = document.getElementById('heroPreview');
const heroPreviewArt = document.getElementById('heroPreviewArt');
const heroPreviewTitle = document.getElementById('heroPreviewTitle');
const heroPreviewTag = document.getElementById('heroPreviewTag');
const heroPreviewLink = document.getElementById('heroPreviewLink');

if (heroPreview && dockTiles.length) {
  let activeTile = null;

  const applyPreview = (tile) => {
    heroPreviewArt.className = `hero-preview-art ${tile.dataset.previewArt}`;
    heroPreviewTitle.textContent = tile.dataset.previewTitle;
    heroPreviewTag.textContent = tile.dataset.previewTag;
    heroPreviewLink.href = tile.href;
    heroPreviewLink.setAttribute('aria-label', `Open ${tile.dataset.previewTitle}`);
  };

  const showPreview = (tile) => {
    if (!tile || !tile.dataset.previewArt || tile === activeTile) return;
    activeTile = tile;
    heroPreview.classList.add('is-switching');
    window.setTimeout(() => {
      applyPreview(tile);
      heroPreview.classList.remove('is-switching');
    }, 180);
  };

  dockTiles.forEach((tile) => {
    tile.addEventListener('mouseenter', () => showPreview(tile));
    tile.addEventListener('focus', () => showPreview(tile));
  });

  activeTile = dockTiles[0];
}

const dockRow = document.querySelector('.game-dock-row');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (dockRow && !reduceMotion) {
  const DEADZONE = 0.15;
  const MAX_SHIFT_X = 4.5;
  const MAX_SHIFT_Y = 2.5;
  const EASE = 0.08;

  let mouseX = 0;
  let mouseY = 0;
  let gamepadIndex = null;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener(
    'mousemove',
    (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true }
  );

  window.addEventListener('gamepadconnected', (event) => {
    gamepadIndex = event.gamepad.index;
  });

  window.addEventListener('gamepaddisconnected', (event) => {
    if (gamepadIndex === event.gamepad.index) gamepadIndex = null;
  });

  function readGamepadAxis() {
    if (gamepadIndex === null || !navigator.getGamepads) return null;
    const pad = navigator.getGamepads()[gamepadIndex];
    if (!pad) return null;
    const axisX = pad.axes[0] || 0;
    const axisY = pad.axes[1] || 0;
    const dpadLeft = pad.buttons[14] && pad.buttons[14].pressed;
    const dpadRight = pad.buttons[15] && pad.buttons[15].pressed;
    let x = Math.abs(axisX) > DEADZONE ? axisX : 0;
    if (dpadLeft) x = -1;
    if (dpadRight) x = 1;
    const y = Math.abs(axisY) > DEADZONE ? axisY : 0;
    if (x === 0 && y === 0 && !dpadLeft && !dpadRight) return null;
    return { x, y };
  }

  function tick() {
    const gamepadInput = readGamepadAxis();
    const targetX = gamepadInput ? gamepadInput.x : mouseX;
    const targetY = gamepadInput ? gamepadInput.y : mouseY * 0.5;

    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    dockRow.style.setProperty('--parallax-x', `${(currentX * MAX_SHIFT_X).toFixed(2)}%`);
    dockRow.style.setProperty('--parallax-y', `${(currentY * MAX_SHIFT_Y).toFixed(2)}%`);

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

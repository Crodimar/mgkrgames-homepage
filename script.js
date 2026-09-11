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

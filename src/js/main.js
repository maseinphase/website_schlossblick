/**
 * Ferienwohnung Schlossblick - Haupt-Interaktionsskript
 * Steuerung von Navigation, Filtergalerie, Lightbox, Scrollspy und Kalender.
 */

import { BookingCalendar } from './calendar.js';
import { CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileMenu();
  initScrollSpy();
  initGalleryLightbox();
  initDestinationFilter();
  initCalendar();
  initSmoothScroll();
  updateDynamicContent();
});

/**
 * Header Schatten bei Scroll
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Mobile Navigation (Hamburger Menu)
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
  });

  // Schließen bei Klick auf einen Navigationslink
  mobileNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Scrollspy: Hebt den aktiven Menüpunkt beim Scrollen hervor
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/**
 * Fotogalerie: Filterung nach Raumkategorien & Barrierefreie Lightbox
 */
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let activeIndex = 0;
  let visibleItems = Array.from(galleryItems);

  // 1. Kategoriefilter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });

      visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
    });
  });

  // 2. Lightbox öffnen
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const currentList = visibleItems.length > 0 ? visibleItems : Array.from(galleryItems);
      activeIndex = currentList.indexOf(item);
      openLightbox(currentList[activeIndex]);
    });
  });

  function openLightbox(item) {
    if (!item || !lightbox || !lightboxImg) return;
    const img = item.querySelector('img');
    const caption = item.getAttribute('data-caption') || img.alt;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    if (lightboxCaption) lightboxCaption.textContent = caption;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    const list = visibleItems.length > 0 ? visibleItems : Array.from(galleryItems);
    activeIndex = (activeIndex + 1) % list.length;
    openLightbox(list[activeIndex]);
  }

  function showPrev() {
    const list = visibleItems.length > 0 ? visibleItems : Array.from(galleryItems);
    activeIndex = (activeIndex - 1 + list.length) % list.length;
    openLightbox(list[activeIndex]);
  }

  if (lightboxClose) lightboxClose.onclick = closeLightbox;
  if (lightboxNext) lightboxNext.onclick = showNext;
  if (lightboxPrev) lightboxPrev.onclick = showPrev;

  // Tastaturnavigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Klick außerhalb des Bildes schließt die Lightbox
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
}

/**
 * Initialisiert den Buchungskalender
 */
function initCalendar() {
  new BookingCalendar('calendar-root', 'inquiry-form');
}

/**
 * Sanftes Scrollen zu Zielankern
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Aktualisiert dynamische Angaben wie Jahreszahl im Footer
 */
function updateDynamicContent() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/**
 * Ausflugsziele: Filterung nach Themenkategorien
 */
function initDestinationFilter() {
  const filterBtns = document.querySelectorAll('.dest-filter-btn');
  const destCards = document.querySelectorAll('.destination-card');

  if (!filterBtns.length || !destCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      destCards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const categories = cat.split(/\s+/);
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

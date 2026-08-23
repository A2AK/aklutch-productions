const header = document.querySelector('[data-nav]');
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
});

toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (toggle) toggle.textContent = 'Menu';
  });
});

const initializeCarousel = (carousel, initialIndex = 0) => {
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const dots = [...carousel.querySelectorAll('[data-carousel-dot]')];
  const previous = carousel.querySelector('[data-carousel-previous]');
  const next = carousel.querySelector('[data-carousel-next]');
  let activeIndex = 0;
  let pointerStartX = null;

  const showSlide = (requestedIndex) => {
    activeIndex = (requestedIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle('is-active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  previous?.addEventListener('click', () => showSlide(activeIndex - 1));
  next?.addEventListener('click', () => showSlide(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showSlide(activeIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(activeIndex + 1);
    }
  });

  carousel.addEventListener('pointerdown', (event) => {
    pointerStartX = event.clientX;
  });

  carousel.addEventListener('pointerup', (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) < 48) return;
    showSlide(activeIndex + (distance < 0 ? 1 : -1));
  });

  carousel.addEventListener('pointercancel', () => {
    pointerStartX = null;
  });

  showSlide(initialIndex);
  const api = {
    getActiveIndex: () => activeIndex,
    showSlide,
  };
  carousel.carouselApi = api;
  return api;
};

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  initializeCarousel(carousel);
});

document.addEventListener('click', (event) => {
  const expandButton = event.target.closest('[data-carousel-expand]');
  if (!expandButton) return;

  const sourceCarousel = expandButton.closest('[data-carousel]');
  if (!sourceCarousel?.carouselApi) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'photo-dialog';
  dialog.setAttribute('aria-label', 'Expanded July show photo carousel');

  const shell = document.createElement('div');
  shell.className = 'photo-dialog-shell';

  const closeButton = document.createElement('button');
  closeButton.className = 'photo-dialog-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close expanded photos');
  closeButton.textContent = '×';

  const expandedCarousel = sourceCarousel.cloneNode(true);
  expandedCarousel.classList.remove('event-flyer', 'event-photo');
  expandedCarousel.classList.add('carousel-expanded');
  expandedCarousel.setAttribute('aria-label', 'Expanded photos from the July 18 comedy show');
  expandedCarousel.querySelector('[data-carousel-expand]')?.remove();

  shell.append(expandedCarousel, closeButton);
  dialog.append(shell);
  document.body.append(dialog);

  initializeCarousel(expandedCarousel, sourceCarousel.carouselApi.getActiveIndex());

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (dialogEvent) => {
    if (dialogEvent.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    sourceCarousel.carouselApi.showSlide(expandedCarousel.carouselApi.getActiveIndex());
    expandButton.setAttribute('aria-expanded', 'false');
    dialog.remove();
    expandButton.focus();
  }, { once: true });

  expandButton.setAttribute('aria-expanded', 'true');
  dialog.showModal();
  closeButton.focus();
});

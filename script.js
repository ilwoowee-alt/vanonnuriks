const menuToggle = document.querySelector('.menu-toggle');
const gnb = document.querySelector('.gnb');

if (menuToggle && gnb) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    gnb.classList.toggle('is-open');
  });
}

const slides = Array.from(document.querySelectorAll('.hero-slide'));
const dotsWrap = document.getElementById('dots');
const prevBtn = document.getElementById('prevSlide');
const nextBtn = document.getElementById('nextSlide');

let current = 0;
let timer;

function renderDots() {
  if (!dotsWrap) return;
  dotsWrap.innerHTML = '';
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `${idx + 1}번 배너`);
    if (idx === current) {
      dot.classList.add('active');
    }
    dot.addEventListener('click', () => {
      showSlide(idx);
      restartAuto();
    });
    dotsWrap.appendChild(dot);
  });
}

function showSlide(index) {
  if (!slides.length) return;
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, idx) => {
    slide.classList.toggle('is-active', idx === current);
  });
  const dots = dotsWrap ? dotsWrap.querySelectorAll('button') : [];
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === current);
  });
}

function startAuto() {
  timer = window.setInterval(() => {
    showSlide(current + 1);
  }, 5500);
}

function restartAuto() {
  window.clearInterval(timer);
  startAuto();
}

if (slides.length) {
  renderDots();
  showSlide(0);
  startAuto();

  prevBtn?.addEventListener('click', () => {
    showSlide(current - 1);
    restartAuto();
  });

  nextBtn?.addEventListener('click', () => {
    showSlide(current + 1);
    restartAuto();
  });
}

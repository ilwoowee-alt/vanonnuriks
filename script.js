const menuToggle = document.querySelector('.menu-toggle');
const gnb = document.querySelector('.gnb');

if (menuToggle && gnb) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    gnb.classList.toggle('is-open');
  });

  const gnbLinks = gnb.querySelectorAll('a');
  gnbLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (!window.matchMedia('(max-width: 760px)').matches) return;
      gnb.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const submenuToggles = Array.from(document.querySelectorAll('.submenu-toggle'));

submenuToggles.forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    if (!window.matchMedia('(max-width: 760px)').matches) {
      return;
    }

    event.preventDefault();
    const parent = toggle.closest('.has-submenu');
    if (!parent) {
      return;
    }

    const opened = parent.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(opened));
  });
});

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

const noticeItems = Array.from(document.querySelectorAll('#noticeAccordion li'));

noticeItems.forEach((item) => {
  const btn = item.querySelector('.notice-title');
  const detail = item.querySelector('.notice-detail');
  if (detail) detail.hidden = true;
  btn?.addEventListener('click', () => {
    const opened = item.classList.contains('open');
    noticeItems.forEach((x) => {
      x.classList.remove('open');
      const d = x.querySelector('.notice-detail');
      if (d) d.hidden = true;
    });
    if (!opened) {
      item.classList.add('open');
      if (detail) detail.hidden = false;
    }
  });
});

const copyEmailBtn = document.getElementById('copyEmailBtn');
const contactEmailText = document.getElementById('contactEmailText');

copyEmailBtn?.addEventListener('click', async () => {
  const text = contactEmailText?.textContent?.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyEmailBtn.textContent = '복사됨';
  } catch {
    const temp = document.createElement('input');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
    copyEmailBtn.textContent = '복사됨';
  }

  window.setTimeout(() => {
    copyEmailBtn.textContent = '복사';
  }, 1500);
});

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

function formatNoticeDate(dateText) {
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return dateText || '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function renderHomeNoticeFromBoard() {
  const list = document.getElementById('noticeAccordion');
  if (!list) return;

  const storageKey = 'onnuri_notice_posts_v1';
  let posts = [];
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    posts = Array.isArray(parsed) ? parsed : [];
  } catch {
    posts = [];
  }

  const recent = posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);

  if (!recent.length) {
    list.innerHTML = '<li><p class="notice-detail" style="display:block;">등록된 공지사항이 없습니다.</p></li>';
    return;
  }

  list.innerHTML = recent
    .map((post) => {
      const title = String(post.title || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      const body = String(post.body || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
      const date = formatNoticeDate(post.date);
      return `
        <li>
          <button type="button" class="notice-title"><span>[공지]</span> ${title}</button>
          <time datetime="${post.date || ''}">${date}</time>
          <p class="notice-detail" hidden>${body}</p>
        </li>
      `;
    })
    .join('');

  const noticeItems = Array.from(list.querySelectorAll('li'));
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
}

renderHomeNoticeFromBoard();

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

function renderHomeNewsFromBoard() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  const storageKey = 'onnuri_news_posts_v1';
  let posts = [];
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    posts = Array.isArray(parsed) ? parsed : [];
  } catch {
    posts = [];
  }

  const recent = posts
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  if (!recent.length) {
    grid.innerHTML = '<article><h4 style="padding:1rem;">등록된 학교소식이 없습니다.</h4></article>';
    return;
  }

  const formatDate = (dateText) => {
    const d = new Date(dateText);
    if (Number.isNaN(d.getTime())) return dateText || '';
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  grid.innerHTML = recent
    .map((post) => {
      const title = String(post.title || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      const desc = String(post.body || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
      const images = Array.isArray(post.images) ? post.images : (post.image ? [post.image] : []);
      const image = String(images[0] || '');
      const date = formatDate(post.date);
      return `
        <article data-news-title="${title}" data-news-desc="${desc}" data-news-image="${image}" data-news-images="${encodeURIComponent(JSON.stringify(images))}">
          <img src="${image}" alt="${title}" />
          <h4>${title}</h4>
          <p>${date}</p>
        </article>
      `;
    })
    .join('');

  const modal = document.getElementById('homeNewsModal');
  const modalImage = document.getElementById('homeNewsModalImage');
  const modalTitle = document.getElementById('homeNewsModalTitle');
  const modalDesc = document.getElementById('homeNewsModalDesc');
  const modalClose = document.getElementById('homeNewsModalClose');
  const modalPrev = document.getElementById('homeNewsPrev');
  const modalNext = document.getElementById('homeNewsNext');
  const modalCount = document.getElementById('homeNewsModalCount');

  let currentImages = [];
  let currentIndex = 0;

  const renderModalImage = () => {
    if (!modalImage || !modalCount || !currentImages.length) return;
    modalImage.src = currentImages[currentIndex];
    modalCount.textContent = `${currentIndex + 1} / ${currentImages.length}`;
  };

  const closeModal = () => {
    modal?.classList.remove('show');
  };

  grid.querySelectorAll('article').forEach((card) => {
    const img = card.querySelector('img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      if (!modal || !modalImage || !modalTitle || !modalDesc) return;
      const encoded = card.getAttribute('data-news-images') || '';
      try {
        currentImages = JSON.parse(decodeURIComponent(encoded));
      } catch {
        currentImages = [];
      }
      if (!Array.isArray(currentImages) || !currentImages.length) {
        currentImages = [card.getAttribute('data-news-image') || ''];
      }
      currentIndex = 0;
      renderModalImage();
      modalTitle.textContent = card.getAttribute('data-news-title') || '학교소식';
      modalDesc.textContent = card.getAttribute('data-news-desc') || '';
      modal.classList.add('show');
    });
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  modalPrev?.addEventListener('click', () => {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    renderModalImage();
  });

  modalNext?.addEventListener('click', () => {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    renderModalImage();
  });
}
renderHomeNewsFromBoard();





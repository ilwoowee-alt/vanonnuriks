const menuToggle = document.querySelector('.menu-toggle');
const gnb = document.querySelector('.gnb');

if (menuToggle && gnb) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    gnb.classList.toggle('is-open');
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

const noticeStorageKey = 'vanonnuri_notice_items_v1';
const noticeList = document.getElementById('noticeList');
const noticeForm = document.getElementById('noticeForm');
const openNoticeFormBtn = document.getElementById('openNoticeForm');
const cancelNoticeFormBtn = document.getElementById('cancelNoticeForm');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminStatus = document.getElementById('adminStatus');
const noticeCategoryInput = document.getElementById('noticeCategory');
const noticeTitleInput = document.getElementById('noticeTitle');
const noticeDateInput = document.getElementById('noticeDate');
const noticeContentInput = document.getElementById('noticeContent');
const noticeImageInput = document.getElementById('noticeImage');
const noticeViewer = document.getElementById('noticeViewer');
const noticeViewerTitle = document.getElementById('noticeViewerTitle');
const noticeViewerMeta = document.getElementById('noticeViewerMeta');
const noticeViewerContent = document.getElementById('noticeViewerContent');
const noticeViewerImage = document.getElementById('noticeViewerImage');
const adminSessionKey = 'vanonnuri_admin_auth_v1';
const adminCredential = {
  id: 'admin',
  password: 'onnuri2026!',
};

const defaultNotices = [
  {
    id: 'n1',
    category: '학사',
    title: '2026 봄학기 개강 안내',
    date: '2026-03-10',
    content: '2026 봄학기 수업이 시작됩니다. 반별 안내를 확인해 주세요.',
    image: '',
  },
  {
    id: 'n2',
    category: '모집',
    title: '신입생 레벨테스트 신청',
    date: '2026-03-05',
    content: '신입생 반 배정을 위한 레벨테스트 신청을 받습니다.',
    image: '',
  },
  {
    id: 'n3',
    category: '행사',
    title: '한글날 글쓰기 대회 참가 접수',
    date: '2026-02-25',
    content: '한글날 행사 글쓰기 대회 참가 신청을 진행합니다.',
    image: '',
  },
  {
    id: 'n4',
    category: '안내',
    title: '학부모 오리엔테이션 일정 공지',
    date: '2026-02-20',
    content: '학부모 오리엔테이션 일정을 확인해 주세요.',
    image: '',
  },
];

function loadNotices() {
  try {
    const raw = window.localStorage.getItem(noticeStorageKey);
    if (!raw) return defaultNotices;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultNotices;
  } catch {
    return defaultNotices;
  }
}

let notices = loadNotices();

function saveNotices() {
  window.localStorage.setItem(noticeStorageKey, JSON.stringify(notices));
}

function formatDate(dateStr) {
  return dateStr.replaceAll('-', '.');
}

function sortNotices(items) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function renderNoticeViewer(notice) {
  if (!noticeViewer || !noticeViewerTitle || !noticeViewerMeta || !noticeViewerContent || !noticeViewerImage) return;

  noticeViewer.hidden = false;
  noticeViewerTitle.textContent = notice.title;
  noticeViewerMeta.textContent = `[${notice.category}] ${formatDate(notice.date)}`;
  noticeViewerContent.textContent = notice.content;

  if (notice.image) {
    noticeViewerImage.src = notice.image;
    noticeViewerImage.hidden = false;
  } else {
    noticeViewerImage.hidden = true;
    noticeViewerImage.removeAttribute('src');
  }
}

function renderNoticeList() {
  if (!noticeList) return;

  const sorted = sortNotices(notices);
  noticeList.innerHTML = '';

  sorted.forEach((notice) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    const label = document.createElement('span');
    const time = document.createElement('time');
    const deleteBtn = document.createElement('button');

    label.textContent = `[${notice.category}]`;
    link.href = '#';
    link.appendChild(label);
    link.append(` ${notice.title}`);

    link.addEventListener('click', (event) => {
      event.preventDefault();
      renderNoticeViewer(notice);
    });

    time.dateTime = notice.date;
    time.textContent = formatDate(notice.date);

    deleteBtn.type = 'button';
    deleteBtn.className = 'notice-delete';
    deleteBtn.textContent = '삭제';
    deleteBtn.addEventListener('click', () => {
      notices = notices.filter((n) => n.id !== notice.id);
      saveNotices();
      renderNoticeList();
      if (noticeViewer && !noticeViewer.hidden && noticeViewerTitle?.textContent === notice.title) {
        noticeViewer.hidden = true;
      }
    });

    li.appendChild(link);
    li.appendChild(time);
    li.appendChild(deleteBtn);
    noticeList.appendChild(li);
  });

  if (sorted[0]) {
    renderNoticeViewer(sorted[0]);
  }
}

function readImageAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

if (openNoticeFormBtn && noticeForm) {
  openNoticeFormBtn.addEventListener('click', () => {
    if (!isAdminLoggedIn()) {
      window.alert('관리자 로그인 후 공지를 등록할 수 있습니다.');
      return;
    }
    noticeForm.hidden = !noticeForm.hidden;
  });
}

cancelNoticeFormBtn?.addEventListener('click', () => {
  if (!noticeForm) return;
  noticeForm.hidden = true;
});

noticeForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isAdminLoggedIn()) {
    window.alert('관리자만 공지를 등록할 수 있습니다.');
    return;
  }
  if (!noticeCategoryInput || !noticeTitleInput || !noticeDateInput || !noticeContentInput) return;

  const imageFile = noticeImageInput?.files?.[0];
  const imageDataUrl = await readImageAsDataUrl(imageFile);

  const newNotice = {
    id: String(Date.now()),
    category: noticeCategoryInput.value.trim(),
    title: noticeTitleInput.value.trim(),
    date: noticeDateInput.value,
    content: noticeContentInput.value.trim(),
    image: imageDataUrl,
  };

  if (!newNotice.category || !newNotice.title || !newNotice.date || !newNotice.content) {
    return;
  }

  notices.push(newNotice);
  saveNotices();
  renderNoticeList();

  noticeForm.reset();
  noticeForm.hidden = true;
});

if (noticeList) {
  renderNoticeList();
}

function isAdminLoggedIn() {
  return window.sessionStorage.getItem(adminSessionKey) === '1';
}

function renderAdminUi() {
  const loggedIn = isAdminLoggedIn();
  if (openNoticeFormBtn) openNoticeFormBtn.hidden = !loggedIn;
  if (adminLoginBtn) adminLoginBtn.hidden = loggedIn;
  if (adminLogoutBtn) adminLogoutBtn.hidden = !loggedIn;
  if (adminStatus) {
    adminStatus.textContent = loggedIn ? '관리자 로그인됨' : '관리자 로그아웃 상태';
  }
  if (!loggedIn && noticeForm) {
    noticeForm.hidden = true;
  }
}

adminLoginBtn?.addEventListener('click', () => {
  const id = window.prompt('관리자 아이디를 입력하세요');
  if (!id) return;
  const password = window.prompt('관리자 비밀번호를 입력하세요');
  if (!password) return;

  if (id.trim() === adminCredential.id && password === adminCredential.password) {
    window.sessionStorage.setItem(adminSessionKey, '1');
    renderAdminUi();
    window.alert('관리자 로그인에 성공했습니다.');
  } else {
    window.alert('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
});

adminLogoutBtn?.addEventListener('click', () => {
  window.sessionStorage.removeItem(adminSessionKey);
  renderAdminUi();
});

renderAdminUi();

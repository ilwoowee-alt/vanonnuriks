const STORAGE_KEY = 'onnuri_news_posts_v1';
const ADMIN_KEY = 'onnuri_news_admin_v1';
const ADMIN_PASSWORD = 'onnuri2026';

const adminBtn = document.getElementById('newsAdminToggleBtn');
const writeBox = document.getElementById('newsWriteBox');
const grid = document.getElementById('newsGrid');
const titleInput = document.getElementById('newsTitle');
const bodyInput = document.getElementById('newsBody');
const imageInput = document.getElementById('newsImage');
const saveBtn = document.getElementById('saveNewsBtn');
const cancelBtn = document.getElementById('cancelNewsEditBtn');
const photoModal = document.getElementById('photoModal');
const photoModalImage = document.getElementById('photoModalImage');
const photoModalTitle = document.getElementById('photoModalTitle');
const photoModalDesc = document.getElementById('photoModalDesc');
const photoModalClose = document.getElementById('photoModalClose');
const photoModalPrev = document.getElementById('photoModalPrev');
const photoModalNext = document.getElementById('photoModalNext');
const photoModalCount = document.getElementById('photoModalCount');

let editingId = null;
let editingImages = [];
let modalImages = [];
let modalIndex = 0;

function defaults() {
  return [
    {
      id: crypto.randomUUID(),
      title: '학급별 발표 수업',
      body: '학생들이 준비한 발표를 나누며 자신감을 키웠습니다.',
      images: ['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80'],
      date: '2026-03-08'
    },
    {
      id: crypto.randomUUID(),
      title: '전통문화 체험의 날',
      body: '다양한 전통문화 체험 활동을 진행했습니다.',
      images: ['https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=900&q=80'],
      date: '2026-02-22'
    }
  ];
}

function normalizePost(post) {
  const images = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  const normalized = images.length
    ? { ...post, images }
    : post.image
      ? { ...post, images: [post.image] }
      : { ...post, images: [] };

  const newInstrumentImage = 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=900&q=80';
  const title = String(normalized.title || '').trim();
  if (title.includes('전통문화 체험의 날')) {
    if (!Array.isArray(normalized.images)) normalized.images = [];
    if (!normalized.images.length) {
      normalized.images = [newInstrumentImage];
    } else {
      normalized.images[0] = newInstrumentImage;
    }
  }

  return normalized;
}

function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const d = defaults();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    return d;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed.map(normalizePost);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return [];
  }
}

function savePosts(posts) { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
function isAdmin() { return localStorage.getItem(ADMIN_KEY) === '1'; }
function fmt(dateText) { const d = new Date(dateText); if (Number.isNaN(d.getTime())) return dateText || ''; return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`; }

function render() {
  const posts = loadPosts().sort((a, b) => (a.date < b.date ? 1 : -1));
  const admin = isAdmin();
  adminBtn.textContent = admin ? '관리자 모드 종료' : '관리자 모드';
  writeBox.classList.toggle('show', admin);
  grid.classList.toggle('news-admin', admin);

  if (!posts.length) {
    grid.innerHTML = '<div class="empty">등록된 학교소식이 없습니다.</div>';
    return;
  }

  grid.innerHTML = posts.map((p) => {
    const cover = (p.images && p.images[0]) ? p.images[0] : '';
    const slideItems = (p.images || [])
      .map((img, idx) => `<img src="${img}" alt="${(p.title || '학교소식').replaceAll('"','&quot;')} ${idx + 1}" data-slide-index="${idx}" ${idx === 0 ? '' : 'hidden'} />`)
      .join('');
    return `
      <article class="news-card" data-id="${p.id}">
        <img src="${cover}" alt="${(p.title || '학교소식').replaceAll('"','&quot;')}" />
        <div class="news-body">
          <h3>${(p.title || '').replaceAll('<','&lt;').replaceAll('>','&gt;')}</h3>
          <p>${fmt(p.date)} · 사진 ${p.images.length}장</p>
          <p class="desc">${(p.body || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</p>
          <div class="news-gallery"${p.images.length ? '' : ' hidden'}>
            <div class="gallery-view">${slideItems}</div>
            <div class="gallery-controls">
              <button type="button" data-action="prev-photo">이전</button>
              <span class="gallery-count">1 / ${p.images.length || 1}</span>
              <button type="button" data-action="next-photo">다음</button>
            </div>
          </div>
          <div class="item-actions">
            <button type="button" data-action="edit">수정</button>
            <button type="button" data-action="delete">삭제</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  if (admin) {
    grid.querySelectorAll('.item-actions button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.news-card');
        const id = card?.getAttribute('data-id');
        if (!id) return;
        const action = btn.getAttribute('data-action');
        if (action === 'edit') startEdit(id);
        if (action === 'delete') removePost(id);
      });
    });
  }

  grid.querySelectorAll('.news-card').forEach((card) => {
    const gallery = card.querySelector('.news-gallery');
    if (!gallery || gallery.hasAttribute('hidden')) return;
    const slides = Array.from(gallery.querySelectorAll('.gallery-view img'));
    if (!slides.length) return;

    const count = gallery.querySelector('.gallery-count');
    let current = 0;

    const renderSlide = () => {
      slides.forEach((img, idx) => {
        img.hidden = idx !== current;
      });
      if (count) count.textContent = `${current + 1} / ${slides.length}`;
    };

    gallery.querySelector('[data-action="prev-photo"]')?.addEventListener('click', () => {
      current = (current - 1 + slides.length) % slides.length;
      renderSlide();
    });

    gallery.querySelector('[data-action="next-photo"]')?.addEventListener('click', () => {
      current = (current + 1) % slides.length;
      renderSlide();
    });

    slides.forEach((img, idx) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        openPhotoModal(card, slides.map((x) => x.getAttribute('src') || '').filter(Boolean), idx);
      });
    });
  });

  grid.querySelectorAll('.news-card > img').forEach((img) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      const card = img.closest('.news-card');
      if (!card) return;
      const galleryImages = Array.from(card.querySelectorAll('.gallery-view img'))
        .map((x) => x.getAttribute('src') || '')
        .filter(Boolean);
      openPhotoModal(card, galleryImages.length ? galleryImages : [img.getAttribute('src') || ''], 0);
    });
  });
}

function renderModalPhoto() {
  if (!photoModalImage || !photoModalCount || !modalImages.length) return;
  photoModalImage.src = modalImages[modalIndex];
  photoModalCount.textContent = `${modalIndex + 1} / ${modalImages.length}`;
}

function openPhotoModal(card, images, startIndex) {
  if (!photoModal || !photoModalImage || !photoModalTitle || !photoModalDesc) return;
  const title = card.querySelector('.news-body h3')?.textContent?.trim() || '학교소식';
  const desc = card.querySelector('.news-body .desc')?.textContent?.trim() || '';
  modalImages = Array.isArray(images) ? images.filter(Boolean) : [];
  if (!modalImages.length) return;
  modalIndex = Math.max(0, Math.min(startIndex, modalImages.length - 1));
  renderModalPhoto();
  photoModalTitle.textContent = title;
  photoModalDesc.textContent = desc;
  photoModal.classList.add('show');
}

function closePhotoModal() {
  if (!photoModal) return;
  photoModal.classList.remove('show');
}

function startEdit(id) {
  const post = loadPosts().find((x) => x.id === id);
  if (!post) return;
  editingId = id;
  editingImages = Array.isArray(post.images) ? post.images.slice(0, 5) : [];
  titleInput.value = post.title || '';
  bodyInput.value = post.body || '';
  imageInput.value = '';
  titleInput.focus();
}

function clearForm() {
  editingId = null;
  editingImages = [];
  titleInput.value = '';
  bodyInput.value = '';
  imageInput.value = '';
}

function removePost(id) {
  if (!window.confirm('이 소식을 삭제하시겠습니까?')) return;
  savePosts(loadPosts().filter((x) => x.id !== id));
  if (editingId === id) clearForm();
  render();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

adminBtn?.addEventListener('click', () => {
  if (isAdmin()) {
    localStorage.removeItem(ADMIN_KEY);
    clearForm();
    render();
    return;
  }
  const typed = window.prompt('관리자 비밀번호를 입력하세요.');
  if (typed === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, '1');
    render();
  } else if (typed !== null) {
    window.alert('비밀번호가 올바르지 않습니다.');
  }
});

saveBtn?.addEventListener('click', async () => {
  if (!isAdmin()) return;
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const files = Array.from(imageInput.files || []);

  if (!title || !body) {
    window.alert('제목과 설명을 입력해 주세요.');
    return;
  }

  if (files.length > 5) {
    window.alert('이미지는 최대 5장까지 업로드할 수 있습니다.');
    return;
  }

  let images = editingImages.slice(0, 5);

  if (files.length) {
    for (const file of files) {
      if (file.size > 3 * 1024 * 1024) {
        window.alert('이미지 파일은 각각 3MB 이하로 업로드해 주세요.');
        return;
      }
    }
    images = await Promise.all(files.map((file) => fileToDataUrl(file)));
  }

  if (!images.length) {
    window.alert('이미지를 최소 1장 선택해 주세요.');
    return;
  }

  const posts = loadPosts();
  if (editingId) {
    const i = posts.findIndex((x) => x.id === editingId);
    if (i >= 0) posts[i] = { ...posts[i], title, body, images };
  } else {
    posts.push({ id: crypto.randomUUID(), title, body, images, date: new Date().toISOString().slice(0, 10) });
  }

  savePosts(posts);
  clearForm();
  render();
});

cancelBtn?.addEventListener('click', clearForm);
photoModalClose?.addEventListener('click', closePhotoModal);
photoModal?.addEventListener('click', (event) => {
  if (event.target === photoModal) closePhotoModal();
});
photoModalPrev?.addEventListener('click', () => {
  if (!modalImages.length) return;
  modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
  renderModalPhoto();
});
photoModalNext?.addEventListener('click', () => {
  if (!modalImages.length) return;
  modalIndex = (modalIndex + 1) % modalImages.length;
  renderModalPhoto();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePhotoModal();
  if (event.key === 'ArrowLeft' && photoModal?.classList.contains('show')) {
    modalIndex = (modalIndex - 1 + modalImages.length) % modalImages.length;
    renderModalPhoto();
  }
  if (event.key === 'ArrowRight' && photoModal?.classList.contains('show')) {
    modalIndex = (modalIndex + 1) % modalImages.length;
    renderModalPhoto();
  }
});

render();


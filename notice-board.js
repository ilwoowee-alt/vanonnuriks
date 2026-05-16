const STORAGE_KEY = 'onnuri_notice_posts_v1';
const ADMIN_KEY = 'onnuri_notice_admin_v1';
const ADMIN_PASSWORD = 'onnuri2026';

const adminToggleBtn = document.getElementById('adminToggleBtn');
const writeBox = document.getElementById('writeBox');
const boardList = document.getElementById('boardList');
const titleInput = document.getElementById('noticeTitle');
const bodyInput = document.getElementById('noticeBody');
const saveNoticeBtn = document.getElementById('saveNoticeBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

let editingId = null;

function getDefaultPosts() {
  return [
    { id: crypto.randomUUID(), title: '봄방학 휴강 안내(3월21일,28일)', body: '3월21일,28일은 휴강으로 수업이 없습니다.', date: '2026-03-20' },
    { id: crypto.randomUUID(), title: '2026 봄학기 개강 안내', body: '2026 봄학기 수업이 시작됩니다. 반별 시간표와 준비물을 확인해 주세요.', date: '2026-03-10' },
    { id: crypto.randomUUID(), title: '신입생 레벨테스트 신청', body: '신입생 반 편성을 위한 레벨테스트 신청을 받고 있습니다.', date: '2026-03-05' }
  ];
}

function loadPosts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const defaults = getDefaultPosts();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function isAdmin() {
  return localStorage.getItem(ADMIN_KEY) === '1';
}

function formatDate(dateText) {
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return dateText;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .replaceAll('\n', '<br />');
}

function render() {
  const posts = loadPosts().sort((a, b) => (a.date < b.date ? 1 : -1));
  const adminMode = isAdmin();

  adminToggleBtn.textContent = adminMode ? '관리자 모드 종료' : '관리자 모드';
  writeBox.classList.toggle('show', adminMode);
  boardList.classList.toggle('board-admin', adminMode);

  if (!posts.length) {
    boardList.innerHTML = '<li class="empty">등록된 공지사항이 없습니다.</li>';
    return;
  }

  boardList.innerHTML = posts
    .map((post) => {
      return `
      <li class="board-item" data-id="${post.id}">
        <button type="button" class="board-title">
          <strong>${escapeHtml(post.title)}</strong>
          <span class="board-date">${formatDate(post.date)}</span>
        </button>
        <div class="board-content">
          <div>${escapeHtml(post.body)}</div>
          <div class="item-actions">
            <button type="button" data-action="edit">수정</button>
            <button type="button" data-action="delete">삭제</button>
          </div>
        </div>
      </li>`;
    })
    .join('');

  const titleButtons = boardList.querySelectorAll('.board-title');
  titleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.board-item');
      if (!item) return;
      item.classList.toggle('open');
    });
  });

  if (adminMode) {
    const actionButtons = boardList.querySelectorAll('.item-actions button');
    actionButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.board-item');
        if (!item) return;
        const id = item.getAttribute('data-id');
        if (!id) return;
        const action = btn.getAttribute('data-action');
        if (action === 'edit') startEdit(id);
        if (action === 'delete') deletePost(id);
      });
    });
  }
}

function clearForm() {
  editingId = null;
  titleInput.value = '';
  bodyInput.value = '';
}

function startEdit(id) {
  const post = loadPosts().find((x) => x.id === id);
  if (!post) return;
  editingId = id;
  titleInput.value = post.title;
  bodyInput.value = post.body;
  writeBox.classList.add('show');
  titleInput.focus();
}

function deletePost(id) {
  const ok = window.confirm('이 공지사항을 삭제하시겠습니까?');
  if (!ok) return;
  const posts = loadPosts().filter((x) => x.id !== id);
  savePosts(posts);
  if (editingId === id) clearForm();
  render();
}

adminToggleBtn?.addEventListener('click', () => {
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

saveNoticeBtn?.addEventListener('click', () => {
  if (!isAdmin()) return;

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    window.alert('제목과 내용을 입력해 주세요.');
    return;
  }

  const posts = loadPosts();

  if (editingId) {
    const idx = posts.findIndex((x) => x.id === editingId);
    if (idx >= 0) {
      posts[idx] = { ...posts[idx], title, body };
    }
  } else {
    posts.push({
      id: crypto.randomUUID(),
      title,
      body,
      date: new Date().toISOString().slice(0, 10)
    });
  }

  savePosts(posts);
  clearForm();
  render();
});

cancelEditBtn?.addEventListener('click', () => {
  clearForm();
});

render();

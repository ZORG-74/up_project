
const API_URL = 'http://127.0.0.1:8000';

const authButtons = document.getElementById('authButtons');
const userMenu = document.getElementById('userMenu');
const guestHero = document.getElementById('guestHero');
const authPrompt = document.getElementById('authPrompt');
const notesContainer = document.getElementById('notesContainer');
const userNameDisplay = document.getElementById('userNameDisplay');

let token = localStorage.getItem('access_token');

function updateUI() {
    const isLoggedIn = !!token;

    authButtons.style.display = isLoggedIn ? 'none' : 'flex';
    userMenu.style.display = isLoggedIn ? 'flex' : 'none';
    guestHero.style.display = isLoggedIn ? 'none' : 'block';
    authPrompt.style.display = isLoggedIn ? 'none' : 'flex';
    notesContainer.style.display = isLoggedIn ? 'block' : 'none';
    
    if (isLoggedIn) {
        const savedName = localStorage.getItem('user_name');
        if (savedName) {
            userNameDisplay.textContent = savedName;
        } else {
            fetchUserInfo();
        }
        loadNotes();
    }
}

async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_URL}/api/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            userNameDisplay.textContent = user.name;
            localStorage.setItem('user_name', user.name);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function loadNotes() {
    const search = document.getElementById('searchInput')?.value || '';
    let url = `${API_URL}/api/notes`;
    if (search) url += `?search=${encodeURIComponent(search)}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            const notes = await response.json();
            displayNotes(notes);
        }
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

function displayNotes(notes) {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;
    
    if (!notes.length) {
        notesList.innerHTML = `
            <div class="empty-state">
                <div class="emoji">📭</div>
                <p>У вас пока нет заметок</p>
                <small>Нажмите "Новая заметка", чтобы создать первую</small>
            </div>
        `;
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <h3>${escapeHtml(note.title) || 'Без названия'}</h3>
            <p>${escapeHtml((note.content || '').substring(0, 150))}${(note.content || '').length > 150 ? '...' : ''}</p>
            <div class="note-date">📅 ${formatDate(note.created_at)}</div>
            <div class="note-actions">
                <button class="edit-btn" onclick="editNote(${note.id})">✏️ Редактировать</button>
                <button class="delete-btn" onclick="deleteNoteConfirm(${note.id})">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    token = null;
    updateUI();
}

async function createNote(title, content) {
    const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    });
    return response.ok;
}

async function updateNote(id, title, content) {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    });
    return response.ok;
}

async function deleteNote(id) {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
}

async function getNoteById(id) {
    const response = await fetch(`${API_URL}/api/notes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) return await response.json();
    return null;
}

const noteModal = document.getElementById('noteModal');
const modalTitle = document.getElementById('modalTitle');
const noteTitleInput = document.getElementById('noteTitle');
const noteContentInput = document.getElementById('noteContent');
const noteIdInput = document.getElementById('noteId');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');

function openModal() { noteModal.style.display = 'flex'; }
function closeModal() { noteModal.style.display = 'none'; }

function openCreateModal() {
    modalTitle.textContent = '➕ Создать заметку';
    noteTitleInput.value = '';
    noteContentInput.value = '';
    noteIdInput.value = '';
    deleteNoteBtn.style.display = 'none';
    openModal();
}

window.editNote = async function(id) {
    const note = await getNoteById(id);
    if (note) {
        modalTitle.textContent = '✏️ Редактировать заметку';
        noteTitleInput.value = note.title || '';
        noteContentInput.value = note.content || '';
        noteIdInput.value = note.id;
        deleteNoteBtn.style.display = 'block';
        openModal();
    }
};

window.deleteNoteConfirm = function(id) {
    if (confirm('Удалить заметку?')) {
        deleteNote(id).then(success => {
            if (success) loadNotes();
        });
    }
};

async function saveNote() {
    const id = noteIdInput.value;
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value;
    
    if (!title) {
        alert('Введите заголовок');
        return;
    }
    
    let success;
    if (id) {
        success = await updateNote(id, title, content);
    } else {
        success = await createNote(title, content);
    }
    
    if (success) {
        closeModal();
        loadNotes();
    } else {
        alert('Ошибка сохранения');
    }
}

function goToLogin() {
    window.location.href = 'login.html';
}

function goToRegister() {
    window.location.href = 'register.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    document.getElementById('loginBtn')?.addEventListener('click', goToLogin);
    document.getElementById('registerBtn')?.addEventListener('click', goToRegister);
    document.getElementById('heroLoginBtn')?.addEventListener('click', goToLogin);
    document.getElementById('heroRegisterBtn')?.addEventListener('click', goToRegister);
    document.getElementById('promptLoginBtn')?.addEventListener('click', goToLogin);
    document.getElementById('promptRegisterBtn')?.addEventListener('click', goToRegister);

    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    document.getElementById('createNoteBtn')?.addEventListener('click', openCreateModal);

    document.getElementById('saveNoteBtn')?.addEventListener('click', saveNote);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    deleteNoteBtn?.addEventListener('click', async () => {
        const id = noteIdInput.value;
        if (id && confirm('Удалить?')) {
            await deleteNote(id);
            closeModal();
            loadNotes();
        }
    });

    noteModal?.addEventListener('click', (e) => {
        if (e.target === noteModal) closeModal();
    });

    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadNotes, 500);
    });
});
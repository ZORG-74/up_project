const API_URL = 'http://127.0.0.1:8000';
const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    errorDiv.style.display = 'none';
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showError('❌ Заполните все поля');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-login');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Вход...';
    
    try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('access_token', data.access_token);
            await getUserInfo(data.access_token);
            
            showSuccess('✅ Вход выполнен! Перенаправление...');
            
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1000);
        } else {
            showError(`❌ ${data.detail || 'Неверный email или пароль'}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('❌ Не удалось подключиться к серверу');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти';
    }
});

async function getUserInfo(token) {
    try {
        const response = await fetch(`${API_URL}/api/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user_name', user.name);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.login-card').appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 2000);
}
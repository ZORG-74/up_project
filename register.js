const API_URL = 'http://127.0.0.1:8000';
const registerForm = document.getElementById('registerForm');
const errorDiv = document.getElementById('errorMessage');
const successDiv = document.getElementById('successMessage');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!name || name.length < 2) {
        showError('❌ Имя должно содержать минимум 2 символа');
        return;
    }
    
    if (!email || !email.includes('@')) {
        showError('❌ Введите корректный email');
        return;
    }
    
    if (password.length < 8) {
        showError('❌ Пароль должен быть минимум 8 символов');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('❌ Пароли не совпадают');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-register');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Регистрация...';
    
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('✅ Регистрация прошла успешно! Перенаправление...');
            registerForm.reset();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showError(`❌ ${data.detail || 'Ошибка регистрации'}`);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('❌ Не удалось подключиться к серверу');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Зарегистрироваться';
    }
});

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 2000);
}
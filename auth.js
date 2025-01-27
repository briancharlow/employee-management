const signupContainer = document.getElementById('signupContainer');
const loginContainer = document.getElementById('loginContainer');
const forgotPasswordContainer = document.getElementById('forgotPasswordContainer');

const signupMessageBox = document.getElementById('signupMessageBox');
const loginMessageBox = document.getElementById('loginMessageBox');
const forgotPasswordMessageBox = document.getElementById('forgotPasswordMessageBox');

const loginToggle = document.getElementById('loginToggle');
const signupToggle = document.getElementById('signupToggle');
const forgotPasswordToggle = document.getElementById('forgotPasswordToggle');
const backToLoginToggle = document.getElementById('backToLoginToggle');

const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

function showMessage(messageBox, message, type = 'success') {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.classList.remove('hidden');

    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

// Toggle functionality
function setupToggles() {
    loginToggle.addEventListener('click', () => toggleVisibility(signupContainer, loginContainer));
    signupToggle.addEventListener('click', () => toggleVisibility(loginContainer, signupContainer));
    forgotPasswordToggle.addEventListener('click', () => toggleVisibility(loginContainer, forgotPasswordContainer));
    backToLoginToggle.addEventListener('click', () => toggleVisibility(forgotPasswordContainer, loginContainer));
}

function toggleVisibility(hideElement, showElement) {
    hideElement.classList.add('hidden');
    showElement.classList.remove('hidden');
}

// Validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?=.{8,})/;
    return passwordRegex.test(password);
}

async function isEmailUnique(email) {
    const response = await fetch(`http://localhost:3000/users?email=${email}`);
    const users = await response.json();
    return users.length === 0;
}

function getPermissions(role) {
    const permissionsMap = {
        admin: ['full_access'],
        manager: ['view_employees', 'message_employees'],
        employee: ['view_self', 'message_colleagues'],
    };
    return permissionsMap[role] || [];
}

async function handleSignupForm(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!isValidEmail(email)) {
        return showMessage(signupMessageBox, 'Invalid email format', 'error');
    }

    if (!isValidPassword(password)) {
        return showMessage(signupMessageBox, 'Password must be at least 8 characters long, include a special character, and a capital letter', 'error');
    }

    if (!(await isEmailUnique(email))) {
        return showMessage(signupMessageBox, 'Email already registered', 'error');
    }

    const userData = {
        id: Date.now().toString(),
        name: document.getElementById('name').value,
        email,
        password,
        role: document.getElementById('role').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        salary: parseFloat(document.getElementById('salary').value),
        permissions: getPermissions(document.getElementById('role').value),
    };

    try {
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('session', 'active');

            emailjs.send('service_5pbp3sh', 'template_17rdy21', { email });
            showMessage(signupMessageBox, `Verification email sent to ${email}`);
            window.location.href = 'profile-page.html';
        } else {
            showMessage(signupMessageBox, 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(signupMessageBox, 'Registration failed', 'error');
    }
}

async function handleLoginForm(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`http://localhost:3000/users?email=${email}&password=${password}`);
        const users = await response.json();

        if (users.length > 0) {
            localStorage.setItem('currentUser', JSON.stringify(users[0]));
            localStorage.setItem('session', 'active');
            showMessage(loginMessageBox, 'Login successful!');
            window.location.href = 'profile-page.html';
        } else {
            showMessage(loginMessageBox, 'Invalid email or password', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage(loginMessageBox, 'Login failed', 'error');
    }
}

function handleForgotPasswordForm(e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value;
    emailjs.send('service_5pbp3sh', 'template_17rdy21', { email });
    showMessage(forgotPasswordMessageBox, `Verification email sent to ${email}`);
}

function logOut() {
    localStorage.clear();
    window.location.href = 'index.html';
}

signupForm.addEventListener('submit', handleSignupForm);
loginForm.addEventListener('submit', handleLoginForm);
forgotPasswordForm.addEventListener('submit', handleForgotPasswordForm);
setupToggles();


module.exports = {
    isValidEmail,
    isValidPassword,
    toggleVisibility,
};

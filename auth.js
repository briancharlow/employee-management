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

        // Dynamic message function
        function showMessage(messageBox, message, type = 'success') {
            messageBox.textContent = message;
            messageBox.className = `message-box ${type}`;
            messageBox.classList.remove('hidden');
            
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 5000);
        }

        // Toggle between signup and login
        loginToggle.addEventListener('click', () => {
            signupContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
        });

        signupToggle.addEventListener('click', () => {
            loginContainer.classList.add('hidden');
            signupContainer.classList.remove('hidden');
        });

        // Toggle forgot password
        forgotPasswordToggle.addEventListener('click', () => {
            loginContainer.classList.add('hidden');
            forgotPasswordContainer.classList.remove('hidden');
        });

        backToLoginToggle.addEventListener('click', () => {
            forgotPasswordContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
        });

        // Signup form submission
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = Math.floor(Math.random() * 1000);
            const userData = {
                id: userId.toString(),
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value,
                department: document.getElementById('department').value,
                position: document.getElementById('position').value,
                salary: parseFloat(document.getElementById('salary').value),
                permissions: getPermissions(document.getElementById('role').value)
            };

            try {
                const response = await fetch('http://localhost:3000/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    const user = await response.json();
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('session', 'active');

                    let params ={
                        email: email,
                    }
        
                    // emailjs.send('service_5pbp3sh', 'template_17rdy21', params).then(showMessage(signupMessageBox, `Verification email sent to ${email}`));

                    window.location.href = 'profile-page.html';
                } else {
                    showMessage(signupMessageBox, 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage(signupMessageBox, 'Registration failed', 'error');
            }
        });

        // Login form submission
        loginForm.addEventListener('submit', async (e) => {
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
        });

        // Forgot password form submission
        forgotPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            let params ={
                email: email,
            }

            emailjs.send('service_5pbp3sh', 'template_17rdy21', params)
            showMessage(forgotPasswordMessageBox, `Verification email sent to ${email}`);
        });

        // Helper function to assign permissions based on role
        function getPermissions(role) {
            switch(role) {
                case 'admin':
                    return ['full_access'];
                case 'manager':
                    return ['view_employees', 'message_employees'];
                case 'employee':
                    return ['view_self', 'message_colleagues'];
                default:
                    return [];
            }
        }
        function logOut() {
            localStorage.clear();
            window.location.href = 'index.html';
        }
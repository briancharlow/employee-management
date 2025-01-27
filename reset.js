
const resetForm = document.getElementById('resetPasswordForm');
const messageBox = document.getElementById('messageBox');

// Show message function
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
    messageBox.classList.remove('hidden');

    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    try {
        // Find user by email
        const userResponse = await fetch(`http://localhost:3000/users?email=${email}`);
        const users = await userResponse.json();

        if (users.length === 0) {
            showMessage('User not found', 'error');
            return;
        }

        // Update user password
        const updateResponse = await fetch(`http://localhost:3000/users/${users[0].id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword })
        });

        if (updateResponse.ok) {
            showMessage('Password reset successfully', 'success');
        } else {
            showMessage('Failed to reset password', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
        console.error(error);
    }
});

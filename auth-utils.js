function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?=.{8,})/;
    return passwordRegex.test(password);
}


module.exports = { isValidEmail, isValidPassword };
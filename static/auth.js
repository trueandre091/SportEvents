document.addEventListener('DOMContentLoaded', function() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    const errorMessage = document.querySelector('.password-error');

    function validatePasswords() {
        if (confirmPassword.value && password.value !== confirmPassword.value) {
            errorMessage.style.display = 'block';
            confirmPassword.classList.add('error');
            return false;
        } else {
            errorMessage.style.display = 'none';
            confirmPassword.classList.remove('error');
            return true;
        }
    }

    password.addEventListener('input', validatePasswords);
    confirmPassword.addEventListener('input', validatePasswords);

    document.querySelector('.register-form').addEventListener('submit', function(e) {
        if (!validatePasswords()) {
            e.preventDefault();
        }
    });
});

function show_hide_password(target, inputId) {
    var input = document.getElementById(inputId);
    if (input.getAttribute('type') == 'password') {
        target.classList.add('view');
        input.setAttribute('type', 'text');
    } else {
        target.classList.remove('view');
        input.setAttribute('type', 'password');
    }
    return false;
} 
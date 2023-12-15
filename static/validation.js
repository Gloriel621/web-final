document.addEventListener('DOMContentLoaded', function() {
    // Input fields
    var chk = document.getElementById('chk');
    chk.addEventListener('change', function() {
        if (chk.checked) {
            setTimeout(function() {
                updateFeedbackPositions();
                showFeedbackMessages(true);
            }, 800);
        } else {
            showFeedbackMessages(false);
        }
    });

    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password1');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const submitButton = document.querySelector('[name="signup_submit"]');
    const emailFeedback = document.getElementById('email-feedback');
    const usernameFeedback = document.getElementById('username-feedback');
    const passwordFeedback = document.getElementById('password-strength-feedback');

    // Add event listeners
    usernameInput.addEventListener('input', validateUsername);
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);

    // Validate username
    function validateUsername() {
        var isValid = /^[A-Za-z][A-Za-z0-9_]{1,19}$/.test(usernameInput.value);
        displayFeedback(usernameInput, usernameFeedback, isValid, 'Username should not start with a number and be between 2-20 characters');
        updateButtonState();
    }

    // Validate email
    function validateEmail() {
        var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        displayFeedback(emailInput, emailFeedback, isValid, 'Email should have a proper format (xxx@yyy.zzz)');
        updateButtonState();
    }

    // Validate password
    function validatePassword() {
        var isValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(passwordInput.value);
        displayFeedback(passwordInput, passwordFeedback, isValid, 'Password should have at least 6 characters, at least one uppercase, one lowercase, and one digit');
        updateButtonState();
    }

    // Validate confirm password
    const confirmPasswordFeedback = document.getElementById('confirm-password-feedback');

    function validateConfirmPassword() {
        var isValid = passwordInput.value === confirmPasswordInput.value;
        displayFeedback(confirmPasswordInput, confirmPasswordFeedback, isValid, 'Confirm password should match the password');
        updateButtonState();
    }

    // Display feedback
    function displayFeedback(input, feedbackElement, isValid, message) {
        if (input.value === '') {
            // Hide feedback if input is empty
            feedbackElement.style.display = 'none';
        } else if (!isValid) {
            // Show error message if input is invalid
            input.classList.add('input-error');
            feedbackElement.textContent = message;
            feedbackElement.style.display = 'block';
        } else {
            // Hide feedback if input is valid
            input.classList.remove('input-error');
            feedbackElement.style.display = 'none';
        }
    }
    
    function updateButtonState() {
        const isFormValid = usernameInput.value && emailInput.value && passwordInput.value &&
                             confirmPasswordInput.value && passwordInput.value === confirmPasswordInput.value;
    
        submitButton.disabled = !isFormValid;
    
        if (isFormValid) {
            submitButton.classList.remove('button-disabled');
        } else {
            submitButton.classList.add('button-disabled');
        }
    }
    
    showFeedbackMessages(false);
});

function showFeedbackMessages(show) {
    var feedbackMessages = document.querySelectorAll('.feedback');
    feedbackMessages.forEach(function(message) {
        message.style.display = show ? 'block' : 'none';
    });
}

function updateFeedbackPositions() {
    positionFeedback('username', 'username-feedback');
    positionFeedback('email', 'email-feedback');
    positionFeedback('password1', 'password-strength-feedback');
    positionFeedback('confirm-password', 'confirm-password-feedback');
}

function positionFeedback(inputId, feedbackId) {
    var inputElement = document.getElementById(inputId);
    var feedbackElement = document.getElementById(feedbackId);

    if (inputElement && feedbackElement) {
        var inputRect = inputElement.getBoundingClientRect();
        feedbackElement.style.position = 'absolute';
        feedbackElement.style.top = (inputRect.top + window.scrollY) + 'px';
        feedbackElement.style.left = (inputRect.right + 10) + 'px'; // Adjust as needed
    }
}


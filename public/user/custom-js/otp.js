document.addEventListener('DOMContentLoaded', (e) => {
    startTimer(60); // Start the timer with 60 seconds
});

const form = document.querySelector('form');
const msgPara = document.querySelector('.msg-para');
const timer = document.querySelector('.otp-timer');
const resendOTPLink = document.querySelector('#resend-otp-link');

let timerInterval;
let remainingTime = 60; // Set the initial remaining time in seconds
let timerOn = false;

function startTimer(initialTime) {
    remainingTime = initialTime;
    timerOn = true;
    resendOTPLink.style.pointerEvents = 'none'; // Disable the "Resend OTP" link initially
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    timer.innerHTML = `${formattedMinutes}:${formattedSeconds}`;

    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        timerOn = false;
        resendOTPLink.style.pointerEvents = 'auto'; // Enable the "Resend OTP" link after the timer expires

        const confi = confirm('Timeout for OTP, resend the OTP?');
        if (confi) {
            window.location.href = '/signup/otp';
        }
    } else {
        remainingTime--;
    }
}

resendOTPLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default link behavior

    if (resendOTPLink.style.pointerEvents !== 'none') {
        startTimer(60);
        alert('A new OTP has been sent to your email.');
    }
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const otp = document.querySelector('#otp').value;
    const body = { otp };

    if (isNaN(otp)) {
        return displayError({ error: 'OTP must be a number' });
    }

    fetch('/signup/otp/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                return displayError(data);
            }
            window.location.href = '/post-user';
        })
        .catch((err) => {
            displayError({ error: err.error });
        });
});

const displayError = (result) => {
    msgPara.parentElement.className = 'msg-box-error';
    msgPara.style.color = 'red';
    msgPara.innerHTML = result.error;
};

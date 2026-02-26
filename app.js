// Function to show QR code
function showQR(option) {
    // Store the selected option in sessionStorage
    sessionStorage.setItem('qrOption', option);
    // Navigate to display page
    window.location.href = 'display.html';
}

// Check if we're on the display page
if (window.location.pathname.includes('display.html')) {
    // Get the option from sessionStorage
    const option = sessionStorage.getItem('qrOption');
    
    if (option) {
        displayQRCode(option);
    }
}

function displayQRCode(option) {
    const qrDisplay = document.getElementById('qr-display');
    const timerDisplay = document.getElementById('timer');
    
    // QR code URLs or data for different options
    const qrData = {
        'start': 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=START',
        'success': 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SUCCESS',
        'failure': 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=FAILURE',
        'time': 'https://gopro.github.io/labs/control/precisiontime/'
    };
    
    // Display QR code
    if (option === 'time') {
        // For time option, display as iframe
        qrDisplay.innerHTML = `<iframe src="${qrData[option]}" width="100%" height="500px" style="border:none;"></iframe>`;
    } else {
        // For other options, display as image
        qrDisplay.innerHTML = `<img src="${qrData[option]}" alt="${option} QR Code" />`;
    }
    
    // Start countdown timer
    let timeLeft = 5;
    timerDisplay.textContent = timeLeft;
    
    const countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            playBeep();
            // Return to main screen after beep
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }, 1000);
}

function playBeep() {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set beep frequency and duration
    oscillator.frequency.value = 800; // 800 Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

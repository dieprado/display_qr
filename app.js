const APP_VERSION = 'v1.0.0';

// Function to show QR code
function showQR(option) {
    // Store the selected option in sessionStorage
    sessionStorage.setItem('qrOption', option);
    // Navigate to display page
    window.location.href = 'display.html';
}

let audioContext = null;

function getAudioContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
        return null;
    }
    if (!audioContext) {
        audioContext = new AudioContextClass();
    }
    return audioContext;
}

async function tryUnlockAudio() {
    try {
        const ctx = getAudioContext();
        if (ctx.state !== 'running') {
            await ctx.resume();
        }
        return ctx.state === 'running';
    } catch (error) {
        return false;
    }
}

function showAudioUnlockOverlay(onUnlocked) {
    const overlay = document.getElementById('audio-unlock-overlay');
    const button = document.getElementById('audio-unlock-btn');
    if (!overlay || !button) {
        onUnlocked();
        return;
    }

    overlay.classList.remove('hidden');
    const unlock = async () => {
        await tryUnlockAudio();
        overlay.classList.add('hidden');
        button.removeEventListener('click', unlock);
        onUnlocked();
    };

    button.addEventListener('click', unlock);
}

// Check if we're on the display page
if (window.location.pathname.includes('display.html')) {
    document.body.classList.add('display-page');
    // Get the option from sessionStorage
    const option = sessionStorage.getItem('qrOption');
    
    if (option) {
        displayQRCode(option);
    }
}

function setVersionBadge() {
    const versionBadge = document.getElementById('version-badge');
    if (versionBadge) {
        versionBadge.textContent = APP_VERSION;
    }
}

function displayQRCode(option) {
    const qrDisplay = document.getElementById('qr-display');
    const timerDisplay = document.getElementById('timer');
    const optionInfo = document.getElementById('option-info');
    
    // QR code URLs or data for different options
    const qrData = {
        'start': 'images/start.png',
        'success': 'images/success.png',
        'failure': 'images/failure.png',
        'time': 'time_qr.html'
    };
    
    // Display QR code
    if (option === 'time') {
        // For time option, render only the precision time QR canvas.
        optionInfo.textContent = 'Syncing precise time...';
        qrDisplay.innerHTML = `<iframe id="time-qr-frame" src="${qrData[option]}" width="360" height="360" style="border:none;" title="Dynamic time QR"></iframe>`;

        const onTimeMessage = (event) => {
            if (!event.data || event.data.type !== 'precise-time') {
                return;
            }
            optionInfo.textContent = event.data.value;
        };
        window.addEventListener('message', onTimeMessage);
        window.addEventListener('beforeunload', () => {
            window.removeEventListener('message', onTimeMessage);
        }, { once: true });
    } else {
        // For other options, display as image
        optionInfo.textContent = option.charAt(0).toUpperCase() + option.slice(1);
        qrDisplay.innerHTML = `<img src="${qrData[option]}" alt="${option} QR Code" />`;
    }
    
    const startCountdown = () => {
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
    };

    startCountdown();
    tryUnlockAudio().then((unlocked) => {
        if (!unlocked) {
            showAudioUnlockOverlay(() => {});
        }
    });
}

function playBeep() {
    const ctx = getAudioContext();
    if (!ctx) {
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
        return;
    }
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Set beep frequency and duration
    oscillator.frequency.value = 800; // 800 Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);

    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
}

setVersionBadge();


// Main App JavaScript
class MobileGameApp {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Initialize app state
        this.playerData = JSON.parse(localStorage.getItem('playerData')) || {
            name: 'Player',
            level: 1,
            xp: 0,
            coins: 0,
            bestScore: 0,
            gamesPlayed: 0,
            totalPlayTime: 0,
            achievements: [],
            inventory: {
                ships: ['classic'],
                equipped: 'classic'
            },
            settings: {
                sound: true,
                music: true,
                notifications: false
            }
        };

        this.savePlayerData();
    }

    setupEventListeners() {
        // Navigation handling
        document.addEventListener('DOMContentLoaded', () => {
            this.updatePlayerInfo();
        });

        // Settings toggles
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.setting-item')) {
                const setting = e.target.closest('.setting-item').querySelector('.setting-info span').textContent.toLowerCase().replace(/\s+/g, '');
                this.updateSetting(setting, e.target.checked);
            }
        });
    }

    updatePlayerInfo() {
        // Update player name displays
        const nameElements = document.querySelectorAll('#playerName');
        nameElements.forEach(el => el.textContent = this.playerData.name);

        // Update stats if on profile page
        if (document.querySelector('.stats-grid')) {
            this.updateProfileStats();
        }
    }

    updateProfileStats() {
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length >= 4) {
            statCards[0].querySelector('.stat-number').textContent = this.playerData.gamesPlayed;
            statCards[1].querySelector('.stat-number').textContent = this.playerData.bestScore.toLocaleString();
            statCards[2].querySelector('.stat-number').textContent = this.formatPlayTime(this.playerData.totalPlayTime);
            statCards[3].querySelector('.stat-number').textContent = this.playerData.coins.toLocaleString();
        }

        // Update XP bar
        const xpFill = document.querySelector('.xp-fill');
        const xpText = document.querySelector('.xp-text');
        if (xpFill && xpText) {
            const xpForNextLevel = this.playerData.level * 1000;
            const currentXP = this.playerData.xp % 1000;
            const percentage = (currentXP / 1000) * 100;
            
            xpFill.style.width = `${percentage}%`;
            xpText.textContent = `${currentXP}/1000 XP`;
        }

        // Update level badge
        const levelBadge = document.querySelector('.level-badge');
        if (levelBadge) {
            levelBadge.textContent = `Level ${this.playerData.level}`;
        }
    }

    updateSetting(setting, value) {
        this.playerData.settings[setting] = value;
        this.savePlayerData();
        
        // Apply setting immediately
        switch(setting) {
            case 'sound':
                this.toggleSound(value);
                break;
            case 'music':
                this.toggleMusic(value);
                break;
            case 'notifications':
                this.toggleNotifications(value);
                break;
        }
    }

    toggleSound(enabled) {
        // Implementation for sound toggle
        console.log('Sound effects:', enabled ? 'enabled' : 'disabled');
    }

    toggleMusic(enabled) {
        // Implementation for music toggle
        console.log('Background music:', enabled ? 'enabled' : 'disabled');
    }

    toggleNotifications(enabled) {
        // Implementation for notifications toggle
        console.log('Notifications:', enabled ? 'enabled' : 'disabled');
    }

    formatPlayTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    addXP(amount) {
        this.playerData.xp += amount;
        const newLevel = Math.floor(this.playerData.xp / 1000) + 1;
        
        if (newLevel > this.playerData.level) {
            this.playerData.level = newLevel;
            this.showLevelUpNotification();
        }
        
        this.savePlayerData();
    }

    addCoins(amount) {
        this.playerData.coins += amount;
        this.savePlayerData();
    }

    updateBestScore(score) {
        if (score > this.playerData.bestScore) {
            this.playerData.bestScore = score;
            this.savePlayerData();
            return true;
        }
        return false;
    }

    showLevelUpNotification() {
        // Create and show level up notification
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-star"></i>
                <h3>Level Up!</h3>
                <p>You've reached level ${this.playerData.level}!</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    savePlayerData() {
        localStorage.setItem('playerData', JSON.stringify(this.playerData));
    }
}

// Initialize the app
window.gameApp = new MobileGameApp();

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Add toast styles
const toastStyles = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 9999;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-success {
        border-left: 4px solid #4caf50;
    }
    
    .toast-error {
        border-left: 4px solid #f44336;
    }
    
    .toast-info {
        border-left: 4px solid #4facfe;
    }
    
    .level-up-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #4facfe, #00f2fe);
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        z-index: 9999;
        animation: levelUpPulse 1s ease-in-out;
    }
    
    @keyframes levelUpPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
    }
    
    .notification-content i {
        font-size: 40px;
        margin-bottom: 10px;
        color: #ffd700;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);

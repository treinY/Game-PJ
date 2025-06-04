
// Achievements JavaScript
class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.dailyChallenges = [];
        this.init();
    }

    init() {
        this.loadAchievements();
        this.updateProgressCircle();
        this.setupChallengeTracking();
    }

    async loadAchievements() {
        const listContainer = document.getElementById('achievementsList');
        listContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading achievements...</div>';

        try {
            const response = await fetch('/api/achievements');
            const data = await response.json();
            
            setTimeout(() => {
                this.achievements = data;
                this.renderAchievements();
            }, 500);
        } catch (error) {
            console.error('Error loading achievements:', error);
            listContainer.innerHTML = '<div class="error">Failed to load achievements</div>';
        }
    }

    renderAchievements() {
        const listContainer = document.getElementById('achievementsList');
        
        const achievementsHTML = this.achievements.map(achievement => {
            const iconClass = this.getAchievementIcon(achievement.name);
            
            return `
                <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                        ${achievement.unlocked ? '<div class="achievement-date">Unlocked recently</div>' : ''}
                    </div>
                    <div class="achievement-reward">
                        ${achievement.unlocked ? '<i class="fas fa-check"></i>' : '+100 XP'}
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = achievementsHTML;
        
        // Add animations
        const achievementCards = listContainer.querySelectorAll('.achievement-card');
        achievementCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('slide-in');
        });
    }

    getAchievementIcon(name) {
        const iconMap = {
            'First Steps': 'fas fa-baby',
            'Speed Demon': 'fas fa-bolt',
            'Collector': 'fas fa-coins',
            'Survivor': 'fas fa-shield-alt',
            'Master': 'fas fa-crown'
        };
        
        return iconMap[name] || 'fas fa-trophy';
    }

    updateProgressCircle() {
        const unlockedCount = this.achievements.filter(a => a.unlocked).length;
        const totalCount = this.achievements.length;
        const percentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
        
        const progressText = document.querySelector('.progress-text');
        const progressInfo = document.querySelector('.progress-info span');
        
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
        
        if (progressInfo) {
            progressInfo.textContent = `${unlockedCount} of ${totalCount} unlocked`;
        }
        
        // Animate the progress circle
        this.animateProgressCircle(percentage);
    }

    animateProgressCircle(percentage) {
        const progressCircle = document.querySelector('.progress-circle');
        if (progressCircle) {
            progressCircle.style.background = `conic-gradient(#4facfe ${percentage}%, rgba(255, 255, 255, 0.2) 0)`;
        }
    }

    setupChallengeTracking() {
        // Track daily challenge progress
        this.updateChallengeProgress();
        
        // Listen for game events to update progress
        document.addEventListener('gameEvent', (e) => {
            this.handleGameEvent(e.detail);
        });
    }

    updateChallengeProgress() {
        const challenges = document.querySelectorAll('.challenge-item');
        challenges.forEach(challenge => {
            const progressBar = challenge.querySelector('.progress-fill');
            const progressText = challenge.querySelector('.challenge-progress span');
            
            if (progressBar && progressText) {
                // Simulate progress update
                const current = parseInt(progressText.textContent.split('/')[0]);
                const total = parseInt(progressText.textContent.split('/')[1]);
                const percentage = (current / total) * 100;
                
                progressBar.style.width = `${percentage}%`;
            }
        });
    }

    handleGameEvent(eventData) {
        switch(eventData.type) {
            case 'coinsCollected':
                this.updateCoinChallenge(eventData.amount);
                break;
            case 'levelCompleted':
                this.updateSpeedChallenge(eventData.time);
                break;
            case 'enemyHit':
                this.updateAccuracyChallenge();
                break;
        }
    }

    updateCoinChallenge(coinsCollected) {
        // Update coin collection challenge
        const coinChallenge = document.querySelector('.challenge-item:first-child');
        if (coinChallenge) {
            const progressText = coinChallenge.querySelector('.challenge-progress span');
            const current = parseInt(progressText.textContent.split('/')[0]);
            const total = parseInt(progressText.textContent.split('/')[1]);
            const newCurrent = Math.min(current + coinsCollected, total);
            
            progressText.textContent = `${newCurrent}/${total}`;
            this.updateChallengeProgress();
            
            if (newCurrent >= total) {
                this.completeChallenge(coinChallenge, 'Coin Hunter');
            }
        }
    }

    updateSpeedChallenge(completionTime) {
        // Update speed challenge if conditions are met
        if (completionTime < 120) { // 2 minutes
            const speedChallenge = document.querySelector('.challenge-item:nth-child(2)');
            if (speedChallenge && !speedChallenge.classList.contains('completed')) {
                this.completeChallenge(speedChallenge, 'Speed Runner');
            }
        }
    }

    updateAccuracyChallenge() {
        // Update accuracy challenge
        // This would need to track consecutive hits
    }

    completeChallenge(challengeElement, challengeName) {
        challengeElement.classList.add('completed');
        const progressBar = challengeElement.querySelector('.progress-fill');
        const progressText = challengeElement.querySelector('.challenge-progress span');
        const rewardElement = challengeElement.querySelector('.challenge-reward span');
        
        if (progressBar) progressBar.style.width = '100%';
        if (progressText) progressText.textContent = progressText.textContent.replace(/\d+\//, `${progressText.textContent.split('/')[1]}/`);
        if (rewardElement) rewardElement.innerHTML = '<i class="fas fa-check"></i> Completed';
        
        // Add XP to player
        window.gameApp.addXP(100);
        showToast(`${challengeName} completed! +100 XP`, 'success');
        
        // Create celebration effect
        this.createCelebration(challengeElement);
    }

    createCelebration(element) {
        // Add celebration animation
        element.style.animation = 'celebrationPulse 1s ease-in-out';
        
        // Remove animation after completion
        setTimeout(() => {
            element.style.animation = '';
        }, 1000);
    }

    checkAchievementUnlock() {
        // Check various achievement conditions
        const playerData = window.gameApp.playerData;
        
        // Check "First Steps" achievement
        if (playerData.gamesPlayed >= 1) {
            this.unlockAchievement('First Steps');
        }
        
        // Check "Collector" achievement
        if (playerData.coins >= 100) {
            this.unlockAchievement('Collector');
        }
        
        // Check "Master" achievement
        if (playerData.level >= 10) {
            this.unlockAchievement('Master');
        }
    }

    unlockAchievement(name) {
        const achievement = this.achievements.find(a => a.name === name);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            
            // Update UI
            this.renderAchievements();
            this.updateProgressCircle();
            
            // Show unlock notification
            this.showAchievementUnlock(achievement);
            
            // Add XP
            window.gameApp.addXP(100);
        }
    }

    showAchievementUnlock(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-unlock';
        notification.innerHTML = `
            <div class="unlock-content">
                <div class="unlock-icon">
                    <i class="${this.getAchievementIcon(achievement.name)}"></i>
                </div>
                <div class="unlock-info">
                    <h3>Achievement Unlocked!</h3>
                    <p>${achievement.name}</p>
                    <span>+100 XP</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
}

// Initialize achievements when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.achievements-container')) {
        window.achievementSystem = new AchievementSystem();
    }
});

// Add CSS for achievements animations
const achievementStyles = `
    .achievement-card.slide-in {
        animation: slideInRight 0.5s ease forwards;
        opacity: 0;
        transform: translateX(30px);
    }
    
    @keyframes slideInRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes celebrationPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .achievement-unlock {
        position: fixed;
        top: 20px;
        right: -350px;
        width: 320px;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transition: transform 0.5s ease;
        z-index: 9999;
    }
    
    .achievement-unlock.show {
        transform: translateX(-370px);
    }
    
    .unlock-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .unlock-icon {
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
    }
    
    .unlock-info h3 {
        margin: 0 0 5px 0;
        font-size: 16px;
    }
    
    .unlock-info p {
        margin: 0 0 5px 0;
        font-weight: bold;
    }
    
    .unlock-info span {
        font-size: 14px;
        opacity: 0.9;
    }
    
    .achievement-date {
        font-size: 12px;
        color: #4facfe;
        margin-top: 5px;
    }
`;

const achievementStyleSheet = document.createElement('style');
achievementStyleSheet.textContent = achievementStyles;
document.head.appendChild(achievementStyleSheet);

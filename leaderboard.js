
// Leaderboard JavaScript
class Leaderboard {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLeaderboard();
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchFilter(e.target.dataset.filter);
            });
        });
    }

    switchFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.loadLeaderboard();
    }

    async loadLeaderboard() {
        const listContainer = document.getElementById('leaderboardList');
        listContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading rankings...</div>';

        try {
            const response = await fetch('/api/leaderboard');
            const data = await response.json();
            
            setTimeout(() => {
                this.renderLeaderboard(data);
            }, 500); // Simulate loading time
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            listContainer.innerHTML = '<div class="error">Failed to load leaderboard</div>';
        }
    }

    renderLeaderboard(data) {
        const listContainer = document.getElementById('leaderboardList');
        
        if (!data || data.length === 0) {
            listContainer.innerHTML = '<div class="empty">No rankings available</div>';
            return;
        }

        const rankingsHTML = data.map((player, index) => {
            const position = index + 1;
            const medal = this.getMedalIcon(position);
            
            return `
                <div class="rank-card ${position <= 3 ? 'top-rank' : ''}">
                    <div class="rank-position ${position <= 3 ? 'medal' : ''}">${medal || position}</div>
                    <div class="player-info">
                        <div class="player-name">${player.name}</div>
                        <div class="player-stats">
                            <span class="score">${player.score.toLocaleString()}</span>
                            <span class="level">Level ${player.level}</span>
                        </div>
                    </div>
                    <div class="rank-trend">
                        ${this.getTrendIcon(player.trend)}
                    </div>
                </div>
            `;
        }).join('');

        listContainer.innerHTML = rankingsHTML;
        
        // Add animation
        const rankCards = listContainer.querySelectorAll('.rank-card');
        rankCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }

    getMedalIcon(position) {
        switch(position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return null;
        }
    }

    getTrendIcon(trend) {
        if (!trend) return '';
        
        switch(trend) {
            case 'up': return '<i class="fas fa-arrow-up trend-up"></i>';
            case 'down': return '<i class="fas fa-arrow-down trend-down"></i>';
            case 'same': return '<i class="fas fa-minus trend-same"></i>';
            default: return '';
        }
    }

    updateYourRank() {
        const playerData = window.gameApp.playerData;
        const yourRankCard = document.querySelector('.your-card');
        
        if (yourRankCard) {
            yourRankCard.querySelector('.player-name').textContent = playerData.name;
            yourRankCard.querySelector('.score').textContent = playerData.bestScore.toLocaleString();
            yourRankCard.querySelector('.level').textContent = `Level ${playerData.level}`;
        }
    }
}

// Challenge progress animations
function animateProgress() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Initialize leaderboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.leaderboard-container')) {
        window.leaderboard = new Leaderboard();
        animateProgress();
    }
});

// Add CSS for animations
const leaderboardStyles = `
    .rank-card.fade-in {
        animation: fadeInUp 0.5s ease forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .top-rank {
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1));
        border: 1px solid rgba(255, 215, 0, 0.3);
    }
    
    .rank-position.medal {
        font-size: 24px;
        background: none;
        width: auto;
        height: auto;
    }
    
    .trend-up { color: #4caf50; }
    .trend-down { color: #f44336; }
    .trend-same { color: #9e9e9e; }
    
    .rank-trend {
        margin-left: auto;
        font-size: 18px;
    }
    
    .empty, .error {
        text-align: center;
        padding: 40px;
        opacity: 0.7;
    }
    
    .error {
        color: #f44336;
    }
`;

const leaderboardStyleSheet = document.createElement('style');
leaderboardStyleSheet.textContent = leaderboardStyles;
document.head.appendChild(leaderboardStyleSheet);

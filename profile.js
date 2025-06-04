
// Profile JavaScript
class PlayerProfile {
    constructor() {
        this.currentTab = 'ships';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProfile();
        this.updateInventory();
    }

    setupEventListeners() {
        // Inventory tabs
        document.querySelectorAll('.inventory-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Avatar change button
        const changeAvatarBtn = document.querySelector('.change-avatar-btn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => {
                this.showAvatarSelection();
            });
        }

        // Settings toggles are handled in main app.js
    }

    loadProfile() {
        const playerData = window.gameApp.playerData;
        
        // Update player name
        const playerNameElement = document.getElementById('playerName');
        if (playerNameElement) {
            playerNameElement.textContent = playerData.name;
            playerNameElement.contentEditable = true;
            playerNameElement.addEventListener('blur', (e) => {
                this.updatePlayerName(e.target.textContent);
            });
        }

        // Update level and XP
        this.updateLevelInfo();

        // Update statistics
        this.updateStatistics();

        // Load settings
        this.loadSettings();
    }

    updateLevelInfo() {
        const playerData = window.gameApp.playerData;
        const levelBadge = document.querySelector('.level-badge');
        const xpBar = document.querySelector('.xp-fill');
        const xpText = document.querySelector('.xp-text');

        if (levelBadge) {
            levelBadge.textContent = `Level ${playerData.level}`;
        }

        if (xpBar && xpText) {
            const currentLevelXP = playerData.xp % 1000;
            const percentage = (currentLevelXP / 1000) * 100;
            
            xpBar.style.width = `${percentage}%`;
            xpText.textContent = `${currentLevelXP}/1000 XP`;
        }
    }

    updateStatistics() {
        const playerData = window.gameApp.playerData;
        const statCards = document.querySelectorAll('.stat-card');

        if (statCards.length >= 4) {
            // Games Played
            statCards[0].querySelector('.stat-number').textContent = playerData.gamesPlayed;
            
            // Best Score
            statCards[1].querySelector('.stat-number').textContent = playerData.bestScore.toLocaleString();
            
            // Time Played
            const totalHours = Math.floor(playerData.totalPlayTime / 60);
            const totalMinutes = playerData.totalPlayTime % 60;
            statCards[2].querySelector('.stat-number').textContent = `${totalHours}h ${totalMinutes}m`;
            
            // Total Coins
            statCards[3].querySelector('.stat-number').textContent = playerData.coins.toLocaleString();
        }

        // Animate the numbers
        this.animateStatNumbers();
    }

    animateStatNumbers() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(element => {
            const finalValue = element.textContent;
            const numericValue = parseInt(finalValue.replace(/,/g, '')) || 0;
            
            if (numericValue > 0) {
                this.animateNumber(element, 0, numericValue, 1000);
            }
        });
    }

    animateNumber(element, start, end, duration) {
        const range = end - start;
        const startTime = Date.now();
        
        const updateNumber = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (range * progress));
            
            if (element.textContent.includes('h')) {
                const hours = Math.floor(current / 60);
                const minutes = current % 60;
                element.textContent = `${hours}h ${minutes}m`;
            } else {
                element.textContent = current.toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        updateNumber();
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab
        document.querySelectorAll('.inventory-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update inventory display
        this.updateInventory();
    }

    updateInventory() {
        const inventoryGrid = document.querySelector('.inventory-grid');
        const playerData = window.gameApp.playerData;
        
        let items = [];
        
        switch(this.currentTab) {
            case 'ships':
                items = this.getShipItems();
                break;
            case 'powerups':
                items = this.getPowerupItems();
                break;
            case 'themes':
                items = this.getThemeItems();
                break;
        }
        
        const itemsHTML = items.map(item => `
            <div class="inventory-item ${item.status.toLowerCase()}" data-item="${item.id}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-status">${item.status}</div>
                ${item.status === 'Owned' ? '<button class="equip-btn">Equip</button>' : ''}
                ${item.status.includes('coins') ? '<button class="buy-btn">Buy</button>' : ''}
            </div>
        `).join('');
        
        inventoryGrid.innerHTML = itemsHTML;
        
        // Add event listeners for equip/buy buttons
        this.setupInventoryListeners();
    }

    getShipItems() {
        const playerData = window.gameApp.playerData;
        return [
            {
                id: 'classic',
                icon: '🚀',
                name: 'Classic Ship',
                status: playerData.inventory.equipped === 'classic' ? 'Equipped' : 'Owned'
            },
            {
                id: 'fighter',
                icon: '✈️',
                name: 'Fighter Jet',
                status: playerData.inventory.ships.includes('fighter') ? 
                    (playerData.inventory.equipped === 'fighter' ? 'Equipped' : 'Owned') : '500 coins'
            },
            {
                id: 'ufo',
                icon: '🛸',
                name: 'UFO',
                status: playerData.inventory.ships.includes('ufo') ? 
                    (playerData.inventory.equipped === 'ufo' ? 'Equipped' : 'Owned') : '1000 coins'
            },
            {
                id: 'rocket',
                icon: '🚁',
                name: 'Helicopter',
                status: playerData.inventory.ships.includes('rocket') ? 
                    (playerData.inventory.equipped === 'rocket' ? 'Equipped' : 'Owned') : '1500 coins'
            }
        ];
    }

    getPowerupItems() {
        return [
            {
                id: 'shield',
                icon: '🛡️',
                name: 'Shield',
                status: 'Available'
            },
            {
                id: 'speed',
                icon: '⚡',
                name: 'Speed Boost',
                status: 'Available'
            },
            {
                id: 'multishot',
                icon: '🔫',
                name: 'Multi Shot',
                status: 'Available'
            }
        ];
    }

    getThemeItems() {
        return [
            {
                id: 'space',
                icon: '🌌',
                name: 'Deep Space',
                status: 'Equipped'
            },
            {
                id: 'neon',
                icon: '🌈',
                name: 'Neon City',
                status: '800 coins'
            },
            {
                id: 'ocean',
                icon: '🌊',
                name: 'Ocean Depths',
                status: '1200 coins'
            }
        ];
    }

    setupInventoryListeners() {
        // Equip buttons
        document.querySelectorAll('.equip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.inventory-item');
                const itemId = item.dataset.item;
                this.equipItem(itemId);
            });
        });

        // Buy buttons
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.inventory-item');
                const itemId = item.dataset.item;
                const cost = parseInt(item.querySelector('.item-status').textContent);
                this.buyItem(itemId, cost);
            });
        });
    }

    equipItem(itemId) {
        const playerData = window.gameApp.playerData;
        
        if (this.currentTab === 'ships' && playerData.inventory.ships.includes(itemId)) {
            playerData.inventory.equipped = itemId;
            window.gameApp.savePlayerData();
            this.updateInventory();
            showToast(`${itemId} equipped!`, 'success');
        }
    }

    buyItem(itemId, cost) {
        const playerData = window.gameApp.playerData;
        
        if (playerData.coins >= cost) {
            playerData.coins -= cost;
            
            if (this.currentTab === 'ships') {
                playerData.inventory.ships.push(itemId);
            }
            
            window.gameApp.savePlayerData();
            this.updateInventory();
            this.updateStatistics();
            showToast(`${itemId} purchased!`, 'success');
        } else {
            showToast('Not enough coins!', 'error');
        }
    }

    updatePlayerName(newName) {
        if (newName.trim() && newName !== window.gameApp.playerData.name) {
            window.gameApp.playerData.name = newName.trim();
            window.gameApp.savePlayerData();
            showToast('Name updated!', 'success');
        }
    }

    loadSettings() {
        const playerData = window.gameApp.playerData;
        const settings = playerData.settings;
        
        // Update toggle states
        document.querySelectorAll('.setting-item input[type="checkbox"]').forEach(checkbox => {
            const settingName = checkbox.closest('.setting-item')
                .querySelector('.setting-info span').textContent
                .toLowerCase().replace(/\s+/g, '');
            
            if (settings.hasOwnProperty(settingName)) {
                checkbox.checked = settings[settingName];
            }
        });
    }

    showAvatarSelection() {
        // Create avatar selection modal
        const modal = document.createElement('div');
        modal.className = 'modal avatar-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Choose Avatar</h2>
                <div class="avatar-grid">
                    <div class="avatar-option" data-avatar="👤">👤</div>
                    <div class="avatar-option" data-avatar="🚀">🚀</div>
                    <div class="avatar-option" data-avatar="🌟">🌟</div>
                    <div class="avatar-option" data-avatar="⚡">⚡</div>
                    <div class="avatar-option" data-avatar="🎮">🎮</div>
                    <div class="avatar-option" data-avatar="🏆">🏆</div>
                </div>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for avatar options
        modal.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const avatarIcon = e.target.dataset.avatar;
                this.updateAvatar(avatarIcon);
                modal.remove();
            });
        });
    }

    updateAvatar(icon) {
        const avatar = document.querySelector('.avatar i');
        if (avatar) {
            avatar.textContent = icon;
            showToast('Avatar updated!', 'success');
        }
    }
}

// Initialize profile when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.profile-container')) {
        window.playerProfile = new PlayerProfile();
    }
});

// Add CSS for profile-specific animations
const profileStyles = `
    .avatar-modal .modal-content {
        max-width: 400px;
    }
    
    .avatar-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin: 20px 0;
    }
    
    .avatar-option {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }
    
    .avatar-option:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: #4facfe;
        transform: scale(1.1);
    }
    
    .equip-btn, .buy-btn {
        background: linear-gradient(45deg, #4facfe, #00f2fe);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 15px;
        font-size: 12px;
        cursor: pointer;
        margin-top: 10px;
        transition: transform 0.2s ease;
    }
    
    .equip-btn:hover, .buy-btn:hover {
        transform: scale(1.05);
    }
    
    .buy-btn {
        background: linear-gradient(45deg, #ffd700, #ffed4e);
        color: #333;
    }
    
    .inventory-item.locked {
        opacity: 0.6;
    }
    
    .inventory-item.equipped {
        border-color: #4facfe;
        box-shadow: 0 0 15px rgba(79, 172, 254, 0.3);
    }
    
    @keyframes statPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .stat-card:hover {
        animation: statPulse 0.5s ease-in-out;
    }
`;

const profileStyleSheet = document.createElement('style');
profileStyleSheet.textContent = profileStyles;
document.head.appendChild(profileStyleSheet);

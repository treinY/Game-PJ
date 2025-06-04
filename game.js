
// Game Engine
class SpaceAdventureGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameSpeed = 2;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.coins = [];
        this.powerups = [];
        this.particles = [];
        
        // Input handling
        this.keys = {};
        this.touches = {};
        
        // Game loop
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.showStartModal();
        this.createPlayer();
    }
    
    setupCanvas() {
        // Set canvas size
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = Math.min(350, rect.width - 20);
        this.canvas.height = 500;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch controls
        const controlButtons = {
            leftBtn: () => this.keys['ArrowLeft'] = true,
            rightBtn: () => this.keys['ArrowRight'] = true,
            upBtn: () => this.keys['ArrowUp'] = true,
            shootBtn: () => this.shoot()
        };
        
        Object.entries(controlButtons).forEach(([id, action]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    action();
                });
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    action();
                });
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.keys['ArrowLeft'] = false;
                    this.keys['ArrowRight'] = false;
                    this.keys['ArrowUp'] = false;
                });
                btn.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.keys['ArrowLeft'] = false;
                    this.keys['ArrowRight'] = false;
                    this.keys['ArrowUp'] = false;
                });
            }
        });
        
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Modal buttons
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.resume();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
        
        // Powerup buttons
        document.querySelectorAll('.powerup-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const powerupType = btn.dataset.powerup;
                this.usePowerup(powerupType);
            });
        });
    }
    
    createPlayer() {
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 30,
            height: 30,
            speed: 5,
            health: 100,
            shield: false,
            multiShot: false,
            speedBoost: false
        };
    }
    
    showStartModal() {
        document.getElementById('startModal').style.display = 'flex';
    }
    
    startGame() {
        const playerName = document.getElementById('playerName').value || 'Player';
        window.gameApp.playerData.name = playerName;
        window.gameApp.savePlayerData();
        
        document.getElementById('startModal').style.display = 'none';
        this.gameState = 'playing';
        this.resetGame();
        this.gameLoop();
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameSpeed = 2;
        this.enemies = [];
        this.projectiles = [];
        this.coins = [];
        this.powerups = [];
        this.particles = [];
        this.createPlayer();
        this.updateUI();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        this.updatePlayer();
        this.updateEnemies();
        this.updateProjectiles();
        this.updateCoins();
        this.updatePowerups();
        this.updateParticles();
        this.checkCollisions();
        this.spawnEnemies();
        this.spawnCoins();
        this.checkLevelUp();
    }
    
    updatePlayer() {
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed;
            
            // Remove enemies that are off screen
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.y -= projectile.speed;
            
            // Remove projectiles that are off screen
            if (projectile.y < 0) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateCoins() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.y += coin.speed;
            coin.rotation += 0.1;
            
            // Remove coins that are off screen
            if (coin.y > this.canvas.height) {
                this.coins.splice(i, 1);
            }
        }
    }
    
    updatePowerups() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.y += powerup.speed;
            
            // Remove powerups that are off screen
            if (powerup.y > this.canvas.height) {
                this.powerups.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Player vs Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(this.player, enemy)) {
                if (!this.player.shield) {
                    this.loseLife();
                }
                this.createExplosion(enemy.x, enemy.y);
                this.enemies.splice(i, 1);
            }
        }
        
        // Projectiles vs Enemies
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(projectile, enemy)) {
                    this.addScore(100);
                    this.createExplosion(enemy.x, enemy.y);
                    this.projectiles.splice(i, 1);
                    this.enemies.splice(j, 1);
                    break;
                }
            }
        }
        
        // Player vs Coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            if (this.isColliding(this.player, coin)) {
                this.addScore(50);
                window.gameApp.addCoins(1);
                this.createSparkle(coin.x, coin.y);
                this.coins.splice(i, 1);
            }
        }
        
        // Player vs Powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            if (this.isColliding(this.player, powerup)) {
                this.activatePowerup(powerup.type);
                this.powerups.splice(i, 1);
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    spawnEnemies() {
        if (Math.random() < 0.02 * this.level) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: this.gameSpeed + Math.random() * 2,
                type: 'basic'
            });
        }
    }
    
    spawnCoins() {
        if (Math.random() < 0.01) {
            this.coins.push({
                x: Math.random() * (this.canvas.width - 20),
                y: -20,
                width: 20,
                height: 20,
                speed: this.gameSpeed,
                rotation: 0
            });
        }
    }
    
    shoot() {
        if (this.gameState !== 'playing') return;
        
        const projectile = {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 8
        };
        
        this.projectiles.push(projectile);
        
        if (this.player.multiShot) {
            // Add side shots
            this.projectiles.push({
                ...projectile,
                x: projectile.x - 10
            });
            this.projectiles.push({
                ...projectile,
                x: projectile.x + 10
            });
        }
    }
    
    addScore(points) {
        this.score += points;
        window.gameApp.addXP(points / 10);
        this.updateUI();
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update best score
        const isNewRecord = window.gameApp.updateBestScore(this.score);
        window.gameApp.playerData.gamesPlayed++;
        window.gameApp.savePlayerData();
        
        // Show game over overlay
        document.getElementById('overlayTitle').textContent = 'Game Over';
        document.getElementById('overlayMessage').innerHTML = `
            Score: ${this.score.toLocaleString()}<br>
            Level: ${this.level}
            ${isNewRecord ? '<br><span style="color: #4facfe;">New Best Score!</span>' : ''}
        `;
        document.getElementById('gameOverlay').classList.remove('hidden');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.score / 2000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed += 0.5;
            this.updateUI();
            showToast(`Level ${this.level}!`, 'success');
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('overlayTitle').textContent = 'Game Paused';
            document.getElementById('overlayMessage').textContent = 'Take a break!';
            document.getElementById('gameOverlay').classList.remove('hidden');
            
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }
    
    resume() {
        this.gameState = 'playing';
        document.getElementById('gameOverlay').classList.add('hidden');
        this.gameLoop();
    }
    
    restart() {
        document.getElementById('gameOverlay').classList.add('hidden');
        this.resetGame();
        this.gameState = 'playing';
        this.gameLoop();
    }
    
    usePowerup(type) {
        // Check if player has this powerup available
        this.activatePowerup(type);
    }
    
    activatePowerup(type) {
        switch(type) {
            case 'shield':
                this.player.shield = true;
                setTimeout(() => this.player.shield = false, 5000);
                showToast('Shield activated!', 'success');
                break;
            case 'speed':
                this.player.speed = 8;
                setTimeout(() => this.player.speed = 5, 5000);
                showToast('Speed boost!', 'success');
                break;
            case 'multi':
                this.player.multiShot = true;
                setTimeout(() => this.player.multiShot = false, 5000);
                showToast('Multi-shot activated!', 'success');
                break;
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: '#ff6b6b'
            });
        }
    }
    
    createSparkle(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1,
                color: '#ffd700'
            });
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, this.lives));
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 30, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw player
        this.drawPlayer();
        
        // Draw enemies
        this.enemies.forEach(enemy => this.drawEnemy(enemy));
        
        // Draw projectiles
        this.projectiles.forEach(projectile => this.drawProjectile(projectile));
        
        // Draw coins
        this.coins.forEach(coin => this.drawCoin(coin));
        
        // Draw powerups
        this.powerups.forEach(powerup => this.drawPowerup(powerup));
        
        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));
    }
    
    drawStars() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 123) % this.canvas.width;
            const y = (i * 456 + Date.now() * 0.1) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = this.player.shield ? '#4facfe' : '#00f2fe';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player as a simple triangle/rocket shape
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        if (this.player.shield) {
            this.ctx.strokeStyle = '#4facfe';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 25, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawEnemy(enemy) {
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
    
    drawProjectile(projectile) {
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }
    
    drawCoin(coin) {
        this.ctx.save();
        this.ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2);
        this.ctx.rotate(coin.rotation);
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(-coin.width / 2, -coin.height / 2, coin.width, coin.height);
        this.ctx.restore();
    }
    
    drawPowerup(powerup) {
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
    }
    
    drawParticle(particle) {
        this.ctx.globalAlpha = particle.life;
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        this.ctx.globalAlpha = 1;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.spaceGame = new SpaceAdventureGame();
});

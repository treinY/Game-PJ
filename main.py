
from flask import Flask, render_template, jsonify, request
import random
import json

app = Flask(__name__)

# Game state storage (in production, use a database)
game_data = {
    'players': {},
    'leaderboard': [],
    'achievements': []
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/achievements')
def achievements():
    return render_template('achievements.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/api/game/start', methods=['POST'])
def start_game():
    player_name = request.json.get('player_name', 'Anonymous')
    game_id = random.randint(1000, 9999)
    
    game_session = {
        'id': game_id,
        'player': player_name,
        'score': 0,
        'level': 1,
        'lives': 3,
        'powerups': [],
        'time_started': None
    }
    
    return jsonify(game_session)

@app.route('/api/game/update', methods=['POST'])
def update_game():
    data = request.json
    # Update game state
    return jsonify({'status': 'success', 'data': data})

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    # Return top scores
    sample_scores = [
        {'name': 'Player1', 'score': 15000, 'level': 8},
        {'name': 'Player2', 'score': 12000, 'level': 6},
        {'name': 'Player3', 'score': 10000, 'level': 5},
        {'name': 'Player4', 'score': 8000, 'level': 4},
        {'name': 'Player5', 'score': 6000, 'level': 3}
    ]
    return jsonify(sample_scores)

@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    achievements = [
        {'name': 'First Steps', 'description': 'Complete your first level', 'unlocked': True},
        {'name': 'Speed Demon', 'description': 'Complete a level in under 30 seconds', 'unlocked': False},
        {'name': 'Collector', 'description': 'Collect 100 coins', 'unlocked': False},
        {'name': 'Survivor', 'description': 'Survive 5 minutes without losing a life', 'unlocked': False},
        {'name': 'Master', 'description': 'Reach level 10', 'unlocked': False}
    ]
    return jsonify(achievements)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

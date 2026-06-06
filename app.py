from flask import Flask, request, jsonify, send_from_directory
import secrets
import os

app = Flask(__name__, static_folder='static')

# In-memory user database
USERS = {
    "admin": "admin123",
    "user": "password"
}

# In-memory sessions (token -> username)
SESSIONS = {}

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/profile.html')
def serve_profile():
    return send_from_directory('static', 'profile.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data:
        return jsonify({"success": False, "message": "Invalid request"}), 400
        
    username = data.get('username')
    password = data.get('password')

    if username in USERS and USERS[username] == password:
        token = secrets.token_hex(32)
        SESSIONS[token] = username
        return jsonify({"success": True, "token": token})
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401

@app.route('/api/profile', methods=['GET'])
def get_profile():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    if token not in SESSIONS:
        return jsonify({"error": "Invalid session"}), 401
    
    username = SESSIONS[token]
    # Return mock profile data
    return jsonify({
        "username": username,
        "role": "Administrator" if username == "admin" else "Standard User",
        "email": f"{username}@example.com",
        "joined": "2024-01-01"
    })

@app.route('/api/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in SESSIONS:
            del SESSIONS[token]
    return jsonify({"success": True})

if __name__ == '__main__':
    # Ensure static directory exists
    os.makedirs('static', exist_ok=True)
    print("Starting server on http://127.0.0.1:5000")
    print("Available users:")
    print(" - admin: admin123")
    print(" - user: password")
    app.run(debug=True, port=5000)

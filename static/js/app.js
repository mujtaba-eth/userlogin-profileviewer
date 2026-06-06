// Add shake animation style dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Login functionality
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginBtn = document.getElementById('loginBtn');
        const errorMessage = document.getElementById('errorMessage');
        
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        // Reset state
        errorMessage.textContent = '';
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Save token and redirect
                localStorage.setItem('token', data.token);
                // Slight delay for animation effect
                setTimeout(() => {
                    window.location.href = '/profile.html';
                }, 200);
            } else {
                // Show error
                errorMessage.textContent = data.message || 'Invalid credentials. Please try again.';
                loginBtn.textContent = 'Log in';
                loginBtn.disabled = false;
                
                // Shake animation for error
                const panel = document.querySelector('.card');
                if (panel) {
                    panel.style.animation = 'none';
                    panel.offsetHeight; // trigger reflow
                    panel.style.animation = 'shake 0.4s';
                }
            }
        } catch (error) {
            errorMessage.textContent = 'Network error. Please try again later.';
            loginBtn.textContent = 'Log in';
            loginBtn.disabled = false;
        }
    });
}

// Profile functionality
async function fetchProfile() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Populate data
            document.getElementById('profileUsername').textContent = data.username;
            document.getElementById('profileEmail').textContent = data.email;
            document.getElementById('profileRole').textContent = data.role;
            document.getElementById('profileJoined').textContent = data.joined;
            document.getElementById('avatarInitial').textContent = data.username.charAt(0).toUpperCase();
            
            // Show profile, hide loading with a nice fade
            const loading = document.getElementById('loadingContainer');
            const profile = document.getElementById('profileContainer');
            
            loading.style.display = 'none';
            profile.style.display = 'block';
            profile.style.animation = 'fadeIn 0.4s ease-out forwards';
            
        } else {
            // Token invalid or expired
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Failed to fetch profile', error);
        document.getElementById('loadingContainer').innerHTML = `
            <div class="card" style="text-align: center; padding: 2rem;">
                <p style="color: var(--error-color)">Failed to load profile. Please refresh.</p>
                <button onclick="window.location.href='/'" class="btn" style="margin-top: 1rem;">Back to Login</button>
            </div>
        `;
    }
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        logoutBtn.textContent = 'Logging out...';
        
        if (token) {
            try {
                await fetch('/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (e) {
                console.error('Logout API failed', e);
            }
        }
        
        // Clear token and redirect
        localStorage.removeItem('token');
        window.location.href = '/';
    });
}

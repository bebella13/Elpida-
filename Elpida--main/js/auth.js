class AuthManager {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
        this.updateHeaderButtons();
    }

    loadUsers() {
        const users = localStorage.getItem('usuarios');
        return users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('usuarios', JSON.stringify(this.users));
    }

    register(email, senha, confirmarSenha) {
        if (senha !== confirmarSenha) {
            return { success: false, message: 'As senhas não coincidem!' };
        }

        if (senha.length < 6) {
            return { success: false, message: 'A senha deve ter pelo menos 6 caracteres!' };
        }

        if (this.users.find(user => user.email === email)) {
            return { success: false, message: 'Este e-mail já está cadastrado!' };
        }

        const newUser = {
            id: Date.now(),
            email: email,
            senha: this.hashPassword(senha),
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();

        this.login(email, password);
        
        return { success: true, message: 'Conta criada com sucesso!' };
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email);
        
        if (user && user.senha === this.hashPassword(password)) {
            this.setCurrentUser(user);
            return { success: true, message: 'Login realizado com sucesso!' };
        }
        
        return { success: false, message: 'E-mail ou senha incorretos!' };
    }

    logout() {
        localStorage.removeItem('elpida_currentUser');
        this.currentUser = null;
        this.updateHeaderButtons();
        return { success: true, message: 'Saída realizada com sucesso!' };
    }

    hashPassword(password) {
        return btoa(password + 'elpida_salt_2026');
    }

    setCurrentUser(user) {
        const userToStore = {
            id: user.id,
            email: user.email
        };
        localStorage.setItem('elpida_currentUser', JSON.stringify(userToStore));
        this.currentUser = userToStore;
        this.updateHeaderButtons();
    }

    getCurrentUser() {
        const user = localStorage.getItem('elpida_currentUser');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    updateHeaderButtons() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        const loginLink = nav.querySelector('a[href="../html/login.html"]');
        const cadastroLink = nav.querySelector('a[href="../html/cadastro.html"]');

        if (this.isLoggedIn()) {
            if (loginLink) loginLink.style.display = 'none';
            if (cadastroLink) cadastroLink.style.display = 'none';

            let logoutBtn = document.getElementById('logout-btn');
            if (!logoutBtn) {
                logoutBtn = document.createElement('a');
                logoutBtn.id = 'logout-btn';
                logoutBtn.href = '#';
                logoutBtn.textContent = 'Sair';
                logoutBtn.style.cursor = 'pointer';
                logoutBtn.onclick = (e) => {
                    e.preventDefault();
                    this.logout();
                    window.location.href = '../html/index.html';
                };
                nav.appendChild(logoutBtn);
            }
        } else {
            if (loginLink) loginLink.style.display = 'inline-block';
            if (cadastroLink) cadastroLink.style.display = 'inline-block';

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.remove();
        }
    }

    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    #logout-btn {
        background: #dc3545 !important;
        color: white !important;
    }
    
    #logout-btn:hover {
        background: #c82333 !important;
    }
`;
document.head.appendChild(style);

let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});
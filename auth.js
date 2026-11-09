document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register-form');
    const loginForm = document.querySelector('.login-form');

    // --- CADASTRO LOCAL ---
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullname').value.trim();
            let username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!username.startsWith('@')) {
                username = '@' + username;
            }

            // Busca usuários já salvos no navegador
            const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];

            // Verifica se o e-mail já existe
            if (usuarios.some(u => u.email === email)) {
                alert('Este e-mail já está cadastrado!');
                return;
            }

            // Salva o novo usuário
            usuarios.push({ fullName, username, email, password });
            localStorage.setItem('dissonance_users', JSON.stringify(usuarios));

            alert('Cadastro realizado com sucesso! Agora faça seu login.');
            window.location.href = 'login.html';
        });
    }

    // --- LOGIN LOCAL ---
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];
            const usuarioValido = usuarios.find(u => u.email === email && u.password === password);

            if (!usuarioValido) {
                alert('E-mail ou senha incorretos! Se ainda não tem conta, clique em Cadastre-se.');
                return;
            }

            localStorage.setItem('usuarioLogado', usuarioValido.username);
            window.location.href = 'home.html';
        });
    }
});

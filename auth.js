const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_lO9AFsjUKgwYnNiE3n7bEQ_sfmWHqv5';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register-form');
    const loginForm = document.querySelector('.login-form');

    // --- LÓGICA DE CADASTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullname').value.trim();
            let username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (!username.startsWith('@')) {
                username = '@' + username;
            }

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        username: username
                    }
                }
            });

            if (error) {
                alert('Erro ao cadastrar: ' + error.message);
                return;
            }

            window.location.href = 'confirmacao.html';
        });
    }

    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    alert('Você precisa confirmar seu e-mail antes de entrar! Verifique sua caixa de entrada ou spam.');
                } else {
                    alert('Erro ao entrar: ' + error.message);
                }
                return;
            }

            const userMeta = data.user.user_metadata;
            if (userMeta && userMeta.username) {
                localStorage.setItem('usuarioLogado', userMeta.username);
            }

            window.location.href = 'home.html';
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const usuarioAntigo = localStorage.getItem('usuarioLogado') || '@ouvinte';

    const themes = {
        pink: { textPink: '#f1c5d9', btnPink: '#f7bbd7' },
        cyan: { textPink: '#b2f2bb', btnPink: '#8ce99a' },
        purple: { textPink: '#e5dbff', btnPink: '#d0bfff' },
        yellow: { textPink: '#fff3bf', btnPink: '#ffe066' }
    };

    function aplicarTema(themeKey) {
        const selected = themes[themeKey] || themes.pink;
        document.documentElement.style.setProperty('--text-pink', selected.textPink);
        document.documentElement.style.setProperty('--btn-pink', selected.btnPink);
    }

    const temaSalvo = localStorage.getItem('temaSite') || 'pink';
    aplicarTema(temaSalvo);

    const usernameInput = document.getElementById('edit-username');
    const bioInput = document.getElementById('edit-bio');
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const btnRemoveAvatar = document.getElementById('btn-remove-avatar');

    if (greetingSpan) greetingSpan.textContent = usuarioAntigo;
    usernameInput.value = usuarioAntigo;
    bioInput.value = localStorage.getItem('bio_' + usuarioAntigo) || 'Em sintonia com indie, R&B e rock alternativo.';

    let currentAvatarBase64 = localStorage.getItem('avatar_' + usuarioAntigo) || '';
    if (currentAvatarBase64) {
        avatarPreview.innerHTML = `<img src="${currentAvatarBase64}" alt="Avatar">`;
    }

    const radioAtual = document.querySelector(`input[name="site-theme"][value="${temaSalvo}"]`);
    if (radioAtual) radioAtual.checked = true;

    document.querySelectorAll('input[name="site-theme"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            aplicarTema(e.target.value);
        });
    });

    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem é muito grande! Escolha uma foto de até 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            currentAvatarBase64 = e.target.result;
            avatarPreview.innerHTML = `<img src="${currentAvatarBase64}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    });

    btnRemoveAvatar.addEventListener('click', () => {
        currentAvatarBase64 = '';
        avatarPreview.innerHTML = '🎧';
        avatarInput.value = '';
    });

    const editForm = document.getElementById('edit-profile-form');
    editForm.addEventListener('submit', (event) => {
        event.preventDefault();

        let novoUsername = usernameInput.value.trim();
        if (!novoUsername.startsWith('@')) {
            novoUsername = '@' + novoUsername;
        }

        const novaBio = bioInput.value.trim();
        const temaEscolhido = document.querySelector('input[name="site-theme"]:checked').value;

        localStorage.setItem('usuarioLogado', novoUsername);
        localStorage.setItem('bio_' + novoUsername, novaBio);
        localStorage.setItem('temaSite', temaEscolhido);

        if (currentAvatarBase64) {
            localStorage.setItem('avatar_' + novoUsername, currentAvatarBase64);
        } else {
            localStorage.removeItem('avatar_' + novoUsername);
        }

        // Atualiza o nome nas reviews antigas e na lista de usuários locais
        if (novoUsername !== usuarioAntigo) {
            const todasReviews = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
            todasReviews.forEach(r => {
                if (r.username === usuarioAntigo) r.username = novoUsername;
            });
            localStorage.setItem('dissonance_reviews', JSON.stringify(todasReviews));

            const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];
            usuarios.forEach(u => {
                if (u.username === usuarioAntigo) u.username = novoUsername;
            });
            localStorage.setItem('dissonance_users', JSON.stringify(usuarios));
        }

        alert('Perfil e tema atualizados com sucesso!');
        window.location.href = 'perfil.html';
    });

    // Botão Sair
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'index.html';
        });
    }
});

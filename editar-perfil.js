document.addEventListener('DOMContentLoaded', () => {
    const usuarioAntigo = localStorage.getItem('usuarioLogado') || '@ouvinte';

    const presets = {
        pink: {
            bgHeader: '#000000',
            bgContent: '#ffffff',
            boxGray: '#f4f4f4',
            textPink: '#f1c5d9',
            btnPink: '#f7bbd7',
            textDark: '#000000',
            textMuted: '#333333'
        },
        dark: {
            bgHeader: '#09090b',
            bgContent: '#18181b',
            boxGray: '#27272a',
            textPink: '#f1c5d9',
            btnPink: '#f472b6',
            textDark: '#ffffff',
            textMuted: '#d4d4d8'
        },
        cyber: {
            bgHeader: '#020617',
            bgContent: '#0f172a',
            boxGray: '#1e293b',
            textPink: '#38bdf8',
            btnPink: '#38bdf8',
            textDark: '#f8fafc',
            textMuted: '#cbd5e1'
        },
        indie: {
            bgHeader: '#000000',
            bgContent: '#ffffff',
            boxGray: '#f4f4f4',
            textPink: '#b2f2bb',
            btnPink: '#8ce99a',
            textDark: '#000000',
            textMuted: '#333333'
        }
    };

    const inputsCor = {
        bgHeader: document.getElementById('color-bg-header'),
        bgContent: document.getElementById('color-bg-content'),
        boxGray: document.getElementById('color-box-gray'),
        textPink: document.getElementById('color-text-pink'),
        btnPink: document.getElementById('color-btn-pink'),
        textDark: document.getElementById('color-text-dark'),
        textMuted: document.getElementById('color-text-muted')
    };

    function aplicarTemaCustomizado(temaObj) {
        const root = document.documentElement;
        root.style.setProperty('--bg-header', temaObj.bgHeader);
        root.style.setProperty('--bg-content', temaObj.bgContent);
        root.style.setProperty('--box-gray', temaObj.boxGray);
        root.style.setProperty('--text-pink', temaObj.textPink);
        root.style.setProperty('--btn-pink', temaObj.btnPink);
        root.style.setProperty('--text-dark', temaObj.textDark);
        root.style.setProperty('--text-muted', temaObj.textMuted || temaObj.textDark);
        document.body.style.backgroundColor = temaObj.boxGray;

        Object.keys(inputsCor).forEach(chave => {
            if (inputsCor[chave] && temaObj[chave]) {
                inputsCor[chave].value = temaObj[chave];
            }
        });
    }

    let temaAtual = JSON.parse(localStorage.getItem('dissonance_custom_theme')) || presets.pink;
    aplicarTemaCustomizado(temaAtual);

    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const presetKey = btn.dataset.preset;
            if (presets[presetKey]) {
                temaAtual = { ...presets[presetKey] };
                aplicarTemaCustomizado(temaAtual);
            }
        });
    });

    Object.keys(inputsCor).forEach(chave => {
        if (inputsCor[chave]) {
            inputsCor[chave].addEventListener('input', (e) => {
                temaAtual[chave] = e.target.value;
                aplicarTemaCustomizado(temaAtual);
            });
        }
    });

    const usernameInput = document.getElementById('edit-username');
    const btnUnlockUsername = document.getElementById('btn-unlock-username');
    const bioInput = document.getElementById('edit-bio');
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const btnRemoveAvatar = document.getElementById('btn-remove-avatar');

    if (greetingSpan) greetingSpan.textContent = usuarioAntigo;
    usernameInput.value = usuarioAntigo;
    bioInput.value = localStorage.getItem('bio_' + usuarioAntigo) || 'Em sintonia com indie, R&B e rock alternativo.';

    if (btnUnlockUsername) {
        btnUnlockUsername.addEventListener('click', () => {
            if (usernameInput.hasAttribute('readonly')) {
                if (confirm('Tem certeza que deseja desbloquear e alterar seu @username?')) {
                    usernameInput.removeAttribute('readonly');
                    usernameInput.style.backgroundColor = 'var(--bg-content)';
                    usernameInput.style.color = 'var(--text-dark)';
                    usernameInput.style.cursor = 'text';
                    usernameInput.focus();
                    btnUnlockUsername.textContent = 'Desbloqueado 🔓';
                }
            }
        });
    }

    usernameInput.addEventListener('input', () => {
        let valor = usernameInput.value.replace(/[^a-zA-Z0-9_@]/g, '');
        if (!valor.startsWith('@')) {
            valor = '@' + valor.replace(/@/g, '');
        }
        usernameInput.value = valor;
    });

    let currentAvatarBase64 = localStorage.getItem('avatar_' + usuarioAntigo) || '';
    if (currentAvatarBase64) {
        avatarPreview.innerHTML = `<img src="${currentAvatarBase64}" alt="Avatar">`;
    }

    // CORREÇÃO: Adicionado o índice [0] em event.target.files[0]
    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const size = 200;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;

                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                currentAvatarBase64 = canvas.toDataURL('image/jpeg', 0.8);
                avatarPreview.innerHTML = `<img src="${currentAvatarBase64}" alt="Preview">`;
            };
            img.src = e.target.result;
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
        if (!novoUsername.startsWith('@')) novoUsername = '@' + novoUsername;

        if (novoUsername.length < 3 || novoUsername.length > 16) {
            alert('O nome de usuário deve ter entre 2 e 15 caracteres (além do @).');
            return;
        }

        const novaBio = bioInput.value.trim();

        try {
            localStorage.setItem('usuarioLogado', novoUsername);
            localStorage.setItem('bio_' + novoUsername, novaBio);
            localStorage.setItem('dissonance_custom_theme', JSON.stringify(temaAtual));

            if (currentAvatarBase64) {
                localStorage.setItem('avatar_' + novoUsername, currentAvatarBase64);
            } else {
                localStorage.removeItem('avatar_' + novoUsername);
            }

            if (novoUsername !== usuarioAntigo) {
                localStorage.removeItem('avatar_' + usuarioAntigo);
                localStorage.removeItem('bio_' + usuarioAntigo);

                const todasReviews = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
                todasReviews.forEach(r => { if (r.username === usuarioAntigo) r.username = novoUsername; });
                localStorage.setItem('dissonance_reviews', JSON.stringify(todasReviews));

                const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];
                usuarios.forEach(u => { if (u.username === usuarioAntigo) u.username = novoUsername; });
                localStorage.setItem('dissonance_users', JSON.stringify(usuarios));
            }

            alert('Perfil e tema personalizado salvos com sucesso!');
            window.location.href = 'perfil.html';
        } catch (err) {
            alert('Erro ao salvar: limite de espaço atingido.');
        }
    });

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'index.html';
        });
    }
});

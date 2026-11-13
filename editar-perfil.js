document.addEventListener('DOMContentLoaded', () => {
    let usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const avatarPreview = document.getElementById('avatar-preview');
    const avatarInput = document.getElementById('avatar-input');
    const removeAvatarBtn = document.getElementById('btn-remove-avatar');
    const usernameInput = document.getElementById('edit-username');
    const unlockUsernameBtn = document.getElementById('btn-unlock-username');
    const bioInput = document.getElementById('edit-bio');
    const editForm = document.getElementById('edit-profile-form');

    let avatarBase64 = localStorage.getItem('avatar_' + usuarioAtual) || '';

    function atualizarPreviewAvatar() {
        if (!avatarPreview) return;
        if (avatarBase64) {
            avatarPreview.innerHTML = '<img src="' + avatarBase64 + '" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">';
        } else {
            avatarPreview.innerHTML = '🎧';
        }
    }

    atualizarPreviewAvatar();

    if (usernameInput) {
        usernameInput.value = usuarioAtual;
    }

    if (unlockUsernameBtn && usernameInput) {
        unlockUsernameBtn.addEventListener('click', () => {
            usernameInput.removeAttribute('readonly');
            usernameInput.style.backgroundColor = 'var(--bg-content, #ffffff)';
            usernameInput.style.color = 'var(--text-dark, #000000)';
            usernameInput.style.cursor = 'text';
            usernameInput.focus();
            unlockUsernameBtn.textContent = 'Desbloqueado 🔓';
        });
    }

    if (bioInput) {
        bioInput.value = localStorage.getItem('bio_' + usuarioAtual) || 'Em sintonia com indie, R&B e rock alternativo.';
    }

    // --- UPLOAD DE AVATAR (PRESERVANDO GIFS ANIMADOS) ---
    if (avatarInput) {
        avatarInput.addEventListener('change', (event) => {
            const file = event.target.files.item(0);
            if (!file) return;

            if (file.type === 'image/gif') {
                if (file.size > 3.5 * 1024 * 1024) {
                    alert('O GIF é muito pesado! Escolha um arquivo de até 3.5MB.');
                    avatarInput.value = '';
                    return;
                }
                const readerGif = new FileReader();
                readerGif.onload = (e) => {
                    avatarBase64 = e.target.result;
                    atualizarPreviewAvatar();
                };
                readerGif.readAsDataURL(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 280;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    const minSide = Math.min(img.width, img.height);
                    const sx = (img.width - minSide) / 2;
                    const sy = (img.height - minSide) / 2;

                    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                    avatarBase64 = canvas.toDataURL('image/jpeg', 0.85);
                    atualizarPreviewAvatar();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            avatarBase64 = '';
            if (avatarInput) avatarInput.value = '';
            atualizarPreviewAvatar();
        });
    }

    // --- PERSONALIZAÇÃO DE TEMA (.btn-preset E <input type="color">) ---
    const presetsTema = {
        pink: {
            bgHeader: '#000000',
            bgContent: '#ffffff',
            boxGray: '#f4f4f4',
            textPink: '#f1c5d9',
            btnPink: '#f7bbd7',
            textDark: '#000000',
            textMuted: '#4a4a4a'
        },
        dark: {
            bgHeader: '#09090b',
            bgContent: '#18181b',
            boxGray: '#27272a',
            textPink: '#f1c5d9',
            btnPink: '#f7bbd7',
            textDark: '#ffffff',
            textMuted: '#a1a1aa'
        },
        cyber: {
            bgHeader: '#0f172a',
            bgContent: '#1e293b',
            boxGray: '#334155',
            textPink: '#38bdf8',
            btnPink: '#38bdf8',
            textDark: '#f8fafc',
            textMuted: '#94a3b8'
        },
        indie: {
            bgHeader: '#14532d',
            bgContent: '#f0fdf4',
            boxGray: '#dcfce7',
            textPink: '#8ce99a',
            btnPink: '#8ce99a',
            textDark: '#052e16',
            textMuted: '#166534'
        }
    };

    const inputBgContent = document.getElementById('color-bg-content');
    const inputBoxGray = document.getElementById('color-box-gray');
    const inputBtnPink = document.getElementById('color-btn-pink');
    const inputTextPink = document.getElementById('color-text-pink');
    const inputTextDark = document.getElementById('color-text-dark');

    let temaAtual = JSON.parse(localStorage.getItem('dissonance_custom_theme')) || { ...presetsTema.pink };

    function aplicarTemaNaTela(t) {
        const root = document.documentElement;
        root.style.setProperty('--bg-header', t.bgHeader);
        root.style.setProperty('--bg-content', t.bgContent);
        root.style.setProperty('--box-gray', t.boxGray);
        root.style.setProperty('--text-pink', t.textPink);
        root.style.setProperty('--btn-pink', t.btnPink);
        root.style.setProperty('--text-dark', t.textDark);
        root.style.setProperty('--text-muted', t.textMuted || t.textDark);
        document.body.style.backgroundColor = t.boxGray;
        document.body.style.color = t.textDark;

        if (inputBgContent) inputBgContent.value = t.bgContent;
        if (inputBoxGray) inputBoxGray.value = t.boxGray;
        if (inputBtnPink) inputBtnPink.value = t.btnPink;
        if (inputTextPink) inputTextPink.value = t.textPink;
        if (inputTextDark) inputTextDark.value = t.textDark;

        localStorage.setItem('dissonance_custom_theme', JSON.stringify(t));
    }

    aplicarTemaNaTela(temaAtual);

    document.querySelectorAll('.btn-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.preset;
            if (key && presetsTema[key]) {
                temaAtual = { ...presetsTema[key] };
                aplicarTemaNaTela(temaAtual);
            }
        });
    });

    [inputBgContent, inputBoxGray, inputBtnPink, inputTextPink, inputTextDark].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', () => {
            temaAtual = {
                bgHeader: temaAtual.bgHeader || '#000000',
                bgContent: inputBgContent ? inputBgContent.value : temaAtual.bgContent,
                boxGray: inputBoxGray ? inputBoxGray.value : temaAtual.boxGray,
                btnPink: inputBtnPink ? inputBtnPink.value : temaAtual.btnPink,
                textPink: inputTextPink ? inputTextPink.value : temaAtual.textPink,
                textDark: inputTextDark ? inputTextDark.value : temaAtual.textDark,
                textMuted: inputTextDark ? inputTextDark.value : temaAtual.textDark
            };
            aplicarTemaNaTela(temaAtual);
        });
    });

    // --- SALVAR ALTERAÇÕES DO PERFIL ---
    if (editForm) {
        editForm.addEventListener('submit', (event) => {
            event.preventDefault();

            let novoUser = usernameInput ? usernameInput.value.trim() : usuarioAtual;
            if (!novoUser.startsWith('@')) novoUser = '@' + novoUser;

            try {
                // Migra dados caso o @username tenha sido alterado
                if (novoUser !== usuarioAtual) {
                    const todasReviews = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
                    todasReviews.forEach(r => {
                        if (r.username === usuarioAtual) r.username = novoUser;
                    });
                    localStorage.setItem('dissonance_reviews', JSON.stringify(todasReviews));

                    const chavesMigrar = ['dissonance_vinyls_', 'dissonance_pet_', 'dissonance_note_', 'dissonance_apps_', 'dissonance_following_'];
                    chavesMigrar.forEach(prefixo => {
                        const dado = localStorage.getItem(prefixo + usuarioAtual);
                        if (dado) {
                            localStorage.setItem(prefixo + novoUser, dado);
                            localStorage.removeItem(prefixo + usuarioAtual);
                        }
                    });

                    localStorage.removeItem('avatar_' + usuarioAtual);
                    localStorage.removeItem('bio_' + usuarioAtual);
                    localStorage.setItem('usuarioLogado', novoUser);
                    usuarioAtual = novoUser;
                }

                if (avatarBase64) {
                    localStorage.setItem('avatar_' + usuarioAtual, avatarBase64);
                } else {
                    localStorage.removeItem('avatar_' + usuarioAtual);
                }

                if (bioInput) {
                    localStorage.setItem('bio_' + usuarioAtual, bioInput.value.trim());
                }

                window.location.href = 'perfil.html';
            } catch (err) {
                alert('O GIF escolhido ultrapassou o limite de armazenamento do navegador (5MB). Tente um GIF mais leve.');
            }
        });
    }

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
logoutBtn.addEventListener('click', (event) => {
event.preventDefault();
localStorage.removeItem('usuarioLogado');
window.location.href = 'index.html';
});
}
});
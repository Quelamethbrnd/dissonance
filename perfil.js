document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    const perfilAlvo = (userParam && userParam.trim() !== '') ? userParam.trim() : usuarioAtual;
    const ehMeuPerfil = (perfilAlvo === usuarioAtual);

    const savedAvatar = localStorage.getItem('avatar_' + perfilAlvo);
    const avatarContainer = document.querySelector('.profile-avatar-large');
    if (savedAvatar && avatarContainer) {
        avatarContainer.innerHTML = '<img src="' + savedAvatar + '" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">';
    } else if (avatarContainer && !ehMeuPerfil) {
        const inicial = perfilAlvo.replace('@', '').charAt(0).toUpperCase() || 'U';
        avatarContainer.textContent = inicial;
    }

    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const profileUsername = document.getElementById('profile-username');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;
    if (profileUsername) profileUsername.textContent = perfilAlvo;

    const biosPadrao = {
        '@ana_indie': 'Apaixonada por indie rock, shoegaze e vinis coloridos.',
        '@lucas_rock': 'Colecionador de clássicos do rock alternativo e grunge.'
    };
    const bioText = document.getElementById('profile-bio-text');
    const savedBio = localStorage.getItem('bio_' + perfilAlvo) || biosPadrao[perfilAlvo];
    if (savedBio && bioText) bioText.textContent = savedBio;

    function obterSeguidos() {
        return JSON.parse(localStorage.getItem('dissonance_following_' + usuarioAtual)) || [];
    }

    function contarSeguidoresDe(alvo) {
        let total = (alvo === '@ana_indie' || alvo === '@lucas_rock') ? 12 : 0;
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave && chave.startsWith('dissonance_following_')) {
                const lista = JSON.parse(localStorage.getItem(chave)) || [];
                if (lista.includes(alvo)) total++;
            }
        }
        return total;
    }

    const editProfileBtn = document.querySelector('.btn-edit-profile, a[href="editar-perfil.html"]');
    const statsContainer = document.querySelector('.profile-stats');

    if (statsContainer && !document.getElementById('stat-followers')) {
        const statBox = document.createElement('div');
        statBox.className = 'stat-box';
        statBox.innerHTML = '<strong id="stat-followers">' + contarSeguidoresDe(perfilAlvo) + '</strong><span>SEGUIDORES</span>';
        statsContainer.appendChild(statBox);
    }

    if (!ehMeuPerfil && editProfileBtn) {
        const followBtn = document.createElement('button');
        followBtn.type = 'button';
        followBtn.className = 'btn-follow-user';

        const atualizarEstadoBotao = () => {
            const jaSegue = obterSeguidos().includes(perfilAlvo);
            followBtn.textContent = jaSegue ? '✓ Seguindo' : '+ Seguir';
            followBtn.classList.toggle('following', jaSegue);
            const statFollowers = document.getElementById('stat-followers');
            if (statFollowers) statFollowers.textContent = contarSeguidoresDe(perfilAlvo);
        };

        atualizarEstadoBotao();

        followBtn.addEventListener('click', () => {
            let seguidos = obterSeguidos();
            if (seguidos.includes(perfilAlvo)) {
                seguidos = seguidos.filter(u => u !== perfilAlvo);
            } else {
                seguidos.push(perfilAlvo);
            }
            localStorage.setItem('dissonance_following_' + usuarioAtual, JSON.stringify(seguidos));
            atualizarEstadoBotao();
        });

        editProfileBtn.replaceWith(followBtn);
    }

    const vinylStack = document.getElementById('vinyl-stack');
    const addVinylForm = document.getElementById('add-vinyl-form');
    const statVinyls = document.getElementById('stat-vinyls');
    const vinylCoverInput = document.getElementById('vinyl-cover-input');
    const vinylUploadLabel = document.getElementById('vinyl-upload-label');
    let capaQuadradaBase64 = '';

    if (!ehMeuPerfil && addVinylForm) {
        addVinylForm.style.display = 'none';
    }
    const vinisIniciais = [
        { id: 101, album: 'Puberty 2', artist: 'Mitski', color: '#2b2d42', coverImage: 'imgs/Mitskipuberty2.jpg', listened: true },
        { id: 102, album: 'Blonde', artist: 'Frank Ocean', color: '#f8f9fa', coverImage: 'imgs/Blonde_-_Frank_Ocean.jpeg', listened: true },
        { id: 103, album: 'In Rainbows', artist: 'Radiohead', color: '#d9480f', coverImage: 'imgs/Radiohead_-_In_Rainbows.jpg', listened: false },
        { id: 104, album: 'DAMN.', artist: 'Kendrick Lamar', color: '#82c91e', coverImage: 'imgs/Kendrick_Lamar_-_Damn.png', listened: false }
    ];

    function obterVinis() {
        const chave = 'dissonance_vinyls_' + perfilAlvo;
        const salvos = localStorage.getItem(chave);
        if (!salvos) {
            if (ehMeuPerfil) {
                localStorage.setItem(chave, JSON.stringify(vinisIniciais));
                return vinisIniciais;
            }
            return vinisIniciais.slice(0, 2);
        }
        return JSON.parse(salvos);
    }

    function salvarVinis(lista) {
        if (!ehMeuPerfil) return;
        localStorage.setItem('dissonance_vinyls_' + usuarioAtual, JSON.stringify(lista));
    }

    function obterCorTextoContraste(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminancia > 0.55 ? '#000000' : '#ffffff';
    }

    if (vinylCoverInput && ehMeuPerfil) {
        vinylCoverInput.addEventListener('change', (event) => {
            const file = event.target.files.item(0);
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 450;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    const minSide = Math.min(img.width, img.height);
                    const sx = (img.width - minSide) / 2;
                    const sy = (img.height - minSide) / 2;
                    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                    capaQuadradaBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    if (vinylUploadLabel) {
                        vinylUploadLabel.textContent = '✓ Capa Pronta';
                        vinylUploadLabel.classList.add('has-image');
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function renderizarVinis() {
        if (!vinylStack) return;
        const lista = obterVinis();
        vinylStack.innerHTML = '';
        const ouvidosCount = lista.filter(v => v.listened).length;
        if (statVinyls) statVinyls.textContent = ouvidosCount + '/' + lista.length;

        if (lista.length === 0) {
            vinylStack.innerHTML = '<p style="font-size: 0.85rem; color: #aaa;">A estante 3D está vazia.</p>';
            return;
        }

        const metade = Math.ceil(lista.length / 2);
        lista.forEach((vinil, index) => {
            const item3D = document.createElement('div');
            item3D.classList.add('vinyl-3d-item');
            if (vinil.listened) item3D.classList.add('listened');
            item3D.classList.add(index < metade ? 'tilt-bottom' : 'tilt-top');
            item3D.dataset.id = vinil.id;

            const corFundo = vinil.color || '#f7bbd7';
            const corTexto = obterCorTextoContraste(corFundo);
            const capa = vinil.coverImage || vinil.spineImage || 'imgs/Blonde_-_Frank_Ocean.jpeg';
            const checkIcon = vinil.listened ? '✓' : '';
            const btnRemoverHTML = ehMeuPerfil
                ? '<button type="button" class="btn-remove-vinyl" title="Remover" data-id="' + vinil.id + '">✕</button>'
                : '';

            item3D.innerHTML =
                '<div class="vinyl-spine-face" style="background-color:' + corFundo + ';color:' + corTexto + ';">' +
                    '<div class="vinyl-spine-left">' +
                        '<div class="vinyl-checkbox">' + checkIcon + '</div>' +
                        '<div class="vinyl-title-group">' +
                            '<span class="vinyl-album-name">' + escapeHTML(vinil.album) + '</span>' +
                            '<span class="vinyl-artist-name">' + escapeHTML(vinil.artist) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="vinyl-spine-right">' + btnRemoverHTML + '</div>' +
                '</div>' +
                '<div class="vinyl-cover-plane" style="background-image:url(\'' + capa + '\');"></div>';

            vinylStack.appendChild(item3D);
        });
    }

    if (vinylStack && ehMeuPerfil) {
        vinylStack.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.btn-remove-vinyl');
            if (removeBtn) {
                event.stopPropagation();
                const idRemover = Number(removeBtn.dataset.id);
                salvarVinis(obterVinis().filter(v => v.id !== idRemover));
                renderizarVinis();
                return;
            }
            const item3D = event.target.closest('.vinyl-3d-item');
            if (item3D) {
                const idToggle = Number(item3D.dataset.id);
                const lista = obterVinis();
                const item = lista.find(v => v.id === idToggle);
                if (item) {
                    item.listened = !item.listened;
                    salvarVinis(lista);
                    renderizarVinis();
                }
            }
        });
    }

    if (addVinylForm && ehMeuPerfil) {
        addVinylForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const album = document.getElementById('vinyl-album').value.trim();
            const artist = document.getElementById('vinyl-artist').value.trim();
            const colorInput = document.getElementById('vinyl-spine-color');
            let color = colorInput.value;
            if (!album || !artist) return;

            let capaFinal = capaQuadradaBase64;
            if (!capaFinal) {
                capaFinal = await buscarCapaOnline(album + ' ' + artist);
            }

            if (color.toLowerCase() === '#f7bbd7') {
                color = await extrairCorDominante(capaFinal);
            }

            try {
                const lista = obterVinis();
                lista.unshift({
                    id: Date.now(),
                    album: album,
                    artist: artist,
                    color: color,
                    coverImage: capaFinal,
                    listened: false
                });
                salvarVinis(lista);
                addVinylForm.reset();
                document.getElementById('vinyl-spine-color').value = '#f7bbd7';
                capaQuadradaBase64 = '';
                if (vinylUploadLabel) {
                    vinylUploadLabel.textContent = '📷 Imagem';
                    vinylUploadLabel.classList.remove('has-image');
                }
                renderizarVinis();
            } catch (err) {
                alert('Limite de armazenamento atingido.');
            }
        });
    }
    const reviewsList = document.getElementById('user-reviews-list');
    const statReviews = document.getElementById('stat-reviews');
    const statLikes = document.getElementById('stat-likes');

    function montarAvatarHTML(username) {
        const foto = localStorage.getItem('avatar_' + username);
        if (foto) {
            return '<img src="' + foto + '" alt="' + escapeHTML(username) + '" class="review-avatar">';
        }
        const inicial = username.replace('@', '').charAt(0).toUpperCase() || 'U';
        return '<div class="review-avatar">' + inicial + '</div>';
    }

    function carregarMinhasReviews(idAberto = null) {
        const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
        const doPerfil = todas.filter(r => r.username === perfilAlvo);

        if (statReviews) statReviews.textContent = doPerfil.length;
        const totalCurtidas = doPerfil.reduce((soma, item) => soma + (item.likes || 0), 0);
        if (statLikes) statLikes.textContent = totalCurtidas;

        if (!reviewsList) return;
        if (doPerfil.length === 0) {
            reviewsList.innerHTML = '<p>Nenhuma review publicada ainda.</p>';
            return;
        }

        reviewsList.innerHTML = '';
        doPerfil.forEach(review => {
            const comentarios = review.commentsList || [];
            const card = document.createElement('article');
            card.classList.add('review-card');
            card.dataset.id = review.id;

            let comentariosHTML = '';
            comentarios.forEach(c => {
                const btnDel = (c.author === usuarioAtual)
                    ? '<button type="button" class="btn-del-comment" data-cid="' + c.id + '" style="background:none;border:none;color:#c92a2a;font-weight:bold;cursor:pointer;">✕</button>'
                    : '';
                comentariosHTML +=
                    '<div class="perfil-comment-item">' +
                        '<span><strong>' + escapeHTML(c.author) + ':</strong> ' + escapeHTML(c.text) + '</span>' +
                        btnDel +
                    '</div>';
            });

            if (!comentariosHTML) {
                comentariosHTML = '<small style="opacity:0.7;">Nenhum comentário ainda.</small>';
            }

            const openClass = (idAberto === review.id) ? 'open' : '';
            const jaCurtiu = (review.likedBy || []).includes(usuarioAtual);
            const estiloLike = jaCurtiu ? 'style="background-color: var(--btn-pink); color: #000000;"' : '';
            const textoLike = jaCurtiu ? '♥ Curtido (' + (review.likes || 0) + ')' : '♡ Curtir (' + (review.likes || 0) + ')';

            const avatarHTML = montarAvatarHTML(review.username);
            const anexoHTML = review.media_url
                ? '<img src="' + review.media_url + '" alt="Anexo do post" class="review-media-attachment">'
                : '';
            const btnExcluirHTML = ehMeuPerfil
                ? '<button type="button" class="btn-delete-review" data-id="' + review.id + '">Excluir review</button>'
                : '';

            card.innerHTML =
                avatarHTML +
                '<div class="review-body">' +
                    '<div class="review-header">' +
                        '<strong>' + escapeHTML(review.album_name) + '</strong>' +
                        '<span>' + escapeHTML(review.rating) + '</span>' +
                    '</div>' +
                    '<p class="review-text">' + escapeHTML(review.comment) + '</p>' +
                    anexoHTML +
                    '<div class="review-footer-row">' +
                        '<div class="review-actions-group">' +
                            '<button type="button" class="action-btn-perfil btn-like-perfil" ' + estiloLike + '>' + textoLike + '</button>' +
                            '<button type="button" class="action-btn-perfil btn-toggle-perfil-comments">💬 Comentários (' + comentarios.length + ')</button>' +
                        '</div>' +
                        btnExcluirHTML +
                    '</div>' +
                    '<div class="perfil-comments-box ' + openClass + '">' +
                        '<div class="perfil-comments-list">' + comentariosHTML + '</div>' +
                        '<form class="perfil-comment-form">' +
                            '<input type="text" placeholder="Escreva um comentário..." required>' +
                            '<button type="submit" class="btn-send-perfil-comment">Enviar</button>' +
                        '</form>' +
                    '</div>' +
                '</div>';

            reviewsList.appendChild(card);
        });
    }

    if (reviewsList) {
        reviewsList.addEventListener('click', (event) => {
            const card = event.target.closest('.review-card');
            if (!card) return;
            const reviewId = Number(card.dataset.id);

            const deleteBtn = event.target.closest('.btn-delete-review');
            if (deleteBtn && ehMeuPerfil) {
                if (!confirm('Tem certeza que deseja apagar esta review?')) return;
                let todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
                todas = todas.filter(r => r.id !== reviewId);
                localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
                carregarMinhasReviews();
                return;
            }

            const likeBtn = event.target.closest('.btn-like-perfil');
            if (likeBtn) {
                const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
                const item = todas.find(r => r.id === reviewId);
                if (item) {
                    if (!item.likedBy) item.likedBy = [];

                    if (item.likedBy.includes(usuarioAtual)) {
                        item.likedBy = item.likedBy.filter(u => u !== usuarioAtual);
                        item.likes = Math.max(0, (item.likes || 1) - 1);
                    } else {
                        item.likedBy.push(usuarioAtual);
                        item.likes = (item.likes || 0) + 1;
                    }

                    localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
                    carregarMinhasReviews();
                }
                return;
            }

            const toggleBtn = event.target.closest('.btn-toggle-perfil-comments');
            if (toggleBtn) {
                const box = card.querySelector('.perfil-comments-box');
                box.classList.toggle('open');
                return;
            }

            const delCommentBtn = event.target.closest('.btn-del-comment');
            if (delCommentBtn) {
                const cid = Number(delCommentBtn.dataset.cid);
                const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
                const item = todas.find(r => r.id === reviewId);
                if (item && item.commentsList) {
                    item.commentsList = item.commentsList.filter(c => c.id !== cid);
                    localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
                    carregarMinhasReviews(reviewId);
                }
            }
        });

        reviewsList.addEventListener('submit', (event) => {
            const form = event.target.closest('.perfil-comment-form');
            if (!form) return;
            event.preventDefault();

            const card = form.closest('.review-card');
            const reviewId = Number(card.dataset.id);
            const input = form.querySelector('input');
            const text = input.value.trim();
            if (!text) return;

            const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
            const item = todas.find(r => r.id === reviewId);
            if (item) {
                if (!item.commentsList) item.commentsList = [];
                item.commentsList.push({
                    id: Date.now(),
                    author: usuarioAtual,
                    text: text
                });
                localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
                carregarMinhasReviews(reviewId);
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

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    renderizarVinis();
    carregarMinhasReviews();
});

async function buscarCapaOnline(termoBusca) {
    try {
        const dominio = ['itunes', 'apple', 'com'].join('.');
        const caminho = '/search?term=' + encodeURIComponent(termoBusca) + '&media=music&entity=album&limit=1';
        const respItunes = await fetch('https://' + dominio + caminho);
        if (respItunes.ok) {
            const dadosItunes = await respItunes.json();
            if (dadosItunes.results && dadosItunes.results.length > 0) {
                return dadosItunes.results.at(0).artworkUrl100.replace('100x100bb', '600x600bb');
            }
        }
    } catch (e) {}

    return 'imgs/Blonde_-_Frank_Ocean.jpeg';
}

function extrairCorDominante(urlImagem) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 20;
                canvas.height = 20;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 20, 20);

                const pixels = ctx.getImageData(0, 0, 20, 20).data;
                let r = 0, g = 0, b = 0, total = 0;

            for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            total++;
            }
            const toHex = (n) => Math.round(n / total).toString(16).padStart(2, '0');
            resolve('#' + toHex(r) + toHex(g) + toHex(b));
            } catch (e) {
            resolve('#f7bbd7');
            }
            };
            img.onerror = () => resolve('#f7bbd7');
            img.src = urlImagem;
            });
            }
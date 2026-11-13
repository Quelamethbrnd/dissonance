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
    // --- BOLHA DE PENSAMENTO REAL + MODAL CUSTOMIZADO (FEED) ---
    function abrirModalEditarNotaFeed(chaveNota, bubbleEl) {
        const atual = localStorage.getItem(chaveNota) || '';
        const overlay = document.createElement('div');
        overlay.className = 'note-modal-overlay';

        overlay.innerHTML =
            '<div class="note-modal-box">' +
                '<div class="note-modal-top">' +
                    '<span class="note-modal-badge">♪ PENSAMENTO / MÚSICA</span>' +
                    '<button type="button" class="note-modal-close" id="close-note-modal">✕</button>' +
                '</div>' +
                '<h3 style="margin:0 0 4px 0; font-size:1.2rem; font-weight:900;">O que está na sua cabeça?</h3>' +
                '<small style="opacity:0.8;">Compartilhe uma música ou pensamento curto no seu avatar.</small>' +
                '<input type="text" id="custom-note-input" class="note-modal-input" maxlength="45" placeholder="Ex: Ouvindo NFR! no repeat..." value="' + escapeHTML(atual) + '">' +
                '<div style="text-align:right; font-size:0.72rem; font-weight:800; opacity:0.7;"><span id="note-char-count">' + atual.length + '</span>/45</div>' +
                '<div class="note-modal-footer">' +
                    '<button type="button" class="note-btn-clear" id="clear-note-btn">Remover Nota</button>' +
                    '<button type="button" class="note-btn-save" id="save-note-btn">Salvar na Bolha ▸</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        const inputEl = overlay.querySelector('#custom-note-input');
        const countEl = overlay.querySelector('#note-char-count');
        inputEl.focus();
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);

        inputEl.addEventListener('input', () => {
            countEl.textContent = inputEl.value.length;
        });

        const fechar = () => overlay.remove();
        overlay.querySelector('#close-note-modal').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });

        overlay.querySelector('#clear-note-btn').addEventListener('click', () => {
            localStorage.removeItem(chaveNota);
            bubbleEl.textContent = '...';
            fechar();
        });

        const salvar = () => {
            const limpa = inputEl.value.trim().slice(0, 45);
            if (limpa) {
                localStorage.setItem(chaveNota, limpa);
                bubbleEl.textContent = '♪ ' + limpa;
            } else {
                localStorage.removeItem(chaveNota);
                bubbleEl.textContent = '+ Deixar nota...';
            }
            fechar();
        };

        overlay.querySelector('#save-note-btn').addEventListener('click', salvar);
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') salvar(); });
    }

    if (avatarContainer) {
        const wrapper = document.createElement('div');
        wrapper.className = 'avatar-note-wrapper';
        avatarContainer.parentNode.insertBefore(wrapper, avatarContainer);
        wrapper.appendChild(avatarContainer);

        const notasPadraoComunidade = {
            '@ana_indie': 'viciada no novo do Slowdive...',
            '@lucas_rock': 'ouvindo In Rainbows na chuva'
        };

        const chaveNota = 'dissonance_note_' + perfilAlvo;
        const notaDoBanco = localStorage.getItem(chaveNota);
        const notaSalva = notaDoBanco !== null
            ? notaDoBanco
            : (ehMeuPerfil ? '+ Deixar nota...' : (notasPadraoComunidade[perfilAlvo] || ''));

        if (notaSalva) {
            const bubble = document.createElement('div');
            bubble.className = 'music-note-bubble';
            bubble.textContent = notaSalva.startsWith('+') ? notaSalva : '♪ ' + notaSalva.replace(/^♪\s*/, '');

            const trailLg = document.createElement('span');
            trailLg.className = 'music-note-trail-lg';
            const trailSm = document.createElement('span');
            trailSm.className = 'music-note-trail-sm';

            let expandida = false;
            const alternarExpansao = () => {
                expandida = !expandida;
                if (expandida) {
                    bubble.style.whiteSpace = 'normal';
                    bubble.style.maxWidth = '310px';
                    bubble.style.width = 'max-content';
                    bubble.style.borderRadius = '16px';
                    bubble.style.top = 'auto';
                    bubble.style.bottom = 'calc(100% + 14px)';
                    bubble.style.textAlign = 'center';
                    bubble.style.lineHeight = '1.35';
                    bubble.style.zIndex = '50';
                } else {
                    bubble.style.whiteSpace = 'nowrap';
                    bubble.style.maxWidth = '240px';
                    bubble.style.width = '';
                    bubble.style.borderRadius = '999px';
                    bubble.style.top = '-44px';
                    bubble.style.bottom = '';
                    bubble.style.textAlign = '';
                    bubble.style.lineHeight = '';
                    bubble.style.zIndex = '15';
                }
            };

            if (ehMeuPerfil) {
                bubble.title = 'Clique para editar ou ler sua nota completa';
                bubble.addEventListener('click', () => {
                    abrirModalEditarNotaFeed(chaveNota, bubble);
                });
            } else {
                bubble.title = 'Clique para ler a nota completa';
                bubble.addEventListener('click', alternarExpansao);
            }

            wrapper.prepend(trailSm);
            wrapper.prepend(trailLg);
            wrapper.prepend(bubble);
        }
    }

    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const profileUsername = document.getElementById('profile-username');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;
    if (profileUsername) profileUsername.textContent = perfilAlvo;

    const biosPadrao = {
        '@ana_indie': 'Apaixonada por indie rock, shoegaze e vinis coloridos.',
        '@lucas_rock': 'Colecionador de classicos do rock alternativo e grunge.'
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
            followBtn.textContent = jaSegue ? 'Seguindo' : '+ Seguir';
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
                        vinylUploadLabel.textContent = 'Capa Pronta';
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
            vinylStack.innerHTML = '<p style="font-size: 0.85rem; color: #aaa;">A estante 3D esta vazia.</p>';
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
                ? '<button type="button" class="btn-remove-vinyl" title="Remover" data-id="' + vinil.id + '">X</button>'
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
    const vinylModal = document.getElementById('vinyl-display-modal');
    const closeVinylModalBtn = document.getElementById('btn-close-vinyl-modal');
    const showcaseSleeve = document.getElementById('showcase-sleeve');
    const showcaseDisc = document.getElementById('showcase-disc');
    const showcaseLabel = document.getElementById('showcase-disc-label');
    const showcaseTitle = document.getElementById('showcase-album-title');
    const showcaseArtist = document.getElementById('showcase-artist-name');
    const btnToggleListened = document.getElementById('btn-showcase-toggle-listened');
    const btnShowcaseForum = document.getElementById('btn-showcase-forum');
    let vinilSelecionadoId = null;

    function abrirDisplayVinil(vinil) {
        if (!vinylModal || !vinil) return;
        vinilSelecionadoId = vinil.id;
        const capa = vinil.coverImage || vinil.spineImage || 'imgs/Blonde_-_Frank_Ocean.jpeg';
        const corDisco = vinil.color || '#f7bbd7';

        if (showcaseSleeve) showcaseSleeve.style.backgroundImage = 'url("' + capa + '")';
        if (showcaseLabel) showcaseLabel.style.backgroundImage = 'url("' + capa + '")';
        if (showcaseDisc) showcaseDisc.style.backgroundColor = corDisco;
        if (showcaseTitle) showcaseTitle.textContent = vinil.album;
        if (showcaseArtist) showcaseArtist.textContent = vinil.artist;

        if (btnShowcaseForum) {
            btnShowcaseForum.href = 'album.html?album=' + encodeURIComponent(vinil.album) + '&artist=' + encodeURIComponent(vinil.artist);
        }

        if (btnToggleListened) {
            if (!ehMeuPerfil) {
                btnToggleListened.style.display = 'none';
            } else {
                btnToggleListened.style.display = 'inline-block';
                btnToggleListened.textContent = vinil.listened ? 'Ouvido (Desmarcar)' : 'Marcar como Ouvido';
            }
        }

        vinylModal.classList.add('open');
    }

    if (closeVinylModalBtn && vinylModal) {
        closeVinylModalBtn.addEventListener('click', () => vinylModal.classList.remove('open'));
        vinylModal.addEventListener('click', (e) => {
            if (e.target === vinylModal) vinylModal.classList.remove('open');
        });
    }
    if (btnToggleListened) {
        btnToggleListened.addEventListener('click', () => {
            if (!ehMeuPerfil || vinilSelecionadoId === null) return;
            const lista = obterVinis();
            const item = lista.find(v => v.id === vinilSelecionadoId);
            if (item) {
                item.listened = !item.listened;
                salvarVinis(lista);
                renderizarVinis();
                atualizarPetMusical();
                btnToggleListened.textContent = item.listened ? 'Ouvido (Desmarcar)' : 'Marcar como Ouvido';
            }
        });
    }

    if (vinylStack) {
        vinylStack.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.btn-remove-vinyl');
            if (removeBtn && ehMeuPerfil) {
                event.stopPropagation();
                const idRemover = Number(removeBtn.dataset.id);
                salvarVinis(obterVinis().filter(v => v.id !== idRemover));
                renderizarVinis();
                atualizarPetMusical();
                return;
            }
            const item3D = event.target.closest('.vinyl-3d-item');
            if (item3D) {
                const idClicado = Number(item3D.dataset.id);
                const vinilEncontrado = obterVinis().find(v => v.id === idClicado);
                abrirDisplayVinil(vinilEncontrado);
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
                    vinylUploadLabel.textContent = 'Imagem';
                    vinylUploadLabel.classList.remove('has-image');
                }
                renderizarVinis();
                atualizarPetMusical();
            } catch (err) {
                alert('Limite de armazenamento atingido.');
            }
        });
    }
    const reviewsList = document.getElementById('user-reviews-list');
    const statReviews = document.getElementById('stat-reviews');
    const statLikes = document.getElementById('stat-likes');
    const sortReviewsSelect = document.getElementById('perfil-sort-reviews');

    function contarEstrelas(ratingStr) {
        if (!ratingStr) return 0;
        const estrelas = ratingStr.match(/★/g);
        return estrelas ? estrelas.length : 0;
    }

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
        let doPerfil = todas.filter(r => r.username === perfilAlvo);

        if (statReviews) statReviews.textContent = doPerfil.length;
        const totalCurtidas = doPerfil.reduce((soma, item) => soma + (item.likes || 0), 0);
        if (statLikes) statLikes.textContent = totalCurtidas;

        const criterio = sortReviewsSelect ? sortReviewsSelect.value : 'recentes';
        doPerfil = [...doPerfil].sort((a, b) => {
            if (criterio === 'antigas') return a.id - b.id;
            if (criterio === 'maior-nota') return contarEstrelas(b.rating) - contarEstrelas(a.rating) || (b.id - a.id);
            if (criterio === 'menor-nota') return contarEstrelas(a.rating) - contarEstrelas(b.rating) || (b.id - a.id);
            if (criterio === 'mais-curtidas') return (b.likes || 0) - (a.likes || 0) || (b.id - a.id);
            return b.id - a.id;
        });

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
                    ? '<button type="button" class="btn-del-comment" data-cid="' + c.id + '" style="background:none;border:none;color:#c92a2a;font-weight:bold;cursor:pointer;">X</button>'
                    : '';
                comentariosHTML +=
                    '<div class="perfil-comment-item">' +
                        '<span><strong>' + escapeHTML(c.author) + ':</strong> ' + escapeHTML(c.text) + '</span>' +
                        btnDel +
                    '</div>';
            });

            if (!comentariosHTML) {
                comentariosHTML = '<small style="opacity:0.7;">Nenhum comentario ainda.</small>';
            }

            const openClass = (idAberto === review.id) ? 'open' : '';
            const jaCurtiu = (review.likedBy || []).includes(usuarioAtual);
            const estiloLike = jaCurtiu ? 'style="background-color: var(--btn-pink); color: #000000;"' : '';
            const textoLike = jaCurtiu ? 'Curtido (' + (review.likes || 0) + ')' : 'Curtir (' + (review.likes || 0) + ')';

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
                        '<strong><a href="album.html?album=' + encodeURIComponent(review.album_name) + '" class="user-profile-link">' + escapeHTML(review.album_name) + '</a></strong>' +
                        '<span>' + escapeHTML(review.rating) + '</span>' +
                    '</div>' +
                    '<p class="review-text">' + escapeHTML(review.comment) + '</p>' +
                    anexoHTML +
                    '<div class="review-footer-row">' +
                        '<div class="review-actions-group">' +
                            '<button type="button" class="action-btn-perfil btn-like-perfil" ' + estiloLike + '>' + textoLike + '</button>' +
                            '<button type="button" class="action-btn-perfil btn-toggle-perfil-comments">Comentarios (' + comentarios.length + ')</button>' +
                        '</div>' +
                        btnExcluirHTML +
                    '</div>' +
                    '<div class="perfil-comments-box ' + openClass + '">' +
                        '<div class="perfil-comments-list">' + comentariosHTML + '</div>' +
                        '<form class="perfil-comment-form">' +
                            '<input type="text" placeholder="Escreva um comentario..." required>' +
                            '<button type="submit" class="btn-send-perfil-comment">Enviar</button>' +
                        '</form>' +
                    '</div>' +
                '</div>';

            reviewsList.appendChild(card);
        });
    }
    if (sortReviewsSelect) {
        sortReviewsSelect.addEventListener('change', () => carregarMinhasReviews());
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
                atualizarPetMusical();
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
                card.querySelector('.perfil-comments-box').classList.toggle('open');
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
                item.commentsList.push({ id: Date.now(), author: usuarioAtual, text: text });
                localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
                carregarMinhasReviews(reviewId);
            }
        });
    }
    const petStage = document.getElementById('pet-visual-stage');
    let petCanvas = document.getElementById('pet-canvas');
    if (!petCanvas && petStage) {
        const oldActor = document.getElementById('pet-svg-actor') || document.getElementById('pet-gif-actor');
        if (oldActor) oldActor.remove();
        const oldFloor = document.getElementById('pet-stage-floor');
        if (oldFloor) oldFloor.remove();

        petCanvas = document.createElement('canvas');
        petCanvas.id = 'pet-canvas';
        petCanvas.width = 240;
        petCanvas.height = 115;
        petCanvas.className = 'pet-canvas';
        petStage.prepend(petCanvas);
    }

    const petCtx = petCanvas ? petCanvas.getContext('2d') : null;
    const chavePet = 'dissonance_pet_' + perfilAlvo;
    const petNameEl = document.getElementById('pet-name-display');
    const petMoodEl = document.getElementById('pet-mood-text');
    const petMoodLabel = document.getElementById('pet-mood-label');
    const petMoodBar = document.getElementById('pet-mood-bar');
    const petEnergyLabel = document.getElementById('pet-energy-label');
    const petEnergyBar = document.getElementById('pet-energy-bar');
    const btnConfigPet = document.getElementById('btn-config-pet');
    const btnPetLove = document.getElementById('btn-pet-love');
    const btnFeedPet = document.getElementById('btn-feed-pet');
    const btnSleepPet = document.getElementById('btn-sleep-pet');
    const petSetupForm = document.getElementById('pet-setup-form');

    if (!ehMeuPerfil) {
        if (btnConfigPet) btnConfigPet.style.display = 'none';
        const actionsRow = document.getElementById('pet-actions-row');
        if (actionsRow) actionsRow.style.display = 'none';
    }

    // --- CARREGAMENTO DA SPRITESHEET (8x8) ---
    const spriteSheetPets = new Image();
    spriteSheetPets.src = 'imgs/pets-sheet.png';
    let spriteSheetCarregada = false;
    spriteSheetPets.onload = () => { spriteSheetCarregada = true; };

    const particulasPet = [];
    const estadoPet = {
        x: 90,
        dir: 1,
        frame: 0,
        timer: 0,
        acao: 'walk',
        acaoTimer: 0,
        dormindo: false
    };

    function spawnParticulas(tipo, qtd) {
        for (let i = 0; i < qtd; i++) {
            particulasPet.push({
                tipo: tipo,
                x: estadoPet.x + 20 + (Math.random() * 24 - 12),
                y: 44 + (Math.random() * 10 - 5),
                vx: (Math.random() - 0.5) * 0.8,
                vy: -0.7 - Math.random() * 0.6,
                vida: 65
            });
        }
    }

    // --- CENÁRIO: QUARTINHO MUSICAL PIXEL ART POR ESPÉCIE ---
    function desenharQuartinhoMusical(ctx, w, h, especieGrupo, frame) {
        ctx.save();

        // Parede e rodapé do quarto
        ctx.fillStyle = 'rgba(247, 187, 215, 0.14)';
        ctx.fillRect(0, 0, w, 98);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 96, w, 2);

        // Piso de madeira / estúdio
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(0, 98, w, h - 98);

        // Janela com céu noturno e estrelas (lado esquerdo)
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(14, 14, 38, 34);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(14, 14, 38, 34);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(21, 21, 3, 3);
        ctx.fillRect(40, 26, 2, 2);
        if (frame % 2 === 0) ctx.fillRect(32, 19, 2, 2);
        // Cruz da janela
        ctx.fillStyle = '#000000';
        ctx.fillRect(32, 14, 2, 34);
        ctx.fillRect(14, 30, 38, 2);

        // Prateleira de vinis na parede (centro)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(68, 36, 74, 4);
        ctx.fillStyle = '#000000';
        ctx.fillRect(68, 40, 74, 2);
        const coresCapas = ['#ff1b9c', '#38bdf8', '#facc15', '#4ade80', '#a855f7'];
        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = coresCapas[i];
            ctx.fillRect(72 + i * 13, 22, 11, 14);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(72 + i * 13, 22, 11, 14);
        }

        // Equipamento musical no canto direito (muda conforme a espécie)
        if (especieGrupo === 'cachorro') {
            // Mesa de DJ + Pickups com LEDs piscando
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(166, 72, 62, 24);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(166, 72, 62, 24);
            // Pratos giratórios
            ctx.fillStyle = '#000000';
            ctx.fillRect(172, 68, 20, 4);
            ctx.fillRect(202, 68, 20, 4);
            ctx.fillStyle = (frame % 2 === 0) ? '#38bdf8' : '#ff1b9c';
            ctx.fillRect(180, 68, 4, 2);
            ctx.fillRect(210, 68, 4, 2);
            // Equalizador no painel
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(174, 80, 4, (frame % 2 === 0) ? 8 : 4);
            ctx.fillStyle = '#ff1b9c';
            ctx.fillRect(182, 78, 4, (frame % 2 === 0) ? 5 : 10);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(190, 81, 4, (frame % 2 === 0) ? 7 : 3);
        } else if (especieGrupo === 'gato' || especieGrupo === 'raposa') {
            // Vitrola retrô com disco girando + Caixa de som
            ctx.fillStyle = '#d97706';
            ctx.fillRect(174, 78, 48, 18);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(174, 78, 48, 18);
            // Disco de vinil em cima
            ctx.fillStyle = '#111111';
            ctx.fillRect(180, 72, 28, 6);
            ctx.fillStyle = '#ff1b9c';
            ctx.fillRect(191 + (frame % 2), 72, 6, 3);
            // Braço da agulha
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(210, 68, 3, 10);
        } else {
            // Amplificador / Caixa de Som Hi-Fi pulsando
            ctx.fillStyle = '#27272a';
            ctx.fillRect(182, 58, 38, 38);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(182, 58, 38, 38);
            // Woofer inferior pulsando no beat
            const pulso = (frame % 2 === 0) ? 0 : 2;
            ctx.fillStyle = '#000000';
            ctx.fillRect(191 - pulso / 2, 74 - pulso / 2, 20 + pulso, 18 + pulso);
            ctx.fillStyle = '#f7bbd7';
            ctx.fillRect(198, 80, 6, 6);
            // Tweeter superior
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(197, 63, 8, 6);
        }

        // Notas musicais flutuando perto do som
        ctx.fillStyle = '#ff1b9c';
        const notaY = (frame % 2 === 0) ? 48 : 44;
        ctx.fillRect(195, notaY, 3, 8);
        ctx.fillRect(192, notaY + 6, 5, 4);

        ctx.restore();
    }
     // Mapa calibrado de encaixe do fone (dx = esquerda/direita, dy = altura, w = largura)
    const ajustesFonesPorCoord = {
        // Sentados de frente (encaixe centralizado)
        '0,0': { dx: 1, dy: -46, w: 20 },   // Raposa Lo-Fi
        '6,3': { dx: 0, dy: -46, w: 22 },   // Gato Shoegaze
        '6,5': { dx: 0, dy: -46, w: 22 },   // Gato Punk
        '6,7': { dx: 0, dy: -46, w: 22 },   // Gato Jazz
        '7,3': { dx: 0, dy: -47, w: 23 },   // Golden Pop
        '7,5': { dx: 0, dy: -47, w: 23 },   // Dálmata Pós-Punk
        '5,7': { dx: 0, dy: -47, w: 23 },   // Collie Alternativo
        '1,0': { dx: 1, dy: -46, w: 20 },   // Guaxinim Colecionador
        '1,6': { dx: 0, dy: -46, w: 21 },   // Panda Vermelho City Pop
        '3,0': { dx: 0, dy: -46, w: 19 },   // Coruja Noturna

        // Cabeça deslocada em perfil (ajustados para não flutuar)
        '5,2': { dx: -7, dy: -45, w: 17 },  // Raposa Synthwave
        '2,0': { dx: -5, dy: -45, w: 17 },  // Esquilo R&B
        '2,4': { dx: -5, dy: -45, w: 17 },  // Esquilo Acústico
        '1,2': { dx: -8, dy: -44, w: 17 },  // Lobo Rock Clássico
        '2,2': { dx: -7, dy: -49, w: 16 },  // Cervinho Chamber Pop
        '7,2': { dx: -6, dy: -46, w: 15 },  // Doninha New Wave
        '1,4': { dx: -6, dy: -43, w: 17 },  // Guaxinim Cassete
        '7,1': { dx: -5, dy: -46, w: 17 },  // Coelho Dream Pop
        '3,4': { dx: -5, dy: -46, w: 17 },  // Coelho Folk
        '7,7': { dx: -5, dy: -46, w: 17 },  // Coelho Indie

        // Baixinhos (Ouriço, Caracol, Roedores, Sapo)
        '4,0': { dx: -7, dy: -36, w: 16 },  // Ouriço Grunge
        '6,4': { dx: -9, dy: -39, w: 14 },  // Caracol Slowcore
        '2,7': { dx: -5, dy: -37, w: 17 },  // Porquinho-da-Índia Groove
        '4,4': { dx: -6, dy: -37, w: 15 },  // Ratinho Electro
        '7,4': { dx: -6, dy: -37, w: 15 },  // Camundongo Soul
        '5,4': { dx: -2, dy: -38, w: 19 },  // Sapo do Vinil
        '7,6': { dx: 0, dy: -43, w: 17 }    // Morcego Gótico
    };


    function desenharPetDaSpritesheet(ctx, x, y, coordStr, dir, passo, acao, especieGrupo) {
        if (!spriteSheetCarregada) return;

        const coordLimpa = (coordStr || '6,3').trim();
        const partes = coordLimpa.split(',');
        const col = parseInt(partes[0], 10) || 0;
        const row = parseInt(partes[1], 10) || 0;

        const tileSize = spriteSheetPets.width / 8;
        const baseSize = 54;

        let scaleX = 1;
        let scaleY = 1;
        let offsetY = 0;
        let rotacao = 0;

        if (acao === 'sleep') {
            const resp = (passo % 2 === 0) ? 1.03 : 0.97;
            scaleX = resp;
            scaleY = 0.86;
            offsetY = 6;
            rotacao = (dir === 1) ? 0.14 : -0.14;
        } else if (acao === 'happy' || acao === 'eat') {
            const pulo = (passo % 2 === 0) ? -9 : 0;
            offsetY = pulo;
            scaleX = (pulo < 0) ? 0.92 : 1.08;
            scaleY = (pulo < 0) ? 1.10 : 0.92;
        } else {
            const noAr = (passo % 2 === 1);
            offsetY = noAr ? -4 : 0;
            scaleX = noAr ? 0.96 : 1.04;
            scaleY = noAr ? 1.04 : 0.96;
            rotacao = noAr ? (dir * 0.06) : (-dir * 0.04);
        }

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        const centroX = x + baseSize / 2;
        const baseChaoY = y + baseSize + offsetY;

        ctx.translate(centroX, baseChaoY);
        ctx.rotate(rotacao);
        ctx.scale(-dir * scaleX, scaleY);

        // Desenha o bichinho da spritesheet
        ctx.drawImage(
            spriteSheetPets,
            col * tileSize, row * tileSize, tileSize, tileSize,
            -baseSize / 2, -baseSize, baseSize, baseSize
        );

        // Aplica o fone na posição e largura exatas da cabeça daquele animal
        const ajuste = ajustesFonesPorCoord[coordLimpa] || { dx: 0, dy: -46, w: 22 };
        const meiaLargura = Math.round(ajuste.w / 2);
        const corFone = (especieGrupo === 'cachorro') ? '#38bdf8' : '#ff1b9c';

        // Arco superior do fone
        ctx.fillStyle = '#111111';
        ctx.fillRect(ajuste.dx - meiaLargura, ajuste.dy, ajuste.w, 3);
        ctx.fillRect(ajuste.dx - meiaLargura - 2, ajuste.dy + 3, 3, 6);
        ctx.fillRect(ajuste.dx + meiaLargura - 1, ajuste.dy + 3, 3, 6);

        // Almofadas laterais
        ctx.fillStyle = corFone;
        ctx.fillRect(ajuste.dx - meiaLargura - 4, ajuste.dy + 8, 5, 8);
        ctx.fillRect(ajuste.dx + meiaLargura - 1, ajuste.dy + 8, 5, 8);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ajuste.dx - meiaLargura - 4, ajuste.dy + 8, 5, 8);
        ctx.strokeRect(ajuste.dx + meiaLargura - 1, ajuste.dy + 8, 5, 8);

        ctx.restore();
    }


    function desenharParticula(ctx, p) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.vida / 65);
        if (p.tipo === 'heart') {
            ctx.fillStyle = '#ff1b9c';
            ctx.fillRect(p.x, p.y, 4, 4);
            ctx.fillRect(p.x + 6, p.y, 4, 4);
            ctx.fillRect(p.x - 1, p.y + 3, 12, 4);
            ctx.fillRect(p.x + 2, p.y + 7, 6, 3);
            ctx.fillRect(p.x + 4, p.y + 10, 2, 2);
        } else if (p.tipo === 'food') {
            ctx.fillStyle = '#111111';
            ctx.fillRect(p.x, p.y, 10, 10);
            ctx.fillStyle = '#f7bbd7';
            ctx.fillRect(p.x + 3, p.y + 3, 4, 4);
        } else {
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('Z', p.x, p.y);
        }
        ctx.restore();
    }

    function loopCanvasPet() {
        if (!petCtx || !petCanvas) return;
        petCtx.clearRect(0, 0, petCanvas.width, petCanvas.height);

        const petAtual = obterPet();
        const grupoAtual = typeof descobrirEspeciePelaCoord === 'function'
            ? descobrirEspeciePelaCoord(petAtual.spriteKey)
            : 'gato';

        // 1. Desenha o quartinho musical no fundo
        desenharQuartinhoMusical(petCtx, petCanvas.width, petCanvas.height, grupoAtual, estadoPet.frame);

        estadoPet.timer++;
        if (estadoPet.acaoTimer > 0) {
            estadoPet.acaoTimer--;
            if (estadoPet.acaoTimer === 0) {
                estadoPet.acao = estadoPet.dormindo ? 'sleep' : 'walk';
                atualizarPetMusical();
            }
        }

        // Limita o movimento para o pet não passar por cima da mesa de DJ/vitrola
        const limiteDireito = 112;
        if (!estadoPet.dormindo && estadoPet.acao !== 'eat') {
            estadoPet.x += estadoPet.dir * 0.65;
            if (estadoPet.x > limiteDireito) estadoPet.dir = -1;
            if (estadoPet.x < 12) estadoPet.dir = 1;
        }

        if (estadoPet.timer % 16 === 0) {
            estadoPet.frame++;
            if (estadoPet.dormindo && estadoPet.timer % 48 === 0) {
                spawnParticulas('zzz', 1);
            }
        }

        // 2. Desenha o bichinho com fones de ouvido na frente
        const acaoRender = estadoPet.dormindo ? 'sleep' : estadoPet.acao;
        desenharPetDaSpritesheet(petCtx, estadoPet.x, 46, petAtual.spriteKey, estadoPet.dir, estadoPet.frame, acaoRender, grupoAtual);

        // 3. Desenha partículas de carinho, comida ou sono
        for (let i = particulasPet.length - 1; i >= 0; i--) {
            const p = particulasPet[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vida--;
            desenharParticula(petCtx, p);
            if (p.vida <= 0) particulasPet.splice(i, 1);
        }

        requestAnimationFrame(loopCanvasPet);
    }


    function obterPet() {
        const salvo = localStorage.getItem(chavePet);
        if (!salvo) {
            const padrao = { spriteKey: '6,3', especie: 'Gatinho Cinza', nome: 'Mochi', bonusManual: 0, humorBonus: 0 };
            if (ehMeuPerfil) localStorage.setItem(chavePet, JSON.stringify(padrao));
            return padrao;
        }
        const parsed = JSON.parse(salvo);
        if (!parsed.spriteKey || !parsed.spriteKey.includes(',')) parsed.spriteKey = '6,3';
        return parsed;
    }


    function atualizarPetMusical() {
        const pet = obterPet();
        const todasReviews = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
        const reviewsDoPerfil = todasReviews.filter(r => r.username === perfilAlvo).length;
        const vinisOuvidos = obterVinis().filter(v => v.listened).length;
        const appsConectados = JSON.parse(localStorage.getItem('dissonance_apps_' + perfilAlvo)) || ['Spotify'];

        const pontos = (reviewsDoPerfil * 15) + (vinisOuvidos * 12) + (appsConectados.length * 10) + (pet.bonusManual || 0);
        const energia = Math.min(100, Math.max(15, pontos));
        const humor = Math.min(100, Math.max(25, 50 + (reviewsDoPerfil * 10) + (pet.humorBonus || 0)));

        if (petNameEl) petNameEl.textContent = pet.nome + ' (' + pet.especie + ')';
        if (petEnergyLabel) petEnergyLabel.textContent = energia + '%';
        if (petEnergyBar) petEnergyBar.style.width = energia + '%';
        if (petMoodLabel) petMoodLabel.textContent = humor + '%';
        if (petMoodBar) {
            petMoodBar.style.width = humor + '%';
            petMoodBar.style.background = '#ff1b9c';
        }

        if (!petMoodEl || estadoPet.acaoTimer > 0) return;

        if (estadoPet.dormindo) {
            petMoodEl.textContent = 'Tirando um cochilo e recarregando...';
            if (petEnergyBar) petEnergyBar.style.background = '#38bdf8';
        } else if (energia >= 80) {
            petMoodEl.textContent = 'Super animado! Curtindo sua semana musical.';
            if (petEnergyBar) petEnergyBar.style.background = '#51cf66';
        } else if (energia >= 45) {
            petMoodEl.textContent = 'Passeando pela estante de discos.';
            if (petEnergyBar) petEnergyBar.style.background = 'var(--btn-pink, #f7bbd7)';
        } else {
            petMoodEl.textContent = 'Com fome de musica! Ouca um disco ou alimente ele.';
            if (petEnergyBar) petEnergyBar.style.background = '#ffd43b';
        }
    }
    if (ehMeuPerfil && btnPetLove) {
        btnPetLove.addEventListener('click', () => {
            estadoPet.dormindo = false;
            if (btnSleepPet) btnSleepPet.textContent = 'Dormir';
            estadoPet.acao = 'happy';
            estadoPet.acaoTimer = 75;
            const pet = obterPet();
            pet.humorBonus = Math.min(50, (pet.humorBonus || 0) + 10);
            localStorage.setItem(chavePet, JSON.stringify(pet));
            if (petMoodEl) petMoodEl.textContent = 'Recebendo carinho! Muito feliz.';
            spawnParticulas('heart', 5);
            atualizarPetMusical();
        });
    }

    if (ehMeuPerfil && btnFeedPet) {
        btnFeedPet.addEventListener('click', () => {
            estadoPet.dormindo = false;
            if (btnSleepPet) btnSleepPet.textContent = 'Dormir';
            estadoPet.acao = 'eat';
            estadoPet.acaoTimer = 85;
            const pet = obterPet();
            pet.bonusManual = Math.min(40, (pet.bonusManual || 0) + 10);
            localStorage.setItem(chavePet, JSON.stringify(pet));
            if (petMoodEl) petMoodEl.textContent = 'Mastigando um vinil novo! (+10%)';
            spawnParticulas('food', 4);
            atualizarPetMusical();
        });
    }

    if (ehMeuPerfil && btnSleepPet) {
        btnSleepPet.addEventListener('click', () => {
            estadoPet.dormindo = !estadoPet.dormindo;
            estadoPet.acao = estadoPet.dormindo ? 'sleep' : 'walk';
            btnSleepPet.textContent = estadoPet.dormindo ? 'Acordar' : 'Dormir';
            if (estadoPet.dormindo) spawnParticulas('zzz', 2);
            atualizarPetMusical();
        });
    }

    // --- CATALOGO DE ESPECIES E VARIACOES (27 PETS CIRCULADOS) ---
    const catalogoPetsVariacoes = {
        gato: [
            { coord: '6,3', nome: 'Gato Shoegaze (Cinza)' },
            { coord: '6,5', nome: 'Gato Punk (Laranja)' },
            { coord: '6,7', nome: 'Gato Jazz (Rajado)' }
        ],
        cachorro: [
            { coord: '7,3', nome: 'Golden Pop' },
            { coord: '7,5', nome: 'Dálmata Pós-Punk' },
            { coord: '5,7', nome: 'Collie Alternativo' }
        ],
        coelho: [
            { coord: '7,1', nome: 'Coelho Dream Pop (Bege)' },
            { coord: '3,4', nome: 'Coelho Folk (Marrom)' },
            { coord: '7,7', nome: 'Coelho Indie (Cinza)' }
        ],
        raposa: [
            { coord: '0,0', nome: 'Raposa Lo-Fi' },
            { coord: '5,2', nome: 'Raposa Synthwave' }
        ],
        guaxinim: [
            { coord: '1,0', nome: 'Guaxinim Colecionador' },
            { coord: '1,4', nome: 'Guaxinim Cassete' }
        ],
        esquilo: [
            { coord: '2,0', nome: 'Esquilo R&B (Cinza)' },
            { coord: '2,4', nome: 'Esquilo Acústico (Marrom)' }
        ],
        roedor: [
            { coord: '2,7', nome: 'Porquinho-da-Índia Groove' },
            { coord: '4,4', nome: 'Ratinho Electro (Cinza)' },
            { coord: '7,4', nome: 'Camundongo Soul (Marrom)' }
        ],
        silvestre: [
            { coord: '4,0', nome: 'Ouriço Grunge' },
            { coord: '1,6', nome: 'Panda Vermelho City Pop' },
            { coord: '1,2', nome: 'Lobo Rock Clássico' },
            { coord: '2,2', nome: 'Cervinho Chamber Pop' },
            { coord: '7,2', nome: 'Doninha New Wave' },
            { coord: '3,0', nome: 'Coruja Noturna (Ambient)' },
            { coord: '5,4', nome: 'Sapo do Vinil' },
            { coord: '6,4', nome: 'Caracol Slowcore' },
            { coord: '7,6', nome: 'Morcego Gótico' }
        ]
    };


    const speciesSelect = document.getElementById('pet-species-select');
    const variantSelect = document.getElementById('pet-variant-select');

    function carregarVariacoesDaEspecie(especieKey, coordSelecionada = '') {
        if (!variantSelect) return;
        const lista = catalogoPetsVariacoes[especieKey] || catalogoPetsVariacoes.gato;
        variantSelect.innerHTML = lista.map(item =>
            '<option value="' + item.coord + '|' + item.nome + '"' +
            (item.coord === coordSelecionada ? ' selected' : '') + '>' +
            item.nome + '</option>'
        ).join('');
    }

    function descobrirEspeciePelaCoord(coord) {
        for (const [key, lista] of Object.entries(catalogoPetsVariacoes)) {
            if (lista.some(item => item.coord === coord)) return key;
        }
        return 'gato';
    }

    if (speciesSelect) {
        speciesSelect.addEventListener('change', () => {
            carregarVariacoesDaEspecie(speciesSelect.value);
        });
    }

    if (ehMeuPerfil && btnConfigPet && petSetupForm) {
        btnConfigPet.addEventListener('click', () => {
            const pet = obterPet();
            document.getElementById('pet-name-input').value = pet.nome;

            const especieEncontrada = descobrirEspeciePelaCoord(pet.spriteKey);
            if (speciesSelect) speciesSelect.value = especieEncontrada;
            carregarVariacoesDaEspecie(especieEncontrada, pet.spriteKey);

            petSetupForm.style.display = petSetupForm.style.display === 'none' ? 'block' : 'none';
        });

        petSetupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const valorVariacao = variantSelect ? variantSelect.value : '6,3|Gatinho Cinza';
            const [spriteKey, especie] = valorVariacao.split('|');
            const nome = document.getElementById('pet-name-input').value.trim() || 'Mochi';
            const petAtual = obterPet();

            localStorage.setItem(chavePet, JSON.stringify({
                spriteKey: spriteKey,
                especie: especie,
                nome: nome,
                bonusManual: petAtual.bonusManual || 0,
                humorBonus: petAtual.humorBonus || 0
            }));

            petSetupForm.style.display = 'none';
            atualizarPetMusical();
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
    atualizarPetMusical();
    if (petCtx) loopCanvasPet();
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

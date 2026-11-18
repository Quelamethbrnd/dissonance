document.addEventListener('DOMContentLoaded', async () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const profileHeading = document.querySelector('.profile-summary h3');
    const bioParagraph = document.querySelector('.user-bio');
    const avatarContainer = document.querySelector('.avatar-circle');

    if (greetingSpan) greetingSpan.textContent = usuarioAtual;
    if (profileHeading) profileHeading.textContent = usuarioAtual;

    // Carrega perfil (bio, avatar e Last.fm) do Supabase com fallback para localStorage
    let perfilAtual = null;
    if (typeof dbObterPerfil === 'function') {
        perfilAtual = await dbObterPerfil(usuarioAtual);
    }

    const avatarAtivo = perfilAtual?.avatar_url || localStorage.getItem('avatar_' + usuarioAtual);
    if (avatarAtivo && avatarContainer) {
        avatarContainer.innerHTML = '<img src="' + avatarAtivo + '" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">';
    }

    const bioAtiva = perfilAtual?.bio || localStorage.getItem('bio_' + usuarioAtual);
    if (bioAtiva && bioParagraph) {
        bioParagraph.textContent = bioAtiva;
    }

    if (perfilAtual?.lastfm_user) {
        localStorage.setItem('dissonance_lastfm_user_' + usuarioAtual, perfilAtual.lastfm_user);
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
            bubbleEl.textContent = '+ Deixar nota...';
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

        const chaveNota = 'dissonance_note_' + usuarioAtual;
        const notaSalva = localStorage.getItem(chaveNota) || '...';

        const bubble = document.createElement('div');
        bubble.className = 'music-note-bubble';
        bubble.textContent = notaSalva.startsWith('+') ? notaSalva : '♪ ' + notaSalva.replace(/^♪\s*/, '');
        bubble.title = 'Clique para editar sua bolha musical';

        const trailLg = document.createElement('span');
        trailLg.className = 'music-note-trail-lg';
        const trailSm = document.createElement('span');
        trailSm.className = 'music-note-trail-sm';

        bubble.addEventListener('click', () => abrirModalEditarNotaFeed(chaveNota, bubble));

        wrapper.prepend(trailSm);
        wrapper.prepend(trailLg);
        wrapper.prepend(bubble);
    }

    const reviewForm = document.querySelector('.review-form');
    const feedList = document.querySelector('.feed-list');
    const platformButtons = document.querySelectorAll('.btn-platform');
    const logoutBtn = document.querySelector('.btn-logout');
    const reviewCoverInput = document.getElementById('review-cover-input');
    const reviewUploadLabel = document.getElementById('review-upload-label');
    let midiaAnexoBase64 = '';
    let cacheReviews = [];

    if (reviewCoverInput) {
        reviewCoverInput.addEventListener('change', event => {
            const file = event.target.files.item(0);
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                if (file.type === 'image/gif') {
                    midiaAnexoBase64 = e.target.result;
                    if (reviewUploadLabel) {
                        reviewUploadLabel.textContent = '✓ GIF Pronto';
                        reviewUploadLabel.classList.add('has-image');
                    }
                    return;
                }

                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxWidth = 600;
                    const scale = Math.min(1, maxWidth / img.width);
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d');

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    midiaAnexoBase64 = canvas.toDataURL('image/jpeg', 0.82);

                    if (reviewUploadLabel) {
                        reviewUploadLabel.textContent = '✓ Mídia Pronta';
                        reviewUploadLabel.classList.add('has-image');
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function montarAvatarHTML(username) {
        const link = 'perfil.html?user=' + encodeURIComponent(username);
        const foto = (username === usuarioAtual && avatarAtivo)
            ? avatarAtivo
            : localStorage.getItem('avatar_' + username);

        if (foto) {
            return '<a href="' + link + '"><img src="' + foto + '" alt="' + escapeHTML(username) + '" class="review-avatar"></a>';
        }
        const inicial = username.replace('@', '').charAt(0).toUpperCase() || 'U';
        return '<a href="' + link + '" style="text-decoration:none;"><div class="review-avatar">' + inicial + '</div></a>';
    }

    async function carregarReviews(idAberto = null, usarCache = false) {
        if (!feedList) return;

        if (!usarCache && typeof dbListarReviews === 'function') {
            cacheReviews = await dbListarReviews();
        }

        const cardsAntigos = feedList.querySelectorAll('.review-card');
        cardsAntigos.forEach(card => card.remove());

        if (cacheReviews.length === 0) {
            const vazio = document.createElement('article');
            vazio.classList.add('review-card');
            vazio.innerHTML = '<div class="review-body"><p class="review-text">Nenhuma avaliação publicada ainda. Seja o primeiro a compartilhar um álbum!</p></div>';
            feedList.appendChild(vazio);
            return;
        }

        cacheReviews.forEach(review => {
            const comentarios = review.comentarios || [];
            const likedBy = review.liked_by || [];
            const totalLikes = likedBy.length;

            const newCard = document.createElement('article');
            newCard.classList.add('review-card');
            newCard.dataset.id = review.id;

            let comentariosHTML = '';
            comentarios.forEach(c => {
                const btnDel = (c.author === usuarioAtual)
                    ? '<button type="button" class="btn-delete-comment" title="Apagar comentário">✕</button>'
                    : '';
                comentariosHTML +=
                    '<div class="comment-item" data-comment-id="' + c.id + '">' +
                        '<div class="comment-item-content">' +
                            '<a href="perfil.html?user=' + encodeURIComponent(c.author) + '" class="user-profile-link"><strong>' + escapeHTML(c.author) + ':</strong></a>' +
                            '<span>' + escapeHTML(c.text) + '</span>' +
                        '</div>' +
                        btnDel +
                    '</div>';
            });

            if (!comentariosHTML) {
                comentariosHTML = '<small style="opacity:0.7;">Nenhum comentário ainda. Seja o primeiro!</small>';
            }

            const isOpenClass = Number(idAberto) === Number(review.id) ? 'open' : '';
            const jaCurtiu = likedBy.includes(usuarioAtual);
            const classeLike = jaCurtiu ? 'action-btn btn-like liked' : 'action-btn btn-like';
            const estiloLike = jaCurtiu ? 'style="color:#d9387a;"' : '';
            const textoLike = jaCurtiu ? '♥ Curtido (' + totalLikes + ')' : '♡ Curtir (' + totalLikes + ')';

            const avatarHTML = montarAvatarHTML(review.username);
            const anexoHTML = review.media_url
                ? '<img src="' + review.media_url + '" alt="Anexo do post" class="review-media-attachment">'
                : '';

            newCard.innerHTML =
                avatarHTML +
                '<div class="review-body">' +
                    '<div class="review-header">' +
                        '<span class="reviewer-name"><a href="perfil.html?user=' + encodeURIComponent(review.username) + '" class="user-profile-link"><strong>' + escapeHTML(review.username) + '</strong></a> avaliou <a href="album.html?album=' + encodeURIComponent(review.album_name) + '" class="user-profile-link"><strong>' + escapeHTML(review.album_name) + '</strong></a></span>' +
                        '<span class="review-stars">' + escapeHTML(review.rating) + '</span>' +
                    '</div>' +
                    '<p class="review-text">' + escapeHTML(review.comment) + '</p>' +
                    anexoHTML +
                    '<div class="review-actions">' +
                        '<button type="button" class="' + classeLike + '" ' + estiloLike + '>' + textoLike + '</button>' +
                        '<button type="button" class="action-btn btn-toggle-comments">💬 Comentar (' + comentarios.length + ')</button>' +
                    '</div>' +
                    '<div class="comments-box ' + isOpenClass + '">' +
                        '<div class="comments-list">' + comentariosHTML + '</div>' +
                        '<form class="comment-form">' +
                            '<input type="text" placeholder="Escreva um comentário..." required>' +
                            '<button type="submit" class="btn-send-comment">Enviar</button>' +
                        '</form>' +
                    '</div>' +
                '</div>';

            feedList.appendChild(newCard);
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async event => {
            event.preventDefault();

            const albumInput = reviewForm.querySelector('input');
            const ratingSelect = reviewForm.querySelector('select');
            const commentTextarea = reviewForm.querySelector('textarea');
            const submitBtn = reviewForm.querySelector('button[type="submit"]');

            if (!albumInput || !ratingSelect || !commentTextarea) return;

            const albumName = albumInput.value.trim();
            const opcaoTexto = ratingSelect.options[ratingSelect.selectedIndex].text.trim();
            const apenasEstrelas = opcaoTexto.match(/[★☆]+/);
            const ratingStars = apenasEstrelas ? apenasEstrelas.at(0) : '★★★★★';
            const commentText = commentTextarea.value.trim();

            if (!albumName || !commentText) return;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Publicando...';
            }

            try {
                await dbCriarReview({
                    username: usuarioAtual,
                    album_name: albumName,
                    rating: ratingStars,
                    comment: commentText,
                    media_url: midiaAnexoBase64
                });

                reviewForm.reset();
                midiaAnexoBase64 = '';
                if (reviewUploadLabel) {
                    reviewUploadLabel.textContent = ' Upload de Imagem/GIF';
                    reviewUploadLabel.classList.remove('has-image');
                }
                await carregarReviews();
            } catch (erro) {
                alert('Erro ao publicar avaliação no banco de dados.');
                console.error(erro);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Publicar Review';
                }
            }
        });
    }

    if (feedList) {
        feedList.addEventListener('click', async event => {
            const card = event.target.closest('.review-card');
            if (!card) return;
            const reviewId = Number(card.dataset.id);

            const likeBtn = event.target.closest('.btn-like');
            if (likeBtn) {
                const item = cacheReviews.find(r => Number(r.id) === reviewId);
                if (item) {
                    let likedBy = item.liked_by || [];
                    if (likedBy.includes(usuarioAtual)) {
                        likedBy = likedBy.filter(u => u !== usuarioAtual);
                    } else {
                        likedBy.push(usuarioAtual);
                        item.likes = likedBy.length;
                        enviarNotificacao(item.username, 'like', usuarioAtual, 'curtiu sua review de ' + item.album_name + '.', 'home.html');
                    }
                    item.liked_by = likedBy;
                    carregarReviews(null, true);
                    await dbAtualizarLikes(reviewId, likedBy);
                }
                return;
            }

            const toggleBtn = event.target.closest('.btn-toggle-comments');
            if (toggleBtn) {
                const commentsBox = card.querySelector('.comments-box');
                commentsBox.classList.toggle('open');
                if (commentsBox.classList.contains('open')) {
                    commentsBox.querySelector('input').focus();
                }
                return;
            }

            const delCommentBtn = event.target.closest('.btn-delete-comment');
            if (delCommentBtn) {
                const commentItem = delCommentBtn.closest('.comment-item');
                const commentId = Number(commentItem.dataset.commentId);
                await dbRemoverComentario(commentId);
                await carregarReviews(reviewId);
            }
        });

        feedList.addEventListener('submit', async event => {
            const commentForm = event.target.closest('.comment-form');
            if (!commentForm) return;
            event.preventDefault();

            const card = commentForm.closest('.review-card');
            const reviewId = Number(card.dataset.id);
            const input = commentForm.querySelector('input');
            const text = input.value.trim();

            if (!text) return;
            input.disabled = true;

            try {
                await dbAdicionarComentario(reviewId, usuarioAtual, text);
                
                const item = cacheReviews.find(r => Number(r.id) === reviewId);
                if (item) {
                    enviarNotificacao(item.username, 'comment', usuarioAtual, 'comentou na sua review de ' + item.album_name + ': "' + text + '"', 'home.html');
                }

                await carregarReviews(reviewId);
            } catch (erro) {

        });
    }

    // --- MODAL ESTILIZADO PARA CONECTAR USUÁRIO DO LAST.FM ---
    function abrirModalUsuarioLastFm() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'lfm-modal-overlay';

            overlay.innerHTML = `
                <div class="lfm-modal-box">
                    <div class="lfm-modal-header">
                        <span class="lfm-badge">LAST.FM TRACKING</span>
                        <button type="button" class="lfm-close-btn" id="lfm-close-btn" title="Fechar">✕</button>
                    </div>
                    <h3 class="lfm-modal-title">Conectar Last.fm</h3>
                    <p class="lfm-modal-desc">Informe seu nome de usuário público do Last.fm para importar seus scrobbles e estatísticas.</p>
                    
                    <form id="lfm-connect-form">
                        <div class="lfm-form-group">
                            <label for="lfm-username-input">Usuário do Last.fm</label>
                            <div class="lfm-input-wrapper">
                                <span class="lfm-input-prefix">last.fm/user/</span>
                                <input type="text" id="lfm-username-input" class="lfm-input" placeholder="ex: user123" autocomplete="off" required>
                            </div>
                        </div>

                        <div id="lfm-error-box" class="lfm-error-msg"></div>

                        <div class="lfm-modal-actions">
                            <button type="button" class="lfm-btn-cancel" id="lfm-cancel-btn">Cancelar</button>
                            <button type="submit" class="lfm-btn-submit" id="lfm-submit-btn">Sincronizar Conta ▸</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(overlay);

            const form = overlay.querySelector('#lfm-connect-form');
            const input = overlay.querySelector('#lfm-username-input');
            const errorBox = overlay.querySelector('#lfm-error-box');
            const submitBtn = overlay.querySelector('#lfm-submit-btn');

            input.focus();

            const fecharModal = (resultado = null) => {
                overlay.remove();
                resolve(resultado);
            };

            overlay.querySelector('#lfm-close-btn').addEventListener('click', () => fecharModal(null));
            overlay.querySelector('#lfm-cancel-btn').addEventListener('click', () => fecharModal(null));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) fecharModal(null);
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = input.value.trim();
                if (!username) return;

                if (typeof obterDadosCompletosLastFm !== 'function') {
                    errorBox.textContent = 'Erro: Arquivo lastfm.js não encontrado.';
                    errorBox.classList.add('visible');
                    return;
                }

                errorBox.classList.remove('visible');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Buscando perfil...';

                try {
                    const dados = await obterDadosCompletosLastFm(username);
                    fecharModal(dados);
                } catch (erro) {
                    errorBox.textContent = 'Usuário "' + username + '" não encontrado no Last.fm.';
                    errorBox.classList.add('visible');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sincronizar Conta ▸';
                    input.focus();
                }
            });
        });
    }

    // --- CONEXÕES (SPOTIFY + APPLE MUSIC + LAST.FM) E MONITORAMENTO AO VIVO ---
    const chaveConexoes = 'dissonance_apps_' + usuarioAtual;
    const chaveUserLastFm = 'dissonance_lastfm_user_' + usuarioAtual;

    if (typeof processarRetornoSpotify === 'function') {
        await processarRetornoSpotify(usuarioAtual);
    }

    const appsPermitidos = ['Spotify', 'Apple Music', 'Last.fm'];
    const salvas = JSON.parse(localStorage.getItem(chaveConexoes)) || [];
    let appsConectados = salvas.filter(app => appsPermitidos.includes(app));
    let lastfmUser = localStorage.getItem(chaveUserLastFm);

    if (lastfmUser && !appsConectados.includes('Last.fm')) {
        appsConectados.push('Last.fm');
    }

    if (appsConectados.includes('Spotify') && !localStorage.getItem('dissonance_spotify_token_' + usuarioAtual)) {
        appsConectados = appsConectados.filter(app => app !== 'Spotify');
    }
    localStorage.setItem(chaveConexoes, JSON.stringify(appsConectados));

    let ultimaFaixaExibida = '';
    let intervaloNowPlaying = null;

    async function sincronizarNowPlayingGeral() {
        if (document.hidden) return;
        let faixa = null;
        let origem = '';

        const tokenSpotify = localStorage.getItem('dissonance_spotify_token_' + usuarioAtual);
        if (appsConectados.includes('Spotify') && tokenSpotify && typeof obterOuvindoAgoraSpotify === 'function') {
            try {
                const faixaSpotify = await obterOuvindoAgoraSpotify(usuarioAtual);
                if (faixaSpotify && (faixaSpotify.aoVivo || !lastfmUser)) {
                    faixa = faixaSpotify;
                    origem = 'Spotify';
                }
            } catch (e) { /* segue para o Last.fm */ }
        }

        if (!faixa && appsConectados.includes('Last.fm') && lastfmUser) {
            try {
                faixa = typeof obterOuvindoAgoraLastFm === 'function'
                    ? await obterOuvindoAgoraLastFm(lastfmUser)
                    : (await obterDadosCompletosLastFm(lastfmUser)).ouvindoAgora;
                origem = 'Last.fm';
            } catch (e) { /* ignora falha temporária */ }
        }

        if (!faixa) return;

        const identificadorAtual = `${origem}|${faixa.nome}|${faixa.artista}|${faixa.aoVivo}`;
        if (identificadorAtual === ultimaFaixaExibida) return;
        ultimaFaixaExibida = identificadorAtual;

        const nowPlayingCard = document.querySelector('.now-playing');
        const liveDot = document.querySelector('.live-dot');

        if (liveDot) {
            liveDot.style.backgroundColor = faixa.aoVivo ? '#1ed760' : '#999999';
            liveDot.style.opacity = faixa.aoVivo ? '1' : '0.5';
        }

        if (nowPlayingCard) {
            nowPlayingCard.innerHTML =
                '<img src="' + escapeHTML(faixa.capa) + '" alt="Capa do Álbum">' +
                '<div class="track-info">' +
                    '<strong>' + escapeHTML(faixa.nome) + '</strong>' +
                    '<span>' + escapeHTML(faixa.artista) + '</span>' +
                    '<small class="platform-tag">via ' + origem + ' (' + (faixa.aoVivo ? 'Ao vivo' : 'Recente') + ')</small>' +
                '</div>';
        }
    }

    function iniciarMonitoramentoNowPlaying() {
        sincronizarNowPlayingGeral();
        if (intervaloNowPlaying) clearInterval(intervaloNowPlaying);
        intervaloNowPlaying = setInterval(sincronizarNowPlayingGeral, 100);
    }

    function pararMonitoramentoNowPlaying() {
        if (intervaloNowPlaying) {
            clearInterval(intervaloNowPlaying);
            intervaloNowPlaying = null;
        }
        ultimaFaixaExibida = '';
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) sincronizarNowPlayingGeral();
    });

    platformButtons.forEach(button => {
        const nomeLimpo = button.textContent
            .replace('✓ ', '')
            .replace('+ Conectar ', '')
            .replace(' Conectado', '')
            .trim();

        if (appsConectados.includes(nomeLimpo)) {
            button.classList.add('connected');
            if (nomeLimpo === 'Last.fm' && lastfmUser) {
                button.textContent = '✓ Last.fm (@' + lastfmUser + ')';
            } else {
                button.textContent = '✓ ' + nomeLimpo + ' Conectado';
            }
        } else {
            button.classList.remove('connected');
            button.textContent = '+ Conectar ' + nomeLimpo;
        }

        button.addEventListener('click', async () => {
            if (nomeLimpo === 'Spotify') {
                if (button.classList.contains('connected')) {
                    if (confirm('Deseja desconectar sua conta do Spotify?')) {
                        localStorage.removeItem('dissonance_spotify_token_' + usuarioAtual);
                        localStorage.removeItem('dissonance_spotify_refresh_' + usuarioAtual);
                        button.classList.remove('connected');
                        button.textContent = '+ Conectar Spotify';
                        appsConectados = appsConectados.filter(a => a !== 'Spotify');
                        localStorage.setItem(chaveConexoes, JSON.stringify(appsConectados));
                        ultimaFaixaExibida = '';
                        sincronizarNowPlayingGeral();
                    }
                    return;
                }

                if (typeof iniciarLoginSpotify === 'function') {
                    iniciarLoginSpotify();
                } else {
                    alert('Erro: O arquivo spotify.js não foi carregado no home.html.');
                }
                return;
            }

            if (nomeLimpo === 'Last.fm') {
                if (button.classList.contains('connected')) {
                    const confirmarDesconexao = confirm('Deseja desconectar a conta "' + (lastfmUser || 'Last.fm') + '"?');
                    if (confirmarDesconexao) {
                        button.classList.remove('connected');
                        button.textContent = '+ Conectar Last.fm';
                        appsConectados = appsConectados.filter(a => a !== 'Last.fm');
                        localStorage.removeItem(chaveUserLastFm);
                        lastfmUser = null;
                        localStorage.setItem(chaveConexoes, JSON.stringify(appsConectados));
                        if (typeof dbSalvarPerfil === 'function') {
                            await dbSalvarPerfil({ username: usuarioAtual, lastfm_user: '' });
                        }
                        ultimaFaixaExibida = '';
                        sincronizarNowPlayingGeral();
                    }
                    return;
                }

                const dadosConectados = await abrirModalUsuarioLastFm();
                if (!dadosConectados) return;

                lastfmUser = dadosConectados.usuario;
                localStorage.setItem(chaveUserLastFm, lastfmUser);
                if (typeof dbSalvarPerfil === 'function') {
                    await dbSalvarPerfil({ username: usuarioAtual, lastfm_user: lastfmUser });
                }

                button.classList.add('connected');
                button.textContent = '✓ Last.fm (@' + lastfmUser + ')';
                if (!appsConectados.includes('Last.fm')) appsConectados.push('Last.fm');
                localStorage.setItem(chaveConexoes, JSON.stringify(appsConectados));

                iniciarMonitoramentoNowPlaying();
                return;
            }

            if (nomeLimpo === 'Apple Music') {
                if (button.classList.contains('connected')) {
                    button.classList.remove('connected');
                    button.textContent = '+ Conectar Apple Music';
                    appsConectados = appsConectados.filter(a => a !== 'Apple Music');
                } else {
                    button.classList.add('connected');
                    button.textContent = '✓ Apple Music Conectado';
                    if (!appsConectados.includes('Apple Music')) appsConectados.push('Apple Music');
                }
                localStorage.setItem(chaveConexoes, JSON.stringify(appsConectados));
            }
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', event => {
            event.preventDefault();
            pararMonitoramentoNowPlaying();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'index.html';
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    await carregarReviews();
    iniciarMonitoramentoNowPlaying();
});

function enviarNotificacao(destinatario, tipo, autor, texto, link = 'home.html') {
    if (!destinatario) return;
    // Se quiser testar curtindo o próprio post, remova a linha abaixo temporariamente:
    if (destinatario === autor) return; 

    const chave = 'dissonance_notifs_' + destinatario;
    const atuais = JSON.parse(localStorage.getItem(chave)) || [];
    atuais.unshift({
        id: Date.now(),
        type: tipo,
        from: autor,
        text: texto,
        time: 'Agora mesmo',
        read: false,
        link: link
    });
    localStorage.setItem(chave, JSON.stringify(atuais.slice(0, 50)));
}


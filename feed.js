document.addEventListener('DOMContentLoaded', async () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    const savedAvatar = localStorage.getItem('avatar_' + usuarioAtual);
    const avatarContainer = document.querySelector('.avatar-circle');
    if (savedAvatar && avatarContainer) {
        avatarContainer.innerHTML = '<img src="' + savedAvatar + '" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">';
    }

    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const profileHeading = document.querySelector('.profile-summary h3');
    const bioParagraph = document.querySelector('.user-bio');

    if (greetingSpan) greetingSpan.textContent = usuarioAtual;
    if (profileHeading) profileHeading.textContent = usuarioAtual;

    const savedBio = localStorage.getItem('bio_' + usuarioAtual);
    if (savedBio && bioParagraph) bioParagraph.textContent = savedBio;

    const reviewForm = document.querySelector('.review-form');
    const feedList = document.querySelector('.feed-list');
    const platformButtons = document.querySelectorAll('.btn-platform');
    const logoutBtn = document.querySelector('.btn-logout');
    const reviewCoverInput = document.getElementById('review-cover-input');
    const reviewUploadLabel = document.getElementById('review-upload-label');
    let midiaAnexoBase64 = '';

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

    const reviewsPadrao = [
        {
            id: 1,
            username: '@ana_indie',
            album_name: 'Puberty 2',
            rating: '★★★★★',
            comment: 'A produção desse álbum é impecável. A transição entre faixas calmas e explosivas nunca perde a força.',
            media_url: '',
            likes: 14,
            likedBy: [],
            commentsList: [
                { id: 101, author: '@lucas_rock', text: 'Your Best American Girl é uma obra-prima!' }
            ]
        },
        {
            id: 2,
            username: '@lucas_rock',
            album_name: 'In Rainbows',
            rating: '★★★★★',
            comment: 'Ouvindo no repeat hoje. Weird Fishes continua sendo uma das melhores músicas já feitas.',
            media_url: '',
            likes: 29,
            likedBy: [],
            commentsList: []
        }
    ];

    function obterReviews() {
        const salvas = localStorage.getItem('dissonance_reviews');
        if (!salvas) {
            localStorage.setItem('dissonance_reviews', JSON.stringify(reviewsPadrao));
            return reviewsPadrao;
        }
        return JSON.parse(salvas);
    }

    function salvarReviews(lista) {
        localStorage.setItem('dissonance_reviews', JSON.stringify(lista));
    }

    function montarAvatarHTML(username) {
        const link = 'perfil.html?user=' + encodeURIComponent(username);
        const foto = localStorage.getItem('avatar_' + username);
        if (foto) {
            return '<a href="' + link + '"><img src="' + foto + '" alt="' + escapeHTML(username) + '" class="review-avatar"></a>';
        }
        const inicial = username.replace('@', '').charAt(0).toUpperCase() || 'U';
        return '<a href="' + link + '" style="text-decoration:none;"><div class="review-avatar">' + inicial + '</div></a>';
    }

    function carregarReviews(idAberto = null) {
        if (!feedList) return;
        const lista = obterReviews();
        const cardsAntigos = feedList.querySelectorAll('.review-card');
        cardsAntigos.forEach(card => card.remove());

        lista.forEach(review => {
            const comentarios = review.commentsList || [];
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

            const isOpenClass = idAberto === review.id ? 'open' : '';
            const jaCurtiu = (review.likedBy || []).includes(usuarioAtual);
            const classeLike = jaCurtiu ? 'action-btn btn-like liked' : 'action-btn btn-like';
            const estiloLike = jaCurtiu ? 'style="color:#d9387a;"' : '';
            const textoLike = jaCurtiu ? '♥ Curtido (' + review.likes + ')' : '♡ Curtir (' + review.likes + ')';

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
        reviewForm.addEventListener('submit', event => {
            event.preventDefault();

            const albumInput = reviewForm.querySelector('input');
            const ratingSelect = reviewForm.querySelector('select');
            const commentTextarea = reviewForm.querySelector('textarea');

            if (!albumInput || !ratingSelect || !commentTextarea) return;

            const albumName = albumInput.value.trim();
            const opcaoTexto = ratingSelect.options[ratingSelect.selectedIndex].text.trim();
            const apenasEstrelas = opcaoTexto.match(/[★☆]+/);
            const ratingStars = apenasEstrelas ? apenasEstrelas.at(0) : '★★★★★';
            const commentText = commentTextarea.value.trim();

            if (!albumName || !commentText) return;

            const lista = obterReviews();
            lista.unshift({
                id: Date.now(),
                username: usuarioAtual,
                album_name: albumName,
                rating: ratingStars,
                comment: commentText,
                media_url: midiaAnexoBase64,
                likes: 0,
                likedBy: [],
                commentsList: []
            });

            salvarReviews(lista);
            reviewForm.reset();
            midiaAnexoBase64 = '';
            if (reviewUploadLabel) {
                reviewUploadLabel.textContent = ' Upload de Imagem/GIF';
                reviewUploadLabel.classList.remove('has-image');
            }
            carregarReviews();
        });
    }

    if (feedList) {
        feedList.addEventListener('click', event => {
            const card = event.target.closest('.review-card');
            if (!card) return;
            const reviewId = Number(card.dataset.id);

            const likeBtn = event.target.closest('.btn-like');
            if (likeBtn) {
                const lista = obterReviews();
                const item = lista.find(r => r.id === reviewId);
                if (item) {
                    if (!item.likedBy) item.likedBy = [];

                    if (item.likedBy.includes(usuarioAtual)) {
                        item.likedBy = item.likedBy.filter(u => u !== usuarioAtual);
                        item.likes = Math.max(0, (item.likes || 1) - 1);
                    } else {
                        item.likedBy.push(usuarioAtual);
                        item.likes = (item.likes || 0) + 1;
                    }

                    salvarReviews(lista);
                    carregarReviews();
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
                const lista = obterReviews();
                const review = lista.find(r => r.id === reviewId);

                if (review && review.commentsList) {
                    review.commentsList = review.commentsList.filter(c => c.id !== commentId);
                    salvarReviews(lista);
                    carregarReviews(reviewId);
                }
            }
        });

        feedList.addEventListener('submit', event => {
            const commentForm = event.target.closest('.comment-form');
            if (!commentForm) return;
            event.preventDefault();

            const card = commentForm.closest('.review-card');
            const reviewId = Number(card.dataset.id);
            const input = commentForm.querySelector('input');
            const text = input.value.trim();

            if (!text) return;
            const lista = obterReviews();
            const review = lista.find(r => r.id === reviewId);
            if (review) {
                if (!review.commentsList) review.commentsList = [];
                review.commentsList.push({
                    id: Date.now(),
                    author: usuarioAtual,
                    text: text
                });
                salvarReviews(lista);
                carregarReviews(reviewId);
            }
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
                                <input type="text" id="lfm-username-input" class="lfm-input" placeholder="ex: markvvl" autocomplete="off" required>
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

    // Captura retorno OAuth do Spotify se acabou de fazer login
    if (typeof processarRetornoSpotify === 'function') {
        await processarRetornoSpotify(usuarioAtual);
    }

    const appsPermitidos = ['Spotify', 'Apple Music', 'Last.fm'];
    const salvas = JSON.parse(localStorage.getItem(chaveConexoes)) || [];
    let appsConectados = salvas.filter(app => appsPermitidos.includes(app));
    let lastfmUser = localStorage.getItem(chaveUserLastFm);

    // Garante que o Spotify só apareça conectado se realmente houver um token válido
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

        // 1. Prioriza o Spotify se estiver conectado e tocando ao vivo
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

        // 2. Busca no Last.fm se conectado
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
        intervaloNowPlaying = setInterval(sincronizarNowPlayingGeral, 8000); // Checa a cada 8 segundos
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
                        ultimaFaixaExibida = '';
                        sincronizarNowPlayingGeral();
                    }
                    return;
                }

                const dadosConectados = await abrirModalUsuarioLastFm();
                if (!dadosConectados) return;

                lastfmUser = dadosConectados.usuario;
                localStorage.setItem(chaveUserLastFm, lastfmUser);

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

    carregarReviews();
    iniciarMonitoramentoNowPlaying();
});
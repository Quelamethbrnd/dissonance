document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    // Aplica foto de perfil salva na barra lateral
    const savedAvatar = localStorage.getItem('avatar_' + usuarioAtual);
    const avatarContainer = document.querySelector('.avatar-circle');
    if (savedAvatar && avatarContainer) {
        avatarContainer.innerHTML = `<img src="${savedAvatar}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
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

    const albumCovers = {
        'mitski': 'imgs/Mitskipuberty2.jpg',
        'puberty 2': 'imgs/Mitskipuberty2.jpg',
        'frank ocean': 'imgs/Blonde_-_Frank_Ocean.jpeg',
        'blond': 'imgs/Blonde_-_Frank_Ocean.jpeg',
        'blonde': 'imgs/Blonde_-_Frank_Ocean.jpeg',
        'radiohead': 'imgs/Radiohead_-_In_Rainbows.jpg',
        'in rainbows': 'imgs/Radiohead_-_In_Rainbows.jpg',
        'kendrick': 'imgs/Kendrick_Lamar_-_Damn.png',
        'damn': 'imgs/Kendrick_Lamar_-_Damn.png'
    };

    // Reviews iniciais já com exemplos de comentários
    const reviewsPadrao = [
        {
            id: 1,
            username: '@ana_indie',
            album_name: 'Puberty 2',
            rating: '★★★★★',
            comment: 'A produção desse álbum é impecável. A transição entre faixas calmas e explosivas nunca perde a força.',
            cover_url: 'imgs/Mitskipuberty2.jpg',
            likes: 14,
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
            cover_url: 'imgs/Radiohead_-_In_Rainbows.jpg',
            likes: 29,
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

    function carregarReviews(idAberto = null) {
        const lista = obterReviews();
        const cardsAntigos = feedList.querySelectorAll('.review-card');
        cardsAntigos.forEach(card => card.remove());

        lista.forEach(review => {
            const comentarios = review.commentsList || [];
            const newCard = document.createElement('article');
            newCard.classList.add('review-card');
            newCard.dataset.id = review.id;

            // Monta o HTML dos comentários existentes
            const comentariosHTML = comentarios.map(c => `
                <div class="comment-item" data-comment-id="${c.id}">
                    <div class="comment-item-content">
                        <strong>${escapeHTML(c.author)}:</strong>
                        <span>${escapeHTML(c.text)}</span>
                    </div>
                    ${c.author === usuarioAtual ? `<button type="button" class="btn-delete-comment" title="Apagar comentário">✕</button>` : ''}
                </div>
            `).join('');

            const isOpenClass = (idAberto === review.id) ? 'open' : '';

            newCard.innerHTML = `
                <img src="${review.cover_url}" alt="${escapeHTML(review.album_name)}" class="review-cover">
                <div class="review-body">
                    <div class="review-header">
                        <span class="reviewer-name"><strong>${escapeHTML(review.username)}</strong> avaliou <strong>${escapeHTML(review.album_name)}</strong></span>
                        <span class="review-stars">${escapeHTML(review.rating)}</span>
                    </div>
                    <p class="review-text">${escapeHTML(review.comment)}</p>
                    <div class="review-actions">
                        <button type="button" class="action-btn btn-like">♡ Curtir (${review.likes})</button>
                        <button type="button" class="action-btn btn-toggle-comments">💬 Comentar (${comentarios.length})</button>
                    </div>

                    <!-- Gaveta de Comentários -->
                    <div class="comments-box ${isOpenClass}">
                        <div class="comments-list">
                            ${comentariosHTML || '<small style="opacity:0.7;">Nenhum comentário ainda. Seja o primeiro!</small>'}
                        </div>
                        <form class="comment-form">
                            <input type="text" placeholder="Escreva um comentário..." required>
                            <button type="submit" class="btn-send-comment">Enviar</button>
                        </form>
                    </div>
                </div>
            `;
            feedList.appendChild(newCard);
        });
    }

    // Publicar nova review
    if (reviewForm) {
        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const albumInput = reviewForm.querySelector('input[type="text"]');
            const ratingSelect = reviewForm.querySelector('select');
            const commentTextarea = reviewForm.querySelector('textarea');

            const albumName = albumInput.value.trim();
            const ratingStars = ratingSelect.options[ratingSelect.selectedIndex].text.split(' ');
            const commentText = commentTextarea.value.trim();

            if (!albumName || !commentText) return;

            const searchKey = albumName.toLowerCase();
            let coverSrc = 'imgs/Blonde_-_Frank_Ocean.jpeg';
            for (const key in albumCovers) {
                if (searchKey.includes(key)) {
                    coverSrc = albumCovers[key];
                    break;
                }
            }

            const lista = obterReviews();
            lista.unshift({
                id: Date.now(),
                username: usuarioAtual,
                album_name: albumName,
                rating: ratingStars,
                comment: commentText,
                cover_url: coverSrc,
                likes: 0,
                commentsList: []
            });

            salvarReviews(lista);
            reviewForm.reset();
            carregarReviews();
        });
    }

    // Interações nos cards (Curtir, Abrir Comentários, Excluir Comentário)
    feedList.addEventListener('click', (event) => {
        const card = event.target.closest('.review-card');
        if (!card) return;
        const reviewId = Number(card.dataset.id);

        // 1. Curtir
        const likeBtn = event.target.closest('.btn-like');
        if (likeBtn) {
            const lista = obterReviews();
            const item = lista.find(r => r.id === reviewId);
            if (item) {
                if (likeBtn.classList.contains('liked')) {
                    item.likes--;
                    likeBtn.classList.remove('liked');
                    likeBtn.style.color = '';
                    likeBtn.textContent = `♡ Curtir (${item.likes})`;
                } else {
                    item.likes++;
                    likeBtn.classList.add('liked');
                    likeBtn.style.color = '#d9387a';
                    likeBtn.textContent = `♥ Curtido (${item.likes})`;
                }
                salvarReviews(lista);
            }
            return;
        }

        // 2. Abrir / Fechar Gaveta de Comentários
        const toggleBtn = event.target.closest('.btn-toggle-comments');
        if (toggleBtn) {
            const commentsBox = card.querySelector('.comments-box');
            commentsBox.classList.toggle('open');
            if (commentsBox.classList.contains('open')) {
                commentsBox.querySelector('input').focus();
            }
            return;
        }

        // 3. Excluir próprio comentário
        const delCommentBtn = event.target.closest('.btn-delete-comment');
        if (delCommentBtn) {
            const commentItem = delCommentBtn.closest('.comment-item');
            const commentId = Number(commentItem.dataset.commentId);
            const lista = obterReviews();
            const review = lista.find(r => r.id === reviewId);

            if (review && review.commentsList) {
                review.commentsList = review.commentsList.filter(c => c.id !== commentId);
                salvarReviews(lista);
                carregarReviews(reviewId); // Mantém a gaveta aberta após apagar
            }
        }
    });

    // 4. Enviar novo comentário
    feedList.addEventListener('submit', (event) => {
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
        carregarReviews(reviewId); // Recarrega mantendo a caixa aberta
        }
        });
        // Conexões de Tracking
        platformButtons.forEach((button) => {
        button.addEventListener('click', () => {
        const platformName = button.textContent.replace('✓ ', '').replace('+ Conectar ', '').replace(' Conectado', '');
        if (button.classList.contains('connected')) {
        button.classList.remove('connected');
        button.textContent = + Conectar ${platformName};
        } else {
        button.classList.add('connected');
        button.textContent = ✓ ${platformName} Conectado;
        }
        });
        });
        // Botão Sair
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
        carregarReviews();
        });
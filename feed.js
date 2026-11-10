document.addEventListener('DOMContentLoaded', () => {
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
                        '<span class="reviewer-name"><a href="perfil.html?user=' + encodeURIComponent(review.username) + '" class="user-profile-link"><strong>' + escapeHTML(review.username) + '</strong></a> avaliou <strong>' + escapeHTML(review.album_name) + '</strong></span>' +
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
                reviewUploadLabel.textContent = '📷 Upload de Imagem/GIF';
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

    platformButtons.forEach(button => {
        button.addEventListener('click', () => {
            const platformName = button.textContent
                .replace('✓ ', '')
                .replace('+ Conectar ', '')
                .replace(' Conectado', '');
            if (button.classList.contains('connected')) {
                button.classList.remove('connected');
                button.textContent = '+ Conectar ' + platformName;
            } else {
                button.classList.add('connected');
                button.textContent = '✓ ' + platformName + ' Conectado';
            }
        });
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', event => {
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

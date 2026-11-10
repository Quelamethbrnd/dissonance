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
    let capaReviewBase64 = '';

    if (reviewCoverInput) {
        reviewCoverInput.addEventListener('change', event => {
            const file = event.target.files.item(0);
            if (!file) return;

            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 300;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');

                    const minSide = Math.min(img.width, img.height);
                    const sx = (img.width - minSide) / 2;
                    const sy = (img.height - minSide) / 2;

                    ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                    capaReviewBase64 = canvas.toDataURL('image/jpeg', 0.8);

                    if (reviewUploadLabel) {
                        reviewUploadLabel.textContent = '✓ Capa Pronta';
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
            cover_url: 'imgs/Mitskipuberty2.jpg',
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
            cover_url: 'imgs/Radiohead_-_In_Rainbows.jpg',
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
                            '<strong>' + escapeHTML(c.author) + ':</strong>' +
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

            newCard.innerHTML =
                '<img src="' + review.cover_url + '" alt="' + escapeHTML(review.album_name) + '" class="review-cover">' +
                '<div class="review-body">' +
                    '<div class="review-header">' +
                        '<span class="reviewer-name"><strong>' + escapeHTML(review.username) + '</strong> avaliou <strong>' + escapeHTML(review.album_name) + '</strong></span>' +
                        '<span class="review-stars">' + escapeHTML(review.rating) + '</span>' +
                    '</div>' +
                    '<p class="review-text">' + escapeHTML(review.comment) + '</p>' +
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

            if (!albumInput || !ratingSelect || !commentTextarea) return;

            const albumName = albumInput.value.trim();
            const opcaoTexto = ratingSelect.options[ratingSelect.selectedIndex].text.trim();
            const apenasEstrelas = opcaoTexto.match(/[★☆]+/);
            const ratingStars = apenasEstrelas ? apenasEstrelas.at(0) : '★★★★★';
            const commentText = commentTextarea.value.trim();

            if (!albumName || !commentText) return;

            let coverSrc = capaReviewBase64;
            if (!coverSrc) {
                coverSrc = await buscarCapaOnline(albumName);
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
                likedBy: [],
                commentsList: []
            });

            salvarReviews(lista);
            reviewForm.reset();
            capaReviewBase64 = '';
            if (reviewUploadLabel) {
                reviewUploadLabel.textContent = '📷 Upload de Imagem';
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

async function buscarCapaOnline(termoBusca) {
    try {
        const mbBase = 'https://' + 'musicbrainz.org/ws/2/release-group/?query=';
        const urlBusca = mbBase + encodeURIComponent(termoBusca) + '&fmt=json&limit=1';
        const resp = await fetch(urlBusca);
        const dados = await resp.json();

        if (dados && dados['release-groups'] && dados['release-groups'].length > 0) {
            const mbid = dados['release-groups'].at(0).id;
            const caaBase = 'https://' + 'coverartarchive.org/release-group/';
            const respCapa = await fetch(caaBase + mbid);

            if (respCapa.ok) {
                const dadosCapa = await respCapa.json();
                if (dadosCapa.images && dadosCapa.images.length > 0) {
                    const frente = dadosCapa.images.find(img => img.front) || dadosCapa.images.at(0);
                    return frente.thumbnails.large || frente.image;
                }
            }
        }
    } catch (erro) {
        console.log('Busca online falhou, usando capa padrão:', erro);
    }
    return 'imgs/Blonde_-_Frank_Ocean.jpeg';
}


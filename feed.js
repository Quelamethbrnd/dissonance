document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    // Aplica tema e foto salvos
    const themes = {
        pink: { textPink: '#f1c5d9', btnPink: '#f7bbd7' },
        cyan: { textPink: '#b2f2bb', btnPink: '#8ce99a' },
        purple: { textPink: '#e5dbff', btnPink: '#d0bfff' },
        yellow: { textPink: '#fff3bf', btnPink: '#ffe066' }
    };
    const temaSalvo = localStorage.getItem('temaSite') || 'pink';
    const selectedTheme = themes[temaSalvo] || themes.pink;
    document.documentElement.style.setProperty('--text-pink', selectedTheme.textPink);
    document.documentElement.style.setProperty('--btn-pink', selectedTheme.btnPink);

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

    // Reviews iniciais de exemplo caso o banco local esteja vazio
    const reviewsPadrao = [
        {
            id: 1,
            username: '@ana_indie',
            album_name: 'Puberty 2',
            rating: '★★★★★',
            comment: 'A produção desse álbum é impecável. A transição entre faixas calmas e explosivas nunca perde a força.',
            cover_url: 'imgs/Mitskipuberty2.jpg',
            likes: 14
        },
        {
            id: 2,
            username: '@lucas_rock',
            album_name: 'In Rainbows',
            rating: '★★★★★',
            comment: 'Ouvindo no repeat hoje. Weird Fishes continua sendo uma das melhores músicas já feitas.',
            cover_url: 'imgs/Radiohead_-_In_Rainbows.jpg',
            likes: 29
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

    function carregarReviews() {
        const lista = obterReviews();
        const cardsAntigos = feedList.querySelectorAll('.review-card');
        cardsAntigos.forEach(card => card.remove());

        lista.forEach(review => {
            const newCard = document.createElement('article');
            newCard.classList.add('review-card');
            newCard.dataset.id = review.id;

            newCard.innerHTML = `
                <img src="${review.cover_url}" alt="${escapeHTML(review.album_name)}" class="review-cover">
                <div class="review-body">
                    <div class="review-header">
                        <span class="reviewer-name"><strong>${escapeHTML(review.username)}</strong> avaliou <strong>${escapeHTML(review.album_name)}</strong></span>
                        <span class="review-stars">${escapeHTML(review.rating)}</span>
                    </div>
                    <p class="review-text">${escapeHTML(review.comment)}</p>
                    <div class="review-actions">
                        <button class="action-btn btn-like">♡ Curtir (${review.likes})</button>
                        <button class="action-btn">💬 Comentar (0)</button>
                    </div>
                </div>
            `;
            feedList.appendChild(newCard);
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const albumInput = reviewForm.querySelector('input[type="text"]');
            const ratingSelect = reviewForm.querySelector('select');
            const commentTextarea = reviewForm.querySelector('textarea');

            const albumName = albumInput.value.trim();
            const ratingStars = ratingSelect.options[ratingSelect.selectedIndex].text.split(' ')[0];
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
                likes: 0
            });

            localStorage.setItem('dissonance_reviews', JSON.stringify(lista));
            reviewForm.reset();
            carregarReviews();
        });
    }

    feedList.addEventListener('click', (event) => {
        const btn = event.target.closest('.btn-like');
        if (!btn) return;

        const card = btn.closest('.review-card');
        const reviewId = Number(card.dataset.id);
        const lista = obterReviews();
        const item = lista.find(r => r.id === reviewId);

        if (item) {
            if (btn.classList.contains('liked')) {
                item.likes--;
                btn.classList.remove('liked');
                btn.style.color = '#444';
                btn.textContent = `♡ Curtir (${item.likes})`;
            } else {
                item.likes++;
                btn.classList.add('liked');
                btn.style.color = '#d9387a';
                btn.textContent = `♥ Curtido (${item.likes})`;
            }
            localStorage.setItem('dissonance_reviews', JSON.stringify(lista));
        }
    });

    platformButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const platformName = button.textContent.replace('✓ ', '').replace('+ Conectar ', '').replace(' Conectado', '');
            if (button.classList.contains('connected')) {
                button.classList.remove('connected');
                button.textContent = `+ Conectar ${platformName}`;
            } else {
                button.classList.add('connected');
                button.textContent = `✓ ${platformName} Conectado`;
            }
        });
    });

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

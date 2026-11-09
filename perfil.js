document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    // Aplica o tema de cores salvo
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

    // Aplica a foto de perfil salva
    const savedAvatar = localStorage.getItem('avatar_' + usuarioAtual);
    const avatarContainer = document.querySelector('.profile-avatar-large');
    if (savedAvatar && avatarContainer) {
        avatarContainer.innerHTML = `<img src="${savedAvatar}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    }

    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const profileUsername = document.getElementById('profile-username');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;
    if (profileUsername) profileUsername.textContent = usuarioAtual;

    const bioText = document.getElementById('profile-bio-text');
    const savedBio = localStorage.getItem('bio_' + usuarioAtual);
    if (savedBio && bioText) {
        bioText.textContent = savedBio;
    }

    const reviewsList = document.getElementById('user-reviews-list');
    const statReviews = document.getElementById('stat-reviews');
    const statLikes = document.getElementById('stat-likes');

    function carregarMinhasReviews() {
        const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
        const minhas = todas.filter(r => r.username === usuarioAtual);

        // Atualiza contadores
        statReviews.textContent = minhas.length;
        const totalCurtidas = minhas.reduce((soma, item) => soma + (item.likes || 0), 0);
        statLikes.textContent = totalCurtidas;

        if (minhas.length === 0) {
            reviewsList.innerHTML = '<p>Você ainda não publicou nenhuma review. Vá até o Feed para avaliar um álbum!</p>';
            return;
        }

        reviewsList.innerHTML = '';

        minhas.forEach(review => {
            const card = document.createElement('article');
            card.classList.add('review-card');

            card.innerHTML = `
                <img src="${review.cover_url}" alt="${escapeHTML(review.album_name)}" class="review-cover">
                <div class="review-body">
                    <div class="review-header">
                        <strong>${escapeHTML(review.album_name)}</strong>
                        <span>${escapeHTML(review.rating)}</span>
                    </div>
                    <p class="review-text">${escapeHTML(review.comment)}</p>
                    <div class="review-footer-row">
                        <span>♥ ${review.likes} curtidas</span>
                        <button class="btn-delete-review" data-id="${review.id}">Excluir review</button>
                    </div>
                </div>
            `;

            reviewsList.appendChild(card);
        });
    }

    // Excluir review localmente
    reviewsList.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.btn-delete-review');
        if (!deleteBtn) return;

        if (!confirm('Tem certeza que deseja apagar esta review?')) return;

        const reviewId = Number(deleteBtn.dataset.id);
        let todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
        todas = todas.filter(r => r.id !== reviewId);

        localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
        carregarMinhasReviews();
    });

    // Botão Sair
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

    carregarMinhasReviews();
});

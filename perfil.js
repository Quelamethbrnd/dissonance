document.addEventListener('DOMContentLoaded', () => {
    // 1. Aplica o tema de cores salvo pelo usuário
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

    // 2. Carrega a foto de perfil salva (se existir)
    const savedAvatar = localStorage.getItem('avatar_' + usuarioAtual);
    const avatarContainer = document.querySelector('.profile-avatar-large, .avatar-circle');
    if (savedAvatar && avatarContainer) {
        avatarContainer.innerHTML = `<img src="${savedAvatar}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    }

    const SUPABASE_URL = 'https://supabase.co';
    const SUPABASE_KEY = 'sb_publishable_lO9AFsjUKgwYnNiE3n7bEQ_sfmWHqv5';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    // Preenche o nome do usuário na navbar e no cartão de perfil
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    const profileUsername = document.getElementById('profile-username');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;
    if (profileUsername) profileUsername.textContent = usuarioAtual;

    // Carrega bio personalizada se o usuário já tiver editado antes
    const bioText = document.getElementById('profile-bio-text');
    const savedBio = localStorage.getItem('bio_' + usuarioAtual);
    if (savedBio && bioText) {
        bioText.textContent = savedBio;
    }

    // Botão de Editar Bio
    const btnEditBio = document.getElementById('btn-edit-bio');
    if (btnEditBio) {
        btnEditBio.addEventListener('click', () => {
            const novaBio = prompt('Digite sua nova bio musical:', bioText.textContent);
            if (novaBio !== null && novaBio.trim() !== '') {
                bioText.textContent = novaBio.trim();
                localStorage.setItem('bio_' + usuarioAtual, novaBio.trim());
            }
        });
    }

    // Busca apenas as reviews do usuário logado no Supabase
    const reviewsList = document.getElementById('user-reviews-list');
    const statReviews = document.getElementById('stat-reviews');
    const statLikes = document.getElementById('stat-likes');

    async function carregarMinhasReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('username', usuarioAtual)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar perfil:', error);
            reviewsList.innerHTML = '<p>Erro ao carregar suas reviews.</p>';
            return;
        }

        // Atualiza os contadores de estatísticas
        statReviews.textContent = data.length;
        const totalCurtidas = data.reduce((soma, item) => soma + (item.likes || 0), 0);
        statLikes.textContent = totalCurtidas;

        if (data.length === 0) {
            reviewsList.innerHTML = '<p>Você ainda não publicou nenhuma review. Vá até o Feed para avaliar um álbum!</p>';
            return;
        }

        reviewsList.innerHTML = '';

        data.forEach(review => {
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

    // Excluir review do banco de dados
    reviewsList.addEventListener('click', async (event) => {
        const deleteBtn = event.target.closest('.btn-delete-review');
        if (!deleteBtn) return;

        const confirmar = confirm('Tem certeza que deseja apagar esta review?');
        if (!confirmar) return;

        const reviewId = deleteBtn.dataset.id;
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId);

        if (error) {
            alert('Erro ao excluir review.');
            console.error(error);
            return;
        }

        carregarMinhasReviews();
    });

    // Botão Sair
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            localStorage.removeItem('usuarioLogado');
            await supabase.auth.signOut();
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

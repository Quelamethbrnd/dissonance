document.addEventListener('DOMContentLoaded', () => {
    // 1. CONEXÃO COM O SUPABASE
    const SUPABASE_URL = 'https://supabase.co';
    const SUPABASE_KEY = 'sb_publishable_lO9AFsjUKgwYnNiE3n7bEQ_sfmWHqv5';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Puxa o nome real do usuário que fez login
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';

    // --- NOVO BLOCO: APLICA O TEMA DE CORES E A FOTO DE PERFIL ---
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
    // -------------------------------------------------------------

    // Atualiza o nome e a bio na barra lateral
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

    // 2. CARREGAR REVIEWS DO BANCO DE DADOS AO ABRIR A PÁGINA
    async function carregarReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar reviews:', error);
            return;
        }

        const cardsAntigos = feedList.querySelectorAll('.review-card');
        cardsAntigos.forEach(card => card.remove());

        data.forEach(review => {
            renderizarCard(review);
        });
    }

    function renderizarCard(review) {
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
    }

    // 3. SALVAR NOVA REVIEW NO BANCO DE DADOS
    reviewForm.addEventListener('submit', async (event) => {
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

        const { error } = await supabase
            .from('reviews')
            .insert([
                {
                    username: usuarioAtual,
                    album_name: albumName,
                    rating: ratingStars,
                    comment: commentText,
                    cover_url: coverSrc,
                    likes: 0
                }
            ]);

        if (error) {
            alert('Erro ao salvar review! Verifique o console (F12) para detalhes.');
            console.error(error);
            return;
        }

        reviewForm.reset();
        carregarReviews();
    });

    // 4. ATUALIZAR CURTIDAS NO BANCO DE DADOS
    feedList.addEventListener('click', async (event) => {
        const btn = event.target.closest('.btn-like');
        if (!btn) return;

        const card = btn.closest('.review-card');
        const reviewId = card.dataset.id;
        const match = btn.textContent.match(/\((\d+)\)/);
        let count = match ? parseInt(match[1], 10) : 0;

        if (btn.classList.contains('liked')) {
            count--;
            btn.classList.remove('liked');
            btn.style.color = '#444';
            btn.textContent = `♡ Curtir (${count})`;
        } else {
            count++;
            btn.classList.add('liked');
            btn.style.color = '#d9387a';
            btn.textContent = `♥ Curtido (${count})`;
        }

        if (reviewId) {
            await supabase
                .from('reviews')
                .update({ likes: count })
                .eq('id', reviewId);
        }
    });

    // 5. BOTÕES DE CONEXÃO DE TRACKING
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

    // 6. BOTÃO SAIR
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

    carregarReviews();
});

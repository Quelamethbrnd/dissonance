document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://supabase.co';
    const SUPABASE_KEY = 'sb_publishable_lO9AFsjUKgwYnNiE3n7bEQ_sfmWHqv5';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const searchInput = document.getElementById('search-input');
    const filterRating = document.getElementById('filter-rating');
    const resultsList = document.getElementById('explore-reviews-list');
    let todasAsReviews = [];

    // Busca todas as reviews ordenadas pelas mais curtidas
    async function buscarReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('likes', { ascending: false });

        if (error) {
            resultsList.innerHTML = '<p>Erro ao carregar reviews.</p>';
            return;
        }

        todasAsReviews = data;
        filtrarERenderizar();
    }

    function filtrarERenderizar() {
        const termo = searchInput.value.toLowerCase().trim();
        const notaSelecionada = filterRating.value;

        const filtradas = todasAsReviews.filter(review => {
            const bateTexto = review.album_name.toLowerCase().includes(termo) || 
                              review.username.toLowerCase().includes(termo) ||
                              review.comment.toLowerCase().includes(termo);
            const bateNota = (notaSelecionada === 'all') || (review.rating === notaSelecionada);
            return bateTexto && bateNota;
        });

        resultsList.innerHTML = '';

        if (filtradas.length === 0) {
            resultsList.innerHTML = '<p>Nenhuma review encontrada para essa busca.</p>';
            return;
        }

        filtradas.forEach(review => {
            const card = document.createElement('article');
            card.classList.add('review-card');

            card.innerHTML = `
                <img src="${review.cover_url}" alt="${escapeHTML(review.album_name)}" class="review-cover">
                <div class="review-body">
                    <div class="review-header">
                        <span><strong>${escapeHTML(review.username)}</strong> avaliou <strong>${escapeHTML(review.album_name)}</strong></span>
                        <strong>${escapeHTML(review.rating)}</strong>
                    </div>
                    <p class="review-text">${escapeHTML(review.comment)}</p>
                    <span class="review-likes">♥ ${review.likes} curtidas</span>
                </div>
            `;

            resultsList.appendChild(card);
        });
    }

    // Eventos de digitação e seleção
    searchInput.addEventListener('input', filtrarERenderizar);
    filterRating.addEventListener('change', filtrarERenderizar);

    // Clicar nos álbuns em alta filtra automaticamente
    document.querySelectorAll('.trending-card').forEach(card => {
        card.addEventListener('click', () => {
            searchInput.value = card.dataset.search;
            filtrarERenderizar();
        });
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

    buscarReviews();
});

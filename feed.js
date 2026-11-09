  <!-- Biblioteca do Banco de Dados Supabase -->
    <script src="https://jsdelivr.net"></script>
    
    <!-- Seu script do Feed -->
    <script src="feed.js"></script>
    
document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.querySelector('.review-form');
    const feedList = document.querySelector('.feed-list');
    const platformButtons = document.querySelectorAll('.btn-platform');

    // Mapa de capas locais disponíveis na sua pasta imgs/
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

    // 1. PUBLICAR NOVA REVIEW NO FEED
    reviewForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que a página recarregue ao enviar

        const albumInput = reviewForm.querySelector('input[type="text"]');
        const ratingSelect = reviewForm.querySelector('select');
        const commentTextarea = reviewForm.querySelector('textarea');

        const albumName = albumInput.value.trim();
        const ratingStars = ratingSelect.options[ratingSelect.selectedIndex].text.split(' ')[0];
        const commentText = commentTextarea.value.trim();

        if (!albumName || !commentText) return;

        // Busca uma capa correspondente ou usa uma padrão da sua pasta imgs/
        const searchKey = albumName.toLowerCase();
        let coverSrc = 'imgs/Blonde_-_Frank_Ocean.jpeg'; 

        for (const key in albumCovers) {
            if (searchKey.includes(key)) {
                coverSrc = albumCovers[key];
                break;
            }
        }

        // Cria o novo card de review seguindo a exata formatação do seu HTML
        const newCard = document.createElement('article');
        newCard.classList.add('review-card');

        newCard.innerHTML = `
            <img src="${coverSrc}" alt="${albumName}" class="review-cover">
            <div class="review-body">
                <div class="review-header">
                    <span class="reviewer-name"><strong>@ouvinte</strong> avaliou <strong>${escapeHTML(albumName)}</strong></span>
                    <span class="review-stars">${ratingStars}</span>
                </div>
                <p class="review-text">${escapeHTML(commentText)}</p>
                <div class="review-actions">
                    <button class="action-btn btn-like">♡ Curtir (0)</button>
                    <button class="action-btn">💬 Comentar (0)</button>
                </div>
            </div>
        `;

        // Insere o novo card logo abaixo do título "ATIVIDADE DA COMUNIDADE"
        const sectionTitle = feedList.querySelector('.feed-section-title');
        sectionTitle.insertAdjacentElement('afterend', newCard);

        // Limpa os campos do formulário
        reviewForm.reset();
    });

    // 2. SISTEMA DE CURTIDAS NOS POSTS (Funciona nos antigos e nos novos)
    feedList.addEventListener('click', (event) => {
        const btn = event.target.closest('.action-btn');
        if (!btn) return;

        // Verifica se é o botão de curtir
        if (btn.textContent.includes('Curtir') || btn.textContent.includes('Curtido')) {
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
                btn.style.color = '#d9387a'; // Destaque rosa escuro ao curtir
                btn.textContent = `♥ Curtido (${count})`;
            }
        }
    });

    // 3. ALTERNAR CONEXÕES DE TRACKING (Spotify, Apple Music, SoundCloud)
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

    // Função de segurança para evitar quebra de HTML caso o usuário digite caracteres especiais
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});

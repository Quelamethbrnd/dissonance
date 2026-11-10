document.addEventListener('DOMContentLoaded', async () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const params = new URLSearchParams(window.location.search);
    const produtorNome = params.get('name') || 'Nigel Godrich';

    const nameEl = document.getElementById('producer-name');
    const bioEl = document.getElementById('producer-bio');
    const gridEl = document.getElementById('producer-works-grid');
    const geniusBtn = document.getElementById('producer-genius-btn');

    nameEl.textContent = produtorNome;
    const gDom = ['genius', 'com'].join('.');
    geniusBtn.href = 'https://' + gDom + '/search?q=' + encodeURIComponent(produtorNome);

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    const catalogoProdutores = {
        'patrick hyland': [
            { album: 'Puberty 2', artist: 'Mitski', cover: 'imgs/Mitskipuberty2.jpg' },
            { album: 'Be the Cowboy', artist: 'Mitski', cover: 'imgs/Mitskipuberty2.jpg' }
        ],
        'nigel godrich': [
            { album: 'In Rainbows', artist: 'Radiohead', cover: 'imgs/Radiohead_-_In_Rainbows.jpg' },
            { album: 'OK Computer', artist: 'Radiohead', cover: 'imgs/Radiohead_-_In_Rainbows.jpg' }
        ],
        'malay': [
            { album: 'Blonde', artist: 'Frank Ocean', cover: 'imgs/Blonde_-_Frank_Ocean.jpeg' }
        ],
        'mike will made-it': [
            { album: 'DAMN.', artist: 'Kendrick Lamar', cover: 'imgs/Kendrick_Lamar_-_Damn.png' }
        ]
    };

    const chave = produtorNome.toLowerCase().trim();
    let obras = catalogoProdutores[chave] || [];

    try {
        const itunesDom = ['itunes', 'apple', 'com'].join('.');
        const resp = await fetch('https://' + itunesDom + '/search?term=' + encodeURIComponent(produtorNome) + '&media=music&entity=album&limit=8');
        if (resp.ok) {
            const dados = await resp.json();
            const encontrados = (dados.results || []).map(item => ({
                album: item.collectionName,
                artist: item.artistName,
                cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'imgs/Blonde_-_Frank_Ocean.jpeg'
            }));
            if (encontrados.length > 0) {
                obras = [...obras, ...encontrados];
            }
        }
    } catch (e) {}

    if (obras.length === 0) {
        bioEl.textContent = 'Nenhum álbum catalogado automaticamente para este produtor ainda.';
        gridEl.innerHTML = '<p>Tente abrir a página no Genius acima para ver todos os créditos.</p>';
        return;
    }

    bioEl.textContent = 'Foram encontrados ' + obras.length + ' trabalhos ligados a ' + produtorNome + '. Clique em qualquer álbum para abrir o fórum.';
    gridEl.innerHTML = obras.map(item =>
        '<div class="album-card">' +
            '<img src="' + item.cover + '" alt="' + escaparHTML(item.album) + '">' +
            '<div class="album-card-title"><a href="album.html?album=' + encodeURIComponent(item.album) + '&artist=' + encodeURIComponent(item.artist) + '" class="user-profile-link">' + escaparHTML(item.album) + '</a></div>' +
            '<div class="album-card-artist">' + escaparHTML(item.artist) + '</div>' +
        '</div>'
    ).join('');
});

document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const searchInput = document.getElementById('explore-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const trendingGrid = document.getElementById('community-trending-grid');
    const catalogGrid = document.getElementById('catalog-grid');

    let generoAtivo = 'todos';
    let termoBusca = '';

    const catalogoBase = [
        { album: 'Puberty 2', artist: 'Mitski', genre: 'indie', cover: 'imgs/Mitskipuberty2.jpg', color: '#2b2d42' },
        { album: 'Blonde', artist: 'Frank Ocean', genre: 'rnb', cover: 'imgs/Blonde_-_Frank_Ocean.jpeg', color: '#f8f9fa' },
        { album: 'In Rainbows', artist: 'Radiohead', genre: 'rock', cover: 'imgs/Radiohead_-_In_Rainbows.jpg', color: '#d9480f' },
        { album: 'DAMN.', artist: 'Kendrick Lamar', genre: 'hiphop', cover: 'imgs/Kendrick_Lamar_-_Damn.png', color: '#82c91e' }
    ];

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function jaEstaNaEstante(albumNome) {
        const vinis = JSON.parse(localStorage.getItem('dissonance_vinyls_' + usuarioAtual)) || [];
        return vinis.some(v => v.album.toLowerCase() === albumNome.toLowerCase());
    }
document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const searchInput = document.getElementById('explore-search');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const trendingGrid = document.getElementById('community-trending-grid');
    const catalogGrid = document.getElementById('catalog-grid');

    let generoAtivo = 'todos';
    let termoBusca = '';

    const catalogoBase = [
        { album: 'Puberty 2', artist: 'Mitski', genre: 'indie', cover: 'imgs/Mitskipuberty2.jpg', color: '#2b2d42' },
        { album: 'Blonde', artist: 'Frank Ocean', genre: 'rnb', cover: 'imgs/Blonde_-_Frank_Ocean.jpeg', color: '#f8f9fa' },
        { album: 'In Rainbows', artist: 'Radiohead', genre: 'rock', cover: 'imgs/Radiohead_-_In_Rainbows.jpg', color: '#d9480f' },
        { album: 'DAMN.', artist: 'Kendrick Lamar', genre: 'hiphop', cover: 'imgs/Kendrick_Lamar_-_Damn.png', color: '#82c91e' }
    ];

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function jaEstaNaEstante(albumNome) {
        const vinis = JSON.parse(localStorage.getItem('dissonance_vinyls_' + usuarioAtual)) || [];
        return vinis.some(v => v.album.toLowerCase() === albumNome.toLowerCase());
    }
    function renderizarExplorar() {
        const reviews = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];

        if (trendingGrid) {
            trendingGrid.innerHTML = '';
            const filtradas = reviews.filter(r =>
                r.album_name.toLowerCase().includes(termoBusca) ||
                r.username.toLowerCase().includes(termoBusca)
            );

            if (filtradas.length === 0) {
                trendingGrid.innerHTML = '<p>Nenhuma review encontrada para essa busca.</p>';
            } else {
                filtradas.slice(0, 4).forEach(rev => {
                    const card = document.createElement('div');
                    card.className = 'album-card';
                    card.innerHTML =
                        '<img src="' + rev.cover_url + '" alt="' + escaparHTML(rev.album_name) + '">' +
                        '<div class="album-card-title">' + escaparHTML(rev.album_name) + '</div>' +
                        '<div class="album-card-artist">Por ' + escaparHTML(rev.username) + '</div>' +
                        '<div class="album-card-meta"><span>' + escaparHTML(rev.rating) + '</span><span>♥ ' + rev.likes + '</span></div>';
                    trendingGrid.appendChild(card);
                });
            }
        }

        if (catalogGrid) {
            catalogGrid.innerHTML = '';
            const filtrados = catalogoBase.filter(item => {
                const bateGenero = (generoAtivo === 'todos') || (item.genre === generoAtivo);
                const bateTexto = item.album.toLowerCase().includes(termoBusca) || item.artist.toLowerCase().includes(termoBusca);
                return bateGenero && bateTexto;
            });

            if (filtrados.length === 0) {
                catalogGrid.innerHTML = '<p>Nenhum álbum encontrado nesse filtro.</p>';
            } else {
                filtrados.forEach(item => {
                    const salvo = jaEstaNaEstante(item.album);
                    const card = document.createElement('div');
                    card.className = 'album-card';
                    card.innerHTML =
                        '<img src="' + item.cover + '" alt="' + escaparHTML(item.album) + '">' +
                        '<div class="album-card-title">' + escaparHTML(item.album) + '</div>' +
                        '<div class="album-card-artist">' + escaparHTML(item.artist) + '</div>' +
                        '<div class="album-card-meta"><span class="genre-tag">' + item.genre + '</span></div>' +
                        '<button type="button" class="btn-save-shelf ' + (salvo ? 'saved' : '') + '" data-album="' + escaparHTML(item.album) + '">' +
                            (salvo ? '✓ Na sua Estante' : '+ Salvar na Estante') +
                        '</button>';
                    catalogGrid.appendChild(card);
                });
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            termoBusca = e.target.value.toLowerCase().trim();
            renderizarExplorar();
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generoAtivo = btn.dataset.genre;
            renderizarExplorar();
        });
    });

    if (catalogGrid) {
        catalogGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-save-shelf');
            if (!btn || btn.classList.contains('saved')) return;

            const albumNome = btn.dataset.album;
            const item = catalogoBase.find(a => a.album === albumNome);
            if (!item) return;

            const chave = 'dissonance_vinyls_' + usuarioAtual;
            const lista = JSON.parse(localStorage.getItem(chave)) || [];
            lista.unshift({
                id: Date.now(),
                album: item.album,
                artist: item.artist,
                color: item.color,
                coverImage: item.cover,
                listened: false
            });
            localStorage.setItem(chave, JSON.stringify(lista));
            renderizarExplorar();
        });
    }

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'index.html';
        });
    }

    renderizarExplorar();
});
    if (catalogGrid) {
        catalogGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-save-shelf');
            if (!btn) return;

            const albumNome = btn.dataset.album;
            const item = catalogoBase.find(a => a.album === albumNome);
            if (!item) return;

            const chave = 'dissonance_vinyls_' + usuarioAtual;
            let lista = JSON.parse(localStorage.getItem(chave)) || [];

            if (btn.classList.contains('saved')) {
                lista = lista.filter(v => v.album.toLowerCase() !== albumNome.toLowerCase());
            } else {
                lista.unshift({
                    id: Date.now(),
                    album: item.album,
                    artist: item.artist,
                    color: item.color,
                    coverImage: item.cover,
                    listened: false
                });
            }

            localStorage.setItem(chave, JSON.stringify(lista));
            renderizarExplorar();
        });
    }

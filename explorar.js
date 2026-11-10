document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const searchInput = document.getElementById('explore-search');
    const filtersContainer = document.querySelector('.genre-filters');
    const trendingGrid = document.getElementById('community-trending-grid');
    const catalogGrid = document.getElementById('catalog-grid');

    let generoAtivo = 'todos';
    let termoBusca = '';
    let resultadosOnline = [];
    let timerBusca = null;

    const catalogoBase = [
        { album: 'Puberty 2', artist: 'Mitski', genre: 'Alternative', cover: 'imgs/Mitskipuberty2.jpg', color: '#2b2d42' },
        { album: 'Blonde', artist: 'Frank Ocean', genre: 'R&B/Soul', cover: 'imgs/Blonde_-_Frank_Ocean.jpeg', color: '#f8f9fa' },
        { album: 'In Rainbows', artist: 'Radiohead', genre: 'Rock', cover: 'imgs/Radiohead_-_In_Rainbows.jpg', color: '#d9480f' },
        { album: 'DAMN.', artist: 'Kendrick Lamar', genre: 'Hip-Hop/Rap', cover: 'imgs/Kendrick_Lamar_-_Damn.png', color: '#82c91e' }
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

    function atualizarBotoesGenero(listaAtual) {
        if (!filtersContainer) return;
        const generosUnicos = [...new Set(listaAtual.map(item => item.genre).filter(Boolean))];

        filtersContainer.innerHTML =
            '<button type="button" class="filter-btn ' + (generoAtivo === 'todos' ? 'active' : '') + '" data-genre="todos">Todos</button>';

        generosUnicos.forEach(gen => {
            const ativo = (generoAtivo.toLowerCase() === gen.toLowerCase()) ? 'active' : '';
            filtersContainer.innerHTML +=
                '<button type="button" class="filter-btn ' + ativo + '" data-genre="' + escaparHTML(gen) + '">' + escaparHTML(gen) + '</button>';
        });
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
                        '<div class="album-card-meta"><span>' + escaparHTML(rev.rating) + '</span><span>♥ ' + (rev.likes || 0) + '</span></div>';
                    trendingGrid.appendChild(card);
                });
            }
        }

        if (catalogGrid) {
            catalogGrid.innerHTML = '';
            const listaBase = resultadosOnline.length > 0 ? resultadosOnline : catalogoBase;
            atualizarBotoesGenero(listaBase);

            const listaExibir = listaBase.filter(item => {
                const bateGenero = (generoAtivo === 'todos') || (item.genre.toLowerCase() === generoAtivo.toLowerCase());
                const bateTexto = !termoBusca ||
                    item.album.toLowerCase().includes(termoBusca) ||
                    item.artist.toLowerCase().includes(termoBusca);
                return bateGenero && bateTexto;
            });

            if (listaExibir.length === 0) {
                catalogGrid.innerHTML = '<p>Nenhum álbum encontrado nesse gênero.</p>';
            } else {
                listaExibir.forEach(item => {
                    const salvo = jaEstaNaEstante(item.album);
                    const card = document.createElement('div');
                    card.className = 'album-card';
                    card.innerHTML =
                        '<img src="' + item.cover + '" alt="' + escaparHTML(item.album) + '">' +
                        '<div class="album-card-title">' + escaparHTML(item.album) + '</div>' +
                        '<div class="album-card-artist">' + escaparHTML(item.artist) + '</div>' +
                        '<div class="album-card-meta"><span class="genre-tag">' + escaparHTML(item.genre) + '</span></div>' +
                        '<button type="button" class="btn-save-shelf ' + (salvo ? 'saved' : '') + '" ' +
                            'data-album="' + escaparHTML(item.album) + '" ' +
                            'data-artist="' + escaparHTML(item.artist) + '" ' +
                            'data-cover="' + item.cover + '">' +
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
            generoAtivo = 'todos';
            clearTimeout(timerBusca);

            if (termoBusca.length < 2) {
                resultadosOnline = [];
                renderizarExplorar();
                return;
            }

            timerBusca = setTimeout(async () => {
                const dados = await buscarAlbunsItunes(termoBusca);
                resultadosOnline = dados.map(d => ({
                    album: d.collectionName,
                    artist: d.artistName,
                    genre: d.primaryGenreName || 'Música',
                    cover: d.artworkUrl100 ? d.artworkUrl100.replace('100x100bb', '600x600bb') : 'imgs/Blonde_-_Frank_Ocean.jpeg'
                }));
                renderizarExplorar();
            }, 400);
        });
    }

    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            generoAtivo = btn.dataset.genre;
            renderizarExplorar();
        });
    }

    if (catalogGrid) {
        catalogGrid.addEventListener('click', async (e) => {
            const btn = e.target.closest('.btn-save-shelf');
            if (!btn) return;

            const albumNome = btn.dataset.album;
            const artistaNome = btn.dataset.artist || 'Artista';
            const capaUrl = btn.dataset.cover || 'imgs/Blonde_-_Frank_Ocean.jpeg';

            const chave = 'dissonance_vinyls_' + usuarioAtual;
            let lista = JSON.parse(localStorage.getItem(chave)) || [];

            if (btn.classList.contains('saved')) {
                lista = lista.filter(v => v.album.toLowerCase() !== albumNome.toLowerCase());
            } else {
                const corAuto = await extrairCorDominante(capaUrl);
                lista.unshift({
                    id: Date.now(),
                    album: albumNome,
                    artist: artistaNome,
                    color: corAuto,
                    coverImage: capaUrl,
                    listened: false
                });
            }

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

async function buscarAlbunsItunes(termo) {
    try {
        const dominio = ['itunes', 'apple', 'com'].join('.');
        const caminho = '/search?term=' + encodeURIComponent(termo) + '&media=music&entity=album&limit=12';
        const resp = await fetch('https://' + dominio + caminho);
        if (resp.ok) {
            const dados = await resp.json();
            return dados.results || [];
        }
    } catch (e) {}
    return [];
}

function extrairCorDominante(urlImagem) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 20;
                canvas.height = 20;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 20, 20);
                const pixels = ctx.getImageData(0, 0, 20, 20).data;
                let r = 0, g = 0, b = 0, total = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    r += pixels[i];
                    g += pixels[i + 1];
                    b += pixels[i + 2];
                    total++;
                }
                const toHex = (n) => Math.round(n / total).toString(16).padStart(2, '0');
                resolve('#' + toHex(r) + toHex(g) + toHex(b));
            } catch (e) {
                resolve('#f7bbd7');
            }
        };
        img.onerror = () => resolve('#f7bbd7');
        img.src = urlImagem;
    });
}

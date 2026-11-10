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
    let resultadosOnline = [];
    let timerBusca = null;

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
            const listaExibir = (termoBusca.length >= 2 && resultadosOnline.length > 0)
                ? resultadosOnline
                : catalogoBase.filter(item => {
                    const bateGenero = (generoAtivo === 'todos') || (item.genre === generoAtivo);
                    const bateTexto = item.album.toLowerCase().includes(termoBusca) || item.artist.toLowerCase().includes(termoBusca);
                    return bateGenero && bateTexto;
                });

            if (listaExibir.length === 0) {
                catalogGrid.innerHTML = '<p>Nenhum álbum encontrado.</p>';
            } else {
                listaExibir.forEach(item => {
                    const salvo = jaEstaNaEstante(item.album);
                    const card = document.createElement('div');
                    card.className = 'album-card';
                    card.innerHTML =
                        '<img src="' + item.cover + '" alt="' + escaparHTML(item.album) + '">' +
                        '<div class="album-card-title">' + escaparHTML(item.album) + '</div>' +
                        '<div class="album-card-artist">' + escaparHTML(item.artist) + '</div>' +
                        '<div class="album-card-meta"><span class="genre-tag">' + item.genre + '</span></div>' +
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
            clearTimeout(timerBusca);

            if (termoBusca.length < 2) {
                resultadosOnline = [];
                renderizarExplorar();
                return;
            }

            timerBusca = setTimeout(async () => {
                const dados = await buscarCatalogoDeezer(termoBusca);
                resultadosOnline = dados.map(d => ({
                    album: d.title,
                    artist: d.artist ? d.artist.name : 'Artista',
                    genre: 'deezer',
                    cover: d.cover_big || d.cover_medium || 'imgs/Blonde_-_Frank_Ocean.jpeg',
                    color: '#f7bbd7'
                }));
                renderizarExplorar();
            }, 400);
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generoAtivo = btn.dataset.genre;
            termoBusca = '';
            if (searchInput) searchInput.value = '';
            resultadosOnline = [];
            renderizarExplorar();
        });
    });

    if (catalogGrid) {
        catalogGrid.addEventListener('click', (e) => {
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
                lista.unshift({
                    id: Date.now(),
                    album: albumNome,
                    artist: artistaNome,
                    color: '#f7bbd7',
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

async function buscarCatalogoDeezer(termo) {
    try {
        const mbBase = 'https://' + 'musicbrainz.org/ws/2/release-group/?query=';
        const urlBusca = mbBase + encodeURIComponent(termo) + '&fmt=json&limit=6';
        const resp = await fetch(urlBusca);
        const dados = await resp.json();

        if (!dados || !dados['release-groups']) return [];

        const resultados = await Promise.all(
            dados['release-groups'].map(async (rg) => {
                const artista = (rg['artist-credit'] && rg['artist-credit'].at(0))
                    ? rg['artist-credit'].at(0).name
                    : 'Artista';
                let capaUrl = 'imgs/Blonde_-_Frank_Ocean.jpeg';

                try {
                    const caaBase = 'https://' + 'coverartarchive.org/release-group/';
                    const rCapa = await fetch(caaBase + rg.id);
                    if (rCapa.ok) {
                        const dCapa = await rCapa.json();
                        if (dCapa.images && dCapa.images.length > 0) {
                            const frente = dCapa.images.find(i => i.front) || dCapa.images.at(0);
                            capaUrl = frente.thumbnails.small || frente.thumbnails.large || frente.image;
                        }
                    }
                } catch (e) {}

                return {
                    title: rg.title,
                    artist: { name: artista },
                    cover_big: capaUrl,
                    cover_medium: capaUrl
                };
            })
        );

        return resultados;
    } catch (erro) {
        console.log('Erro na busca do explorar:', erro);
        return [];
    }
}


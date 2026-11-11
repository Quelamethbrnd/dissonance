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
        'patrick hyland': {
            bio: 'Produtor, engenheiro de som e multi-instrumentista norte-americano, conhecido pela parceria de longa data com Mitski.',
            obras: [
                { album: 'Puberty 2', artist: 'Mitski', cover: 'imgs/Mitskipuberty2.jpg' },
                { album: 'Be the Cowboy', artist: 'Mitski', cover: '' },
                { album: 'Bury Me at Makeout Creek', artist: 'Mitski', cover: '' },
                { album: 'Laurel Hell', artist: 'Mitski', cover: '' }
            ]
        },
        'nigel godrich': {
            bio: 'Produtor e engenheiro de áudio britânico, colaborador histórico do Radiohead e de artistas como Beck, Paul McCartney e Thom Yorke.',
            obras: [
                { album: 'In Rainbows', artist: 'Radiohead', cover: 'imgs/Radiohead_-_In_Rainbows.jpg' },
                { album: 'OK Computer', artist: 'Radiohead', cover: '' },
                { album: 'Kid A', artist: 'Radiohead', cover: '' },
                { album: 'Sea Change', artist: 'Beck', cover: '' }
            ]
        },
        'malay': {
            bio: 'Produtor vencedor do Grammy, famoso pelo trabalho em channel ORANGE e Blonde de Frank Ocean, além de Lorde e Zayn.',
            obras: [
                { album: 'Blonde', artist: 'Frank Ocean', cover: 'imgs/Blonde_-_Frank_Ocean.jpeg' },
                { album: 'channel ORANGE', artist: 'Frank Ocean', cover: '' },
                { album: 'Melodrama', artist: 'Lorde', cover: '' }
            ]
        },
        'mike will made-it': {
            bio: 'Produtor e compositor de Atlanta responsável por hits de Kendrick Lamar, Beyoncé, Rae Sremmurd e Miley Cyrus.',
            obras: [
                { album: 'DAMN.', artist: 'Kendrick Lamar', cover: 'imgs/Kendrick_Lamar_-_Damn.png' },
                { album: 'Ransom 2', artist: 'Mike WiLL Made-It', cover: '' }
            ]
        },
        'jack antonoff': {
            bio: 'Produtor e compositor norte-americano vencedor de múltiplos Grammys, conhecido por trabalhos com Sabrina Carpenter, Lana Del Rey, Taylor Swift e Lorde.',
            obras: [
                { album: "Short n' Sweet", artist: 'Sabrina Carpenter', cover: '' },
                { album: 'Norman Fucking Rockwell!', artist: 'Lana Del Rey', cover: '' },
                { album: 'Melodrama', artist: 'Lorde', cover: '' }
            ]
        }
    };

    async function buscarCapaAlbumItunes(album, artista) {
        try {
            const itunesDom = ['itunes', 'apple', 'com'].join('.');
            const termo = encodeURIComponent((album + ' ' + artista).trim());
            const resp = await fetch('https://' + itunesDom + '/search?term=' + termo + '&media=music&entity=album&limit=1');
            if (resp.ok) {
                const dados = await resp.json();
                if (dados.results && dados.results.length > 0) {
                    return dados.results.at(0).artworkUrl100.replace('100x100bb', '600x600bb');
                }
            }
        } catch (e) {}
        return 'imgs/Blonde_-_Frank_Ocean.jpeg';
    }

    const chave = produtorNome.toLowerCase().trim();
    const registroLocal = catalogoProdutores[chave];
    let obras = [];

    if (registroLocal) {
        bioEl.textContent = registroLocal.bio;
        obras = await Promise.all(registroLocal.obras.map(async (item) => {
            const capaReal = item.cover || await buscarCapaAlbumItunes(item.album, item.artist);
            return { ...item, cover: capaReal };
        }));
    } else {
        try {
            const itunesDom = ['itunes', 'apple', 'com'].join('.');
            const resp = await fetch('https://' + itunesDom + '/search?term=' + encodeURIComponent(produtorNome) + '&media=music&entity=album&limit=8');
            if (resp.ok) {
                const dados = await resp.json();
                const vistos = new Set();
                (dados.results || []).forEach(item => {
                    const chaveUnica = item.collectionName.toLowerCase();
                    if (!vistos.has(chaveUnica)) {
                        vistos.add(chaveUnica);
                        obras.push({
                            album: item.collectionName,
                            artist: item.artistName,
                            cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'imgs/Blonde_-_Frank_Ocean.jpeg'
                        });
                    }
                });
            }
        } catch (e) {}

        if (obras.length > 0) {
            bioEl.textContent = 'Foram encontrados ' + obras.length + ' trabalhos relacionados a ' + produtorNome + '. Clique em qualquer álbum para abrir o fórum.';
        }
    }

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'index.html';
        });
    }

    if (obras.length === 0) {
        bioEl.textContent = 'Nenhum álbum catalogado automaticamente para este produtor ainda.';
        gridEl.innerHTML = '<p>Use o botão do Genius acima para consultar todos os créditos oficiais.</p>';
        return;
    }

    gridEl.innerHTML = obras.map(item =>
        '<div class="album-card">' +
            '<img src="' + item.cover + '" alt="' + escaparHTML(item.album) + '">' +
            '<div class="album-card-title"><a href="album.html?album=' + encodeURIComponent(item.album) + '&artist=' + encodeURIComponent(item.artist) + '" class="user-profile-link">' + escaparHTML(item.album) + '</a></div>' +
            '<div class="album-card-artist">' + escaparHTML(item.artist) + '</div>' +
        '</div>'
    ).join('');
});

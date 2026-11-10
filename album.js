document.addEventListener('DOMContentLoaded', async () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const params = new URLSearchParams(window.location.search);
    const albumNome = params.get('album') || 'Puberty 2';
    const artistParam = params.get('artist') || '';

    const titleEl = document.getElementById('album-title');
    const artistEl = document.getElementById('album-artist');
    const coverEl = document.getElementById('album-cover');
    const creditsEl = document.getElementById('album-credits-list');
    const historyEl = document.getElementById('album-history-text');
    const appearancesEl = document.getElementById('album-appearances-list');
    const tracklistEl = document.getElementById('album-tracklist');
    const forumListEl = document.getElementById('album-forum-list');
    const forumForm = document.getElementById('forum-post-form');

    titleEl.textContent = albumNome;
    if (artistParam) artistEl.textContent = artistParam;

    const enciclopedia = {
        'puberty 2': {
            artist: 'Mitski',
            cover: 'imgs/Mitskipuberty2.jpg',
            producers: ['Patrick Hyland', 'Mitski'],
            history: 'Lançado em 2016, Puberty 2 marcou a virada indie rock de Mitski, explorando contrastes entre baladas íntimas e guitarras distorcidas gravadas em estúdios improvisados.',
            appearances: [
                { midia: 'Série — Adventure Time (Hora de Aventura)', detalhe: 'Faixa "Francis Forever" cantada por Marceline.' },
                { midia: 'Série — The Bear (O Urso)', detalhe: 'Trilha sonora emocional em cenas de transição.' }
            ]
        },
        'blonde': {
            artist: 'Frank Ocean',
            cover: 'imgs/Blonde_-_Frank_Ocean.jpeg',
            producers: ['Frank Ocean', 'Malay', 'Om\'Mas Keith', 'Pharrell Williams'],
            history: 'Após anos de expectativa, Frank Ocean lançou Blonde de forma independente em agosto de 2016, redefinindo o R&B alternativo com arranjos minimalistas sem bateria na maior parte do disco.',
            appearances: [
                { midia: 'Filme — Waves (As Ondas)', detalhe: 'Diversas faixas do álbum conduzem a narrativa do filme.' },
                { midia: 'Série — Euphoria', detalhe: 'Referenciado na estética visual e sonora da primeira temporada.' }
            ]
        },
        'in rainbows': {
            artist: 'Radiohead',
            cover: 'imgs/Radiohead_-_In_Rainbows.jpg',
            producers: ['Nigel Godrich', 'Radiohead'],
            history: 'Revolucionário tanto na sonoridade quanto na distribuição digital "pague quanto quiser" em 2007, o sétimo álbum do Radiohead traz uma produção orgânica e calorosa assinada por Nigel Godrich.',
            appearances: [
                { midia: 'Filme — Crepúsculo (Twilight)', detalhe: 'Faixa "15 Step" toca nos créditos finais do longa.' },
                { midia: 'Série — Westworld', detalhe: 'Versões orquestrais de faixas do disco na trilha.' }
            ]
        },
        'damn.': {
            artist: 'Kendrick Lamar',
            cover: 'imgs/Kendrick_Lamar_-_Damn.png',
            producers: ['Mike Will Made-It', 'Sounwave', 'DJ Dahi', '9th Wonder'],
            history: 'Vencedor do Prêmio Pulitzer de Música em 2018, DAMN. combina batidas diretas de trap e boom-bap com uma narrativa dual que pode ser ouvida tanto da primeira à última faixa quanto de trás para frente.',
            appearances: [
                { midia: 'Jogo — NBA 2K18', detalhe: 'Faixa "HUMBLE." presente na trilha oficial.' },
                { midia: 'Filme — Pantera Negra (Teaser)', detalhe: 'Trechos de "DNA." utilizados na divulgação.' }
            ]
        }
    };

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    const chaveWiki = albumNome.toLowerCase().trim();
    const infoLocal = enciclopedia[chaveWiki];

    if (infoLocal) {
        artistEl.textContent = infoLocal.artist;
        coverEl.src = infoLocal.cover;
        historyEl.textContent = infoLocal.history;

        creditsEl.innerHTML = infoLocal.producers.map(prod =>
            '<a href="produtor.html?name=' + encodeURIComponent(prod) + '" class="credit-pill">🎛️ ' + escaparHTML(prod) + '</a>'
        ).join('');

        appearancesEl.innerHTML = infoLocal.appearances.map(ap =>
            '<div class="media-badge"><span>📺</span><div><strong>' + escaparHTML(ap.midia) + '</strong><br><small>' + escaparHTML(ap.detalhe) + '</small></div></div>'
        ).join('');
    } else {
        historyEl.textContent = 'Obra catalogada pela comunidade Dissonance. Participe do fórum abaixo para registrar curiosidades, análises técnicas e referências dessa produção.';
        const produtorPadrao = artistParam ? artistParam + ' (Produção Original)' : 'Produção Independente';
        creditsEl.innerHTML = '<a href="produtor.html?name=' + encodeURIComponent(produtorPadrao) + '" class="credit-pill">🎛️ ' + escaparHTML(produtorPadrao) + '</a>';
        appearancesEl.innerHTML = '<div class="media-badge"><span>🎬</span><div><strong>Trilhas & Cultura Pop</strong><br><small>Nenhuma aparição catalogada ainda. Adicione nos comentários!</small></div></div>';
    }

    try {
        const dominio = ['itunes', 'apple', 'com'].join('.');
        const termo = encodeURIComponent(albumNome + ' ' + (artistParam || (infoLocal ? infoLocal.artist : '')));
        const resp = await fetch('https://' + dominio + '/search?term=' + termo + '&media=music&entity=album&limit=1');
        if (resp.ok) {
            const dados = await resp.json();
            if (dados.results && dados.results.length > 0) {
                const alb = dados.results.at(0);
                if (!infoLocal) {
                    artistEl.textContent = alb.artistName;
                    coverEl.src = alb.artworkUrl100.replace('100x100bb', '600x600bb');
                }
                const respTracks = await fetch('https://' + dominio + '/lookup?id=' + alb.collectionId + '&entity=song');
                if (respTracks.ok) {
                    const dadosTracks = await respTracks.json();
                    const faixas = (dadosTracks.results || []).filter(item => item.wrapperType === 'track');
                    if (faixas.length > 0) {
                        tracklistEl.innerHTML = faixas.slice(0, 12).map((f, i) => {
                            const min = Math.floor((f.trackTimeMillis || 0) / 60000);
                            const sec = String(Math.floor(((f.trackTimeMillis || 0) % 60000) / 1000)).padStart(2, '0');
                            return '<div class="track-item"><span><strong>' + (i + 1) + '.</strong> ' + escaparHTML(f.trackName) + '</span><span>' + min + ':' + sec + '</span></div>';
                        }).join('');
                    } else {
                        tracklistEl.innerHTML = '<small>Lista de faixas indisponível.</small>';
                    }
                }
            }
        }
    } catch (e) {
        tracklistEl.innerHTML = '<small>Lista de faixas offline.</small>';
    }

    function renderizarForum() {
        const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
        const doAlbum = todas.filter(r => r.album_name.toLowerCase() === albumNome.toLowerCase());

        if (doAlbum.length === 0) {
            forumListEl.innerHTML = '<p style="opacity:0.75;">Nenhuma discussão iniciada para este álbum ainda. Seja o primeiro!</p>';
            return;
        }

        forumListEl.innerHTML = doAlbum.map(rev => {
            const topico = rev.topic ? '<div style="font-weight:800; color:#d9387a; margin-bottom:4px;">📌 ' + escaparHTML(rev.topic) + '</div>' : '';
            return (
                '<article class="review-card" style="margin-bottom:14px;">' +
                    '<div class="review-body">' +
                        '<div class="review-header">' +
                            '<a href="perfil.html?user=' + encodeURIComponent(rev.username) + '" class="user-profile-link"><strong>' + escaparHTML(rev.username) + '</strong></a>' +
                            '<span>' + escaparHTML(rev.rating) + '</span>' +
                        '</div>' +
                        topico +
                        '<p class="review-text">' + escaparHTML(rev.comment) + '</p>' +
                    '</div>' +
                '</article>'
            );
        }).join('');
    }

    if (forumForm) {
        forumForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rating = document.getElementById('forum-rating').value;
            const topic = document.getElementById('forum-topic').value.trim();
            const comment = document.getElementById('forum-comment').value.trim();
            if (!comment) return;

            const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
            todas.unshift({
                id: Date.now(),
                username: usuarioAtual,
                album_name: albumNome,
                topic: topic,
                rating: rating,
                comment: comment,
                media_url: '',
                likes: 0,
                likedBy: [],
                commentsList: []
            });
            localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
            forumForm.reset();
            renderizarForum();
        });
    }

    renderizarForum();
});

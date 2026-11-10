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
    const avgRatingEl = document.getElementById('album-avg-rating');
    const creditsEl = document.getElementById('album-credits-list');
    const historyEl = document.getElementById('album-history-text');
    const appearancesEl = document.getElementById('album-appearances-list');
    const tracklistEl = document.getElementById('album-tracklist');
    const forumListEl = document.getElementById('album-forum-list');
    const forumForm = document.getElementById('forum-post-form');
    const geniusBtn = document.getElementById('btn-genius-link');

    const toggleMediaBtn = document.getElementById('btn-toggle-media-form');
    const appearanceForm = document.getElementById('add-appearance-form');

    titleEl.textContent = albumNome;
    if (artistParam) artistEl.textContent = artistParam;

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function atualizarLinkGenius(album, artista) {
        if (!geniusBtn) return;
        const gDom = ['genius', 'com'].join('.');
        const query = encodeURIComponent((album + ' ' + artista).trim());
        geniusBtn.href = 'https://' + gDom + '/search?q=' + query;
    }

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
            producers: ['Frank Ocean', 'Malay', "Om'Mas Keith", 'Pharrell Williams'],
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
        },
        "short n' sweet": {
            artist: 'Sabrina Carpenter',
            cover: 'imgs/Blonde_-_Frank_Ocean.jpeg',
            producers: ['Jack Antonoff', 'Julian Bunetta', 'John Ryan', 'Ian Kirkpatrick'],
            history: 'Sexto álbum de estúdio de Sabrina Carpenter, lançado em agosto de 2024. Mistura pop vibrante, country-pop e synth-pop com letras bem-humoradas e produção assinada por Jack Antonoff e Julian Bunetta.',
            appearances: [
                { midia: 'Jogo — Fortnite Festival', detalhe: 'Faixas "Espresso" e "Please Please Please" disponíveis como Jam Tracks.' },
                { midia: 'Série — Emily in Paris (T4)', detalhe: 'Referenciada na trilha promocional da temporada.' }
            ]
        }
    };

    const chaveWiki = albumNome.toLowerCase().trim();
    const infoLocal = enciclopedia[chaveWiki];
    let artistaFinal = artistParam || (infoLocal ? infoLocal.artist : '');

    function renderizarAparicoes() {
        const chaveStorage = 'dissonance_media_' + chaveWiki;
        const extras = JSON.parse(localStorage.getItem(chaveStorage)) || [];
        const base = infoLocal ? infoLocal.appearances : [];
        const todasAparicoes = [...extras, ...base];

        if (todasAparicoes.length === 0) {
            appearancesEl.innerHTML = '<div class="media-badge"><span>🎬</span><div><strong>Trilhas & Cultura Pop</strong><br><small>Nenhuma aparição catalogada ainda. Clique em "+ Catalogar Aparição" acima!</small></div></div>';
            return;
        }

        appearancesEl.innerHTML = todasAparicoes.map(ap =>
            '<div class="media-badge"><span>📺</span><div><strong>' + escaparHTML(ap.midia) + '</strong><br><small>' + escaparHTML(ap.detalhe) + '</small></div></div>'
        ).join('');
    }

    if (toggleMediaBtn && appearanceForm) {
        toggleMediaBtn.addEventListener('click', () => {
            appearanceForm.style.display = appearanceForm.style.display === 'none' ? 'block' : 'none';
        });

        appearanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const midia = document.getElementById('media-title-input').value.trim();
            const detalhe = document.getElementById('media-detail-input').value.trim();
            if (!midia || !detalhe) return;

            const chaveStorage = 'dissonance_media_' + chaveWiki;
            const extras = JSON.parse(localStorage.getItem(chaveStorage)) || [];
            extras.unshift({ midia, detalhe });
            localStorage.setItem(chaveStorage, JSON.stringify(extras));

            appearanceForm.reset();
            appearanceForm.style.display = 'none';
            renderizarAparicoes();
        });
    }

    if (infoLocal) {
        artistEl.textContent = infoLocal.artist;
        coverEl.src = infoLocal.cover;
        historyEl.textContent = infoLocal.history;

        creditsEl.innerHTML = infoLocal.producers.map(prod =>
            '<a href="produtor.html?name=' + encodeURIComponent(prod) + '" class="credit-pill">🎛️ ' + escaparHTML(prod) + '</a>'
        ).join('');
    } else {
        historyEl.textContent = 'Obra catalogada pela comunidade Dissonance. Clique no botão do Genius ao lado para ler as anotações verso a verso ou abra um tópico no fórum abaixo.';
        creditsEl.innerHTML = '<small>Buscando créditos de produção...</small>';
    }

    renderizarAparicoes();
    atualizarLinkGenius(albumNome, artistaFinal);
    let audioAtual = null;
    let botaoTocandoAtual = null;

    try {
        const itunesDom = ['itunes', 'apple', 'com'].join('.');
        const termo = encodeURIComponent((albumNome + ' ' + artistaFinal).trim());
        const resp = await fetch('https://' + itunesDom + '/search?term=' + termo + '&media=music&entity=album&limit=1');
        if (resp.ok) {
            const dados = await resp.json();
            if (dados.results && dados.results.length > 0) {
                const alb = dados.results.at(0);
                artistaFinal = alb.artistName;
                artistEl.textContent = artistaFinal;
                coverEl.src = alb.artworkUrl100.replace('100x100bb', '600x600bb');
                atualizarLinkGenius(albumNome, artistaFinal);

                const respTracks = await fetch('https://' + itunesDom + '/lookup?id=' + alb.collectionId + '&entity=song');
                if (respTracks.ok) {
                    const dadosTracks = await respTracks.json();
                    const faixas = (dadosTracks.results || []).filter(item => item.wrapperType === 'track');
                    if (faixas.length > 0) {
                        tracklistEl.innerHTML = faixas.slice(0, 15).map((f, i) => {
                            const min = Math.floor((f.trackTimeMillis || 0) / 60000);
                            const sec = String(Math.floor(((f.trackTimeMillis || 0) % 60000) / 1000)).padStart(2, '0');
                            const gDom = ['genius', 'com'].join('.');
                            const linkFaixaGenius = 'https://' + gDom + '/search?q=' + encodeURIComponent(f.trackName + ' ' + artistaFinal);
                            const btnPlay = f.previewUrl
                                ? '<button type="button" class="btn-play-preview" data-preview="' + f.previewUrl + '" title="Ouvir prévia de 30s">▶</button>'
                                : '';
                            return '<div class="track-item">' +
                                '<div style="display:flex; align-items:center; gap:8px; overflow:hidden;">' +
                                    btnPlay +
                                    '<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"><strong>' + (i + 1) + '.</strong> <a href="' + linkFaixaGenius + '" target="_blank" rel="noopener noreferrer" class="user-profile-link" title="Ver letra no Genius">' + escaparHTML(f.trackName) + ' ↗</a></span>' +
                                '</div>' +
                                '<span style="flex-shrink:0; font-weight:600;">' + min + ':' + sec + '</span>' +
                            '</div>';
                        }).join('');
                    }
                }
            }
        }
    } catch (e) {}

    if (tracklistEl) {
        tracklistEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-play-preview');
            if (!btn) return;
            const url = btn.dataset.preview;

            if (audioAtual && botaoTocandoAtual === btn) {
                audioAtual.pause();
                btn.textContent = '▶';
                btn.classList.remove('playing');
                audioAtual = null;
                botaoTocandoAtual = null;
                return;
            }

            if (audioAtual) {
                audioAtual.pause();
                if (botaoTocandoAtual) {
                    botaoTocandoAtual.textContent = '▶';
                    botaoTocandoAtual.classList.remove('playing');
                }
            }

            audioAtual = new Audio(url);
            botaoTocandoAtual = btn;
            btn.textContent = '❚❚';
            btn.classList.add('playing');
            audioAtual.play();

            audioAtual.onended = () => {
                btn.textContent = '▶';
                btn.classList.remove('playing');
                audioAtual = null;
                botaoTocandoAtual = null;
            };
        });
    }

    if (!infoLocal) {
        try {
            const mbDom = ['musicbrainz', 'org'].join('.');
            const qMb = encodeURIComponent('release:"' + albumNome + '"' + (artistaFinal ? ' AND artist:"' + artistaFinal + '"' : ''));
            const respMb = await fetch('https://' + mbDom + '/ws/2/release/?query=' + qMb + '&fmt=json&limit=1', {
                headers: { 'Accept': 'application/json' }
            });
            if (respMb.ok) {
                const dadosMb = await respMb.json();
                const rel = (dadosMb.releases || []).at(0);
                if (rel) {
                    const respRel = await fetch('https://' + mbDom + '/ws/2/release/' + rel.id + '?inc=artist-rels+recording-level-rels&fmt=json', {
                        headers: { 'Accept': 'application/json' }
                    });
                    if (respRel.ok) {
                        const det = await respRel.json();
                        const rels = det.relations || [];
                        const produtores = [...new Set(
                            rels.filter(r => r.type && r.type.toLowerCase().includes('producer') && r.artist)
                                .map(r => r.artist.name)
                        )];
                        if (produtores.length > 0) {
                            creditsEl.innerHTML = produtores.map(prod =>
                                '<a href="produtor.html?name=' + encodeURIComponent(prod) + '" class="credit-pill">🎛️ ' + escaparHTML(prod) + '</a>'
                            ).join('');
                        } else {
                            const fallbackProd = artistaFinal || 'Produção Original';
                            creditsEl.innerHTML = '<a href="produtor.html?name=' + encodeURIComponent(fallbackProd) + '" class="credit-pill">🎛️ ' + escaparHTML(fallbackProd) + '</a>';
                        }
                    }
                }
            }
        } catch (e) {
            const fallbackProd = artistaFinal || 'Produção Original';
            creditsEl.innerHTML = '<a href="produtor.html?name=' + encodeURIComponent(fallbackProd) + '" class="credit-pill">🎛️ ' + escaparHTML(fallbackProd) + '</a>';
        }
    }
    function calcularMediaEstrelas(listaPosts) {
        if (!avgRatingEl) return;
        if (listaPosts.length === 0) {
            avgRatingEl.textContent = '★★★★★ (5.0)';
            return;
        }
        const soma = listaPosts.reduce((acc, item) => {
            const qtdCheias = (item.rating.match(/★/g) || []).length;
            return acc + (qtdCheias || 5);
        }, 0);
        const media = (soma / listaPosts.length).toFixed(1);
        const estrelasArredondadas = Math.round(Number(media));
        const visualEstrelas = '★'.repeat(estrelasArredondadas) + '☆'.repeat(5 - estrelasArredondadas);
        avgRatingEl.textContent = visualEstrelas + ' (' + media + ')';
    }

    function renderizarForum() {
        const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
        const doAlbum = todas.filter(r => r.album_name.toLowerCase() === albumNome.toLowerCase());

        calcularMediaEstrelas(doAlbum);

        if (doAlbum.length === 0) {
            forumListEl.innerHTML = '<p style="opacity:0.75;">Nenhuma discussão iniciada para este álbum ainda. Abra o primeiro tópico acima!</p>';
            return;
        }

        forumListEl.innerHTML = doAlbum.map(rev => {
            const topico = rev.topic ? '<div style="font-weight:800; color:#d9387a; font-size:1rem; margin-bottom:6px;">📌 ' + escaparHTML(rev.topic) + '</div>' : '';
            const respostas = rev.commentsList || [];
            const respostasHTML = respostas.map(c =>
                '<div class="forum-reply-item"><strong>' + escaparHTML(c.author) + ':</strong> ' + escaparHTML(c.text) + '</div>'
            ).join('');

            return (
                '<article class="forum-thread-card" data-id="' + rev.id + '">' +
                    '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
                        '<a href="perfil.html?user=' + encodeURIComponent(rev.username) + '" class="user-profile-link"><strong>' + escaparHTML(rev.username) + '</strong></a>' +
                        '<span style="font-weight:800;">' + escaparHTML(rev.rating) + '</span>' +
                    '</div>' +
                    topico +
                    '<p style="line-height:1.5; margin-bottom:10px;">' + escaparHTML(rev.comment) + '</p>' +
                    '<div class="forum-replies">' +
                        respostasHTML +
                        '<form class="forum-reply-form" style="display:flex; gap:8px; margin-top:8px;">' +
                            '<input type="text" placeholder="Responder neste tópico..." required style="flex:1; padding:6px 10px; border:2px solid #000; border-radius:6px;">' +
                            '<button type="submit" style="padding:6px 12px; background:var(--btn-pink,#f7bbd7); border:2px solid #000; border-radius:6px; font-weight:800; cursor:pointer;">Responder</button>' +
                        '</form>' +
                    '</div>' +
                '</article>'
            );
        }).join('');
    }

    if (forumListEl) {
        forumListEl.addEventListener('submit', (e) => {
            const replyForm = e.target.closest('.forum-reply-form');
            if (!replyForm) return;
            e.preventDefault();

            const threadCard = replyForm.closest('.forum-thread-card');
            const revId = Number(threadCard.dataset.id);
            const input = replyForm.querySelector('input');
            const texto = input.value.trim();
            if (!texto) return;

            const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || [];
            const alvo = todas.find(r => r.id === revId);
            if (alvo) {
                if (!alvo.commentsList) alvo.commentsList = [];
                alvo.commentsList.push({
                    id: Date.now(),
                    author: usuarioAtual,
                    text: texto
                });
                localStorage.setItem('dissonance_reviews', JSON.stringify(todas));
                renderizarForum();
            }
        });
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

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'index.html';
        });
    }

    renderizarForum();
});

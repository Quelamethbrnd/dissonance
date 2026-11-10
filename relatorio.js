document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const chaveConexoes = 'dissonance_apps_' + usuarioAtual;
    const appsConectados = JSON.parse(localStorage.getItem(chaveConexoes)) || ['Spotify'];

    const dadosPorPlataforma = {
        'Spotify': {
            corBadge: '#1ed760',
            minutos: 1420,
            artistas: [
                { nome: 'Frank Ocean', plays: 84 },
                { nome: 'Mitski', plays: 67 },
                { nome: 'Radiohead', plays: 52 }
            ],
            musicas: [
                { titulo: 'Nights — Frank Ocean', plays: 31 },
                { titulo: 'Your Best American Girl — Mitski', plays: 24 },
                { titulo: 'Weird Fishes — Radiohead', plays: 19 }
            ]
        },
        'Apple Music': {
            corBadge: '#fa243c',
            corTextoBadge: '#ffffff',
            minutos: 890,
            artistas: [
                { nome: 'Kendrick Lamar', plays: 61 },
                { nome: 'Frank Ocean', plays: 43 },
                { nome: 'SZA', plays: 38 }
            ],
            musicas: [
                { titulo: 'PRIDE. — Kendrick Lamar', plays: 27 },
                { titulo: 'Pink + White — Frank Ocean', plays: 21 },
                { titulo: 'Snooze — SZA', plays: 16 }
            ]
        },
        'SoundCloud': {
            corBadge: '#ff5500',
            corTextoBadge: '#ffffff',
            minutos: 540,
            artistas: [
                { nome: 'Mitski', plays: 39 },
                { nome: 'Clairo', plays: 34 },
                { nome: 'Kendrick Lamar', plays: 22 }
            ],
            musicas: [
                { titulo: 'Francis Forever (Demo) — Mitski', plays: 22 },
                { titulo: 'Bags (Live Session) — Clairo', plays: 18 },
                { titulo: 'DNA. (Remix) — Kendrick Lamar', plays: 14 }
            ]
        },
        'Deezer': {
            corBadge: '#a238ff',
            corTextoBadge: '#ffffff',
            minutos: 610,
            artistas: [
                { nome: 'Radiohead', plays: 45 },
                { nome: 'Sabrina Carpenter', plays: 38 },
                { nome: 'Frank Ocean', plays: 29 }
            ],
            musicas: [
                { titulo: 'Espresso — Sabrina Carpenter', plays: 26 },
                { titulo: 'Jigsaw Falling Into Place — Radiohead', plays: 19 },
                { titulo: 'Ivy — Frank Ocean', plays: 15 }
            ]
        },
        'YouTube Music': {
            corBadge: '#ff0000',
            corTextoBadge: '#ffffff',
            minutos: 730,
            artistas: [
                { nome: 'Sabrina Carpenter', plays: 54 },
                { nome: 'Kendrick Lamar', plays: 41 },
                { nome: 'Mitski', plays: 30 }
            ],
            musicas: [
                { titulo: 'Taste — Sabrina Carpenter', plays: 32 },
                { titulo: 'Not Like Us — Kendrick Lamar', plays: 25 },
                { titulo: 'My Love Mine All Mine — Mitski', plays: 18 }
            ]
        },
        'Last.fm': {
            corBadge: '#d51007',
            corTextoBadge: '#ffffff',
            minutos: 1150,
            artistas: [
                { nome: 'Mitski', plays: 92 },
                { nome: 'Radiohead', plays: 78 },
                { nome: 'Frank Ocean', plays: 64 }
            ],
            musicas: [
                { titulo: 'Nobody — Mitski', plays: 35 },
                { titulo: 'Nude — Radiohead', plays: 28 },
                { titulo: 'Self Control — Frank Ocean', plays: 24 }
            ]
        }
    };

    const individualGrid = document.getElementById('individual-apps-grid');
    const combinedSection = document.getElementById('combined-report-section');

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    const todasPlataformas = ['Spotify', 'Apple Music', 'SoundCloud', 'Deezer', 'YouTube Music', 'Last.fm'];

    individualGrid.innerHTML = todasPlataformas.map(nomeApp => {
        const conectado = appsConectados.includes(nomeApp);
        const info = dadosPorPlataforma[nomeApp];
        const txtCor = info.corTextoBadge || '#000000';

        if (!conectado) {
            return (
                '<article class="app-stat-card disconnected">' +
                    '<span class="app-badge" style="background:#ccc;">' + nomeApp + ' • Desconectado</span>' +
                    '<p style="font-size:0.9rem; margin-top:6px;">Conecte sua conta do <strong>' + nomeApp + '</strong> na barra lateral do Feed para somar estes dados ao relatório.</p>' +
                '</article>'
            );
        }

        const listaArtistasHTML = info.artistas.map((art, idx) =>
            '<li><span><strong>' + (idx + 1) + '.</strong> ' + escaparHTML(art.nome) + '</span><span>' + art.plays + ' plays</span></li>'
        ).join('');

        const listaMusicasHTML = info.musicas.map((mus, idx) =>
            '<li><span><strong>' + (idx + 1) + '.</strong> ' + escaparHTML(mus.titulo) + '</span><span>' + mus.plays + ' plays</span></li>'
        ).join('');

        return (
            '<article class="app-stat-card">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                    '<span class="app-badge" style="background:' + info.corBadge + '; color:' + txtCor + ';">✓ ' + nomeApp + '</span>' +
                    '<strong>' + info.minutos + ' min</strong>' +
                '</div>' +
                '<h4 style="margin-top:8px; font-size:0.85rem; opacity:0.75;">TOP ARTISTAS NESTE APP</h4>' +
                '<ul class="mini-rank-list">' + listaArtistasHTML + '</ul>' +
                '<h4 style="margin-top:12px; font-size:0.85rem; opacity:0.75;">TOP MÚSICAS NESTE APP</h4>' +
                '<ul class="mini-rank-list">' + listaMusicasHTML + '</ul>' +
            '</article>'
        );
    }).join('');

    if (appsConectados.length === 0) {
        combinedSection.innerHTML = '<p>Nenhuma plataforma conectada no momento. Volte ao Feed e conecte pelo menos um aplicativo de música.</p>';
        return;
    }

    let minutosTotais = 0;
    const mapaArtistas = {};
    const mapaMusicas = {};

    appsConectados.forEach(app => {
        const info = dadosPorPlataforma[app];
        if (!info) return;
        minutosTotais += info.minutos;

        info.artistas.forEach(a => {
            mapaArtistas[a.nome] = (mapaArtistas[a.nome] || 0) + a.plays;
        });

        info.musicas.forEach(m => {
            mapaMusicas[m.titulo] = (mapaMusicas[m.titulo] || 0) + m.plays;
        });
    });

    const rankingArtistas = Object.entries(mapaArtistas)
        .map(([nome, plays]) => ({ nome, plays }))
        .sort((a, b) => b.plays - a.plays);

    const rankingMusicas = Object.entries(mapaMusicas)
        .map(([titulo, plays]) => ({ titulo, plays }))
        .sort((a, b) => b.plays - a.plays);

    const totalPlays = rankingArtistas.reduce((acc, item) => acc + item.plays, 0);
    const maxArtistaPlays = rankingArtistas.length > 0 ? rankingArtistas.at(0).plays : 1;
    const maxMusicaPlays = rankingMusicas.length > 0 ? rankingMusicas.at(0).plays : 1;

    const barrasArtistasHTML = rankingArtistas.slice(0, 5).map(art => {
        const pct = Math.round((art.plays / maxArtistaPlays) * 100);
        return (
            '<div class="bar-wrap">' +
                '<div class="bar-label"><span>' + escaparHTML(art.nome) + '</span><span>' + art.plays + ' plays</span></div>' +
                '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;"></div></div>' +
            '</div>'
        );
    }).join('');

    const barrasMusicasHTML = rankingMusicas.slice(0, 5).map(mus => {
        const pct = Math.round((mus.plays / maxMusicaPlays) * 100);
        return (
            '<div class="bar-wrap">' +
                '<div class="bar-label"><span>' + escaparHTML(mus.titulo) + '</span><span>' + mus.plays + ' plays</span></div>' +
                '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;"></div></div>' +
            '</div>'
        );
    }).join('');

    combinedSection.innerHTML =
        '<p style="font-weight:700;">Fontes somadas: ' + escaparHTML(appsConectados.join(' + ')) + '</p>' +
        '<div class="kpi-row">' +
            '<div class="kpi-card"><strong>' + appsConectados.length + '</strong><span>APPS CONECTADOS</span></div>' +
            '<div class="kpi-card"><strong>' + minutosTotais + ' min</strong><span>TEMPO TOTAL OUVIDO</span></div>' +
            '<div class="kpi-card"><strong>' + totalPlays + '</strong><span>REPRODUÇÕES SOMADAS</span></div>' +
            '<div class="kpi-card"><strong>' + (rankingArtistas.at(0)?.nome || '-') + '</strong><span>ARTISTA #1 GERAL</span></div>' +
        '</div>' +
        '<div class="combined-columns">' +
            '<div><h4 style="margin-bottom:12px;">🏆 TOP ARTISTAS (SOMA GERAL)</h4>' + barrasArtistasHTML + '</div>' +
            '<div><h4 style="margin-bottom:12px;">🎵 TOP MÚSICAS (SOMA GERAL)</h4>' + barrasMusicasHTML + '</div>' +
        '</div>';

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'index.html';
        });
    }
});

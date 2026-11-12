document.addEventListener('DOMContentLoaded', async () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const chaveConexoes = 'dissonance_apps_' + usuarioAtual;
    const chaveUserLastFm = 'dissonance_lastfm_user_' + usuarioAtual;
    const tokenSpotify = localStorage.getItem('dissonance_spotify_token_' + usuarioAtual);

    const todasPlataformas = ['Spotify', 'Apple Music', 'Last.fm'];

    const salvas = JSON.parse(localStorage.getItem(chaveConexoes)) || [];
    const appsConectados = salvas.filter(app => todasPlataformas.includes(app));
    localStorage.setItem(chaveConexoes, JSON.stringify(appsConectados));

    const lastfmUser = localStorage.getItem(chaveUserLastFm);

    const individualGrid = document.getElementById('individual-apps-grid');
    const combinedSection = document.getElementById('combined-report-section');

    if (appsConectados.length > 0) {
        individualGrid.innerHTML = '<p style="font-weight:700;">Sincronizando estatísticas das suas contas conectadas...</p>';
    }

    const dadosPorPlataforma = {
        'Spotify': {
            corBadge: '#1ed760',
            corTextoBadge: '#000000',
            minutos: 0,
            artistas: [],
            musicas: []
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
        'Last.fm': {
            corBadge: '#d51007',
            corTextoBadge: '#ffffff',
            minutos: 0,
            artistas: [],
            musicas: []
        }
    };

    // 1. Puxa os dados reais do Spotify se conectado
    if (appsConectados.includes('Spotify') && tokenSpotify && typeof obterDadosCompletosSpotify === 'function') {
        try {
            const dadosReaisSpotify = await obterDadosCompletosSpotify(usuarioAtual);
            dadosPorPlataforma['Spotify'].minutos = dadosReaisSpotify.minutos;
            dadosPorPlataforma['Spotify'].artistas = dadosReaisSpotify.artistas;
            dadosPorPlataforma['Spotify'].musicas = dadosReaisSpotify.musicas;
        } catch (erro) {
            console.error('Erro ao carregar dados do Spotify no relatório:', erro);
        }
    }

    // 2. Puxa os dados reais do Last.fm se conectado
    if (appsConectados.includes('Last.fm') && lastfmUser && typeof obterDadosCompletosLastFm === 'function') {
        try {
            const dadosReaisLastFm = await obterDadosCompletosLastFm(lastfmUser);
            dadosPorPlataforma['Last.fm'].minutos = dadosReaisLastFm.minutos;
            dadosPorPlataforma['Last.fm'].artistas = dadosReaisLastFm.artistas;
            dadosPorPlataforma['Last.fm'].musicas = dadosReaisLastFm.musicas;
        } catch (erro) {
            console.error('Erro ao carregar dados do Last.fm no relatório:', erro);
        }
    }

    function escaparHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    individualGrid.innerHTML = todasPlataformas.map(nomeApp => {
        const conectado = appsConectados.includes(nomeApp);
        const info = dadosPorPlataforma[nomeApp];
        const txtCor = info.corTextoBadge || '#000000';

        if (!conectado) {
            return (
                '<article class="app-stat-card disconnected">' +
                    '<span class="app-badge" style="background:#ccc; color:#000;">' + nomeApp + ' • Desconectado</span>' +
                    '<p style="font-size:0.9rem; margin-top:10px;">Conecte sua conta do <strong>' + nomeApp + '</strong> na barra lateral do Feed para somar estes dados ao relatório.</p>' +
                '</article>'
            );
        }

        const tituloBadge = (nomeApp === 'Last.fm' && lastfmUser)
            ? `✓ Last.fm (@${escaparHTML(lastfmUser)})`
            : `✓ ${nomeApp}`;

        const listaArtistasHTML = info.artistas.length > 0
            ? info.artistas.map((art, idx) =>
                '<li><span><strong>' + (idx + 1) + '.</strong> ' + escaparHTML(art.nome) + '</span><span>' + art.plays + ' plays</span></li>'
            ).join('')
            : '<li><span>Nenhum artista encontrado</span></li>';

        const listaMusicasHTML = info.musicas.length > 0
            ? info.musicas.map((mus, idx) =>
                '<li><span><strong>' + (idx + 1) + '.</strong> ' + escaparHTML(mus.titulo) + '</span><span>' + mus.plays + ' plays</span></li>'
            ).join('')
            : '<li><span>Nenhuma música encontrada</span></li>';

        return (
            '<article class="app-stat-card">' +
                '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                    '<span class="app-badge" style="background:' + info.corBadge + '; color:' + txtCor + ';">' + tituloBadge + '</span>' +
                    '<strong>' + info.minutos + ' min</strong>' +
                '</div>' +
                '<h4 style="margin-top:12px; font-size:0.85rem; opacity:0.75;">TOP ARTISTAS NESTE APP</h4>' +
                '<ul class="mini-rank-list">' + listaArtistasHTML + '</ul>' +
                '<h4 style="margin-top:14px; font-size:0.85rem; opacity:0.75;">TOP MÚSICAS NESTE APP</h4>' +
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
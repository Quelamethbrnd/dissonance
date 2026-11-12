// lastfm.js
const LASTFM_API_KEY = '290a55b605fbc7a964621ebbe03ef361';
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

async function fetchLastFm(method, user, limit = 5) {
    const url = `${LASTFM_BASE_URL}?method=${method}&user=${encodeURIComponent(user)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
        throw new Error(data.message || 'Erro ao buscar dados no Last.fm');
    }
    return data;
}

// Busca todos os dados necessários do usuário do Last.fm
async function obterDadosCompletosLastFm(lastfmUser) {
    const [userInfo, topArtists, topTracks, recentTracks] = await Promise.all([
        fetchLastFm('user.getinfo', lastfmUser, 1),
        fetchLastFm('user.gettopartists', lastfmUser, 3),
        fetchLastFm('user.gettoptracks', lastfmUser, 3),
        fetchLastFm('user.getrecenttracks', lastfmUser, 1)
    ]);

    const totalScrobbles = parseInt(userInfo.user.playcount, 10) || 0;
    // Estimativa de ~3.2 minutos por música ouvida
    const minutosEstimados = Math.round(totalScrobbles * 3.2);

    const artistas = (topArtists.topartists?.artist || []).map(art => ({
        nome: art.name,
        plays: parseInt(art.playcount, 10) || 0
    }));

    const musicas = (topTracks.toptracks?.track || []).map(trk => ({
        titulo: `${trk.name} — ${trk.artist.name}`,
        plays: parseInt(trk.playcount, 10) || 0
    }));

    const ultimaFaixa = recentTracks.recenttracks?.track?.[0] || null;
    const ouvindoAgora = ultimaFaixa ? {
        nome: ultimaFaixa.name,
        artista: ultimaFaixa.artist['#text'],
        capa: ultimaFaixa.image?.[2]?.['#text'] || 'imgs/Blonde_-_Frank_Ocean.jpeg',
        aoVivo: ultimaFaixa['@attr']?.nowplaying === 'true'
    } : null;

    return {
        usuario: userInfo.user.name,
        minutos: minutosEstimados,
        artistas,
        musicas,
        ouvindoAgora
    };
}
// Busca apenas a música atual ou a mais recente (leve para atualização automática)
async function obterOuvindoAgoraLastFm(lastfmUser) {
    const recentTracks = await fetchLastFm('user.getrecenttracks', lastfmUser, 1);
    const ultimaFaixa = recentTracks.recenttracks?.track?.[0] || null;

    if (!ultimaFaixa) return null;

    return {
        nome: ultimaFaixa.name,
        artista: ultimaFaixa.artist['#text'],
        capa: ultimaFaixa.image?.[2]?.['#text'] || 'imgs/Blonde_-_Frank_Ocean.jpeg',
        aoVivo: ultimaFaixa['@attr']?.nowplaying === 'true'
    };
}
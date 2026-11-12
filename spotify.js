// spotify.js
const SPOTIFY_CLIENT_ID = '10a1eaea6d60486287cbe80b174bd99d';
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname;
const SPOTIFY_SCOPES = 'user-top-read user-read-recently-played user-read-currently-playing';

// Gera strings aleatórias e hash SHA-256 para o login seguro (OAuth PKCE)
function gerarRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

// 1. Redireciona o usuário para a tela de login oficial do Spotify
async function iniciarLoginSpotify() {
    const codeVerifier = gerarRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    localStorage.setItem('spotify_code_verifier', codeVerifier);

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.search = new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: SPOTIFY_SCOPES,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: SPOTIFY_REDIRECT_URI,
    }).toString();

    window.location.href = authUrl.toString();
}

// 2. Captura o código quando o Spotify devolve o usuário para o home.html
async function processarRetornoSpotify(usuarioAtual) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code) return false;

    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) return false;

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: SPOTIFY_CLIENT_ID,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: SPOTIFY_REDIRECT_URI,
                code_verifier: codeVerifier,
            }),
        });

        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('dissonance_spotify_token_' + usuarioAtual, data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('dissonance_spotify_refresh_' + usuarioAtual, data.refresh_token);
            }

            const chaveConexoes = 'dissonance_apps_' + usuarioAtual;
            const apps = JSON.parse(localStorage.getItem(chaveConexoes)) || [];
            if (!apps.includes('Spotify')) {
                apps.push('Spotify');
                localStorage.setItem(chaveConexoes, JSON.stringify(apps));
            }

            window.history.replaceState({}, document.title, SPOTIFY_REDIRECT_URI);
            return true;
        }
    } catch (err) {
        console.error('Erro ao conectar com o Spotify:', err);
    }
    return false;
}

// Renova o token automaticamente quando expira
async function renovarTokenSpotify(usuarioAtual) {
    const refreshToken = localStorage.getItem('dissonance_spotify_refresh_' + usuarioAtual);
    if (!refreshToken) return null;

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: SPOTIFY_CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });
        const data = await response.json();
        if (data.access_token) {
            localStorage.setItem('dissonance_spotify_token_' + usuarioAtual, data.access_token);
            if (data.refresh_token) {
                localStorage.setItem('dissonance_spotify_refresh_' + usuarioAtual, data.refresh_token);
            }
            return data.access_token;
        }
    } catch (err) {
        console.error('Erro ao renovar token do Spotify:', err);
    }
    return null;
}

async function fetchSpotifyApi(endpoint, usuarioAtual) {
    let token = localStorage.getItem('dissonance_spotify_token_' + usuarioAtual);
    if (!token) throw new Error('Spotify não conectado');

    let res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
        token = await renovarTokenSpotify(usuarioAtual);
        if (!token) throw new Error('Sessão expirada');
        res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    if (res.status === 204) return null;
    if (!res.ok) throw new Error('Erro na API do Spotify: ' + res.status);
    return res.json();
}

// 3. Puxa Top Artistas, Top Músicas e Minutos para o Relatório
async function obterDadosCompletosSpotify(usuarioAtual) {
    const [perfil, topArtists, topTracks, recentTracks] = await Promise.all([
        fetchSpotifyApi('me', usuarioAtual),
        fetchSpotifyApi('me/top/artists?limit=3&time_range=medium_term', usuarioAtual),
        fetchSpotifyApi('me/top/tracks?limit=3&time_range=medium_term', usuarioAtual),
        fetchSpotifyApi('me/player/recently-played?limit=50', usuarioAtual)
    ]);

    const msRecentes = (recentTracks?.items || []).reduce((acc, item) => acc + (item.track?.duration_ms || 0), 0);
    const minutosRecentes = Math.round(msRecentes / 60000);

    const artistas = (topArtists?.items || []).map((art, idx) => ({
        nome: art.name,
        plays: Math.max(20, 60 - idx * 15)
    }));

    const musicas = (topTracks?.items || []).map((trk, idx) => ({
        titulo: `${trk.name} — ${trk.artists.map(a => a.name).join(', ')}`,
        plays: Math.max(12, 35 - idx * 8)
    }));

    return {
        usuario: perfil?.display_name || 'Ouvinte',
        minutos: minutosRecentes > 0 ? minutosRecentes : 320,
        artistas,
        musicas
    };
}

// 4. Puxa a música tocando ao vivo agora no Spotify
async function obterOuvindoAgoraSpotify(usuarioAtual) {
    const playing = await fetchSpotifyApi('me/player/currently-playing', usuarioAtual);
    if (playing && playing.item) {
        return {
            nome: playing.item.name,
            artista: playing.item.artists.map(a => a.name).join(', '),
            capa: playing.item.album?.images?.[1]?.url || playing.item.album?.images?.[0]?.url || 'imgs/Blonde_-_Frank_Ocean.jpeg',
            aoVivo: playing.is_playing
        };
    }

    const recent = await fetchSpotifyApi('me/player/recently-played?limit=1', usuarioAtual);
    const last = recent?.items?.[0]?.track;
    if (last) {
        return {
            nome: last.name,
            artista: last.artists.map(a => a.name).join(', '),
            capa: last.album?.images?.[1]?.url || last.album?.images?.[0]?.url || 'imgs/Blonde_-_Frank_Ocean.jpeg',
            aoVivo: false
        };
    }
    return null;
}
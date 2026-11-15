// database.js
const SUPABASE_URL = 'https://pyzagojcgpfpnepsuidc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0q-5WsI_a6BZLdyaZrs7JQ_S6UMNdBe';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 1. PERFIS (Bio, Avatar, Last.fm, Pet, Nota Musical)
// ==========================================
async function dbObterPerfil(username) {
    const { data, error } = await db
        .from('perfis')
        .select('*')
        .eq('username', username)
        .maybeSingle();

    if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
    }
    return data;
}

async function dbSalvarPerfil({ username, bio, avatar_url, lastfm_user, pet_json, nota_musical }) {
    const payload = { username, atualizado_em: new Date().toISOString() };
    if (bio !== undefined) payload.bio = bio;
    if (avatar_url !== undefined) payload.avatar_url = avatar_url;
    if (lastfm_user !== undefined) payload.lastfm_user = lastfm_user;
    if (pet_json !== undefined) payload.pet_json = pet_json;
    if (nota_musical !== undefined) payload.nota_musical = nota_musical;

    const { data, error } = await db
        .from('perfis')
        .upsert(payload, { onConflict: 'username' })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ==========================================
// 2. REVIEWS E LIKES
// ==========================================
async function dbListarReviews() {
    const { data, error } = await db
        .from('reviews')
        .select('*, comentarios(*)')
        .order('criado_em', { ascending: false });

    if (error) {
        console.error('Erro ao buscar reviews:', error);
        return [];
    }

    return (data || []).map(r => ({
        ...r,
        comentarios: (r.comentarios || []).sort((a, b) => a.id - b.id)
    }));
}

async function dbCriarReview({ username, album_name, rating, comment, media_url }) {
    const { data, error } = await db
        .from('reviews')
        .insert([{ username, album_name, rating, comment, media_url: media_url || '' }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbAtualizarLikes(reviewId, novaListaLikedBy) {
    const { error } = await db
        .from('reviews')
        .update({ liked_by: novaListaLikedBy })
        .eq('id', reviewId);

    if (error) console.error('Erro ao atualizar likes:', error);
}

// ==========================================
// 3. COMENTÁRIOS
// ==========================================
async function dbAdicionarComentario(reviewId, author, text) {
    const { data, error } = await db
        .from('comentarios')
        .insert([{ review_id: reviewId, author, text }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function dbRemoverComentario(commentId) {
    const { error } = await db
        .from('comentarios')
        .delete()
        .eq('id', commentId);

    if (error) console.error('Erro ao apagar comentário:', error);
}

// ==========================================
// 4. ÁLBUNS SALVOS
// ==========================================
async function dbAlternarAlbumSalvo({ username, album_name, artista, capa_url }) {
    const { data: existente } = await db
        .from('albuns_salvos')
        .select('id')
        .eq('username', username)
        .eq('album_name', album_name)
        .maybeSingle();

    if (existente) {
        await db.from('albuns_salvos').delete().eq('id', existente.id);
        return false;
    } else {
        await db.from('albuns_salvos').insert([{ username, album_name, artista: artista || '', capa_url: capa_url || '' }]);
        return true;
    }
}

async function dbListarAlbunsSalvos(username) {
    const { data, error } = await db
        .from('albuns_salvos')
        .select('*')
        .eq('username', username)
        .order('criado_em', { ascending: false });

    return error ? [] : data;
}

// ==========================================
// 5. ESTANTE DE VINIS 3D (perfil.html)
// ==========================================
async function dbListarVinis(username) {
    const { data, error } = await db
        .from('estante_vinis')
        .select('*')
        .eq('username', username)
        .order('id', { ascending: true });
    return error ? [] : data;
}

async function dbAdicionarVinil({ username, album_name, artista, capa_url, cor_lombada }) {
    const { data, error } = await db
        .from('estante_vinis')
        .insert([{ username, album_name, artista, capa_url: capa_url || '', cor_lombada: cor_lombada || '#f7bbd7', ouvido: false }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

async function dbAlternarVinilOuvido(id, ouvidoAtual) {
    const { error } = await db
        .from('estante_vinis')
        .update({ ouvido: !ouvidoAtual })
        .eq('id', id);
    if (error) console.error('Erro ao atualizar vinil:', error);
}

// ==========================================
// 6. FÓRUM E APARIÇÕES DO ÁLBUM (album.html)
// ==========================================
async function dbListarTopicosForum(albumName) {
    const { data, error } = await db
        .from('album_forum')
        .select('*')
        .ilike('album_name', albumName)
        .order('criado_em', { ascending: false });
    return error ? [] : data;
}

async function dbCriarTopicoForum({ album_name, username, rating, topic, comment }) {
    const { data, error } = await db
        .from('album_forum')
        .insert([{ album_name, username, rating, topic, comment, replies: [] }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

async function dbResponderTopicoForum(topicoId, novaListaReplies) {
    const { error } = await db
        .from('album_forum')
        .update({ replies: novaListaReplies })
        .eq('id', topicoId);
    if (error) console.error('Erro ao responder tópico:', error);
}

async function dbListarAparicoes(albumName) {
    const { data, error } = await db
        .from('album_aparicoes')
        .select('*')
        .ilike('album_name', albumName)
        .order('criado_em', { ascending: true });
    return error ? [] : data;
}

async function dbCriarAparicao({ album_name, titulo_midia, detalhe, autor }) {
    const { data, error } = await db
        .from('album_aparicoes')
        .insert([{ album_name, titulo_midia, detalhe, autor }])
        .select()
        .single();
    if (error) throw error;
    return data;
}
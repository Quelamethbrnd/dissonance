document.addEventListener('DOMContentLoaded', () => {
    const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte';
    const greetingSpan = document.querySelector('.nav-user-greeting strong');
    if (greetingSpan) greetingSpan.textContent = usuarioAtual;

    const listEl = document.getElementById('notifications-list');
    const markAllBtn = document.getElementById('btn-mark-all-read');
    const clearBtn = document.getElementById('btn-clear-notifs');
    let filtroAtual = 'todas';

    const chaveNotif = 'dissonance_notifs_' + usuarioAtual;

    function obterNotificacoes() {
        const salvas = localStorage.getItem(chaveNotif);
        if (!salvas) {
            const exemplos = [
                {
                    id: 1,
                    type: 'like',
                    from: '@ana_indie',
                    target: 'Puberty 2',
                    text: 'curtiu sua avaliação de Puberty 2.',
                    time: 'Há 2 horas',
                    read: false,
                    link: 'perfil.html'
                },
                {
                    id: 2,
                    type: 'comment',
                    from: '@lucas_rock',
                    target: 'In Rainbows',
                    text: 'comentou na sua review: "Weird Fishes é perfeita demais!"',
                    time: 'Há 5 horas',
                    read: false,
                    link: 'home.html'
                },
                {
                    id: 3,
                    type: 'follow',
                    from: '@ana_indie',
                    target: '',
                    text: 'começou a seguir você.',
                    time: 'Ontem',
                    read: true,
                    link: 'perfil.html?user=%40ana_indie'
                }
            ];
            localStorage.setItem(chaveNotif, JSON.stringify(exemplos));
            return exemplos;
        }
        return JSON.parse(salvas);
    }

    function salvarNotificacoes(lista) {
        localStorage.setItem(chaveNotif, JSON.stringify(lista));
    }

    function renderizar() {
        if (!listEl) return;
        const todas = obterNotificacoes();
        const filtradas = filtroAtual === 'todas'
            ? todas
            : todas.filter(n => n.type === filtroAtual);

        if (filtradas.length === 0) {
            listEl.innerHTML = '<p style="text-align:center; opacity:0.75; padding:20px;">Nenhuma notificação nesta categoria.</p>';
            return;
        }

        listEl.innerHTML = '';
        filtradas.forEach(n => {
            const icone = n.type === 'like' ? '♥' : (n.type === 'comment' ? '💬' : '+');
            const card = document.createElement('div');
            card.className = 'notif-card' + (n.read ? '' : ' unread');

            card.innerHTML =
                '<div class="notif-left">' +
                    '<div class="notif-badge-icon">' + icone + '</div>' +
                    '<div class="notif-text">' +
                        '<p><a href="perfil.html?user=' + encodeURIComponent(n.from) + '" class="user-profile-link"><strong>' + n.from + '</strong></a> ' + n.text + '</p>' +
                        '<small>' + n.time + '</small>' +
                    '</div>' +
                '</div>' +
                '<a href="' + (n.link || 'home.html') + '" class="btn-notif-action" style="text-decoration:none;">Ver ▸</a>';

            listEl.appendChild(card);
        });
    }

    document.querySelectorAll('.notif-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.notif-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroAtual = btn.dataset.filter;
            renderizar();
        });
    });

    if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
            const lista = obterNotificacoes().map(n => ({ ...n, read: true }));
            salvarNotificacoes(lista);
            renderizar();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            salvarNotificacoes([]);
            renderizar();
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

    renderizar();
});

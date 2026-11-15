document.addEventListener('DOMContentLoaded', () => {
    const temaSalvo = JSON.parse(localStorage.getItem('dissonance_custom_theme'));
    if (!temaSalvo) return;

    const root = document.documentElement;
    root.style.setProperty('--bg-header', temaSalvo.bgHeader);
    root.style.setProperty('--bg-content', temaSalvo.bgContent);
    root.style.setProperty('--box-gray', temaSalvo.boxGray);
    root.style.setProperty('--text-pink', temaSalvo.textPink);
    root.style.setProperty('--btn-pink', temaSalvo.btnPink);
    root.style.setProperty('--text-dark', temaSalvo.textDark);
    root.style.setProperty('--text-muted', temaSalvo.textMuted || temaSalvo.textDark);
    document.body.style.backgroundColor = temaSalvo.boxGray;

    const banner = document.querySelector('.top-banner, .main-header');
    if (banner && temaSalvo.bgHeader) {
        banner.style.background = temaSalvo.bgHeader;
    }

    const styleFix = document.createElement('style');
    styleFix.textContent = `
        body, .app-container, .navbar, .main-feed, .profile-layout, .profile-page-content, .explore-layout, .edit-layout {
            color: var(--text-dark) !important;
        }
        .sidebar-dashboard, .profile-header-centered, .music-pet-card, .vinyl-shelf-box, .user-reviews-section {
            background-color: var(--bg-content) !important;
            color: var(--text-dark) !important;
            border-color: var(--text-dark) !important;
        }
        .review-text, .user-bio, .profile-bio, .terms-section p, .section-desc, .stat-box span {
            color: var(--text-muted) !important;
        }
        .action-btn, .platform-tag, .register-text, .login-text, small {
            color: var(--text-muted) !important;
        }
        .review-inputs-top input, .review-inputs-top select, .review-form textarea,
        .input-group input, .input-group textarea, .search-controls input {
            background-color: var(--bg-content) !important;
            color: var(--text-dark) !important;
            border-color: var(--text-dark) !important;
        }
        .btn-platform {
            background-color: var(--bg-content) !important;
            color: var(--text-dark) !important;
            border-color: var(--text-dark) !important;
        }
        .btn-platform.connected, .btn-post-review, .btn-discover, .btn-save-changes, 
        .btn-upload, .btn-edit-profile, .btn-back, .search-controls select {
            background-color: var(--btn-pink) !important;
            color: #000000 !important;
        }
        .btn-logout {
            background-color: var(--bg-header) !important;
            color: var(--text-pink) !important;
        }
        .app-container, .main-header, .navbar, .sidebar-dashboard, .new-review-box,
        .tracking-card, .review-card, .profile-header-card, .stat-box, .edit-section, .theme-card {
            border-color: var(--text-dark) !important;
        }
                    .user-profile-link, .album-card a, .album-info a, .review-header a, .reviewer-name a, .comment-item a {
            color: var(--text-dark) !important;
            text-decoration: none;
        }
        .user-profile-link:hover, .album-card a:hover, .album-info a:hover, .review-header a:hover, .reviewer-name a:hover {
            color: var(--btn-pink) !important;
            text-decoration: underline;
        }
                    #btn-showcase-forum, #btn-showcase-forum:visited,
        a[href="relatorio.html"][style*="background:#000000"],
        a[href="relatorio.html"][style*="background:#000000"]:visited {
            background-color: var(--bg-header, #000000) !important;
            color: var(--text-pink, #f1c5d9) !important;
            border-color: var(--text-dark, #000000) !important;
        }


    `;
    document.head.appendChild(styleFix);
});

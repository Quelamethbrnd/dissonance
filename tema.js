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

    const styleFix = document.createElement('style');
    styleFix.textContent = `
        body, .app-container, .navbar, .main-feed, .profile-layout, .explore-layout, .edit-layout {
            color: var(--text-dark) !important;
        }
        .sidebar-dashboard {
            background-color: var(--box-gray) !important;
            color: var(--text-dark) !important;
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
    `;
    document.head.appendChild(styleFix);
});

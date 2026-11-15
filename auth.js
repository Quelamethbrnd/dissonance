document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register-form');
    const loginForm = document.querySelector('.login-form');

    // --- CADASTRO LOCAL ---
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullname').value.trim();
            let username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            if (!username.startsWith('@')) {
                username = '@' + username;
            }

            const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];

            if (usuarios.some(u => u.email.toLowerCase() === email)) {
                alert('Este e-mail já está cadastrado!');
                return;
            }

            if (usuarios.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                alert('Este nome de usuário (@username) já está em uso!');
                return;
            }

            usuarios.push({ fullName, username, email, password });
            localStorage.setItem('dissonance_users', JSON.stringify(usuarios));

            alert('Cadastro realizado com sucesso! Agora faça seu login.');
            window.location.href = 'login.html';
        });
    }

    // --- LOGIN LOCAL ---
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;

            const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];
            const usuarioValido = usuarios.find(u => u.email.toLowerCase() === email && u.password === password);

            if (!usuarioValido) {
                alert('E-mail ou senha incorretos! Se ainda não tem conta, clique em Cadastre-se.');
                return;
            }

            localStorage.setItem('usuarioLogado', usuarioValido.username);
            window.location.href = 'home.html';
        });

        // --- RECUPERAÇÃO / REDEFINIÇÃO DE SENHA ("ESQUECEU A SENHA?") ---
        const linksTelaLogin = Array.from(document.querySelectorAll('a, button'));
        const forgotBtn = document.getElementById('btn-forgot-password') ||
            linksTelaLogin.find(el => el.textContent && el.textContent.toLowerCase().includes('esqueceu'));

        if (forgotBtn) {
            forgotBtn.addEventListener('click', (event) => {
                event.preventDefault();
                abrirModalRecuperarSenha();
            });
        }
    }

    function abrirModalRecuperarSenha() {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.82); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; font-family:"Montserrat",sans-serif;';

        overlay.innerHTML = `
            <div style="background:var(--bg-content,#ffffff); color:var(--text-dark,#000000); border:3px solid var(--text-dark,#000000); border-radius:12px; padding:24px; max-width:420px; width:100%; box-shadow:6px 6px 0px #000000;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <span style="background:var(--btn-pink,#f7bbd7); color:#000000; border:2px solid #000000; border-radius:6px; padding:4px 10px; font-size:0.72rem; font-weight:900;">RECUPERAR ACESSO</span>
                    <button type="button" id="close-forgot-modal" style="background:var(--box-gray,#f4f4f4); color:var(--text-dark,#000000); border:2px solid var(--text-dark,#000000); border-radius:6px; width:30px; height:30px; font-weight:900; cursor:pointer;">✕</button>
                </div>

                <h3 style="margin:0 0 6px 0; font-size:1.3rem; font-weight:900;">Redefinir Senha</h3>
                <p id="forgot-subtitle" style="margin:0 0 16px 0; font-size:0.86rem; opacity:0.88; line-height:1.4;">
                    Digite o e-mail ou @username cadastrado na sua conta DISSONANCE.
                </p>

                <form id="forgot-step1-form" style="display:flex; flex-direction:column; gap:12px;">
                    <input type="text" id="forgot-identifier" placeholder="seu@email.com ou @usuario" required
                        style="padding:10px 12px; border:2px solid var(--text-dark,#000000); border-radius:6px; background:var(--box-gray,#f4f4f4); color:var(--text-dark,#000000); font-weight:700; font-size:0.9rem;">
                    <div id="forgot-msg-1" style="display:none; font-size:0.82rem; font-weight:800; color:#c92a2a;"></div>
                    <button type="submit" style="padding:10px; background:var(--btn-pink,#f7bbd7); color:#000000; border:2px solid #000000; border-radius:6px; font-weight:900; cursor:pointer; box-shadow:3px 3px 0px #000000;">
                        Verificar Conta ▸
                    </button>
                </form>

                <form id="forgot-step2-form" style="display:none; flex-direction:column; gap:12px;">
                    <div id="forgot-user-found" style="background:var(--box-gray,#f4f4f4); border:2px solid var(--text-dark,#000000); border-radius:6px; padding:8px 12px; font-size:0.84rem; font-weight:800;"></div>
                    <input type="password" id="forgot-new-pass" placeholder="Nova senha (mín. 4 caracteres)" minlength="4" required
                        style="padding:10px 12px; border:2px solid var(--text-dark,#000000); border-radius:6px; background:var(--box-gray,#f4f4f4); color:var(--text-dark,#000000); font-weight:700; font-size:0.9rem;">
                    <input type="password" id="forgot-confirm-pass" placeholder="Confirme a nova senha" minlength="4" required
                        style="padding:10px 12px; border:2px solid var(--text-dark,#000000); border-radius:6px; background:var(--box-gray,#f4f4f4); color:var(--text-dark,#000000); font-weight:700; font-size:0.9rem;">
                    <div id="forgot-msg-2" style="display:none; font-size:0.82rem; font-weight:800; color:#c92a2a;"></div>
                    <button type="submit" style="padding:10px; background:var(--btn-pink,#f7bbd7); color:#000000; border:2px solid #000000; border-radius:6px; font-weight:900; cursor:pointer; box-shadow:3px 3px 0px #000000;">
                        Salvar Nova Senha ✓
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        const fechar = () => overlay.remove();
        overlay.querySelector('#close-forgot-modal').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        });

        const step1Form = overlay.querySelector('#forgot-step1-form');
        const step2Form = overlay.querySelector('#forgot-step2-form');
        const identifierInput = overlay.querySelector('#forgot-identifier');
        const msg1 = overlay.querySelector('#forgot-msg-1');
        const msg2 = overlay.querySelector('#forgot-msg-2');
        let indiceUsuarioEncontrado = -1;

        identifierInput.focus();

        step1Form.addEventListener('submit', (e) => {
            e.preventDefault();
            const busca = identifierInput.value.trim().toLowerCase();
            const buscaComArroba = busca.startsWith('@') ? busca : '@' + busca;

            const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];
            indiceUsuarioEncontrado = usuarios.findIndex(u =>
                u.email.toLowerCase() === busca || u.username.toLowerCase() === buscaComArroba
            );

            if (indiceUsuarioEncontrado === -1) {
                msg1.textContent = 'Nenhuma conta encontrada com esse e-mail ou usuário.';
                msg1.style.display = 'block';
                return;
            }

            msg1.style.display = 'none';
            const userObj = usuarios[indiceUsuarioEncontrado];
            overlay.querySelector('#forgot-user-found').textContent = 'Conta localizada: ' + userObj.username + ' (' + userObj.email + ')';
            overlay.querySelector('#forgot-subtitle').textContent = 'Crie uma nova senha para acessar sua conta.';
            step1Form.style.display = 'none';
            step2Form.style.display = 'flex';
            overlay.querySelector('#forgot-new-pass').focus();
        });

        step2Form.addEventListener('submit', (e) => {
            e.preventDefault();
            const novaSenha = overlay.querySelector('#forgot-new-pass').value;
            const confirmaSenha = overlay.querySelector('#forgot-confirm-pass').value;

            if (novaSenha !== confirmaSenha) {
                msg2.textContent = 'As senhas não coincidem. Digite novamente.';
                msg2.style.display = 'block';
                return;
            }

            const usuarios = JSON.parse(localStorage.getItem('dissonance_users')) || [];
            if (indiceUsuarioEncontrado !== -1 && usuarios[indiceUsuarioEncontrado]) {
                usuarios[indiceUsuarioEncontrado].password = novaSenha;
                localStorage.setItem('dissonance_users', JSON.stringify(usuarios));

                const loginEmailInput = document.getElementById('email');
                if (loginEmailInput) loginEmailInput.value = usuarios[indiceUsuarioEncontrado].email;

                alert('Senha redefinida com sucesso! Você já pode entrar com a nova senha.');
                fechar();
            }
        });
    }
});

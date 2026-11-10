        document.addEventListener('DOMContentLoaded', () => {
        const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte'

        // Aplica a foto de perfil salva
        const savedAvatar = localStorage.getItem('avatar_' + usuarioAtual)
        const avatarContainer = document.querySelector('.profile-avatar-large')
        if (savedAvatar && avatarContainer) {
            avatarContainer.innerHTML = `<img src="${savedAvatar}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`
        }

        const greetingSpan = document.querySelector('.nav-user-greeting strong')
        const profileUsername = document.getElementById('profile-username')
        if (greetingSpan) greetingSpan.textContent = usuarioAtual
        if (profileUsername) profileUsername.textContent = usuarioAtual

        const bioText = document.getElementById('profile-bio-text')
        const savedBio = localStorage.getItem('bio_' + usuarioAtual)
        if (savedBio && bioText) {
            bioText.textContent = savedBio
        }

        // --- LÓGICA DA BIBLIOTECA PESSOAL DE VINIS (COM IMAGEM NA LOMBADA) ---
        const vinylStack = document.getElementById('vinyl-stack')
        const addVinylForm = document.getElementById('add-vinyl-form')
        const statVinyls = document.getElementById('stat-vinyls')
        const vinylCoverInput = document.getElementById('vinyl-cover-input')
        const vinylUploadLabel = document.getElementById('vinyl-upload-label')

        let imagemLombadaBase64 = ''

        const vinisIniciais = [
            {
            id: 101,
            album: 'Puberty 2',
            artist: 'Mitski',
            color: '#f7bbd7',
            spineImage: 'imgs/Mitskipuberty2.jpg',
            listened: true
            },
            {
            id: 102,
            album: 'Blonde',
            artist: 'Frank Ocean',
            color: '#b2f2bb',
            spineImage: 'imgs/Blonde_-_Frank_Ocean.jpeg',
            listened: true
            },
            {
            id: 103,
            album: 'In Rainbows',
            artist: 'Radiohead',
            color: '#ffe066',
            spineImage: 'imgs/Radiohead_-_In_Rainbows.jpg',
            listened: false
            },
            {
            id: 104,
            album: 'DAMN.',
            artist: 'Kendrick Lamar',
            color: '#ffa8a8',
            spineImage: 'imgs/Kendrick_Lamar_-_Damn.png',
            listened: false
            }
        ]

        function obterVinis () {
            const chave = 'dissonance_vinyls_' + usuarioAtual
            const salvos = localStorage.getItem(chave)
            if (!salvos) {
            localStorage.setItem(chave, JSON.stringify(vinisIniciais))
            return vinisIniciais
            }
            return JSON.parse(salvos)
        }

        function salvarVinis (lista) {
            localStorage.setItem(
            'dissonance_vinyls_' + usuarioAtual,
            JSON.stringify(lista)
            )
        }

        // CORREÇÃO: Adicionado o índice [0] em event.target.files[0]
        if (vinylCoverInput) {
            vinylCoverInput.addEventListener('change', event => {
            const file = event.target.files[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = e => {
                const img = new Image()
                img.onload = () => {
                const canvas = document.createElement('canvas')
                const targetW = 600
                const targetH = 90
                canvas.width = targetW
                canvas.height = targetH
                const ctx = canvas.getContext('2d')

                const scale = Math.max(targetW / img.width, targetH / img.height)
                const w = img.width * scale
                const h = img.height * scale
                const x = (targetW - w) / 2
                const y = (targetH - h) / 2

                ctx.drawImage(img, x, y, w, h)
                imagemLombadaBase64 = canvas.toDataURL('image/jpeg', 0.8)

                if (vinylUploadLabel) {
                    vinylUploadLabel.textContent = '✓ Imagem Pronta'
                    vinylUploadLabel.classList.add('has-image')
                }
                }
                img.src = e.target.result
            }
            reader.readAsDataURL(file)
            })
        }

        function renderizarVinis () {
            const lista = obterVinis()
            vinylStack.innerHTML = ''

            const ouvidosCount = lista.filter(v => v.listened).length
            if (statVinyls) {
            statVinyls.textContent = `${ouvidosCount}/${lista.length}`
            }

            if (lista.length === 0) {
            vinylStack.innerHTML =
                '<p style="font-size: 0.85rem;">Sua estante está vazia. Adicione um disco acima!</p>'
            return
            }

            lista.forEach(vinil => {
            const spine = document.createElement('div')
            spine.classList.add('vinyl-spine')
            if (vinil.listened) spine.classList.add('listened')

            if (vinil.spineImage) {
                spine.classList.add('has-bg-image')
                spine.style.backgroundImage = `url('${vinil.spineImage}')`
            } else {
                spine.style.backgroundColor = vinil.color || '#f7bbd7'
            }

            spine.dataset.id = vinil.id

            spine.innerHTML = `
                        <div class="vinyl-spine-left">
                            <div class="vinyl-checkbox">${
                            vinil.listened ? '✓' : ''
                            }</div>
                            <div class="vinyl-info">
                                <span class="vinyl-album-name">${escapeHTML(
                                vinil.album
                                )}</span>
                                <span class="vinyl-artist-name">— ${escapeHTML(
                                vinil.artist
                                )}</span>
                            </div>
                        </div>
                        <div class="vinyl-spine-right">
                            <span class="vinyl-status-badge">${
                            vinil.listened ? 'Ouvido' : 'Na fila'
                            }</span>
                            <button type="button" class="btn-remove-vinyl" title="Remover da estante" data-id="${
                            vinil.id
                            }">✕</button>
                        </div>
                    `

            vinylStack.appendChild(spine)
            })
        }

        vinylStack.addEventListener('click', event => {
            const removeBtn = event.target.closest('.btn-remove-vinyl')
            if (removeBtn) {
            event.stopPropagation()
            const idRemover = Number(removeBtn.dataset.id)
            const novaLista = obterVinis().filter(v => v.id !== idRemover)
            salvarVinis(novaLista)
            renderizarVinis()
            return
            }

            const spine = event.target.closest('.vinyl-spine')
            if (spine) {
            const idToggle = Number(spine.dataset.id)
            const lista = obterVinis()
            const item = lista.find(v => v.id === idToggle)
            if (item) {
                item.listened = !item.listened
                salvarVinis(lista)
                renderizarVinis()
            }
            }
        })

        if (addVinylForm) {
            addVinylForm.addEventListener('submit', event => {
            event.preventDefault()
            const albumInput = document.getElementById('vinyl-album')
            const artistInput = document.getElementById('vinyl-artist')
            const colorInput = document.getElementById('vinyl-spine-color')

            const album = albumInput.value.trim()
            const artist = artistInput.value.trim()
            const color = colorInput.value

            if (!album || !artist) return

            try {
                const lista = obterVinis()
                lista.unshift({
                id: Date.now(),
                album: album,
                artist: artist,
                color: color,
                spineImage: imagemLombadaBase64 || '',
                listened: false
                })

                salvarVinis(lista)

                addVinylForm.reset()
                colorInput.value = '#f7bbd7'
                imagemLombadaBase64 = ''
                if (vinylUploadLabel) {
                vinylUploadLabel.textContent = '📷 Imagem'
                vinylUploadLabel.classList.remove('has-image')
                }

                renderizarVinis()
            } catch (err) {
                alert(
                'Limite de armazenamento atingido. Remova algum disco antigo antes de adicionar novas imagens.'
                )
            }
            })
        }

        // --- LÓGICA DAS REVIEWS PUBLICADAS PELO USUÁRIO ---
        const reviewsList = document.getElementById('user-reviews-list')
        const statReviews = document.getElementById('stat-reviews')
        const statLikes = document.getElementById('stat-likes')

        function carregarMinhasReviews () {
            const todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || []
            const minhas = todas.filter(r => r.username === usuarioAtual)

            statReviews.textContent = minhas.length
            const totalCurtidas = minhas.reduce(
            (soma, item) => soma + (item.likes || 0),
            0
            )
            statLikes.textContent = totalCurtidas

            if (minhas.length === 0) {
            reviewsList.innerHTML =
                '<p>Você ainda não publicou nenhuma review. Vá até o Feed para avaliar um álbum!</p>'
            return
            }

            reviewsList.innerHTML = ''

            minhas.forEach(review => {
            const card = document.createElement('article')
            card.classList.add('review-card')

            card.innerHTML = `
                        <img src="${review.cover_url}" alt="${escapeHTML(
                review.album_name
            )}" class="review-cover">
                        <div class="review-body">
                            <div class="review-header">
                                <strong>${escapeHTML(review.album_name)}</strong>
                                <span>${escapeHTML(review.rating)}</span>
                            </div>
                            <p class="review-text">${escapeHTML(review.comment)}</p>
                            <div class="review-footer-row">
                                <span>♥ ${review.likes} curtidas</span>
                                <button class="btn-delete-review" data-id="${
                                review.id
                                }">Excluir review</button>
                            </div>
                        </div>
                    `

            reviewsList.appendChild(card)
            })
        }

        reviewsList.addEventListener('click', event => {
            const deleteBtn = event.target.closest('.btn-delete-review')
            if (!deleteBtn) return
            if (!confirm('Tem certeza que deseja apagar esta review?')) return
            const reviewId = Number(deleteBtn.dataset.id)
            let todas = JSON.parse(localStorage.getItem('dissonance_reviews')) || []
            todas = todas.filter(r => r.id !== reviewId)
            localStorage.setItem('dissonance_reviews', JSON.stringify(todas))
            carregarMinhasReviews()
        })
        const logoutBtn = document.querySelector('.btn-logout')
        if (logoutBtn) {
            logoutBtn.addEventListener('click', event => {
            event.preventDefault()
            localStorage.removeItem('usuarioLogado')
            window.location.href = 'index.html'
            })
        }
        function escapeHTML (str) {
            const div = document.createElement('div')
            div.textContent = str
            return div.innerHTML
        }
        renderizarVinis()
        carregarMinhasReviews()
        })

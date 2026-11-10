        document.addEventListener('DOMContentLoaded', () => {
        const usuarioAtual = localStorage.getItem('usuarioLogado') || '@ouvinte'

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

        // --- ESTANTE 3D DE VINIS ---
        const vinylStack = document.getElementById('vinyl-stack')
        const addVinylForm = document.getElementById('add-vinyl-form')
        const statVinyls = document.getElementById('stat-vinyls')
        const vinylCoverInput = document.getElementById('vinyl-cover-input')
        const vinylUploadLabel = document.getElementById('vinyl-upload-label')

        let capaQuadradaBase64 = ''

        const vinisIniciais = [
            {
            id: 101,
            album: 'Puberty 2',
            artist: 'Mitski',
            color: '#2b2d42',
            coverImage: 'imgs/Mitskipuberty2.jpg',
            listened: true
            },
            {
            id: 102,
            album: 'Blonde',
            artist: 'Frank Ocean',
            color: '#f8f9fa',
            coverImage: 'imgs/Blonde_-_Frank_Ocean.jpeg',
            listened: true
            },
            {
            id: 103,
            album: 'In Rainbows',
            artist: 'Radiohead',
            color: '#d9480f',
            coverImage: 'imgs/Radiohead_-_In_Rainbows.jpg',
            listened: false
            },
            {
            id: 104,
            album: 'DAMN.',
            artist: 'Kendrick Lamar',
            color: '#82c91e',
            coverImage: 'imgs/Kendrick_Lamar_-_Damn.png',
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

        // Calcula se o texto da lombada deve ser preto ou branco com base na cor escolhida
        function obterCorTextoContraste (hexColor) {
            const hex = hexColor.replace('#', '')
            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)
            const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            return luminancia > 0.55 ? '#000000' : '#ffffff'
        }

        // Processa a imagem quadrada da capa para o plano 3D
        if (vinylCoverInput) {
            vinylCoverInput.addEventListener('change', event => {
            const file = event.target.files.item(0)
            if (!file) return

            const reader = new FileReader()
            reader.onload = e => {
                const img = new Image()
                img.onload = () => {
                const canvas = document.createElement('canvas')
                const size = 450
                canvas.width = size
                canvas.height = size
                const ctx = canvas.getContext('2d')

                const minSide = Math.min(img.width, img.height)
                const sx = (img.width - minSide) / 2
                const sy = (img.height - minSide) / 2

                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)
                capaQuadradaBase64 = canvas.toDataURL('image/jpeg', 0.8)

                if (vinylUploadLabel) {
                    vinylUploadLabel.textContent = '✓ Capa Pronta'
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
                '<p style="font-size: 0.85rem; color: #aaa;">Sua estante 3D está vazia. Adicione um disco acima!</p>'
            return
            }

            const metade = Math.ceil(lista.length / 2)

            lista.forEach((vinil, index) => {
            const item3D = document.createElement('div')
            item3D.classList.add('vinyl-3d-item')
            if (vinil.listened) item3D.classList.add('listened')

            // Metade superior inclina a capa para baixo; metade inferior inclina para cima
            if (index < metade) {
                item3D.classList.add('tilt-bottom')
            } else {
                item3D.classList.add('tilt-top')
            }

            item3D.dataset.id = vinil.id

            const corFundoLombada = vinil.color || '#f7bbd7'
            const corTextoLombada = obterCorTextoContraste(corFundoLombada)
            const imagemCapa =
                vinil.coverImage || vinil.spineImage || 'imgs/Blonde_-_Frank_Ocean.jpeg'

            item3D.innerHTML = `
                        <div class="vinyl-spine-face" style="background-color: ${corFundoLombada}; color: ${corTextoLombada};">
                            <div class="vinyl-spine-left">
                                <div class="vinyl-checkbox">${
                                vinil.listened ? '✓' : ''
                                }</div>
                                <div class="vinyl-title-group">
                                    <span class="vinyl-album-name">${escapeHTML(
                                    vinil.album
                                    )}</span>
                                    <span class="vinyl-artist-name">${escapeHTML(
                                    vinil.artist
                                    )}</span>
                                </div>
                            </div>
                            <div class="vinyl-spine-right">
                                <button type="button" class="btn-remove-vinyl" title="Remover da estante" data-id="${
                                vinil.id
                                }">✕</button>
                            </div>
                        </div>
                        <div class="vinyl-cover-plane" style="background-image: url('${imagemCapa}');"></div>
                    `

            vinylStack.appendChild(item3D)
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

            const item3D = event.target.closest('.vinyl-3d-item')
            if (item3D) {
            const idToggle = Number(item3D.dataset.id)
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
                coverImage: capaQuadradaBase64 || 'imgs/Blonde_-_Frank_Ocean.jpeg',
                listened: false
                })

                salvarVinis(lista)

                addVinylForm.reset()
                colorInput.value = '#f7bbd7'
                capaQuadradaBase64 = ''
                if (vinylUploadLabel) {
                vinylUploadLabel.textContent = '📷 Imagem'
                vinylUploadLabel.classList.remove('has-image')
                }

                renderizarVinis()
            } catch (err) {
                alert(
                'Limite de armazenamento atingido. Remova algum disco antigo antes de adicionar novas capas.'
                )
            }
            })
        }

        // --- REVIEWS PUBLICADAS ---
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
        ${escapeHTML(review.album_name)}
        ${escapeHTML(review.rating)}

        ${escapeHTML(review.comment)}

        ♥ ${review.likes} curtidas
        Excluir review`
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

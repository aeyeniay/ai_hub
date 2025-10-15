// Image Generator Module - SDXL-Turbo Image Generation Service

export default class ImgGenModule {
    constructor(container) {
        this.container = container;
        this.apiUrl = 'http://localhost:8001/generate';
        this.generatedImages = [];
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">🎨 Görsel Üretimi</h2>
                <p class="module-description">
                    Metin açıklamalarından profesyonel görseller oluşturun.
                    SDXL-Turbo modeli ile hızlı ve yüksek kaliteli görsel üretimi.
                </p>
            </div>

            <!-- Generation Form -->
            <div class="imggen-form">
                <div class="form-group">
                    <label class="form-label">
                        <span class="label-text">✍️ Görsel Açıklaması (Prompt)</span>
                        <span class="label-hint">İngilizce yazmanız önerilir</span>
                    </label>
                    <textarea 
                        id="promptInput" 
                        class="form-textarea"
                        placeholder="Örnek: a beautiful sunset over mountains with clouds and birds flying in the sky"
                        rows="4"
                    ></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">
                            <span class="label-text">🎭 Stil</span>
                        </label>
                        <select id="styleSelect" class="form-select">
                            <option value="realistic">Gerçekçi (Realistic)</option>
                            <option value="artistic">Sanatsal (Artistic)</option>
                            <option value="digital-art">Dijital Sanat</option>
                            <option value="oil-painting">Yağlı Boya</option>
                            <option value="watercolor">Sulu Boya</option>
                            <option value="anime">Anime</option>
                            <option value="3d-render">3D Render</option>
                            <option value="photography">Fotoğraf</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">
                            <span class="label-text">📐 Boyut</span>
                        </label>
                        <select id="sizeSelect" class="form-select">
                            <option value="512x512">512 x 512</option>
                            <option value="768x768">768 x 768</option>
                            <option value="1024x1024" selected>1024 x 1024</option>
                            <option value="1280x720">1280 x 720 (16:9)</option>
                            <option value="720x1280">720 x 1280 (9:16)</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn btn-primary btn-lg" id="generateBtn">
                        <span>✨</span>
                        <span>Görsel Üret</span>
                    </button>
                    <button class="btn btn-secondary btn-lg" id="randomBtn">
                        <span>🎲</span>
                        <span>Rastgele Prompt</span>
                    </button>
                </div>
            </div>

            <!-- Quick Prompts -->
            <div class="quick-prompts" id="quickPrompts">
                <div class="quick-prompts-title">💡 Hızlı Prompt'lar:</div>
                <button class="quick-prompt-btn" data-prompt="a beautiful sunset over mountains with dramatic clouds">
                    🌅 Dağlarda Gün Batımı
                </button>
                <button class="quick-prompt-btn" data-prompt="a futuristic city with flying cars and neon lights at night">
                    🌆 Fütüristik Şehir
                </button>
                <button class="quick-prompt-btn" data-prompt="a serene lake surrounded by autumn trees with reflections">
                    🍂 Sonbahar Gölü
                </button>
                <button class="quick-prompt-btn" data-prompt="a majestic lion portrait with golden mane, professional photography">
                    🦁 Aslan Portresi
                </button>
                <button class="quick-prompt-btn" data-prompt="a cozy coffee shop interior with warm lighting and plants">
                    ☕ Rahat Kafe
                </button>
                <button class="quick-prompt-btn" data-prompt="an astronaut floating in space with earth in background">
                    🚀 Uzayda Astronot
                </button>
            </div>

            <!-- Results Section -->
            <div class="imggen-results" id="resultsSection" style="display: none;">
                <div class="results-header">
                    <h3 class="results-title">🖼️ Üretilen Görseller</h3>
                    <span class="results-count" id="resultsCount">0 görsel</span>
                </div>
                <div class="imggen-gallery" id="gallery">
                    <!-- Generated images will appear here -->
                </div>
            </div>
        `;
        
        this.addImgGenStyles();
    }
    
    addImgGenStyles() {
        if (document.getElementById('imggen-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'imggen-styles';
        style.textContent = `
            .imggen-form {
                background: var(--bg-secondary);
                padding: 2rem;
                border-radius: 12px;
                margin-bottom: 2rem;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            
            .form-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 600;
            }
            
            .label-text {
                color: var(--text-primary);
            }
            
            .label-hint {
                font-size: 0.75rem;
                color: var(--text-secondary);
                font-weight: 400;
            }
            
            .form-textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.875rem;
                resize: vertical;
                transition: border-color 0.2s;
            }
            
            .form-textarea:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .form-select {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.875rem;
                background: white;
                cursor: pointer;
                transition: border-color 0.2s;
            }
            
            .form-select:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .form-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            .btn-lg {
                padding: 1rem 2rem;
                font-size: 1rem;
            }
            
            .quick-prompts {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                padding: 1.5rem;
                background: var(--bg-secondary);
                border-radius: 12px;
                margin-bottom: 2rem;
            }
            
            .quick-prompts-title {
                width: 100%;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            
            .quick-prompt-btn {
                padding: 0.5rem 1rem;
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 8px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }
            
            .quick-prompt-btn:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
                transform: translateY(-2px);
            }
            
            .imggen-results {
                margin-top: 2rem;
            }
            
            .imggen-gallery {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }
            
            .imggen-card {
                background: var(--bg-secondary);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow-sm);
                transition: all 0.3s;
            }
            
            .imggen-card:hover {
                box-shadow: var(--shadow-lg);
                transform: translateY(-4px);
            }
            
            .imggen-image {
                width: 100%;
                aspect-ratio: 1;
                object-fit: cover;
                cursor: pointer;
            }
            
            .imggen-info {
                padding: 1rem;
            }
            
            .imggen-prompt {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin-bottom: 0.75rem;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .imggen-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.75rem;
                color: var(--text-secondary);
            }
            
            .imggen-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .btn-icon {
                padding: 0.5rem;
                background: transparent;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 1rem;
            }
            
            .btn-icon:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .imggen-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }
            
            .imggen-modal.active {
                display: flex;
            }
            
            .imggen-modal-content {
                max-width: 90%;
                max-height: 90%;
            }
            
            .imggen-modal-close {
                position: absolute;
                top: 2rem;
                right: 2rem;
                font-size: 2rem;
                color: white;
                cursor: pointer;
                background: rgba(0, 0, 0, 0.5);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
            }
            
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
                
                .imggen-gallery {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEvents() {
        const generateBtn = document.getElementById('generateBtn');
        const randomBtn = document.getElementById('randomBtn');
        const promptInput = document.getElementById('promptInput');
        const quickBtns = document.querySelectorAll('.quick-prompt-btn');
        
        // Generate button
        generateBtn.addEventListener('click', () => this.generateImage());
        
        // Random prompt button
        randomBtn.addEventListener('click', () => this.fillRandomPrompt());
        
        // Quick prompts
        quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.currentTarget.dataset.prompt;
                promptInput.value = prompt;
            });
        });
        
        // Enter to generate
        promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateImage();
            }
        });
    }
    
    async generateImage() {
        const promptInput = document.getElementById('promptInput');
        const styleSelect = document.getElementById('styleSelect');
        const sizeSelect = document.getElementById('sizeSelect');
        const generateBtn = document.getElementById('generateBtn');
        
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Lütfen bir görsel açıklaması yazın');
            return;
        }
        
        try {
            // Show loading
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></div>
                <span>Görsel üretiliyor...</span>
            `;
            
            // Prepare request
            const requestData = {
                prompt: prompt,
                style: styleSelect.value,
                size: sizeSelect.value
            };
            
            // Make API request
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Backend PNG dosyasını doğrudan döndürüyor
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            // Add to gallery
            this.addToGallery({
                prompt: prompt,
                style: styleSelect.value,
                size: sizeSelect.value,
                imageUrl: imageUrl,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Generation error:', error);
            alert('Görsel üretilirken bir hata oluştu: ' + error.message);
        } finally {
            // Reset button
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <span>✨</span>
                <span>Görsel Üret</span>
            `;
        }
    }
    
    addToGallery(imageData) {
        const resultsSection = document.getElementById('resultsSection');
        const gallery = document.getElementById('gallery');
        const resultsCount = document.getElementById('resultsCount');
        
        this.generatedImages.unshift(imageData);
        
        // Show results section
        resultsSection.style.display = 'block';
        resultsCount.textContent = `${this.generatedImages.length} görsel`;
        
        // Create image card
        const card = document.createElement('div');
        card.className = 'imggen-card';
        card.innerHTML = `
            <img 
                src="${imageData.imageUrl}" 
                alt="${imageData.prompt}"
                class="imggen-image"
                onclick="window.open('${imageData.imageUrl}', '_blank')"
            >
            <div class="imggen-info">
                <div class="imggen-prompt" title="${imageData.prompt}">
                    ${this.escapeHtml(imageData.prompt)}
                </div>
                <div class="imggen-meta">
                    <div>
                        <div>${imageData.style} • ${imageData.size}</div>
                        <div style="font-size: 0.7rem; margin-top: 0.25rem;">
                            ${this.formatTime(imageData.timestamp)}
                        </div>
                    </div>
                    <div class="imggen-actions">
                        <button 
                            class="btn-icon" 
                            onclick="window.open('${imageData.imageUrl}', '_blank')"
                            title="Tam boyut görüntüle"
                        >
                            🔍
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add to gallery (prepend for newest first)
        gallery.insertBefore(card, gallery.firstChild);
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    getImageUrl(filePath) {
        // Convert Docker path to localhost path
        if (filePath.startsWith('/app/outputs/')) {
            const filename = filePath.split('/').pop();
            return `http://localhost:8001/outputs/${filename}`;
        }
        return filePath;
    }
    
    fillRandomPrompt() {
        const randomPrompts = [
            "a mystical forest with glowing mushrooms and fireflies at night",
            "a steampunk airship flying over Victorian city",
            "a peaceful japanese garden with cherry blossoms and koi pond",
            "a cyberpunk street market with neon signs and rain",
            "a medieval castle on a cliff overlooking the ocean at sunset",
            "a macro shot of colorful butterfly on a flower",
            "an ancient library with floating books and magical lighting",
            "a modern minimalist bedroom with large windows and city view",
            "a tropical beach with crystal clear water and palm trees",
            "a dragon sleeping on a pile of gold in a cave"
        ];
        
        const prompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
        document.getElementById('promptInput').value = prompt;
    }
    
    formatTime(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds
        
        if (diff < 60) return 'Az önce';
        if (diff < 3600) return Math.floor(diff / 60) + ' dakika önce';
        if (diff < 86400) return Math.floor(diff / 3600) + ' saat önce';
        return date.toLocaleDateString('tr-TR');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


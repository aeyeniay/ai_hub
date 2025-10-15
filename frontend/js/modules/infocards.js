// Info Cards Module - Information Card Generation Service

export default class InfoCardsModule {
    constructor(container) {
        this.container = container;
        this.apiUrl = 'http://localhost:8008/generate-cards';
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">🃏 Bilgi Kartları</h2>
                <p class="module-description">
                    Metinlerden özet bilgi kartları oluşturun. Sunum ve eğitim materyalleri için ideal.
                </p>
            </div>

            <div class="infocards-container">
                <!-- Input Section -->
                <div class="infocards-input-section">
                    <div class="section-header">
                        <h3 class="section-title">📝 Kaynak Metin</h3>
                    </div>
                    
                    <textarea 
                        id="sourceText" 
                        class="infocards-textarea"
                        placeholder="Bilgi kartları oluşturulacak metni buraya girin...

Örnek:
Yapay zeka teknolojisi son yıllarda büyük gelişme gösterdi. Sağlık sektöründe hastalık teşhisi, finans sektöründe fraud tespiti, otomotiv sektöründe otonom araçlar gibi birçok alanda kullanılmaktadır. Makine öğrenimi ve derin öğrenme algoritmaları sayesinde sistemler sürekli kendini geliştirmektedir."
                        rows="12"
                    ></textarea>
                    
                    <div class="infocards-settings">
                        <div class="setting-group">
                            <label class="setting-label">
                                <span>🎴 Kart Sayısı</span>
                                <span id="cardCountValue" class="setting-value">5</span>
                            </label>
                            <input 
                                type="range" 
                                id="cardCount" 
                                class="slider"
                                min="3" 
                                max="10" 
                                value="5"
                            >
                        </div>
                    </div>
                    
                    <div class="infocards-actions">
                        <button class="btn btn-primary btn-lg" id="generateBtn">
                            <span>✨</span>
                            <span>Kartları Oluştur</span>
                        </button>
                        <button class="btn btn-secondary" id="clearBtn">
                            <span>🗑️</span>
                            <span>Temizle</span>
                        </button>
                        <button class="btn btn-secondary" id="sampleBtn">
                            <span>📋</span>
                            <span>Örnek Metin</span>
                        </button>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="infocards-results-section" id="resultsSection" style="display: none;">
                    <div class="section-header">
                        <h3 class="section-title">🎴 Oluşturulan Kartlar</h3>
                        <div class="results-actions">
                            <button class="btn btn-secondary btn-sm" id="exportBtn">
                                <span>💾</span>
                                <span>JSON İndir</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="cards-grid" id="cardsGrid">
                        <!-- Info cards will appear here -->
                    </div>
                </div>
            </div>
        `;
        
        this.addInfoCardsStyles();
    }
    
    addInfoCardsStyles() {
        if (document.getElementById('infocards-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'infocards-styles';
        style.textContent = `
            .infocards-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            
            .infocards-input-section,
            .infocards-results-section {
                background: var(--bg-secondary);
                padding: 1.5rem;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
            }
            
            .infocards-textarea {
                width: 100%;
                padding: 1rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.875rem;
                resize: vertical;
                line-height: 1.6;
                margin-bottom: 1rem;
            }
            
            .infocards-textarea:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .infocards-settings {
                background: white;
                padding: 1.25rem;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
            
            .infocards-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .results-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .cards-grid {
                display: grid;
                gap: 1.5rem;
                overflow-y: auto;
            }
            
            .info-card {
                perspective: 1000px;
                cursor: pointer;
                height: 250px;
            }
            
            .card-inner {
                position: relative;
                width: 100%;
                height: 100%;
                transition: transform 0.6s;
                transform-style: preserve-3d;
            }
            
            .info-card.flipped .card-inner {
                transform: rotateY(180deg);
            }
            
            .card-front,
            .card-back {
                position: absolute;
                width: 100%;
                height: 100%;
                padding: 1.5rem;
                border-radius: 16px;
                color: white;
                box-shadow: var(--shadow-md);
                backface-visibility: hidden;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }
            
            .card-front {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .card-back {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                transform: rotateY(180deg);
            }
            
            .info-card:hover {
                transform: translateY(-4px);
            }
            
            .info-card:nth-child(2n) .card-front {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            .info-card:nth-child(2n) .card-back {
                background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
            }
            
            .info-card:nth-child(3n) .card-front {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            
            .info-card:nth-child(3n) .card-back {
                background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
            }
            
            .info-card:nth-child(4n) .card-front {
                background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
            }
            
            .info-card:nth-child(4n) .card-back {
                background: linear-gradient(135deg, #38f9d7 0%, #43e97b 100%);
            }
            
            .info-card:nth-child(5n) .card-front {
                background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            }
            
            .info-card:nth-child(5n) .card-back {
                background: linear-gradient(135deg, #fee140 0%, #fa709a 100%);
            }
            
            .card-number {
                position: absolute;
                top: 1rem;
                right: 1rem;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 1.125rem;
                backdrop-filter: blur(10px);
            }
            
            .card-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
                display: block;
            }
            
            .card-title {
                font-size: 1.125rem;
                font-weight: 700;
                line-height: 1.3;
                text-align: center;
            }
            
            .card-content {
                font-size: 0.8125rem;
                line-height: 1.4;
                text-align: center;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 8;
                -webkit-box-orient: vertical;
            }
            
            @media (max-width: 1024px) {
                .infocards-container {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEvents() {
        const generateBtn = document.getElementById('generateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        const cardCount = document.getElementById('cardCount');
        const cardCountValue = document.getElementById('cardCountValue');
        
        generateBtn.addEventListener('click', () => this.generateCards());
        clearBtn.addEventListener('click', () => this.clearAll());
        sampleBtn.addEventListener('click', () => this.loadSample());
        
        cardCount.addEventListener('input', (e) => {
            cardCountValue.textContent = e.target.value;
        });
    }
    
    async generateCards() {
        const sourceText = document.getElementById('sourceText');
        const cardCount = document.getElementById('cardCount');
        const generateBtn = document.getElementById('generateBtn');
        const text = sourceText.value.trim();
        
        if (!text) {
            alert('Lütfen kaynak metni girin');
            return;
        }
        
        try {
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></div>
                <span>Kartlar oluşturuluyor...</span>
            `;
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    num_cards: parseInt(cardCount.value)
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayCards(data);
            
        } catch (error) {
            console.error('Card generation error:', error);
            alert('Kartlar oluşturulurken bir hata oluştu: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <span>✨</span>
                <span>Kartları Oluştur</span>
            `;
        }
    }
    
    displayCards(data) {
        const resultsSection = document.getElementById('resultsSection');
        const cardsGrid = document.getElementById('cardsGrid');
        
        resultsSection.style.display = 'flex';
        
        const cards = data.cards || [];
        const icons = ['💡', '🎯', '⭐', '🚀', '✨', '🔥', '💪', '🌟', '🎨', '📊'];
        
        cardsGrid.innerHTML = cards.map((card, index) => `
            <div class="info-card" onclick="this.classList.toggle('flipped')">
                <div class="card-inner">
                    <div class="card-front">
                        <div class="card-number">${index + 1}</div>
                        <span class="card-icon">${icons[index % icons.length]}</span>
                        <div class="card-title">${this.escapeHtml(card.title)}</div>
                        <div style="font-size: 0.65rem; margin-top: 0.75rem; opacity: 0.7;">👆 Cevabı görmek için tıkla</div>
                    </div>
                    <div class="card-back">
                        <div class="card-number">${index + 1}</div>
                        <span class="card-icon">💡</span>
                        <div class="card-content">${this.escapeHtml(card.content)}</div>
                        <div style="font-size: 0.65rem; margin-top: 0.5rem; opacity: 0.7;">👆 Geri dön</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Attach export button event
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.onclick = () => this.exportCards(data);
    }
    
    exportCards(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `infocards_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearAll() {
        document.getElementById('sourceText').value = '';
        document.getElementById('resultsSection').style.display = 'none';
    }
    
    loadSample() {
        const sample = `Yapay zeka teknolojisi son yıllarda büyük gelişme gösterdi ve birçok sektörde devrim yarattı.

Sağlık Sektörü: Yapay zeka, hastalık teşhisinde doktorlara yardımcı oluyor. Görüntü analizi sayesinde kanser tespiti ve erken tanı konusunda önemli başarılar elde edildi.

Finans Sektörü: Fraud tespiti, risk analizi ve otomatik ticaret sistemlerinde yapay zeka kullanılıyor. Bankalar müşteri hizmetlerinde chatbot'lar kullanarak 7/24 destek sunuyor.

Otomotiv Sektörü: Otonom araçlar yapay zeka teknolojisi sayesinde gelişiyor. Tesla ve Google gibi şirketler sürücüsüz araç teknolojisinde öncü konumda.

Eğitim Sektörü: Kişiselleştirilmiş öğrenme platformları öğrencilerin bireysel ihtiyaçlarına göre içerik sunuyor.

Perakende Sektörü: Öneri sistemleri müşterilere kişiselleştirilmiş ürün önerileri sunarak satışları artırıyor.`;
        
        document.getElementById('sourceText').value = sample;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


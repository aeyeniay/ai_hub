// PII Masking Module - Personal Data Masking Service

export default class PIIMaskingModule {
    constructor(container) {
        this.container = container;
        this.apiUrl = 'http://localhost:8000/mask';
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">🔒 Kişisel Veri Maskeleme</h2>
                <p class="module-description">
                    Metinlerdeki kişisel verileri (ad, telefon, e-posta, TC kimlik, vb.) otomatik tespit edin ve maskeleyin.
                </p>
            </div>

            <div class="pii-container">
                <!-- Input Section -->
                <div class="pii-input-section">
                    <div class="section-header">
                        <h3 class="section-title">📝 Metin Girişi</h3>
                    </div>
                    
                    <textarea 
                        id="inputText" 
                        class="pii-textarea"
                        placeholder="Kişisel veri içeren metni buraya yapıştırın...

Örnek: 
Sayın Ahmet Yılmaz,
TC Kimlik No: 12345678901
Telefon: 0532 123 45 67
E-posta: ahmet.yilmaz@example.com
Adres: Atatürk Caddesi No:123 Çankaya/Ankara"
                        rows="12"
                    ></textarea>
                    
                    <div class="pii-actions">
                        <button class="btn btn-primary btn-lg" id="maskBtn">
                            <span>🔒</span>
                            <span>Maskelemeyi Başlat</span>
                        </button>
                        <button class="btn btn-secondary" id="clearBtn">
                            <span>🗑️</span>
                            <span>Temizle</span>
                        </button>
                        <button class="btn btn-secondary" id="sampleBtn">
                            <span>📋</span>
                            <span>Örnek Metni Yükle</span>
                        </button>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="pii-results-section" id="resultsSection" style="display: none;">
                    <div class="section-header">
                        <h3 class="section-title">✅ Maskelenmiş Metin</h3>
                        <span class="results-badge" id="maskedCount">0 veri maskelendi</span>
                    </div>
                    
                    <div class="pii-output" id="outputText">
                        <!-- Masked text will appear here -->
                    </div>
                    
                    <div class="pii-stats" id="statsSection">
                        <!-- Statistics will appear here -->
                    </div>
                    
                    <div class="pii-actions">
                        <button class="btn btn-secondary" id="copyBtn">
                            <span>📋</span>
                            <span>Kopyala</span>
                        </button>
                        <button class="btn btn-secondary" id="downloadBtn">
                            <span>💾</span>
                            <span>İndir (.txt)</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.addPIIStyles();
    }
    
    addPIIStyles() {
        if (document.getElementById('pii-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'pii-styles';
        style.textContent = `
            .pii-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                height: 100%;
            }
            
            .pii-input-section,
            .pii-results-section {
                display: flex;
                flex-direction: column;
                background: var(--bg-secondary);
                padding: 1.5rem;
                border-radius: 12px;
                min-height: 500px;
            }
            
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .section-title {
                font-size: 1.125rem;
                font-weight: 600;
                color: var(--text-primary);
                margin: 0;
            }
            
            .results-badge {
                background: var(--primary-color);
                color: white;
                padding: 0.375rem 0.75rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
            }
            
            .pii-textarea {
                flex: 1;
                width: 100%;
                padding: 1rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 0.875rem;
                resize: none;
                line-height: 1.6;
            }
            
            .pii-textarea:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .pii-output {
                flex: 1;
                padding: 1rem;
                background: white;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 0.875rem;
                line-height: 1.6;
                overflow-y: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            
            .pii-stats {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .stat-item {
                text-align: center;
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-color);
                display: block;
            }
            
            .stat-label {
                font-size: 0.75rem;
                color: var(--text-secondary);
                margin-top: 0.25rem;
                display: block;
            }
            
            .pii-actions {
                display: flex;
                gap: 0.75rem;
                margin-top: 1rem;
                flex-wrap: wrap;
            }
            
            .masked-text {
                background: #fff3cd;
                padding: 0.125rem 0.25rem;
                border-radius: 3px;
                font-weight: 600;
                color: #856404;
            }
            
            @media (max-width: 1024px) {
                .pii-container {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEvents() {
        const maskBtn = document.getElementById('maskBtn');
        const clearBtn = document.getElementById('clearBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        const inputText = document.getElementById('inputText');
        
        maskBtn.addEventListener('click', () => this.maskText());
        clearBtn.addEventListener('click', () => this.clearAll());
        sampleBtn.addEventListener('click', () => this.loadSample());
    }
    
    async maskText() {
        const inputText = document.getElementById('inputText');
        const maskBtn = document.getElementById('maskBtn');
        const text = inputText.value.trim();
        
        if (!text) {
            alert('Lütfen maskelenecek metni girin');
            return;
        }
        
        try {
            maskBtn.disabled = true;
            maskBtn.innerHTML = `
                <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></div>
                <span>Maskeleniyor...</span>
            `;
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayResults(data);
            
        } catch (error) {
            console.error('Masking error:', error);
            alert('Maskeleme sırasında bir hata oluştu: ' + error.message);
        } finally {
            maskBtn.disabled = false;
            maskBtn.innerHTML = `
                <span>🔒</span>
                <span>Maskelemeyi Başlat</span>
            `;
        }
    }
    
    displayResults(data) {
        const resultsSection = document.getElementById('resultsSection');
        const outputText = document.getElementById('outputText');
        const maskedCount = document.getElementById('maskedCount');
        const statsSection = document.getElementById('statsSection');
        
        resultsSection.style.display = 'flex';
        
        // Display masked text
        outputText.textContent = data.masked_text;
        
        // Count masked entities (backend returns 'detected_entities')
        const entities = data.detected_entities || data.entities || [];
        const totalMasked = entities.length;
        maskedCount.textContent = `${totalMasked} veri maskelendi`;
        
        // Display statistics
        if (entities.length > 0) {
            const entityTypes = {};
            entities.forEach(entity => {
                entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
            });
            
            const typeLabels = {
                'PERSON': '👤 Kişi Adı',
                'PHONE': '📞 Telefon',
                'EMAIL': '📧 E-posta',
                'ID_NUMBER': '🆔 TC Kimlik',
                'IBAN': '🏦 IBAN',
                'ADDRESS': '📍 Adres',
                'BIRTH_DATE': '📅 Doğum Tarihi',
                'BIRTH_PLACE': '🏠 Doğum Yeri',
                'CREDIT_CARD': '💳 Kredi Kartı',
                'PASSPORT': '🛂 Pasaport',
                'IP_ADDRESS': '🌐 IP Adresi',
                'GENDER': '⚧ Cinsiyet',
                'HEALTH': '🏥 Sağlık',
                'BIOMETRIC': '👆 Biyometrik'
            };
            
            statsSection.innerHTML = `
                <div class="stats-grid">
                    ${Object.entries(entityTypes).map(([type, count]) => `
                        <div class="stat-item">
                            <span class="stat-value">${count}</span>
                            <span class="stat-label">${typeLabels[type] || type}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Attach copy and download button events
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        
        copyBtn.onclick = () => this.copyToClipboard(data.masked_text);
        downloadBtn.onclick = () => this.downloadText(data.masked_text);
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span>✅</span><span>Kopyalandı!</span>';
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        });
    }
    
    downloadText(text) {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `masked_text_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    clearAll() {
        document.getElementById('inputText').value = '';
        document.getElementById('resultsSection').style.display = 'none';
    }
    
    loadSample() {
        const sample = `Sayın Ahmet Yılmaz,

TC Kimlik No: 12345678901
Telefon: 0532 123 45 67
E-posta: ahmet.yilmaz@example.com
IBAN: TR33 0006 1005 1978 6457 8413 26
Adres: Atatürk Caddesi No:123 Çankaya/Ankara

Başvurunuz 15 Ekim 2025 tarihinde alınmıştır.

Saygılarımızla,
XYZ Şirketi İnsan Kaynakları Departmanı`;
        
        document.getElementById('inputText').value = sample;
    }
}


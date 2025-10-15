// Template Rewrite Module - Document Generation Service

export default class TemplateModule {
    constructor(container) {
        this.container = container;
        this.apiBaseUrl = 'http://localhost:8007';
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">📄 Belge Oluşturma</h2>
                <p class="module-description">
                    Resmi belgeler ve gerekçe yazıları oluşturun. AI destekli otomatik belge üretimi.
                </p>
            </div>

            <div class="template-container">
                <!-- Document Type Selection -->
                <div class="template-type-section">
                    <div class="section-header">
                        <h3 class="section-title">📋 Belge Tipi</h3>
                    </div>
                    
                    <div class="type-buttons">
                        <button class="type-btn active" data-type="belgenet" id="belgenetBtn">
                            <div class="type-icon">📨</div>
                            <div class="type-name">Belgenet</div>
                            <div class="type-desc">Resmi yazışma belgesi</div>
                        </button>
                        <button class="type-btn" data-type="gerekce" id="gerekceBtn">
                            <div class="type-icon">📝</div>
                            <div class="type-name">Gerekçe</div>
                            <div class="type-desc">İmzalı gerekçe yazısı</div>
                        </button>
                    </div>
                </div>

                <!-- Form Section -->
                <div class="template-form-section">
                    <div class="section-header">
                        <h3 class="section-title">✍️ Belge Bilgileri</h3>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <span>📌 Konu</span>
                        </label>
                        <input 
                            type="text" 
                            id="konu" 
                            class="form-input"
                            placeholder="Örn: Yazılım Lisansı Satın Alımı"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <span>📝 İçerik Konusu</span>
                        </label>
                        <textarea 
                            id="icerikKonusu" 
                            class="form-textarea"
                            placeholder="Belgenin ana içeriğini kısaca açıklayın...

Örnek: Kurumumuzda kullanılmak üzere Microsoft Office 365 lisanslarının yenilenmesi gerekmektedir. Toplam 50 kullanıcı için 1 yıllık lisans alınması planlanmaktadır."
                            rows="6"
                        ></textarea>
                    </div>
                    
                    <!-- Imza Atacaklar Section (only for Gerekce) -->
                    <div class="form-group" id="imzaSection" style="display: none;">
                        <label class="form-label">
                            <span>✍️ İmza Atacaklar</span>
                            <button class="btn btn-secondary btn-sm" id="addSignerBtn">
                                <span>➕</span>
                                <span>İmza Ekle</span>
                            </button>
                        </label>
                        <div id="signersList">
                            <!-- Signers will be added here -->
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-primary btn-lg" id="generateDocBtn">
                            <span>📄</span>
                            <span>Belge Oluştur</span>
                        </button>
                        <button class="btn btn-secondary" id="clearFormBtn">
                            <span>🗑️</span>
                            <span>Temizle</span>
                        </button>
                        <button class="btn btn-secondary" id="sampleBtn">
                            <span>📋</span>
                            <span>Örnek Yükle</span>
                        </button>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="template-results-section" id="resultsSection" style="display: none;">
                    <div class="section-header">
                        <h3 class="section-title">✅ Oluşturulan Belge</h3>
                        <button class="btn btn-secondary btn-sm" id="downloadDocBtn">
                            <span>💾</span>
                            <span>DOCX İndir</span>
                        </button>
                    </div>
                    
                    <div class="doc-preview" id="docPreview">
                        <!-- Document preview will appear here -->
                    </div>
                </div>
            </div>
        `;
        
        this.addTemplateStyles();
    }
    
    addTemplateStyles() {
        if (document.getElementById('template-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'template-styles';
        style.textContent = `
            .template-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto 1fr;
                gap: 2rem;
            }
            
            .template-type-section {
                grid-column: 1 / -1;
                background: var(--bg-secondary);
                padding: 1.5rem;
                border-radius: 12px;
            }
            
            .template-form-section,
            .template-results-section {
                background: var(--bg-secondary);
                padding: 1.5rem;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
            }
            
            .type-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 1rem;
            }
            
            .type-btn {
                padding: 1.5rem;
                background: white;
                border: 2px solid var(--border-color);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            
            .type-btn:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }
            
            .type-btn.active {
                border-color: var(--primary-color);
                background: var(--primary-color);
                color: white;
            }
            
            .type-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .type-name {
                font-size: 1.125rem;
                font-weight: 700;
                margin-bottom: 0.25rem;
            }
            
            .type-desc {
                font-size: 0.875rem;
                opacity: 0.8;
            }
            
            .form-group {
                margin-bottom: 1.5rem;
            }
            
            .form-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 600;
                font-size: 0.875rem;
            }
            
            .form-input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.875rem;
            }
            
            .form-input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .form-textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.875rem;
                resize: vertical;
                line-height: 1.6;
            }
            
            .form-textarea:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .signer-item {
                display: grid;
                grid-template-columns: 1fr 1fr auto;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
                padding: 1rem;
                background: white;
                border-radius: 8px;
            }
            
            .signer-input {
                padding: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                font-size: 0.875rem;
            }
            
            .remove-signer-btn {
                padding: 0.5rem 1rem;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .remove-signer-btn:hover {
                background: #c82333;
            }
            
            .form-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
                margin-top: auto;
                padding-top: 1rem;
            }
            
            .doc-preview {
                flex: 1;
                padding: 2rem;
                background: white;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                overflow-y: auto;
                white-space: pre-wrap;
                line-height: 1.8;
                font-family: 'Times New Roman', serif;
            }
            
            @media (max-width: 1024px) {
                .template-container {
                    grid-template-columns: 1fr;
                }
                
                .type-buttons {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEvents() {
        const belgenetBtn = document.getElementById('belgenetBtn');
        const gerekceBtn = document.getElementById('gerekceBtn');
        const addSignerBtn = document.getElementById('addSignerBtn');
        const generateDocBtn = document.getElementById('generateDocBtn');
        const clearFormBtn = document.getElementById('clearFormBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        
        belgenetBtn.addEventListener('click', () => this.selectType('belgenet'));
        gerekceBtn.addEventListener('click', () => this.selectType('gerekce'));
        addSignerBtn.addEventListener('click', () => this.addSigner());
        generateDocBtn.addEventListener('click', () => this.generateDocument());
        clearFormBtn.addEventListener('click', () => this.clearForm());
        sampleBtn.addEventListener('click', () => this.loadSample());
        
        this.selectedType = 'belgenet';
    }
    
    selectType(type) {
        this.selectedType = type;
        
        const belgenetBtn = document.getElementById('belgenetBtn');
        const gerekceBtn = document.getElementById('gerekceBtn');
        const imzaSection = document.getElementById('imzaSection');
        
        belgenetBtn.classList.toggle('active', type === 'belgenet');
        gerekceBtn.classList.toggle('active', type === 'gerekce');
        imzaSection.style.display = type === 'gerekce' ? 'block' : 'none';
    }
    
    addSigner() {
        const signersList = document.getElementById('signersList');
        const signerId = Date.now();
        
        const signerDiv = document.createElement('div');
        signerDiv.className = 'signer-item';
        signerDiv.dataset.signerId = signerId;
        signerDiv.innerHTML = `
            <input type="text" class="signer-input signer-name" placeholder="İsim Soyisim">
            <input type="text" class="signer-input signer-title" placeholder="Ünvan">
            <button class="remove-signer-btn" onclick="this.closest('.signer-item').remove()">
                🗑️
            </button>
        `;
        
        signersList.appendChild(signerDiv);
    }
    
    async generateDocument() {
        const konu = document.getElementById('konu').value.trim();
        const icerikKonusu = document.getElementById('icerikKonusu').value.trim();
        const generateDocBtn = document.getElementById('generateDocBtn');
        
        if (!konu || !icerikKonusu) {
            alert('Lütfen konu ve içerik konusunu doldurun');
            return;
        }
        
        const requestData = {
            konu: konu,
            icerik_konusu: icerikKonusu,
            imza_atacaklar: []
        };
        
        if (this.selectedType === 'gerekce') {
            const signerItems = document.querySelectorAll('.signer-item');
            requestData.imza_atacaklar = Array.from(signerItems).map(item => ({
                isim: item.querySelector('.signer-name').value.trim(),
                unvan: item.querySelector('.signer-title').value.trim()
            })).filter(s => s.isim && s.unvan);
        } else {
            requestData.format_type = 'belgenet';
        }
        
        try {
            generateDocBtn.disabled = true;
            generateDocBtn.innerHTML = `
                <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></div>
                <span>Belge oluşturuluyor...</span>
            `;
            
            const endpoint = this.selectedType === 'belgenet' 
                ? `${this.apiBaseUrl}/generate-document`
                : `${this.apiBaseUrl}/generate-gerekce`;
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayDocument(data);
            
        } catch (error) {
            console.error('Document generation error:', error);
            alert('Belge oluşturulurken bir hata oluştu: ' + error.message);
        } finally {
            generateDocBtn.disabled = false;
            generateDocBtn.innerHTML = `
                <span>📄</span>
                <span>Belge Oluştur</span>
            `;
        }
    }
    
    displayDocument(data) {
        const resultsSection = document.getElementById('resultsSection');
        const docPreview = document.getElementById('docPreview');
        
        resultsSection.style.display = 'flex';
        docPreview.textContent = data.content;
        
        // Store data for download
        this.currentDocData = data;
        
        // Attach download button event
        const downloadDocBtn = document.getElementById('downloadDocBtn');
        downloadDocBtn.onclick = () => this.downloadDocument();
    }
    
    downloadDocument() {
        if (!this.currentDocData || !this.currentDocData.file_path) {
            alert('İndirilecek belge bulunamadı');
            return;
        }
        
        // File path is like: /app/outputs/Belge_xyz.docx
        const fileName = this.currentDocData.file_path.split('/').pop();
        const downloadUrl = `http://localhost:8007/outputs/${fileName}`;
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    clearForm() {
        document.getElementById('konu').value = '';
        document.getElementById('icerikKonusu').value = '';
        document.getElementById('signersList').innerHTML = '';
        document.getElementById('resultsSection').style.display = 'none';
    }
    
    loadSample() {
        if (this.selectedType === 'belgenet') {
            document.getElementById('konu').value = 'Yazılım Lisansı Satın Alımı';
            document.getElementById('icerikKonusu').value = 'Kurumumuzda kullanılmak üzere Microsoft Office 365 lisanslarının yenilenmesi gerekmektedir. Toplam 50 kullanıcı için 1 yıllık lisans alınması planlanmaktadır. Satın alma işleminin Ekim ayı sonuna kadar tamamlanması önem arz etmektedir.';
        } else {
            document.getElementById('konu').value = 'Yapay Zeka Sunucusu Satın Alımı';
            document.getElementById('icerikKonusu').value = 'Kurumumuzun yapay zeka çalışmaları için yüksek performanslı sunucu sistemine ihtiyaç bulunmaktadır. NVIDIA A100 GPU içeren sunucu sisteminin temin edilmesi gerekmektedir.';
            
            // Add sample signer
            const signersList = document.getElementById('signersList');
            signersList.innerHTML = '';
            this.addSigner();
            setTimeout(() => {
                document.querySelector('.signer-name').value = 'Ahmet Yılmaz';
                document.querySelector('.signer-title').value = 'Bilgi İşlem Müdürü';
            }, 100);
        }
    }
}





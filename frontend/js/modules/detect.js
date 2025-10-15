// Detect Module - Object Detection Service

export default class DetectModule {
    constructor(container) {
        this.container = container;
        this.apiUrl = 'http://localhost:8003/detect';
        this.selectedFile = null;
        this.confidence = 0.3;
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">🔍 Nesne Tespiti</h2>
                <p class="module-description">
                    Görsellerdeki nesneleri otomatik olarak tespit eder ve Türkçe açıklamalar sunar.
                    Gemma3:27b modeli kullanılarak gelişmiş yapay zeka ile analiz yapar.
                </p>
            </div>

            <!-- Upload Section -->
            <div class="upload-section" id="uploadSection">
                <div class="upload-icon">📤</div>
                <h3 class="upload-title">Görsel Yükle</h3>
                <p class="upload-subtitle">
                    Dosyayı buraya sürükleyin veya tıklayarak seçin
                    <br>
                    <small>Desteklenen formatlar: JPG, PNG, WEBP</small>
                </p>
                <input type="file" id="fileInput" class="file-input" accept="image/*">
                <button class="btn btn-primary" id="selectFileBtn">
                    <span>📁</span>
                    <span>Dosya Seç</span>
                </button>
            </div>

            <!-- Preview Section (hidden by default) -->
            <div class="preview-section" id="previewSection" style="display: none;">
                <div class="preview-container">
                    <img id="previewImage" class="preview-image" alt="Preview">
                </div>
                
                <!-- Controls -->
                <div class="controls">
                    <div class="control-group">
                <label class="control-label">
                    Güven Eşiği
                    <span class="slider-value" id="confidenceValue">%30</span>
                </label>
                        <input 
                            type="range" 
                            class="slider" 
                            id="confidenceSlider" 
                            min="0.1" 
                            max="1.0" 
                            step="0.1" 
                            value="0.3"
                        >
                        <small style="color: var(--text-secondary); font-size: 0.75rem;">
                            Düşük değer daha fazla nesne tespit eder
                        </small>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-primary" id="analyzeBtn">
                            <span>🔍</span>
                            <span>Analiz Et</span>
                        </button>
                        <button class="btn btn-secondary" id="clearBtn">
                            <span>🗑️</span>
                            <span>Temizle</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Results Section -->
            <div class="results-section" id="resultsSection" style="display: none;">
                <div class="results-header">
                    <h3 class="results-title">📊 Tespit Edilen Nesneler</h3>
                    <span class="results-count" id="resultsCount">0 nesne bulundu</span>
                </div>
                <div class="results-grid" id="resultsGrid">
                    <!-- Results will be inserted here -->
                </div>
            </div>
        `;
    }
    
    attachEvents() {
        const uploadSection = document.getElementById('uploadSection');
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const previewSection = document.getElementById('previewSection');
        const previewImage = document.getElementById('previewImage');
        const confidenceSlider = document.getElementById('confidenceSlider');
        const confidenceValue = document.getElementById('confidenceValue');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        // File selection
        selectFileBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelect(file);
            }
        });
        
        // Drag and drop
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });
        
        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('dragover');
        });
        
        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFileSelect(file);
            }
        });
        
        // Confidence slider
        confidenceSlider.addEventListener('input', (e) => {
            this.confidence = parseFloat(e.target.value);
            confidenceValue.textContent = '%' + Math.round(this.confidence * 100);
        });
        
        // Analyze button
        analyzeBtn.addEventListener('click', () => this.analyzeImage());
        
        // Clear button
        clearBtn.addEventListener('click', () => this.clearAll());
    }
    
    handleFileSelect(file) {
        this.selectedFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            previewImage.src = e.target.result;
            
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('previewSection').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    async analyzeImage() {
        if (!this.selectedFile) {
            alert('Lütfen önce bir görsel seçin');
            return;
        }
        
        const analyzeBtn = document.getElementById('analyzeBtn');
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');
        
        try {
            // Show loading
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = `
                <div class="spinner" style="width: 16px; height: 16px; border-width: 2px; margin: 0;"></div>
                <span>Analiz ediliyor...</span>
            `;
            
            // Prepare form data
            const formData = new FormData();
            formData.append('image', this.selectedFile);
            formData.append('confidence', this.confidence);
            
            // Make API request
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Display results
            this.displayResults(data);
            
        } catch (error) {
            console.error('Analysis error:', error);
            resultsSection.style.display = 'block';
            resultsGrid.innerHTML = `
                <div class="error-message" style="grid-column: 1 / -1;">
                    <strong>⚠️ Analiz Hatası</strong>
                    <p>${error.message}</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        Servisin çalıştığından emin olun: <code>curl http://localhost:8003/health</code>
                    </p>
                </div>
            `;
        } finally {
            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `
                <span>🔍</span>
                <span>Analiz Et</span>
            `;
        }
    }
    
    displayResults(data) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');
        const resultsCount = document.getElementById('resultsCount');
        
        resultsSection.style.display = 'block';
        
        if (!data.objects || data.objects.length === 0) {
            resultsCount.textContent = '0 nesne bulundu';
            resultsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">🔍 Nesne bulunamadı</p>
                    <p style="font-size: 0.875rem;">Güven eşiğini düşürmeyi deneyin</p>
                </div>
            `;
            return;
        }
        
        // Filter by confidence threshold (convert to percentage for comparison)
        const confidenceThreshold = this.confidence * 100;
        const filteredObjects = data.objects.filter(obj => obj.confidence >= confidenceThreshold);
        
        resultsCount.textContent = `${filteredObjects.length} nesne bulundu (toplam ${data.total_objects})`;
        
        if (filteredObjects.length === 0) {
            resultsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">🔍 Seçilen güven eşiğinde nesne bulunamadı</p>
                    <p style="font-size: 0.875rem;">Güven eşiğini düşürmeyi deneyin (şu an: %${Math.round(confidenceThreshold)})</p>
                </div>
            `;
            return;
        }
        
        // Sort by confidence
        const sortedObjects = [...filteredObjects].sort((a, b) => b.confidence - a.confidence);
        
        // Create result cards
        resultsGrid.innerHTML = sortedObjects.map(obj => this.createResultCard(obj)).join('');
    }
    
    createResultCard(obj) {
        const confidenceClass = 
            obj.confidence >= 80 ? 'confidence-high' :
            obj.confidence >= 50 ? 'confidence-medium' :
            'confidence-low';
        
        return `
            <div class="result-card">
                <div class="result-header">
                    <div class="result-name">${obj.name}</div>
                    <div class="confidence-badge ${confidenceClass}">
                        %${obj.confidence}
                    </div>
                </div>
                <div class="result-details">
                    ${obj.description || 'Açıklama yok'}
                </div>
                ${obj.location ? `
                    <div class="result-location">
                        📍 ${obj.location}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    clearAll() {
        this.selectedFile = null;
        this.confidence = 0.3;
        
        document.getElementById('previewSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('fileInput').value = '';
        document.getElementById('confidenceSlider').value = 0.3;
        document.getElementById('confidenceValue').textContent = '%30';
    }
}


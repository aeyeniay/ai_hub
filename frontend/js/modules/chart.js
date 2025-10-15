// Chart Generator Module - AI-Powered Chart Generation

export default class ChartModule {
    constructor(container) {
        this.container = container;
        this.apiUrl = 'http://localhost:8009/generate-charts';
        this.csvData = null;
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">📈 Tablodan Grafik Üretimi</h2>
                <p class="module-description">
                    CSV/Excel verilerinizden yapay zeka ile otomatik grafik oluşturun.
                </p>
            </div>

            <div class="chart-container-wrapper">
                <!-- Input Section -->
                <div class="chart-input-section">
                    <div class="section-header">
                        <h3 class="section-title">📊 Veri Girişi</h3>
                    </div>
                    
                    <!-- File Upload -->
                    <div class="upload-area" id="uploadArea">
                        <div class="upload-icon">📁</div>
                        <div class="upload-text">
                            <div class="upload-title">CSV dosyasını sürükleyip bırakın</div>
                            <div class="upload-subtitle">veya tıklayarak dosya seçin</div>
                        </div>
                        <input type="file" id="fileInput" accept=".csv" style="display: none;">
                    </div>
                    
                    <div class="file-info" id="fileInfo" style="display: none;">
                        <div class="info-item">
                            <span class="info-label">📄 Dosya:</span>
                            <span class="info-value" id="fileName">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">📏 Satır Sayısı:</span>
                            <span class="info-value" id="rowCount">-</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">📊 Sütun Sayısı:</span>
                            <span class="info-value" id="columnCount">-</span>
                        </div>
                    </div>
                    
                    <!-- Data Preview -->
                    <div class="data-preview" id="dataPreview" style="display: none;">
                        <div class="preview-header">
                            <h4 class="preview-title">📋 Veri Önizleme</h4>
                        </div>
                        <div class="preview-table-wrapper">
                            <table class="preview-table" id="previewTable"></table>
                        </div>
                    </div>
                    
                    
                    <div class="chart-actions">
                        <button class="btn btn-primary btn-lg" id="generateBtn" disabled>
                            <span>📈</span>
                            <span>Grafik Oluştur</span>
                        </button>
                        <button class="btn btn-secondary" id="clearBtn">
                            <span>🗑️</span>
                            <span>Temizle</span>
                        </button>
                        <button class="btn btn-secondary" id="sampleBtn">
                            <span>📋</span>
                            <span>Örnek CSV Yükle</span>
                        </button>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="chart-results-section" id="resultsSection" style="display: none;">
                    <div class="section-header">
                        <h3 class="section-title">📊 Oluşturulan Grafikler</h3>
                        <span class="results-badge" id="chartCount">0 grafik</span>
                    </div>
                    
                    <div class="charts-grid" id="chartsGrid">
                        <!-- Charts will appear here -->
                    </div>
                </div>
            </div>
        `;
        
        this.addChartStyles();
    }
    
    addChartStyles() {
        if (document.getElementById('chart-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'chart-styles';
        style.textContent = `
            .chart-container-wrapper {
                display: flex;
                flex-direction: column;
                gap: 2rem;
            }
            
            .chart-input-section,
            .chart-results-section {
                background: var(--bg-secondary);
                padding: 1.5rem;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                width: 100%;
            }
            
            .upload-area {
                border: 2px dashed var(--border-color);
                border-radius: 12px;
                padding: 3rem 2rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                background: white;
            }
            
            .upload-area:hover,
            .upload-area.dragover {
                border-color: var(--primary-color);
                background: #f8f9ff;
            }
            
            .upload-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .upload-title {
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            
            .upload-subtitle {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }
            
            .file-info {
                background: white;
                padding: 1.25rem;
                border-radius: 8px;
                display: grid;
                gap: 0.75rem;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .info-item:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .info-label {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }
            
            .info-value {
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .data-preview {
                background: white;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .preview-header {
                padding: 1rem 1.25rem;
                background: #f8f9fa;
                border-bottom: 1px solid var(--border-color);
            }
            
            .preview-title {
                margin: 0;
                font-size: 0.875rem;
                font-weight: 600;
            }
            
            .preview-table-wrapper {
                max-height: 200px;
                overflow: auto;
            }
            
            .preview-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.8125rem;
            }
            
            .preview-table th,
            .preview-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
            }
            
            .preview-table th {
                background: #f8f9fa;
                font-weight: 600;
                position: sticky;
                top: 0;
                z-index: 1;
            }
            
            .chart-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .charts-grid {
                display: grid;
                gap: 1.5rem;
                overflow-y: auto;
            }
            
            .chart-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: var(--shadow-sm);
                transition: all 0.3s;
            }
            
            .chart-card:hover {
                box-shadow: var(--shadow-md);
                transform: translateY(-2px);
            }
            
            .chart-image {
                width: 100%;
                display: block;
                cursor: pointer;
            }
            
            .chart-info {
                padding: 1rem;
                background: #f8f9fa;
            }
            
            .chart-title {
                font-size: 0.9375rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            
            .chart-description {
                font-size: 0.8125rem;
                color: var(--text-secondary);
                line-height: 1.5;
            }
            
            @media (max-width: 1024px) {
                .chart-container {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const generateBtn = document.getElementById('generateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.csv')) {
                this.handleFile(file);
            }
        });
        
        generateBtn.addEventListener('click', () => this.generateCharts());
        clearBtn.addEventListener('click', () => this.clearAll());
        sampleBtn.addEventListener('click', () => this.loadSample());
    }
    
    async handleFile(file) {
        if (!file) return;
        
        const text = await file.text();
        this.csvData = this.parseCSV(text);
        
        // Update file info
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('rowCount').textContent = this.csvData.length;
        document.getElementById('columnCount').textContent = this.csvData[0].length;
        
        // Show preview
        this.showPreview();
        
        // Enable generate button
        document.getElementById('generateBtn').disabled = false;
    }
    
    parseCSV(text) {
        const lines = text.trim().split('\n');
        return lines.map(line => this.parseCSVLine(line));
    }
    
    parseCSVLine(line) {
        const cells = [];
        let cell = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    // Escaped quote ("")
                    cell += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                // End of cell
                cells.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        
        // Add last cell
        cells.push(cell.trim());
        
        return cells;
    }
    
    showPreview() {
        const preview = document.getElementById('dataPreview');
        const table = document.getElementById('previewTable');
        
        preview.style.display = 'block';
        
        // Show first 5 rows
        const previewData = this.csvData.slice(0, 6);
        
        table.innerHTML = `
            <thead>
                <tr>
                    ${previewData[0].map(cell => `<th>${this.escapeHtml(cell)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${previewData.slice(1).map(row => `
                    <tr>
                        ${row.map(cell => `<td>${this.escapeHtml(cell)}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        `;
    }
    
    async generateCharts() {
        const generateBtn = document.getElementById('generateBtn');
        
        if (!this.csvData) {
            alert('Lütfen önce bir CSV dosyası yükleyin');
            return;
        }
        
        try {
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></div>
                <span>Grafikler oluşturuluyor...</span>
            `;
            
            // CSV verisini Dict listesine çevir (header + rows)
            const headers = this.csvData[0];
            const rows = this.csvData.slice(1);
            const tableData = rows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    table_data: tableData
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayCharts(data);
            
        } catch (error) {
            console.error('Chart generation error:', error);
            alert('Grafikler oluşturulurken bir hata oluştu: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <span>📈</span>
                <span>Grafik Oluştur</span>
            `;
        }
    }
    
    displayCharts(data) {
        const resultsSection = document.getElementById('resultsSection');
        const chartsGrid = document.getElementById('chartsGrid');
        const chartCount = document.getElementById('chartCount');
        
        resultsSection.style.display = 'flex';
        
        const charts = data.charts || [];
        chartCount.textContent = `${charts.length} grafik`;
        
        chartsGrid.innerHTML = charts.map(chart => `
            <div class="chart-card">
                <img 
                    src="http://localhost:8009${chart.file_path}" 
                    alt="${chart.title}"
                    class="chart-image"
                    onclick="window.open('http://localhost:8009${chart.file_path}', '_blank')"
                >
                <div class="chart-info">
                    <div class="chart-title">${this.escapeHtml(chart.title)}</div>
                    <div class="chart-description">${this.escapeHtml(chart.description)}</div>
                </div>
            </div>
        `).join('');
    }
    
    clearAll() {
        this.csvData = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('dataPreview').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('generateBtn').disabled = true;
    }
    
    loadSample() {
        const sampleCSV = `Ay,Satis,Masraf,Kar
Ocak,45000,32000,13000
Subat,52000,35000,17000
Mart,48000,33000,15000
Nisan,55000,36000,19000
Mayis,61000,38000,23000
Haziran,58000,37000,21000`;
        
        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const file = new File([blob], 'ornek_veri.csv', { type: 'text/csv' });
        this.handleFile(file);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


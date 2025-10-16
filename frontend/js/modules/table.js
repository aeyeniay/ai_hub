// Table Analyzer Module - AI-Powered Table Analysis with VQA-style Chat

export default class TableModule {
    constructor(container) {
        this.container = container;
        this.apiUrl = 'http://localhost:8010';
        this.csvData = null;
        this.sessionId = null;
        this.chatHistory = [];
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">📋 Tablo Analizi</h2>
                <p class="module-description">
                    CSV/Excel tablolarınızı yükleyin ve yapay zeka ile interaktif sohbet edin. Sorularınızı sorun, içgörüler elde edin.
                </p>
            </div>

            <!-- Upload Section -->
            <div class="upload-section" id="uploadSection">
                <div class="upload-icon">📊</div>
                <h3 class="upload-title">Tablo Dosyası Yükle</h3>
                <p class="upload-subtitle">
                    CSV/Excel dosyasını buraya sürükleyin veya tıklayarak seçin
                    <br>
                    <small>Desteklenen formatlar: CSV, XLS, XLSX</small>
                </p>
                <input type="file" id="fileInput" class="file-input" accept=".csv,.xls,.xlsx">
                <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1rem;">
                    <button class="btn btn-primary" id="selectFileBtn">
                        <span>📁</span>
                        <span>Dosya Seç</span>
                    </button>
                    <button class="btn btn-secondary" id="sampleBtn">
                        <span>📋</span>
                        <span>Örnek CSV Yükle</span>
                    </button>
                </div>
            </div>

            <!-- Chat Section (hidden by default) -->
            <div class="vqa-chat-section" id="chatSection" style="display: none;">
                <!-- Table Preview -->
                <div class="vqa-image-preview">
                    <div class="table-preview-card">
                        <div class="table-preview-header">
                            <h4>📊 Tablo Önizleme</h4>
                        </div>
                        <div class="table-preview-stats">
                            <div class="stat-item">
                                <span class="stat-label">📄 Dosya:</span>
                                <span class="stat-value" id="fileName">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">📏 Satır:</span>
                                <span class="stat-value" id="rowCount">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">📊 Sütun:</span>
                                <span class="stat-value" id="columnCount">-</span>
                            </div>
                        </div>
                        <div class="table-preview-content" id="tablePreviewContent"></div>
                    </div>
                    <div class="vqa-session-info">
                        <span class="vqa-session-badge">
                            <span>🔗</span>
                            <span id="sessionInfo">Oturum aktif</span>
                        </span>
                        <button class="btn btn-secondary btn-sm" id="newTableBtn">
                            <span>🔄</span>
                            <span>Yeni Tablo</span>
                        </button>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div class="vqa-chat-container">
                    <div class="vqa-chat-messages" id="chatMessages">
                        <div class="vqa-welcome-message">
                            <div class="vqa-assistant-avatar">🤖</div>
                            <div class="vqa-message-content">
                                <strong>Yapay Zeka Asistan</strong>
                                <p>Merhaba! Tablonuz hakkında sorularınızı sorabilirsiniz. Size yardımcı olmaktan mutluluk duyarım!</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Questions -->
                    <div class="vqa-quick-questions" id="quickQuestions">
                        <div class="vqa-quick-title">💡 Hızlı Sorular:</div>
                        <button class="vqa-quick-btn" data-question="Bu tablodaki toplam değer nedir?">
                            Bu tablodaki toplam değer nedir?
                        </button>
                        <button class="vqa-quick-btn" data-question="En yüksek ve en düşük değerler nelerdir?">
                            En yüksek ve en düşük değerler nelerdir?
                        </button>
                        <button class="vqa-quick-btn" data-question="Bu verilerden ne gibi çıkarımlar yapılabilir?">
                            Bu verilerden ne gibi çıkarımlar yapılabilir?
                        </button>
                        <button class="vqa-quick-btn" data-question="Bu tablodaki trendler nelerdir?">
                            Bu tablodaki trendler nelerdir?
                        </button>
                    </div>

                    <!-- Input Area -->
                    <div class="vqa-input-area">
                        <textarea 
                            id="questionInput" 
                            class="vqa-input" 
                            placeholder="Sorunuzu buraya yazın..."
                            rows="2"
                        ></textarea>
                        <button class="btn btn-primary" id="askBtn">
                            <span>📤</span>
                            <span>Gönder</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.addTableStyles();
    }
    
    addTableStyles() {
        if (document.getElementById('table-vqa-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'table-vqa-styles';
        style.textContent = `
            /* VQA Chat Section Layout */
            .vqa-chat-section {
                display: grid;
                grid-template-columns: 400px 1fr;
                gap: 1.5rem;
                margin-top: 2rem;
            }
            
            .vqa-image-preview {
                position: sticky;
                top: 2rem;
                height: fit-content;
            }
            
            .vqa-session-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .vqa-session-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: var(--bg-secondary);
                border-radius: 8px;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .btn-sm {
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
            }
            
            /* Chat Container */
            .vqa-chat-container {
                display: flex;
                flex-direction: column;
                height: 600px;
            }
            
            .vqa-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
                background: var(--bg-secondary);
                border-radius: 12px;
                margin-bottom: 1rem;
            }
            
            /* Messages */
            .vqa-welcome-message,
            .vqa-user-message,
            .vqa-assistant-message {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .vqa-user-message {
                flex-direction: row-reverse;
            }
            
            .vqa-user-message .vqa-message-content {
                text-align: right;
            }
            
            .vqa-assistant-avatar,
            .vqa-user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            
            .vqa-assistant-avatar {
                background: var(--primary-color);
                color: white;
            }
            
            .vqa-user-avatar {
                background: var(--secondary-color);
                color: white;
            }
            
            .vqa-message-content {
                flex: 1;
            }
            
            .vqa-message-content strong {
                display: block;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }
            
            .vqa-message-content p {
                color: var(--text-secondary);
                line-height: 1.6;
                margin: 0;
            }
            
            .vqa-formatted-text {
                color: var(--text-secondary);
                line-height: 1.6;
            }
            
            .vqa-formatted-text p {
                margin: 0.5rem 0;
            }
            
            .vqa-formatted-text strong {
                color: var(--text-primary);
                font-weight: 700;
            }
            
            /* Quick Questions */
            .vqa-quick-questions {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                padding: 1rem;
                background: var(--bg-secondary);
                border-radius: 12px;
                margin-bottom: 1rem;
            }
            
            .vqa-quick-title {
                width: 100%;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            
            .vqa-quick-btn {
                padding: 0.5rem 1rem;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .vqa-quick-btn:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            /* Input Area */
            .vqa-input-area {
                display: flex;
                gap: 0.75rem;
                align-items: flex-end;
            }
            
            .vqa-input {
                flex: 1;
                padding: 0.75rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.875rem;
                resize: none;
                transition: border-color 0.2s;
            }
            
            .vqa-input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            /* Loading */
            .vqa-loading {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                opacity: 0.7;
            }
            
            .vqa-loading .vqa-message-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            /* Table Preview Card */
            .table-preview-card {
                background: white;
                border-radius: 12px;
                box-shadow: var(--shadow-md);
                overflow: hidden;
                margin-bottom: 1rem;
            }
            
            .table-preview-header {
                padding: 1rem 1.25rem;
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border-color);
            }
            
            .table-preview-header h4 {
                margin: 0;
                font-size: 0.9375rem;
                font-weight: 600;
                color: var(--text-primary);
            }
            
            .table-preview-stats {
                padding: 1rem 1.25rem;
                display: grid;
                gap: 0.75rem;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .stat-item:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }
            
            .stat-label {
                font-size: 0.875rem;
                color: var(--text-secondary);
            }
            
            .stat-value {
                font-weight: 600;
                color: var(--text-primary);
                font-size: 0.875rem;
            }
            
            .table-preview-content {
                max-height: 200px;
                overflow: auto;
                padding: 1rem;
                background: #f8f9fa;
            }
            
            .preview-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.75rem;
            }
            
            .preview-table th,
            .preview-table td {
                padding: 0.5rem;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
            }
            
            .preview-table th {
                background: white;
                font-weight: 600;
                position: sticky;
                top: 0;
                z-index: 1;
            }
            
            /* Responsive */
            @media (max-width: 1024px) {
                .vqa-chat-section {
                    grid-template-columns: 1fr;
                }
                
                .vqa-image-preview {
                    position: static;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEvents() {
        const uploadSection = document.getElementById('uploadSection');
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        
        // File selection
        selectFileBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });
        
        // Sample button
        sampleBtn.addEventListener('click', () => this.loadSample());
        
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
            if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                this.handleFile(file);
            }
        });
    }
    
    attachChatEvents() {
        const askBtn = document.getElementById('askBtn');
        const questionInput = document.getElementById('questionInput');
        const newTableBtn = document.getElementById('newTableBtn');
        const quickBtns = document.querySelectorAll('.vqa-quick-btn');
        
        // Ask button
        askBtn.addEventListener('click', () => this.askQuestion());
        
        // Enter key to send
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.askQuestion();
            }
        });
        
        // Quick questions
        quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.currentTarget.dataset.question;
                questionInput.value = question;
                this.askQuestion();
            });
        });
        
        // New table button
        newTableBtn.addEventListener('click', () => this.resetSession());
    }
    
    async handleFile(file) {
        const uploadSection = document.getElementById('uploadSection');
        
        try {
            // Show loading
            uploadSection.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Tablo yükleniyor ve işleniyor...</p>
                    <small style="color: var(--text-secondary);">Bu işlem birkaç saniye sürebilir</small>
                </div>
            `;
            
            // Parse CSV
            const text = await file.text();
            this.csvData = this.parseCSV(text);
            
            // CSV verisini Dict listesine çevir
            const headers = this.csvData[0];
            const rows = this.csvData.slice(1);
            const tableData = rows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });
            
            // Session oluştur
            await this.createSession(tableData);
            
            // Show chat interface
            this.showChatInterface(file);
            
        } catch (error) {
            console.error('File processing error:', error);
            uploadSection.innerHTML = `
                <div class="error-message">
                    <strong>⚠️ Yükleme Hatası</strong>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <span>🔄</span>
                        <span>Tekrar Dene</span>
                    </button>
                </div>
            `;
        }
    }
    
    parseCSV(text) {
        const lines = text.trim().split('\n');
        return lines.map(line => {
            return line.split(',').map(cell => cell.trim());
        });
    }
    
    showChatInterface(file) {
        const uploadSection = document.getElementById('uploadSection');
        const chatSection = document.getElementById('chatSection');
        
        // Hide upload, show chat
        uploadSection.style.display = 'none';
        chatSection.style.display = 'grid';
        
        // Update file info
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('rowCount').textContent = this.csvData.length - 1;
        document.getElementById('columnCount').textContent = this.csvData[0].length;
        
        // Show table preview
        this.showTablePreview();
        
        // Attach chat events
        this.attachChatEvents();
    }
    
    showTablePreview() {
        const previewContent = document.getElementById('tablePreviewContent');
        const previewData = this.csvData.slice(0, 6);
        
        const tableHtml = `
            <table class="preview-table">
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
            </table>
        `;
        
        previewContent.innerHTML = tableHtml;
    }
    
    async createSession(tableData) {
        try {
            const response = await fetch(`${this.apiUrl}/create-session`, {
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
            this.sessionId = data.session_id;
            this.chatHistory = [];
            
            console.log('Session created:', this.sessionId);
            
        } catch (error) {
            console.error('Session creation error:', error);
            throw error;
        }
    }
    
    async askQuestion() {
        const questionInput = document.getElementById('questionInput');
        const question = questionInput.value.trim();
        
        if (!question) {
            alert('Lütfen bir soru yazın');
            return;
        }
        
        if (!this.sessionId) {
            alert('Oturum bulunamadı. Lütfen tabloyu tekrar yükleyin.');
            return;
        }
        
        const chatMessages = document.getElementById('chatMessages');
        const quickQuestions = document.getElementById('quickQuestions');
        
        // Hide quick questions after first use
        if (quickQuestions) {
            quickQuestions.style.display = 'none';
        }
        
        // Add user message
        this.addUserMessage(question);
        questionInput.value = '';
        
        // Add loading indicator
        const loadingId = 'loading-' + Date.now();
        this.addLoadingMessage(loadingId);
        
        try {
            // Make API request
            const response = await fetch(`${this.apiUrl}/ask-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    question: question
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove loading, add answer
            this.removeLoadingMessage(loadingId);
            this.addAssistantMessage(data.answer);
            
        } catch (error) {
            console.error('Question error:', error);
            this.removeLoadingMessage(loadingId);
            this.addAssistantMessage('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
    
    addUserMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'vqa-user-message';
        messageEl.innerHTML = `
            <div class="vqa-user-avatar">👤</div>
            <div class="vqa-message-content">
                <strong>Siz</strong>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    addAssistantMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'vqa-assistant-message';
        messageEl.innerHTML = `
            <div class="vqa-assistant-avatar">🤖</div>
            <div class="vqa-message-content">
                <strong>Yapay Zeka Asistan</strong>
                <div class="vqa-formatted-text">${this.formatMessage(message)}</div>
            </div>
        `;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    addLoadingMessage(id) {
        const chatMessages = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.id = id;
        messageEl.className = 'vqa-loading vqa-assistant-message';
        messageEl.innerHTML = `
            <div class="vqa-assistant-avatar">🤖</div>
            <div class="vqa-message-content">
                <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin-right: 0.5rem;"></div>
                <span>Cevap hazırlanıyor...</span>
            </div>
        `;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    removeLoadingMessage(id) {
        const loadingEl = document.getElementById(id);
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    resetSession() {
        this.sessionId = null;
        this.chatHistory = [];
        this.csvData = null;
        
        document.getElementById('chatSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('fileInput').value = '';
        
        // Re-render to reset everything
        this.render();
        this.attachEvents();
    }
    
    loadSample() {
        const sampleCSV = `Urun,Ocak,Subat,Mart,Nisan,Mayis
Laptop,45,52,48,55,61
Mouse,120,115,130,125,140
Klavye,85,90,88,95,102
Monitor,35,38,42,40,45
Kulaklik,65,70,68,75,80`;
        
        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const file = new File([blob], 'ornek_satis.csv', { type: 'text/csv' });
        this.handleFile(file);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatMessage(text) {
        // Escape HTML first
        let formatted = this.escapeHtml(text);
        
        // Bold text: **text** or __text__
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        // Italic text: *text* or _text_
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // Double newline to paragraph break
        formatted = formatted.replace(/\n\n+/g, '</p><p>');
        
        // Single newline to br
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Wrap in paragraph
        formatted = '<p>' + formatted + '</p>';
        
        return formatted;
    }
}

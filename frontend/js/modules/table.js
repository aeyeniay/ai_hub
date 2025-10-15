// Table Analyzer Module - AI-Powered Table Analysis

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
                    CSV/Excel tablolarınızı yükleyin ve yapay zeka ile analiz edin. Sorularınızı sorun, içgörüler elde edin.
                </p>
            </div>

            <div class="table-container">
                <!-- Input Section -->
                <div class="table-input-section">
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
                    
                    <!-- Quick Questions -->
                    <div class="quick-questions" id="quickQuestions" style="display: none;">
                        <div class="quick-questions-title">💡 Örnek Sorular:</div>
                        <button class="quick-question-btn" data-question="Bu tablodaki toplam değer nedir?">
                            📊 Toplam değer
                        </button>
                        <button class="quick-question-btn" data-question="En yüksek ve en düşük değerler nelerdir?">
                            📈 Min/Max değerler
                        </button>
                        <button class="quick-question-btn" data-question="Bu verilerden ne gibi çıkarımlar yapılabilir?">
                            🔍 İçgörüler
                        </button>
                        <button class="quick-question-btn" data-question="Bu verilerdeki trendler nelerdir?">
                            📉 Trendler
                        </button>
                    </div>
                    
                    <div class="table-actions">
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

                <!-- Analysis Section -->
                <div class="table-analysis-section" id="analysisSection">
                    <div class="section-header">
                        <h3 class="section-title">💬 Soru & Cevap</h3>
                    </div>
                    
                    <div class="analysis-chat" id="analysisChat">
                        <div class="empty-state" id="emptyState">
                            <div class="empty-icon">📋</div>
                            <div class="empty-text">CSV dosyası yükleyin ve sorularınızı sorun</div>
                        </div>
                    </div>
                    
                    <div class="question-input-wrapper" id="questionInputWrapper" style="display: none;">
                        <textarea 
                            id="questionInput" 
                            class="question-input"
                            placeholder="Tablo hakkında soru sorun..."
                            rows="2"
                        ></textarea>
                        <button class="btn btn-primary" id="askBtn" disabled>
                            <span>🔍</span>
                            <span>Analiz Et</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.addTableStyles();
    }
    
    addTableStyles() {
        if (document.getElementById('table-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'table-styles';
        style.textContent = `
            .table-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                height: calc(100vh - 250px);
            }
            
            .table-input-section,
            .table-analysis-section {
                background: var(--bg-secondary);
                padding: 1.5rem;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                overflow-y: auto;
            }
            
            .table-analysis-section {
                max-height: calc(100vh - 250px);
            }
            
            .upload-area {
                border: 2px dashed var(--border-color);
                border-radius: 12px;
                padding: 2rem;
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
                font-size: 2.5rem;
                margin-bottom: 0.75rem;
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
            
            .quick-questions {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                padding: 1rem;
                background: white;
                border-radius: 8px;
            }
            
            .quick-questions-title {
                width: 100%;
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 0.25rem;
            }
            
            .quick-question-btn {
                padding: 0.5rem 1rem;
                background: #f8f9fa;
                border: 1px solid var(--border-color);
                border-radius: 6px;
                font-size: 0.8125rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quick-question-btn:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .table-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .analysis-chat {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                padding: 3rem;
                text-align: center;
            }
            
            .empty-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                opacity: 0.3;
            }
            
            .empty-text {
                font-size: 0.9375rem;
                color: var(--text-secondary);
            }
            
            .chat-message {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }
            
            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.125rem;
                flex-shrink: 0;
            }
            
            .chat-message.user .message-avatar {
                background: var(--primary-color);
            }
            
            .chat-message.assistant .message-avatar {
                background: #28a745;
            }
            
            .message-content {
                flex: 1;
                padding: 1rem;
                border-radius: 12px;
                line-height: 1.6;
            }
            
            .chat-message.user .message-content {
                background: var(--primary-color);
                color: white;
            }
            
            .chat-message.assistant .message-content {
                background: white;
                border: 1px solid var(--border-color);
            }
            
            .question-input-wrapper {
                display: flex;
                gap: 0.75rem;
                align-items: flex-end;
            }
            
            .question-input {
                flex: 1;
                padding: 0.75rem;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.875rem;
                resize: none;
                line-height: 1.5;
            }
            
            .question-input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            @media (max-width: 1024px) {
                .table-container {
                    grid-template-columns: 1fr;
                    height: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEvents() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const askBtn = document.getElementById('askBtn');
        const clearBtn = document.getElementById('clearBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        const questionInput = document.getElementById('questionInput');
        
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
        
        askBtn.addEventListener('click', () => this.askQuestionFromInput());
        clearBtn.addEventListener('click', () => this.clearAll());
        sampleBtn.addEventListener('click', () => this.loadSample());
        
        questionInput.addEventListener('input', (e) => {
            askBtn.disabled = !e.target.value.trim();
        });
        
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (questionInput.value.trim()) {
                    this.askQuestionFromInput();
                }
            }
        });
    }
    
    async handleFile(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            this.csvData = this.parseCSV(text);
            
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
            
            // Session oluştur
            await this.createSession(tableData);
            
            // Update file info
            document.getElementById('fileInfo').style.display = 'block';
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('rowCount').textContent = this.csvData.length;
            document.getElementById('columnCount').textContent = this.csvData[0].length;
            
            // Show preview
            this.showPreview();
            
            // Show quick questions and question input
            document.getElementById('quickQuestions').style.display = 'flex';
            document.getElementById('questionInputWrapper').style.display = 'flex';
            document.getElementById('emptyState').style.display = 'none';
            
            // Attach quick question events
            document.querySelectorAll('.quick-question-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const question = e.currentTarget.dataset.question;
                    document.getElementById('questionInput').value = question;
                    document.getElementById('askBtn').disabled = false;
                });
            });
            
        } catch (error) {
            console.error('File processing error:', error);
            alert('Dosya işlenirken bir hata oluştu: ' + error.message);
        }
    }
    
    parseCSV(text) {
        const lines = text.trim().split('\n');
        return lines.map(line => {
            return line.split(',').map(cell => cell.trim());
        });
    }
    
    showPreview() {
        const preview = document.getElementById('dataPreview');
        const table = document.getElementById('previewTable');
        
        preview.style.display = 'block';
        
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
    
    async askQuestionFromInput() {
        const questionInput = document.getElementById('questionInput');
        const askBtn = document.getElementById('askBtn');
        const question = questionInput.value.trim();
        
        if (!this.sessionId || !question) return;
        
        // Clear input and disable button
        questionInput.value = '';
        askBtn.disabled = true;
        
        // Ask question using session
        await this.askQuestion(question);
        
        // Re-enable button
        askBtn.disabled = false;
    }
    
    addMessage(role, content) {
        const chat = document.getElementById('analysisChat');
        const messageId = `msg-${Date.now()}`;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        messageDiv.id = messageId;
        messageDiv.innerHTML = `
            <div class="message-avatar">${role === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;
        
        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;
        
        return messageId;
    }
    
    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }
    
    formatMessage(text) {
        let formatted = this.escapeHtml(text);
        
        // Bold text
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }
    
    async clearAll() {
        // Clear session
        await this.clearSession();
        
        // Clear UI
        this.csvData = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('dataPreview').style.display = 'none';
        document.getElementById('quickQuestions').style.display = 'none';
        document.getElementById('questionInputWrapper').style.display = 'none';
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('analysisChat').innerHTML = '<div class="empty-state" id="emptyState"><div class="empty-icon">📋</div><div class="empty-text">CSV dosyası yükleyin ve sorularınızı sorun</div></div>';
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
    
    // Session yönetimi
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
    
    async askQuestion(question) {
        if (!this.sessionId || !question) return;
        
        // Add user message
        this.addMessage('user', question);
        
        try {
            // Show loading message
            const loadingId = this.addMessage('assistant', 'Analiz ediliyor...');
            
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
            
            // Remove loading message and add real response
            this.removeMessage(loadingId);
            this.addMessage('assistant', data.answer);
            
            // Add to chat history
            this.chatHistory.push({
                question: question,
                answer: data.answer,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Question error:', error);
            this.addMessage('assistant', '❌ Analiz sırasında bir hata oluştu: ' + error.message);
        }
    }
    
    async loadSessionHistory() {
        if (!this.sessionId) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/session-history?session_id=${this.sessionId}`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.chatHistory = data.questions || [];
            
            // Restore chat history
            this.restoreChatHistory();
            
        } catch (error) {
            console.error('History load error:', error);
        }
    }
    
    restoreChatHistory() {
        const chat = document.getElementById('analysisChat');
        const emptyState = document.getElementById('emptyState');
        
        if (this.chatHistory.length > 0) {
            emptyState.style.display = 'none';
            
            this.chatHistory.forEach(item => {
                this.addMessage('user', item.question);
                this.addMessage('assistant', item.answer);
            });
        }
    }
    
    async clearSession() {
        if (this.sessionId) {
            try {
                await fetch(`${this.apiUrl}/clear-session`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        session_id: this.sessionId
                    })
                });
            } catch (error) {
                console.error('Clear session error:', error);
            }
        }
        
        this.sessionId = null;
        this.chatHistory = [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


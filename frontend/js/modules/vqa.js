// VQA Module - Visual Question Answering Service

export default class VQAModule {
    constructor(container) {
        this.container = container;
        this.uploadUrl = 'http://localhost:8002/upload';
        this.askUrl = 'http://localhost:8002/ask';
        this.statusUrl = 'http://localhost:8002/status';
        this.clearUrl = 'http://localhost:8002/clear';
        this.sessionId = null;
        this.conversationHistory = [];
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">💬 Görsel Soru-Cevap</h2>
                <p class="module-description">
                    Görseller hakkında Türkçe sorular sorun ve akıllı cevaplar alın.
                    Qwen2.5VL:32b modeli ile interaktif görsel analizi.
                </p>
            </div>

            <!-- Upload Section -->
            <div class="upload-section" id="uploadSection">
                <div class="upload-icon">🖼️</div>
                <h3 class="upload-title">Görsel Yükle</h3>
                <p class="upload-subtitle">
                    Görselinizi yükleyin ve sorularınızı sorun
                    <br>
                    <small>Desteklenen formatlar: JPG, PNG, WEBP</small>
                </p>
                <input type="file" id="fileInput" class="file-input" accept="image/*">
                <button class="btn btn-primary" id="selectFileBtn">
                    <span>📁</span>
                    <span>Görsel Seç</span>
                </button>
            </div>

            <!-- Chat Section (hidden by default) -->
            <div class="vqa-chat-section" id="chatSection" style="display: none;">
                <!-- Image Preview -->
                <div class="vqa-image-preview">
                    <img id="chatImage" class="vqa-preview-image" alt="Loaded image">
                    <div class="vqa-session-info">
                        <span class="vqa-session-badge">
                            <span>🔗</span>
                            <span id="sessionInfo">Oturum aktif</span>
                        </span>
                        <button class="btn btn-secondary btn-sm" id="newImageBtn">
                            <span>🔄</span>
                            <span>Yeni Görsel</span>
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
                                <p>Merhaba! Görseliniz hakkında sorularınızı sorabilirsiniz. Size yardımcı olmaktan mutluluk duyarım!</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Questions -->
                    <div class="vqa-quick-questions" id="quickQuestions">
                        <div class="vqa-quick-title">💡 Hızlı Sorular:</div>
                        <button class="vqa-quick-btn" data-question="Bu görselde neler görüyorsun?">
                            Bu görselde neler görüyorsun?
                        </button>
                        <button class="vqa-quick-btn" data-question="Bu görseli detaylı olarak açıklar mısın?">
                            Bu görseli detaylı olarak açıklar mısın?
                        </button>
                        <button class="vqa-quick-btn" data-question="Bu görseldeki ana konular nelerdir?">
                            Bu görseldeki ana konular nelerdir?
                        </button>
                        <button class="vqa-quick-btn" data-question="Bu görseldeki renkler ve atmosfer nasıl?">
                            Bu görseldeki renkler ve atmosfer nasıl?
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
        
        this.addVQAStyles();
    }
    
    addVQAStyles() {
        if (document.getElementById('vqa-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'vqa-styles';
        style.textContent = `
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
            
            .vqa-preview-image {
                width: 100%;
                border-radius: 12px;
                box-shadow: var(--shadow-md);
                margin-bottom: 1rem;
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
            
            .vqa-welcome-message {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .vqa-assistant-avatar {
                width: 40px;
                height: 40px;
                background: var(--primary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            
            .vqa-user-avatar {
                width: 40px;
                height: 40px;
                background: var(--secondary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                flex-shrink: 0;
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
            
            .vqa-formatted-text em {
                font-style: italic;
            }
            
            .vqa-list-item {
                margin: 1rem 0;
                padding-left: 0.5rem;
                line-height: 1.6;
            }
            
            .vqa-user-message {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                flex-direction: row-reverse;
            }
            
            .vqa-user-message .vqa-message-content {
                text-align: right;
            }
            
            .vqa-assistant-message {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
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
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const uploadSection = document.getElementById('uploadSection');
        
        // File selection
        selectFileBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadImage(file);
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
                this.uploadImage(file);
            }
        });
    }
    
    attachChatEvents() {
        const askBtn = document.getElementById('askBtn');
        const questionInput = document.getElementById('questionInput');
        const newImageBtn = document.getElementById('newImageBtn');
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
        
        // New image button
        newImageBtn.addEventListener('click', () => this.resetSession());
    }
    
    async uploadImage(file) {
        const uploadSection = document.getElementById('uploadSection');
        
        try {
            // Show loading
            uploadSection.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Görsel yükleniyor ve işleniyor...</p>
                    <small style="color: var(--text-secondary);">Bu işlem birkaç saniye sürebilir</small>
                </div>
            `;
            
            // Prepare form data
            const formData = new FormData();
            formData.append('image', file);
            
            // Upload image
            const response = await fetch(this.uploadUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success' && data.session_id) {
                this.sessionId = data.session_id;
                this.showChatInterface(file);
            } else {
                throw new Error('Session ID not received');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
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
    
    showChatInterface(file) {
        const uploadSection = document.getElementById('uploadSection');
        const chatSection = document.getElementById('chatSection');
        const chatImage = document.getElementById('chatImage');
        
        // Hide upload, show chat
        uploadSection.style.display = 'none';
        chatSection.style.display = 'grid';
        
        // Set image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            chatImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        // Attach chat events
        this.attachChatEvents();
    }
    
    async askQuestion() {
        const questionInput = document.getElementById('questionInput');
        const question = questionInput.value.trim();
        
        if (!question) {
            alert('Lütfen bir soru yazın');
            return;
        }
        
        if (!this.sessionId) {
            alert('Oturum bulunamadı. Lütfen görseli tekrar yükleyin.');
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
            const formData = new FormData();
            formData.append('question', question);
            formData.append('session_id', this.sessionId);
            
            const response = await fetch(this.askUrl, {
                method: 'POST',
                body: formData
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
        this.conversationHistory = [];
        
        document.getElementById('chatSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('fileInput').value = '';
        
        // Re-render to reset everything
        this.render();
        this.attachEvents();
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


// Quiz Generator Module - AI-Powered Quiz Generation

export default class QuizModule {
    constructor(container) {
        this.container = container;
        this.apiUrl = 'http://localhost:8006/generate';
        
        this.render();
        this.attachEvents();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="module-header">
                <h2 class="module-title">❓ Quiz Oluşturma</h2>
                <p class="module-description">
                    Metinlerden otomatik olarak çoktan seçmeli sorular oluşturun. Eğitim ve değerlendirme için ideal.
                </p>
            </div>

            <div class="quiz-container">
                <!-- Input Section -->
                <div class="quiz-input-section">
                    <div class="section-header">
                        <h3 class="section-title">📝 Kaynak Metin</h3>
                    </div>
                    
                    <textarea 
                        id="sourceText" 
                        class="quiz-textarea"
                        placeholder="Quiz oluşturulacak metni buraya girin...

Örnek:
Yapay zeka, bilgisayar sistemlerinin insan benzeri düşünme, öğrenme ve problem çözme yeteneklerini taklit etmesini sağlayan bir teknoloji dalıdır. Makine öğrenimi, yapay zekanın bir alt dalı olup, sistemlerin deneyimlerden öğrenerek performanslarını artırmalarını sağlar."
                        rows="10"
                    ></textarea>
                    
                    <div class="quiz-settings">
                        <div class="setting-group">
                            <label class="setting-label">
                                <span>🔢 Soru Sayısı</span>
                                <span id="questionCountValue" class="setting-value">5</span>
                            </label>
                            <input 
                                type="range" 
                                id="questionCount" 
                                class="slider"
                                min="3" 
                                max="10" 
                                value="5"
                            >
                        </div>
                    </div>
                    
                    <div class="quiz-actions">
                        <button class="btn btn-primary btn-lg" id="generateBtn">
                            <span>✨</span>
                            <span>Quiz Oluştur</span>
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
                <div class="quiz-results-section" id="resultsSection" style="display: none;">
                    <div class="section-header">
                        <h3 class="section-title">📋 Oluşturulan Quiz</h3>
                        <div class="quiz-header-actions">
                            <button class="btn btn-secondary btn-sm" id="exportBtn">
                                <span>💾</span>
                                <span>JSON İndir</span>
                            </button>
                            <button class="btn btn-secondary btn-sm" id="printBtn">
                                <span>🖨️</span>
                                <span>Yazdır</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="quiz-output" id="quizOutput">
                        <!-- Quiz questions will appear here -->
                    </div>
                </div>
            </div>
        `;
        
        this.addQuizStyles();
    }
    
    addQuizStyles() {
        if (document.getElementById('quiz-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'quiz-styles';
        style.textContent = `
            .quiz-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            
            .quiz-input-section,
            .quiz-results-section {
                background: var(--bg-secondary);
                padding: 1.5rem;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
            }
            
            .quiz-textarea {
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
            
            .quiz-textarea:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .quiz-settings {
                background: white;
                padding: 1.25rem;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
            
            .setting-group {
                margin-bottom: 1rem;
            }
            
            .setting-group:last-child {
                margin-bottom: 0;
            }
            
            .setting-label {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 600;
                font-size: 0.875rem;
            }
            
            .setting-value {
                background: var(--primary-color);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.875rem;
            }
            
            .quiz-actions {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            
            .quiz-header-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .quiz-output {
                flex: 1;
                overflow-y: auto;
            }
            
            .quiz-question {
                background: white;
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
                border: 2px solid var(--border-color);
            }
            
            .question-header {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                margin-bottom: 1rem;
            }
            
            .question-number {
                background: var(--primary-color);
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                flex-shrink: 0;
            }
            
            .question-text {
                flex: 1;
                font-size: 1rem;
                font-weight: 600;
                line-height: 1.5;
                color: var(--text-primary);
            }
            
            .question-options {
                margin-top: 1rem;
            }
            
            .option-item {
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                border-radius: 6px;
                background: #f8f9fa;
                border: 2px solid transparent;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                transition: all 0.2s;
            }
            
            .option-item.correct {
                background: #d4edda;
                border-color: #28a745;
            }
            
            .option-letter {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: var(--text-secondary);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                font-weight: 700;
                flex-shrink: 0;
            }
            
            .option-item.correct .option-letter {
                background: #28a745;
            }
            
            .option-text {
                flex: 1;
                font-size: 0.875rem;
                line-height: 1.4;
            }
            
            .correct-indicator {
                color: #28a745;
                font-weight: 700;
                flex-shrink: 0;
            }
            
            @media (max-width: 1024px) {
                .quiz-container {
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
        const questionCount = document.getElementById('questionCount');
        const questionCountValue = document.getElementById('questionCountValue');
        
        generateBtn.addEventListener('click', () => this.generateQuiz());
        clearBtn.addEventListener('click', () => this.clearAll());
        sampleBtn.addEventListener('click', () => this.loadSample());
        
        questionCount.addEventListener('input', (e) => {
            questionCountValue.textContent = e.target.value;
        });
    }
    
    async generateQuiz() {
        const sourceText = document.getElementById('sourceText');
        const questionCount = document.getElementById('questionCount');
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
                <span>Quiz oluşturuluyor...</span>
            `;
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    num_questions: parseInt(questionCount.value)
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayQuiz(data);
            
        } catch (error) {
            console.error('Quiz generation error:', error);
            alert('Quiz oluşturulurken bir hata oluştu: ' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = `
                <span>✨</span>
                <span>Quiz Oluştur</span>
            `;
        }
    }
    
    displayQuiz(data) {
        const resultsSection = document.getElementById('resultsSection');
        const quizOutput = document.getElementById('quizOutput');
        
        resultsSection.style.display = 'flex';
        
        const questions = data.questions || [];
        
        quizOutput.innerHTML = questions.map((q, index) => `
            <div class="quiz-question">
                <div class="question-header">
                    <div class="question-number">${index + 1}</div>
                    <div class="question-text">${this.escapeHtml(q.question)}</div>
                </div>
                <div class="question-options">
                    ${q.options.map((option, optIndex) => {
                        const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                        const isCorrect = optIndex === q.correct_answer;
                        return `
                            <div class="option-item ${isCorrect ? 'correct' : ''}">
                                <div class="option-letter">${letter}</div>
                                <div class="option-text">${this.escapeHtml(option)}</div>
                                ${isCorrect ? '<div class="correct-indicator">✓ Doğru</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
        
        // Attach export and print button events
        const exportBtn = document.getElementById('exportBtn');
        const printBtn = document.getElementById('printBtn');
        
        exportBtn.onclick = () => this.exportQuiz(data);
        printBtn.onclick = () => this.printQuiz();
    }
    
    exportQuiz(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quiz_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    printQuiz() {
        window.print();
    }
    
    clearAll() {
        document.getElementById('sourceText').value = '';
        document.getElementById('resultsSection').style.display = 'none';
    }
    
    loadSample() {
        const sample = `Yapay zeka, bilgisayar sistemlerinin insan benzeri düşünme, öğrenme ve problem çözme yeteneklerini taklit etmesini sağlayan bir teknoloji dalıdır. Makine öğrenimi, yapay zekanın bir alt dalı olup, sistemlerin deneyimlerden öğrenerek performanslarını artırmalarını sağlar.

Derin öğrenme ise makine öğreniminin bir alt dalıdır ve yapay sinir ağları kullanarak çalışır. Bu ağlar, insan beyninin yapısından esinlenerek tasarlanmıştır ve çok katmanlı yapıları sayesinde karmaşık problemleri çözebilir.

Doğal dil işleme, yapay zekanın bir başka önemli uygulamasıdır. Bu teknoloji, bilgisayarların insan dilini anlama, yorumlama ve üretme yeteneğini geliştirir. Günümüzde chatbot'lar ve sesli asistanlar bu teknolojinin yaygın örnekleridir.`;
        
        document.getElementById('sourceText').value = sample;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}


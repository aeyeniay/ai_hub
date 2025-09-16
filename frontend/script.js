// Global variables
let currentService = 'detect';
let currentImage = null;
let analysisStartTime = null;

// Service configuration
const services = {
    detect: {
        url: 'http://localhost:8000/detect',  // Host network port
        name: 'Nesne Tespiti (LLaVA-34B)'
    },
    vqa: {
        url: 'http://localhost:8002/vqa',    // VQA port
        name: 'Görsel Soru-Cevap'
    },
    imggen: {
        url: 'http://localhost:8001/generate', // Image generation port
        name: 'Görsel Üretimi'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateServiceDisplay();
});

// Initialize event listeners
function initializeEventListeners() {
    // Service selection
    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectService(this.dataset.service);
        });
    });

    // File input
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);

    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => document.getElementById('fileInput').click());
}

// Service selection
function selectService(service) {
    currentService = service;
    
    // Update active button
    document.querySelectorAll('.service-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-service="${service}"]`).classList.add('active');
    
    updateServiceDisplay();
    hideResults();
}

// Update service display
function updateServiceDisplay() {
    const serviceName = document.querySelector(`[data-service="${currentService}"]`).textContent.trim();
    document.querySelector('.header p').textContent = `${serviceName} - Çevre & Şehircilik Bakanlığı için AI Destekli Görsel Analiz`;
}

// File handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        displayImage(file);
        currentImage = file;
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#4CAF50';
    event.currentTarget.style.background = '#f0f8f0';
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        displayImage(file);
        currentImage = file;
    }
    event.currentTarget.style.borderColor = '#ddd';
    event.currentTarget.style.background = 'white';
}

// Display image preview
function displayImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('imagePreview').style.display = 'block';
        
        // Auto-analyze if detect service is selected
        if (currentService === 'detect') {
            analyzeImage();
        }
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('fileInput').value = '';
    currentImage = null;
    hideResults();
}

// Analyze image
async function analyzeImage() {
    if (!currentImage) {
        alert('Lütfen önce bir fotoğraf yükleyin');
        return;
    }

    showAnalysis();
    analysisStartTime = Date.now();

    try {
        const formData = new FormData();
        formData.append('image', currentImage);

        let response;
        if (currentService === 'detect') {
            response = await fetch(services.detect.url, {
                method: 'POST',
                body: formData,
                mode: 'cors'  // Enable CORS
            });
        } else if (currentService === 'vqa') {
            // For VQA, we'll show the question input
            hideAnalysis();
            showVQAResults();
            return;
        } else if (currentService === 'imggen') {
            // For image generation, we'll show the prompt input
            hideAnalysis();
            showImageGenResults();
            return;
        }

        if (response.ok) {
            const result = await response.json();
            hideAnalysis();
            displayResults(result);
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Analysis error:', error);
        hideAnalysis();
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            alert('Bağlantı hatası! Detect servisinin çalıştığından emin olun.\n\nPort: 8003');
        } else {
            alert('Analiz sırasında hata oluştu: ' + error.message);
        }
    }
}

// Show analysis section
function showAnalysis() {
    document.getElementById('analysisSection').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
}

// Hide analysis section
function hideAnalysis() {
    document.getElementById('analysisSection').style.display = 'none';
}

// Hide results
function hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
}

// Display results
function displayResults(result) {
    document.getElementById('resultsSection').style.display = 'block';
    
    if (currentService === 'detect') {
        displayDetectResults(result);
    }
}

// Display detect results
function displayDetectResults(result) {
    document.getElementById('detectResults').style.display = 'block';
    document.getElementById('vqaResults').style.display = 'none';
    document.getElementById('imggenResults').style.display = 'none';

    // Update summary cards
    document.getElementById('totalObjects').textContent = result.total_objects || 0;
    document.getElementById('modelName').textContent = result.model || 'LLaVA-34B';
    
    const analysisTime = analysisStartTime ? Math.round((Date.now() - analysisStartTime) / 1000) : 0;
    document.getElementById('analysisTime').textContent = analysisTime + 's';

    // Display detections
    const detectionsList = document.getElementById('detectionsList');
    detectionsList.innerHTML = '';

    if (result.detections && result.detections.length > 0) {
        result.detections.forEach(detection => {
            const detectionItem = createDetectionItem(detection);
            detectionsList.appendChild(detectionItem);
        });
    } else {
        detectionsList.innerHTML = '<p class="no-results">Nesne tespit edilemedi</p>';
    }
}

// Create detection item
function createDetectionItem(detection) {
    const item = document.createElement('div');
    item.className = 'detection-item';
    
    item.innerHTML = `
        <div class="detection-header">
            <span class="detection-name">${detection.name}</span>
            <span class="confidence-badge">%${detection.confidence}</span>
        </div>
        <div class="detection-location">
            <i class="fas fa-map-marker-alt"></i> ${detection.location}
        </div>
        <div class="detection-details">
            ${detection.details}
        </div>
    `;
    
    return item;
}

// Show VQA results
function showVQAResults() {
    document.getElementById('detectResults').style.display = 'none';
    document.getElementById('vqaResults').style.display = 'block';
    document.getElementById('imggenResults').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
}

// Show image generation results
function showImageGenResults() {
    document.getElementById('detectResults').style.display = 'none';
    document.getElementById('vqaResults').style.display = 'none';
    document.getElementById('imggenResults').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'block';
}

// Ask question (VQA)
async function askQuestion() {
    const question = document.getElementById('questionInput').value.trim();
    if (!question) {
        alert('Lütfen bir soru yazın');
        return;
    }

    if (!currentImage) {
        alert('Lütfen önce bir fotoğraf yükleyin');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('image', currentImage);
        formData.append('question', question);

        const response = await fetch(services.vqa.url, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('answerText').textContent = result.answer || result.response || 'Yanıt alınamadı';
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('VQA error:', error);
        alert('Soru sorma sırasında hata oluştu: ' + error.message);
    }
}

// Generate image
async function generateImage() {
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) {
        alert('Lütfen bir görsel açıklaması yazın');
        return;
    }

    try {
        const response = await fetch(services.imggen.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }),
            mode: 'cors'
        });

        if (response.ok) {
            const result = await response.json();
            if (result.image_url) {
                document.getElementById('generatedImage').innerHTML = `
                    <img src="${result.image_url}" alt="Generated Image" style="max-width: 100%; border-radius: 10px;">
                `;
            } else {
                document.getElementById('generatedImage').innerHTML = '<p>Görsel üretildi ama URL bulunamadı</p>';
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Image generation error:', error);
        alert('Görsel üretimi sırasında hata oluştu: ' + error.message);
    }
}

// Add some utility functions
function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ff4444' : '#4CAF50'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .no-results {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 20px;
    }
`;
document.head.appendChild(style);

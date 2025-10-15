// AI Hub Main Application

class AIHub {
    constructor() {
        this.currentModule = null;
        this.moduleContainer = document.getElementById('module-container');
        this.menuItems = document.querySelectorAll('.menu-item');
        
        this.init();
    }
    
    init() {
        // Menu item click events
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const moduleName = e.currentTarget.dataset.module;
                this.loadModule(moduleName);
                this.setActiveMenu(e.currentTarget);
            });
        });
        
        // Load default module (detect)
        this.loadModule('detect');
    }
    
    setActiveMenu(activeItem) {
        this.menuItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }
    
    async loadModule(moduleName) {
        try {
            // Show loading state
            this.moduleContainer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Modül yükleniyor...</p>
                </div>
            `;
            
            // Dynamically import module based on module name
            let module;
            switch(moduleName) {
                case 'detect':
                    module = await import('./modules/detect.js');
                    break;
                case 'vqa':
                    module = await import('./modules/vqa.js');
                    break;
                case 'imggen':
                    module = await import('./modules/imggen.js');
                    break;
                case 'pii-masking':
                    module = await import('./modules/pii-masking.js');
                    break;
                case 'quiz':
                    module = await import('./modules/quiz.js');
                    break;
                case 'template':
                    module = await import('./modules/template.js');
                    break;
                case 'infocards':
                    module = await import('./modules/infocards.js');
                    break;
                case 'chart':
                    module = await import('./modules/chart.js');
                    break;
                case 'table':
                    module = await import('./modules/table.js');
                    break;
                default:
                    throw new Error(`Bilinmeyen modül: ${moduleName}`);
            }
            
            // Initialize module
            if (module.default) {
                this.currentModule = new module.default(this.moduleContainer);
            }
        } catch (error) {
            console.error('Module load error:', error);
            this.moduleContainer.innerHTML = `
                <div class="error-message">
                    <strong>⚠️ Modül Yükleme Hatası</strong>
                    <p>Modül yüklenirken bir hata oluştu: ${moduleName}</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">
                        ${error.message}
                    </p>
                </div>
            `;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AIHub();
});


import { Circuit, CircuitElement, COMPONENTS } from './circuit.js';

class CircuitEditor {
    constructor() {
        this.circuit = new Circuit();
        this.canvas = document.getElementById('circuit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.selectedTool = null;
        this.isDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.dragElement = null;
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        
        this.initializeUI();
        this.setupEventListeners();
        this.resizeCanvas();
        this.draw();
    }

    initializeUI() {
        // Setup component buttons
        const componentButtons = document.querySelectorAll('.component-btn');
        componentButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectTool(btn.dataset.component);
            });
        });

        // Setup toolbar buttons
        document.getElementById('export-btn').addEventListener('click', () => {
            this.showExportModal();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the circuit?')) {
                this.circuit.clear();
                this.draw();
                this.updatePreview();
            }
        });

        // Setup zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.setZoom(this.zoom * 1.2);
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.setZoom(this.zoom / 1.2);
        });

        document.getElementById('reset-zoom').addEventListener('click', () => {
            this.setZoom(1);
            this.pan = { x: 0, y: 0 };
            this.draw();
        });

        // Setup preview update
        document.getElementById('update-preview').addEventListener('click', () => {
            this.updatePreview();
        });

        // Setup export modal
        this.setupExportModal();
    }

    setupExportModal() {
        const modal = document.getElementById('export-modal');
        const closeButtons = document.querySelectorAll('#close-modal, #close-export');
        const copyButton = document.getElementById('copy-latex');

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        copyButton.addEventListener('click', () => {
            const textarea = document.getElementById('latex-output');
            textarea.select();
            document.execCommand('copy');
            
            // Show feedback
            const originalText = copyButton.textContent;
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 2000);
        });
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Window events
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    selectTool(toolName) {
        // Update UI
        document.querySelectorAll('.component-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const selectedBtn = document.querySelector(`[data-component="${toolName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
            this.selectedTool = toolName;
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.pan.x) / this.zoom,
            y: (e.clientY - rect.top - this.pan.y) / this.zoom
        };
    }

    snapToGrid(x, y, gridSize = 20) {
        return {
            x: Math.round(x / gridSize) * gridSize,
            y: Math.round(y / gridSize) * gridSize
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);
        const snappedPos = this.snapToGrid(pos.x, pos.y);
        
        if (this.selectedTool && COMPONENTS[this.selectedTool]) {
            // Create new component
            const element = new CircuitElement(this.selectedTool, snappedPos.x, snappedPos.y);
            this.circuit.addElement(element);
            this.circuit.selectElement(element);
            this.draw();
            this.updatePreview();
        } else {
            // Select or drag existing element
            const clickedElement = this.circuit.getElementAt(pos.x, pos.y);
            
            if (clickedElement) {
                this.circuit.selectElement(clickedElement, e.ctrlKey || e.metaKey);
                this.dragElement = clickedElement;
                this.isDragging = true;
                this.dragStartPos = { x: pos.x - clickedElement.x, y: pos.y - clickedElement.y };
            } else {
                this.circuit.clearSelection();
            }
            
            this.draw();
        }
    }

    handleMouseMove(e) {
        if (this.isDragging && this.dragElement) {
            const pos = this.getMousePos(e);
            const snappedPos = this.snapToGrid(
                pos.x - this.dragStartPos.x, 
                pos.y - this.dragStartPos.y
            );
            
            this.dragElement.x = snappedPos.x;
            this.dragElement.y = snappedPos.y;
            this.draw();
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragElement = null;
            this.updatePreview();
        }
    }

    handleWheel(e) {
        e.preventDefault();
        
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.setZoom(this.zoom * zoomFactor);
        } else {
            // Pan
            this.pan.x -= e.deltaX;
            this.pan.y -= e.deltaY;
            this.draw();
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'Delete':
            case 'Backspace':
                if (this.circuit.selectedElements.length > 0) {
                    this.circuit.deleteSelected();
                    this.draw();
                    this.updatePreview();
                }
                break;
            case 'Escape':
                this.selectedTool = null;
                this.circuit.clearSelection();
                document.querySelectorAll('.component-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.draw();
                break;
            case 'a':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    // Select all
                    this.circuit.elements.forEach(element => {
                        element.selected = true;
                        this.circuit.selectedElements.push(element);
                    });
                    this.draw();
                }
                break;
        }
    }

    setZoom(newZoom) {
        this.zoom = Math.max(0.1, Math.min(5, newZoom));
        this.draw();
        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        const zoomLevel = document.querySelector('.zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply transformations
        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Draw grid
        this.drawGrid();
        
        // Draw all circuit elements
        this.circuit.elements.forEach(element => {
            element.draw(this.ctx);
        });
        
        this.ctx.restore();
    }

    drawGrid() {
        const gridSize = 20;
        const startX = Math.floor(-this.pan.x / this.zoom / gridSize) * gridSize;
        const startY = Math.floor(-this.pan.y / this.zoom / gridSize) * gridSize;
        const endX = startX + (this.canvas.width / this.zoom) + gridSize;
        const endY = startY + (this.canvas.height / this.zoom) + gridSize;

        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 1 / this.zoom;
        this.ctx.beginPath();

        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }

        this.ctx.stroke();
    }

    async updatePreview() {
        const previewContainer = document.getElementById('preview-container');
        const latex = this.circuit.toLatex();
        
        if (this.circuit.elements.length === 0) {
            previewContainer.innerHTML = '<p class="placeholder-text">Circuit preview will appear here</p>';
            return;
        }

        try {
            previewContainer.innerHTML = '<div class="loading">Rendering preview...</div>';
            
            // Create a container for MathJax
            const mathContainer = document.createElement('div');
            mathContainer.innerHTML = `$$${latex}$$`;
            
            previewContainer.innerHTML = '';
            previewContainer.appendChild(mathContainer);
            
            // Render with MathJax
            if (window.MathJax && window.MathJax.typesetPromise) {
                await window.MathJax.typesetPromise([mathContainer]);
            }
        } catch (error) {
            console.error('Preview rendering error:', error);
            previewContainer.innerHTML = '<p class="placeholder-text">Preview not available</p>';
        }
    }

    showExportModal() {
        const modal = document.getElementById('export-modal');
        const output = document.getElementById('latex-output');
        
        const latex = this.circuit.toLatex();
        output.value = latex;
        
        modal.classList.remove('hidden');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CircuitEditor();
});

// Export for potential use by other modules
export default CircuitEditor;
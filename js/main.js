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
        
        // Track component placement state
        this.placingComponent = false;
        this.placementStart = null;
        this.tempElement = null;
        
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
            
            // Reset placement state when changing tools
            this.placingComponent = false;
            this.placementStart = null;
            this.tempElement = null;
        }
    }

    // Helper function to check if component is a path element
    isPathElement(componentType) {
        return ['resistor', 'capacitor', 'inductor', 'voltage', 'current', 'wire'].includes(componentType);
    }

    // Helper function to check if component is a node element
    isNodeElement(componentType) {
        return ['ground', 'node'].includes(componentType);
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
            if (this.isPathElement(this.selectedTool)) {
                // Start placing path element with click-and-drag
                if (!this.placingComponent) {
                    // First click - start placement
                    this.placingComponent = true;
                    this.placementStart = snappedPos;
                    this.tempElement = new CircuitElement(this.selectedTool, snappedPos.x, snappedPos.y);
                } else {
                    // Second click - finish placement
                    if (this.tempElement) {
                        // Update the end position based on mouse position
                        this.updatePathElementEnd(this.tempElement, snappedPos);
                        this.circuit.addElement(this.tempElement);
                        this.circuit.selectElement(this.tempElement);
                    }
                    
                    // Reset placement state
                    this.placingComponent = false;
                    this.placementStart = null;
                    this.tempElement = null;
                }
                this.draw();
            } else if (this.isNodeElement(this.selectedTool)) {
                // Single click placement for node elements
                const element = new CircuitElement(this.selectedTool, snappedPos.x, snappedPos.y);
                this.circuit.addElement(element);
                this.circuit.selectElement(element);
                this.draw();
            }
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
        const pos = this.getMousePos(e);
        
        if (this.isDragging && this.dragElement) {
            // Handle dragging existing elements
            const snappedPos = this.snapToGrid(
                pos.x - this.dragStartPos.x, 
                pos.y - this.dragStartPos.y
            );
            
            this.dragElement.x = snappedPos.x;
            this.dragElement.y = snappedPos.y;
            this.draw();
        } else if (this.placingComponent && this.tempElement && this.placementStart) {
            // Handle path element placement preview
            const snappedPos = this.snapToGrid(pos.x, pos.y);
            this.updatePathElementEnd(this.tempElement, snappedPos);
            this.draw();
        }
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragElement = null;
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
                }
                break;
            case 'Escape':
                this.selectedTool = null;
                this.circuit.clearSelection();
                
                // Cancel any ongoing placement
                this.placingComponent = false;
                this.placementStart = null;
                this.tempElement = null;
                
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

    // Helper function to update path element end position during placement
    updatePathElementEnd(element, endPos) {
        if (!element || !this.placementStart) return;
        
        const dx = endPos.x - this.placementStart.x;
        const dy = endPos.y - this.placementStart.y;
        
        // Update element size based on the distance
        const component = COMPONENTS[element.type];
        if (component && component.terminals.length > 1) {
            // For path elements, adjust the width based on drag distance
            // Keep the starting position and adjust width
            const distance = Math.sqrt(dx * dx + dy * dy);
            element.width = Math.max(component.width, distance);
            
            // For horizontal/vertical alignment, snap to major axes
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal alignment
                element.width = Math.abs(dx);
                element.height = component.height;
            } else {
                // Vertical alignment - for now keep horizontal, but could rotate
                element.width = Math.abs(dx);
                element.height = component.height;
            }
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
        
        // Draw grid first (before transformations)
        this.drawGrid();
        
        // Apply transformations for circuit elements
        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Draw all circuit elements
        this.circuit.elements.forEach(element => {
            element.draw(this.ctx);
        });
        
        // Draw temporary element during placement
        if (this.tempElement && this.placingComponent) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.7; // Make it semi-transparent
            this.tempElement.draw(this.ctx);
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }

    drawGrid() {
        const gridSize = 20 * this.zoom;
        const offsetX = this.pan.x % gridSize;
        const offsetY = this.pan.y % gridSize;

        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        // Vertical lines
        for (let x = offsetX; x <= this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }

        // Horizontal lines
        for (let y = offsetY; y <= this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }

        this.ctx.stroke();
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
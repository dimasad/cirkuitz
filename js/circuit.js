// Circuit component definitions
export const COMPONENTS = {
    resistor: {
        name: 'Resistor',
        symbol: 'R',
        circuitikz: 'resistor',
        width: 60,
        height: 20,
        terminals: [{ x: 0, y: 0 }, { x: 60, y: 0 }]
    },
    capacitor: {
        name: 'Capacitor',
        symbol: 'C',
        circuitikz: 'capacitor',
        width: 40,
        height: 30,
        terminals: [{ x: 0, y: 0 }, { x: 40, y: 0 }]
    },
    inductor: {
        name: 'Inductor',
        symbol: 'L',
        circuitikz: 'inductor',
        width: 60,
        height: 25,
        terminals: [{ x: 0, y: 0 }, { x: 60, y: 0 }]
    },
    voltage: {
        name: 'Voltage Source',
        symbol: 'V',
        circuitikz: 'voltage source',
        width: 40,
        height: 40,
        terminals: [{ x: 0, y: 0 }, { x: 40, y: 0 }]
    },
    current: {
        name: 'Current Source',
        symbol: 'I',
        circuitikz: 'current source',
        width: 40,
        height: 40,
        terminals: [{ x: 0, y: 0 }, { x: 40, y: 0 }]
    },
    ground: {
        name: 'Ground',
        symbol: '⏚',
        circuitikz: 'ground',
        width: 30,
        height: 30,
        terminals: [{ x: 15, y: 0 }]
    },
    wire: {
        name: 'Wire',
        symbol: '—',
        circuitikz: 'short',
        width: 40,
        height: 2,
        terminals: [{ x: 0, y: 0 }, { x: 40, y: 0 }]
    },
    node: {
        name: 'Node',
        symbol: '•',
        circuitikz: 'node',
        width: 8,
        height: 8,
        terminals: [{ x: 4, y: 4 }]
    }
};

// Circuit element class
export class CircuitElement {
    constructor(type, x, y, id = null) {
        this.id = id || Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.label = '';
        this.value = '';
        this.selected = false;
        this.component = COMPONENTS[type];
        
        // Allow custom width/height, defaulting to component defaults
        this.width = this.component.width;
        this.height = this.component.height;
    }

    // Get element bounds
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    // Check if point is inside element
    containsPoint(x, y) {
        const bounds = this.getBounds();
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }

    // Get terminal positions in world coordinates
    getTerminals() {
        return this.component.terminals.map(terminal => ({
            x: this.x + terminal.x,
            y: this.y + terminal.y
        }));
    }

    // Draw the element on canvas
    draw(ctx, scale = 1) {
        ctx.save();
        
        // Apply transformations
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.scale(scale, scale);
        ctx.translate(-this.width / 2, -this.height / 2);

        // Draw selection highlight
        if (this.selected) {
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(-5, -5, this.width + 10, this.height + 10);
            ctx.setLineDash([]);
        }

        // Draw component based on type
        ctx.strokeStyle = '#333';
        ctx.fillStyle = '#333';
        ctx.lineWidth = 2;

        switch (this.type) {
            case 'resistor':
                this.drawResistor(ctx);
                break;
            case 'capacitor':
                this.drawCapacitor(ctx);
                break;
            case 'inductor':
                this.drawInductor(ctx);
                break;
            case 'voltage':
                this.drawVoltageSource(ctx);
                break;
            case 'current':
                this.drawCurrentSource(ctx);
                break;
            case 'ground':
                this.drawGround(ctx);
                break;
            case 'wire':
                this.drawWire(ctx);
                break;
            case 'node':
                this.drawNode(ctx);
                break;
        }

        // Draw label and value
        if (this.label || this.value) {
            ctx.fillStyle = '#333';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            
            if (this.label) {
                ctx.fillText(this.label, this.width / 2, -8);
            }
            if (this.value) {
                ctx.fillText(this.value, this.width / 2, this.height + 20);
            }
        }

        ctx.restore();
    }

    drawResistor(ctx) {
        const w = this.width;
        const h = this.height;
        
        // Draw terminals
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w * 0.2, h/2);
        ctx.moveTo(w * 0.8, h/2);
        ctx.lineTo(w, h/2);
        
        // Draw zigzag pattern
        ctx.moveTo(w * 0.2, h/2);
        for (let i = 0; i < 6; i++) {
            const x = w * 0.2 + (i * w * 0.6 / 6);
            const y = h/2 + (i % 2 === 0 ? -h/4 : h/4);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(w * 0.8, h/2);
        ctx.stroke();
    }

    drawCapacitor(ctx) {
        const w = this.width;
        const h = this.height;
        
        // Draw terminals
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w * 0.4, h/2);
        ctx.moveTo(w * 0.6, h/2);
        ctx.lineTo(w, h/2);
        
        // Draw plates
        ctx.moveTo(w * 0.4, h * 0.2);
        ctx.lineTo(w * 0.4, h * 0.8);
        ctx.moveTo(w * 0.6, h * 0.2);
        ctx.lineTo(w * 0.6, h * 0.8);
        ctx.stroke();
    }

    drawInductor(ctx) {
        const w = this.width;
        const h = this.height;
        
        // Draw terminals
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w * 0.2, h/2);
        ctx.moveTo(w * 0.8, h/2);
        ctx.lineTo(w, h/2);
        
        // Draw coils
        for (let i = 0; i < 4; i++) {
            const centerX = w * 0.2 + (i + 0.5) * w * 0.6 / 4;
            const radius = w * 0.6 / 8;
            ctx.arc(centerX, h/2, radius, 0, Math.PI, true);
        }
        ctx.stroke();
    }

    drawVoltageSource(ctx) {
        const w = this.width;
        const h = this.height;
        
        // Draw terminals
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w * 0.2, h/2);
        ctx.moveTo(w * 0.8, h/2);
        ctx.lineTo(w, h/2);
        
        // Draw circle
        ctx.arc(w/2, h/2, w * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw + and - signs
        ctx.fillStyle = '#333';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', w * 0.35, h/2 + 5);
        ctx.fillText('−', w * 0.65, h/2 + 5);
    }

    drawCurrentSource(ctx) {
        const w = this.width;
        const h = this.height;
        
        // Draw terminals
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w * 0.2, h/2);
        ctx.moveTo(w * 0.8, h/2);
        ctx.lineTo(w, h/2);
        
        // Draw circle
        ctx.arc(w/2, h/2, w * 0.3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h/2);
        ctx.lineTo(w * 0.6, h/2);
        ctx.moveTo(w * 0.55, h * 0.4);
        ctx.lineTo(w * 0.6, h/2);
        ctx.lineTo(w * 0.55, h * 0.6);
        ctx.stroke();
    }

    drawGround(ctx) {
        const w = this.width;
        const h = this.height;
        
        ctx.beginPath();
        // Main line
        ctx.moveTo(w/2, 0);
        ctx.lineTo(w/2, h * 0.4);
        
        // Ground symbol lines
        ctx.moveTo(w * 0.2, h * 0.4);
        ctx.lineTo(w * 0.8, h * 0.4);
        ctx.moveTo(w * 0.3, h * 0.6);
        ctx.lineTo(w * 0.7, h * 0.6);
        ctx.moveTo(w * 0.4, h * 0.8);
        ctx.lineTo(w * 0.6, h * 0.8);
        ctx.stroke();
    }

    drawWire(ctx) {
        const w = this.width;
        const h = this.height;
        
        ctx.beginPath();
        ctx.moveTo(0, h/2);
        ctx.lineTo(w, h/2);
        ctx.stroke();
    }

    drawNode(ctx) {
        const w = this.width;
        const h = this.height;
        
        ctx.beginPath();
        ctx.arc(w/2, h/2, w/2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Generate LaTeX code for this element
    toLatex(gridSize = 20) {
        const gridX = Math.round(this.x / gridSize);
        const gridY = Math.round(this.y / gridSize);
        
        let latex = `\\draw (${gridX},${-gridY}) `;
        
        // Add component with label if exists
        if (this.label) {
            latex += `to[${this.component.circuitikz}, l=${this.label}] `;
        } else {
            latex += `to[${this.component.circuitikz}] `;
        }
        
        // Calculate end position based on component type
        let endX = gridX;
        let endY = -gridY;
        
        if (this.component.terminals.length > 1) {
            // For path elements, use the actual width
            endX = gridX + Math.round(this.width / gridSize);
            endY = -gridY - Math.round(this.height / gridSize);
        }
        
        latex += `(${endX},${endY});`;
        
        return latex;
    }
}

// Circuit class to manage all elements
export class Circuit {
    constructor() {
        this.elements = [];
        this.selectedElements = [];
        this.nextId = 1;
    }

    // Add element to circuit
    addElement(element) {
        this.elements.push(element);
        return element;
    }

    // Remove element from circuit
    removeElement(element) {
        const index = this.elements.indexOf(element);
        if (index > -1) {
            this.elements.splice(index, 1);
            this.selectedElements = this.selectedElements.filter(e => e !== element);
        }
    }

    // Get element at position
    getElementAt(x, y) {
        // Check in reverse order to get topmost element
        for (let i = this.elements.length - 1; i >= 0; i--) {
            if (this.elements[i].containsPoint(x, y)) {
                return this.elements[i];
            }
        }
        return null;
    }

    // Select element
    selectElement(element, multiSelect = false) {
        if (!multiSelect) {
            this.clearSelection();
        }
        
        if (element && !this.selectedElements.includes(element)) {
            element.selected = true;
            this.selectedElements.push(element);
        }
    }

    // Clear selection
    clearSelection() {
        this.selectedElements.forEach(element => {
            element.selected = false;
        });
        this.selectedElements = [];
    }

    // Delete selected elements
    deleteSelected() {
        this.selectedElements.forEach(element => {
            this.removeElement(element);
        });
    }

    // Clear all elements
    clear() {
        this.elements = [];
        this.selectedElements = [];
    }

    // Generate LaTeX code for the entire circuit
    toLatex() {
        if (this.elements.length === 0) {
            return '% Empty circuit\n\\begin{circuitikz}\n\\end{circuitikz}';
        }

        let latex = '\\begin{circuitikz}\n';
        
        this.elements.forEach(element => {
            latex += '  ' + element.toLatex() + '\n';
        });
        
        latex += '\\end{circuitikz}';
        
        return latex;
    }

    // Get circuit bounds
    getBounds() {
        if (this.elements.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        this.elements.forEach(element => {
            const bounds = element.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
}
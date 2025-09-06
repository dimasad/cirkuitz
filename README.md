# cirkuitz
A modern circuit diagram editor.

Cirkuitz is a modern, graphical editor for circuit diagrams, capable of rendering high-quality diagrams for screen viewing, and exporting to LaTeX via circuitikz.

Creating and modifying diagrams with cirkuitz is orders of magnitude faster than writing the equivalent LaTeX by hand and, with a little experience, competes with pen-and-paper.
Cirkuitz was inspired by [varkor/quiver](https://github.com/varkor/quiver) and is an experiment in coding with AI.

## Features

- **Visual Circuit Editor**: Draw circuit diagrams using an intuitive point-and-click interface
- **Component Library**: Includes resistors, capacitors, inductors, voltage sources, current sources, ground, wires, and nodes
- **LaTeX Export**: Generate clean circuitikz code that can be used in LaTeX documents
- **Real-time Preview**: See your circuit's LaTeX code as you build
- **Grid Snapping**: Components automatically align to a grid for clean layouts
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Quick Start
1. Open `index.html` in a web browser
2. Select a component from the left panel
3. Click on the canvas to place the component
4. Repeat to build your circuit
5. Click "Export LaTeX" to get the circuitikz code

### Running Locally
Since this is a client-side application, you can simply open `index.html` in your browser. For best results, serve it through a local web server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in your browser.

## Usage

### Adding Components
1. Click on a component in the left toolbar (Resistor, Capacitor, etc.)
2. Click on the canvas where you want to place the component
3. The component will be added and automatically snap to the grid

### Selecting and Moving Components
- Click on a component to select it (shows blue outline)
- Drag selected components to move them
- Hold Ctrl/Cmd and click to select multiple components

### Keyboard Shortcuts
- `Delete` or `Backspace`: Delete selected components
- `Escape`: Deselect all components and clear tool selection
- `Ctrl+A` or `Cmd+A`: Select all components

### Zoom and Pan
- Use the `+` and `−` buttons to zoom in/out
- Use the home button `⌂` to reset zoom and center view
- Mouse wheel with Ctrl/Cmd held zooms
- Mouse wheel without modifier pans the view

### Exporting
1. Click "Export LaTeX" button
2. Copy the generated circuitikz code
3. Include `\usepackage{circuitikz}` in your LaTeX document preamble
4. Paste the code into your document

## Example Circuit

Here's what a simple RC circuit looks like in the generated LaTeX:

```latex
\begin{circuitikz}
  \draw (15,-10) to[resistor] (18,-10);
  \draw (20,-15) to[capacitor] (22,-15);
  \draw (13,-20) to[voltage source] (15,-20);
\end{circuitikz}
```

## Browser Compatibility

Cirkuitz works in all modern browsers that support:
- HTML5 Canvas
- ES6 Modules
- CSS Grid and Flexbox

Tested in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This project is open to contributions! Areas where help is welcome:

- Additional circuit components
- Improved component graphics
- Better touch/mobile support
- Undo/redo functionality
- Save/load circuits
- Component labeling and values

## License

MIT License - see LICENSE file for details.

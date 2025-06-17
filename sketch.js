let neuronA, neuronB; 
let signals = []; 
let lastMessage = ""; 
let messageAlpha = 0; 

// --- Variables de la Interfaz ---
let thresholdSlider;
let stimulateButton;
let thresholdValueSpan;

// --- Colores Personalizables ---
// CAMBIO: Se actualizó el comentario para reflejar el nuevo nombre
const NEURON_A_COLOR = '#e94560'; // Color para la neurona Presináptica 
const NEURON_B_COLOR = '#5e72e4'; // Color azul para la segunda neurona
const SIGNAL_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--signal-color');

// La función setup() se ejecuta una sola vez al inicio
function setup() {
    let canvas = createCanvas(600, 400);
    canvas.parent('canvas-container'); 
    
    // CAMBIO: La etiqueta "Noelia" se ha cambiado por "Presináptica"
    neuronA = new Neuron(100, height / 3, 80, NEURON_A_COLOR, "Presináptica"); // Neurona de entrada
    neuronB = new Neuron(100, (height / 3) * 2, 70, NEURON_B_COLOR, "Post-sináptica"); // Neurona de salida

    // --- Conectar con los controles del HTML ---
    thresholdSlider = select('#threshold-slider');
    stimulateButton = select('#stimulate-button');
    thresholdValueSpan = select('#threshold-value');
    
    stimulateButton.mousePressed(sendStimulus);
}

// La función draw() se ejecuta en un bucle continuo
function draw() {
    background(getComputedStyle(document.documentElement).getPropertyValue('--bg-color'));

    // --- Actualizar el umbral de la Neurona A desde el slider ---
    let threshold = thresholdSlider.value();
    neuronA.setThreshold(threshold);
    thresholdValueSpan.html(threshold); // Actualizamos el span aquí

    // --- Actualizar y dibujar ambas neuronas ---
    neuronA.update();
    neuronB.update();
    neuronA.display();
    neuronB.display();
    
    // --- Actualizar y dibujar las señales/pulsos ---
    for (let i = signals.length - 1; i >= 0; i--) {
        signals[i].update();
        signals[i].display();
        
        // Lógica de la sinapsis
        if (signals[i].isFinished()) {
            neuronB.receiveStimulus(35); 
            
            // Comprobamos si este estímulo hizo disparar a la neurona B
            if (neuronB.potential >= neuronB.threshold) {
                // CAMBIO: El mensaje de conexión exitosa ahora es el que solicitaste.
                lastMessage = "¡Feliz Día del Biotecnólogo!";
                messageAlpha = 255; 
            }

            signals.splice(i, 1); // Eliminar la señal
        }
    }
    
    // --- Dibujar la información y el mensaje de estado ---
    drawInfo(threshold);
    drawConnectionMessage();
}

// Función para dibujar el texto informativo
function drawInfo(threshold) {
    fill(255); noStroke(); textSize(16); textAlign(LEFT, CENTER);
    text(`Potencial Neurona A: ${neuronA.potential.toFixed(0)}`, 20, 30);
    text(`Umbral Neurona A: ${threshold}`, 20, 55);
    
    let barWidth = map(neuronA.potential, 0, threshold, 0, 200);
    fill(100); rect(20, 75, 200, 10);
    fill(neuronA.color); rect(20, 75, barWidth, 10);

    text(`Potencial Neurona B: ${neuronB.potential.toFixed(0)}`, 20, height - 70);
    text(`Umbral Neurona B: ${neuronB.threshold}`, 20, height - 45);
    
    let barWidthB = map(neuronB.potential, 0, neuronB.threshold, 0, 200);
    fill(100); rect(20, height - 30, 200, 10);
    fill(neuronB.color); rect(20, height - 30, barWidthB, 10);
}

// Función para dibujar el mensaje de conexión que se desvanece
function drawConnectionMessage() {
    if (messageAlpha > 0) {
        fill(255, 255, 0, messageAlpha); // Amarillo brillante
        textSize(24); // Un poco más grande para que se lea mejor
        textAlign(CENTER, CENTER);
        text(lastMessage, width / 2, height / 2);
        messageAlpha -= 2; // Hacer que se desvanezca lentamente
    }
}

// Función que se llama cuando se presiona el botón
function sendStimulus() {
    neuronA.receiveStimulus(15); 
}


// --- Clases ---
class Neuron {
    constructor(x, y, size, color, label) {
        this.pos = createVector(x, y);
        this.size = size;
        this.color = color;
        this.label = label; 
        this.potential = 0;
        this.threshold = 70; 
        this.isFiring = false;
        this.fireColorAlpha = 0;
    }
    
    setThreshold(newThreshold) { this.threshold = newThreshold; }
    receiveStimulus(amount) { this.potential += amount; }
    
    update() {
        this.potential *= 0.99; 
        if (this.potential >= this.threshold && !this.isFiring) { this.fire(); }
        if (this.fireColorAlpha > 0) { this.fireColorAlpha -= 5; } else { this.isFiring = false; }
    }
    
    fire() {
        this.potential = 0;
        this.isFiring = true;
        this.fireColorAlpha = 255;
        
        // CAMBIO: Ahora comprueba la etiqueta correcta "Presináptica" para crear señales.
        // Solo la neurona presináptica crea las señales que viajan a la otra.
        if (this.label === "Presináptica") {
            let axonStart = createVector(this.pos.x + this.size / 2, this.pos.y);
            let axonEnd = createVector(width - 50, this.pos.y);
            signals.push(new Signal(axonStart, axonEnd, 5));
        }
    }
    
    display() {
        // Axón
        stroke(200, 200, 200, 150); strokeWeight(4);
        line(this.pos.x + this.size / 2, this.pos.y, width - 20, this.pos.y);
        
        // CAMBIO: Se comprueba la etiqueta correcta "Presináptica" para dibujar la conexión.
        if (this.label === "Presináptica") {
            fill(255);
            ellipse(width - 20, neuronB.pos.y, 15);
            stroke(255, 255, 0, 50);
            line(width - 20, this.pos.y, width - 20, neuronB.pos.y);
        }

        // Soma (cuerpo de la neurona)
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        if (this.isFiring) {
            fill(255, 255, 0, this.fireColorAlpha);
            ellipse(this.pos.x, this.pos.y, this.size + 20);
        }
        fill(255); textAlign(CENTER, CENTER); textSize(14);
        text(this.label, this.pos.x, this.pos.y);
    }
}

class Signal {
    constructor(start, end, speed) {
        this.start = start;
        this.end = end;
        this.speed = speed;
        this.pos = start.copy();
        this.progress = 0;
    }
    update() {
        let targetY = neuronB.pos.y;
        let finalTarget = createVector(this.end.x, targetY);
        let currentTarget = createVector(this.end.x, this.start.y);

        if (this.pos.x < this.end.x) {
            this.pos.x += this.speed;
        } else {
            this.pos = p5.Vector.lerp(this.pos, finalTarget, 0.1);
        }

        if (dist(this.pos.x, this.pos.y, finalTarget.x, finalTarget.y) < 1) {
            this.progress = 1;
        }
    }
    display() {
        noStroke();
        fill(SIGNAL_COLOR);
        ellipse(this.pos.x, this.pos.y, 15, 15);
    }
    isFinished() {
        return this.progress >= 1;
    }
}
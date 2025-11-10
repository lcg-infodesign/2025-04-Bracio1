// === ATLANTE DEI VULCANI — VERSIONE OTTIMIZZATA ===
// Miglior leggibilità, distribuzione, e stile dei glifi.

let table;
let volcanoes = [];
let selectedVolcano = null;
let zoomLevel = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let prevMouseX, prevMouseY;

function preload() {
  try {
    table = loadTable('volcanoes-2025-10-27 - Es.3 - Original Data.csv', 'csv', 'header');
  } catch (e) {
    console.error("Errore nel caricamento del CSV:", e);
    table = new p5.Table();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textFont('Arial');

  for (let r = 0; r < table.getRowCount(); r++) {
    volcanoes.push({
      name: table.getString(r, 'Volcano Name'),
      country: table.getString(r, 'Country'),
      location: table.getString(r, 'Location'),
      lat: float(table.getString(r, 'Latitude')),
      lon: float(table.getString(r, 'Longitude')),
      elevation: float(table.getString(r, 'Elevation (m)')),
      type: table.getString(r, 'TypeCategory'),
      status: table.getString(r, 'Status'),
      lastEruption: table.getString(r, 'Last Known Eruption')
    });
  }
}

function draw() {
  background(8, 10, 25);
  translate(width / 2 + offsetX, height / 2 + offsetY);
  scale(zoomLevel);
  drawAtlasGrid();

  // --- Evita sovrapposizioni eccessive ---
  // Calcolo di un "raggio di influenza" per non disegnare troppi glifi vicini
  let minScreenDist = 10 / zoomLevel;
  let displayed = [];

  for (let v of volcanoes) {
    let pos = projectCoords(v.lat, v.lon);

    // Controlla se è troppo vicino a un altro già disegnato
    let tooClose = false;
    for (let d of displayed) {
      if (dist(pos.x, pos.y, d.x, d.y) < minScreenDist) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;
    displayed.push(pos);

    push();
    translate(pos.x, pos.y);
    drawVolcano(v);
    pop();
  }

  resetMatrix();
  if (selectedVolcano) drawInfoCard(selectedVolcano);
  drawTitle();
}

// === Coordinate proiettate ===
function projectCoords(lat, lon) {
  let mapWidth = 6000;
  let mapHeight = 3000;
  let x = map(lon, -180, 180, -mapWidth / 2, mapWidth / 2);
  let y = map(lat, 90, -90, -mapHeight / 2, mapHeight / 2);
  return createVector(x, y);
}

function drawAtlasGrid() {
  stroke(70, 120, 180, 90);
  strokeWeight(0.6 / zoomLevel);
  noFill();

  let mapWidth = 6000;
  let mapHeight = 3000;

  for (let lon = -180; lon <= 180; lon += 30) {
    let x = map(lon, -180, 180, -mapWidth / 2, mapWidth / 2);
    line(x, -mapHeight / 2, x, mapHeight / 2);
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    let y = map(lat, 90, -90, -mapHeight / 2, mapHeight / 2);
    line(-mapWidth / 2, y, mapWidth / 2, y);
  }
}

// === Glifi ===
function drawVolcano(v) {
  let size = map(abs(v.elevation), 0, 6000, 3, 11);
  scale(1 / zoomLevel);

  // Ombra leggera sotto
  noStroke();
  fill(0, 0, 0, 80);
  ellipse(0, size * 0.5, size * 1.6, size * 0.4);

  // Corpo
  if (v.type.includes("Stratovolcano")) drawTruncatedPyramid(size);
  else if (v.type.includes("Cone")) drawTruncatedCone(size);
  else if (v.type.includes("Shield")) drawShield(size);
  else if (v.type.includes("Submarine")) drawUnderwaterCone(size);
  else if (v.type.includes("Crater")) drawCraterCluster(size);
  else if (v.type.includes("Caldera")) drawCaldera(size);
  else if (v.type.includes("Maars")) drawMaars(size);
  else if (v.type.includes("Subglacial")) drawSubglacial(size);
  else drawUnknown(size);

  // Effetti sopra
  if (v.status.includes("Active")) emitSmoke(size);
  if (v.type.includes("Submarine")) emitBubbles(size);
}

// === Forme vulcaniche ===
function drawTruncatedPyramid(s) {
  fill(200, 100, 60);
  triangle(-s, s, s, s, 0, -s);
}
function drawTruncatedCone(s) {
  fill(230, 140, 90);
  triangle(-s * 0.7, s, s * 0.7, s, 0, -s);
}
function drawShield(s) {
  fill(150, 90, 50);
  ellipse(0, s / 3, s * 2, s);
}
function drawUnderwaterCone(s) {
  fill(20, 100, 200, 220);
  triangle(-s, s / 2, s, s / 2, 0, -s);
}
function drawCraterCluster(s) {
  fill(110);
  for (let i = 0; i < 3; i++) ellipse(random(-s, s), random(-s, s), s / 1.5);
}
function drawCaldera(s) {
  stroke(200);
  strokeWeight(max(1.5, s / 4));
  noFill();
  ellipse(0, 0, s * 2);
  noStroke();
}
function drawMaars(s) {
  fill(100);
  ellipse(0, 0, s * 1.5);
  fill(30);
  ellipse(0, 0, s);
}
function drawSubglacial(s) {
  fill(170, 180, 200);
  triangle(-s, s, s, s, 0, -s);
  fill(255, 255, 255, 180);
  ellipse(0, s * 0.1, s * 1.8, s * 0.9);
}
function drawUnknown(s) {
  fill(100);
  ellipse(0, 0, s * 1.4);
}

// === Effetti animati ===
function emitSmoke(s) {
  push();
  fill(230, 230, 230, 120);
  for (let i = 0; i < 3; i++) {
    let yOff = -s - ((millis() * 0.03 + i * 25) % 20);
    ellipse(random(-s / 2, s / 2), yOff, random(3, 6));
  }
  pop();
}

function emitBubbles(s) {
  push();
  fill(160, 210, 255, 160);
  for (let i = 0; i < 4; i++) {
    let yOff = s / 2 - ((millis() * 0.04 + i * 30) % 30);
    ellipse(random(-s / 3, s / 3), yOff, random(2, 4));
  }
  pop();
}

// === Interazioni ===
function mousePressed() {
  dragging = true;
  prevMouseX = mouseX;
  prevMouseY = mouseY;

  let clicked = null;
  let minDist = 12;
  let closest = Infinity;

  for (let v of volcanoes) {
    let pos = projectCoords(v.lat, v.lon);
    let worldX = width / 2 + offsetX + pos.x * zoomLevel;
    let worldY = height / 2 + offsetY + pos.y * zoomLevel;
    let d = dist(mouseX, mouseY, worldX, worldY);
    if (d < minDist && d < closest) {
      closest = d;
      clicked = v;
    }
  }
  selectedVolcano = clicked;
}

function mouseDragged() {
  if (dragging) {
    offsetX += mouseX - prevMouseX;
    offsetY += mouseY - prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
}
function mouseReleased() { dragging = false; }
function mouseWheel(event) {
  let zoomDelta = event.delta * 0.001;
  zoomLevel = constrain(zoomLevel - zoomDelta, 0.1, 10);
  return false;
}

// === InfoCard & Titolo ===
function drawInfoCard(v) {
  fill(10, 10, 25, 230);
  stroke(100, 150, 250, 150);
  strokeWeight(1);
  rect(30, 60, 330, 180, 12);

  noStroke();
  fill(255);
  textSize(18);
  textAlign(LEFT, TOP);
  text(`🌋 ${v.name}`, 45, 75);

  textSize(14);
  fill(220);
  text(`Paese: ${v.country}`, 45, 105);
  text(`Località: ${v.location}`, 45, 125);
  text(`Elevazione: ${v.elevation} m`, 45, 145);
  text(`Stato: ${v.status}`, 45, 165);
  text(`Ultima eruzione: ${v.lastEruption}`, 45, 185);
  text(`Tipo: ${v.type}`, 45, 205);
}

function drawTitle() {
  noStroke();
  fill(255);
  textAlign(CENTER);
  textSize(18);
  text("🌋 ATLANTE VISIVO DEI VULCANI (2005–2025)", width / 2, 30);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

let table;
let volcano;
let volcanoName;

function preload() {
  const params = new URLSearchParams(window.location.search);
  volcanoName = params.get("name");

  table = loadTable('volcanoes-2025-10-27 - Es.3 - Original Data.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Arial');

  volcano = findVolcano(volcanoName);

  if (!volcano) {
    console.error("Vulcano non trovato:", volcanoName);
  }
}

function draw() {
  background(12, 14, 35);

  if (!volcano) return;

  drawLayout();
}

/* -----------------------------------
   TROVA IL VULCANO
----------------------------------- */

function findVolcano(name) {
  for (let r = 0; r < table.getRowCount(); r++) {
    if (table.getString(r, 'Volcano Name') === name) {
      return {
        name: table.getString(r, 'Volcano Name'),
        country: table.getString(r, 'Country'),
        elevation: table.getString(r, 'Elevation (m)'),
        type: table.getString(r, 'Type'),
        typeCategory: table.getString(r, 'TypeCategory'),
        status: table.getString(r, 'Status'),
        lastEruption: table.getString(r, 'Last Known Eruption')
      };
    }
  }
  return null;
}

/* -----------------------------------
   LAYOUT A DUE COLONNE
----------------------------------- */

function drawLayout() {
  const leftX = width * 0.25;
  const centerY = height * 0.55;
  const infoX = width * 0.50;

  // ————————————————
  // FORMA DEL VULCANO GRANDE
  // ————————————————
  push();
  translate(leftX, centerY);
  scale(8);  
  drawBigShape(volcano);
  pop();

  // ————————————————
  // TESTI
  // ————————————————
  let y = height * 0.12;

  // Titolone (80px circa)
  fill(255);
  textAlign(LEFT, TOP);
  textSize(84);
  textStyle(BOLD);
  text(volcano.name, infoX, y);
  y += 110;

  // Paese (40px)
  textSize(42);
  textStyle(BOLD);
  fill(200, 210, 255);
  text(volcano.country, infoX, y);
  y += 80;

  // Informazioni (30px)
  textSize(30);
  fill(220);

  const spacing = 55;
  printInfo("Elevazione", volcano.elevation + " m", infoX, y); y += spacing;
  printInfo("Tipo", volcano.type, infoX, y); y += spacing;
  printInfo("Categoria", volcano.typeCategory, infoX, y); y += spacing;
  printInfo("Stato", volcano.status, infoX, y); y += spacing;
  printInfo("Ultima eruzione", volcano.lastEruption, infoX, y);
}

function printInfo(label, value, x, y) {
  fill(170);
  textStyle(BOLD);
  text(label + ":", x, y);

  fill(230);
  textStyle(NORMAL);
  text(value, x + 260, y);
}

/* -----------------------------------
   FORME GRANDE
----------------------------------- */

function drawBigShape(v) {
  let s = 20;

  if (v.typeCategory.includes("Stratovolcano")) drawPyramid(s);
  else if (v.typeCategory.includes("Cone")) drawCone(s);
  else if (v.typeCategory.includes("Shield")) drawShieldShape(s);
  else if (v.typeCategory.includes("Submarine")) drawUnderwaterCone(s);
  else if (v.typeCategory.includes("Crater")) drawCraterClusterBig(s);
  else if (v.typeCategory.includes("Caldera")) drawCalderaBig(s);
  else if (v.typeCategory.includes("Maars")) drawMaarsBig(s);
  else if (v.typeCategory.includes("Subglacial")) drawSubglacialBig(s);
  else drawUnknownBig(s);
}

// — Forme —
function drawPyramid(s) {
  fill(200, 110, 70);
  noStroke();
  triangle(-s, s, s, s, 0, -s);
}
function drawCone(s) {
  fill(230, 150, 90);
  triangle(-s*0.7, s, s*0.7, s, 0, -s);
}
function drawShieldShape(s) {
  fill(160, 90, 50);
  ellipse(0, s/3, s*2, s);
}
function drawUnderwaterCone(s) {
  fill(40, 120, 220);
  triangle(-s, s/2, s, s/2, 0, -s);
}
function drawCraterClusterBig(s) {
  fill(120);
  ellipse(-s*0.4, 0, s*1.1);
  ellipse(s*0.4, 0, s*1.1);
  ellipse(0, -s*0.4, s*1.1);
}
function drawCalderaBig(s) {
  stroke(150);
  strokeWeight(4);
  noFill();
  ellipse(0, 0, s*3);
  noStroke();
}
function drawMaarsBig(s) {
  fill(130);
  ellipse(0, 0, s*2.5);
  fill(30);
  ellipse(0, 0, s*1.7);
}
function drawSubglacialBig(s) {
  fill(180, 190, 210);
  triangle(-s, s, s, s, 0, -s);
  fill(255, 255, 255, 180);
  ellipse(0, 0, s*2.6, s*1.4);
}
function drawUnknownBig(s) {
  fill(100);
  ellipse(0, 0, s * 2.4);
}

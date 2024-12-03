let visualLocRel = false;
let visualLocObj = false;
let visualOrg = false;
let visualCircuit = false;
let visualSharedMem = false;
let visualSharedInt = false;
let visualSharedExp = false;
let visualSharedCause = false;

let chaosVarX;
let chaosVarY;
let chaosMultiplier;
let chaosInverter;

function drawLocLines(p){
    p.push();
    let centerX = p.width / 2;
    let centerY = p.height / 2;
    let numLines = 200;
    let radius = 50;

    for (let i = 0; i < numLines; i++) {
        let angle = p.map(i, 0, numLines, 0, p.TWO_PI);
        let x1 = centerX + p.cos(angle) * radius * chaosVarX;
        let y1 = centerY + p.sin(angle) * radius * chaosVarY;
        let x2 = centerX + p.cos(angle) * (radius + 20);
        let y2 = centerY + p.sin(angle) * (radius + 15);
        p.line(x1, y1, x2, y2);
    }
    p.pop();
}

function drawCircuit(p){
    p.push();
    p.fill(75);
    p.noStroke();
    let centerX = p.width / 2;
    let centerY = p.height / 2;
    let numCircles = 5;
    let radius = 87.5;

    for (let i = 0; i < numCircles; i++) {
        let angle = p.map(i, 0, numCircles, 0, p.TWO_PI);
        let x1 = centerX + p.cos(angle) * radius;
        let y1 = centerY + p.sin(angle) * radius;
        p.circle(x1, y1, 8);
    }
    p.pop();
}

function drawTree(p){
    p.push();
    let centerX = p.width / 2;
    let centerY = p.height / 2;
    let numCurves = 30;
    let curveLength = 50*chaosVarY;
    let maxOffset = 50*chaosMultiplier;

    for (let i = 0; i < numCurves; i++) {
        let t = p.map(i, 0, numCurves - 1, -1, 1);
        let xOffset = t * maxOffset;
        
        let startX = centerX;
        let startY = centerY;
        let controlX1 = centerX + xOffset * 1.5 * chaosVarX;
        let controlY1 = centerY + curveLength * 0.5 * chaosVarY;
        let controlX2 = centerX + xOffset * 1.5 * chaosVarX;
        let controlY2 = centerY + curveLength * chaosVarY;
        let endX = centerX;
        let endY = centerY + 150;

        if (visualSharedExp == true){
            p.beginShape();
            p.vertex(startX, startY);
            p.bezierVertex(controlX2, controlY2, p.width/2, p.height/2, endX, endY);
            p.endShape(p.CLOSE);
        }
        
        if (visualSharedMem == true){
            p.noFill();
            p.beginShape();
            p.vertex(startX, startY);
            p.bezierVertex(controlX1*chaosMultiplier, controlY1/1.5, controlX1, controlY1/0.9*chaosMultiplier, endX, endY*0.2);
            p.endShape();
        }
    }
    p.pop();
}

function drawHourglass(p) {
    p.push();
    let centerX = p.width / 2;
    let centerY = p.height / 2;
    let teardropWidth = 100;
    let teardropHeight = 150;

    let topX = centerX * chaosMultiplier * chaosVarX;
    let topY = centerY - teardropHeight / chaosVarY;
    let lcX = centerX - teardropWidth / 2;
    let lcY = centerY - teardropHeight / 2;
    let rcX = centerX + teardropWidth / chaosMultiplier;
    let rcY = centerY - teardropHeight / 4;
    let bX1 = centerX - teardropWidth / 4;
    let bX2 = centerX + teardropWidth / 4;
    let bY = centerY + teardropHeight / 2;

    p.beginShape();
    p.vertex(topX, topY);
    p.bezierVertex(lcX, lcY, rcX, rcY, bX1, bY);
    p.line(bX1, bY, bX2, bY);
    p.bezierVertex(rcX, rcY, lcX, lcY, topX, topY);
    p.bezierVertex(-lcX + 2 * centerX, lcY, -rcX + 2 * centerX, rcY, -bX1 + 2 * centerX, bY);
    p.line(-bX1 + 2 * centerX, bY, -bX2 + 2 * centerX, bY);
    p.bezierVertex(-rcX + 2 * centerX, rcY, -lcX + 2 * centerX, lcY, topX, topY);
    p.endShape(p.CLOSE);
    p.pop();
}

function sharedCauseGlass(p) {
    p.fill(255);
    p.circle(p.width/2, p.height/2, 20);
    
    p.line(p.width/2, p.height/2, p.width/2-50, p.height/2+(p.height/2*chaosMultiplier/1.8));
    p.circle(p.width/2-50, p.height/2+(p.height/2*chaosMultiplier/2+10), 10);
    p.line(p.width/2, p.height/2, p.width/2+50, p.height/2+(p.height/2*chaosMultiplier/1.8));
    p.circle(p.width/2+50, p.height/2+(p.height/2*chaosMultiplier/2+10), 10);
}
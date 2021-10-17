var rMinimum = 100;
var rMinimumMin = 10;
var rMinimumMax = 300;
var rMaximum = 300;
var rMaximumMin = rMinimumMax;
var rMaximumMax = rMinimumMax+300;
var layers = 10;
var layerSpacing = 5;
var segments = 50;
var noiseMaximum = 1;
var noiseMaximumMin = 0;
var noiseMaximumMax = 5;
var noiseMaximumStep = 0.1;
var zoffDegree = 0;
var zoffDegreeMin = 0;
var zoffDegreeMax = 0.1;
var zoffDegreeStep = 0.001;
var realTime = false;

var visible = true;
var gui;

var vertices = [];
var layer = [];

function setup(){
    createCanvas(windowWidth, windowHeight, WEBGL);
    createEasyCam();
    document.oncontextmenu = ()=>false;
    noiseSeed(99);

    gui = createGui('Shape Settings');
    gui.addGlobals('rMinimum', 'rMaximum', 'layers', 'layerSpacing', 'segments', 'noiseMaximum', 'zoffDegree', 'realTime');

    generateVertices();
    //noLoop();
}

function draw(){
    background(0,0,0);

    if(realTime){
        noFill();
        stroke(255); 
        strokeWeight(0.5);

        realTimeView();
    }
    else{
        displayGeometry(vertices);
    }
    
    
}

function generateVertices(){
    var zoff = 0;
    for(let l=0; l<layers; l++){
        layer = new Array();
        translate(0, 0, layerSpacing);
        //beginShape()
        for(let a=0; a<TWO_PI; a+=(TWO_PI/segments)){
            var xoff = map(cos(a), -1, 1, 0, noiseMaximum);
            var yoff = map(sin(a), -1, 1, 0, noiseMaximum);
            var roff = map(noise(xoff, yoff, zoff), 0, 1, rMinimum, rMaximum)
            var x = roff * cos(a);
            var y = roff * sin(a);
            //vertex(x,y);
            layer.push({x:x, y:y, z:layerSpacing*l});
        }
        //endShape(CLOSE);
        zoff += zoffDegree;
        vertices.push(layer);
    }
}

function realTimeView(){
    var zoff = 0;
    for(let l=0; l<layers; l++){
        translate(0, 0, layerSpacing);
        beginShape()
        for(let a=0; a<TWO_PI; a+=(TWO_PI/segments)){
            var xoff = map(cos(a), -1, 1, 0, noiseMaximum);
            var yoff = map(sin(a), -1, 1, 0, noiseMaximum);
            var roff = map(noise(xoff, yoff, zoff), 0, 1, rMinimum, rMaximum)
            var x = roff * cos(a);
            var y = roff * sin(a);
            vertex(x,y);
        }
        endShape(CLOSE);
        zoff += zoffDegree;
    }
}

function displayGeometry(verts){
    stroke(0);
    strokeWeight(0.25);
    fill(200);

    for(let l=0; l<verts.length; l++){
        for(let v=0; v<verts[l].length; v++){
            if(l>0 && v>0){
                beginShape();
                vertex(verts[l][v].x,verts[l][v].y, verts[l][v].z);
                vertex(verts[l][v-1].x,verts[l][v-1].y, verts[l][v-1].z);
                vertex(verts[l-1][v-1].x,verts[l-1][v-1].y, verts[l-1][v-1].z);
                vertex(verts[l-1][v].x,verts[l-1][v].y, verts[l-1][v].z);
                endShape();

                if(v==verts[l].length-1){
                    beginShape();
                    vertex(verts[l][v].x,verts[l][v].y, verts[l][v].z);
                    vertex(verts[l][0].x,verts[l][0].y, verts[l][0].z);
                    vertex(verts[l-1][0].x,verts[l-1][0].y, verts[l-1][0].z);
                    vertex(verts[l-1][v].x,verts[l-1][v].y, verts[l-1][v].z);
                    endShape();
                }

            }
        }
    }
    //CAP oFF SHAPE
    beginShape();
    for(let b=0; b<verts[0].length; b++){
        vertex(verts[0][b].x, verts[0][b].y);
    }
    endShape(CLOSE);
}

function keyPressed() {
    if(!realTime){
        vertices = new Array();
        generateVertices();
    }
}
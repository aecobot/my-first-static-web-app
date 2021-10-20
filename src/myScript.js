var layers = [];
var segments = 100;
var xnoiseMaximum = 1;
var ynoiseMaximum = 1;
var rMinimum = 100;
var rMaximum = 300;
var layerCount = 10;
var zdelta = 0.05;
var seed = 1;
var gStart = 150;
var gEnd = 250;
var text;

var canvasLayer = document.getElementById("myCanvas");
canvasLayer.style.background = "black";

var shapeSettings = QuickSettings.create(50, 50, "Icon Shape")
.addNumber("Seed", 1, 65536, seed, 1, function(value) { seed = value; project.clear(); generateLogo();})
.addRange("Shape segments", 3, 360, segments, 1, function(value) { segments = value; project.clear(); generateLogo();})
.addRange("Min radius", 1, 200, rMinimum, 1, function(value) { rMinimum = value; shapeSettings.setRangeParameters("Max radius", value, 500, 1); shapeSettings.setValue("Max radius", rMaximum); project.clear(); generateLogo();})
.addRange("Max radius", rMinimum, 500, rMaximum, 1, function(value) { rMaximum = value; project.clear(); generateLogo();})
.addRange("Layers", 1, 100, layerCount, 1, function(value) { layerCount = value; project.clear(); generateLogo();})
.addRange("X noise max", 0, 10, xnoiseMaximum, 0.1, function(value) { xnoiseMaximum = value; project.clear(); generateLogo();})
.addRange("Y noise max", 0, 10, ynoiseMaximum, 0.1, function(value) { ynoiseMaximum = value; project.clear(); generateLogo();})
.addRange("Z noise step", 0, 0.2, zdelta, 0.001, function(value) { zdelta = value; project.clear(); generateLogo();})
.addButton("Download", function(value) {download();}); 

var colorSettings = QuickSettings.create(300, 50, "Icon Color")
.addRange("Gradient start", 0, 360, gStart, 0.1, function(value) { gStart = value; project.clear(); generateLogo();})
.addRange("Gradient end", 0, 360, gEnd, 0.1, function(value) { gEnd = value; project.clear(); generateLogo();})
.addBoolean("Light background", 0, function(value) {if(value){canvasLayer.style.background = "black";} else {canvasLayer.style.background = "white";}});

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function generateLogo(){
    noise.seed(seed);
    var myPath;
    var zoff = 0;
    for(var l=0; l<layerCount; l++){
        myPath = new Path();
        myPath.closed = true;
        //myPath.strokeColor = new Color('hsb(0, 0, 0, ' + map_range(l,0,layerCount,0,360) + ')')
        myPath.strokeColor = { hue: map_range(l,0,layerCount,gStart,gEnd), saturation: 1, brightness: 1 };
        for(var a=0; a<Math.PI*2; a+=((Math.PI*2)/segments)){
            var xoff = map_range((Math.cos(a)), -1, 1, 0, xnoiseMaximum);
            var yoff = map_range((Math.sin(a)), -1, 1, 0, ynoiseMaximum);
            var roff = map_range(noise.perlin3(xoff, yoff, zoff), -1, 1, rMinimum, rMaximum);
            var x = roff * Math.cos(a);
            var y = roff * Math.sin(a);
            myPath.add(new Point(x, y));
        }
        zoff += zdelta;
        myPath.position = view.center;
        layers.push(myPath);
    }

    generateText();
}

function download() {
    var fileName = "abit.svg"
    var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));
    var link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
}

function generateText(){
    text = new PointText({
        point: [window.innerWidth/2, window.innerHeight/2],
        content: 'ambit',
        fillColor: 'white',
        fontFamily: 'Montserrat',
        fontWeight: 'bold',
        fontSize: 30
    });
}

function onMouseDrag(event) {
	text.point = event.point;
}

generateLogo();

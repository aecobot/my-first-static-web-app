import * as THREE from './threejs/build/three.module.js';
import { OBJExporter } from './threejs/examples/jsm/exporters/OBJExporter.js';
import { OrbitControls } from './threejs/examples/jsm/controls/OrbitControls.js';

let seed = 1;
let segments = 6;
let rMinimum = 1;
let rMaximum = 1;
let layerCount = 4;
let layerHeight = 1;
let xNoiseMaximum = 0;
let yNoiseMaximum = 0;
let zdelta = 0;

let line;
let mesh;

var shapeSettings = QuickSettings.create(50, 50, "Icon Shape")
.addNumber("Seed", 1, 65536, seed, 1, function(value) { seed = value; scene.remove(line, mesh); setGeometry();})
.addRange("Shape segments", 3, 360, segments, 1, function(value) { segments = value; scene.remove(line, mesh); setGeometry();})
.addRange("Radius minimum", 1, 100, rMinimum, 1, function(value) { rMinimum = value; scene.remove(line, mesh); setGeometry();})
.addRange("Radius maximum", 1, 300, rMaximum, 1, function(value) { rMaximum = value; scene.remove(line, mesh); setGeometry();})
.addRange("Layer count", 2, 100, layerCount, 1, function(value) { layerCount = value; scene.remove(line, mesh); setGeometry();})
.addRange("Layer height", 0.01, 3, layerHeight, 0.05, function(value) { layerHeight = value; scene.remove(line, mesh); setGeometry();})
.addRange("X noise", 0, 5, xNoiseMaximum, 0.1, function(value) { xNoiseMaximum = value; scene.remove(line, mesh); setGeometry();})
.addRange("Y noise", 0, 5, yNoiseMaximum, 0.1, function(value) { yNoiseMaximum = value; scene.remove(line, mesh); setGeometry();})
.addRange("Z delta", 0, 1, zdelta, 0.01, function(value) { zdelta = value; scene.remove(line, mesh); setGeometry();})
.addButton("Download", function(value) {download();}); 

const canvas = document.querySelector('#c');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize( window.innerWidth, window.innerHeight );
const controls = new OrbitControls( camera, renderer.domElement );

setGeometry();

camera.position.z = 10;

//line.geometry.attributes.position.needsUpdate = true;
controls.update();

const exporter = new OBJExporter();
const result = exporter.parse( scene );

const animate = function () {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
};

animate();

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// function generateVertices(){
//     let vertices = [];
//     noise.seed(seed);
//     var zoff = 0;
//     for(let l=1; l<=layerCount; l++){
//         for(let a=0; a<2*Math.PI; a+=((2*Math.PI)/segments)){
//             var xoff = map_range(Math.cos(a), -1, 1, 0, xNoiseMaximum);
//             var yoff = map_range(Math.sin(a), -1, 1, 0, yNoiseMaximum);
//             var roff = map_range(noise.perlin3(xoff, yoff, zoff), 0, 1, rMinimum, rMaximum)
//             var x = roff * Math.cos(a);
//             var y = roff * Math.sin(a);
//             vertices.push({x:x, y:y, z:l*layerHeight});
//         }
//         zoff += zdelta;
//     }
//     return vertices;
// }

function generatePoints(){
    const points = new Float32Array(segments * layerCount * 3);
    noise.seed(seed);
    var zoff = 0;
    for(let l=0; l<layerCount; l++){
        for(let a=0; a<2*Math.PI; a+=((2*Math.PI)/segments)){
            var xoff = map_range(Math.cos(a), -1, 1, 0, xNoiseMaximum);
            var yoff = map_range(Math.sin(a), -1, 1, 0, yNoiseMaximum);
            var roff = map_range(noise.perlin3(xoff, yoff, zoff), -1, 1, rMinimum, rMaximum);
            var x = roff * Math.cos(a).toFixed(3);
            var y = roff * Math.sin(a).toFixed(3);
            points[((l*segments) + Math.round(a/(2*Math.PI)*segments)) * 3] = x;
            points[((l*segments) + Math.round(a/(2*Math.PI)*segments)) * 3 + 1] = y;
            points[((l*segments) + Math.round(a/(2*Math.PI)*segments)) * 3 + 2] = l*layerHeight;
        }
        zoff += zdelta;
    }
    //console.log(points);
    return points;
}

function generateVerts(p){
    const vertices = new Float32Array(segments * (layerCount-1) * 12);
    let j = 0;
    for(let i = 0; i<p.length - (segments*3); i+=3){

        //Add the vertex
        vertices[j++] = p[i];
        vertices[j++] = p[i+1];
        vertices[j++] = p[i+2];

        //And the vertex above that vertex
        vertices[j++] = p[i + (segments*3)];
        vertices[j++] = p[i + (segments *3) +1];
        vertices[j++] = p[i + (segments *3) +2];

        //If this is the last vertex in the layer, go back to the first of the layer, and the one above that
        if((i + 3) % (segments*3) == 0){
            vertices[j++] = p[(i+3) - (segments*3)];
            vertices[j++] = p[(i+4) - (segments*3)];
            vertices[j++] = p[(i+5) - (segments*3)];

            vertices[j++] = p[i+3];
            vertices[j++] = p[i+4];
            vertices[j++] = p[i+5];
        }
        //Otherwise, just go to the next vertex and the one above that
        else{
            vertices[j++] = p[i+3];
            vertices[j++] = p[i+4];
            vertices[j++] = p[i+5];

            vertices[j++] = p[i+ (segments *3) +3];
            vertices[j++] = p[i+ (segments *3) +4];
            vertices[j++] = p[i+ (segments *3) +5];
        }
    }
    //console.log(vertices);
    return vertices;
}

function generateIndexes(){
    const indices = [];

    for(let i=0; i<segments*(layerCount-1); i++){
        indices.push(i*4);
        indices.push(i*4+1);
        indices.push(i*4+2);

        indices.push(i*4+2);
        indices.push(i*4+1);
        indices.push(i*4+3);
    }

    //console.log(indices);
    return indices;
}

function generateFaces(v){
    let faces = new Float32Array(segments * (layerCount - 1) * 6);
    for(let i=0; i<faces.length/6; i++){
        faces[i*6] = i;
        faces[i*6 + 1] = (i + 1) % segments;
        faces[i*6 + 2] = i + segments;

        faces[i*6 + 3] = i + segments;
        faces[i*6 + 4] = (i + 1) % segments;
        faces[i*6 + 5] = (i + 1) % segments + segments;

    }

    console.log(faces);
    return faces;
}

function triangulate(v){
    let tris = new Float32Array((segments)*(layerCount-1)*18);
    let t = -1;
    for(let i=0; i<v.length; i++){
        let vertNum = i;
        let layerNum = Math.floor(vertNum/segments);
        let vertIdx = vertNum%segments

        if(layerNum==0){
            if(vertIdx == segments-1){
                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i-segments+1].x;
                tris[++t] = v[i-segments+1].y;
                tris[++t] = v[i-segments+1].z;
                tris[++t] = v[i+segments].x;
                tris[++t] = v[i+segments].y;
                tris[++t] = v[i+segments].z;
            }
            else{
                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i+1].x;
                tris[++t] = v[i+1].y;
                tris[++t] = v[i+1].z;
                tris[++t] = v[i+segments].x;
                tris[++t] = v[i+segments].y;
                tris[++t] = v[i+segments].z;
            }
        }
        else if(layerNum == layerCount-1){
            if(vertIdx == 0){
                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i+segments-1].x;
                tris[++t] = v[i+segments-1].y;
                tris[++t] = v[i+segments-1].z;
                tris[++t] = v[i-segments].x;
                tris[++t] = v[i-segments].y; 
                tris[++t] = v[i-segments].z; 
            }
            else{
                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i-1].x;
                tris[++t] = v[i-1].y;
                tris[++t] = v[i-1].z;
                tris[++t] = v[i-segments].x;
                tris[++t] = v[i-segments].y; 
                tris[++t] = v[i-segments].z;                  
            }
        }
        else{
            if(vertIdx == 0){
                // tris[++t] = v[i].x;
                // tris[++t] = v[i].y;
                // tris[++t] = v[i].z;
                // tris[++t] = v[i+1].x;
                // tris[++t] = v[i+1].y;
                // tris[++t] = v[i+1].z;
                // tris[++t] = v[i+segments].x;
                // tris[++t] = v[i+segments].y;
                // tris[++t] = v[i+segments].z;

                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i+segments-1].x;
                tris[++t] = v[i+segments-1].y;
                tris[++t] = v[i+segments-1].z;
                tris[++t] = v[i-segments].x;
                tris[++t] = v[i-segments].y; 
                tris[++t] = v[i-segments].z; 
            }
            else if(vertIdx == segments-1){
                // tris[++t] = v[i].x;
                // tris[++t] = v[i].y;
                // tris[++t] = v[i].z;
                // tris[++t] = v[i+1].x;
                // tris[++t] = v[i+1].y;
                // tris[++t] = v[i+1].z;
                // tris[++t] = v[i-segments+1].x;
                // tris[++t] = v[i-segments+1].y;
                // tris[++t] = v[i-segments+1].z;

                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i-1].x;
                tris[++t] = v[i-1].y;
                tris[++t] = v[i-1].z;
                tris[++t] = v[i-segments].x;
                tris[++t] = v[i-segments].y;  
                tris[++t] = v[i-segments].z;  
            }
            else{
                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i+1].x;
                tris[++t] = v[i+1].y;
                tris[++t] = v[i+1].z;
                tris[++t] = v[i+segments].x;
                tris[++t] = v[i+segments].y;
                tris[++t] = v[i+segments].z;

                tris[++t] = v[i].x;
                tris[++t] = v[i].y;
                tris[++t] = v[i].z;
                tris[++t] = v[i-1].x;
                tris[++t] = v[i-1].y;
                tris[++t] = v[i-1].z;
                tris[++t] = v[i-segments].x;
                tris[++t] = v[i-segments].y;  
                tris[++t] = v[i-segments].z;                  
            }
        }
    }
    return tris;
}

function download() {
    // var fileName = "export.obj"
    // var url = "data:image/svg+xml;utf8," + encodeURIComponent(result);
    // var link = document.createElement("a");
    // link.download = fileName;
    // link.href = url;
    // link.click();

    console.log(result);
}

function setGeometry() {
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute(generateVerts(generatePoints()), 3 ) );
    geometry.setIndex(generateIndexes());

    //geometry = new THREE.BoxGeometry(10, 10, 10);
    let material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    //material = new THREE.MeshPhongMaterial({color: 0x44aa88});
    material.side = THREE.DoubleSide;
    let wireframe = new THREE.WireframeGeometry( geometry );
    line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    
    mesh = new THREE.Mesh(geometry, material);

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 1, 8);


    const helper = new THREE.DirectionalLightHelper(light);
    //scene.add(helper);
    //scene.add(light);
    scene.add( line );
    scene.add( mesh );
}




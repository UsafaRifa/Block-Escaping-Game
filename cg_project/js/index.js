
var container, scene, camera, renderer;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock;

var movingCube;
var collideMeshList = [];
var cubes = [];
var message = document.getElementById("message");
var crash = false;
var score = 0;
var scoreText = document.getElementById("score");
var id = 0;
var crashId = " ";
var lastCrashId = " ";
var gameOver = false;

init();
animate();

function init() {
    
    scene = new THREE.Scene();
    
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, screenWidth / screenHeight, 1, 20000);
    camera.position.set(0, 170, 400);

Detector={
    webgl: ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )()
}
    
    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } else {
        renderer = new THREE.CanvasRenderer();
    }

    renderer.setSize(screenWidth * 0.85, screenHeight * 0.85);
    container = document.getElementById("ThreeJS");
    container.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);
    

  
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(-250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(-300, -1, 200));
    material = new THREE.LineBasicMaterial({
        color: 0x6699FF, linewidth: 5, fog: true
    });
    var line1 = new THREE.Line(geometry, material);
    scene.add(line1);
    geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(250, -1, -3000));
    geometry.vertices.push(new THREE.Vector3(300, -1, 200));
    var line2 = new THREE.Line(geometry, material);
    scene.add(line2);


    var cubeGeometry = new THREE.CubeGeometry(50, 25, 60, 25, 25, 5);
    var wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: false
    });
    movingCube = new THREE.Mesh(cubeGeometry, wireMaterial);
    movingCube.position.set(0, 25, -20);
    scene.add(movingCube);

}
  
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);

}

function update() {
    var delta = clock.getDelta();
    var moveDistance = 200 * delta; // block ta koto speed e move korbe
    // code for camera rotation and keyboard work
    if (keyboard.pressed("left") || keyboard.pressed("A")) {
        if (movingCube.position.x > -270)
            movingCube.position.x -= moveDistance;
        if (camera.position.x > -150) {
            camera.position.x -= moveDistance * 0.6;
            if (camera.rotation.z > -5 * Math.PI / 180) {
                camera.rotation.z -= 0.2 * Math.PI / 180;
            }
        }
    }
    
    if (keyboard.pressed("right") || keyboard.pressed("D")) {
        if (movingCube.position.x < 270)
            movingCube.position.x += moveDistance;
        if (camera.position.x < 150) {
            camera.position.x += moveDistance * 0.6;
            if (camera.rotation.z < 5 * Math.PI / 180) {
                camera.rotation.z += 0.2 * Math.PI / 180;
            }
        }
    }
    if (keyboard.pressed("up") || keyboard.pressed("W")) {
        movingCube.position.z -= moveDistance;
    }
    if (keyboard.pressed("down") || keyboard.pressed("S")) {
        movingCube.position.z += moveDistance;
    }

    
    var originPoint = movingCube.position.clone();

    for (var vertexIndex = 0; vertexIndex < movingCube.geometry.vertices.length; vertexIndex++) {
        
        var localVertex = movingCube.geometry.vertices[vertexIndex].clone();
        
        var globalVertex = localVertex.applyMatrix4(movingCube.matrix);
        var directionVector = globalVertex.sub(movingCube.position);

        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(collideMeshList);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            crash = true;
            crashId = collisionResults[0].object.name;
            break;
        }
        crash = false;
    }
    

if(!gameOver)
{
    if (crash) {

        movingCube.material.color.setHex(0x346386);
        
        if (crashId !== lastCrashId) {
            score -= 50;
            lastCrashId = crashId;
        }

        document.getElementById('explode_sound').play()
    } else {
        
        movingCube.material.color.setHex(0x00ff00);
    }

    if (Math.random() < 0.03 && cubes.length < 30) {
        makeRandomCube();
    }

    for (i = 0; i < cubes.length; i++) {
        if (cubes[i].position.z > camera.position.z) {
            scene.remove(cubes[i]);
            cubes.splice(i, 1);
            collideMeshList.splice(i, 1);
        } else {
            cubes[i].position.z += 10;
        }
    
    }
   
    score += 0.1;
    scoreText.innerText = "Points:" + Math.floor(score);
    
    
    if (score < 0) {
        console.log("Game Over");
        
      
        var gameOverText = document.createElement("div");
        gameOverText.style.position = "absolute";
        gameOverText.style.width = "100%";
        gameOverText.style.textAlign = "center";
        gameOverText.style.fontSize = "50px";
        gameOverText.style.color = "red";
        gameOverText.innerHTML = "Game Over";
        document.body.appendChild(gameOverText);
        
        gameOver= true;
        
    }
    

}
    }
   



function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function makeRandomCube() {
    var a = 1 * 50,
        b = getRandomInt(1, 3) * 50,
        c = 1 * 50;
    var geometry = new THREE.CubeGeometry(a, b, c);
    var material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        size: 1
    });
    
    
    var object = new THREE.Mesh(geometry, material);
    var box = new THREE.BoxHelper(object);
    box.material.color.setHex(0xff0000);
    box.position.x = getRandomArbitrary(-250, 250);
    box.position.y = 1 + b / 2;
    box.position.z = getRandomArbitrary(-800, -1200);
    cubes.push(box);
    box.name = "box_" + id;
    id++;
    collideMeshList.push(box);

    scene.add(box);
}
import {
  Vector3,
  Clock,
  Scene,
  FogExp2,
  WebGLRenderer,
  PerspectiveCamera,
  DirectionalLight,
  MeshPhongMaterial,
  Mesh,
  PlaneGeometry,
  DoubleSide,
  Matrix4,
  Raycaster
} from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';


const UNITWIDTH = 90; // Width of a cubes in the maze
const UNITHEIGHT = 45; // Height of the cubes in the maze
const PLAYERCOLLISIONDISTANCE = 20; // How many units away the player can get from the wall
const PLAYERSPEED = 800.0; // How fast the player moves
const PLAYERROTATIONSPEED = 50; // How fast the player rotates

let clock: Clock;
let camera: PerspectiveCamera;
let controls: PointerLockControls;
let scene: Scene;
let airplane: Scene;
let airplaneCorrection = new Vector3();
let renderer: WebGLRenderer;
let mapSize = 20 * UNITWIDTH;

const collidableObjects: Mesh[] = [];

var loader = new GLTFLoader();

// Flags to determine which direction the player is moving
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let headLeft = false;
let headRight = false;
let headUp = false;
let headDown = false;

// Flag to determine if the player lost the game
let gameOver = false;

// Velocity vectors for the player and dino
const playerVelocity = new Vector3();
const playerHeading = new Vector3();

// HTML elements to be changed
const blocker = document.getElementById('blocker');

const container = document.getElementById('container');

// Get control of the mouse
function getPointerLock() {
  document.onclick = function() {
    container.requestPointerLock();
  };

  document.addEventListener('pointerlockchange', lockChange, false);
}

// Listen for when the pointer lock is activatd and deacivated
function lockChange() {
  if (document.pointerLockElement === container) {
    blocker.style.display = 'none';
  } else {
    if (gameOver) {
      // Doesn't work on CodePen, but will work locally and in UWP app
      //location.reload();
    }
    blocker.style.display = '';
  }
}

// Set up the game
getPointerLock();
init();

// Set up the game
function init() {
  // Set clock to keep track of frames
  clock = new Clock();
  // Create the scene where everything will go
  scene = new Scene();

  // Add some fog for effects
  // scene.fog = new FogExp2(0xcccccc, 0.0015);

  // Set render settings
  renderer = new WebGLRenderer();
  // renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Render to the container
  const container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  // Set camera position and view details
  camera = new PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.y = 50; // Height the camera will be looking from
  camera.position.x = 0;
  camera.position.z = 0;

  // Add the camera to the controller, then add to the scene
  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  listenForPlayerMovement();

  // Add ground plane
  createGround();
  // Add perimeter walls that surround the maze
  createPerimWalls();

  // Add lights to the scene
  addLights();
  
  loader.load(
    '/resources/room_lp_obj.glb',
    (gltf: GLTF) => {
      scene.add(gltf.scene);
    },
    undefined,
    (error: ErrorEvent) => {
      console.error(error);
    }
  );
  loader.load(
    '/resources/airplane2.glb',
    (gltf: GLTF) => {
      airplane = gltf.scene;
      scene.add(gltf.scene);
      airplaneCorrection.x = 0;
      airplaneCorrection.y = -5;
      airplaneCorrection.z = -3;
      console.log(airplane);
    },
    undefined,
    (error: ErrorEvent) => {
      console.error(error);
    }
  );
  

  // Listen for if the window changes sizes
  window.addEventListener('resize', onWindowResize, false);

  animate();
}

// Add event listeners for player movement key presses
function listenForPlayerMovement() {
  // Listen for when a key is pressed
  // If it's a specified key, mark the direction as true since moving
  const onKeyDown = function(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 87: // w
        moveForward = true;
        break;
      
      case 65: // a
        moveLeft = true;
        break;
      
      case 83: // s
        moveBackward = true;
        break;
      
      case 68: // d
        moveRight = true;
        break;
      
      case 69: // e
        moveUp = true;
        break;
      
      case 81: // q
        moveDown = true;
        break;

      case 38: // up
        headUp = true;
        break;

      case 37: // left
        headLeft = true;
        break;

      case 40: // down
        headDown = true;
        break;

      case 39: // right
        headRight = true;
        break;
    }
  };

  // Listen for when a key is released
  // If it's a specified key, mark the direction as false since no longer moving
  const onKeyUp = function(event: KeyboardEvent) {
    switch (event.keyCode) {
      case 87: // w
        moveForward = false;
        break;

      case 65: // a
        moveLeft = false;
        break;

      case 83: // s
        moveBackward = false;
        break;

      case 68: // d
        moveRight = false;
        break;

      case 69: // e
        moveUp = false;
        break;

      case 81: // q
        moveDown = false;
        break;

      case 38: // up
        headUp = false;
        break;

      case 37: // left
        headLeft = false;
        break;

      case 40: // down
        headDown = false;
        break;
        
      case 39: // right
        headRight = false;
        break;
    }
  };

  // Add event listeners for when movement keys are pressed and released
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);
}

// Add lights to the scene
function addLights() {
  const lightOne = new DirectionalLight(0xffffff);
  lightOne.position.set(1, 1, 1);
  scene.add(lightOne);

  const lightTwo = new DirectionalLight(0xffffff, 0.4);
  lightTwo.position.set(1, -1, -1);
  scene.add(lightTwo);
}

// Create the ground plane that the maze sits on top of
function createGround() {
  // Create the ground geometry and material
  const groundGeo = new PlaneGeometry(mapSize, mapSize);
  const groundMat = new MeshPhongMaterial({
    color: 0xa0522d,
    side: DoubleSide
  });

  // Create the ground and rotate it flat
  const ground = new Mesh(groundGeo, groundMat);
  ground.position.set(0, 1, 0);
  ground.rotation.x = degreesToRadians(90);
  scene.add(ground);
}

// Make the four perimeter walls for the maze
function createPerimWalls() {
  const halfMap = mapSize / 2; // Half the size of the map
  let sign = 1; // Used to make an amount positive or negative

  // Loop through twice, making two perimeter walls at a time
  for (let i = 0; i < 2; i++) {
    const perimGeo = new PlaneGeometry(mapSize, UNITHEIGHT);
    // Make the material double sided
    const perimMat = new MeshPhongMaterial({
      color: 0x464646,
      side: DoubleSide
    });
    // Make two walls
    const perimWallLR = new Mesh(perimGeo, perimMat);
    const perimWallFB = new Mesh(perimGeo, perimMat);

    // Create left/right walls
    perimWallLR.position.set(halfMap * sign, UNITHEIGHT / 2, 0);
    perimWallLR.rotation.y = degreesToRadians(90);
    scene.add(perimWallLR);
    collidableObjects.push(perimWallLR);
    // Create front/back walls
    perimWallFB.position.set(0, UNITHEIGHT / 2, halfMap * sign);
    scene.add(perimWallFB);
    collidableObjects.push(perimWallFB);

    sign = -1; // Swap to negative value
  }
}

// Update the camera and renderer when the window changes size
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  render();
  requestAnimationFrame(animate);

  // Get the change in time between frames
  const delta = clock.getDelta();
  // Update our frames per second monitor

  animatePlayer(delta);
}

// Render the scene
function render() {
  renderer.render(scene, camera);
}

// Animate the player camera
function animatePlayer(delta: number) {
  // Gradual slowdown
  playerVelocity.x -= playerVelocity.x * 10.0 * delta;
  playerVelocity.z -= playerVelocity.z * 10.0 * delta;
  playerVelocity.y -= playerVelocity.y * 10.0 * delta;

  playerHeading.x = 0;
  playerHeading.y = 0;
  playerHeading.z = 0;


  // If no collision and a movement key is being pressed, apply movement velocity
  if (detectPlayerCollision() == false) {
    if (moveForward) playerVelocity.z -= PLAYERSPEED * delta;
    if (moveBackward) playerVelocity.z += PLAYERSPEED * delta;
    if (moveLeft) playerHeading.y += PLAYERROTATIONSPEED * delta;
    if (moveRight) playerHeading.y -= PLAYERROTATIONSPEED * delta;
    if (moveUp) playerVelocity.y += PLAYERSPEED * delta;
    if (moveDown) playerVelocity.y -= PLAYERSPEED * delta;
    if (headUp) playerHeading.x -= PLAYERROTATIONSPEED * delta;
    if (headDown) playerHeading.x += PLAYERROTATIONSPEED * delta;
    if (headLeft) playerHeading.z += PLAYERROTATIONSPEED * delta;
    if (headRight) playerHeading.z -= PLAYERROTATIONSPEED * delta;

    controls.getObject().translateX(playerVelocity.x * delta);
    controls.getObject().translateZ(playerVelocity.z * delta);
    controls.getObject().translateY(playerVelocity.y * delta);
    controls.getObject().rotateX(playerHeading.x * delta);
    controls.getObject().rotateY(playerHeading.y * delta);
    controls.getObject().rotateZ(playerHeading.z * delta);
    
    if (airplane) {
      airplane.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );
      airplane.rotation.set(
        camera.rotation.x,
        camera.rotation.y,
        camera.rotation.z
      );
      
      airplane.translateX(airplaneCorrection.x)
      airplane.translateY(airplaneCorrection.y);
      airplane.translateZ(airplaneCorrection.z);
    }
  } else {
    // Collision or no movement key being pressed. Stop movememnt
    playerVelocity.x = 0;
    playerVelocity.z = 0;
    playerVelocity.y = 0;
  }
}

//  Determine if the player is colliding with a collidable object
function detectPlayerCollision() {
  // The rotation matrix to apply to our direction vector
  // Undefined by default to indicate ray should coming from front
  let rotationMatrix;
  // Get direction of camera
  const cameraDirection = controls.getDirection(new Vector3(0, 0, 0)).clone();

  // Check which direction we're moving (not looking)
  // Flip matrix to that direction so that we can reposition the ray
  if (moveBackward) {
    rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationY(degreesToRadians(180));
  } else if (moveLeft) {
    rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationY(degreesToRadians(90));
  } else if (moveRight) {
    rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationY(degreesToRadians(270));
  }

  // Player is moving forward, no rotation matrix needed
  if (rotationMatrix !== undefined) {
    cameraDirection.applyMatrix4(rotationMatrix);
  }

  // Apply ray to player camera
  const rayCaster = new Raycaster(
    controls.getObject().position,
    cameraDirection
  );

  // If our ray hit a collidable object, return true
  if (rayIntersect(rayCaster, PLAYERCOLLISIONDISTANCE)) {
    return true;
  } else {
    return false;
  }
}

// Takes a ray and sees if it's colliding with anything from the list of collidable objects
// Returns true if certain distance away from object
function rayIntersect(ray: Raycaster, distance: number) {
  const intersects = ray.intersectObjects(collidableObjects);
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].distance < distance) {
      return true;
    }
  }
  return false;
}

// Converts degrees to radians
function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

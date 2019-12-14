import {
  Vector3,
  Scene,
  MeshPhongMaterial,
  Mesh,
  PlaneGeometry,
  DoubleSide
} from 'three';
import { GraphicEngine } from './graphics/graphicEngine';


const UNITWIDTH = 90; // Width of a cubes in the maze
const UNITHEIGHT = 45; // Height of the cubes in the maze
const PLAYERSPEED = 800.0; // How fast the player moves
const PLAYERROTATIONSPEED = 50; // How fast the player rotates

let airplane: Scene;
let airplaneCorrection = new Vector3(0, -5, -3);
let mapSize = 20 * UNITWIDTH;
let engine: GraphicEngine;

const collidableObjects: Mesh[] = [];

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

// Velocity vectors for the player and dino
const playerVelocity = new Vector3();
const playerHeading = new Vector3();

// Set up the game
init();

function initGraphics() {
  engine = new GraphicEngine();

  engine.loadModel('/resources/room_lp_obj.glb')
    .then((room: Scene) => {
      engine.addToScene(room);
    });

  engine.loadModel('/resources/airplane2.glb')
    .then((plane: Scene) => {
      engine.addToScene(plane);
      airplane = plane;
    });
}

// Set up the game
function init() {

  initGraphics();

  listenForPlayerMovement();

  // Add ground plane
  createGround();
  // Add perimeter walls that surround the maze
  createPerimWalls();

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
  ground.rotation.x = Math.PI / 2;
  engine.addToScene(ground);
  // scene.add(ground);
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
    perimWallLR.rotation.y = Math.PI / 2;
    engine.addToScene(perimWallLR);
    // scene.add(perimWallLR);
    collidableObjects.push(perimWallLR);
    // Create front/back walls
    perimWallFB.position.set(0, UNITHEIGHT / 2, halfMap * sign);
    engine.addToScene(perimWallFB);
    // scene.add(perimWallFB);
    collidableObjects.push(perimWallFB);

    sign = -1; // Swap to negative value
  }
}

function animate() {
  render();
  requestAnimationFrame(animate);

  // Get the change in time between frames
  const delta = engine.getClockDelta();
  // Update our frames per second monitor

  animatePlayer(delta);
}

// Render the scene
function render() {
  engine.render();
  // renderer.render(scene, camera);
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

  engine.moveControls(new Vector3(
    playerVelocity.x * delta,
    playerVelocity.y * delta,
    playerVelocity.z * delta
  ), new Vector3(
    playerHeading.x * delta,
    playerHeading.y * delta,
    playerHeading.z * delta
  ))
  
  if (airplane) {
    engine.updateObject(airplane, engine.getCameraPosition(), engine.getCameraRotation(), airplaneCorrection)
  }
}

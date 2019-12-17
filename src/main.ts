import {
  Vector3,
  Scene,
  MeshPhongMaterial,
  Mesh,
  PlaneGeometry,
  DoubleSide
} from 'three';
import { GraphicEngine } from './graphics/graphicEngine';
import { Control } from './control';
import { World, GSSolver, SplitSolver, NaiveBroadphase, Material, ContactMaterial, Body, Plane, Vec3, Sphere } from 'cannon';
import { Airplane } from './objects/airplane';

const UNITWIDTH = 90; // Width of a cubes in the maze
const UNITHEIGHT = 45; // Height of the cubes in the maze
const MIN_SPEED = 0;
const MAX_SPEED = 100;
const PLAYERSPEED = 10.0; // How fast the player accelerates
const PLAYERROTATIONSPEED = 50; // How fast the player rotates

let airplane: Airplane;
let airplaneCorrection = new Vector3(0, -0.095, -0.04);
// airplaneCorrection.z = airplaneCorrection.z - 1;
let mapSize = 20 * UNITWIDTH;
let engine: GraphicEngine;

let world: World;
let sphereBody: Body;

const collidableObjects: Mesh[] = [];

let control: Control;

// Velocity vectors for the player and dino
let playerVelocity: number = 0;
const deltaPlayerHeading = new Vector3();

// Set up the game
init();

function initGraphics() {
  engine = new GraphicEngine();

  GraphicEngine.loadModel('/resources/room_lp_obj_small.glb')
    .then((room: Scene) => {
      room.scale.multiplyScalar(15)
      engine.addToScene(room);
    });

  airplane = new Airplane();
  airplane.load()
    .then(() => {
      engine.addToScene(airplane.getGraphicModel());
    });


  // engine.loadModel('/resources/airplane2.glb')
  //   .then((plane: Scene) => {
  //     engine.addToScene(plane);
  //     airplane = plane;
  //   });
}

function initDebugger() {
  engine.initDebugger();
}

function initPhysics() {
    // Setup our world
    world = new World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;
    var solver = new GSSolver();
    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;
    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if(split)
        world.solver = new SplitSolver(solver);
    else
        world.solver = solver;
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new NaiveBroadphase();
    // Create a slippery material (friction coefficient = 0.0)
    const physicsMaterial = new Material("slipperyMaterial");
    const physicsContactMaterial = new ContactMaterial(
      physicsMaterial,
      physicsMaterial,
      {
        friction: 0,
        restitution: 0.3
      }
    );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);
    // Create a sphere
    world.addBody(airplane.getPhysicModel())
    // Create a plane
    const groundShape = new Plane();
    const groundBody = new Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);
}

function createObjects() {
  // Add ground plane
  createGround();
  // Add perimeter walls that surround the maze
  createPerimWalls();
}

function initInput() {
  control = new Control();
}

// Set up the game
function init() {
  initGraphics();

  initPhysics();

  createObjects();

  initInput();

  initDebugger();

  animate();
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
    collidableObjects.push(perimWallLR);
    // Create front/back walls
    perimWallFB.position.set(0, UNITHEIGHT / 2, halfMap * sign);
    engine.addToScene(perimWallFB);
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

  world.step(delta);
}

// Render the scene
function render() {
  engine.render();
}

// Animate the player camera
function animatePlayer(delta: number) {
  
  const {acc, heading} = control.getState();

  let modFactor = 0;
  
  if (acc === 0) {
    // Gradual slowdown if not accelerating
    modFactor = playerVelocity * -0.2;
  } else if (acc > 0) {
    //Breaks are weaker than throttle
    modFactor = acc * (PLAYERSPEED * 10);
  } else {
    modFactor = acc * PLAYERSPEED;
  }

  playerVelocity = Math.min(MAX_SPEED, Math.max(MIN_SPEED, playerVelocity + modFactor * delta))

  deltaPlayerHeading.x = heading.x * (PLAYERROTATIONSPEED * delta);
  deltaPlayerHeading.y = heading.y * (PLAYERROTATIONSPEED * delta);
  deltaPlayerHeading.z = heading.z * (PLAYERROTATIONSPEED * delta);

  const vector = engine.camera.getWorldDirection(new Vector3());
  vector.multiplyScalar(playerVelocity);
  
  const phyModel = airplane.getPhysicModel();

  phyModel.force = new Vec3(vector.x, vector.y, vector.z);
  
  engine.testMoveControls(new Vector3(
    phyModel.position.x,
    phyModel.position.y,
    phyModel.position.z,
  ), new Vector3(
    deltaPlayerHeading.x * delta,
    deltaPlayerHeading.y * delta,
    deltaPlayerHeading.z * delta
  ))
  
  if (airplane.isLoaded()) {
    engine.updateObject(airplane.getGraphicModel(), engine.getCameraPosition(), engine.getCameraRotation(), airplaneCorrection);
  }
}

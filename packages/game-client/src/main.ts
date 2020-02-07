import { GraphicEngine } from './graphics/graphicEngine';
import { Keyboard } from './control/keyboard';
import { Airplane } from './objects/airplane';
import { Controller } from './control/controller';
import { Control } from './control/control';
import { PhysicsEngine } from './physics/physicsEngine';
import { Vector } from './types/vector';

const vr = true;

let airplane: Airplane;

let control: Control;
let engine: GraphicEngine;
let physics: PhysicsEngine;

// Set up the game
init();

/**
 * Starts the graphic engine
 */
function initGraphics() {
  engine = new GraphicEngine({
    vr: vr
  });

  airplane = new Airplane(vr);

  // TODO As long as many models could be inserted, the models should be in an array
  // and the load must be over the full array
  airplane.load()
    .then(() => {
      engine.addToSceneAsPlayer(airplane.getGraphicModel(), airplane.corrections);
    });
}

/**
 * Enables the debug in every engine
 */
function initDebugger() {
  engine.initDebugger();
}

/**
 * Starts and configure the physic engine
 */
function initPhysics() {
    const physics = new PhysicsEngine();
    physics.addBody(airplane.getPhysicModel());
}

/**
 * Enables the controls.
 * By now, tow controls are being created, Keyboard for the PC and Controller for the mobile.
 * TODO This must be refactorized. The input must be requested to the user in PC.
 * In android, Controller should be selected automatically
 */
function initInput() {
  // control = new Keyboard();
  control = new Controller();
}

// Set up the game
function init() {
  initGraphics();

  initPhysics();

  initInput();

  initDebugger();

  animate();
}

/**
 * Inits the game loop
 */
function animate() {
  engine.renderer.setAnimationLoop(() => {
    render();
  
    // Get the change in time between frames
    const delta = engine.getClockDelta();
    // Update our frames per second monitor
  
    animatePlayer(delta);
  
    physics.step(delta);
  });
}

/**
 * Render the scene. Wraps the engine method.
 */
function render() {
  engine.render();
}

/**
 * Animate the player camera. This is where update calculations are made.
 */
function animatePlayer(delta: number) {
  
  const {acc, heading} = control.getState();

  const {position, deltaRotation} = airplane.animate(acc, heading, new Vector(engine.camera.getWorldDirection(new Vector().toGraphic())), delta);
  
  engine.moveControls(position.toGraphic(), deltaRotation.toGraphic());
}

declare global {
  interface Window {
    __THREE_DEVTOOLS__: any;
  }
}

import { Scene, PerspectiveCamera, WebGLRenderer, Color, Vector3, DirectionalLight, FogExp2, Mesh, Euler, Clock, AmbientLight, Group } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

/**
 * Wrapper of three library
 */
export class GraphicEngine {
  scene: Scene;
  camera: PerspectiveCamera;
  player: Group;
  renderer: WebGLRenderer;
  controls: PointerLockControls;
  gltfLoader: GLTFLoader;
  clock: Clock;


  /**
   * Creates an instance of GraphicEngine and sets the starting values.
   * 
   * @param {{fog?: boolean, vr?: boolean}} [options={fog: false, vr: false}]
   * @param {boolean} [debug=false]
   */
  constructor(options: {fog?: boolean, vr?: boolean} = {fog: false, vr: false}, debug: boolean = false) {
    const CAMERA_NEAR = 0.001;
    const CAMERA_FAR = 200000;
    const container = document.getElementById('container');

    this.scene = new Scene();
    this.scene.background = new Color(0xbfd1e5);
    if (options.fog) {
      this.scene.fog = new FogExp2(0xcccccc, 0.0015);
    }

    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      CAMERA_NEAR,
      CAMERA_FAR
    );
    // this.camera.position.set(0, 50, 0);

    this.renderer = new WebGLRenderer();
    if (options.fog) {
      this.renderer.setClearColor(this.scene.fog.color);
    }
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    this.player = new Group();
    this.scene.add(this.player);
    this.player.add(this.camera);
    
    container.appendChild(this.renderer.domElement);
    
    this.controls = new PointerLockControls(this.camera, document.body);
    
    this.addLights();
    
    this.clock = new Clock();
    
    if (options.vr) {
      this.renderer.vr.enabled = true;
      document.body.appendChild( VRButton.createButton( this.renderer ) );
    }

    window.addEventListener('resize', this.onWindowResize, false);
  }

  /**
   * Handles the window resize.
   * TODO Review this code. Is making some glitches and is heritage of original PoC
   */
  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  /**
   * Creates the static lights
   */
  private addLights() {
    this.addDirectionalLight(new Vector3(1, 1, 1), 0xffffff);
    this.addDirectionalLight(new Vector3(1, -1, -1), 0xffffff, 0.4);

    const ambientLight = new AmbientLight( 0x707070 );
    this.scene.add(ambientLight);
  }

  /**
   * Helper to create directional light.
   * 
   * @param {Vector3} position
   * @param {number} color
   * @param {number} [intensity]
   */
  private addDirectionalLight(position: Vector3, color: number, intensity?: number) {
    const light = new DirectionalLight(color, intensity);
    light.position.set(position.x, position.y, position.z);
    this.scene.add(light);
  }

  public async loadModels() {
  }

  /**
   * Given the model path returns the promise of the three scene
   *
   * @static
   * @param {string} path
   * @returns {Promise<any>}
   */
  public static loadModel(path: string): Promise<any> {
    const gltfLoader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        path,
        (gltf: GLTF) => {
          resolve(gltf.scene);
        },
        undefined,
        (error: ErrorEvent) => {
          reject(error);
        }
      );
    });
  }

  
  /**
   * Adds an object to the scene
   *
   * @param {(Scene | Mesh)} subScene
   */
  public addToScene(subScene: Scene | Mesh) {
    this.scene.add(subScene);
  }

  /**
   * Adds an object to the player group and applies an optional correction
   *
   * @param {(Scene | Mesh)} playerScene
   * @param {Vector3} [correction]
   */
  public addToSceneAsPlayer(playerScene: Scene | Mesh, correction?: Vector3) {
    this.player.add(playerScene);
    if(correction) {
      playerScene.translateX(correction.x);
      playerScene.translateY(correction.y);
      playerScene.translateZ(correction.z);
    }
  }

  /**
   * Updates an object from the scene and applies its correction.
   *
   * @param {Scene} object
   * @param {Vector3} position
   * @param {Euler} rotation
   * @param {Vector3} [correction]
   */
  public updateObject(object: Scene, position: Vector3, rotation: Euler, correction?: Vector3) {
    object.position.set(
      position.x,
      position.y,
      position.z
    );
    object.rotation.set(
      rotation.x,
      rotation.y,
      rotation.z
    );
    if (correction) {
      object.translateX(correction.x)
      object.translateY(correction.y);
      object.translateZ(correction.z);
    }
  }

  public moveControls(pos: Vector3, deltaRotation: Vector3) {
    this.player.position.set(pos.x, pos.y, pos.z);
    this.controls.getObject().rotateX(deltaRotation.x);
    this.controls.getObject().rotateY(deltaRotation.y);
    this.controls.getObject().rotateZ(deltaRotation.z);
  }

  public getCameraPosition() {
    return this.camera.position;
  }

  public getCameraRotation() {
    return this.camera.rotation;
  }

  public getClockDelta() {
    return this.clock.getDelta();
  }

  public initDebugger() {
    if (typeof window.__THREE_DEVTOOLS__ !== 'undefined') {
      window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this.scene }));
      window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this.renderer }));
    }
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}

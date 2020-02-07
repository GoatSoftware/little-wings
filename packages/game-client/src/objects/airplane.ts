import { BaseModel } from './baseModel';
import { Scene, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { Vector } from '../types/vector';

export class Airplane extends BaseModel {
  corrections: Vector3;

  private velocity: number = 0;

  private static MIN_SPEED = 0;
  private static MAX_SPEED = 40;
  private static PLAYERSPEED = 10.0; // How fast the player accelerates
  private static PLAYERROTATIONSPEED = 50; // How fast the player rotates

  constructor(vr: boolean = false, wireframe?: boolean) {
    super(wireframe);
    
    this.modelPath = '/resources/airplane2_small.glb';
    this.corrections = new Vector3(0, -0.1, -0.05);
    if (vr) {
      this.corrections = new Vector3(0, 1.4, -0.25);
    }

  }

  public load(): Promise<any> {
    return new Promise((resolve, reject) => {
      super.load()
        .then((model: Scene) => {
          if (this.wireframe) {
            ((model.children[0] as Mesh).material as MeshBasicMaterial).wireframe = true;
            ((model.children[1] as Mesh).material as MeshBasicMaterial).wireframe = true;
            ((model.children[2] as Mesh).material as MeshBasicMaterial).wireframe = true;
            ((model.children[3].children[3] as Mesh).material as MeshBasicMaterial).wireframe = true;
          }
          resolve(model);
        })
        .catch(error => {
          reject(error)
        });
    });
  }

  public animate(throttle: number, turning: Vector, direction: Vector, delta: number) {  

    let modFactor = 0;
    
    // TODO Player does not lose speed on accelerating (important for axis different from the current direction)
    if (throttle === 0) {
      // Gradual slowdown if not accelerating
      modFactor = this.velocity * -0.2;
    } else if (throttle > 0) {
      //Breaks are weaker than throttle
      modFactor = throttle * (Airplane.PLAYERSPEED * 10);
    } else {
      modFactor = throttle * Airplane.PLAYERSPEED;
    }
  
    this.velocity = Math.min(Airplane.MAX_SPEED, Math.max(Airplane.MIN_SPEED, this.velocity + modFactor * delta))
  
    const deltaPlayerHeading = new Vector();
    deltaPlayerHeading.x = turning.x * (Airplane.PLAYERROTATIONSPEED * delta);
    deltaPlayerHeading.y = turning.y * (Airplane.PLAYERROTATIONSPEED * delta);
    deltaPlayerHeading.z = turning.z * (Airplane.PLAYERROTATIONSPEED * delta);
    // deltaPlayerHeading = turning.toGraphic();
    // deltaPlayerHeading.multiplyScalar(PLAYERROTATIONSPEED * delta);
  
    // this.velocity = this.velocity + 0.2;
    // deltaPlayerHeading.y = deltaPlayerHeading.y + 0.2;
  
    // TODO Camera direction should not be basis for movement (in vr, camera moves independent of the player)
    direction.multiplyScalar(this.velocity);
    
    // TODO Force application should part of the airplane
    const phyModel = this.physicModel;
    phyModel.force = new Vector(direction.x, direction.y, direction.z).toPhysic();

    return {
      position: new Vector(phyModel.position),
      deltaRotation: new Vector(
        deltaPlayerHeading.x * delta,
        deltaPlayerHeading.y * delta,
        deltaPlayerHeading.z * delta
      )
    };
    
    // if (airplane.isLoaded() && !vr) {
    //   engine.updateObject(airplane.getGraphicModel(), engine.getCameraPosition(), engine.getCameraRotation(), airplaneCorrection);
    // }
  }

}
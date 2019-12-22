import { BaseModel } from './baseModel';
import { Group, Scene, Mesh, MeshBasicMaterial, Vector3 } from 'three';

export class Airplane extends BaseModel {
  corrections: Vector3;

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
}
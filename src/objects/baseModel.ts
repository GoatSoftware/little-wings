import { GraphicEngine } from '../graphics/graphicEngine';
import { Scene } from 'three';
import { Body, Sphere } from 'cannon';

export class BaseModel {
  protected modelPath: string;
  protected graphicModel: Scene;
  protected physicModel: Body;
  protected position: any;

  constructor(protected wireframe?: boolean) {}

  public load() {
    const mass = 2, radius = 1.3;
    const sphereShape = new Sphere(radius);
    this.physicModel = new Body({ mass: mass });
    this.physicModel.addShape(sphereShape);
    this.physicModel.position.set(0,20,0);
    this.physicModel.linearDamping = 0.9;

    return new Promise((resolve, reject) => {
      GraphicEngine.loadModel(this.modelPath)
        .then((model: Scene) => {
          console.log('loading complete', model);
          this.graphicModel = model;
          resolve(model);
        })
        .catch((error) => {
          console.log('error');
          reject(error);
        });
    });
  }

  public getGraphicModel() {
    return this.graphicModel;
  }
  
  public getPhysicModel() {
    return this.physicModel;  
  }

  public isLoaded() {
    return !!this.graphicModel;
  }
}
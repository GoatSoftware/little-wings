import { Scene } from "three";
import { GraphicEngine } from '../graphics/graphicEngine';

export class Airplane {
  private modelPath = '/resources/airplane2.glb';
  private graphicModel: Scene;
  private physicModel: any;
  private position: any;

  load() {
    return new Promise((resolve, reject) => {
      GraphicEngine.loadModel(this.modelPath)
        .then((room: Scene) => {
          console.log('loading complete');
          this.graphicModel = room;
          resolve();
        })
        .catch((error) => {
          console.log('error');
          reject(error);
        });
    });
  }

  getGraphicModel() {
    return this.graphicModel;
  }

  isLoaded() {
    return !!this.graphicModel;
  }
}
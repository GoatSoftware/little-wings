import { Scene } from "three";

export class Airplane {
  private modelPath = '/resources/airplane2.glb';
  private graphicModel: Scene;

  load(loadModelFn: (path: string) => Promise<any>) {
    return new Promise((resolve, reject) => {
      loadModelFn(this.modelPath)
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
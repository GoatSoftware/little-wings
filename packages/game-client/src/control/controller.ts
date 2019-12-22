import { Vector } from '../types/vector';
import { connect } from 'socket.io-client';

interface ControllerOrientation {
  orientation: {
    calibrated: any;
  }
}

export class Controller {
  acc: number = 0; // -1 to 1
  vectorHead: Vector = new Vector(0, 0, 0); // -1 to 1 on every coordinate
  
  constructor() {
    var socket = connect("https://little-wings.herokuapp.com:9995");
    socket.emit('registerAsListener');
    socket.on('orientation', (o: ControllerOrientation) => {
      this.parseOrientation(o);
    });
  }

  private parseOrientation(orientation: ControllerOrientation) {
    console.log(orientation);
  }

  public getState() {
    return {acc: this.acc, heading: this.vectorHead};
  }
}
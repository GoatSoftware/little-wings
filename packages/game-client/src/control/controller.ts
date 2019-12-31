import { Vector } from '../types/vector';
import { connect } from 'socket.io-client';

interface ControllerOrientation {
  orientation: {
    global: any;
    calibrated: any;
  }
}

export class Controller {
  acc: number = 1; // -1 to 1
  vectorHead: Vector = new Vector(0, 0, 0); // -1 to 1 on every coordinate
  
  constructor() {
    var socket = connect(process.env.SOCKET_ADDRESS || "https://localhost:9001/");
    socket.emit('registerAsListener');
    socket.on('orientation', (o: ControllerOrientation) => {
      this.parseOrientation(o);
    });
  }

  private parseOrientation(state: ControllerOrientation) {
    if (state.orientation.global.g < 0) {
      this.vectorHead.x = (state.orientation.global.g / -90 - 0.5) * 2;
    }
    if (state.orientation.global.b < 45 && state.orientation.global.b > -45) {
      console.log(state.orientation.global.b);
      this.vectorHead.z = state.orientation.global.b / -45;
    }
    // if (state.orientation.global.g < 0) {
    //   this.vectorHead.x = state.orientation.global.g / -90 - 0.5;
    // }
  }

  public getState() {
    return {acc: this.acc, heading: this.vectorHead};
  }
}
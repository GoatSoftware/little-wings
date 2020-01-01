import { Vector } from '../types/vector';
import { connect } from 'socket.io-client';
import { ControlState, Control } from './control';

interface ControllerOrientation {
  orientation: {
    global: any;
    calibrated: any;
  }
}

export class Controller implements Control {
  acc: number = 1; // -1 to 1
  vectorHead: Vector = new Vector(0, 0, 0); // -1 to 1 on every coordinate
  
  constructor() {
    var socket = connect(process.env.SOCKET_ADDRESS || "https://192.168.1.14:9001/");
    socket.emit('registerAsListener');
    socket.on('orientation', (o: ControllerOrientation) => {
      this.parseOrientation(o);
    });
  }

  private parseOrientation(state: ControllerOrientation): void {
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

  public getState(): ControlState {
    return {acc: this.acc, heading: this.vectorHead};
  }
}
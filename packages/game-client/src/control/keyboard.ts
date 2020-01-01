import { Vector } from '../types/vector';
import { Control, ControlState } from './control';

// Add event listeners for player movement key presses
export class Keyboard implements Control {
  acc: number = 0;
  vectorHead: Vector = new Vector(0, 0, 0);

  constructor() {
  // Add event listeners for when movement keys are pressed and released
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!event.repeat) {
      switch (event.keyCode) {
        case 87: // w
          this.acc += 1;
          break;
        
        case 83: // s
          this.acc -= 1;
          break;
          
        case 65: // a
          this.vectorHead.y += 1;
          break;
        
        case 68: // d
          this.vectorHead.y -= 1;
          break;
  
        case 38: // up
          this.vectorHead.x += -1;
          break;
  
        case 40: // down
          this.vectorHead.x += 1;
          break;
  
        case 37: // left
          this.vectorHead.z += 1;
          break;
  
        case 39: // right
        this.vectorHead.z -= 1;
          break;
      }
      this.acc = this.dimension(this.acc);
      this.vectorHead.x = this.dimension(this.vectorHead.x);
      this.vectorHead.y = this.dimension(this.vectorHead.y);
      this.vectorHead.z = this.dimension(this.vectorHead.z);
    }
  };

  private dimension(n: number, min: number = -1, max: number = 1) {
    return Math.min(max, Math.max(min, n));
  }

  // Listen for when a key is released
  // If it's a specified key, mark the direction as false since no longer moving
  private onKeyUp = (event: KeyboardEvent) => {
    if (!event.repeat) {
      switch (event.keyCode) {
        case 87: // w
          this.acc -= 1;
          break;
        
        case 65: // a
          this.vectorHead.y -= 1;
          break;
        
        case 83: // s
          this.acc -= -1;
          break;
        
        case 68: // d
          this.vectorHead.y -= -1;
          break;
  
        case 38: // up
          this.vectorHead.x -= -1;
          break;
  
        case 37: // left
          this.vectorHead.z -= 1;
          break;
  
        case 40: // down
          this.vectorHead.x -= 1;
          break;
  
        case 39: // right
        this.vectorHead.z -= -1;
          break;
      }
      this.acc = this.dimension(this.acc);
      this.vectorHead.x = this.dimension(this.vectorHead.x);
      this.vectorHead.y = this.dimension(this.vectorHead.y);
      this.vectorHead.z = this.dimension(this.vectorHead.z);
    }
  };

  public getState(): ControlState {
    return {acc: this.acc, heading: this.vectorHead};
  }
}
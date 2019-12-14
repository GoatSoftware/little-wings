import { Vector } from './types/vector';
// Add event listeners for player movement key presses
export class Control {
  acc: number;
  vectorHead: Vector;

  constructor() {
  // Add event listeners for when movement keys are pressed and released
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);
  }
  // Listen for when a key is pressed
  // If it's a specified key, mark the direction as true since moving
  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.keyCode) {
      case 87: // w
        this.acc = 1;
        break;
      
      case 65: // a
        this.vectorHead.y = 1;
        break;
      
      case 83: // s
        this.acc = -1;
        break;
      
      case 68: // d
        this.vectorHead.y = -1;
        break;

      case 38: // up
        this.vectorHead.x = -1;
        break;

      case 37: // left
        this.vectorHead.z = 1;
        break;

      case 40: // down
        this.vectorHead.x = 1;
        break;

      case 39: // right
      this.vectorHead.z = -1;
        break;
    }
  };

  // Listen for when a key is released
  // If it's a specified key, mark the direction as false since no longer moving
  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.keyCode) {
      case 87: // w
        moveForward = false;
        break;

      case 65: // a
        moveLeft = false;
        break;

      case 83: // s
        moveBackward = false;
        break;

      case 68: // d
        moveRight = false;
        break;

      case 69: // e
        moveUp = false;
        break;

      case 81: // q
        moveDown = false;
        break;

      case 38: // up
        headUp = false;
        break;

      case 37: // left
        headLeft = false;
        break;

      case 40: // down
        headDown = false;
        break;
        
      case 39: // right
        headRight = false;
        break;
    }
  };

}
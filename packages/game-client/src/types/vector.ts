import { Vector3 } from "three";
import { Vec3 } from "cannon";

export class Vector {
  x: number;
  y: number;
  z: number;

  constructor();
  constructor(x: number, y: number, z: number);
  constructor(graphicVector: Vector3);
  constructor(physicVector: Vec3);
	constructor(x: number | Vector3 | Vec3 = 0, y: number = 0, z: number = 0) {
    if (x instanceof Vector3 || x instanceof Vec3) {
      this.x = x.x;
      this.y = x.y;
      this.z = x.z;
    } else if ((x || x === 0) && (y || y === 0) && (z || z === 0)) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  toGraphic(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  toPhysic(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  multiplyScalar(scalar: number) {
    this.x = this.x * scalar;
    this.y = this.y * scalar;
    this.z = this.z * scalar;
  }
}
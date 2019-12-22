import { Vector3 } from "three";
import { Vec3 } from "cannon";

export class Vector {
  x: number;
  y: number;
  z: number;

	constructor(x?: number, y?: number, z?: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toGraphic(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  tpPhysic(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }
}
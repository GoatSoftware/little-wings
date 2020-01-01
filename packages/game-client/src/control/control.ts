import { Vector } from "../types/vector";

export interface ControlState {
  acc: number;
  heading: Vector;
}

export interface Control {
  getState(): ControlState;
}

import {Ship} from "./ship";

export class Cell {
  x: number;
  y: number;
  isOccupied: boolean;
  isFired: boolean;
  ship: Ship;
  shipType: string;
  align: string;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.isOccupied = false;
    this.isFired = false;
    this.ship = undefined;
    this.shipType = undefined;
    this.align = undefined;
  }
}

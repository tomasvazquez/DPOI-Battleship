import {Cell} from "./cell";

export class Ship {
  id: string;
  size: number;
  isVertical: boolean;
  data: string;
  effectAllowed: string;
  disabled: boolean;
  cells: Array<Cell>;

  constructor(id: number, size: number) {
    this.id = `ship${size}-${id}`;
    this.size = size;
    this.isVertical = false;
    this.data = "myDragData";
    this.effectAllowed = "move";
    this.disabled = false;
    this.cells = [];
  }

  public rotate() {
    this.isVertical = !this.isVertical;
  }

  public isSunk() {
    let sunk = true;
    for(let i = 0; i < this.cells.length; i++){
      if (!this.cells[i].isFired) {
        return false;
      }
    }
    return sunk;
  }

}

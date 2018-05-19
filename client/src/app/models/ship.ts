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

}

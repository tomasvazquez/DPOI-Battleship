import {Component, HostListener, OnInit} from '@angular/core';
import {DndDropEvent} from 'ngx-drag-drop';
import {Cell} from "../../models/cell";
import {Ship} from "../../models/ship";
import {Router} from "@angular/router";
import {FacebookService} from "ngx-facebook";
import {UserDataService} from "../../user-data.service";

@Component({
  selector: 'app-warming',
  templateUrl: './warming.component.html',
  styleUrls: ['./warming.component.css']
})
export class WarmingComponent implements OnInit {

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'r') {
      this.rotateUnplacedShips();
    }
  }

  private socket: SocketIOClient.Socket;
  private status: String;

  constructor(private fb: FacebookService, private router: Router, private userData: UserDataService) {}

  ngOnInit() {
    this.createBoard();
    this.createShips(2, 3, 2);
    this.isGameReady = this.checkReadyness();
    this.userData.currentMessage.subscribe(message => this.userName = message);
    this.status = '';
    this.socket = io('http://localhost:3000');
    this.socket.emit('message', this.userName);
    this.socket.emit('getStatus', this.userName);
  }

  userName;

  getStatus() {
    const that = this;
    this.socket.on('updateStatus', function (msg) {
      that.status = msg;
    });
    return that.status;
  }

  opponent = undefined;
  opponentReady = false;

  board = [];
  ships = [];

  boardSize = 10;

  isVertical = false;

  draggingShip = undefined;

  shipsPlaced = 0;

  isGameReady = false;

  resolveWaitingText() {
    if (!this.opponent) {
      return 'Waiting for opponent...';
    } else {
      if (this.opponentReady) {
        document.getElementById('warming-spinner').className = 'preloader-wrapper small hide';
        return this.opponent + ' is READY!';
      } else {
        return `Playing with ${this.opponent}...`;
      }
    }
  }

  playGame() {
    this.router.navigate(['game']);
  }

  createShips(sized2, sized3, sized4) {
    for (let i = 0; i < sized2; i++) {
      this.ships.push(new Ship(i, 2));
    }
    for (let j = 0; j < sized3; j++) {
      this.ships.push(new Ship(j, 3));
    }
    for (let k = 0; k < sized4; k++) {
      this.ships.push(new Ship(k, 4));
    }
  }

  createBoard() {
    const boardSize = this.boardSize;
    for (let i = 0; i < boardSize; i++) {
      const cellRow: Array<Cell> = [];
      for (let j = 0; j < boardSize; j++) {
        cellRow.push(new Cell(j, i))
      }
      this.board.push(cellRow);
    }
  }

  rotateUnplacedShips() {
    for (let i = 0; i < this.ships.length; i++) {
      if (!this.ships[i].disabled) this.ships[i].rotate();
    }
    this.isVertical = !this.isVertical;
  }

  resetRotation() {
    this.isVertical = false;
  }

  resetBoard() {
    this.board = [];
    this.ships = [];
    this.shipsPlaced = 0;
    this.ngOnInit();
  }

  randomPlacement() {
    if (this.isBoardCompleted()) this.resetBoard();
    for (let i = 0; i < this.ships.length; i++) {
      if (!this.ships[i].disabled) {
        this.rotateUnplacedShips();
        const coordenates = this.findRandomAvailablePlace([], this.ships[i]);
        this.resolveOccupation(parseInt(coordenates[0]), parseInt(coordenates[1]), this.ships[i]);
      }
    }
    this.resetRotation();
    this.isGameReady = this.checkReadyness();
  }

  private findRandomAvailablePlace(coordenates, ship) {
    const x = this.getRandomInt();
    const y = this.getRandomInt();
    if (!this.board[y][x].isOccupied) {
      if (ship.isVertical && this.isShipPlaceableVertically(x, y, ship)) {
        coordenates.push(x);
        coordenates.push(y);
        return coordenates;
      } else if (!ship.isVertical && this.isShipPlaceableHorizontally(x, y, ship)) {
        coordenates.push(x);
        coordenates.push(y);
        return coordenates;
      } else {
        return this.findRandomAvailablePlace([], ship);
      }
    } else {
      return this.findRandomAvailablePlace([], ship);
    }
  }

  getRandomInt() {
    return Math.floor(Math.random() * (10));
  }

  onDragStart(event: DragEvent) {
    this.draggingShip = this.ships.find(ship => {
      return ship.id === event.toElement.id
    });
    console.log("drag started", JSON.stringify(event, null, 2));
  }

  onDragEnd(event: DragEvent) {
    console.log("drag ended", JSON.stringify(event, null, 2));
  }

  onDraggableCopied(event: DragEvent) {
    console.log("draggable copied", JSON.stringify(event, null, 2));
  }

  onDraggableLinked(event: DragEvent) {
    console.log("draggable linked", JSON.stringify(event, null, 2));
  }

  onDraggableMoved(event: DragEvent) {
    console.log("draggable moved", JSON.stringify(event, null, 2));
  }

  onDragCanceled(event: DragEvent) {
    console.log("drag cancelled", JSON.stringify(event, null, 2));
  }

  onDragover(event: DragEvent) {
  }

  onDrop(event: DndDropEvent) {
    let target = event.event.currentTarget as HTMLElement;
    const coordenates = target.id.split(',');
    this.resolveOccupation(parseInt(coordenates[0]), parseInt(coordenates[1]), this.draggingShip);
    this.isGameReady = this.checkReadyness();
    console.log("dropped", JSON.stringify(event, null, 2));
  }

  resolveOccupation(x: number, y: number, ship: Ship) {
    if (ship && ship.isVertical && this.isShipPlaceableVertically(x, y, ship)) {
      this.placeShipVertical(x, y, ship);
      return true;
    } else if (ship && !ship.isVertical && this.isShipPlaceableHorizontally(x, y, ship)) {
      this.placeShipHorizontal(x, y, ship);
      return true;
    } else {
      return false;
    }
  }

  isShipPlaceableVertically(x, y, ship) {
    let isPlaceable = true;
    for (let i = 0; i < ship.size; i++) {
      isPlaceable = isPlaceable && this.cellExists(x, y + i) && !this.isCellOccupied(x, y + i);
      if (!isPlaceable) return false;
    }
    return isPlaceable;
  }

  isShipPlaceableHorizontally(x, y, ship) {
    let isPlaceable = true;
    for (let i = 0; i < ship.size; i++) {
      isPlaceable = isPlaceable && this.cellExists(x + i, y) && !this.isCellOccupied(x + i, y);
      if (!isPlaceable) return false;
    }
    return isPlaceable;
  }

  cellExists(x, y) {
    return x < this.boardSize && y < this.boardSize;
  }

  isCellOccupied(x, y) {
    return this.board[y][x].isOccupied;
  }

  placeShipVertical(x, y, ship) {
    for (let i = 0; i < ship.size; i++) {
      this.board[y + i][x].isOccupied = true;
      this.board[y + i][x].ship = ship;
      ship.cells.push(this.board[y + i][x]);
    }
    ship.disabled = true;
    this.shipsPlaced++;
  }

  placeShipHorizontal(x, y, ship) {
    for (let i = 0; i < ship.size; i++) {
      this.board[y][x + i].isOccupied = true;
      this.board[y][x + i].ship = ship;
      ship.cells.push(this.board[y][x + i]);
    }
    ship.disabled = true;
    this.shipsPlaced++;
  }

  checkReadyness() {
    return this.opponent && this.isBoardCompleted();
  }

  isBoardCompleted() {
    return this.shipsPlaced === this.ships.length;
  }
}
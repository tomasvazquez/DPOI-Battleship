import {Component, HostListener, OnInit} from '@angular/core';
import {DndDropEvent} from 'ngx-drag-drop';
import {Cell} from "../../models/cell";
import {Ship} from "../../models/ship";
import {Router} from "@angular/router";
import {FacebookService} from "ngx-facebook";
import {UserDataService} from "../../user-data.service";
import * as io from 'socket.io-client';
import * as M from 'materialize-css';
import * as url from "url";

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
  user;
  playId= 0;
  opponent = undefined;
  opponentReady = false;
  isGameSet = false;
  isButtonClicked = false;
  board = [];
  ships = [];
  boardSize = 10;
  isVertical = false;
  draggingShip = undefined;
  shipsPlaced = 0;

  constructor(private fb: FacebookService, private router: Router, private userData: UserDataService) {}

  goToHome() {
    this.socket.disconnect();
    window.localStorage.setItem("futureState","goHome");
    this.router.navigate(['home']);
  }

  ngOnInit() {
    window.localStorage.setItem("state","warming");
    window.localStorage.setItem("futureState",undefined);
    this.initWarming();
    this.getData();
    this.socket.emit('message', this.user);
    this.socket.emit('getStatus', this.user);
    this.getStatus();
  }

  getData() {
    this.socket = this.userData.getSocket();
  }

  initWarming(){
    this.createBoard();
    this.createShips(2, 3, 2);
    this.isGameSet = false;
    this.isButtonClicked = false;
    this.getUserData();
    this.status = '';
  }

  getUserData() {
    const that = this;
    that.userData.getUser()
      .subscribe(json => that.user = json);
  }

  getStatus() {
    const that = this;
    this.socket.on('updateStatus', function (json) {
      that.opponent = json;
      that.userData.setOpponentData(that.opponent);
    });
    this.socket.on('updateOponentReady',function (msg) {
      that.opponentReady = msg;
      that.isGameSet = that.checkReadyness();
      if (that.isGameSet && that.opponentReady && that.isButtonClicked){
        that.userData.setBoard(that.board);
        window.localStorage.setItem("futureState","playing");
        that.router.navigate(['game']);
      }
    });
    this.socket.on('opponentDisconnect', function () {
      const toastText = that.opponent.name + ' left the game';
      if (toastText !== undefined) M.toast(toastText,4200);
      that.opponent = undefined;
      that.opponentReady = false;
      that.isGameSet = false;
      that.isButtonClicked = false;
    });
  }

  resolveWaitingText() {
    if (!this.opponent) {
      return 'Waiting for opponent...';
    } else {
      if (this.opponentReady) {
        document.getElementById('warming-spinner').className = 'preloader-wrapper small hide';
        return `${this.opponent.name} is READY!`;
      } else {
        if (this.isGameSet) {
          return `Waiting for ${this.opponent.name}...`;
        } else {
          return `Playing with ${this.opponent.name}...`;
        }
      }
    }
  }

  playGame() {
    this.isButtonClicked = true;
    this.isGameSet = this.checkReadyness();
    document.getElementById('play-button').className = 'waves-light btn-large disabled';
    document.getElementById('reset-board-button').className = 'waves-light btn disabled';
    document.getElementById('random-board-button').className = 'waves-light btn disabled';
    var simpleBoard = this.transformBoard();
    this.socket.emit('setReady', {"user": this.user, "playId": this.opponent.playId, "board": simpleBoard});

    if (this.isGameSet && this.opponentReady){
      this.userData.setBoard(this.board);
      window.localStorage.setItem("futureState","playing");
      this.router.navigate(['game']);
    }
  }

  transformBoard(){
    let simpleBoard = [];
    for(let i = 0; i< 10; i++){
      const row = [];
      for (let e = 0; e<10; e++){
        var ship = this.board[i][e].ship;
        if(ship !== undefined){
            row.push(ship.id);
        }else{
          row.push(0);
        }
      }
      simpleBoard.push(row);
    }
    return simpleBoard;
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
        cellRow.push(new Cell(j, i));
        if (document.getElementById(`${j},${i}`)) document.getElementById(`${j},${i}`).style.backgroundColor = 'white';
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
    this.initWarming();
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
    this.isGameSet = this.checkReadyness();
  }

  private findRandomAvailablePlace(coordenates, ship) {
    const x = WarmingComponent.getRandomInt();
    const y = WarmingComponent.getRandomInt();
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

  static getRandomInt() {
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
    this.isGameSet = this.checkReadyness();
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
      if (i === 0) this.board[y + i][x].shipType = 'init-ship';
      else if (i === ship.size - 1) this.board[y + i][x].shipType = 'end-ship';
      else this.board[y + i][x].shipType = 'middle-ship';
      this.board[y + i][x].align = 'vertical';
    }
    ship.disabled = true;
    this.shipsPlaced++;
  }

  placeShipHorizontal(x, y, ship) {
    for (let i = 0; i < ship.size; i++) {
      this.board[y][x + i].isOccupied = true;
      this.board[y][x + i].ship = ship;
      ship.cells.push(this.board[y][x + i]);
      if (i === 0) this.board[y][x + i].shipType = 'init-ship';
      else if (i === ship.size - 1) this.board[y][x + i].shipType = 'end-ship';
      else this.board[y][x + i].shipType = 'middle-ship';
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

  getCellClassName(cell: Cell) {
    return cell.align === 'vertical' ?  `cell ${cell.shipType} ${cell.align}-cell` : `cell ${cell.shipType}`;
  }
}

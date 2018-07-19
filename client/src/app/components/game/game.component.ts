import { Component, OnInit } from '@angular/core';
import {Cell} from "../../models/cell";
import {UserDataService} from "../../user-data.service";
import * as io from 'socket.io-client';
import {WarmingComponent} from "../warming/warming.component";
import {Ship} from '../../models/ship';
import {Router} from "@angular/router";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private socket: SocketIOClient.Socket;
  userBoard = [];
  opponentBoard = [];
  boardSize = 10;
  user;
  opponent;
  myTurn = false;
  result = undefined;

  constructor(private userData: UserDataService, private router: Router) { }

  goToHome() {
    this.socket.disconnect();
    window.localStorage.setItem("futureState", "goHome");
    this.router.navigate(['home']);
  }

  playAgain(){
    this.socket.disconnect();
    window.localStorage.setItem("futureState", "goWarming");
    this.router.navigate(['warming']);
  }

  ngOnInit() {
    window.localStorage.setItem("state","game");
    window.localStorage.setItem("futureState",undefined);
    this.createBoard();
    this.getData();
    this.socket.emit('updateSocket', {"user": this.user, "playId": this.opponent.playId});
    this.socketEvents();
  }

  getData() {
    this.userData.getUser()
      .subscribe(json => this.user = json);
    this.userData.getOpponentData()
      .subscribe(json => this.opponent = json);
    this.userData.getBoard()
      .subscribe(json => this.userBoard = json);
    this.socket = this.userData.getSocket();
  }

  socketEvents(){
    const that = this;
    this.socket.on('updateTurn', function (boolean) {
      that.myTurn = boolean;
    });
    this.socket.on('getOpponentShot', function (json) {
      that.userBoard[json.y][json.x].isFired = true;
    });
    this.socket.on('getMyShot', function (json) {
      that.opponentBoard[json.y][json.x].isFired = true;
      that.opponentBoard[json.y][json.x].isOccupied = json.isOccupied;
      if (json.ship !== undefined){
        const cells = [];
        const ship = new Ship(json.ship.id, json.ship.size);
        for (let i = 0; i < json.ship.cells.length; i++) {
          let y = json.ship.cells[i][0];
          let x = json.ship.cells[i][1];
          cells.push(that.opponentBoard[y][x]);
          that.opponentBoard[y][x].ship = ship;
        }
      }
    });
    this.socket.on('gameOver', function (json) {
      that.myTurn = false;
      setTimeout('', 5000);
      that.result = json.result;
      document.getElementById('result-row-container').className = 'row';
      document.getElementById('back-button').className = 'btn hide';
    });
  }

  onLoadedPicture() {
    document.getElementById('user-info-col').className = 'col s12 m6 l6';
    document.getElementById('opponent-info-col').className = 'col s12 m6 l6';
    document.getElementById('username-spinner').className = 'preloader-wrapper big hide';
    document.getElementById('opponent-spinner').className = 'preloader-wrapper big hide';
  }

  createBoard() {
    const boardSize = this.boardSize;
    for (let i = 0; i < boardSize; i++) {
      const cellRow: Array<Cell> = [];
      for (let j = 0; j < boardSize; j++) {
        cellRow.push(new Cell(j, i))
      }
      this.opponentBoard.push(cellRow);
      this.userBoard.push(cellRow);
    }
  }

  shoot(x,y) {
    if (this.myTurn && !this.opponentBoard[y][x].isFired) {
      console.log(`shot opponent in ${x},${y}`);
      this.myTurn = !this.myTurn;
      this.socket.emit('shootOpponent',{"x": x, "y": y, "playId": this.opponent.playId});
    }
  }

  checkIfTurn() {
    if (this.myTurn) {
      document.getElementById('user-board').style.opacity = '0.6';
      document.getElementById('opponent-board').style.opacity = '1';
    } else {
      document.getElementById('user-board').style.opacity = '1';
      document.getElementById('opponent-board').style.opacity = '0.6';
    }
  }

  getOpponentCellClass(x,y) {
    if (this.opponentBoard[y][x].isFired) {
      if (!this.opponentBoard[y][x].isOccupied) {
        return 'water cell';
      } else if (this.opponentBoard[y][x].ship && this.opponentBoard[y][x].ship.isSunk()) {
        return 'sunk cell';
      } else {
        return 'hit cell'
      }
    } else {
      return 'cell';
    }
  }

  getUserCellClass(x,y) {
    if (this.userBoard[y][x].isFired) {
      if (!this.userBoard[y][x].isOccupied) {
        return 'water cell';
      } else if (this.userBoard[y][x].ship.isSunk()) {
        return 'sunk cell';
      } else {
        return 'hit cell'
      }
    } else {
      if (this.userBoard[y][x].ship) {
        return this.userBoard[y][x].align === 'vertical' ?  this.userBoard[y][x].shipType + ' cell ' + this.userBoard[y][x].align : this.userBoard[y][x].shipType + ' cell';
      } else {
        return 'cell';
      }
    }
  }

  isCellClickable(x, y) {
    if (x === '-') return ;
    if (!this.myTurn || this.opponentBoard[y][x].isFired) {
      return 'clickable-cell disabled';
    } else {
      return 'clickable-cell';
    }
  }

  autoFire() {
    const coordenates = this.findRandomShootablePlace([]);
    this.shoot(parseInt(coordenates[0]), parseInt(coordenates[1]));
  }

  private findRandomShootablePlace(coordenates) {
    const x = WarmingComponent.getRandomInt();
    const y = WarmingComponent.getRandomInt();
    if (!this.opponentBoard[y][x].isFired) {
      coordenates.push(x);
      coordenates.push(y);
      return coordenates;
    } else {
      return this.findRandomShootablePlace([]);
    }
  }

}

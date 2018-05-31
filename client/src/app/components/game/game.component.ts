import { Component, OnInit } from '@angular/core';
import {Cell} from "../../models/cell";
import {UserDataService} from "../../user-data.service";
import * as io from 'socket.io-client';


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

  constructor(private userData: UserDataService) { }

  ngOnInit() {
    this.createBoard();
    this.getData();
    this.socket = io('http://localhost:3000');
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
  }

  socketEvents(){
    const that = this;
    this.socket.on('updateTurn', function (boolean) {
      that.myTurn = boolean;
    });
    this.socket.on('getOpponentShot', function () {
      //cambiar el color de la celda donde me dispararon
      //cambiar mi turno
    });
    this.socket.on('drawMyShot', function () {
      //pintar la celda donde hice click depende si es agua o barco
    });
    this.socket.on('gameOver', function () {
      // avisar si ganaste o perdiste
    });
  }

  onLoadedPicture() {
    document.getElementById('user-info-col').className = 'col';
    document.getElementById('opponent-info-col').className = 'col';
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
    if (this.myTurn) {
      console.log(`shot opponent in ${x},${y}`);
      this.myTurn = !this.myTurn;
      this.socket.emit('shootOpponent',{"x": x, "y": y});
    }
    console.log('not my turn to shoot');
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

}

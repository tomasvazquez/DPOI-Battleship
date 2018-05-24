import { Component, OnInit } from '@angular/core';
import {Cell} from "../../models/cell";
import {FacebookService} from "ngx-facebook";
import {UserDataService} from "../../user-data.service";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  userBoard = [];
  opponentBoard = [];
  boardSize = 10;
  userName;
  opponentName;
  userProfilePictureUrl;
  opponentProfilePictureUrl;
  myTurn = true;

  constructor(private userData: UserDataService) { }

  ngOnInit() {
    this.createBoard();
    this.getProfile();
  }

  getProfile() {
    this.userName = 'Nacho Vazquez';
    this.userProfilePictureUrl = 'https://graph.facebook.com/10217246688904256/picture?type=large';
  }

  onLoadedPicture() {
    document.getElementById('user-info-col').className = 'col';
    document.getElementById('username-spinner').className = 'preloader-wrapper big hide';
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
    } else {
      this.myTurn = !this.myTurn;
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

}

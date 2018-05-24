import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private user = new BehaviorSubject('');
  private opponentData: BehaviorSubject<any> = new BehaviorSubject([]);
  private board = new BehaviorSubject('');

  constructor() { }

  getUser(){
    return this.user;
  }

  setUser(json) {
    this.user.next(json);
  }

  getOpponentData(){
    return this.opponentData;
  }

  setOpponentData(json){
    this.opponentData.next(json);
  }

  getBoard(){
    return this.board;
  }

  setBoard(json){
    this.board.next(json);
  }
}

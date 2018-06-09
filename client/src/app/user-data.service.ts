import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private user = new BehaviorSubject('');
  private opponentData: BehaviorSubject<any> = new BehaviorSubject([]);
  private board: BehaviorSubject<any> = new BehaviorSubject([]);
  private socket;
  private state = undefined;
  private lastState = undefined;

  constructor() { }

  getSocket(){
    return this.socket;
  }

  setSocket(socket) {
    this.socket = socket;
  }

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

  getState(){
    return this.state;
  }

  setState(json) {
    this.state = json;
  }

  getLastState(){
    return this.lastState;
  }

  setLastState(json) {
    this.lastState = json;
  }
}

import {Injectable} from '@angular/core';
import {CanActivate} from '@angular/router';
import {UserDataService} from "./user-data.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userData: UserDataService) {}

  canActivate(): boolean {
    // let state = this.userData.getState();
    // let lastState = this.userData.getLastState();
    let state = window.localStorage.getItem("state");
    let url = window.location.href;
    let futureState = window.localStorage.getItem("futureState");
    if (futureState === "undefined") {
      futureState = url.split('/')[url.split('/').length - 1];
    }


    if (state !== "undefined") {
      if (state === 'warming' && futureState === 'goHome') return true;
      else if (state === 'warming' && futureState === 'playing') return true;
      else if (state === 'warming' && futureState === 'warming') return true;
      else if (state === 'home' && futureState === 'warming') return true;
      else if (state === 'home' && futureState === 'home') return true;
      else if (state === 'game' && futureState === 'goHome') return true;
      else if (state === 'game' && futureState === 'goWarming') return true;
      else if (state === 'game' && futureState === 'game') return true;
      else return false
    } else {
      return this.isAllowedAccess();
    }
  }

  isAllowedAccess(): boolean {
    return this.getUserName() !== "undefined";
  }

  getUserName() {
    let userName = window.localStorage.getItem("userName");
    return userName;
  }
}

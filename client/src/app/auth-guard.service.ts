import {Injectable} from '@angular/core';
import {CanActivate} from '@angular/router';
import {UserDataService} from "./user-data.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private userData: UserDataService) {}

  canActivate(): boolean {
    let state = this.userData.getState();
    let lastState = this.userData.getLastState();
    if (state) {
      if (state === 'home' && lastState === 'login') return true;
      else if (state === 'warming' && lastState === 'home') return true;
      else if (state === 'home' && lastState === 'warming') return true;
      else if (state === 'playing' && lastState === 'warming') return true;
      else if (state === 'home' && lastState === 'playing') return true;
      else return false
    } else {
      return this.isAllowedAccess();
    }
  }

  isAllowedAccess(): boolean {
    return this.getUserName() !== undefined;
  }

  getUserName() {
    let userName = undefined;
    this.userData.getUser().subscribe(json => userName = json);
    return userName.name;
  }
}

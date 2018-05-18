import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private userData = new BehaviorSubject<string>('empty');
  currentMessage = this.userData.asObservable();

  constructor() { }

  changeUserData(message: string) {
    this.userData.next(message);
  }
}

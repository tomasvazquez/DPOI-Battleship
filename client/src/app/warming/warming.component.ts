import {Component, Input, OnInit} from '@angular/core';
import * as io from 'socket.io-client';
import {FacebookService} from 'ngx-facebook';
import {ActivatedRoute, Router} from '@angular/router';
import {UserDataService} from '../user-data.service';
@Component({
  selector: 'app-warming',
  templateUrl: './warming.component.html',
  styleUrls: ['./warming.component.css']
})
export class WarmingComponent implements OnInit {

  private socket: SocketIOClient.Socket;
  private status: String;

  constructor(private fb: FacebookService, private router: Router, private userData: UserDataService) {}

  userName;

  getStatus() {
    const that = this;
    this.socket.on('updateStatus', function (msg) {
      that.status = msg;
    });
    return that.status;
  }

  // getProfile() {
  //   this.fb.api('/me')
  //     .then((res: any) => {
  //       this.currentUser = res;
  //       console.log('Got the users profile', res);
  //     })
  //     .catch(this.handleError);
  // }

  private handleError(error) {
    console.error('Error processing action', error);
  }

  ngOnInit() {
    this.userData.currentMessage.subscribe(message => this.userName = message);
    this.status = '';
    this.socket = io('http://localhost:3000');
    this.socket.emit('message', this.userName);
    this.socket.emit('getStatus', this.userName);
  }

}

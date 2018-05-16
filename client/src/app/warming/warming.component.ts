import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-warming',
  templateUrl: './warming.component.html',
  styleUrls: ['./warming.component.css']
})
export class WarmingComponent implements OnInit {

  private socket: SocketIOClient.Socket;
  private status: String;

  constructor() {}

  getStatus() {
    const that = this;
    this.socket.on('updateStatus', function (msg) {
      that.status = msg;
    });
    return that.status;
  }

  ngOnInit() {
    this.status = 'hola';
    this.socket = io('http://localhost:3000');
    this.socket.emit('message', 'test');
    this.socket.emit('getStatus');
  }

}

import {Component, OnInit} from '@angular/core';
import {FacebookService} from 'ngx-facebook';
import * as io from 'socket.io-client';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private socket: io.SocketIOClient.Socket;

  constructor(private fb: FacebookService, private router: Router) {}

  currentUser;
  profilePictureUrl;


  getProfile() {
    this.fb.api('/me')
      .then((res: any) => {
        this.currentUser = res;
        this.profilePictureUrl = 'https://graph.facebook.com/' + res.id + '/picture?type=large';
      })
      .catch();
  }

  getSocket() {
    this.socket = io('http://localhost:3000');
    this.socket.emit('message', this.currentUser.name);
    this.router.navigate(['play']);
  }

  onLoadedPicture() {
    document.getElementById('user-play-card').className = 'card small horizontal';
    document.getElementById('home-spinner').className = 'preloader-wrapper big hide';
  }

  ngOnInit() {
    this.getProfile();
  }
}


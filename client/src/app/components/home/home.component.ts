import {Component, OnInit} from '@angular/core';
import {FacebookService} from 'ngx-facebook';
import {Router} from '@angular/router';
import {UserDataService} from '../../user-data.service';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private socket: SocketIOClient.Socket;


  public name: string;

  constructor(private fb: FacebookService, private router: Router, private userData: UserDataService) {}

  currentUser;
  userName;
  profilePictureUrl;

  getProfile() {
    this.fb.api('/me')
      .then((res: any) => {
        this.currentUser = res;
        this.userName = res.name;
        this.profilePictureUrl = 'https://graph.facebook.com/' + res.id + '/picture?type=large';
        this.userData.setUser({"name":this.userName, "picUrl":this.profilePictureUrl});
      })
      .catch();
  }

  getSocket() {
    this.userData.setLastState('home');
    this.userData.setState('warming');
    this.router.navigate(['warming']);
  }

  onLoadedPicture() {
    document.getElementById('user-info-col').className = 'col';
    document.getElementById('home-spinner').className = 'preloader-wrapper big hide';
  }

  ngOnInit() {
    this.userData.setLastState('home');
    this.userData.setState('home');
    this.getProfile();
  }

  logout(){
    this.userData.setUser(undefined);
    this.userData.setLastState(undefined);
    this.userData.setState(undefined);
    this.fb.logout().then((res: any) => {
      this.router.navigate(['']);
    }).catch();
  }
}


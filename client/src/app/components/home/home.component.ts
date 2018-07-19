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

  constructor(private fb: FacebookService, private router: Router, private userData: UserDataService) {}

  currentUser;
  userName;
  profilePictureUrl;
  stats;

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
    this.router.navigate(['warming']);
  }

  onLoadedPicture() {
    document.getElementById('user-info-col').className = 'col';
    document.getElementById('home-spinner').className = 'preloader-wrapper big hide';
  }

  ngOnInit() {
    this.socket = io('https://powerful-dawn-70439.herokuapp.com');
    this.userData.setSocket(this.socket);
    window.localStorage.setItem("state", "home");
    window.localStorage.setItem("futureState", undefined);
    this.userName = window.localStorage.getItem("userName");
    this.profilePictureUrl = window.localStorage.getItem("userPic");
    this.socket.emit('getStats', this.userName);
  }

  logout(){
    window.localStorage.setItem("state", undefined);
    window.localStorage.setItem("userName", undefined);
    window.localStorage.setItem("userPic", undefined);
    this.fb.logout().then((res: any) => {
    }).catch();
    this.router.navigate(['']);
  }

  getStats() {
    const that = this;
    this.socket.on('stats', function (json) {
      console.log(json);
      that.stats = json;
    });
  }

  getLastStats(stats, length) {
    return stats.slice(0, length);
  }

  getOpponent(stat) {
    return stat.player1 === this.userName ? stat.player2 : stat.player1;
  }

  getResult(stat) {
    return stat.winner === this.userName ? 'Winner' : 'Loser';
  }

  getWins(stats) {
    const that = this;
    return stats ? stats.filter(stat => stat.winner === that.userName).length : [];
  }

  getLosses(stats) {
    const that = this;
    return stats ? stats.filter(stat => stat.winner !== that.userName).length : [];
  }
}


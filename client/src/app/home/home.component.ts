import {Component, OnInit} from '@angular/core';
import {FacebookService, LoginResponse} from 'ngx-facebook';
import {_document} from "@angular/platform-browser/src/browser";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private fb: FacebookService) {
  }

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

  onLoadedPicture() {
    document.getElementById('user-play-card').className = 'card small horizontal';
    document.getElementById('home-spinner').className = 'preloader-wrapper big hide';
  }

  ngOnInit() {
    this.getProfile();
  }
}

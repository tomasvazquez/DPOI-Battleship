import {Component, OnInit} from '@angular/core';
import {FacebookService, LoginResponse} from 'ngx-facebook';

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
  loadedPicture;

  getProfile() {
    this.fb.api('/me')
      .then((res: any) => {
        this.currentUser = res;
        this.profilePictureUrl = 'https://graph.facebook.com/' + res.id + '/picture?type=large';
      })
      .catch();
  }

  ngOnInit() {
    this.loadedPicture = false;
    this.getProfile();
    this.loadedPicture = true;
  }
}

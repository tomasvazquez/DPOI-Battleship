import { Component, OnInit } from '@angular/core';
import { FacebookService, LoginResponse } from 'ngx-facebook';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private fb: FacebookService) {
  }

  currentUser;

  getProfile() {
    this.fb.api('/me')
      .then((res: any) => {
        this.currentUser = res;
        console.log('Got the users profile', res);
      })
      .catch();
  }

  ngOnInit() {
    this.getProfile();
  }
}

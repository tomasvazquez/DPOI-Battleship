import { Component, OnInit } from '@angular/core';
import {FacebookService, LoginResponse} from 'ngx-facebook';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private fb: FacebookService, private router: Router) { }

  loginWithFacebook(): void {

    this.fb.login()
      .then((response: LoginResponse) => {
        if (response.status === 'connected') {
            this.router.navigate(['home']);
        }
      })
      .catch((error: any) => console.error(error));

  }

  ngOnInit() {
  }

}

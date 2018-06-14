import {Component, OnInit} from '@angular/core';
import {FacebookService, LoginResponse} from 'ngx-facebook';
import {Router} from '@angular/router';
import {UserDataService} from "../../user-data.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private fb: FacebookService, private router: Router, private userData: UserDataService) {}

  loginWithFacebook(): void {
    const that = this;

    this.fb.login()
      .then((response: LoginResponse) => {
        if (response.status === 'connected') {
          that.fb.api('/me')
            .then((res: any) => {
              that.userData.setUser({"name": res.name, "picUrl": 'https://graph.facebook.com/' + res.id + '/picture?type=large'});
              window.localStorage.setItem("userName", res.name);
              window.localStorage.setItem("userPic", "https://graph.facebook.com/" + res.id + "/picture?type=large");
              window.localStorage.setItem("state", undefined);
              that.router.navigate(['home']);
            })
            .catch();
        }
      })
      .catch((error: any) => console.error(error));
  }

  ngOnInit() {
    window.localStorage.setItem("state", undefined);
    window.localStorage.setItem("futureState", undefined);
    window.localStorage.setItem("userName", undefined);
  }

}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';

const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  { path: 'home',
    component: HomeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}]
})

export class AppRoutingModule {}

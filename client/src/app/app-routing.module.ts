import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {WarmingComponent} from './warming/warming.component';

const appRoutes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  { path: 'home',
    component: HomeComponent
  },
  { path: 'warming',
    component: WarmingComponent
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

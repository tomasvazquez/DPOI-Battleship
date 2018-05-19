import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {WarmingComponent} from "./components/warming/warming.component";
import {GameComponent} from "./components/game/game.component";

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
  },
  { path: 'game',
    component: GameComponent
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

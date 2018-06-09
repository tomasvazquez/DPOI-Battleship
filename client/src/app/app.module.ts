import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FacebookModule} from 'ngx-facebook';

import {AppComponent} from './app.component';
import {HomeComponent} from './components/home/home.component';
import {AppRoutingModule} from './app-routing.module';
import {LoginComponent} from './components/login/login.component';
import {WarmingComponent} from './components/warming/warming.component';
import {DndModule} from "ngx-drag-drop";
import { GameComponent } from './components/game/game.component';
import {AuthGuard} from "./auth-guard.service";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    WarmingComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FacebookModule.forRoot(),
    DndModule
  ],
  providers: [
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

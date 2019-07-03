import { NgModule } from '@angular/core';
import { SiteModule } from '../site/app.module';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    SiteModule,
    AppRoutingModule,
    RouterModule
  ]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HomeComponent } from "./home.component";
import { HomeRoutingModule } from "./home-routing.module";
import { LibraryModule } from "../modules/library/library.module";

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule
    HomeRoutingModule,
    LibraryModule
  ],
  declarations: [
    HomeComponent
  ],
  exports: [
    HomeComponent
  ]
})
export class HomeModule { }

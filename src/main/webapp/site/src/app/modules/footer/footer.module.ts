import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatIconModule, MatToolbarModule } from '@angular/material';

import { FooterComponent } from './footer.component';
import { AppRoutingModule } from "../../app-routing.module";

const materialModules = [
  MatButtonModule, MatIconModule, MatToolbarModule
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    AppRoutingModule,
    materialModules
  ],
  declarations: [FooterComponent],
  exports: [FooterComponent]
})
export class FooterModule { }

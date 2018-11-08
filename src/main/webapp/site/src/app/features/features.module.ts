import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material';

import { FeaturesComponent } from "./features.component";
import { FeaturesRoutingModule } from "./features-routing.module";
import { SharedModule } from "../modules/shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    FeaturesRoutingModule,
    SharedModule
  ],
  declarations: [
    FeaturesComponent
  ],
  exports: [
    FeaturesComponent,
    SharedModule
  ]
})
export class FeaturesModule { }

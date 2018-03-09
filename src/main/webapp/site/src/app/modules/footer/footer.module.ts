import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material';

import { FooterComponent } from './footer.component';

const materialModules = [
  MatToolbarModule
];

@NgModule({
  imports: [
    CommonModule,
    materialModules
  ],
  declarations: [FooterComponent],
  exports: [FooterComponent]
})
export class FooterModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatDividerModule, MatIconModule } from '@angular/material';

import { AppRoutingModule } from '../../app-routing.module';
import { MobileMenuComponent } from './mobile-menu.component';

@NgModule({
  imports: [
    AppRoutingModule,
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  declarations: [MobileMenuComponent],
  exports: [MobileMenuComponent]
})
export class MobileMenuModule {}

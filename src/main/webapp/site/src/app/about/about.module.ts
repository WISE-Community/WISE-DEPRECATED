import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material';

import { AboutComponent } from './about.component';
import { AboutRoutingModule } from './about-routing.module';
import { SharedModule } from '../modules/shared/shared.module';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, MatIconModule, AboutRoutingModule, SharedModule],
  declarations: [AboutComponent],
  exports: [AboutComponent, SharedModule]
})
export class AboutModule {}

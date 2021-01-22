import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MomentModule } from 'ngx-moment';
import { FooterComponent } from './footer.component';
import { AppRoutingModule } from '../../app-routing.module';

const materialModules = [MatButtonModule, MatIconModule, MatToolbarModule];

@NgModule({
  imports: [CommonModule, FlexLayoutModule, AppRoutingModule, materialModules, MomentModule],
  declarations: [FooterComponent],
  exports: [FooterComponent]
})
export class FooterModule {}

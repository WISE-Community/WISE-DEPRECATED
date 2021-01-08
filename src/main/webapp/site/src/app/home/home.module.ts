import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { LibraryModule } from '../modules/library/library.module';
import { SharedModule } from '../modules/shared/shared.module';

@NgModule({
  imports: [CommonModule, HomeRoutingModule, LibraryModule, SharedModule, RouterModule],
  declarations: [HomeComponent],
  exports: [HomeComponent, SharedModule]
})
export class HomeModule {}

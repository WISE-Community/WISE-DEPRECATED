import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AuthGuard } from './auth.guard';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule
  ],
  declarations: [
    AdminComponent
  ],
  entryComponents: [

  ],
  providers: [
    AuthGuard
  ],
  exports: [
    AdminComponent
  ]
})
export class AdminModule { }

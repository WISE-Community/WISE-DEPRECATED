import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from '../../app-routing.module';
import {
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatToolbarModule
} from '@angular/material';

import { HeaderComponent } from './header.component';
import { HeaderSigninComponent } from './header-signin/header-signin.component';
import { HeaderLinksComponent } from './header-links/header-links.component';
import { HeaderAccountMenuComponent } from './header-account-menu/header-account-menu.component';
import { ConfigService } from '../../services/config.service';
import { UserService } from '../../services/user.service';

const materialModules = [
  MatButtonModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatToolbarModule
];

@NgModule({
  imports: [CommonModule, FlexLayoutModule, AppRoutingModule, materialModules],
  declarations: [
    HeaderComponent,
    HeaderSigninComponent,
    HeaderLinksComponent,
    HeaderAccountMenuComponent
  ],
  providers: [ConfigService, UserService],
  exports: [HeaderComponent]
})
export class HeaderModule {}

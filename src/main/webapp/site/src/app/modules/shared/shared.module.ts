import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatProgressBarModule
];

import { BlurbComponent } from './blurb/blurb.component';
import { CallToActionComponent } from './call-to-action/call-to-action.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SelectMenuComponent } from './select-menu/select-menu.component';
import { EditPasswordComponent } from './edit-password/edit-password.component';
import { UnlinkGoogleAccountConfirmComponent } from './unlink-google-account-confirm/unlink-google-account-confirm.component';
import { UnlinkGoogleAccountPasswordComponent } from './unlink-google-account-password/unlink-google-account-password.component';
import { UnlinkGoogleAccountSuccessComponent } from './unlink-google-account-success/unlink-google-account-success.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    materialModules
  ],
  exports: [
    materialModules,
    FlexLayoutModule,
    BlurbComponent,
    CallToActionComponent,
    HeroSectionComponent,
    SearchBarComponent,
    SelectMenuComponent,
    EditPasswordComponent
  ],
  declarations: [
    BlurbComponent,
    CallToActionComponent,
    HeroSectionComponent,
    SearchBarComponent,
    SelectMenuComponent,
    EditPasswordComponent,
    UnlinkGoogleAccountConfirmComponent,
    UnlinkGoogleAccountPasswordComponent,
    UnlinkGoogleAccountSuccessComponent
  ]
})
export class SharedModule {}

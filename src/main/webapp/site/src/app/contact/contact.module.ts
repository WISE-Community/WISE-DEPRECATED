import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactRoutingModule } from './contact-routing.module';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatRadioModule,
  MatTabsModule,
  MatTableModule,
  MatTooltipModule
} from '@angular/material';
import { SharedModule } from '../modules/shared/shared.module';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

const materialModules = [
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatMenuModule,
  MatNativeDateModule,
  MatProgressBarModule,
  MatRadioModule,
  MatTabsModule,
  MatTableModule,
  MatTooltipModule
];

@NgModule({
  imports: [
    CommonModule,
    ContactRoutingModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    materialModules,
    RecaptchaModule.forRoot(),
    RecaptchaFormsModule
  ],
  declarations: [ContactFormComponent],
  exports: [ContactFormComponent, materialModules]
})
export class ContactModule {}

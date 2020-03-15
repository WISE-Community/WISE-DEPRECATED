import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatProgressBarModule
} from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
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
import { NewsModule } from '../../news/news.module';

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
    EditPasswordComponent
  ]
})
export class SharedModule { }

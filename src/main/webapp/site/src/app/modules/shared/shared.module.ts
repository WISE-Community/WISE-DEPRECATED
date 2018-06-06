import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule } from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule
];

import { SearchBarComponent } from './search-bar/search-bar.component';
import { SelectMenuComponent } from './select-menu/select-menu.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    materialModules
  ],
  exports: [
    materialModules,
    FlexLayoutModule,
    HeroSectionComponent,
    SearchBarComponent,
    SelectMenuComponent
  ],
  declarations: [
    SearchBarComponent, SelectMenuComponent, HeroSectionComponent]
})
export class SharedModule { }

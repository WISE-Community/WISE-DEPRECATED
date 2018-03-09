import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule } from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule
];

import { SearchBarComponent } from './search-bar/search-bar.component';
import { SelectMenuComponent } from './select-menu/select-menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    materialModules
  ],
  exports: [
    materialModules,
    SearchBarComponent,
    SelectMenuComponent
  ],
  declarations: [SearchBarComponent, SelectMenuComponent]
})
export class SharedModule { }

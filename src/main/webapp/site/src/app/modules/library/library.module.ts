import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LibraryComponent } from './library.component';
import { LibraryGroupThumbsComponent } from './library-group-thumbs/library-group-thumbs.component';
import { LibraryProjectComponent, LibraryProjectDetailsComponent } from './library-project/library-project.component';
import { LibraryService } from "../../services/library.service";

import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatExpansionModule } from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatExpansionModule
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    materialModules
  ],
  declarations: [
    LibraryComponent,
    LibraryGroupThumbsComponent,
    LibraryProjectComponent,
    LibraryProjectDetailsComponent
  ],
  entryComponents: [ LibraryProjectDetailsComponent ],
  exports: [
    LibraryComponent,
    materialModules
  ],
  providers: [
    LibraryService
  ]
})
export class LibraryModule { }

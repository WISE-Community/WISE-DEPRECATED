import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { LibraryComponent } from './library.component';
import { LibraryGroupThumbsComponent } from './library-group-thumbs/library-group-thumbs.component';
import { LibraryProjectComponent, LibraryProjectDetailsComponent } from './library-project/library-project.component';
import { LibraryProjectDisciplineIconComponent } from './library-project-discipline-icon/library-project-discipline-icon.component';
import { LibraryService } from "../../services/library.service";

import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatExpansionModule,
  MatTooltipModule} from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule,
  MatExpansionModule,
  MatTooltipModule
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
    LibraryProjectDetailsComponent,
    LibraryProjectDisciplineIconComponent
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

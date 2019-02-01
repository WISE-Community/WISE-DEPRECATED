import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LibraryGroupThumbsComponent } from './library-group-thumbs/library-group-thumbs.component';
import { LibraryProjectComponent } from './library-project/library-project.component';
import { LibraryProjectDetailsComponent } from "./library-project-details/library-project-details.component";
import { LibraryProjectDisciplinesComponent } from './library-project-disciplines/library-project-disciplines.component';
import { LibraryProjectMenuComponent } from "./library-project-menu/library-project-menu.component";
import { LibraryService } from "../../services/library.service";
import { RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";

import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule,
  MatPaginatorModule,
  MatPaginatorIntl,
  MatProgressBarModule,
  MatOptionModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule } from '@angular/material';
import { TimelineModule } from "../timeline/timeline.module";
import { LibraryFiltersComponent } from './library-filters/library-filters.component';
import { HomePageProjectLibraryComponent } from './home-page-project-library/home-page-project-library.component';
import { TeacherProjectLibraryComponent } from './teacher-project-library/teacher-project-library.component';
import { OfficialLibraryComponent, OfficialLibraryDetailsComponent } from './official-library/official-library.component';
import { CommunityLibraryComponent, CommunityLibraryDetailsComponent } from './community-library/community-library.component';
import { PersonalLibraryComponent, PersonalLibraryDetailsComponent } from './personal-library/personal-library.component';
import { ShareProjectDialogComponent } from './share-project-dialog/share-project-dialog.component';
import { CopyProjectDialogComponent } from './copy-project-dialog/copy-project-dialog.component';
import { LibraryPaginatorIntl } from './libraryPaginatorIntl';

const materialModules = [
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule,
  MatOptionModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatSelectModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    materialModules,
    SharedModule,
    TimelineModule
  ],
  declarations: [
    LibraryGroupThumbsComponent,
    LibraryProjectComponent,
    LibraryProjectDetailsComponent,
    LibraryProjectDisciplinesComponent,
    LibraryProjectMenuComponent,
    LibraryFiltersComponent,
    HomePageProjectLibraryComponent,
    TeacherProjectLibraryComponent,
    OfficialLibraryComponent,
    OfficialLibraryDetailsComponent,
    CommunityLibraryComponent,
    CommunityLibraryDetailsComponent,
    PersonalLibraryComponent,
    PersonalLibraryDetailsComponent,
    ShareProjectDialogComponent,
    CopyProjectDialogComponent
  ],
  entryComponents: [
    CommunityLibraryDetailsComponent,
    CopyProjectDialogComponent,
    LibraryProjectDetailsComponent,
    OfficialLibraryDetailsComponent,
    PersonalLibraryDetailsComponent,
    ShareProjectDialogComponent
  ],
  exports: [
    HomePageProjectLibraryComponent,
    ReactiveFormsModule,
    TeacherProjectLibraryComponent,
    materialModules
  ],
  providers: [
    LibraryService,
    { provide: MatPaginatorIntl, useClass: LibraryPaginatorIntl }
  ]
})
export class LibraryModule { }

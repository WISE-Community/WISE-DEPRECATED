import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { LibraryGroupThumbsComponent } from './library-group-thumbs/library-group-thumbs.component';
import { LibraryProjectComponent, LibraryProjectDetailsComponent } from './library-project/library-project.component';
import { LibraryProjectDisciplineIconComponent } from './library-project-discipline-icon/library-project-discipline-icon.component';
import { LibraryService } from "../../services/library.service";
import { RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";

import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatOptionModule,
  MatSelectModule,
  MatTabsModule,
  MatTooltipModule} from '@angular/material';
import { TimelineModule } from "../timeline/timeline.module";
import { LibraryFiltersComponent } from './library-filters/library-filters.component';
import { HomePageProjectLibraryComponent } from './home-page-project-library/home-page-project-library.component';
import { TeacherProjectLibraryComponent } from './teacher-project-library/teacher-project-library.component';
import { OfficialLibraryComponent } from './official-library/official-library.component';
import { CommunityLibraryComponent } from './community-library/community-library.component';
import { PersonalLibraryComponent } from './personal-library/personal-library.component';

const materialModules = [
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatOptionModule,
  MatSelectModule,
  MatTabsModule,
  MatTooltipModule
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
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
    LibraryProjectDisciplineIconComponent,
    LibraryFiltersComponent,
    HomePageProjectLibraryComponent,
    TeacherProjectLibraryComponent,
    OfficialLibraryComponent,
    CommunityLibraryComponent,
    PersonalLibraryComponent
  ],
  entryComponents: [ LibraryProjectDetailsComponent ],
  exports: [
    HomePageProjectLibraryComponent,
    ReactiveFormsModule,
    TeacherProjectLibraryComponent,
    materialModules
  ],
  providers: [
    LibraryService
  ]
})
export class LibraryModule { }

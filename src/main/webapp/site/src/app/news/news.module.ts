import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from "../modules/timeline/timeline.module";
import { NewsComponent } from "./news.component";
import { MomentModule } from 'ngx-moment';
import { NewsRoutingModule } from "./news-routing.module";
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedModule } from '../modules/shared/shared.module';
import { NewsItemDialogComponent } from './news-item-dialog/news-item-dialog.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatSnackBarModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MomentModule,
    NewsRoutingModule,
    TimelineModule,
    SharedModule,
    CKEditorModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  declarations: [
    NewsComponent,
    NewsItemDialogComponent
  ],
  exports: [
    NewsComponent
  ],
  entryComponents: [
    NewsItemDialogComponent
  ]
})
export class NewsModule { }

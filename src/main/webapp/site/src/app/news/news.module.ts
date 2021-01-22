import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from '../modules/timeline/timeline.module';
import { NewsComponent } from './news.component';
import { MomentModule } from 'ngx-moment';
import { NewsRoutingModule } from './news-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MomentModule,
    NewsRoutingModule,
    TimelineModule
  ],
  declarations: [NewsComponent]
})
export class NewsModule {}

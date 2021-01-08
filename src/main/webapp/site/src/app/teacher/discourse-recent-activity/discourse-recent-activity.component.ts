import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'discourse-recent-activity',
  templateUrl: 'discourse-recent-activity.component.html',
  styleUrls: ['discourse-recent-activity.component.scss']
})
export class DiscourseRecentActivityComponent {
  discourseURL: string;
  topics: any;

  constructor(private configService: ConfigService, private http: HttpClient) {}

  ngOnInit() {
    this.discourseURL = this.configService.getDiscourseURL();
    this.http
      .get(`${this.discourseURL}/latest.json?order=activity`)
      .subscribe(({ topic_list, users }: any) => {
        this.topics = topic_list.topics
          .filter((topic) => {
            return !topic.pinned_globally;
          })
          .slice(0, 3);
      });
  }
}

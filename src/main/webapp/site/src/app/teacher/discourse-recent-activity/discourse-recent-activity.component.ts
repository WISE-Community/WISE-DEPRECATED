import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { ConfigService } from "../../services/config.service";

@Component({
  selector: 'discourse-recent-activity',
  templateUrl: 'discourse-recent-activity.component.html'
})
export class DiscourseRecentActivityComponent {

  discourseURL: string;
  topics: any;
  users: any;

  constructor(private configService: ConfigService, private http: HttpClient) {
  }

  ngOnInit() {
    this.discourseURL = this.configService.getDiscourseURL();
    this.http.get(`${this.discourseURL}/latest.json?order=activity`)
        .subscribe(({topic_list, users}: any)=> {
      this.topics = topic_list.topics.slice(0,3);
      this.users = users;
    });
  }

  getName(userId: number): string {
    for (const user of this.users) {
      if (user.id === userId) {
        return user.name;
      }
    }
    return "";
  }

  launchDiscourse(): void {
    window.open(`${this.discourseURL}/session/sso`);
  }
}

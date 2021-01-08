import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '../../services/config.service';
import { DiscourseRecentActivityComponent } from './discourse-recent-activity.component';

describe('DiscourseRecentActivityComponent', () => {
  let component: DiscourseRecentActivityComponent;
  let configService: ConfigService;
  let http: HttpTestingController;
  const discourseURL = 'http://localhost:9292';
  const sampleLatestResponse = {
    users: [],
    topic_list: {
      topics: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
    }
  };

  class MockConfigService {
    getDiscourseURL() {
      return discourseURL;
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DiscourseRecentActivityComponent,
        { provide: ConfigService, useClass: MockConfigService }
      ]
    });
    component = TestBed.inject(DiscourseRecentActivityComponent);
    configService = TestBed.inject(ConfigService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should create and show 3 latest topics', () => {
    component.ngOnInit();
    http.expectOne(`${discourseURL}/latest.json?order=activity`).flush(sampleLatestResponse);
    expect(component.topics.length).toEqual(3);
  });
});

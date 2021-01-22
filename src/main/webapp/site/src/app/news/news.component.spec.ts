import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsComponent } from './news.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NewsService } from '../services/news.service';
import { MomentModule } from 'ngx-moment';
import { News } from '../domain/news';
import { Observable } from 'rxjs';
import { User } from '../domain/user';
import * as moment from 'moment';
import { configureTestSuite } from 'ng-bullet';

const createNewsItem = (id, date, type, title, news, owner) => {
  return new News({
    id: id,
    date: moment(date, 'YYYY-MM-DD HH:mm:ss.SSS'),
    type: type,
    title: title,
    news: news,
    owner: owner
  });
};

const createUser = (id, firstName, lastName, displayName) => {
  return new User({
    id: id,
    firstName: firstName,
    lastName: lastName,
    displayName: displayName
  });
};

const news1Date = '2018-10-16 18:45:38.0';
const news1Title = 'Testing new portal website';
const news1Text =
  'We have begun testing the new website with some of our users. Once that is completed, everyone will be able to use the new website.';

const news2Date = '2018-9-21 15:37:14.0';
const news2Title = 'Working on a new portal website';
const news2Text =
  'We have been working on a new portal website. The new website will have a more modern user interface.';

export class MockNewsService {
  getAllNews(): Observable<News[]> {
    return Observable.create((observer) => {
      const allNewsItems: News[] = [];
      const user1 = createUser(100, 'Spongebob', 'Squarepants', 'Spongebob Squarepants');
      const news1 = createNewsItem(1, news1Date, 'public', news1Title, news1Text, user1);
      allNewsItems.push(news1);
      const user2 = createUser(100, 'Patrick', 'Star', 'Patrick Star');
      const news2 = createNewsItem(1, news2Date, 'public', news2Title, news2Text, user2);
      allNewsItems.push(news2);
      observer.next(allNewsItems);
      observer.complete();
    });
  }
}

describe('NewsComponent', () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;

  const getNewsItem = (newsItemNumber) => {
    const timelineItems = fixture.debugElement.nativeElement.querySelectorAll('app-timeline-item');
    return timelineItems[newsItemNumber];
  };

  const getNewsDate = (timelineItem) => {
    return timelineItem.querySelector('strong').innerHTML;
  };

  const getNewsTitle = (timelineItem) => {
    return timelineItem.querySelector('h2').innerHTML;
  };

  const getNewsText = (timelineItem) => {
    return timelineItem.querySelector('div').innerHTML;
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [NewsComponent],
      imports: [MomentModule],
      providers: [{ provide: NewsService, useClass: MockNewsService }],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the timeline items', () => {
    const timelineItems = fixture.debugElement.nativeElement.querySelectorAll('app-timeline-item');
    expect(timelineItems.length).toEqual(2);
  });

  it('should display the news date', () => {
    const newsItem1 = getNewsItem(0);
    const date1 = getNewsDate(newsItem1);
    expect(date1).toContain('Oct 16, 2018');
    const newsItem2 = getNewsItem(1);
    const date2 = getNewsDate(newsItem2);
    expect(date2).toContain('Sep 21, 2018');
  });

  it('should display the news title', () => {
    const newsItem1 = getNewsItem(0);
    const title1 = getNewsTitle(newsItem1);
    expect(title1).toContain(news1Title);
    const newsItem2 = getNewsItem(1);
    const title2 = getNewsTitle(newsItem2);
    expect(title2).toContain(news2Title);
  });

  it('should display the news text', () => {
    const newsItem1 = getNewsItem(0);
    const text1 = getNewsText(newsItem1);
    expect(text1).toContain(news1Text);
    const newsItem2 = getNewsItem(1);
    const text2 = getNewsText(newsItem2);
    expect(text2).toContain(news2Text);
  });
});

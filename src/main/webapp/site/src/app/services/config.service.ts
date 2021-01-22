import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Config } from '../domain/config';
import { Announcement } from '../domain/announcement';

@Injectable()
export class ConfigService {
  private userConfigUrl = '/api/user/config';
  private announcementUrl = '/announcement';
  private config$: BehaviorSubject<Config> = new BehaviorSubject<Config>(null);
  private timeDiff: number = 0;

  constructor(private http: HttpClient) {}

  getConfig(): Observable<Config> {
    return this.config$;
  }

  retrieveConfig() {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    this.http
      .get<Config>(this.userConfigUrl, { headers: headers })
      .subscribe((config) => {
        this.config$.next(config);
        this.timeDiff = Date.now() - config.currentTime;
      });
  }

  getContextPath() {
    return this.config$.getValue().contextPath;
  }

  getDiscourseURL() {
    return this.config$.getValue().discourseURL;
  }

  getGoogleAnalyticsId() {
    return this.config$.getValue().googleAnalyticsId;
  }

  getGoogleClientId() {
    return this.config$.getValue().googleClientId;
  }

  isGoogleClassroomEnabled() {
    return this.config$.getValue().isGoogleClassroomEnabled;
  }

  getRecaptchaPublicKey() {
    return this.config$.getValue().recaptchaPublicKey;
  }

  getWISEHostname() {
    return this.config$.getValue().wiseHostname;
  }

  getWISE4Hostname() {
    return this.config$.getValue().wise4Hostname;
  }

  getCurrentServerTime() {
    return Date.now() - this.timeDiff;
  }

  getAnnouncement(): Observable<Announcement> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get(this.announcementUrl, { headers: headers }) as Observable<Announcement>;
  }
}

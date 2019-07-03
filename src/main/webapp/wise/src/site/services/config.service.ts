import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { Config } from "../domain/config";
import { User } from "../domain/user";

@Injectable()
export class ConfigService {

  private userConfigUrl = 'api/user/config';
  private studentConfigUrl = 'api/student/config';
  private teacherConfigUrl = 'api/teacher/config';
  private config$: BehaviorSubject<Config> = new BehaviorSubject<Config>(null);
  private timeDiff: number = 0;

  constructor(private http: HttpClient) {
  }

  getConfig(): Observable<Config> {
    return this.config$;
  }

  retrieveConfig(user?: User) {
    let configUrl = this.userConfigUrl;
    if (user.role == 'student') {
      configUrl = this.studentConfigUrl;
    } else if (user.role == 'teacher' || user.role == 'researcher' || user.role == 'admin') {
      configUrl = this.teacherConfigUrl;
    }
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    this.http.get<Config>(configUrl, { headers: headers })
      .subscribe(config => {
        this.config$.next(config);
        this.timeDiff = Date.now() - config.currentTime;
      });
  }

  getContextPath() {
    return this.config$.getValue().contextPath;
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

  getCurrentServerTime() {
    return Date.now() - this.timeDiff;
  }
}

'use strict';

import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './configService';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SessionService {
  private warningVisible: boolean = false;
  private defaultForceLogoutAfterWarningInterval: number = this.convertMinutesToSeconds(5);
  private forceLogoutAfterWarningInterval: number;
  private showWarningInterval: number;
  private checkMouseEventInterval: number;
  private lastActivityTimestamp: number;
  private exitSource: Subject<any> = new Subject<any>();
  public exit$: Observable<any> = this.exitSource.asObservable();
  private showSessionWarningSource: Subject<any> = new Subject<any>();
  public showSessionWarning$: Observable<any> = this.showSessionWarningSource.asObservable();
  private logOutSource: Subject<void> = new Subject<void>();
  public logOut$ = this.logOutSource.asObservable();

  constructor(
    protected upgrade: UpgradeModule,
    protected http: HttpClient,
    protected ConfigService: ConfigService
  ) {}

  calculateIntervals(sessionTimeout): any {
    const forceLogoutAfterWarningInterval: number = Math.min(
      sessionTimeout * 0.1,
      this.defaultForceLogoutAfterWarningInterval
    );
    const showWarningInterval: number = sessionTimeout - forceLogoutAfterWarningInterval;
    return {
      showWarningInterval: showWarningInterval,
      forceLogoutAfterWarningInterval: forceLogoutAfterWarningInterval
    };
  }

  goHome() {
    this.broadcastExit();
    this.upgrade.$injector.get('$location').url(this.ConfigService.getConfigParam('userType'));
  }

  broadcastExit() {
    this.exitSource.next();
  }

  logOut() {
    window.location.href = this.ConfigService.getSessionLogOutURL();
  }

  initializeSession() {
    const intervals: any = this.calculateIntervals(
      this.ConfigService.getConfigParam('sessionTimeout')
    );
    this.showWarningInterval = intervals.showWarningInterval;
    this.forceLogoutAfterWarningInterval = intervals.forceLogoutAfterWarningInterval;
    this.checkMouseEventInterval = this.convertMinutesToMilliseconds(1);
    this.updateLastActivityTimestamp();
    this.startCheckMouseEvent();
  }

  startCheckMouseEvent() {
    setInterval(() => {
      this.checkMouseEvent();
    }, this.checkMouseEventInterval);
  }

  convertMinutesToSeconds(minutes): number {
    return minutes * 60;
  }

  convertMinutesToMilliseconds(minutes): number {
    return minutes * 60 * 1000;
  }

  /**
   * Note: This does not get called when the warning popup is being shown.
   */
  mouseMoved() {
    this.updateLastActivityTimestamp();
  }

  updateLastActivityTimestamp() {
    this.lastActivityTimestamp = new Date().getTime();
  }

  checkMouseEvent() {
    if (this.isActiveWithinLastMinute()) {
      this.renewSession();
    } else {
      this.checkForLogout();
    }
  }

  checkForLogout() {
    if (this.isInactiveLongEnoughToForceLogout()) {
      this.checkIfSessionIsActive().subscribe((isSessionActive) => {
        if (!isSessionActive) {
          this.forceLogOut();
        }
      });
    } else if (this.isInactiveLongEnoughToWarn() && !this.isShowingWarning()) {
      this.showWarning();
    }
  }

  isActiveWithinLastMinute(): boolean {
    return new Date().getTime() - this.lastActivityTimestamp < this.convertMinutesToMilliseconds(1);
  }

  isInactiveLongEnoughToForceLogout(): boolean {
    return (
      this.getInactiveTimeInSeconds() >=
      this.showWarningInterval + this.forceLogoutAfterWarningInterval
    );
  }

  isInactiveLongEnoughToWarn(): boolean {
    return this.getInactiveTimeInSeconds() >= this.showWarningInterval;
  }

  isShowingWarning(): boolean {
    return this.warningVisible;
  }

  getInactiveTimeInSeconds(): number {
    return Math.floor(this.getInactiveTimeInMilliseconds() / 1000);
  }

  getInactiveTimeInMilliseconds(): number {
    return new Date().getTime() - this.lastActivityTimestamp;
  }

  forceLogOut() {
    this.logOutSource.next();
  }

  showWarning() {
    this.warningVisible = true;
    this.broadcastShowSessionWarning();
  }

  broadcastShowSessionWarning() {
    this.showSessionWarningSource.next();
  }

  closeWarningAndRenewSession() {
    this.warningVisible = false;
    this.updateLastActivityTimestamp();
    this.renewSession();
  }

  checkIfSessionIsActive() {
    return this.http.get(this.ConfigService.getConfigParam('renewSessionURL'));
  }

  renewSession() {
    this.checkIfSessionIsActive().subscribe((isSessionActive) => {
      if (!isSessionActive) {
        this.logOut();
      }
    });
  }
}

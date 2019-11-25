import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SessionService {
  ConfigService;
  warningVisible: boolean = false;
  defaultForceLogoutAfterWarningInterval = this.convertMinutesToSeconds(5);
  lastActivityTimestamp;
  showWarningInterval;
  forceLogoutAfterWarningInterval;
  checkMouseEventInterval = this.convertMinutesToMilliseconds(1);

  constructor(private http: HttpClient) {
    //const sessionTimeout = this.ConfigService.getConfigParam('sessionTimeout');
    const sessionTimeout = 30000;
    this.calculateIntervals(sessionTimeout);
    this.updateLastActivityTimestamp();
    this.initializeSession();
  }

  calculateIntervals(sessionTimeout) {
    this.forceLogoutAfterWarningInterval =
        Math.min(sessionTimeout * 0.1, this.defaultForceLogoutAfterWarningInterval);
    this.showWarningInterval = sessionTimeout - this.forceLogoutAfterWarningInterval;
  }

  goHome() {
    //const wiseBaseURL = this.ConfigService.getWISEBaseURL();
    //const userType = this.ConfigService.getConfigParam('userType');
    //let href = this.ConfigService.getMainHomePageURL();
    const wiseBaseURL = '';
    const userType = 'student';
    let href = '';

    if (userType === 'student') {
      href = wiseBaseURL + '/student';
    } else if (userType === 'teacher') {
      href = wiseBaseURL + '/teacher';
    }
    window.location.href = href;
  }

  logOut() {
    //this.$rootScope.$broadcast('exit');
    //window.location.href = this.ConfigService.getSessionLogOutURL();
    window.location.href = `/logout`;
  }

  initializeSession() {
    //if (!this.ConfigService.isPreview()) {
      this.startCheckMouseEvent();
    //}
  }

  startCheckMouseEvent() {
    setInterval(() => { this.checkMouseEvent(); }, this.checkMouseEventInterval);
  }

  convertMinutesToSeconds(minutes) {
    return minutes * 60;
  }

  convertMinutesToMilliseconds(minutes) {
    return minutes * 60 * 1000;
  }

  // Note: This does not get called when the warning popup is being shown.
  mouseMoved() {
    this.updateLastActivityTimestamp();
  }

  updateLastActivityTimestamp() {
    this.lastActivityTimestamp = new Date().getTime();
  }

  checkMouseEvent() {
    if (this.isActiveWithinLastMinute()) {
      this.renewSession();
    } else if (this.isInactiveLongEnoughToForceLogout()) {
      this.forceLogOut();
    } else if (this.isInactiveLongEnoughToWarn() && !this.isShowingWarning()) {
      this.showWarning();
    }
  }

  isActiveWithinLastMinute() {
    return (new Date().getTime() - this.lastActivityTimestamp) < this.convertMinutesToMilliseconds(1);
  }

  isInactiveLongEnoughToForceLogout() {
    return this.getInactiveTimeInSeconds() >=
        (this.showWarningInterval + this.forceLogoutAfterWarningInterval);
  }

  isInactiveLongEnoughToWarn() {
    return this.getInactiveTimeInSeconds() >= this.showWarningInterval;
  }

  isShowingWarning() {
    return this.warningVisible;
  }

  getInactiveTimeInSeconds() {
    return Math.floor(this.getInactiveTimeInMilliseconds() / 1000);
  }

  getInactiveTimeInMilliseconds() {
    return new Date().getTime() - this.lastActivityTimestamp;
  }

  forceLogOut() {
    this.logOut();
  }

  showWarning() {
    this.warningVisible = true;
    //this.$rootScope.$broadcast('showSessionWarning');
  }

  closeWarningAndRenewSession() {
    this.warningVisible = false;
    this.updateLastActivityTimestamp();
    this.renewSession();
  }

  renewSession() {
    //const renewSessionURL = this.ConfigService.getConfigParam('renewSessionURL');
    const renewSessionURL = `session/renew`;
    this.http.get<any>(renewSessionURL).subscribe(response => {
      // TODO: if user is logged out, show message and redirect to home page
    });
  }
}

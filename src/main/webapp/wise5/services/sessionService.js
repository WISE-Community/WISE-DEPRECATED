class SessionService {
  constructor($http, $rootScope, ConfigService) {
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.warningVisible = false;
    this.defaultForceLogoutAfterWarningInterval = this.convertMinutesToSeconds(5);
    const intervals = this.calculateIntervals(this.ConfigService.getConfigParam('sessionTimeout'));
    this.showWarningInterval = intervals.showWarningInterval;
    this.forceLogoutAfterWarningInterval = intervals.forceLogoutAfterWarningInterval;
    this.checkMouseEventInterval = this.convertMinutesToMilliseconds(1);
    this.updateLastActivityTimestamp();
    this.initializeListeners();
    this.initializeSession();
  }

  calculateIntervals(sessionTimeout) {
    const forceLogoutAfterWarningInterval =
        Math.min(sessionTimeout * 0.1, this.defaultForceLogoutAfterWarningInterval);
    const showWarningInterval = sessionTimeout - forceLogoutAfterWarningInterval;
    return {
      showWarningInterval: showWarningInterval,
      forceLogoutAfterWarningInterval: forceLogoutAfterWarningInterval
    };
  }

  initializeListeners() {
    this.$rootScope.$on('goHome', () => {
      this.goHome();
    });

    this.$rootScope.$on('logOut', () => {
      this.logOut();
    });
  }

  goHome() {
    const wiseBaseURL = this.ConfigService.getWISEBaseURL();
    const userType = this.ConfigService.getConfigParam('userType');
    let href = this.ConfigService.getMainHomePageURL();
    if (userType === 'student') {
      href = wiseBaseURL + '/student';
    } else if (userType === 'teacher') {
      href = wiseBaseURL + '/teacher';
    }
    window.location.href = href;
  }

  logOut() {
    this.$rootScope.$broadcast('exit');
    window.location.href = this.ConfigService.getSessionLogOutURL();
  }

  initializeSession() {
    if (!this.ConfigService.isPreview()) {
      this.startCheckMouseEvent();
    }
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

  /**
   * Note: This does not get called when the warning popup is being shown.
   */
  mouseMoved() {
    this.updateLastActivityTimestamp();
  }

  updateLastActivityTimestamp() {
    this.lastActivityTimestamp = new Date();
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
    return (new Date() - this.lastActivityTimestamp) < this.convertMinutesToMilliseconds(1);
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
    return new Date() - this.lastActivityTimestamp;
  }

  forceLogOut() {
    this.$rootScope.$broadcast('logOut');
  }

  showWarning() {
    this.warningVisible = true;
    this.$rootScope.$broadcast('showSessionWarning');
  }

  closeWarningAndRenewSession() {
    this.warningVisible = false;
    this.updateLastActivityTimestamp();
    this.renewSession();
  }

  renewSession() {
    const renewSessionURL = this.ConfigService.getConfigParam('renewSessionURL');
    this.$http.get(renewSessionURL).then((result) => {

    });
  }
}

SessionService.$inject = [
  '$http',
  '$rootScope',
  'ConfigService'
];

export default SessionService;

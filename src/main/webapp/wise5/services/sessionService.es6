class SessionService {
  constructor($http, $rootScope, ConfigService) {
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.warningVisible = false;
    this.checkMouseEventInMinutesInterval = 1;
    this.showWarningInMinutesInterval = 25;
    this.forceLogoutAfterWarningInMinutesInterval = 5;
    this.lastActivityTimestamp = new Date();
    this.initializeListeners();
    this.initializeSession();
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
    setInterval(angular.bind(this, this.checkMouseEvent),
      this.convertMinutesToMilliseconds(this.checkMouseEventInMinutesInterval));
  }

  convertMinutesToMilliseconds(minutes) {
    return minutes * 60 * 1000;
  }

  /**
   * Note: This does not get called when the warning popup is being shown.
   */
  mouseMoved() {
    this.lastActivityTimestamp = new Date();
  }

  checkMouseEvent() {
    if (this.isInactiveLongEnoughToForceLogout()) {
      this.forceLogOut();
    } else if (this.isInactiveLongEnoughToWarn() && !this.isShowingWarning()) {
      this.showWarning();
    }
  }

  isInactiveLongEnoughToForceLogout() {
    return this.getInactiveTimeInMinutes() >=
      (this.showWarningInMinutesInterval + this.forceLogoutAfterWarningInMinutesInterval);
  }

  isInactiveLongEnoughToWarn() {
    return this.getInactiveTimeInMinutes() >= this.showWarningInMinutesInterval;
  }

  isShowingWarning() {
    return this.warningVisible;
  }

  getInactiveTimeInMinutes() {
    return Math.floor(this.getInactiveTimeInMilliseconds() / 1000 / 60);
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

  renewSession() {
    this.lastActivityTimestamp = new Date();
    this.warningVisible = false;
  }
}

SessionService.$inject = [
  '$http',
  '$rootScope',
  'ConfigService'
];

export default SessionService;

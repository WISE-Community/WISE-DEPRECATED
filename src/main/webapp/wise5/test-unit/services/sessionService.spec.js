import vleModule from '../../vle/vle';

describe('SessionService', () => {

  beforeEach(angular.mock.module(vleModule.name));

  let SessionService;

  beforeEach(inject((_SessionService_) => {
    SessionService = _SessionService_;
  }));

  describe('calculateIntervals()', () => {
    it('should calculate the warn and logout intervals when session timeout is 10 minutes', () => {
      const sessionTimeout = 600;
      const intervals = SessionService.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(540);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(60);
    });

    it('should calculate the warn and logout intervals when session timeout is 30 minutes', () => {
      const sessionTimeout = 1800;
      const intervals = SessionService.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(1620);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(180);
    });

    it('should calculate the warn and logout intervals when session timeout is 60 minutes', () => {
      const sessionTimeout = 3600;
      const intervals = SessionService.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(3300);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(300);
    });
  });
});

import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { SessionService } from '../../../../wise5/services/sessionService';
import { UpgradeModule } from '@angular/upgrade/static';
import { ConfigService } from '../../../../wise5/services/configService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
let service: SessionService;
let configService: ConfigService;

describe('SessionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ConfigService, SessionService]
    });
    configService = TestBed.get(ConfigService);
    service = TestBed.get(SessionService);
  });

  calculateIntervals();
  initializeSession();
  mouseMoved();
  checkMouseevent();
  checkForLogout();
  renewSession();
});

function calculateIntervals() {
  describe('calculateIntervals()', () => {
    it('should calculate the warn and logout intervals when session timeout is 10 minutes', () => {
      const sessionTimeout = 600;
      const intervals = service.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(540);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(60);
    });

    it('should calculate the warn and logout intervals when session timeout is 30 minutes', () => {
      const sessionTimeout = 1800;
      const intervals = service.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(1620);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(180);
    });

    it('should calculate the warn and logout intervals when session timeout is 60 minutes', () => {
      const sessionTimeout = 3600;
      const intervals = service.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(3300);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(300);
    });
  });
}

function initializeSession() {
  describe('initializeSession()', () => {
    it('should start check mouse event if not in preview mode', () => {
      spyOn(configService, 'isPreview').and.returnValue(false);
      const startCheckMouseEventSpy = spyOn(service, 'startCheckMouseEvent');
      service.initializeSession();
      expect(startCheckMouseEventSpy).toHaveBeenCalled();
    });
  });
}

function mouseMoved() {
  describe('mouseMoved()', () => {
    it('should set last activity timestamp when mouse is moved', () => {
      service.mouseMoved();
      const renewSessionSpy = spyOn(service, 'renewSession');
      service.checkMouseEvent();
      expect(renewSessionSpy).toHaveBeenCalled();
    });
  });
}

function checkMouseevent() {
  describe('checkMouseEvent()', () => {
    it('should renew session if user has been active within last minute', () => {
      spyOn(service, 'isActiveWithinLastMinute').and.returnValue(true);
      const renewSessionSpy = spyOn(service, 'renewSession');
      service.checkMouseEvent();
      expect(renewSessionSpy).toHaveBeenCalled();
    });

    it('should check for logout if user has not been active within last minute', () => {
      spyOn(service, 'isActiveWithinLastMinute').and.returnValue(false);
      const checkForLogoutSpy = spyOn(service, 'checkForLogout');
      service.checkMouseEvent();
      expect(checkForLogoutSpy).toHaveBeenCalled();
    });
  });
}

function checkForLogout() {
  describe('checkForLogout()', () => {
    it('should force logout when user is inactive for long enough', () => {
      spyOn(service, 'isInactiveLongEnoughToForceLogout').and.returnValue(true);
      spyOn(service, 'checkIfSessionIsActive').and.returnValue(of(false));
      const forceLogOutSpy = spyOn(service, 'forceLogOut');
      service.checkForLogout();
      expect(forceLogOutSpy).toHaveBeenCalled();
    });

    it('should not force logout when user is inactive for long enough but session is active', () => {
      spyOn(service, 'isInactiveLongEnoughToForceLogout').and.returnValue(true);
      spyOn(service, 'checkIfSessionIsActive').and.returnValue(of(true));
      const forceLogOutSpy = spyOn(service, 'forceLogOut');
      service.checkForLogout();
      expect(forceLogOutSpy).not.toHaveBeenCalled();
    });

    it('should show warning when user is inactive for long enough to warn and warning is not showing', () => {
      spyOn(service, 'isInactiveLongEnoughToForceLogout').and.returnValue(false);
      spyOn(service, 'isInactiveLongEnoughToWarn').and.returnValue(true);
      spyOn(service, 'isShowingWarning').and.returnValue(false);
      const showWarningSpy = spyOn(service, 'showWarning');
      service.checkForLogout();
      expect(showWarningSpy).toHaveBeenCalled();
    });
  });
}

function renewSession() {
  describe('renewSession()', () => {
    it('should renew the session', fakeAsync(() => {
      spyOn(service, 'checkIfSessionIsActive').and.returnValue(of(true));
      const logOutSpy = spyOn(service, 'logOut');
      service.renewSession();
      tick();
      expect(logOutSpy).not.toHaveBeenCalled();
    }));

    it('should log the user out when renew session fails', fakeAsync(() => {
      spyOn(service, 'checkIfSessionIsActive').and.returnValue(of(false));
      const logOutSpy = spyOn(service, 'logOut');
      service.renewSession();
      tick();
      expect(logOutSpy).toHaveBeenCalled();
    }));
  });
}

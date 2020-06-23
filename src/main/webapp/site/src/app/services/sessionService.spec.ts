import { TestBed } from '@angular/core/testing';
import { SessionService } from '../../../../wise5/services/sessionService';
import { UpgradeModule } from '@angular/upgrade/static';
import ConfigService from '../../../../wise5/services/configService';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
let service: SessionService;
let configService: ConfigService;
let http: HttpTestingController;

describe('SessionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [ ConfigService, SessionService ]
    });
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    service = TestBed.get(SessionService);
  });

  calculateIntervals();
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
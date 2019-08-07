"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _main = _interopRequireDefault(require("vle/main"));

require("angular-mocks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('SessionService', function () {
  beforeEach(_angular["default"].mock.module(_main["default"].name));
  var SessionService;
  beforeEach(inject(function (_SessionService_) {
    SessionService = _SessionService_;
  }));
  describe('calculateIntervals()', function () {
    it('should calculate the warn and logout intervals when session timeout is 10 minutes', function () {
      var sessionTimeout = 600;
      var intervals = SessionService.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(540);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(60);
    });
    it('should calculate the warn and logout intervals when session timeout is 30 minutes', function () {
      var sessionTimeout = 1800;
      var intervals = SessionService.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(1620);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(180);
    });
    it('should calculate the warn and logout intervals when session timeout is 60 minutes', function () {
      var sessionTimeout = 3600;
      var intervals = SessionService.calculateIntervals(sessionTimeout);
      expect(intervals.showWarningInterval).toEqual(3300);
      expect(intervals.forceLogoutAfterWarningInterval).toEqual(300);
    });
  });
});
//# sourceMappingURL=sessionService.spec.js.map

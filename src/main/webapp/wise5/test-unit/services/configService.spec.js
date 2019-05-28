'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ConfigService Unit Test', function () {
  beforeEach(_angular2.default.mock.module(_main2.default.name));

  var ConfigService = void 0,
      $httpBackend = void 0;
  beforeEach(inject(function (_ConfigService_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    $httpBackend = _$httpBackend_;
  }));

  describe('ConfigService', function () {
    var configURL = 'http://localhost:8080/wise/config/1';

    // Load sample configs
    var sampleConfig1 = void 0;
    var sampleConfig2 = window.mocks['test-unit/sampleData/config/config2'];

    beforeEach(function () {
      sampleConfig1 = window.mocks['test-unit/sampleData/config/config1'];
    });

    // i18n
    var sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
    var sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];
    var i18nURL_common_en = 'wise5/i18n/common/i18n_en.json';
    var i18nURL_vle_en = 'wise5/i18n/vle/i18n_en.json';

    xit('should retrieve config', function () {
      spyOn(ConfigService, 'setConfig').and.callThrough();
      spyOn(ConfigService, 'sortClassmateUserInfosAlphabeticallyByName');
      $httpBackend.when('GET', configURL).respond(sampleConfig1);
      $httpBackend.when('GET', i18nURL_common_en).respond(sampleI18N_common_en);
      $httpBackend.when('GET', i18nURL_vle_en).respond(sampleI18N_vle_en);
      $httpBackend.expectGET(configURL);
      var configPromise = ConfigService.retrieveConfig(configURL);
      $httpBackend.flush();
      // TODO: when replacing this line below with expect(ConfigService.setConfig).toHaveBeenCalled(sampleConfig1);, it fails.
      // it shouldn't fail, so find out why.
      expect(ConfigService.setConfig).toHaveBeenCalled();
      expect(ConfigService.sortClassmateUserInfosAlphabeticallyByName).toHaveBeenCalled();
    });

    it('should sort the classmates alphabetically by name when setting config', function () {
      var config = {
        userInfo: {
          myUserInfo: {
            myClassInfo: {
              classmateUserInfos: [{
                periodId: 1,
                workgroupId: 3,
                userIds: [6],
                periodName: '1',
                username: 't t (tt0101)'
              }, {
                periodId: 1,
                workgroupId: 8,
                userIds: [8],
                periodName: '1',
                username: 'k t (kt0101)'
              }]
            }
          }
        }
      };
      var classmateUserInfos = config.userInfo.myUserInfo.myClassInfo.classmateUserInfos;
      expect(classmateUserInfos[0].workgroupId).toEqual(3);
      expect(classmateUserInfos[1].workgroupId).toEqual(8);
      spyOn(ConfigService, 'sortClassmateUserInfosAlphabeticallyByNameHelper').and.callThrough();
      ConfigService.setConfig(config);
      expect(ConfigService.sortClassmateUserInfosAlphabeticallyByNameHelper).toHaveBeenCalled();
      expect(classmateUserInfos[0].workgroupId).toEqual(8);
      expect(classmateUserInfos[1].workgroupId).toEqual(3);
    });

    // Test getLocale()
    it('should get the locale', function () {
      // Sample config 1 doesn't have locale set, so it should default to 'en'
      ConfigService.setConfig(sampleConfig1);
      var locale = ConfigService.getLocale();
      expect(locale).toEqual('en');

      // Sample config 2 should have 'ja' locale.
      ConfigService.setConfig(sampleConfig2);
      var locale2 = ConfigService.getLocale();
      expect(locale2).toEqual('ja');
    });

    // Test getMode and isPreview()
    it('should get the modes', function () {
      ConfigService.setConfig(sampleConfig1);
      var mode = ConfigService.getMode();
      var isPreview = ConfigService.isPreview();
      expect(mode).toEqual('run');
      expect(isPreview).toEqual(false);

      ConfigService.setConfig(sampleConfig2);
      var mode2 = ConfigService.getMode();
      var isPreview2 = ConfigService.isPreview();
      expect(mode2).toEqual('preview');
      expect(isPreview2).toEqual(true);
    });

    // Test getPeriodId()
    it('should get the period id of the student', function () {
      ConfigService.setConfig(sampleConfig1);
      var config1PeriodId = ConfigService.getPeriodId();
      expect(config1PeriodId).toEqual(1);

      ConfigService.setConfig(sampleConfig2);
      var config2PeriodId = ConfigService.getPeriodId();
      expect(config2PeriodId).toEqual(2);
    });

    // Test getPeriods()
    it('should get the periods in the run', function () {
      ConfigService.setConfig(sampleConfig1);
      var config1Periods = ConfigService.getPeriods();
      expect(config1Periods).toEqual([{ periodId: 1, periodName: '1' }, { periodId: 2, periodName: '2' }, { periodId: 3, periodName: 'newperiod' }]);

      ConfigService.setConfig(sampleConfig2);
      var config2Periods = ConfigService.getPeriods();
      expect(config2Periods).toEqual([{ periodId: 1, periodName: 'one' }, { periodId: 2, periodName: 'two' }]);
    });

    // Test getStudentFirstNamesByWorkgroupId()
    it('should get the username by workgroup id', function () {
      // If specified workgroup doesn't exist, it should return empty array
      var nonExistingWorkgroupId = 9999;
      ConfigService.setConfig(sampleConfig1);
      var studentFirstNames = ConfigService.getStudentFirstNamesByWorkgroupId(nonExistingWorkgroupId);
      expect(studentFirstNames.length).toEqual(0);

      // Otherwise it should get the first names from the config
      var existingWorkgroupId = 8;
      var studentFirstNamesExisting = ConfigService.getStudentFirstNamesByWorkgroupId(existingWorkgroupId);
      expect(studentFirstNamesExisting).toEqual(['k']);
    });

    // Test getTeacherWorkgroupId()
    it('should get the teacher workgroup id', function () {
      // If teacher workgroup doesn't exist, it should return null
      ConfigService.setConfig(sampleConfig2);
      var teacherWorkgroupIdDoesNotExist = ConfigService.getTeacherWorkgroupId();
      expect(teacherWorkgroupIdDoesNotExist).toBeNull();

      // Otherwise it should get the teacher's workgroup id from the config
      var expectedTeacherWorkgroupId = 1;
      ConfigService.setConfig(sampleConfig1);
      var teacherWorkgroupIdExist = ConfigService.getTeacherWorkgroupId();
      expect(teacherWorkgroupIdExist).toEqual(expectedTeacherWorkgroupId);
    });

    // Test getPeriodIdByWorkgroupId()
    it('should get the period id given the workgroup id', function () {

      ConfigService.setConfig(sampleConfig1);
      spyOn(ConfigService, 'getUserInfoByWorkgroupId').and.callThrough();

      // If workgroupId is null, period should be null
      var nullWorkgroupPeriodId = ConfigService.getPeriodIdByWorkgroupId(null);
      expect(nullWorkgroupPeriodId).toBeNull();

      // If specified workgroup doesn't exist, it should null
      var nonExistingWorkgroupId = 9999;
      var nonExistingWorkgroupPeriodId = ConfigService.getPeriodIdByWorkgroupId(nonExistingWorkgroupId);
      expect(ConfigService.getUserInfoByWorkgroupId).toHaveBeenCalledWith(nonExistingWorkgroupId);
      expect(nonExistingWorkgroupPeriodId).toBeNull();

      // Otherwise it should get workgroup's period id
      var existingWorkgroupId = 8;
      var existingWorkgroupPeriodId = ConfigService.getPeriodIdByWorkgroupId(existingWorkgroupId);
      expect(ConfigService.getUserInfoByWorkgroupId).toHaveBeenCalledWith(existingWorkgroupId);
      expect(existingWorkgroupPeriodId).toEqual(1);
    });

    it('should calculate if a run is active when a run only has a start time', function () {
      jasmine.clock().install();
      var configJSON = {
        startTime: new Date(2019, 5, 10).getTime(),
        timestampDiff: 0
      };
      jasmine.clock().mockDate(new Date(2019, 5, 9));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeFalsy();
      jasmine.clock().mockDate(new Date(2019, 5, 10));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeTruthy();
      jasmine.clock().mockDate(new Date(2019, 5, 11));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeTruthy();
      jasmine.clock().uninstall();
    });

    it('should calculate if a run is active when it has a start time and end time', function () {
      jasmine.clock().install();
      var configJSON = {
        startTime: new Date(2019, 5, 10).getTime(),
        endTime: new Date(2019, 5, 20).getTime(),
        timestampDiff: 0
      };
      jasmine.clock().mockDate(new Date(2019, 5, 9));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeFalsy();
      jasmine.clock().mockDate(new Date(2019, 5, 10));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeTruthy();
      jasmine.clock().mockDate(new Date(2019, 5, 11));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeTruthy();
      jasmine.clock().mockDate(new Date(2019, 5, 19));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeTruthy();
      jasmine.clock().mockDate(new Date(2019, 5, 20));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeTruthy();
      jasmine.clock().mockDate(new Date(2019, 5, 21));
      expect(ConfigService.calculateIsRunActive(configJSON)).toBeFalsy();
      jasmine.clock().uninstall();
    });
  });
});
//# sourceMappingURL=configService.spec.js.map

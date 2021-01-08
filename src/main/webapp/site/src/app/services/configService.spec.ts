import { TestBed } from '@angular/core/testing';
import { ConfigService } from '../../../../wise5/services/configService';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import sampleConfig1 from './sampleData/sample_config_1.json';
let service: ConfigService;
let http: HttpTestingController;

let configJSON;

describe('ConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ConfigService]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(ConfigService);
    configJSON = {
      startTime: new Date(2020, 4, 10).getTime(),
      endTime: new Date(2020, 4, 20).getTime(),
      timestampDiff: 0,
      isLockedAfterEndDate: false
    };
  });

  retrieveConfig();
  sortTheClassmatesAlphabeticallyByNameWhenSettingConfig();
  getLocale();
  getMode();
  getPeriodIdOfStudent();
  getPeriodsInRun();
  getUsernameByWorkgroupId();
  getTeacherWorkgroupId();
  getPeriodIdGivenWorkgroupId();
  calculateIsRunActive();
  isEndedAndLocked();
});

function retrieveConfig() {
  it('should retrieve config', () => {
    const configURL = 'http://localhost:8080/wise/config/1';
    service.retrieveConfig(configURL).then((response) => {
      expect(response).toEqual(sampleConfig1);
    });
    http.expectOne(configURL).flush(sampleConfig1);
  });
}

function sortTheClassmatesAlphabeticallyByNameWhenSettingConfig() {
  it('should sort the classmates alphabetically by name when setting config', () => {
    const classmateUserInfos = sampleConfig1.userInfo.myUserInfo.myClassInfo.classmateUserInfos;
    spyOn(service, 'sortClassmateUserInfosAlphabeticallyByNameHelper').and.callThrough();
    service.setConfig(sampleConfig1);
    expect(service.sortClassmateUserInfosAlphabeticallyByNameHelper).toHaveBeenCalled();
    expect(classmateUserInfos[0].workgroupId).toEqual(8);
    expect(classmateUserInfos[1].workgroupId).toEqual(3);
  });
}

function getLocale() {
  it('should get locale in config', () => {
    service.setConfig({ locale: 'ja' });
    expect(service.getLocale()).toEqual('ja');
  });
  it('should get default locale if config does not specify', () => {
    service.setConfig({});
    expect(service.getLocale()).toEqual('en');
  });
}

function getMode() {
  it('should get modes', () => {
    service.setConfig({ mode: 'run' });
    expect(service.getMode()).toEqual('run');
    expect(service.isPreview()).toEqual(false);

    service.setConfig({ mode: 'preview' });
    expect(service.getMode()).toEqual('preview');
    expect(service.isPreview()).toEqual(true);
  });
}

function getPeriodIdOfStudent() {
  it('should get period id of student', () => {
    service.setConfig({ userInfo: { myUserInfo: { periodId: 1 } } });
    expect(service.getPeriodId()).toEqual(1);
  });
}

function getPeriodsInRun() {
  it('should get periods in the run', () => {
    service.setConfig(sampleConfig1);
    expect(service.getPeriods().length).toEqual(3);
    expect(service.getPeriods()[2].periodName).toEqual('newperiod');
  });
}

function getUsernameByWorkgroupId() {
  it('should get username by workgroup id', () => {
    service.setConfig(sampleConfig1);
    expect(service.getStudentFirstNamesByWorkgroupId(8)).toEqual(['k']);
  });
  it('should get empty array for non-existing workgroup', () => {
    service.setConfig(sampleConfig1);
    expect(service.getStudentFirstNamesByWorkgroupId(-1).length).toEqual(0);
  });
}

function getTeacherWorkgroupId() {
  it('should get teacher workgroup id from config', () => {
    service.setConfig(sampleConfig1);
    expect(service.getTeacherWorkgroupId()).toEqual(1);
  });
}

function getPeriodIdGivenWorkgroupId() {
  describe('getPeriodIdByWorkgroupId', () => {
    beforeEach(() => {
      service.setConfig(sampleConfig1);
      spyOn(service, 'getUserInfoByWorkgroupId').and.callThrough();
    });
    it('should return null if given null workgroupId', () => {
      expect(service.getPeriodIdByWorkgroupId(null)).toBeNull();
    });

    it('should return null if workgroup does not exist', () => {
      expect(service.getPeriodIdByWorkgroupId(-1)).toBeNull();
      expect(service.getUserInfoByWorkgroupId).toHaveBeenCalledWith(-1);
    });

    it("should return workgroup's period id", () => {
      expect(service.getPeriodIdByWorkgroupId(8)).toEqual(1);
      expect(service.getUserInfoByWorkgroupId).toHaveBeenCalledWith(8);
    });
  });
}

function calculateIsRunActive() {
  describe('calculateIsRunActive', () => {
    calculateIsRunActive_RunOnlyHasAStartTime_ReturnWhetherRunIsActive();
    calculateIsRunActive_RunHasAStartTimeAndEndTimeAndIsNotLocked_ReturnWhetherRunIsActive();
    calculateIsRunActive_RunHasAStartTimeAndEndTimeAndIsLocked_ReturnWhetherRunIsActive;
  });
}

function calculateIsRunActive_RunOnlyHasAStartTime_ReturnWhetherRunIsActive() {
  it('should calculate if a run is active when a run only has a start time', () => {
    const configJSON = {
      startTime: new Date(2019, 5, 10).getTime(),
      timestampDiff: 0
    };
    jasmine.clock().mockDate(new Date(2019, 5, 9));
    expect(service.calculateIsRunActive(configJSON)).toBeFalsy();
    jasmine.clock().mockDate(new Date(2019, 5, 10));
    expect(service.calculateIsRunActive(configJSON)).toBeTruthy();
    jasmine.clock().mockDate(new Date(2019, 5, 11));
    expect(service.calculateIsRunActive(configJSON)).toBeTruthy();
  });
}

function calculateIsRunActive_RunHasAStartTimeAndEndTimeAndIsNotLocked_ReturnWhetherRunIsActive() {
  it(`should calculate if a run is active to be true when it has a start time and end time and is
      locked value false`, () => {
    expectIsRunActive(new Date(2020, 4, 15), true);
  });
  it(`should calculate if a run is active to be false when it has a start time and end time and is
      locked value false`, () => {
    expectIsRunActive(new Date(2020, 4, 30), true);
  });
}

function calculateIsRunActive_RunHasAStartTimeAndEndTimeAndIsLocked_ReturnWhetherRunIsActive() {
  configJSON.isLockedAfterEndDate = true;
  it(`should calculate if a run is active to be true when it has a start time and end time and is
      locked value true`, () => {
    expectIsRunActive(new Date(2020, 4, 15), true);
  });
  it(`should calculate if a run is active to be false when it has a start time and end time and is
      locked value true`, () => {
    expectIsRunActive(new Date(2020, 4, 30), false);
  });
}

function expectIsRunActive(date, expectedValue) {
  jasmine.clock().mockDate(date);
  expect(service.calculateIsRunActive(configJSON)).toEqual(expectedValue);
}

function expectIsEndedAndLocked(date, expectedValue) {
  jasmine.clock().mockDate(date);
  expect(service.isEndedAndLocked(configJSON)).toEqual(expectedValue);
}

function isEndedAndLocked() {
  describe('isEndedAndLocked', () => {
    isEndedAndLocked_HasStartTimeAndNoEndTime_ReturnNotEndedAndLocked();
    isEndedAndLocked_HasStartTimeAndEndTimeInFuture_ReturnNotEndedAndLocked();
    isEndedAndLocked_EndTimeInPastButNotLocked_ReturnNotEndedAndLocked();
    isEndedAndLocked_EndTimeInPastAndLocked_ReturnEndedAndLocked();
  });
}

function isEndedAndLocked_HasStartTimeAndNoEndTime_ReturnNotEndedAndLocked() {
  it('should calculate is ended and locked when it has a start time and no end time', () => {
    configJSON.endTime = null;
    expectIsEndedAndLocked(new Date(2020, 4, 11), false);
  });
}

function isEndedAndLocked_HasStartTimeAndEndTimeInFuture_ReturnNotEndedAndLocked() {
  it('should calculate is ended and locked when end time is in the future', () => {
    expectIsEndedAndLocked(new Date(2020, 4, 15), false);
  });
}

function isEndedAndLocked_EndTimeInPastButNotLocked_ReturnNotEndedAndLocked() {
  it('should calculate is ended and locked when end time is in the past but not locked', () => {
    expectIsEndedAndLocked(new Date(2020, 4, 30), false);
  });
}

function isEndedAndLocked_EndTimeInPastAndLocked_ReturnEndedAndLocked() {
  it('should calculate is ended and locked when end time is in the past and locked', () => {
    configJSON.isLockedAfterEndDate = true;
    expectIsEndedAndLocked(new Date(2020, 4, 30), true);
  });
}

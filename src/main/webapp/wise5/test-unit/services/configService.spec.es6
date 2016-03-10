import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('ConfigService Unit Test', () => {

    beforeEach(angular.mock.module(mainModule.name));

    var ConfigService, $httpBackend;

    beforeEach(inject((_ConfigService_, _$httpBackend_) => {
        ConfigService = _ConfigService_;
        $httpBackend = _$httpBackend_;
    }));

    describe('ConfigService', () => {

        var configURL = "http://localhost:8080/wise/config/1";

        // Load sample configs
        let sampleConfig1 = window.mocks['test-unit/sampleData/config/config1'];
        let sampleConfig2 = window.mocks['test-unit/sampleData/config/config2'];

        it('should retrieve config', () => {
            spyOn(ConfigService, "setConfig").and.callThrough();
            spyOn(ConfigService, "sortClassmateUserInfosAlphabeticallyByName");
            $httpBackend.when('GET', configURL).respond(sampleConfig1);
            $httpBackend.expectGET(configURL);
            let configPromise = ConfigService.retrieveConfig(configURL);
            $httpBackend.flush();
            // TODO: when replacing this line below with expect(ConfigService.setConfig).toHaveBeenCalled(sampleConfig1);, it fails.
            // it shouldn't fail, so find out why.
            expect(ConfigService.setConfig).toHaveBeenCalled();
            expect(ConfigService.sortClassmateUserInfosAlphabeticallyByName).toHaveBeenCalled();
        });

        it('should sort the classmates alphabetically by name when setting config', () => {
            spyOn(ConfigService, "sortClassmateUserInfosAlphabeticallyByNameHelper").and.callThrough(); // actually call through the function
            let classmateUserInfosBefore = sampleConfig1.userInfo.myUserInfo.myClassInfo.classmateUserInfos;
            expect(classmateUserInfosBefore[0].workgroupId).toEqual(3);
            expect(classmateUserInfosBefore[1].workgroupId).toEqual(8);
            ConfigService.setConfig(sampleConfig1);  // setting the config should sort the classmates alphabetically by name
            expect(ConfigService.sortClassmateUserInfosAlphabeticallyByNameHelper).toHaveBeenCalled();
            let classmateUserInfosAfter = ConfigService.getClassmateUserInfos();
            expect(classmateUserInfosAfter[0].workgroupId).toEqual(8);
            expect(classmateUserInfosAfter[1].workgroupId).toEqual(3);
        });

        // Test getMode and isPreview()
        it('should get the modes', () => {
            ConfigService.setConfig(sampleConfig1);
            let mode = ConfigService.getMode();
            let isPreview = ConfigService.isPreview();
            expect(mode).toEqual("run");
            expect(isPreview).toEqual(false);

            ConfigService.setConfig(sampleConfig2);
            let mode2 = ConfigService.getMode();
            let isPreview2 = ConfigService.isPreview();
            expect(mode2).toEqual("preview");
            expect(isPreview2).toEqual(true);
        });

        // Test getPeriodId()
        it('should get the period id of the student', () => {
            ConfigService.setConfig(sampleConfig1);
            let config1PeriodId = ConfigService.getPeriodId();
            expect(config1PeriodId).toEqual(1);

            ConfigService.setConfig(sampleConfig2);
            let config2PeriodId = ConfigService.getPeriodId();
            expect(config2PeriodId).toEqual(2);
        });

        // Test getPeriods()
        it('should get the periods in the run', () => {
            ConfigService.setConfig(sampleConfig1);
            let config1Periods = ConfigService.getPeriods();
            expect(config1Periods).toEqual([{periodId:1,periodName:'1'},{periodId:2,periodName:'2'},{periodId:3,periodName:'newperiod'}]);

            ConfigService.setConfig(sampleConfig2);
            let config2Periods = ConfigService.getPeriods();
            expect(config2Periods).toEqual([{periodId:1,periodName:'one'},{periodId:2,periodName:'two'}]);
        });

        // Test getStudentFirstNamesByWorkgroupId()
        it('should get the username by workgroup id', () => {
            // If specified workgroup doesn't exist, it should return empty array
            let nonExistingWorkgroupId = 9999;
            ConfigService.setConfig(sampleConfig1);
            let studentFirstNames = ConfigService.getStudentFirstNamesByWorkgroupId(nonExistingWorkgroupId);
            expect(studentFirstNames.length).toEqual(0);

            // Otherwise it should get the first names from the config
            let existingWorkgroupId = 8;
            let studentFirstNamesExisting = ConfigService.getStudentFirstNamesByWorkgroupId(existingWorkgroupId);
            expect(studentFirstNamesExisting).toEqual(['k']);
        });

        // Test getTeacherWorkgroupId()
        it('should get the teacher workgroup id', () => {
            // If teacher workgroup doesn't exist, it should return null
            ConfigService.setConfig(sampleConfig2);
            let teacherWorkgroupIdDoesNotExist = ConfigService.getTeacherWorkgroupId();
            expect(teacherWorkgroupIdDoesNotExist).toBeNull();

            // Otherwise it should get the teacher's workgroup id from the config
            let expectedTeacherWorkgroupId = 1;
            ConfigService.setConfig(sampleConfig1);
            let teacherWorkgroupIdExist = ConfigService.getTeacherWorkgroupId();
            expect(teacherWorkgroupIdExist).toEqual(expectedTeacherWorkgroupId);
        });

        // Test getPeriodIdByWorkgroupId()
        it('should get the period id given the workgroup id', () => {

            ConfigService.setConfig(sampleConfig1);
            spyOn(ConfigService, "getUserInfoByWorkgroupId").and.callThrough(); // actually call through the function

            // If workgroupId is null, period should be null
            let nullWorkgroupPeriodId = ConfigService.getPeriodIdByWorkgroupId(null);
            expect(nullWorkgroupPeriodId).toBeNull();

            // If specified workgroup doesn't exist, it should null
            let nonExistingWorkgroupId = 9999;
            let nonExistingWorkgroupPeriodId = ConfigService.getPeriodIdByWorkgroupId(nonExistingWorkgroupId);
            expect(ConfigService.getUserInfoByWorkgroupId).toHaveBeenCalledWith(nonExistingWorkgroupId);
            expect(nonExistingWorkgroupPeriodId).toBeNull();

            // Otherwise it should get workgroup's period id
            let existingWorkgroupId = 8;
            let existingWorkgroupPeriodId = ConfigService.getPeriodIdByWorkgroupId(existingWorkgroupId);
            expect(ConfigService.getUserInfoByWorkgroupId).toHaveBeenCalledWith(existingWorkgroupId);
            expect(existingWorkgroupPeriodId).toEqual(1);
        })

    });
});
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

        // Load sample configs
        let sampleConfig1 = window.mocks['test-unit/sampleData/config/config1'];
        let sampleConfig2 = window.mocks['test-unit/sampleData/config/config2'];

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
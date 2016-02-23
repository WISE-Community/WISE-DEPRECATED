import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('ConfigService Unit Test', function () {
    beforeEach(angular.mock.module(mainModule.name));

    var ConfigService, $httpBackend;

    beforeEach(inject(function(_ConfigService_, _$httpBackend_) {
        ConfigService = _ConfigService_;
        $httpBackend = _$httpBackend_;
    }));

    describe('ConfigService', function () {

        // Load sample configs
        let sampleConfig1 = window.mocks['test-unit/sampleData/config/config1'];
        let sampleConfig2 = window.mocks['test-unit/sampleData/config/config2'];

        it('should sort the classmates alphabetically by name', function () {
            let classmateUserInfosBefore = sampleConfig1.userInfo.myUserInfo.myClassInfo.classmateUserInfos;
            expect(classmateUserInfosBefore[0].workgroupId).toEqual(3);
            expect(classmateUserInfosBefore[1].workgroupId).toEqual(8);
            ConfigService.setConfig(sampleConfig1);  // setting the config should sort the classmates alphabetically by name
            let classmateUserInfosAfter = ConfigService.getClassmateUserInfos();
            expect(classmateUserInfosAfter[0].workgroupId).toEqual(8);
            expect(classmateUserInfosAfter[1].workgroupId).toEqual(3);
        });

        // Test getMode and isPreview()
        it('should get the modes', function () {
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
        it('should get the username by workgroup id', function() {
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
        it('should get the teacher workgroup id', function() {
            // If teacher workgroup doesn't exist, it should return null
            ConfigService.setConfig(sampleConfig2);
            let teacherWorkgroupId = ConfigService.getTeacherWorkgroupId();
            expect(teacherWorkgroupId).toBeNull();

            // Otherwise it should get the teacher's workgroup id from the config

        });

    });
});
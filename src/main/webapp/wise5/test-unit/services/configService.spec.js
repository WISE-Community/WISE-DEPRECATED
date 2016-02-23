'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ConfigService Unit Test', function () {
    beforeEach(_angular2.default.mock.module(_main2.default.name));

    var ConfigService, $httpBackend;

    beforeEach(inject(function (_ConfigService_, _$httpBackend_) {
        ConfigService = _ConfigService_;
        $httpBackend = _$httpBackend_;
    }));

    describe('ConfigService', function () {

        // Load sample configs
        var sampleConfig1 = window.mocks['test-unit/sampleData/config/config1'];
        var sampleConfig2 = window.mocks['test-unit/sampleData/config/config2'];

        it('should sort the classmates alphabetically by name', function () {
            var classmateUserInfosBefore = sampleConfig1.userInfo.myUserInfo.myClassInfo.classmateUserInfos;
            expect(classmateUserInfosBefore[0].workgroupId).toEqual(3);
            expect(classmateUserInfosBefore[1].workgroupId).toEqual(8);
            ConfigService.setConfig(sampleConfig1); // setting the config should sort the classmates alphabetically by name
            var classmateUserInfosAfter = ConfigService.getClassmateUserInfos();
            expect(classmateUserInfosAfter[0].workgroupId).toEqual(8);
            expect(classmateUserInfosAfter[1].workgroupId).toEqual(3);
        });

        // Test getMode and isPreview()
        it('should get the modes', function () {
            ConfigService.setConfig(sampleConfig1);
            var mode = ConfigService.getMode();
            var isPreview = ConfigService.isPreview();
            expect(mode).toEqual("run");
            expect(isPreview).toEqual(false);

            ConfigService.setConfig(sampleConfig2);
            var mode2 = ConfigService.getMode();
            var isPreview2 = ConfigService.isPreview();
            expect(mode2).toEqual("preview");
            expect(isPreview2).toEqual(true);
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
            var teacherWorkgroupId = ConfigService.getTeacherWorkgroupId();
            expect(teacherWorkgroupId).toBeNull();

            // Otherwise it should get the teacher's workgroup id from the config
        });
    });
});
//# sourceMappingURL=configService.spec.js.map
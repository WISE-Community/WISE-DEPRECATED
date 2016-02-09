'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Student VLE Module', function () {
    beforeEach(_angular2.default.mock.module(_main2.default.name));

    var ConfigService, ProjectService, $rootScope;

    beforeEach(inject(function (_ConfigService_, _ProjectService_, _$rootScope_) {
        ConfigService = _ConfigService_;
        ProjectService = _ProjectService_;
        $rootScope = _$rootScope_;
    }));

    describe('ProjectService', function () {

        var projectBaseURL = "http://localhost:8080/curriculum/12345/";

        beforeEach(function () {
            spyOn(ConfigService, 'getConfigParam').and.returnValue(projectBaseURL);
        });

        it('should replace asset paths in non-html component content', function () {
            var contentString = "<img src=\'hello.png\' />";
            var contentStringReplacedAssetPathExpected = "<img src=\'" + projectBaseURL + "assets/hello.png\' />";
            var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should replace asset paths in html component content', function () {
            var contentString = "style=\"background-image: url('background.jpg')\"";
            var contentStringReplacedAssetPathExpected = "style=\"background-image: url('" + projectBaseURL + "assets/background.jpg')\"";

            var contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });
    });
});
//# sourceMappingURL=vleController.spec.js.map
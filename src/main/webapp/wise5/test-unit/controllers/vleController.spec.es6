import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('Student VLE Module', function () {
    beforeEach(angular.mock.module(mainModule.name));

    var ConfigService, ProjectService, $rootScope;

    beforeEach(inject(function(_ConfigService_, _ProjectService_, _$rootScope_) {
        ConfigService = _ConfigService_;
        ProjectService = _ProjectService_;
        $rootScope = _$rootScope_;
    }));

    describe('ProjectService', function () {

        var projectBaseURL = "http://localhost:8080/curriculum/12345/";
        
        beforeEach(function() {
            spyOn(ConfigService, 'getConfigParam').and.returnValue(projectBaseURL);
        });

        it('should replace asset paths in non-html component content', function () {
            let contentString = "<img src=\'hello.png\' />";
            let contentStringReplacedAssetPathExpected = "<img src=\'" + projectBaseURL + "assets/hello.png\' />";
            let contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

        it('should replace asset paths in html component content', function () {
            let contentString = "style=\\\"background-image: url(\\\"background.jpg\\\")\\\"";
            let contentStringReplacedAssetPathExpected = "style=\\\"background-image: url(\\\"" + projectBaseURL + "assets/background.jpg\\\")\\\"";
            let contentStringReplacedAssetPathActual = ProjectService.replaceAssetPaths(contentString);
            expect(ConfigService.getConfigParam).toHaveBeenCalledWith("projectBaseURL");
            expect(contentStringReplacedAssetPathActual).toEqual(contentStringReplacedAssetPathExpected);
        });

    });
});
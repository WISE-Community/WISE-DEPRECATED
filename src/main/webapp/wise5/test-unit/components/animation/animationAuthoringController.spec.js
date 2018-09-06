'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('authoringTool/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('AnimationAuthoringController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var animationAuthoringController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      "id": "3tyam4h4iy",
      "type": "Animation",
      "prompt": "",
      "showSaveButton": false,
      "showSubmitButton": false,
      "widthInPixels": 600,
      "widthInUnits": 60,
      "heightInPixels": 200,
      "heightInUnits": 20,
      "dataXOriginInPixels": 0,
      "dataYOriginInPixels": 80,
      "coordinateSystem": "screen",
      "objects": [],
      "showAddToNotebookButton": true
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));

    animationAuthoringController = $controller('AnimationAuthoringController', { $scope: $scope });
  }));

  it('should add an animation object', function () {
    spyOn(animationAuthoringController, 'authoringViewComponentChanged');
    animationAuthoringController.authoringAddObject();
    expect(animationAuthoringController.authoringComponentContent.objects.length).toEqual(1);
  });

  it('should add a data point to an animation object', function () {
    spyOn(animationAuthoringController, 'authoringViewComponentChanged');
    var animationObject = {};
    animationAuthoringController.authoringAddDataPointToObject(animationObject);
    expect(animationObject.data.length).toEqual(1);
  });

  it('should add a data source from an animation object', function () {
    spyOn(animationAuthoringController, 'authoringViewComponentChanged');
    var animationObject = {};
    animationAuthoringController.authoringAddDataSource(animationObject);
    expect(animationObject.dataSource).not.toBeNull();
  });

  it('should delete a data source from an animation object', function () {
    spyOn(animationAuthoringController, 'authoringViewComponentChanged');
    spyOn(window, 'confirm').and.returnValue(true);
    var animationObject = {
      dataSource: {}
    };
    animationAuthoringController.authoringDeleteDataSource(animationObject);
    expect(animationObject.hasOwnProperty('dataSource')).toBeFalsy();
  });
});
//# sourceMappingURL=animationAuthoringController.spec.js.map

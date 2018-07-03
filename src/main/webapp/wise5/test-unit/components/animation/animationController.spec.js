'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('AnimationController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var animationController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      "id": "wr7kg5wwuy",
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
      "objects": [{
        "id": "2uiqxlkvcc",
        "type": "image",
        "data": [{
          "t": 0,
          "x": 0
        }, {
          "t": 10,
          "x": 50
        }, {
          "t": 20,
          "x": 0
        }],
        "image": "Swimmer.png",
        "dataX": 0,
        "dataY": 0
      }],
      "showAddToNotebookButton": true,
      "connectedComponents": []
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));

    animationController = $controller('AnimationController', { $scope: $scope });
    animationController.nodeId = 'node1';
  }));

  it('should convert data x to pixel x', function () {
    var pixelX = animationController.dataXToPixelX(10);
    expect(pixelX).toEqual(100);
  });

  it('should convert data y to pixel y', function () {
    var pixelY = animationController.dataYToPixelY(0);
    expect(pixelY).toEqual(80);
  });
});
//# sourceMappingURL=animationController.spec.js.map

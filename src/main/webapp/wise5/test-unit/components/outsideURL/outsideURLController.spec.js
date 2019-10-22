"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _main = _interopRequireDefault(require("vle/main"));

require("angular-mocks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('OutsideURLController', function () {
  var $controller;
  var $rootScope;
  var $scope;
  var outsideURLController;
  var component;
  beforeEach(_angular["default"].mock.module(_main["default"].name));
  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      id: 'gh48wru790',
      type: 'OutsideURL'
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    outsideURLController = $controller('OutsideURLController', {
      $scope: $scope
    });
    outsideURLController.nodeId = 'node1';
  }));
  it('should have a default height', function () {
    expect(outsideURLController.height).toEqual('600px');
  });
  it('should set the width and height', function () {
    expect(outsideURLController.width).toEqual('none');
    expect(outsideURLController.height).toEqual('600px');
    outsideURLController.setWidthAndHeight(400, 300);
    expect(outsideURLController.width).toEqual('400px');
    expect(outsideURLController.height).toEqual('300px');
  });
  it('should set the url', function () {
    expect(outsideURLController.url).toEqual(' ');
    var url = 'https://www.berkeley.edu';
    outsideURLController.setURL(url);
    expect(outsideURLController.url.toString()).toEqual(url);
  });
});
//# sourceMappingURL=outsideURLController.spec.js.map

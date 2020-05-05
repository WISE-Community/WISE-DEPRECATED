import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let outsideURLController;
let component;

describe('OutsideURLController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      id: 'gh48wru790',
      type: 'OutsideURL'
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    outsideURLController = $controller('OutsideURLController', { $scope: $scope });
    outsideURLController.nodeId = 'node1';
  }));

  shouldHaveADefaultHeight();
  shouldSetTheWidthAndHeight();
  shouldSetTheUrl();
});

function shouldHaveADefaultHeight() {
  it('should have a default height', () => {
    expect(outsideURLController.height).toEqual('600px');
  });
}

function shouldSetTheWidthAndHeight() {
  it('should set the width and height', () => {
    expect(outsideURLController.width).toEqual('100%');
    expect(outsideURLController.height).toEqual('600px');
    outsideURLController.setWidthAndHeight(400, 300);
    expect(outsideURLController.width).toEqual('400px');
    expect(outsideURLController.height).toEqual('300px');
  });
}

function shouldSetTheUrl() {
  it('should set the url', () => {
    expect(outsideURLController.url).toEqual(' ');
    const url = 'https://www.berkeley.edu';
    outsideURLController.setURL(url);
    expect(outsideURLController.url.toString()).toEqual(url);
  });
}

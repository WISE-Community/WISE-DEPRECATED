'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('authoringTool/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('ConceptMapAuthoringController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var conceptMapAuthoringController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;

    component = {
      'id': 'ut00qpig10',
      'type': 'ConceptMap',
      'prompt': '',
      'showSaveButton': false,
      'showSubmitButton': false,
      'width': 800,
      'height': 600,
      'background': null,
      'stretchBackground': null,
      'nodes': [{
        'id': 'node1',
        'label': 'Sun',
        'fileName': 'sun.png',
        'width': 100,
        'height': 100
      }, {
        'id': 'node2',
        'label': 'Space',
        'fileName': 'Space.png',
        'width': 100,
        'height': 100
      }, {
        'id': 'node3',
        'label': 'Earths Surface',
        'fileName': 'Earth_surface.png',
        'width': 100,
        'height': 100
      }, {
        'id': 'node4',
        'label': 'Beneath Surface',
        'fileName': 'Earth_beneath.png',
        'width': 100,
        'height': 100
      }],
      'linksTitle': '',
      'links': [{
        'id': 'link1',
        'label': 'Solar Radiation',
        'color': '#DDD266'
      }, {
        'id': 'link2',
        'label': 'Infrared Radiation',
        'color': '#B62467'
      }, {
        'id': 'link3',
        'label': 'Heat',
        'color': '#DE2D26'
      }],
      'rules': [],
      'starterConceptMap': null,
      'customRuleEvaluator': '',
      'showAutoScore': false,
      'showAutoFeedback': false,
      'showNodeLabels': true,
      'showAddToNotebookButton': true
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));

    conceptMapAuthoringController = $controller('ConceptMapAuthoringController', { $scope: $scope });
    conceptMapAuthoringController.nodeId = 'node1';
  }));

  it('should move the object up', function () {
    var authoringViewComponentChangedSpy = spyOn(conceptMapAuthoringController, 'authoringViewComponentChanged');
    var objects = [1, 2, 3, 4, 5];
    conceptMapAuthoringController.authoringViewMoveObjectUp(objects, 1);
    expect(objects[0]).toEqual(2);
    expect(objects[1]).toEqual(1);
    expect(objects[2]).toEqual(3);
    expect(objects[3]).toEqual(4);
    expect(objects[4]).toEqual(5);
  });

  it('should move the object down', function () {
    var authoringViewComponentChangedSpy = spyOn(conceptMapAuthoringController, 'authoringViewComponentChanged');
    var objects = [1, 2, 3, 4, 5];
    conceptMapAuthoringController.authoringViewMoveObjectDown(objects, 1);
    expect(objects[0]).toEqual(1);
    expect(objects[1]).toEqual(3);
    expect(objects[2]).toEqual(2);
    expect(objects[3]).toEqual(4);
    expect(objects[4]).toEqual(5);
  });
});
//# sourceMappingURL=conceptMapAuthoringController.spec.js.map

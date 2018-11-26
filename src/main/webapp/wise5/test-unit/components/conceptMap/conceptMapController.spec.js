'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockConceptMapNode = function () {
  function MockConceptMapNode(draw, instanceId) {
    _classCallCheck(this, MockConceptMapNode);

    this.instanceId = instanceId;
  }

  _createClass(MockConceptMapNode, [{
    key: 'getId',
    value: function getId() {
      return this.instanceId;
    }
  }, {
    key: 'remove',
    value: function remove() {}
  }]);

  return MockConceptMapNode;
}();

var MockConceptMapLink = function () {
  function MockConceptMapLink(draw, instanceId) {
    _classCallCheck(this, MockConceptMapLink);

    this.instanceId = instanceId;
  }

  _createClass(MockConceptMapLink, [{
    key: 'getId',
    value: function getId() {
      return this.instanceId;
    }
  }, {
    key: 'remove',
    value: function remove() {}
  }]);

  return MockConceptMapLink;
}();

var mockConceptMapService = {
  newConceptMapNode: function newConceptMapNode(draw, instanceId) {
    return new MockConceptMapNode(draw, instanceId);
  },
  newConceptMapLink: function newConceptMapLink(draw, instanceId) {
    return new MockConceptMapLink(draw, instanceId);
  }
};

describe('ConceptMapController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var conceptMapController = void 0;
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

    conceptMapController = $controller('ConceptMapController', { $scope: $scope, ConceptMapService: mockConceptMapService });
    conceptMapController.nodeId = 'node1';
  }));

  it('should populate the student work', function () {
    var componentState = {
      'clientSaveTime': 1542412588000,
      'isSubmit': false,
      'studentData': {
        'conceptMapData': {
          'nodes': [{
            'originalId': 'node1',
            'instanceId': 'studentNode1',
            'fileName': 'sun.png',
            'filePath': '/wise/curriculum/546/assets/sun.png',
            'label': 'Sun',
            'x': 162,
            'y': 68,
            'width': 100,
            'height': 100,
            'outgoingLinks': [{
              'originalId': 'link1',
              'instanceId': 'studentLink1',
              'label': 'Solar Radiation'
            }],
            'incomingLinks': []
          }, {
            'originalId': 'node2',
            'instanceId': 'studentNode2',
            'fileName': 'Space.png',
            'filePath': '/wise/curriculum/546/assets/Space.png',
            'label': 'Space',
            'x': 416,
            'y': 185,
            'width': 100,
            'height': 100,
            'outgoingLinks': [],
            'incomingLinks': [{
              'originalId': 'link1',
              'instanceId': 'studentLink1',
              'label': 'Solar Radiation'
            }]
          }],
          'links': [{
            'originalId': 'link1',
            'instanceId': 'studentLink1',
            'color': '#DDD266',
            'label': 'Solar Radiation',
            'curvature': 0,
            'startCurveUp': false,
            'endCurveUp': false,
            'sourceNodeOriginalId': 'node1',
            'sourceNodeInstanceId': 'studentNode1',
            'sourceNodeLabel': 'Sun',
            'destinationNodeOriginalId': 'node2',
            'destinationNodeInstanceId': 'studentNode2',
            'destinationNodeLabel': 'Space'
          }]
        },
        'submitCounter': 0
      },
      'componentType': 'ConceptMap',
      'nodeId': 'node1',
      'componentId': 'ut00qpig10'
    };
    var setNodeMouseEventsSpy = spyOn(conceptMapController, 'setNodeMouseEvents');
    var setLinkMouseEventsSpy = spyOn(conceptMapController, 'setLinkMouseEvents');
    var moveLinkTextToFrontSpy = spyOn(conceptMapController, 'moveLinkTextToFront');
    var moveNodesToFrontSpy = spyOn(conceptMapController, 'moveNodesToFront');
    conceptMapController.setStudentWork(componentState);
    expect(setNodeMouseEventsSpy).toHaveBeenCalled();
    expect(setLinkMouseEventsSpy).toHaveBeenCalled();
    expect(moveLinkTextToFrontSpy).toHaveBeenCalled();
    expect(moveNodesToFrontSpy).toHaveBeenCalled();
    expect(conceptMapController.nodes.length).toEqual(2);
    expect(conceptMapController.links.length).toEqual(1);
  });

  it('should clear the concept map', function () {
    conceptMapController.addNode(new MockConceptMapNode(null, 'node1'));
    conceptMapController.addNode(new MockConceptMapNode(null, 'node2'));
    conceptMapController.addLink(new MockConceptMapLink(null, 'link1'));
    conceptMapController.addLink(new MockConceptMapLink(null, 'link2'));
    expect(conceptMapController.nodes.length).toEqual(2);
    expect(conceptMapController.links.length).toEqual(2);
    conceptMapController.clearConceptMap();
    expect(conceptMapController.nodes.length).toEqual(0);
    expect(conceptMapController.links.length).toEqual(0);
  });
});
//# sourceMappingURL=conceptMapController.spec.js.map

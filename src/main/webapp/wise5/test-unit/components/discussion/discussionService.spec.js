'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockTeacherDataService = function () {
  function MockTeacherDataService() {
    _classCallCheck(this, MockTeacherDataService);
  }

  _createClass(MockTeacherDataService, [{
    key: 'getComponentStatesByWorkgroupIdAndComponentId',
    value: function getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
      return [];
    }
  }, {
    key: 'getComponentStatesByComponentId',
    value: function getComponentStatesByComponentId(componentId) {
      return [];
    }
  }]);

  return MockTeacherDataService;
}();

describe('DiscussionService', function () {

  var DiscussionService = void 0;
  var TeacherDataService = void 0;
  var createComponentState = function createComponentState(componentStateId, nodeId, componentId, componentStateIdReplyingTo, response) {
    return {
      id: componentStateId,
      nodeId: nodeId,
      componentId: componentId,
      studentData: {
        response: response,
        componentStateIdReplyingTo: componentStateIdReplyingTo
      }
    };
  };

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_DiscussionService_) {
    DiscussionService = _DiscussionService_;
    TeacherDataService = new MockTeacherDataService();
  }));

  it('should check that a component state does not have student work', function () {
    var componentState = {
      studentData: {
        response: ''
      }
    };
    var hasStudentWork = DiscussionService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(false);
  });

  it('should check that a component state has student work', function () {
    var componentState = {
      studentData: {
        response: 'The sun generates heat.'
      }
    };
    var hasStudentWork = DiscussionService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(true);
  });

  it('should get post and all replies with component id and component state id', function () {
    var nodeId = 'node1';
    var componentId = 'component1';
    var componentStateId = 1;
    DiscussionService.TeacherDataService = TeacherDataService;
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByComponentId').and.callFake(function () {
      var componentStates = [createComponentState(1, nodeId, componentId, null, 'Hello'), createComponentState(2, nodeId, componentId, 1, 'World')];
      return componentStates;
    });
    var postAndAllReplies = DiscussionService.getPostAndAllReplies(componentId, componentStateId);
    expect(postAndAllReplies.length).toEqual(2);
  });

  it('should get posts associated with workgroup id', function () {
    var nodeId = 'node1';
    var componentId = 'component1';
    var workgroupId = 1;
    var alicePost1 = createComponentState(1, nodeId, componentId, null, 'Alice Thread');
    var alicePost2 = createComponentState(2, nodeId, componentId, 1, 'Alice reply in Alice Thread');
    var bobPost1 = createComponentState(3, nodeId, componentId, null, 'Bob Thread');
    var alicePost3 = createComponentState(4, nodeId, componentId, 3, 'Alice reply in Bob Thread');
    DiscussionService.TeacherDataService = TeacherDataService;
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByWorkgroupIdAndComponentId').and.callFake(function () {
      var componentStates = [alicePost1, alicePost2, alicePost3];
      return componentStates;
    });
    spyOn(DiscussionService.TeacherDataService, 'getComponentStatesByComponentId').and.callFake(function () {
      var componentStates = [alicePost1, alicePost2, bobPost1, alicePost3];
      return componentStates;
    });
    var postAndAllReplies = DiscussionService.getPostsAssociatedWithWorkgroupId(componentId, workgroupId);
    expect(postAndAllReplies.length).toEqual(4);
  });
});
//# sourceMappingURL=discussionService.spec.js.map

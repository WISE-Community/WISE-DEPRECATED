'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('DrawController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var drawController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      'id': '6ib04ymmi8',
      'type': 'Draw',
      'prompt': 'Draw your favorite thing.',
      'showSaveButton': false,
      'showSubmitButton': false,
      'stamps': {
        'Stamps': ['carbon.png', 'oxygen.png']
      },
      'tools': {
        'select': true,
        'line': true,
        'shape': true,
        'freeHand': true,
        'text': true,
        'stamp': true,
        'strokeColor': true,
        'fillColor': true,
        'clone': true,
        'strokeWidth': true,
        'sendBack': true,
        'sendForward': true,
        'undo': true,
        'redo': true,
        'delete': true
      },
      'showAddToNotebookButton': true,
      'background': 'background.png'
    };
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    drawController = $controller('DrawController', { $scope: $scope });
    drawController.nodeId = 'node1';
  }));

  it('should set the draw data', function () {
    drawController.drawingTool = {
      load: {}
    };
    spyOn(drawController.drawingTool, 'load').and.callFake(function () {});
    var componentState = {
      studentData: {
        drawData: '{"version":1,"dt":{"width":800,"height":600},"canvas":{"objects":[{"type":"rect","originX":"center","originY":"center","left":365,"top":162,"width":304,"height":162,"fill":"","stroke":"#333","strokeWidth":8,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}],"background":"#fff","backgroundImage":{"type":"image","originX":"center","originY":"center","left":400,"top":300,"width":1200,"height":800,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"anonymous","alignX":"none","alignY":"none","meetOrSlice":"meet","lockUniScaling":false,"src":"http://localhost:8080/curriculum/10/assets/background.jpg","filters":[],"resizeFilters":[]}}}',
        submitCounter: 2
      }
    };
    expect(drawController.submitCounter).toEqual(0);
    drawController.setDrawData(componentState);
    expect(drawController.drawingTool.load).toHaveBeenCalled();
    expect(drawController.submitCounter).toEqual(2);
  });

  it('should check that the canvas is empty', function () {
    drawController.drawingTool = {
      canvas: {
        getObjects: {}
      }
    };
    spyOn(drawController.drawingTool.canvas, 'getObjects').and.callFake(function () {
      return [];
    });
    var isEmpty = drawController.isCanvasEmpty();
    expect(drawController.drawingTool.canvas.getObjects).toHaveBeenCalled();
    expect(isEmpty).toEqual(true);
  });

  it('should check that the canvas is not empty', function () {
    drawController.drawingTool = {
      canvas: {
        getObjects: {}
      }
    };
    spyOn(drawController.drawingTool.canvas, 'getObjects').and.callFake(function () {
      return [{ id: 1 }, { id: 2 }];
    });
    var isEmpty = drawController.isCanvasEmpty();
    expect(drawController.drawingTool.canvas.getObjects).toHaveBeenCalled();
    expect(isEmpty).toEqual(false);
  });
});
//# sourceMappingURL=drawController.spec.js.map

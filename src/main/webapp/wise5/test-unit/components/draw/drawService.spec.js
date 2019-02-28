'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('DrawService', function () {

  var DrawService = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_DrawService_) {
    DrawService = _DrawService_;
  }));

  it('should create a component', function () {
    var componentContent = DrawService.createComponent();
    expect(componentContent.type).toEqual('Draw');
    expect(componentContent.stamps.Stamps.length).toEqual(0);
    expect(componentContent.tools.select).toEqual(true);
  });

  it('should check that the component is not completed', function () {
    var component = {};
    var componentStates = [];
    var isCompleted = DrawService.isCompleted(component, componentStates);
    expect(isCompleted).toEqual(false);
  });

  it('should check that the component is completed', function () {
    var component = {};
    var componentState = {
      studentData: {
        drawData: '{"version":1,"dt":{"width":800,"height":600},"canvas":{"objects":[{"type":"rect","originX":"center","originY":"center","left":365,"top":162,"width":304,"height":162,"fill":"","stroke":"#333","strokeWidth":8,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}],"background":"#fff","backgroundImage":{"type":"image","originX":"center","originY":"center","left":400,"top":300,"width":1200,"height":800,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"anonymous","alignX":"none","alignY":"none","meetOrSlice":"meet","lockUniScaling":false,"src":"http://localhost:8080/curriculum/10/assets/background.jpg","filters":[],"resizeFilters":[]}}}'
      }
    };
    var componentEvents = [];
    var nodeEvents = [];
    var node = {};
    var componentStates = [componentState];
    var isCompleted = DrawService.isCompleted(component, componentStates, componentEvents, nodeEvents, node);
    expect(isCompleted).toEqual(true);
  });

  it('should check that the component state does not have student work', function () {
    var componentState = {
      studentData: {
        drawData: '{"version":1,"dt":{"width":800,"height":600},"canvas":{"objects":[],"background":"#fff","backgroundImage":{"type":"image","originX":"center","originY":"center","left":400,"top":300,"width":1200,"height":800,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"anonymous","alignX":"none","alignY":"none","meetOrSlice":"meet","lockUniScaling":false,"src":"http://localhost:8080/curriculum/10/assets/background.jpg","filters":[],"resizeFilters":[]}}}'
      }
    };
    var componentContent = {};
    var hasStudentWork = DrawService.componentStateHasStudentWork(componentState, componentContent);
    expect(hasStudentWork).toEqual(false);
  });

  it('should check that the component state has student work', function () {
    var componentState = {
      studentData: {
        drawData: '{"version":1,"dt":{"width":800,"height":600},"canvas":{"objects":[{"type":"rect","originX":"center","originY":"center","left":365,"top":162,"width":304,"height":162,"fill":"","stroke":"#333","strokeWidth":8,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}],"background":"#fff","backgroundImage":{"type":"image","originX":"center","originY":"center","left":400,"top":300,"width":1200,"height":800,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"anonymous","alignX":"none","alignY":"none","meetOrSlice":"meet","lockUniScaling":false,"src":"http://localhost:8080/curriculum/10/assets/background.jpg","filters":[],"resizeFilters":[]}}}'
      }
    };
    var componentContent = {};
    var hasStudentWork = DrawService.componentStateHasStudentWork(componentState, componentContent);
    expect(hasStudentWork).toEqual(true);
  });
});
//# sourceMappingURL=drawService.spec.js.map

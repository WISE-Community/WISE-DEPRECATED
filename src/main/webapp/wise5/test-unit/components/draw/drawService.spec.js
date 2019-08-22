import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('DrawService', () => {

  let DrawService;

  beforeEach(angular.mock.module(mainModule.name));

  beforeEach(inject((_DrawService_) => {
    DrawService = _DrawService_;
  }));

  it('should create a component', () => {
    const componentContent = DrawService.createComponent();
    expect(componentContent.type).toEqual('Draw');
    expect(componentContent.stamps.Stamps.length).toEqual(0);
    expect(componentContent.tools.select).toEqual(true);
  });

  it('should check that the component is not completed', () => {
    const component = {};
    const componentStates = [];
    const isCompleted = DrawService.isCompleted(component, componentStates);
    expect(isCompleted).toEqual(false);
  });

  it('should check that the component is completed', () => {
    const component = {};
    const componentState = {
      studentData: {
        drawData: '{"version":1,"dt":{"width":800,"height":600},"canvas":{"objects":[{"type":"rect","originX":"center","originY":"center","left":365,"top":162,"width":304,"height":162,"fill":"","stroke":"#333","strokeWidth":8,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}],"background":"#fff","backgroundImage":{"type":"image","originX":"center","originY":"center","left":400,"top":300,"width":1200,"height":800,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"anonymous","alignX":"none","alignY":"none","meetOrSlice":"meet","lockUniScaling":false,"src":"http://localhost:8080/curriculum/10/assets/background.jpg","filters":[],"resizeFilters":[]}}}'
      }
    };
    const componentEvents = [];
    const nodeEvents = [];
    const node = {};
    const componentStates = [componentState];
    const isCompleted = DrawService.isCompleted(component, componentStates, componentEvents, nodeEvents, node);
    expect(isCompleted).toEqual(true);
  });

  it('should check that the component state does not have student work', () => {
    const componentState = {
      studentData: {
        drawData: '{"version":1,"dt":{"width":800,"height":600},"canvas":{"objects":[],"background":"#fff","backgroundImage":{"type":"image","originX":"center","originY":"center","left":400,"top":300,"width":1200,"height":800,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"anonymous","alignX":"none","alignY":"none","meetOrSlice":"meet","lockUniScaling":false,"src":"http://localhost:8080/curriculum/10/assets/background.jpg","filters":[],"resizeFilters":[]}}}'
      }
    };
    const componentContent = {};
    const hasStudentWork = DrawService.componentStateHasStudentWork(componentState, componentContent);
    expect(hasStudentWork).toEqual(false);
  });

  it('should check that the component state has student work', () => {
    const componentState = {
      studentData: {
        drawData: '{"version":1,"dt":{"width":800,"height":600},"canvas":{"objects":[{"type":"rect","originX":"center","originY":"center","left":365,"top":162,"width":304,"height":162,"fill":"","stroke":"#333","strokeWidth":8,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"rx":0,"ry":0}],"background":"#fff","backgroundImage":{"type":"image","originX":"center","originY":"center","left":400,"top":300,"width":1200,"height":800,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeLineJoin":"miter","strokeMiterLimit":10,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"clipTo":null,"backgroundColor":"","fillRule":"nonzero","globalCompositeOperation":"source-over","transformMatrix":null,"skewX":0,"skewY":0,"crossOrigin":"anonymous","alignX":"none","alignY":"none","meetOrSlice":"meet","lockUniScaling":false,"src":"http://localhost:8080/curriculum/10/assets/background.jpg","filters":[],"resizeFilters":[]}}}'
      }
    };
    const componentContent = {};
    const hasStudentWork = DrawService.componentStateHasStudentWork(componentState, componentContent);
    expect(hasStudentWork).toEqual(true);
  });

});

import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let animationAuthoringController;
let component;

const mockUtilService = {
  generateKey: function(length) {
    return '1234567890';
  }
};

describe('AnimationAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = createComponent();
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));

    animationAuthoringController = $controller('AnimationAuthoringController', {
      $scope: $scope,
      UtilService: mockUtilService
    });
  }));

  shouldAddAnAnimationObject();
  shouldAddADataPointToAnAnimationObject();
  shouldAddADataSourceFromAnAnimationObject();
  shouldDeleteADataSourceFromAnAnimationObject();
});

function createComponent() {
  return {
    id: '3tyam4h4iy',
    type: 'Animation',
    prompt: '',
    showSaveButton: false,
    showSubmitButton: false,
    widthInPixels: 600,
    widthInUnits: 60,
    heightInPixels: 200,
    heightInUnits: 20,
    dataXOriginInPixels: 0,
    dataYOriginInPixels: 80,
    coordinateSystem: 'screen',
    objects: [],
    showAddToNotebookButton: true
  };
}

function shouldAddAnAnimationObject() {
  it('should add an animation object', () => {
    spyOn(animationAuthoringController, 'componentChanged');
    animationAuthoringController.authoringAddObject();
    expect(animationAuthoringController.authoringComponentContent.objects.length).toEqual(1);
  });
}

function shouldAddADataPointToAnAnimationObject() {
  it('should add a data point to an animation object', () => {
    spyOn(animationAuthoringController, 'componentChanged');
    const animationObject = {};
    animationAuthoringController.authoringAddDataPointToObject(animationObject);
    expect(animationObject.data.length).toEqual(1);
  });
}

function shouldAddADataSourceFromAnAnimationObject() {
  it('should add a data source from an animation object', () => {
    spyOn(animationAuthoringController, 'componentChanged');
    const animationObject = {};
    animationAuthoringController.authoringAddDataSource(animationObject);
    expect(animationObject.dataSource).not.toBeNull();
  });
}

function shouldDeleteADataSourceFromAnAnimationObject() {
  it('should delete a data source from an animation object', () => {
    spyOn(animationAuthoringController, 'componentChanged');
    spyOn(window, 'confirm').and.returnValue(true);
    const animationObject = {
      dataSource: {}
    };
    animationAuthoringController.authoringDeleteDataSource(animationObject);
    expect(animationObject.hasOwnProperty('dataSource')).toBeFalsy();
  });
}

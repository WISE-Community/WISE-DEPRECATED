import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { ConfigService } from '../../../../../../wise5/services/configService';
import { ProjectService } from '../../../../../../wise5/services/projectService';
import { TeacherDataService } from '../../../../../../wise5/services/teacherDataService';
import { UtilService } from '../../../../../../wise5/services/utilService';
import { ChooseNewComponentLocation } from './choose-new-component-location.component';

const nodeId = 'node1';
const components = [
  { id: 'comp1', type: 'OpenResponse' },
  { id: 'comp2', type: 'MultipleChoice' }
];

class MockProjectService {
  createComponent(componentType) {
    return { id: 'comp3', type: componentType };
  }

  getComponentsByNodeId() {
    return components;
  }

  saveProject() {
    return new Promise(() => {});
  }
}

class MockTeacherDataService {
  getCurrentNodeId() {
    return nodeId;
  }
}

class MockUpgradeModule {
  $injector: any = {
    get() {
      return { componentType: 'Discussion' };
    }
  };
}

let component: ChooseNewComponentLocation;
let projectService: ProjectService;

describe('ChooseNewComponentLocation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChooseNewComponentLocation,
        ConfigService,
        { provide: ProjectService, useClass: MockProjectService },
        { provide: TeacherDataService, useClass: MockTeacherDataService },
        { provide: UpgradeModule, useClass: MockUpgradeModule },
        UtilService
      ]
    });
    component = TestBed.inject(ChooseNewComponentLocation);
    projectService = TestBed.inject(ProjectService);
  });

  it('should have nodeId and components set after initialization', () => {
    component.ngOnInit();
    expect(component.nodeId).toEqual(nodeId);
    expect(component.components).toEqual(components);
  });

  it('insertComponentAfter() should create a new component and save the project', () => {
    spyOn(projectService, 'createComponent').and.returnValue({ id: 'comp3', type: 'Discussion' });
    spyOn(projectService, 'saveProject').and.returnValue(new Promise(() => {}));
    component.insertComponentAfter('comp2');
    expect(projectService.createComponent).toHaveBeenCalled();
    expect(projectService.saveProject).toHaveBeenCalled();
  });
});

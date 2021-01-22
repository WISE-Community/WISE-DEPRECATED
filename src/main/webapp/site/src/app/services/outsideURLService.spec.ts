import { OutsideURLService } from '../../../../wise5/components/outsideURL/outsideURLService';
import { TestBed } from '@angular/core/testing';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { UtilService } from '../../../../wise5/services/utilService';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { TagService } from '../../../../wise5/services/tagService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: OutsideURLService;
let http: HttpTestingController;

describe('OutsideURLService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        OutsideURLService,
        ProjectService,
        SessionService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(OutsideURLService);
  });
  createComponent();
  getOpenEducationalResources();
});

function createComponent() {
  it('should create an outside url component', () => {
    const component = service.createComponent();
    expect(component.type).toEqual('OutsideURL');
    expect(component.url).toEqual('');
    expect(component.height).toEqual(600);
  });
}

function getOpenEducationalResources() {
  it('should get educational resources', () => {
    const url = 'https://www.somewebsite.com/model.html';
    service.getOpenEducationalResources().then((resources: any[]) => {
      expect(resources.length).toEqual(1);
      expect(resources[0].url).toEqual(url);
    });
    http.expectOne('wise5/components/outsideURL/resources.json').flush([{ url: url }]);
  });
}

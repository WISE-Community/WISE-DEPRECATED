import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { TagService } from '../../../../wise5/services/tagService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ClassroomMonitorProjectService } from '../../../../wise5/classroomMonitor/classroomMonitorProjectService';
import { UtilService } from '../../../../wise5/services/utilService';

let configService: ConfigService;
let projectService: ClassroomMonitorProjectService;
let utilService: UtilService;
let http: HttpTestingController;
let service: TagService;

describe('TagService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [ ClassroomMonitorProjectService, ConfigService, TagService, UtilService ]
    })
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    projectService = TestBed.get(ClassroomMonitorProjectService);
    utilService = TestBed.get(UtilService);
    service = TestBed.get(TagService);
  });
  retrieveTags();
  getNextAvailableTag();
});

function retrieveTags() {
  it('should retrieve tags', () => {
    const response = [
      { id: 1, name: 'Group 1' },
      { id: 2, name: 'Group 2' }
    ];
    service.retrieveTags().subscribe((data) => {
      expect(data).toEqual(response);
    });
    const req = http.expectOne(`/api/tag/run/${configService.getRunId()}`);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(service.tags).toEqual(response);
  });
}

function getNextAvailableTag() {
  it('should get the next available tag', () => {
    const existingTags = [
      { name: 'Group 1' },
      { name: 'Group 2' }
    ];
    spyOn(projectService, 'getTags').and.returnValue(existingTags);
    expect(service.getNextAvailableTag()).toEqual('Group 3');
  });
}
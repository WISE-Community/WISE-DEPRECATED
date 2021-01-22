import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { TagService } from '../../../../wise5/services/tagService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { SessionService } from '../../../../wise5/services/sessionService';

let configService: ConfigService;
let projectService: ProjectService;
let utilService: UtilService;
let http: HttpTestingController;
let service: TagService;

describe('TagService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ConfigService, ProjectService, SessionService, TagService, UtilService]
    });
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
    projectService = TestBed.get(ProjectService);
    utilService = TestBed.get(UtilService);
    service = TestBed.get(TagService);
  });
  retrieveRunTags();
  getNextAvailableTag();
});

function retrieveRunTags() {
  it('should retrieve run tags', () => {
    const response = [
      { id: 1, name: 'Group 1' },
      { id: 2, name: 'Group 2' }
    ];
    service.retrieveRunTags().subscribe((data) => {
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
    const existingTags = [{ name: 'Group 1' }, { name: 'Group 2' }];
    spyOn(projectService, 'getTags').and.returnValue(existingTags);
    expect(service.getNextAvailableTag()).toEqual('Group 3');
  });
}

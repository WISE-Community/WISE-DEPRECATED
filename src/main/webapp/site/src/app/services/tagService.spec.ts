import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { TagService } from '../../../../wise5/services/tagService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ExpectedConditions } from 'protractor';

let configService: ConfigService;
let http: HttpTestingController;
let service: TagService;

describe('TagService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [ ConfigService, TagService ]
    })
    http = TestBed.get(HttpTestingController);
    configService = TestBed.get(ConfigService);
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
    service.tags = [
      { id: 1, name: 'Group 1' },
      { id: 2, name: 'Group 2' }
    ];
    expect(service.getNextAvailableTag()).toEqual('Group 3');
  });
}
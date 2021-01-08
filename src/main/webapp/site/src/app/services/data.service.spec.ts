import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { SessionService } from '../../../../wise5/services/sessionService';
import { UtilService } from '../../../../wise5/services/utilService';

import { DataService } from './data.service';

let service: DataService;
let projectService: ProjectService;

describe('DataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ConfigService, ProjectService, SessionService, UtilService]
    });
    service = TestBed.inject(DataService);
    projectService = TestBed.inject(ProjectService);
  });

  setCurrentNode();
});

function setCurrentNode() {
  it('should set the new current node when there is no current node', () => {
    const node = { id: 'node1' };
    expect(service.currentNode).toEqual(null);
    service.setCurrentNode(node);
    expect(service.currentNode).toEqual(node);
  });
  it('should set the new current node when there is a current node', () => {
    const node1 = { id: 'node1' };
    const node2 = { id: 'node2' };
    service.setCurrentNode(node1);
    expect(service.currentNode).toEqual(node1);
    spyOn(projectService, 'isGroupNode').and.callFake(() => {
      return false;
    });
    spyOn(service, 'broadcastCurrentNodeChanged').and.callFake(() => {});
    service.setCurrentNode(node2);
    expect(service.previousStep).toEqual(node1);
    expect(service.currentNode).toEqual(node2);
  });
}

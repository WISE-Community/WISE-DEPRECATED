import { TestBed } from '@angular/core/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { SpaceService } from '../../../../wise5/services/spaceService';
import { UtilService } from '../../../../wise5/services/utilService';
import { SessionService } from '../../../../wise5/services/sessionService';
let service: SpaceService;
let projectService: ProjectService;

describe('SpaceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [ ConfigService, ProjectService, SessionService, SpaceService, UtilService ]
    });
    projectService = TestBed.get(ProjectService);
    service = TestBed.get(SpaceService)
  });
  createSpace();
  addSpace();
  removeSpace();
});

function createSpace() {
  describe('createSpace()', () => {
    it('should create a space object', () => {
      const id = 'public';
      const name = 'Public';
      const isPublic = true;
      const isShowInNotebook = true;
      const space = service.createSpace(id, name, isPublic, isShowInNotebook);
      expect(space).toEqual({
        id: id,
        name: name,
        isPublic: isPublic,
        isShowInNotebook: isShowInNotebook
      })
    });
  });
}

function addSpace() {
  describe('addSpace()', () => {
    it('should add a space', () => {
      const id = 'public';
      const name = 'Public';
      const isPublic = true;
      const isShowInNotebook = true;
      spyOn(projectService, 'addSpace');
      service.addSpace(id, name, isPublic, isShowInNotebook);
      expect(projectService.addSpace).toHaveBeenCalledWith({
        id: id,
        name: name,
        isPublic: isPublic,
        isShowInNotebook: isShowInNotebook
      })
    });
  });
}

function removeSpace() {
  describe('removeSpace()', () => {
    it('should remove a space', () => {
      spyOn(projectService, 'removeSpace');
      service.removeSpace('public');
      expect(projectService.removeSpace).toHaveBeenCalledWith('public');
    });
  });
}
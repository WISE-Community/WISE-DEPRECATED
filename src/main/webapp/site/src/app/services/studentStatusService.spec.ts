import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { StudentStatusService } from '../../../../wise5/services/studentStatusService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UpgradeModule } from '@angular/upgrade/static';
import { ProjectService } from '../../../../wise5/services/projectService';
import { UtilService } from '../../../../wise5/services/utilService';
import { SessionService } from '../../../../wise5/services/sessionService';

let configService: ConfigService;
let service: StudentStatusService;
let http: HttpTestingController;

describe('StudentStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        ProjectService,
        SessionService,
        StudentStatusService,
        UtilService
      ]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(StudentStatusService);
    configService = TestBed.get(ConfigService);
  });
  retrieveStudentStatuses();
});

function retrieveStudentStatuses() {
  describe('retrieveStudentStatuses', () => {
    retrieveStudentStatuses_SetStudentStatuses();
  });
}

function retrieveStudentStatuses_SetStudentStatuses() {
  it('retrieve and set student statuses for current run', () => {
    const currentRunId = 1;
    const statusPostTimestamp = 12345;
    spyOn(configService, 'getRunId').and.returnValue(currentRunId);
    const retrieveStudentStatusesURL = `/api/teacher/run/${currentRunId}/student-status`;
    const statusesExpected = [
      { timestamp: statusPostTimestamp, status: `{"runId":${currentRunId}}` }
    ];
    service.retrieveStudentStatuses().then((response) => {
      expect(response.length).toEqual(1);
    });
    http.expectOne(retrieveStudentStatusesURL).flush(statusesExpected);
  });
}

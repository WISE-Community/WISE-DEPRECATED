import vleModule from '../../vle/vle';

let AnnotationService,
  ConfigService,
  ProjectService,
  StudentStatusService,
  $httpBackend;

describe('StudentStatusService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject(function(
    _$httpBackend_,
    _AnnotationService_,
    _ConfigService_,
    _ProjectService_,
    _StudentStatusService_,
  ) {
    AnnotationService = _AnnotationService_;
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    StudentStatusService = _StudentStatusService_;
    $httpBackend = _$httpBackend_;
  }));

  describe('retrieveStudentStatuses', () => {
    retrieveStudentStatuses_SetStudentStatuses();
    function retrieveStudentStatuses_SetStudentStatuses() {
      it('retrieve and set student statuses for current run', () => {
        const currentRunId = 1;
        const statusPostTimestamp = 12345;
        spyOn(ConfigService, 'getRunId').and.returnValue(currentRunId);
        const retrieveStudentStatusesURL = `/api/teacher/run/${currentRunId}/student-status`;
        $httpBackend.when('GET', /wise5\/.*/).respond(200, '');
        $httpBackend.when('GET', retrieveStudentStatusesURL);
        const statusesExpected =
          [{timestamp: statusPostTimestamp, status: `{"runId":${currentRunId}}`}];
        const statusesPromise = StudentStatusService.retrieveStudentStatuses();
        $httpBackend.expectGET(retrieveStudentStatusesURL).respond(statusesExpected);
        statusesPromise.then(result => {
          expect(result.length).toEqual(1);
          expect(result[0].postTimestamp).toEqual(statusPostTimestamp);
        });
        $httpBackend.flush();
      });
    }
  });
});

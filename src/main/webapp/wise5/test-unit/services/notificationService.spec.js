import vleModule from '../../vle/vle';

let AnnotationService,
  ConfigService,
  ProjectService,
  NotificationService,
  $httpBackend;

describe('NotificationService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject(function(
    _$httpBackend_,
    _AnnotationService_,
    _ConfigService_,
    _ProjectService_,
    _NotificationService_,
  ) {
    AnnotationService = _AnnotationService_;
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    NotificationService = _NotificationService_;
    $httpBackend = _$httpBackend_;
  }));

  describe('retrieveNotifications', () => {
    retrieveNotifications_Teacher_ShouldReturnAndSetNotificaitons();
    function retrieveNotifications_Teacher_ShouldReturnAndSetNotificaitons() {
      it('retrieve and set notifications for current run', () => {
        const currentRunId = 1;
        const retrieveNotificationsURL = `/notifications/${currentRunId}`;
        spyOn(ConfigService, 'getNotificationURL').and.returnValue(retrieveNotificationsURL);
        $httpBackend.when('GET', /wise5\/.*/).respond(200, '');
        const notificationsExpected =
            [
              {"id":56,"groupId":null,"nodeId":"node1","componentId":"lxa2e3w3ed",
                  "componentType":null,"type":"teacherToStudent",
                  "message":"You have new feedback from your teacher!",
                  "data":"{\"annotationId\":103}","timeGenerated":1589303714000,
                  "timeDismissed":1589474238000,"serverSaveTime":1589303714000,
                  "runId":303,"periodId":133,"toWorkgroupId":67,"fromWorkgroupId":66}
            ];
        const notificationsPromise = NotificationService.retrieveNotifications();
        $httpBackend.expectGET(retrieveNotificationsURL).respond(notificationsExpected);
        notificationsPromise.then(result => {
          expect(result.length).toEqual(1);
          expect(result[0].data).toEqual({annotationId: 103});
        });
        $httpBackend.flush();
      });
    }
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { NotificationService } from '../../../../wise5/services/notificationService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { UtilService } from '../../../../wise5/services/utilService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: NotificationService;
let configService: ConfigService;
let http: HttpTestingController;
const notification1 = {
  id: 56,
  groupId: null,
  nodeId: 'node1',
  componentId: 'lxa2e3w3ed',
  componentType: null,
  type: 'teacherToStudent',
  message: 'You have new feedback from your teacher!',
  data: '{"annotationId":103}',
  timeGenerated: 1589303714000,
  timeDismissed: 1589474238000,
  serverSaveTime: 1589303714000,
  runId: 303,
  periodId: 133,
  toWorkgroupId: 67,
  fromWorkgroupId: 66
};

describe('NotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [ConfigService, NotificationService, ProjectService, SessionService, UtilService]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(NotificationService);
    configService = TestBed.get(ConfigService);
  });
  retrieveNotifications();
});

function retrieveNotifications() {
  describe('retrieveNotifications', () => {
    retrieveNotifications_Teacher_ShouldReturnAndSetNotificaitons();
  });
}

function retrieveNotifications_Teacher_ShouldReturnAndSetNotificaitons() {
  it('retrieve and set notifications for current run', () => {
    const currentRunId = 1;
    const retrieveNotificationsURL = `/notifications/${currentRunId}`;
    spyOn(configService, 'getNotificationURL').and.returnValue(retrieveNotificationsURL);
    const notificationsExpected = [notification1];
    service.retrieveNotifications().then((notifications: any) => {
      expect(notifications.length).toEqual(1);
    });
    http.expectOne(retrieveNotificationsURL).flush(notificationsExpected);
  });
}

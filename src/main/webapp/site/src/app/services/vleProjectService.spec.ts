import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { VLEProjectService } from '../../../../wise5/vle/vleProjectService';
import { ConfigService } from '../../../../wise5/services/configService';
import { UtilService } from '../../../../wise5/services/utilService';
import { SessionService } from '../../../../wise5/services/sessionService';
let service: VLEProjectService;
let configService: ConfigService;
let sessionService: SessionService;
let utilService: UtilService;
let http: HttpTestingController;

describe('VLEProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [VLEProjectService, ConfigService, SessionService, UtilService]
    });
    http = TestBed.get(HttpTestingController);
    service = TestBed.get(VLEProjectService);
    configService = TestBed.get(ConfigService);
    sessionService = TestBed.get(SessionService);
    utilService = TestBed.get(UtilService);
    spyOn(utilService, 'broadcastEventInRootScope');
  });
  shouldGetTheExpectedPreviousScore();
  shouldGetTheExpectedCurrentScore();
  shouldCorrectlyCalculateIsScoreMatchTrue();
  shouldCorrectlyCalculateIsScoreMatchFalse();
  shouldGetGlobalAnnotationGroupByScore();
  shouldGetNotificationByScore();
});

function shouldGetTheExpectedPreviousScore() {
  it('should get the expected previous score', () => {
    const scoreSequence = [3, 5];
    expect(service.getExpectedPreviousScore(scoreSequence)).toEqual(3);
  });
}

function shouldGetTheExpectedCurrentScore() {
  it('should get the expected current score', () => {
    const scoreSequence = [3, 5];
    expect(service.getExpectedCurrentScore(scoreSequence)).toEqual(5);
  });
}

function shouldCorrectlyCalculateIsScoreMatchTrue() {
  it('should correctly calculate isScoreMatch() true', () => {
    expect(service.isScoreMatch(1, '1, 2, 3')).toBe(true);
    expect(service.isScoreMatch(2, '1, 2, 3')).toBe(true);
    expect(service.isScoreMatch(3, '1, 2, 3')).toBe(true);
  });
}

function shouldCorrectlyCalculateIsScoreMatchFalse() {
  it('should correctly calculate isScoreMatch() false', () => {
    expect(service.isScoreMatch(4, '1, 2, 3')).toBe(false);
  });
}

function shouldGetGlobalAnnotationGroupByScore() {
  it('should get global annotation group by score', () => {
    const component = {
      globalAnnotationSettings: {
        globalAnnotationMaxCount: 2,
        globalAnnotationGroups: [
          {
            annotationGroupName: 'score012345firsttime',
            enableCriteria: {
              scoreSequence: ['', '0, 1, 2, 3, 4, 5']
            }
          },
          {
            annotationGroupName: 'score012',
            enableCriteria: {
              scoreSequence: ['0, 1, 2, 3, 4, 5', '0, 1, 2']
            }
          },
          {
            annotationGroupName: 'score3after1245',
            enableCriteria: {
              scoreSequence: ['1, 2, 4, 5', '3']
            }
          },
          {
            annotationGroupName: 'score3after3',
            enableCriteria: {
              scoreSequence: ['3', '3']
            }
          },
          {
            annotationGroupName: 'score4after1235',
            enableCriteria: {
              scoreSequence: ['1, 2, 3, 5', '4']
            }
          },
          {
            annotationGroupName: 'score4after4',
            enableCriteria: {
              scoreSequence: ['4', '4']
            }
          },
          {
            annotationGroupName: 'score5after1234',
            enableCriteria: {
              scoreSequence: ['1, 2, 3, 4', '5']
            }
          }
        ]
      }
    };
    let globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, null, 1);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score012345firsttime');
    globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, 1, 1);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score012');
    globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, 2, 3);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score3after1245');
    globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, 3, 3);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score3after3');
    globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, 3, 4);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score4after1235');
    globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, 4, 4);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score4after4');
    globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, 4, 5);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score5after1234');
    globalAnnotationGroup = service.getGlobalAnnotationGroupByScore(component, 5, 5);
    expect(globalAnnotationGroup).toBe(null);
  });
}

function shouldGetNotificationByScore() {
  it('should get notification by score', () => {
    const component = {
      notificationSettings: {
        notifications: [
          {
            enableCriteria: {
              scoreSequence: ['0, 1, 2, 3, 4, 5', '0, 1, 2']
            },
            notificationMessageToTeacher: '{{username}} needs a lot of help'
          },
          {
            enableCriteria: {
              scoreSequence: ['0, 1, 2, 3, 4, 5', '3']
            },
            notificationMessageToTeacher: '{{username}} needs some help'
          }
        ]
      }
    };
    let notification = service.getNotificationByScore(component, 3, 2);
    expect(notification.notificationMessageToTeacher).toEqual('{{username}} needs a lot of help');
    notification = service.getNotificationByScore(component, 2, 3);
    expect(notification.notificationMessageToTeacher).toEqual('{{username}} needs some help');
    notification = service.getNotificationByScore(component, 2, 5);
    expect(notification).toEqual(null);
  });
}

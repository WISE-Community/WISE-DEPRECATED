import vleModule from '../../vle/vle';

let ProjectService, $rootScope;

describe('VLEProjectService Unit Test', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject(function(_ProjectService_, _$rootScope_) {
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
  }));

  describe('ProjectService', () => {
    shouldGetTheExpectedPreviousScore();
    shouldGetTheExpectedCurrentScore();
    shouldCorrectlyCalculateIsScoreMatchTrue();
    shouldCorrectlyCalculateIsScoreMatchFalse();
    shouldGetGlobalAnnotationGroupByScore();
    shouldGetNotificationByScore();
  });
});

function shouldGetTheExpectedPreviousScore() {
  it('should get the expected previous score', () => {
    const scoreSequence = [3, 5];
    expect(ProjectService.getExpectedPreviousScore(scoreSequence)).toEqual(3);
  });
}

function shouldGetTheExpectedCurrentScore() {
  it('should get the expected current score', () => {
    const scoreSequence = [3, 5];
    expect(ProjectService.getExpectedCurrentScore(scoreSequence)).toEqual(5);
  });
}

function shouldCorrectlyCalculateIsScoreMatchTrue() {
  it('should correctly calculate isScoreMatch() true', () => {
    expect(ProjectService.isScoreMatch(1, '1, 2, 3')).toBe(true);
    expect(ProjectService.isScoreMatch(2, '1, 2, 3')).toBe(true);
    expect(ProjectService.isScoreMatch(3, '1, 2, 3')).toBe(true);
  });
}

function shouldCorrectlyCalculateIsScoreMatchFalse() {
  it('should correctly calculate isScoreMatch() false', () => {
    expect(ProjectService.isScoreMatch(4, '1, 2, 3')).toBe(false);
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
    let globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, null, 1);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score012345firsttime');
    globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, 1, 1);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score012');
    globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, 2, 3);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score3after1245');
    globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, 3, 3);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score3after3');
    globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, 3, 4);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score4after1235');
    globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, 4, 4);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score4after4');
    globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, 4, 5);
    expect(globalAnnotationGroup.annotationGroupName).toBe('score5after1234');
    globalAnnotationGroup = ProjectService.getGlobalAnnotationGroupByScore(component, 5, 5);
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
    let notification = ProjectService.getNotificationByScore(component, 3, 2);
    expect(notification.notificationMessageToTeacher).toEqual('{{username}} needs a lot of help');
    notification = ProjectService.getNotificationByScore(component, 2, 3);
    expect(notification.notificationMessageToTeacher).toEqual('{{username}} needs some help');
    notification = ProjectService.getNotificationByScore(component, 2, 5);
    expect(notification).toEqual(null);
  });
}

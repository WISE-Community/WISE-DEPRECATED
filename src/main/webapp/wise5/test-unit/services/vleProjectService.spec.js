import vleModule from '../../vle/vle';

describe('VLEProjectService Unit Test', () => {

  beforeEach(angular.mock.module(vleModule.name));

  const demoProjectJSONOriginal =
      window.mocks['test-unit/sampleData/curriculum/DemoProject/project'];
  const scootersProjectJSONOriginal =
      window.mocks['test-unit/sampleData/curriculum/SelfPropelledVehiclesChallenge/project'];

  let ConfigService, ProjectService, $rootScope, $httpBackend, demoProjectJSON, scootersProjectJSON;
  beforeEach(inject(function(_ConfigService_, _ProjectService_, _$rootScope_, _$httpBackend_) {
    ConfigService = _ConfigService_;
    ProjectService = _ProjectService_;
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    demoProjectJSON = JSON.parse(JSON.stringify(demoProjectJSONOriginal));
    scootersProjectJSON = JSON.parse(JSON.stringify(scootersProjectJSONOriginal));
  }));

  describe('ProjectService', () => {
    const projectIdDefault = 1;
    const projectBaseURL = "http://localhost:8080/curriculum/12345/";
    const projectURL = projectBaseURL + "project.json";
    const saveProjectURL = "http://localhost:8080/wise/project/save/" + projectIdDefault;
    const wiseBaseURL = "/wise";
    const i18nURL_common_en = "wise5/i18n/i18n_en.json";
    const i18nURL_vle_en = "wise5/vle/i18n/i18n_en.json";
    const sampleI18N_common_en = window.mocks['test-unit/sampleData/i18n/common/i18n_en'];
    const sampleI18N_vle_en = window.mocks['test-unit/sampleData/i18n/vle/i18n_en'];

    function createNormalSpy() {
      spyOn(ConfigService, "getConfigParam").and.callFake((param) => {
        if (param === "projectBaseURL") {
          return projectBaseURL;
        } else if (param === "projectURL") {
          return projectURL;
        } else if (param === "saveProjectURL") {
          return saveProjectURL;
        } else if (param === "wiseBaseURL") {
          return wiseBaseURL;
        }
      });
    }

    it('should get the expected previous score', () => {
      const scoreSequence = [3, 5];
      expect(ProjectService.getExpectedPreviousScore(scoreSequence)).toEqual(3);
    });

    it('should get the expected current score', () => {
      const scoreSequence = [3, 5];
      expect(ProjectService.getExpectedCurrentScore(scoreSequence)).toEqual(5);
    });

    it('should correctly calculate isScoreMatch() true', () => {
      expect(ProjectService.isScoreMatch(1, '1, 2, 3')).toBe(true);
      expect(ProjectService.isScoreMatch(2, '1, 2, 3')).toBe(true);
      expect(ProjectService.isScoreMatch(3, '1, 2, 3')).toBe(true);
    });

    it('should correctly calculate isScoreMatch() false', () => {
      expect(ProjectService.isScoreMatch(4, '1, 2, 3')).toBe(false);
    });

    it('should get global annotation group by score', () => {
      const component = {
        "globalAnnotationSettings": {
          "globalAnnotationMaxCount": 2,
          "globalAnnotationGroups": [{
            "annotationGroupName": "score012345firsttime",
            "enableCriteria": {
              "scoreSequence": ["", "0, 1, 2, 3, 4, 5"]
            }
          }, {
            "annotationGroupName": "score012",
            "enableCriteria": {
              "scoreSequence": ["0, 1, 2, 3, 4, 5", "0, 1, 2"]
            }
          }, {
            "annotationGroupName": "score3after1245",
            "enableCriteria": {
              "scoreSequence": ["1, 2, 4, 5", "3"]
            }
          }, {
            "annotationGroupName": "score3after3",
            "enableCriteria": {
              "scoreSequence": ["3", "3"]
            }
          }, {
            "annotationGroupName": "score4after1235",
            "enableCriteria": {
              "scoreSequence": ["1, 2, 3, 5", "4"]
            }
          }, {
            "annotationGroupName": "score4after4",
            "enableCriteria": {
              "scoreSequence": ["4", "4"]
            }
          }, {
            "annotationGroupName": "score5after1234",
            "enableCriteria": {
              "scoreSequence": ["1, 2, 3, 4", "5"]
            }
          }]
        }
      };
      let globalAnnotationGroup =
          ProjectService.getGlobalAnnotationGroupByScore(component, null, 1);
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
    
    it('should get notification by score', () => {
      const component = {
        "notificationSettings": {
          "notifications": [{
            "enableCriteria": {
              "scoreSequence": ["0, 1, 2, 3, 4, 5", "0, 1, 2"]
            },
            "notificationMessageToTeacher": "{{username}} needs a lot of help"
          },
          {
            "enableCriteria": {
              "scoreSequence": ["0, 1, 2, 3, 4, 5", "3"]
            },
            "notificationMessageToTeacher": "{{username}} needs some help"
          }]
        }
      }
      let notification = ProjectService.getNotificationByScore(component, 3, 2);
      expect(notification.notificationMessageToTeacher).toEqual('{{username}} needs a lot of help');
      notification = ProjectService.getNotificationByScore(component, 2, 3);
      expect(notification.notificationMessageToTeacher).toEqual('{{username}} needs some help');
      notification = ProjectService.getNotificationByScore(component, 2, 5);
      expect(notification).toEqual(null);
    });
  });
});

import angular from 'angular';
import mainModule from 'vle/main';
import 'angular-mocks';

describe('GraphService', () => {

  beforeEach(angular.mock.module(mainModule.name));

  let GraphService;

  beforeEach(inject((_GraphService_) => {
    GraphService = _GraphService_;
  }));

  describe('hasTrialData()', () => {
    let studentDataWithTrial = {};
    beforeEach(() => {
      studentDataWithTrial = {
        trials: [
          {
            series: [
              {
                data: [ [1,5], [2,10] ]
              }
            ]
          }
        ]
      };
    });

    it('should return false when trials is null', () => {
      studentDataWithTrial.trials = null;
      expect(GraphService.hasTrialData(studentDataWithTrial)).toBeFalsy();
    });

    it('should return false when there is no series in any trial', () => {
      for (let trial of studentDataWithTrial.trials) {
        trial.series = [];
      }
      expect(GraphService.hasTrialData(studentDataWithTrial)).toBeFalsy();
    });

    it('should return true when there is a series in a trial with data', () => {
      expect(GraphService.hasTrialData(studentDataWithTrial)).toBeTruthy();
    });
  });
});

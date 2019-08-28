import vleModule from '../../../vle/vle';

describe('GraphService', () => {

  beforeEach(angular.mock.module(vleModule.name));

  let GraphService;

  beforeEach(inject((_GraphService_) => {
    GraphService = _GraphService_;
  }));

  describe('hasSeriesData()', () => {
    it('should return false when series is null', () => {
      const studentData = {};
      expect(GraphService.hasSeriesData(studentData)).toBeFalsy();
    });

    it('should return false when series data is empty', () => {
      const studentData = {
        series: [{}]
      };
      expect(GraphService.hasSeriesData(studentData)).toBeFalsy();
    });

    it('should return true when series has data', () => {
      const studentData = {
        series: [
          {
            data: [ [0, 10] ]
          }
        ]
      };
      expect(GraphService.hasSeriesData(studentData)).toBeTruthy();
    });
  });

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

  describe('componentStateHasStudentWork()', () => {
    it('should return false when the component state does not have student work', () => {
      const componentState = {
        studentData: {
          trials: [
            {
              series: [
                {
                  data: []
                }
              ]
            }
          ]
        }
      };
      const componentContent = {};
      expect(GraphService.componentStateHasStudentWork(componentState, componentContent)).toBeFalsy();
    });

    it('should return true when the component state has student work', () => {
      const componentState = {
        studentData: {
          trials: [
            {
              series: [
                {
                  data: [ [0, 10] ]
                }
              ]
            }
          ]
        }
      };
      const componentContent = {};
      expect(GraphService.componentStateHasStudentWork(componentState, componentContent)).toBeTruthy();
    });
  });

  describe('isStudentChangedAxisLimit()', () => {
    it('should return false when the student has not changed the axis limit', () => {
      const componentState = {
        studentData: {
          xAxis: { min: 0, max: 10 },
          yAxis: { min: 0, max: 10 }
        }
      };
      const componentContent = {
        xAxis: { min: 0, max: 10 },
        yAxis: { min: 0, max: 10 }
      };
      expect(GraphService.isStudentChangedAxisLimit(componentState, componentContent)).toBeFalsy();
    });

    it('should return true when the student has changed the axis limit', () => {
      const componentState = {
        studentData: {
          xAxis: { min: 0, max: 20 },
          yAxis: { min: 0, max: 20 }
        }
      };
      const componentContent = {
        xAxis: { min: 0, max: 10 },
        yAxis: { min: 0, max: 10 }
      };
      expect(GraphService.isStudentChangedAxisLimit(componentState, componentContent)).toBeTruthy();
    });
  });
});

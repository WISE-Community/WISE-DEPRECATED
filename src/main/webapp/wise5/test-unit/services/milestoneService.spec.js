import classroomMonitorModule from '../../classroomMonitor/classroomMonitor';
let MilestoneService, ProjectService;

describe('UtilService', () => {
  beforeEach(angular.mock.module(classroomMonitorModule.name));
  beforeEach(inject((_MilestoneService_, _ProjectService_) => {
    MilestoneService = _MilestoneService_;
    ProjectService = _ProjectService_;
  }));

  getProjectMilestones();
});

function getProjectMilestones() {
  describe('getProjectMilestones()', () => {
    it('should get project milestones when it is not enabled', () => {
      spyOn(ProjectService, 'getAchievements').and.returnValue({ isEnabled: false });
      const milestones = MilestoneService.getProjectMilestones();
      expect(milestones.length).toEqual(0);
    });
    it('should get project milestones when there are milestones', () => {
      const achievements = {
        isEnabled: true,
        items: [
          {
            type: 'milestone'
          },
          {
            type: 'milestoneReport'
          }
        ]
      };
      spyOn(ProjectService, 'getAchievements').and.returnValue(achievements);
      const milestones = MilestoneService.getProjectMilestones();
      expect(milestones.length).toEqual(2);
    });
  });
}

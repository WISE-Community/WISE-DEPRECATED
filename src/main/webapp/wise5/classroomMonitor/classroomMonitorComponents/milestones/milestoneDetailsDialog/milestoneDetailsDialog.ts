export class MilestoneDetailsDialog {
  title: string;

  static $inject = [
    '$state',
    '$mdDialog',
    '$event',
    'milestone',
    'hideStudentWork',
    'TeacherDataService'
  ];

  constructor(
    private $state,
    private $mdDialog,
    private $event,
    private milestone,
    private hideStudentWork,
    private TeacherDataService
  ) {}

  $onInit() {
    this.saveMilestoneOpenedEvent();
  }

  close() {
    this.saveMilestoneClosedEvent();
    this.$mdDialog.hide();
  }

  edit() {
    this.$mdDialog.hide({
      milestone: this.milestone,
      action: 'edit',
      $event: this.$event
    });
  }

  onShowWorkgroup(workgroup: any) {
    this.saveMilestoneClosedEvent();
    this.$mdDialog.hide();
    this.TeacherDataService.setCurrentWorkgroup(workgroup);
    this.$state.go('root.nodeProgress');
  }

  onVisitNodeGrading() {
    this.$mdDialog.hide();
  }

  saveMilestoneOpenedEvent() {
    this.saveMilestoneEvent('MilestoneOpened');
  }

  saveMilestoneClosedEvent() {
    this.saveMilestoneEvent('MilestoneClosed');
  }

  saveMilestoneEvent(event: any) {
    const context = 'ClassroomMonitor',
      nodeId = null,
      componentId = null,
      componentType = null,
      category = 'Navigation',
      data = { milestoneId: this.milestone.id },
      projectId = null;
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      event,
      data,
      projectId
    );
  }
}

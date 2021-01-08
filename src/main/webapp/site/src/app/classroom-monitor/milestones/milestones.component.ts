import { Component } from '@angular/core';
import { AchievementService } from '../../../../../wise5/services/achievementService';
import { AnnotationService } from '../../../../../wise5/services/annotationService';
import { MilestoneService } from '../../../../../wise5/services/milestoneService';
import { TeacherDataService } from '../../../../../wise5/services/teacherDataService';

@Component({
  selector: 'milestones',
  styleUrls: ['milestones.component.scss'],
  templateUrl: 'milestones.component.html'
})
export class MilestonesComponent {
  milestones: any[];
  annotationReceivedSubscription: any;
  currentPeriodChangedSubscription: any;
  newStudentAchievementSubscription: any;

  constructor(
    private AchievementService: AchievementService,
    private AnnotationService: AnnotationService,
    private MilestoneService: MilestoneService,
    private TeacherDataService: TeacherDataService
  ) {}

  ngOnInit() {
    this.loadProjectMilestones();
    this.newStudentAchievementSubscription = this.AchievementService.newStudentAchievement$.subscribe(
      (args: any) => {
        const studentAchievement = args.studentAchievement;
        this.AchievementService.addOrUpdateStudentAchievement(studentAchievement);
        this.updateMilestoneStatus(studentAchievement.achievementId);
      }
    );

    this.currentPeriodChangedSubscription = this.TeacherDataService.currentPeriodChanged$.subscribe(
      () => {
        for (const milestone of this.milestones) {
          this.updateMilestoneStatus(milestone.id);
        }
      }
    );

    this.annotationReceivedSubscription = this.AnnotationService.annotationReceived$.subscribe(
      ({ annotation }) => {
        for (const milestone of this.milestones) {
          if (
            milestone.nodeId === annotation.nodeId &&
            milestone.componentId === annotation.componentId
          ) {
            this.updateMilestoneStatus(milestone.id);
          }
        }
      }
    );
  }

  ngOnDestroy() {
    this.annotationReceivedSubscription.unsubscribe();
    this.currentPeriodChangedSubscription.unsubscribe();
    this.newStudentAchievementSubscription.unsubscribe();
  }

  loadProjectMilestones() {
    this.milestones = this.MilestoneService.getProjectMilestones();
    for (let milestone of this.milestones) {
      milestone = this.MilestoneService.getProjectMilestoneStatus(milestone.id);
    }
  }

  updateMilestoneStatus(milestoneId) {
    let milestone = this.getProjectMilestoneById(milestoneId);
    milestone = this.MilestoneService.getProjectMilestoneStatus(milestoneId);
  }

  getProjectMilestoneById(milestoneId: string): any {
    for (const milestone of this.milestones) {
      if (milestone.id === milestoneId) {
        return milestone;
      }
    }
    return {};
  }

  showMilestoneDetails(milestone, $event) {
    this.MilestoneService.showMilestoneDetails(milestone, $event);
  }
}

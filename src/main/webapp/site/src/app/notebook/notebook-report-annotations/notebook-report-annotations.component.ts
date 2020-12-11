import { Component, Input } from "@angular/core";
import { ConfigService } from "../../../../../wise5/services/configService";
import { VLEProjectService } from "../../../../../wise5/vle/vleProjectService";

@Component({
  selector: 'notebook-report-annotations',
  templateUrl: 'notebook-report-annotations.component.html'
})
export class NotebookReportAnnotationsComponent {

  @Input()
  annotations: any;

  @Input()
  hasNew: boolean;

  @Input()
  maxScore: string;

  nodeId: string;
  componentId: string;
  latestAnnotationTime: number;
  show: boolean;
  label: string = '';
  icon: string = 'person';
  isNew: boolean = false;
  showScore: boolean = true;
  showComment: boolean = true;
  maxScoreDisplay: string;

  constructor(
    private ConfigService: ConfigService,
    private ProjectService: VLEProjectService
  ) {

  }

  ngOnInit(): void {
    this.maxScoreDisplay = (parseInt(this.maxScore) > 0) ? '/' + this.maxScore : '';
  }

  /**
   * Get the most recent annotation (from the current score and comment annotations)
   * @return Object (latest annotation)
   */
  getLatestAnnotation(): any {
    let latestAnnotation = null;
    if (this.annotations.comment || this.annotations.score) {
      const commentSaveTime = this.annotations.comment ? this.annotations.comment.serverSaveTime : 0;
      const scoreSaveTime = this.annotations.score ? this.annotations.score.serverSaveTime : 0;
      if (commentSaveTime >= scoreSaveTime) {
        latestAnnotation = this.annotations.comment;
      } else if (scoreSaveTime > commentSaveTime) {
        latestAnnotation = this.annotations.score;
      }
    }
    return latestAnnotation;
  }

  /**
   * Calculate the save time of the latest annotation
   * @return Number (latest annotation post time)
   */
  getLatestAnnotationTime(): any {
    const latestAnnotation = this.getLatestAnnotation();
    if (latestAnnotation) {
      return this.ConfigService.convertToClientTimestamp(latestAnnotation.serverSaveTime);
    }
    return null;
  }

  /**
   * Set the label based on whether this is an automated or teacher annotation
   **/
  setLabelAndIcon(): void {
    const latestAnnotation = this.getLatestAnnotation();
    if (latestAnnotation) {
      if (latestAnnotation.type === 'autoComment' || latestAnnotation.type === 'autoScore') {
        this.label = $localize`Computer Feedback`;
        this.icon = 'keyboard';
      } else {
        this.label = $localize`Teacher Feedback`;
        this.icon = 'person';
      }
    }
  }

  processAnnotations(): void {
    if (this.annotations.comment || this.annotations.score) {
      this.nodeId = this.annotations.comment ?
          this.annotations.comment.nodeId : this.annotations.score.nodeId;
      this.componentId = this.annotations.comment ?
          this.annotations.comment.componentId : this.annotations.score.nodeId;

      if (!this.ProjectService.displayAnnotation(this.annotations.score)) {
        this.showScore = false;
      }

      if (!this.ProjectService.displayAnnotation(this.annotations.comment)) {
        this.showComment = false;
      }

      this.setLabelAndIcon();
      this.latestAnnotationTime = this.getLatestAnnotationTime();
      this.show = (this.showScore && this.annotations.score) || (this.showComment && this.annotations.comment);
    }
  }
}
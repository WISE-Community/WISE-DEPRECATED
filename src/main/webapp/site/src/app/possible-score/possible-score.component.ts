import { Component, Input } from '@angular/core';
import { ProjectService } from '../../../../wise5/services/projectService';

@Component({
  selector: 'possible-score',
  templateUrl: 'possible-score.component.html'
})
export class PossibleScoreComponent {
  @Input()
  maxScore: any;

  themeSettings: any;
  hidePossibleScores: any;

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.themeSettings = this.projectService.getThemeSettings();
    this.hidePossibleScores = this.themeSettings.hidePossibleScores;
  }
}

import { ConfigService } from '../../services/configService';
import { UtilService } from '../../services/utilService';
import { TeacherProjectService } from '../../services/teacherProjectService';
import { UpgradeModule } from '@angular/upgrade/static';
import { Component } from '@angular/core';

@Component({
  templateUrl: 'rubric-authoring.component.html'
})
export class RubricAuthoringComponent {
  rubric: string = '';

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private ProjectService: TeacherProjectService,
    private UtilService: UtilService
  ) {}

  ngOnInit(): void {
    this.rubric = this.ProjectService.replaceAssetPaths(this.ProjectService.getProjectRubric());
  }

  rubricChanged(): void {
    const html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.rubric)
    );
    this.ProjectService.setProjectRubric(html);
    this.ProjectService.saveProject();
  }

  goBack(): void {
    this.upgrade.$injector.get('$state').go('root.at.project');
  }
}

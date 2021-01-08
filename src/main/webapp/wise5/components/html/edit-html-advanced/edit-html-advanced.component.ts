import { Component } from '@angular/core';
import { EditAdvancedComponentComponent } from '../../../../site/src/app/authoring-tool/edit-advanced-component/edit-advanced-component.component';
import { TeacherProjectService } from '../../../services/teacherProjectService';

@Component({
  selector: 'edit-html-advanced',
  templateUrl: 'edit-html-advanced.component.html'
})
export class EditHTMLAdvancedComponent extends EditAdvancedComponentComponent {
  constructor(protected ProjectService: TeacherProjectService) {
    super(ProjectService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}

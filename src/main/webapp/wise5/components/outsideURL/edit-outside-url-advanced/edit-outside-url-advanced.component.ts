import { Component } from '@angular/core';
import { EditAdvancedComponentComponent } from '../../../../site/src/app/authoring-tool/edit-advanced-component/edit-advanced-component.component';
import { TeacherProjectService } from '../../../services/teacherProjectService';

@Component({
  selector: 'edit-outside-url-advanced',
  templateUrl: 'edit-outside-url-advanced.component.html'
})
export class EditOutsideUrlAdvancedComponent extends EditAdvancedComponentComponent {
  constructor(protected ProjectService: TeacherProjectService) {
    super(ProjectService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}

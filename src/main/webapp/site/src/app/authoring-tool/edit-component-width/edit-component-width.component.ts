import { Component, Input } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TeacherProjectService } from '../../../../../wise5/services/teacherProjectService';

@Component({
  selector: 'edit-component-width',
  templateUrl: 'edit-component-width.component.html'
})
export class EditComponentWidthComponent {
  @Input()
  authoringComponentContent: any;
  widthChanged: Subject<string> = new Subject<string>();
  widthChangedSubscription: Subscription;

  constructor(private ProjectService: TeacherProjectService) {}

  ngOnInit() {
    this.widthChangedSubscription = this.widthChanged
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.ProjectService.componentChanged();
      });
  }

  ngOnDestroy() {
    this.widthChangedSubscription.unsubscribe();
  }
}

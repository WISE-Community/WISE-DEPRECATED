import { Component, Input } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TeacherProjectService } from '../../../../../wise5/services/teacherProjectService';

@Component({
  selector: 'edit-component-max-score',
  templateUrl: 'edit-component-max-score.component.html'
})
export class EditComponentMaxScoreComponent {
  @Input()
  authoringComponentContent: any;
  maxScoreChanged: Subject<string> = new Subject<string>();
  maxScoreChangedSubscription: Subscription;

  constructor(private ProjectService: TeacherProjectService) {}

  ngOnInit() {
    this.maxScoreChangedSubscription = this.maxScoreChanged
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.ProjectService.componentChanged();
      });
  }

  ngOnDestroy() {
    this.maxScoreChangedSubscription.unsubscribe();
  }
}

import { Component, Input } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TeacherProjectService } from '../../../../../wise5/services/teacherProjectService';

@Component({
  selector: 'edit-component-tags',
  templateUrl: 'edit-component-tags.component.html',
  styleUrls: ['edit-component-tags.component.scss']
})
export class EditComponentTagsComponent {
  @Input()
  authoringComponentContent: any;
  tagChanged: Subject<any> = new Subject<any>();
  tagChangedSubscription: Subscription;

  constructor(private ProjectService: TeacherProjectService, private upgrade: UpgradeModule) {}

  ngOnInit(): void {
    this.tagChangedSubscription = this.tagChanged
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(({ tagIndex, tag }) => {
        this.authoringComponentContent.tags[tagIndex] = tag;
        this.ProjectService.componentChanged();
      });
  }

  ngOnDestroy(): void {
    this.tagChangedSubscription.unsubscribe();
  }

  addTag(): void {
    if (this.authoringComponentContent.tags == null) {
      this.authoringComponentContent.tags = [];
    }
    this.authoringComponentContent.tags.push('');
    this.ProjectService.componentChanged();
  }

  moveTagUp(index: number): void {
    if (index > 0) {
      const tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      this.ProjectService.componentChanged();
    }
  }

  moveTagDown(index: number): void {
    if (index < this.authoringComponentContent.tags.length - 1) {
      const tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      this.ProjectService.componentChanged();
    }
  }

  deleteTag(indexOfTagToDelete: number): void {
    if (
      confirm(
        this.upgrade.$injector.get('$filter')('translate')('areYouSureYouWantToDeleteThisTag')
      )
    ) {
      this.authoringComponentContent.tags.splice(indexOfTagToDelete, 1);
      this.ProjectService.componentChanged();
    }
  }
}

import * as angular from 'angular';
import { Component, Input } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { NotificationService } from '../../../../../wise5/services/notificationService';
import { TeacherProjectService } from '../../../../../wise5/services/teacherProjectService';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'edit-component-json',
  templateUrl: 'edit-component-json.component.html',
  styleUrls: ['edit-component-json.component.scss']
})
export class EditComponentJsonComponent {
  validComponentContentJSONString: string;
  componentContentJSONString: string;
  @Input()
  componentId: string;
  nodeChangedSubscription: Subscription;
  @Input()
  nodeId: string;
  showJSONAuthoring: boolean = false;
  jsonChanged: Subject<string> = new Subject<string>();
  jsonChangedSubscription: Subscription;

  constructor(
    private upgrade: UpgradeModule,
    private NotificationService: NotificationService,
    private ProjectService: TeacherProjectService
  ) {}

  ngOnInit() {
    this.setComponentContentJsonString();
    this.jsonChangedSubscription = this.jsonChanged
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        if (this.isJSONValid()) {
          this.rememberRecentValidJSON();
          this.NotificationService.showJSONValidMessage();
        } else {
          this.NotificationService.showJSONInvalidMessage();
        }
      });
    this.nodeChangedSubscription = this.ProjectService.nodeChanged$.subscribe(() => {
      this.setComponentContentJsonString();
    });
  }

  ngOnDestory() {
    this.jsonChangedSubscription.unsubscribe();
    this.nodeChangedSubscription.unsubscribe();
  }

  setComponentContentJsonString() {
    const authoringComponentContent = this.ProjectService.getComponentByNodeIdAndComponentId(
      this.nodeId,
      this.componentId
    );
    this.componentContentJSONString = angular.toJson(authoringComponentContent, 4);
  }

  toggleJSONView(): void {
    if (this.showJSONAuthoring) {
      if (this.isJSONValid()) {
        this.saveChanges();
        this.showJSONAuthoring = false;
      } else {
        const doRollback = confirm(
          this.upgrade.$injector.get('$filter')('translate')('jsonInvalidErrorMessage')
        );
        if (doRollback) {
          this.rollbackToRecentValidJSON();
          this.saveChanges();
        }
      }
    } else {
      this.showJSONAuthoring = true;
      this.rememberRecentValidJSON();
    }
  }

  isJSONValid(): boolean {
    try {
      angular.fromJson(this.componentContentJSONString);
      return true;
    } catch (e) {
      return false;
    }
  }

  saveChanges(): void {
    try {
      const editedComponentContent = angular.fromJson(this.componentContentJSONString);
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);
      this.ProjectService.componentChanged();
    } catch (e) {
      this.NotificationService.showJSONInvalidMessage();
    }
  }

  rememberRecentValidJSON(): void {
    this.validComponentContentJSONString = this.componentContentJSONString;
  }

  rollbackToRecentValidJSON(): void {
    this.componentContentJSONString = this.validComponentContentJSONString;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { TeacherProjectService } from '../../../../../wise5/services/teacherProjectService';
import { UtilService } from '../../../../../wise5/services/utilService';

@Component({
  selector: 'component-select',
  styleUrls: ['component-select.component.scss'],
  templateUrl: 'component-select.component.html'
})
export class ComponentSelectComponent {
  components: any[];

  @Output()
  modelChange: EventEmitter<any> = new EventEmitter<any>();

  @Input()
  nodeId: string;

  selectedComponents: any[];

  constructor(
    private upgrade: UpgradeModule,
    private ProjectService: TeacherProjectService,
    private UtilService: UtilService
  ) {}

  ngOnInit() {
    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId).filter((component) => {
      return this.ProjectService.componentHasWork(component);
    });
    this.selectedComponents = this.components.map((component) => {
      return component.id;
    });
  }

  getComponentTypeLabel(componentType) {
    return this.UtilService.getComponentTypeLabel(componentType);
  }

  getSelectedText() {
    let nComponents = this.components.length;
    return this.upgrade.$injector.get('$filter')('translate')('selectedComponentsLabel', {
      selected: this.selectedComponents.length,
      total: nComponents
    });
  }

  selectedComponentsChange() {
    const hiddenComponents = [];
    for (const component of this.components) {
      const id = component.id;
      if (this.selectedComponents.indexOf(id) < 0) {
        hiddenComponents.push(id);
      }
    }
    this.modelChange.emit(hiddenComponents);
  }
}

import { UtilService } from '../../../../../../wise5/services/utilService';
import { ConfigService } from '../../../../../../wise5/services/configService';
import { TeacherDataService } from '../../../../../../wise5/services/teacherDataService';
import { Component } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';

@Component({
  selector: 'choose-new-component',
  styleUrls: ['./choose-new-component.component.scss'],
  templateUrl: 'choose-new-component.component.html'
})
export class ChooseNewComponent {
  componentTypes: any;
  selectedComponentType: string;

  constructor(
    private upgrade: UpgradeModule,
    private ConfigService: ConfigService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {}

  ngOnInit() {
    this.componentTypes = [
      {
        type: 'Animation',
        name: this.UtilService.getComponentTypeLabel('Animation')
      },
      {
        type: 'AudioOscillator',
        name: this.UtilService.getComponentTypeLabel('AudioOscillator')
      },
      {
        type: 'ConceptMap',
        name: this.UtilService.getComponentTypeLabel('ConceptMap')
      },
      {
        type: 'Discussion',
        name: this.UtilService.getComponentTypeLabel('Discussion')
      },
      { type: 'Draw', name: this.UtilService.getComponentTypeLabel('Draw') },
      {
        type: 'Embedded',
        name: this.UtilService.getComponentTypeLabel('Embedded')
      },
      { type: 'Graph', name: this.UtilService.getComponentTypeLabel('Graph') },
      { type: 'HTML', name: this.UtilService.getComponentTypeLabel('HTML') },
      { type: 'Label', name: this.UtilService.getComponentTypeLabel('Label') },
      { type: 'Match', name: this.UtilService.getComponentTypeLabel('Match') },
      {
        type: 'MultipleChoice',
        name: this.UtilService.getComponentTypeLabel('MultipleChoice')
      },
      {
        type: 'OpenResponse',
        name: this.UtilService.getComponentTypeLabel('OpenResponse')
      },
      {
        type: 'OutsideURL',
        name: this.UtilService.getComponentTypeLabel('OutsideURL')
      },
      {
        type: 'Summary',
        name: this.UtilService.getComponentTypeLabel('Summary')
      },
      { type: 'Table', name: this.UtilService.getComponentTypeLabel('Table') }
    ];
    this.selectedComponentType = this.upgrade.$injector.get('$stateParams').componentType;
  }

  setComponentType(componentType) {
    this.selectedComponentType = componentType;
  }

  chooseLocation() {
    this.upgrade.$injector
      .get('$state')
      .go('root.at.project.node.add-component.choose-location', {
        componentType: this.selectedComponentType
      });
  }

  cancel() {
    this.upgrade.$injector
      .get('$state')
      .go('root.at.project.node', {
        projectId: this.ConfigService.getProjectId(),
        nodeId: this.TeacherDataService.getCurrentNodeId()
      });
  }
}

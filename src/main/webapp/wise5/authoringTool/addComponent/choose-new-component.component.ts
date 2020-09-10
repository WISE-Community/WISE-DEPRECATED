import { UtilService } from "../../services/utilService";
import { ConfigService } from "../../services/configService";
import { TeacherDataService } from "../../services/teacherDataService";


class ChooseNewComponentController {

  componentTypes: any;
  componentType: string;

  static $inject = ['$state', '$stateParams', 'ConfigService', 'TeacherDataService', 'UtilService'];

  constructor(private $state: any, private $stateParams: any, private ConfigService: ConfigService,
      private TeacherDataService: TeacherDataService, private UtilService: UtilService) {
  }

  $onInit() {
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
    this.componentType = this.$stateParams.componentType;
  }

  setComponentType(componentType) {
    this.componentType = componentType;
  }

  chooseLocation() {
    this.$state.go('root.at.project.node.add-component.choose-location',
        { componentType: this.componentType });
  }

  cancel() {
    this.$state.go('root.at.project.node', { projectId: this.ConfigService.getProjectId(),
        nodeId: this.TeacherDataService.getCurrentNodeId() });
  }
}

export const ChooseNewComponent = {
  templateUrl: `/wise5/authoringTool/addComponent/choose-new-component.component.html`,
  controller: ChooseNewComponentController
}

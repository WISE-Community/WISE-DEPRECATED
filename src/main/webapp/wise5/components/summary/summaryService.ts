import { ComponentService } from '../componentService';

class SummaryService extends ComponentService {
  $translate: any;
  componentsWithScoresSummary: string[];
  componentsWithResponsesSummary: string[];

  static $inject = ['$filter', 'ConfigService', 'UtilService'];

  constructor($filter, ConfigService, UtilService) {
    super(ConfigService, UtilService);
    this.$translate = $filter('translate');
    this.componentsWithScoresSummary = [
      'Animation',
      'AudioOscillator',
      'ConceptMap',
      'Discussion',
      'Draw',
      'Embedded',
      'Graph',
      'Label',
      'Match',
      'MultipleChoice',
      'OpenResponse',
      'Table'
    ];
    this.componentsWithResponsesSummary = ['MultipleChoice', 'Table'];
  }

  getComponentTypeLabel() {
    return this.$translate('summary.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Summary';
    component.summaryNodeId = null;
    component.summaryComponentId = null;
    component.source = 'period';
    component.studentDataType = null;
    component.chartType = 'column';
    component.requirementToSeeSummary = 'submitWork';
    component.highlightCorrectAnswer = false;
    component.customLabelColors = [];
    return component;
  }

  componentHasWork(component) {
    return false;
  }

  isComponentTypeAllowed(componentType) {
    return ['HTML', 'OutsideURL', 'Summary'].indexOf(componentType) === -1;
  }

  isScoresSummaryAvailableForComponentType(componentType) {
    return this.componentsWithScoresSummary.indexOf(componentType) != -1;
  }

  isResponsesSummaryAvailableForComponentType(componentType) {
    return this.componentsWithResponsesSummary.indexOf(componentType) != -1;
  }
}

export default SummaryService;

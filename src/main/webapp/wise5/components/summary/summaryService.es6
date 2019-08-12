import ComponentService from '../componentService';

class SummaryService extends ComponentService {
  constructor($filter, ConfigService, UtilService) {
    super($filter, ConfigService, UtilService);
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
    this.componentsWithResponsesSummary = ['MultipleChoice'];
  }

  getComponentTypeLabel() {
    return this.$translate('summary.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Summary';
    component.summaryNodeId = null;
    component.summaryComponentId = null;
    component.summarySource = 'period';
    component.summaryStudentDataType = null;
    component.chartType = 'column';
    return component;
  }

  componentHasWork(component) {
    return false;
  }

  isComponentTypeAllowed(componentType) {
    return componentType !== 'HTML' && componentType !== 'OutsideURL';
  }

  isScoresSummaryAvailableForComponentType(componentType) {
    return this.componentsWithScoresSummary.indexOf(componentType) != -1;
  }

  isResponsesSummaryAvailableForComponentType(componentType) {
    return this.componentsWithResponsesSummary.indexOf(componentType) != -1;
  }
}

SummaryService.$inject = [
  '$filter',
  'ConfigService',
  'UtilService'
];

export default SummaryService;

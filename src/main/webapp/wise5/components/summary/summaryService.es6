import ComponentService from '../componentService';

class SummaryService extends ComponentService {
  constructor($filter,
      ConfigService,
      UtilService) {
    super($filter,
        ConfigService,
        UtilService);
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
    return component;
  }

  componentHasWork(component) {
    return false;
  }
}

SummaryService.$inject = [
  '$filter',
  'ConfigService',
  'UtilService'
];

export default SummaryService;

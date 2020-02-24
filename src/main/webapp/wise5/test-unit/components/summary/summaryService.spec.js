import vleModule from '../../../vle/vle';

describe('SummaryService', () => {
  beforeEach(angular.mock.module(vleModule.name));

  let SummaryService;
  beforeEach(inject((_SummaryService_) => {
    SummaryService = _SummaryService_;
  }));

  describe('SummaryService', () => {

    it('should create a component', () => {
      const component = SummaryService.createComponent();
      expect(component.type).toEqual('Summary');
      expect(component.summaryNodeId).toEqual(null);
      expect(component.summaryComponentId).toEqual(null);
      expect(component.source).toEqual('period');
      expect(component.studentDataType).toEqual(null);
      expect(component.chartType).toEqual('column');
      expect(component.requirementToSeeSummary).toEqual('submitWork');
      expect(component.highlightCorrectAnswer).toBeFalsy();
    });

    it('should check if the a summary component has work', () => {
      const component = {
        id: '2t09q248tg',
        type: 'Summary'
      }
      expect(SummaryService.componentHasWork(component)).toBeFalsy();
    });

    it('should check if a component type is allowed', () => {
      expect(SummaryService.isComponentTypeAllowed('Animation')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('AudioOscillator')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('ConceptMap')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('Discussion')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('Draw')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('Embedded')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('Graph')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('HTML')).toBeFalsy();
      expect(SummaryService.isComponentTypeAllowed('Label')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('Match')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('MultipleChoice')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('OpenResponse')).toBeTruthy();
      expect(SummaryService.isComponentTypeAllowed('OutsideURL')).toBeFalsy();
      expect(SummaryService.isComponentTypeAllowed('Summary')).toBeFalsy();
      expect(SummaryService.isComponentTypeAllowed('Table')).toBeTruthy();
    });

    it('should check if a scores summary is allowed for a component type', () => {
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Animation')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('AudioOscillator'))
          .toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('ConceptMap')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Discussion')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Draw')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Embedded')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Graph')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('HTML')).toBeFalsy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Label')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Match')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('MultipleChoice'))
          .toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('OpenResponse')).toBeTruthy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('OutsideURL')).toBeFalsy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Summary')).toBeFalsy();
      expect(SummaryService.isScoresSummaryAvailableForComponentType('Table')).toBeTruthy();
    });

    it('should check if a responses summary is allowed for a component type', () => {
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Animation')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('AudioOscillator'))
          .toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('ConceptMap')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Discussion')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Draw')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Embedded')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Graph')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('HTML')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Label')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Match')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('MultipleChoice'))
          .toBeTruthy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('OpenResponse'))
          .toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('OutsideURL')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Summary')).toBeFalsy();
      expect(SummaryService.isResponsesSummaryAvailableForComponentType('Table')).toBeFalsy();
    });

  });
});

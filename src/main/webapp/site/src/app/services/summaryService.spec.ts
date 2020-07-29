import { TestBed } from "@angular/core/testing";
import { SummaryService } from "../../../../wise5/components/summary/summaryService";
import { UpgradeModule } from "@angular/upgrade/static";
import { StudentDataService } from "../../../../wise5/services/studentDataService";
import { UtilService } from "../../../../wise5/services/utilService";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import ConfigService from "../../../../wise5/services/configService";
import { AnnotationService } from "../../../../wise5/services/annotationService";
import { ProjectService } from "../../../../wise5/services/projectService";
import { TagService } from "../../../../wise5/services/tagService";

let service;

describe('SummaryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, UpgradeModule ],
      providers: [
        AnnotationService,
        ConfigService,
        ProjectService,
        StudentDataService,
        SummaryService,
        TagService,
        UtilService
      ]
    });
    service = TestBed.get(SummaryService);
  });
  createComponent();
  isComponentTypeAllowed();
  isScoresSummaryAvailableForComponentType();
  isResponsesSummaryAvailableForComponentType();
});

function createComponent() {
  it('should create a Summary component', () => {
    const component = service.createComponent();
    expect(component.type).toEqual('Summary');
    expect(component.source).toEqual('period');
    expect(component.chartType).toEqual('column');
    expect(component.requirementToSeeSummary).toEqual('submitWork');
    expect(component.highlightCorrectAnswer).toEqual(false);
    expect(component.customLabelColors).toEqual([]);
  });
}

function isComponentTypeAllowed() {
  function expectAllowed(componentType, expectedResult) {
    expect(service.isComponentTypeAllowed(componentType)).toEqual(expectedResult);
  }
  it('should check if component types are allowed to be used in the summary', () => {
    expectAllowed('Animation', true);
    expectAllowed('AudioOscillator', true);
    expectAllowed('ConceptMap', true);
    expectAllowed('Discussion', true);
    expectAllowed('Draw', true);
    expectAllowed('Embedded', true);
    expectAllowed('Graph', true);
    expectAllowed('HTML', false);
    expectAllowed('Label', true);
    expectAllowed('Match', true);
    expectAllowed('MultipleChoice', true);
    expectAllowed('OpenResponse', true);
    expectAllowed('OutsideURL', false);
    expectAllowed('Summary', false);
    expectAllowed('Table', true);
  });
}

function isScoresSummaryAvailableForComponentType() {
  function expectIsScoresSummaryAvailable(componentType, expectedResult) {
    expect(service.isScoresSummaryAvailableForComponentType(componentType)).toEqual(expectedResult);
  }
  it('should check if component types can be used with score summary', () => {
    expectIsScoresSummaryAvailable('Animation', true);
    expectIsScoresSummaryAvailable('AudioOscillator', true);
    expectIsScoresSummaryAvailable('ConceptMap', true);
    expectIsScoresSummaryAvailable('Discussion', true);
    expectIsScoresSummaryAvailable('Draw', true);
    expectIsScoresSummaryAvailable('Embedded', true);
    expectIsScoresSummaryAvailable('Graph', true);
    expectIsScoresSummaryAvailable('HTML', false);
    expectIsScoresSummaryAvailable('Label', true);
    expectIsScoresSummaryAvailable('Match', true);
    expectIsScoresSummaryAvailable('MultipleChoice', true);
    expectIsScoresSummaryAvailable('OpenResponse', true);
    expectIsScoresSummaryAvailable('OutsideURL', false);
    expectIsScoresSummaryAvailable('Summary', false);
    expectIsScoresSummaryAvailable('Table', true);
  });
}

function isResponsesSummaryAvailableForComponentType() {
  function expectIsResponsesSummaryAvailable(componentType, expectedResult) {
    expect(service.isResponsesSummaryAvailableForComponentType(componentType))
        .toEqual(expectedResult);
  }
  it('should check if component types can be used with response summary', () => {
    expectIsResponsesSummaryAvailable('Animation', false);
    expectIsResponsesSummaryAvailable('AudioOscillator', false);
    expectIsResponsesSummaryAvailable('ConceptMap', false);
    expectIsResponsesSummaryAvailable('Discussion', false);
    expectIsResponsesSummaryAvailable('Draw', false);
    expectIsResponsesSummaryAvailable('Embedded', false);
    expectIsResponsesSummaryAvailable('Graph', false);
    expectIsResponsesSummaryAvailable('HTML', false);
    expectIsResponsesSummaryAvailable('Label', false);
    expectIsResponsesSummaryAvailable('Match', false);
    expectIsResponsesSummaryAvailable('MultipleChoice', true);
    expectIsResponsesSummaryAvailable('OpenResponse', false);
    expectIsResponsesSummaryAvailable('OutsideURL', false);
    expectIsResponsesSummaryAvailable('Summary', false);
    expectIsResponsesSummaryAvailable('Table', true);
  });
}
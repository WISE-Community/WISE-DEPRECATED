import { TestBed } from '@angular/core/testing';
import { SummaryService } from '../../../../wise5/components/summary/summaryService';
import { UpgradeModule } from '@angular/upgrade/static';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { UtilService } from '../../../../wise5/services/utilService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '../../../../wise5/services/configService';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { TagService } from '../../../../wise5/services/tagService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service;
const summaryAllowedComponentTypes = [
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
const summaryDisallowedComponentTypes = ['HTML', 'OutsideURL', 'Summary'];
const scoreSummaryAllowedComponentTypes = summaryAllowedComponentTypes;
const scoreSummaryDisallowedComponentTypes = summaryDisallowedComponentTypes;

describe('SummaryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        ProjectService,
        SessionService,
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

function expectFunctionCall(funcName, componentTypes, expectedResult) {
  componentTypes.forEach((componentType) => {
    expect(service[funcName](componentType)).toEqual(expectedResult);
  });
}

function isComponentTypeAllowed() {
  it('should check if component types are allowed to be used in the summary', () => {
    expectFunctionCall('isComponentTypeAllowed', summaryAllowedComponentTypes, true);
    expectFunctionCall('isComponentTypeAllowed', summaryDisallowedComponentTypes, false);
  });
}

function isScoresSummaryAvailableForComponentType() {
  it('should check if score summary is available', () => {
    expectFunctionCall(
      'isScoresSummaryAvailableForComponentType',
      scoreSummaryAllowedComponentTypes,
      true
    );
    expectFunctionCall(
      'isScoresSummaryAvailableForComponentType',
      scoreSummaryDisallowedComponentTypes,
      false
    );
  });
}

function isResponsesSummaryAvailableForComponentType() {
  it('should check if component types can be used with response summary', () => {
    expectFunctionCall(
      'isResponsesSummaryAvailableForComponentType',
      ['MultipleChoice', 'Table'],
      true
    );
    expectFunctionCall(
      'isResponsesSummaryAvailableForComponentType',
      [
        'Animation',
        'AudioOscillator',
        'ConceptMap',
        'Discussion',
        'Draw',
        'Embedded',
        'Graph',
        'HTML',
        'Label',
        'Match',
        'OpenResponse',
        'OutsideURL',
        'Summary'
      ],
      false
    );
  });
}

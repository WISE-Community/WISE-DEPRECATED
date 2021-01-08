import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { TagService } from '../../../../wise5/services/tagService';
import { UtilService } from '../../../../wise5/services/utilService';
import { ConceptMapService } from '../../../../wise5/components/conceptMap/conceptMapService';
import { ConfigService } from '../../../../wise5/services/configService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: ConceptMapService;
let conceptMapNode1: any;
let conceptMapNode2: any;
const node1OriginalId = 'node1';
const node1InstanceId = 'studentNode1';
const node1Label = 'Node 1';
const node1X = 100;
const node1Y = 100;
const node2OriginalId = 'node2';
const node2InstanceId = 'studentNode2';
const node2Label = 'Node 2';
const node2X = 200;
const node2Y = 200;
let conceptMapLink1: any;
let conceptMapLink2: any;
const link1OriginalId = 'link1';
const link1InstanceId = 'studentLink1';
const link1Label = 'Link 1';
const link1SourceNodeOriginalId = 'node1';
const link1SourceNodeInstanceId = 'studentNode1';
const link1DestinationNodeOriginalId = 'node2';
const link1DestinationNodeInstanceId = 'studentNode2';
const link2OriginalId = 'link2';
const link2InstanceId = 'studentLink2';
const link2Label = 'Link 2';
const link2SourceNodeOriginalId = 'node1';
const link2SourceNodeInstanceId = 'studentNode1';
const link2DestinationNodeOriginalId = 'node2';
const link2DestinationNodeInstanceId = 'studentNode2';

describe('ConceptMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConceptMapService,
        ConfigService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
    service = TestBed.get(ConceptMapService);
    conceptMapNode1 = createConceptMapNode(
      node1OriginalId,
      node1InstanceId,
      node1Label,
      node1X,
      node1Y
    );
    conceptMapNode2 = createConceptMapNode(
      node2OriginalId,
      node2InstanceId,
      node2Label,
      node2X,
      node2Y
    );
    conceptMapLink1 = createConceptMapLink(
      link1OriginalId,
      link1InstanceId,
      link1Label,
      link1SourceNodeOriginalId,
      link1SourceNodeInstanceId,
      link1DestinationNodeOriginalId,
      link1DestinationNodeInstanceId
    );
    conceptMapLink2 = createConceptMapLink(
      link2OriginalId,
      link2InstanceId,
      link2Label,
      link2SourceNodeOriginalId,
      link2SourceNodeInstanceId,
      link2DestinationNodeOriginalId,
      link2DestinationNodeInstanceId
    );
  });
  createComponent();
  isCompleted();
  newConceptMapNode();
  newConceptMapLink();
  getSlope();
  calculateDistance();
  evaluateRuleByRuleName();
  evaluateRule();
  getRuleByRuleName();
  getRulesByCategoryName();
  getNodesByLabel();
  getLinksByLabels();
  any();
  all();
  populateConceptMapData();
  moveLinkTextToFront();
  moveNodesToFront();
  refreshLinkLabels();
  getNodeById();
  createImage();
  getHrefToBase64ImageReplacements();
  getImagesInSVG();
  getBase64Image();
  componentStateHasStudentWork();
  isStudentConceptMapDifferentThanStarterConceptMap();
  generateImageFromRenderedComponentState();
  getNextAvailableId();
  displayAnnotation();
});

function createComponentState(nodes: any[] = [], links: any[] = [], isSubmit: boolean = false) {
  return {
    studentData: {
      conceptMapData: createConceptMapData(nodes, links)
    },
    isSubmit: isSubmit
  };
}

function createAnnotation(type: string, displayToStudent: boolean) {
  return {
    type: type,
    displayToStudent: displayToStudent
  };
}

function createComponentContent(
  nodes: any[] = [],
  links: any[] = [],
  starterConceptMap: any = null
) {
  return {
    nodes: nodes,
    links: links,
    starterConceptMap: starterConceptMap
  };
}

function createConceptMapData(nodes: any[] = [], links: any[] = []) {
  return {
    nodes: nodes,
    links: links
  };
}

function createConceptMapNode(
  originalId: string,
  instanceId: string,
  label: string,
  x: number,
  y: number
) {
  return {
    originalId: originalId,
    instanceId: instanceId,
    label: label,
    x: x,
    y: y
  };
}

function createConceptMapLink(
  originalId: string,
  instanceId: string,
  label: string,
  sourceNodeOriginalId: string,
  sourceNodeInstanceId: string,
  destinationNodeOriginalId: string,
  destinationNodeInstanceId: string
) {
  return {
    originalId: originalId,
    instanceId: instanceId,
    label: label,
    sourceNodeOriginalId: sourceNodeOriginalId,
    sourceNodeInstanceId: sourceNodeInstanceId,
    destinationNodeOriginalId: destinationNodeOriginalId,
    destinationNodeInstanceId: destinationNodeInstanceId
  };
}

function createRule(name: string, categories: any[] = []) {
  return {
    name: name,
    categories: categories
  };
}

function createComponent() {
  it('should create a concept map component', () => {
    const component = service.createComponent();
    expect(component.type).toEqual('ConceptMap');
    expect(component.width).toEqual(800);
    expect(component.height).toEqual(600);
    expect(component.background).toEqual(null);
    expect(component.stretchBackground).toEqual(null);
    expect(component.nodes).toEqual([]);
    expect(component.linksTitle).toEqual('');
    expect(component.links).toEqual([]);
    expect(component.rules).toEqual([]);
    expect(component.starterConceptMap).toEqual(null);
    expect(component.customRuleEvaluator).toEqual('');
    expect(component.showAutoScore).toEqual(false);
    expect(component.showAutoFeedback).toEqual(false);
    expect(component.showNodeLabels).toEqual(true);
  });
}

function isCompleted() {
  let componentStates: any;
  let node: any;
  let component: any;
  beforeEach(() => {
    componentStates = [];
    node = {};
    component = {};
  });
  function expectIsCompleted(
    component: any,
    componentStates: any[],
    node: any,
    expectedResult: boolean
  ) {
    expect(service.isCompleted(component, componentStates, null, null, node)).toEqual(
      expectedResult
    );
  }
  it(`should check if is completed when submit is required and there are no submit component
      states`, () => {
    node.showSubmitButton = true;
    componentStates.push(createComponentState());
    expectIsCompleted(component, componentStates, node, false);
  });
  it(`should check if is completed when submit is required and there are is a submit component
      state`, () => {
    node.showSubmitButton = true;
    componentStates.push(createComponentState([], [], true));
    expectIsCompleted(component, componentStates, node, true);
  });
  it(`should check if is completed when submit is not required and there are no component states`, () => {
    expectIsCompleted(component, componentStates, node, false);
  });
  it(`should check if is completed when submit is not required and there are component states`, () => {
    componentStates.push(createComponentState());
    expectIsCompleted(component, componentStates, node, true);
  });
}

function newConceptMapNode() {
  // TODO
}

function newConceptMapLink() {
  // TODO
}

function getSlope() {
  it('should calculate the slope of the line when the x values are equal', () => {
    expect(service.getSlope(1, 10, 1, 20)).toEqual(null);
  });
  it('should calcualte the slope of the line', () => {
    expect(service.getSlope(10, 10, 20, 20)).toEqual(1);
  });
}

function calculateDistance() {
  it('should calculate the distance between two points', () => {
    expect(service.calculateDistance(0, 0, 3, 4)).toEqual(5);
  });
}

function evaluateRuleByRuleName() {
  // TODO
}

function evaluateRule() {
  // TODO
}

function getRuleByRuleName() {
  it('should get rule by rule name', () => {
    const componentContent: any = createComponentContent();
    const rule1 = createRule('Contains Earth');
    const rule2 = createRule('Contains Sun');
    const rule3 = createRule('Contains Space');
    componentContent.rules = [rule1, rule2, rule3];
    const rule = service.getRuleByRuleName(componentContent, 'Contains Sun');
    expect(rule).toEqual(rule2);
  });
}

function getRulesByCategoryName() {
  it('should get rules by category name', () => {
    const componentContent: any = createComponentContent();
    const rule1 = createRule('Contains Earth', ['node']);
    const rule2 = createRule('Contains Sun', ['node']);
    const rule3 = createRule('Contains Sun to Earth Link', ['link']);
    componentContent.rules = [rule1, rule2, rule3];
    const rules = service.getRulesByCategoryName(componentContent, 'node');
    expect(rules.length).toEqual(2);
    expect(rules[0]).toEqual(rule1);
    expect(rules[1]).toEqual(rule2);
  });
}

function getNodesByLabel() {
  let conceptMapData: any;
  beforeEach(() => {
    conceptMapData = createConceptMapData([conceptMapNode1, conceptMapNode2], []);
  });
  it('should get nodes by label', () => {
    const nodesByLabel = service.getNodesByLabel(conceptMapData, node1Label);
    expect(nodesByLabel.length).toEqual(1);
    expect(nodesByLabel[0]).toEqual(conceptMapNode1);
  });
  it('should get nodes by any label', () => {
    const nodesByLabel = service.getNodesByLabel(conceptMapData, 'any');
    expect(nodesByLabel.length).toEqual(2);
    expect(nodesByLabel[0]).toEqual(conceptMapNode1);
    expect(nodesByLabel[1]).toEqual(conceptMapNode2);
  });
}

function getLinksByLabels() {
  let conceptMapData: any;
  let link1: any;
  let link2: any;
  let link3: any;
  beforeEach(() => {
    link1 = createLink('Squidward', 'Works At', 'Krusty Krabb');
    link2 = createLink('Spongebob', 'Works At', 'Krusty Krabb');
    link3 = createLink('Plankton', 'Works At', 'Chum Bucket');
    conceptMapData = createConceptMapData([], [link1, link2, link3]);
  });
  function createLink(sourceNodeLabel: string, label: string, destinationNodeLabel: string) {
    return {
      sourceNodeLabel: sourceNodeLabel,
      label: label,
      destinationNodeLabel: destinationNodeLabel
    };
  }
  it('should get links by labels', () => {
    const links = service.getLinksByLabels(conceptMapData, 'Spongebob', 'Works At', 'Krusty Krabb');
    expect(links.length).toEqual(1);
    expect(links[0]).toEqual(link2);
  });
  it('should get links by labels with any link label', () => {
    const links = service.getLinksByLabels(conceptMapData, 'Spongebob', 'any', 'Krusty Krabb');
    expect(links.length).toEqual(1);
    expect(links[0]).toEqual(link2);
  });
  it('should get links by labels with any source node label', () => {
    const links = service.getLinksByLabels(conceptMapData, 'any', 'Works At', 'Krusty Krabb');
    expect(links.length).toEqual(2);
    expect(links[0]).toEqual(link1);
    expect(links[1]).toEqual(link2);
  });
  it('should get links by labels with any destination node label', () => {
    const links = service.getLinksByLabels(conceptMapData, 'Plankton', 'Works At', 'any');
    expect(links.length).toEqual(1);
    expect(links[0]).toEqual(link3);
  });
}

function spyOnEvaluateRuleByRuleName(ruleToResult: any) {
  spyOn(service, 'evaluateRuleByRuleName').and.callFake(
    (componentContent: any, conceptMapData: any, ruleName: string) => {
      return ruleToResult[ruleName];
    }
  );
}

function any() {
  function expectAny(
    componentContent: any,
    conceptMapData: any,
    ruleNames: string[],
    expectedResult: boolean
  ) {
    expect(service.any(componentContent, conceptMapData, ruleNames)).toEqual(expectedResult);
  }
  it('should check if any rule is satisfied when none are satisified', () => {
    spyOnEvaluateRuleByRuleName({ rule1: false, rule2: false });
    expectAny({}, {}, ['rule1', 'rule2'], false);
  });
  it('should check if any rule is satisfied when one is satisified', () => {
    spyOnEvaluateRuleByRuleName({ rule1: false, rule2: true });
    expectAny({}, {}, ['rule1', 'rule2'], true);
  });
}

function all() {
  function expectAll(
    componentContent: any,
    conceptMapData: any,
    ruleNames: string[],
    expectedResult: boolean
  ) {
    expect(service.all(componentContent, conceptMapData, ruleNames)).toEqual(expectedResult);
  }
  it('should check if all rules are satisfied when only one is satisified', () => {
    spyOnEvaluateRuleByRuleName({ rule1: false, rule2: true });
    expectAll({}, {}, ['rule1', 'rule2'], false);
  });
  it('should check if all rules are satisfied when all are satisified', () => {
    spyOnEvaluateRuleByRuleName({ rule1: true, rule2: true });
    expectAll({}, {}, ['rule1', 'rule2'], true);
  });
}

function populateConceptMapData() {
  // TODO
}

function moveLinkTextToFront() {
  // TODO
}

function moveNodesToFront() {
  // TODO
}

function refreshLinkLabels() {
  // TODO
}

function getNodeById() {
  // TODO
}

function createImage() {
  // TODO
}

function getHrefToBase64ImageReplacements() {
  // TODO
}

function getImagesInSVG() {
  it('should get the images in the svg string', () => {
    const svgString = `<svg id="svg1">
        <image id="image1" xlink:href="/wise/curriculum/1/assets/spongebob.png"/>
        <image id="image1" xlink:href="/wise/curriculum/1/assets/patrick.png"/>
        </svg>`;
    const images = service.getImagesInSVG(svgString);
    expect(images.length).toEqual(2);
    expect(images[0]).toEqual('/wise/curriculum/1/assets/spongebob.png');
    expect(images[1]).toEqual('/wise/curriculum/1/assets/patrick.png');
  });
}

function getBase64Image() {
  // TODO
}

function componentStateHasStudentWork() {
  let componentState: any;
  let componentContent: any;
  beforeEach(() => {
    componentState = createComponentState();
    componentContent = createComponentContent();
  });
  function expectComponentStateHasStudentWork(
    componentState: any,
    componentContent: any,
    expectedResult: boolean
  ) {
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(
      expectedResult
    );
  }
  it('should check if component state has student work when it does not have work', () => {
    expectComponentStateHasStudentWork(componentState, componentContent, false);
  });
  it('should check if component state has student work when it does have work', () => {
    componentState.studentData.conceptMapData.nodes.push({});
    expectComponentStateHasStudentWork(componentState, componentContent, true);
  });
}

function isStudentConceptMapDifferentThanStarterConceptMap() {
  function expectIsStudentConceptMapDifferentThanStarterConceptMap(
    studentNodes: any[],
    studentLinks: any[],
    starterNodes: any[],
    starterLinks: any[],
    expectedResult: boolean
  ) {
    const studentConceptMap = createConceptMapData(studentNodes, studentLinks);
    const starterConceptMap = createConceptMapData(starterNodes, starterLinks);
    expect(
      service.isStudentConceptMapDifferentThanStarterConceptMap(
        studentConceptMap,
        starterConceptMap
      )
    ).toEqual(expectedResult);
  }
  it(`should check if student concept map is different than starter concept map when nodes are not
      different`, () => {
    expectIsStudentConceptMapDifferentThanStarterConceptMap(
      [conceptMapNode1],
      [],
      [conceptMapNode1],
      [],
      false
    );
  });
  it(`should check if student concept map is different than starter concept map when nodes are
      different`, () => {
    expectIsStudentConceptMapDifferentThanStarterConceptMap(
      [conceptMapNode1],
      [],
      [conceptMapNode2],
      [],
      true
    );
  });
  it(`should check if student concept map is different than starter concept map when there are
      different number of nodes`, () => {
    expectIsStudentConceptMapDifferentThanStarterConceptMap(
      [conceptMapNode1],
      [],
      [conceptMapNode1, conceptMapNode2],
      [],
      true
    );
  });
  it(`should check if student concept map is different than starter concept map when links are not
      different`, () => {
    expectIsStudentConceptMapDifferentThanStarterConceptMap(
      [],
      [conceptMapLink1],
      [],
      [conceptMapLink1],
      false
    );
  });
  it(`should check if student concept map is different than starter concept map when links are
      different`, () => {
    expectIsStudentConceptMapDifferentThanStarterConceptMap(
      [],
      [conceptMapLink1],
      [],
      [conceptMapLink2],
      true
    );
  });
  it(`should check if student concept map is different than starter concept map when there are
      different number of links`, () => {
    expectIsStudentConceptMapDifferentThanStarterConceptMap(
      [],
      [conceptMapLink1],
      [],
      [conceptMapLink1, conceptMapLink2],
      true
    );
  });
}

function generateImageFromRenderedComponentState() {
  // TODO
}

function getNextAvailableId() {
  it('should get the next available id', () => {
    const nodes = [{ id: 'node1' }, { id: 'node2' }, { id: 'node3' }];
    expect(service.getNextAvailableId(nodes, 'node')).toEqual('node4');
  });
}

function displayAnnotation() {
  let componentContent: any;
  beforeEach(() => {
    componentContent = createComponentContent([], []);
  });
  function expectDisplayAnnotation(
    componentContent: any,
    annotation: any,
    expectedResult: boolean
  ) {
    expect(service.displayAnnotation(componentContent, annotation)).toEqual(expectedResult);
  }
  it(`should check if we should display the annotation to the student when display to student is
      false`, () => {
    expectDisplayAnnotation(componentContent, createAnnotation('score', false), false);
  });
  it(`should check if we should display the annotation to the student when type is auto
      score`, () => {
    componentContent.showAutoScore = true;
    expectDisplayAnnotation(componentContent, createAnnotation('autoScore', true), true);
  });
  it(`should check if we should display the annotation to the student when type is auto
      comment`, () => {
    componentContent.showAutoFeedback = true;
    expectDisplayAnnotation(componentContent, createAnnotation('autoComment', true), true);
  });
}

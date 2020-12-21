import { EditAdvancedComponentAngularJSController } from "../../../../site/src/app/authoring-tool/edit-advanced-component/editAdvancedComponentAngularJSController";
import { NodeService } from "../../../services/nodeService";
import { TeacherProjectService } from "../../../services/teacherProjectService";
import { UtilService } from "../../../services/utilService";

class EditConceptMapAdvancedController extends EditAdvancedComponentAngularJSController {
  allowedConnectedCoypes = [
    { type: 'ConceptMap' },
    { type: 'Draw' },
    { type: 'Embedded' },
    { type: 'Graph' },
    { type: 'Label' },
    { type: 'Table' }
  ];
  shouldOptions: any[] = [
    {
      value: false,
      label: $localize`Should`
    },
    {
      value: true,
      label: $localize`Should Not`
    }
  ];

  static $inject = ['NodeService', 'ProjectService', 'UtilService'];

  constructor(
    protected NodeService: NodeService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(NodeService, ProjectService);
  }

  /**
   * A "with link" checkbox was checked
   * @param ruleIndex the index of the rule
   */
  ruleLinkCheckboxClicked(ruleIndex: number): void {
    const rule = this.authoringComponentContent.rules[ruleIndex];
    if (rule.type === 'node') {
      /*
       * the rule has been set to 'node' instead of 'link' so we
       * will remove the link label and other node label
       */
      delete rule.linkLabel;
      delete rule.otherNodeLabel;
    }
    this.authoringViewComponentChanged();
  }

  addRule(): void {
    const newRule = {
      name: '',
      type: 'node',
      categories: [],
      nodeLabel: '',
      comparison: 'exactly',
      number: 1,
      not: false
    };

    this.authoringComponentContent.rules.push(newRule);
    let showSubmitButton = false;
    if (this.authoringComponentContent.rules.length > 0) {
      showSubmitButton = true;
    }

    this.setShowSubmitButtonValue(showSubmitButton);
    this.authoringViewComponentChanged();
  }

  /**
   * Move a rule up
   * @param index the index of the rule
   */
  moveRuleUpButtonClicked(index: number): void {
    this.UtilService.moveObjectUp(this.authoringComponentContent.rules, index);
    this.authoringViewComponentChanged();
  }

  /**
   * Move a rule down
   * @param index the index of the rule
   */
  moveRuleDownButtonClicked(index: number): void {
    this.UtilService.moveObjectDown(this.authoringComponentContent.rules, index);
    this.authoringViewComponentChanged();
  }

  /*
   * Delete a rule
   * @param index the index of the rule to delete
   */
  ruleDeleteButtonClicked(index: number): void {
    const rule = this.authoringComponentContent.rules[index];
    const ruleName = rule.name;
    if (
      confirm(
        $localize`Are you sure you want to delete this rule?\n\nRule Name: ${ruleName}`
      )
    ) {
      this.authoringComponentContent.rules.splice(index, 1);
      this.authoringViewComponentChanged();
    }

    let showSubmitButton = false;
    if (this.authoringComponentContent.rules.length > 0) {
      showSubmitButton = true;
    }
    this.setShowSubmitButtonValue(showSubmitButton);
  }

  addCategoryToRule(rule: any): void {
    rule.categories.push('');
    this.authoringViewComponentChanged();
  }

  deleteCategoryFromRule(rule: any, index: number): void {
    const ruleName = rule.name;
    const categoryName = rule.categories[index];
    if (
      confirm(
        $localize`Are you sure you want to delete the category from this rule?\n\nRule Name: ${ruleName}\nCategory Name: ${categoryName}`
      )
    ) {
      rule.categories.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

}

export const EditConceptMapAdvancedComponent = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: EditConceptMapAdvancedController,
  templateUrl: 'wise5/components/conceptMap/edit-concept-map-advanced/edit-concept-map-advanced.component.html'
}
'use strict';

import { TeacherProjectService } from '../../services/teacherProjectService';
import { ConfigService } from '../../services/configService';
import { NodeService } from '../../services/nodeService';
import { TeacherDataService } from '../../services/teacherDataService';
import { UtilService } from '../../services/utilService';
import * as $ from 'jquery';
import { NotificationService } from '../../services/notificationService';
import { Subscription } from 'rxjs';
import { Directive } from '@angular/core';

@Directive()
class NodeAuthoringController {
  $translate: any;
  components: any;
  componentsToChecked = {};
  copyComponentMode: boolean = false;
  currentNodeCopy: any;
  howToChooseAmongAvailablePathsOptions = [
    null,
    'random',
    'workgroupId',
    'firstAvailable',
    'lastAvailable',
    'tag'
  ];
  insertComponentMode: boolean = false;
  items: any[];
  moveComponentMode: boolean = false;
  node: any;
  nodeCopy: any = null;
  nodeId: string;
  nodePosition: any;
  originalNodeCopy: any;
  projectId: number;
  selectedComponent: any = null;
  showAdvanced: boolean = false;
  showComponentAuthoringViews: boolean = true;
  showComponents: boolean = true;
  showStepButtons: boolean = true;
  undoStack: any[] = [];
  componentShowSubmitButtonValueChangedSubscription: Subscription;
  nodeChangedSubscription: Subscription;

  static $inject = [
    '$anchorScroll',
    '$filter',
    '$injector',
    '$mdDialog',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectService',
    'TeacherDataService',
    'UtilService'
  ];

  constructor(
    private $anchorScroll: any,
    private $filter: any,
    private $injector: any,
    private $mdDialog: any,
    private $scope: any,
    private $state: any,
    private $stateParams: any,
    private $timeout: any,
    private ConfigService: ConfigService,
    private NodeService: NodeService,
    private NotificationService: NotificationService,
    private ProjectService: TeacherProjectService,
    private TeacherDataService: TeacherDataService,
    private UtilService: UtilService
  ) {
    this.$translate = this.$filter('translate');
    this.projectId = $stateParams.projectId;
    this.nodeId = $stateParams.nodeId;
    this.TeacherDataService.setCurrentNodeByNodeId(this.nodeId);
    this.node = this.ProjectService.getNodeById(this.nodeId);
    this.nodePosition = this.ProjectService.getNodePositionById(this.nodeId);
    this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);

    /*
     * remember a copy of the node at the beginning of this node authoring
     * session in case we need to roll back if the user decides to
     * cancel/revert all the changes.
     */
    this.originalNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);

    this.componentShowSubmitButtonValueChangedSubscription = this.NodeService.componentShowSubmitButtonValueChanged$.subscribe(
      ({ showSubmitButton }) => {
        if (showSubmitButton) {
          this.node.showSaveButton = false;
          this.node.showSubmitButton = false;
          this.ProjectService.turnOnSaveButtonForAllComponents(this.node);
        } else {
          if (this.ProjectService.doesAnyComponentInNodeShowSubmitButton(this.node.id)) {
            this.ProjectService.turnOnSaveButtonForAllComponents(this.node);
          } else {
            this.node.showSaveButton = true;
            this.node.showSubmitButton = false;
            this.ProjectService.turnOffSaveButtonForAllComponents(this.node);
          }
        }
        this.authoringViewNodeChanged();
      }
    );

    const data = {
      title: this.ProjectService.getNodePositionAndTitleByNodeId(this.nodeId)
    };
    if (this.ProjectService.isGroupNode(this.nodeId)) {
      this.saveEvent('activityViewOpened', 'Navigation', data);
    } else {
      this.saveEvent('stepViewOpened', 'Navigation', data);
    }
    if (this.$stateParams.newComponents.length > 0) {
      this.highlightNewComponentsAndThenShowComponentAuthoring(this.$stateParams.newComponents);
    } else {
      this.scrollToTopOfPage();
    }

    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  $onInit() {
    this.nodeChangedSubscription = this.ProjectService.nodeChanged$.subscribe((doParseProject) => {
      this.authoringViewNodeChanged(doParseProject);
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.componentShowSubmitButtonValueChangedSubscription.unsubscribe();
    this.nodeChangedSubscription.unsubscribe();
  }

  previewStepInNewWindow() {
    const data = { constraints: true };
    this.saveEvent('stepPreviewed', 'Navigation', data);
    window.open(`${this.ConfigService.getConfigParam('previewProjectURL')}/${this.nodeId}`);
  }

  previewStepWithoutConstraintsInNewWindow() {
    const data = { constraints: false };
    this.saveEvent('stepPreviewed', 'Navigation', data);
    window.open(
      `${this.ConfigService.getConfigParam('previewProjectURL')}/${this.nodeId}` +
        `?constraints=false`
    );
  }

  close() {
    this.TeacherDataService.setCurrentNode(null);
    this.$state.go('root.at.project', { projectId: this.projectId });
    this.scrollToTopOfPage();
  }

  showSaveErrorAdvancedAuthoring() {
    alert(this.$translate('saveErrorAdvancedAuthoring'));
  }

  addComponent() {
    this.$state.go('root.at.project.node.add-component.choose-component');
  }

  deleteComponent(componentId) {
    if (confirm(this.$translate('confirmDeleteComponent'))) {
      this.ProjectService.deleteComponent(this.nodeId, componentId);
      this.checkIfNeedToShowNodeSaveOrNodeSubmitButtons();
      this.ProjectService.saveProject();
    }
  }

  hideAllComponentSaveButtons() {
    for (const component of this.components) {
      const service = this.$injector.get(component.type + 'Service');
      if (service.componentUsesSaveButton()) {
        component.showSaveButton = false;
      }
    }
  }

  /**
   * The node has changed in the authoring view
   * @param parseProject whether to parse the whole project to recalculate
   * significant changes such as branch paths
   */
  authoringViewNodeChanged(parseProject = false) {
    this.undoStack.push(this.currentNodeCopy);
    this.currentNodeCopy = this.UtilService.makeCopyOfJSONObject(this.node);
    if (parseProject) {
      this.ProjectService.parseProject();
      this.items = this.ProjectService.idToOrder;
    }
    return this.ProjectService.saveProject();
  }

  undo() {
    if (this.undoStack.length === 0) {
      alert(this.$translate('noUndoAvailable'));
    } else if (this.undoStack.length > 0) {
      if (confirm(this.$translate('confirmUndoLastChange'))) {
        const nodePreviousVersion = this.undoStack.pop();
        this.ProjectService.replaceNode(this.nodeId, nodePreviousVersion);
        this.node = this.ProjectService.getNodeById(this.nodeId);
        this.components = this.ProjectService.getComponentsByNodeId(this.nodeId);
        this.ProjectService.saveProject();
      }
    }
  }

  hideAllViews() {
    this.showStepButtons = false;
    this.showComponents = false;
    this.NotificationService.hideJSONValidMessage();
  }

  showDefaultComponentsView() {
    this.hideAllViews();
    this.showStepButtons = true;
    this.showComponents = true;
  }

  showAdvancedView() {
    this.$state.go('root.at.project.node.advanced');
  }

  editRubric() {
    this.$state.go('root.at.project.node.edit-rubric');
  }

  showComponentAuthoring() {
    this.showComponentAuthoringViews = true;
  }

  hideComponentAuthoring() {
    this.showComponentAuthoringViews = false;
  }

  turnOnInsertComponentMode() {
    this.insertComponentMode = true;
  }

  turnOffInsertComponentMode() {
    this.insertComponentMode = false;
  }

  turnOnMoveComponentMode() {
    this.moveComponentMode = true;
  }

  turnOffMoveComponentMode() {
    this.moveComponentMode = false;
  }

  turnOnCopyComponentMode() {
    this.copyComponentMode = true;
  }

  turnOffCopyComponentMode() {
    this.copyComponentMode = false;
  }

  getSelectedComponentIds() {
    const selectedComponents = [];
    if (this.components != null) {
      for (let component of this.components) {
        if (component != null && component.id != null) {
          let checked = this.componentsToChecked[component.id];
          if (checked) {
            selectedComponents.push(component.id);
          }
        }
      }
    }
    return selectedComponents;
  }

  clearComponentsToChecked() {
    this.componentsToChecked = {};
  }

  /**
   * Get the component numbers and component types that have been selected
   * @return an array of strings
   * example
   * [
   *   "1. OpenResponse",
   *   "3. MultipleChoice"
   * ]
   */
  getSelectedComponentNumbersAndTypes() {
    let selectedComponents = [];
    if (this.components != null) {
      for (let c = 0; c < this.components.length; c++) {
        let component = this.components[c];
        if (component != null && component.id != null) {
          let checked = this.componentsToChecked[component.id];
          if (checked) {
            let componentNumberAndType = c + 1 + '. ' + component.type;
            selectedComponents.push(componentNumberAndType);
          }
        }
      }
    }
    return selectedComponents;
  }

  importComponent() {
    this.$state.go('root.at.project.node.import-component.choose-step');
  }

  moveButtonClicked() {
    if (this.getSelectedComponentIds().length === 0) {
      alert(this.$translate('pleaseSelectAComponentToMoveAndThenClickTheMoveButtonAgain'));
    } else {
      this.showDefaultComponentsView();
      this.turnOnMoveComponentMode();
      this.turnOnInsertComponentMode();
      this.hideComponentAuthoring();
    }
  }

  copyButtonClicked() {
    if (this.getSelectedComponentIds().length === 0) {
      alert(this.$translate('pleaseSelectAComponentToCopyAndThenClickTheCopyButtonAgain'));
    } else {
      this.showDefaultComponentsView();
      this.turnOnCopyComponentMode();
      this.turnOnInsertComponentMode();
      this.hideComponentAuthoring();
    }
  }

  deleteButtonClicked() {
    if (this.getSelectedComponentIds().length === 0) {
      alert(this.$translate('pleaseSelectAComponentToDeleteAndThenClickTheDeleteButtonAgain'));
    } else {
      this.scrollToTopOfPage();

      /*
       * hide all the component authoring so that the author only sees the
       * component numbers and component types
       */
      this.hideComponentAuthoring();

      /*
       * Use a timeout to allow the effects of hideComponentAuthoring() to
       * take effect. If we don't use a timeout, the user won't see any change
       * in the UI.
       */
      this.$timeout(() => {
        let confirmMessage = '';
        const selectedComponentNumbersAndTypes = this.getSelectedComponentNumbersAndTypes();
        if (selectedComponentNumbersAndTypes.length == 1) {
          confirmMessage = this.$translate('areYouSureYouWantToDeleteThisComponent');
        } else if (selectedComponentNumbersAndTypes.length > 1) {
          confirmMessage = this.$translate('areYouSureYouWantToDeleteTheseComponents');
        }
        for (let c = 0; c < selectedComponentNumbersAndTypes.length; c++) {
          confirmMessage += '\n' + selectedComponentNumbersAndTypes[c];
        }
        if (confirm(confirmMessage)) {
          const selectedComponents = this.getSelectedComponentIds();
          const data = {
            componentsDeleted: this.getComponentObjectsForEventData(selectedComponents)
          };
          for (const componentId of selectedComponents) {
            this.ProjectService.deleteComponent(this.nodeId, componentId);
          }
          this.saveEvent('componentDeleted', 'Authoring', data);
          this.checkIfNeedToShowNodeSaveOrNodeSubmitButtons();
          this.ProjectService.saveProject();
        } else {
          this.clearComponentsToChecked();
        }
        this.turnOffInsertComponentMode();
        this.clearComponentsToChecked();
        this.showComponentAuthoring();
      });
    }
  }

  cancelInsertClicked() {
    this.showDefaultComponentsView();
    this.turnOffMoveComponentMode();
    this.turnOffInsertComponentMode();
    this.clearComponentsToChecked();
    this.showComponentAuthoring();
  }

  checkIfNeedToShowNodeSaveOrNodeSubmitButtons() {
    if (!this.ProjectService.doesAnyComponentInNodeShowSubmitButton(this.nodeId)) {
      if (this.ProjectService.doesAnyComponentHaveWork(this.nodeId)) {
        this.node.showSaveButton = true;
        this.node.showSubmitButton = false;
        this.hideAllComponentSaveButtons();
      } else {
        this.node.showSaveButton = false;
        this.node.showSubmitButton = false;
      }
    }
  }

  insertComponentAsFirst() {
    if (this.moveComponentMode) {
      this.handleMoveComponent();
    } else if (this.copyComponentMode) {
      this.handleCopyComponent();
    }
  }

  insertComponentAfter(componentId) {
    if (this.moveComponentMode) {
      this.handleMoveComponent(componentId);
    } else if (this.copyComponentMode) {
      this.handleCopyComponent(componentId);
    }
  }

  /**
   * Move components in this step.
   * @param componentId (optional) Put the moved components after this component
   * id. If the componentId is not provided, we will put the components at the
   * beginning of the step.
   */
  handleMoveComponent(componentId = null) {
    const selectedComponentIds = this.getSelectedComponentIds();
    if (selectedComponentIds != null && selectedComponentIds.indexOf(componentId) != -1) {
      if (selectedComponentIds.length === 1) {
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemAfterItself'));
      } else if (selectedComponentIds.length > 1) {
        alert(this.$translate('youAreNotAllowedToInsertTheSelectedItemsAfterItself'));
      }
    } else {
      const newComponents = this.NodeService.moveComponent(
        this.nodeId,
        selectedComponentIds,
        componentId
      );
      this.ProjectService.saveProject();
      const eventData = {
        componentsMoved: this.getComponentObjectsForEventData(selectedComponentIds)
      };
      this.saveEvent('componentMoved', 'Authoring', eventData);
      this.turnOffMoveComponentMode();
      this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);
    }
  }

  /**
   * Copy components in this step.
   * @param componentId (optional) Put the copied components after this
   * component id. If the componentId is not provided, we will put the
   * components at the beginning of the step.
   */
  handleCopyComponent(componentId = null) {
    let newComponents = [];
    let selectedComponentIds = this.getSelectedComponentIds();
    let componentsCopied = this.getComponentObjectsForEventData(selectedComponentIds);
    newComponents = this.ProjectService.copyComponentAndInsert(
      this.nodeId,
      selectedComponentIds,
      componentId
    );
    for (let c = 0; c < componentsCopied.length; c++) {
      let componentCopied = componentsCopied[c];
      let newComponent = newComponents[c];
      componentCopied.fromComponentId = componentCopied.componentId;
      componentCopied.toComponentId = newComponent.id;
      delete componentCopied.componentId;
    }
    const data = {
      componentsCopied: componentsCopied
    };
    this.saveEvent('componentCopied', 'Authoring', data);
    this.turnOffCopyComponentMode();
    this.ProjectService.saveProject();
    this.highlightNewComponentsAndThenShowComponentAuthoring(newComponents);
  }

  /**
   * Temporarily highlight the new components and then show the component
   * authoring views. Used to bring user's attention to new changes.
   * @param newComponents an array of the new components we have just added
   */
  highlightNewComponentsAndThenShowComponentAuthoring(newComponents) {
    this.$timeout(() => {
      // allow the components time to show up in the UI
      if (newComponents != null) {
        for (const newComponent of newComponents) {
          if (newComponent != null) {
            this.UtilService.temporarilyHighlightElement(newComponent.id);
          }
        }
      }

      /*
       * Wait a small amount of time before returning the UI back to the
       * normal view. This allows the author to see the component number
       * and type view a little longer so that they can see the change
       * they just made before we switch back to the normal view.
       */
      this.$timeout(() => {
        this.showComponentAuthoring();
        this.turnOffInsertComponentMode();
        this.showDefaultComponentsView();
        this.clearComponentsToChecked();

        /*
         * use a timeout to wait for the UI to update and then scroll
         * to the first new component
         */
        this.$timeout(() => {
          if (newComponents != null && newComponents.length > 0) {
            let componentElement = $('#' + newComponents[0].id);
            if (componentElement != null) {
              $('#content').animate(
                {
                  scrollTop: componentElement.offset().top - 200
                },
                1000
              );
            }
          }
        }, 1000);
      }, 1000);
    });
  }

  scrollToTopOfPage() {
    this.$anchorScroll('top');
  }

  getComponentTypeLabel(componentType) {
    return this.UtilService.getComponentTypeLabel(componentType);
  }

  /**
   * Save an Authoring Tool event
   * @param eventName the name of the event
   * @param category the category of the event
   * example 'Navigation' or 'Authoring'
   * @param data (optional) an object that contains more specific data about the event
   */
  saveEvent(eventName, category, data) {
    const context = 'AuthoringTool';
    const nodeId = this.nodeId;
    const componentId = null;
    const componentType = null;
    if (data == null) {
      data = {};
    }
    this.TeacherDataService.saveEvent(
      context,
      nodeId,
      componentId,
      componentType,
      category,
      eventName,
      data
    );
  }

  /**
   * Get an array of objects that contain the component id and type
   * @param componentIds an array of component ids
   * @return an array of objects that contain the component id and type
   * TODO refactor too many nesting
   */
  getComponentObjectsForEventData(componentIds) {
    const componentObjects = [];
    for (let componentId of componentIds) {
      const component = this.ProjectService.getComponentByNodeIdAndComponentId(
        this.nodeId,
        componentId
      );
      if (component != null) {
        const tempComponent = {
          componentId: component.id,
          type: component.type
        };
        componentObjects.push(tempComponent);
      }
    }
    return componentObjects;
  }

  showComponentAdvancedAuthoring(component: any) {
    this.$mdDialog.show({
      templateUrl: 'wise5/authoringTool/components/edit-component-advanced.html',
      controller: [
        '$scope',
        '$mdDialog',
        function ($scope: any, $mdDialog: any) {
          $scope.close = function () {
            $mdDialog.hide();
          };
        }
      ],
      controllerAs: '$ctrl',
      bindToController: true,
      locals: {
        component: component,
        nodeId: this.nodeId
      },
      fullscreen: true,
      clickOutsideToClose: true
    });
  }
}

export default NodeAuthoringController;

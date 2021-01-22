'use strict';
import * as angular from 'angular';
import * as $ from 'jquery';
import { ConfigService } from '../services/configService';
import { ProjectService } from './projectService';
import { UtilService } from '../services/utilService';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { SessionService } from './sessionService';

@Injectable()
export class TeacherProjectService extends ProjectService {
  private componentChangedSource: Subject<boolean> = new Subject<boolean>();
  public componentChanged$: Observable<boolean> = this.componentChangedSource.asObservable();
  private nodeChangedSource: Subject<boolean> = new Subject<boolean>();
  public nodeChanged$: Observable<boolean> = this.nodeChangedSource.asObservable();
  private refreshProjectSource: Subject<void> = new Subject<void>();
  public refreshProject$ = this.refreshProjectSource.asObservable();
  private scrollToBottomOfPageSource: Subject<void> = new Subject<void>();
  public scrollToBottomOfPage$ = this.scrollToBottomOfPageSource.asObservable();
  private errorSavingProjectSource: Subject<any> = new Subject<any>();
  public errorSavingProject$: Observable<any> = this.errorSavingProjectSource.asObservable();
  private notAllowedToEditThisProjectSource: Subject<any> = new Subject<any>();
  public notAllowedToEditThisProject$: Observable<any> = this.notAllowedToEditThisProjectSource.asObservable();
  private notLoggedInProjectNotSavedSource: Subject<any> = new Subject<any>();
  public notLoggedInProjectNotSaved$: Observable<any> = this.notLoggedInProjectNotSavedSource.asObservable();
  private projectSavedSource: Subject<any> = new Subject<any>();
  public projectSaved$: Observable<any> = this.projectSavedSource.asObservable();
  private savingProjectSource: Subject<any> = new Subject<any>();
  public savingProject$: Observable<any> = this.savingProjectSource.asObservable();

  constructor(
    protected upgrade: UpgradeModule,
    protected http: HttpClient,
    protected ConfigService: ConfigService,
    protected SessionService: SessionService,
    protected UtilService: UtilService
  ) {
    super(upgrade, http, ConfigService, SessionService, UtilService);
  }

  getNewProjectTemplate() {
    return {
      nodes: [
        {
          id: 'group0',
          type: 'group',
          title: 'Master',
          startId: 'group1',
          ids: ['group1']
        },
        {
          id: 'group1',
          type: 'group',
          title: this.UtilService.translate('FIRST_ACTIVITY'),
          startId: 'node1',
          ids: ['node1'],
          icons: {
            default: {
              color: '#2196F3',
              type: 'font',
              fontSet: 'material-icons',
              fontName: 'info'
            }
          }
        },
        {
          id: 'node1',
          type: 'node',
          title: this.UtilService.translate('FIRST_STEP'),
          components: [],
          constraints: [],
          showSaveButton: false,
          showSubmitButton: false,
          transitionLogic: {
            transitions: []
          }
        }
      ],
      constraints: [],
      startGroupId: 'group0',
      startNodeId: 'node1',
      navigationMode: 'guided',
      layout: {
        template: 'starmap|leftNav|rightNav'
      },
      metadata: {
        title: ''
      },
      notebook: {
        enabled: false,
        label: this.UtilService.translate('NOTEBOOK'),
        enableAddNew: true,
        itemTypes: {
          note: {
            type: 'note',
            enabled: true,
            enableLink: true,
            enableAddNote: true,
            enableClipping: true,
            enableStudentUploads: true,
            requireTextOnEveryNote: false,
            label: {
              singular: this.UtilService.translate('NOTE_LOWERCASE'),
              plural: this.UtilService.translate('NOTES_LOWERCASE'),
              link: this.UtilService.translate('NOTES'),
              icon: 'note',
              color: '#1565C0'
            }
          },
          report: {
            enabled: false,
            label: {
              singular: this.UtilService.translate('REPORT_LOWERCASE'),
              plural: this.UtilService.translate('REPORTS_LOWERCASE'),
              link: this.UtilService.translate('REPORT'),
              icon: 'assignment',
              color: '#AD1457'
            },
            notes: [
              {
                reportId: 'finalReport',
                title: this.UtilService.translate('FINAL_REPORT'),
                description: this.UtilService.translate('REPORT_DESCRIPTION'),
                prompt: this.UtilService.translate('REPORT_PROMPT'),
                content: this.UtilService.translate('REPORT_CONTENT')
              }
            ]
          }
        }
      },
      teacherNotebook: {
        enabled: true,
        label: this.UtilService.translate('TEACHER_NOTEBOOK'),
        enableAddNew: true,
        itemTypes: {
          note: {
            type: 'note',
            enabled: false,
            enableLink: true,
            enableAddNote: true,
            enableClipping: true,
            enableStudentUploads: true,
            requireTextOnEveryNote: false,
            label: {
              singular: this.UtilService.translate('NOTE_LOWERCASE'),
              plural: this.UtilService.translate('NOTES_LOWERCASE'),
              link: this.UtilService.translate('NOTES'),
              icon: 'note',
              color: '#1565C0'
            }
          },
          report: {
            enabled: true,
            label: {
              singular: this.UtilService.translate('TEACHER_REPORT_LOWERCASE'),
              plural: this.UtilService.translate('TEACHER_REPORTS_LOWERCASE'),
              link: this.UtilService.translate('TEACHER_REPORT'),
              icon: 'assignment',
              color: '#AD1457'
            },
            notes: [
              {
                reportId: 'teacherReport',
                title: this.UtilService.translate('TEACHER_REPORT'),
                description: this.UtilService.translate('TEACHER_REPORT_DESCRIPTION'),
                prompt: this.UtilService.translate('TEACHER_REPORT_PROMPT'),
                content: this.UtilService.translate('TEACHER_REPORT_CONTENT')
              }
            ]
          }
        }
      },
      inactiveNodes: []
    };
  }

  notifyAuthorProjectBeginEnd(projectId, isBegin) {
    return this.http
      .post(
        `${this.ConfigService.getConfigParam(
          'notifyAuthoringBeginEndURL'
        )}/${projectId}/${isBegin}`,
        null
      )
      .toPromise();
  }

  notifyAuthorProjectBegin(projectId) {
    return this.notifyAuthorProjectBeginEnd(projectId, true);
  }

  notifyAuthorProjectEnd(projectId = null) {
    return this.upgrade.$injector.get('$q')((resolve, reject) => {
      if (projectId == null) {
        if (this.project != null) {
          projectId = this.ConfigService.getProjectId();
        } else {
          resolve();
        }
      }
      this.notifyAuthorProjectBeginEnd(projectId, false).then(() => {
        resolve();
      });
    });
  }

  copyProject(projectId) {
    return this.http
      .post(`${this.ConfigService.getConfigParam('copyProjectURL')}/${projectId}`, null)
      .toPromise()
      .then((newProject) => {
        return newProject;
      });
  }

  /**
   * Registers a new project having the projectJSON content with the server.
   * Returns a new project id if the project is successfully registered.
   * @param projectJSONString a valid JSON string
   */
  registerNewProject(projectName, projectJSONString) {
    return this.http
      .post(this.ConfigService.getConfigParam('registerNewProjectURL'), {
        projectName: projectName,
        projectJSONString: projectJSONString
      })
      .toPromise()
      .then((newProjectId) => {
        return newProjectId;
      });
  }

  /**
   * Replace a component
   * @param nodeId the node id
   * @param componentId the component id
   * @param component the new component
   */
  replaceComponent(nodeId, componentId, component) {
    const components = this.getComponentsByNodeId(nodeId);
    for (let c = 0; c < components.length; c++) {
      if (components[c].id === componentId) {
        components[c] = component;
        break;
      }
    }
  }

  /**
   * Create a new group
   * @param title the title of the group
   * @returns the group object
   */
  createGroup(title) {
    return {
      id: this.getNextAvailableGroupId(),
      type: 'group',
      title: title,
      startId: '',
      constraints: [],
      transitionLogic: {
        transitions: []
      },
      ids: []
    };
  }

  /**
   * Create a new node
   * @param title the title of the node
   * @returns the node object
   */
  createNode(title) {
    return {
      id: this.getNextAvailableNodeId(),
      title: title,
      type: 'node',
      constraints: [],
      transitionLogic: {
        transitions: []
      },
      showSaveButton: false,
      showSubmitButton: false,
      components: []
    };
  }

  /**
   * Move nodes inside a group node
   * @param nodeIds the node ids to move
   * @param nodeId the node id of the group we are moving the nodes inside
   */
  moveNodesInside(nodeIds, nodeId) {
    const movedNodes = [];

    for (let n = 0; n < nodeIds.length; n++) {
      const tempNodeId = nodeIds[n];
      const tempNode = this.getNodeById(tempNodeId);
      movedNodes.push(tempNode);

      const movingNodeIsActive = this.isActive(tempNodeId);
      const stationaryNodeIsActive = this.isActive(nodeId);

      if (movingNodeIsActive && stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.insertNodeInsideOnlyUpdateTransitions(tempNodeId, nodeId);
          this.insertNodeInsideInGroups(tempNodeId, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.insertNodeAfterInTransitions(tempNode, nodeId);
          this.insertNodeAfterInGroups(tempNodeId, nodeId);
        }
      } else if (movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.moveFromActiveToInactiveInsertInside(tempNode, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.moveToInactive(tempNode, nodeId);
        }
      } else if (!movingNodeIsActive && stationaryNodeIsActive) {
        this.moveToActive(tempNode);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.insertNodeInsideOnlyUpdateTransitions(tempNodeId, nodeId);
          this.insertNodeInsideInGroups(tempNodeId, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.insertNodeAfterInTransitions(tempNode, nodeId);
          this.insertNodeAfterInGroups(tempNodeId, nodeId);
        }
      } else if (!movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);

        if (n == 0) {
          /*
           * this is the first node we are moving so we will insert it
           * into the beginning of the group
           */
          this.moveFromInactiveToInactiveInsertInside(tempNode, nodeId);
        } else {
          /*
           * this is not the first node we are moving so we will insert
           * it after the node we previously inserted
           */
          this.moveInactiveNodeToInactiveSection(tempNode, nodeId);
        }
      }

      /*
       * remember the node id so we can put the next node (if any)
       * after this one
       */
      nodeId = tempNode.id;
    }
    return movedNodes;
  }

  /**
   * Move nodes after a certain node id
   * @param nodeIds the node ids to move
   * @param nodeId the node id we will put the moved nodes after
   */
  moveNodesAfter(nodeIds, nodeId) {
    const movedNodes = [];

    for (let tempNodeId of nodeIds) {
      const node = this.getNodeById(tempNodeId);
      movedNodes.push(node);

      const movingNodeIsActive = this.isActive(tempNodeId);
      const stationaryNodeIsActive = this.isActive(nodeId);

      if (movingNodeIsActive && stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.insertNodeAfterInGroups(tempNodeId, nodeId);
        this.insertNodeAfterInTransitions(node, nodeId);
      } else if (movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.moveToInactive(node, nodeId);
      } else if (!movingNodeIsActive && stationaryNodeIsActive) {
        this.moveToActive(node);
        this.insertNodeAfterInGroups(tempNodeId, nodeId);
        this.insertNodeAfterInTransitions(node, nodeId);
      } else if (!movingNodeIsActive && !stationaryNodeIsActive) {
        this.removeNodeIdFromTransitions(tempNodeId);
        this.removeNodeIdFromGroups(tempNodeId);
        this.moveInactiveNodeToInactiveSection(node, nodeId);
      }

      // remember the node id so we can put the next node (if any) after this one
      nodeId = node.id;
    }
    return movedNodes;
  }

  /**
   * Copy nodes and put them after a certain node id
   * @param nodeIds the node ids to copy
   * @param nodeId the node id we will put the copied nodes after
   */
  copyNodesInside(nodeIds, nodeId) {
    const newNodes = [];
    for (let n = 0; n < nodeIds.length; n++) {
      const newNode = this.copyNode(nodeIds[n]);
      const newNodeId = newNode.id;
      if (n == 0) {
        this.createNodeInside(newNode, nodeId);
      } else {
        this.createNodeAfter(newNode, nodeId);
      }
      nodeId = newNodeId;
      this.parseProject();
      newNodes.push(newNode);
    }
    return newNodes;
  }

  /**
   * Copy the nodes into the project
   * @param selectedNodes the nodes to import
   * @param fromProjectId copy the nodes from this project
   * @param toProjectId copy the nodes into this project
   * @param nodeIdToInsertInsideOrAfter If this is a group, we will make the
   * new step the first step in the group. If this is a step, we will place
   * the new step after it.
   */
  copyNodes(selectedNodes, fromProjectId, toProjectId, nodeIdToInsertInsideOrAfter) {
    /*
     * Make the request to import the steps. This will copy the asset files
     * and change file names if necessary. If an asset file with the same
     * name exists in both projects we will check if their content is the
     * same. If the content is the same we don't need to copy the file. If
     * the content is different, we need to make a copy of the file with a
     * new name and change all the references in the steps to use the new
     * name.
     */
    return this.http
      .post(this.ConfigService.getConfigParam('importStepsURL'), {
        steps: angular.toJson(selectedNodes),
        fromProjectId: fromProjectId,
        toProjectId: toProjectId
      })
      .toPromise()
      .then((selectedNodes: any) => {
        const inactiveNodes = this.getInactiveNodes();
        const newNodes = [];
        const newNodeIds = [];
        for (const selectedNode of selectedNodes) {
          const tempNode = this.UtilService.makeCopyOfJSONObject(selectedNode);
          if (this.isNodeIdUsed(tempNode.id)) {
            const nextAvailableNodeId = this.getNextAvailableNodeId(newNodeIds);
            tempNode.id = nextAvailableNodeId;
          }
          const tempComponents = tempNode.components;
          for (const tempComponent of tempComponents) {
            if (this.isComponentIdUsed(tempComponent.id)) {
              // we are already using the component id so we will need to change it
              tempComponent.id = this.getUnusedComponentId();
            }
          }
          tempNode.constraints = [];
          newNodes.push(tempNode);
          newNodeIds.push(tempNode.id);
        }

        if (nodeIdToInsertInsideOrAfter == null) {
          /*
           * the place to put the new node has not been specified so we
           * will place it in the inactive steps section
           */

          /*
           * Insert the node after the last inactive node. If there
           * are no inactive nodes it will just be placed in the
           * inactive nodes section. In the latter case we do this by
           * setting nodeIdToInsertInsideOrAfter to 'inactiveSteps'.
           */
          if (inactiveNodes != null && inactiveNodes.length > 0) {
            nodeIdToInsertInsideOrAfter = inactiveNodes[inactiveNodes.length - 1];
          } else {
            nodeIdToInsertInsideOrAfter = 'inactiveSteps';
          }
        }

        for (const newNode of newNodes) {
          if (this.isGroupNode(nodeIdToInsertInsideOrAfter)) {
            this.createNodeInside(newNode, nodeIdToInsertInsideOrAfter);
          } else {
            this.createNodeAfter(newNode, nodeIdToInsertInsideOrAfter);
          }

          /*
           * Update the nodeIdToInsertInsideOrAfter so that when we are
           * importing multiple steps, the steps get placed in the correct
           * order.
           *
           * Example
           * We are importing nodeA and nodeB and want to place them after
           * nodeX. Therefore we want the order to be
           *
           * nodeX
           * nodeA
           * nodeB
           *
           * This means after we add nodeA, we must update
           * nodeIdToInsertInsideOrAfter to be nodeA so that when we add
           * nodeB, it will be placed after nodeA.
           */
          nodeIdToInsertInsideOrAfter = newNode.id;
        }
        return newNodes;
      });
  }

  /**
   * Create a node inside the group
   * @param node the new node
   * @param nodeId the node id of the group to create the node in
   */
  createNodeInside(node, nodeId) {
    if (nodeId === 'inactiveNodes' || nodeId === 'inactiveGroups') {
      this.addInactiveNodeInsertAfter(node);
      this.setIdToNode(node.id, node);
    } else {
      this.setIdToNode(node.id, node);
      if (this.isInactive(nodeId)) {
        this.addInactiveNodeInsertInside(node, nodeId);
      } else {
        this.addNode(node);
        this.insertNodeInsideOnlyUpdateTransitions(node.id, nodeId);
        this.insertNodeInsideInGroups(node.id, nodeId);
      }
    }
  }

  /**
   * Create a node after the given node id
   * @param node the new node
   * @param nodeId the node to add after
   */
  createNodeAfter(newNode, nodeId) {
    if (this.isInactive(nodeId)) {
      this.addInactiveNodeInsertAfter(newNode, nodeId);
      this.setIdToNode(newNode.id, newNode);
    } else {
      this.addNode(newNode);
      this.setIdToNode(newNode.id, newNode);
      this.insertNodeAfterInGroups(newNode.id, nodeId);
      this.insertNodeAfterInTransitions(newNode, nodeId);
    }
  }

  /**
   * Copy nodes and put them after a certain node id
   * @param nodeIds the node ids to copy
   * @param nodeId the node id we will put the copied nodes after
   */
  copyNodesAfter(nodeIds, nodeId) {
    const newNodes = [];
    for (const nodeIdToCopy of nodeIds) {
      const newNode = this.copyNode(nodeIdToCopy);
      const newNodeId = newNode.id;
      this.createNodeAfter(newNode, nodeId);
      nodeId = newNodeId; // remember the node id so we can put the next node (if any) after this one
      this.parseProject();
      newNodes.push(newNode);
    }
    return newNodes;
  }

  isInactive(nodeId) {
    for (const inactiveNode of this.getInactiveNodes()) {
      if (inactiveNode.id === nodeId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a node id is already being used in the project
   * @param nodeId check if this node id is already being used in the project
   * @return whether the node id is already being used in the project
   */
  isNodeIdUsed(nodeId) {
    for (const node of this.getNodes().concat(this.getInactiveNodes())) {
      if (node.id === nodeId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Set a field in the transition logic of a node
   */
  setTransitionLogicField(nodeId, field, value) {
    const node = this.getNodeById(nodeId);
    const transitionLogic = node.transitionLogic;
    if (transitionLogic != null) {
      transitionLogic[field] = value;
    }
  }

  /**
   * Set the transition to value of a node
   * @param fromNodeId the from node
   * @param toNodeId the to node
   */
  setTransition(fromNodeId, toNodeId) {
    const node = this.getNodeById(fromNodeId);
    const transitionLogic = node.transitionLogic;
    if (transitionLogic != null) {
      let transitions = transitionLogic.transitions;
      if (transitions == null || transitions.length == 0) {
        transitionLogic.transitions = [];
        const transition = {};
        transitionLogic.transitions.push(transition);
        transitions = transitionLogic.transitions;
      }

      if (transitions != null && transitions.length > 0) {
        // get the first transition. we will assume there is only one transition.
        const transition = transitions[0];
        if (transition != null) {
          transition.to = toNodeId;
        }
      }
    }
  }

  /**
   * Get the node id that comes after a given node id
   * @param nodeId get the node id that comes after this node id
   * @return the node id that comes after the one that is passed in as a parameter, or null
   * if this is the last node in the sequence
   */
  getNodeIdAfter(nodeId) {
    const order = this.getOrderById(nodeId);
    if (order != null) {
      return this.getNodeIdByOrder(order + 1);
    } else {
      return null;
    }
  }

  /**
   * Add branch path taken constraints to the node
   * @param targetNodeId the node to add the constraints to
   * @param fromNodeId the from node id of the branch path taken constraint
   * @param toNodeId the to node id of the branch path taken constraint
   */
  addBranchPathTakenConstraints(targetNodeId, fromNodeId, toNodeId) {
    const node = this.getNodeById(targetNodeId);
    const makeThisNodeNotVisibleConstraint = {
      id: this.getNextAvailableConstraintIdForNodeId(targetNodeId),
      action: 'makeThisNodeNotVisible',
      targetId: targetNodeId,
      removalConditional: 'all',
      removalCriteria: [
        {
          name: 'branchPathTaken',
          params: {
            fromNodeId: fromNodeId,
            toNodeId: toNodeId
          }
        }
      ]
    };
    node.constraints.push(makeThisNodeNotVisibleConstraint);
    const makeThisNodeNotVisitableConstraint = {
      id: this.getNextAvailableConstraintIdForNodeId(targetNodeId),
      action: 'makeThisNodeNotVisitable',
      targetId: targetNodeId,
      removalConditional: 'all',
      removalCriteria: [
        {
          name: 'branchPathTaken',
          params: {
            fromNodeId: fromNodeId,
            toNodeId: toNodeId
          }
        }
      ]
    };
    node.constraints.push(makeThisNodeNotVisitableConstraint);
  }

  setProjectRubric(html) {
    this.project.rubric = html;
  }

  /**
   * Get the number of branch paths. This is assuming the node is a branch point.
   * @param nodeId The node id of the branch point node.
   * @return The number of branch paths for this branch point.
   */
  getNumberOfBranchPaths(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    if (transitions != null) {
      return transitions.length;
    }
    return 0;
  }

  /**
   * If this step is a branch point, we will return the criteria that is used
   * to determine which path the student gets assigned to.
   * @param nodeId The node id of the branch point.
   * @returns A human readable string containing the criteria of how students
   * are assigned branch paths on this branch point.
   */
  getBranchCriteriaDescription(nodeId) {
    const transitionLogic = this.getTransitionLogicByFromNodeId(nodeId);
    for (const transition of transitionLogic.transitions) {
      if (transition.criteria != null && transition.criteria.length > 0) {
        for (const singleCriteria of transition.criteria) {
          if (singleCriteria.name === 'choiceChosen') {
            return 'multiple choice';
          } else if (singleCriteria.name === 'score') {
            return 'score';
          }
        }
      }
    }

    /*
     * None of the transitions had a specific criteria so the branching is just
     * based on the howToChooseAmongAvailablePaths field.
     */
    if (transitionLogic.howToChooseAmongAvailablePaths === 'workgroupId') {
      return 'workgroup ID';
    } else if (transitionLogic.howToChooseAmongAvailablePaths === 'random') {
      return 'random assignment';
    }
  }

  /**
   * Get the previous node
   * @param nodeId get the node id that comes before this one
   * @return the node id that comes before
   */
  getPreviousNodeId(nodeId) {
    const flattenedNodeIds = this.getFlattenedProjectAsNodeIds();
    const indexOfNodeId = flattenedNodeIds.indexOf(nodeId);
    if (indexOfNodeId !== -1) {
      const indexOfPreviousNodeId = indexOfNodeId - 1;
      return flattenedNodeIds[indexOfPreviousNodeId];
    }
    return null;
  }

  setProjectScriptFilename(scriptFilename) {
    this.project.script = scriptFilename;
  }

  getProjectScriptFilename() {
    if (this.project != null && this.project.script != null) {
      return this.project.script;
    }
    return null;
  }

  /**
   * Check if a node has rubrics.
   * @param nodeId The node id of the node.
   * @return Whether the node has rubrics authored on it.
   */
  nodeHasRubric(nodeId) {
    return this.getNumberOfRubricsByNodeId(nodeId) > 0;
  }

  /**
   * Copy a component and insert it into the step
   * @param nodeId we are copying a component in this node
   * @param componentIds the components to copy
   * @param insertAfterComponentId Which component to place the new components
   * after. If this is null, we will put the new components at the beginning.
   * @return an array of the new components
   */
  copyComponentAndInsert(nodeId, componentIds, insertAfterComponentId) {
    const node = this.getNodeById(nodeId);
    const newComponents = [];
    const newComponentIds = [];
    for (const componentId of componentIds) {
      const newComponent = this.copyComponent(nodeId, componentId, newComponentIds);
      newComponents.push(newComponent);
      newComponentIds.push(newComponent.id);
    }

    let insertPosition = 0;
    if (insertAfterComponentId == null) {
      insertPosition = 0; // place the new components at the beginning
    } else {
      insertPosition =
        this.getComponentPositionByNodeIdAndComponentId(nodeId, insertAfterComponentId) + 1;
    }

    for (const newComponent of newComponents) {
      node.components.splice(insertPosition, 0, newComponent);
      insertPosition += 1;
    }
    return newComponents;
  }

  /**
   * Copy a component
   * @param nodeId the node id
   * @param componentId the compnent id
   * @param componentIdsToSkip component ids that we can't use for our new
   * component
   * @return a new component object
   */
  copyComponent(nodeId, componentId, componentIdsToSkip) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    const newComponent = this.UtilService.makeCopyOfJSONObject(component);
    newComponent.id = this.getUnusedComponentId(componentIdsToSkip);
    return newComponent;
  }

  /**
   * Import components from a project. Also import asset files that are
   * referenced in any of those components.
   * @param components an array of component objects that we are importing
   * @param importProjectId the id of the project we are importing from
   * @param nodeId the node we are adding the components to
   * @param insertAfterComponentId insert the components after this component id
   * @return an array of the new components
   */
  importComponents(components, importProjectId, nodeId, insertAfterComponentId) {
    const newComponents = [];
    const newComponentIds = [];
    for (const component of components) {
      const newComponent = this.UtilService.makeCopyOfJSONObject(component);
      let newComponentId = newComponent.id;
      if (this.isComponentIdUsed(newComponentId)) {
        newComponentId = this.getUnusedComponentId(newComponentIds);
        newComponent.id = newComponentId;
      }
      newComponents.push(newComponent);
      newComponentIds.push(newComponentId);
    }

    /*
     * Make the request to import the components. This will copy the asset files
     * and change file names if necessary. If an asset file with the same
     * name exists in both projects we will check if their content is the
     * same. If the content is the same we don't need to copy the file. If
     * the content is different, we need to make a copy of the file with a
     * new name and change all the references in the steps to use the new
     * name.
     */
    return this.http
      .post(this.ConfigService.getConfigParam('importStepsURL'), {
        steps: angular.toJson(newComponents),
        fromProjectId: importProjectId,
        toProjectId: this.ConfigService.getConfigParam('projectId')
      })
      .toPromise()
      .then((newComponents: any) => {
        const node = this.getNodeById(nodeId);
        let insertPosition = 0;
        if (insertAfterComponentId == null) {
          insertPosition = 0;
        } else {
          insertPosition =
            this.getComponentPositionByNodeIdAndComponentId(nodeId, insertAfterComponentId) + 1;
        }
        for (const newComponent of newComponents) {
          node.components.splice(insertPosition, 0, newComponent);
          insertPosition += 1;
        }
        return newComponents;
      });
  }

  /**
   * Delete a component from a node
   * @param nodeId the node id containing the node
   * @param componentId the component id
   */
  deleteComponent(nodeId, componentId) {
    const node = this.getNodeById(nodeId);
    const components = node.components;
    for (let c = 0; c < components.length; c++) {
      if (components[c].id === componentId) {
        components.splice(c, 1);
        break;
      }
    }
  }

  deleteTransition(node, transition) {
    const nodeTransitions = node.transitionLogic.transitions;
    const index = nodeTransitions.indexOf(transition);
    if (index > -1) {
      nodeTransitions.splice(index, 1);
    }
    if (nodeTransitions.length <= 1) {
      // these settings only apply when there are multiple transitions
      node.transitionLogic.howToChooseAmongAvailablePaths = null;
      node.transitionLogic.whenToChoosePath = null;
      node.transitionLogic.canChangePath = null;
      node.transitionLogic.maxPathsVisitable = null;
    }
  }

  /**
   * Get the branch path letter
   * @param nodeId get the branch path letter for this node if it is in a branch
   * @return the branch path letter for the node if it is in a branch
   */
  getBranchPathLetter(nodeId) {
    return this.nodeIdToBranchPathLetter[nodeId];
  }

  /**
   * Set the node into the project by replacing the existing node with the
   * given node id
   * @param nodeId the node id of the node
   * @param node the node object
   */
  setNode(nodeId, node) {
    for (let n = 0; n < this.project.nodes.length; n++) {
      const tempNode = this.project.nodes[n];
      if (tempNode.id == nodeId) {
        this.project.nodes[n] = node;
      }
    }
    for (let i = 0; i < this.project.inactiveNodes.length; i++) {
      const tempNode = this.project.inactiveNodes[i];
      if (tempNode.id == nodeId) {
        this.project.inactiveNodes[i] = node;
      }
    }
    this.idToNode[nodeId] = node;
  }

  getIdToNode() {
    return this.idToNode;
  }

  turnOnSaveButtonForAllComponents(node) {
    for (const component of node.components) {
      const service = this.upgrade.$injector.get(component.type + 'Service');
      if (service.componentUsesSaveButton()) {
        component.showSaveButton = true;
      }
    }
  }

  turnOffSaveButtonForAllComponents(node) {
    for (const component of node.components) {
      const service = this.upgrade.$injector.get(component.type + 'Service');
      if (service.componentUsesSaveButton()) {
        component.showSaveButton = false;
      }
    }
  }

  checkPotentialStartNodeIdChangeThenSaveProject() {
    this.checkPotentialStartNodeIdChange();
    return this.saveProject();
  }

  checkPotentialStartNodeIdChange() {
    const firstLeafNodeId = this.getFirstLeafNodeId();
    if (firstLeafNodeId == null) {
      this.setStartNodeId('');
    } else {
      const currentStartNodeId = this.getStartNodeId();
      if (currentStartNodeId != firstLeafNodeId) {
        this.setStartNodeId(firstLeafNodeId);
      }
    }
  }

  /**
   * Remove the node from the active nodes.
   * If the node is a group node, also remove its children.
   * @param nodeId the node to remove
   * @returns the node that was removed
   */
  removeNodeFromActiveNodes(nodeId) {
    let nodeRemoved = null;
    const activeNodes = this.project.nodes;
    for (let a = 0; a < activeNodes.length; a++) {
      const activeNode = activeNodes[a];
      if (activeNode.id === nodeId) {
        activeNodes.splice(a, 1);
        nodeRemoved = activeNode;
        if (activeNode.type === 'group') {
          this.removeChildNodesFromActiveNodes(activeNode);
        }
        break;
      }
    }
    return nodeRemoved;
  }

  /**
   * Move the child nodes of a group from the active nodes.
   * @param node The group node.
   */
  removeChildNodesFromActiveNodes(node) {
    for (const childId of node.ids) {
      this.removeNodeFromActiveNodes(childId);
    }
  }

  /**
   * Move an active node to the inactive nodes array.
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  moveToInactive(node, nodeIdToInsertAfter) {
    if (this.isActive(node.id)) {
      this.removeNodeFromActiveNodes(node.id);
      this.addInactiveNodeInsertAfter(node, nodeIdToInsertAfter);
    }
  }

  /**
   * Add the node to the inactive nodes array.
   * @param node the node to move
   * @param nodeIdToInsertAfter place the node after this
   */
  addInactiveNodeInsertAfter(node, nodeIdToInsertAfter = null) {
    this.clearTransitionsFromNode(node);
    if (this.isNodeIdToInsertTargetNotSpecified(nodeIdToInsertAfter)) {
      this.insertNodeAtBeginningOfInactiveNodes(node);
    } else {
      this.insertNodeAfterInactiveNode(node, nodeIdToInsertAfter);
    }
    if (node.type === 'group') {
      this.inactiveGroupNodes.push(node.id);
      this.addGroupChildNodesToInactive(node);
    } else {
      this.inactiveStepNodes.push(node.id);
    }
  }

  clearTransitionsFromNode(node) {
    if (node.transitionLogic != null) {
      node.transitionLogic.transitions = [];
    }
  }

  insertNodeAtBeginningOfInactiveNodes(node) {
    this.project.inactiveNodes.splice(0, 0, node);
  }

  insertNodeAfterInactiveNode(node, nodeIdToInsertAfter) {
    const inactiveNodes = this.getInactiveNodes();
    for (let i = 0; i < inactiveNodes.length; i++) {
      if (inactiveNodes[i].id === nodeIdToInsertAfter) {
        const parentGroup = this.getParentGroup(nodeIdToInsertAfter);
        if (parentGroup != null) {
          this.insertNodeAfterInGroups(node.id, nodeIdToInsertAfter);
          this.insertNodeAfterInTransitions(node, nodeIdToInsertAfter);
        }
        inactiveNodes.splice(i + 1, 0, node);
      }
    }
  }

  isNodeIdToInsertTargetNotSpecified(nodeIdToInsertTarget) {
    return [null, 'inactiveNodes', 'inactiveSteps', 'inactiveGroups'].includes(
      nodeIdToInsertTarget
    );
  }

  /**
   * Move the node from active to inside an inactive group
   * @param node the node to move
   * @param nodeIdToInsertInside place the node inside this
   */
  moveFromActiveToInactiveInsertInside(node, nodeIdToInsertInside) {
    this.removeNodeFromActiveNodes(node.id);
    this.addInactiveNodeInsertInside(node, nodeIdToInsertInside);
  }

  /**
   * Move the node from inactive to inside an inactive group
   * @param node the node to move
   * @param nodeIdToInsertInside place the node inside this
   */
  moveFromInactiveToInactiveInsertInside(node, nodeIdToInsertInside) {
    this.removeNodeFromInactiveNodes(node.id);
    if (this.isGroupNode(node.id)) {
      /*
       * remove the group's child nodes from our data structures so that we can
       * add them back in later
       */
      for (const childId of node.ids) {
        const childNode = this.getNodeById(childId);
        const inactiveNodesIndex = this.project.inactiveNodes.indexOf(childNode);
        if (inactiveNodesIndex != -1) {
          this.project.inactiveNodes.splice(inactiveNodesIndex, 1);
        }
        const inactiveStepNodesIndex = this.inactiveStepNodes.indexOf(childNode);
        if (inactiveStepNodesIndex != -1) {
          this.inactiveStepNodes.splice(inactiveStepNodesIndex, 1);
        }
      }
    }
    this.addInactiveNodeInsertInside(node, nodeIdToInsertInside);
  }

  addInactiveNodeInsertInside(node, nodeIdToInsertInside = null) {
    this.clearTransitionsFromNode(node);
    if (this.isNodeIdToInsertTargetNotSpecified(nodeIdToInsertInside)) {
      this.insertNodeAtBeginningOfInactiveNodes(node);
    } else {
      this.insertNodeInsideInactiveNode(node, nodeIdToInsertInside);
    }
    if (node.type === 'group') {
      this.inactiveGroupNodes.push(node.id);
      this.addGroupChildNodesToInactive(node);
    } else {
      this.inactiveStepNodes.push(node.id);
    }
  }

  insertNodeInsideInactiveNode(node, nodeIdToInsertInside) {
    const inactiveNodes = this.getInactiveNodes();
    const inactiveGroupNodes = this.getInactiveGroupNodes();
    for (const inactiveGroup of inactiveGroupNodes) {
      if (nodeIdToInsertInside === inactiveGroup.id) {
        this.insertNodeInsideOnlyUpdateTransitions(node.id, nodeIdToInsertInside);
        this.insertNodeInsideInGroups(node.id, nodeIdToInsertInside);
        for (let i = 0; i < inactiveNodes.length; i++) {
          if (inactiveNodes[i].id === nodeIdToInsertInside) {
            inactiveNodes.splice(i + 1, 0, node);
          }
        }
      }
    }
  }

  moveInactiveNodeToInactiveSection(node, nodeIdToInsertAfter) {
    this.removeNodeFromInactiveNodes(node.id);
    this.addInactiveNodeInsertAfter(node, nodeIdToInsertAfter);
  }

  addNodeToGroup(node, group) {
    if (this.isGroupHasNode(group)) {
      this.insertAfterLastNode(node, group);
    } else {
      this.insertAsFirstNode(node, group);
    }
  }

  isGroupHasNode(group) {
    return group.ids.length != 0;
  }

  getLastNodeInGroup(group) {
    const lastNodeId = group.ids[group.ids.length - 1];
    return this.idToNode[lastNodeId];
  }

  insertAsFirstNode(node, group) {
    this.insertNodeInsideOnlyUpdateTransitions(node.id, group.id);
    this.insertNodeInsideInGroups(node.id, group.id);
  }

  insertAfterLastNode(node, group) {
    const lastNode = this.getLastNodeInGroup(group);
    this.insertNodeAfterInTransitions(node, lastNode.id);
    this.insertNodeAfterInGroups(node.id, lastNode.id);
  }

  createNodeAndAddToLocalStorage(nodeTitle) {
    const node = this.createNode(nodeTitle);
    this.setIdToNode(node.id, node);
    this.addNode(node);
    this.applicationNodes.push(node);
    return node;
  }

  getLibraryProjects() {
    return this.http
      .get(this.ConfigService.getConfigParam('getLibraryProjectsURL'))
      .toPromise()
      .then((projects) => {
        return projects;
      });
  }

  sortAndFilterUniqueLibraryProjects(libraryProjects) {
    const flatProjectList = libraryProjects
      .map((grade) => {
        return grade.children;
      })
      .flat();
    return this.filterUniqueProjects(flatProjectList).sort(this.sortByProjectIdDescending);
  }

  filterUniqueProjects(projects) {
    const uniqueProjects = [];
    const filteredProjects = {};
    for (const project of projects) {
      if (filteredProjects[project.id] == null) {
        filteredProjects[project.id] = project;
        uniqueProjects.push(project);
      }
    }
    return uniqueProjects;
  }

  sortByProjectIdDescending(project1, project2) {
    if (project1.id > project2.id) {
      return -1;
    } else {
      return 1;
    }
  }

  getAutomatedAssessmentProjectId(): number {
    return this.ConfigService.getConfigParam('automatedAssessmentProjectId') || -1;
  }

  getNodeIdsAndComponentIds(nodeId) {
    const nodeIdAndComponentIds = [];
    const node = this.getNodeById(nodeId);
    for (const component of node.components) {
      const nodeIdAndComponentId = {
        nodeId: nodeId,
        componentId: component.id
      };
      nodeIdAndComponentIds.push(nodeIdAndComponentId);
    }
    return nodeIdAndComponentIds;
  }

  /**
   * Get the branch letter in the node position string if the node is in a branch path
   * @param nodeId the node id we want the branch letter for
   * @return the branch letter in the node position if the node is in a branch path
   */
  getBranchLetter(nodeId) {
    const nodePosition = this.getNodePositionById(nodeId);
    const branchLetterRegex = /.*([A-Z])/;
    const match = branchLetterRegex.exec(nodePosition);
    if (match != null) {
      return match[1];
    }
    return null;
  }

  componentChanged(): void {
    this.componentChangedSource.next();
  }

  nodeChanged(doParseProject: boolean = false): void {
    this.nodeChangedSource.next(doParseProject);
  }

  refreshProject() {
    this.refreshProjectSource.next();
  }

  scrollToBottomOfPage() {
    this.scrollToBottomOfPageSource.next();
  }

  addTeacherRemovalConstraint(node: any, periodId: number) {
    const lockConstraint = {
      id: this.UtilService.generateKey(),
      action: 'makeThisNodeNotVisitable',
      targetId: node.id,
      removalConditional: 'any',
      removalCriteria: [
        {
          name: 'teacherRemoval',
          params: {
            periodId: periodId
          }
        }
      ]
    };
    this.addConstraintToNode(node, lockConstraint);
  }

  removeTeacherRemovalConstraint(node: any, periodId: number) {
    node.constraints = node.constraints.filter((constraint) => {
      return !(
        constraint.action === 'makeThisNodeNotVisitable' &&
        constraint.targetId === node.id &&
        constraint.removalCriteria[0].name === 'teacherRemoval' &&
        constraint.removalCriteria[0].params.periodId === periodId
      );
    });
  }

  openWISELinkChooser({ projectId, nodeId, componentId, target }): any {
    const stateParams = {
      projectId: projectId,
      nodeId: nodeId,
      componentId: componentId,
      target: target
    };
    return this.upgrade.$injector.get('$mdDialog').show({
      templateUrl: 'wise5/authoringTool/wiseLink/wiseLinkAuthoring.html',
      controller: 'WISELinkAuthoringController',
      controllerAs: 'wiseLinkAuthoringController',
      $stateParams: stateParams,
      clickOutsideToClose: true,
      escapeToClose: true
    });
  }

  /**
   * Saves the project to Config.saveProjectURL and returns commit history promise.
   * if Config.saveProjectURL or Config.projectId are undefined, does not save and returns null
   */
  saveProject(): any {
    if (!this.ConfigService.getConfigParam('canEditProject')) {
      this.broadcastNotAllowedToEditThisProject();
      return null;
    }
    this.broadcastSavingProject();
    this.cleanupBeforeSave();
    this.project.metadata.authors = this.getUniqueAuthors(
      this.addCurrentUserToAuthors(this.getAuthors())
    );
    return this.http
      .post(
        this.ConfigService.getConfigParam('saveProjectURL'),
        angular.toJson(this.project, false)
      )
      .toPromise()
      .then((response: any) => {
        this.handleSaveProjectResponse(response);
      });
  }

  getAuthors(): any[] {
    return this.project.metadata.authors ? this.project.metadata.authors : [];
  }

  addCurrentUserToAuthors(authors: any[]): any[] {
    let userInfo = this.ConfigService.getMyUserInfo();
    if (this.ConfigService.isClassroomMonitor()) {
      userInfo = {
        id: userInfo.userIds[0],
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        username: userInfo.username
      };
    }
    authors.push(userInfo);
    return authors;
  }

  getUniqueAuthors(authors = []): any[] {
    const idToAuthor = {};
    const uniqueAuthors = [];
    for (const author of authors) {
      if (idToAuthor[author.id] == null) {
        uniqueAuthors.push(author);
        idToAuthor[author.id] = author;
      }
    }
    return uniqueAuthors;
  }

  handleSaveProjectResponse(response: any): any {
    if (response.status === 'error') {
      if (response.messageCode === 'notSignedIn') {
        this.broadcastNotLoggedInProjectNotSaved();
        this.SessionService.forceLogOut();
      } else if (response.messageCode === 'notAllowedToEditThisProject') {
        this.broadcastNotAllowedToEditThisProject();
      } else if (response.messageCode === 'errorSavingProject') {
        this.broadcastErrorSavingProject();
      }
    } else {
      this.broadcastProjectSaved();
    }
    return response;
  }

  /**
   * Perform any necessary cleanup before we save the project.
   * For example we need to remove the checked field in the inactive node
   * objects.
   */
  cleanupBeforeSave() {
    this.getActiveNodes().forEach((activeNode) => {
      this.cleanupNode(activeNode);
    });
    this.getInactiveNodes().forEach((inactiveNode) => {
      this.cleanupNode(inactiveNode);
    });
  }

  /**
   * Remove any fields that are used temporarily for display purposes like when
   * the project is loaded in the authoring tool and grading tool
   * @param node The node object.
   */
  cleanupNode(node) {
    delete node.checked;
    delete node.hasWork;
    delete node.hasAlert;
    delete node.hasNewAlert;
    delete node.isVisible;
    delete node.completionStatus;
    delete node.score;
    delete node.hasScore;
    delete node.maxScore;
    delete node.hasMaxScore;
    delete node.scorePct;
    delete node.order;
    delete node.show;

    if (node.components != null) {
      // activity node does not have components but step node does
      node.components.forEach((component) => {
        this.cleanupComponent(component);
      });
    }
  }

  /**
   * Remove any fields that are used temporarily for display purposes like when
   * the project is loaded in the authoring tool and grading tool
   * @param component The component object.
   */
  cleanupComponent(component) {
    delete component.checked;
    delete component.hasWork;
  }

  /**
   * Insert the node after the given node id in the group's array of children ids
   * @param nodeIdToInsert the node id we want to insert
   * @param nodeIdToInsertAfter the node id we want to insert after
   */
  insertNodeAfterInGroups(nodeIdToInsert, nodeIdToInsertAfter) {
    const groupNodes = this.getGroupNodes();
    if (groupNodes != null) {
      for (const group of groupNodes) {
        this.insertNodeAfterInGroup(group, nodeIdToInsert, nodeIdToInsertAfter);
      }
    }
    const inactiveGroupNodes = this.getInactiveGroupNodes();
    if (inactiveGroupNodes != null) {
      for (const inactiveGroup of inactiveGroupNodes) {
        this.insertNodeAfterInGroup(inactiveGroup, nodeIdToInsert, nodeIdToInsertAfter);
      }
    }
  }

  /**
   * Insert a node id in a group after another specific node id.
   * @param group A group object.
   * @param nodeIdToInsert The node id to insert.
   * @param nodeIdToInsertAfter The node id to insert after.
   * @returns {boolean} Whether we inserted the node id.
   */
  insertNodeAfterInGroup(group, nodeIdToInsert, nodeIdToInsertAfter) {
    const ids = group.ids;
    if (ids != null) {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (nodeIdToInsertAfter === id) {
          ids.splice(i + 1, 0, nodeIdToInsert);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Update the transitions to handle inserting a node after another node.
   * The two nodes must either both be steps or both be activities.
   * @param nodeToInsert the node to insert
   * @param nodeIdToInsertAfter the node id to insert after
   */
  insertNodeAfterInTransitions(nodeToInsert, nodeIdToInsertAfter) {
    const nodeToInsertAfter = this.getNodeById(nodeIdToInsertAfter);
    if (nodeToInsert.type != nodeToInsertAfter.type) {
      throw 'Error: insertNodeAfterInTransitions() nodes are not the same type';
    }
    if (nodeToInsertAfter.transitionLogic == null) {
      nodeToInsertAfter.transitionLogic = {
        transitions: []
      };
    }
    if (nodeToInsert.transitionLogic == null) {
      nodeToInsert.transitionLogic = {
        transitions: []
      };
    }
    if (this.isGroupNode(nodeToInsert.id)) {
      this.updateChildrenTransitionsInAndOutOfGroup(nodeToInsert, nodeIdToInsertAfter);
    }
    this.copyTransitions(nodeToInsertAfter, nodeToInsert);
    if (nodeToInsert.transitionLogic.transitions.length == 0) {
      this.copyParentTransitions(nodeIdToInsertAfter, nodeToInsert);
    }
    const transitionObject = {
      to: nodeToInsert.id
    };
    nodeToInsertAfter.transitionLogic.transitions = [transitionObject];
    this.updateBranchPathTakenConstraints(nodeToInsert, nodeIdToInsertAfter);
  }

  /*
   * Copy the transitions from nodeId's parent and add to node's transitions.
   * @param nodeId Copy the transition of this nodeId's parent.
   * @param node The node to add transitions to.
   */
  copyParentTransitions(nodeId, node) {
    const parentGroupId = this.getParentGroupId(nodeId);
    if (parentGroupId != 'group0') {
      const parentTransitions = this.getTransitionsByFromNodeId(parentGroupId);
      for (let parentTransition of parentTransitions) {
        const newTransition = {};
        const toNodeId = parentTransition.to;
        if (this.isGroupNode(toNodeId)) {
          const startId = this.getGroupStartId(toNodeId);
          if (startId == null || startId == '') {
            (<any>newTransition).to = toNodeId;
          } else {
            (<any>newTransition).to = startId;
          }
        }
        node.transitionLogic.transitions.push(newTransition);
      }
    }
  }

  copyTransitions(previousNode, node) {
    const transitionsJSONString = angular.toJson(previousNode.transitionLogic.transitions);
    const transitionsCopy = angular.fromJson(transitionsJSONString);
    node.transitionLogic.transitions = transitionsCopy;
  }

  /**
   * If the previous node was in a branch path, we will also put the
   * inserted node into the branch path.
   * @param node The node that is in the branch path.
   * @param nodeId The node we are adding to the branch path.
   */
  updateBranchPathTakenConstraints(node, nodeId) {
    this.removeBranchPathTakenNodeConstraintsIfAny(node.id);
    const branchPathTakenConstraints = this.getBranchPathTakenConstraintsByNodeId(nodeId);
    for (let branchPathTakenConstraint of branchPathTakenConstraints) {
      const newConstraint = {
        id: this.getNextAvailableConstraintIdForNodeId(node.id),
        action: branchPathTakenConstraint.action,
        targetId: node.id,
        removalCriteria: this.UtilService.makeCopyOfJSONObject(
          branchPathTakenConstraint.removalCriteria
        )
      };
      this.addConstraintToNode(node, newConstraint);
    }
  }

  /**
   * Update a node's branchPathTaken constraint's fromNodeId and toNodeId
   * @param node update the branch path taken constraints in this node
   * @param currentFromNodeId the current from node id
   * @param currentToNodeId the current to node id
   * @param newFromNodeId the new from node id
   * @param newToNodeId the new to node id
   */
  updateBranchPathTakenConstraint(
    node,
    currentFromNodeId,
    currentToNodeId,
    newFromNodeId,
    newToNodeId
  ) {
    for (let constraint of node.constraints) {
      for (let removalCriterion of constraint.removalCriteria) {
        if (removalCriterion.name === 'branchPathTaken') {
          const params = removalCriterion.params;
          if (params.fromNodeId === currentFromNodeId && params.toNodeId === currentToNodeId) {
            params.fromNodeId = newFromNodeId;
            params.toNodeId = newToNodeId;
          }
        }
      }
    }
  }

  /**
   * Insert a node into a group
   * @param nodeIdToInsert the node id to insert
   * @param nodeIdToInsertInside the node id of the group we will insert into
   */
  insertNodeInsideInGroups(nodeIdToInsert, nodeIdToInsertInside) {
    const group = this.getNodeById(nodeIdToInsertInside);
    if (group != null) {
      const ids = group.ids;
      if (ids != null) {
        ids.splice(0, 0, nodeIdToInsert);
        group.startId = nodeIdToInsert;
      }
    }
  }

  /**
   * Update the transitions to handle inserting a node as the first step in a group.
   * @param nodeIdToInsert node id that we will insert
   * @param nodeIdToInsertInside the node id of the group we are inserting into
   */
  insertNodeInsideOnlyUpdateTransitions(nodeIdToInsert, nodeIdToInsertInside) {
    if (!this.isGroupNode(nodeIdToInsertInside)) {
      throw 'Error: insertNodeInsideOnlyUpdateTransitions() second parameter must be a group';
    }

    const nodeToInsert = this.getNodeById(nodeIdToInsert);
    nodeToInsert.transitionLogic.transitions = [];
    this.removeBranchPathTakenNodeConstraintsIfAny(nodeIdToInsert);

    if (this.isGroupNode(nodeIdToInsert)) {
      this.updateChildrenTransitionsInAndOutOfGroup(nodeToInsert);
    }

    /*
     * the node will become the first node in the group. this means we need to update any nodes
     * that point to the old start id and make them point to the node we are inserting.
     */
    const group = this.getNodeById(nodeIdToInsertInside);
    const startId = group.startId;
    this.updateTransitionsToStartId(startId, nodeIdToInsert);
    this.updateStepTransitionsToGroup(nodeIdToInsertInside, nodeIdToInsert);
    this.createTransitionFromNodeToInsertToOldStartNode(startId, nodeToInsert);
    const transitions = this.getTransitionsByFromNodeId(nodeIdToInsert);
    if (transitions.length == 0) {
      this.inheritParentTransitions(nodeIdToInsertInside, nodeToInsert);
    }
  }

  /**
   * Copy the transitions from the parent to the node we are inserting.
   * @param nodeIdToInsertInside
   * @param nodeToInsert
   */
  inheritParentTransitions(nodeIdToInsertInside, nodeToInsert) {
    const parentTransitions = this.getTransitionsByFromNodeId(nodeIdToInsertInside);
    for (let parentTransition of parentTransitions) {
      const toNodeId = parentTransition.to;
      if (this.isGroupNode(toNodeId)) {
        const nextGroup = this.getNodeById(toNodeId);
        const startId = nextGroup.startId;
        if (startId == null || startId == '') {
          this.addToTransition(nodeToInsert, toNodeId);
        } else {
          this.addToTransition(nodeToInsert, startId);
        }
      } else {
        this.addToTransition(nodeToInsert, toNodeId);
      }
    }
  }

  /*
   * Create a transition from the node we are inserting to the node that
   * was the start node.
   * @param startId
   * @param nodeToInsert
   */
  createTransitionFromNodeToInsertToOldStartNode(startId, nodeToInsert) {
    const startNode = this.getNodeById(startId);
    if (startNode != null) {
      const transitions = this.getTransitionsByFromNodeId(nodeToInsert.id);
      const transitionObject = {
        to: startId
      };
      transitions.push(transitionObject);
    }
  }

  /*
   * Update all the transitions that point to the group and change
   * them to point to the new start id
   */
  updateStepTransitionsToGroup(nodeIdToInsertInside, nodeIdToInsert) {
    const nodesThatTransitionToGroup = this.getNodesByToNodeId(nodeIdToInsertInside);
    for (let nodeThatTransitionsToGroup of nodesThatTransitionToGroup) {
      if (!this.isGroupNode(nodeThatTransitionsToGroup.id)) {
        this.updateToTransition(nodeThatTransitionsToGroup, nodeIdToInsertInside, nodeIdToInsert);
      }
    }
  }

  updateTransitionsToStartId(startId, nodeIdToInsert) {
    const nodesThatTransitionToStartId = this.getNodesByToNodeId(startId);
    for (let nodeThatTransitionToStartId of nodesThatTransitionToStartId) {
      this.updateToTransition(nodeThatTransitionToStartId, startId, nodeIdToInsert);
    }
  }

  /**
   * Add a transition to a node
   * @param node the node we are adding a transition to
   * @param toNodeId the node id we going to transition to
   * @param criteria (optional) a criteria object specifying
   * what needs to be satisfied in order to use this transition
   */
  addToTransition(node, toNodeId, criteria = null) {
    if (node != null) {
      if (node.transitionLogic == null) {
        node.transitionLogic = {};
      }
      if (node.transitionLogic.transitions == null) {
        node.transitionLogic.transitions = [];
      }
      const transition = {};
      (<any>transition).to = toNodeId;
      if (criteria != null) {
        (<any>transition).criteria = criteria;
      }
      node.transitionLogic.transitions.push(transition);
    }
  }

  /**
   * Update the to value of aa transition
   * @param node the node to update
   * @param oldToNodeId the previous to node id
   * @param newToNodeId the new to node id
   */
  updateToTransition(node, oldToNodeId, newToNodeId) {
    if (node != null) {
      if (node.transitionLogic == null) {
        node.transitionLogic = {};
      }

      if (node.transitionLogic.transitions == null) {
        node.transitionLogic.transitions = [];
      }

      const transitions = node.transitionLogic.transitions;
      for (let transition of transitions) {
        if (transition != null) {
          const toNodeId = transition.to;
          if (oldToNodeId === toNodeId) {
            transition.to = newToNodeId;
          }
        }
      }
    }
  }

  /**
   * Get the next available group id
   * @returns the next available group id
   */
  getNextAvailableGroupId() {
    const groupIds = this.getGroupIds();
    let largestGroupIdNumber = null;
    for (let groupId of groupIds) {
      // get the number from the group id e.g. the number of 'group2' would be 2
      let groupIdNumber = groupId.replace('group', '');

      // make sure the number is an actual number
      if (!isNaN(groupIdNumber)) {
        groupIdNumber = parseInt(groupIdNumber);

        // update the largest group id number if necessary
        if (largestGroupIdNumber == null) {
          largestGroupIdNumber = groupIdNumber;
        } else if (groupIdNumber > largestGroupIdNumber) {
          largestGroupIdNumber = groupIdNumber;
        }
      }
    }

    const nextAvailableGroupId = 'group' + (largestGroupIdNumber + 1);
    return nextAvailableGroupId;
  }

  /**
   * Get all the group ids
   * @returns an array with all the group ids
   */
  getGroupIds() {
    const groupIds = [];
    const groupNodes = this.groupNodes;
    for (let group of groupNodes) {
      if (group != null) {
        const groupId = group.id;
        if (groupId != null) {
          groupIds.push(groupId);
        }
      }
    }

    const inactiveGroupNodes = this.getInactiveGroupNodes();
    for (let inactiveGroup of inactiveGroupNodes) {
      if (inactiveGroup != null) {
        const inactiveGroupId = inactiveGroup.id;
        if (inactiveGroupId != null) {
          groupIds.push(inactiveGroupId);
        }
      }
    }
    return groupIds;
  }

  /**
   * Get the next available node id
   * @param nodeIdsToSkip (optional) An array of additional node ids to not
   * use. This parameter is used in cases where we are creating multiple new
   * nodes at once.
   * Example
   * We ask for two new node ids by calling getNextAvailableNodeId() twice.
   * The first time it returns "node10".
   * If we ask the second time without actually creating and adding node10,
   * it will return "node10" again. If we provide "node10" in the
   * nodeIdsToSkip, then getNextAvailableNodeId() will properly return to us
   * "node11".
   * @returns the next available node id
   */
  getNextAvailableNodeId(nodeIdsToSkip = []) {
    let largestNodeIdNumber = -1;
    for (const nodeId of this.getNodeIds()
      .concat(this.getInactiveNodeIds())
      .concat(nodeIdsToSkip)) {
      const nodeIdNumber = parseInt(nodeId.replace('node', ''));
      if (nodeIdNumber > largestNodeIdNumber) {
        largestNodeIdNumber = nodeIdNumber;
      }
    }
    return 'node' + (largestNodeIdNumber + 1);
  }

  /**
   * Get all the node ids from inactive steps
   * @returns an array with all the inactive node ids
   */
  getInactiveNodeIds() {
    return this.project.inactiveNodes.map((node) => {
      return node.id;
    });
  }

  /**
   * Copy the node with the specified nodeId
   * @param nodeId the node id to copy
   * @return copied node
   */
  copyNode(nodeId) {
    const node = this.getNodeById(nodeId);
    const nodeCopy = this.UtilService.makeCopyOfJSONObject(node);
    nodeCopy.id = this.getNextAvailableNodeId();
    nodeCopy.transitionLogic = {}; // clear transition logic
    nodeCopy.constraints = []; // clear constraints

    const newComponentIds = [];
    for (let component of nodeCopy.components) {
      const newComponentId = this.getUnusedComponentId(newComponentIds);
      newComponentIds.push(newComponentId);
      component.id = newComponentId;
    }
    return nodeCopy;
  }

  /**
   * Delete a node from the project and update transitions.
   *
   * If we are deleting the project start node id, we will need to change it to the
   * next logical node id that will be used as the project start.
   *
   * @param nodeId the node id to delete from the project. It can be a step or an activity.
   */
  deleteNode(nodeId) {
    const parentGroup = this.getParentGroup(nodeId);
    if (parentGroup != null && parentGroup.startId === nodeId) {
      this.setGroupStartIdToNextChildId(parentGroup);
    }
    if (this.isProjectStartNodeIdOrContainsProjectStartNodeId(nodeId)) {
      this.updateProjectStartNodeIdToNextLogicalNode(nodeId);
    }
    if (this.isGroupNode(nodeId)) {
      this.removeChildNodes(nodeId);
    }
    this.removeNodeIdFromTransitions(nodeId);
    this.removeNodeIdFromGroups(nodeId);
    this.removeNodeIdFromNodes(nodeId);
  }

  updateProjectStartNodeIdToNextLogicalNode(nodeId) {
    if (this.isGroupNode(nodeId)) {
      this.updateProjectStartNodeIdToNextLogicalNodeForRemovingGroup(nodeId);
    } else {
      this.updateProjectStartNodeIdToNextLogicalNodeForRemovingStep(nodeId);
    }
  }

  /**
   * Set the startNodeId of the specified group to the first node of the next group.
   * If the next group doesn't have any nodes, startNodeId should point
   * to the next group.
   */
  updateProjectStartNodeIdToNextLogicalNodeForRemovingGroup(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    if (transitions.length == 0) {
      this.setStartNodeId('group0');
    } else {
      let nextNodeId = transitions[0].to;
      if (this.isGroupNode(nextNodeId)) {
        const nextGroupStartId = this.getGroupStartId(nextNodeId);
        if (nextGroupStartId == null) {
          this.setStartNodeId(nextNodeId);
        } else {
          this.setStartNodeId(nextGroupStartId);
        }
      } else {
        this.setStartNodeId(nextNodeId);
      }
    }
  }

  /**
   * Set the startNodeId to the next node in the transitions.
   * If there are no transitions, set it to the parent group of the node.
   */
  updateProjectStartNodeIdToNextLogicalNodeForRemovingStep(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    const parentGroupId = this.getParentGroupId(nodeId);
    if (transitions.length == 0) {
      this.setStartNodeId(parentGroupId);
    } else {
      let nextNodeId = transitions[0].to;
      if (this.isNodeInGroup(nextNodeId, parentGroupId)) {
        this.setStartNodeId(nextNodeId);
      } else {
        this.setStartNodeId(this.getParentGroupId(nodeId));
      }
    }
  }

  setGroupStartIdToNextChildId(group) {
    let hasSetNewStartId = false;
    const transitions = this.getTransitionsByFromNodeId(group.startId);
    if (transitions.length > 0) {
      const transition = transitions[0];
      const toNodeId = transition.to;
      if (this.isNodeInGroup(toNodeId, group.id)) {
        group.startId = toNodeId;
        hasSetNewStartId = true;
      }
    }

    if (!hasSetNewStartId) {
      group.startId = '';
    }
  }

  removeChildNodes(groupId) {
    const group = this.getNodeById(groupId);
    for (let i = 0; i < group.ids.length; i++) {
      const childId = group.ids[i];
      this.removeNodeIdFromTransitions(childId);
      this.removeNodeIdFromGroups(childId);
      this.removeNodeIdFromNodes(childId);
      i--; // so it won't skip the next element
    }
  }

  isProjectStartNodeIdOrContainsProjectStartNodeId(nodeId) {
    return (
      this.getStartNodeId() === nodeId ||
      (this.isGroupNode(nodeId) && this.containsStartNodeId(nodeId))
    );
  }

  containsStartNodeId(groupId) {
    const group = this.getNodeById(groupId);
    const projectStartNodeId = this.getStartNodeId();
    for (let childId of group.ids) {
      if (childId === projectStartNodeId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Update the transitions to handle removing a node
   * @param nodeId the node id to remove
   */
  removeNodeIdFromTransitions(nodeId) {
    const nodeToRemove = this.getNodeById(nodeId);
    const nodesByToNodeId = this.getNodesByToNodeId(nodeId);

    const nodeToRemoveTransitionLogic = nodeToRemove.transitionLogic;
    let nodeToRemoveTransitions = [];

    if (nodeToRemoveTransitionLogic != null && nodeToRemoveTransitionLogic.transitions != null) {
      nodeToRemoveTransitions = nodeToRemoveTransitionLogic.transitions;
    }

    const parentIdOfNodeToRemove = this.getParentGroupId(nodeId);
    const parentGroup = this.getNodeById(parentIdOfNodeToRemove);

    // update the start id if we are removing the start node of a group
    if (parentGroup != null) {
      const parentGroupStartId = parentGroup.startId;
      if (parentGroupStartId != null) {
        if (parentGroupStartId === nodeId) {
          // the node we are removing is the start node

          if (nodeToRemoveTransitions != null && nodeToRemoveTransitions.length > 0) {
            for (let nodeToRemoveTransition of nodeToRemoveTransitions) {
              if (nodeToRemoveTransition != null) {
                const toNodeId = nodeToRemoveTransition.to;
                if (toNodeId != null) {
                  /*
                   * we need to check that the to node id is in the
                   * same group. some transitions point to a node id
                   * in the next group which we would not want to use
                   * for the start id.
                   */
                  if (this.getParentGroupId(toNodeId) == parentIdOfNodeToRemove) {
                    // set the new start id
                    parentGroup.startId = toNodeId;
                  }
                }
              }
            }
          } else {
            // there are no transitions so we will have an empty start id
            parentGroup.startId = '';
          }
        }
      }
    }

    for (let n = 0; n < nodesByToNodeId.length; n++) {
      const node = nodesByToNodeId[n];
      if (node != null) {
        const parentIdOfFromNode = this.getParentGroupId(node.id);
        const transitionLogic = node.transitionLogic;

        if (transitionLogic != null) {
          const transitions = transitionLogic.transitions;
          for (let t = 0; t < transitions.length; t++) {
            const transition = transitions[t];
            if (nodeId === transition.to) {
              // we have found the transition to the node we are removing

              // copy the transitions from the node we are removing
              let transitionsCopy = angular.toJson(nodeToRemoveTransitions);
              transitionsCopy = angular.fromJson(transitionsCopy);

              /*
               * if the parent from group is different than the parent removing group
               * remove transitions that are to a node in a different group than
               * the parent removing group
               */

              if (parentIdOfFromNode != parentIdOfNodeToRemove) {
                for (let tc = 0; tc < transitionsCopy.length; tc++) {
                  const tempTransition = transitionsCopy[tc];
                  if (tempTransition != null) {
                    const tempToNodeId = tempTransition.to;
                    if (tempToNodeId != null) {
                      const parentIdOfToNode = this.getParentGroupId(tempToNodeId);
                      if (parentIdOfNodeToRemove != parentIdOfToNode) {
                        // remove the transition
                        transitionsCopy.splice(tc, 1);
                        tc--;
                      }
                    }
                  }
                }
              }

              if (this.isFirstNodeInBranchPath(nodeId)) {
                /*
                 * Get the node ids that have a branchPathTaken
                 * constraint from the before node and to the node
                 * we are removing. If there are any, we need to
                 * update the branchPathTaken constraint with the
                 * next nodeId that comes after the node we are
                 * removing.
                 */
                const nodeIdsInBranch = this.getNodeIdsInBranch(node.id, nodeId);

                if (nodeIdsInBranch != null) {
                  for (let nodeIdInBranch of nodeIdsInBranch) {
                    const nodeInBranch = this.getNodeById(nodeIdInBranch);
                    for (let transitionCopy of transitionsCopy) {
                      if (transitionCopy != null) {
                        const currentFromNodeId = node.id;
                        const currentToNodeId = nodeId;
                        const newFromNodeId = node.id;
                        const newToNodeId = transitionCopy.to;

                        /*
                         * change the branch path taken constraint by changing
                         * the toNodeId
                         */
                        this.updateBranchPathTakenConstraint(
                          nodeInBranch,
                          currentFromNodeId,
                          currentToNodeId,
                          newFromNodeId,
                          newToNodeId
                        );
                      }
                    }
                  }
                }
              } else if (this.isBranchPoint(nodeId)) {
                /*
                 * get all the branches that have the node we
                 * are removing as the start point
                 */
                const branches = this.getBranchesByBranchStartPointNodeId(nodeId);

                for (let branch of branches) {
                  if (branch != null) {
                    /*
                     * get the branch paths. these paths do not
                     * contain the start point or merge point.
                     */
                    const branchPaths = branch.branchPaths;

                    if (branchPaths != null) {
                      for (let branchPath of branchPaths) {
                        if (branchPath != null) {
                          const currentFromNodeId = nodeId;
                          const currentToNodeId = branchPath[0];
                          const newFromNodeId = node.id;
                          const newToNodeId = branchPath[0];
                          for (let branchPathNodeId of branchPath) {
                            const branchPathNode = this.getNodeById(branchPathNodeId);
                            this.updateBranchPathTakenConstraint(
                              branchPathNode,
                              currentFromNodeId,
                              currentToNodeId,
                              newFromNodeId,
                              newToNodeId
                            );
                          }
                        }
                      }
                    }
                  }
                }
              }

              // remove the transition to the node we are removing
              transitions.splice(t, 1);

              if (transitionsCopy != null) {
                let insertIndex = t;

                /*
                 * loop through all the transitions from the node we are removing
                 * and insert them into the transitions of the from node
                 * e.g.
                 * the node that comes before the node we are removing has these transitions
                 * "transitions": [
                 *     {
                 *         "to": "node4"
                 *     },
                 *     {
                 *         "to": "node6"
                 *     }
                 * ]
                 *
                 * we are removing node4. node4 has a transition to node5.
                 *
                 * the node that comes before the node we are removing now has these transitions
                 * "transitions": [
                 *     {
                 *         "to": "node5"
                 *     },
                 *     {
                 *         "to": "node6"
                 *     }
                 * ]
                 */
                for (let transitionCopy of transitionsCopy) {
                  if (!this.isTransitionExist(transitions, transitionCopy)) {
                    const toNodeId = transitionCopy.to;
                    if (
                      this.isApplicationNode(node.id) &&
                      this.isGroupNode(toNodeId) &&
                      this.hasGroupStartId(toNodeId)
                    ) {
                      this.addToTransition(node, this.getGroupStartId(toNodeId));
                    } else {
                      transitions.splice(insertIndex, 0, transitionCopy);
                      insertIndex++;
                    }
                  }
                }
              }
              t--;

              // check if the node we are moving is a group
              if (this.isGroupNode(nodeId)) {
                /*
                 * we are moving a group so we need to update transitions that
                 * go into the group
                 */
                const groupIdWeAreMoving = nodeId;
                const groupThatTransitionsToGroupWeAreMoving = node;
                this.updateChildrenTransitionsIntoGroupWeAreMoving(
                  groupThatTransitionsToGroupWeAreMoving,
                  groupIdWeAreMoving
                );
              }
            }
          }

          if (
            transitions.length === 0 &&
            parentIdOfNodeToRemove != 'group0' &&
            parentIdOfNodeToRemove != this.getParentGroupId(node.id)
          ) {
            /*
             * the from node no longer has any transitions so we will make it transition to the
             * parent of the node we are removing
             */
            this.addToTransition(node, parentIdOfNodeToRemove);
          }

          if (this.isBranchPoint(nodeId)) {
            /*
             * the node we are deleting is a branch point so we to
             * copy the transition logic to the node that comes
             * before it
             */
            node.transitionLogic = this.UtilService.makeCopyOfJSONObject(
              nodeToRemoveTransitionLogic
            );

            /*
             * set the transitions for the node that comes before
             * the one we are removing
             */
            node.transitionLogic.transitions = transitions;
          }
        }
      }
    }

    if (nodeToRemoveTransitionLogic != null) {
      nodeToRemoveTransitionLogic.transitions = [];
    }

    if (this.isGroupNode(nodeId)) {
      this.removeTransitionsOutOfGroup(nodeId);
    }
  }

  isTransitionExist(transitions: any[], transition: any) {
    for (const tempTransition of transitions) {
      if (tempTransition.from === transition.from && tempTransition.to === transition.to) {
        return true;
      }
    }
    return false;
  }

  /**
   * Remove the node id from all groups
   * @param nodeId the node id to remove
   */
  removeNodeIdFromGroups(nodeId) {
    for (const group of this.getGroupNodes()) {
      this.removeNodeIdFromGroup(group, nodeId);
    }
    for (const inactiveGroup of this.getInactiveGroupNodes()) {
      this.removeNodeIdFromGroup(inactiveGroup, nodeId);
    }
  }

  /**
   * Remove a node from a group.
   * If the node is a start node of the group, update the group's start node to
   * the next node in the group after removing.
   * @param group The group to remove from.
   * @param nodeId The node id to remove.
   */
  removeNodeIdFromGroup(group, nodeId) {
    const ids = group.ids;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (id === nodeId) {
        ids.splice(i, 1);
        if (id === group.startId) {
          this.shiftGroupStartNodeByOne(group);
        }
      }
    }
  }

  // TODO handle the case when the start node of the group is a branch point
  shiftGroupStartNodeByOne(group) {
    const transitionsFromStartNode = this.getTransitionsByFromNodeId(group.startId);
    if (transitionsFromStartNode.length > 0) {
      group.startId = transitionsFromStartNode[0].to;
    } else {
      group.startId = '';
    }
  }

  /**
   * Remove the node from the array of nodes
   * @param nodeId the node id to remove
   */
  removeNodeIdFromNodes(nodeId) {
    const nodes = this.project.nodes;
    for (let n = 0; n < nodes.length; n++) {
      const node = nodes[n];
      if (node != null) {
        if (nodeId === node.id) {
          nodes.splice(n, 1);
        }
      }
    }

    const inactiveNodes = this.project.inactiveNodes;
    if (inactiveNodes != null) {
      for (let i = 0; i < inactiveNodes.length; i++) {
        const inactiveNode = inactiveNodes[i];
        if (inactiveNode != null) {
          if (nodeId === inactiveNode.id) {
            inactiveNodes.splice(i, 1);
          }
        }
      }
    }

    this.idToNode[nodeId] = null;
  }

  /**
   * Remove the node from the inactive nodes array
   * @param nodeId the node to remove from the inactive nodes array
   */
  removeNodeIdFromInactiveNodes(nodeId) {
    const inactiveNodes = this.project.inactiveNodes;
    if (inactiveNodes != null) {
      for (let i = 0; i < inactiveNodes.length; i++) {
        const inactiveNode = inactiveNodes[i];
        if (inactiveNode != null) {
          const inactiveNodeId = inactiveNode.id;
          if (inactiveNodeId === nodeId) {
            inactiveNodes.splice(i, 1);
          }
        }
      }
    }
  }

  /**
   * Create a new component
   * @param nodeId the node id to create the component in
   * @param componentType the component type
   * @param insertAfterComponentId Insert the new compnent after the given
   * component id. If this argument is null, we will place the new component
   * in the first position.
   */
  createComponent(nodeId, componentType, insertAfterComponentId = null) {
    const node = this.getNodeById(nodeId);
    const service = this.upgrade.$injector.get(componentType + 'Service');
    const component = service.createComponent();
    if (service.componentHasWork()) {
      if (node.showSaveButton == false) {
        if (this.doesAnyComponentInNodeShowSubmitButton(node.id)) {
          component.showSaveButton = true;
        } else {
          node.showSaveButton = true;
        }
      }
    }
    this.addComponentToNode(node, component, insertAfterComponentId);
    return component;
  }

  /**
   * Returns true iff any component in the step generates work
   * @param nodeId the node id
   * @return whether any components in the step generates work
   */
  doesAnyComponentHaveWork(nodeId) {
    const node = this.getNodeById(nodeId);
    for (const component of node.components) {
      const service = this.upgrade.$injector.get(component.type + 'Service');
      if (service != null && service.componentHasWork()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if any of the components in the node are showing their submit button.
   * @param nodeId {string} The node id to check.
   * @return {boolean} Whether any of the components in the node show their submit button.
   */
  doesAnyComponentInNodeShowSubmitButton(nodeId) {
    const node = this.getNodeById(nodeId);
    for (const component of node.components) {
      if (component.showSubmitButton == true) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add the component to the node
   * @param node the node
   * @param component the component
   * @param insertAfterComponentId Insert the component after this given
   * component id. If this argument is null, we will place the new component
   * in the first position.
   */
  addComponentToNode(node, component, insertAfterComponentId) {
    if (insertAfterComponentId == null) {
      node.components.splice(0, 0, component);
    } else {
      // place the new component after the insertAfterComponentId

      // boolean flag for whether we have added the component yet
      let added = false;

      const components = node.components;
      for (let c = 0; c < components.length; c++) {
        const tempComponent = components[c];
        if (
          tempComponent != null &&
          tempComponent.id != null &&
          tempComponent.id == insertAfterComponentId
        ) {
          /*
           * we have found the component we want to add the new
           * one after
           */

          components.splice(c + 1, 0, component);
          added = true;
          break;
        }
      }

      if (!added) {
        /*
         * the component has not been added yet so we will just add
         * it at the end
         */
        node.components.push(component);
      }
    }
  }

  /**
   * TODO: Deprecated, should be removed; replaced by getMaxScoreForWorkgroupId in
   * StudentStatusService
   * Get the max score for the project. If the project contains branches, we
   * will only calculate the max score for a single path from the first node
   * to the last node in the project.
   * @returns the max score for the project or null if none of the components in the project
   * has max scores.
   */
  getMaxScore() {
    let maxScore = null;
    const startNodeId = this.getStartNodeId();

    // get all the paths in the project
    const allPaths = this.getAllPaths([], startNodeId);

    if (allPaths != null && allPaths.length > -1) {
      const firstPath = allPaths[0];
      for (let nodeId of firstPath) {
        const nodeMaxScore = this.getMaxScoreForNode(nodeId);
        if (nodeMaxScore != null) {
          if (maxScore == null) {
            maxScore = nodeMaxScore;
          } else {
            maxScore += nodeMaxScore;
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Set the max score for a component
   * @param nodeId set the max score from a component in this node
   * @param componentId set the max score from this component
   * @param maxScore set it to this maxScore
   */
  setMaxScoreForComponent(nodeId, componentId, maxScore) {
    if (nodeId != null && componentId != null && maxScore != null && typeof maxScore === 'number') {
      let component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        component.maxScore = maxScore;
      }
    }
  }

  hasGroupStartId(nodeId) {
    const startId = this.getGroupStartId(nodeId);
    return startId != null && startId != '';
  }

  /**
   * Update the transitions so that the fromGroup points to the newToGroup
   *
   * Before
   * fromGroup -> oldToGroup -> newToGroup
   *
   * After
   * fromGroup -> newToGroup
   * oldToGroup becomes dangling and has no transitions to or from it
   */
  updateTransitionsForExtractingGroup(fromGroupId, oldToGroupId, newToGroupId) {
    /*
     * make the transitions
     * fromGroup -> newToGroup
     */
    if (fromGroupId != null && oldToGroupId != null) {
      const fromGroup = this.getNodeById(fromGroupId);
      const oldToGroup = this.getNodeById(oldToGroupId);
      let newToGroup = null;
      let newToGroupStartId = null;

      if (newToGroupId != null) {
        newToGroup = this.getNodeById(newToGroupId);
      }

      if (newToGroup != null) {
        newToGroupStartId = newToGroup.startId;
      }

      if (fromGroup != null && oldToGroup != null) {
        const childIds = fromGroup.ids;

        // update the children of the from group to point to the new to group
        if (childIds != null) {
          for (let childId of childIds) {
            const child = this.getNodeById(childId);
            const transitions = this.getTransitionsByFromNodeId(childId);

            if (transitions != null) {
              for (let t = 0; t < transitions.length; t++) {
                const transition = transitions[t];
                if (transition != null) {
                  const toNodeId = transition.to;
                  if (toNodeId === oldToGroupId) {
                    // the transition is to the group
                    if (newToGroupId == null && newToGroupStartId == null) {
                      // there is no new to group so we will remove the transition
                      transitions.splice(t, 1);
                      t--;
                    } else {
                      // make the transition point to the new to group
                      transition.to = newToGroupId;
                    }
                  } else if (this.isNodeInGroup(toNodeId, oldToGroupId)) {
                    // the transition is to a node in the group
                    if (newToGroupId == null && newToGroupStartId == null) {
                      // there is no new to group so we will remove the transition
                      transitions.splice(t, 1);
                      t--;
                    } else if (newToGroupStartId == null || newToGroupStartId == '') {
                      // make the transition point to the new to group
                      transition.to = newToGroupId;
                    } else {
                      // make the transition point to the new group start id
                      transition.to = newToGroupStartId;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /*
     * remove the transitions from the oldToGroup
     */
    if (oldToGroupId != null && newToGroupId != null) {
      const oldToGroup = this.getNodeById(oldToGroupId);
      if (oldToGroup != null) {
        const childIds = oldToGroup.ids;

        // remove the transitions from the old to group that point to the new to group
        if (childIds != null) {
          for (let childId of childIds) {
            const child = this.getNodeById(childId);
            const transitions = this.getTransitionsByFromNodeId(childId);
            if (transitions != null) {
              for (let t = 0; t < transitions.length; t++) {
                const transition = transitions[t];
                if (transition != null) {
                  const toNodeId = transition.to;
                  if (toNodeId === newToGroupId) {
                    // the transition is to the group so we will remove it
                    transitions.splice(t, 1);
                    t--;
                  } else if (this.isNodeInGroup(toNodeId, newToGroupId)) {
                    // the transition is to a node in the group so we will remove it
                    transitions.splice(t, 1);
                    t--;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Update the transitions so that the fromGroup points to the newToGroup
   *
   * Before
   * fromGroup -> oldToGroup
   * newToGroup is dangling and has no transitions to or from it
   *
   * After
   * fromGroup -> newToGroup -> oldToGroup
   */
  updateTransitionsForInsertingGroup(fromGroupId, oldToGroupIds, newToGroupId) {
    let fromGroup = null;
    let newToGroup = null;
    if (fromGroupId != null) {
      fromGroup = this.getNodeById(fromGroupId);
    }

    if (newToGroupId != null) {
      newToGroup = this.getNodeById(newToGroupId);
    }

    /*
     * make the transitions that point to the old group now point
     * to the new group
     * fromGroup -> newToGroup
     */
    if (fromGroup != null && newToGroup != null) {
      const childIds = fromGroup.ids;
      const newToGroupStartId = newToGroup.startId;
      if (childIds != null) {
        for (let childId of childIds) {
          const child = this.getNodeById(childId);

          // get the transitions from the child
          const transitions = this.getTransitionsByFromNodeId(childId);

          if (transitions == null || transitions.length == 0) {
            /*
             * the child does not have any transitions so we will make it
             * point to the new group
             */
            if (newToGroupStartId == null || newToGroupStartId == '') {
              this.addToTransition(child, newToGroupId);
            } else {
              this.addToTransition(child, newToGroupStartId);
            }
          } else if (transitions != null) {
            for (let transition of transitions) {
              if (transition != null) {
                const toNodeId = transition.to;
                if (oldToGroupIds != null) {
                  for (let oldToGroupId of oldToGroupIds) {
                    if (toNodeId === oldToGroupId) {
                      /*
                       * the transition is to the group so we will update the transition
                       * to the new group
                       */
                      transition.to = newToGroupId;
                    } else if (this.isNodeInGroup(toNodeId, oldToGroupId)) {
                      /*
                       * the transition is to a node in the old group so we will update
                       * the transition to point to the new group
                       */
                      if (newToGroupStartId == null || newToGroupStartId == '') {
                        transition.to = newToGroupId;
                      } else {
                        transition.to = newToGroupStartId;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /*
     * make the steps that do not have a transition now point to the old
     * group
     * newToGroup -> oldToGroup
     */
    if (newToGroup != null) {
      const childIds = newToGroup.ids;
      if (childIds != null) {
        for (let childId of childIds) {
          const child = this.getNodeById(childId);
          const transitions = this.getTransitionsByFromNodeId(childId);

          if (transitions == null || transitions.length == 0) {
            if (oldToGroupIds != null) {
              for (let oldToGroupId of oldToGroupIds) {
                const oldToGroup = this.getNodeById(oldToGroupId);
                if (oldToGroup != null) {
                  const oldToGroupStartId = oldToGroup.startId;
                  const transition = {};
                  let toNodeId = '';
                  if (oldToGroupStartId == null) {
                    // there is no start node id so we will just point to the group
                    toNodeId = oldToGroup;
                  } else {
                    // there is a start node id so we will point to it
                    toNodeId = oldToGroupStartId;
                  }

                  // create the transition from the child to the old group
                  this.addToTransition(child, toNodeId);
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Update the child transitions because we are moving a group. We will
   * update the transitions into and out of the group in the location
   * we are extracting the group from and also in the location we are
   * inserting the group into.
   * @param node the group we are moving
   * @param nodeId we will put the group after this node id
   */
  updateChildrenTransitionsInAndOutOfGroup(node, nodeId = null) {
    let transitionsBefore = null;

    // get the group nodes that point to the group we are moving
    const previousGroupNodes = this.getGroupNodesByToNodeId(node.id);

    // get all the transitions from the group we are moving
    const transitionsAfter = this.getTransitionsByFromNodeId(node.id);

    let extracted = false;

    /*
     * extract the group we are moving by updating the transitions of the
     * from group and the new to group. also remove the transitions from the
     * group we are moving.
     */

    for (let previousGroupNode of previousGroupNodes) {
      if (transitionsAfter == null || transitionsAfter.length == 0) {
        // the group we are moving does not have any transitions

        /*
         * remove the transitions to the group we are moving and make
         * new transitions from the from group to the new to group
         */
        this.updateTransitionsForExtractingGroup(previousGroupNode.id, node.id, null);
        extracted = true;
      } else {
        // the group we are moving has transitions

        // make the previous group point to the new to group
        for (let transitionAfter of transitionsAfter) {
          if (transitionAfter != null) {
            const toNodeId = transitionAfter.to;

            /*
             * remove the transitions to the group we are moving and make
             * new transitions from the from group to the new to group
             */
            this.updateTransitionsForExtractingGroup(previousGroupNode.id, node.id, toNodeId);
            extracted = true;
          }
        }
      }
    }

    if (!extracted) {
      /*
       * we have not removed the transitions yet because the group
       * we are moving does not have any groups before it
       */

      if (transitionsAfter != null) {
        // remove the transitions from the group we are moving
        for (let transitionAfter of transitionsAfter) {
          if (transitionAfter != null) {
            const toNodeId = transitionAfter.to;

            // remove the transitions to the group we are moving
            this.updateTransitionsForExtractingGroup(null, node.id, toNodeId);
            extracted = true;
          }
        }
      }
    }

    let inserted = false;

    /*
     * create the transitions from the from group to the group we are moving
     * and the transitions from the group we are moving to the old to group
     */
    if (nodeId != null) {
      // get the transitions from the previous group to the next group
      const transitionsAfter = this.getTransitionsByFromNodeId(nodeId);

      for (let transitionAfter of transitionsAfter) {
        if (transitionAfter != null) {
          const toNodeId = transitionAfter.to;

          /*
           * create the transitions that traverse from the from group
           * to the group we are moving. also create the transitions
           * that traverse from the group we are moving to the old
           * to group.
           */
          this.updateTransitionsForInsertingGroup(nodeId, [toNodeId], node.id);
          inserted = true;
        }
      }
    }

    if (!inserted) {
      /*
       * we have not inserted the transitions yet because there were no
       * previous group transitions
       */

      if (nodeId == null) {
        /*
         * the previous node id is null which means there was no previous
         * group. this means the group we are inserting will become the
         * first group. this happens when the group we are moving
         * is moved inside the root (group0).
         */

        const startGroupId = this.getStartGroupId();

        if (startGroupId != null) {
          // get the start group for the whole project (group0)
          const startGroup = this.getNodeById(startGroupId);

          if (startGroup != null) {
            const firstGroupId = startGroup.startId;

            /*
             * create the transitions that traverse from the group
             * we are moving to the previous first activity.
             */
            this.updateTransitionsForInsertingGroup(nodeId, [firstGroupId], node.id);
          }
        }
      } else {
        /*
         * we have not inserted the group yet because the from group doesn't
         * have a group after it
         */

        /*
         * create the transitions that traverse from the from group
         * to the group we are moving.
         */
        this.updateTransitionsForInsertingGroup(nodeId, null, node.id);
      }
    }
  }

  /**
   * Remove the node from the inactive nodes array
   * @param nodeId the node to remove
   * @returns the node that was removed
   */
  removeNodeFromInactiveNodes(nodeId) {
    let node = null;
    if (nodeId != null) {
      let parentGroup = this.getParentGroup(nodeId);
      if (parentGroup != null) {
        this.removeChildFromParent(nodeId);
      }

      let inactiveNodes = this.project.inactiveNodes;
      if (inactiveNodes != null) {
        for (let i = 0; i < inactiveNodes.length; i++) {
          let inactiveNode = inactiveNodes[i];
          if (inactiveNode != null) {
            if (nodeId === inactiveNode.id) {
              node = inactiveNode;
              inactiveNodes.splice(i, 1);
              break;
            }
          }
        }
      }
      this.removeNodeFromInactiveStepNodes(nodeId);
      this.removeNodeFromInactiveGroupNodes(nodeId);
    }
    return node;
  }

  /**
   * Remove the child node from the parent group.
   * @param nodeId The child node to remove from the parent.
   */
  removeChildFromParent(nodeId) {
    let parentGroup = this.getParentGroup(nodeId);
    if (parentGroup != null) {
      // Remove the child from the parent
      for (let i = 0; i < parentGroup.ids.length; i++) {
        let childId = parentGroup.ids[i];
        if (nodeId == childId) {
          parentGroup.ids.splice(i, 1);
          break;
        }
      }
      if (nodeId == parentGroup.startId) {
        /*
         * The child we removed was the start id of the group so we
         * will update the start id.
         */
        let startIdUpdated = false;
        let transitions = this.getTransitionsByFromNodeId(nodeId);
        if (
          transitions != null &&
          transitions.length > 0 &&
          transitions[0] != null &&
          transitions[0].to != null
        ) {
          parentGroup.startId = transitions[0].to;
          startIdUpdated = true;
        }
        if (!startIdUpdated && parentGroup.ids.length > 0) {
          parentGroup.startId = parentGroup.ids[0];
          startIdUpdated = true;
        }
        if (!startIdUpdated) {
          parentGroup.startId = '';
        }
      }
    }
  }

  /**
   * Remove the node from the inactive step nodes array.
   * @param nodeId The node id of the node we want to remove from the
   * inactive step nodes array.
   */
  removeNodeFromInactiveStepNodes(nodeId) {
    for (let i = 0; i < this.inactiveStepNodes.length; i++) {
      if (nodeId == this.inactiveStepNodes[i].id) {
        this.inactiveStepNodes.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Remove the node from the inactive group nodes array.
   * @param nodeId The node id of the group we want to remove from the
   * inactive group nodes array.
   */
  removeNodeFromInactiveGroupNodes(nodeId) {
    for (let i = 0; i < this.inactiveGroupNodes.length; i++) {
      if (nodeId == this.inactiveGroupNodes[i].id) {
        this.inactiveGroupNodes.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Move the node to the active nodes array. If the node is a group node,
   * also move all of its children to active.
   */
  moveToActive(node) {
    if (!this.isActive(node.id)) {
      this.removeNodeFromInactiveNodes(node.id);
      this.addNode(node);
      if (this.isGroupNode(node.id)) {
        for (const childId of node.ids) {
          this.addNode(this.removeNodeFromInactiveNodes(childId));
        }
      }
    }
  }

  /**
   * Add a group's cthild nodes to the inactive nodes.
   * @param node The group node.
   */
  addGroupChildNodesToInactive(node) {
    for (const childId of node.ids) {
      const childNode = this.getNodeById(childId);
      this.project.inactiveNodes.push(childNode);
      this.inactiveStepNodes.push(childNode);
    }
  }

  /**
   * Remove transition from nodes in the specified group that go out of the group
   * @param nodeId the group id
   */
  removeTransitionsOutOfGroup(groupId) {
    const group = this.getNodeById(groupId);
    for (const childId of group.ids) {
      const transitions = this.getTransitionsByFromNodeId(childId);
      for (let t = 0; t < transitions.length; t++) {
        const transition = transitions[t];
        const parentGroupId = this.getParentGroupId(transition.to);
        if (parentGroupId != groupId) {
          // this is a transition that goes out of the specified group
          transitions.splice(t, 1);
          t--; // so it won't skip the next element
        }
      }
    }
  }

  /*
   * Update the step transitions that point into the group we are moving
   * For example
   * group1 has children node1 and node2 (node2 transitions to node3)
   * group2 has children node3 and node4 (node4 transitions to node5)
   * group3 has children node5 and node6
   * if we move group2 after group3 we will need to change the
   * transition from node2 to node3 and make node2 transition to node5
   * the result will be
   * group1 has children node1 and node2 (node2 transitions to node5)
   * group3 has children node5 and node6
   * group2 has children node3 and node4 (node4 transitions to node5)
   * note: the (node4 transition to node5) will be removed later
   * when is called removeTransitionsOutOfGroup
   * note: when group2 is added in a later function call, we will add
   * the node6 to node3 transition
   * @param groupThatTransitionsToGroupWeAreMoving the group object
   * that transitions to the group we are moving. we may need to update
   * the transitions of this group's children.
   * @param groupIdWeAreMoving the group id of the group we are moving
   */
  updateChildrenTransitionsIntoGroupWeAreMoving(
    groupThatTransitionsToGroupWeAreMoving,
    groupIdWeAreMoving
  ) {
    if (groupThatTransitionsToGroupWeAreMoving != null && groupIdWeAreMoving != null) {
      const group = this.getNodeById(groupIdWeAreMoving);
      if (group != null) {
        // get all the nodes that have a transition to the node we are removing
        const nodesByToNodeId = this.getNodesByToNodeId(groupIdWeAreMoving);

        // get the transitions of the node we are removing
        const nodeToRemoveTransitionLogic = group.transitionLogic;
        let nodeToRemoveTransitions = [];

        if (
          nodeToRemoveTransitionLogic != null &&
          nodeToRemoveTransitionLogic.transitions != null
        ) {
          nodeToRemoveTransitions = nodeToRemoveTransitionLogic.transitions;
        }

        if (nodeToRemoveTransitions.length == 0) {
          /*
           * The group we are moving is the last group in the project
           * and does not have any transitions. We will loop through
           * all the nodes that transition into this group and remove
           * those transitions.
           */

          // get child ids of the group that comes before the group we are moving
          const childIds = groupThatTransitionsToGroupWeAreMoving.ids;

          if (childIds != null) {
            for (let childId of childIds) {
              const transitionsFromChild = this.getTransitionsByFromNodeId(childId);
              if (transitionsFromChild != null) {
                for (let tfc = 0; tfc < transitionsFromChild.length; tfc++) {
                  const transitionFromChild = transitionsFromChild[tfc];
                  if (transitionFromChild != null) {
                    const toNodeId = transitionFromChild.to;
                    const toNodeIdParentGroupId = this.getParentGroupId(toNodeId);

                    if (groupIdWeAreMoving === toNodeIdParentGroupId) {
                      // the transition is to a child in the group we are moving
                      transitionsFromChild.splice(tfc, 1);

                      /*
                       * move the counter back one because we have just removed an
                       * element from the array
                       */
                      tfc--;
                    }
                  }
                }
              }
            }
          }
        } else if (nodeToRemoveTransitions.length > 0) {
          // get the first group that comes after the group we are removing
          const firstNodeToRemoveTransition = nodeToRemoveTransitions[0];
          const firstNodeToRemoveTransitionToNodeId = firstNodeToRemoveTransition.to;

          if (this.isGroupNode(firstNodeToRemoveTransitionToNodeId)) {
            // get the group that comes after the group we are moving
            const groupNode = this.getNodeById(firstNodeToRemoveTransitionToNodeId);

            // get child ids of the group that comes before the group we are moving
            const childIds = groupThatTransitionsToGroupWeAreMoving.ids;

            if (childIds != null) {
              for (let childId of childIds) {
                const transitionsFromChild = this.getTransitionsByFromNodeId(childId);
                if (transitionsFromChild != null) {
                  for (let transitionFromChild of transitionsFromChild) {
                    if (transitionFromChild != null) {
                      const toNodeId = transitionFromChild.to;

                      // get the parent group id of the toNodeId
                      const toNodeIdParentGroupId = this.getParentGroupId(toNodeId);

                      if (groupIdWeAreMoving === toNodeIdParentGroupId) {
                        // the transition is to a child in the group we are moving

                        if (groupNode.startId == null) {
                          // change the transition to point to the after group
                          transitionFromChild.to = firstNodeToRemoveTransitionToNodeId;
                        } else {
                          // change the transition to point to the start id of the after group
                          transitionFromChild.to = groupNode.startId;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Get an unused component id
   * @param componentIdsToSkip (optional) An array of additional component ids
   * to skip. This is used when we are creating multiple new components. There
   * is avery small chance that we create duplicate component ids that aren't
   * already in the project. We avoid this problem by using this parameter.
   * Example
   * We want to create two new components. We first generate a new component
   * id for the first new component for example "1234567890". Then we generate
   * a new component id for the second new component and pass in
   * ["1234567890"] as componentIdsToSkip because the new "1234567890"
   * component hasn't actually been added to the project yet.
   * @return a component id that isn't already being used in the project
   */
  getUnusedComponentId(componentIdsToSkip = []) {
    // we want to make an id with 10 characters
    const idLength = 10;

    let newComponentId = this.UtilService.generateKey(idLength);

    // check if the component id is already used in the project
    if (this.isComponentIdUsed(newComponentId)) {
      /*
       * the component id is already used in the project so we need to
       * try generating another one
       */
      let alreadyUsed = true;

      /*
       * keep trying to generate a new component id until we have found
       * one that isn't already being used
       */
      while (!alreadyUsed) {
        newComponentId = this.UtilService.generateKey(idLength);

        // check if the id is already being used in the project
        alreadyUsed = this.isComponentIdUsed(newComponentId);

        if (componentIdsToSkip != null && componentIdsToSkip.indexOf(newComponentId) != -1) {
          /*
           * the new component is in the componentIdsToSkip so it has
           * already been used
           */
          alreadyUsed = true;
        }
      }
    }
    return newComponentId;
  }

  /**
   * Check if the component id is already being used in the project
   * @param componentId check if this component id is already being used in
   * the project
   * @return whether the component id is already being used in the project
   */
  isComponentIdUsed(componentId) {
    for (const node of this.project.nodes.concat(this.project.inactiveNodes)) {
      if (node.components != null) {
        for (const component of node.components) {
          if (componentId === component.id) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Get the next available constraint id for a node
   * @param nodeId get the next available constraint id for this node
   * e.g. node8Constraint2
   * @return the next available constraint id for the node
   */
  getNextAvailableConstraintIdForNodeId(nodeId) {
    let nextAvailableConstraintId = null;
    if (nodeId != null) {
      const usedConstraintIds = [];
      const node = this.getNodeById(nodeId);
      if (node != null) {
        const constraints = node.constraints;
        if (constraints != null) {
          for (let constraint of constraints) {
            if (constraint != null) {
              const constraintId = constraint.id;
              usedConstraintIds.push(constraintId);
            }
          }
        }
      }

      let foundNextAvailableConstraintId = false;
      let counter = 1;

      while (!foundNextAvailableConstraintId) {
        const potentialConstraintId = nodeId + 'Constraint' + counter;
        if (usedConstraintIds.indexOf(potentialConstraintId) == -1) {
          nextAvailableConstraintId = potentialConstraintId;
          foundNextAvailableConstraintId = true;
        } else {
          counter++;
        }
      }
    }
    return nextAvailableConstraintId;
  }

  /**
   * Get the node ids in the branch by looking for nodes that have branch
   * path taken constraints with the given fromNodeId and toNodeId
   * @param fromNodeId the from node id
   * @param toNodeId the to node id
   * @return an array of nodes that are in the branch path
   */
  getNodeIdsInBranch(fromNodeId, toNodeId) {
    const nodeIdsInBranch = [];
    for (const node of this.getNodes()) {
      if (this.hasBranchPathTakenConstraint(node, fromNodeId, toNodeId)) {
        nodeIdsInBranch.push(node.id);
      }
    }
    this.orderNodeIds(nodeIdsInBranch);
    return nodeIdsInBranch;
  }

  /**
   * Order the node ids so that they show up in the same order as in the
   * project.
   * @param constraints An array of node ids.
   * @return An array of ordered node ids.
   */
  orderNodeIds(nodeIds) {
    let orderedNodeIds = this.getFlattenedProjectAsNodeIds();
    return nodeIds.sort(this.nodeIdsComparatorGenerator(orderedNodeIds));
  }

  /**
   * Create the node ids comparator function that is used for sorting an
   * array of node ids.
   * @param orderedNodeIds An array of node ids in the order in which they
   * show up in the project.
   * @return A comparator that orders node ids in the order in which they show
   * up in the project.
   */
  nodeIdsComparatorGenerator(orderedNodeIds) {
    return function (nodeIdA, nodeIdB) {
      let nodeIdAIndex = orderedNodeIds.indexOf(nodeIdA);
      let nodeIdBIndex = orderedNodeIds.indexOf(nodeIdB);
      if (nodeIdAIndex < nodeIdBIndex) {
        return -1;
      } else if (nodeIdAIndex > nodeIdBIndex) {
        return 1;
      }
      return 0;
    };
  }

  /**
   * Check if a node has a branch path taken constraint
   * @param node the node to check
   * @param fromNodeId the from node id of the branch path taken
   * @param toNodeId the to node id of the branch path taken
   * @return whether the node has a branch path taken constraint with the
   * given from node id and to node id
   */
  hasBranchPathTakenConstraint(node, fromNodeId, toNodeId) {
    const constraints = node.constraints;
    if (constraints != null) {
      for (let constraint of constraints) {
        for (let removalCriterion of constraint.removalCriteria) {
          if (removalCriterion.name == 'branchPathTaken') {
            const params = removalCriterion.params;
            if (params.fromNodeId == fromNodeId && params.toNodeId == toNodeId) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Remove all branch path taken constraints from a node.
   * @param nodeId Remove the constraints from this node.
   */
  removeBranchPathTakenNodeConstraintsIfAny(nodeId) {
    const node = this.getNodeById(nodeId);
    const constraints = node.constraints;
    if (constraints != null) {
      for (let c = 0; c < constraints.length; c++) {
        const constraint = constraints[c];
        const removalCriteria = constraint.removalCriteria;
        for (let removalCriterion of removalCriteria) {
          if (removalCriterion.name == 'branchPathTaken') {
            constraints.splice(c, 1);
            c--; // update the counter so we don't skip over the next element
          }
        }
      }
    }
  }

  /**
   * @param nodeId Get the branch path taken constraints from this node.
   * @return {Array} An array of branch path taken constraints from the node.
   */
  getBranchPathTakenConstraintsByNodeId(nodeId) {
    const branchPathTakenConstraints = [];
    const node = this.getNodeById(nodeId);
    const constraints = node.constraints;
    if (constraints != null) {
      for (let constraint of constraints) {
        for (let removalCriterion of constraint.removalCriteria) {
          if (removalCriterion.name == 'branchPathTaken') {
            branchPathTakenConstraints.push(constraint);
            break;
          }
        }
      }
    }
    return branchPathTakenConstraints;
  }

  /**
   * Check if a node is the first node in a branch path
   * @param nodeId the node id
   * @return whether the node is the first node in a branch path
   */
  isFirstNodeInBranchPath(nodeId) {
    for (const node of this.getNodes()) {
      if (node.transitionLogic != null && node.transitionLogic.transitions != null) {
        for (const transition of node.transitionLogic.transitions) {
          if (transition.to === nodeId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  addSpace(space) {
    if (this.project.spaces == null) {
      this.project.spaces = [];
    }
    if (!this.isSpaceExists(space.id)) {
      this.project.spaces.push(space);
      this.saveProject();
    }
  }

  removeSpace(id) {
    let spaces = this.getSpaces();
    for (let s = 0; s < spaces.length; s++) {
      if (spaces[s].id == id) {
        spaces.splice(s, 1);
        this.saveProject();
        return;
      }
    }
  }

  getFeaturedProjectIcons() {
    return this.http
      .get(this.ConfigService.getConfigParam('featuredProjectIconsURL'))
      .toPromise()
      .then((data) => {
        return data;
      });
  }

  setFeaturedProjectIcon(projectIcon) {
    const isCustom = false;
    return this.setProjectIcon(projectIcon, isCustom);
  }

  setCustomProjectIcon(projectIcon) {
    const isCustom = true;
    return this.setProjectIcon(projectIcon, isCustom);
  }

  setProjectIcon(projectIcon, isCustom) {
    return this.http
      .post(this.ConfigService.getConfigParam('projectIconURL'), {
        projectId: this.ConfigService.getProjectId(),
        projectIcon: projectIcon,
        isCustom: isCustom
      })
      .toPromise()
      .then((result) => {
        return result;
      });
  }

  broadcastSavingProject() {
    this.savingProjectSource.next();
  }

  broadcastErrorSavingProject() {
    this.errorSavingProjectSource.next();
  }

  broadcastNotAllowedToEditThisProject() {
    this.notAllowedToEditThisProjectSource.next();
  }

  broadcastNotLoggedInProjectNotSaved() {
    this.notLoggedInProjectNotSavedSource.next();
  }

  broadcastProjectSaved() {
    this.projectSavedSource.next();
  }
}

'use strict';

import * as $ from 'jquery';
import * as angular from 'angular';
import { ConfigService } from './configService';
import { UtilService } from './utilService';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionService } from './sessionService';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ProjectService {
  achievements: any = [];
  activeConstraints: any;
  additionalProcessingFunctionsMap: any = {};
  allPaths: string[] = [];
  applicationNodes: any;
  branchesCache: any;
  componentServices: any = {};
  filters: any[] = [{ name: 'all', label: 'All' }];
  flattenedProjectAsNodeIds: any = null;
  groupNodes: any[];
  idToNode: any;
  idToOrder: any;
  inactiveGroupNodes: any[];
  inactiveStepNodes: any[];
  isNodeAffectedByConstraintResult: any = {};
  metadata: any;
  nodeCount: number = 0;
  nodeIdToNumber: any = {};
  nodeIdToIsInBranchPath: any = {};
  nodeIdsInAnyBranch: any = [];
  nodeIdToBranchPathLetter: any = {};
  project: any;
  rootNode: any = null;
  transitions: any;
  private projectChangedSource: Subject<any> = new Subject<any>();
  public projectChanged$: Observable<any> = this.projectChangedSource.asObservable();
  private snipImageSource: Subject<any> = new Subject<any>();
  public snipImage$: Observable<any> = this.snipImageSource.asObservable();

  constructor(
    protected upgrade: UpgradeModule,
    protected http: HttpClient,
    protected ConfigService: ConfigService,
    protected SessionService: SessionService,
    protected UtilService: UtilService
  ) {
    this.project = null;
    this.transitions = [];
    this.applicationNodes = [];
    this.inactiveStepNodes = [];
    this.inactiveGroupNodes = [];
    this.groupNodes = [];
    this.idToNode = {};
    this.metadata = {};
    this.activeConstraints = [];
    this.rootNode = null;
    this.idToOrder = {};
  }

  setProject(project) {
    this.project = project;
    this.parseProject();
  }

  clearProjectFields() {
    this.transitions = [];
    this.applicationNodes = [];
    this.inactiveStepNodes = [];
    this.inactiveGroupNodes = [];
    this.groupNodes = [];
    this.idToNode = {};
    this.metadata = {};
    this.activeConstraints = [];
    this.rootNode = null;
    this.idToOrder = {};
    this.nodeCount = 0;
    this.nodeIdToIsInBranchPath = {};
    this.nodeIdsInAnyBranch = [];
    this.achievements = [];
    this.clearBranchesCache();
  }

  getStyle() {
    return this.project.style;
  }

  getFilters() {
    return this.filters;
  }

  getProjectTitle() {
    const name = this.getProjectMetadata().title;
    return name ? name : 'A WISE Project (No name)';
  }

  setProjectTitle(projectTitle) {
    const metadata = this.getProjectMetadata();
    metadata.title = projectTitle;
  }

  getProjectMetadata() {
    return this.metadata ? this.metadata : {};
  }

  getNodes() {
    return this.project.nodes;
  }

  getChildNodeIdsById(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node.ids) {
      return node.ids;
    }
    return [];
  }

  getGroupNodes() {
    return this.groupNodes;
  }

  isNode(id) {
    for (const node of this.getNodes()) {
      if (node.id === id) {
        return true;
      }
    }
    return false;
  }

  addNode(node) {
    const existingNodes = this.project.nodes;
    let replaced = false;
    if (existingNodes != null) {
      for (let n = 0; n < existingNodes.length; n++) {
        const existingNode = existingNodes[n];
        if (existingNode.id === node.id) {
          existingNodes.splice(n, 1, node);
          replaced = true;
        }
      }
    }
    if (!replaced) {
      existingNodes.push(node);
    }
  }

  addApplicationNode(node) {
    const applicationNodes = this.applicationNodes;
    if (applicationNodes != null) {
      applicationNodes.push(node);
    }
  }

  addGroupNode(node) {
    const groupNodes = this.groupNodes;
    if (node != null && groupNodes != null) {
      groupNodes.push(node);
    }
  }

  addNodeToGroupNode(groupId, nodeId) {
    if (groupId != null && nodeId != null) {
      const group = this.getNodeById(groupId);
      if (group != null) {
        const groupChildNodeIds = group.ids;
        if (groupChildNodeIds != null) {
          if (groupChildNodeIds.indexOf(nodeId) === -1) {
            groupChildNodeIds.push(nodeId);
          }
        }
      }
    }
  }

  isGroupNode(id) {
    const node = this.getNodeById(id);
    return node != null && node.type == 'group';
  }

  isApplicationNode(id) {
    const node = this.getNodeById(id);
    return node != null && node.type !== 'group';
  }

  getGroups() {
    return this.groupNodes;
  }

  getInactiveGroupNodes() {
    return this.inactiveGroupNodes;
  }

  /**
   * Get the inactive step nodes. This will include the inactive steps that
   * are in an inactive group.
   * @return An array of inactive step nodes.
   */
  getInactiveStepNodes() {
    return this.inactiveStepNodes;
  }

  loadNodes(nodes) {
    for (const node of nodes) {
      const nodeId = node.id;
      const nodeType = node.type;
      const content = node.content;
      const constraints = node.constraints;

      if (content != null) {
        //node.content = this.injectAssetPaths(content);
      }

      this.setIdToNode(nodeId, node);
      this.addNode(node);

      if (nodeType === 'group') {
        this.addGroupNode(node);
      } else {
        this.addApplicationNode(node);
      }

      const groupId = node.groupId;
      if (groupId != null) {
        this.addNodeToGroupNode(groupId, nodeId);
      }

      if (constraints != null) {
        if (
          this.ConfigService.isPreview() == true &&
          this.ConfigService.getConfigParam('constraints') === false
        ) {
          /*
           * if we are in preview mode and constraints are set
           * to false, we will not add the constraints
           */
        } else {
          // all other cases we will add the constraints
          for (const constraint of constraints) {
            this.activeConstraints.push(constraint);
          }
        }
      }
    }
  }

  loadNodeIdsInAnyBranch(branches) {
    for (const branch of branches) {
      for (const branchPath of branch.branchPaths) {
        this.nodeIdsInAnyBranch = this.nodeIdsInAnyBranch.concat(branchPath);
      }
    }
  }

  parseProject() {
    this.clearProjectFields();
    this.instantiateDefaults();
    this.metadata = this.project.metadata;
    this.loadNodes(this.project.nodes);
    this.loadInactiveNodes(this.project.inactiveNodes);
    this.loadConstraints(this.project.constraints);
    this.rootNode = this.getRootNode(this.project.nodes[0].id);
    this.calculateNodeOrderOfProject();
    this.loadNodeIdsInAnyBranch(this.getBranches());
    this.calculateNodeNumbers();
    if (this.project.projectAchievements != null) {
      this.achievements = this.project.projectAchievements;
    }
    this.broadcastProjectChanged();
  }

  instantiateDefaults() {
    this.project.nodes = this.project.nodes ? this.project.nodes : [];
    this.project.inactiveNodes = this.project.inactiveNodes ? this.project.inactiveNodes : [];
    this.project.constraints = this.project.constraints ? this.project.constraints : [];
  }

  calculateNodeOrderOfProject() {
    this.calculateNodeOrder(this.rootNode);
  }

  calculateNodeOrder(node) {
    this.idToOrder[node.id] = { order: this.nodeCount };
    this.nodeCount++;
    if (this.isGroupNode(node.id)) {
      for (const childId of node.ids) {
        this.calculateNodeOrder(this.getNodeById(childId));
      }
    }
  }

  /**
   * Get the node order mappings of the project
   * @param project the project JSOn
   * @return an object containing the idToOrder mapping and also the array
   * of nodes
   */
  getNodeOrderOfProject(project) {
    const rootNode = this.getNodeById(project.startGroupId, project);
    const idToOrder = {
      nodeCount: 0
    };
    const stepNumber = '';
    const nodes = [];
    const importProjectIdToOrder = this.getNodeOrderOfProjectHelper(
      project,
      rootNode,
      idToOrder,
      stepNumber,
      nodes
    );
    delete importProjectIdToOrder.nodeCount;
    return {
      idToOrder: importProjectIdToOrder,
      nodes: nodes
    };
  }

  /**
   * Recursively traverse the project to calculate the node order and step numbers
   * @param project the project JSON
   * @param node the current node we are on
   * @param idToOrder the mapping of node id to item
   * @param stepNumber the current step number
   * @param nodes the array of nodes
   */
  getNodeOrderOfProjectHelper(project, node, idToOrder, stepNumber, nodes) {
    /*
     * Create the item that we will add to the idToOrder mapping.
     * The 'order' field determines how the project nodes are displayed
     * when we flatten the project for displaying.
     */
    const item = {
      order: idToOrder.nodeCount,
      node: node,
      stepNumber: stepNumber
    };

    idToOrder[node.id] = item;
    idToOrder.nodeCount++;
    nodes.push(item);

    if (node.type == 'group') {
      const childIds = node.ids;
      for (let c = 0; c < childIds.length; c++) {
        const childId = childIds[c];
        const child = this.getNodeById(childId, project);
        let childStepNumber = stepNumber;

        if (childStepNumber != '') {
          // add the . separator for the step number e.g. 1.
          childStepNumber += '.';
        }

        childStepNumber += c + 1;
        this.getNodeOrderOfProjectHelper(project, child, idToOrder, childStepNumber, nodes);
      }
    }
    return idToOrder;
  }

  /**
   * Returns the position in the project for the node with the given id. Returns null if no node
   * with id exists.
   * @param id a node id
   * @return string position of the given node id in the project
   */
  getPositionById(id) {
    for (let i = 0; i < this.rootNode.ids.length; i++) {
      const node = this.getNodeById(this.rootNode.ids[i]);
      const path = this.getPathToNode(node, i + 1, id);
      if (path != undefined && path != null) {
        return path;
      }
    }
    return null;
  }

  /**
   * Returns the order of the given node id in the project. Returns null if no node with id exists.
   * @param id String node id
   * @return Number order of the given node id in the project
   */
  getOrderById(id) {
    if (this.idToOrder[id]) {
      return this.idToOrder[id].order;
    }
    return null;
  }

  /**
   * Returns the id of the node with the given order in the project. Returns null if no order with
   * node exists.
   * @param order Number
   * @return Number node id of the given order in the project
   */
  getIdByOrder(order) {
    let nodeId = null;
    for (let id in this.idToOrder) {
      if (this.idToOrder[id].order === order) {
        if (this.isGroupNode(id) && order > 1) {
          nodeId = this.getIdByOrder(order - 1);
        } else {
          nodeId = id;
        }
        break;
      }
    }
    return nodeId;
  }

  getGroupNodesIdToOrder() {
    const idToOrder = {};
    const onlyGroupNodes = Object.entries(this.idToOrder).filter((item) => {
      return this.isGroupNode(item[0]);
    });
    for (const [key, value] of onlyGroupNodes) {
      idToOrder[key] = value;
    }
    return idToOrder;
  }

  /**
   * Recursively searches for the given node id from the point of the given node down and returns
   * the path number (position)
   * @param node a node to start searching down
   * @param path the position of the given node
   * @param id the node id to search for
   * @return string path of the given node id in the project
   */
  getPathToNode(node, path, id) {
    if (node.id === id) {
      return path + '';
    } else if (node.type === 'group') {
      let num = 0;
      for (let nodeId of node.ids) {
        if (this.nodeIdsInAnyBranch.indexOf(nodeId) === -1) {
          ++num;
          const pos = this.getPathToNode(this.getNodeById(nodeId), path + '.' + num, id);
          if (pos) {
            return pos;
          }
        }
      }
    }
  }

  getNodePositionById(id) {
    if (id != null) {
      return this.nodeIdToNumber[id];
    }
    return null;
  }

  getNodeIdByOrder(order) {
    for (let [nodeId, value] of Object.entries(this.idToOrder)) {
      if ((<any>value).order === order) {
        return nodeId;
      }
    }
    return null;
  }

  getNodeOrderById(id) {
    return this.idToOrder[id] ? this.idToOrder[id].order : null;
  }

  setIdToNode(id, element) {
    this.idToNode[id] = element;
  }

  /**
   * Replace relative asset paths with absolute paths
   * e.g.
   * assets/myimage.jpg
   * will be replaced with
   * http://wise.berkeley.edu/curriculum/123456/assets/myimage.jpg
   * @param content a string or JSON object
   * @return the same type of object that was passed in as the content
   * but with relative asset paths replaced with absolute paths
   */
  injectAssetPaths(content) {
    if (content != null) {
      if (typeof content === 'object') {
        let contentString = JSON.stringify(content);
        if (contentString != null) {
          // replace the relative asset paths with the absolute paths
          contentString = this.replaceAssetPaths(contentString);
          content = JSON.parse(contentString);
        }
      } else if (typeof content === 'string') {
        // replace the relative asset paths with the absolute paths
        content = this.replaceAssetPaths(content);
      }
    }
    return content;
  }

  /**
   * Replace the relative asset paths with absolute paths
   * @param contentString the content string
   * @return the content string with relative asset paths replaced
   * with absolute asset paths
   */
  replaceAssetPaths(contentString) {
    if (contentString != null) {
      // get the content base url e.g. http://wise.berkeley.edu/curriculum/123456/
      const contentBaseURL = this.ConfigService.getConfigParam('projectBaseURL');

      // only look for string that starts with ' or " and ends in png, jpg, jpeg, pdf, etc.
      // the string we're looking for can't start with '/ and "/.
      // note that this also works for \"abc.png and \'abc.png, where the quotes are escaped
      contentString = contentString.replace(
        new RegExp(
          "('|\"|\\\\'|\\\\\")[^:][^/]?[^/]?[a-zA-Z0-9@%&;\\._\\/\\s\\-']*[.]" +
            '(png|jpe?g|pdf|gif|mov|mp4|mp3|wav|swf|css|txt|json|xlsx?|doc|html.*?|js).*?' +
            '(\'|"|\\\\\'|\\\\")',
          'gi'
        ),
        (matchedString) => {
          /*
           * once found, we prepend the contentBaseURL + "assets/" to the string within the quotes
           * and keep everything else the same.
           */
          let delimiter = '';
          let matchedStringWithoutQuotes = '';

          if (matchedString.length > 2 && matchedString.substr(0, 1) == '\\') {
            // the string has escaped quotes for example \"hello.png\"

            // get everything between the escaped quotes
            matchedStringWithoutQuotes = matchedString.substr(2, matchedString.length - 4);

            // get the delimiter which will be \' or \"
            delimiter = matchedString.substr(0, 2);
          } else {
            // the string does not have escaped quotes for example "hello.png"

            // get everything between the quotes
            matchedStringWithoutQuotes = matchedString.substr(1, matchedString.length - 2);

            // get the delimiter which will be ' or "
            delimiter = matchedString.substr(0, 1);
          }

          if (
            matchedStringWithoutQuotes != null &&
            matchedStringWithoutQuotes.length > 0 &&
            matchedStringWithoutQuotes.charAt(0) == '/'
          ) {
            /*
             * the matched string starts with a "/" which means it's
             * an absolute path and does not require path prepending
             * so we will just return the original unmodified string
             */
            return delimiter + matchedStringWithoutQuotes + delimiter;
          } else {
            // make a new string with the contentBaseURL + assets/ prepended to the path
            return delimiter + contentBaseURL + 'assets/' + matchedStringWithoutQuotes + delimiter;
          }
        }
      );
    }
    return contentString;
  }

  /**
   * Inject the ng-click attribute that will call the snipImage function
   * @param content the content
   * @returns the modified content
   */
  injectClickToSnipImage(content) {
    if (content != null) {
      if (typeof content === 'object') {
        let contentString = JSON.stringify(content);
        if (contentString != null) {
          // replace the relative asset paths with the absolute paths
          contentString = this.injectClickToSnipImageIntoContentString(contentString);

          content = JSON.parse(contentString);
        }
      } else if (typeof content === 'string') {
        // replace the relative asset paths with the absolute paths
        content = this.injectClickToSnipImageIntoContentString(content);
      }
    }
    return content;
  }

  /**
   * Inject the ng-click attribute that will call the snipImage function
   * @param contentString the content in string format
   * @returns the modified content string
   */
  injectClickToSnipImageIntoContentString(contentString) {
    if (contentString != null) {
      const componentId = JSON.parse(contentString).id;

      // regex to match image elements
      const imgMatcher = new RegExp('<img.*?src=\\\\?[\'"](.*?)\\\\?[\'"].*?>', 'gi');

      // replace all instances that match
      contentString = contentString.replace(imgMatcher, (matchedString, matchGroup1) => {
        /*
         * insert the ng-click attribute
         * Before: <img src="some-image.png"/>
         * After:
         * <img ng-click="this.$ctrl.ProjectService.broadcastSnipImage(
         *      { target: $event.target, componentId: 'abcdefghij' })" src="some-image.png"/>
         */
        return matchedString.replace(
          'img',
          `img ng-click=\\"this.$ctrl.ProjectService.broadcastSnipImage(` +
            `{ target: $event.target, componentId: '${componentId}' })\\"`
        );
      });
    }
    return contentString;
  }

  /**
   * Returns the node specified by the nodeId
   * @param nodeId get the node with this node id
   * @param (optional) the project to retrieve the node from. this is used in
   * the case when we want the node from another project such as when we are
   * importing a step from another project
   * Return null if nodeId param is null or the specified node does not exist in the project.
   */
  getNodeById(nodeId, project = null) {
    if (project == null) {
      if (this.idToNode[nodeId]) {
        return this.idToNode[nodeId];
      }
    } else {
      for (let tempNode of project.nodes) {
        if (tempNode != null && tempNode.id == nodeId) {
          return tempNode;
        }
      }

      for (let tempNode of project.inactiveNodes) {
        if (tempNode != null && tempNode.id == nodeId) {
          return tempNode;
        }
      }
    }
    return null;
  }

  /**
   * Returns the title of the node with the nodeId
   * Return null if nodeId param is null or the specified node does not exist in the project.
   */
  getNodeTitleByNodeId(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      return node.title;
    }
    return null;
  }

  /**
   * Get the node position and title
   * @param nodeId the node id
   * @returns the node position and title, e.g. "1.1 Introduction"
   */
  getNodePositionAndTitleByNodeId(nodeId) {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      const position = this.getNodePositionById(nodeId);
      if (position != null) {
        return position + ': ' + node.title;
      } else {
        return node.title;
      }
    }
    return null;
  }

  getNodeIconByNodeId(nodeId) {
    const node = this.getNodeById(nodeId);
    let nodeIcon = null;
    if (node != null) {
      // set defaults (TODO: get from configService?)
      nodeIcon = {
        color: 'rgba(0,0,0,0.54)',
        type: 'font',
        fontSet: 'material-icons',
        fontName: node.type === 'group' ? 'explore' : 'school',
        imgSrc: '',
        imgAlt: 'node icon'
      };

      // TODO: check for different statuses
      const icons = node.icons;
      if (!!icons && !!icons.default) {
        const icon = icons.default;
        nodeIcon = $.extend(true, nodeIcon, icon);
      }

      // check for empty image source
      if (!nodeIcon.imgSrc) {
        // revert to font icon
        nodeIcon.type = 'font';
      }
    }
    return nodeIcon;
  }

  getParentGroup(nodeId = ''): any {
    const node = this.getNodeById(nodeId);
    if (node != null) {
      for (const groupNode of this.getGroupNodes()) {
        if (this.isNodeDirectChildOfGroup(node, groupNode)) {
          return groupNode;
        }
      }
      for (const inactiveGroupNode of this.getInactiveGroupNodes()) {
        if (this.isNodeDirectChildOfGroup(node, inactiveGroupNode)) {
          return inactiveGroupNode;
        }
      }
    }
    return null;
  }

  getParentGroupId(nodeId = ''): string {
    const parentGroup = this.getParentGroup(nodeId);
    if (parentGroup != null) {
      return parentGroup.id;
    }
    return null;
  }

  getNodeDepth(nodeId, val) {
    if (nodeId != null) {
      let depth = typeof val === 'number' ? val : 0;
      const parent = this.getParentGroup(nodeId);
      if (parent) {
        depth = this.getNodeDepth(parent.id, depth + 1);
      }
      return depth;
    }
    return null;
  }

  getRootNode(nodeId) {
    const parentGroup = this.getParentGroup(nodeId);
    if (parentGroup == null) {
      return this.getNodeById(nodeId);
    } else {
      return this.getRootNode(parentGroup.id);
    }
    return null;
  }

  isNodeDirectChildOfGroup(node, group) {
    if (node != null && group != null) {
      const nodeId = node.id;
      const groupIds = group.ids;
      if (groupIds != null && groupIds.indexOf(nodeId) != -1) {
        return true;
      }
    }
    return false;
  }

  isNodeDescendentOfGroup(node, group) {
    if (node != null && group != null) {
      const descendents = this.getDescendentsOfGroup(group);
      const nodeId = node.id;
      if (descendents.indexOf(nodeId) != -1) {
        return true;
      }
    }
    return false;
  }

  getDescendentsOfGroup(group) {
    let descendents = [];
    if (group != null) {
      const childIds = group.ids;
      if (childIds != null) {
        descendents = childIds;
        for (let childId of childIds) {
          const node = this.getNodeById(childId);
          if (node != null) {
            const childDescendents = this.getDescendentsOfGroup(node);
            descendents = descendents.concat(childDescendents);
          }
        }
      }
    }
    return descendents;
  }

  getStartNodeId() {
    return this.project.startNodeId;
  }

  setStartNodeId(nodeId) {
    this.project.startNodeId = nodeId;
  }

  getStartGroupId() {
    return this.project.startGroupId;
  }

  isStartNodeId(nodeId) {
    return this.project.startNodeId === nodeId;
  }

  getConstraintsThatAffectNode(node) {
    const constraints = [];
    const allConstraints = this.activeConstraints;
    for (let constraint of allConstraints) {
      if (this.isNodeAffectedByConstraint(node, constraint)) {
        constraints.push(constraint);
      }
    }
    return constraints;
  }

  getConstraintsOnNode(nodeId) {
    let node = this.getNodeById(nodeId);
    return node.constraints;
  }

  addConstraintToNode(node, constraint) {
    if (node.constraints == null) {
      node.constraints = [];
    }
    node.constraints.push(constraint);
  }

  /**
   * Check if a node has constraints.
   * @param nodeId The node id of the node.
   * @return true iff the node has constraints authored on it.
   */
  nodeHasConstraint(nodeId) {
    let constraints = this.getConstraintsOnNode(nodeId);
    return constraints.length > 0;
  }

  /**
   * Order the constraints so that they show up in the same order as in the
   * project.
   * @param constraints An array of constraint objects.
   * @return An array of ordered constraints.
   */
  orderConstraints(constraints) {
    let orderedNodeIds = this.getFlattenedProjectAsNodeIds();
    return constraints.sort(this.constraintsComparatorGenerator(orderedNodeIds));
  }

  /**
   * Create the constraints comparator function that is used for sorting an
   * array of constraint objects.
   * @param orderedNodeIds An array of node ids in the order in which they
   * show up in the project.
   * @return A comparator that orders constraint objects in the order in which
   * the target ids show up in the project.
   */
  constraintsComparatorGenerator(orderedNodeIds) {
    return function (constraintA, constraintB) {
      let constraintAIndex = orderedNodeIds.indexOf(constraintA.targetId);
      let constraintBIndex = orderedNodeIds.indexOf(constraintB.targetId);
      if (constraintAIndex < constraintBIndex) {
        return -1;
      } else if (constraintAIndex > constraintBIndex) {
        return 1;
      }
      return 0;
    };
  }

  /**
   * Check if a node is affected by the constraint
   * @param node check if the node is affected
   * @param constraint the constraint that might affect the node
   * @returns whether the node is affected by the constraint
   */
  isNodeAffectedByConstraint(node, constraint) {
    const cachedResult = this.getCachedIsNodeAffectedByConstraintResult(node.id, constraint.id);
    if (cachedResult != null) {
      return cachedResult;
    } else {
      let result = false;
      const nodeId = node.id;
      const targetId = constraint.targetId;
      const action = constraint.action;

      if (action === 'makeAllNodesAfterThisNotVisible') {
        if (this.isNodeIdAfter(targetId, node.id)) {
          result = true;
        }
      } else if (action === 'makeAllNodesAfterThisNotVisitable') {
        if (this.isNodeIdAfter(targetId, node.id)) {
          result = true;
        }
      } else {
        const targetNode = this.getNodeById(targetId);
        if (targetNode != null) {
          const nodeType = targetNode.type;
          if (nodeType === 'node' && nodeId === targetId) {
            result = true;
          } else if (
            nodeType === 'group' &&
            (nodeId === targetId || this.isNodeDescendentOfGroup(node, targetNode))
          ) {
            result = true;
          }
        }
      }

      this.cacheIsNodeAffectedByConstraintResult(node.id, constraint.id, result);
      return result;
    }
  }

  /**
   * Check if a node id comes after another node id in the project.
   * @param nodeId1 The node id of a step or group.
   * @param nodeId2 The node id of a step or group.
   * @returns {boolean} True iff nodeId2 comes after nodeId1.
   */
  isNodeIdAfter(nodeId1, nodeId2) {
    if (this.isApplicationNode(nodeId1)) {
      if (nodeId1 == nodeId2) {
        return false;
      } else {
        for (const onePath of this.getOrCalculateAllPaths()) {
          if (onePath.indexOf(nodeId1) < onePath.indexOf(nodeId2)) {
            return true;
          }
        }
      }
    } else {
      return this.isNodeAfterGroup(nodeId1, nodeId2);
    }
    return false;
  }

  getOrCalculateAllPaths(): string[] {
    if (this.allPaths.length === 0) {
      this.allPaths = this.getAllPaths([], this.getStartNodeId(), true);
    }
    return this.allPaths;
  }

  /**
   * @param groupId
   * @param nodeId The node id of a step or group.
   * @returns {boolean} True iff nodeId comes after groupId.
   */
  isNodeAfterGroup(groupId, nodeId) {
    const transitions = this.getTransitionsByFromNodeId(groupId);
    try {
      for (let transition of transitions) {
        const pathFromGroupToEnd = this.getAllPaths([], transition.to, true);
        for (let pathToEnd of pathFromGroupToEnd) {
          if (pathToEnd.indexOf(nodeId) != -1) {
            return true;
          }
        }
      }
    } catch (e) {}
    return false;
  }

  /**
   * Get the transition logic for a node
   * @param fromNodeId the from node id
   * @returns the transition logic object
   */
  getTransitionLogicByFromNodeId(fromNodeId) {
    const node = this.getNodeById(fromNodeId);
    if (node.transitionLogic == null) {
      node.transitionLogic = {
        transitions: []
      };
    }
    return node.transitionLogic;
  }

  /**
   * Get the transitions for a node
   * @param fromNodeId the node to get transitions from
   * @returns {Array} an array of transitions
   */
  getTransitionsByFromNodeId(fromNodeId: string) {
    const transitionLogic = this.getTransitionLogicByFromNodeId(fromNodeId);
    return transitionLogic.transitions;
  }

  /**
   * Get all the node ids from steps (not groups)
   * @returns an array with all the node ids
   */
  getNodeIds() {
    return this.applicationNodes.map((node) => {
      return node.id;
    });
  }

  /**
   * Get nodes that have a transition to the given node id
   * @param toNodeId the node id
   * @returns an array of node objects that transition to the
   * given node id
   */
  getNodesByToNodeId(toNodeId) {
    const nodesByToNodeId = [];
    if (toNodeId != null) {
      const nodes = this.project.nodes;
      for (let node of nodes) {
        if (this.nodeHasTransitionToNodeId(node, toNodeId)) {
          nodesByToNodeId.push(node);
        }
      }
      const inactiveNodes = this.getInactiveNodes();
      for (let inactiveNode of inactiveNodes) {
        if (this.nodeHasTransitionToNodeId(inactiveNode, toNodeId)) {
          nodesByToNodeId.push(inactiveNode);
        }
      }
    }
    return nodesByToNodeId;
  }

  getActiveNodes() {
    return this.project.nodes;
  }

  getInactiveNodes() {
    return this.project.inactiveNodes;
  }

  /**
   * Check if a node has a transition to the given nodeId.
   * @param node The node to check.
   * @param toNodeId We are looking for a transition to this node id.
   * @returns Whether the node has a transition to the given nodeId.
   */
  nodeHasTransitionToNodeId(node, toNodeId) {
    const transitions = this.getTransitionsByFromNodeId(node.id);
    if (transitions != null) {
      for (let transition of transitions) {
        if (toNodeId === transition.to) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get node ids of all the nodes that have a to transition to the given node id
   * @param toNodeId
   * @returns all the node ids that have a transition to the given node id
   */
  getNodesWithTransitionToNodeId(toNodeId) {
    const nodeIds = [];
    const nodes = this.getNodesByToNodeId(toNodeId);
    for (let node of nodes) {
      nodeIds.push(node.id);
    }
    return nodeIds;
  }

  /**
   * Get the group nodes that point to a given node id
   * @param toNodeId
   */
  getGroupNodesByToNodeId(toNodeId) {
    const groupsThatPointToNodeId = [];
    if (toNodeId != null) {
      const groups = this.getGroups();
      for (let group of groups) {
        if (this.nodeHasTransitionToNodeId(group, toNodeId)) {
          groupsThatPointToNodeId.push(group);
        }
      }
    }
    return groupsThatPointToNodeId;
  }

  /**
   * Retrieves the project JSON from Config.projectURL and returns it.
   * If Config.projectURL is undefined, returns null.
   */
  retrieveProject() {
    let projectURL = this.ConfigService.getConfigParam('projectURL');
    if (projectURL == null) {
      return null;
    }
    const headers = new HttpHeaders().set('cache-control', 'no-cache');
    return this.http
      .get(projectURL, { headers: headers })
      .toPromise()
      .then((projectJSON) => {
        this.setProject(projectJSON);
        return projectJSON;
      });
  }

  /**
   * Retrieve the project JSON
   * @param projectId retrieve the project JSON with this id
   * @return a promise to return the project JSON
   */
  retrieveProjectById(projectId) {
    return this.http
      .get(`/author/config/${projectId}`)
      .toPromise()
      .then((configJSON: any) => {
        return this.http
          .get(configJSON.projectURL)
          .toPromise()
          .then((projectJSON: any) => {
            projectJSON.previewProjectURL = configJSON.previewProjectURL;
            return projectJSON;
          });
      });
  }

  /**
   * Returns the theme path for the current project
   */
  getThemePath() {
    const wiseBaseURL = this.ConfigService.getWISEBaseURL();
    if (this.project != null && this.project.theme) {
      // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
      return wiseBaseURL + '/wise5/themes/' + this.project.theme;
    } else {
      // TODO: get default theme name from ConfigService
      return wiseBaseURL + '/wise5/themes/default';
    }
  }

  /**
   * Returns the theme settings for the current project
   */
  getThemeSettings() {
    let themeSettings = {};
    if (this.project.themeSettings) {
      if (this.project.theme) {
        // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
        themeSettings = this.project.themeSettings[this.project.theme];
      } else {
        // TODO: get default theme name from ConfigService
        themeSettings = this.project.themeSettings['default'];
      }
    }
    return themeSettings ? themeSettings : {};
  }

  /**
   * Flatten the project to obtain a list of node ids
   * @param recalculate Whether to force recalculating the flattened node ids.
   * @return An array of the flattened node ids in the project.
   */
  getFlattenedProjectAsNodeIds(recalculate = true) {
    if (!recalculate && this.flattenedProjectAsNodeIds != null) {
      // use the previously calculated flattened node ids
      return this.flattenedProjectAsNodeIds;
    }

    const startNodeId = this.getStartNodeId();

    /*
     * an array to keep track of the node ids in the path that
     * we are currently on as we traverse the nodes in the project
     * depth first
     */
    const pathsSoFar = [];
    const allPaths = this.getAllPaths(pathsSoFar, startNodeId);
    const nodeIds = this.consolidatePaths(allPaths);
    this.flattenedProjectAsNodeIds = nodeIds; // cache flatted node ids
    return nodeIds;
  }

  /**
   * Get all the possible paths through the project. This function
   * recursively calls itself to traverse the project depth first.
   * @param pathSoFar the node ids in the path so far. the node ids
   * in this array are referenced to make sure we don't loop back
   * on the path.
   * @param nodeId the node id we want to get the paths from
   * @param includeGroups whether to include the group node ids in the paths
   * @return an array of paths. each path is an array of node ids.
   */
  getAllPaths(pathSoFar: string[], nodeId: string = '', includeGroups: boolean = false) {
    const allPaths = [];
    if (this.isApplicationNode(nodeId)) {
      const path = [];
      const transitions = this.getTransitionsByFromNodeId(nodeId);
      if (transitions != null) {
        if (includeGroups) {
          const parentGroup = this.getParentGroup(nodeId);
          if (parentGroup != null) {
            const parentGroupId = parentGroup.id;
            if (parentGroupId != null && pathSoFar.indexOf(parentGroupId) == -1) {
              pathSoFar.push(parentGroup.id);
            }
          }
        }

        /*
         * add the node id to the path so far so we can later check
         * which nodes are already in the path to prevent looping
         * back in the path
         */
        pathSoFar.push(nodeId);

        if (transitions.length === 0) {
          /*
           * there are no transitions from the node id so we will
           * look for a transition in the parent group
           */

          let addedCurrentNodeId = false;
          const parentGroupId = this.getParentGroupId(nodeId);
          const parentGroupTransitions = this.getTransitionsByFromNodeId(parentGroupId);

          if (parentGroupTransitions != null) {
            for (let parentGroupTransition of parentGroupTransitions) {
              if (parentGroupTransition != null) {
                const toNodeId = parentGroupTransition.to;
                if (pathSoFar.indexOf(toNodeId) == -1) {
                  /*
                   * recursively get the paths by getting all
                   * the paths for the to node
                   */
                  const allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId, includeGroups);

                  for (let tempPath of allPathsFromToNode) {
                    tempPath.unshift(nodeId);
                    allPaths.push(tempPath);
                    addedCurrentNodeId = true;
                  }
                }
              }
            }
          }

          if (!addedCurrentNodeId) {
            /*
             * if the parent group doesn't have any transitions we will
             * need to add the current node id to the path
             */
            path.push(nodeId);
            allPaths.push(path);
          }
        } else {
          // there are transitions from this node id

          for (let transition of transitions) {
            if (transition != null) {
              const toNodeId = transition.to;
              if (toNodeId != null && pathSoFar.indexOf(toNodeId) == -1) {
                // we have not found the to node in the path yet so we can traverse it

                /*
                 * recursively get the paths by getting all
                 * the paths from the to node
                 */
                const allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId, includeGroups);

                if (allPathsFromToNode != null) {
                  for (let tempPath of allPathsFromToNode) {
                    if (includeGroups) {
                      // we need to add the group id to the path

                      if (tempPath.length > 0) {
                        const firstNodeId = tempPath[0];
                        const firstParentGroupId = this.getParentGroupId(firstNodeId);
                        const parentGroupId = this.getParentGroupId(nodeId);
                        if (parentGroupId != firstParentGroupId) {
                          /*
                           * the parent ids are different which means this is a boundary
                           * between two groups. for example if the project looked like
                           * group1>node1>node2>group2>node3>node4
                           * and the current node was node2 then the first node in the
                           * path would be node3 which means we would need to place
                           * group2 on the path before node3
                           */
                          tempPath.unshift(firstParentGroupId);
                        }
                      }
                    }

                    tempPath.unshift(nodeId);
                    allPaths.push(tempPath);
                  }
                }
              } else {
                /*
                 * the node is already in the path so far which means
                 * the transition is looping back to a previous node.
                 * we do not want to take this transition because
                 * it will lead to an infinite loop. we will just
                 * add the current node id to the path and not take
                 * the transition which essentially ends the path.
                 */
                path.push(nodeId);
                allPaths.push(path);
              }
            }
          }
        }

        if (pathSoFar.length > 0) {
          const lastNodeId = pathSoFar[pathSoFar.length - 1];
          if (this.isGroupNode(lastNodeId)) {
            /*
             * the last node id is a group id so we will remove it
             * since we are moving back up the path as we traverse
             * the nodes depth first
             */
            pathSoFar.pop();
          }
        }

        /*
         * remove the latest node id (this will be a step node id)
         * since we are moving back up the path as we traverse the
         * nodes depth first
         */
        pathSoFar.pop();

        if (includeGroups) {
          if (pathSoFar.length == 1) {
            /*
             * we are including groups and we have traversed
             * back up to the start node id for the project.
             * the only node id left in pathSoFar is now the
             * parent group of the start node id. we will
             * now add this parent group of the start node id
             * to all of the paths
             */

            for (let path of allPaths) {
              if (path != null) {
                /*
                 * prepend the parent group of the start node id
                 * to the path
                 */
                path.unshift(pathSoFar[0]);
              }
            }

            /*
             * remove the parent group of the start node id from
             * pathSoFar which leaves us with an empty pathSoFar
             * which means we are completely done with
             * calculating all the paths
             */
            pathSoFar.pop();
          }
        }
      }
    } else {
      /*
       * add the node id to the path so far so we can later check
       * which nodes are already in the path to prevent looping
       * back in the path
       */
      pathSoFar.push(nodeId);

      const groupNode = this.getNodeById(nodeId);
      if (groupNode != null) {
        const startId = groupNode.startId;
        if (startId == null || startId == '') {
          // there is no start id so we will take the transition from the group
          // TODO? there is no start id so we will loop through all the child nodes

          const transitions = this.getTransitionsByFromNodeId(groupNode.id);
          if (transitions != null && transitions.length > 0) {
            for (let transition of transitions) {
              if (transition != null) {
                const toNodeId = transition.to;

                const allPathsFromToNode = this.getAllPaths(pathSoFar, toNodeId, includeGroups);

                if (allPathsFromToNode != null) {
                  for (let tempPath of allPathsFromToNode) {
                    tempPath.unshift(nodeId);
                    allPaths.push(tempPath);
                  }
                }
              }
            }
          } else {
            /*
             * this activity does not have any transitions so
             * we have reached the end of this path
             */

            const tempPath = [];
            tempPath.unshift(nodeId);
            allPaths.push(tempPath);
          }
        } else {
          // there is a start id so we will traverse it

          const allPathsFromToNode = this.getAllPaths(pathSoFar, startId, includeGroups);

          if (allPathsFromToNode != null) {
            for (let tempPath of allPathsFromToNode) {
              tempPath.unshift(nodeId);
              allPaths.push(tempPath);
            }
          }
        }
      }

      /*
       * remove the latest node id since we are moving back
       * up the path as we traverse the nodes depth first
       */
      pathSoFar.pop();
    }
    return allPaths;
  }

  /**
   * Consolidate all the paths into a linear list of node ids
   * @param paths an array of paths. each path is an array of node ids.
   * @return an array of node ids that have been properly ordered
   */
  consolidatePaths(paths = []) {
    let consolidatedPath = [];
    /*
     * continue until all the paths are empty. as we consolidate
     * node ids, we will remove them from the paths. once all the
     * paths are empty we will be done consolidating the paths.
     */
    while (!this.arePathsEmpty(paths)) {
      // start with the first path
      const currentPath = this.getNonEmptyPathIndex(paths);

      // get the first node id in the current path
      const nodeId = this.getFirstNodeIdInPathAtIndex(paths, currentPath);
      if (this.areFirstNodeIdsInPathsTheSame(paths)) {
        // the first node ids in all the paths are the same

        // remove the node id from all the paths
        this.removeNodeIdFromPaths(nodeId, paths);

        // add the node id to our consolidated path
        consolidatedPath.push(nodeId);
      } else {
        // not all the top node ids are the same which means we have branched

        // get all the paths that contain the node id
        const pathsThatContainNodeId = this.getPathsThatContainNodeId(nodeId, paths);

        if (pathsThatContainNodeId != null) {
          if (pathsThatContainNodeId.length === 1) {
            // only the current path we are on has the node id

            // remove the node id from the path
            this.removeNodeIdFromPath(nodeId, paths, currentPath);

            // add the node id to our consolidated path
            consolidatedPath.push(nodeId);
          } else {
            // there are multiple paths that have this node id

            // consume all the node ids up to the given node id
            const consumedPath = this.consumePathsUntilNodeId(paths, nodeId);

            // remove the node id from the paths
            this.removeNodeIdFromPaths(nodeId, paths);

            // add the node id to the end of the consumed path
            consumedPath.push(nodeId);

            // add the consumed path to our consolidated path
            consolidatedPath = consolidatedPath.concat(consumedPath);
          }
        }
      }
    }
    return consolidatedPath;
  }

  /**
   * Consume the node ids in the paths until we get to the given node id
   * @param paths the paths to consume
   * @param nodeId the node id to stop consuming at
   * @return an array of node ids that we have consumed
   */
  consumePathsUntilNodeId(paths, nodeId) {
    const consumedNodes = [];
    for (const path of paths) {
      if (path.includes(nodeId)) {
        const subPath = path.splice(0, path.indexOf(nodeId));
        for (const nodeIdInPath of subPath) {
          if (!consumedNodes.includes(nodeIdInPath)) {
            consumedNodes.push(nodeIdInPath);
          }
        }
      }
    }
    return consumedNodes;
  }

  /**
   * Get the path at the given index and get the first node id in
   * the path
   * @param paths an array of paths. each path is an array of node ids
   * @param index the index of the path we want
   * @return the first node in the given path
   */
  getFirstNodeIdInPathAtIndex(paths, index) {
    let nodeId = null;
    if (paths != null && index != null) {
      const path = paths[index];
      if (path != null && path.length > 0) {
        nodeId = path[0];
      }
    }
    return nodeId;
  }

  /**
   * Remove the node ifrom the paths
   * @param nodeId the node id to remove
   * @param paths an array of paths. each path is an array of node ids
   */
  removeNodeIdFromPaths(nodeId, paths) {
    if (nodeId != null && paths != null) {
      for (let path of paths) {
        for (let x = 0; x < path.length; x++) {
          const tempNodeId = path[x];

          /*
           * check if the node id matches the one we are looking
           * for
           */
          if (nodeId === tempNodeId) {
            /*
             * we have found the node id we are looking for so
             * we will remove it from the path
             */
            path.splice(x, 1);

            /*
             * move the counter back since we just removed a
             * node id. we will continue searching this path
             * for the node id in case the path contains it
             * multiple times.
             */
            x--;
          }
        }
      }
    }
  }

  /**
   * Remove the node id from the path
   * @param nodeId the node id to remove
   * @param paths an array of paths. each path is an array of node ids
   * @param pathIndex the path to remove from
   */
  removeNodeIdFromPath(nodeId, paths, pathIndex) {
    if (nodeId != null && paths != null && pathIndex != null) {
      const path = paths[pathIndex];
      if (path != null) {
        for (let x = 0; x < path.length; x++) {
          const tempNodeId = path[x];

          /*
           * check if the node id matches the one we are looking
           * for
           */
          if (nodeId === tempNodeId) {
            /*
             * we have found the node id we are looking for so
             * we will remove it from the path
             */
            path.splice(x, 1);

            /*
             * move the counter back since we just removed a
             * node id. we will continue searching this path
             * for the node id in case the path contains it
             * multiple times.
             */
            x--;
          }
        }
      }
    }
  }

  /**
   * Check if the first node ids in the paths are the same
   * @param paths an array of paths. each path is an array of node ids
   * @return whether all the paths have the same first node id
   */
  areFirstNodeIdsInPathsTheSame(paths) {
    let result = true;
    let nodeId = null;
    if (paths != null) {
      for (let path of paths) {
        const tempNodeId = path[0];
        if (nodeId == null) {
          /*
           * this is the first path we have looked at so we will
           * remember the node id
           */
          nodeId = tempNodeId;
        } else if (nodeId != tempNodeId) {
          /*
           * the node id does not match the first node id from a
           * previous path so the paths do not all have the same
           * first node id
           */
          result = false;
          break;
        }
      }
    }
    return result;
  }

  /**
   * Check if all the paths are empty
   * @param paths an array of paths. each path is an array of node ids
   * @return whether all the paths are empty
   */
  arePathsEmpty(paths) {
    if (paths != null) {
      for (let path of paths) {
        if (path != null) {
          if (path.length !== 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Get the paths that contain the node id
   * @param nodeId the node id we are looking for
   * @param paths an array of paths. each path is an array of node ids
   * @return an array of paths that contain the given node id
   */
  getPathsThatContainNodeId(nodeId, paths = []) {
    const pathsThatContainNodeId = [];
    for (const path of paths) {
      if (path.indexOf(nodeId) !== -1) {
        pathsThatContainNodeId.push(path);
      }
    }
    return pathsThatContainNodeId;
  }

  /**
   * Get a non empty path index. It will loop through the paths and
   * return the index of the first non empty path.
   * @param paths an array of paths. each path is an array of node ids
   * @return the index of the path that is not empty
   */
  getNonEmptyPathIndex(paths) {
    if (paths != null) {
      for (let p = 0; p < paths.length; p++) {
        const path = paths[p];
        if (path.length !== 0) {
          return p;
        }
      }
    }
    return null;
  }

  /**
   * Remember the branches.
   * @param branches An array of arrays of node ids.
   */
  setBranchesCache(branches) {
    this.branchesCache = branches;
  }

  /**
   * Get the branches that were previously calculated.
   * @returns An array of arrays of node ids.
   */
  getBranchesCache() {
    return this.branchesCache;
  }

  clearBranchesCache() {
    this.branchesCache = null;
  }

  getBranches() {
    /*
     * Do not use the branches cache in the authoring tool because the branches
     * may change when the author changes the project. In all other modes the
     * branches can't change so we can use the cache.
     */
    if (this.ConfigService.getMode() != 'author') {
      let branchesCache = this.getBranchesCache();
      if (branchesCache != null) {
        return branchesCache;
      }
    }

    const startNodeId = this.getStartNodeId();

    /*
     * an array to keep track of the node ids in the path that
     * we are currently on as we traverse the nodes in the project
     * depth first
     */
    const pathsSoFar = [];

    const allPaths = this.getAllPaths(pathsSoFar, startNodeId);
    const branches = this.findBranches(allPaths);
    if (this.ConfigService.getMode() != 'author') {
      this.setBranchesCache(branches);
    }
    return branches;
  }

  /**
   * Find the branches in the project
   * @param paths all the possible paths through the project
   * @return an array of branch objects. each branch object contains
   * the branch start point, the branch paths, and the branch
   * end point
   */
  findBranches(paths) {
    const branches = [];
    let previousNodeId = null;

    /*
     * continue until all the paths are empty. we will remove
     * node ids from the paths as we traverse the paths to find
     * the branches
     */
    while (!this.arePathsEmpty(paths)) {
      const nodeId = this.getFirstNodeIdInPathAtIndex(paths, 0);

      if (this.areFirstNodeIdsInPathsTheSame(paths)) {
        // the first node ids in all the paths are the same

        this.removeNodeIdFromPaths(nodeId, paths);
        previousNodeId = nodeId;
      } else {
        // not all the top node ids are the same which means we have branched

        const branchMetaObject = this.createBranchMetaObject();
        branchMetaObject.branchStartPoint = previousNodeId;

        const nextCommonNodeId = this.findNextCommonNodeId(paths);
        branchMetaObject.branchEndPoint = nextCommonNodeId;

        let branchPaths = this.extractPathsUpToNodeId(paths, nextCommonNodeId);
        branchPaths = this.removeDuplicatePaths(branchPaths);
        branchMetaObject.branchPaths = branchPaths;
        branches.push(branchMetaObject);

        // trim the paths so that they start at the branch end point
        this.trimPathsUpToNodeId(paths, nextCommonNodeId);

        // remember this node id for the next iteration of the loop
        previousNodeId = nextCommonNodeId;
      }
    }
    return branches;
  }

  /**
   * Create a branch meta object that will contain the branch start
   * point, branch paths, and branch end point
   * @return an object that contains a branch start point, branch paths,
   * and a branch end point
   */
  createBranchMetaObject(): any {
    return {
      branchStartPoint: null,
      branchPaths: [],
      branchEndPoint: null
    };
  }

  /**
   * Find the next common node id in all the paths
   * @param paths the paths to find the common node id in
   * @return a node id that is in all the paths or null
   * if there is no node id that is in all the paths
   */
  findNextCommonNodeId(paths) {
    let nextCommonNodeId = null;
    if (paths != null) {
      if (paths.length > 0) {
        const path = paths[0];
        for (let tempNodeId of path) {
          if (this.allPathsContainNodeId(paths, tempNodeId)) {
            /*
             * the node id is in all the paths so we have found
             * what we were looking for
             */
            nextCommonNodeId = tempNodeId;
            break;
          }
        }
      }
    }
    return nextCommonNodeId;
  }

  /**
   * Check if all the paths contain the node id
   * @param paths an array of paths. each path contains an array of node ids
   * @param nodeId the node id that we will check is in all the paths
   * @return whether the node id is in all the paths
   */
  allPathsContainNodeId(paths, nodeId) {
    let result = false;
    if (paths != null) {
      for (let path of paths) {
        const index = path.indexOf(nodeId);
        if (index == -1) {
          result = false;
          break;
        } else {
          result = true;
        }
      }
    }
    return result;
  }

  /**
   * Trim the paths up to the given node id so that the paths will contain
   * the given node id and all the node ids after it. This function will
   * modify the paths.
   * @param paths the paths to trim
   * @param nodeId the node id to trim up to
   */
  trimPathsUpToNodeId(paths, nodeId) {
    if (paths != null) {
      for (let path of paths) {
        if (path != null) {
          let index = path.indexOf(nodeId);

          if (index == -1) {
            /*
             * the node id is not in the path so we will
             * trim the path to the end which will make
             * the path empty
             */
            index = path.length;
          }

          /*
           * trim the path up to the node id index. this will
           * modify the path array.
           */
          path.splice(0, index);
        }
      }
    }
  }

  /**
   * Extract the paths up to a given node id. This will be used to
   * obtain branch paths.
   * @param paths the paths to extract from
   * @param nodeId the node id to extract up to
   * @return paths that go up to but do not include the node id
   */
  extractPathsUpToNodeId(paths, nodeId) {
    const extractedPaths = [];
    if (paths != null) {
      for (let path of paths) {
        if (path != null) {
          let index = path.indexOf(nodeId);
          if (index == -1) {
            /*
             * the node id is not in the path so we will
             * extract up to the end of the path
             */
            index = path.length;
          }

          /*
           * get the path up to the node id index. this does
           * not modify the path array.
           */
          const extractedPath = path.slice(0, index);
          extractedPaths.push(extractedPath);
        }
      }
    }
    return extractedPaths;
  }

  /**
   * Removes duplicate paths
   * @param paths an array of paths. each path contains an array of node ids
   * @return an array of unique paths
   */
  removeDuplicatePaths(paths) {
    const uniquePaths = [];
    if (paths != null) {
      for (let path of paths) {
        let isPathInUniquePaths = false;
        for (let uniquePath of uniquePaths) {
          if (this.pathsEqual(path, uniquePath)) {
            isPathInUniquePaths = true;
          }
        }

        if (!isPathInUniquePaths) {
          // the path is not equal to any paths in the unique
          // paths array so we will add it to the unique paths array
          uniquePaths.push(path);
        }
      }
    }
    return uniquePaths;
  }

  /**
   * Check if two paths are equal
   * @param path1 an array of node ids
   * @param path2 an array of node ids
   * @return whether the two paths contain the same node ids
   * in the same order
   */
  pathsEqual(path1, path2) {
    let result = false;
    if (path1 != null && path2 != null) {
      if (path1.length === path2.length) {
        result = true;

        for (let x = 0; x < path1.length; x++) {
          const path1NodeId = path1[x];
          const path2NodeId = path2[x];
          if (path1NodeId !== path2NodeId) {
            result = false;
            break;
          }
        }
      }
    }
    return result;
  }

  /**
   * Get the branch paths that a node id is in
   * @param branches an array of branch objects
   * @param nodeId the node id to check
   * @return an array of the branch paths that the node id is in
   */
  getBranchPathsByNodeId(branches, nodeId) {
    const branchPathsIn = [];
    if (branches != null && nodeId != null) {
      for (let branch of branches) {
        if (branch != null) {
          const branchPaths = branch.branchPaths;
          if (branchPaths != null) {
            for (let branchPath of branchPaths) {
              if (branchPath != null) {
                const index = branchPath.indexOf(nodeId);
                if (index != -1) {
                  /*
                   * the node is in this branch path so we will
                   * add the branch path to our array
                   */
                  branchPathsIn.push(branchPath);
                }
              }
            }
          }
        }
      }
    }
    return branchPathsIn;
  }

  /**
   * Get the component by node id and component id
   * @param nodeId the node id
   * @param componentId the component id
   * @returns the component or null if the nodeId or componentId are null or does not exist
   */
  getComponentByNodeIdAndComponentId(nodeId, componentId) {
    const components = this.getComponentsByNodeId(nodeId);
    for (const component of components) {
      if (component.id === componentId) {
        return component;
      }
    }
    return null;
  }

  getConnectedComponentsByNodeIdAndComponentId(nodeId, componentId) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null && component.connectedComponents != null) {
      return component.connectedComponents;
    }
    return [];
  }

  /**
   * Returns the position of the component in the node by node id and
   * component id, 0-indexed.
   * @param nodeId the node id
   * @param componentId the component id
   * @returns the component's position or -1 if nodeId or componentId are null
   * or doesn't exist in the project.
   */
  getComponentPositionByNodeIdAndComponentId(nodeId, componentId) {
    if (nodeId != null && componentId != null) {
      const components = this.getComponentsByNodeId(nodeId);
      for (let c = 0; c < components.length; c++) {
        const tempComponent = components[c];
        if (tempComponent != null) {
          const tempComponentId = tempComponent.id;
          if (componentId === tempComponentId) {
            return c;
          }
        }
      }
    }
    return -1;
  }

  /**
   * Get the components in a node
   * @param nodeId the node id
   * @returns an array of components or empty array if nodeId is null or
   * doesn't exist in the project.
   * if the node exists but doesn't have any components, returns an empty array.
   */
  getComponentsByNodeId(nodeId) {
    if (nodeId != null) {
      const node = this.getNodeById(nodeId);
      if (node != null) {
        if (node.components != null) {
          return node.components;
        }
      }
    }
    return [];
  }

  /**
   * Get the max score for the node
   * @param nodeId the node id which can be a step or an activity
   * @returns the max score for the node which can be null or a number
   * if null, author/teacher has not set a max score for the node
   */
  getMaxScoreForNode(nodeId) {
    let maxScore = null;
    if (!this.isGroupNode(nodeId)) {
      const node = this.getNodeById(nodeId);
      for (let component of node.components) {
        const componentMaxScore = component.maxScore;
        if (typeof componentMaxScore == 'number') {
          if (maxScore == null) {
            maxScore = componentMaxScore;
          } else {
            maxScore += componentMaxScore;
          }
        }
      }
    }
    return maxScore;
  }

  /**
   * Get the max score for a component
   * @param nodeId get the max score from a component in this node
   * @param componentId get the max score from this component
   */
  getMaxScoreForComponent(nodeId, componentId) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      return component.maxScore;
    }
    return null;
  }

  /**
   * Determine if a node id is a direct child of a group
   * @param nodeId the node id
   * @param groupId the group id
   */
  isNodeInGroup(nodeId, groupId) {
    const group = this.getNodeById(groupId);
    return group.ids.indexOf(nodeId) != -1;
  }

  /**
   * Get the first leaf node by traversing all the start ids
   * until a leaf node id is found
   */
  getFirstLeafNodeId() {
    let firstLeafNodeId = null;
    const startGroupId = this.project.startGroupId;
    let node = this.getNodeById(startGroupId);
    let done = false;

    // loop until we have found a leaf node id or something went wrong
    while (!done) {
      if (node == null) {
        done = true;
      } else if (this.isGroupNode(node.id)) {
        firstLeafNodeId = node.id;
        node = this.getNodeById(node.startId);
      } else if (this.isApplicationNode(node.id)) {
        firstLeafNodeId = node.id;
        done = true;
      } else {
        done = true;
      }
    }
    return firstLeafNodeId;
  }

  /**
   * Get the message that describes how to disable the constraint
   * @param nodeId the node the student is trying to go to
   * @param constraint the constraint that is preventing the student
   * from going to the node
   * @returns the message to display to the student that describes how
   * to disable the constraint
   */
  getConstraintMessage(nodeId, constraint) {
    let message = '';

    if (nodeId != null && constraint != null) {
      // get the node title the student is trying to go to
      const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);

      const removalConditional = constraint.removalConditional;
      const removalCriteria = constraint.removalCriteria;

      if (removalCriteria != null) {
        let criteriaMessages = '';
        for (let tempRemovalCriteria of removalCriteria) {
          if (tempRemovalCriteria != null) {
            // get the message that describes the criteria that needs to be satisfied
            const criteriaMessage = this.getCriteriaMessage(tempRemovalCriteria);

            if (criteriaMessage != null && criteriaMessage != '') {
              // separate criteria messages with a line break
              if (criteriaMessages != '') {
                criteriaMessages += '<br/>';
              }
              criteriaMessages += criteriaMessage;
            }
          }
        }
        message += criteriaMessages;
      }
    }
    return message;
  }

  /**
   * Get the human readable description of the constraint.
   * @param constraint The constraint object.
   * @returns A human readable text string that describes the constraint.
   * example
   * 'All steps after this one will not be visitable until the student completes
   * "3.7 Revise Your Bowls Explanation"'
   */
  getConstraintDescription(constraint) {
    let message = '';
    for (const singleRemovalCriteria of constraint.removalCriteria) {
      if (message != '') {
        // this constraint has multiple removal criteria
        if (constraint.removalConditional === 'any') {
          message += ' or ';
        } else if (constraint.removalConditional === 'all') {
          message += ' and ';
        }
      }
      message += this.getCriteriaMessage(singleRemovalCriteria);
    }
    return this.getActionMessage(constraint.action) + message;
  }

  /**
   * Get the constraint action as human readable text.
   * @param action A constraint action.
   * @return A human readable text string that describes the action
   * example
   * 'All steps after this one will not be visitable until '
   */
  getActionMessage(action) {
    if (action === 'makeAllNodesAfterThisNotVisitable') {
      return this.upgrade.$injector.get('$filter')('translate')(
        'allStepsAfterThisOneWillNotBeVisitableUntil'
      );
    }
    if (action === 'makeAllNodesAfterThisNotVisible') {
      return this.upgrade.$injector.get('$filter')('translate')(
        'allStepsAfterThisOneWillNotBeVisibleUntil'
      );
    }
    if (action === 'makeAllOtherNodesNotVisitable') {
      return this.upgrade.$injector.get('$filter')('translate')(
        'allOtherStepsWillNotBeVisitableUntil'
      );
    }
    if (action === 'makeAllOtherNodesNotVisible') {
      return this.upgrade.$injector.get('$filter')('translate')(
        'allOtherStepsWillNotBeVisibleUntil'
      );
    }
    if (action === 'makeThisNodeNotVisitable') {
      return this.upgrade.$injector.get('$filter')('translate')('thisStepWillNotBeVisitableUntil');
    }
    if (action === 'makeThisNodeNotVisible') {
      return this.upgrade.$injector.get('$filter')('translate')('thisStepWillNotBeVisibleUntil');
    }
  }

  /**
   * Get the message that describes how to satisfy the criteria
   * TODO: check if the criteria is satisfied
   * @param criteria the criteria object that needs to be satisfied
   * @returns the message to display to the student that describes how to
   * satisfy the criteria
   */
  getCriteriaMessage(criteria) {
    let message = '';

    if (criteria != null) {
      const name = criteria.name;
      const params = criteria.params;

      if (name === 'isCompleted') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.upgrade.$injector.get('$filter')('translate')('completeNodeTitle', {
            nodeTitle: nodeTitle
          });
        }
      } else if (name === 'isVisited') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.upgrade.$injector.get('$filter')('translate')('visitNodeTitle', {
            nodeTitle: nodeTitle
          });
        }
      } else if (name === 'isCorrect') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.upgrade.$injector.get('$filter')('translate')(
            'correctlyAnswerNodeTitle',
            { nodeTitle: nodeTitle }
          );
        }
      } else if (name === 'score') {
        const nodeId = params.nodeId;
        let nodeTitle = '';
        let scoresString = '';

        if (nodeId != null) {
          nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        }

        const scores = params.scores;
        if (scores != null) {
          scoresString = scores.join(', ');
        }
        message += this.upgrade.$injector.get('$filter')('translate')(
          'obtainAScoreOfXOnNodeTitle',
          {
            score: scoresString,
            nodeTitle: nodeTitle
          }
        );
      } else if (name === 'choiceChosen') {
        const nodeId = params.nodeId;
        const componentId = params.componentId;
        const choiceIds = params.choiceIds;
        let nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        let choices = this.getChoiceTextByNodeIdAndComponentId(nodeId, componentId, choiceIds);
        let choiceText = choices.join(', ');
        message += this.upgrade.$injector.get('$filter')('translate')('chooseChoiceOnNodeTitle', {
          choiceText: choiceText,
          nodeTitle: nodeTitle
        });
      } else if (name === 'usedXSubmits') {
        const nodeId = params.nodeId;
        let nodeTitle = '';

        const requiredSubmitCount = params.requiredSubmitCount;

        if (nodeId != null) {
          nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        }

        if (requiredSubmitCount == 1) {
          message += this.upgrade.$injector.get('$filter')('translate')('submitXTimeOnNodeTitle', {
            requiredSubmitCount: requiredSubmitCount,
            nodeTitle: nodeTitle
          });
        } else {
          message += this.upgrade.$injector.get('$filter')('translate')('submitXTimesOnNodeTitle', {
            requiredSubmitCount: requiredSubmitCount,
            nodeTitle: nodeTitle
          });
        }
      } else if (name === 'branchPathTaken') {
        const fromNodeId = params.fromNodeId;
        const fromNodeTitle = this.getNodePositionAndTitleByNodeId(fromNodeId);
        const toNodeId = params.toNodeId;
        const toNodeTitle = this.getNodePositionAndTitleByNodeId(toNodeId);
        message += this.upgrade.$injector.get('$filter')('translate')('branchPathTakenFromTo', {
          fromNodeTitle: fromNodeTitle,
          toNodeTitle: toNodeTitle
        });
      } else if (name === 'wroteXNumberOfWords') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const requiredNumberOfWords = params.requiredNumberOfWords;
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.upgrade.$injector.get('$filter')('translate')(
            'writeXNumberOfWordsOnNodeTitle',
            {
              requiredNumberOfWords: requiredNumberOfWords,
              nodeTitle: nodeTitle
            }
          );
        }
      } else if (name === 'isVisible') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.upgrade.$injector.get('$filter')('translate')('nodeTitleIsVisible', {
            nodeTitle: nodeTitle
          });
        }
      } else if (name === 'isVisitable') {
        const nodeId = params.nodeId;
        if (nodeId != null) {
          const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
          message += this.upgrade.$injector.get('$filter')('translate')('nodeTitleIsVisitable', {
            nodeTitle: nodeTitle
          });
        }
      } else if (name === 'addXNumberOfNotesOnThisStep') {
        const nodeId = params.nodeId;
        const requiredNumberOfNotes = params.requiredNumberOfNotes;
        const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        if (requiredNumberOfNotes == 1) {
          message += this.upgrade.$injector.get('$filter')('translate')(
            'addXNumberOfNotesOnThisStepSingular',
            {
              requiredNumberOfNotes: requiredNumberOfNotes,
              nodeTitle: nodeTitle
            }
          );
        } else {
          message += this.upgrade.$injector.get('$filter')('translate')(
            'addXNumberOfNotesOnThisStepPlural',
            {
              requiredNumberOfNotes: requiredNumberOfNotes,
              nodeTitle: nodeTitle
            }
          );
        }
      } else if (name === 'fillXNumberOfRows') {
        const requiredNumberOfFilledRows = params.requiredNumberOfFilledRows;
        const nodeId = params.nodeId;
        const nodeTitle = this.getNodePositionAndTitleByNodeId(nodeId);
        if (requiredNumberOfFilledRows == 1) {
          message += this.upgrade.$injector.get('$filter')('translate')('youMustFillInXRow', {
            requiredNumberOfFilledRows: requiredNumberOfFilledRows,
            nodeTitle: nodeTitle
          });
        } else {
          message += this.upgrade.$injector.get('$filter')('translate')('youMustFillInXRows', {
            requiredNumberOfFilledRows: requiredNumberOfFilledRows,
            nodeTitle: nodeTitle
          });
        }
      } else if (name === 'teacherRemoval') {
        message += this.upgrade.$injector.get('$filter')('translate')('waitForTeacherToUnlock');
      }
    }
    return message;
  }

  /**
   * Get the choices of a Multiple Choice component.
   * @param nodeId The node id.
   * @param componentId The component id.
   * @return The choices from the component.
   */
  getChoicesByNodeIdAndComponentId(nodeId, componentId) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    return component.choices;
  }

  /**
   * Get the choice text for the given choice ids of a multiple choice component.
   * @param nodeId The node id of the component.
   * @param componentId The component id of the component.
   * @param choiceIds An array of choice ids.
   * @return An array of choice text strings.
   */
  getChoiceTextByNodeIdAndComponentId(nodeId, componentId, choiceIds) {
    const choicesText = [];
    for (const choice of this.getChoicesByNodeIdAndComponentId(nodeId, componentId)) {
      if (choiceIds.indexOf(choice.id) != -1) {
        choicesText.push(choice.text);
      }
    }
    return choicesText;
  }

  /**
   * Get the start id of a group
   * @param nodeId get the start id of this group
   * @returns the start id of the group
   */
  getGroupStartId(nodeId) {
    return this.getNodeById(nodeId).startId;
  }

  /**
   * Load the inactive nodes
   * @param nodes the inactive nodes
   */
  loadInactiveNodes(nodes) {
    for (const node of nodes) {
      this.setIdToNode(node.id, node);
      if (node.type === 'group') {
        this.inactiveGroupNodes.push(node);
      } else {
        this.inactiveStepNodes.push(node);
      }
    }
  }

  loadConstraints(constraints) {
    for (const constraint of constraints) {
      constraint.active = true;
    }
  }

  /**
   * Check if the target is active
   * @param target the node id or inactiveNodes/inactiveGroups to check
   * @returns whether the target is active
   */
  isActive(target) {
    return target !== 'inactiveNodes' && target !== 'inactiveGroups' && this.isNodeActive(target);
  }

  /**
   * Check if a node is active.
   * @param nodeId the id of the node
   */
  isNodeActive(nodeId) {
    for (const activeNode of this.project.nodes) {
      if (activeNode.id == nodeId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a node generates work by looking at all of its components
   * @param nodeId the node id
   * @return whether the node generates work
   */
  nodeHasWork(nodeId) {
    const node = this.getNodeById(nodeId);
    // TODO: remove need for component null check by ensuring that node always has components
    if (node.components != null) {
      for (const component of node.components) {
        if (this.componentHasWork(component)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if a component generates work
   * @param component check if this component generates work
   * @return whether the component generates work
   */
  componentHasWork(component) {
    const componentType = component.type;
    const componentService = this.getComponentService(componentType);
    if (componentService != null) {
      return componentService.componentHasWork(component);
    }
    return false;
  }

  /**
   * Get a component service
   * @param componentType the component type
   * @return the component service
   */
  getComponentService(componentType) {
    const componentServiceName = componentType + 'Service';
    let componentService = this.componentServices[componentServiceName];
    if (componentService == null) {
      componentService = this.upgrade.$injector.get(componentServiceName);
      this.componentServices[componentServiceName] = componentService;
    }
    return componentService;
  }

  getComponentType(nodeId: string, componentId: string): string {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    return component.type;
  }

  getProjectRubric() {
    return this.project.rubric;
  }

  /**
   * Check if a node is a branch point. A branch point is a node with more
   * than one transition.
   * @param nodeId the node id
   * @return whether the node is a branch point
   */
  isBranchPoint(nodeId) {
    const transitions = this.getTransitionsByFromNodeId(nodeId);
    return transitions != null && transitions.length > 1;
  }

  /**
   * Check if the node is in any branch path
   * @param nodeId the node id of the node
   * @return whether the node is in any branch path
   */
  isNodeInAnyBranchPath(nodeId) {
    let result = false;
    if (this.nodeIdToIsInBranchPath[nodeId] == null) {
      /*
       * we have not calculated whether the node id is in a branch path
       * before so we will now
       */
      result = this.nodeIdsInAnyBranch.indexOf(nodeId) !== -1;

      // remember the result for this node id
      this.nodeIdToIsInBranchPath[nodeId] = result;
    } else {
      /*
       * we have calculated whether the node id is in a branch path
       * before
       */
      result = this.nodeIdToIsInBranchPath[nodeId];
    }
    return result;
  }

  /**
   * Check if a node is a branch start point
   * @param nodeId look for a branch with this start node id
   * @return whether the node is a branch start point
   */
  isBranchStartPoint(nodeId) {
    const branches = this.getBranches();
    if (branches != null) {
      for (let branch of branches) {
        if (branch.branchStartPoint == nodeId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if a node is a branch end point
   * @param nodeId look for a branch with this end node id
   * @return whether the node is a branch end point
   */
  isBranchMergePoint(nodeId) {
    const branches = this.getBranches();
    if (branches != null) {
      for (let branch of branches) {
        if (branch.branchEndPoint == nodeId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get all the branches whose branch start point is the given node id
   * @param nodeId the branch start point
   * @return an array of branches that have the given branch start point
   */
  getBranchesByBranchStartPointNodeId(nodeId) {
    const branches = [];
    const allBranches = this.getBranches();

    if (allBranches != null) {
      for (let branch of allBranches) {
        if (branch != null) {
          if (nodeId == branch.branchStartPoint) {
            /*
             * the branch start point matches the node id we are
             * looking for
             */
            branches.push(branch);
          }
        }
      }
    }
    return branches;
  }

  /**
   * Calculate the node numbers and set them into the nodeIdToNumber map
   * If the step is called "1.5 View the Potential Energy", then the node number is 1.5
   *
   * If this is a branching step that is called "1.5 B View the Potential Energy", then the
   * node number is 1.5 B
   */
  calculateNodeNumbers() {
    this.nodeIdToNumber = {};
    this.nodeIdToBranchPathLetter = {};
    const startNodeId = this.getStartNodeId();
    const currentActivityNumber = 0;
    const currentStepNumber = 0;
    this.calculateNodeNumbersHelper(startNodeId, currentActivityNumber, currentStepNumber);
  }

  /**
   * Recursively calcualte the node numbers by traversing the project tree
   * using transitions
   * @param nodeId the current node id we are on
   * @param currentActivityNumber the current activity number
   * @param currentStepNumber the current step number
   * @param branchLetterCode (optional) the character code for the branch
   * letter e.g. 1=A, 2=B, etc.
   */
  calculateNodeNumbersHelper(
    nodeId,
    currentActivityNumber,
    currentStepNumber,
    branchLetterCode = null
  ) {
    if (nodeId != null) {
      if (this.isApplicationNode(nodeId)) {
        const node = this.getNodeById(nodeId);
        if (node != null) {
          const parentGroup = this.getParentGroup(nodeId);
          if (parentGroup != null) {
            if (this.nodeIdToNumber[parentGroup.id] == null) {
              /*
               * the parent group has not been assigned a number so
               * we will assign a number now
               */

              currentActivityNumber = parseInt(currentActivityNumber) + 1;

              /*
               * set the current step number to 1 now that we have
               * entered a new group
               */
              currentStepNumber = 1;

              this.nodeIdToNumber[parentGroup.id] = '' + currentActivityNumber;
            } else {
              /*
               * the parent group has previously been assigned a number so we
               * will use it
               */
              currentActivityNumber = this.nodeIdToNumber[parentGroup.id];
            }
          }

          if (this.isBranchMergePoint(nodeId)) {
            /*
             * the node is a merge point so we will not use a letter
             * anymore now that we are no longer in a branch path
             */
            branchLetterCode = null;
          }

          if (this.isBranchStartPoint(nodeId)) {
            const branchesByBranchStartPointNodeId = this.getBranchesByBranchStartPointNodeId(
              nodeId
            );
            const branchesObject = branchesByBranchStartPointNodeId[0];

            /*
             * been used in the branch paths so that we know what
             * step number to give the merge end point
             * this is used to obtain the max step number that has
             */
            let maxCurrentStepNumber = 0;

            // set the step number for the branch start point
            this.nodeIdToNumber[nodeId] = currentActivityNumber + '.' + currentStepNumber;

            currentStepNumber++;
            const branchPaths = branchesObject.branchPaths;

            for (let bp = 0; bp < branchPaths.length; bp++) {
              const branchPath = branchPaths[bp];
              let branchCurrentStepNumber = currentStepNumber;

              // get the letter code e.g. 1=A, 2=B, etc.
              const branchLetterCode = bp;

              for (let bpn = 0; bpn < branchPath.length; bpn++) {
                if (bpn == 0) {
                  /*
                   * Recursively call calculateNodeNumbersHelper on the
                   * first step in this branch path. This will recursively
                   * calculate the numbers for all the nodes in this
                   * branch path.
                   */
                  const branchPathNodeId = branchPath[bpn];
                  this.calculateNodeNumbersHelper(
                    branchPathNodeId,
                    currentActivityNumber,
                    branchCurrentStepNumber,
                    branchLetterCode
                  );
                }

                branchCurrentStepNumber++;

                /*
                 * update the max current step number if we have found
                 * a larger number
                 */
                if (branchCurrentStepNumber > maxCurrentStepNumber) {
                  maxCurrentStepNumber = branchCurrentStepNumber;
                }
              }
            }

            // get the step number we should use for the end point
            currentStepNumber = maxCurrentStepNumber;

            const branchEndPointNodeId = branchesObject.branchEndPoint;

            /*
             * calculate the node number for the branch end point and
             * continue calculating node numbers for the nodes that
             * come after it
             */
            this.calculateNodeNumbersHelper(
              branchEndPointNodeId,
              currentActivityNumber,
              currentStepNumber
            );
          } else {
            // the node is not a branch start point

            /*
             * check if we have already set the number for this node so
             * that we don't need to unnecessarily re-calculate the
             * node number
             */
            if (this.nodeIdToNumber[nodeId] == null) {
              // we have not calculated the node number yet

              let number = null;

              if (branchLetterCode == null) {
                // we do not need to add a branch letter

                // get the node number e.g. 1.5
                number = currentActivityNumber + '.' + currentStepNumber;
              } else {
                // we need to add a branch letter

                // get the branch letter
                const branchLetter = String.fromCharCode(65 + branchLetterCode);

                // get the node number e.g. 1.5 A
                number = currentActivityNumber + '.' + currentStepNumber + ' ' + branchLetter;

                // remember the branch path letter for this node
                this.nodeIdToBranchPathLetter[nodeId] = branchLetter;
              }

              // set the number for the node
              this.nodeIdToNumber[nodeId] = number;
            } else {
              /*
               * We have calculated the node number before so we
               * will return. This will prevent infinite looping
               * within the project.
               */
              return;
            }

            // increment the step number for the next node to use
            currentStepNumber++;

            let transitions = [];

            if (node.transitionLogic != null && node.transitionLogic.transitions) {
              transitions = node.transitionLogic.transitions;
            }

            if (transitions.length > 0) {
              /*
               * loop through all the transitions, there should only
               * be one but we will loop through them just to be complete.
               * if there was more than one transition, it would mean
               * this node is a branch start point in which case we
               * would have gone inside the other block of code where
               * this.isBranchStartPoint() is true.
               */
              for (let transition of transitions) {
                if (transition != null) {
                  if (this.isBranchMergePoint(transition.to)) {
                  } else {
                    this.calculateNodeNumbersHelper(
                      transition.to,
                      currentActivityNumber,
                      currentStepNumber,
                      branchLetterCode
                    );
                  }
                }
              }
            } else {
              // if there are no transitions, check if the parent group has a transition

              if (
                parentGroup != null &&
                parentGroup.transitionLogic != null &&
                parentGroup.transitionLogic.transitions != null &&
                parentGroup.transitionLogic.transitions.length > 0
              ) {
                for (let transition of parentGroup.transitionLogic.transitions) {
                  if (transition != null) {
                    this.calculateNodeNumbersHelper(
                      transition.to,
                      currentActivityNumber,
                      currentStepNumber,
                      branchLetterCode
                    );
                  }
                }
              }
            }
          }
        }
      } else {
        // the node is a group node

        const node = this.getNodeById(nodeId);
        if (node != null) {
          // check if the group has previously been assigned a number
          if (this.nodeIdToNumber[nodeId] == null) {
            /*
             * the group has not been assigned a number so
             * we will assign a number now
             */
            if (nodeId == 'group0') {
              // group 0 will always be given the activity number of 0
              this.nodeIdToNumber[nodeId] = '' + 0;
            } else {
              // set the activity number
              currentActivityNumber = parseInt(currentActivityNumber) + 1;

              /*
               * set the current step number to 1 now that we have
               * entered a new group
               */
              currentStepNumber = 1;

              // set the activity number
              this.nodeIdToNumber[nodeId] = '' + currentActivityNumber;
            }
          } else {
            /*
             * We have calculated the node number before so we
             * will return. This will prevent infinite looping
             * within the project.
             */
            return;
          }

          if (node.startId != null && node.startId != '') {
            /*
             * calculate the node number for the first step in this
             * activity and any steps after it
             */
            this.calculateNodeNumbersHelper(
              node.startId,
              currentActivityNumber,
              currentStepNumber,
              branchLetterCode
            );
          } else {
            /*
             * this activity doesn't have a start step so we will
             * look for a transition
             */

            if (
              node != null &&
              node.transitionLogic != null &&
              node.transitionLogic.transitions != null &&
              node.transitionLogic.transitions.length > 0
            ) {
              for (let transition of node.transitionLogic.transitions) {
                if (transition != null) {
                  /*
                   * calculate the node number for the next group
                   * and all its children steps
                   */
                  this.calculateNodeNumbersHelper(
                    transition.to,
                    currentActivityNumber,
                    currentStepNumber,
                    branchLetterCode
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  getProjectScript() {
    return this.project.script;
  }

  /**
   * Get the next node after the specified node
   * @param nodeId get the node id that comes after this one
   * @return the node id that comes after
   */
  getNextNodeId(nodeId) {
    const flattenedNodeIds = this.getFlattenedProjectAsNodeIds();
    if (flattenedNodeIds != null) {
      const indexOfNodeId = flattenedNodeIds.indexOf(nodeId);
      if (indexOfNodeId != -1) {
        const indexOfNextNodeId = indexOfNodeId + 1;
        return flattenedNodeIds[indexOfNextNodeId];
      }
    }
    return null;
  }

  /**
   * Get all the projectAchievements object in the project. The projectAchievements object
   * contains the isEnabled field and an array of items.
   * @return the achievement object
   */
  getAchievements() {
    if (this.project.achievements == null) {
      this.project.achievements = {
        isEnabled: false,
        items: []
      };
    }
    return this.project.achievements;
  }

  /**
   * Get the achievement items in the project
   * @return the achievement items
   */
  getAchievementItems() {
    const achievements = this.getAchievements();
    if (achievements.items == null) {
      achievements.items = [];
    }
    return achievements.items;
  }

  /**
   * Get an achievement by the 10 character alphanumeric achievement id
   * @param achievementId the 10 character alphanumeric achievement id
   * @return the achievement with the given achievement id
   */
  getAchievementByAchievementId(achievementId) {
    if (achievementId != null) {
      const achievements = this.getAchievements();
      if (achievements != null) {
        const achievementItems = achievements.items;
        if (achievementItems != null) {
          for (let achievement of achievementItems) {
            if (achievement != null && achievement.id == achievementId) {
              return achievement;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Get the total number of rubrics (step + components) for the given nodeId
   * @param nodeId the node id
   * @return Number of rubrics for the node
   */
  getNumberOfRubricsByNodeId(nodeId) {
    let numRubrics = 0;
    const node = this.getNodeById(nodeId);
    if (node) {
      const nodeRubric = node.rubric;
      if (nodeRubric != null && nodeRubric != '') {
        numRubrics++;
      }
      const components = node.components;
      if (components && components.length) {
        for (let component of components) {
          if (component) {
            const componentRubric = component.rubric;
            if (componentRubric != null && componentRubric != '') {
              numRubrics++;
            }
          }
        }
      }
    }
    return numRubrics;
  }

  /**
   * Remember the result for whether the node is affected by the constraint
   * @param nodeId the node id
   * @param constraintId the constraint id
   * @param whether the node is affected by the constraint
   */
  cacheIsNodeAffectedByConstraintResult(nodeId, constraintId, result) {
    this.isNodeAffectedByConstraintResult[nodeId + '-' + constraintId] = result;
  }

  /**
   * Check if we have calculated the result for whether the node is affected
   * by the constraint
   * @param nodeId the node id
   * @param constraintId the constraint id
   * @return Return the result if we have calculated the result before. If we
   * have not calculated the result before, we will return null
   */
  getCachedIsNodeAffectedByConstraintResult(nodeId, constraintId) {
    return this.isNodeAffectedByConstraintResult[nodeId + '-' + constraintId];
  }

  /**
   * Get the id to node mappings.
   * @return An object the keys as node ids and the values as nodes.
   */
  getIdToNode() {
    return this.idToNode;
  }

  /**
   * Check if a node has rubrics.
   * @param nodeId The node id of the node.
   * @return Whether the node has rubrics authored on it.
   */
  nodeHasRubric(nodeId) {
    let numberOfRubrics = this.getNumberOfRubricsByNodeId(nodeId);
    if (numberOfRubrics > 0) {
      return true;
    }
    return false;
  }

  getSpaces() {
    if (this.project.spaces != null) {
      return this.project.spaces;
    } else {
      return [];
    }
  }

  isSpaceExists(id) {
    const spaces = this.getSpaces();
    for (let space of spaces) {
      if (space.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns true iff the specified node and component has any registered
   * additionalProcessingFunctions
   * @param nodeId the node id
   * @param componentId the component id
   * @returns true/false
   */
  hasAdditionalProcessingFunctions(nodeId, componentId) {
    return this.getAdditionalProcessingFunctions(nodeId, componentId) != null;
  }

  /**
   * Returns an array of registered additionalProcessingFunctions for the specified node and
   * component
   * @param nodeId the node id
   * @param componentId the component id
   * @returns an array of additionalProcessingFunctions
   */
  getAdditionalProcessingFunctions(nodeId, componentId) {
    return this.additionalProcessingFunctionsMap[`${nodeId}_${componentId}`];
  }

  replaceNode(nodeId, node) {
    this.setIdToNode(nodeId, node);
    const nodes = this.getNodes();
    for (let n = 0; n < nodes.length; n++) {
      if (nodeId === nodes[n].id) {
        nodes.splice(n, 1, node);
        break;
      }
    }
    for (let a = 0; a < this.applicationNodes.length; a++) {
      if (nodeId === this.applicationNodes[a].id) {
        this.applicationNodes.splice(a, 1, node);
      }
    }
  }

  replaceComponent(nodeId, componentId, component) {}

  retrieveScript(scriptFilename) {
    const deferred = this.upgrade.$injector.get('$q').defer();
    deferred.resolve({});
    return deferred.promise;
  }

  getGlobalAnnotationGroupByScore(component, previousScore, currentScore) {}

  getNotificationByScore(component, previousScore, currentScore) {}

  isConnectedComponent(nodeId, componentId, connectedComponentId): boolean {
    return false;
  }

  getConnectedComponentParams(componentContent, componentId) {}

  getTags() {
    let tags = [];
    const nodes = this.getNodes();
    for (const node of nodes) {
      tags = tags.concat(this.getTagsFromNode(node));
    }
    return tags;
  }

  getTagsFromNode(node: any) {
    const tags = [];
    const transitions = this.getTransitionsFromNode(node);
    for (const transition of transitions) {
      const criteriaArray = this.getCriteriaArrayFromTransition(transition);
      for (const singleCriteria of criteriaArray) {
        const tag = this.getTagFromSingleCriteria(singleCriteria);
        if (tag != null) {
          tags.push(tag);
        }
      }
    }
    return tags;
  }

  getTransitionsFromNode(node: any) {
    const transitionLogic = node.transitionLogic;
    if (transitionLogic == null) {
      return [];
    } else {
      return node.transitionLogic.transitions;
    }
  }

  getCriteriaArrayFromTransition(transition: any) {
    if (transition.criteria == null) {
      return [];
    } else {
      return transition.criteria;
    }
  }

  getTagFromSingleCriteria(singleCriteria: any) {
    const params = singleCriteria.params;
    if (params == null) {
      return null;
    } else {
      return this.getTagFromParams(params);
    }
  }

  getTagFromParams(params: any) {
    if (params.tag == null) {
      return null;
    } else {
      return { name: params['tag'] };
    }
  }

  broadcastProjectChanged() {
    this.projectChangedSource.next();
  }

  broadcastSnipImage(args: any) {
    this.snipImageSource.next(args);
  }
}

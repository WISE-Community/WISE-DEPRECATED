'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var ProjectService=function(){function ProjectService($http,$injector,$q,$rootScope,ConfigService){_classCallCheck(this,ProjectService);this.$http=$http;this.$injector=$injector;this.$q=$q;this.$rootScope=$rootScope;this.ConfigService=ConfigService;this.project=null;this.transitions=[];this.applicationNodes=[];this.groupNodes=[];this.idToNode={};this.idToElement={};this.metadata={};this.activeConstraints=[];this.rootNode=null;this.idToPosition={};this.idToOrder={};this.nodeCount=0; // filtering options for navigation displays
this.filters=[{'name':'all','label':'All'}, //{'name': 'todo', 'label': 'Todo'},
//{'name': 'completed', 'label': 'Completed'},
{'name':'bookmark','label':'Bookmarks'} // TODO: Add when bookmarks are active
];}_createClass(ProjectService,[{key:'setProject',value:function setProject(project){this.project=project;this.parseProject();}},{key:'clearProjectFields', /**
     * Initialize the data structures used to hold project information
     */value:function clearProjectFields(){this.transitions=[];this.applicationNodes=[];this.groupNodes=[];this.idToNode={};this.idToElement={};this.metadata={};this.activeConstraints=[];this.rootNode=null;this.idToPosition={};this.idToOrder={};this.nodeCount=0;}},{key:'getStyle',value:function getStyle(){var style='';var project=this.project;if(project!=null){style=project.style;}return style;}},{key:'getFilters',value:function getFilters(){return this.filters;}},{key:'getProjectTitle', /**
     * Returns the name/title of the current project
     */value:function getProjectTitle(){var name=this.getProjectMetadata().title;return name?name:'A WISE Project (No name)';}},{key:'setProjectTitle', /**
     * Set the project title
     */value:function setProjectTitle(projectTitle){var metadata=this.getProjectMetadata();if(metadata!=null){metadata.title=projectTitle;}}},{key:'getProjectMetadata',value:function getProjectMetadata(){return this.metadata?this.metadata:{};}},{key:'getNodes',value:function getNodes(){var nodes=null;var project=this.project;if(project!=null){nodes=project.nodes;}return nodes;}},{key:'getPlanningNodes',value:function getPlanningNodes(){var planningNodes=null;var project=this.project;if(project!=null){planningNodes=project.planningNodes;}return planningNodes;}},{key:'getChildNodeIdsById',value:function getChildNodeIdsById(nodeId){var childIds=[];var node=this.getNodeById(nodeId);if(node.ids){childIds=node.ids;}return childIds;}},{key:'getGroupNodes',value:function getGroupNodes(){return this.groupNodes;}},{key:'isNode',value:function isNode(id){var result=false;var nodes=this.getNodes();if(nodes!=null){for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeId=node.id;if(nodeId===id){result=true;break;}}}}return result;}},{key:'addTransition', // adds or update transition if exists
value:function addTransition(transition){var existingTransitions=this.getTransitions();var replaced=false;for(var t=0;t<existingTransitions.length;t++){var existingTransition=existingTransitions[t];if(existingTransition.id===transition.id){existingTransitions.splice(t,1,transition);replaced=true;}}if(!replaced){existingTransitions.push(transition);}}},{key:'addNode',value:function addNode(node){var existingNodes=this.project.nodes;var replaced=false;if(node!=null&&existingNodes!=null){for(var n=0;n<existingNodes.length;n++){var existingNode=existingNodes[n];var existingNodeId=existingNode.id;if(existingNodeId===node.id){existingNodes.splice(n,1,node);replaced=true;}}}if(!replaced){existingNodes.push(node);}}},{key:'addApplicationNode',value:function addApplicationNode(node){var applicationNodes=this.applicationNodes;if(node!=null&&applicationNodes!=null){applicationNodes.push(node);}}},{key:'addGroupNode',value:function addGroupNode(node){var groupNodes=this.groupNodes;if(node!=null&&groupNodes!=null){groupNodes.push(node);}this.$rootScope.$broadcast('groupsChanged');}},{key:'addNodeToGroupNode',value:function addNodeToGroupNode(groupId,nodeId){if(groupId!=null&&nodeId!=null){var group=this.getNodeById(groupId);if(group!=null){var groupChildNodeIds=group.ids;if(groupChildNodeIds!=null){if(groupChildNodeIds.indexOf(nodeId)===-1){groupChildNodeIds.push(nodeId);}}}}}},{key:'isGroupNode',value:function isGroupNode(id){var result=false;var groupNode=this.getNodeById(id);if(groupNode!=null){var type=groupNode.type;if(type==='group'){result=true;}}return result;}},{key:'isApplicationNode',value:function isApplicationNode(id){var result=false;var applicationNode=this.getNodeById(id);if(applicationNode!=null){var type=applicationNode.type;if(type!=='group'){result=true;}}return result;}},{key:'getGroups',value:function getGroups(){return this.groupNodes;}},{key:'loadNodes',value:function loadNodes(nodes){if(nodes!=null){for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeId=node.id;var nodeType=node.type;var content=node.content;var constraints=node.constraints;if(content!=null){ //node.content = this.injectAssetPaths(content);
}this.setIdToNode(nodeId,node);this.setIdToElement(nodeId,node);this.addNode(node);if(nodeType==='group'){this.addGroupNode(node);}else {this.addApplicationNode(node);}var groupId=node.groupId;if(groupId!=null){this.addNodeToGroupNode(groupId,nodeId);}if(constraints!=null){for(var c=0;c<constraints.length;c++){var constraint=constraints[c];this.activeConstraints.push(constraint);}}}}}}},{key:'loadPlanningNodes', /**
     * Load the planning template nodes
     * @param planning template nodes
     */value:function loadPlanningNodes(planningNodes){if(planningNodes!=null){ // loop through all the planning template nodes
for(var p=0;p<planningNodes.length;p++){var planningNode=planningNodes[p];if(planningNode!=null){var nodeId=planningNode.id;this.setIdToNode(nodeId,planningNode);this.setIdToElement(nodeId,planningNode); // TODO: may need to add more function calls here to add the planning
}}}}},{key:'parseProject',value:function parseProject(){var project=this.project;if(project!=null){ // clear and initialize our project data structures
this.clearProjectFields();if(project.metadata){this.metadata=project.metadata;}var nodes=project.nodes;this.loadNodes(nodes); // load the planning node templates
var planningNodes=project.planningNodes;this.loadPlanningNodes(planningNodes); // load the inactive nodes
var inactiveNodes=project.inactiveNodes;this.loadInactiveNodes(inactiveNodes);var constraints=project.constraints;if(constraints!=null){for(var c=0;c<constraints.length;c++){var constraint=constraints[c];if(constraint!=null){var constraintId=constraint.id;constraint.active=true;this.setIdToElement(constraintId,constraint);}}} // set root node
this.rootNode=this.getRootNode(nodes[0].id); // set project order
this.setNodeOrder(this.rootNode,this.nodeCount); //this.nodeCount = 0;
var n=nodes.length;var branches=this.getBranches();var branchNodeIds=[]; // set node positions
var id,pos;while(n--){id=nodes[n].id;if(id===this.rootNode.id){this.setIdToPosition(id,'0');}else if(this.isNodeIdInABranch(branches,id)){ // node is in a branch, so process later
branchNodeIds.push(id);}else {pos=this.getPositionById(id);this.setIdToPosition(id,pos);}} // set branch node positions
var b=branchNodeIds.length;while(b--){id=branchNodeIds[b];pos=this.getBranchNodePositionById(id);this.setIdToPosition(id,pos);}}}},{key:'setNodeOrder',value:function setNodeOrder(node){this.idToOrder[node.id]={'order':this.nodeCount};this.nodeCount++;if(this.isGroupNode(node.id)){var childIds=node.ids;for(var i=0;i<childIds.length;i++){var child=this.getNodeById(childIds[i]);this.setNodeOrder(child);}}}},{key:'getPositionById', /**
     * Returns the position in the project for the node with the given id. Returns null if no node with id exists.
     * @param id a node id
     * @return string position of the given node id in the project
     */value:function getPositionById(id){for(var i=0;i<this.rootNode.ids.length;i++){var node=this.getNodeById(this.rootNode.ids[i]);var path=this.getPathToNode(node,i+1,id);if(path!=undefined&&path!=null){return path;}}return null;}},{key:'getOrderById', /**
     * Returns the order of the given node id in the project. Returns null if no node with id exists.
     * @param id String node id
     * @return Number order of the given node id in the project
     */value:function getOrderById(id){if(this.idToOrder[id]){return this.idToOrder[id].order;}return null;}},{key:'getIdByOrder', /**
     * Returns the id of the node with the given order in the project. Returns null if no order with node exists.
     * @param order Number
     * @return Number node id of the given order in the project
     */value:function getIdByOrder(order){var nodeId=null;for(var id in this.idToOrder){if(this.idToOrder[id].order===order){if(this.isGroupNode(id)&&order>1){nodeId=this.getIdByOrder(order-1);}else {nodeId=id;}break;}}return nodeId;}},{key:'getBranchNodePositionById', /**
     * Returns the position in the project for the branch node with the given id. Returns null if no node with id exists or node is not a branch node.
     * @param id a node id
     * @return string position of the given node id in the project
     */value:function getBranchNodePositionById(id){var branches=this.getBranches();var b=branches.length; // TODO: should we localize this? should we support more than 26?
var integerToAlpha=function integerToAlpha(int){var alphabet=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];if(int>-1&&int<26){return alphabet[int];}else {return int;}};while(b--){var branch=branches[b];var branchPaths=branch.branchPaths;for(var p=0;p<branchPaths.length;p++){var branchPath=branchPaths[p];var nodeIndex=branchPath.indexOf(id);if(nodeIndex>-1){var startPoint=branch.branchStartPoint;var startPointPos=this.idToPosition[startPoint];var branchPathPos=startPointPos+' '+integerToAlpha(p);return branchPathPos+(nodeIndex+1);}}}return null;}},{key:'getPathToNode', /**
     * Recursively searches for the given node id from the point of the given node down and returns the path number (position)
     * @param node a node to start searching down
     * @param path the position of the given node
     * @param id the node id to search for
     * @return string path of the given node id in the project
     */value:function getPathToNode(node,path,id){if(node.id===id){return path+'';}else if(node.type==='group'){var num=0;var branches=this.getBranches();for(var i=0;i<node.ids.length;i++){var nodeId=node.ids[i];if(this.isNodeIdInABranch(branches,nodeId)){this.getBranchNodePositionById(nodeId);}else {++num;var pos=this.getPathToNode(this.getNodeById(nodeId),path+'.'+num,id);if(pos){return pos;}}}}}},{key:'setIdToPosition',value:function setIdToPosition(id,pos){if(id!=null){this.idToPosition[id]=pos;}}},{key:'getNodePositionById',value:function getNodePositionById(id){if(id!=null){return this.idToPosition[id];}}},{key:'setIdToNode',value:function setIdToNode(id,element){if(id!=null){this.idToNode[id]=element;}}},{key:'setIdToElement',value:function setIdToElement(id,element){if(id!=null){this.idToElement[id]=element;}}},{key:'injectAssetPaths', /**
     * Replace relative asset paths with absolute paths
     * e.g.
     * assets/myimage.jpg
     * will be replaced with
     * http://wise.berkeley.edu/curriculum/123456/assets/myimage.jpg
     * @param content a string or JSON object
     * @return the same type of object that was passed in as the content
     * but with relative asset paths replaced with absolute paths
     */value:function injectAssetPaths(content){if(content!=null){if((typeof content==='undefined'?'undefined':_typeof(content))==='object'){var contentString=JSON.stringify(content);if(contentString!=null){ // replace the relative asset paths with the absolute paths
contentString=this.replaceAssetPaths(contentString);content=JSON.parse(contentString);}}else if(typeof content==='string'){ // replace the relative asset paths with the absolute paths
content=this.replaceAssetPaths(content);}}return content;}},{key:'replaceAssetPaths', /**
     * Replace the relative asset paths with absolute paths
     * @param contentString the content string
     * @return the content string with relative asset paths replaced
     * with absolute asset paths
     */value:function replaceAssetPaths(contentString){if(contentString!=null){ // get the content base url e.g. http://wise.berkeley.edu/curriculum/123456/
var contentBaseURL=this.ConfigService.getConfigParam('projectBaseURL'); // only look for string that starts with ' or " and ends in png, jpg, jpeg, pdf, etc.
// the string we're looking for can't start with '/ and "/.
// note that this also works for \"abc.png and \'abc.png, where the quotes are escaped
contentString=contentString.replace(new RegExp('(\'|\"|\\\\\'|\\\\\")[^:][^\/]?[^\/]?[a-zA-Z0-9@\\._\\/\\s\\-]*[\.](png|jpe?g|pdf|gif|mov|mp4|mp3|wav|swf|css|txt|json|xlsx?|doc|html|js)(\'|\"|\\\\\'|\\\\\")','gi'),function(matchedString){ // once found, we prepend the contentBaseURL + "assets/" to the string within the quotes and keep everything else the same.
var delimiter='';var matchedStringWithoutQuotes='';if(matchedString.length>2&&matchedString.substr(0,1)=='\\'){ // the string has escaped quotes for example \"hello.png\"
// get everything between the escaped quotes
matchedStringWithoutQuotes=matchedString.substr(2,matchedString.length-4); // get the delimiter which will be \' or \"
delimiter=matchedString.substr(0,2);}else { // the string does not have escaped qoutes for example "hello.png"
// get everything between the quotes
matchedStringWithoutQuotes=matchedString.substr(1,matchedString.length-2); // get the delimiter which will be ' or "
delimiter=matchedString.substr(0,1);} //var matchedStringWithoutFirstAndLastQuote = matchedString.substr(1, matchedString.length - 2);  // everything but the beginning and end quote (' or ")
// make a new string with the contentBaseURL + assets/ prepended to the path
return delimiter+contentBaseURL+"assets/"+matchedStringWithoutQuotes+delimiter;});}return contentString;}},{key:'injectClickToSnipImage', /**
     * Inject the ng-click attribute that will call the snipImage function
     * @param content the content
     * @returns the modified content
     */value:function injectClickToSnipImage(content){if(content!=null){if((typeof content==='undefined'?'undefined':_typeof(content))==='object'){var contentString=JSON.stringify(content);if(contentString!=null){ // replace the relative asset paths with the absolute paths
contentString=this.injectClickToSnipImageIntoContentString(contentString);content=JSON.parse(contentString);}}else if(typeof content==='string'){ // replace the relative asset paths with the absolute paths
content=this.injectClickToSnipImageIntoContentString(content);}}return content;} /**
     * Inject the ng-click attribute that will call the snipImage function
     * @param contentString the content in string format
     * @returns the modified content string
     */},{key:'injectClickToSnipImageIntoContentString',value:function injectClickToSnipImageIntoContentString(contentString){if(contentString!=null){ // regex to match image elements
var imgMatcher=new RegExp('<img.*?src=\\\\?[\'"](.*?)\\\\?[\'"].*?>','gi'); // replace all instances that match
contentString=contentString.replace(imgMatcher,function(matchedString,matchGroup1){ /*
                     * insert the ng-click attribute
                     * Before: <img src="abc.png"/>
                     * After: <img ng-click="vleController.snipImage($event)"/>
                     */var newString=matchedString.replace('img','img ng-click=\\\"vleController.snipImage($event)\\\"');return newString;});}return contentString;} /**
     * Returns the node specified by the nodeId
     * Return null if nodeId param is null or the specified node does not exist in the project.
     */},{key:'getNodeById',value:function getNodeById(nodeId){var element=null;if(nodeId!=null&&this.idToNode[nodeId]){element=this.idToNode[nodeId];}return element;}},{key:'getNodeTitleByNodeId', /**
     * Returns the title of the node with the nodeId
     * Return null if nodeId param is null or the specified node does not exist in the project.
     */value:function getNodeTitleByNodeId(nodeId){var title=null;var node=this.getNodeById(nodeId);if(node!=null){title=node.title;}return title;}},{key:'getNodePositionAndTitleByNodeId', /**
     * Get the node position and title
     * @param nodeId the node id
     * @returns the node position and title, e.g. "1.1 Introduction"
     */value:function getNodePositionAndTitleByNodeId(nodeId){var title=null;var node=this.getNodeById(nodeId);if(node!=null){var position=this.getNodePositionById(nodeId);if(position!=null){title=position+': '+node.title;}else {title=node.title;}}return title;}},{key:'getNodeIconByNodeId',value:function getNodeIconByNodeId(nodeId){var node=this.getNodeById(nodeId);var nodeIcon=null;if(node!=null){var nodeType=node.type; // set defaults (TODO: get from configService?)
var defaultName=nodeType==='group'?'explore':'school';nodeIcon={color:'rgba(0,0,0,0.54)',type:'font',fontSet:'material-icons',fontName:defaultName,imgSrc:'',imgAlt:'node icon'}; // TODO: check for different statuses
var icons=node.icons;if(!!icons&&!!icons.default){var icon=icons.default;nodeIcon=$.extend(true,nodeIcon,icon);} // check for empty image source
if(!nodeIcon.imgSrc){ // revert to font icon
nodeIcon.type='font';}}return nodeIcon;}},{key:'getParentGroup',value:function getParentGroup(nodeId){var result=null;if(nodeId!=null){var node=this.getNodeById(nodeId);if(node!=null){var groupNodes=this.getGroupNodes();for(var g=0;g<groupNodes.length;g++){var groupNode=groupNodes[g];if(this.isNodeDirectChildOfGroup(node,groupNode)){result=groupNode;break;}}}}return result;}},{key:'getParentGroupId', /**
     * Get the parent group id
     * @param nodeId the parent group id
     * @returns the parent group id
     */value:function getParentGroupId(nodeId){var parentGroupId=null;if(nodeId!=null){var parentGroup=this.getParentGroup(nodeId);if(parentGroup!=null){parentGroupId=parentGroup.id;}}return parentGroupId;}},{key:'getNodeDepth',value:function getNodeDepth(nodeId,val){var result=null;if(nodeId!=null){var depth=typeof val==="number"?val:0;var parent=this.getParentGroup(nodeId);if(parent){depth=this.getNodeDepth(parent.id,depth+1);}result=depth;}return result;}},{key:'getRootNode',value:function getRootNode(nodeId){var result=null;var parentGroup=this.getParentGroup(nodeId);if(parentGroup==null){result=this.getNodeById(nodeId);}else {result=this.getRootNode(parentGroup.id);}return result;}},{key:'isNodeDirectChildOfGroup',value:function isNodeDirectChildOfGroup(node,group){var result=false;if(node!=null&&group!=null){var nodeId=node.id;var groupIds=group.ids;if(groupIds!=null&&groupIds.indexOf(nodeId)!=-1){result=true;}}return result;}},{key:'isNodeDescendentOfGroup',value:function isNodeDescendentOfGroup(node,group){var result=false;if(node!=null&&group!=null){var descendents=this.getDescendentsOfGroup(group);var nodeId=node.id;if(descendents.indexOf(nodeId)!=-1){result=true;}}return result;}},{key:'getDescendentsOfGroup',value:function getDescendentsOfGroup(group){var descendents=[];if(group!=null){var childIds=group.ids;if(childIds!=null){descendents=childIds;for(var c=0;c<childIds.length;c++){var childId=childIds[c];var node=this.getNodeById(childId);if(node!=null){var childDescendents=this.getDescendentsOfGroup(node);descendents=descendents.concat(childDescendents);}}}}return descendents;}},{key:'isStartNode',value:function isStartNode(node){var result=false;if(node!=null){var nodeId=node.id;var projectStartId=this.getStartNodeId();if(nodeId===projectStartId){result=true;}var groups=this.getGroups();for(var g=0;g<groups.length;g++){var group=groups[g];if(group!=null){var groupStartId=group.startId;if(nodeId===groupStartId){result=true;break;}}}}return result;}},{key:'getStartNodeId', /**
     * Returns the Project's start node id, or null if it's not defined in the project
     */value:function getStartNodeId(){var startNodeId=null;var project=this.project;if(project!=null){startNodeId=project.startNodeId;}return startNodeId;}},{key:'setStartNodeId', /**
     * Set the start node id
     * @param nodeId the new start node id
     */value:function setStartNodeId(nodeId){if(nodeId!=null){var project=this.project;if(project!=null){project.startNodeId=nodeId;}}} /**
     * Get the start group id
     * @return the start group id
     */},{key:'getStartGroupId',value:function getStartGroupId(){var startGroupId=null;var project=this.project;if(project!=null){startGroupId=project.startGroupId;}return startGroupId;} /**
     * Check if the given node id is the start node id
     * @return whether the node id is the start node id
     */},{key:'isStartNodeId',value:function isStartNodeId(nodeId){var result=false;var project=this.project;if(project!=null){var startNodeId=project.startNodeId;if(nodeId===startNodeId){result=true;}}return result;}},{key:'getConstraintsForNode',value:function getConstraintsForNode(node){var constraints=[];var allConstraints=this.activeConstraints;for(var c=0;c<allConstraints.length;c++){var constraint=allConstraints[c];if(this.isNodeAffectedByConstraint(node,constraint)){constraints.push(constraint);}}return constraints;}},{key:'isNodeAffectedByConstraint', /**
     * Check if a node is affected by the constraint
     * @param node check if the node is affected
     * @param constraint the constraint that might affect the node
     * @returns whether the node is affected by the constraint
     */value:function isNodeAffectedByConstraint(node,constraint){var result=false;if(node!=null&&constraint!=null){var nodeId=node.id;var targetId=constraint.targetId;var action=constraint.action;if(action==='makeAllNodesAfterThisNotVisible'){if(this.isNodeIdAfter(targetId,node.id)){result=true;}}else if(action==='makeAllNodesAfterThisNotVisitable'){if(this.isNodeIdAfter(targetId,node.id)){result=true;}}else {var targetNode=this.getNodeById(targetId);if(targetNode!=null){var nodeType=targetNode.type;if(nodeType==='node'){ // the target is an application
if(nodeId===targetId){result=true;}}else if(nodeType==='group'){ // the target is a group
if(this.isNodeDescendentOfGroup(node,targetNode)){result=true;}}}}}return result;}},{key:'isNodeIdAfter', /**
     * Check if a node id comes after another node id in the project
     * @param nodeIdBefore the node id before
     * @param nodeIdAfter the node id after
     */value:function isNodeIdAfter(nodeIdBefore,nodeIdAfter){var result=false;if(nodeIdBefore!=null&&nodeIdAfter!=null){if(this.isApplicationNode(nodeIdBefore)){ // the node id before is a step
// get all the paths from the beforeNodeId to the end of the project
var pathsToEnd=this.getAllPaths([],nodeIdBefore,true);if(pathsToEnd!=null){ // loop through all the paths
for(var p=0;p<pathsToEnd.length;p++){var pathToEnd=pathsToEnd[p];if(pathToEnd!=null){ /*
                             * remove the first node id and its parent id because
                             * we will check the remaining node ids in the array
                             * for the nodeIdAfter
                             */ // get the index of the node id before
var index=pathToEnd.indexOf(nodeIdBefore);if(index!=-1){ // remove the node id before
pathToEnd.splice(index,1);} // get the parent group of the node id before
var parentGroup=this.getParentGroup(nodeIdBefore);if(parentGroup!=null){ // remove the parent group of the node id before
var parentGroupId=parentGroup.id;var parentGroupIndex=pathToEnd.indexOf(parentGroupId);if(parentGroupIndex!=-1){pathToEnd.splice(parentGroupIndex,1);}}if(pathToEnd.indexOf(nodeIdAfter)!=-1){ // we have found the nodeIdAfter in the path to the end of the project
result=true;}}}}}else { // the node id before is an activity
// get the group
var group=this.getNodeById(nodeIdBefore);if(group!=null){ // get the transitions from the group
var transitions=this.getTransitionsByFromNodeId(nodeIdBefore);if(transitions!=null){ // loop through all the transitions
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var toNodeId=transition.to; // get the paths between to toNodeId and the end of the project
var pathsToEnd=this.getAllPaths([],toNodeId,true); // loop through all the paths
for(var p=0;p<pathsToEnd.length;p++){ // get a path
var pathToEnd=pathsToEnd[p];if(pathToEnd!=null){if(pathToEnd.indexOf(nodeIdAfter)!=-1){ // we have found the nodeIdAfter in the path to the end of the project
result=true;}}}}}}}}}return result;}},{key:'getNavigationMode',value:function getNavigationMode(){var navigationMode=null;var project=this.project;if(project!=null){navigationMode=project.navigationMode;}return navigationMode;}},{key:'getTransitions',value:function getTransitions(){var transitions=null;var project=this.project;if(project!=null){transitions=project.transitions;}return transitions;}},{key:'getPossibleTransitionCriteria', /**
     * Returns all possible transition criteria for the specified node and component.
     */value:function getPossibleTransitionCriteria(nodeId,componentId){var component=this.getComponentByNodeIdAndComponentId(nodeId,componentId);if(component!=null){var componentType=component.type;var componentService=this.$injector.get(componentType+'Service');if(componentService.getPossibleTransitionCriteria){return componentService.getPossibleTransitionCriteria(nodeId,componentId,component);}else {return [];}}else {return [];}}},{key:'getTransitionLogicByFromNodeId', /**
     * Get the transition logic for a node
     * @param fromNodeId the from node id
     * @returns the transition logic object
     */value:function getTransitionLogicByFromNodeId(fromNodeId){var transitionLogic=null;if(fromNodeId!=null){ // get the node
var node=this.getNodeById(fromNodeId);if(node!=null){ // get the transition logic
transitionLogic=node.transitionLogic;}}return transitionLogic;}},{key:'getTransitionsByFromNodeId', /**
     * Get the transitions for a node
     * @param fromNodeId the node to get transitions from
     * @returns an array of transitions
     */value:function getTransitionsByFromNodeId(fromNodeId){var transitions=null;if(fromNodeId!=null){ // get the transition logic
var transitionLogic=this.getTransitionLogicByFromNodeId(fromNodeId);if(transitionLogic!=null){ // get the transitions
transitions=transitionLogic.transitions;}}return transitions;} /**
     * Get nodes that have a transition to the given node id
     * @param toNodeId the node id
     * @returns an array of node objects that transition to the
     * given node id
     */},{key:'getNodesByToNodeId',value:function getNodesByToNodeId(toNodeId){var nodesByToNodeId=[];if(toNodeId!=null){ // get all the nodes
var nodes=this.project.nodes; // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null){ // loop through all the transitions for the node
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){if(toNodeId===transition.to){ // this node has a transition to the node id
nodesByToNodeId.push(node);}}}}}}}return nodesByToNodeId;}},{key:'getNodeIdsByToNodeId', /**
     * Get node ids of all the nodes that have a to transition to the given node id
     * @param toNodeId
     * @returns all the node ids that have a transition to the given node id
     */value:function getNodeIdsByToNodeId(toNodeId){var nodeIds=[]; // get all the nodes that transition to the toNodeId
var nodes=this.getNodesByToNodeId(toNodeId);if(nodes!=null){ // loop through all the nodes to get the node ids
for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){nodeIds.push(node.id);}}}return nodeIds;} /**
     * Get the group nodes that point to a given node id
     * @param toNodeId
     */},{key:'getGroupNodesByToNodeId',value:function getGroupNodesByToNodeId(toNodeId){var groupsThatPointToNodeId=[];if(toNodeId!=null){var groups=this.getGroups();for(var g=0;g<groups.length;g++){var group=groups[g];if(group!=null){if(this.hasTransitionTo(group,toNodeId)){groupsThatPointToNodeId.push(group);}}}}return groupsThatPointToNodeId;} /**
     * Check if a node has a transition to a node id
     * @param node check if this node has a transition to the node id
     * @param toNodeId we will look for a transition to this node id
     * @returns whether the node has a transition to the node id
     */},{key:'hasTransitionTo',value:function hasTransitionTo(node,toNodeId){var result=false;if(node!=null&&toNodeId!=null){var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null){for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(toNodeId===transition.to){result=true;}}}}}return result;} /**
     * Get the transitions that traverse from the fromNodeId and to the toNodeId
     * @param fromNodeId the from node id
     * @param toNodeId the to node id
     * @returns an array of transitions that traverse from the fromNodeId and
     * to the toNodeId
     */},{key:'getTransitionsByFromAndToNodeId',value:function getTransitionsByFromAndToNodeId(fromNodeId,toNodeId){var transitionsResults=[];if(fromNodeId!=null&&toNodeId!=null){var node=this.getNodeById(fromNodeId);if(node!=null){var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null){for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var to=transition.to;if(toNodeId===to){transitionsResults.push(transition);}}}}}}}return transitionsResults;}},{key:'retrieveProject', /**
     * Retrieves the project JSON from Config.projectURL and returns it.
     * If Config.projectURL is undefined, returns null.
     */value:function retrieveProject(){var _this=this;var projectURL=this.ConfigService.getConfigParam('projectURL');if(projectURL==null){return null;}else { /*
             * add a unique GET parameter value so that it always retrieves the
             * latest version of the project file from the server and never
             * retrieves the project from cache.
             */projectURL+='?noCache='+new Date().getTime();}return this.$http.get(projectURL).then(function(result){var projectJSON=result.data;_this.setProject(projectJSON);return projectJSON;});}},{key:'saveProject', /**
     * Saves the project to Config.saveProjectURL and returns commit history promise.
     * if Config.saveProjectURL or Config.projectId are undefined, does not save and returns null
     */value:function saveProject(){var commitMessage=arguments.length<=0||arguments[0]===undefined?"Made changes via WISE5 Authoring Tool":arguments[0]; // perform any cleanup before saving the project
this.cleanupBeforeSave();var projectId=this.ConfigService.getProjectId();var saveProjectURL=this.ConfigService.getConfigParam('saveProjectURL');if(projectId==null||saveProjectURL==null){return null;} // Get the project from this service
var projectJSONString=angular.toJson(this.project,4);var httpParams={};httpParams.method='POST';httpParams.url=saveProjectURL;httpParams.headers={'Content-Type':'application/x-www-form-urlencoded'};var params={};params.projectId=projectId;params.commitMessage=commitMessage;params.projectJSONString=projectJSONString;httpParams.data=$.param(params);return this.$http(httpParams).then(function(result){var commitHistory=result.data;return commitHistory;});}},{key:'getCurrentAuthors', /**
     * Get the current authors for this project
     * @param projectId
     */value:function getCurrentAuthors(){var _this2=this;var projectId=arguments.length<=0||arguments[0]===undefined?null:arguments[0];return this.$q(function(resolve,reject){if(projectId==null){if(_this2.project!=null){projectId=_this2.ConfigService.getProjectId();}else { // we're not editing any projects, so there are no authors
resolve([]);}}var notifyProjectEndURL=_this2.ConfigService.getConfigParam('getCurrentAuthorsURL')+projectId;var httpParams={};httpParams.method='GET';httpParams.url=notifyProjectEndURL;_this2.$http(httpParams).then(function(result){resolve(result.data);});});}},{key:'notifyAuthorProjectBegin', /**
     * Notifies others that the specified project is being authored
     * @param projectId id of the project
     */value:function notifyAuthorProjectBegin(){var projectId=arguments.length<=0||arguments[0]===undefined?null:arguments[0];if(projectId==null){if(this.project!=null){projectId=this.project.id;}else {return;}}var notifyProjectBeginURL=this.ConfigService.getConfigParam('notifyProjectBeginURL')+projectId;var httpParams={};httpParams.method='POST';httpParams.url=notifyProjectBeginURL;return this.$http(httpParams).then(function(result){var otherAuthors=result.data;return otherAuthors;});} /**
     * Notifies others that the specified project is being authored
     * @param projectId id of the project
     */},{key:'notifyAuthorProjectEnd',value:function notifyAuthorProjectEnd(){var _this3=this;var projectId=arguments.length<=0||arguments[0]===undefined?null:arguments[0];return this.$q(function(resolve,reject){if(projectId==null){if(_this3.project!=null){projectId=_this3.ConfigService.getProjectId();}else {resolve();}}var notifyProjectEndURL=_this3.ConfigService.getConfigParam('notifyProjectEndURL')+projectId;var httpParams={};httpParams.method='POST';httpParams.url=notifyProjectEndURL;_this3.$http(httpParams).then(function(){resolve();});});} /**
     * Perform any necessary cleanup before we save the project.
     * For example we need to remove the checked field in the inactive node
     * objects.
     */},{key:'cleanupBeforeSave',value:function cleanupBeforeSave(){var inactiveNodes=this.project.inactiveNodes;if(inactiveNodes!=null){ // loop through all the inactive nodes
for(var i=0;i<inactiveNodes.length;i++){var inactiveNode=inactiveNodes[i];if(inactiveNode!=null){ // remove the checked field
delete inactiveNode.checked;}}}} /**
     * Copies the project with the specified id and returns a new project id if the project is
     * successfully copied
     */},{key:'copyProject',value:function copyProject(projectId){var copyProjectURL=this.ConfigService.getConfigParam('copyProjectURL');if(copyProjectURL==null){return null;}var httpParams={};httpParams.method='POST';httpParams.url=copyProjectURL+"/"+projectId;httpParams.headers={'Content-Type':'application/x-www-form-urlencoded'};var params={};httpParams.data=$.param(params);return this.$http(httpParams).then(function(result){var projectId=result.data;return projectId;});}},{key:'registerNewProject', /**
     * Registers a new project having the projectJSON content with the server.
     * Returns a new project Id if the project is successfully registered.
     * Returns null if Config.registerNewProjectURL is undefined.
     * Throws an error if projectJSONString is invalid JSON string
     */value:function registerNewProject(projectJSONString,commitMessage){var registerNewProjectURL=this.ConfigService.getConfigParam('registerNewProjectURL');if(registerNewProjectURL==null){return null;}try{ // Try parsing the JSON string and throw an error if there's an issue parsing it.
JSON.parse(projectJSONString);}catch(e){throw new Error("Invalid projectJSONString.");}if(!commitMessage){commitMessage="";}var httpParams={};httpParams.method='POST';httpParams.url=registerNewProjectURL;httpParams.headers={'Content-Type':'application/x-www-form-urlencoded'};var params={};params.commitMessage=commitMessage;params.projectJSONString=projectJSONString;httpParams.data=$.param(params);return this.$http(httpParams).then(function(result){var projectId=result.data;return projectId;});}},{key:'getCommitHistory', /**
     * Retrieves and returns the project's commit history.
     */value:function getCommitHistory(){var commitProjectURL=this.ConfigService.getConfigParam('commitProjectURL');return this.$http({url:commitProjectURL,method:'GET'}).then(function(result){return result.data;});}},{key:'getThemePath', /**
     * Returns the theme path for the current project
     */value:function getThemePath(){var wiseBaseURL=this.ConfigService.getWISEBaseURL();var project=this.project;if(project&&project.theme){ // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
return wiseBaseURL+'/wise5/themes/'+project.theme;}else { // TODO: get default theme name from ConfigService
return wiseBaseURL+'/wise5/themes/default';}}},{key:'getThemeSettings', /**
     * Returns the theme settings for the current project
     */value:function getThemeSettings(){var themeSettings={};var project=this.project;if(project&&project.themeSettings){if(project.theme){ // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
themeSettings=project.themeSettings[project.theme];}else { // TODO: get default theme name from ConfigService
themeSettings=project.themeSettings["default"];}}return themeSettings?themeSettings:{};}},{key:'getFlattenedProjectAsNodeIds', /**
     * Flatten the project to obtain a list of node ids
     */value:function getFlattenedProjectAsNodeIds(){var nodeIds=[]; // get the start node id
var startNodeId=this.getStartNodeId(); /*
         * an array to keep track of the node ids in the path that
         * we are currently on as we traverse the nodes in the project
         * depth first
         */var pathsSoFar=[]; // get all the possible paths through the project
var allPaths=this.getAllPaths(pathsSoFar,startNodeId); // consolidate all the paths to create a single list of node ids
nodeIds=this.consolidatePaths(allPaths); //nodeIds = this.consolidatePaths(allPaths.reverse());
return nodeIds;}},{key:'getAllPaths', /**
     * Get all the possible paths through the project. This function
     * recursively calls itself to traverse the project depth first.
     * @param pathSoFar the node ids in the path so far. the node ids
     * in this array are referenced to make sure we don't loop back
     * on the path.
     * @param nodeId the node id we want to get the paths from
     * @param includeGroups whether to include the group node ids in the paths
     * @return an array of paths. each path is an array of node ids.
     */value:function getAllPaths(pathSoFar,nodeId,includeGroups){var allPaths=[];if(nodeId!=null){if(this.isApplicationNode(nodeId)){ // the node is an application node
var path=[]; // get all the transitions from this node
var transitions=this.getTransitionsByFromNodeId(nodeId);if(transitions!=null){if(includeGroups){ // get the parent group
var parentGroup=this.getParentGroup(nodeId);if(parentGroup!=null){ // get the parent group id
var parentGroupId=parentGroup.id;if(parentGroupId!=null&&pathSoFar.indexOf(parentGroupId)==-1){ // add the parent group id
pathSoFar.push(parentGroup.id);}}} /*
                     * add the node id to the path so far so we can later check
                     * which nodes are already in the path to prevent looping
                     * back in the path
                     */pathSoFar.push(nodeId);if(transitions.length===0){ /*
                         * there are no transitions from the node id so we will
                         * look for a transition in the parent group
                         */var addedCurrentNodeId=false;var parentGroupId=this.getParentGroupId(nodeId);var parentGroupTransitions=this.getTransitionsByFromNodeId(parentGroupId);if(parentGroupTransitions!=null){for(var p=0;p<parentGroupTransitions.length;p++){var parentGroupTransition=parentGroupTransitions[p];if(parentGroupTransition!=null){var toNodeId=parentGroupTransition.to;if(pathSoFar.indexOf(toNodeId)==-1){ /*
                                         * recursively get the paths by getting all
                                         * the paths for the to node
                                         */var allPathsFromToNode=this.getAllPaths(pathSoFar,toNodeId,includeGroups);for(var a=0;a<allPathsFromToNode.length;a++){ // get a path
var tempPath=allPathsFromToNode[a]; // prepend the current node id to the path
tempPath.unshift(nodeId); // add the path to our collection of paths
allPaths.push(tempPath);addedCurrentNodeId=true;}}}}}if(!addedCurrentNodeId){ /*
                             * if the parent group doesn't have any transitions we will
                             * need to add the current node id to the path
                             */ // add the node id to the path
path.push(nodeId); // add the path to the all paths array
allPaths.push(path);}}else { // there are transitions from this node id
// loop through all the transitions from this node id
for(var t=0;t<transitions.length;t++){var transitionResult=[]; // get a transition
var transition=transitions[t];if(transition!=null){ // get the to node id
var toNodeId=transition.to;if(pathSoFar.indexOf(toNodeId)==-1){ // we have not found the to node in the path yet so we can traverse it
/*
                                     * recursively get the paths by getting all
                                     * the paths from the to node
                                     */var allPathsFromToNode=this.getAllPaths(pathSoFar,toNodeId,includeGroups);if(allPathsFromToNode!=null){ // loop through all the paths from the to node
for(var a=0;a<allPathsFromToNode.length;a++){ // get a path
var tempPath=allPathsFromToNode[a];if(includeGroups){ // we need to add the group id to the path
if(tempPath.length>0){ // get the first node id in the path
var firstNodeId=tempPath[0]; // get the parent id of the first node
var firstParentGroupId=this.getParentGroupId(firstNodeId); // get the parent id of the current node
var parentGroupId=this.getParentGroupId(nodeId);if(parentGroupId!=firstParentGroupId){ /*
                                                         * the parent ids are different which means this is a boundary
                                                         * between two groups. for example if the project looked like
                                                         * group1>node1>node2>group2>node3>node4
                                                         * and the current node was node2 then the first node in the
                                                         * path would be node3 which means we would need to place
                                                         * group2 on the bath before node3
                                                         */tempPath.unshift(firstParentGroupId);}}} // prepend the current node id to the path
tempPath.unshift(nodeId); // add the path to our collection of paths
allPaths.push(tempPath);}}}else { /*
                                     * the node is already in the path so far which means
                                     * the transition is looping back to a previous node.
                                     * we do not want to take this transition because
                                     * it will lead to an infinite loop. we will just
                                     * add the current node id to the path and not take
                                     * the transition which essentially ends the path.
                                     */ // add the node id to the path
path.push(nodeId); // add the path to the all paths array
allPaths.push(path);}}}}if(pathSoFar.length>0){ // get the last node id
var lastNodeId=pathSoFar[pathSoFar.length-1]; // check if the last node id is a group id
if(this.isGroupNode(lastNodeId)){ /*
                             * the last node id is a group id so we will remove it
                             * since we are moving back up the path as we traverse
                             * the nodes depth first
                             */pathSoFar.pop();}} /*
                     * remove the latest node id (this will be a step node id)
                     * since we are moving back up the path as we traverse the
                     * nodes depth first
                     */pathSoFar.pop();}}else if(this.isGroupNode(nodeId)){ // the node is a group node
/*
                 * add the node id to the path so far so we can later check
                 * which nodes are already in the path to prevent looping
                 * back in the path
                 */pathSoFar.push(nodeId); // get the group node
var groupNode=this.getNodeById(nodeId);if(groupNode!=null){var startId=groupNode.startId;if(startId==null||startId==""){ // there is no start id so we will take the transition from the group
// TODO? there is no start id so we will loop through all the child nodes
// get the transitions from the group
var transitions=this.getTransitionsByFromNodeId(groupNode.id);if(transitions!=null){ // loop through all the transitions from the group
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var toNodeId=transition.to; // get the paths from the to node to the end of the project
var allPathsFromToNode=this.getAllPaths(pathSoFar,toNodeId,includeGroups);if(allPathsFromToNode!=null){ // loop through all the paths from the to node
for(var a=0;a<allPathsFromToNode.length;a++){ // get a path
var tempPath=allPathsFromToNode[a]; // prepend the current node id to the path
tempPath.unshift(nodeId); // add the path to our collection of paths
allPaths.push(tempPath);}}}}}}else { // there is a start id so we will traverse it
// get the paths from the start id to the end of the project
var allPathsFromToNode=this.getAllPaths(pathSoFar,startId,includeGroups);if(allPathsFromToNode!=null){ // loop through all the paths from the to node
for(var a=0;a<allPathsFromToNode.length;a++){ // get a path
var tempPath=allPathsFromToNode[a]; // prepend the current node id to the path
tempPath.unshift(nodeId); // add the path to our collection of paths
allPaths.push(tempPath);}}}} /*
                 * remove the latest node id since we are moving back
                 * up the path as we traverse the nodes depth first
                 */pathSoFar.pop();}}return allPaths;}},{key:'consolidatePaths', /**
     * Consolidate all the paths into a linear list of node ids
     * @param paths an array of paths. each path is an array of node ids.
     * @return an array of node ids that have been properly ordered
     */value:function consolidatePaths(paths){var consolidatedPath=[];if(paths!=null){ /*
             * continue until all the paths are empty. as we consolidate
             * node ids, we will remove them from the paths. once all the
             * paths are empty we will be done consolidating the paths.
             */while(!this.arePathsEmpty(paths)){ // start with the first path
var currentPath=this.getNonEmptyPathIndex(paths); // get the first node id in the current path
var nodeId=this.getFirstNodeIdInPathAtIndex(paths,currentPath);if(this.areFirstNodeIdsInPathsTheSame(paths)){ // the first node ids in all the paths are the same
// remove the node id from all the paths
this.removeNodeIdFromPaths(nodeId,paths); // add the node id to our consolidated path
consolidatedPath.push(nodeId);}else { // not all the top node ids are the same which means we have branched
// get all the paths that contain the node id
var pathsThatContainNodeId=this.getPathsThatContainNodeId(nodeId,paths);if(pathsThatContainNodeId!=null){if(pathsThatContainNodeId.length===1){ // only the current path we are on has the node id
// remove the node id from the path
this.removeNodeIdFromPath(nodeId,paths,currentPath); // add the node id to our consolidated path
consolidatedPath.push(nodeId);}else { // there are multiple paths that have this node id
// consume all the node ids up to the given node id
var consumedPath=this.consumePathsUntilNodeId(paths,nodeId); // remove the node id from the paths
this.removeNodeIdFromPaths(nodeId,paths); // add the node id to the end of the consumed path
consumedPath.push(nodeId); // add the consumed path to our consolidated path
consolidatedPath=consolidatedPath.concat(consumedPath);}}}}}return consolidatedPath;}},{key:'consumePathsUntilNodeId', /**
     * Consume the node ids in the paths until we get to the given node id
     * @param paths the paths to consume
     * @param nodeId the node id to stop consuming at
     * @return an array of node ids that we have consumed
     */value:function consumePathsUntilNodeId(paths,nodeId){var consumedNodeIds=[];if(paths!=null&&nodeId!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p]; // check if the path contains the node id to stop consuming at
if(path!=null&&path.indexOf(nodeId)!=-1){ /*
                     * the path does contain the node id to stop consuming at
                     * so we will consume the node ids in this path until
                     * we get to the given node id to stop consuming at
                     */ // loop through the node ids in the path
for(var x=0;x<path.length;x++){ // get a node id
var tempNodeId=path[x];if(nodeId===tempNodeId){ /*
                             * the node id is the same as the one we need to
                             * stop consuming at so we will stop looking
                             * at this path
                             */break;}else { /*
                             * the node id is not the one that we need to stop consuming at
                             * so we will consume it
                             */ // get all the paths that contain the node id
var pathsThatContainNodeId=this.getPathsThatContainNodeId(tempNodeId,paths);if(pathsThatContainNodeId.length===1){ // there is only one path with this node id
// remove the node id from the path
this.removeNodeIdFromPath(tempNodeId,paths,p); // move the counter back one since we have just removed a node id
x--; // add the node id to the consumed node ids array
consumedNodeIds.push(tempNodeId);}else { // there are multiple paths with this node id
// tempNodeId must come before nodeId
var pathsToConsume=[]; // loop through all the paths that contain the node id
for(var g=0;g<pathsThatContainNodeId.length;g++){ // get a path that contains the node id
var pathThatContainsNodeId=pathsThatContainNodeId[g]; // get the index of the node id we want to remove
var tempNodeIdIndex=pathThatContainsNodeId.indexOf(tempNodeId); // get the index of the node id we want to stop consuming at
var nodeIdIndex=pathThatContainsNodeId.indexOf(nodeId); /*
                                     * check if the node id we want to remove comes before
                                     * the node id we want to stop consuming at. we need to
                                     * do this to prevent an infinite loop. an example of
                                     * when this can happen is if there are two paths
                                     *
                                     * path1 = 1, 2, 3, 4, 5
                                     * path2 = 1, 2, 4, 3, 5
                                     *
                                     * as we consume path1 we will need to consume 3. in order to
                                     * consume 3, we must consume consume up to 3 in path2.
                                     * in order to consume up to 3 in path2 we must consume 4.
                                     * in order to consume 4, we must consume everything before
                                     * 4 in path1. everything before 4 in path1 is 1, 2, 3.
                                     * this means we need to consume 3 which brings us back up
                                     * to the top of this paragraph creating an infinite loop.
                                     *
                                     * this check below will prevent infinite loops by only
                                     * adding paths that have the tempNodeId come before the
                                     * nodeId to stop consuming at.
                                     */if(tempNodeIdIndex<nodeIdIndex){pathsToConsume.push(pathThatContainsNodeId);}} /*
                                 * take the paths that contain the given node id and consume
                                 * the paths until the given node id
                                 */var tempConsumedNodeIds=this.consumePathsUntilNodeId(pathsToConsume,tempNodeId); // remove the node id from the paths that contain it
this.removeNodeIdFromPaths(tempNodeId,pathsThatContainNodeId); // add the temp consumed node ids to our consumed node ids array
consumedNodeIds=consumedNodeIds.concat(tempConsumedNodeIds); // move the counter back one since we have just removed a node id
x--; // add the node id to the consumed node ids array
consumedNodeIds.push(tempNodeId);}}}}}}return consumedNodeIds;}},{key:'getFirstNodeIdInPathAtIndex', /**
     * Get the path at the given index and get the first node id in
     * the path
     * @param paths an array of paths. each path is an array of node ids
     * @param index the index of the path we want
     * @return the first node in the given path
     */value:function getFirstNodeIdInPathAtIndex(paths,index){var nodeId=null;if(paths!=null&&index!=null){ // get the path at the given index
var path=paths[index];if(path!=null&&path.length>0){ // get the first node id in the path
nodeId=path[0];}}return nodeId;}},{key:'removeNodeIdFromPaths', /**
     * Remove the node ifrom the paths
     * @param nodeId the node id to remove
     * @param paths an array of paths. each path is an array of node ids
     */value:function removeNodeIdFromPaths(nodeId,paths){if(nodeId!=null&&paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p]; // loop through all the node ids in the path
for(var x=0;x<path.length;x++){ // get a node id
var tempNodeId=path[x]; /*
                     * check if the node id matches the one we are looking
                     * for
                     */if(nodeId===tempNodeId){ /*
                         * we have found the node id we are looking for so
                         * we will remove it from the path
                         */path.splice(x,1); /*
                         * move the counter back since we just removed a
                         * node id. we will continue searching this path
                         * for the node id in case the path contains it
                         * multiple times.
                         */x--;}}}}}},{key:'removeNodeIdFromPath', /**
     * Remove the node id from the path
     * @param nodeId the node id to remove
     * @param paths an array of paths. each path is an array of node ids
     * @param pathIndex the path to remove from
     */value:function removeNodeIdFromPath(nodeId,paths,pathIndex){if(nodeId!=null&&paths!=null&&pathIndex!=null){ // get the path at the given index
var path=paths[pathIndex];if(path!=null){ // loop through all the node ids in the path
for(var x=0;x<path.length;x++){ // get a ndoe id
var tempNodeId=path[x]; /*
                     * check if the node id matches the one we are looking
                     * for
                     */if(nodeId===tempNodeId){ /*
                         * we have found the node id we are looking for so
                         * we will remove it from the path
                         */path.splice(x,1); /*
                         * move the counter back since we just removed a
                         * node id. we will continue searching this path
                         * for the node id in case the path contains it
                         * multiple times.
                         */x--;}}}}}},{key:'areFirstNodeIdsInPathsTheSame', /**
     * Check if the first node ids in the paths are the same
     * @param paths an array of paths. each path is an array of node ids
     * @return whether all the paths have the same first node id
     */value:function areFirstNodeIdsInPathsTheSame(paths){var result=true;var nodeId=null;if(paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p]; // get the first node id in the path
var tempNodeId=path[0];if(nodeId==null){ /*
                     * this is the first path we have looked at so we will
                     * remember the node id
                     */nodeId=tempNodeId;}else if(nodeId!=tempNodeId){ /*
                     * the node id does not match the first node id from a
                     * previous path so the paths do not all have the same
                     * first node id
                     */result=false;break;}}}return result;}},{key:'arePathsEmpty', /**
     * Check if all the paths are empty
     * @param paths an array of paths. each path is an array of node ids
     * @return whether all the paths are empty
     */value:function arePathsEmpty(paths){var result=true;if(paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p];if(path!=null){ // get the length of the path
if(path.length!==0){ // the path is not empty
result=false;break;}}}}return result;}},{key:'getPathsThatContainNodeId', /**
     * Get the paths that contain the node id
     * @param nodeId the node id we are looking for
     * @param paths an array of paths. each path is an array of node ids
     * @return an array of paths that contain the given node id
     */value:function getPathsThatContainNodeId(nodeId,paths){var pathsThatContainNodeId=[];if(nodeId!=null&&paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p]; // check if the path contains the node id
if(path.indexOf(nodeId)!=-1){ /*
                     * add the path to the array of paths that contain
                     * the node id
                     */pathsThatContainNodeId.push(path);}}}return pathsThatContainNodeId;}},{key:'getNonEmptyPathIndex', /**
     * Get a non empty path index. It will loop through the paths and
     * return the index of the first non empty path.
     * @param paths an array of paths. each path is an array of node ids
     * @return the index of the path that is not empty
     */value:function getNonEmptyPathIndex(paths){var index=null;if(paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p]; // check the length of the path
if(path.length!==0){ // the path is not empty so we will return this index
index=p;break;}}}return index;}},{key:'getBranches', /**
     * Get the branches in the project
     */value:function getBranches(){ // get the start node id
var startNodeId=this.getStartNodeId(); /*
         * an array to keep track of the node ids in the path that
         * we are currently on as we traverse the nodes in the project
         * depth first
         */var pathsSoFar=[]; // get all the paths in the project
var allPaths=this.getAllPaths(pathsSoFar,startNodeId); // find the branches in the project from the paths
var branches=this.findBranches(allPaths);return branches;}},{key:'findBranches', /**
     * Find the branches in the project
     * @param paths all the possible paths through the project
     * @return an array of branch objects. each branch object contains
     * the branch start point, the branch paths, and the branch
     * end point
     */value:function findBranches(paths){var branches=[];var previousNodeId=null; /*
         * continue until all the paths are empty. we will remove
         * node ids from the paths as we traverse the paths to find
         * the branches
         */while(!this.arePathsEmpty(paths)){ // get the first node id in the first path
var nodeId=this.getFirstNodeIdInPathAtIndex(paths,0);if(this.areFirstNodeIdsInPathsTheSame(paths)){ // the first node ids in all the paths are the same
// remove the node id from all the paths
this.removeNodeIdFromPaths(nodeId,paths); // remember this node id for the next iteration of the loop
previousNodeId=nodeId;}else { // not all the top node ids are the same which means we have branched
// create a branch object
var branchMetaObject=this.createBranchMetaObject(previousNodeId);branchMetaObject.branchStartPoint=previousNodeId; // find the branch end point
var nextCommonNodeId=this.findNextCommonNodeId(paths);branchMetaObject.branchEndPoint=nextCommonNodeId; // get the branch paths
var branchPaths=this.extractPathsUpToNodeId(paths,nextCommonNodeId);branchPaths=this.removeDuplicatePaths(branchPaths);branchMetaObject.branchPaths=branchPaths; // add the branch object to our array
branches.push(branchMetaObject); // trim the paths so that they start at the branch end point
this.trimPathsUpToNodeId(paths,nextCommonNodeId); // remember this node id for the next iteration of the loop
previousNodeId=nextCommonNodeId;}}return branches;}},{key:'createBranchMetaObject', /**
     * Create a branch meta object that will contain the branch start
     * point, branch paths, and branch end point
     * @return an object that contains a branch start point, branch paths,
     * and a branch end point
     */value:function createBranchMetaObject(){var branchMetaObject={};branchMetaObject.branchStartPoint=null;branchMetaObject.branchPaths=[];branchMetaObject.branchEndPoint=null;return branchMetaObject;}},{key:'findNextCommonNodeId', /**
     * Find the next common node id in all the paths
     * @param paths the paths to find the common node id in
     * @return a node id that is in all the paths or null
     * if there is no node id that is in all the paths
     */value:function findNextCommonNodeId(paths){var nextCommonNodeId=null;var subPaths=[];if(paths!=null){if(paths.length>0){ // get the first path
var path=paths[0]; // loop through all the node ids in the first path
for(var x=0;x<path.length;x++){ // get a node id
var tempNodeId=path[x]; // check if the node id is in all the paths
if(this.allPathsContainNodeId(paths,tempNodeId)){ /*
                         * the node id is in all the paths so we have found
                         * what we were looking for
                         */nextCommonNodeId=tempNodeId;break;}}}}return nextCommonNodeId;}},{key:'allPathsContainNodeId', /**
     * Check if all the paths contain the node id
     * @param paths an array of paths. each path contains an array of node ids
     * @param nodeId the node id that we will check is in all the paths
     * @return whether the node id is in all the paths
     */value:function allPathsContainNodeId(paths,nodeId){var result=false;if(paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p]; // get the index of the node id in the path
var index=path.indexOf(nodeId);if(index==-1){ // the node id is not in the path
result=false;break;}else { // the node id is in the path
result=true;}}}return result;}},{key:'trimPathsUpToNodeId', /**
     * Trim the paths up to the given node id so that the paths will contain
     * the given node id and all the node ids after it. This function will
     * modify the paths.
     * @param paths the paths to trim
     * @param nodeId the node id to trim up to
     */value:function trimPathsUpToNodeId(paths,nodeId){if(paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p];if(path!=null){ // get the index of the node id in the path
var index=path.indexOf(nodeId);if(index==-1){ /*
                         * the node id is not in the path so we will
                         * trim the path to the end which will make
                         * the path empty
                         */index=path.length;} /*
                     * trim the path up to the node id index. this will
                     * modify the path array.
                     */path.splice(0,index);}}}}},{key:'extractPathsUpToNodeId', /**
     * Extract the paths up to a given node id. This will be used to
     * obtain branch paths.
     * @param paths the paths to extract from
     * @param nodeId the node id to extract up to
     * @return paths that go up to but do not include the node id
     */value:function extractPathsUpToNodeId(paths,nodeId){var extractedPaths=[];if(paths!=null){ // loop through the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p];if(path!=null){ // get the index of the node id in the path
var index=path.indexOf(nodeId);if(index==-1){ /*
                         * the node id is not in the path so we will
                         * extract up to the end of the path
                         */index=path.length;} /*
                     * get the path up to the node id index. this does
                     * not modify the path array.
                     */var extractedPath=path.slice(0,index); // add the
extractedPaths.push(extractedPath);}}}return extractedPaths;}},{key:'removeDuplicatePaths', /**
     * Removes duplicate paths
     * @param paths an array of paths. each path contains an array of node ids
     * @return an array of unique paths
     */value:function removeDuplicatePaths(paths){var uniquePaths=[];if(paths!=null){ // loop through all the paths
for(var p=0;p<paths.length;p++){ // get a path
var path=paths[p];var isPathInUniquePaths=false; // loop through all the unique paths so far
for(var u=0;u<uniquePaths.length;u++){ // get a unique path
var uniquePath=uniquePaths[u]; // check if the paths are equal
if(this.pathsEqual(path,uniquePath)){ // the paths are equal
isPathInUniquePaths=true;}}if(!isPathInUniquePaths){ // the path is not equal to any paths in the unique
// paths array so we will add it to the unique paths array
uniquePaths.push(path);}}}return uniquePaths;}},{key:'pathsEqual', /**
     * Check if two paths are equal
     * @param path1 an array of node ids
     * @param path2 an array of node ids
     * @return whether the two paths contain the same node ids
     * in the same order
     */value:function pathsEqual(path1,path2){var result=false;if(path1!=null&&path2!=null){ // check if the paths are the same length
if(path1.length===path2.length){result=true; // loop through each element of the first path
for(var x=0;x<path1.length;x++){ // get the node id from the first path
var path1NodeId=path1[x]; // get the node id from the second path
var path2NodeId=path2[x]; // check if the node ids are the same
if(path1NodeId!==path2NodeId){ // the node ids are not the same to the paths are not equal
result=false;break;}}}}return result;}},{key:'isNodeIdInABranch', /**
     * Check if a node id is in any branch
     * @param branches an array of branch objects
     * @param nodeId the node id to check
     * @return whether the node id is in any branch
     */value:function isNodeIdInABranch(branches,nodeId){if(branches!=null&&nodeId!=null){ // loop through all the branch objects
for(var b=0;b<branches.length;b++){ // get a branch object
var branch=branches[b];if(branch!=null){ // get the branch paths for this branch object
var branchPaths=branch.branchPaths;if(branchPaths!=null){ // loop through all the branch paths
for(var bp=0;bp<branchPaths.length;bp++){ // get a branch path
var branchPath=branchPaths[bp];if(branchPath!=null){ // check if the node id is in the branch path
var index=branchPath.indexOf(nodeId);if(index!=-1){ // the node id is in this branch path
return true;}}}}}}}return false;}},{key:'getBranchPathsByNodeId', /**
     * Get the branch paths that a node id is in
     * @param branches an array of branch objects
     * @param nodeId the node id to check
     * @return an array of the branch paths that the node id is in
     */value:function getBranchPathsByNodeId(branches,nodeId){var branchPathsIn=[];if(branches!=null&&nodeId!=null){ // loop through all the branches
for(var b=0;b<branches.length;b++){ // get a branch
var branch=branches[b];if(branch!=null){ // get the branch paths
var branchPaths=branch.branchPaths;if(branchPaths!=null){ // loop through all the branch paths
for(var bp=0;bp<branchPaths.length;bp++){ // get a branch path
var branchPath=branchPaths[bp];if(branchPath!=null){ // get the index of the node id in the branch path
var index=branchPath.indexOf(nodeId);if(index!=-1){ /*
                                     * the node is in this branch path so we will
                                     * add the branch path to our array
                                     */branchPathsIn.push(branchPath);}}}}}}}return branchPathsIn;} /**
     * Get the component by node id and component id
     * @param nodeId the node id
     * @param componentId the component id
     * @returns the component or null if the nodeId or componentId are null or does not exist in the project.
     */},{key:'getComponentByNodeIdAndComponentId',value:function getComponentByNodeIdAndComponentId(nodeId,componentId){var component=null;if(nodeId!=null&&componentId!=null){var components=this.getComponentsByNodeId(nodeId); // loop through all the components
for(var c=0;c<components.length;c++){var tempComponent=components[c];if(tempComponent!=null){var tempComponentId=tempComponent.id;if(componentId===tempComponentId){ // we have found the component we want
component=tempComponent;break;}}}}return component;}},{key:'getComponentPositionByNodeIdAndComponentId', /**
     * Returns the position of the component in the node by node id and component id, 0-indexed.
     * @param nodeId the node id
     * @param componentId the component id
     * @returns the component's position or -1 if nodeId or componentId are null or doesn't exist in the project.
     */value:function getComponentPositionByNodeIdAndComponentId(nodeId,componentId){var componentPosition=-1;if(nodeId!=null&&componentId!=null){var components=this.getComponentsByNodeId(nodeId); // loop through all the components
for(var c=0;c<components.length;c++){var tempComponent=components[c];if(tempComponent!=null){var tempComponentId=tempComponent.id;if(componentId===tempComponentId){ // we have found the component we want
componentPosition=c;break;}}}}return componentPosition;}},{key:'getComponentsByNodeId', /**
     * Get the components in a node
     * @param nodeId the node id
     * @returns an array of components or empty array if nodeId is null or doesn't exist in the project.
     * if the node exists but doesn't have any components, returns an empty array.
     */value:function getComponentsByNodeId(nodeId){var components=[];if(nodeId!=null){ // get the node
var node=this.getNodeById(nodeId);if(node!=null){ // get the components
if(node.components!=null){components=node.components;}}}return components;}},{key:'getNodeContentByNodeId',value:function getNodeContentByNodeId(nodeId){var nodeContent=null;if(nodeId!=null){var node=this.getNodeById(nodeId);if(node!=null){nodeContent=node;}}return nodeContent;}},{key:'replaceComponent', /**
     * Replace a component
     * @param nodeId the node id
     * @param componentId the component id
     * @param component the new component
     */value:function replaceComponent(nodeId,componentId,component){if(nodeId!=null&&componentId!=null&&component!=null){ // get all the components for the node
var components=this.getComponentsByNodeId(nodeId);if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var tempComponent=components[c];if(tempComponent!=null){if(tempComponent.id===componentId){ // the component id matches the one we want so we will replace it
components[c]=component;break;}}}}}}},{key:'createGroup', /**
     * Create a new group
     * @param title the title of the group
     * @returns the group object
     */value:function createGroup(title){ // get the next available group id
var newGroupId=this.getNextAvailableGroupId(); // create the group object
var newGroup={};newGroup.id=newGroupId;newGroup.type='group';newGroup.title=title;newGroup.startId='';newGroup.ids=[];return newGroup;}},{key:'createNode', /**
     * Create a new node
     * @param title the title of the node
     * @returns the node object
     */value:function createNode(title){ // get the next available node id
var newNodeId=this.getNextAvailableNodeId(); // create the node object
var newNode={};newNode.id=newNodeId;newNode.title=title;newNode.type='node';newNode.constraints=[];newNode.transitionLogic={};newNode.transitionLogic.transitions=[];newNode.showSaveButton=true;newNode.showSubmitButton=false;newNode.components=[];return newNode;}},{key:'createNodeInside', /**
     * Create a node inside the group
     * @param node the new node
     * @param nodeId the node id of the group to create the node in
     */value:function createNodeInside(node,nodeId){ // add the node to the project
this.addNode(node); // add the node to our mapping of node id to node
this.setIdToNode(node.id,node); // create the transitions for the node
this.insertNodeInsideInTransitions(node.id,nodeId); // add the node to the group
this.insertNodeInsideInGroups(node.id,nodeId);} /**
     * Create a node after the given node id
     * @param node the new node
     * @param nodeId the node to add after
     */},{key:'createNodeAfter',value:function createNodeAfter(node,nodeId){ // add the node to the project
this.addNode(node); // add the node to our mapping of node id to node
this.setIdToNode(node.id,node); // insert the new node id into the array of children ids
this.insertNodeAfterInGroups(node.id,nodeId); // create the transition to the node
this.insertNodeAfterInTransitions(node,nodeId);if(this.isGroupNode(node.id)){ /*
             * we are creating a group node so we will update/create the
             * transitions that traverse from the previous group to this group
             */var oldToGroupIds=[]; // get the transitions that come out of the previous group
var transitionsFromGroup=this.getTransitionsByFromNodeId(nodeId);if(transitionsFromGroup!=null){ /*
                 * loop through all the transitions that come out of the previous group
                 * and get the node ids that the group transitions to
                 */for(var t=0;t<transitionsFromGroup.length;t++){var transitionFromGroup=transitionsFromGroup[t];if(transitionFromGroup!=null){var toNodeId=transitionFromGroup.to;if(toNodeId!=null){oldToGroupIds.push(toNodeId);}}}}var fromGroupId=nodeId;var oldToGroupIds=oldToGroupIds;var newToGroupId=node.id; /*
             * make the transitions point to the new group and make the new
             * group transition to the old group
             */this.updateTransitionsForInsertingGroup(fromGroupId,oldToGroupIds,newToGroupId);}} /**
     * Insert the node after the given node id in the group's
     * array of children ids
     * @param nodeIdToInsert the node id we want to insert
     * @param nodeIdToInsertAfter the node id we want to insert after
     */},{key:'insertNodeAfterInGroups',value:function insertNodeAfterInGroups(nodeIdToInsert,nodeIdToInsertAfter){var groupNodes=this.getGroupNodes();if(groupNodes!=null){ // loop through the groups
for(var g=0;g<groupNodes.length;g++){var group=groupNodes[g];if(group!=null){var ids=group.ids;if(ids!=null){ // loop through the children ids
for(var i=0;i<ids.length;i++){var id=ids[i];if(nodeIdToInsertAfter===id){ // we have found the node id we want to insert after
// insert the new node id
ids.splice(i+1,0,nodeIdToInsert);return;}}}}}}} /**
     * Update the transitions to handle inserting a node after another node
     * @param node the node to insert
     * @param nodeId the node id to insert after
     */},{key:'insertNodeAfterInTransitions',value:function insertNodeAfterInTransitions(node,nodeId){ // get the node that will end up before
var previousNode=this.getNodeById(nodeId);if(previousNode!=null){if(previousNode.transitionLogic==null){previousNode.transitionLogic={};previousNode.transitionLogic.transitions=[];}if(node.transitionLogic==null){node.transitionLogic={};}if(node.transitionLogic.transitions==null){node.transitionLogic.transitions=[];}if(this.isGroupNode(node.id)){ /*
                 * the node we are inserting is a group so we will update
                 * the transitions of its children so that they transition
                 * to the correct node
                 */this.updateChildrenTransitionsForMovingGroup(node,nodeId);}var previousNodeTransitionLogic=previousNode.transitionLogic;if(previousNodeTransitionLogic!=null){ // get the transitions from the before node
var transitions=previousNodeTransitionLogic.transitions;if(transitions!=null){ // make a copy of the transitions
var transitionsJSONString=angular.toJson(transitions);var transitionsCopy=angular.fromJson(transitionsJSONString); // set the transitions from the before node into the inserted node
node.transitionLogic.transitions=transitionsCopy;}}if(node.transitionLogic.transitions.length==0){ /*
                 * The node does not have any transitions so we will look for
                 * a transition on the parent group. If the parent has a
                 * transition we will use it for the node.
                 */ // get the parent group
var parentGroupId=this.getParentGroupId(nodeId); // get the parent transitions
var parentTransitions=this.getTransitionsByFromNodeId(parentGroupId);if(parentTransitions!=null){ // loop through all the parent transitions
for(var p=0;p<parentTransitions.length;p++){var parentTransition=parentTransitions[p];var newTransition={};if(parentTransition!=null){var toNodeId=parentTransition.to;if(this.isGroupNode(toNodeId)){ // the transition is to a group
// get the start id of the group
var startId=this.getGroupStartId(toNodeId);if(startId==null||startId==''){ // there is no start id so we will just use the group id
newTransition.to=toNodeId;}else { // there is a start id so we will use it as the to node
newTransition.to=startId;}}else { // the tranisition is to a step
newTransition.to=toNodeId;}} // add the new transition to the node
node.transitionLogic.transitions.push(newTransition);}}}var newNodeId=node.id; // TODO handle branching case
// remove the transitions from the before node
previousNode.transitionLogic.transitions=[];var transitionObject={};transitionObject.to=newNodeId; // make the before node point to the new node
previousNode.transitionLogic.transitions.push(transitionObject);}} /**
     * Insert a node into a group
     * @param nodeIdToInsert the node id to insert
     * @param nodeIdToInsertInside the node id of the group we will insert into
     */},{key:'insertNodeInsideInGroups',value:function insertNodeInsideInGroups(nodeIdToInsert,nodeIdToInsertInside){ // get the group we will insert into
var group=this.getNodeById(nodeIdToInsertInside);if(group!=null){var ids=group.ids;if(ids!=null){ // insert the node node id into the beginning of the child ids
ids.splice(0,0,nodeIdToInsert); // set the inserted node id as the start id
group.startId=nodeIdToInsert;}}} /**
     * Update the transitions to handle inserting a node into a group
     * @param nodeIdToInsert node id that we will insert
     * @param nodeIdToInsertInside the node id of the group we are inserting into
     */},{key:'insertNodeInsideInTransitions',value:function insertNodeInsideInTransitions(nodeIdToInsert,nodeIdToInsertInside){ // get the node we are inserting
var nodeToInsert=this.getNodeById(nodeIdToInsert); // get the group we are inserting into
var group=this.getNodeById(nodeIdToInsertInside);if(this.isGroupNode(nodeIdToInsert)){ /*
             * the node we are inserting is a group so we will update
             * the transitions of its children so that they transition
             * to the correct node
             */this.updateChildrenTransitionsForMovingGroup(nodeToInsert,null);} /*
         * since we are inserting a node into a group, the node will become
         * the first node in the group. this means we need to update any nodes
         * that point to the old start id and make them point to the node
         * we are inserting.
         */if(nodeToInsert!=null&&group!=null){ // get the start node
var startId=group.startId; // get transitions that point to the start node
var previousNodes=this.getNodesByToNodeId(startId);if(previousNodes==null||previousNodes.length==0){ // there are no transitions to the start node
// find all the groups that point to this group
var previousGroups=this.getGroupNodesByToNodeId(nodeIdToInsertInside); // loop through all the groups that point to this group
for(var g=0;g<previousGroups.length;g++){var previousGroup=previousGroups[g];if(previousGroup!=null){ // get the nodes that do not have a transition in the previous group
var lastNodesInGroup=this.getLastNodesInGroup(previousGroup.id);for(var n=0;n<lastNodesInGroup.length;n++){ // get a node that does not have a transition
var node=lastNodesInGroup[n]; // add a transition from the node to the node we are inserting
this.addToTransition(node,nodeIdToInsert);}}}}else { // there are transitions to the start node
for(var p=0;p<previousNodes.length;p++){var previousNode=previousNodes[p];if(previousNode!=null){ // change the transition to point to the node we are inserting
this.updateToTransition(previousNode,startId,nodeIdToInsert);}}} /*
             * update all the transitions that point to the group and change
             * them to point to the new start id
             */var nodesThatTransitionToGroup=this.getNodesByToNodeId(nodeIdToInsertInside);if(nodesThatTransitionToGroup!=null){for(var n=0;n<nodesThatTransitionToGroup.length;n++){var nodeThatTransitionsToGroup=nodesThatTransitionToGroup[n];if(!this.isGroupNode(nodeThatTransitionsToGroup.id)){this.updateToTransition(nodeThatTransitionsToGroup,nodeIdToInsertInside,nodeIdToInsert);}}} /*
             * create a transition from the node we are inserting to the node that
             * was previously the start node
             */if(startId!=null&&startId!=''){ // there is a start id
var startNode=this.getNodeById(startId);if(startNode!=null){ // the group has a start node which will become the transition to node
if(nodeToInsert.transitionLogic==null){nodeToInsert.transitionLogic={};}if(nodeToInsert.transitionLogic.transitions==null){nodeToInsert.transitionLogic.transitions=[];} /*
                     * make the inserted node transition to the previous start node
                     */var transitionObject={};transitionObject.to=startId;nodeToInsert.transitionLogic.transitions.push(transitionObject);}} //check if the node we inserted has any transitions now
var transitions=this.getTransitionsByFromNodeId(nodeIdToInsert);if(transitions==null||transitions.length==0){ /*
                 * the node doesn't have any transitions so we will see if
                 * the parent group transitions to anything and use that
                 * transition
                 */ // get the transitions from the parent
var parentTransitions=this.getTransitionsByFromNodeId(nodeIdToInsertInside);if(parentTransitions!=null){ // loop through all the parent transitions
for(var t=0;t<parentTransitions.length;t++){var parentTransition=parentTransitions[t];if(parentTransition!=null){var toNodeId=parentTransition.to;if(this.isGroupNode(toNodeId)){ // the to node is a group
// get the to group
var nextGroup=this.getNodeById(toNodeId);if(nextGroup!=null){ // get the start id of the to group
var startId=nextGroup.startId;if(startId==null||startId==''){ // there is no start id so we will just transition to the group
this.addToTransition(nodeToInsert,toNodeId);}else { // there is a start id so we will transition to that
this.addToTransition(nodeToInsert,startId);}}}else { // the to node is not a group
/*
                                 * we will add a transition from the node we are inserting to
                                 * to that node
                                 */this.addToTransition(nodeToInsert,toNodeId);}}}}}}} /**
     * Add a transition to a node
     * @param node the node we are adding a transition to
     * @param toNodeId the node id we going to transition to
     * @param criteria (optional) a criteria object specifying
     * what needs to be satisfied in order to use this transition
     */},{key:'addToTransition',value:function addToTransition(node,toNodeId,criteria){if(node!=null){if(node.transitionLogic==null){node.transitionLogic={};}if(node.transitionLogic.transitions==null){node.transitionLogic.transitions=[];}var transition={}; // set the to node id
transition.to=toNodeId;if(criteria!=null){ // set the criteria
transition.criteria=criteria;} // add the transition to the node's transitions
node.transitionLogic.transitions.push(transition);}} /**
     * Update the to value of aa transition
     * @param node the node to update
     * @param oldToNodeId the previous to node id
     * @param newToNodeId the new to node id
     */},{key:'updateToTransition',value:function updateToTransition(node,oldToNodeId,newToNodeId){if(node!=null){if(node.transitionLogic==null){node.transitionLogic={};}if(node.transitionLogic.transitions==null){node.transitionLogic.transitions=[];}var transitions=node.transitionLogic.transitions; // loop through all the transitions
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var toNodeId=transition.to;if(oldToNodeId===toNodeId){ // we have found the transition we want to update
// update the to node id
transition.to=newToNodeId;}}}}} /**
     * Get the nodes in a group that do not have transitions
     * @param groupId the group id
     * @returns the nodes in the group that do not have transitions
     */},{key:'getLastNodesInGroup',value:function getLastNodesInGroup(groupId){var lastNodes=[];if(groupId!=null){var group=this.getNodeById(groupId);if(group!=null){var childIds=group.ids;if(childIds!=null){ // loop through all the child ids
for(var c=0;c<childIds.length;c++){var childId=childIds[c];if(childId!=null){var child=this.getNodeById(childId);if(child!=null){var transitionLogic=child.transitionLogic;if(transitionLogic!=null){ // get the transitions
var transitions=transitionLogic.transitions;if(transitions==null||transitions.length==0){ // this child does not have any transitions
lastNodes.push(child);}}}}}}}}return lastNodes;} /**
     * Get the next available group id
     * @returns the next available group id
     */},{key:'getNextAvailableGroupId',value:function getNextAvailableGroupId(){ // get all the group ids
var groupIds=this.getGroupIds();var largestGroupIdNumber=null; // loop through all the existing group ids
for(var g=0;g<groupIds.length;g++){var groupId=groupIds[g]; // get the number from the group id e.g. the number of 'group2' would be 2
var groupIdNumber=groupId.replace('group',''); // make sure the number is an actual number
if(!isNaN(groupIdNumber)){groupIdNumber=parseInt(groupIdNumber); // update the largest group id number if necessary
if(largestGroupIdNumber==null){largestGroupIdNumber=groupIdNumber;}else if(groupIdNumber>largestGroupIdNumber){largestGroupIdNumber=groupIdNumber;}}} // create the next available group id
var nextAvailableGroupId='group'+(largestGroupIdNumber+1);return nextAvailableGroupId;} /**
     * Get all the group ids
     * @returns an array with all the group ids
     */},{key:'getGroupIds',value:function getGroupIds(){var groupIds=[];var groupNodes=this.groupNodes; // loop through all the group nodes
for(var g=0;g<groupNodes.length;g++){var group=groupNodes[g];if(group!=null){var groupId=group.id;if(groupId!=null){ // add the group id
groupIds.push(groupId);}}}return groupIds;} /**
     * Get the next available node id
     * @returns the next available node id
     */},{key:'getNextAvailableNodeId',value:function getNextAvailableNodeId(){ // get all the node ids
var nodeIds=this.getNodeIds();var largestNodeIdNumber=null; // loop through all the existing node ids
for(var n=0;n<nodeIds.length;n++){var nodeId=nodeIds[n]; // get the number from the node id e.g. the number of 'node2' would be 2
var nodeIdNumber=nodeId.replace('node',''); // make sure the number is an actual number
if(!isNaN(nodeIdNumber)){nodeIdNumber=parseInt(nodeIdNumber); // update the largest node id number if necessary
if(largestNodeIdNumber==null){largestNodeIdNumber=nodeIdNumber;}else if(nodeIdNumber>largestNodeIdNumber){largestNodeIdNumber=nodeIdNumber;}}} // create the next available node id
var nextAvailableNodeId='node'+(largestNodeIdNumber+1);return nextAvailableNodeId;} /**
     * Get all the node ids from steps (not groups)
     * @returns an array with all the node ids
     */},{key:'getNodeIds',value:function getNodeIds(){var nodeIds=[];var nodes=this.applicationNodes; // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeId=node.id;if(nodeId!=null){nodeIds.push(nodeId);}}}return nodeIds;} /**
     * Move nodes inside a group node
     * @param nodeIds the node ids to move
     * @param nodeId the node id of the group we are moving the nodes inside
     */},{key:'moveNodesInside',value:function moveNodesInside(nodeIds,nodeId){ // loop thorugh all the nodes we are moving
for(var n=0;n<nodeIds.length;n++){ // get the node we are moving
var tempNodeId=nodeIds[n];var tempNode=this.getNodeById(tempNodeId);var movingNodeIsActive=this.isActive(tempNodeId);var stationaryNodeIsActive=this.isActive(nodeId);if(movingNodeIsActive&&stationaryNodeIsActive){ // we are moving from active to active
// remove the transitions
this.removeNodeIdFromTransitions(tempNodeId); // remove the node from the group
this.removeNodeIdFromGroups(tempNodeId);if(n==0){ /*
                     * this is the first node we are moving so we will insert it
                     * into the beginning of the group
                     */this.insertNodeInsideInTransitions(tempNodeId,nodeId);this.insertNodeInsideInGroups(tempNodeId,nodeId);}else { /*
                     * this is not the first node we are moving so we will insert
                     * it after the node we previously inserted
                     */this.insertNodeAfterInTransitions(tempNode,nodeId);this.insertNodeAfterInGroups(tempNodeId,nodeId);}}else if(movingNodeIsActive&&!stationaryNodeIsActive){ // we are moving from active to inactive
// remove the transitions
this.removeNodeIdFromTransitions(tempNodeId); // remove the node from the group
this.removeNodeIdFromGroups(tempNodeId); // move the node to the inactive array
this.moveToInactive(tempNode,nodeId);}else if(!movingNodeIsActive&&stationaryNodeIsActive){ // we are moving from inactive to active
this.moveToActive(tempNode);if(n==0){ /*
                     * this is the first node we are moving so we will insert it
                     * into the beginning of the group
                     */this.insertNodeInsideInTransitions(tempNodeId,nodeId);this.insertNodeInsideInGroups(tempNodeId,nodeId);}else { /*
                     * this is not the first node we are moving so we will insert
                     * it after the node we previously inserted
                     */this.insertNodeAfterInTransitions(tempNode,nodeId);this.insertNodeAfterInGroups(tempNodeId,nodeId);}}else if(!movingNodeIsActive&&!stationaryNodeIsActive){ // we are moving from inactive to inactive
// move the node within the inactive nodes
this.moveInactiveNode(tempNode,nodeId);} /*
             * remember the node id so we can put the next node (if any)
             * after this one
             */nodeId=tempNode.id;}} /**
     * Move nodes after a certain node id
     * @param nodeIds the node ids to move
     * @param nodeId the node id we will put the moved nodes after
     */},{key:'moveNodesAfter',value:function moveNodesAfter(nodeIds,nodeId){ // loop through all the nodes we are moving
for(var n=0;n<nodeIds.length;n++){ // get the node we are moving
var tempNodeId=nodeIds[n];var node=this.getNodeById(tempNodeId);var movingNodeIsActive=this.isActive(tempNodeId);var stationaryNodeIsActive=this.isActive(nodeId);if(movingNodeIsActive&&stationaryNodeIsActive){ // we are moving from active to active
// remove the transitions
this.removeNodeIdFromTransitions(tempNodeId); // remove the node from the groups
this.removeNodeIdFromGroups(tempNodeId); // insert the node into the parent group
this.insertNodeAfterInGroups(tempNodeId,nodeId); // create the transition
this.insertNodeAfterInTransitions(node,nodeId);}else if(movingNodeIsActive&&!stationaryNodeIsActive){ // we are moving from active to inactive
// remove the transitions
this.removeNodeIdFromTransitions(tempNodeId); // remove the node from the groups
this.removeNodeIdFromGroups(tempNodeId); // move the node to the inactive array
this.moveToInactive(node,nodeId);}else if(!movingNodeIsActive&&stationaryNodeIsActive){ // we are moving from inactive to active
// move the node to the active nodes array
this.moveToActive(node); // insert the node into the parent group
this.insertNodeAfterInGroups(tempNodeId,nodeId); // create the transition
this.insertNodeAfterInTransitions(node,nodeId);}else if(!movingNodeIsActive&&!stationaryNodeIsActive){ // we are moving from inactive to inactive
// move the node within the inactive nodes
this.moveInactiveNode(node,nodeId);} // remember the node id so we can put the next node (if any) after this one
nodeId=node.id;}} /**
     * Copy nodes and put them after a certain node id
     * @param nodeIds the node ids to copy
     * @param nodeId the node id we will put the copied nodes after
     */},{key:'copyNodesInside',value:function copyNodesInside(nodeIds,nodeId){ // loop through all the nodes we are copying
for(var n=0;n<nodeIds.length;n++){ // get the node we are copying
var nodeIdToCopy=nodeIds[n]; // create a copy of the node
var newNode=this.copyNode(nodeIdToCopy);var newNodeId=newNode.id;if(n==0){ // this is the first node we are copying so we will insert it
// into the beginning of the group
this.createNodeInside(newNode,nodeId);}else { // this is not the first node we are copying so we will insert
// it after the node we previously inserted
this.createNodeAfter(newNode,nodeId);} // remember the node id so we can put the next node (if any) after this one
nodeId=newNodeId;this.parseProject(); // refresh project and update references because a new node have been added.
}} /**
     * Copy nodes and put them after a certain node id
     * @param nodeIds the node ids to copy
     * @param nodeId the node id we will put the copied nodes after
     */},{key:'copyNodesAfter',value:function copyNodesAfter(nodeIds,nodeId){ // loop through all the nodes we are copying
for(var n=0;n<nodeIds.length;n++){ // get the node we are copying
var nodeIdToCopy=nodeIds[n]; // create a copy of the node
var newNode=this.copyNode(nodeIdToCopy);var newNodeId=newNode.id;this.createNodeAfter(newNode,nodeId); // remember the node id so we can put the next node (if any) after this one
nodeId=newNodeId;this.parseProject(); // refresh project and update references because a new node have been added.
}} /**
     * Copy the node with the specified nodeId
     * @param nodeId the node id to copy
     * @return copied node
     */},{key:'copyNode',value:function copyNode(nodeId){var node=this.getNodeById(nodeId);var nodeCopy=JSON.parse(JSON.stringify(node));nodeCopy.id=this.getNextAvailableNodeId();nodeCopy.transitionLogic={}; // clear transition logic
nodeCopy.constraints=[]; // clear constraints
for(var c=0;c<nodeCopy.components.length;c++){var component=nodeCopy.components[c];var componentType=component.type; // get the service for the node type
var service=this.$injector.get(componentType+'Service'); // copy the component
var componentCopy=service.copyComponent(component);if(component.maxScore!=null){ // Also copy the max score if exists in original node
componentCopy.maxScore=component.maxScore;}if(component.showPreviousWorkPrompt!=null){ // Also copy the showPreviousWorkPrompt if exists in original node
componentCopy.showPreviousWorkPrompt=component.showPreviousWorkPrompt;}if(component.showPreviousWorkNodeId!=null){ // Also copy the showPreviousWorkNodeId if exists in original node
componentCopy.showPreviousWorkNodeId=component.showPreviousWorkNodeId;}if(component.showPreviousWorkComponentId!=null){ // Also copy the showPreviousWorkComponentId if exists in original node
componentCopy.showPreviousWorkComponentId=component.showPreviousWorkComponentId;}nodeCopy.components[c]=componentCopy;}return nodeCopy;} /**
     * Delete a node
     * @param nodeId the node id
     */},{key:'deleteNode',value:function deleteNode(nodeId){if(this.isGroupNode(nodeId)){ // the node is a group node so we will also remove all of its children
var group=this.getNodeById(nodeId); // TODO check if the child is in another group, if so do not remove
if(group!=null){var ids=group.ids; // loop through all the children
for(var i=0;i<ids.length;i++){var id=ids[i]; // remove the child
this.removeNodeIdFromTransitions(id);this.removeNodeIdFromGroups(id);this.removeNodeIdFromNodes(id); /*
                     * move the counter back because we have removed a child
                     * from the parent group's array of child ids so all of
                     * the child ids were shifted back one and the next child
                     * we want will be at i--
                     */i--;}}}var parentGroup=this.getParentGroup(nodeId); // check if we need to update the start id of the parent group
if(parentGroup!=null){ /*
             * the node is the start node of the parent group so we need
             * to update the start id of the parent group to point to
             * the next node
             */if(nodeId===parentGroup.startId){var hasSetNewStartId=false; // get the node
var node=this.getNodeById(nodeId);if(node!=null){var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null&&transitions.length>0){var transition=transitions[0];if(transition!=null){var toNodeId=transition.to;if(toNodeId!=null){ // check that the to node is in the same group
if(this.isNodeInGroup(toNodeId,parentGroup.id)){ // update the parent group start id
parentGroup.startId=toNodeId;hasSetNewStartId=true;}}}}}}if(!hasSetNewStartId){parentGroup.startId='';}}} // remove the node
this.removeNodeIdFromTransitions(nodeId);this.removeNodeIdFromGroups(nodeId);this.removeNodeIdFromNodes(nodeId);if(parentGroup!=null){this.recalculatePositionsInGroup(parentGroup.id);}} /**
     * Update the transitions to handle removing a node
     * @param nodeId the node id to remove
     */},{key:'removeNodeIdFromTransitions',value:function removeNodeIdFromTransitions(nodeId){ // get the node we are removing
var nodeToRemove=this.getNodeById(nodeId); // get all the nodes that have a transition to the node we are removing
var nodesByToNodeId=this.getNodesByToNodeId(nodeId); // get the transitions of the node we are removing
var nodeToRemoveTransitionLogic=nodeToRemove.transitionLogic;var nodeToRemoveTransitions=[];if(nodeToRemoveTransitionLogic!=null&&nodeToRemoveTransitionLogic.transitions!=null){nodeToRemoveTransitions=nodeToRemoveTransitionLogic.transitions;}var parentIdOfNodeToRemove=this.getParentGroupId(nodeId);var parentGroup=this.getNodeById(parentIdOfNodeToRemove); // update the start id if we are removing the start node of a group
if(parentGroup!=null){var parentGroupStartId=parentGroup.startId;if(parentGroupStartId!=null){if(parentGroupStartId===nodeId){ // the node we are removing is the start node
if(nodeToRemoveTransitions!=null&&nodeToRemoveTransitions.length>0){ // loop through all the transitions from the node to choose a new start id
for(var t=0;t<nodeToRemoveTransitions.length;t++){var nodeToRemoveTransition=nodeToRemoveTransitions[t];if(nodeToRemoveTransition!=null){var toNodeId=nodeToRemoveTransition.to;if(toNodeId!=null){ /*
                                     * we need to check that the to node id is in the
                                     * same group. some transitions point to a node id
                                     * in the next group which we would not want to use
                                     * for the start id.
                                     */if(this.getParentGroupId(toNodeId)==parentIdOfNodeToRemove){ // set the new start id
parentGroup.startId=toNodeId;}}}}}else { // there are no transitions so we will have an empty start id
parentGroup.startId='';}}}} // loop through all the nodes that transition to the node we are removing
for(var n=0;n<nodesByToNodeId.length;n++){ // get a node that has a transition to the node we are removing
var node=nodesByToNodeId[n];if(node!=null){var parentIdOfFromNode=this.getParentGroupId(node.id);var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions; // loop through all the transitions of this node
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(nodeId===transition.to){ // we have found the transition to the node we are removing
// copy the transitions from the node we are removing
var transitionsCopy=angular.toJson(nodeToRemoveTransitions);transitionsCopy=angular.fromJson(transitionsCopy); /*
                             * if the parent from group is different than the parent removing group
                             * remove transitions that are to a node in a different group than
                             * the parent removing group
                             */if(parentIdOfFromNode!=parentIdOfNodeToRemove){for(var tc=0;tc<transitionsCopy.length;tc++){var tempTransition=transitionsCopy[tc];}if(tempTransition!=null){var tempToNodeId=tempTransition.to;if(tempToNodeId!=null){var parentIdOfToNode=this.getParentGroupId(tempToNodeId);if(parentIdOfNodeToRemove!=parentIdOfToNode){ // remove the transition
transitionsCopy.splice(tc,1);tc--;}}}} // remove the transition to the node we are removing
transitions.splice(t,1); // insert the transitions from the node we are removing
transitions=transitions.concat(transitionsCopy); // check if the node we are moving is a group
if(this.isGroupNode(nodeId)){ /*
                                 * we are moving a group so we need to update transitions that
                                 * go into the group
                                 */var groupIdWeAreMoving=nodeId;var groupThatTransitionsToGroupWeAreMoving=node;this.updateChildrenTransitionsIntoGroupWeAreMoving(groupThatTransitionsToGroupWeAreMoving,groupIdWeAreMoving);}}} // set the transitions into the node that transitions to the node we are removing
transitionLogic.transitions=transitions;}}}if(nodeToRemoveTransitionLogic!=null){ // clear the transitions of the node we are removing
nodeToRemoveTransitionLogic.transitions=[];}if(this.isGroupNode(nodeId)){ /*
             * this is a group node so we will remove all child transitions that
             * go out of this group
             */ //this.removeTransitionsIntoGroup(nodeId);
this.removeTransitionsOutOfGroup(nodeId);}}},{key:'removeNodeIdFromGroups', /**
     * Remove the node id from a group
     * @param nodeId the node id to remove
     */value:function removeNodeIdFromGroups(nodeId){var groups=this.groupNodes;if(groups!=null){ // loop through all the groups
for(var g=0;g<groups.length;g++){var group=groups[g];if(group!=null){ // get the start id of the group
var startId=group.startId; // get the child ids of the group
var ids=group.ids; // loop through all the child ids
for(var i=0;i<ids.length;i++){var id=ids[i];if(nodeId===id){ // we have found the node id we want to remove
ids.splice(i,1);if(nodeId===startId){ /*
                                 * the node id is also the start id so we will get the
                                 * next node id and set it as the new start id
                                 */var hasSetNewStartId=false; // get the node we are removing
var node=this.getNodeById(id);if(node!=null){var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null&&transitions.length>0){ // get the first transition
// TODO handle the case when the node we are removing is a branch point
var transition=transitions[0];if(transition!=null){ // get the node that this node transitions to
var to=transition.to;if(to!=null){ // set the to node as the start id
group.startId=to;hasSetNewStartId=true;}}}}}if(!hasSetNewStartId){ /*
                                     * the node we are removing did not have a transition
                                     * so there will be no start id
                                     */group.startId='';}}}}}}}} /**
     * Remove the node from the array of nodes
     * @param nodeId the node id to remove
     */},{key:'removeNodeIdFromNodes',value:function removeNodeIdFromNodes(nodeId){ // get all the nodes in the project
var nodes=this.project.nodes; // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){if(nodeId===node.id){ // we have found the node we want to remove
nodes.splice(n,1);}}}} /**
     * Remove the node from the inactive nodes array
     * @param nodeId the node to remove from the inactive nodes array
     */},{key:'removeNodeIdFromInactiveNodes',value:function removeNodeIdFromInactiveNodes(nodeId){ // get the inactive nodes array
var inactiveNodes=this.project.inactiveNodes;if(inactiveNodes!=null){ // loop through the inactive nodes
for(var i=0;i<inactiveNodes.length;i++){var inactiveNode=inactiveNodes[i];if(inactiveNode!=null){var inactiveNodeId=inactiveNode.id;if(nodeId===inactiveNodeId){ /*
                         * we have found the node we are looking for so we will
                         * remove it
                         */inactiveNodes.splice(i,1);}}}}} /**
     * Create a new component
     * @param nodeId the node id to create the component in
     * @param componentType the component type
     */},{key:'createComponent',value:function createComponent(nodeId,componentType){if(nodeId!=null&&componentType!=null){ // get the node we will create the component in
var node=this.getNodeById(nodeId); // get the service for the node type
var service=this.$injector.get(componentType+'Service');if(node!=null&&service!=null){ // create the new component
var component=service.createComponent(); // add the component to the node
this.addComponentToNode(node,component);}}} /**
     * Add the component to the node
     * @param node the node
     * @param component the component
     */},{key:'addComponentToNode',value:function addComponentToNode(node,component){if(node!=null&&component!=null){node.components.push(component);}} /**
     * Move the component up within the node
     * @param nodeId the node id
     * @param componentId the component id
     */},{key:'moveComponentUp',value:function moveComponentUp(nodeId,componentId){if(nodeId!=null&&componentId!=null){var node=this.getNodeById(nodeId);if(node!=null){var components=node.components;if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var component=components[c];if(component.id===componentId){ // we have found the component we want to move
/*
                             * make sure this is not the first component because
                             * the first component can't be moved up
                             */if(c!=0){ // this is not the first component
// remove the component
components.splice(c,1); // put the component back in at the position one index back
components.splice(c-1,0,component);break;}}}}}}} /**
     * Move the component down within the node
     * @param nodeId the node id
     * @param componentId the component id
     */},{key:'moveComponentDown',value:function moveComponentDown(nodeId,componentId){if(nodeId!=null&&componentId!=null){var node=this.getNodeById(nodeId);if(node!=null){var components=node.components;if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var component=components[c];if(component.id===componentId){ // we have found the component we want to move
/*
                             * make sure this is not the last component because
                             * the last component can't be moved down
                             */if(c!=components.length-1){ // this is not the last component
// remove the component
components.splice(c,1); // put the component back in at the position one index ahead
components.splice(c+1,0,component);break;}}}}}}} /**
     * Delete the component
     * @param nodeId the node id
     * @param componentId the component id
     */},{key:'deleteComponent',value:function deleteComponent(nodeId,componentId){if(nodeId!=null&&componentId!=null){var node=this.getNodeById(nodeId);if(node!=null){var components=node.components;if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var component=components[c];if(component.id===componentId){ // we have found the component we want to delete
// remove the component
components.splice(c,1);break;}}}}}} /**
     * Get the max score for the project
     * @returns the max score for the project or null if none of the components in the project
     * has max scores.
     */},{key:'getMaxScore',value:function getMaxScore(){var maxScore=null;var nodes=this.project.nodes;if(nodes!=null){ // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeMaxScore=this.getMaxScoreForNode(node.id);if(nodeMaxScore!=null){if(maxScore==null){maxScore=nodeMaxScore;}else {maxScore+=nodeMaxScore;}}}}}return maxScore;} /**
     * Get the max score for the node
     * @param nodeId the node id
     * @returns the max score for the node
     */},{key:'getMaxScoreForNode',value:function getMaxScoreForNode(nodeId){var maxScore=null; // get the node
var node=this.getNodeById(nodeId);if(node!=null){var components=node.components;if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var component=components[c];if(component!=null){ // get the max score for the component
var componentMaxScore=component.maxScore; // check if the component has a max score
if(componentMaxScore!=null){ // make sure the max score is a valid number
if(!isNaN(componentMaxScore)){if(maxScore==null){maxScore=componentMaxScore;}else { // accumulate the max score
maxScore+=componentMaxScore;}}}}}}}return maxScore;} /**
     * Get the max score for a component
     * @param nodeId get the max score from a component in this node
     * @param componentId get the max score from this component
     */},{key:'getMaxScoreForComponent',value:function getMaxScoreForComponent(nodeId,componentId){var maxScore=null;var component=this.getComponentByNodeIdAndComponentId(nodeId,componentId);if(component!=null){maxScore=component.maxScore;}return maxScore;} /**
     * Determine if a node id is a direct child of a group
     * @param nodeId the node id
     * @param groupId the group id
     */},{key:'isNodeInGroup',value:function isNodeInGroup(nodeId,groupId){var result=false;var group=this.getNodeById(groupId);var childIds=group.ids;if(childIds!=null){if(childIds.indexOf(nodeId)!=-1){result=true;}}return result;} /**
     * Get the first leaf node by traversing all the start ids
     * until a leaf node id is found
     */},{key:'getFirstLeafNodeId',value:function getFirstLeafNodeId(){var firstLeafNodeId=null; // get the start group id
var startGroupId=this.project.startGroupId; // get the start group node
var node=this.getNodeById(startGroupId);var done=false; // loop until we have found a leaf node id or something went wrong
while(!done){if(node==null){done=true;}else if(this.isGroupNode(node.id)){ // set the first leaf node id to the group id for now
firstLeafNodeId=node.id; // the current node is a group
node=this.getNodeById(node.startId);}else if(this.isApplicationNode(node.id)){ // the current node is a leaf
firstLeafNodeId=node.id;done=true;}else {done=true;}}return firstLeafNodeId;} /**
     * Replace a node. This is used when we want to revert a node back to a
     * previous version in the authoring tool.
     * @param nodeId the node id
     * @param node the node object
     */},{key:'replaceNode',value:function replaceNode(nodeId,node){if(nodeId!=null&&node!=null){ // set the id to node mapping
this.setIdToNode(nodeId,node); // set the id to element mapping
this.setIdToElement(nodeId,node); // update the nodes array
var nodes=this.getNodes();if(nodes!=null){for(var n=0;n<nodes.length;n++){var tempNode=nodes[n];if(tempNode!=null){var tempNodeId=tempNode.id;if(nodeId===tempNodeId){ // we have found the node we want to replace
nodes.splice(n,1,node);break;}}}} // update the application nodes array
var applicationNodes=this.applicationNodes;if(applicationNodes!=null){for(var a=0;a<applicationNodes.length;a++){var tempApplicationNode=applicationNodes[a];if(tempApplicationNode!=null){var tempApplicationNodeId=tempApplicationNode.id;if(nodeId===tempApplicationNodeId){ // we have found the node we want to replace
applicationNodes.splice(a,1,node);}}}}}} /**
     * Check if a node is a planning node
     * @param nodeId the node id
     * @returns whether the node is a planning node
     */},{key:'isPlanning',value:function isPlanning(nodeId){var result=false;if(nodeId!=null){var node=this.getNodeById(nodeId);if(node!=null){if(node.planning){result=true;}}}return result;} /**
     * Check if a node is a planning node instance
     * @param nodeId the node id
     * @returns whether the node is a planning node instance
     */},{key:'isPlanningInstance',value:function isPlanningInstance(nodeId){var result=false;if(nodeId!=null){var node=this.getNodeById(nodeId);if(node.planningNodeTemplateId){result=true;}}return result;} /**
     * Get the available planning node ids for a node
     * @param nodeId the node we want available planning nodes for
     * @returns an array of available planning node ids
     */},{key:'getAvailablePlanningNodeIds',value:function getAvailablePlanningNodeIds(nodeId){var availablePlanningNodeIds=[];if(nodeId!=null){var node=this.getNodeById(nodeId);if(node!=null&&node.availablePlanningNodeIds!=null){availablePlanningNodeIds=node.availablePlanningNodeIds;}}return availablePlanningNodeIds;} /**
     * Get the available planning nodes for a given group
     * @param nodeId the node id of the group
     * @returns an array of planning node templates
     */},{key:'getAvailablePlanningNodes',value:function getAvailablePlanningNodes(nodeId){var availablePlanningNodesSoFar=[];if(nodeId!=null){var node=this.getNodeById(nodeId);if(node!=null&&node.availablePlanningNodes!=null){var availablePlanningNodes=node.availablePlanningNodes; // loop through all the nodes and retrieve the actual node
for(var a=0;a<availablePlanningNodes.length;a++){var availablePlanningNode=availablePlanningNodes[a];if(availablePlanningNode!=null){ // get the node
var availablePlanningNodeActual=this.getNodeById(availablePlanningNode.nodeId);if(availablePlanningNodeActual!=null){if(availablePlanningNode.max!=null){availablePlanningNodeActual.max=availablePlanningNode.max;}availablePlanningNodesSoFar.push(availablePlanningNodeActual);}}}}}return availablePlanningNodesSoFar;} /**
     * Create a planning node instance and add it to the project
     * @param groupId the group id to add the planning node instance to
     * @param nodeId the node id of the planning node template
     */},{key:'createPlanningNodeInstance',value:function createPlanningNodeInstance(groupId,nodeId,nextAvailablePlanningNodeId){var planningNodeInstance=null;if(nodeId!=null&&nextAvailablePlanningNodeId!=null){ // get the planning node template
var node=this.getNodeById(nodeId); // create a planning node instance by copying the planning node template
planningNodeInstance=this.copyNode(nodeId); // set the template id to point back to the planning template node
planningNodeInstance.planningNodeTemplateId=nodeId; // set the planning node instance node id
planningNodeInstance.id=nextAvailablePlanningNodeId;}return planningNodeInstance;} /**
     * Add a planning node instance inside a group node
     * @param nodeIdToInsertInside the group id to insert into
     * @param planningNodeInstance the planning node instance to add
     */},{key:'addPlanningNodeInstanceInside',value:function addPlanningNodeInstanceInside(nodeIdToInsertInside,planningNodeInstance){ // get the node id
var planningNodeInstanceNodeId=planningNodeInstance.id; // add an entry in our mapping data structures of node id to object
this.setIdToNode(planningNodeInstanceNodeId,planningNodeInstance);this.setIdToElement(planningNodeInstanceNodeId,planningNodeInstance); // add the node to the nodes array in the project
this.addNode(planningNodeInstance); // update the transitions
this.insertNodeInsideInTransitions(planningNodeInstanceNodeId,nodeIdToInsertInside); // update the child ids of the group
this.insertNodeInsideInGroups(planningNodeInstanceNodeId,nodeIdToInsertInside); // recalculate all the position values in the group
this.recalculatePositionsInGroup(nodeIdToInsertInside); /*
         * set the order of the planning node instance so that it shows up
         * in the select step drop down in the correct order
         */this.setNodeOrder(this.rootNode,0);} /**
     * Add a planning node instance after a node
     * @param nodeIdToInsertAfter the node to insert after
     * @param planningNodeInstance the planning node instance to add
     */},{key:'addPlanningNodeInstanceAfter',value:function addPlanningNodeInstanceAfter(nodeIdToInsertAfter,planningNodeInstance){ // get the node id
var planningNodeInstanceNodeId=planningNodeInstance.id; // add an entry in our mapping data structures of node id to object
this.setIdToNode(planningNodeInstanceNodeId,planningNodeInstance);this.setIdToElement(planningNodeInstanceNodeId,planningNodeInstance); // add the node to the nodes array in the project
this.addNode(planningNodeInstance); // update the transitions
this.insertNodeAfterInTransitions(planningNodeInstance,nodeIdToInsertAfter); // update the child ids of the group
this.insertNodeAfterInGroups(planningNodeInstanceNodeId,nodeIdToInsertAfter);var parentGroup=this.getParentGroup(nodeIdToInsertAfter);if(parentGroup!=null){var parentGroupId=parentGroup.id; // recalculate all the position values in the group
this.recalculatePositionsInGroup(parentGroupId);} /*
         * set the order of the planning node instance so that it shows up
         * in the select step drop down in the correct order
         */this.setNodeOrder(this.rootNode,0);} /**
     * Move a planning node instance inside a group
     * @param nodeIdToMove the node to move
     * @param nodeIdToInsertInside the group to move the node into
     */},{key:'movePlanningNodeInstanceInside',value:function movePlanningNodeInstanceInside(nodeIdToMove,nodeIdToInsertInside){ // move the node inside the group node
this.moveNodesInside([nodeIdToMove],nodeIdToInsertInside); // recalculate all the position values in the group
this.recalculatePositionsInGroup(nodeIdToInsertInside); /*
         * set the order of the planning node instance so that it shows up
         * in the select step drop down in the correct order
         */this.setNodeOrder(this.rootNode,0);} /**
     * Move a planning node instance after a node
     * @param nodeIdToMove the node to move
     * @param nodeIdToInsertAfter the other node to move the node after
     */},{key:'movePlanningNodeInstanceAfter',value:function movePlanningNodeInstanceAfter(nodeIdToMove,nodeIdToInsertAfter){ // move the node after the other node
this.moveNodesAfter([nodeIdToMove],nodeIdToInsertAfter);var parentGroup=this.getParentGroup(nodeIdToInsertAfter);if(parentGroup!=null){var parentGroupId=parentGroup.id; // recalculate all the position values in the group
this.recalculatePositionsInGroup(parentGroupId);} /*
         * set the order of the planning node instance so that it shows up
         * in the select step drop down in the correct order
         */this.setNodeOrder(this.rootNode,0);} /**
     * Recalculate the positions of the children in the group.
     * The positions are the numbers usually seen before the title
     * e.g. if the step is seen as 1.3: Gather Evidence, then 1.3
     * is the position
     * @param groupId recalculate all the children of this group
     */},{key:'recalculatePositionsInGroup',value:function recalculatePositionsInGroup(groupId){if(groupId!=null){var childIds=this.getChildNodeIdsById(groupId); // loop througha all the children
for(var c=0;c<childIds.length;c++){var childId=childIds[c]; // calculate the position of the child id
var pos=this.getPositionById(childId); // set the mapping of node id to position
this.setIdToPosition(childId,pos);}}} /**
     * Get the message that describes how to disable the constraint
     * @param nodeId the node the student is trying to go to
     * @param constraint the constraint that is preventing the student
     * from going to the node
     * @returns the message to display to the student that describes how
     * to disable the constraint
     */},{key:'getConstraintMessage',value:function getConstraintMessage(nodeId,constraint){var message='';if(nodeId!=null&&constraint!=null){ // get the node title the student is trying to go to
var nodeTitle=this.getNodePositionAndTitleByNodeId(nodeId);var removalConditional=constraint.removalConditional;var removalCriteria=constraint.removalCriteria;if(removalConditional==='any'){message+='To visit "'+nodeTitle+'" you must perform one of the actions below:<br/>';}else {message+='To visit "'+nodeTitle+'" you must perform all of the actions below:<br/>';}if(removalCriteria!=null){var criteriaMessages=''; // loop through all the criteria
for(var x=0;x<removalCriteria.length;x++){var tempRemovalCriteria=removalCriteria[x];if(tempRemovalCriteria!=null){ // get the message that describes the criteria that needs to be satisfied
var criteriaMessage=this.getCriteriaMessage(tempRemovalCriteria);if(criteriaMessage!=null&&criteriaMessage!=''){ // separate criteria messages with a line break
if(criteriaMessages!=''){criteriaMessages+='<br/>';}criteriaMessages+=criteriaMessage;}}}message+=criteriaMessages;}}return message;} /**
     * Get the message that describes how to satisfy the criteria
     * TODO: check if the criteria is satisfied
     * @param criteria the criteria object that needs to be satisfied
     * @returns the message to display to the student that describes how to
     * satisfy the criteria
     */},{key:'getCriteriaMessage',value:function getCriteriaMessage(criteria){var message='';if(criteria!=null){var name=criteria.name;var params=criteria.params;if(name==='isCompleted'){var nodeId=params.nodeId;if(nodeId!=null){var nodeTitle=this.getNodePositionAndTitleByNodeId(nodeId);message+='Complete "'+nodeTitle+'"';}}else if(name==='isVisited'){var nodeId=params.nodeId;if(nodeId!=null){var nodeTitle=this.getNodePositionAndTitleByNodeId(nodeId);message+='Visit "'+nodeTitle+'"';}}else if(name==='choiceChosen'){}else if(name==='branchPathTaken'){}else if(name==='isPlanningActivityCompleted'){var nodeId=params.nodeId;if(nodeId!=null){var nodeTitle=this.getNodePositionAndTitleByNodeId(nodeId);message+='Complete "'+nodeTitle+'"';}}}return message;} /**
     * Get the start id of a group
     * @param nodeId get the start id of this group
     * @returns the start id of the group
     */},{key:'getGroupStartId',value:function getGroupStartId(nodeId){var startId=null;if(nodeId!=null){ // get the group
var node=this.getNodeById(nodeId);if(node!=null){ // get the start id
startId=node.startId;}}return startId;} /**
     * Get the start id of the node's parent group
     * @param nodeId we will get the parent of this node and then look
     * for the start id of the parent
     * @returns the start id of the parent
     */},{key:'getParentGroupStartId',value:function getParentGroupStartId(nodeId){var parentGroupStartId=null;if(nodeId!=null){var parentGroup=this.getParentGroup(nodeId);if(parentGroup!=null){parentGroupStartId=parentGroup.startId;}}return parentGroupStartId;} /**
     * Update the transitions so that the fromGroup points to the newToGroup
     *
     * Before
     * fromGroup -> oldToGroup -> newToGroup
     *
     * After
     * fromGroup -> newToGroup
     * oldToGroup becomes dangling and has no transitions to or from it
     */},{key:'updateTransitionsForExtractingGroup',value:function updateTransitionsForExtractingGroup(fromGroupId,oldToGroupId,newToGroupId){ /*
         * make the transitions
         * fromGroup -> newToGroup
         */if(fromGroupId!=null&&oldToGroupId!=null){var fromGroup=this.getNodeById(fromGroupId);var oldToGroup=this.getNodeById(oldToGroupId);var newToGroup=null;var newToGroupStartId=null;if(newToGroupId!=null){newToGroup=this.getNodeById(newToGroupId);}if(newToGroup!=null){newToGroupStartId=newToGroup.startId;}if(fromGroup!=null&&oldToGroup!=null){var childIds=fromGroup.ids; // update the children of the from group to point to the new to group
if(childIds!=null){for(var c=0;c<childIds.length;c++){var childId=childIds[c];var child=this.getNodeById(childId);var transitions=this.getTransitionsByFromNodeId(childId);if(transitions!=null){ // loop through all the transitions from the from group
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var toNodeId=transition.to;if(toNodeId===oldToGroupId){ // the transition is to the group
if(newToGroupId==null&&newToGroupStartId==null){ // there is no new to group so we will remove the transition
transitions.splice(t,1);t--;}else { // make the transition point to the new to group
transition.to=newToGroupId;}}else if(this.isNodeInGroup(toNodeId,oldToGroupId)){ // the transition is to a node in the group
if(newToGroupId==null&&newToGroupStartId==null){ // there is no new to group so we will remove the transition
transitions.splice(t,1);t--;}else if(newToGroupStartId==null||newToGroupStartId==''){ // make the transition point to the new to group
transition.to=newToGroupId;}else { // make the transition point to the new group start id
transition.to=newToGroupStartId;}}}}}}}}} /*
         * remove the transitions from the oldToGroup
         */if(oldToGroupId!=null&&newToGroupId!=null){var oldToGroup=this.getNodeById(oldToGroupId);if(oldToGroup!=null){var childIds=oldToGroup.ids; // remove the transitions from the old to group that point to the new to group
if(childIds!=null){for(var c=0;c<childIds.length;c++){var childId=childIds[c];var child=this.getNodeById(childId);var transitions=this.getTransitionsByFromNodeId(childId);if(transitions!=null){ // loop through all the transitions from the old to group
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var toNodeId=transition.to;if(toNodeId===newToGroupId){ // the transition is to the group so we will remove it
transitions.splice(t,1);t--;}else if(this.isNodeInGroup(toNodeId,newToGroupId)){ // the transition is to a node in the group so we will remove it
transitions.splice(t,1);t--;}}}}}}}}} /**
     * Update the transitions so that the fromGroup points to the newToGroup
     *
     * Before
     * fromGroup -> oldToGroup
     * newToGroup is dangling and has no transitions to or from it
     *
     * After
     * fromGroup -> newToGroup -> oldToGroup
     */},{key:'updateTransitionsForInsertingGroup',value:function updateTransitionsForInsertingGroup(fromGroupId,oldToGroupIds,newToGroupId){var fromGroup=null;var newToGroup=null;if(fromGroupId!=null){fromGroup=this.getNodeById(fromGroupId);}if(newToGroupId!=null){newToGroup=this.getNodeById(newToGroupId);} /*
         * make the transitions that point to the old group now point
         * to the new group
         * fromGroup -> newToGroup
         */if(fromGroup!=null&&newToGroup!=null){var childIds=fromGroup.ids;var newToGroupStartId=newToGroup.startId;if(childIds!=null){ // loop through all the nodes in the from group
for(var c=0;c<childIds.length;c++){var childId=childIds[c];var child=this.getNodeById(childId); // get the transitions from the child
var transitions=this.getTransitionsByFromNodeId(childId);if(transitions==null||transitions.length==0){ /*
                         * the child does not have any transitions so we will make it
                         * point to the new group
                         */if(newToGroupStartId==null||newToGroupStartId==''){this.addToTransition(child,newToGroupId);}else {this.addToTransition(child,newToGroupStartId);}}else if(transitions!=null){ // loop through all the transitions from the child
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var toNodeId=transition.to;if(oldToGroupIds!=null){ /*
                                     * loop through all the old to group ids to find transitions
                                     * to the old to group
                                     */for(var ot=0;ot<oldToGroupIds.length;ot++){var oldToGroupId=oldToGroupIds[ot];if(toNodeId===oldToGroupId){ /*
                                             * the transition is to the group so we will update the transition
                                             * to the new group
                                             */transition.to=newToGroupId;}else if(this.isNodeInGroup(toNodeId,oldToGroupId)){ /*
                                             * the transition is to a node in the old group so we will update
                                             * the transition to point to the new group
                                             */if(newToGroupStartId==null||newToGroupStartId==''){transition.to=newToGroupId;}else {transition.to=newToGroupStartId;}}}}}}}}}} /*
         * make the steps that do not have a transition now point to the old
         * group
         * newToGroup -> oldToGroup
         */if(newToGroup!=null){var childIds=newToGroup.ids;if(childIds!=null){ // loop through all the children in the new group
for(var c=0;c<childIds.length;c++){var childId=childIds[c];var child=this.getNodeById(childId); // get the transitions for the child
var transitions=this.getTransitionsByFromNodeId(childId);if(transitions==null||transitions.length==0){if(oldToGroupIds!=null){ // loop through all the old groups
for(var ot=0;ot<oldToGroupIds.length;ot++){var oldToGroupId=oldToGroupIds[ot];var oldToGroup=this.getNodeById(oldToGroupId);if(oldToGroup!=null){var oldToGroupStartId=oldToGroup.startId;var transition={};var toNodeId='';if(oldToGroupStartId==null){ // there is no start node id so we will just point to the group
toNodeId=oldToGroup;}else { // there is a start node id so we will point to it
toNodeId=oldToGroupStartId;} // create the transition from the child to the old group
this.addToTransition(child,toNodeId);}}}}}}}} /**
     * Update the child transitions because we are moving a group. We will
     * update the transitions into and out of the group in the location
     * we are extracting the group from and also in the location we are
     * inserting the group into.
     * @param node the group we are moving
     * @param nodeId we will put the group after this node id
     */},{key:'updateChildrenTransitionsForMovingGroup',value:function updateChildrenTransitionsForMovingGroup(node,nodeId){var transitionsBefore=null; // get the group nodes that point to the group we are moving
var previousGroupNodes=this.getGroupNodesByToNodeId(node.id); // get all the transitions from the group we are moving
var transitionsAfter=this.getTransitionsByFromNodeId(node.id);var extracted=false; /*
         * extract the group we are moving by updating the transitions of the
         * from group and the new to group. also remove the transitions from the
         * group we are moving.
         */ // loop through all the groups that point to the group we are moving
for(var p=0;p<previousGroupNodes.length;p++){var previousGroupNode=previousGroupNodes[p];if(transitionsAfter==null||transitionsAfter.length==0){ // the group we are moving does not have any transitions
/*
                 * remove the transitions to the group we are moving and make
                 * new transitions from the from group to the new to group
                 */this.updateTransitionsForExtractingGroup(previousGroupNode.id,node.id,null);extracted=true;}else { // the group we are moving has transitions
// make the previous group point to the new to group
for(var t=0;t<transitionsAfter.length;t++){var transitionAfter=transitionsAfter[t];if(transitionAfter!=null){var toNodeId=transitionAfter.to; /*
                         * remove the transitions to the group we are moving and make
                         * new transitions from the from group to the new to group
                         */this.updateTransitionsForExtractingGroup(previousGroupNode.id,node.id,toNodeId);extracted=true;}}}}if(!extracted){ /*
             * we have not removed the transitions yet because the group
             * we are moving does not have any groups before it
             */ // remove the transitions from the group we are moving
for(var t=0;t<transitionsAfter.length;t++){var transitionAfter=transitionsAfter[t];if(transitionAfter!=null){var toNodeId=transitionAfter.to; // remove the transitions to the group we are moving
this.updateTransitionsForExtractingGroup(null,node.id,toNodeId);extracted=true;}}}var inserted=false; /*
         * create the transitions from the from group to the group we are moving
         * and the transitions from the group we are moving to the old to group
         */if(nodeId!=null){ // get the transitions from the previous group to the next group
var transitionsAfter=this.getTransitionsByFromNodeId(nodeId);for(var t=0;t<transitionsAfter.length;t++){var transitionAfter=transitionsAfter[t];if(transitionAfter!=null){var toNodeId=transitionAfter.to; /*
                     * create the transitions that traverse from the from group
                     * to the group we are moving. also create the transitions
                     * that traverse from the group we are moving to the old
                     * to group.
                     */this.updateTransitionsForInsertingGroup(nodeId,[toNodeId],node.id);inserted=true;}}}if(!inserted){ /*
             * we have not inserted the transitions yet because there were no
             * previous group transitions
             */if(nodeId==null){ /*
                 * the previous node id is null which means there was no previous
                 * group. this means the group we are inserting will become the
                 * first group. this happens when the group we are moving
                 * is moved inside the root (group0).
                 */var startGroupId=this.getStartGroupId();if(startGroupId!=null){ // get the start group for the whole project (group0)
var startGroup=this.getNodeById(startGroupId);if(startGroup!=null){ // get the first activity
var firstGroupId=startGroup.startId; /*
                         * create the transitions that traverse from the group
                         * we are moving to the previous first activity.
                         */this.updateTransitionsForInsertingGroup(nodeId,[firstGroupId],node.id);}}}else { /*
                 * we have not inserted the group yet because the from group doesn't
                 * have a group after it
                 */ /*
                 * create the transitions that traverse from the from group
                 * to the group we are moving.
                 */this.updateTransitionsForInsertingGroup(nodeId,null,node.id);}}} /**
     * Check if a component is a connected component
     * @param nodeId the node id of the component
     * @param componentId the component that is listening for connected changes
     * @param connectedComponentId the component that is broadcasting connected changes
     * @returns whether the componentId is connected to the connectedComponentId
     */},{key:'isConnectedComponent',value:function isConnectedComponent(nodeId,componentId,connectedComponentId){var result=false; // get the component
var component=this.getComponentByNodeIdAndComponentId(nodeId,componentId);if(component!=null){var connectedComponents=component.connectedComponents;if(connectedComponents!=null){ // loop through all the connected components
for(var c=0;c<connectedComponents.length;c++){var connectedComponent=connectedComponents[c];if(connectedComponent!=null){if(connectedComponentId===connectedComponent.id){ // we have found the connected component id we are looking for
result=true;break;}}}}}return result;} /**
     * Get a connected component params
     * @param componentId the connected component id
     * @returns the params for the connected component
     */},{key:'getConnectedComponentParams',value:function getConnectedComponentParams(componentContent,componentId){var connectedComponentParams=null;if(componentContent!=null&&componentId!=null){ // get the connected components
var connectedComponents=componentContent.connectedComponents;if(connectedComponents!=null){ // loop through all the connected components
for(var c=0;c<connectedComponents.length;c++){var connectedComponent=connectedComponents[c];if(connectedComponent!=null){var tempComponentId=connectedComponent.id;if(componentId===tempComponentId){ // we have found the connected component we are looking for
connectedComponentParams=connectedComponent;}}}}}return connectedComponentParams;} /**
     * Get the inactive groups
     * @returns the inactive groups
     */},{key:'getInactiveGroups',value:function getInactiveGroups(){var inactiveGroups=[];if(this.project!=null){if(this.project.inactiveGroups==null){this.project.inactiveGroups=[];}inactiveGroups=this.project.inactiveGroups;}return inactiveGroups;} /**
     * Get the inactive nodes
     * @returns the inactive nodes
     */},{key:'getInactiveNodes',value:function getInactiveNodes(){var inactiveNodes=[];if(this.project!=null){if(this.project.inactiveNodes==null){this.project.inactiveNodes=[];}inactiveNodes=this.project.inactiveNodes;}return inactiveNodes;} /**
     * Remove the node from the active nodes
     * @param nodeId the node to remove
     * @returns the node that we have removed
     */},{key:'removeNodeFromActiveNodes',value:function removeNodeFromActiveNodes(nodeId){var node=null;if(nodeId!=null){ // get the active nodes
var activeNodes=this.project.nodes;if(activeNodes!=null){ // loop through all the active nodes
for(var a=0;a<activeNodes.length;a++){var activeNode=activeNodes[a];if(activeNode!=null){if(nodeId===activeNode.id){ // we have found the node we want to remove
node=activeNode; // remove the node from the array
activeNodes.splice(a,1);break;}}}}}return node;} /**
     * Remove the node from the inactive nodes array
     * @param nodeId the node to remove
     * @returns the node that was removed
     */},{key:'removeNodeFromInactiveNodes',value:function removeNodeFromInactiveNodes(nodeId){var node=null;if(nodeId!=null){ // get all the inactive nodes
var inactiveNodes=this.project.inactiveNodes;if(inactiveNodes!=null){ // loop through all the inactive nodes
for(var i=0;i<inactiveNodes.length;i++){var inactiveNode=inactiveNodes[i];if(inactiveNode!=null){if(nodeId===inactiveNode.id){ // we have found the node we want to remove
node=inactiveNode; // remove the node from the array
inactiveNodes.splice(i,1);break;}}}}}return node;} /**
     * Load the inactive nodes
     * @param nodes the inactive nodes
     */},{key:'loadInactiveNodes',value:function loadInactiveNodes(nodes){if(nodes!=null){for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeId=node.id; // set the node into the mapping data structures
this.setIdToNode(nodeId,node);this.setIdToElement(nodeId,node);}}}} /**
     * Check if the node is active
     * @param nodeId the node to check
     * @returns whether the node is in the active array
     */},{key:'isActive',value:function isActive(nodeId){var result=true;if(nodeId!=null){if(nodeId==='inactiveNodes'){ // this occurs when the author puts a step into the inactive nodes
result=false;}else if(nodeId==='inactiveGroups'){ // this occurs when the author puts a group into the inactive groups
result=false;}else if(this.isGroupNode(nodeId)){ // the node is a group node
// TODO: implement this
}else { // the node is a step node
// get the inactive nodes
var inactiveNodes=this.project.inactiveNodes;if(inactiveNodes!=null){ // loop through all the inactive nodes
for(var i=0;i<inactiveNodes.length;i++){var inactiveNode=inactiveNodes[i];if(inactiveNode!=null){if(nodeId===inactiveNode.id){ // we have found the node in the inactive nodes
result=false;break;}}}}}}return result;} /**
     * Move the node to the active nodes array
     */},{key:'moveToActive',value:function moveToActive(node){if(node!=null){ // make sure the node is inactive
if(!this.isActive(node.id)){ // the node is inactive so we will move it to the active array
// remove the node from inactive nodes array
this.removeNodeFromInactiveNodes(node.id); // add the node to the active array
this.addNode(node);}}} /**
     * Move the node to the inactive nodes array
     * @param node the node to move
     * @param nodeIdToInsertAfter place the node after this
     */},{key:'moveToInactive',value:function moveToInactive(node,nodeIdToInsertAfter){if(node!=null){ // make sure the node is active
if(this.isActive(node.id)){ // the node is active so we will move it to the inactive array
// remove the node from the active array
this.removeNodeFromActiveNodes(node.id); // add the node to the inactive array
this.addInactiveNode(node,nodeIdToInsertAfter);}}} /**
     * Add the node to the inactive nodes array
     * @param node the node to move
     * @param nodeIdToInsertAfter place the node after this
     */},{key:'addInactiveNode',value:function addInactiveNode(node,nodeIdToInsertAfter){if(node!=null){var inactiveNodes=this.project.inactiveNodes;if(inactiveNodes!=null){if(nodeIdToInsertAfter==null||nodeIdToInsertAfter==='inactiveSteps'){ // put the node at the beginning of the inactive steps
inactiveNodes.splice(0,0,node);}else { // put the node after one of the inactive nodes
var added=false; // loop through all the inactive nodes
for(var i=0;i<inactiveNodes.length;i++){var inactiveNode=inactiveNodes[i];if(inactiveNode!=null){if(nodeIdToInsertAfter===inactiveNode.id){ // we have found the position to place the node
inactiveNodes.splice(i+1,0,node);added=true;}}}if(!added){ /*
                         * we haven't added the node yet so we will just add it
                         * to the end of the array
                         */inactiveNodes.push(node);}}}}} /**
     * Move an inactive node within the inactive nodes array
     * @param node the node to move
     * @param nodeIdToInsertAfter place the node after this
     */},{key:'moveInactiveNode',value:function moveInactiveNode(node,nodeIdToInsertAfter){if(node!=null){var inactiveNodes=this.project.inactiveNodes;if(inactiveNodes!=null){ // remove the node from inactive nodes
// loop through all the inactive nodes
for(var i=0;i<inactiveNodes.length;i++){var inactiveNode=inactiveNodes[i];if(inactiveNode!=null){if(node.id===inactiveNode.id){ // we have found the node we want to remove
inactiveNodes.splice(i,1);}}} // add the node back into the inactive nodes
if(nodeIdToInsertAfter==null||nodeIdToInsertAfter==='inactiveSteps'){ // put the node at the beginning of the inactive nodes
inactiveNodes.splice(0,0,node);}else { // put the node after one of the inactive nodes
var added=false; // loop through all the inactive nodes
for(var i=0;i<inactiveNodes.length;i++){var inactiveNode=inactiveNodes[i];if(inactiveNode!=null){if(nodeIdToInsertAfter===inactiveNode.id){ // we have found the position to place the node
inactiveNodes.splice(i+1,0,node);added=true;}}}if(!added){ /*
                         * we haven't added the node yet so we will just add it
                         * to the end of the array
                         */inactiveNodes.push(node);}}}}} /**
     * Remove transitions that go into the group
     * @param nodeId the group id
     */},{key:'removeTransitionsIntoGroup',value:function removeTransitionsIntoGroup(nodeId){if(nodeId!=null){var group=this.getNodeById(nodeId);if(group!=null){var childIds=group.ids;if(childIds!=null){ // loop through all the children
for(var c=0;c<childIds.length;c++){var childId=childIds[c];if(childId!=null){this.removeTransitionsThatPointToNodeIdFromOutsideGroup(childId);}}}}}} /**
     * Remove the transitions that point to the node that does not have
     * the same parent
     * @param nodeId remove transitions to this node
     */},{key:'removeTransitionsThatPointToNodeIdFromOutsideGroup',value:function removeTransitionsThatPointToNodeIdFromOutsideGroup(nodeId){if(nodeId!=null){ // get the parent of the node
var parentGroupId=this.getParentGroupId(nodeId); // get all the nodes that point to the node
var nodesThatPointToTargetNode=this.getNodesByToNodeId(nodeId);if(nodesThatPointToTargetNode!=null){ // loop through all the nodes that point to the node
for(var n=0;n<nodesThatPointToTargetNode.length;n++){var nodeThatPointsToTargetNode=nodesThatPointToTargetNode[n];if(nodeThatPointsToTargetNode!=null){ // get the parent of the node that points to the node target node
var nodeThatPointsToTargetNodeParentGroupId=this.getParentGroupId(nodeThatPointsToTargetNode.id);if(parentGroupId!=nodeThatPointsToTargetNodeParentGroupId){ /*
                             * the parent groups are different so we will remove
                             * the transition
                             */this.removeTransition(nodeThatPointsToTargetNode,nodeId);}}}}}} /**
     * Remove a transition
     * @param node remove a transition in this node
     * @param toNodeId remove the transition that goes to this node id
     */},{key:'removeTransition',value:function removeTransition(node,toNodeId){if(node!=null&&toNodeId!=null){var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null){ // loop through all the transitions
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){if(toNodeId===transition.to){ // we have found a transition that goes to the toNodeId
// remove the transition
transitions.splice(t,1);t--;}}}}}}} /**
     * Remove transitions that go out of the group
     * @param nodeId the group id
     */},{key:'removeTransitionsOutOfGroup',value:function removeTransitionsOutOfGroup(nodeId){if(nodeId!=null){var group=this.getNodeById(nodeId);if(group!=null){var childIds=group.ids;if(childIds!=null){ // loop through all the child ids
for(var c=0;c<childIds.length;c++){var childId=childIds[c];if(childId!=null){ // get the transitions of the child
var transitions=this.getTransitionsByFromNodeId(childId);if(transitions!=null){ // loop through all the transitions
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){ // get the to node id of the transition
var toNodeId=transition.to;if(toNodeId!=null){ // get the parent group id of the toNodeId
var toNodeIdParentGroupId=this.getParentGroupId(toNodeId);if(nodeId!=toNodeIdParentGroupId){ /*
                                                 * the parent group is different which means it is a
                                                 * transition that goes out of the group
                                                 */ // remove the transition
transitions.splice(t,1);t--;}}}}}}}}}}} /*
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
     */},{key:'updateChildrenTransitionsIntoGroupWeAreMoving',value:function updateChildrenTransitionsIntoGroupWeAreMoving(groupThatTransitionsToGroupWeAreMoving,groupIdWeAreMoving){if(groupThatTransitionsToGroupWeAreMoving!=null&&groupIdWeAreMoving!=null){var group=this.getNodeById(groupIdWeAreMoving);if(group!=null){ // get all the nodes that have a transition to the node we are removing
var nodesByToNodeId=this.getNodesByToNodeId(groupIdWeAreMoving); // get the transitions of the node we are removing
var nodeToRemoveTransitionLogic=group.transitionLogic;var nodeToRemoveTransitions=[];if(nodeToRemoveTransitionLogic!=null&&nodeToRemoveTransitionLogic.transitions!=null){nodeToRemoveTransitions=nodeToRemoveTransitionLogic.transitions;}if(nodeToRemoveTransitions.length>0){ // get the first group that comes after the group we are removing
var firstNodeToRemoveTransition=nodeToRemoveTransitions[0];var firstNodeToRemoveTransitionToNodeId=firstNodeToRemoveTransition.to;if(this.isGroupNode(firstNodeToRemoveTransitionToNodeId)){ // get the group that comes after the group we are moving
var groupNode=this.getNodeById(firstNodeToRemoveTransitionToNodeId); // get child ids of the group that comes before the group we are moving
var childIds=groupThatTransitionsToGroupWeAreMoving.ids;if(childIds!=null){ // loop through all the children
for(var c=0;c<childIds.length;c++){var childId=childIds[c];var transitionsFromChild=this.getTransitionsByFromNodeId(childId);if(transitionsFromChild!=null){ // loop through all the transitions from the child
for(var tfc=0;tfc<transitionsFromChild.length;tfc++){var transitionFromChild=transitionsFromChild[tfc];if(transitionFromChild!=null){var toNodeId=transitionFromChild.to; // get the parent group id of the toNodeId
var toNodeIdParentGroupId=this.getParentGroupId(toNodeId);if(groupIdWeAreMoving===toNodeIdParentGroupId){ // the transition is to a child in the group we are moving
if(groupNode.startId==null){ // change the transition to point to the after group
transitionFromChild.to=firstNodeToRemoveTransitionToNodeId;}else { // change the transition to point to the start id of the after group
transitionFromChild.to=groupNode.startId;}}}}}}}}}}}} /**
     * Get the node ids and component ids in a node
     * @param nodeId get the node ids and component ids in this node
     * @returns an array of objects. the objects contain a node id
     * and component id.
     */},{key:'getNodeIdsAndComponentIds',value:function getNodeIdsAndComponentIds(nodeId){var nodeIdAndComponentIds=[];if(nodeId!=null){var nodeContent=this.getNodeContentByNodeId(nodeId);if(nodeContent!=null){var components=nodeContent.components;if(components!=null){ // loop through all the components in the node
for(var c=0;c<components.length;c++){var component=components[c];if(component!=null){var componentId=component.id; // create an object to hold the node id and component id
var nodeIdAndComponentId={};nodeIdAndComponentId.nodeId=nodeId;nodeIdAndComponentId.componentId=componentId; // add the object to the array
nodeIdAndComponentIds.push(nodeIdAndComponentId);}}}}}return nodeIdAndComponentIds;} /**
     * Get the show previous work node ids and component ids in a node
     * @param nodeId get the show previous work node ids and component ids in
     * this node
     * @returns an array of objects. the objects contain a node id
     * and component id.
     */},{key:'getShowPreviousWorkNodeIdsAndComponentIds',value:function getShowPreviousWorkNodeIdsAndComponentIds(nodeId){var nodeIdAndComponentIds=[];if(nodeId!=null){var nodeContent=this.getNodeContentByNodeId(nodeId);if(nodeContent!=null){var components=nodeContent.components;if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var component=components[c];if(component!=null){var showPreviousWorkNodeId=component.showPreviousWorkNodeId;var showPreviousWorkComponentId=component.showPreviousWorkComponentId;if(showPreviousWorkNodeId!=null&&showPreviousWorkComponentId!=null){ // create an object to hold the node id and component id
var nodeIdAndComponentId={};nodeIdAndComponentId.nodeId=showPreviousWorkNodeId;nodeIdAndComponentId.componentId=showPreviousWorkComponentId; // add the object to the array
nodeIdAndComponentIds.push(nodeIdAndComponentId);}}}}}}return nodeIdAndComponentIds;}}]);return ProjectService;}();ProjectService.$inject=['$http','$injector','$q','$rootScope','ConfigService'];exports.default=ProjectService;
//# sourceMappingURL=projectService.js.map
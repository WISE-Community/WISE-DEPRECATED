'use strict';var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value" in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();Object.defineProperty(exports,"__esModule",{value:true});function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var ProjectService=function(){function ProjectService($http,$injector,$rootScope,ConfigService){_classCallCheck(this,ProjectService);this.$http=$http;this.$injector=$injector;this.$rootScope=$rootScope;this.ConfigService=ConfigService;this.project=null;this.transitions=[];this.applicationNodes=[];this.groupNodes=[];this.idToNode={};this.idToElement={};this.idToTransition={};this.metadata={};this.idToContent={};this.activeConstraints=[];this.rootNode=null;this.idToPosition={};this.idToOrder={};this.nodeCount=0; // filtering options for navigation displays
this.filters=[{'name':'all','label':'All'}, //{'name': 'todo', 'label': 'Todo'},
//{'name': 'completed', 'label': 'Completed'},
{'name':'bookmark','label':'Bookmarks'} // TODO: Add when bookmarks are active
];}_createClass(ProjectService,[{key:'getProject',value:function getProject(){return this.project;}},{key:'setProject',value:function setProject(project){this.project=project;this.parseProject();}},{key:'clearProjectFields', /**
     * Initialize the data structures used to hold project information
     */value:function clearProjectFields(){this.transitions=[];this.applicationNodes=[];this.groupNodes=[];this.idToNode={};this.idToElement={};this.idToTransition={};this.metadata={};this.idToContent={};this.activeConstraints=[];this.rootNode=null;this.idToPosition={};this.idToOrder={};this.nodeCount=0;}},{key:'getStyle',value:function getStyle(){var style='';var project=this.project;if(project!=null){style=project.style;}return style;}},{key:'getFilters',value:function getFilters(){return this.filters;}},{key:'getName',value:function getName(){var name=this.getProjectMetadata().title;name=name?name:'A WISE Project (No name)';return name;}},{key:'getProjectMetadata',value:function getProjectMetadata(){return this.metadata;}},{key:'getNodes',value:function getNodes(){var nodes=null;var project=this.project;if(project!=null){nodes=project.nodes;}return nodes;}},{key:'getChildNodeIdsById',value:function getChildNodeIdsById(nodeId){var childIds=[];var node=this.getNodeById(nodeId);if(node.ids){childIds=node.ids;}return childIds;}},{key:'getApplicationNodes',value:function getApplicationNodes(){return this.applicationNodes;}},{key:'getGroupNodes',value:function getGroupNodes(){return this.groupNodes;}},{key:'getIdToNode',value:function getIdToNode(){return this.idToNode;}},{key:'isNode',value:function isNode(id){var result=false;var nodes=this.getNodes();if(nodes!=null){for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeId=node.id;if(nodeId===id){result=true;break;}}}}return result;}},{key:'addTransition', // adds or update transition if exists
value:function addTransition(transition){var existingTransitions=this.getTransitions();var replaced=false;for(var t=0;t<existingTransitions.length;t++){var existingTransition=existingTransitions[t];if(existingTransition.id===transition.id){existingTransitions.splice(t,1,transition);replaced=true;}}if(!replaced){existingTransitions.push(transition);}}},{key:'addNode',value:function addNode(node){var existingNodes=this.project.nodes;var replaced=false;if(node!=null&&existingNodes!=null){for(var n=0;n<existingNodes.length;n++){var existingNode=existingNodes[n];var existingNodeId=existingNode.id;if(existingNodeId===node.id){existingNodes.splice(n,1,node);replaced=true;}}}if(!replaced){existingNodes.push(node);}}},{key:'addApplicationNode',value:function addApplicationNode(node){var applicationNodes=this.applicationNodes;if(node!=null&&applicationNodes!=null){applicationNodes.push(node);}}},{key:'addGroupNode',value:function addGroupNode(node){var groupNodes=this.groupNodes;if(node!=null&&groupNodes!=null){groupNodes.push(node);}this.$rootScope.$broadcast('groupsChanged');}},{key:'addNodeToGroupNode',value:function addNodeToGroupNode(groupId,nodeId){if(groupId!=null&&nodeId!=null){var group=this.getNodeById(groupId);if(group!=null){var groupChildNodeIds=group.ids;if(groupChildNodeIds!=null){if(groupChildNodeIds.indexOf(nodeId)===-1){groupChildNodeIds.push(nodeId);}}}}}},{key:'isGroupNode',value:function isGroupNode(id){var result=false;var groupNode=this.getNodeById(id);if(groupNode!=null){var type=groupNode.type;if(type==='group'){result=true;}}return result;}},{key:'isApplicationNode',value:function isApplicationNode(id){var result=false;var applicationNode=this.getNodeById(id);if(applicationNode!=null){var type=applicationNode.type;if(type!=='group'){result=true;}}return result;}},{key:'getGroups',value:function getGroups(){return this.groupNodes;}},{key:'loadNodes',value:function loadNodes(nodes){if(nodes!=null){for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeId=node.id;var nodeType=node.type;var content=node.content;var constraints=node.constraints;if(content!=null){ //node.content = this.injectAssetPaths(content);
}this.setIdToNode(nodeId,node);this.setIdToElement(nodeId,node);this.addNode(node);if(nodeType==='group'){this.addGroupNode(node);}else {this.addApplicationNode(node);}var groupId=node.groupId;if(groupId!=null){this.addNodeToGroupNode(groupId,nodeId);}if(constraints!=null){for(var c=0;c<constraints.length;c++){var constraint=constraints[c];this.activeConstraints.push(constraint);}}}}}}},{key:'parseProject',value:function parseProject(){var project=this.project;if(project!=null){ // clear and initialize our project data structures
this.clearProjectFields();if(project.metadata){this.metadata=project.metadata;}var nodes=project.nodes;this.loadNodes(nodes);var constraints=project.constraints;if(constraints!=null){for(var c=0;c<constraints.length;c++){var constraint=constraints[c];if(constraint!=null){var constraintId=constraint.id;constraint.active=true;this.setIdToElement(constraintId,constraint);}}} // set root node
this.rootNode=this.getRootNode(nodes[0].id); // set project order
this.setNodeOrder(this.rootNode,this.nodeCount);this.nodeCount=0;var n=nodes.length;var branches=this.getBranches();var branchNodeIds=[]; // set node positions
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
contentString=contentString.replace(new RegExp('(\'|\"|\\\\\'|\\\\\")[^:][^\/][^\/][a-zA-Z0-9@\\._\\/\\s\\-]*\.(png|jpe?g|pdf|gif|mov|mp4|mp3|wav|swf|css|txt|json|xlsx?|doc|html)(\'|\"|\\\\\'|\\\\\")','gi'),function myFunction(matchedString){ // once found, we prepend the contentBaseURL + "assets/" to the string within the quotes and keep everything else the same.
var delimiter='';var matchedStringWithoutQuotes='';if(matchedString.startsWith('\\')){ // the string has escaped quotes for example \"hello.png\"
// get everything between the escaped quotes
matchedStringWithoutQuotes=matchedString.substr(2,matchedString.length-4); // get the delimiter which will be \' or \"
delimiter=matchedString.substr(0,2);}else { // the string does not have escaped qoutes for example "hello.png"
// get everything between the quotes
matchedStringWithoutQuotes=matchedString.substr(1,matchedString.length-2); // get the delimiter which will be ' or "
delimiter=matchedString.substr(0,1);} //var matchedStringWithoutFirstAndLastQuote = matchedString.substr(1, matchedString.length - 2);  // everything but the beginning and end quote (' or ")
// make a new string with the contentBaseURL + assets/ prepended to the path
return delimiter+contentBaseURL+"assets/"+matchedStringWithoutQuotes+delimiter;});}return contentString;}},{key:'getElementById',value:function getElementById(id){var element=null;if(id!=null){element=this.idToElement[id];}return element;}},{key:'getNodeById',value:function getNodeById(id){var element=null;if(id!=null){element=this.idToNode[id];}return element;}},{key:'setIdToTransition',value:function setIdToTransition(id,transition){if(id!=null){this.idToTransition[id]=transition;}}},{key:'getTransitionById',value:function getTransitionById(id){var element=null;if(id!=null){element=this.idToTransition[id];}return element;}},{key:'getConstraintById',value:function getConstraintById(id){var element=null;if(id!=null){element=this.idToElement[id];}return element;}},{key:'getParentGroup',value:function getParentGroup(nodeId){var result=null;if(nodeId!=null){var node=this.getNodeById(nodeId);if(node!=null){var groupNodes=this.getGroupNodes();for(var g=0;g<groupNodes.length;g++){var groupNode=groupNodes[g];if(this.isNodeDirectChildOfGroup(node,groupNode)){result=groupNode;break;}}}}return result;}},{key:'getNodeDepth',value:function getNodeDepth(nodeId,val){var result=null;if(nodeId!=null){var depth=typeof val==="number"?val:0;var parent=this.getParentGroup(nodeId);if(parent){depth=this.getNodeDepth(parent.id,depth+1);}result=depth;}return result;}},{key:'getRootNode',value:function getRootNode(nodeId){var result=null;var parentGroup=this.getParentGroup(nodeId);if(parentGroup==null){result=this.getNodeById(nodeId);}else {result=this.getRootNode(parentGroup.id);}return result;}},{key:'isNodeDirectChildOfGroup',value:function isNodeDirectChildOfGroup(node,group){var result=false;if(node!=null&&group!=null){var nodeId=node.id;var groupIds=group.ids;if(groupIds!=null&&groupIds.indexOf(nodeId)!=-1){result=true;}}return result;}},{key:'isNodeDescendentOfGroup',value:function isNodeDescendentOfGroup(node,group){var result=false;if(node!=null&&group!=null){var descendents=this.getDescendentsOfGroup(group);var nodeId=node.id;if(descendents.indexOf(nodeId)!=-1){result=true;}}return result;}},{key:'getDescendentsOfGroup',value:function getDescendentsOfGroup(group){var descendents=[];if(group!=null){var childIds=group.ids;if(childIds!=null){descendents=childIds;for(var c=0;c<childIds.length;c++){var childId=childIds[c];var node=this.getNodeById(childId);if(node!=null){var childDescendents=this.getDescendentsOfGroup(node);descendents=descendents.concat(childDescendents);}}}}return descendents;}},{key:'isStartNode',value:function isStartNode(node){var result=false;if(node!=null){var nodeId=node.id;var projectStartId=this.getStartNodeId();if(nodeId===projectStartId){result=true;}var groups=this.getGroups();for(var g=0;g<groups.length;g++){var group=groups[g];if(group!=null){var groupStartId=group.startId;if(nodeId===groupStartId){result=true;break;}}}}return result;}},{key:'getStartNodeId',value:function getStartNodeId(){var startNodeId=null;var project=this.getProject();if(project!=null){startNodeId=project.startNodeId;}return startNodeId;}},{key:'getConstraints',value:function getConstraints(){var constraints=this.activeConstraints;return constraints;}},{key:'getConstraintsForNode',value:function getConstraintsForNode(node){var constraints=[];var allConstraints=this.getConstraints();for(var c=0;c<allConstraints.length;c++){var constraint=allConstraints[c];if(this.isNodeAffectedByConstraint(node,constraint)){constraints.push(constraint);}}return constraints;}},{key:'isNodeAffectedByConstraint',value:function isNodeAffectedByConstraint(node,constraint){var result=false;if(node!=null&&constraint!=null){var nodeId=node.id;var targetId=constraint.targetId;var targetNode=this.getNodeById(targetId);if(targetNode!=null){var nodeType=targetNode.type;if(nodeType==='node'){ // the target is an application
if(nodeId===targetId){result=true;}}else if(nodeType==='group'){ // the target is a group
if(this.isNodeDescendentOfGroup(node,targetNode)){result=true;}}}}return result;}},{key:'getNavigationMode',value:function getNavigationMode(){var navigationMode=null;var project=this.getProject();if(project!=null){navigationMode=project.navigationMode;}return navigationMode;}},{key:'getNavigationApplications',value:function getNavigationApplications(){var navigationApplications=null;var project=this.getProject();if(project!=null){navigationApplications=project.navigationApplications;}return navigationApplications;}},{key:'getTransitions',value:function getTransitions(){var transitions=null;var project=this.getProject();if(project!=null){transitions=project.transitions;}return transitions;}},{key:'getTransitionsByGroupId',value:function getTransitionsByGroupId(groupId){var transitionsInGroup=[];if(groupId!=null){var group=this.getNodeById(groupId);if(group!=null){var childIds=group.ids;if(childIds!=null){var allTransitions=this.getTransitions(); // loop through all the transitions
for(var t=0;t<allTransitions.length;t++){var tempTransition=allTransitions[t];if(tempTransition!=null){var from=tempTransition.from;var to=tempTransition.to;if(childIds.indexOf(from)!=-1||childIds.indexOf(to)!=-1){transitionsInGroup.push(tempTransition);}}}}}}var project=this.getProject();if(project!=null){transitions=project.transitions;}return transitionsInGroup;}},{key:'getTransitionsByFromNodeId0',value:function getTransitionsByFromNodeId0(fromNodeId){var transitionsResults=[];if(fromNodeId!=null){var transitions=this.getTransitions();if(transitions!=null){for(var i=0;i<transitions.length;i++){var transition=transitions[i];if(transition.from===fromNodeId&&!transition.disabled){transitionsResults.push(transition);}}}}return transitionsResults;}},{key:'getTransitionLogicByFromNodeId', /**
     * Get the transition logic for a node
     * @param fromNodeId the from node id
     * @returns the transition logic object
     */value:function getTransitionLogicByFromNodeId(fromNodeId){var transitionLogic=null;if(fromNodeId!=null){ // get the node
var node=this.getNodeById(fromNodeId);if(node!=null){ // get the transition logic
transitionLogic=node.transitionLogic;}}return transitionLogic;}},{key:'getTransitionsByToNodeId',value:function getTransitionsByToNodeId(toNodeId){var transitionsResults=[];if(toNodeId!=null){var transitions=this.getTransitions();if(transitions!=null){for(var i=0;i<transitions.length;i++){var transition=transitions[i];if(transition.to===toNodeId){transitionsResults.push(transition);}}}}return transitionsResults;} /**
     * Get nodes that have a transition to the given node id
     * @param toNodeId the node id
     * @returns an array of node objects that transition to the
     * given node id
     */},{key:'getNodesByToNodeId',value:function getNodesByToNodeId(toNodeId){var nodesByToNodeId=[];if(toNodeId!=null){ // get all the nodes
var nodes=this.project.nodes; // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null){ // loop through all the transitions for the node
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){if(toNodeId===transition.to){ // this node has a transition to the node id
nodesByToNodeId.push(node);}}}}}}}return nodesByToNodeId;}},{key:'getTransitionsByFromAndToNodeId',value:function getTransitionsByFromAndToNodeId(fromNodeId,toNodeId){var transitionsResults=[];if(fromNodeId!=null&&toNodeId!=null){var node=this.getNodeById(fromNodeId);if(node!=null){var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null){for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(transition!=null){var to=transition.to;if(toNodeId===to){transitionsResults.push(transition);}}}}}}}return transitionsResults;}},{key:'getLayoutLogic',value:function getLayoutLogic(){var layoutLogic=null;var project=this.getProject();if(project!=null){layoutLogic=project.layoutLogic;}return layoutLogic;}},{key:'retrieveProject',value:function retrieveProject(){var projectFileUrl=this.ConfigService.getConfigParam('projectURL');return this.$http.get(projectFileUrl).then(function(result){var projectJSON=result.data;this.setProject(projectJSON);return projectJSON;}.bind(this));}},{key:'saveProject',value:function saveProject(projectJSON,commitMessage){if(projectJSON==null){ // get the project from this service
projectJSON=angular.toJson(this.project,4);}var httpParams={};httpParams.method='POST';httpParams.url=this.ConfigService.getConfigParam('saveProjectURL');httpParams.headers={'Content-Type':'application/x-www-form-urlencoded'};var params={};params.projectId=this.ConfigService.getProjectId();params.commitMessage=commitMessage;params.projectJSONString=projectJSON;httpParams.data=$.param(params);return this.$http(httpParams).then(angular.bind(this,function(result){var commitHistory=result.data;return commitHistory;}));}},{key:'registerNewProject',value:function registerNewProject(projectJSON,commitMessage){var httpParams={};httpParams.method='POST';httpParams.url=this.ConfigService.getConfigParam('registerNewProjectURL');httpParams.headers={'Content-Type':'application/x-www-form-urlencoded'};var params={};params.projectId=this.ConfigService.getProjectId();params.commitMessage=commitMessage;params.projectJSONString=projectJSON;httpParams.data=$.param(params);return this.$http(httpParams).then(angular.bind(this,function(result){var projectId=result.data;return projectId;}));}},{key:'commitChanges',value:function commitChanges(commitMessage){var commitProjectURL=this.ConfigService.getConfigParam('commitProjectURL');return this.$http({url:commitProjectURL,method:'POST',params:{commitMessage:commitMessage}}).then(angular.bind(this,function(result){var commitResult=result.data;return commitResult;}));}},{key:'getCommitHistory',value:function getCommitHistory(projectId){var commitProjectURL=this.ConfigService.getConfigParam('commitProjectURL');return this.$http({url:commitProjectURL,method:'GET'}).then(angular.bind(this,function(result){return result.data;}));}},{key:'getThemePath',value:function getThemePath(){var wiseBaseURL=this.ConfigService.getConfigParam('wiseBaseURL');var project=this.getProject();if(project&&project.theme){ // TODO: check if this is a valid theme (using ConfigService) rather than just truthy
return wiseBaseURL+'/wise5/vle/themes/'+project.theme;}else {return wiseBaseURL+'/wise5/vle/themes/default'; // TODO: get default theme name from ConfigService
}}},{key:'getNodeTypeByNode',value:function getNodeTypeByNode(node){var nodeType=null;if(node!=null){nodeType=node.type;}return nodeType;}},{key:'getApplicationTypeByNode',value:function getApplicationTypeByNode(node){var applicationType=null;if(node!=null){applicationType=node.applicationType;}return applicationType;}},{key:'getNodeSrcByNodeId',value:function getNodeSrcByNodeId(nodeId){var nodeSrc=null;var node=this.getNodeById(nodeId);if(node!=null){nodeSrc=node.src;}if(nodeSrc!=null){var projectBaseURL=this.ConfigService.getConfigParam('projectBaseURL');nodeSrc=projectBaseURL+nodeSrc;}return nodeSrc;}},{key:'getNodeTitleByNodeId',value:function getNodeTitleByNodeId(nodeId){var title=null;var node=this.getNodeById(nodeId);if(node!=null){title=node.title;}return title;}},{key:'getNodePositionAndTitleByNodeId', /**
     * Get the node position and title
     * @param nodeId the node id
     * @returns the node position and title
     */value:function getNodePositionAndTitleByNodeId(nodeId){var title=null;var node=this.getNodeById(nodeId);if(node!=null){var position=this.getNodePositionById(nodeId);if(position!=null){title=position+' '+node.title;}else {title=node.title;}}return title;}},{key:'getNodeIconByNodeId',value:function getNodeIconByNodeId(nodeId){var node=this.getNodeById(nodeId);var nodeIcon=null;if(node!=null){var nodeType=this.getNodeTypeByNode(node); // set defaults (TODO: get from configService?)
var defaultName=nodeType==='group'?'explore':'school';nodeIcon={color:'rgba(0,0,0,0.54)',type:'font',fontSet:'material-icons',fontName:defaultName,imgSrc:'',imgAlt:'node icon'}; // TODO: check for different statuses
var icons=node.icons;if(!!icons&&!!icons.default){var icon=icons.default;nodeIcon=$.extend(true,nodeIcon,icon);} // check for empty image source
if(!nodeIcon.imgSrc){ // revert to font icon
nodeIcon.type='font';}}return nodeIcon;}},{key:'getStudentIsOnGroupNodeClass',value:function getStudentIsOnGroupNodeClass(){var studentIsOnGroupNodeClass=null;var project=this.getProject();if(project!=null){var layout=project.layout;if(layout!=null){studentIsOnGroupNodeClass=layout.studentIsOnGroupNode;}}return studentIsOnGroupNodeClass;}},{key:'getStudentIsOnApplicationNodeClass',value:function getStudentIsOnApplicationNodeClass(){var studentIsOnApplicationNodeClass=null;var project=this.getProject();if(project!=null){var layout=project.layout;if(layout!=null){studentIsOnApplicationNodeClass=layout.studentIsOnApplicationNode;}}return studentIsOnApplicationNodeClass;}},{key:'getStartGroupId',value:function getStartGroupId(){var startGroupId=null;var project=this.getProject();if(project!=null){startGroupId=project.startGroupId;}return startGroupId;}},{key:'getFlattenedProjectAsNodeIds', /**
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
     * @param nodeId the node id we are want to get the paths from
     * @return an array of paths. each path is an array of node ids.
     */value:function getAllPaths(pathSoFar,nodeId){var allPaths=[];if(nodeId!=null){if(this.isApplicationNode(nodeId)){ // the node is an application node
// get the transition logic from the node id
var transitionLogic=this.getTransitionLogicByFromNodeId(nodeId);if(transitionLogic!=null){ // get all the transitions from this node
var transitions=transitionLogic.transitions;var path=[];if(transitions!=null){ // add the node id to the path so far
pathSoFar.push(nodeId);if(transitions.length===0){ /*
                             * there are no transitions from the node id so this path
                             * only contains this node id
                             */ // add the node id to the path
path.push(nodeId); // add the path to the all paths array
allPaths.push(path);}else { // loop through all the transitions from this node id
for(var t=0;t<transitions.length;t++){var transitionResult=[]; // get a transition
var transition=transitions[t];if(transition!=null){ // get the to node id
var toNodeId=transition.to;if(pathSoFar.indexOf(toNodeId)==-1){ /*
                                         * recursively get the paths by getting all
                                         * the paths for the to node
                                         */var allPathsFromToNode=this.getAllPaths(pathSoFar,toNodeId);if(allPathsFromToNode!=null){ // loop through all the paths for the to node
for(var a=0;a<allPathsFromToNode.length;a++){ // get a path
var tempPath=allPathsFromToNode[a]; // prepend the current node id to the path
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
allPaths.push(path);}}}} /*
                         * remove the latest node id since we are moving back
                         * up the path as we traverse the nodes depth first
                         */pathSoFar.pop();}}}else if(this.isGroupNode(nodeId)){ // the node is a group node
}}return allPaths;}},{key:'consolidatePaths', /**
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
isPathInUniquePaths=true;}}if(!isPathInUniquePaths){ /*
                     * the path is not equal to any paths in the unique
                     * paths array so we will add it to the unique paths
                     * array
                     */uniquePaths.push(path);}}}return uniquePaths;}},{key:'pathsEqual', /**
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
if(path1NodeId!==path2NodeId){ /*
                         * the node ids are not the same to the paths
                         * are not equal
                         */result=false;break;}}}}return result;}},{key:'isNodeIdInABranch', /**
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
     */value:function getBranchPathsByNodeId(branches,nodeId){var branchPathsIn=[];if(branches!=null&&nodeId!=null){ // loop throught all the branches
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
     * @returns the component
     */},{key:'getComponentByNodeIdAndComponentId',value:function getComponentByNodeIdAndComponentId(nodeId,componentId){var component=null;if(nodeId!=null&&componentId!=null){var components=this.getComponentsByNodeId(nodeId);if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var tempComponent=components[c];if(tempComponent!=null){var tempComponentId=tempComponent.id;if(componentId===tempComponentId){ // we have found the component we want
component=tempComponent;break;}}}}}return component;}},{key:'getComponentPositionByNodeIdAndComponentId', /**
     * Returns the position of the component in the node by node id and component id, 0-indexed.
     * @param nodeId the node id
     * @param componentId the component id
     * @returns the component's position
     */value:function getComponentPositionByNodeIdAndComponentId(nodeId,componentId){var componentPosition=-1;if(nodeId!=null&&componentId!=null){var components=this.getComponentsByNodeId(nodeId);if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var tempComponent=components[c];if(tempComponent!=null){var tempComponentId=tempComponent.id;if(componentId===tempComponentId){ // we have found the component we want
componentPosition=c;break;}}}}}return componentPosition;}},{key:'getComponentsByNodeId', /**
     * Get the components in a node
     * @param nodeId the node id
     * @returns an array of components
     */value:function getComponentsByNodeId(nodeId){var components=[];if(nodeId!=null){ // get the node
var node=this.getNodeById(nodeId);if(node!=null){ // get the components
components=node.components;}}return components;}},{key:'getNodeContentByNodeId',value:function getNodeContentByNodeId(nodeId){var nodeContent=null;if(nodeId!=null){var node=this.getNodeById(nodeId);if(node!=null){nodeContent=node.content;}}return nodeContent;}},{key:'replaceComponent', /**
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
var newGroup={};newGroup.id=newGroupId;newGroup.type='group';newGroup.title=title;newGroup.startId='';newGroup.ids=[];return newGroup;} /**
     * Create a new node
     * @param title the title of the node
     * @returns the node object
     */},{key:'createNode',value:function createNode(title){ // get the next available node id
var newNodeId=this.getNextAvailableNodeId(); // create the node object
var newNode={};newNode.id=newNodeId;newNode.title=title;newNode.type='node';newNode.constraints=[];newNode.transitionLogic={};newNode.showSaveButton=true;newNode.showSubmitButton=false;newNode.components=[];return newNode;} /**
     * Create a node inside the group
     * @param node the new node
     * @param nodeId the node id of the group
     */},{key:'createNodeInside',value:function createNodeInside(node,nodeId){ // add the node to the project
this.addNode(node); // add the node to our mapping of node id to node
this.setIdToNode(node.id,node); // get the group node
var groupNode=this.getNodeById(nodeId);if(groupNode!=null){var ids=groupNode.ids;if(ids!=null){ // add the node id to the beginning of the array of children ids
ids.splice(0,0,node.id);}} // get the start node id
var previousStartId=groupNode.startId; // set the new node as the start node
groupNode.startId=node.id;if(node.transitionLogic==null){node.transitionLogic={};}if(node.transitionLogic.transitions==null){node.transitionLogic.transitions=[];} // have the new node point to the previous start id
var transitionObject={};transitionObject.to=previousStartId;node.transitionLogic.transitions.push(transitionObject);} /**
     * Create a node after the given node id
     * @param node the new node
     * @param nodeId the node to add after
     */},{key:'createNodeAfter',value:function createNodeAfter(node,nodeId){ // add the node to the project
this.addNode(node); // add the node to our mapping of node id to node
this.setIdToNode(node.id,node); // insert the new node id into the array of children ids
this.insertNodeAfterInGroups(node.id,nodeId);if(!this.isGroupNode(node.id)){ // the node is not a group so we will update the transitions
this.insertNodeAfterInTransitions(node,nodeId);}} /**
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
var previousNode=this.getNodeById(nodeId);if(previousNode!=null){if(previousNode.transitionLogic==null){previousNode.transitionLogic={};}var previousNodeTransitionLogic=previousNode.transitionLogic;if(previousNodeTransitionLogic!=null){ // get the transitions from the before node
var transitions=previousNodeTransitionLogic.transitions;if(transitions!=null){ // make a copy of the transitions
var transitionsJSONString=angular.toJson(transitions);var transitionsCopy=angular.fromJson(transitionsJSONString);if(node.transitionLogic==null){node.transitionLogic={};} // set the transitions from the before node into the inserted node
node.transitionLogic.transitions=transitionsCopy;}}var newNodeId=node.id; // TODO handle branching case
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
var group=this.getNodeById(nodeIdToInsertInside);if(nodeToInsert!=null&&group!=null){ // get the start node
var startId=group.startId;var startNode=this.getNodeById(startId);if(nodeToInsert.transitionLogic==null){nodeToInsert.transitionLogic={};}if(nodeToInsert.transitionLogic.transitions==null){nodeToInsert.transitionLogic.transitions=[];} /*
             * make the inserted node transition to the previous start node
             */var transitionObject={};transitionObject.to=startId;nodeToInsert.transitionLogic.transitions.push(transitionObject);}} /**
     * Get the next available group id
     * @returns the next available group id
     */},{key:'getNextAvailableGroupId',value:function getNextAvailableGroupId(){ // get all the group ids
var groupIds=this.getGroupIds();var foundAvailableGroupId=false;var groupIdCounter=1; // loop until we have found an unused group id
while(!foundAvailableGroupId){ // create a potential group id
var tempGroupId='group'+groupIdCounter; // check if the potential group id is already used
if(groupIds.indexOf(tempGroupId)==-1){ // the potential group id is not used so we can use it
return tempGroupId;}groupIdCounter++;}} /**
     * Get all the group ids
     * @returns an array with all the group ids
     */},{key:'getGroupIds',value:function getGroupIds(){var groupIds=[];var groupNodes=this.groupNodes; // loop through all the group nodes
for(var g=0;g<groupNodes.length;g++){var group=groupNodes[g];if(group!=null){var groupId=group.id;if(groupId!=null){ // add the group id
groupIds.push(groupId);}}}return groupIds;} /**
     * Get the next available node id
     * @returns the next available node id
     */},{key:'getNextAvailableNodeId',value:function getNextAvailableNodeId(){ // get all the node ids
var nodeIds=this.getNodeIds();var foundAvailableNodeId=false;var nodeIdCounter=1; // loop until we have found an unused node id
while(!foundAvailableNodeId){ // create a potential node id
var tempNodeId='node'+nodeIdCounter; // check if the potential node id is already used
if(nodeIds.indexOf(tempNodeId)==-1){ // the potential group id is not used so we can use it
return tempNodeId;}nodeIdCounter++;}} /**
     * Get all the node ids from steps (not groups)
     * @returns an array with all the node ids
     */},{key:'getNodeIds',value:function getNodeIds(){var nodeIds=[];var nodes=this.applicationNodes; // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var nodeId=node.id;if(nodeId!=null){nodeIds.push(nodeId);}}}return nodeIds;} /**
     * Move nodes inside a group node
     * @param nodeIds the node ids to move
     * @param nodeId the node id of the group we are moving the nodes inside
     */},{key:'moveNodesInside',value:function moveNodesInside(nodeIds,nodeId){ // loop thorugh all the nodes we are moving
for(var n=0;n<nodeIds.length;n++){ // get the node we are moving
var tempNodeId=nodeIds[n];var tempNode=this.getNodeById(tempNodeId); // remove the node from the transitions
this.removeNodeIdFromTransitions(tempNodeId); // remove the node from the group
this.removeNodeIdFromGroups(tempNodeId);if(n==0){ /*
                 * this is the first node we are moving so we will insert it
                 * into the beginning of the group
                 */this.insertNodeInsideInTransitions(tempNodeId,nodeId);this.insertNodeInsideInGroups(tempNodeId,nodeId);}else { /*
                 * this is not the first node we are moving so we will insert
                 * it after the node we previously inserted
                 */this.insertNodeAfterInTransitions(tempNode,nodeId);this.insertNodeAfterInGroups(tempNodeId,nodeId);} /*
             * remember the node id so we can put the next node (if any)
             * after this one
             */nodeId=tempNode.id;}} /**
     * Move nodes after a certain node id
     * @param nodeIds the node ids to move
     * @param nodeId the node id we will put the moved nodes after
     */},{key:'moveNodesAfter',value:function moveNodesAfter(nodeIds,nodeId){ // loop through all the nodes we are moving
for(var n=0;n<nodeIds.length;n++){ // get the node we are moving
var tempNodeId=nodeIds[n];var node=this.getNodeById(tempNodeId);if(!this.isGroupNode(node.id)){ // this is not a group node so we will remove it from transitions
this.removeNodeIdFromTransitions(tempNodeId);} // remove the node from the groups
this.removeNodeIdFromGroups(tempNodeId); // insert the node into the parent group
this.insertNodeAfterInGroups(tempNodeId,nodeId);if(!this.isGroupNode(node.id)){ // this is not a group node so we will insert it into transitions
this.insertNodeAfterInTransitions(node,nodeId);} /*
             * remember the node id so we can put the next node (if any)
             * after this one
             */nodeId=node.id;}} /**
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
                     */i--;}}} // remove the node
this.removeNodeIdFromTransitions(nodeId);this.removeNodeIdFromGroups(nodeId);this.removeNodeIdFromNodes(nodeId);} /**
     * Update the transitions to handle removing a node
     * @param nodeId the node id to remove
     */},{key:'removeNodeIdFromTransitions',value:function removeNodeIdFromTransitions(nodeId){ // get the node we are removing
var nodeToRemove=this.getNodeById(nodeId); // get all the nodes that have a transition to the node we are removing
var nodesByToNodeId=this.getNodesByToNodeId(nodeId); // get the transitions of the node we are removing
var nodeToRemoveTransitionLogic=nodeToRemove.transitionLogic;var nodeToRemoveTransitions=[];if(nodeToRemoveTransitionLogic!=null){nodeToRemoveTransitions=nodeToRemoveTransitionLogic.transitions;} // loop through all the nodes that transition to the node we are removing
for(var n=0;n<nodesByToNodeId.length;n++){ // get a node that has a transition to the node we are removing
var node=nodesByToNodeId[n];var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions; // loop through all the transitions of this node
for(var t=0;t<transitions.length;t++){var transition=transitions[t];if(nodeId===transition.to){ // we have found the transition to the node we are removing
// copy the transitions from the node we are removing
var transitionsCopy=angular.toJson(nodeToRemoveTransitions);transitionsCopy=angular.fromJson(transitionsCopy); // remove the transition to the node we are removing
transitions.splice(t,1); // insert the transitions from the node we are removing
transitions=transitions.slice(0,t).concat(transitionsCopy).concat(transitions.slice(t+1));}} // set the transitions into the node that transitions to the node we are removing
transitionLogic.transitions=transitions;}}if(nodeToRemoveTransitionLogic!=null){ // clear the transitions of the node we are removing
nodeToRemoveTransitionLogic.transitions=[];}}},{key:'removeNodeIdFromGroups', /**
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
                                 */ // get the node we are removing
var node=this.getNodeById(id);if(node!=null){var transitionLogic=node.transitionLogic;if(transitionLogic!=null){var transitions=transitionLogic.transitions;if(transitions!=null&&transitions.length>0){ // get the first transition
// TODO handle the case when the node we are removing is a branch point
var transition=transitions[0];if(transition!=null){ // get the node that this node transitions to
var to=transition.to;if(to!=null){ // set the to node as the start id
group.startId=to;}}}}}}}}}}}} /**
     * Remove the node from the array of nodes
     * @param nodeId the node id to remove
     */},{key:'removeNodeIdFromNodes',value:function removeNodeIdFromNodes(nodeId){ // get all the nodes in the project
var nodes=this.project.nodes; // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){if(nodeId===node.id){ // we have found the node we want to remove
nodes.splice(n,1);}}}} /**
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
     * Get the total score for the project
     * @returns the total score for the project or null if there are no max scores
     */},{key:'getTotalScore',value:function getTotalScore(){var totalScore=null;var nodes=this.project.nodes;if(nodes!=null){ // loop through all the nodes
for(var n=0;n<nodes.length;n++){var node=nodes[n];if(node!=null){var components=node.components;if(components!=null){ // loop through all the components
for(var c=0;c<components.length;c++){var component=components[c];if(component!=null){var maxScore=component.maxScore;if(maxScore!=null){ // make sure the max score is a valid number
if(!isNaN(maxScore)){if(totalScore==null){totalScore=maxScore;}else {totalScore+=maxScore;}}}}}}}}}return totalScore;}}]);return ProjectService;}();ProjectService.$inject=['$http','$injector','$rootScope','ConfigService'];exports.default=ProjectService;
//# sourceMappingURL=projectService.js.map
/* Modular Project Object */
function createProject(content, contentBaseUrl, lazyLoading, view, totalProjectContent, loadStepI18NFiles){
	return function(content, cbu, ll, view, totalProjectContent, loadStepI18NFiles){
		var content = content,
		contentBaseUrl = cbu,
		lazyLoading = ll,
		allLeafNodes = [],
		allSequenceNodes = [],
		autoStep,
		stepLevelNumbering,
		title,
		stepTerm,
		stepTermPlural,
		activityTerm,
		activityTermPlural,
		rootNode,
		view = view,
		copyIds = [],
		loggingLevel = 5, //default to log everything
		postLevel = 5, //default to post all steps
		totalProjectContent = totalProjectContent,
		constraints = []
		usedNodeTypes = []
		globalTagMaps = [];
		loadStepI18NFiles = loadStepI18NFiles;

		/* When parsing a minified project, looks up and returns each node's content
		 * based on the given id.*/
		var getMinifiedNodeContent = function(id){
			var nodes = totalProjectContent.getContentJSON().nodes;
			for(var i=0;i<nodes.length;i++){
				if(nodes[i].identifier==id){
					return nodes[i].content;
				};
			};
		};

		/* returns an array of all the duplicate nodes in this project */
		var getDuplicateNodes = function(){
			var duplicates = [];
			for(var a=0;a<allLeafNodes.length;a++){
				if(allLeafNodes[a].type=='DuplicateNode'){
					duplicates.push(allLeafNodes[a]);
				}
			}

			return duplicates;
		};

		/* after the leaf nodes have been generated, retrieves the real nodes
		 * and sets them in the duplicate nodes in this project */
		var setRealNodesInDuplicates = function(){
			var duplicates = getDuplicateNodes();
			for(var b=0;b<duplicates.length;b++){
				duplicates[b].realNode = getNodeById(duplicates[b].realNodeId);
			}
		};

		/* Creates the nodes defined in this project's content */
		var generateProjectNodes = function(){
			var jsonNodes = content.getContentJSON().nodes;
			if(!jsonNodes){
				jsonNodes = [];
			}

			for (var i=0; i < jsonNodes.length; i++) {
				var currNode = jsonNodes[i];
				if(usedNodeTypes.indexOf(currNode.type) == -1) {
					//add current node type to our array of node types if it is not already in the array
					usedNodeTypes.push(currNode.type);
					
					if(loadStepI18NFiles) {
						var nodeConstructor = NodeFactory.nodeConstructors[currNode.type];
						if (nodeConstructor != null) {
							var nodePrototype = nodeConstructor.prototype;
							// also fetch i18n files
							if (nodePrototype.i18nEnabled) {		
								// check to see if we've already fetched i18n files for this node type
								if (!view.i18n.supportedLocales[currNode.type]) {
									view.i18n.supportedLocales[currNode.type] = nodePrototype.supportedLocales;
									view.retrieveLocales(currNode.type,nodePrototype.i18nPath);								
								} 
							}							
						}
					}
				}
				var thisNode = NodeFactory.createNode(currNode, view);
				if(thisNode == null) {
					/* unable to create the specified node type probably because it does not exist in wise4 */
					view.notificationManager.notify('null was returned from project factory for node: ' + currNode.identifier + ' \nSkipping node.', 2);
				} else {
					/* validate and set identifier attribute */
					if(!currNode.identifier || currNode.identifier ==''){
						view.notificationManager.notify('No identifier for node in project file.', 3);
					} else {
						thisNode.id = currNode.identifier;
						if(idExists(thisNode.id)){
							view.notificationManager.notify('Duplicate node id: ' + thisNode.id + ' found in project', 3);
						}
					}

					if(currNode.type != 'DuplicateNode'){

						/* validate and set title attribute */
						if(!currNode.title || currNode.title==''){
							view.notificationManager.notify('No title attribute for node with id: ' + thisNode.id, 2);
						} else {
							thisNode.title = currNode.title;
						}

						/* validate and set class attribute */
						if(!currNode['class'] || currNode['class']==''){
							view.notificationManager.notify('No class attribute for node with id: ' + thisNode.id, 2);
						} else {
							thisNode.className = currNode['class'];
						}

						// NATE!
						if(currNode['ContentBaseUrl']) {
							thisNode.ContentBaseUrl = currNode['ContentBaseUrl'];
						}

						/* validate filename reference attribute */
						if(!currNode.ref || currNode.ref==''){
							view.notificationManager.notify('No filename specified for node with id: ' + thisNode.id + ' in the project file', 2);
						} else {
							if(thisNode.view != null && thisNode.view.authoringMode) {
								//we are in the authoring tool so we do not want to inject the contentBaseUrl
								thisNode.content = createContent(makeUrl(currNode.ref, thisNode));
							} else {
								//we are in the vle so we want to inject the contentBaseUrl
								thisNode.content = createContent(makeUrl(currNode.ref, thisNode), contentBaseUrl);								
							}
						}

						//set the peerReview attribute if available
						if(!currNode.peerReview || currNode.peerReview=='') {

						} else {
							thisNode.peerReview = currNode.peerReview;
						}

						//set the teacherReview attribute if available
						if(!currNode.teacherReview || currNode.teacherReview=='') {

						} else {
							thisNode.teacherReview = currNode.teacherReview;
						}


						//set the reviewGroup attribute if available
						if(!currNode.reviewGroup || currNode.reviewGroup=='') {

						} else {
							thisNode.reviewGroup = currNode.reviewGroup;
						}

						//set the associatedStartNode attribute if available
						if(!currNode.associatedStartNode || currNode.associatedStartNode=='') {

						} else {
							thisNode.associatedStartNode = currNode.associatedStartNode;
						}

						//set the associatedAnnotateNode attribute if available
						if(!currNode.associatedAnnotateNode || currNode.associatedAnnotateNode=='') {

						} else {
							thisNode.associatedAnnotateNode = currNode.associatedAnnotateNode;
						}

						//set the icons
						if(currNode.icons != null) {
							thisNode.icons = currNode.icons;
						}

						//initialize the statuses, constraints, and nodeIdsListening arrays
						thisNode.statuses = [];
						thisNode.constraints = [];
						thisNode.nodeIdsListening = [];

						/* if project is loading minified, create each node's content from the parsed totalProjectContent */
						if(totalProjectContent){
							thisNode.content.setContent(getMinifiedNodeContent(thisNode.id));
						}

						/* load content now if not lazy loading */
						if(!lazyLoading){
							thisNode.content.retrieveContent();
						}
					} else {
						//node is a duplicate node
						thisNode.realNodeId = currNode.realNodeId;
					}

					/* add to leaf nodes */
					allLeafNodes.push(thisNode);

					/* get any previous work reference node ids and add it to node */
					thisNode.prevWorkNodeIds = currNode.previousWorkNodeIds;

					//get the previous node id to populate work from
					thisNode.populatePreviousWorkNodeId = currNode.populatePreviousWorkNodeId;

					//get the tags
					thisNode.tags = currNode.tags;

					//get the tagMaps
					thisNode.tagMaps = currNode.tagMaps;

					/* get links to other nodes and add it to node */
					if(currNode.links){
						thisNode.links = currNode.links;
					}

					/* add events for node rendering */
					eventManager.subscribe('pageRenderCompleted', thisNode.pageRenderCompletedListener, thisNode);
					eventManager.subscribe('contentRenderCompleted', thisNode.contentRenderCompletedListener, thisNode);
					eventManager.subscribe('scriptsLoaded', thisNode.loadContentAfterScriptsLoad, thisNode);
				}
			}
		};

		/* Creates and validates the sequences defined in this project's content */
		var generateSequences = function(){
			var project = content.getContentJSON();

			/* create the sequence nodes */
			var sequences = project.sequences;
			if(!sequences){
				sequences = [];
			};

			for(var e=0;e<sequences.length;e++){
				var sequenceNode = NodeFactory.createNode(sequences[e], view);

				if(sequenceNode){
					sequenceNode.json = sequences[e];
					/* validate id */
					if(idExists(sequenceNode.id)){
						view.notificationManager.notify('Duplicate sequence id: ' + sequenceNode.id + ' found in project.', 3);
					};
				};

				allSequenceNodes.push(sequenceNode);
			};

			/* get starting sequence */
			if(project.startPoint){
				var startingSequence = getNodeById(project.startPoint);
			} else {
				view.notificationManager.notify('No starting sequence specified for this project', 3);
			};

			/* validate that there are no loops before setting root node */
			if(startingSequence){
				for(var s=0;s<allSequenceNodes.length;s++){
					var stack = [];
					if(validateNoLoops(allSequenceNodes[s].id, stack, 'file')){
						//All OK, add children to sequence
						populateSequences(allSequenceNodes[s].id);
					} else {
						view.notificationManager.notify('Infinite loop discovered in sequences, check sequence references', 3);
						return null;
					};
				};
				rootNode = startingSequence;
			};
		};

		/* Returns true if a node of the given id already exists in this project, false otherwise */
		var idExists = function(id){
			return getNodeById(id);
		};

		/* Returns the node with the given id if the node exists, returns null otherwise. */
		var getNodeById = function(nodeId){
			for(var t=0;t<allLeafNodes.length;t++){
				if(allLeafNodes[t].id==nodeId){
					return allLeafNodes[t];
				};
			};
			for(var p=0;p<allSequenceNodes.length;p++){
				if(allSequenceNodes[p] && allSequenceNodes[p].id==nodeId){
					return allSequenceNodes[p];
				};
			};
			return null;
		};

		/* Returns the node at the given position in the project if it exists, returns null otherwise */
		var getNodeByPosition = function(position){
			if(position != null) {
				//make sure position is a string
				position += "";

				var locs = position.split('.');
				var parent = rootNode;
				var current;

				/* cycle through locs, getting the children each cycle */
				for(var u=0;u<locs.length;u++){
					current = parent.children[locs[u]];

					/* if not current, then the position is off, return null */
					if(!current){
						return null;
					} else if(u==locs.length-1){
						/* if this is last location return current*/
						return current;
					} else {
						/* otherwise set parent = current for next cycle */
						parent = current;
					}
				}
			} else {
				return null;
			}
		};

		/* Given the filename, returns the url to retrieve the file */
		// NATE! added node optional parameter, to override global content base url
		var makeUrl = function(filename, nodeOrString){
			var cbu = contentBaseUrl;
			if (nodeOrString !== undefined) {
				if (typeof(nodeOrString) == "string") {
					cbu = nodeOrString;
				} else if (nodeOrString.ContentBaseUrl) {
					cbu = nodeOrString.ContentBaseUrl;
				}
			}
			if (cbu.lastIndexOf('\\') != -1) {
				return cbu + '\\' + filename;
			} else if (cbu) {
				return cbu + '/' + filename;
			} else {
				return filename;
			}
		};

		/*
		 * Given the sequence id, a stack and where search is run from, returns true if
		 * there are no infinite loops starting from given id, otherwise returns false.
		 */
		var validateNoLoops = function(id, stack, from){
			if(stack.indexOf(id)==-1){ //id not found in stack - continue checking
				var childrenIds = getChildrenSequenceIds(id, from);
				if(childrenIds.length>0){ //sequence has 1 or more sequences as children - continue checking
					stack.push(id);
					for(var b=0;b<childrenIds.length;b++){ // check children
						if(!validateNoLoops(childrenIds[b], stack)){
							return false; //found loop or duplicate id
						};
					};
					stack.pop(id); //children OK
					return true;
				} else { // no children ids to check - this is last sequence node so no loops or duplicates
					return true;
				};
			} else { //id found in stack, infinite loop or duplicate id
				return false;
			};
		};

		/* Given the a sequence Id, populates all of it's children nodes */
		var populateSequences = function(id){
			var sequence = getNodeById(id);
			var children = sequence.json.refs;
			for(var j=0;j<children.length;j++){
				/* validate node was defined and add it to sequence if it is */
				var childNode = getNodeById(children[j]);
				if(!childNode){
					view.notificationManager.notify('Node reference ' + children[j] + ' exists in sequence node ' + id + ' but the node has not been defined and does not exist.', 2);
				} else {
					sequence.addChildNode(childNode);
				};
			};
		};

		/* Given a sequence ID and location from (file or project), returns an array of ids for any children sequences */
		var getChildrenSequenceIds = function(id, from){
			var sequence = getNodeById(id);
			/* validate sequence reference */
			if(!sequence){
				view.notificationManager.notify('Sequence with id: ' + id + ' is referenced but this sequence does not exist.', 2);
				return [];
			};

			/* populate childrenIds */
			var childrenIds = [];
			if(from=='file'){
				/* get child references from content */
				var refs = sequence.json.refs;
				for(var e=0;e<refs.length;e++){
					childrenIds.push(refs[e]);
				};
			} else {
				/* get child references from sequence */
				var children = sequence.children;
				for(var e=0;e<children.length;e++){
					if(children[e].type=='sequence'){
						childrenIds.push(children[e].id);
					};
				};
			};

			return childrenIds;
		};

		/* Returns the node with the given title if the node exists, returns null otherwise. */
		var getNodeByTitle = function(title){
			for(var y=0;y<allLeafNodes.length;y++){
				if(allLeafNodes[y].title==title){
					return allLeafNodes[y];
				};
			};
			for(var u=0;u<allSequenceNodes.length;u++){
				if(allSequenceNodes[u].title==title){
					return allSequenceNodes[u];
				};
			};
			return null;
		};


		/* Helper function for getStartNodeId() */
		var getFirstNonSequenceNodeId = function(node){
			if(node){
				if(node.type=='sequence'){
					for(var y=0;y<node.children.length;y++){
						var id = getFirstNonSequenceNodeId(node.children[y]);
						if(id!=null){
							return id;
						};
					};
				} else {
					return node.id;
				};
			} else {
				view.notificationManager.notify('Cannot get start node! Possibly no start sequence is specified or invalid node exists in project.', 2);
			};
		};

		/* Removes all references of the node with the given id from sequences in this project */
		var removeAllNodeReferences = function(id){
			for(var w=0;w<allSequenceNodes.length;w++){
				for(var e=0;e<allSequenceNodes[w].children.length;e++){
					if(allSequenceNodes[w].children[e].id==id){
						allSequenceNodes[w].children.splice(e, 1);
					};
				};
			};
		};

		/* Recursively searches for first non sequence node and returns that path */
		var getPathToFirstNonSequenceNode = function(node, path){
			if(node.type=='sequence'){
				for(var y=0;y<node.children.length;y++){
					var pos = getPathToFirstNonSequenceNode(node.children[y], path + '.'  + y);
					if(pos!=undefined && pos!=null){
						return pos;
					};
				};
			} else {
				return path;
			};
		};

		/* Recursively searches for the given id from the point of the node down and returns the path. */
		var getPathToNode = function(node, path, id){
			if(node.id==id){
				return path + '';
			} else if(node.type=='sequence'){
				for(var e=0;e<node.children.length;e++){
					var pos = getPathToNode(node.children[e], path + '.' + e, id);
					if(pos){
						return pos;
					};
				};
			};
		};

		/**
		 * Prints summary report to firebug console of: All Sequences and
		 * Nodes defined for this project, Sequences defined but not used,
		 * Nodes defined but not used, Sequences used twice and Nodes used
		 * twice in this project.
		 */
		var printSummaryReportsToConsole = function(){
			printSequencesDefinedReport();
			printNodesDefinedReport();
			printUnusedSequencesReport();
			printUnusedNodesReport();
			printDuplicateSequencesReport();
			printDuplicateNodesReport();
		};

		/**
		 * Prints a report of all sequences defined for this project
		 * to the firebug console
		 */
		var printSequencesDefinedReport = function(){
			var outStr = 'Sequences defined by Id: ';
			for(var z=0;z<allSequenceNodes.length;z++){
				if(allSequenceNodes[z]){
					if(z==allSequenceNodes.length - 1){
						outStr += ' ' + allSequenceNodes[z].id;
					} else {
						outStr += ' ' + allSequenceNodes[z].id + ',';
					};
				};
			};
			view.notificationManager.notify(outStr, 1);
		};

		/**
		 * Prints a report of all nodes defined for this project
		 * to the firebug console
		 */
		var printNodesDefinedReport = function(){
			var outStr = 'Nodes defined by Id: ';
			for(var x=0;x<allLeafNodes.length;x++){
				if(x==allLeafNodes.length -1){
					outStr += ' ' + allLeafNodes[x].id;
				} else {
					outStr += ' ' + allLeafNodes[x].id + ',';
				};
			};

			view.notificationManager.notify(outStr, 1);
		};

		/**
		 * Prints a report of all unused sequences for this project
		 * to the firebug console
		 */
		var printUnusedSequencesReport = function(){
			var outStr = 'Sequence(s) with id(s): ';
			var found = false;

			for(var v=0;v<allSequenceNodes.length;v++){
				var rootNodeId;
				if(rootNode){
					rootNodeId = rootNode.id;
				} else {
					rootNodeId = 'rootNode';
				};

				if(allSequenceNodes[v] && !referenced(allSequenceNodes[v].id) && allSequenceNodes[v].id!=rootNodeId){
					found = true;
					outStr += ' ' + allSequenceNodes[v].id;
				};
			};

			if(found){
				view.notificationManager.notify(outStr + " is/are never used in this project", 1);
			};
		};

		/**
		 * Prints a report of all unused nodes for this project
		 * to the firebug console
		 */
		var printUnusedNodesReport = function(){
			var outStr = 'Node(s) with id(s): ';
			var found = false;

			for(var b=0;b<allLeafNodes.length;b++){
				if(!referenced(allLeafNodes[b].id)){
					found = true;
					outStr += ' ' + allLeafNodes[b].id;
				};
			};

			if(found){
				view.notificationManager.notify(outStr + " is/are never used in this project", 1);
			};
		};

		/**
		 * Prints a report of all duplicate sequence ids to the
		 * firebug console
		 */
		var printDuplicateSequencesReport = function(){
			var outStr = 'Duplicate sequence Id(s) are: ';
			var found = false;

			for(var n=0;n<allSequenceNodes.length;n++){
				if(allSequenceNodes[n]){
					var count = 0;
					for(var m=0;m<allSequenceNodes.length;m++){
						if(allSequenceNodes[m] && allSequenceNodes[n].id==allSequenceNodes[m].id){
							count ++;
						};
					};

					if(count>1){
						found = true;
						outStr += allSequenceNodes[n].id + ' ';
					};
				};
			};

			if(found){
				view.notificationManager.notify(outStr, 1);
			};
		};

		/**
		 * Prints a report of all duplicate node ids to the
		 * firebug console
		 */
		var printDuplicateNodesReport = function(){
			var outStr =  'Duplicate node Id(s) are: ';
			var found = false;

			for(var n=0;n<allLeafNodes.length;n++){
				var count = 0;
				for(var m=0;m<allLeafNodes.length;m++){
					if(allLeafNodes[n].id==allLeafNodes[m].id){
						count ++;
					};
				};

				if(count>1){
					found = true;
					outStr += allLeafNodes[n].id + ' ';
				};
			};

			if(found){
				view.notificationManager.notify(outStr, 1);
			};
		};

		/**
		 * Returns true if the given id is referenced by any
		 * sequence in the project, otherwise, returns false
		 */
		var referenced = function(id){
			for(var c=0;c<allSequenceNodes.length;c++){
				if(allSequenceNodes[c]){
					for(var v=0;v<allSequenceNodes[c].children.length;v++){
						if(allSequenceNodes[c].children[v].id==id){
							return true;
						};
					};
				};
			};
			return false;
		};

		/**
		 * Returns a list of the given type (node or seq) that are not a child of any
		 * sequence (defined but not attached in the project).
		 */
		var getUnattached = function(type){
			var list = [];

			if(type=='node'){//find unattached nodes
				var children = allLeafNodes;
			} else {//find unattached sequences
				var children = allSequenceNodes;
			};

			//if not referenced, add to list
			for(var x=0;x<children.length;x++){
				if(children[x] && !referenced(children[x].id) && !(rootNode==children[x])){
					list.push(children[x]);
				};
			};

			//return list
			return list;
		};

		/**
		 * Get all the nodeIds that are actually used in the project in the
		 * order that they appear in the project
		 * @param nodeTypesToExclude a : delimited string of node types to exclude
		 * in the resulting array
		 * @param includeSequenceNodeIds boolean value whether to include sequence
		 * ids in the results
		 * @return an array containing all the leaf nodeIds that are used
		 * in the project, in the order that they appear in the project
		 * (this does not include the unused nodes that are in the 
		 * project.json nodes array)
		 */
		var getNodeIds = function(onlyGetNodesWithGradingView, includeSequenceNodeIds) {
			//get the project content
			var project = content.getContentJSON();

			//get the starting point of the project
			var startPoint = project.startPoint;

			//create the array that we will store the nodeIds in
			var nodeIds = [];

			//get the start node
			var startNode = getNodeById(startPoint);

			//get the leaf nodeIds
			nodeIds = getNodeIdsHelper(nodeIds, startNode, onlyGetNodesWithGradingView, includeSequenceNodeIds);

			//return the populated array containing nodeIds
			return nodeIds;
		};

		/**
		 * Recursively obtain all the leaf nodeIds.
		 * @param nodeIds an array containing all the nodeIds we have found so far
		 * @param currentNode the current node
		 * @param nodeTypesToExclude a : delimited string of node types to exclude
		 * @param includeSequenceNodeIds boolean value whether to include sequence
		 * ids in the results
		 * @return an array containing all the leaf nodes 
		 */
		var getNodeIdsHelper = function(nodeIds, currentNode, onlyGetNodesWithGradingView, includeSequenceNodeIds) {

			if(currentNode.type == 'sequence') {
				//current node is a sequence

				if(includeSequenceNodeIds) {
					nodeIds.push(currentNode.id);
				}

				//get the child nodes
				var childNodes = currentNode.children;

				//loop through all the child nodes
				for(var x=0; x<childNodes.length; x++) {
					//get a child node
					var childNode = childNodes[x];

					//recursively call this function with the child node
					nodeIds = getNodeIdsHelper(nodeIds, childNode, onlyGetNodesWithGradingView, includeSequenceNodeIds);
				}
			} else {
				//current node is a leaf node

				//get the node type
				var nodeType = currentNode.type;

				/*
				 * if there are no node types to exclude or if the current node type
				 * is not in the : delimited string of node types to exclude or if
				 * the node type is FlashNode and grading is enabled, we will
				 * add the node id to the array
				 */
				if(!onlyGetNodesWithGradingView || (onlyGetNodesWithGradingView && currentNode.hasGradingView())) {
					nodeIds.push(currentNode.id);					
				}
			}

			//return the updated array of nodeIds
			return nodeIds;
		};

		/**
		 * Get all the node ids in the sequence
		 * @param nodeId the sequence id
		 * @return the node ids in the sequence
		 */
		var getNodeIdsInSequence = function(nodeId) {
			//create the array that we will store the nodeIds in
			var nodeIds = [];

			//get the start node
			var sequenceNode = getNodeById(nodeId);

			//get the leaf nodeIds
			nodeIds = getNodeIdsHelper(nodeIds, sequenceNode);

			//return the populated array containing nodeIds
			return nodeIds;
		};

		/**
		 * Get all the node ids that come after the one passed in
		 * @param nodeId we want all the node ids after this one
		 * @return an array of node ids that come after the one 
		 * passed in
		 */
		var getNodeIdsAfter = function(nodeId) {

			var node = getNodeById(nodeId);

			if(node.type == 'sequence') {
				/*
				 * if the node is a sequence, we will get the last node ref
				 * in the sequence and use that as the limiter
				 */
				nodeId = node.json.refs[node.json.refs.length - 1];
			}

			//get all the node ids
			var nodeIds = getNodeIds();

			//the array that will contain all the node ids that come after
			var resultNodeIds = [];

			if(nodeIds != null) {
				//loop through all the node ids
				for(var x=0; x<nodeIds.length; x++) {
					//get a node id
					var tempNodeId = nodeIds[x];

					if(nodeId == tempNodeId) {
						/*
						 * the node id matches the one we want so we will
						 * slice out all the node ids after this
						 */
						resultNodeIds = nodeIds.slice(x + 1);

						//break out of the for loop since we are done
						break;
					}
				}
			}

			return resultNodeIds;
		};

		/**
		 * Get all the other node ids besides the one passed in
		 * @param nodeId get all node ids except this one
		 * @return an array of node ids without the one passed in 
		 */
		var getAllOtherNodeIds = function(nodeId) {
			//get all the node ids
			var nodeIds = getNodeIds();

			if(nodeIds != null) {
				//loop through all the node ids
				for(var x=0; x<nodeIds.length; x++) {
					//get a node id
					var tempNodeId = nodeIds[x];

					if(nodeId == tempNodeId) {
						/*
						 * we have found the node id we want so we will
						 * remove it from the array
						 */
						nodeIds.splice(x, 1);

						/*
						 * decrement the counter to continue searching for the
						 * node id in case it appears more than once in the array
						 */
						x--;
					}
				}
			}

			return nodeIds;
		};

		/**
		 * Get the show all work html by looping through all the nodes
		 * @param node the root project node
		 * @param showGrades whether to show grades
		 */
		var getShowAllWorkHtml = function(node, showGrades) {
			var lastTimeVisited = view.getState().getLastTimeVisited();

			//initialize the counters for activities and steps
			this.showAllWorkStepCounter = 1;
			this.showAllWorkActivityCounter = 0;

			/*
			 * initialize this to false each time we generate show all work.
			 * as we generate the show all work we will check if we have
			 * found any new feedback
			 */
			this.foundNewFeedback = false;

			//get the show all work html
			var showAllWorkHtml = getShowAllWorkHtmlHelper(node, showGrades, lastTimeVisited);

			var newFeedback = "";

			if(showAllWorkHtml.newFeedback != "") {
				var new_feedback = view.getI18NString('new_feedback');

				newFeedback = "<div class='panelHeader'>" + new_feedback + "</div><div class='dialogSection'>" + showAllWorkHtml.newFeedback + "</div>";
			}

			var my_work = view.getI18NString('my_work');

			var allFeedback = "<div class='panelHeader'>" + my_work + "</div><div class='dialogSecton'>" + showAllWorkHtml.allFeedback + "</div>";

			return newFeedback + allFeedback;
		};

		/**
		 * Returns html showing all students work so far. This function recursively calls
		 * itself.
		 * @param node this can be a project node, activity node, or step node
		 * @param showGrades whether to show grades
		 * @param lastTimeVisited the time in milliseconds when the student last visited
		 */
		var getShowAllWorkHtmlHelper = function(node,showGrades, lastTimeVisited){
			var htmlSoFar = {
					newFeedback:"",
					allFeedback:""
			};

			if (node.children.length > 0) {
				// this is a sequence node

				/*
				 * check if we are on the root node which will be counter value 0.
				 * if we are on the root node we do not want to display anything.
				 */
				if(this.showAllWorkActivityCounter != 0) {
					//we are not on the root node, we are on a sequence/activity
					htmlSoFar.allFeedback += "<div class='activityHeader'>" + node.title + "</div>";
				}

				this.showAllWorkActivityCounter++;

				for (var i = 0; i < node.children.length; i++) {
					var childHtmlSoFar = getShowAllWorkHtmlHelper(node.children[i], showGrades, lastTimeVisited);
					htmlSoFar.newFeedback += childHtmlSoFar.newFeedback;
					htmlSoFar.allFeedback += childHtmlSoFar.allFeedback;
				}
			} else {
				// this is a leaf node
				if(node.type != "HtmlNode" && node.type != "OutsideUrlNode") {
					//only display non-HtmlNode steps
					// TODO: exclude all nodes that return null for grading html

					var nodeId = node.id;

					var nodeVisits = view.getState().getNodeVisitsByNodeId(nodeId);

					//get all the node visits that have work
					var nodeVisitsWithWork = view.getState().getNodeVisitsWithWorkByNodeId(nodeId);

					var vlePosition = getVLEPositionById(nodeId);

					//feedback html that is common to the allFeedback and newFeedback
					var commonFeedback = "";

					/*
					 * used to hold the beginning of the allFeedback html, the rest
					 * of the html is set to the commonFeedback because it is the
					 * same for allFeedback and newFeedback
					 */
					var tempAllFeedback = "";

					/*
					 * used to hold the beginning of the newFeedback html, the rest
					 * of the html is set to the commonFeedback because it is the
					 * same for allFeedback and newFeedback
					 */
					var tempNewFeedback = "";

					var stepHasNewFeedback = false;

					var title = project.stepTerm + ' ' + getStepNumberAndTitle(nodeId);
					var currentStepNum = vlePosition;

					tempAllFeedback += "<div class='stepWork'><div class='sectionHead'><a onclick=\"eventManager.fire('nodeLinkClicked', ['" + getPositionById(node.id) + "']); $('#showallwork').dialog('close');\">" + title + "</a><span class='nodeType'>("+node.getType(true)+")</span></div>";
					tempNewFeedback += "<div class='stepWork'><div class='sectionHead'><a onclick=\"eventManager.fire('nodeLinkClicked', ['" + getPositionById(node.id) + "']); $('#showallwork').dialog('close');\">" + title + "</a><span class='nodeType'>("+node.getType(true)+")</span></div>";
					if (showGrades) {

						//tempAllFeedback += "<div class='sectionContent'>Status: " + node.getShowAllWorkHtml(view) + "</div>";
						tempAllFeedback += "<div class='sectionContent'>" + node.getShowAllWorkHtml(view) + "</div>";

						/*
						 * we need to pass in a prefix to be prepended to the div that is made
						 * otherwise there will be two divs with the same id and when we
						 * render the work, it will only show up in one of the divs
						 */
						//tempNewFeedback += "<div class='sectionContent'>Status: " + node.getShowAllWorkHtml(view, "new_") + "</div>";
						tempNewFeedback += "<div class='sectionContent'>" + node.getShowAllWorkHtml(view, "new_") + "</div>";

						commonFeedback += "<div class='sectionContent'><table class='teacherFeedback'>";

						var runId = view.getConfig().getConfigParam('runId');

						//get this student's workgroup id
						var toWorkgroup = view.getUserAndClassInfo().getWorkgroupId();

						//get the teachers and shared teachers
						var fromWorkgroups = view.getUserAndClassInfo().getAllTeacherWorkgroupIds();

						var annotationHtml = "";

						var maxScoreForStep = "";

						//check if there are max scores
						if(node.view.maxScores) {
							//get the max score for the current step
							maxScoreForStep = node.view.maxScores.getMaxScoreValueByNodeId(nodeId);
						}

						//check if there was a max score for the current step
						if(maxScoreForStep !== "") {
							//add a '/' before the max score
							maxScoreForStep = " / " + maxScoreForStep;
						}

						//get the latest score annotation
						var annotationScore = view.getAnnotations().getLatestAnnotation(runId, nodeId, toWorkgroup, fromWorkgroups, 'score');

						if(annotationScore && annotationScore.value != '') {
							var teacher_score = view.getI18NString('teacher_score');

							//the p that displays the score
							var scoreP = "<p style='display: inline'>" + teacher_score + ": " + annotationScore.value + maxScoreForStep + "</p>";
							var newP = "";

							//get the post time of the annotation
							var annotationScorePostTime = annotationScore.postTime;

							//check if the annotation is new for the student
							if(annotationScorePostTime > lastTimeVisited) {
								var new_text = view.getI18NString('new_text');

								//the annotation is new so we will add a [New] label to it that is red
								newP = "<p class='newAnnotation'> [" + new_text + "]</p>";

								stepHasNewFeedback = true;

								//we have found a new feedback so we will set this to true
								this.foundNewFeedback = true;
							}

							//create the row that contains the teacher score
							var annotationScoreHtml = "<tr><td class='teachermsg2'>" + scoreP + newP + "</td></tr>";

							//add the score annotation text
							annotationHtml += annotationScoreHtml; 	
						}

						//get the latest comment annotation
						var annotationComment = view.getAnnotations().getLatestAnnotation(runId, nodeId, toWorkgroup, fromWorkgroups, 'comment');

						if(annotationComment && annotationComment.value != '') {
							var teacher_feedback = view.getI18NString('teacher_feedback');

							//create the p that displays the comment
							var commentP = "<p style='display: inline'>" + teacher_feedback + ": " + annotationComment.value + "</p>";
							var newP = "";

							//get the post time of the annotation
							var annotationCommentPostTime = annotationComment.postTime;

							//check if the annotation is new for the student
							if(annotationCommentPostTime > lastTimeVisited) {
								var new_text = view.getI18NString('new_text');

								//the annotation is new so we will add a [New] label to it that is red
								newP = "<p class='newAnnotation'> [" + new_text + "]</p>";

								stepHasNewFeedback = true;

								//we have found a new feedback so we will set this to true
								this.foundNewFeedback = true;
							}

							//create the row that contains the teacher comment
							var annotationCommentHtml = "<tr><td class='teachermsg1'>" + commentP + newP + "</td></tr>";

							//add the comment annotation text
							annotationHtml += annotationCommentHtml;							
						}

						commonFeedback += annotationHtml;

						commonFeedback += "</table></div></div>";
					} else {
						//note: I don't think this else branch is used anymore
						var childHtmlSoFar = node.getShowAllWorkHtmlHelper(view);
						htmlSoFar.newFeedback += childHtmlSoFar.newFeedback;
						htmlSoFar.allFeedback += childHtmlSoFar.allFeedback;
					}

					htmlSoFar.allFeedback += tempAllFeedback + commonFeedback;

					if(stepHasNewFeedback) {
						//set the new feedback if the teacher created new feedback for this work
						htmlSoFar.newFeedback += tempNewFeedback + commonFeedback;
					}
				}
				this.showAllWorkStepCounter++;
			}
			return htmlSoFar;
		};

		/* Removes the node of the given id from the project */
		var removeNodeById = function(id){
			for(var o=0;o<allSequenceNodes.length;o++){
				if(allSequenceNodes[o].id==id){
					allSequenceNodes.splice(o,1);
					removeAllNodeReferences(id);
					return;
				};
			};
			for(var q=0;q<allLeafNodes.length;q++){
				if(allLeafNodes[q].id==id){
					allLeafNodes.splice(q,1);
					removeAllNodeReferences(id);
					return;
				};
			};
		};

		/* Removes the node at the given location from the sequence with the given id */
		var removeReferenceFromSequence = function(seqId, location){
			var seq = getNodeById(seqId);
			seq.children.splice(location,1);
		};

		/* Adds the node with the given id to the sequence with the given id at the given location */
		var addNodeToSequence = function(nodeId,seqId,location){
			var addNode = getNodeById(nodeId);
			var sequence = getNodeById(seqId);

			sequence.children.splice(location, 0, addNode); //inserts

			/* check to see if this changes causes infinite loop, if it does, take it out and notify user */
			var stack = [];
			if(!validateNoLoops(seqId, stack)){
				view.notificationManager.notify('This would cause an infinite loop! Undoing changes...', 3);
				sequence.children.splice(location, 1);
			};
		};

		/* Returns an object representation of this project */
		var projectJSON = function(){
			if (typeof navMode == 'undefined') {
				navMode = null;
			}
			if (typeof theme == 'undefined') {
				theme = null;
			}
			/* create project object with variables from this project */
			var project = {
					autoStep: autoStep,
					stepLevelNum: stepLevelNumbering,
					stepTerm: stepTerm,
					stepTermPlural: stepTermPlural,
					activityTerm: activityTerm,
					activityTermPlural: activityTermPlural,
					title: title,
					constraints: constraints,
					nodes: [],
					sequences: [],
					startPoint: "",
					navMode: navMode,
					theme: theme,
					globalTagMaps:[]
			};

			/* set start point */
			if(rootNode){
				project.startPoint = rootNode.id;
			};

			/* set node objects for each node in this project */
			for(var k=0;k<allLeafNodes.length;k++){
				project.nodes.push(allLeafNodes[k].nodeJSON(contentBaseUrl));
			};

			/* set sequence objects for each sequence in this project */
			for(var j=0;j<allSequenceNodes.length;j++){
				if(allSequenceNodes[j]){
					project.sequences.push(allSequenceNodes[j].nodeJSON());
				};
			};

			//set the global tag maps
			if(globalTagMaps != null) {
				project.globalTagMaps = globalTagMaps;
			}

			/* return the project object */
			return project;
		};

		/* Returns the absolute position to the first renderable node in the project if one exists, returns undefined otherwise. */
		var getStartNodePosition = function(){
			for(var d=0;d<rootNode.children.length;d++){
				var path = getPathToFirstNonSequenceNode(rootNode.children[d], d);
				if(path!=undefined && path!=null){
					return path;
				};
			};
		};

		/* Returns the first position that the node with the given id exists in. Returns null if no node with id exists. */
		var getPositionById = function(id){
			for(var d=0;d<rootNode.children.length;d++){
				var path = getPathToNode(rootNode.children[d], d, id);
				if(path!=undefined && path!=null){
					return path;
				};
			};

			return null;
		};

		/* Returns the filename for this project */
		var getProjectFilename = function(){
			var url = content.getContentUrl();
			return url.substring(url.indexOf(contentBaseUrl) + contentBaseUrl.length, url.length);
		};

		/* Returns the filename for the content of the node with the given id */
		var getNodeFilename = function(nodeId){
			var node = getNodeById(nodeId);
			if(node){
				return node.content.getFilename(contentBaseUrl);
			} else {
				return null;
			};
		};

		/* Given a base title, returns a unique title in this project*/
		var generateUniqueTitle = function(base){
			var count = 1;
			while(true){
				var newTitle = base + ' ' + count;
				if(!getNodeByTitle(newTitle)){
					return newTitle;
				};
				count ++;
			};
		};

		/* Given a base title, returns a unique id in this project*/
		var generateUniqueId = function(base){
			var count = 1;
			while(true){
				var newId = base + '_' + count;
				if((!getNodeById(newId)) && (copyIds.indexOf(newId)==-1)){
					return newId;
				};
				count ++;
			};
		};

		/* Copies the nodes of the given array of node ids and fires the event of the given eventName when complete.
		 * Replaces any DuplicateNode ids with the original node ids */
		var copyNodes = function(nodeIds, eventName){
			/* Replace any DuplicateNode ids with the original node id */
			for(var s=0;s<nodeIds.length;s++){
				nodeIds[s] = getNodeById(nodeIds[s]).getNode().id;
			}

			/* listener that listens for the copying of all the nodes and launches the next copy when previous is completed. 
			 * When all have completed fires the event of the given eventName */
			var listener = function(type,args,obj){
				var nodeCopiedId = args[0];
				var copiedToId = args[1];
				var copyInfo = obj;

				/* remove first nodeInfo in queue */
				var currentInfo = copyInfo.queue.shift();

				/* ensure that nodeId from queue matches nodeCopiedId */
				if(currentInfo.id!=nodeCopiedId){
					copyInfo.view.notificationManager('Copied node id and node id from queue do match, error when copying.', 3);
				};

				/* add to msg and add copied node id to copyIds and add to list of copied ids*/
				if(!copiedToId){
					copyInfo.msg += ' Failed copy of ' + nodeCopiedId;
				} else {
					copyInfo.msg += ' Copied ' + nodeCopiedId + ' to ' + copiedToId;
					copyInfo.view.getProject().addCopyId(copiedToId);
					copyInfo.copiedIds.push(copiedToId);
				};

				/* check queue, if more nodes, launch next, if not fire event with message and copiedIds as arguments */
				if(copyInfo.queue.length>0){
					/* launch next from queue */
					var nextInfo = copyInfo.queue[0];
					nextInfo.node.copy(nextInfo.eventName);
				} else {
					/* fire completed event */
					copyInfo.view.eventManager.fire(copyInfo.eventName, [copyInfo.copiedIds, copyInfo.msg]);
				};
			};

			/* custom object that holds information for the listener when individual copy events complete */
			var copyInfo = {
					view:view,
					queue:[],
					eventName:eventName,
					msg:'',
					copiedIds:[]
			};

			/* setup events for all of the node ids */
			for(var q=0;q<nodeIds.length;q++){
				var name = generateUniqueCopyEventName();
				copyInfo.queue.push({id:nodeIds[q],node:getNodeById(nodeIds[q]),eventName:name});
				view.eventManager.addEvent(name);
				view.eventManager.subscribe(name, listener, copyInfo);
			};

			/* launch the first node to copy if any exist in queue, otherwise, fire the event immediately */
			if(copyInfo.queue.length>0){
				var firstInfo = copyInfo.queue[0];
				firstInfo.node.copy(firstInfo.eventName);
			} else {
				view.eventManager.fire(eventName, [null, null]);
			};
		};

		/* Generates and returns a unique event for copying nodes and sequences */
		var generateUniqueCopyEventName = function(){
			return view.eventManager.generateUniqueEventName('copy_');
		};

		/* Adds the given id to the array of ids for nodes that are copied */
		var addCopyId = function(id){
			copyIds.push(id);
		};

		/*
		 * Retrieves the question/prompt the student reads for the step
		 * 
		 * @param nodeId the id of the node
		 * @return a string containing the prompt (the string may be an
		 * html string)
		 */
		var getNodePromptByNodeId = function(nodeId) {
			//get the node
			var node = getNodeById(nodeId);

			// delegate prompt lookup to the node.
			return node.getPrompt();			
		};

		/*
		 * Get the position of the node in the project as seen in the
		 * vle by the student.
		 * e.g. if a node is the first node in the first activity
		 * the position is 0.0 but to the student they see 1.1
		 * @param the node id we want the vle position for
		 * @return the position of the node as seen by the student in the vle
		 */
		var getVLEPositionById = function(id) {
			var vlePosition = "";

			//get the position
			var position = getPositionById(id) + "";

			if(position != null) {
				//split the position at the periods
				var positionValues = position.split(".");

				//loop through each value
				for(var x=0; x<positionValues.length; x++) {
					//get a value
					var value = positionValues[x];

					if(vlePosition != "") {
						//separate the values by a period
						vlePosition += ".";
					}

					//increment the value by 1
					vlePosition += (parseInt(value) + 1);
				}				
			}

			return vlePosition;
		};

		/* Returns an array of any duplicate nodes of the node with the given id. If the node with
		 * the given id is a duplicate itself, returns an array of all duplicates of the node it 
		 * represents. If the optional includeOriginal parameter evaluates to true, includes the 
		 * orignial node in the array. */
		var getDuplicatesOf = function(id, includeOriginal){
			var dups = [];
			var node = getNodeById(id);

			if(node != null){
				/* if this is a duplicate node, get the node that this node represents */
				if(node.type=='DuplicateNode'){
					node = node.getNode();
				}

				/* include the original node if parameter provided and evaluates to true */
				if(includeOriginal){
					dups.push(node);
				}

				/* iterate through the leaf nodes in the project and add any duplicates
				 * of the node to the duplicate array */
				for(var t=0;t<allLeafNodes.length;t++){
					if(allLeafNodes[t].type=='DuplicateNode' && allLeafNodes[t].getNode().id==node.id){
						dups.push(allLeafNodes[t]);
					}
				}
			}

			/* return the array */
			return dups;
		};

		/*
		 * Get the next available review group number
		 */
		var getNextReviewGroupNumber = function() {
			var nextReviewGroupNumber = null;

			//get the nodes from the project
			var nodes = content.getContentJSON().nodes;

			//the array to store the review group numbers we already use
			var currentReviewGroupNumbers = [];

			//loop through the nodes
			for(var x=0; x<nodes.length; x++) {
				//get a node
				var node = nodes[x];

				//get the nodeId
				var nodeId = node.identifier;

				//get the actual node object
				var nodeObject = getNodeById(nodeId);

				//get the reviewGroup attribute
				var reviewGroup = nodeObject.reviewGroup;

				//see if the reviewGroup attribute was set
				if(reviewGroup) {
					//check if we have already seen this number
					if(currentReviewGroupNumbers.indexOf(reviewGroup) == -1) {
						//we have not seen this number so we will add it
						currentReviewGroupNumbers.push(reviewGroup);
					}
				}
			}

			/*
			 * loop from 1 to 1000 in search of an available review group number.
			 * this is assuming there won't be more than 1000 review sequences
			 * in a project.
			 */
			for(var y=1; y<1000; y++) {
				//check if the current number is in our array of numbers we already use
				if(currentReviewGroupNumbers.indexOf(y) == -1) {
					/*
					 * it is not in the array so we don't use it right now and we
					 * can use it for the next review group number
					 */
					nextReviewGroupNumber = y;

					//exit the loop since we have found an available group number
					break;
				}
			}

			//return the next review group number
			return nextReviewGroupNumber;
		};

		/*
		 * Remove the review sequence attributes from all the nodes that are
		 * associated with the given review group number
		 */
		var cancelReviewSequenceGroup = function(reviewGroupNumber) {
			//get all the nodes
			var nodes = content.getContentJSON().nodes;

			//loop through all the nodes
			for(var x=0; x<nodes.length; x++) {
				//get a node
				var node = nodes[x];

				//get the nodeId
				var nodeId = node.identifier;

				//get the actual node object
				var nodeObject = getNodeById(nodeId);
				//get the review group of the node
				if(nodeObject){
					var tempReviewGroupNumber = nodeObject.reviewGroup;

					//check if the node has a review group
					if(tempReviewGroupNumber) {
						//check if the review group matches
						if(tempReviewGroupNumber == reviewGroupNumber) {
							//set the review sequence attributes to null
							nodeObject.peerReview = null;
							nodeObject.teacherReview = null;
							nodeObject.reviewGroup = null;
							nodeObject.associatedStartNode = null;
							nodeObject.associatedAnnotateNode = null;
						}
					}
				}
			}
			eventManager.fire('saveProject');
		};

		/**
		 * Get the other nodes that are in the specified review group
		 * @param reviewGroupNumber the number of the review group we want
		 * @return an array containing the nodeIds of the nodes in the
		 * review group
		 */
		var getNodesInReviewSequenceGroup = function(reviewGroupNumber) {
			//the array of nodeIds that are in the review group
			var nodesInReviewSequenceGroup = [];

			if(reviewGroupNumber) {
				//get all the nodes
				var nodes = content.getContentJSON().nodes;

				//loop through all the nodes
				for(var x=0; x<nodes.length; x++) {
					//get a node
					var node = nodes[x];

					//get the nodeId
					var nodeId = node.identifier;

					//get the actual node object
					var nodeObject = getNodeById(nodeId);

					if(nodeObject) {
						//get the review group of the node
						var tempReviewGroupNumber = nodeObject.reviewGroup;

						//the review group number matches
						if(tempReviewGroupNumber == reviewGroupNumber) {
							//add the node object to the array
							nodesInReviewSequenceGroup.push(node);
						}						
					}
				}				
			}

			//return the array containing the nodes in the review group
			return nodesInReviewSequenceGroup;
		};

		/**
		 * Get the review sequence phase of a node given
		 * the nodeId
		 * @param nodeId the id of the node we want the review
		 * phase for
		 */
		var getReviewSequencePhaseByNodeId = function(nodeId) {
			var reviewSequencePhase = "";

			//get the node
			var node = getNodeById(nodeId);

			if(node) {
				//get the review phase
				if(node.peerReview) {
					reviewSequencePhase = node.peerReview;
				} else if(node.teacherReview) {
					reviewSequencePhase = node.teacherReview;
				}				
			}

			//return the phase
			return reviewSequencePhase;
		};

		/**
		 * Determine if a position comes before or is the same position as another position
		 * @param nodePosition1 a project position (e.g. '0.1.4')
		 * @param nodePosition2 a project position (e.g. '0.1.4')
		 * @return true if nodePosition1 comes before or is the same as nodePosition2,
		 * false if nodePosition1 comes after nodePosition2
		 */
		var positionBeforeOrEqual = function(nodePosition1, nodePosition2) {
			//split nodePosition1 by the '.'
			var nodePosition1Array = nodePosition1.split(".");

			//split nodePosition2 by the '.'
			var nodePosition2Array = nodePosition2.split(".");

			//loop through all of the sub positions of nodePosition2
			for(var x=0; x<nodePosition2Array.length; x++) {
				if(x > nodePosition1Array.length - 1) {
					/*
					 * np2 has more sub positions than np1 and
					 * all the sub positions so far have been
					 * equivalent
					 * e.g.
					 * np1 = 1.1.1
					 * np2 = 1.1.1.1
					 * in this example np2 has 4 sub positions
					 * and np1 only has 3 which means np1 does
					 * come before np2
					 */
					return true;
				} else {
					//get the current sub position for both positions
					var subNodePosition1 = parseInt(nodePosition1Array[x]);
					var subNodePosition2 = parseInt(nodePosition2Array[x]);

					if(subNodePosition1 > subNodePosition2) {
						/*
						 * the sub position for 1 comes after the sub position for 2
						 * so nodePosition1 comes after nodePosition2
						 */
						return false;
					} else if(subNodePosition1 < subNodePosition2) {
						/*
						 * the sub position for 1 comes before the sub position for 2
						 * so nodePosition1 comes before nodePosition2
						 */
						return true;
					}
				}
			}

			//the positions were equal
			return true;
		};

		/**
		 * Determine if a position comes after another position
		 * @param nodePosition1 a project position (e.g. '0.1.9')
		 * @param nodePosition2 a project position (e.g. '0.1.10')
		 * 
		 * @return whether nodePosition1 comes after nodePosition2
		 */
		var positionAfter = function(nodePosition1, nodePosition2) {
			//make the node positions into strings
			nodePosition1 += '';
			nodePosition2 += '';

			//split nodePosition1 by the '.'
			var nodePosition1Array = nodePosition1.split(".");

			//split nodePosition2 by the '.'
			var nodePosition2Array = nodePosition2.split(".");

			for(var x=0; x<nodePosition1Array.length; x++) {
				if(x > nodePosition2Array.length - 1) {
					/*
					 * np1 has more sub positions than np2 and
					 * all the sub positions so far have been
					 * equivalent
					 * e.g.
					 * np1 = 1.1.1.1
					 * np2 = 1.1.1
					 * in this example np1 has 4 sub positions
					 * and np2 only has 3 which means np1 does
					 * come after np2
					 */
				} else {
					//get the current sub position for both positions
					var subNodePosition1 = parseInt(nodePosition1Array[x]);
					var subNodePosition2 = parseInt(nodePosition2Array[x]);

					if(subNodePosition1 > subNodePosition2) {
						/*
						 * the sub position for 1 comes after the sub position for 2
						 * so nodePosition1 comes after nodePosition2
						 */
						return true;
					} else if(subNodePosition1 < subNodePosition2) {
						/*
						 * the sub position for 1 comes before the sub position for 2
						 * so nodePosition1 comes before nodePosition2
						 */
						return false;
					}
				}
			}

			//the positions were equal
			return false;
		};

		/*
		 * Get the previous and next nodeIds of the given nodeId
		 * @param nodeId the nodeId we want the previous and next of
		 */
		var getPreviousAndNextNodeIds = function(nodeId) {
			//get all the nodeIds in the project ordered
			var nodeIdsArray = getNodeIds(true);

			//create the object that we will store the previous and next into
			var previousAndNextNodeIds = new Object();

			//loop through all the nodeIds in the project
			for(var x=0; x<nodeIdsArray.length; x++) {
				//get a nodeId
				var currentNodeId = nodeIdsArray[x];

				//compare the current nodeId with the one we want
				if(currentNodeId == nodeId) {
					//we have found the nodeId we want

					//get the previous nodeId
					previousAndNextNodeIds.previousNodeId = nodeIdsArray[x - 1];

					if(previousAndNextNodeIds.previousNodeId) {
						previousAndNextNodeIds.previousNodePosition = getVLEPositionById(previousAndNextNodeIds.previousNodeId);
					}

					//get the next nodeId
					previousAndNextNodeIds.nextNodeId = nodeIdsArray[x + 1];

					if(previousAndNextNodeIds.nextNodeId) {
						previousAndNextNodeIds.nextNodePosition = getVLEPositionById(previousAndNextNodeIds.nextNodeId);
					}

					break;
				}
			}

			return previousAndNextNodeIds;
		};

		/* Returns an array of nodeIds for nodes that are descendents of the given nodeId, if all is
		 * provided, also includes sequence ids that are descendents of the given nodeId */
		var getDescendentNodeIds = function(nodeId, all){
			var ids = [];

			/* get the node of the given id */
			var node = getNodeById(nodeId);

			/* if the node is a sequence, then we want to add all of its children to
			 * the ids array */
			if(node.isSequence()){
				for(var n=0;n<node.children.length;n++){
					/* if the child is a sequence, we want to splice in all of its descendent ids */
					if(node.children[n].isSequence()){
						/* if all is provided, add this sequence id to the ids array */
						if(all){
							ids.push(node.children[n].id);
						}

						/* add the descendents of this sequence */
						ids = ids.concat(getDescendentNodeIds(node.children[n].id, all));
					} else {
						ids.push(node.children[n].id);
					}
				}
			}

			return ids;
		};

		/* returns true if the project has any nodes that can dynamically create constraints, returns false otherwise */
		var containsConstraintNodes = function(){
			/* iterate through the leaf nodes and return true if an AssessmentListNode
			 * or a ChallengeNode is found */
			for(var y=0;y<allLeafNodes.length;y++){
				if(allLeafNodes[y].getType()=='AssessmentListNode' || allLeafNodes[y].getType()=='ChallengeNode' ||
						allLeafNodes[y].getType=='BranchNode'){
					return true;
				}
			}

			/* none found, return false */
			return false;
		};

		/* remove the constraint with the given id */
		var removeConstraint = function(id){
			for(var l=0;l<constraints.length;l++){
				if(constraints[l].id==id){
					constraints.splice(l,1);
					break;
				}
			}
		};

		/**
		 * Returns whether we found new feedback after generating the show all work
		 */
		var hasNewFeedback = function() {
			return this.foundNewFeedback;
		};

		/**
		 * Get the step number and title for a given node id
		 * @return the step number and title as a recognized by the student in the vle
		 * e.g. 1.2: Analyze the molecules
		 */
		var getStepNumberAndTitle = function(id) {
			var stepNumberAndTitle = "";

			//get the vle position of the step as recognized by the student in the vle
			var stepNumber = getVLEPositionById(id);
			stepNumberAndTitle += stepNumber + ": ";


			var node = getNodeById(id);
			if(node != null) {
				//get the title of the step
				stepNumberAndTitle += node.title;
			}

			return stepNumberAndTitle;
		};

		/**
		 * Get the node titles for the step including the titles of parent nodes.
		 * This is a recursive function that calls itself with each successive
		 * parent node.
		 * @param id the node id of a step or activity
		 * @return the titles of all the nodes in the hierarchy separated by ': '
		 * e.g.
		 * If the node is for a step we will return the step title along with
		 * all of its parent node titles. If the step title is 'How to use WISE'
		 * and the activity the step is in is titled 'Introduction Activity' we
		 * will return
		 * 'Introduction Activity: How to use WISE'
		 */
		var getNodeTitles = function(id) {
			var result = '';

			/*
			 * check if we are on the master node. we will not display
			 * anything for the master node.
			 */
			if(id != 'master') {
				//get the node
				var node = getNodeById(id);

				if(node != null) {
					//get the title of the node
					var nodeTitle = node.title;

					//get the parent of the node
					var parent = node.parent;
					var parentId = parent.id;

					//get the title of the parent nodes
					var parentResult = getNodeTitles(parentId);

					if(parentResult == '') {
						/*
						 * parent was master so it returned '' so our result will
						 * just be this node title
						 */
						result = nodeTitle;
					} else {
						//prepend the parent result
						result = parentResult + ': ' + nodeTitle;
					}
				}
			}

			return result;
		};

		/**
		 * Get all node ids and their titles in an array
		 */
		var getAllNodeIdsAndNodeTitles = function() {
			//the array to hold all the objects that contain the node information
			var nodeObjects = [];

			//get all the node ids
			var allNodeIds = getNodeIds(null, true);

			//loop through all the node ids
			for(var x=0; x<allNodeIds.length; x++) {
				//get a node id
				var nodeId = allNodeIds[x];

				//skip the master node
				if(nodeId != null && nodeId != 'master') {
					//get the node
					var node = getNodeById(nodeId);

					if(node != null) {
						//get the node title
						var title = node.title;

						if(title != null) {
							//create the object that will contain the node information
							var nodeObject = {};
							nodeObject.nodeId = nodeId;
							nodeObject.title = title;

							//add the object to the array we will return
							nodeObjects.push(nodeObject);
						}
					}
				}
			}

			return nodeObjects;
		};

		/**
		 * Recursively obtain all the leaf nodeIds that have the given tag
		 * @param tagName the tag we are looking for
		 * @return an array containing all the leaf nodes that contain the given tag
		 */
		var getNodeIdsByTag = function(tagName) {
			//create the array that we will store the nodeIds in
			var nodeIds = [];

			if(tagName != null && tagName != '') {
				//get the project content
				var project = content.getContentJSON();

				//get the starting point of the project
				var startPoint = project.startPoint;

				//get the start node
				var startNode = getNodeById(startPoint);

				//get the leaf nodeIds
				nodeIds = getNodeIdsByTagHelper(nodeIds, startNode, tagName);
			}

			//return the populated array containing nodeIds
			return nodeIds;
		};

		/**
		 * Recursively obtain all the leaf nodeIds that have the given tag
		 * @param nodeIds an array containing all the nodeIds we have found so far
		 * @param currentNode the current node
		 * @param tagName the tag we are looking for
		 * @return an array containing all the leaf nodes that contain the given tag 
		 */
		var getNodeIdsByTagHelper = function(nodeIds, currentNode, tagName) {

			if(currentNode.type == 'sequence') {
				//current node is a sequence

				//get the child nodes
				var childNodes = currentNode.children;

				//loop through all the child nodes
				for(var x=0; x<childNodes.length; x++) {
					//get a child node
					var childNode = childNodes[x];

					//recursively call this function with the child node
					nodeIds = getNodeIdsByTagHelper(nodeIds, childNode, tagName);
				}
			} else {
				//current node is a leaf node

				//get the tags for this node
				var tagsForNode = currentNode.tags;

				//check if the node has the tag we are looking for
				if(tagsForNode != null && tagsForNode.indexOf(tagName) != -1) {
					nodeIds.push(currentNode.id);					
				}
			}

			//return the updated array of nodeIds
			return nodeIds;
		};

		/**
		 * Get all the node ids by tag that occur before the current node id
		 * in the project
		 * @param tagName the tag
		 * @param nodeId the node id we want to stop at
		 */
		var getPreviousNodeIdsByTag = function(tagName, nodeId) {
			//create the array that we will store the nodeIds in
			var nodeIds = [];

			if(tagName != null && tagName != '') {
				//get the project content
				var project = content.getContentJSON();

				//get the starting point of the project
				var startPoint = project.startPoint;

				//get the start node
				var startNode = getNodeById(startPoint);

				//whether we have found our node id yet
				var foundNodeId = false;

				/*
				 * get previous node ids that have the tag. this function will update 
				 * the nodeIds array refernce that is passed in.
				 */
				getPreviousNodeIdsByTagHelper(nodeIds, startNode, tagName, nodeId, foundNodeId);
			}

			//return the populated array containing nodeIds
			return nodeIds;
		};

		/**
		 * Recursively obtain all the leaf nodeIds that occur before the given
		 * nodeId in the project and also have the given tag
		 * @param nodeIds an array containing all the nodeIds we have found so far
		 * @param currentNode the current node
		 * @param tagName 
		 * @param nodeId 
		 * @param foundNodeId 
		 * @return an array containing all the leaf nodes that contain the given
		 * tag and occur before the given nodeId in the project
		 */
		var getPreviousNodeIdsByTagHelper = function(nodeIds, currentNode, tagName, nodeId, foundNodeId) {

			if(currentNode.type == 'sequence') {
				//current node is a sequence

				if(currentNode.id == nodeId) {
					foundNodeId = true;
				} else {
					//get the tags for this node
					var tagsForNode = currentNode.tags;

					//check if this node has the tag we are looking for
					if(tagsForNode != null && tagsForNode.indexOf(tagName) != -1) {
						nodeIds.push(currentNode.id);					
					}	

					//get the child nodes
					var childNodes = currentNode.children;

					//loop through all the child nodes
					for(var x=0; x<childNodes.length; x++) {
						//get a child node
						var childNode = childNodes[x];

						//recursively call this function with the child node
						var nodeIdsAndFoundNodeId = getPreviousNodeIdsByTagHelper(nodeIds, childNode, tagName, nodeId, foundNodeId);

						//update these values
						nodeIds = nodeIdsAndFoundNodeId.nodeIds;
						foundNodeId = nodeIdsAndFoundNodeId.foundNodeId;

						if(foundNodeId) {
							break;
						}
					}					
				}
			} else {
				//current node is a leaf node

				if(currentNode.id == nodeId) {
					//we have found the node id that we need to stop at
					foundNodeId = true;
				} else {
					//get the tags for this node
					var tagsForNode = currentNode.tags;

					//check if this node has the tag we are looking for
					if(tagsForNode != null && tagsForNode.indexOf(tagName) != -1) {
						nodeIds.push(currentNode.id);					
					}					
				}
			}

			/*
			 * create an object so we can return the nodeIds and also whether
			 * we have found our nodeId yet
			 */
			var nodeIdsAndFoundNodeId = {
					nodeIds:nodeIds,
					foundNodeId:foundNodeId
			};

			//return the object with nodeIds array and foundNodeId boolean
			return nodeIdsAndFoundNodeId;
		};

		/**
		 * Get all the unique tags in the project.
		 */
		var getAllUniqueTagsInProject = function() {
			var uniqueTags = [];

			//get all the node ids in the project. this includes step nodes and activity nodes
			var nodeIds = getNodeIds(null, true);

			//loop through all the nodes in the project
			for(var x=0; x<nodeIds.length; x++) {
				var nodeId = nodeIds[x];
				var node = getNodeById(nodeId);

				if(node != null) {
					//get the tags for the node
					var tags = node.tags;

					if(tags != null) {

						//loop through all the tags for this node
						for(var t=0; t<tags.length; t++) {
							//get a tag
							var tag = tags[t];

							if(uniqueTags.indexOf(tag) == -1) {
								//tag is not in our array so we will add it
								uniqueTags.push(tag);
							}
						}
					}
				}
			}

			return uniqueTags;
		};

		/**
		 * Get all the unique tag maps in the project.
		 */
		var getAllUniqueTagMapsInProject = function() {
			var uniqueTagMaps = [];

			//get all the step nodes
			var nodes = allLeafNodes;

			//loop through all the step nodes
			for(var x=0; x<nodes.length; x++) {
				//get a node
				var node = nodes[x];

				if(node != null) {
					//get all the tag maps for this node
					var tagMaps = node.tagMaps;

					if(tagMaps != null) {

						//loop through all the tag maps for this node
						for(var t=0; t<tagMaps.length; t++) {
							//get the current tag map
							var tagMap = tagMaps[t];

							var tagMapAlreadyExists = false;

							/*
							 * loop through all the unique tag maps we have already found
							 * to see if the current tag map should be added or not
							 */
							for(var y=0; y<uniqueTagMaps.length; y++) {
								//get a tag map that we have already found
								var uniqueTagMap = uniqueTagMaps[y];

								/*
								 * check if we already have this current tag map by comparing
								 * all the fields with the tag map we have already found
								 */
								if(uniqueTagMap.tagName == tagMap.tagName &&
										uniqueTagMap.functionName == tagMap.functionName &&
										arraysEqual(uniqueTagMap.functionArgs, tagMap.functionArgs)) {
									//tag is not in our array so we will mark it to be added
									tagMapAlreadyExists = true;
									break;
								}
							}

							if(!tagMapAlreadyExists) {
								//we do not have this tag map yet so we will add it
								uniqueTagMaps.push(tagMap);
							}
						}
					}
				}
			}

			return uniqueTagMaps;
		};

		/**
		 * Get the manual assignment group names. These group names are in branch nodes
		 * and can be assigned to workgroups in the grading tool.
		 * 
		 * @param nodeId (optional) the node id to look for. if this is not passed in
		 * we will look at all nodes
		 */
		var getManualGroupsUsed = function(nodeId) {
			var manualGroupsUsed = [];

			//get all the step nodes
			var nodes = allLeafNodes;

			//loop through all the step nodes
			for(var x=0; x<nodes.length; x++) {
				//get a node
				var node = nodes[x];

				if(node != null) {
					var tempNodeId = node.id;
					
					if(nodeId == null || nodeId == tempNodeId) {
						//get the step content
						var nodeContentJSON = node.getContent().getContentJSON();

						if(nodeContentJSON != null && nodeContentJSON.groupsUsed != null) {
							//get the groups used
							var nodeGroupsUsed = nodeContentJSON.groupsUsed;

							for(var y=0; y<nodeGroupsUsed.length; y++) {
								//get a group
								var group = nodeGroupsUsed[y];

								//add the group to our array if it has not already been added
								if(manualGroupsUsed.indexOf(group) == -1) {
									manualGroupsUsed.push(group);
								}
							}
						}
					}
				}
			}

			return manualGroupsUsed;
		};

		/**
		 * Get the automatic assignment group names. These group names are in branch nodes
		 * and can are automatically assigned to workgroups when they reach branch nodes.
		 * 
		 * @param nodeId (optional) the node id to look for. if this is not passed in
		 * we will look at all nodes
		 */
		var getAutoGroupsUsed = function(nodeId) {
			var autoGroupsUsed = [];

			//get all the step nodes
			var nodes = allLeafNodes;

			//loop through all the step nodes
			for(var x=0; x<nodes.length; x++) {
				//get a node
				var node = nodes[x];

				if(node != null) {
					var tempNodeId = node.id;
					
					if(nodeId == null || nodeId == tempNodeId) {
						//get the step content
						var nodeContentJSON = node.getContent().getContentJSON();

						if(nodeContentJSON != null && nodeContentJSON.groupsUsed != null) {
							//get the branch paths
							var paths = nodeContentJSON.paths;

							if(paths != null && paths.length > 0) {
								//loop through all the branch paths
								for(var y=0; y<paths.length; y++) {
									//get a path
									var path = paths[y];

									if(path != null) {
										//get the id of the activity for the branch path
										var sequenceRef = path.sequenceRef;

										if(sequenceRef != null && sequenceRef != '') {
											//get the activity node
											var activityNode = getNodeById(sequenceRef);

											if(activityNode != null) {
												//get the title of the activity
												var title = activityNode.title;

												//add the activity title to our array
												autoGroupsUsed.push(title);
											}
										}
									}
								}
							}
						}
					}
				}
			}

			return autoGroupsUsed;
		};

		/**
		 * Get all the node ids or nodes that have the given node type
		 * @param nodeType the node type we want
		 */
		var getNodeIdsByNodeType = function(nodeType) {
			var result = [];

			//get all the active node ids in the project
			var nodeIds = getNodeIds();

			//loop through all the node ids
			for(var x=0; x<nodeIds.length; x++) {
				//get a node id
				var nodeId = nodeIds[x];

				//get a node
				var node = getNodeById(nodeId);

				if(node != null) {
					//get the node type
					var tempNodeType = node.type;

					if(nodeType == tempNodeType) {
						//the node type matches the type we want
						result.push(nodeId);
					}
				}
			}

			return result;
		};

		/**
		 * Shallow compare the two arrays to see if all the elements
		 * are the same
		 * @param array1 an array that we will compare
		 * @param array2 an array that we will compare
		 */
		var arraysEqual = function(array1, array2) {
			var result = true;

			if(array1.length != array2.length) {
				//arrays are not the same length
				result = false;
			} else {
				//arrays are the same length

				//loop through the elements in both arrays
				for(var x=0; x<array1.length; x++) {
					var array1Element = array1[x];
					var array2Element = array2[x];

					//compare the elements
					if(array1Element != array2Element) {
						/*
						 * the elements are not the same which means the
						 * arrays are not equal
						 */
						result = false;
						break;
					}
				}
			}

			return result;
		};

		/**
		 * Check if the node id is in the sequence
		 * @param nodeId the node id
		 * @param sequenceId the sequence id
		 * @return whether the node id is in the sequence
		 */
		var isNodeIdInSequence = function(nodeId, sequenceId) {
			var result = false;

			//get all the node ids in the sequence
			var nodeIds = getNodeIdsInSequence(sequenceId);

			//loop through all the node ids in the sequence
			for(var x=0; x<nodeIds.length; x++) {
				var tempNodeId = nodeIds[x];

				if(nodeId == tempNodeId) {
					//the node id is in the sequence
					result = true;
					break;
				}
			}

			return result;
		};

		/**
		 * Get the parent node id.
		 * Note: this only searches the first level of sequences and
		 * does not perform a deep search
		 * @param node id the node id to find the parent of
		 * @return the parent node id
		 */
		var getParentNodeId = function(nodeId) {
			var parentNodeId = null;

			//get all the sequence ids
			for(var x=0; x<allSequenceNodes.length; x++) {
				//get a sequence node
				var sequenceNode = allSequenceNodes[x];

				if(sequenceNode != null) {
					//get the id of the sequence
					var sequenceNodeId = sequenceNode.id;

					if(sequenceNode.json.refs.indexOf(nodeId) != -1) {
						//the node id is in this sequence

						parentNodeId = sequenceNodeId;
						break;
					}
				}
			}

			return parentNodeId;
		};

		/**
		 * Set the global tag maps from the project content
		 */
		var setGlobalTagMaps = function() {
			globalTagMaps = content.getContentJSON().globalTagMaps;
		};

		/**
		 * Get the global tag maps
		 */
		var getGlobalTagMaps = function() {
			return globalTagMaps;
		};

		/* check to see if this project was passed a minifiedStr, in which we will
		 * set the totalProjectContent and this project's content */
		if(totalProjectContent){
			content.setContent(totalProjectContent.getContentJSON().project);
		};

		/* parse the project content and set available attributes to variables */
		var project = content.getContentJSON();
		if(project){
			/* set auto step */
			autoStep = project.autoStep;

			/* set step level numbering */
			stepLevelNumbering = project.stepLevelNum;

			/* set step term */
			stepTerm = project.stepTerm;

			/* set step term plural */
			stepTermPlural = project.stepTermPlural;

			/* set activity term */
			activityTerm = project.activityTerm;

			/* set activity term plural */
			activityTermPlural = project.activityTermPlural;

			/* set title */
			title = project.title;

			/* set constraints */
			constraints = (project.constraints) ? project.constraints : [];

			/* set navigation mode */
			if(project.navMode){
				navMode = project.navMode;
			}

			/* set theme */
			if(project.theme){
				theme = project.theme;
			}

			/* create nodes for project and set rootNode*/
			generateProjectNodes();
			generateSequences();

			//set the global tag maps
			setGlobalTagMaps();

			/* set up duplicate nodes */
			setRealNodesInDuplicates();

			/* generate reports for console */
			//printSummaryReportsToConsole();
		} else {
			view.notificationManager.notify('Unable to parse project content, check project.json file. Unable to continue.', 5);
		};


		return {
			/* returns true when autoStep should be used, false otherwise */
			useAutoStep:function(){return autoStep;},
			/* sets autoStep to the given boolean value */
			setAutoStep:function(bool){autoStep = bool;},
			/* returns true when stepLevelNumbering should be used, false otherwise */
			useStepLevelNumbering:function(){return stepLevelNumbering;},
			/* sets stepLevelNumbering to the given boolean value */
			setStepLevelNumbering:function(bool){stepLevelNumbering = bool;},
			/* returns the step term to be used when displaying nodes in the navigation for this project */
			getStepTerm:function(){return stepTerm;},
			/* sets the step term to be used when displaying nodes in this project */
			setStepTerm:function(term){stepTerm = term;},
			/* returns the step term plural to be used when displaying nodes in the navigation for this project */
			getStepTermPlural:function(){return stepTermPlural;},
			/* sets the step term plural to be used when displaying nodes in this project */
			setStepTermPlural:function(term){stepTermPlural = term;},
			/* returns the activity term to be used when displaying activities in the navigation for this project */
			getActivityTerm:function(){return activityTerm;},
			/* sets the activity term to be used when displaying activities in this project */
			setActivityTerm:function(term){activityTerm = term;},
			/* returns the activity term plural to be used when displaying activities in the navigation for this project */
			getActivityTermPlural:function(){return activityTermPlural;},
			/* sets the activity term plural to be used when displaying activities in this project */
			setActivityTermPlural:function(term){activityTermPlural = term;},
			/* returns the title of this project */
			getTitle:function(){return title;},
			/* sets the title of this project */
			setTitle:function(t){title = t;},
			/* returns the node with the given id if it exists, null otherwise */
			getNodeById:function(nodeId){return getNodeById(nodeId);},
			/* given a sequence id, empty stack, and location, returns true if any infinite loops
			 * are discovered, returns false otherwise */
			validateNoLoops:function(id, stack, from){return validateNoLoops(id,stack,from);},
			/* Returns the node with the given title if the node exists, returns null otherwise. */
			getNodeByTitle:function(title){return getNodeByTitle(title);},
			/* Returns the node at the given position in the project if it exists, returns null otherwise */
			getNodeByPosition:function(pos){return getNodeByPosition(pos);},
			/* Returns an array containing all node ids of types that are not included in the provided nodeTypesToExclude */
			getNodeIds:function(onlyGetNodesWithGradingView){return getNodeIds(onlyGetNodesWithGradingView);},
			/* Returns html showing all students work so far */
			getShowAllWorkHtml:function(node,showGrades){return getShowAllWorkHtml(node,showGrades);},
			/* Returns the first renderable node Id for this project */
			getStartNodeId:function(){return getFirstNonSequenceNodeId(rootNode);},
			/* Removes the node of the given id from the project */
			removeNodeById:function(id){removeNodeById(id);},
			/* Removes the node at the given location from the sequence with the given id */
			removeReferenceFromSequence:function(seqId, location){removeReferenceFromSequence(seqId, location);},
			/* Adds the node with the given id to the sequence with the given id at the given location */
			addNodeToSequence:function(nodeId, seqId, location){addNodeToSequence(nodeId,seqId,location);},
			/* Copies the nodes of the given array of node ids and fires the event of the given eventName when complete */
			copyNodes:function(nodeIds, eventName){copyNodes(nodeIds, eventName);},
			/* Returns the absolute position to the first renderable node in the project if one exists, returns undefined otherwise. */
			getStartNodePosition:function(){return getStartNodePosition();},
			/* Returns the first position that the node with the given id exists in. Returns null if no node with id exists. */
			getPositionById:function(id){return getPositionById(id);},
			/* Returns the content base url for this project */
			getContentBase:function(){return contentBaseUrl;},
			/* Returns the filename for this project */
			getProjectFilename:function(){return getProjectFilename();},
			/* Returns the full url for this project's content */
			getUrl:function(){return content.getContentUrl();},
			/* Returns the leaf nodes array of this project */
			getLeafNodes:function(){return allLeafNodes;},
			/* Returns the sequence nodes array of this project */
			getSequenceNodes:function(){return allSequenceNodes;},
			/* Returns the root node for this project */
			getRootNode:function(){return rootNode;},
			/* Returns an array of nodes of the given type that are not a child node to any other node */
			getUnattached:function(type){return getUnattached(type);},
			/* Returns the filename for the content of the node with the given id */
			getNodeFilename:function(nodeId){return getNodeFilename(nodeId);},
			/* Given a base title, returns a unique title in this project*/
			generateUniqueTitle:function(base){return generateUniqueTitle(base);},
			/* Given a base title, returns a unique id in this project*/
			generateUniqueId:function(base){return generateUniqueId(base);},
			/* Generates and returns a unique event for copying nodes and sequences */
			generateUniqueCopyEventName:function(){return generateUniqueCopyEventName();},
			/* Adds the given id to the array of ids for nodes that are copied */
			addCopyId:function(id){addCopyId(id);},
			/* Returns an object representation of this project */
			projectJSON:function(){return projectJSON();},
			/* Given the filename, returns the url to retrieve the file NATE did something here */
			makeUrl:function(filename, node){return makeUrl(filename, node);},
			/* Given the nodeId, returns the prompt for that step */
			getNodePromptByNodeId:function(nodeId){return getNodePromptByNodeId(nodeId);},
			/* Sets the post level for this project */
			setPostLevel:function(level){postLevel = level;},
			/* Returns the post level for this project */
			getPostLevel:function(){return postLevel;},
			/* Returns the first position as seen in the vle that the node with the given id exists in. Returns "" if no node with id exists. */
			getVLEPositionById:function(id){return getVLEPositionById(id);},
			/* Returns an array of any duplicate nodes of the node with the given id. If the node with
			 * the given id is a duplicate itself, returns an array of all duplicates of the node it 
			 * represents  and optionally includes the original when specified */
			getDuplicatesOf:function(id, includeOriginal){return getDuplicatesOf(id, includeOriginal);},
			/* Return the next available review group number */
			getNextReviewGroupNumber:function(){return getNextReviewGroupNumber();},
			/* Removes the review sequence attributes from the steps that are part of the group */
			cancelReviewSequenceGroup:function(reviewGroupNumber){return cancelReviewSequenceGroup(reviewGroupNumber);},
			/* Retrieves the previous and next nodeIds of the given nodeId */
			getPreviousAndNextNodeIds:function(nodeId){return getPreviousAndNextNodeIds(nodeId);},
			/* Returns whether position1 comes before or is equal to position2 */
			positionBeforeOrEqual:function(nodePosition1, nodePosition2){return positionBeforeOrEqual(nodePosition1, nodePosition2);},
			/* Returns whether position1 comes after position2 */
			positionAfter:function(nodePosition1, nodePosition2){return positionAfter(nodePosition1, nodePosition2);},
			/* Retrieve an array containing the node objects of the nodes that are in the review group */
			getNodesInReviewSequenceGroup:function(reviewGroupNumber){return getNodesInReviewSequenceGroup(reviewGroupNumber);},
			/* Return the review sequence phase of the given node id */
			getReviewSequencePhaseByNodeId:function(nodeId){return getReviewSequencePhaseByNodeId(nodeId);},
			/* Returns an array of nodeIds for nodes that are descendents of the given nodeId, if all is
			 * provided, also includes sequence ids that are descendents of the given nodeId */
			getDescendentNodeIds:function(nodeId, all){return getDescendentNodeIds(nodeId,all);},
			/* gets the constraints array */
			getConstraints:function(){return constraints;},
			/* adds a constraint to the constraints array */
			addConstraint:function(constraint){constraints.push(constraint);},
			/* removes the constraint with the given id */
			removeConstraint:function(id){removeConstraint(id);},
			/* returns true if the project has any nodes that can dynamically create constraints, returns false otherwise */
			containsConstraintNodes:function(){return containsConstraintNodes();},
			/* returns true if the project author specified any constraints, returns false otherwise */
			containsProjectConstraints:function(){return constraints.length > 0;},
			/* returns whether we found new feedback after generating the show all work */
			hasNewFeedback:function() {return hasNewFeedback();},
			//get the step number and title for a step
			getStepNumberAndTitle:function(id) {return getStepNumberAndTitle(id);},
			//get all the node ids that have the given tag
			getNodeIdsByTag:function(tagName) {return getNodeIdsByTag(tagName);},
			//get all the node ids that are before the given node id and have the given tag
			getPreviousNodeIdsByTag:function(tagName, nodeId) {return getPreviousNodeIdsByTag(tagName, nodeId);},
			//get all the unique tags in the project
			getAllUniqueTagsInProject:function() {return getAllUniqueTagsInProject();},
			//get all the unique tag maps in the project
			getAllUniqueTagMapsInProject:function() {return getAllUniqueTagMapsInProject();},
			/* returns the navigation mode of this project */
			getNavMode:function(){return navMode;},
			/* sets the navigation mode of this project */
			setNavMode:function(n){navMode = n;},
			/* returns the theme for this project */
			getTheme:function(){return theme;},
			/* sets the them for this project */
			setTheme:function(t){theme = t;},
			/* gets all the node types used in this project */
			getUsedNodeTypes:function(){return usedNodeTypes;},
			/* get all the manual group assignments that are used in the project */
			getManualGroupsUsed:function(nodeId){return getManualGroupsUsed(nodeId);},
			/* get all the automatic group assignments that are used in the project */
			getAutoGroupsUsed:function(nodeId){return getAutoGroupsUsed(nodeId);},
			/* get all the node ids by node type */
			getNodeIdsByNodeType:function(nodeType){return getNodeIdsByNodeType(nodeType);},
			/* get all the node ids that come after this one */
			getNodeIdsAfter:function(nodeId) {return getNodeIdsAfter(nodeId);},
			/* get all the other node ids besides this one */
			getAllOtherNodeIds:function(nodeId) {return getAllOtherNodeIds(nodeId);},
			/* get all the node ids including sequence ids */
			getAllNodeIds:function() {return getNodeIds(null, true);},
			/* get all the node ids including sequence ids */
			getNodeIdsInSequence:function(nodeId) {return getNodeIdsInSequence(nodeId);},
			/* determine if the node id is in the sequence */
			isNodeIdInSequence:function(nodeId, sequenceId) {return isNodeIdInSequence(nodeId, sequenceId);},
			/* get the node id of the parent sequence of the step */
			getParentNodeId:function(nodeId) {return getParentNodeId(nodeId);},
			/* get the activity number, activity title, and step title*/
			getNodeTitles:function(nodeId) {return getNodeTitles(nodeId);},
			/* get all the node ids and node titles as an array */
			getAllNodeIdsAndNodeTitles:function() {return getAllNodeIdsAndNodeTitles();},
			/* set the global tag maps from the project content */
			setGlobalTagMaps:function() {return setGlobalTagMaps();},
			/* get the global tag maps */
			getGlobalTagMaps:function() {return getGlobalTagMaps();}
		};
	}(content, contentBaseUrl, lazyLoading, view, totalProjectContent, loadStepI18NFiles);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/project/Project.js');
}
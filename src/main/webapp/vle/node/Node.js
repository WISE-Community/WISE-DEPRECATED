/**
 * @constructor
 * Node
 */
function Node(nodeType, view){
	this.id;
	this.parent;
	this.children = [];
	this.type = nodeType;
	this.title;
	this.className;
	this.content;
	this.contentPanel;
	this.baseHtmlContent;
	this.hints = [];

	this.prevWorkNodeIds = [];
	this.populatePreviousWorkNodeId = "";
	this.tags = [];
	this.tagMaps = [];
	this.links = [];
	this.extraData;
	this.view = view;

	//booleans used when we need to determine if a constraint is satisfied
	this.isStepOpen = true;
	this.isStepCompleted = false;
	this.isStepPartOfReviewSequence = false;

	this.selfRendering = false;

	this.tagMapFunctions = [];

	if(nodeType == 'sequence') {
		//node is an activity
		this.tagMapFunctions = [
		                        {functionName:'mustCompleteBeforeAdvancing', functionArgs:[]},
		                        {functionName:'mustCompleteBeforeExiting', functionArgs:[]},
		                        {functionName:'mustCompleteXBefore', functionArgs:[]},
		                        {functionName:'mustVisitXBefore', functionArgs:[]},
		                        {functionName:'xMustHaveStatusY', functionArgs:['statusType', 'statusValue']}
		                        ];
	} else {
		//node is a step
		this.tagMapFunctions = [
		                        {functionName:'mustCompleteBeforeAdvancing', functionArgs:[]},
		                        {functionName:'mustCompleteBeforeExiting', functionArgs:[]},
		                        {functionName:'mustCompleteXBefore', functionArgs:[]},
		                        {functionName:'mustVisitXBefore', functionArgs:[]},
		                        {functionName:'xMustHaveStatusY', functionArgs:['statusType', 'statusValue']}
		                        ];
	}
	
	// Messages to display to students when the status types are used for navigation constraints
	if(view){
		Node.statusConstraintMessages = [
			{statusType: 'isVisitable', statusValue: 'true', message: view.getI18NString('constraint_message_mustUnlockXBeforeVisiting')},
			{statusType: 'isVisited', statusValue: 'true', message: view.getI18NString('constraint_message_mustVisitXBeforeVisiting')},
			{statusType: 'isCompleted', statusValue: 'true', message: view.getI18NString('constraint_message_mustCompleteXBeforeVisiting')}
		];
	}
	
	this.constraintStatus = 'enabled';
	this.statuses = [];
	this.icons = [];
	this.constraints = [];
	this.nodeIdsListening = [];
};

//the status types and possible values for all nodes
Node.availableStatuses = [
	{statusType:'isVisible', possibleStatusValues:[true, false]},
	{statusType:'isVisitable', possibleStatusValues:[true, false]},
	{statusType:'isVisited', possibleStatusValues:[true, false]},
	{statusType:'isCompleted', possibleStatusValues:[true, false]}
];

//The special statuses that can be satisfied by any of the statuses in the group
Node.specialStatusValues = [

];

Node.prototype.getNodeId = function() {
	return this.id;
};

Node.prototype.isHiddenFromNavigation = function() {
	if (this.isHidden) {
		return this.isHidden;
	}
	return false;
};

/**
 * Shows/Hides this node from appearing in the navigation panel
 * @param doDisplay true iff this node should show up in the navigation.
 * @returns
 */
Node.prototype.displayInNavigation = function(doDisplay) {
	this.isHidden = !doDisplay;
	var navItem = $("#node_"+this.view.escapeIdForJquery(this.view.getProject().getPositionById(this.id)));
	if (doDisplay) {
		navItem.removeClass("hidden");		
	} else {
		navItem.addClass("hidden");
	}
};

Node.prototype.getTitle = function() {
	if (this.title != null) {
		return this.title;
	};

	return this.id;
};

Node.prototype.setTitle = function(title){
	this.title = title;
};

/**
 * Retrieves the hints for this node, if exists.
 * @return array of hints if exists. if not exist, return null
 */
Node.prototype.getHints = function() {
	if (this.content &&
			this.content.getContentJSON() &&			
			this.content.getContentJSON().hints) {
		return this.content.getContentJSON().hints;
	};
	return null;
};


/**
 * Retrieves the annotations for this node, if exists. Returns only annotations of
 * type {score,comment,cRater} for the logged in user. 
 * @return Annotations if exists. if not exist, return null
 */
Node.prototype.getNodeAnnotations = function() {
	if (this.view &&
			this.view.getAnnotations() && this.view.getAnnotations() != null &&
			this.view.getAnnotations().getAnnotationsByNodeId(this.id) != null) {
		var allNodeAnnotations = this.view.getAnnotations().getAnnotationsByNodeId(this.id);
		var filteredNodeAnnotations = [];
		var loggedInWorkgroupId = this.view.getUserAndClassInfo().getWorkgroupId();
		for (var i=0; i < allNodeAnnotations.length; i++) {
			var nodeAnnotation = allNodeAnnotations[i];
			if (nodeAnnotation.type == "score" || nodeAnnotation.type == "comment" || nodeAnnotation.type == "cRater") {
				if (nodeAnnotation.toWorkgroup == loggedInWorkgroupId) {
					filteredNodeAnnotations.push(nodeAnnotation);					
				}
			}
		}
		return filteredNodeAnnotations;
	}
	return null;
};


/**
 * Retrieves the question/prompt the student reads for this step.
 * @return a string containing the prompt. (the string may be an
 * html string)
 */
Node.prototype.getPrompt = function() {
	var prompt = "";

	if(this.content != null) {
		//get the content for the node
		var contentJSON = this.content.getContentJSON();

		if(contentJSON != null) {
			//see if the node content has an assessmentItem
			if(contentJSON.assessmentItem != null) {
				//obtain the prompt
				var assessmentItem = contentJSON.assessmentItem;
				var interaction = assessmentItem.interaction;
				prompt = interaction.prompt;	
			} else {
				if(contentJSON.prompt != null){
					prompt = contentJSON.prompt;
				}
			}
		}
	}

	//return the prompt
	return prompt;
};

/**
 * @return this node's content object
 */
Node.prototype.getContent = function(){
	return this.content;
};

/**
 * Sets this node's content object
 * @param content
 */
Node.prototype.setContent = function(content){
	this.content = content;
};

/**
 * returns this node's type. if humanReadable=true, return in human-readable format
 * e.g. HtmlNode=>{Display, Evidence}, NoteNode=>Note, etc.
 * If type is not defined, return an empty string.
 * @param humanReadable
 * @return the node type
 */
Node.prototype.getType = function(humanReadable) {
	if (this.type) {
		if (!humanReadable) {
			return this.type;
		} else {
			// first get rid of the "Node" in the end of the type
			if (this.type.lastIndexOf("Node") > -1) {
				return this.type.substring(0, this.type.lastIndexOf("Node"));
			} else {
				return this.type;
			};
		};
	} else {
		return "";
	};
};

Node.prototype.addChildNode = function(childNode) {
	this.children.push(childNode);
	childNode.parent = this;
};

Node.prototype.getNodeById = function(nodeId) {
	if (this.id == nodeId) {
		return this;
	} else if (this.children.length == 0) {
		return null;
	} else {
		var soFar = false;
		for (var i=0; i < this.children.length; i++) {
			soFar = soFar || this.children[i].getNodeById(nodeId);
		};
		return soFar;
	};
};

//alerts vital information about this node
Node.prototype.alertNodeInfo = function(where) {
	notificationManager.notify('node.js, ' + where + '\nthis.id:' + this.id 
			+ '\nthis.title:' + this.title, 3);
};


Node.prototype.preloadContent = function(){
	/* create and retrieve the baseHtmlContent if not already done */
	if(!this.baseHtmlContent){
		if(!this.selfRendering){
			this.baseHtmlContent = this.view.getHTMLContentTemplate(this);

			/* call one of the getContent methods so it retrieves the content */
			this.baseHtmlContent.getContentString();
		} else {
			/* create the content object */
			this.baseHtmlContent = createContent(this.view.getProject().makeUrl(this.content.getContentJSON().src, this));

			/* change filename url for the modules if this is a MySystemNode */
			if(this.type == 'MySystemNode'){
				this.baseHtmlContent.setContent(this.updateJSONContentPath(this.view.getConfig().getConfigParam('getContentBaseUrl'), this.baseHtmlContent.getContentString()));
			};

			/* call one of the getContent methods so it retrieves the content */
			this.baseHtmlContent.getContentString();
		};
	};

	/* call one of the nodes getContent methods so it retrieves the content */
	this.content.getContentJSON();
};

/**
 * Renders itself to the specified content panel
 */
Node.prototype.render = function(contentPanel, studentWork, disable) {
	this.studentWork = studentWork;
	
	/* clean up any disabled panel that might exist from previous render */
	this.disableInteractivity(false);
	
	/*check if the user had clicked on an outside link in the previous step
	 */
	if(this.handlePreviousOutsideLink(this, contentPanel)) {
		/*
		 * the user was at an outside link so the function
		 * handlePreviousOutsideLink() has taken care of the
		 * rendering of this node
		 */
		return;
	}

	/* if no content panel specified use default */
	if(contentPanel){
		/* make sure we use frame window and not frame element */
		this.contentPanel = window.frames[contentPanel.name];
	} else if(contentPanel == null) {
		/* use default ifrm */
		this.contentPanel = window.frames['ifrm'];
	}

	/* 
	 * if node is not self rendering which means it is a node that
	 * requires an html file and a content file
	 */
	if(!this.selfRendering){
		/*
		 * check to see if this contentpanel has already been rendered
		 * also check if loadContentAfterScriptsLoad is null, this happens
		 * if the step contained a link to the internet and the student
		 * clicked on the link to load the page from the internet
		 */
		if(this.contentPanel.nodeId!=this.id || this.contentPanel.loadContentAfterScriptsLoad == null){
			if(!this.baseHtmlContent){
				this.baseHtmlContent = this.view.getHTMLContentTemplate(this);
			}

			/* make nodeId available to the content panel, and hence, the html */
			this.contentPanel.nodeId = this.id;

			/* inject urls and write html to content panel */
			this.contentPanel.document.open();
			this.contentPanel.document.write(this.injectBaseRef(this.baseHtmlContent.getContentString()));
			this.contentPanel.document.close();
		} else {
			/* already rendered, just load content */
			this.contentPanel.loadContentAfterScriptsLoad(this);
		}
	} else {
		/* if baseHtmlContent has not already been created, create it now */
		if(!this.baseHtmlContent){
			this.baseHtmlContent = createContent(this.view.getProject().makeUrl(this.content.getContentJSON().src, this));

			/* change filename url for the modules if this is a MySystemNode */
			if(this.type == 'MySystemNode'){
				this.baseHtmlContent.setContent(this.updateJSONContentPath(this.view.getConfig().getConfigParam('getContentBaseUrl'), this.baseHtmlContent.getContentString()));
			}
		}

		//write the content into the contentPanel, this will render the html in that panel
		this.contentPanel.document.open();
		this.contentPanel.document.write(this.injectBaseRef(this.baseHtmlContent.getContentString()));
		this.contentPanel.document.close();
	}

	if(this.contentPanel != null) {
		//set the event manager into the content panel so the html has access to it
		this.contentPanel.eventManager = eventManager;
		this.contentPanel.nodeId = this.id;
		this.contentPanel.node = this;
		this.contentPanel.scriptloader = this.view.scriptloader;

		if(this.type == 'MySystemNode' || this.type == 'SVGDrawNode' || 
				this.type == 'OpenResponseNode' || this.type == 'HtmlNode' ||
				this.type == 'MWNode' || this.type == 'Box2dModelNode') {
			this.contentPanel.vle = this.view;
		}
	}

	/* if there is a disable constraint, we want to set a semi-transparent panel over the content div */
	if(disable==1){
		this.disableInteractivity(true);
	}

	if(this.view.config.getConfigParam('theme') == 'UCCP') {
		/*
		 * if this is a UCCP project then we will post the current step
		 * for BlueJ interaction purposes. we need to post the current step
		 * even when it is not a BlueJ step because we need to know when
		 * they are not on a BlueJ step.
		 */
		this.extraData = "";
		var blueJProjectPath = this.content.getContentJSON().blueJProjectPath;

		if(blueJProjectPath != null) {
			this.extraData = blueJProjectPath;
		}
		this.view.postCurrentStep(this);
	}
};

/**
 * Renders the student work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * 
 * @param displayStudentWorkDiv the div we will render the student work into
 * @param nodeVisit the student work
 * @param childDivIdPrefix (optional) a string that will be prepended to all the 
 * div ids use this to prevent DOM conflicts such as when the show all work div
 * uses the same ids as the show flagged work div
 * @param workgroupId the id of the workgroup this work belongs to
 */
Node.prototype.renderGradingView = function(displayStudentWorkDiv, nodeVisit, childDivIdPrefix, workgroupId) {
	// override by children
};

/**
 * Renders the summary of all students' work into the div. The grading tool will pass in a
 * div id to this function and this function will insert the student data
 * into the div.
 * @param workgroupIdToWork Object mapping from workgroupId to their work
 * @param dom DOM element to render the summary in
 *
 * @param workgroupIdToWork
 * @param dom where to render the summary view
 */
Node.prototype.renderSummaryView = function(workgroupIdToWork,dom) {
	// override by children
};

/**
 * Listens for page rendered event: the html has been fully loaded
 * and the event is fired from the page's window.onload function.
 */
Node.prototype.pageRenderCompletedListener = function(type, args, obj){

	/* args[0] is the id of node's page that has been rendered */
	if(obj.id==args[0] && !obj.selfRendering && obj.contentPanel && obj.contentPanel.loadContent){
		obj.contentPanel.loadContent(obj);
		obj.insertPreviousWorkIntoPage(obj.contentPanel.document);
	}
};

Node.prototype.loadContentAfterScriptsLoad = function(type, args, obj){
	if(obj.id==args[0]) {
		if (obj.contentPanel) {
			obj.contentPanel.loadContentAfterScriptsLoad(obj);		
		}
	}
};

/**
 * Listens for page content rendered complete event: the html has
 * been fully loaded as has the content and the event is fired from
 * the html's load content function.
 */
Node.prototype.contentRenderCompletedListener = function(type, args, obj){
	/* args[0] is the id of node's page that has been rendered */
	var nodeId = args[0];
	var node = obj.view.getProject().getNodeById(nodeId);
	if (node && node.i18nEnabled && args[0] == obj.id) {
		obj.view.insertTranslations(obj.getType());		
	}
};

/**
 * This is called when a node is exited
 */
Node.prototype.onExit = function() {
	//this function should be overridden by child classes
};

/**
 * Get the view style if the node is a sequence. If this node
 * is a sequence and no view style is defined, the default will
 * be the 'normal' view style.
 * @return the view style of the sequence or null if this
 * 		node is not a sequence
 */
Node.prototype.getView = function() {
	/*
	 * check that this node is a sequence.
	 */
	if(this.isSequence()) {
		if(this.json.view == null) {
			//return the default view style if none was specified
			return 'normal';
		} else {
			//return the view style for the sequence
			return this.json.view;
		}
	} else {
		//this node is not a sequence so we will return null
		return null;
	}
};

/**
 * Returns whether this node is a sequence node.
 */
Node.prototype.isSequence = function() {
	return this.type == 'sequence';
};

/**
 * Returns the appropriate object representation of this node
 */
Node.prototype.nodeJSON = function(contentBase){
	if(this.type=='sequence'){
		/* create and return sequence object */
		var sequence = {
				type:'sequence',
				identifier:this.id,
				title:this.title,
				view:this.getView(),
				tags:this.tags,
				tagMaps:this.tagMaps,
				refs:[],
				icons:this.icons
		};

		/* add children ids to refs */
		for(var l=0;l<this.children.length;l++){
			sequence.refs.push(this.children[l].id);
		};

		return sequence;
	} else {
		/* create and return node object */
		var node = {
				type:this.type,
				identifier:this.id,
				title:this.title,
				hints:this.hints,
				ref:this.content.getFilename(contentBase),
				previousWorkNodeIds:this.prevWorkNodeIds,
				populatePreviousWorkNodeId:this.populatePreviousWorkNodeId,
				tags:this.tags,
				tagMaps:this.tagMaps,
				links:this.links
		};

		//set the peerReview attribute if needed
		if(this.peerReview != null) {
			node.peerReview = this.peerReview;
		}

		//set the teacherReview attribute if needed
		if(this.teacherReview != null) {
			node.teacherReview = this.teacherReview;
		}

		//set the reviewGroup attribute if needed
		if(this.reviewGroup != null) {
			node.reviewGroup = this.reviewGroup;
		}

		//set the associatedStartNode attribute if needed
		if(this.associatedStartNode != null) {
			node.associatedStartNode = this.associatedStartNode;
		}

		//set the associatedAnnotateNode attribute if needed
		if(this.associatedAnnotateNode != null) {
			node.associatedAnnotateNode = this.associatedAnnotateNode;
		}
		
		//set the icons from the project content if needed
		if(this.icons != null) {
			node.icons = this.icons;
		}

		/* set class */
		node['class'] = this.className;

		return node;
	}
};

/**
 * This function is for displaying student work in the ticker.
 * All node types that don't implement this method will inherit
 * this function that just returns null. If null is returned from
 * this method, the ticker will just skip over the node when
 * displaying student data in the ticker.
 */
Node.prototype.getLatestWork = function(vle, dataId) {
	return null;
};

/**
 * Translates students work into human readable form. Some nodes,
 * such as mc and mccb require translation from identifiers to 
 * values, while other nodes do not. Each node will implement
 * their own translateStudentWork() function and perform translation
 * if necessary. This is just a dummy parent implementation.
 * @param studentWork the student's work, could be a string or array
 * @return a string of the student's work in human readable form.
 */
Node.prototype.translateStudentWork = function(studentWork) {
	return studentWork;
};

/**
 * Injects base ref in the head of the html if base-ref is not found, and returns the result
 * @param content
 * @return the content with the injected base ref
 */
Node.prototype.injectBaseRef = function(content) {
	if (content.search(/<base/i) > -1) {
		// no injection needed because base is already in the html
		return content;
	} else {
		// NATE did this...  to check for node specific base urls
		// var contentBaseUrl = "";
		var cbu = "";   

		if (this.ContentBaseUrl) {
			// NATE screwed with this also
			cbu = this.ContentBaseUrl;
		} else if(this.type == "HtmlNode") {
			//get the content base url e.g. "http://localhost:8080/curriculum/667/"
			if(this.view.authoringMode) {
				//we are in the step authoring mode 
				cbu = this.getAuthoringModeContentBaseUrl();
			} else {
				//we are in the student vle
				cbu = this.view.getConfig().getConfigParam('getContentBaseUrl');					
			}
		} else {
			//set the content base url to the step type folder path 

			//get the content url e.g. "node/openresponse/openresponse.html"
			var contentUrl = this.baseHtmlContent.getContentUrl();

			//get the content url path e.g. "node/openresponse"
			contentUrlPath = contentUrl.substring(0, contentUrl.lastIndexOf('/'));

			//get the window location e.g. "http://localhost:8080/vlewrapper/vle/vle.html"
			var loc = window.location.toString();

			//get the vle location e.g. "http://localhost:8080/vlewrapper/vle/"
			var vleLoc = loc.substring(0, loc.indexOf('/vle/')) + '/vle/';

			//create the base href path e.g. "http://localhost:8080/vlewrapper/vle/node/openresponse/"
			cbu = vleLoc + contentUrlPath + '/';
		}

		//add any missing html, head or body tags
		content = this.addMissingTags(content);

		//create the base tag
		var baseRefTag = "<base href='" + cbu + "'/>";

		//get the content in all lowercase
		var contentToLowerCase = content.toLowerCase();

		//get the index of the open head tag
		var indexOfHeadOpenTag = contentToLowerCase.indexOf("<head>");

		var newContent = "";

		//check if there is an open head tag
		if(indexOfHeadOpenTag != -1) {
			//insert the base tag after the head open tag
			newContent = this.insertString(content, indexOfHeadOpenTag + "<head>".length, baseRefTag);
		} else {
			newContent = content;
		}

		// check for tinymce flv embed instances, inject baseURI into any 'url' flashvars
		if(newContent.match('/vlewrapper/vle/jquery/tinymce/jscripts/tiny_mce/plugins/media/moxieplayer.swf')){
			newContent = newContent.replace(/url=assets/g,'url=' + cbu + 'assets');
		}

		//return the updated content
		return newContent;
	}
};

/**
 * Add any missing html, head or body tags
 * @param content the html content
 * @return the html content with html, head, and body tags inserted
 * if necessary
 */
Node.prototype.addMissingTags = function(content) {
	/*
	 * add tags in this order for simplicity
	 * <body>
	 * </body>
	 * <head>
	 * </head>
	 * <html>
	 * </html>
	 */

	//check if the content contains the body open tag
	if(!this.containsBodyOpenTag(content)) {
		/*
		 * get the content all in lower case so we can search for the positions of tags
		 * by comparing them to lower case tags
		 */
		var contentToLowerCase = content.toLowerCase();

		//get the index of the html open tag
		var indexOfHtmlOpenTag = contentToLowerCase.indexOf("<html>");

		//get the index of the head close tag
		var indexOfHeadCloseTag = contentToLowerCase.indexOf("</head>");

		if(indexOfHeadCloseTag != -1) {
			//head close tag was found so we will insert '<body>' right after it
			content = this.insertString(content, indexOfHeadCloseTag + "</head>".length, "<body>");
		} else if(indexOfHtmlOpenTag != -1) {
			/*
			 * head close tag was not found and html open tag was found so we will 
			 * insert '<body>' right after the html open tag
			 */
			content = this.insertString(content, indexOfHtmlOpenTag + "<html>".length, "<body>");
		} else {
			/*
			 * html open and head close tags were not found so we will just add '<body>'
			 * to the beginning of the content
			 */
			content = "<body>" + content;
		}
	}

	//check if the content contains the body close tag
	if(!this.containsBodyCloseTag(content)) {
		/*
		 * get the content all in lower case so we can search for the positions of tags
		 * by comparing them to lower case tags
		 */
		var contentToLowerCase = content.toLowerCase();

		//get the index of the html close tag
		var indexOfHtmlCloseTag = contentToLowerCase.indexOf("</html>");

		if(indexOfHtmlCloseTag != -1) {
			//html close tag was found so we will insert '</body>' right before it
			content = this.insertString(content, indexOfHtmlCloseTag, "</body>");
		} else {
			//html close tag was not found so we will just add '</body>' to the end of the content
			content = content + "</body>";
		}
	}

	//check if the content contains the head open tag
	if(!this.containsHeadOpenTag(content)) {
		/*
		 * get the content all in lower case so we can search for the positions of tags
		 * by comparing them to lower case tags
		 */
		var contentToLowerCase = content.toLowerCase();

		//get the index of the html open tag
		var indexOfHtmlOpenTag = contentToLowerCase.indexOf("<html>");

		if(indexOfHtmlOpenTag != -1) {
			//html open tag was found so we will insert '<head>' right after it
			content = this.insertString(content, indexOfHtmlOpenTag + "<html>".length, "<head>");
		} else {
			/*
			 * html open tag was not found so we will just add '<head>' to the
			 * beginning of the content
			 */
			content = "<head>" + content;			
		}
	}

	//check if the content contains the head close tag
	if(!this.containsHeadCloseTag(content)) {
		/*
		 * get the content all in lower case so we can search for the positions of tags
		 * by comparing them to lower case tags
		 */
		var contentToLowerCase = content.toLowerCase();

		//get the index of the body close tag (body open tag should always exist)
		var indexOfBodyOpenTag = contentToLowerCase.indexOf("<body>");

		if(indexOfBodyOpenTag != -1) {
			//we need to insert '</head>' right before the open body tag
			content = this.insertString(content, indexOfBodyOpenTag, "</head>");
		}
	}

	//check if the content contains the html open tag
	if(!this.containsHtmlOpenTag(content)) {
		//add the html open tag to the beginning of the content
		content = "<html>" + content;
	}

	//check if the content contains the html close tag
	if(!this.containsHtmlCloseTag(content)) {
		//add the html close tag to the end of the content
		content = content + "</html>";
	}

	return content;
};

/**
 * Insert a string into the content at the given position
 * @param content the html content
 * @param position the position to insert the string intot he content
 * @param stringToInsert the string to insert into the content
 * @return the content with the string inserted into it
 */
Node.prototype.insertString = function(content, position, stringToInsert) {
	//get everything before the position
	var beginning = content.substring(0, position);

	//get everything after the position
	var end = content.substring(position);

	//combine everything with the stringToInsert inbetween
	var newContent = beginning + stringToInsert + end;

	return newContent;
};

/**
 * Check if the tags in the array are all found in the content.
 * If one of the tags are not found, we will return false.
 * @param content the html content
 * @param tags an array of html tags to search for
 * @return true if we found all the tags, false if we are missing
 * any tag
 */
Node.prototype.containsTags = function(content, tags) {
	if(content != null) {
		//make the content lowercase so we can compare the lowercase tags
		var contentToLowerCase = content.toLowerCase();

		//loop through all the tags
		for(var x=0; x<tags.length; x++) {
			//get a tag
			var tag = tags[x];

			if(tag != null) {
				//make the tag lower case
				tag = tag.toLowerCase();

				//check if we found the tag 
				if(contentToLowerCase.indexOf(tag) == -1) {
					//we did not find the tag
					return false;
				}
			}
		}
	}

	//we found all the tags
	return true;
};

/**
 * Check if the content contains the open html tag
 * @param content the html content
 * @return whether the content contains the open html tag
 */
Node.prototype.containsHtmlOpenTag = function(content) {
	var htmlTags = ['<html>'];
	return this.containsTags(content, htmlTags);
};

/**
 * Check if the content contains the close html tag
 * @param content the html content
 * @return whether the content contains the close html tag
 */
Node.prototype.containsHtmlCloseTag = function(content) {
	var htmlTags = ['</html>'];
	return this.containsTags(content, htmlTags);
};

/**
 * Check if the content contains the open head tag
 * @param content the html content
 * @return whether the content contains the open head tag
 */
Node.prototype.containsHeadOpenTag = function(content) {
	var htmlTags = ['<head>'];
	return this.containsTags(content, htmlTags);
};

/**
 * Check if the content contains the close head tag
 * @param content the html content
 * @return whether the content contains the close head tag
 */
Node.prototype.containsHeadCloseTag = function(content) {
	var htmlTags = ['</head>'];
	return this.containsTags(content, htmlTags);
};

/**
 * Check if the content contains the open body tag
 * @param content the html content
 * @return whether the content contains the open body tag
 */
Node.prototype.containsBodyOpenTag = function(content) {
	var htmlTags = ['<body>'];
	return this.containsTags(content, htmlTags);
};

/**
 * Check if the content contains the close body tag
 * @param content the html content
 * @return whether the content contains the close body tag
 */
Node.prototype.containsBodyCloseTag = function(content) {
	var htmlTags = ['</body>'];
	return this.containsTags(content, htmlTags);
};

/**
 * Gets the contentBaseUrl for when the user is previewing a step using the authoring tool.
 * This is not used when the user is previewing the project in the authoring tool.
 * @return the contentBaseUrl from the vlewrapper
 */
Node.prototype.getAuthoringModeContentBaseUrl = function() {
	/*
	 * get the contentBaseUrl from the config param. it will look like this below
	 * e.g.
	 * http://localhost:8080/webapp/author/authorproject.html?forward=filemanager&projectId=96&command=retrieveFile&fileName=
	 */
	var contentBaseUrlString = this.view.getConfig().getConfigParam('getContentBaseUrl');

	var lastSlashIndex = -1;

	if(contentBaseUrlString) {
		if(contentBaseUrlString.charAt(contentBaseUrlString.length - 1) == '/') {
			/*
			 * the url ends with '/' so we want the index of the '/' before that
			 * e.g.
			 * .../curriculum/88/
			 *               ^
			 */
			lastSlashIndex = contentBaseUrlString.lastIndexOf('/', contentBaseUrlString.length - 2);
		} else {
			/*
			 * the url does not end with '/' so we want the index of the last '/' 
			 * e.g.
			 * .../curriculum/88
			 *               ^
			 */
			lastSlashIndex = contentBaseUrlString.lastIndexOf('/');
		}
	}

	var projectFolder = "";

	/*
	 * get the vlewrapper base url
	 * e.g.
	 * http://localhost:8080/curriculum
	 */
	var vlewrapperBaseUrl = "";

	if(this.view.vlewrapperBaseUrl) {
		vlewrapperBaseUrl = this.view.vlewrapperBaseUrl;
	}

	//try to get the project folder from the relativeProjectUrl
	if(this.view.relativeProjectUrl) {
		/*
		 * relativeProjectUrl should be the relative path of the project file
		 * from the curriculum folder
		 * e.g.
		 * /135/wise4.project.json
		 */

		var indexFirstSlash = this.view.relativeProjectUrl.indexOf('/');
		var indexSecondSlash = this.view.relativeProjectUrl.indexOf('/', indexFirstSlash + 1);

		/*
		 * get the project folder
		 * e.g.
		 * /135
		 */
		projectFolder = this.view.relativeProjectUrl.substring(0, indexSecondSlash);
	}

	//add a '/' at the end of the project folder if it doesn't end with '/'
	if(projectFolder.charAt(projectFolder.length - 1) != '/') {
		projectFolder += '/';
	}

	/*
	 * combine the vlewrapper base url and the project folder
	 * e.g.
	 * vlewrapperBaseUrl=http://localhost:8080/curriculum
	 * projectFolder=/135
	 * contentBaseUrl=http://localhost:8080/curriculum/135/
	 */
	var contentBaseUrl = vlewrapperBaseUrl + projectFolder;

	return contentBaseUrl;
};

/**
 * Returns whether this node is a leaf node
 */
Node.prototype.isLeafNode = function() {
	return this.type != 'sequence';
};


/**
 * This handles the case when the previous step has an outside link and 
 * the student clicks on it to load a page from a different host within
 * the vle. Then the student clicks on the next step in the vle. This
 * caused a problem before because the iframe would contain a page
 * from a different host and we would no longer be able to call functions
 * from it.
 * @param thisObj the node object we are navigating to
 * @param thisContentPanel the content panel to load the content into
 * 		this may be null
 * @return true if the student was at an outside link, false otherwise
 */
Node.prototype.handlePreviousOutsideLink = function(thisObj, thisContentPanel) {
	//check for ifrm to see if this is running from vle.html or someplace
	//other (such as authoring tool which does not have ifrm).
	if(!window.frames['ifrm']){
		return false;
	} else {
		try {
			/*
			 * try to access the host attribute of the ifrm, if the content
			 * loaded in the ifrm is in our domain it will not complain,
			 * but if the content is from another domain it will throw an
			 * error 
			 */
			window.frames["ifrm"].host;
		} catch(err) {
			//content was from another domain

			/*
			 * call back() to navigate back to the htmlnode page that contained
			 * the link the student clicked on to access an outside page
			 */
			history.back();

			//call render to render the node we want to navigate to
			setTimeout(function() {thisObj.render(thisContentPanel, thisObj.studentWork);}, 500);

			/*
			 * tell the caller the student was at an outside link so
			 * they don't need to call render()
			 */
			return true;
		}

		//tell the caller the student was not at an outside link
		return false;
	};
};

/**
 * If this node has previous work nodes, grabs the latest student
 * data from that node and inserts it into this nodes page
 * for each referenced node id. Assumes that the html is already loaded
 * and has a div element with id of 'previousWorkDiv'.
 * 
 * @param doc
 */
Node.prototype.insertPreviousWorkIntoPage = function(doc){
	//only do anything if there is anything to do
	if(this.prevWorkNodeIds != null && this.prevWorkNodeIds.length>0){
		var html = '';

		//loop through and add any previous work to html
		for(var n=0;n<this.prevWorkNodeIds.length;n++){
			if(this.view.getState() != null) {
				var work = this.view.getState().getLatestWorkByNodeId(this.prevWorkNodeIds[n]);
				if(work){
					//get the node object
					var node = this.view.getProject().getNodeById(this.prevWorkNodeIds[n]);

					//get the step number and title e.g. "Step 1.3: Explain why the sun is hot"
					var stepNumberAndTitle = this.view.getProject().getStepNumberAndTitle(node.id);

					if(typeof work == "string") {
						//replace all \n with <br>
						work = work.replace(/\n/g, '<br>');
					} else {
						//get the html view for the work
						work = node.getStudentWorkHtmlView(work);
					}

					//display the previous work step number and title along with the work
					html += 'Remember, your work from "Step ' + stepNumberAndTitle + '" was<br>' + work + '</br></br>';
				};
			}
		};

		//add reminders to this node's html if div exists
		var prevWorkDiv = doc.getElementById('previousWorkDiv');
		if(prevWorkDiv){
			if(html != null && html != "") {
				prevWorkDiv.innerHTML = html;

				//make the div visible
				prevWorkDiv.style.display = "block";
			}
		};
	};
};

/**
 * Given the full @param path to the project (including project filename), duplicates 
 * this node and updates project file on server. Upon successful completion, runs the 
 * given function @param done and notifies the user if the given @param silent is not true.
 * 
 * NOTE: It is up to the caller of this function to refresh the project after copying.
 * 
 * @param done - a callback function
 * @param silent - boolean, does not notify when complete if true
 * @param path - full project path including project filename
 */
Node.prototype.copy = function(eventName, project){
	/* success callback */
	var successCreateCallback = function(text,xml,o){
		/* fire event with arguments: event name, [initial node id, copied node id] */
		o[0].view.eventManager.fire(o[1],[o[0].id,text]);
	};

	/* failure callback */
	var failureCreateCallback = function(obj, o){
		/* fire event with initial node id as argument so that listener knows that copy failed */
		o[0].view.eventManager.fire(o[1],o[0].id);
	};

	if(this.type!='sequence'){
		/* copy node section */
		var project = this.view.getProject();

		if(this.type=='HtmlNode' || this.type=='DrawNode' || this.type=='MySystemNode'){
			var contentFile = this.content.getContentJSON().src;
		} else {
			var contentFile = '';
		};

		if(this.type=='MySystemNode'){
			this.view.notificationManager.notify('My System Nodes cannot be copied, ignoring', 3);
			this.view.eventManager.fire(eventName,[this.id, null]);
			return;
		};

		var contentString = encodeURIComponent(this.content.getContentString());

		/*
		 * get the project file name
		 * e.g.
		 * /wise4.project.json
		 */
		var projectFileName = this.view.utils.getContentPath(this.view.authoringBaseUrl,project.getUrl());

		this.view.connectionManager.request('POST', 1, this.view.requestUrl, {forward:'filemanager', projectId:this.view.portalProjectId, command:'copyNode', projectFileName: projectFileName, data: contentString, type: this.type, title: project.generateUniqueTitle(this.title), nodeClass: this.className, contentFile: contentFile}, successCreateCallback, [this,eventName], failureCreateCallback);
	} else {
		/* copy sequence section */

		/* listener that listens for the event when all of its children have finished copying 
		 * then copies itself and finally fires the event to let other listeners know that it
		 * has finished copying */
		var listener = function(type,args,obj){
			if(args[0]){
				var idList = args[0];
			} else {
				var idList = [];
			};

			if(args[1]){
				var  msg = args[1];
			} else {
				var msg = '';
			};

			var node = obj[0];
			var eventName = obj[1];
			var project = node.view.getProject();

			var seqJSON = {
					type:'sequence',
					identifier: project.generateUniqueId(node.id),
					title: project.generateUniqueTitle(node.title),
					view: node.getView(),
					refs:idList
			};

			/*
			 * get the project file name
			 * e.g.
			 * /wise4.project.json
			 */
			var projectFileName = node.view.utils.getContentPath(node.view.authoringBaseUrl,node.view.getProject().getUrl());

			node.view.connectionManager.request('POST', 1, node.view.requestUrl, {forward:'filemanager',projectId:node.view.portalProjectId, command: 'createSequenceFromJSON', projectFileName: projectFileName, data: $.stringify(seqJSON)}, successCreateCallback, [node,eventName], failureCreateCallback);
		};

		/* set up event to listen for when this sequences children finish copying */
		var seqEventName = this.view.getProject().generateUniqueCopyEventName();
		this.view.eventManager.addEvent(seqEventName);
		this.view.eventManager.subscribe(seqEventName, listener, [this, eventName]);

		/* collect children ids in an array */
		var childIds = [];
		for(var w=0;w<this.children.length;w++){
			childIds.push(this.children[w].id);
		};

		/* process by passing childIds and created event name to copy in project */
		this.view.getProject().copyNodes(childIds, seqEventName);
	};
};

/**
 * Handles Smart Filtering in the grading tool for this Node.
 * Child nodes should override this function.
 * @return true iff this node handles smart filtering
 */
Node.prototype.showSmartFilter = function(doShow) {
	return false;
};

/**
 * Create the div that will display the student work for this step
 * @param vle
 * @param divIdPrefix a string to be prepended to the div that contains
 * the student work. this is used to avoid div id conflicts. this
 * argument is optional and will default to ""
 * @return the html for this node to be displayed in the show all work
 * some nodes just return a div that is later populated
 */
Node.prototype.getShowAllWorkHtml = function(vle, divIdPrefix){
	var showAllWorkHtmlSoFar = "";

	if(divIdPrefix == null) {
		divIdPrefix = "";
	}

	//get the latest node visit that has work
	var latestNodeVisitWithWork = vle.getState().getLatestNodeVisitByNodeId(this.id, false);
	
	//get the latest node visit
	var latestNodeVisit = vle.getState().getLatestNodeVisitByNodeId(this.id, true);
	
	if(latestNodeVisit == null && latestNodeVisitWithWork == null) {
		//the student has not visited the step

		var you_havent_visited_this_step = vle.getI18NString('you_havent_visited_this_step');
		showAllWorkHtmlSoFar += "<p class='info'>" + you_havent_visited_this_step + "</p>";
	} else if(latestNodeVisit != null && latestNodeVisitWithWork == null) {
		//the student has visited the step but has not submitted any work

		//show the last visited time stamp
		var last_visited_on = vle.getI18NString('last_visited_on');
		showAllWorkHtmlSoFar += "<p class='info lastVisit'>" + last_visited_on + " ";
		showAllWorkHtmlSoFar += "" + new Date(parseInt(latestNodeVisit.visitStartTime)).toLocaleString() + "</p>";
		
		//show a message that says they have not submitted work for the step yet
		var you_havent_submitted_work_for_this_step = vle.getI18NString('you_havent_submitted_work_for_this_step');
		showAllWorkHtmlSoFar += "<p class='info'>" + you_havent_submitted_work_for_this_step + "</p>";
	} else if(latestNodeVisit != null && latestNodeVisitWithWork != null) {
		//the student has submitted work for the step
		
		//show the last visited time stamp
		var last_visited_on = vle.getI18NString('last_visited_on');
		showAllWorkHtmlSoFar += "<p class='info lastVisit'>" + last_visited_on + " ";
		showAllWorkHtmlSoFar += "" + new Date(parseInt(latestNodeVisit.visitStartTime)).toLocaleString() + "</p>";
		
		//get the latest state
		var latestState = latestNodeVisitWithWork.getLatestState();
		
		if(latestState!=null) {
			var divClass = "showallLatestWork";
			var divStyle = "";
			if (this.type == "MySystemNode") {
				divClass = "mysystem";
				divStyle = "height:350px";
			}
			if (this.type == "SVGDrawNode") {
				divClass = "svgdraw";
				//divStyle = "height:300px; width:375px; border:1px solid #aaa";
				divStyle = "width:375px; border:1px solid #aaa";
			} 
			//create the div id for where we will display the student work
			var divId = divIdPrefix + "latestWork_"+latestNodeVisitWithWork.id;
			var contentBaseUrl = this.view.getConfig().getConfigParam('getContentBaseUrl');

			var latest_work = vle.getI18NString('latest_work');
			
			if(this.type == "MySystemNode") {
				showAllWorkHtmlSoFar += '<div class=\"showallLatest\">' + latest_work + ':' + '</div>' + 
				'<div id=\"'+divId+'\" contentBaseUrl=\"'+contentBaseUrl+'\" class=\"'+divClass+'\" style=\"'+divStyle+'\">' + this.translateStudentWork(latestState.getStudentWork()) + '</div>';
			} else if(this.hasGradingView()) {
				showAllWorkHtmlSoFar += '<div class=\"showallLatest\">' + latest_work + ':' + '</div>' + 
				'<div id=\"'+divId+'\" contentBaseUrl=\"'+contentBaseUrl+'\" class=\"'+divClass+'\" style=\"'+divStyle+'\"></div>';
			} else {
				showAllWorkHtmlSoFar += '<div class=\"showallLatest\">' + latest_work + ':' + '</div>' + 
				'<div id=\"'+divId+'\" contentBaseUrl=\"'+contentBaseUrl+'\" class=\"'+divClass+'\" style=\"'+divStyle+'\">' + this.translateStudentWork(latestState.getStudentWork()) + '</div>';
			}
		}
	}

	for (var i = 0; i < this.children.length; i++) {
		showAllWorkHtmlSoFar += this.children[i].getShowAllWorkHtml();
	}
	return showAllWorkHtmlSoFar;
};

/**
 * Inserts the keystroke manager script location into the given html content and returns it.
 */
Node.prototype.injectKeystrokeManagerScript = function(contentStr){
	var loc = window.location.toString();
	var keystrokeLoc = '<script type="text/javascript" src="' + loc.substring(0, loc.indexOf('/vle/')) + '/vle/util/keystrokemanager.js"></script></head>';

	return contentStr.replace('</head>', keystrokeLoc);
};

/**
 * Creates the keystroke manager for the individual node's content panel
 */
Node.prototype.createKeystrokeManager = function(){
	if(this.contentPanel && !this.contentPanel.keystrokeManager && this.contentPanel.createKeystrokeManager){
		this.contentPanel.keystrokeManager = this.contentPanel.createKeystrokeManager(this.contentPanel.eventManager,[]);
	};
};

/**
 * Handles the link request to link to another node. Checks to ensure that the
 * linked node still exists in the project and then calls vle render if it does.
 * 
 * @param linkId
 */
Node.prototype.linkTo = function(key){
	var link = this.getLink(key);
	if(link == null){
		this.view.notificationManager.notify('Could not find link to step, aborting operation.',3);
		return;
	};

	var nodePosition = link.nodePosition;
	var nodeIdentifier = link.nodeIdentifier;
	if(nodePosition == null && nodeIdentifier == null){
		this.view.notificationManager.notify('Could not find step specified in link, aborting operation.',3);
	} else {
		if (nodePosition != null) {
			var node = this.view.getProject().getNodeByPosition(nodePosition);
		} else {
			var node = this.view.getProject().getNodeById(nodeIdentifier);
			nodePosition = this.view.getProject().getPositionById(node.id);
		}
		if(!node){
			this.view.notificationManager.notify('Could not retrieve the step specified in the link.',3);
		} else if(this.view.name != 'student'){
			this.view.notificationManager.notify('The link works. The step ' + node.title + ' will be displayed when the project is run.',3);
		} else {
			this.view.renderNode(nodePosition);
		}
	}
};

/**
 * Returns the link object associated with the given key if an
 * object with that key exists, returns null otherwise.
 * 
 * @param key
 * @return object || null
 */
Node.prototype.getLink = function(key){
	/* cycle through the links to find the associated key */
	for(var b=0;b<this.links.length;b++){
		if(this.links[b].key==key){
			return this.links[b];
		}
	}

	return null;
};

/**
 * Adds the given link the this node's link array.
 * 
 * @param link
 */
Node.prototype.addLink = function(link){
	this.links.push(link);
};

/**
 * Returns the class for this node.
 */
Node.prototype.getNodeClass = function(){
	return this.className;
};

/**
 * Sets the className for this node.
 * 
 * @param className
 */
Node.prototype.setNodeClass = function(className){
	this.className = className;
};

/**
 * Returns this node.
 */
Node.prototype.getNode = function(){
	return this;
};

/**
 * Does this node support audio playback?
 */
Node.prototype.isAudioSupported = function(){
	return true;
};

/**
 * Set the step boolean value open to true
 */
Node.prototype.setStepOpen = function() {
	this.isStepOpen = true;
};

/**
 * Set the step boolean value open to false
 */
Node.prototype.setStepClosed = function() {
	this.isStepOpen = false;
};

/**
 * Get whether the step is open or not
 * @return a boolean value whether the step is open or not
 */
Node.prototype.isOpen = function() {
	return this.isStepOpen;
};

/**
 * Set the step boolean value completed to true
 */
Node.prototype.setCompleted = function() {
	this.isStepCompleted = true;
};

/**
 * Set the step boolean value completed to false
 */
Node.prototype.setNotCompleted = function() {
	this.isStepCompleted = false;
};

/**
 * Determine whether the student has completed the step or not
 * This function should be overridden by child classes if the
 * child class requires more precise checking.
 * @param nodeVisits an array of node visits for the step
 * @return whether the student has completed the step or not
 */
Node.prototype.isCompleted = function(nodeVisits) {
	var result = false;

	if(nodeVisits != null && nodeVisits.length > 0) {
		result = true;
	}

	return result;
};

/**
 * Get whether the step overrides Node.isCompleted or not
 * @return a boolean value whether there is an override function or not
 */
Node.prototype.overridesIsCompleted = function() {
	return false;
};

/**
 * Set the step boolean value part of review sequence to true
 */
Node.prototype.setIsPartOfReviewSequence = function() {
	this.isStepPartOfReviewSequence = true;
};

/**
 * Set the step boolean value part of review sequence to false
 */
Node.prototype.setIsNotPartOfReviewSequence = function() {
	this.isStepPartOfReviewSequence = false;
};

/**
 * Get whether the step is part of a review sequence or not
 * @return a boolean value whether the step is part of a 
 * review sequence or not
 */
Node.prototype.isPartOfReviewSequence = function() {
	return this.isStepPartOfReviewSequence;
};

/**
 * Get whether the node has any exit restrictions set
 * @returns Boolean whether the step can exit or not
 */
Node.prototype.canExit = function() {
	return true;
};

/**
 * Get the html view for the given student work. This function
 * should be implemented by child classes.
 * @returns a string with the html that will display
 * the student work for this step
 */
Node.prototype.getStudentWorkHtmlView = function(work) {
	return "";
};

/**
 * Process the student work to determine if we need to display
 * anything special or perform any additional processing.
 * For example this can be used to process the student work and
 * determine whether to display a bronze, silver, or gold
 * star next to the step in the navigation menu. Each step
 * type will need to implement this function on their own.
 * 
 * @param nodeVisits the node visits for this step to look at to determine
 * if anything special needs to occur.
 */
Node.prototype.processStudentWork = function(nodeVisits) {
	if(nodeVisits != null) {
		if(nodeVisits.length > 0) {
			//the student has visited this step
			this.setStatus('isVisited', true);
			
			//the student has completed this step
			this.setStatus('isCompleted', true);
		}
	}
};

/**
 * Get the tag map function objects that are available for the
 * step. Each child class should overwrite this function if they
 * make use of tags. A tag map function object should contain
 * 3 fields.
 * 
 * tagName (string)
 * functionName (string)
 * functionArgs (array of strings)
 * 
 * @return an array containing the tag map functions
 */
Node.prototype.getTagMapFunctions = function() {
	return this.tagMapFunctions;
};

/**
 * Handle any processing before creating the node navigation html.
 */
Node.prototype.onBeforeCreateNavigationHtml = function() {
	// to be overriden by child nodes
};

/**
 * Get a tag map function given the function name.
 * @param functionName the name of the function
 * @returns a tag map object
 */
Node.prototype.getTagMapFunctionByName = function(functionName) {
	var fun = null;

	//get all the tag map function for this step type
	var tagMapFunctions = this.getTagMapFunctions();

	//loop through all the tag map functions
	for(var x=0; x<tagMapFunctions.length; x++) {
		//get a tag map function
		var tagMapFunction = tagMapFunctions[x];

		if(tagMapFunction != null) {

			//check if the function name matches
			if(functionName == tagMapFunction.functionName) {
				//the function name matches so we have found what we want
				fun = tagMapFunction;
				break;
			}			
		}
	};

	return fun;
};

/**
 * Whether this step type has a grading view. Steps that do not save
 * any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode. Steps types that do not have a grading view 
 * should override this function and return false.
 * @returns whether this step type has a grading view
 */
Node.prototype.hasGradingView = function() {
	return true;
};

/**
 * Whether this step type has a summary view. Steps that do not save
 * any student work will not have a grading view such as HTMLNode
 * and OutsideUrlNode. Steps types that do not have a grading view 
 * should override this function and return false.
 * @returns whether this step type has a grading view
 */
Node.prototype.hasSummaryView = function() {
	return true;
};

/**
 * Whether this step has auto graded fields to display in the
 * grading tool
 * @returns whether this step has auto graded fields
 */
Node.prototype.hasAutoGradedFields = function() {
	return false;
};

/**
 * Get the auto graded fields
 * @returns an array that contains the auto graded fields
 */
Node.prototype.getAutoGradedFields = function() {
	return [];
};

/**
 * Returns true iff this node can import work from the specified node.
 * @param exportToNode node to export work into
 * @return true/false
 */
Node.prototype.canImportWork = function(importFromNode) {
	return this.importableFromNodes &&
	this.importableFromNodes.indexOf(importFromNode.type) > -1;
};

/**
 * Process any constraints in the node based on state
 */
Node.prototype.processStateConstraints = function() {
	// to be overriden by child nodes
};

/**
 * Returns whether this step type can be special exported
 * @return a boolean value
 */
Node.prototype.canSpecialExport = function() {
	return false;
};

/**
 * Get the node ids that this step is importing work from
 */
Node.prototype.getNodeIdsImportingFrom = function() {
	var nodeIds = [];
	
	//the tag maps
	var tagMaps = this.tagMaps;
	
	//check if there are any tag maps
	if(tagMaps != null) {
		
		//loop through all the tag maps
		for(var x=0; x<tagMaps.length; x++) {
			
			//get a tag map
			var tagMapObject = tagMaps[x];
			
			if(tagMapObject != null) {
				//get the variables for the tag map
				var tagName = tagMapObject.tagName;
				var functionName = tagMapObject.functionName;
				var functionArgs = tagMapObject.functionArgs;
				
				if(functionName == "importWork") {
					//this is an importWork function
					
					//get all the tagged steps
					var taggedNodeIds = this.view.getProject().getPreviousNodeIdsByTag(tagName, this.id);
					
					//loop through all the tagged steps
					for(var y=0; y<taggedNodeIds.length; y++) {
						//get a node id
						var nodeId = taggedNodeIds[y];
						
						if(nodeId != null) {
							//get the node
							var node = this.view.getProject().getNodeById(nodeId);
							
							if(node != null) {
								nodeIds.push(nodeId);								
							}
						}
					}
				}
			}
		}
	}
	
	return nodeIds;
};

/**
 * Get the latest node state from all the steps with the given tag
 * @param tagName the tag for the step(s) we want to import work from
 * @param functionArgs the arguments for this tag map function
 * @returns an array of node state objects that contains node states
 * from the steps we want to import work from
 */
Node.prototype.getWorkToImport = function(tagName, functionArgs) {
	//default values for the importWork
	var workToImport = [];

	//the node ids of the steps that come before the current step and have the given tag
	var nodeIds = this.view.getProject().getPreviousNodeIdsByTag(tagName, this.id);

	if(nodeIds != null) {
		//loop through all the node ids that come before the current step and have the given tag
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];

			if(nodeId != null) {
				//get the node
				var node = this.view.getProject().getNodeById(nodeId);

				if(node != null) {
					//get the latest work for the node
					var nodeState = this.view.getState().getLatestWorkByNodeId(nodeId);

					if(nodeState != null && nodeState != '') {
						//add the work to the array of work to import
						workToImport.push(nodeState);
					}
				}
			}
		}
	}

	return workToImport;
};

/**
 * Returns the criteria value for this node based on student response.
 */
Node.prototype.getCriteriaValue = function() {
	// to be overridden by children nodes
};

/**
 * Show the previous work for all the steps with the given tag
 * @param previousWorkDiv the div that we will display all the previous work in
 * @param tagName we will get all the steps with the given tag and
 * display work from them
 * @param functionArgs the arguments to this tag map function
 */
Node.prototype.showPreviousWork = function(previousWorkDiv, tagName, functionArgs) {
	//the node ids of the steps that come before the current step and have the given tag
	var nodeIds = this.view.getProject().getPreviousNodeIdsByTag(tagName, this.id);

	//the signed in workgroup id
	var workgroupId = this.view.userAndClassInfo.getWorkgroupId();

	//clear out the previous work div
	previousWorkDiv.html('');

	if(nodeIds != null) {
		//loop through all the node ids that come before the current step and have the given tag
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];

			if(nodeId != null) {
				//get the node object for the step we will retrieve work from
				var node = this.view.getProject().getNodeById(nodeId);

				//get the step number and title e.g. "Step 1.3: Explain why the sun is hot"
				var stepNumberAndTitle = this.view.getProject().getStepNumberAndTitle(nodeId);

				if(node != null) {
					//get the latest work for the node
					var nodeVisit = this.view.getState().getLatestNodeVisitByNodeId(nodeId);

					//make the id for the div that we will show previous work in for the step
					var showPreviousWorkDivId = 'showPreviousWork_' + nodeId;

					//create the div to display the work for the step
					var showPreviousWorkForNodeDiv = $('<div id="' + showPreviousWorkDivId + '"></div>');

					//put the div into the parent previous work div
					previousWorkDiv.append(showPreviousWorkForNodeDiv);

					if(nodeVisit != null) {
						//render the grading view
						node.renderGradingView(showPreviousWorkForNodeDiv, nodeVisit, null, workgroupId);
					}

					//add a header so the student can tell what step the work was from
					showPreviousWorkForNodeDiv.prepend('Your work from Step ' + stepNumberAndTitle + ' was<br>');

					//make the show previous work div visible
					previousWorkDiv.show();
				}
			}
		}
	}
};

/**
 * Show the aggregate work for all the steps with the given tag. Show it in the aggregateWorkDiv.
 * @param aggregateWorkDiv the div that we will display all the aggregate work in
 * @param tagName we will get all the steps with the given tag and
 * display work from them
 * @param functionArgs the arguments to this tag map function
 */
Node.prototype.showAggregateWork = function(aggregateWorkDiv, tagName, functionArgs) {
	//the node ids of the steps that come before the current step and have the given tag
	var nodeIds = this.view.getProject().getPreviousNodeIdsByTag(tagName, this.id);

	//the signed in workgroup id
	var workgroupId = this.view.userAndClassInfo.getWorkgroupId();

	//clear out the aggregate work div
	aggregateWorkDiv.html('');
	
	var periodAll = functionArgs[0];  // are we showing just the data of students in the period, or for all periods? period=period only, all=all periods
	var showAllStudents = false;
	if (periodAll == "all") {
		showAllStudents = true;
	}
	var graphType = functionArgs[1];  // bar|pie|barpie
	
	if(nodeIds != null) {
		//loop through all the node ids that come before the current step and have the given tag
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];

			if(nodeId != null) {
				//get the node object for the step we will retrieve work from
				var node = this.view.getProject().getNodeById(nodeId);

				//get the step number and title e.g. "Step 1.3: Explain why the sun is hot"
				var stepNumberAndTitle = this.view.getProject().getStepNumberAndTitle(nodeId);

				if(node != null) {
					//get the latest work for the node
					var nodeVisit = this.view.getState().getLatestNodeVisitByNodeId(nodeId);

					//make the id for the div that we will show previous work in for the step
					var showAggregateWorkDivId = 'showAggregateWork_' + nodeId;

					//create the div to display the work for the step
					var showAggregateWorkForNodeDiv = $('<div id="' + showAggregateWorkDivId + '"></div>');

					//put the div into the parent previous work div
					aggregateWorkDiv.append(showAggregateWorkForNodeDiv);

					if (this.view.getConfig().getConfigParam("mode") != "run") {
						// if not in run mode, show each of the step titles and also say that aggregate will show up when a run is set up
						showAggregateWorkForNodeDiv.append(this.view.getI18NStringWithParams("student_aggregate_view_preview_mode_default_text",[stepNumberAndTitle]));
						//make the show aggregate work div visible
						aggregateWorkDiv.show();
					} else {
						showAggregateWorkForNodeDiv.prepend(this.view.getI18NStringWithParams("student_aggregate_view_intro_text", [stepNumberAndTitle]));
						
						// callback for when classmates' work has been returned.
						function getClassmateResponsesCallback(responseText, responseXML, handlerArgs) {
							var nodeIdOfAggregateWork = handlerArgs.nodeId;
							var vle = handlerArgs.vle;
							var nodeOfAggregateWork = vle.getProject().getNodeById(nodeIdOfAggregateWork);
							var aggregateWorkDiv = handlerArgs.aggregateWorkDiv;

							var vleStates = VLE_STATE.prototype.parseDataJSONString(responseText);
							var workgroupIdToWork = {}; // maps workgroupId to their latest work.
							
							if(vleStates.constructor.toString().indexOf("Array") == -1) {
								/*
								 * if there is only one student in the run, we will need to place the vleState
								 * in an array because if we only request the work for a single workgroup id
								 * the server will return a JSONObject. if we request the work for multiple
								 * workgroup ids, the server will return a JSONArray.
								 */
								vleStates = [vleStates];
							}

							//loop through all the vleStates, each vleState is for a workgroup
							for(var x=0; x<vleStates.length; x++) {
								//get a vleState
								var vleState = vleStates[x];

								//get the workgroup id
								var workgroupId = vleState.dataId;

								//get the revisions
								var nodeVisitRevisions = vleState.getNodeVisitsWithWorkByNodeId(nodeId);

								var latestNodeVisit = null;

								if(nodeVisitRevisions.length > 0) {
									//get the latest work for the current workgroup
									latestNodeVisit = nodeVisitRevisions[nodeVisitRevisions.length - 1];
								}

								//check if the student submitted any work, and add to workgroupIdToWork array
								if(latestNodeVisit != null) {
									workgroupIdToWork[workgroupId] = latestNodeVisit.getLatestWork();
								}
							}
							// now tell the Node to render the summary view.
							nodeOfAggregateWork.renderSummaryView(workgroupIdToWork, aggregateWorkDiv, graphType, showAllStudents);
						};
						
						// make the request to get student work for this specific nodeId.
						this.view.connectionManager.request(
								'GET', 
								2, 
								this.view.config.getConfigParam('getStudentDataUrl'), 
								{
									type: 'aggregate', 
									periodId: this.view.userAndClassInfo.getPeriodId(), 
									userId: this.view.userAndClassInfo.getWorkgroupId() + ":" + this.view.userAndClassInfo.getClassmateIdsByPeriodId(this.view.userAndClassInfo.getPeriodId()), 
									runId:  this.view.config.getConfigParam('runId'), 
									nodeIds: nodeId,
									allStudents: showAllStudents,
									useCachedWork:false
								}, 
								getClassmateResponsesCallback, 
								{
									vle: this.view,
									nodeId: nodeId,
									aggregateWorkDiv: aggregateWorkDiv
								}
						);
					}
				}
			}
		}
	}
};

/**
 * Get the feedback that will be displayed when the student clicks
 * on the Feedback button at the upper right of the vle. Child
 * classes will need to override this to make use of it. This will
 * take precedence over teacher score and comment feedback.
 */
Node.prototype.getFeedback = function() {
	return null;
};

/**
 * Get the step icon to display determined by the step's statuses.
 * 
 * @param icons (optional) the icons array that contains the mappings
 * of icon path to statuses. if this parameter is not passed in, we will
 * use the icons from the node.
 * @param statuses (optional) the statuses to determine what step icon
 * to display. if this parameter is not passed in, we will use the
 * statuses from the node.
 * 
 * @return the icon path for the given statuses. it will return the first
 * icon that matches.
 */
Node.prototype.getIconPathForStatuses = function(icons, statuses) {
	var iconPath = null;
	
	//use the icons from this node if none were passed in
	if(icons == null) {
		icons = this.icons;
	}
	
	//use the statuses from this node if none were passed in
	if(statuses == null) {
		statuses = this.statuses;
	}
	
	if(icons != null) {
		//loop through all the icons
		for(var x=0; x<icons.length; x++) {
			//get an icon object
			var icon = icons[x];
			
			//get the icon path
			var tempIconPath = icon.iconPath;
			
			//get the statuses that need to be satisfied
			var tempStatuses = icon.statuses;
			
			//check if the statuses match
			if(this.statusesMatch(tempStatuses, statuses)) {
				//the statuses match so we will return the icon path
				iconPath = tempIconPath;
				break;
			}
		}
	}
	
	return iconPath;
};

/**
 * Check if the statuses satisfy the requirements
 * 
 * @param statusesToSatisfy the status values that need to be satisfied
 * @param statuses (optional) the statuses that we will look at to see if
 * they satisfy the required values. if this parameters is not provided
 * we will just use the statuses from the node.
 * 
 * @return whether the statuses from the step satisfy the requirements
 */
Node.prototype.statusesMatch = function(statusesToSatisfy, statuses) {
	//use the statuses from this node if none were passed in
	if(statuses == null) {
		statuses = this.statuses;
	}
	
	var result = false;
	var initializedResult = false;
	
	//loop through all the status values that we need to satisfy
	for(var x=0; x<statusesToSatisfy.length; x++) {
		var tempResult = false;
		
		//get a status object that needs to be satisfied
		var tempStatusMapping = statusesToSatisfy[x];
		var tempNodeId = tempStatusMapping.nodeId;
		var tempStatusType = tempStatusMapping.statusType;
		var tempStatusValueToSatisfy = tempStatusMapping.statusValue;
		
		//get the node whose status we need to look at
		var tempNode = this.view.getProject().getNodeById(tempNodeId);
		
		//get the status value for the node
		var tempNodeStatusValue = tempNode.getStatus(tempStatusType);
		
		//check if the value satisfies the requirement
		if(tempNode.isStatusValueSatisfied(tempStatusType, tempNodeStatusValue, tempStatusValueToSatisfy)) {
			tempResult = true;
		} else {
			tempResult = false;
		}
		
		if(initializedResult) {
			//this is not the first iteration of the for loop so we will accumulate the result value with && logic
			result = result && tempResult;
		} else {
			//this is the first iteration of the for loop so we will initialize the result value
			result = tempResult;
			initializedResult = true;
		}
	}
	
	return result;
};

/**
 * Check if the status value satisfies the requirement
 * 
 * @param statusValue the status value of the node
 * @param statusValueToSatisfy the status requirement
 * 
 * @return whether the status value satisfies the requirement
 */
Node.prototype.isStatusValueSatisfied = function(statusType, statusValue, statusValueToSatisfy) {
	var result = false;
	
	if(statusValue + '' == statusValueToSatisfy + '') {
		//the status matches the required value
		result = true;
	} else if(this.matchesSpecialStatusValue(statusType, statusValue, statusValueToSatisfy)) {
		result = true;
	}
	
	return result;
};

/**
 * Determines if a status value satisfies the status value to satisfy
 * 
 * @param statusValue the status value for the node e.g. 'surgeMedal'
 * @param statusValueToSatisfy the status value to satisfy e.g. 'atLeastBronze'
 * @param specialStatusValues (optional) the special status. this is
 * usually the special status values from a child step.
 * 
 * @return whether the status value satisfies the status value to satisfy
 */
Node.prototype.matchesSpecialStatusValue = function(statusType, statusValue, statusValueToSatisfy, specialStatusValues) {
	//use the special status values from the generic node if none were passed in
	if(specialStatusValues == null) {
		specialStatusValues = Node.specialStatusValues;
	}
	
	//loop through all the special status values
	for(var x=0; x<specialStatusValues.length; x++) {
		//get a special status value
		var tempSpecialStatusValue = specialStatusValues[x];
		
		if(tempSpecialStatusValue != null) {
			//get the status type e.g. 'surgeMedal'
			var tempStatusType = tempSpecialStatusValue.statusType;
			
			//get the status value e.g. 'atLeastBronze'
			var tempStatusValue = tempSpecialStatusValue.statusValue;
			
			//get the possible actual status values that will satisfy the tempStatusValue e.g. ['bronze', 'silver', 'gold']
			var tempPossibleStatusValues = tempSpecialStatusValue.possibleStatusValues;
			
			//check that the status types match and the status values match
			if(statusType == tempStatusType && statusValueToSatisfy == tempStatusValue) {
				//we have found the special status entry we want
				
				if(tempPossibleStatusValues != null) {
					//check if the status value the node has is in the array of acceptible status values
					if(tempPossibleStatusValues.indexOf(statusValue) != -1) {
						//the status value is in the array so it satisfies the value to satisfy
						return true;
					}
				}
			}
		}
	}
	
	return false;
};

/**
 * Get the available statuses for all nodes 
 * @param includeSpecialStatusValues (optional) whether to include the special status
 * values
 */
Node.prototype.getAvailableStatuses = function(includeSpecialStatusValues) {
	var availableStatuses = [];
	
	if(includeSpecialStatusValues) {
		//include the special status values
		availableStatuses = this.getAvailableStatusesIncludingSpecialStatusValues();
	} else {
		//do not include the special status values
		availableStatuses = Node.availableStatuses;		
	}
	
	return availableStatuses;
};

/**
 * Get the available statuses including special status values
 */
Node.prototype.getAvailableStatusesIncludingSpecialStatusValues = function() {
	var availableStatuses = JSON.parse(JSON.stringify(Node.availableStatuses));
	
	return availableStatuses;
};

/**
 * Get the status constraint messages
 */
Node.prototype.getStatusConstraintMessages = function() {
	return Node.statusConstraintMessages;
};

/**
 * Set the constraint status for this node
 * @param constraintStatus the constraint status for the node
 * e.g. 'disabled' or 'enabled'
 */
Node.prototype.setConstraintStatus = function(constraintStatus) {
	//set the constraint status
	this.constraintStatus = constraintStatus;
	
	//fire an event to notify listeners that this node's constraint status has updated
	eventManager.fire('constraintStatusUpdated', [this.id, constraintStatus]);
};

/**
 * Get all the statuses that have been set for the instance of this step
 */
Node.prototype.getStatuses = function() {
	return this.statuses;
};

/**
 * Set the status value for the status type
 * 
 * @param statusType the status type
 * @param statusValue the status value
 */
Node.prototype.setStatus = function(statusType, statusValue) {
	var statuses = this.statuses;
	
	if(statuses != null) {
		//get the previous status value to check if the status value is going to change
		var oldStatusValue = this.getStatus(statusType);
		
		if(oldStatusValue != statusValue) {
			//the status value is going to change
			
			//remove the status from the step so we don't end up with multiple instances of the same status type
			this.removeStatus(statusType);
			
			//make the new status object
			var newStatus = {
				statusType:statusType,
				statusValue:statusValue
			}
			
			//add the status object to the array of statuses for this step
			statuses.push(newStatus);

			//fire a nodeStatusUpdated event so that listeners are notified that a node status has changed
			eventManager.fire('nodeStatusUpdated', [this.id, statusType, statusValue]);
		} else {
			//the status is not changing so we do not need to do anything
		}
	}
};

/**
 * Get the status value for the given status type for this step
 * 
 * @param statusType the status type
 * @param statuses (optional) an array of status objects
 * 
 * @return the status value for the given status type or null
 * if the status type was not found
 */
Node.prototype.getStatus = function(statusType, statuses) {
	var statusValue = null;
	
	if(statuses == null) {
		//get the statuses array for this step
		statuses = this.statuses;
	}
	
	if(statuses != null) {
		//loop through all the statuses
		for(var x=0; x<statuses.length; x++) {
			//get a status object
			var status = statuses[x];
			
			if(status != null) {
				var tempStatusType = status.statusType;
				
				if(statusType == tempStatusType) {
					//the status type matches the one we want so we will get the status value
					statusValue = status.statusValue;
				}
			}
		}
	}
	
	return statusValue;
};

/**
 * Remove the status from the node
 * 
 * @param statusType the status type to remove
 */
Node.prototype.removeStatus = function(statusType) {
	//get all the statuses
	var statuses = this.statuses;
	
	if(statuses != null) {
		//loop through all the statuses
		for(var x=0; x<statuses.length; x++) {
			//get a status object
			var status = statuses[x];
			
			if(status != null) {
				//get the status type for the status object
				var tempStatusType = status.statusType;
				
				if(statusType == tempStatusType) {
					//the status type matches so we will remove it
					statuses.splice(x, 1);
					
					/*
					 * decrement the counter to keep searching just in case
					 * there are duplicates with the same status type
					 */
					x--;
				}
			}
		}
	}
};

/**
 * Initialize the statuses for a step
 * 
 * @param state all the student work
 */
Node.prototype.populateStatuses = function(state) {

	//set the isVisible and isVisitable statues
	this.setStatus('isVisible', true);
	this.setStatus('isVisitable', true);
	
	//get the latest node visit for the step
	var latestNodeVisit = state.getLatestNodeVisitByNodeId(this.id, true);
	
	if(latestNodeVisit != null && latestNodeVisit != "") {
		//this step has been visited
		this.setStatus('isVisited', true);

		//check if the student has completed the step
		var isCompleted = this.view.isCompleted(this.id);
		
		if(isCompleted) {
			//the student has completed the step
			this.setStatus('isCompleted', true);
		} else {
			//the student has not completed the step
			this.setStatus('isCompleted', false);
		}
	} else {
		//this step has not been visited
		this.setStatus('isVisited', false);
	}
};

/**
 * Initialize the statuses for a sequence
 * 
 * @param state all the student work
 */
Node.prototype.populateSequenceStatuses = function(state) {
	
	//set the isVisible and isVisitable statuses
	this.setStatus('isVisible', true);
	this.setStatus('isVisitable', true);
	
	//get the node ids for the steps in this sequence
	var nodeIdsInSequence = this.view.getProject().getNodeIdsInSequence(this.id);
	
	/*
	 * whether the sequence has been visited. this will be true
	 * if any of the steps in the sequence have been visited.
	 */
	var isVisited = false;
	
	/*
	 * whether the sequence has been completed. this will be true
	 * if all the steps in the sequence have been completed.
	 */
	var isCompleted = false;
	
	if(nodeIdsInSequence != null) {
		//loop through all the node ids in the sequence
		for(var x=0; x<nodeIdsInSequence.length; x++) {
			//get a node id
			var nodeIdInSequence = nodeIdsInSequence[x];
			
			//get all the node visits for the node id
			var nodeVisit = state.getLatestNodeVisitByNodeId(nodeIdInSequence);
			
			if(nodeVisit != null) {
				isVisited = true;
			}
			
			//check if the student has completed the step
			var isNodeInSequenceCompleted = this.view.isCompleted(nodeIdInSequence);
			
			if(x == 0) {
				/*
				 * this is the first step in the sequence so we will set the 
				 * isCompleted value to the value for the step
				 */
				isCompleted = isNodeInSequenceCompleted;
			} else {
				//accumulate the completed values
				isCompleted = isCompleted && isNodeInSequenceCompleted;
			}
		}
	}
	
	//set whether this sequence has been visited
	if(isVisited) {
		this.setStatus('isVisited', true);
	} else {
		this.setStatus('isVisited', false);
	}
	
	//set whether this sequence has been completed
	if(isCompleted) {
		this.setStatus('isCompleted', true);
	} else {
		this.setStatus('isCompleted', false);
	}
};

/**
 * Add the constraint to this node.
 * 
 * @param constraintObject the constraint to add to this node
 */
Node.prototype.addConstraint = function(constraintObject) {
	//check if this constraint has already been added to this node
	if(!this.isConstraintAlreadyAdded(constraintObject)) {
		//the constraint has not been added so we will add it
		this.constraints.push(constraintObject);
	}
	
	/*
	 * evaluate the constraints placed on this node to see if we need
	 * to change this node's status
	 */
	this.evaluateConstraints();
};

/**
 * Check if the constraint has already been added to this node's constraints
 * 
 * @param constraintObject the constraint object to add
 * 
 * @return whether the constraint is already added
 */
Node.prototype.isConstraintAlreadyAdded = function(constraintObject) {
	var exists = false;
	
	if(constraintObject != null) {
		if(this.constraints == null) {
			//create the constraints array if it does not exist
			this.constraints = [];
		}
		
		//loop through all the active tag map constraints for this step
		for(var x=0; x<this.constraints.length; x++) {
			//get an active tag map constraint
			var tempConstraintObject = this.constraints[x];
			
			if(constraintObject === tempConstraintObject) {
				//the constraint object already exists in this node
				exists = true;
			}
		}
	}
	
	return exists;
}

/**
 * Remove the constraint from this node
 * 
 * @param constraintObject the constraint object to remove
 */
Node.prototype.removeConstraint = function(constraintObject) {
	if(constraintObject != null) {
		if(this.constraints == null) {
			//create the constraints array if it does not exist
			this.constraints = [];
		}
		
		//loop through all the tag map constraints for this step
		for(var x=0; x<this.constraints.length; x++) {
			//get an active tag map constraint
			var tempConstraintObject = this.constraints[x];
			
			if(constraintObject === tempConstraintObject) {
				//we have found the constraint object so we will remove it
				this.constraints.splice(x, 1);
				
				//decrement the counter to keep searching in case there were multiple instances
				x--;
			}
		}
	}

	/*
	 * evaluate the constraints placed on this node to see if we need
	 * to change this node's status
	 */
	this.evaluateConstraints();
};

/**
 * Evaluate the constraints on this node
 */
Node.prototype.evaluateConstraints = function() {
	
	 if(this.constraints == null) {
		//create the constraints array if it does not exist
		 this.constraints = [];
	 }
	 
	 if(this.constraints.length == 0) {
		 //there are no constraints on this node so it is visitable
		 this.setStatus('isVisitable', true);
	 } else {
		 //there is at least one constraint on this node so it is not visitable
		 this.setStatus('isVisitable', false);
	 }
};

/**
 * Get the constraints that are constraining this node
 * 
 * @return the constraints array
 */
Node.prototype.getActiveConstraints = function() {
	if(this.constraints == null) {
		//create the constraints array if it does not exist
		this.constraints = [];
	}
	
	return this.constraints;
};

/**
 * Find all the nodes that this node depends on. The icons that this
 * node has specified may depend on the status of other nodes. We will
 * tell other nodes that this node depends on them by giving them this
 * node's node id.
 */
Node.prototype.populateNodeStatusDependencies = function() {
	var icons = this.icons;
	
	var nodeIds = [];
	
	if(icons != null) {
		
		//loop through all the icons
		for(var x=0; x<icons.length; x++) {
			var icon = icons[x];
			
			//get the statuses for this icon
			var statuses = icon.statuses;
			
			if(statuses != null) {
				
				//loop through all the statuses
				for(var y=0; y<statuses.length; y++) {
					//get a status object
					var status = statuses[y];
					
					//get the node id the status is for
					var nodeId = status.nodeId;
					
					/*
					 * make sure we don't already have this node id since we need a
					 * list of unique node ids
					 */
					if(nodeIds.indexOf(nodeId) == -1) {
						nodeIds.push(nodeId);						
					}
				}
			}
		}
	}
	
	//loop through all the node ids that we have accumulated
	for(var z=0; z<nodeIds.length; z++) {
		//get a node id
		var nodeId = nodeIds[z];

		//get the node
		var node = this.view.getProject().getNodeById(nodeId);
		
		//add this node id to that node's array of nodeIdsListening
		node.nodeIdsListening.push(this.id);
	}
};

/**
 * Get the score for the node state for this step. This should
 * be implemented by child nodes if they want to utilize it.
 * @param nodeState the node state to get the score from
 */
Node.prototype.getScore = function(nodeState) {
	return null;
};

/**
 * Disables this node's content panel so students cannot interact with it.
 * @param doDisable true iff the node should be disabled
 * @param message optional message
 */
Node.prototype.disableInteractivity = function(doDisable, message) {
	if (doDisable) {
		/* get the position, height and width of the content panel */
		var panelPosition = $('#contentDiv').offset();
		var panelHeight = $('#contentDiv').height() + 2;
		var panelWidth = $('#contentDiv').width() + 2;

		/* create the disabledPanel and append it to the given document */
		var dynamicPanel = $('<div id="disabledPanel"></div>').css({opacity: 0.361, height:panelHeight, width:panelWidth, background:'#000', position:'absolute', 'z-index':999, top:panelPosition.top, left:panelPosition.left}).fadeIn(300);
		//the message to display in the modal dialog
		
		if (message && message != "") {
			var message = "<div id='disabledNodeMessageDiv'>"+message+"</div>";
			dynamicPanel.html(message);			
		}
		$('body').append(dynamicPanel);	

	} else {
		$('#disabledPanel').remove();
	}
}

/*
 * Takes in a state JSON object and returns a STATE object. This
 * function should be overriden by child nodes.
 * @param nodeStatesJSONObj a state JSON object
 * @return a STATE object
 */
Node.prototype.parseDataJSONObj = function(nodeStateJSONObj) {
	return null;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/Node.js');
}
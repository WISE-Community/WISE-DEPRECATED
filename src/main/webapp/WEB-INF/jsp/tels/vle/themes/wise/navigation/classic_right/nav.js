/**
 * This file specifies the html for navigation components (nodes and sequences),
 * specifies the navigation menu toggle event, and also specifies any navigation
 * events to register with the vle event dispatcher.
 * 
 * REQUIRED items are noted as such.
 * 
 * Theme creators can also define customizations to add when both the navigation
 * menu has been created in the DOM (see 'menuCreated' function) and a when new step
 * has been opened by a student (see 'nodeRendered' function).
 */


/**
 * Creates the html to display an activity (sequence) in the navigation
 * 
 * REQUIRED
 * 
 * Specifies what each activity looks like in this navigation menu.
 * Each step within this activity will be APPENDED inside this element.
 * 
 * @param classString
 * @param deep the depth of the node
 * @param nodeId
 * @param title
 * @param position
 * @return the html for the activity
 */
NavigationPanel.prototype.createSequenceHtml = function(classString, stepId, title, position) {
	// create the activity DOM element
	// *REQUIRED*: the id for this element should be the stepId param
	// *REQUIRED*: the classString param should be added to the class attribute
	// *OPTIONAL*: If you want to include an element that shows the steps within this activity (and hides the steps in other activities), add an onclick event that runs this javascript code: eventManager.fire('toggleSequence','" + position + "');
	// (see sequenceOpened and sequenceClosed prototype functions below for more details on toggling activity displays)
	// *SUGGESTED*: if you want to display the activity's title and position, include the title and position params (add 1 to the position to show the correct sequence number)
	var html = "<ul name='menuItem' class='"+ classString + "' id='" + stepId + "'>" +
	"<li class='sequenceTitle'><a onclick='eventManager.fire(\"toggleSequence\", \"" + position + "\")'>" + (position+1) + ": " + title + "</a></li>" +
	"</ul>";
	return html;
};

/**
 * Creates the html to display a step in the navigation
 * 
 * REQUIRED - Specifies what a step looks like in this navigation menu.
 * Each step will be APPENDED to its parent activity element.
 * 
 * @param classString
 * @param stepId String id for the step DOM element
 * @param nodeId String id for the node in the project
 * @param icon html string for the step icon (an <img> element)
 * @param position Tree numbering position in project (e.g. 1, 1.1, 1.1.2)
 * @param title Title string of the step
 * @return the html for the step
 */
NavigationPanel.prototype.createStepHtml = function(classString, stepId, nodeId, icon, position, title) {
	// create the opening tag for the step DOM element
	// *REQUIRED*: the id for this element should be the stepId param
	// *REQUIRED*: the classString param should be added to the class attribute
	// *SUGGESTED*: If you want to include an element that opens this step, add an onclick event that runs this javascript code: eventManager.fire('navigationNodeClicked','" + position + "');	
	var html = "<li name='menuItem' class='" + classString + "'  id='" + stepId + "'><a onclick=\"eventManager.fire('navigationNodeClicked','" + position + "');\">";

	// create a table inside the anchor for each step
	html += "<table>";
	html += "<tr>";
	html += "<td class='stepIcon'>";

	// insert the step icon
	html += icon;

	html += "</td>";
	html += "<td>";

	// *SUGGESTED*: if you want to display the step's title, include the title parameter some in the html
	// insert the span to display the step title
	html += "<span class='nodeTitle'>" + title + "</span>";

	html += "</td>";

	// insert the td to display any special icons such as colored stars or badges
	// *REQUIRED*: the special icon element must have an id attribute of 'nodeId + "_status_icon"'
	html += "<td class='statusIcon' id='" + nodeId + "_status_icon'>";
	html += "</td>";
	html += "</table>";
	html += "</a></li>";

	return html;
};

/**
 * Called when the navigation menu has been inserted into the DOM (when the project
 * first starts up)
 * 
 * REQUIRED
 * 
 * Any DOM customizations, scripting, or event handlers for this 
 * navigation menu should be included here. (It is okay to leave this function empty.)
 */
NavigationPanel.prototype.menuCreated = function() {
	var view = this.view;

	// set the text and title for the toggle navigation menu button
	$('#toggleNavLink').attr('title',view.getI18NString("toggle_nav_button_title","theme")).html(view.getI18NString("toggle_nav_button_text","theme"));

	// display ExpandAll/CollapseAll buttons
	var expandAllText = view.getI18NString("navigation_expand_all","theme");
	var collapseAllText =  view.getI18NString("navigation_collapse_all","theme");
	var controls = "<div id='menuControls' class='panelContent centerContent'><a onclick='eventManager.fire(\"menuExpandAll\")'>" + expandAllText + "</a><a onclick='eventManager.fire(\"menuCollapseAll\")'>"+collapseAllText+"</a></div>";
	$('#navigation').before(controls);

	// on stepHeader hover show step title, vice versa
	$('#stepHeader').hover(
			function(){
				clearTimeout($(this).data('stepHeaderTimer'));
				$('#stepInfo').fadeIn();
			},
			function(){
				$('#stepInfo').stop(true,true);
				$('#stepInfo').fadeOut();
			}
	);

	// for some reason, the first time a node loads when the project is opened,
	// the stepInfo div is not fading after 4 seconds, so force here
	setTimeout(function(){
		$('#stepInfo').fadeOut();
	}, 4000);

	// resize navigation menu on load to fit remaining space in sidebar
	this.resizeMenu();

	// show project content
	$('#vle_body').css('opacity',1);

	view.eventManager.subscribe('studentWorkUpdated', this.studentWorkUpdatedListener, this);
	view.eventManager.subscribe('constraintStatusUpdated', this.constraintStatusUpdatedListener, this);
};

/**
 * Called when a new node (step) is rendered
 * 
 * REQUIRED
 * 
 * By default, the new step's content is displayed. The 'currentNode'
 * class is added to the new step's menu element and removed from the previous
 * step's menu element. In addition, the 'inactive' class is added to all step 
 * and activity menu elements that are not part of the current activity.
 * Any DOM customizations, scripting, or event handlers beyond these should be
 * included in this function. (It is okay to leave this function empty.)
 * 
 * @param node Node that has been rendered
 */
NavigationPanel.prototype.nodeRendered = function(node) {
	// clear the stepHeaderTimer timeout actions on the step header
	clearTimeout($('#stepHeader').data('stepHeaderTimer'));

	// show the step title overlay (unless current step is a note, in which case the title is displayed in the note dialog)
	if(node.getType() != "NoteNode"){
		$('#stepInfo').fadeIn();

		// hide step title overlay after 4 seconds
		var stepHeaderTimer = setTimeout(function(){
			$('#stepInfo').fadeOut();
		}, 4000);
		$('#stepHeader').data('stepHeaderTimer',stepHeaderTimer);
	}
};

/**
 * Toggles the visibility of the navigation panel
 * 
 * REQUIRED
 * 
 * Is executed when the 'toggleNav' link is clicked (see 'vle_body.html').
 * 
 * If you would like to remove the navigation toggle link for this specific navigation
 * mode (but include it for other navigation modes in this theme), keep the 'toggleNav'
 * element in the theme's 'vle_body.html' but hide or remove it in this
 * function using javascript/jQuery [e.g. $('#toggleNav').remove();].
 * 
 * If you do not want a navigation toggle link in your theme at all, remove the 'toggleNav'
 * element from your theme's 'vle_body.html' and leave this function empty.
 */
NavigationPanel.prototype.toggleVisibility = function() {
	var view = this.view;

	/* if there is a disabled panel over the step content, we want to resize that to match the stepContent */
	var resizeDisabled = function(){
		if($('#disabledPanel').size()>0){
			/* get the step content position, height and width */
			var panelPosition = $('#stepContent').offset();
			var panelHeight = $('#stepContent').height() + 2;
			var panelWidth = $('#stepContent').width() + 2;

			/* set the panel css with the position, height and width */
			$('#disabledPanel').css({top:panelPosition.top, left:panelPosition.left, height:panelHeight, width:panelWidth});
		}
	};

	if($('#vleSidebar').width()>0){
		// vleSidebar is visible, so hide and expand stepContent
		$('#vleSidebar').animate({
			width: '0',
			opacity: '0'
		},100);
		$('#stepContent').animate({
			left: '0'
		},100, resizeDisabled());

		// change text of toggleNavLink
		$('#toggleNavLink').attr('title',view.getI18NString("toggle_nav_button_title_off"),"theme").html(view.getI18NString("toggle_nav_button_text_off"),"theme").addClass('menu');
	} else {
		// vleSidebar is hidden, so show and resize stepContent
		$('#vleSidebar').animate({
			width: '210px',
			opacity: '1'
		},100);
		$('#stepContent').animate({
			left: '223px'
		},100, resizeDisabled());

		// change text of toggleNavLink
		$('#toggleNavLink').attr('title',view.getI18NString("toggle_nav_button_title"),"theme").html(view.getI18NString("toggle_nav_button_text"),"theme").removeClass('menu');
	}
};

/**
 * Called when an activity (sequence) has been opened or expanded in VLE DOM
 * 
 * REQUIRED
 * 
 * This function is called either when the user clicks on a link that
 * fires a toggle on event for the selected activity or when the user navigates
 * to a new activity (by either clicking the next step or previous step
 * links). It is also fired automatically when a project loads, opening the
 * activity that contains the starting node (step).
 * 
 * By default, WISE removes the 'inactive' CSS class from all activity and step
 * HTML elements for an activity that is opened and adds the 'active' class.
 * WISE also removes the 'hide' CSS class from any nested activities in the
 * activity that is open and adds the 'show' class.
 * 
 * If you would like to customize the VLE's behavior beyond this CSS styling,
 * include them in this function. (It is okay to leave this function empty.)
 * 
 * @param sequence DOM element containing the html for the activity
 */
NavigationPanel.prototype.sequenceOpened = function(sequence) {
	// show all steps in the active sequence
	$(sequence).children('.active').slideDown('fast');
	// show any nested activities in the active sequence
	$(sequence).children('.show').slideDown('fast');
};

/**
 * Called when an activity (sequence) has been closed or collapsed in VLE DOM
 * 
 * REQUIRED
 * 
 * This function is called either when the user clicks on a link that
 * fires a toggle off event for the selected activity or when the user navigates
 * to a different activity (by either clicking the next step or previous step
 * links). It is also fired automatically when a project loads. Whenever a new
 * step is opened, all the activities except the one that contains the new
 * step are closed.
 * 
 * By default, WISE removes the 'active' CSS class from all activity and step
 * HTML elements for an activity that is opened and adds the 'inactive' class.
 * WISE also removes the 'show' CSS class from any nested activities in the
 * activity that is open and adds the 'hide' class.
 * 
 * If you would like to customize the VLE's behavior beyond this CSS styling,
 * include them in this function. (It is okay to leave this function empty.)
 * 
 * @param sequence DOM element containing the html for the activity
 */
NavigationPanel.prototype.sequenceClosed = function(sequence) {
	// hide all inactive steps in the closed activity
	$(sequence).children('.inactive').slideUp('fast');
	// hide all nested activities in the closed activity
	$(sequence).children('.hide').slideUp('fast');
};


/**
 * Resizes the navigation menu to fill sidebar
 * 
 * (An example of a function specific to this theme and added by the
 * theme creator.)
 */
NavigationPanel.prototype.resizeMenu = function() {
	var top = $('#menuControls').position().top + $('#menuControls').outerHeight();
	$('#navigation').css({'position':'absolute', 'top':top, 'left':0, 'right':0, 'bottom':0});
};

/**
 * Listener for the studentWorkUpdated event
 * @param type the event name
 * @param args the arguments passed into the event when it is fired
 * @param obj the view
 */
NavigationPanel.prototype.studentWorkUpdatedListener = function(type, args, obj) {
	//update the step icon
	obj.setStepIcon();
};

/**
 * Listener for the constraintStatusUpdated event
 * @param type the event name
 * @param args the arguments passed into the event when it is fired
 * @param obj the view
 */
NavigationPanel.prototype.constraintStatusUpdatedListener = function(type, args, obj) {
	//get the node id that has been updated
	var nodeId = args[0];

	//get the constraint status
	var constraintStatus = args[1];

	//get the position of the step
	var position = view.getProject().getPositionById(nodeId);
	var positionEscaped = view.escapeIdForJquery(position);

	//add or remove the constraintDisable class 
	if(constraintStatus == 'disabled') {
		//grey out the step
		$('#node_' + positionEscaped).addClass('constraintDisable');
	} else if(constraintStatus == 'enabled') {
		//make the step available
		$('#node_' + positionEscaped).removeClass('constraintDisable');
	}
};


/**
 * The navMode dispatcher catches events specific to this project
 * navigation mode and delegates them to the appropriate functions for
 * this view.
 * 
 * REQUIRED
 */
View.prototype.navModeDispatcher = function(type,args,obj){
	if(type=='navigationMenuCreated'){ // REQUIRED (DO NOT EDIT)
		obj.navigationPanel.menuCreated();
	} else if(type=='navNodeRendered'){ // REQUIRED  (DO NOT EDIT)
		if(obj.navigationPanel){
			obj.navigationPanel.nodeRendered(args[0]);
		}
	} else if(type=='toggleNavigationVisibility'){ // REQUIRED (DO NOT EDIT)
		obj.navigationPanel.toggleVisibility();
	} else if(type=='navSequenceOpened'){ // REQUIRED (DO NOT EDIT)
		obj.navigationPanel.sequenceOpened(args[0]);
	} else if(type=='navSequenceClosed'){ // REQUIRED (DO NOT EDIT)
		obj.navigationPanel.sequenceClosed(args[0]);
	} else if(type=="navigationPanelPrevButtonClicked") {
		obj.navigationPanel.navigationPanelPrevButtonClickedListener();
	} else if(type=="navigationPanelNextButtonClicked") {
		obj.navigationPanel.navigationPanelNextButtonClickedListener();
	} else if(type=="navigationPanelToggleVisibilityButtonClicked") {
		obj.navigationPanel.navigationPanelToggleVisibilityButtonClickedListener();
	} else if(type=="navigationNodeClicked") {
		obj.navigationPanel.navigationNodeClickedListener(args[0]);
	};
};

/**
 * this list of events (should include each of the types specified in the navModeDispatcher above)
 * REQUIRED
 */
var events = [
              'toggleNavigationVisibility', // REQUIRED (DO NOT EDIT)
              'navigationMenuCreated', // REQUIRED (DO NOT EDIT)
              'navNodeRendered', // REQUIRED (DO NOT EDIT)
              'navSequenceOpened', // REQUIRED (DO NOT EDIT)
              'navSequenceClosed', // REQUIRED (DO NOT EDIT)
              'navigationPanelPrevButtonClicked',
              'navigationPanelNextButtonClicked',
              'navigationPanelToggleVisibilityButtonClicked',
              'navigationNodeClicked'
              ];

/**
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 * REQUIRED (DO NOT EDIT)
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'navModeDispatcher');
};






NavigationPanel.prototype.navigationPanelPrevButtonClickedListener = function() {
	view.renderPrevNode();
};

NavigationPanel.prototype.navigationPanelNextButtonClickedListener = function() {
	view.renderNextNode();
};

NavigationPanel.prototype.navigationPanelToggleVisibilityButtonClickedListener = function() {
	this.toggleVisibility();
};


/**
 * Listens for the navigationNodeClicked event
 * @param nodePosition the node position that was clicked
 */
NavigationPanel.prototype.navigationNodeClickedListener = function(nodePosition) {
	//go to the node position that was clicked if it is available
	view.goToNodePosition(nodePosition);
};



/*
 * Obtain the html from my_menu and run trim on the html to remove all
 * white space. If it is empty string after the trim that means we
 * need to create the nav html. If the string is not empty that means
 * we have previously created the nav html and we only need to update
 * some of the elements.
 * @param forceReRender true iff we want to rerender the navigation from scratch
 */
NavigationPanel.prototype.render = function(forceReRender) {
	// TODO: remove this first if conditional - navMode is now specified by the project metadata
	if (this.view.config.getConfigParam("navMode") != "none" && this.view.config.getConfigParam("navMode") != "dropDownTree") {
		//obtain the html in the nav div and run trim on it
		var currentNavHtml = document.getElementById("my_menu").innerHTML.replace(/^\s*/, "").replace(/\s*$/, "");

		//check if the nav html is empty string after the trim
		if(!forceReRender && currentNavHtml != "") {
			//the nav html is not empty string so we will just update some of the elements

			//obtain the node pos that was previously just highlighted in the nav
			var previousPos = $('.currentNode').attr('id');
			if(previousPos){
				previousPos = previousPos.replace(/(:|\.)/g,'\\$1'); // escape : and . characters to allow them to work with jQuery selectors
			}

			//obtain the new current pos we are moving to
			var currentPos = 'node_' + this.view.getCurrentPosition();
			currentPos = currentPos.replace(/(:|\.)/g,'\\$1'); // escape : and . characters to allow them to work with jQuery selectors

			//obtain the nav elements for the current  and previous nodes
			var previousNavElement = $('#' + previousPos);
			var currentNavElement = $('#' + currentPos);

			/*
			 * remove the currentNode class from the previousNavElement so
			 * it is no longer highlighted
			 */
			if(previousNavElement != null) {
				previousNavElement.removeClass('currentNode');

				/*
				 * Check for glue sequences and if it was previous set icon
				 * back to glue icon and remove position within the glue from
				 * title
				 */ 
				var prevNode = this.view.getProject().getNodeByPosition(previousPos);
				var currentNode = this.view.getProject().getNodeByPosition(currentPos);
				if(prevNode && prevNode.parent.getView()=='glue' && (currentNode.parent != prevNode.parent)){ //then we are a glue sequence different from previous
					var currentTitle = previousNavElement.firstChild.nextSibling.nodeValue;
					var newTitle;
					var parentTitle = prevNode.parent.title;
					previousNavElement.firstChild.src = this.view.iconUrl + 'instantquiz16.png';

					if(currentTitle && currentTitle.indexOf(parentTitle)!=-1){
						newTitle = currentTitle.substring(0, currentTitle.indexOf(parentTitle) + parentTitle.length + 1);
						previousNavElement.firstChild.nextSibling.nodeValue = newTitle;
					};
				};
			}

			/*
			 * add the currentNode class to the currentNavElement so that
			 * it becomes highlighted
			 */
			if(currentNavElement != null) {
				currentNavElement.addClass('currentNode');

				var child = this.view.getProject().getNodeById(this.view.getState().getCurrentNodeVisit().getNodeId());
				if(child.parent.getView()=='glue'){//must be first step in glue
					this.processGlue(currentNavElement, child);
				};
			} else {
				/*
				 * if the currentNavElement is null it's because the current
				 * node we are on is within a glue node so it doesn't have
				 * a nav element. in this case we will just highlight
				 * the parent nav element (which is the parent glue node) 
				 */
				//obtain the parent
				var enclosingNavParentElement = this.getEnclosingNavParent(currentPos);
				if(enclosingNavParentElement != null) {

					/*
					 * if view is set for the glue, then change title to show which step
					 * they are currently on
					 */
					var child = this.view.getProject().getNodeById(this.view.getState().getCurrentNodeVisit().getNodeId());
					if(child.parent.getView()=='glue'){
						this.processGlue(enclosingNavParentElement, child);
					};

					/*
					 * add the currentNode class to the parent so that it becomes
					 * highlighted
					 */
					enclosingNavParentElement.addClass('currentNode');
				}
			}

		} else {
			//the nav html is empty so we need to build the nav html

			this.currentStepNum = 1;
			var navHtml = "";  

			//loop through the nodes and child nodes and create the html
			for (var i = 0; i < this.rootNode.children.length; i++) {
				navHtml += this.getNavigationHtml(this.rootNode.children[i], 0, i);
			};

			/*
			 * add the base href to the nav html. this is required because
			 * if a note step was loaded as the first step, the base href
			 * in the note frame would override the base href for the nav
			 * images and cause them to be dead images. to prevent this, 
			 * we are adding a base href to the nav html so it won't 
			 * accidentally use the note frame base href.
			 */
			navHtml = this.addBaseHref(navHtml);

			//set the nav html into the div
			document.getElementById("my_menu").innerHTML = navHtml;

			//eventManager.fire('resizeMenu');
			//eventManager.fire('navigationMenuCreated');
			eventManager.fire('menuCreated');
		};

		//collapse all activities except for the current one
		eventManager.fire('menuCollapseAllNonImmediate');

		/* add appropriate classes for any constraints that may apply to 
		 * the current navigation */
		//this.processConstraints();
	}
};

/**
 * Add a base href to the html
 * @param navHtml that navigation menu html
 * @return the navigation menu html with a base href tag prepended to it
 */
NavigationPanel.prototype.addBaseHref = function(navHtml) {
	//add a base href so it knows where to retrieve the nav images

	/*
	 * get the href of the current document. it will look something
	 * like
	 * http://wise4.telscenter.org/vlewrapper/vle/vle.html
	 */
	var documentLocationHref = document.location.href;

	/*
	 * get everything up until the last '/' inclusive. the documentBase
	 * will look something like
	 * http://wise4.telscenter.org/vlewrapper/vle/
	 */
	var documentBase = documentLocationHref.substring(0, documentLocationHref.lastIndexOf('/') + 1);

	/*
	 * add the base href with the document base to the beginning of
	 * the nav html
	 */
	navHtml = "<base href='" + documentBase + "'>" + navHtml;

	return navHtml;
};

/**
 * Handles special processing of glue sequences: setting icon
 * to icon of current step and updating title to reflect the
 * step number, within the glue, that they are currently on
 */
NavigationPanel.prototype.processGlue = function(el, child){
	var currentTitle = el.firstChild.nextSibling.nodeValue;
	var newTitle;
	var parentTitle = child.parent.title;
	var positionText = ' (part ' + (child.parent.children.indexOf(child) + 1) + ' of ' + child.parent.children.length + ')';
	var nodeIconPath = this.view.nodeIconPaths[child.parent.type];
	el.firstChild.src = nodeIconPath + child.parent.getNodeClass() + '16.png';
	//el.firstChild.src = this.view.iconUrl + child.className + '16.png';

	if(currentTitle && currentTitle.indexOf(parentTitle)!=-1){
		newTitle = currentTitle.substring(0, currentTitle.indexOf(parentTitle) + parentTitle.length + 1) + positionText;
		el.firstChild.nextSibling.nodeValue = newTitle;
	};
};

/**
 * We will search backwards through the navigationLogic
 * to find the previous node that actually has an element
 * in the nav. Some nodes do not have an element in the nav
 * such as glue nodes.
 * @param pos the node position to find the parent for
 * @return the parent nav element of the node at the given position
 */
NavigationPanel.prototype.getEnclosingNavParent = function(pos) {
	if(pos != null) {
		//obtain the previous node in the navigationLogic
		var prevNodePos = this.view.navigationLogic.getPrevNode(pos);

		if(prevNodePos != null) {
			//see if the previous node has an element in the nav
			var prevElement = document.getElementById('node_' + prevNodePos);

			if(prevElement != null) {
				//the previous element does have an element in the nav
				return prevElement;
			} else {
				/*
				 * the previous element does not have an element in the nav
				 * so we will keep searching backwards
				 */
				return this.getEnclosingNavParent(prevNodePos);
			};
		};
	};
	return null;
};

/**
 * 
 * @param node
 * @param depth the current level of the navigation in tree terms
 * @param position the tree numbering e.g. 1, 1.1, 1.1.2
 * @return
 */
NavigationPanel.prototype.getNavigationHtml = function(node, depth, position) {
	var htmlSoFar = "";
	var classString = "step";
	var deep = depth;
	if(!deep){
		deep = 0;
	};

	var title = '';

	// handle any processing (e.g. for branching) before we create the navigation html.
	node.onBeforeCreateNavigationHtml();

	var nodeTitle = node.getTitle();
	var currentStepNum = this.getStudentViewPosition(position);
	if(this.autoStep) {
		title += this.stepTerm + " " + currentStepNum + ": "; 
	} else {
		if(this.stepTerm && this.stepTerm != ''){
			title += this.stepTerm + ': ';
		};
	};

	var titlePosition = position;

	if(!this.stepLevelNumbering){
		titlePosition = '';
	};

	title += this.getTitlePositionFromLocation(titlePosition.toString()) + " " + nodeTitle;

	if (node.isHiddenFromNavigation()) {
		// hide the node if node.isHidden is true
		classString += " hidden ";
	} 

	/*
	 * depth# gets added to each node/sequence class so it can be styled; when
	 * creating the html for a node/sequence, we add 1 to the deep value so that the
	 * depths range from 0 and up in the DOM, e.g.
	 * 0 - project level
	 * 1 - activity level
	 * 2 - step (or activity) level
	 * 3 - step (or activity) level
	 * 4 - step (or activity) level
	 * etc.
	 */
	deep = deep + 1;

	classString += " depth_" + deep;

	if (node == null) {
		// this is for nodes that don't appear in navigation
		// like journal
		return;
	}

	var stepId = 'node_' + position;

	/* this might be rendered from duplicate node, so check the nodeVisit for this
	 * node to see if it has a duplicateId, if so do not set this one as the current
	 * node */
	if (node.id == this.view.getState().getCurrentNodeVisit().getNodeId() && !this.view.getState().getCurrentNodeVisit().duplicateId) {
		classString += " currentNode";
	}

	/* if this node is a duplicate node, it might have rendered the current node, so check
	 * its real node to see if it is the one being rendered but then set this duplicate node
	 * as the current node in the html */
	if(node.type=='DuplicateNode' && 
			node.getNode().id == this.view.getState().getCurrentNodeVisit().getNodeId() && 
			this.view.getState().getCurrentNodeVisit().duplicateId == node.id){
		classString += " currentNode";
	}

	if (node.children.length > 0 || node.type == "sequence") {
		//the node is a sequence
		classString = 'sequence';

		if(node.getView() == "hidden") {
			/*
			 * the sequence is a hidden sequence so the user will not see
			 * the sequence title in the nav bar but they will see all its
			 * children. the children will show up on the level that the
			 * sequence is in and not one level deeper. if one of the children
			 * is a sequence, that will show up like a regular sequence.
			 */
			for (var x = 0; x < node.children.length; x++) {
				htmlSoFar += this.getNavigationHtml(node.children[x], deep, position + '.' + x);
			};
		} else if(node.getView() == "glue") {
			position = position + '.0';
			stepId = 'node_' + position;
			/*
			 * the sequence is a glue sequence so the user will only see
			 * the sequence title in the nav bar. they will not see
			 * any children in the nav bar but the next button will step
			 * through them. if a child is a sequence, they will 
			 * still only see the sequence
			 * and when they click the next button to go to the next
			 * step, they will step through the sequence and the 
			 * sequence's children.
			 */
			classString = 'glue';
			var sequenceIcon = '<img src=\'images/stepIcons/instantquiz16.png\'/>';

			if(node.getNodeClass() && node.getNodeClass()!='null' && node.getNodeClass()!=''){
				var nodeIconPath = this.view.nodeIconPaths[node.type];
				//sequenceIcon = '<img src=\'' + this.view.iconUrl + node.getNodeClass() + '16.png\'/> ';
				sequenceIcon = '<img src=\'' + nodeIconPath + node.getNodeClass() + '16.png\'/> ';
			};

			//display a step with the title of the sequence for this glue sequence
			htmlSoFar += this.createStepHtml(classString, stepId, node.id, sequenceIcon, position, title, this.getStudentViewPosition(position + '.0'));
		} else {
			//the sequence is normal

			// if depth is is greater than 1, activity is nested in a parent activity so add 'nested' class to classString
			if(deep > 1){
				classString += " nested";
			}

			if(node.isHidden) {
				//set the step to be hidden in the navigation panel
				classString += " hidden";
			}

			// create the DOM object for this sequence
			//htmlSoFar += this.createSequenceHtml(classString, deep, node.id, node.getTitle(), position);
			var sequence = $(this.createSequenceHtml(classString, stepId, node.getTitle(), position));

			// add the steps to this sequence
			for (var i = 0; i < node.children.length; i++) {
				htmlSoFar += this.getNavigationHtml(node.children[i], deep, position + '.' + i);
			};
			sequence.append(htmlSoFar);

			// convert to html string
			htmlSoFar = $('<div>').append(sequence.clone()).html();
		}
	} else {
		//the node is a step
		var icon = '';

		if(node.getNodeClass() && node.getNodeClass()!='null' && node.getNodeClass()!=''){
			var nodeClass = node.getNodeClass();
			var isValid = false;
			var iconPath = '';
			
			//loop through all the node classes for this node type
			for(var a=0;a<this.view.nodeClasses[node.type].length;a++){
				if(this.view.nodeClasses[node.type][a].nodeClass == nodeClass){
					//we have found the node class we want
					isValid = true;
					
					//get the icon path for this node class
					iconPath = this.view.nodeClasses[node.type][a].icon;
					
					break;
				}
			}
			if(!isValid){
				nodeClass = this.view.nodeClasses[node.type][0].nodeClass;
				iconPath = this.view.nodeClasses[node.type][0].icon;
			}
			
			//create the html for the step icon
			icon = '<img id="stepIcon_' + node.id + '" src=\'' + iconPath + '\'/> ';
		};

		//display the step
		htmlSoFar += this.createStepHtml(classString, stepId, node.id, icon, position, title);
	};
	return htmlSoFar;
};

/**
 * Get the position for the step that the student should see.
 * @param position a string representing a step position
 * e.g.
 * "0.0" is the position for the first step in the first activity
 * in the programmer world but in the student world it will be
 * displayed as "1.1"
 * 
 * @return the position as should be seen by the student
 */
NavigationPanel.prototype.getStudentViewPosition = function(position) {
	var studentViewPosition = "";

	if(position != null) {

		//make sure the position is a string
		if(position.constructor.toString().indexOf('String') != -1) {
			//position is a string

			//split the string at the periods
			var positionParts = position.split('.');

			//loop through all the parts delimited by the periods
			for(var x=0; x<positionParts.length; x++) {
				//get a part
				var positionPart = positionParts[x];

				//increment the part by 1 to convert it to the student view
				var studentViewPositionPart = parseInt(positionPart) + 1;

				if(studentViewPosition != "") {
					//separate each part with a period
					studentViewPosition += ".";
				} 

				//append the part
				studentViewPosition += studentViewPositionPart;
			}
		}
	}

	return studentViewPosition;
};

/**
 * Shows Navigation Tree
 * TODO: remove this
 * @return
 */
NavigationPanel.prototype.showNavigationTree = function() {
	this.currentStepNum = 1;
	var navHtml = "";  

	//loop through the nodes and child nodes and create the html
	for (var i = 0; i < this.rootNode.children.length; i++) {
		navHtml += this.getNavigationHtml(this.rootNode.children[i], 0, i);
	};

	//check if the showflaggedwork div exists
	if($('#dropDownTreeNavigationDiv').size()==0){
		//the show flaggedworkdiv does not exist so we will create it
		$('<div id="dropDownTreeNavigationDiv" style="text-align:left"></div>').dialog({autoOpen:false,closeText:'',width:400,height:(document.height - 20),modal:false,title:'Project Navigator',zindex:9999, left:0, position:{my:"left top", at:"left top"}});
	}

	//set the html into the div
	$('#dropDownTreeNavigationDiv').html(navHtml);

	//make the div visible
	$('#dropDownTreeNavigationDiv').dialog('open');
};

/**
 * Checks if there are any constraints in effect for the node being rendered
 * and applies the appropriate classes to the menu.
 */
NavigationPanel.prototype.processConstraints = function(){
	var status = (this.view.navigationLogic) ? this.view.navigationLogic.getVisitableStatus(this.view.getCurrentPosition()) : null;

	/* we only need to continue if the nav logic exists and has returned a status object */
	if(status && status.menuStatus){
		var menuItems = this.getMenuItems();

		/* for each item in the menu, we want to look up the status in the menuStatus
		 * and add/remove appropriate classess */
		for(var id in menuItems){
			/* remove existing constraint classes */
			$(menuItems[id]).removeClass('constraintHidden constraintDisable');

			/* look it up in the menuStatus to see if we need to add any constraint classes */
			var ms = status.menuStatus[id];
			if(ms == 1){
				$(menuItems[id]).addClass('constraintDisable');
			} else if(ms == 2){
				$(menuItems[id]).addClass('constraintHidden');
			}
		}
	}
};

/**
 * Retrieves and returns a map of html menu items keyed to their associated nodeIds.
 * 
 * @return object
 */
NavigationPanel.prototype.getMenuItems = function(){
	var view = this.view;
	var menuItems = {};

	$('[name="menuItem"]').each(function(ndx,el){
		var node = view.getProject().getNodeByPosition($(this).attr('id').replace('node_',''));
		if(node){
			menuItems[node.id] = this;
		}
	});

	return menuItems;
};

/**
 * Given a location, adds 1 to each position in location and returns result
 * @param loc
 */
NavigationPanel.prototype.getTitlePositionFromLocation = function(loc){
	if(loc && loc!=''){
		var splitz = loc.split('.');
		var retStr = '';
		for(var c=0;c<splitz.length;c++){
			retStr += (parseInt(splitz[c]) + 1);
			if(c!=splitz.length-1){
				retStr += '.';
			};
		};

		return retStr;
	} else {
		return '';
	};
};


/**
 * Set the step icon in the navigation
 * @param nodeId the node id
 * @param stepIconPath the path to the new icon
 */
NavigationPanel.prototype.setStepIcon = function(nodeId, stepIconPath) {

	if(nodeId != null && nodeId != '' && stepIconPath != null && stepIconPath != '') {
		//the node id and step icon path were provided so we will use them

		/*
		 * replace all the '.' with '\\.' so that the jquery id selector works
		 * if we didn't do this, it would treat the '.' as a class selector and
		 * would not be able to find the element by its id because almost all
		 * of our ids contain a '.'
		 * e.g. node_1.ht
		 */
		nodeId = nodeId.replace(/\./g, '\\.');

		//set the img src to the step icon path
		$('#stepIcon_' + nodeId).attr('src', stepIconPath);
	} else {
		//get the current node
		var currentNode = this.view.getCurrentNode();

		if(currentNode != null) {
			//get the node id
			nodeId = currentNode.id;

			//get the latest work for the step
			var latestWork = this.view.getState().getLatestWorkByNodeId(nodeId);

			//get the status for the latest work
			var status = currentNode.getStatus(latestWork);

			if(status != null) {
				//get the step icon for the status
				var stepIconPath = currentNode.getStepIconForStatus(status);

				if(stepIconPath != null && stepIconPath != '') {
					/*
					 * replace all the '.' with '\\.' so that the jquery id selector works
					 * if we didn't do this, it would treat the '.' as a class selector and
					 * would not be able to find the element by its id because almost all
					 * of our ids contain a '.'
					 * e.g. node_1.ht
					 */
					nodeId = nodeId.replace(/\./g, '\\.');

					//set the img src to the step icon path
					$('#stepIcon_' + nodeId).attr('src', stepIconPath);					
				}
			}
		}
	}
};













function WMenu(id) {
	if (!document.getElementById || !document.getElementsByTagName)
		return false;
	this.menu = document.getElementById(id);
	this.submenus = $('.sequence',this.menu);
	this.oneSmOnly = false;
}
WMenu.prototype.init = function() {
	//show/expand first menu, hide/collapse all others
	for(var k=0;k<this.submenus.length;k++){
		var submenu = this.submenus[k];
		if(k==0){
			$(submenu).addClass('inactive');
			this.expandMenu(submenu);
		} else {
			$(submenu).addClass('active');
			this.collapseMenu(submenu);
		};
	};

	setTimeout(function(){ // temporary kludge to fix problem with menu not resizing properly (in default WISE theme)
		eventManager.fire('navigationMenuCreated');
	},1000);
};

WMenu.prototype.toggleSequence = function(submenu) {
	if ($(submenu).hasClass('inactive')) {
		this.expandMenu(submenu);
	} else {
		this.collapseMenu(submenu);
	}
};

WMenu.prototype.expandMenu = function(submenu) {
	if ($(submenu).hasClass('inactive')){
		$(submenu).removeClass('inactive').addClass('active');
		$(submenu).children('.step').removeClass('inactive').addClass('active');
		$(submenu).children('.nested').removeClass('hide').addClass('show');
		this.collapseOthers(submenu);
		eventManager.fire('navSequenceOpened',submenu);
	}
};

WMenu.prototype.collapseMenu = function(submenu) {
	if ($(submenu).hasClass('active')){
		$(submenu).addClass('inactive').removeClass('active');
		$(submenu).children('.step').addClass('inactive').removeClass('active');
		$(submenu).children('.nested').addClass('hide').removeClass('show');
		eventManager.fire('navSequenceClosed',submenu);
	}
};

WMenu.prototype.collapseOthers = function(submenu) {
	if (this.oneSmOnly) {
		for (var i = 0; i < this.submenus.length; i++){
			//if (this.submenus[i] != submenu && this.submenus[i].className != "collapsed"){
			if (this.submenus[i] != submenu) {
				this.collapseMenu(this.submenus[i]);
			};
		};
	};
};

WMenu.prototype.forceCollapseOthers = function(submenu){
	for (var i = 0; i < this.submenus.length; i++){
		//if (this.submenus[i] != submenu && this.submenus[i].className != "collapsed"){
		if (this.submenus[i] != submenu) {
			this.collapseMenu(this.submenus[i]);
		};
	};
};

/**
 * Collapse all items in the nav except for the ones in the argument
 * array
 * @param submenuArray an array containing DOM elements to keep open
 */
WMenu.prototype.forceCollapseOthersNDeep = function(submenuArray){
	//loop through all the elements in the nav menu
	for (var i = 0; i < this.submenus.length; i++){
		/*
		 * boolean variable to keep track if the current element
		 * was found in the argument array
		 */
		var menuInParent = false;

		//loop through all the elements to keep open
		for(var x=0; x<submenuArray.length; x++) {
			if(submenuArray[x] == this.submenus[i]) {
				/*
				 * the nav element was found in the argument array so
				 * we will keep expand it to open it
				 */
				this.expandMenu(this.submenus[i]);
				menuInParent = true;
			}
		}

		/*
		 * if the nav menu item was not found in the argument array
		 * we will collapse it
		 */
		if(!menuInParent) {
			this.collapseMenu(this.submenus[i]);
		}
	};
};

WMenu.prototype.expandAll = function() {
	var oldOneSmOnly = this.oneSmOnly;
	this.oneSmOnly = false;
	for (var i = 0; i < this.submenus.length; i++){
		this.expandMenu(this.submenus[i]);
	}
	this.oneSmOnly = oldOneSmOnly;
};

WMenu.prototype.collapseAll = function() {
	eventManager.fire('menuCollapseAllNonImmediate');
};













/**
 * Creates and initializes the menu used by this view.
 */
View.prototype.createMenuOnProjectLoad = function(){
	var menuEl = document.getElementById('my_menu');

	if(menuEl){
		this.myMenu = new WMenu('my_menu');
	};

	if(typeof this.myMenu != 'undefined'){
		this.myMenu.init();
	};

	// TODO: remove this
	if (this.config != null && this.config.getConfigParam('mainNav') != null) {
		var mainNav = this.config.getConfigParam('mainNav');

		if (mainNav == 'none') {
			this.eventManager.fire('toggleNagivationPanelVisibility');
		};
	};
};

/**
 * Expands the parent menu of the node with the given id
 */
View.prototype.expandActivity = function(position) {
	var node = this.getProject().getNodeByPosition(position);
	if (node.parent) {
		submenu = document.getElementById("node_" + this.getProject().getPositionById(node.parent.id));
		if(submenu){
			//remove the collapsed class from the menu so it becomes expanded
			//submenu.className = submenu.className.replace("collapsed", "");
			this.myMenu.expandMenu(submenu);
		};
	};
};


/**
 * finds and collapses all nodes except parents, grandparents, etc
 */
View.prototype.collapseAllNonImmediate = function() {
	//obtain all the parents, grandparents, etc of this node
	var enclosingNavParents = this.getEnclosingNavParents(this.getCurrentPosition());

	if(enclosingNavParents != null && enclosingNavParents.length != 0 && this.myMenu) {
		//collapse all nodes except parents, grandparents, etc
		this.myMenu.forceCollapseOthersNDeep(enclosingNavParents);	
	};
};

/**
 * Obtain an array of the parent, grandparent, etc. basically the parent,
 * the parent's parent, the parent's parent's parent, etc. so that when
 * the nav menu is displaying a project that is n-levels deep, we know
 * which parents to keep open. We need to keep all of these ancestors
 * open and not just the immediate parent.
 * @param position - the absolute position of the node we are currently on
 * @param enclosingNavParents an array containing all the parents
 * @return the array of ancestors
 */
View.prototype.getEnclosingNavParents = function(position, enclosingNavParents) {
	//initialize the ancestors array
	if(enclosingNavParents == null) {
		enclosingNavParents = new Array();
	};

	var ndx = position.lastIndexOf('.');
	if(ndx != -1) {
		var parentPos = position.substring(0, position.lastIndexOf('.'));
		//see if the parent has an element in the nav
		var parentNavElement = document.getElementById("node_" + parentPos);
		if(parentNavElement != null) {
			/*
			 * the parent does have an element in the nav so we will add it
			 * to our array of ancestors
			 */
			enclosingNavParents.push(parentNavElement);
		};
		//look for the ancestors of the parent recursively
		return this.getEnclosingNavParents(parentPos, enclosingNavParents);
	} else {
		/*
		 * we have reached to top of the parent tree so we will now
		 * return the ancestor array
		 */
		return enclosingNavParents;
	};
};

/**
 * Toggles the visibility of the navigation panel
 */
/*View.prototype.toggleNavigationPanelVisibility = function() {
	this.navigationPanel.toggleVisibility();	
};*/

/**
 * Resizes navigation panel menu box to fit window height
 */
/*View.prototype.resizeMenu = function() {
	if($('#projectLeftBox').length>0){
		var navHeight = $('#projectLeftBox').height() - $('#hostBrandingBoxUpper').outerHeight() -
			$('#projectLogoBox').outerHeight() - $('#navMenuControls').outerHeight() - 4;
		$('#navigationMenuBox').height(navHeight);
	}
};*/

/**
 * Display a bubble next to the navigation menu that points to a specific step
 * and also displays a message to the student
 * @param nodeId the node id for the step we want to point to
 * @param message the message we want to show to the student
 */
View.prototype.displayMenuBubble = function(nodeId, message) {
	//get the width of the left box of the vle
	var projectLeftBox = document.getElementById('projectLeftBox');
	var projectLeftBoxClientWidth = projectLeftBox.clientWidth;

	//get the position of the step in the menu
	var nodePosition = this.getProject().getPositionById(nodeId);
	var node = document.getElementById(nodePosition);

	if(node != null) {
		//get the y position of the step in the menu
		var nodeOffsetTop = node.offsetTop;

		//get the left and top (basically the same as x and y) positions for the bubble
		var left = projectLeftBoxClientWidth;
		var top = nodeOffsetTop;

		//get the bubble div id
		var menuBubbleDivId = "menuBubbleDiv_" + nodeId;

		//create the div that will display the message
		//var menuBubbleDivHtml = "<div id='" + menuBubbleDivId + "' class='menuBubbleDiv' style='position:absolute;z-index:6;width:500px;top:" + top + "px;left:" + left + "px' onclick='eventManager.fire(\"removeMenuBubble\", \"" + nodeId + "\")'><table style='background-color: yellow'><tr><td><&nbsp</td><td>" + message + "</td><td style='cursor:pointer'>&nbsp[x]</td></tr></table></div>";
		var menuBubbleDivHtml = "<div id='" + menuBubbleDivId + "' class='menuBubbleDiv' style='position:absolute;z-index:6;width:500px;top:" + top + "px;left:" + left + "px' onclick='eventManager.fire(\"removeMenuBubble\", \"" + nodeId + "\")'><table style='background-color: yellow'><tr><td>&nbsp</td><td>" + message + "</td><td style='cursor:pointer'>&nbsp[x]</td></tr></table></div>";

		//add the bubble div to the left box
		$('#projectLeftBox').append(menuBubbleDivHtml);

		//remove the bubble after 5 seconds
		setTimeout("eventManager.fire('removeMenuBubble', '" + nodeId + "')", 5000);
	}
};

/**
 * Remove the bubble for the given node
 * @param nodeId the id of the node
 */
View.prototype.removeMenuBubble = function(nodeId) {
	if(nodeId != null) {
		/*
		 * replace all the '.' with '\\.' so that the jquery id selector works
		 * if we didn't do this, it would treat the '.' as a class selector and
		 * would not be able to find the element by its id because almost all
		 * of our ids contain a '.'
		 * e.g. node_1.ht
		 */
		nodeId = nodeId.replace(/\./g, '\\.');

		//get the div id for the bubble
		var menuBubbleDivId = 'menuBubbleDiv_' + nodeId;

		//remove the bubble
		$('#' + menuBubbleDivId).remove();		
	}
};

/**
 * Remove all the bubbles
 */
View.prototype.removeAllMenuBubbles = function() {
	//remove all elements with the class 'bubbleDiv'
	$('.menuBubbleDiv').remove();
};

/**
 * Highlight the step in the menu
 * @param nodeId the id of the step
 */
View.prototype.highlightStepInMenu = function(nodeId) {
	if(nodeId != null) {
		//get the node position
		var nodePosition = this.getProject().getPositionById(nodeId);

		if(nodePosition != null) {
			//get the DOM step element in the menu
			var node = document.getElementById("node_" + nodePosition);

			if(node != null) {
				//add the class 'menuStepHighlight' to make the background of the step yellow
				var nodeClass = node.getAttribute("class");

				if(nodeClass != null) {
					nodeClass = nodeClass + " menuStepHighlight";
					node.setAttribute("class", nodeClass);					
				}
			}			
		}
	}
};

/**
 * Remove the highlight of the step in the menu
 * @param nodeId the id of the step
 */
View.prototype.unhighlightStepInMenu = function(nodeId) {
	if(nodeId != null) {
		//get the node position
		var nodePosition = this.getProject().getPositionById(nodeId);

		if(nodePosition != null) {
			//get the DOM step element in the menu
			var node = document.getElementById("node_" + nodePosition);

			if(node != null) {
				//remove the 'menuStepHighlight' class so that the background of the step is no longer yellow
				var nodeClass = node.getAttribute("class");

				if(nodeClass != null) {
					nodeClass = nodeClass.replace('menuStepHighlight', '');
					node.setAttribute("class", nodeClass);					
				}
			}			
		}
	}
};

/**
 * Update the status icon for the step
 * @param nodeId the node id of the step
 * @param src the path to the icon image file
 * @param tooltip the text to display when user hovers over the icon
 */
View.prototype.updateStepStatusIcon = function(nodeId, src, tooltip) {
	if(src && typeof src == 'string' && src != ''){
		/*
		 * replace all the '.' with '\\.' so that the jquery id selector works
		 * if we didn't do this, it would treat the '.' as a class selector and
		 * would not be able to find the element by its id because almost all
		 * of our ids contain a '.'
		 * e.g. node_1.ht
		 */
		nodeId = nodeId.replace(/\./g, '\\.');

		//get the div id for the right icon
		var divId = nodeId + "_status_icon";

		//remove any existing classes
		//$('#' + divId).removeClass();

		// remove any existing icons
		$('#' + divId).html("");

		//if(className == null || className == '') {
		//empty is the default class name if we do not want to show anything
		//className = 'empty';
		//}

		//add the new class
		//$('#' + divId).addClass(className);

		var title = '';
		if(tooltip && typeof tooltip == 'string'){
			title = tooltip;
		}

		// insert the new icon
		$('#' + divId).html("<img alt='status icon' title='" + title + "' src='" + src + "' />");
	}
};




/**
 * Dispatches events that are specific to the menu.
 */
View.prototype.navigationDispatcher = function(type,args,obj){
	if(type=='renderNodeCompleted'){
		obj.renderNavigationPanel();
		obj.expandActivity(args[0]);
	} else if(type=='menuCreated'){
		obj.createMenuOnProjectLoad();
	} else if(type=='menuExpandAll'){
		obj.myMenu.expandAll();
	} else if(type=='menuCollapseAll'){
		obj.myMenu.collapseAll();
	} else if(type=='menuCollapseAllNonImmediate'){
		obj.collapseAllNonImmediate();
	} else if(type=='toggleSequence'){
		// escape : and . characters to allow them to work with jQuery selectors
		var pos = args[0].replace(/(:|\.)/g,'\\$1');
		obj.myMenu.toggleSequence($('#node_' + pos));
	} else if(type == 'displayMenuBubble') {
		obj.displayMenuBubble(args[0], args[1]);
	} else if(type == 'removeMenuBubble') {
		obj.removeMenuBubble(args[0]);
	} else if(type == 'removeAllMenuBubbles') {
		obj.removeAllMenuBubbles();
	} else if(type == 'highlightStepInMenu') {
		obj.highlightStepInMenu(args[0]);
	} else if(type == 'unhighlightStepInMenu') {
		obj.unhighlightStepInMenu(args[0]);
	} else if(type=='updateStepStatusIcon'){
		obj.updateStepStatusIcon(args[0], args[1], args[2]);
	}
};


/**
 * this list of events (should include each of the types specified in the navModeDispatcher above)
 * REQUIRED
 */
var menuEvents = [
              'menuExpandAll', // REQUIRED (DO NOT EDIT)
              'menuCollapseAll', // REQUIRED (DO NOT EDIT)
              'menuCollapseAllNonImmediate', // REQUIRED (DO NOT EDIT)
              'toggleSequence', // REQUIRED (DO NOT EDIT)
              'resizeMenu', // REQUIRED (DO NOT EDIT)
              'displayMenuBubble',
              'removeMenuBubble',
              'removeAllMenuBubbles',
              'highlightStepInMenu',
              'unhighlightStepInMenu',
              'updateStepStatusIcon',
              'menuCreated'
              ];

/**
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 * REQUIRED (DO NOT EDIT)
 */
for(var x=0; x<menuEvents.length; x++) {
	componentloader.addEvent(menuEvents[x], 'navigationDispatcher');
};


/**
 * used to notify scriptloader that this script has finished loading
 * REQUIRED
 */
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename file path to include your theme and navigation mode folder names
	 * 
	 * e.g. if you were creating a navigation mode called 'classic' in the theme called
	 * 'wise', it would look like:
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/themes/wise/navigation/classic/nav.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/themes/wise/navigation/classic/nav.js');
};
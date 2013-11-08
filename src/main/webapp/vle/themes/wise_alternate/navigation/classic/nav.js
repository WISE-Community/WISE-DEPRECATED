/**
 * This file specifies the html for navigation components (nodes and sequences),
 * specifies the navigation menu toggle event, and also specifies any navigation
 * events to register with the vle event dispatcher.
 * 
 * REQUIRED items are noted as such.
 * 
 * Theme creators can also define customizations to execute when both the navigation
 * menu has been created in the DOM (see 'menuCreated' function) and a new step
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
	var html = "<ul name='menuItem' class='"+ classString + "' id='" + stepId + "'>" +
			"<li class='sequenceTitle'><a onclick='eventManager.fire(\"toggleSequence\", \"" + position + "\")'>" + title + "</a></li>" +
			"</ul>";
	return html;
};

/**
 * Creates the html to display a step in the navigation
 * 
 * REQUIRED - Specifies what a step looks like in this navigation menu.
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
	
	//create a table inside the anchor for each step
	html += "<table>";
	html += "<tr>";
	html += "<td class='stepIcon'>";
	
	//insert the step icon
	html += icon;
	
	html += "</td>";
	html += "<td>";
	
	//*SUGGESTED*: if you want to display the step's title, include the title param
	//insert the span to display the step title
	html += "<span class='nodeTitle'>" + title + "</span>";
	
	html += "</td>";
	
	//insert the td to display any special icons such as colored stars or badges
	//*REQUIRED*: the special icon element must have an id attribute of 'nodeId + "_status_icon"'
	html += "<td class='statusIcon' id='" + nodeId + "_status_icon'>";
	html += "</td>";
	html += "</table>";
	html += "</a></li>";
	
	return html;
};

/**
 * Called when the navigation menu has been inserted into the DOM
 * 
 * REQUIRED
 * 
 * Any DOM customizations, scripting, or event handlers for this 
 * navigation menu should be included here. (It is okay to leave this function empty.)
 */
NavigationPanel.prototype.menuCreated = function() {
	var view = this.view;
	
	//display ExpandAll/CollapseAll buttons
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
			//setTimeout(function(){$('#stepInfo').fadeOut('medium');},1000);
		}
	);
	
	// for some reason, the first time a node loads when the project is opened,
	// the stepInfo div is not fading after 4 seconds, so force here
	setTimeout(function(){
		$('#stepInfo').fadeOut();
	}, 4000);
	
	// show project content
	$('#vle_body').css('opacity',1);
	
	// resize navigation menu on load to fit remaining space in sidebar
	this.resizeMenu();
};

/**
 * Called when a new node (step) is rendered
 * 
 * REQUIRED
 * 
 * By default, the new step's content is displayed. The 'currentNode'
 * class is added to the new step's DOM element and removed from the previous
 * step's DOM element. In addition, the 'inactive' class is added to all step 
 * and activity DOM elements that are not part of the current activity.
 * Any DOM customizations, scripting, or event handlers beyond these should be
 * included in this function. (It is okay to leave this function empty.)
 * 
 * @param node Node that has been rendered
 */
NavigationPanel.prototype.nodeRendered = function(node) {
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
			left: '225px'
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
 * HTML elements for an activity that is opened and adds the 'active' class. If
 * you would like to customize the VLE's behavior beyond this CSS styling,
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
 * HTML elements for an activity that is opened and adds the 'inactive' class. If
 * you would like to customize the VLE's behavior beyond this CSS styling,
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
	};;
};

// this list of events (should include each of the types specified in the navModeDispatcher above) - REQUIRED
var events = [
	'toggleNavigationVisibility', // REQUIRED (DO NOT EDIT)
	'navigationMenuCreated', // REQUIRED (DO NOT EDIT)
	'navNodeRendered', // REQUIRED (DO NOT EDIT)
	'navSequenceOpened', // REQUIRED (DO NOT EDIT)
	'navSequenceClosed' // REQUIRED (DO NOT EDIT)
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired - REQUIRED (DO NOT EDIT)
 */
for(var x=0; x<events.length; x++) {
	componentloader.addEvent(events[x], 'navModeDispatcher');
};



//used to notify scriptloader that this script has finished loading - REQUIRED
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename file path to include your theme and navigation mode folder names
	 * 
	 * e.g. if you were creating a navigation mode called 'classic' in the theme called
	 * 'wise', it would look like:
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/themes/wise/navigation/classic/nav.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/themes/wise_alternate/navigation/classic/nav.js');
};
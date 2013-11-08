/** 
 * Set the constraint object in this view. The constraint object is responsible
 * for handling all tasks associated with authoring constraints.
 * 
 * @author patrick lawler
 */
View.prototype.Constraint = {view:undefined, currentProjectConstraints:undefined};

/** initializes the constraint authoring **/
View.prototype.Constraint.initializeConstraintAuthoring = function(view){
	this.view = view;
	this.constraintsChanged = false;
	this.nodeUtils = new Node().utils;
	
	/* clear previous */
	$('#constraintProjectLayout').html('');
	
	/* if there is an open project and that project has a root node, process
	 * the current project constraints and generate the layout */
	if(this.view.getProject()){
		if(this.view.getProject().getRootNode()){
			var root = this.view.getProject().getRootNode();
			
			$('#constraintAuthoringDialog').dialog('open');
			this.setCurrentProjectConstraints();
			
			for(var d=0;d<root.children.length;d++){
				this.createProjectLayout(root.children[d],0);
			}
		} else {
			this.view.notificationManager.notify('No root node specified. Please create a root node for the project before authoring constraints.', 3);
		}
	} else {
		this.view.notificationManager.notify('You must open a project before activating this tool.', 3);
	}
};

/**
 * Creates a constraint object for each constraint option currently specified
 * in the project and adds them to currentProjectConstraints.
 */
View.prototype.Constraint.setCurrentProjectConstraints = function(){
	var projectConstraints = this.view.getProject().getConstraints();
	this.currentProjectConstraints = [];
	
	for(var c=0;c<projectConstraints.length;c++){
		var rawConstraint = this.copyConstraint(projectConstraints[c]);
		rawConstraint.view = this.view;
		this.currentProjectConstraints.push(ConstraintFactory.createConstraint(rawConstraint));
	}
};

/**
 * Generates the html elements layout of the given node at the given depth.
 * 
 * @param Object - node
 * @param int - depth
 */
View.prototype.Constraint.createProjectLayout = function(node, depth){
	var position = this.convertPosition(this.view.getProject().getPositionById(node.id));
	
	$('#constraintProjectLayout').append('<div><div id="constraintTitle_' + position + '" onclick="eventManager.fire(\'constraintTitleClicked\',\'' + 
			position + '\')" class="constraintTitle layoutDepth_' + depth + '">' + node.getTitle() + '</div><div id="constraintOptions_' + 
			position + '" style="display:none;" class="constraintOption layoutDepth_' + depth + '">' + this.getConstraintHTML(node) + 
			this.getButtonHTML(node) +'</div></div>');
	
	/* iterate through any sequence's children and create their layout as well */
	if(node.isSequence()){
		for(var a=0;a<node.children.length;a++){
			this.createProjectLayout(node.children[a],depth + 1);
		}
	}
};

/**
 * Returns the appropriate constraint html for the given node.
 * 
 * @param Object - node
 * @return String - html
 */
View.prototype.Constraint.getConstraintHTML = function(node){
	var position = this.convertPosition(this.view.getProject().getPositionById(node.id));
	var constraintHTML = '<div id="existingConstraintsDiv_' + position + '" class="existingConstraints"><div>Existing Constraints:</div>';
	var constraintsForNode = this.getConstraintsByNodeId(node.id);
	
	/* if there are constraints specified, we want to create and append
	 * the appropriate html for each constraint, otherwise, we want to
	 * let the user know that there are no constraints specified for this node */
	if(constraintsForNode.length > 0){
		constraintHTML += '<div id="constraintListDiv_' + position + '"><ul class="constraintList">';
		for(var i=0;i<constraintsForNode.length;i++){
			constraintHTML += '<li id="constraintListEntry_' + position + '_' + constraintsForNode[i].id + 
				'" onclick="eventManager.fire(\'constraintEntryClicked\',[\'' + position + '\',\'' + constraintsForNode[i].id + '\'])">' + 
				this.getHumanType(constraintsForNode[i].getType()) + '  <input type="button" class="constraintButton" value="Remove" ' + 
				'onclick="eventManager.fire(\'constraintRemoveConstraint\',[\'' + position + '\',\'' + constraintsForNode[i].id + '\'])"/></li>';
		}
		constraintHTML += '</ul></div>';
	} else {
		constraintHTML += '<div id="constraintListDiv_' + position + '">No contraints are specified for this activity/step.</div>';
	}
	
	/* adds the button elements to the constraintHTML */
	constraintHTML += '</div>';
	
	return constraintHTML;
};

/**
 * Displays appropriate html based on the given position and constraint
 * Id.
 * 
 * @param string - position
 * @param string - constraint id
 */
View.prototype.Constraint.constraintEntryClicked = function(pos,cId){
	/* if clicked element already has active class, then the author has clicked again,
	 * so we only want to remove the active class and clear any affected classes, otherwise
	 * we want to clear all active classes and affected classes, then set the clicked
	 * element with the active class and set the affected classes for the id */
	if($('#constraintListEntry_' + pos + '_' + cId).hasClass('constraintListEntryActive')){
		$('#constraintListEntry_' + pos + '_' + cId).removeClass('constraintListEntryActive');
		$('.constraintAffected').removeClass('constraintAffected');
	} else {
		$('.constraintListEntryActive').removeClass('constraintListEntryActive');
		$('.constraintAffected').removeClass('constraintAffected');
		$('#constraintListEntry_' + pos + '_' + cId).addClass('constraintListEntryActive');
		
		/* retrieve the constraint associated with the given id and get
		 * its affected nodeIds */
		var constraint = this.getConstraintById(cId);
		
		/* when the remove button is clicked, the click event for the li is also fired and
		 * in this case, the cId will have already been removed, so if the constraint is
		 * null, just skip this next part */
		if(constraint){
			var nodeIds = constraint.getAffectedIds();
			
			/* get the positions for each node in the nodeIds array and add the constraintAffected
			 * class to each corresponding title element */
			for(var k=0;k<nodeIds.length;k++){
				$('#constraintTitle_' + this.view.getProject().getPositionById(nodeIds[k]).replace('.','-')).addClass('constraintAffected');
			}
		}
	}
};

/**
 * Removes the constraint with the given id from the project and 
 * updates the authoring html.
 */
View.prototype.Constraint.removeConstraint = function(pos,cId){
	/* set constraintsChanged to true so that project saves on exit */
	this.constraintsChanged = true;
	
	/* remove the constraint from the project and notify user */
	this.view.getProject().removeConstraint(cId);
	this.view.notificationManager.notify('The constraint was successfully removed from the project!', 3);
	
	/* re-populate the current project constraints */
	this.setCurrentProjectConstraints();
	
	/* remove necessary classes from elements and remove the element that
	 * represented the constraint we just removed */
	$('.constraintAffected').removeClass('constraintAffected');
	$('.constraintListEntryActive').removeClass('constraintListEntryActive');
	$('#constraintListEntry_' + pos + '_' + cId).remove();
};

/**
 * Given a type, returns the type that would make more sense to authors.
 * 
 * @param string - type
 * @return string - type
 */
View.prototype.Constraint.getHumanType = function(type){
	if(type=='NotVisitableXConstraint'){
		return 'Not Visitable';
	} else if(type=='VisitXAfterYConstraint'){
		return 'Visit After';
	} else if(type=='VisitXBeforeYConstraint'){
		return 'Visit Before';
	} else if(type=='VisitXOrYConstraint'){
		return 'Visit This OR That';
	} else if(type=='WorkOnXBeforeYConstraint'){
		return 'Work Before';
	} else if(type=='WorkOnXConstraint'){
		return 'Work Completed';
	} else {
		return type;
	}
};

/**
 * Given an id, replaces and returns that id with all . replaced with -
 * 
 * @param string - id
 * @return string - id
 */
View.prototype.Constraint.convertPosition = function(id){
	return id.toString().replace('.','-');
};


/**
 * Given the title position clicked, determines what should be shown and
 * hidden to the user and clears any necessary classes from elements.
 * 
 * @param String - position
 */
View.prototype.Constraint.constraintTitleClicked = function(position){
	/* clear the affected classes from all titles */
	$('.constraintAffected').removeClass('constraintAffected');
	
	/* if the options is currently hidden, then we want to hide any
	 * existing options and show this one with the appropriate html,
	 * otherwise, we just need to hide this one */
	if($('#constraintOptions_' + position).is(':hidden')){
		$('.constraintOption').hide(900).css('border','none');
		var cOpts = $('.constraintOption');
		for(var h=0;h<cOpts.size();h++){
			var el = cOpts.get(h);
			var pos = el.getAttribute('id').split('_')[1].replace('-','.');
			var node = this.view.getProject().getNodeByPosition(pos);
			$('#constraintOptions_' + pos.replace('.','-')).html(this.getConstraintHTML(node) + this.getButtonHTML(node));
		}
		$('#constraintOptions_' + position).show(900).css('border','1px solid black');
	} else {
		$('#constraintOptions_' + position).hide(900).css('border','none');
	}
};

/**
 * Given a node id, returns an array of all constraints specified
 * for that node. Returns an empty array if there are no constraints
 * specified for that node.
 * 
 * @param string - nodeId
 * @return array - constraints for given nodeId
 */
View.prototype.Constraint.getConstraintsByNodeId = function(nodeId){
	var constraintsForNode = [];
	
	for(var e=0;e<this.currentProjectConstraints.length;e++){
		if(this.currentProjectConstraints[e].getTargetId()==nodeId){
			constraintsForNode.push(this.currentProjectConstraints[e]);
		}
	}
	
	return constraintsForNode;
};

/**
 * Returns the constraint with the given id if it exists, returns null otherwise.
 * 
 * @param string - constraintId
 * @param object - constraint
 */
View.prototype.Constraint.getConstraintById = function(constraintId){
	for(var j=0;j<this.currentProjectConstraints.length;j++){
		if(this.currentProjectConstraints[j].id==constraintId){
			return this.currentProjectConstraints[j];
		}
	}
	
	return null;
};

/**
 * Returns the html button element with onclick event that is keyed
 * to the given node.
 * 
 * @param object - node
 * @return string - html
 */
View.prototype.Constraint.getButtonHTML = function(node){
	var position = this.convertPosition(this.view.getProject().getPositionById(node.id));
	return '<div id="createConstraintContainer_' + position + '" class="createConstraint"><div id="createConstraintBuilder_' + 
		position + '">Constraint Builder</div><div id="createConstraintButton_' + position + 
		'" class="constraintButton" onclick="eventManager.fire(\'constraintCreateConstraint\',\'' + position + 
		'\')">Create A New Constraint</div><div id="createConstraintOptions_' + position + '" style="display:none;">' +
		'</div></div>';
};

/**
 * Generates and returns the html for creating a constraint for the node
 * at the given position.
 * 
 * @param string - position
 * @return string - html
 */
View.prototype.Constraint.getCreateConstraintHTML = function(position){
	return '<div id="selectConstraintDiv_' + position + '">Select constraint type: <select id="constraintSelectType_' + position + 
		'" onchange="eventManager.fire(\'constraintSelectTypeChanged\',\'' + position + '\')"><option name="constraintTypeOption_' + 
		position + '" value="none"> --none-- </option><option name="constraintTypeOption_' + position + 
		'" value="NotVisitableX">Not Visitable - student cannot visit this step</option><option name="constraintTypeOption_' + position + 
		'" value="VisitXAfterY">Visit After - student must visit specified step/activity after visiting this one</option><option name="constraintTypeOption_' + 
		position + '" value="VisitXBeforeY">Visit Before - students can only visit this after visiting a specified activity/step</option><option name="constraintTypeOption_' + 
		position + '" value="WorkOnXBeforeY">Work Before - students can only visit this after having submitted work for a specified activity/step</option><option name="constraintTypeOption_' + 
		position + '" value="WorkOnX">Work Completed - students must complete work on this activity/step before proceeding to any other</option><option name="constraintTypeOption_' + 
		position + '" value="VisitXOrY">Visit This OR That - students can visit either this activity/step or another specified activity/step but NOT both</option></select></div>' +
		'<div id="selectConstraintResultsDiv_' + position + '"><div id="anyAll1_' + position + '"></div><div id="projectNodesSelectDiv_' + 
		position + '"></div><div id="anyAll2_' + position + '"></div><div id="navigationOptionsDiv_' + position + 
		'"></div><div id="liftOnSatisfactionOptionDiv_' + position + '"></div><div id="finishButtonDiv_' + position + '"></div></div>';
};

/**
 * Displays the html for creating a constraint for the node/activity
 * at the given position.
 * 
 * @param string - position
 */
View.prototype.Constraint.createConstraint = function(position){
	$('#createConstraintButton_' + position).hide(900);
	$('#createConstraintOptions_' + position).show(900).append(this.getCreateConstraintHTML(position));
};

/**
 * Updates the html based on the val of the select option of the given
 * position.
 * 
 * @param string - position
 */
View.prototype.Constraint.selectTypeChanged = function(position){
	var val = $('#constraintSelectType_' + position).val();
	
	/* clear all html from the divs */
	$('#selectConstraintResultsDiv_' + position).children().html('');
	
	if(val=='none'){
		//add nothing
	} else if(val=='NotVisitableX'){
		this.setFinishedButtonHTML(position);
	} else {
		this.setSequenceNodeHTML(val, position);
	}
};

/**
 * Sets the html for the navigation options given the position.
 * 
 * @param string - position
 */
View.prototype.Constraint.setNavigationOptionsHTML = function(position){
	var html = '<div>Select Navigation Restriction: <select id="selectNavigationRestriction_' + position + '"><option value="2">' +
		'Not Visitable - students will not be allowed to visit steps affected by this constraint</option><option value="1">Disabled ' + 
		'- students can visit steps affected by this constraint but cannot do any work</option><option value="0">No restriction - students ' +
		'can visit and work on affected steps</select></div><div>Select Menu Restriction: <select id="selectMenuRestriction_' + position + 
		'"><option value="1">Disabled - the affected steps will be disabled in the menu</option><option value="2">Not Visible ' +
		'- the affected steps will not appear in the menu</option><option value="0">No restriction - students will see the affected steps ' + 
		'normally</option></select></div>';
		
	$('#navigationOptionsDiv_' + position).html(html);
};

/**
 * Sets the html for the lift on satisfaction option given the position
 */
View.prototype.Constraint.setLiftOnSatisfactionHTML = function(position){
	$('#liftOnSatisfactionOptionDiv_' + position).html('Should constraint be lifted upon satisfaction? <select id="selectLiftOnSatisfaction_' + position + '"><option value="true">Yes, this only applies once</option><option value="false">No, this should apply every time the student visits this step/activity</option></select>');
};

/**
 * Sets the html for the finished button div given the position.
 * 
 * @param string - position
 */
View.prototype.Constraint.setFinishedButtonHTML = function(position){
	$('#finishButtonDiv_' + position).html('<div id="finishConstraintButton" class="constraintButton" onclick="eventManager.fire(\'constraintFinishCreateConstraint\',\'' + position + '\')">Create</div>');
};

/**
 * Sets the appropriate html in the appropriate divs given the type of constraint
 * to be created and the position of the node.
 * 
 * @param string - type
 * @param string - position
 */
View.prototype.Constraint.setSequenceNodeHTML = function(type, position){
	var node = this.view.getProject().getNodeByPosition(position.replace('-','.'));
	
	/* if the node is a sequence then we need to have the author specify whether
	 * the constraint applies to any of the steps in the sequence or all of the
	 * steps in this sequence */
	if(node.isSequence()){
		$('#anyAll1_' + position).html('Applies to (any/all) steps in this Activity? <select id="selectAnyAll1_' + position + '"><option name="anyAllOption1_' + position + '" value="Any">Any</option><option name="anyAllOption1_' + position + '" value="All">All</option></select>');
	}
	
	/* if this is a workonx constraint, then the author is done, so set the
	 * finished button, if not, then the author needs to specify another step
	 * or activity, so set the project nodes/activities select html */
	if(type=='WorkOnX'){
		this.setNavigationOptionsHTML(position);
		this.setFinishedButtonHTML(position);
	} else {
		$('#projectNodesSelectDiv_' + position).html(this.getConstraintAppliesToPrompt(type) + this.getProjectNodesSelectHTML(type,position));
	}
};

/**
 * Returns the appropriate prompt for the given type.
 * 
 * @param string - type
 * @return string - prompt
 */
View.prototype.Constraint.getConstraintAppliesToPrompt = function(type){
	if(type=='VisitXAfterY'){
		return 'Select the activity/step that the student must visit after: ';
	} else if(type=='VisitXBeforeY'){
		return 'Select the activity/step that the student must visit before: ';
	} else if(type=='WorkOnXBeforeY'){
		return 'Select the activity/step that the student must submit work for before: ';
	} else if(type=='VisitXOrY'){
		return 'Select the activity/step that is an alternate to this one: ';
	} else {
		return '';
	}
};

/**
 * Returns a select html of all activities and steps in the project, excluding
 * that of the given position.
 * 
 * @param string - type
 * @param string - position
 * @return string - html
 */
View.prototype.Constraint.getProjectNodesSelectHTML = function(type,position){
	var root = this.view.getProject().getRootNode();
	var html = '<select id="projectNodesSelect_' + position + '" onchange="eventManager.fire(\'constraintProjectNodesSelectChanged\',[\'' + type + '\',\'' + 
		position + '\'])"><option value="none"> --none-- </option>';
	
	/* cycle through all of the nodes in the project adding each as
	 * an option except for the one at the given position */
	for(var f=0;f<root.children.length;f++){
		html += this.getProjectNodesOptionHTML(root.children[f], position);
	}
	
	html += '</select>';
	return html;
};

/**
 * Returns the options html for the given node if it is not at the given
 * position in the project. If the node is a sequence, also returns the options
 * html for all of its children.
 * 
 * @param object - node
 * @param string - position
 * @return string - html
 */
View.prototype.Constraint.getProjectNodesOptionHTML = function(node, position){
	var html = '';
	
	/* we only want to return an option element if the given
	 * node is NOT at the given position. */
	if(this.view.getProject().getPositionById(node.id) != position.replace('-','.')){
		html += '<option name="projectNodesOptions_' + position + '" value="' + node.id + '">' + node.getTitle() + '</option>';
	}
	
	/* if this is a sequence we want to append its children's
	 * option elements before returning */
	if(node.isSequence()){
		for(var g=0;g<node.children.length;g++){
			html += this.getProjectNodesOptionHTML(node.children[g], position);
		}
	}
	
	return html;
};

/**
 * Checks the value of the selected and updates the html appropriately.
 * 
 * @param string - type
 * @param string - position
 */
View.prototype.Constraint.projectNodesSelectChanged = function(type, position){
	var val = $('#projectNodesSelect_' + position).val();
	
	/* remove any html in the divs after the select */
	$('#projectNodesSelectDiv_' + position + ' ~ div').html('');
	
	/* only continue if something other than none was selected */
	if(val!='none'){
		var node = this.view.getProject().getNodeById(val);
		
		/* if this is a sequence we want to display a second any/all select
		 * to the author */
		if(node.isSequence()){
			$('#anyAll2_' + position).html('Applies to (any/all) steps in the second specified Activity? <select id="selectAnyAll2_' + position + '"><option name="anyAllOption2_' + position + '" value="Any">Any</option><option name="anyAllOption2_' + position + '" value="All">All</option></select>');
		}
		
		/* add the navigation options */
		this.setNavigationOptionsHTML(position);
		
		/* add the lift on satisfaction options for all types except visitxory */
		if(type!='VisitXOrY'){
			this.setLiftOnSatisfactionHTML(position);
		}
		
		/* add the finished button */
		this.setFinishedButtonHTML(position);
	}
};

/**
 * Creates a constraint in the project for the node/activity at the given 
 * position based on the options selected by the author.
 * 
 * @param string - position
 */
View.prototype.Constraint.finishCreateConstraint = function(position){
	var node = this.view.getProject().getNodeByPosition(position.replace('-','.'));
	
	/* create an empty constraint options object */
	var constraint = {};
	
	/* set the constraint type */
	constraint.type = $('#constraintSelectType_' + position).val() + 'Constraint';
	
	/* set the appropriate target id based on type */
	this.setConstraintTargetId(constraint, position, node.isSequence());
	
	/* set the appropriate affected id based on type */
	this.setConstraintAffectedId(constraint, position);
	
	/* set the menu and navigation status options */
	var status = $('#selectNavigationRestriction_' + position).val();
	var menuStatus = $('#selectMenuRestriction_' + position).val()
	constraint.status = (constraint.type=='NotVisitableXConstraint' ? 2 : (status==null) ? 2 : parseInt(status));
	constraint.menuStatus = (constraint.type=='NotVisitableXConstraint' ? 2 : (status==null) ? 1 : parseInt(status));
	
	/* set liftonsatisfaction */
	var str = $('#selectLiftOnSatisfaction_' + position).val();
	constraint.liftOnSatisfaction = (str==='true' ? true : false);
	
	/* generate and set an id for this constraint */
	constraint.id = this.nodeUtils.generateKey(20);
	
	/* add the constraint to the project */
	this.constraintsChanged = true;
	this.view.getProject().addConstraint(constraint);
	
	/* notify user that constraint was created and reset the builder */
	this.view.notificationManager.notify('Constraint created!', 3);
	this.setCurrentProjectConstraints();
	$('#constraintOptions_' + position).html(this.getConstraintHTML(node) + this.getButtonHTML(node));
};

/**
 * Given a constraint object, the position and whether this is a sequence,
 * adds the appropriate target id to the constraint object.
 */
View.prototype.Constraint.setConstraintTargetId = function(constraint, position, isSequence){
	/* create an empty id object */
	var idObj = {id:undefined, mode:undefined};
	
	/* set the target id */
	idObj.id = this.view.getProject().getNodeByPosition(position.replace('-','.')).id;
	
	/* set the mode */
	if(isSequence){
		idObj.mode = 'sequence' + $('#selectAnyAll1_' + position).val();
	} else {
		idObj.mode = 'node';
	}
	
	/* set the idObj as either the x or y in the constraint based on the
	 * constraints type */
	 if(constraint.type=='WorkOnXConstraint' || constraint.type=='NotVisitableXConstraint'){
		 constraint.x = idObj;
	 } else {
		 constraint.y = idObj;
	 }
};

/**
 * Given the constraint object and a position adds the appropriate
 * affected id to the constraint object
 */
View.prototype.Constraint.setConstraintAffectedId = function(constraint, position){
	/* if this is a workOnX or notVisitableX, then we don't need to do anything*/
	if(constraint.type!='WorkOnXConstraint' && constraint.type!='NotVisitableXConstraint'){
		var idObj = {id:undefined, mode:undefined};
	
		/* set the affected Id */
		var affectedId = $('#projectNodesSelect_' + position).val();
		idObj.id = affectedId;
		
		/* set the mode */
		if(this.view.getProject().getNodeById(affectedId).isSequence()){
			idObj.mode = 'sequence' + $('#selectAnyAll1_' + position).val();
		} else {
			idObj.mode = 'node';
		}
		
		/* set the idObj as either the x or y value, currently any constraints
		 * that make it to this point need the x value set. */
		constraint.x = idObj;
	}
};

/**
 * Handles the cleanup and any saving that may need to be done when the
 * author constraint dialog is closed.
 */
View.prototype.Constraint.closingConstraintDialog = function(){
	if(this.constraintsChanged){
		this.view.saveProject();
	}
};

/**
 * Returns a copy of the given constraint options object.
 * 
 * @param object - constraint
 * @return object - constraint
 */
View.prototype.Constraint.copyConstraint = function(constraint){
	return $.parseJSON($.stringify(constraint));
};

/**
 * Opens the options for all of the steps that have constraints specified.
 */
View.prototype.Constraint.showAll = function(){
	/* retrieve an array of unique nodeIds that have constraints */
	var nodeIds = this.getNodeIdsWithConstraints();
	
	/* loop through each id and show its options html */
	for(var m=0;m<nodeIds.length;m++){
		$('#constraintOptions_' + this.convertPosition(this.view.getProject().getPositionById(nodeIds[m]))).show(900).css('border','1px solid black');
	}
};

/**
 * Closes all of the options for all of the steps
 */
View.prototype.Constraint.hideAll = function(){
	/* remove any classes that might have been added */
	$('.constraintListEntryActive').removeClass('constraintListEntryActive');
	$('.constraintAffected').removeClass('constraintAffected');
	
	/* hide all the options and reset their html to the original state */
	$('.constraintOption').hide(900).css('border','none');
	var cOpts = $('.constraintOption');
	for(var h=0;h<cOpts.size();h++){
		var el = cOpts.get(h);
		var pos = el.getAttribute('id').split('_')[1].replace('-','.');
		var node = this.view.getProject().getNodeByPosition(pos);
		$('#constraintOptions_' + pos.replace('.','-')).html(this.getConstraintHTML(node) + this.getButtonHTML(node));
	}
};

/**
 * Returns an array of unique nodeIds that have constraints defined
 * in the project, returns an empty array if none are defined.
 * 
 * @return array - nodeIds
 */
View.prototype.Constraint.getNodeIdsWithConstraints = function(){
	var nodeIdsWithConstraints = [];
	
	/* loop through all defined project constraints and add each
	 * constraints targetId to the nodeIdsWithConstraints if that
	 * id is not already in the array */
	for(var l=0;l<this.currentProjectConstraints.length;l++){
		var targetId = this.currentProjectConstraints[l].getTargetId();
		if(nodeIdsWithConstraints.indexOf(targetId) == -1){
			nodeIdsWithConstraints.push(targetId);
		}
	}
	
	return nodeIdsWithConstraints;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/constraints/authorview_constraint.js');
}
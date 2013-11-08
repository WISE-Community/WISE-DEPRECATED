/**
 * Dispatches events that are specific to ui control
 */
View.prototype.uicontrolDispatcher = function(type,args,obj){
	if(type=='unlockScreenEvent'){
		if(args){
			obj.unlockscreen(args[0]);
		} else {
			obj.unlockscreen();
		}
	} else if(type=='lockScreenAndShareWithClass') {
		obj.lockScreenAndShareWithClass(args[0]);
	}
};

/**
 * Creates the lockscreen dialog
 */
View.prototype.renderLockDialog = function(){
	document.body.appendChild(createElement(document,'div', {id:'lockscreen'}));
	$('#lockscreen').dialog({autoOpen:false,width:255,draggable:false,modal:true,resizable:false,closeText:'',dialogClass:'no-title'});
};

/**
 * Creates the login dialog
 */
View.prototype.renderLoginDialog = function(){
	document.body.appendChild(createElement(document,'div',{id:'loginDialog'}));
	$('#loginDialog').dialog({autoOpen:false,width:700,height:600,draggable:false,modal:true,resizable:false,closeText:'',dialogClass:'no-title'});
};

/**
 * Lock the student screen and display what the teacher has shared with the class
 * @param teacherShareWithClassObj
 */
View.prototype.lockScreenAndShareWithClass = function(teacherShareWithClassObj) {
	if (teacherShareWithClassObj.shareType == "NodeVisit") {
		//the teacher has shared a student node visit
		
		var nodeVisitShareObj = teacherShareWithClassObj.shareObject;
	 	var stepNumberAndTitle = nodeVisitShareObj.stepNumberAndTitle;
		var nodeVisit = nodeVisitShareObj.nodeVisit;
		
		//create a WISE node visit object
		nodeVisit = NODE_VISIT.prototype.parseDataJSONObj(nodeVisit);
		
		var message = stepNumberAndTitle;
		var stepWorkId = nodeVisitShareObj.stepWorkId;
		var nodeId = nodeVisitShareObj.nodeId;
		
		if($('#lockscreen').size()==0){
			this.renderLockDialog();
		}
		
	    if (message == null) {
	    	message = "<table><tr align='center'>Your teacher has paused your screen.</tr><tr align='center'></tr><table>";
	    }
	    
	    //display the step number and title
	    message = "<div class='teacherShareWithClassStepInfoDiv'>"+stepNumberAndTitle+"</div><div id='teacherShareWithClassDiv_" + nodeVisit.id + "'></div>";

	    $('#lockscreen').html(message);
	    
	    $('#lockscreen').dialog('open');
	    $('#lockscreen').dialog('option', 'width', 800);
	    $('#lockscreen').dialog('option', 'height', 600);
	    
	    var node = this.getProject().getNodeById(nodeId);
	    var divId = 'teacherShareWithClassDiv_' + nodeVisit.id;
	    var studentWorkDiv = $('#' + divId);
	    
	    //render the grading view for the work so the student can see the work
	    node.renderGradingView(studentWorkDiv, nodeVisit);		
	} else if (teacherShareWithClassObj.shareType == "Html") {
		//the teacher has shared html
		
		var shareHTML = teacherShareWithClassObj.shareObject;
		
		if($('#lockscreen').size()==0){
			this.renderLockDialog();
		}
		
		message = "<table><tr align='center'>Your teacher has paused your screen.</tr><tr align='center'></tr><table><br/>" + shareHTML;

		$('#lockscreen').html(message);
	    
	    $('#lockscreen').dialog('open');
	    $('#lockscreen').dialog('option', 'width', 800);
	    $('#lockscreen').dialog('option', 'height', 600);
	} else if (teacherShareWithClassObj.shareType == "TeacherMessage" || teacherShareWithClassObj.shareType == "PauseAll") {
		//the teacher has shared a message with the class
		
		var shareHTML = teacherShareWithClassObj.shareObject;
		
		if($('#lockscreen').size()==0){
			this.renderLockDialog();
		}
		
		$('#lockscreen').html(shareHTML);
	    
	    $('#lockscreen').dialog('open');
	    $('#lockscreen').dialog('option', 'width', 800);
	    $('#lockscreen').dialog('option', 'height', 600);
	}

};

/**
 * Unlock the user screen
 */
View.prototype.unlockscreen = function(message) {
	if($('#lockscreen').size()==0){
		this.renderLockDialog();
	}
	
	$('#lockscreen').html(message);
    $('#lockscreen').dialog('close');
};

/**
 * Logs out the user.
 */
View.prototype.logout = function() {
	//logs out the user by calling onunload with the argument true to logout
	window.onunload(true);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_uicontrol.js');
}
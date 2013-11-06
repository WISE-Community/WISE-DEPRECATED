View.prototype.dropDownMenuDispatcher = function(type,args,obj){
	if(type=='showAllWork'){
		obj.showAllWork();
	} else if(type=='displayProgress'){
		obj.displayProgress(args[0], args[1]);
	} else if(type=='showFlaggedWork'){
		obj.showFlaggedWork();
	} else if (type == 'showNavigationTree') {
		obj.showNavigationTree();
	} else if (type == 'showNodeAnnotations') {
		var nodeIdToShow = args[0];
		// if annotations panel is already open, do not open up another annotations panel
		if ($("#nodeAnnotationsPanel_"+nodeIdToShow) && 
				$("#nodeAnnotationsPanel_"+nodeIdToShow).data("dialog") && 
				$("#nodeAnnotationsPanel_"+nodeIdToShow).data("dialog").isOpen()) {
			return;
		}
		obj.showNodeAnnotations(nodeIdToShow);
	} else if (type == 'showStepHints') {
		// if hint is already open, do not open up another hint
		if ($("#hintsPanel") && 
				$("#hintsPanel").data("dialog") && 
				$("#hintsPanel").data("dialog").isOpen()) {
			return;
		}
		obj.showStepHints();
	} else if(type=='getIdeaBasket') {
		obj.getIdeaBasket();
	} else if(type=='getPublicIdeaBasket') {
		obj.getPublicIdeaBasket();
	} else if(type=='ideaBasketChanged') {
		/*
		 * nothing needs to be done here since the idea basket and all the
		 * ExplanationBuilderNode steps listens for the 'ideaBasketChanged'
		 * themselves
		 */
	} else if(type=='displayAddAnIdeaDialog') {
		obj.displayAddAnIdeaDialog();
	} else if(type=='displayIdeaBasket') {
		obj.displayIdeaBasket();
	} else if(type=='addIdeaToBasket') {
		obj.addIdeaToBasket();
	} else if(type=='moveIdeaToTrash') {
		obj.moveIdeaToTrash(args[0]);
	} else if(type=='moveIdeaOutOfTrash') {
		obj.moveIdeaOutOfTrash(args[0]);
	} else if(type=='viewStudentAssets') {
		obj.viewStudentAssets(args[0]);
	} else if(type=='studentAssetSubmitUpload') {
		obj.studentAssetSubmitUpload();
	} else if(type=='ideaBasketDocumentLoaded') {
		obj.loadIdeaBasket();
	} else if(type=='displayFlaggedWorkForNodeId') {
		obj.displayFlaggedWorkForNodeId();
	}
};

/**
 * Get the flags from the server
 * @return
 */
View.prototype.showFlaggedWork = function() {
	this.getShowFlaggedWorkData();
};

/**
 * Shows the NavigationPanel with tree view
 * @return
 */
View.prototype.showNavigationTree = function() {
	this.navigationPanel.showNavigationTree();
};

/**
 * Display the flagged work for the project.
 * 
 * TODO: i18n
 */
View.prototype.displayFlaggedWork = function() {
	var flaggedWorkHtml = "";
	
	//get the node the student is currently on
	var currentNode = this.getCurrentNode();
	var nodeId = currentNode.id;

	//get the node
	var node = this.getProject().getNodeById(nodeId);
	
	//get all the flags for the current node
	var flagsForNodeId = this.flags.getAnnotationsByNodeId(nodeId);
	
	//get the node ids that have flags associated with them
	var flagNodeIds = this.flags.getNodeIds();
	
	/*
	 * the first node id in the project that contains a flag.
	 * we will use this to know which node to display when
	 * the show flagged work popup opens
	 */
	var firstFlaggedNodeId = null;
	
	if(flagNodeIds.length > 0) {
		//get all the node ids in the project
		var nodeIds = this.getProject().getNodeIds();
		
		var choose_a_step = this.getI18NString('choose_a_step');
		
		flaggedWorkHtml += "<div id='chooseStep'>" + choose_a_step + ": ";
		
		//select box for the student to choose which step's flagged work to look at
		flaggedWorkHtml += "<select id='flagNodeIdSelect' onchange='eventManager.fire(\"displayFlaggedWorkForNodeId\")'>";
		
		//loop through all the node ids in the project
		for(var x=0; x<nodeIds.length; x++) {
			//get a node id
			var nodeId = nodeIds[x];
			
			//check if the node id is in the array of flagged node ids
			if(flagNodeIds.contains(nodeId)) {
				
				if(firstFlaggedNodeId == null) {
					//remember the first flagged node id
					firstFlaggedNodeId = nodeId;					
				}
				
				//get the info for the node
				var node = this.getProject().getNodeById(nodeId),
					position = this.getProject().getVLEPositionById(nodeId),
					stepTerm = this.getProject().getStepTerm();
				stepTerm = this.utils.isNonWSString(stepTerm) ? stepTerm + ' ' : '';
				
				//add an option into the select box
				flaggedWorkHtml += "<option value=" + nodeId + ">";
				flaggedWorkHtml += stepTerm + position + ": " + node.title;
				flaggedWorkHtml += "</option>";
			}
		}
		
		flaggedWorkHtml += "</select>";
		flaggedWorkHtml += "</div>";
		flaggedWorkHtml += "<div class='dialogContent'>";
		
		//div that we will use to display the flagged work
		flaggedWorkHtml += "<div id='flaggedWorkForNodeIdDiv'></div>";
	} else {
		var there_are_no_flagged_items = this.getI18NString('there_are_no_flagged_items');
		
		//there are no flagged items
		flaggedWorkHtml += there_are_no_flagged_items;
	}
	
	//check if the showflaggedwork div exists
    if($('#showflaggedwork').size()==0){
    	var teacher_flagged_work = this.getI18NString('teacher_flagged_work');
    	
    	//the show flaggedworkdiv does not exist so we will create it
    	$('<div id="showflaggedwork" style="text-align:left"></div>').dialog({autoOpen:false,closeText:'',modal:true,show:{effect:"fade",duration:200},hide:{effect:"fade",duration:200},title:teacher_flagged_work,zindex:9999});
    }
    
    //set the html into the div
    $('#showflaggedwork').html(flaggedWorkHtml);
    
    //make the div visible
    var docHeight = $(document).height()-25;
	var docWidth = $(document).width()-25;
	$('#showflaggedwork').dialog({height:docHeight,width:docWidth});
    $('#showflaggedwork').dialog('open');

	//display the flagged work for the node id that is selected in the select box
	this.displayFlaggedWorkForNodeId();
};

/**
 * Display the flagged work for the node id that is selected in the select box
 * @param nodeId which node to display flagged work for (optional)
 */
View.prototype.displayFlaggedWorkForNodeId = function(nodeId) {
	if(nodeId == null) {
		//get the node that is selected in the select box
		nodeId = $('#flagNodeIdSelect').val();
	}
	
	if(nodeId){
		//get the node
		var node = this.getProject().getNodeById(nodeId);
		
		//get all the flags for the current node
		var flagsForNodeId = this.flags.getAnnotationsByNodeId(nodeId);
		
		//get the position
		var position = this.getProject().getVLEPositionById(nodeId);
		
		var flaggedWorkHtml = "";
		
		//display the step position, title, and type
		//flaggedWorkHtml += "<div class='panelHeader'>" + position + " " + node.title + "</div>";
		
		//display the prompt for the step
		if(node.getPrompt() && node.getPrompt() != ''){
			var question_instructions = this.getI18NString('question_instructions');
			
			flaggedWorkHtml += "<div class='panelHeader'>" + question_instructions + ":</div>";
			flaggedWorkHtml += "<div class='dialogSection'><div class='sectionContent showallLatestWork'>" + node.getPrompt() + "</div></div>";
		}
		
		var sample_responses = this.getI18NString('sample_responses');
		
		flaggedWorkHtml += "<div class='panelHeader'>" + sample_responses + ":</div><div class='dialogSection'>";
		
		var flaggedWorkAnswers = "";
		
		//loop through all the flags for the current node
		for(var y=0; y<flagsForNodeId.length; y++) {
			//get a flag
			var flagForNodeId = flagsForNodeId[y];
			
			//get the work that was flagged
			var flaggedWork = flagForNodeId.data.getLatestWork();
			var flaggedWorkPostTime = flagForNodeId.postTime;
			
			flaggedWorkAnswers += "<div class='stepWork'>";
			
			var team = this.getI18NString('team');
			var anonymous = this.getI18NString('anonymous');
			
			//display the flagged work/answer
			flaggedWorkAnswers += "<div class='sectionHead'>" + team + " " + (y + 1) + " (" + anonymous + "):</div>";
			flaggedWorkAnswers += "<div class='sectionContent'>";
			if (node.type == "MySystemNode") {
				var contentBaseUrl = this.config.getConfigParam('getContentBaseUrl');
				var divId = "mysystemDiagram_"+flaggedWorkPostTime;
				flaggedWorkAnswers += "<div id='"+divId+"' contentBaseUrl='"+contentBaseUrl+"' class='mysystem showallLatestWork' style=\"height:350px;\">" + flaggedWork + "</div>";
			} else if (node.type == "SVGDrawNode") {
				// TODO: remove (move to SVGDrawNode.js)
	    		var contentBaseUrl = this.config.getConfigParam('getContentBaseUrl');
				var divId = "svgDraw_"+flaggedWorkPostTime;
				flaggedWork = node.translateStudentWork(flaggedWork);
				var divStyle = "height:275px; width:375px; border:1px solid #aaa; background-color:#fff;";
				flaggedWorkAnswers += "<div id='"+divId+"' contentBaseUrl='"+contentBaseUrl+"' class='svgdraw2 showallLatestWork' style=\"" + divStyle + "\">" + flaggedWork + "</div>";
			} else if(node.hasGradingView()) {
	    		flaggedWorkAnswers += "<div class='showallLatestWork' id='flaggedStudentWorkDiv_" + flagForNodeId.stepWorkId + "'></div>";
	    	} else {
				flaggedWorkAnswers += "<div class='showallLatestWork'>"+flaggedWork+"</div>";
			}
			
			flaggedWorkAnswers += "</div></div>";
		}
		
		flaggedWorkHtml += flaggedWorkAnswers;
	
		//add the html to the flagged work div
		$('#flaggedWorkForNodeIdDiv').html(flaggedWorkHtml);
		
	    // inject svgdrawings
	    $('.svgdraw2').each(function(){
			var svgString = String($(this).html());
			var contentBaseUrl = $(this).attr("contentBaseUrl");
			svgString = Utils.decode64(svgString);
			// shrink svg image to fit
			svgString = svgString.replace(/(<image.*xlink:href=)"(.*)"(.*\/>)/gmi, '$1'+'"'+contentBaseUrl+'$2'+'"'+'$3');
			svgString = svgString.replace('<svg width="600" height="450"', '<svg width="375" height="275"');
			svgString = svgString.replace(/<g>/gmi,'<g transform="scale(0.6)">');
			var svgXml = Utils.text2xml(svgString); // convert to xml
			$(this).html('');
			$(this).append(document.importNode(svgXml.documentElement, true)); // add svg to cell
		});
	    
	    // print mysystem...should happen after opening showflaggedwork dialog
		$(".mysystem").each(function() {
			var json_str = $(this).html();
			$(this).html("");
			var divId = $(this).attr("id");
			var contentBaseUrl = $(this).attr("contentBaseUrl");
			try {
				new MySystemPrint(json_str,divId,contentBaseUrl);
			} catch (err) {
				// do nothing
			}
		});
		
		//loop through all the flags for the current node
		for(var y=0; y<flagsForNodeId.length; y++) {
			//get a flag
			var flagForNodeId = flagsForNodeId[y];
			
			//only perform this for nodes that have a grading view
			if(node.hasGradingView()) {
	
				//get the nodevisit from the flag
				var nodeVisit = flagForNodeId.data;
				
				if(nodeVisit != null) {
					/*
					 * get the step work id and set it into the nodevisit
					 * because for some reason it does not have its id set
					 */
					nodeVisit.id = flagForNodeId.stepWorkId;
					
					var workgroupId = parseInt(flagForNodeId.toWorkgroup);
					
					var divId = "flaggedStudentWorkDiv_" + nodeVisit.id;
					var studentWorkDiv = $('#' + divId);
					
					//render the work into the div to display it
					node.renderGradingView(studentWorkDiv, nodeVisit, "flag_", workgroupId);					
				}
			}
		}
	}
};

/**
 * Retrieve all the data required to display the show all work. Perform
 * this retrieval every time the student opens Show All Work so that
 * they can get grades and comments the teacher made immediately.
 */
View.prototype.showAllWork = function(annotationsRetrieved, projectMetaDataRetrieved){
	//clear out these values so that the respective data will be retrieved again
	this.annotationsRetrieved = annotationsRetrieved;
	this.projectMetaDataRetrieved = projectMetaDataRetrieved;
	
	//get the annotation, project meta data, and run extras
	this.getShowAllWorkData();
};

/**
 * This function checks to make sure annotations, project meta data, and
 * run extras are retrieved before displaying Show All Work.
 * 
 * The dispatcher listens for the 3 events below and calls displayShowAllWork 
 * each time but only displays Show All Work after all 3 have been fired
 * by checking the *Retrieved flags
 * 
 * retrieveAnnotationsCompleted
 * retrieveProjectMetaDataCompleted
 * retrieveRunExtrasCompleted
 *
 */
View.prototype.displayShowAllWork = function() {
	//make sure annotations, project meta data, and run extras have been retrieved
	if(this.annotationsRetrieved && this.projectMetaDataRetrieved) {
	    var allWorkHtml = "";
	    
	    var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
	    
	    //get all the ids for teacher and shared teachers
	    var teacherIds = this.getUserAndClassInfo().getAllTeacherWorkgroupIds();
	    
	    //get the scores given to the student by the teachers
	    var totalScoreAndTotalPossible = this.getAnnotations().getTotalScoreAndTotalPossibleByToWorkgroupAndFromWorkgroups(workgroupId, teacherIds, this.maxScores);
	    
	    //get the total score for the workgroup
	    var totalScoreForWorkgroup = totalScoreAndTotalPossible.totalScore;
	    
	    //get the max total score for the steps that were graded for this workgroup
	    var totalPossibleForWorkgroup = totalScoreAndTotalPossible.totalPossible;
	    
	    //get the max total score for this project
	    var totalPossibleForProject = this.getMaxScoreForProject();
	    
	    var vleState = this.getState();
	    
	    var numStepsCompleted = 0;
	    
	    //get all the node ids that the student can potentially visit
	    var nodeIds = this.getStepNodeIdsStudentCanVisit(vleState);
	    
		//loop through all the nodeIds
		for(var y=0; y<nodeIds.length; y++) {
			var nodeId = nodeIds[y];
			
			//get the latest work for the current workgroup 
			var latestNodeVisit = vleState.getLatestNodeVisitByNodeId(nodeId);
			var latestNodeVisitPostTime = null;
			
			//check if there was any work
			if (latestNodeVisit != null) {
				//student has completed this step so we will increment the counter
				numStepsCompleted++;
			}
		}
		
		//for the current team, calculate the percentage of the project they have completed
		var teamPercentProjectCompleted = Math.floor((numStepsCompleted / nodeIds.length) * 100) + "%";
	    
		var score = this.getI18NString('score');
		var percent_project_completed = this.getI18NString('percent_project_completed');
		var my_work_with_teacher_feedback_and_scores = this.getI18NString('my_work_with_teacher_feedback_and_scores');
		
		//create the table to display the student score and percent project completed
		var scoreTable = "<table class='wisetable'>";
		scoreTable += "<thead><tr><th>" + score + "</th><th>" + percent_project_completed + "</th></tr></thead>";
		scoreTable += "<tr><td class='scoreValue'>" + totalScoreForWorkgroup + "</td><td class='scoreValue'><div class='pValue'>" + teamPercentProjectCompleted + "</div><div id='teamProgress' class='progress'></div></td></tr>";
		scoreTable += "</table>";
		
	    //create the div that will contain the score table as well as all the student work
		allWorkHtml = "<div id='showWorkContainer' class='dialogContent'>" + scoreTable + this.getProject().getShowAllWorkHtml(this.getProject().getRootNode(), true) + "</div>";
		
	    if($('#showallwork').size()==0){
	    	$('<div id="showallwork"></div>').dialog({autoOpen:false,closeText:'',modal:true,show:{effect:"fade",duration:200},hide:{effect:"fade",duration:200},title:my_work_with_teacher_feedback_and_scores});
	    }	    
	    
	    $('#showallwork').html(allWorkHtml);
	    
	    //the default bar size, we will use this for the thickness of the hr
		var percentBarSize = 0;
		
		//check if the percent complete is 0%
		if(teamPercentProjectCompleted != '0%') {
			//set the thickness to 3
			percentBarSize = 3;
		}

	    var docHeight = $(document).height()-25;
		var docWidth = $(document).width()-25;
		$('#showallwork').dialog({height:docHeight,width:docWidth});
	    $('#showallwork').dialog('open');
	    $('#showallwork').scrollTop(0);
	    
	    //display the percentage and jqueryui progressbar
		var completedVal = parseInt(teamPercentProjectCompleted.replace('%',''));
		var item = document.getElementById("teamProgress");
		$(item).progressbar({value: completedVal});
		
	    // print mysystem...should happen after opening showallworkdialog
		$(".mysystem").each(function() {
			var json_str = $(this).html();
			$(this).html("");
			var divId = $(this).attr("id");
			var contentBaseUrl = $(this).attr("contentBaseUrl");
			try {
				new MySystemPrint(json_str,divId,contentBaseUrl);
			} catch (err) {
				// do nothing
			}
		});
		
		//get all the node ids in the project
		var nodeIds = this.getProject().getNodeIds();
		
		//loop through all the node ids
		for(var x=0; x<nodeIds.length; x++) {
			//get a node object
			var node = this.getProject().getNodeById(nodeIds[x]);

			//only perform this for steps that have a grading view
			if(node.hasGradingView()) {
				//get the node id
				var nodeId = node.id;
				
				//get the latest node visit that contains student work for this step
				var nodeVisit = this.getState().getLatestNodeVisitByNodeId(nodeId);
				
				//check if the student has any work for this step
				if(nodeVisit != null) {
					//get the div to display the work in
					var studentWorkDiv = $("#latestWork_" + nodeVisit.id);
					
					//render the work into the div to display it
					node.renderGradingView(studentWorkDiv, nodeVisit, "", workgroupId);
					
					if($("#new_latestWork_" + nodeVisit.id).length != 0) {
						/*
						 * render the work into the new feedback div if it exists. the
						 * new feedback div exists when the teacher has given a new
						 * score or comment and we need to show the work and feedback
						 * for that step at the the top of the show all work
						 */
						node.renderGradingView($("#new_latestWork_" + nodeVisit.id), nodeVisit, "", workgroupId);
					}
				}
			}
		}
		
		//check if there was any new feeback for the student
		if(this.getProject().hasNewFeedback()) {
			var you_have_new_feedback_from_teacher = this.getI18NString('you_have_new_feedback_from_teacher');
			var new_feedback_labeled_as_new = this.getI18NString('new_feedback_labeled_as_new');
			
			//display a popup to notify the student that there is new feedback
			alert(you_have_new_feedback_from_teacher + '\n\n' + new_feedback_labeled_as_new);
		}
	}
};

/**
 * Retrieve all the annotations for the currently-logged in user/workgroup
 * from the teacher.
 */
View.prototype.retrieveAnnotations = function(callerId) {
	var processGetAnnotationResponse = function(responseText, responseXML, args) {
		var thisView = args[0];
		var callerId = args[1];
		
		//parse the xml annotations object that contains all the annotations
		thisView.setAnnotations(Annotations.prototype.parseDataJSONString(responseText, true, thisView));

		thisView.annotationsRetrieved = true;
		eventManager.fire('retrieveAnnotationsCompleted', callerId);
	};
	
	var annotationsUrlParams = {
				runId: this.getConfig().getConfigParam('runId'),
				toWorkgroup: this.getUserAndClassInfo().getWorkgroupId(),
				fromWorkgroups: this.getUserAndClassInfo().getAllTeacherWorkgroupIds(),
				periodId:this.getUserAndClassInfo().getPeriodId()
			};
	this.connectionManager.request('GET', 3, this.getConfig().getConfigParam('getAnnotationsUrl'), annotationsUrlParams, processGetAnnotationResponse, [this, callerId], null, true);
};

/**
 * Retrieve the flagged work and display it
 */
View.prototype.getFlaggedWork = function() {
	var processGetFlaggedWorkResponse = function(responseText, responseXML, args) {
		var thisView = args[0];
		var callerId = args[1];
		
		//parse the flags
		thisView.flags = Annotations.prototype.parseDataJSONString(responseText);
		
		var containsExplanationBuilderNode = false;
		
		//get all the node ids that have flags
		var nodeIds = thisView.flags.getNodeIds();
		
		//loop through all the node ids that have flags
		for(var x=0; x<nodeIds.length; x++) {
			var nodeId = nodeIds[x];
			var node = thisView.getProject().getNodeById(nodeId);
			
			if(node.type == 'ExplanationBuilderNode') {
				/*
				 * the node is an explanation builder step so we know
				 * we will need to retrieve idea baskets from some of
				 * our classmates
				 */
				containsExplanationBuilderNode = true;
			}
		}
		
		if(containsExplanationBuilderNode) {
			/*
			 * at least one of the flags is for an explanation builder step
			 * so we need to retrieve the idea baskets of our classmates that
			 * are associated with the flagged work
			 */
			thisView.getFlaggedIdeaBaskets();
		} else {
			//display the flagged work
			thisView.displayFlaggedWork();
		}
	};

	var flaggedWorkUrlParams = {
				userId:this.getUserAndClassInfo().getWorkgroupId(),
				periodId:this.getUserAndClassInfo().getPeriodId(),
				isStudent:true
	};
	
	this.connectionManager.request('GET', 3, this.getConfig().getConfigParam('getFlagsUrl'), flaggedWorkUrlParams, processGetFlaggedWorkResponse, [this]);

};

/**
 * Retrieve the flagged work
 */
View.prototype.getShowFlaggedWorkData = function() {
	this.getFlaggedWork();
};

/**
 * Makes sure all 3 sets of data are retrieved before
 * Show All Work is displayed.
 */
View.prototype.getShowAllWorkData = function() {
	//make sure annotations are retrieved
	if(this.annotationsRetrieved == null) {
		this.retrieveAnnotations('displayShowAllWork');
	} else {
		/*
		 * the annotations were already retrieved so we will make sure
		 * the flag has been set and we will fire the event again
		 * so listeners will be notified 
		 */
		this.annotationsRetrieved = true;
		eventManager.fire('retrieveAnnotationsCompleted', 'displayShowAllWork');
	}
	
	//make sure project meta data is retrieved
	if(this.projectMetaDataRetrieved == null) {
		this.retrieveProjectMetaData();
	} else {
		/*
		 * the annotations were already retrieved so we will make sure
		 * the flag has been set and we will fire the event again
		 * so listeners will be notified 
		 */
		this.projectMetaDataRetrieved = true;
		eventManager.fire('retrieveProjectMetaDataCompleted');
	}
};

/**
 * Get annotations so we can check if there are any new teacher annotations
 * to notify the student about
 */
View.prototype.getAnnotationsToCheckForNewTeacherAnnotations = function() {
	this.retrieveAnnotations('checkForNewTeacherAnnotations');
};

/**
 * Check if there are any new teacher annotations since the student last
 * visited. If there are new annotations we will display a popup message
 * to the student and automatically open up show all work.
 * @return
 */
View.prototype.checkForNewTeacherAnnotations = function() {
	if(this.getState() != null) {
		//get the time they last visited in milliseconds
		var lastTimeVisited = this.getState().getLastTimeVisited();
		
		if(this.getAnnotations() != null) {
			//check if there are any new annotations after the last time they visited
			var areNewAnnotations = this.getAnnotations().annotationsAfterDate(lastTimeVisited);
			
			if(areNewAnnotations) {
				//there are new annotations so we will automatically open up the show all work
				this.showAllWork(true, null, null);
			}		
		}		
	}
	
	eventManager.fire('getIdeaBasket');
};

/**
 * Creates a label and an input DOM element for the specified idea attribute
 * @param attribtue JS object with the attribute settings
 * @returns jQuery DOM element
 */
View.prototype.createAddAnIdeaAttribute = function(attribute){
	var inputContent = '', dialog = 'addAnIdea';
	var type = attribute.type;
	var labelText = attribute.name, requiredClass = '';
	if(attribute.isRequired){
		labelText += '*';
		requiredClass = 'required';
	}
	var idName = dialog + '_' + type + '_' + attribute.id;
	var $inputLabel = null, $input = null, $custom = null;
	if(type=='label' || type=='source'){
		$inputLabel = $('<label for="' + idName + '">' + labelText + ': </label>');
		$input = $(document.createElement('select')).attr('id', idName).attr('name', idName).addClass(requiredClass);
		$input.append('<option value="">Choose One:</option>');
		for(var a=0;a<attribute.options.length;a++){
			var option = '<option value="' + attribute.options[a] + '">' + attribute.options[a] + '</option>';
			$input.append(option);
		}
		if('allowCustom' in attribute && attribute.allowCustom){
			$input.append('<option value="Other">Other</option>');
			$custom = $(document.createElement('div')).attr('id',dialog + '_other_' + attribute.id).addClass('attributeOther');
			$custom.append('<label for="' + dialog + '_other_' + attribute.id +'">Please specify: </label>');
			$customInput = $('<input type="text" name="' + dialog + '_other_' + attribute.id +'" class="other required inactive" size="25" minlength="2" maxlength="25"></input>').addClass(requiredClass);
			$custom.append($customInput);
			$input.change(function(){
				if($(this).val() == 'Other'){
					$custom.children().removeClass('inactive');
					$custom.show();
				} else {
					$custom.hide();
					$custom.children().addClass('inactive');
				}
			});
		}
	} else if (type=='tags') {
		$inputLabel = $('<div><label for="' + idName + '">' + labelText + ' (select all that apply): </label><div>');
		$input = $(document.createElement('div'));
		if(attribute.isRequired){
			requiredClass = 'require-one';
		}
		for(var x=0;x<attribute.options.length;x++){
			var option = $('<input type="checkbox" name="' + idName + '" value="' + attribute.options[x] + '" class="' + requiredClass + '">' + '<span>' + attribute.options[x] + '</span>');
			$input.append(option);
		}
	} else if(type=='icon'){
		$inputLabel = $('<div><label for="' + idName + '">' + labelText + ' (select one): </label><div>');
		$input = $(document.createElement('div'));
		for(var x=0;x<attribute.options.length;x++){
			var text = 'None';
			if(attribute.options[x] != 'blank'){
				text = '<img src="./images/ideaManager/' + attribute.options[x] + '.png" alt="' + attribute.options[x] + '" />';
			}
			var option = $('<input type="radio" name="' + idName + '" value="' + attribute.options[x] + '" class="' + requiredClass + '"><span>' + text + '</span>');
			$input.append(option);
		}
	}
	
	if($inputLabel && $input){
		inputContent = $(document.createElement('div')).addClass('attribute').addClass(type).attr('id',dialog + '_attribute_' + attribute.id).append($inputLabel).append($input);
		if($custom){
			inputContent.append($custom);
		}
	}
	return inputContent;
};

/**
 * Displays the Add an Idea dialog popup so the student can create a new Idea
 */
View.prototype.displayAddAnIdeaDialog = function() {
	
	if(!this.ideaBasket) {
		/*
		 * the vle failed to retrieve the idea basket so we will display
		 * an error message and not display the idea basket popup
		 */
		this.notificationManager.notify(this.getI18NString("idea_basket_retrieval_error"), 3);
		return;
	}
	
	//check if the addAnIdeaDiv exists
	if($('#addAnIdeaDiv').size()==0){
		//it does not already exist so we will create it
		var title = this.getI18NString("idea_basket_add_an_idea");
		if(this.getProjectMetadata().tools.hasOwnProperty('ideaManagerSettings')){
			var imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
			if(imSettings.hasOwnProperty('addIdeaTerm') && this.utils.isNonWSString(imSettings.addIdeaTerm)){
				title = imSettings.addIdeaTerm;
			}
		}
    	$('<div id="addAnIdeaDiv" style="text-align:left"></div>').dialog({autoOpen:false,closeText:'',width:470,height:'auto',resizable:false,show:{effect:"fade",duration:200},hide:{effect:"fade",duration:200},modal:false,title:title,
    		buttons:[
    		         {text:this.getI18NString("ok"),click:function() {eventManager.fire("addIdeaToBasket");}},
    		         {text:this.getI18NString("cancel"),click:function() {$(this).dialog("close");}}
    		         ],
    		open: function(event,ui){
    			$.validator.addMethod('require-one', function (value) {
  		          return $('.require-one:checked').size() > 0; }, 'Please select at least one (1).');
	  			var checkboxes = $('#ideaForm .require-one');
	  			var checkbox_names = $.map(checkboxes, function(e,i) { return $(e).attr("name"); }).join(" ");
	
	  			$('#addAnIdeaForm').validate({
	  				groups: { checks: checkbox_names },
	  				errorPlacement: function(error, element) {
	  		             if (element.attr("type") == "checkbox" || element.attr('type') == 'radio'){
	  		            	 error.insertAfter(element.parent().children(':last'));
	  		             } else {
	  		            	 error.insertAfter(element);
	  		             }
	  				},
	  				ignore: '.inactive'
	  			});
    		}
    	});
    }
    
    //the html we will insert into the popup
    var addAnIdeaHtml = "";
    
    var imVersion = 1, imSettings = {};
    if('ideaManagerSettings' in this.getProjectMetadata().tools){
    	imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
    	imVersion = this.getProjectMetadata().tools.ideaManagerSettings.version;
    }
    
    if(imVersion > 1){
    	addAnIdeaHtml = $("<form class='cmxform' id='addAnIdeaForm' method='get' action=''></form>");
    	var fieldset = $(document.createElement('fieldset'));
    	fieldset.append("<div><label for='text'>Type your " + imSettings.ideaTerm + " here*:</label><input id='addAnIdeaText' type='text' name='text' size='30' class='required' minlength='2' maxlength='150'></input></div>");
    	var attributes = imSettings.ideaAttributes;
    	for(var i=0;i<attributes.length;i++){
    		fieldset.append(this.createAddAnIdeaAttribute(attributes[i]));
    	}
    	addAnIdeaHtml.append(fieldset);
    	
    	//insert the html into the popup
        $('#addAnIdeaDiv').html('').append(addAnIdeaHtml);
    } else {
    	addAnIdeaHtml += "<form class='cmxform' id='addAnIdeaForm' method='get' action=''>";
        addAnIdeaHtml += "<fieldset>";
    	addAnIdeaHtml += "			<p><label for='text'>Type your idea here*:</label><input id='addAnIdeaText' type='text' name='text' size='30' class='required' minlength='2' maxlength='150'></input></p>";
    	addAnIdeaHtml += "			<table>";
        addAnIdeaHtml += "				<tr>";
    	addAnIdeaHtml += "					<td>";
        addAnIdeaHtml += "			<p style:'height:24px; line-height:24px;'>";
        addAnIdeaHtml += "				<label for='source'>Source*: </label>";
        addAnIdeaHtml += "				<select id='addAnIdeaSource' name='source' class='required' style='height:24px;'>";
        addAnIdeaHtml += "				  <option value='empty'>Choose One:</option>";	
        addAnIdeaHtml += "				  <option value='Evidence Step'>Evidence Step</option>";
        addAnIdeaHtml += "				  <option value='Visualization or Model'>Visualization or Model</option>";
        addAnIdeaHtml += "				  <option value='Movie/Video'>Movie/Video</option>";
        addAnIdeaHtml += "				  <option value='Everyday Observation'>Everyday Observation</option>";
        addAnIdeaHtml += "				  <option value='School or Teacher'>School or Teacher</option>";
        addAnIdeaHtml += "				  <option value='Other'>Other</option>";
        addAnIdeaHtml += "				</select>";
        addAnIdeaHtml += "			</p>";
        addAnIdeaHtml += "					</td>";
        addAnIdeaHtml += "					<td>";
        addAnIdeaHtml += "			<p id='addAnIdeaOtherSource' style='display:none'><label for='other'>Specify*: </label><input id='addAnIdeaOther' name='other' size='15' minlength='2' maxlength='25'></input></p>";
        addAnIdeaHtml += "					</td>";
        addAnIdeaHtml += "				</tr>";
        addAnIdeaHtml += "			</table>";
        addAnIdeaHtml += "			<p><label for='tags'>Tags (keywords): </label><input id='addAnIdeaTags' name='tags' size='20' maxlength='20'></input></p>";
        addAnIdeaHtml += "				<p>";
    	addAnIdeaHtml += "				<label for='flag'>Flag (choose one)*: </label>";
    	addAnIdeaHtml += "				<input type='radio' name='addAnIdeaFlag' value='blank' class='required' checked style='margin-left:0;'><span style='vertical-align:top; line-height:24px;'> None</span>";
       	addAnIdeaHtml += "				<input type='radio' name='addAnIdeaFlag' value='important'><img src='images/ideaManager/important.png' alt='important' /><span style='vertical-align:top; line-height:24px;'>Important</span>";
        addAnIdeaHtml += "				<input type='radio' name='addAnIdeaFlag' value='question'><img src='images/ideaManager/question.png' alt='question' /><span style='vertical-align:top; line-height:24px;'>Not Sure</span>";
        //addAnIdeaHtml += "				<input type='radio' name='addAnIdeaFlag' value='check'><img src='images/ideaManager/check.png' alt='check' />";
        addAnIdeaHtml += "				</p>";
        addAnIdeaHtml += "	</fieldset>";
        addAnIdeaHtml += "</form>";
        
        //insert the html into the popup
        $('#addAnIdeaDiv').html(addAnIdeaHtml);
        
        //display or hide the specify other source field when Other is chosen or not chosen
		$('#addAnIdeaSource').change(function(){
			if($('#addAnIdeaSource').val()=='Other'){
				$('#addAnIdeaOtherSource').show();
				$('#addAnIdeaOther').addClass('required');
			} else {
				$('#addAnIdeaOtherSource').hide();
				$('#addAnIdeaOther').removeClass('required');
			}
		});
    }
	
    // close all dialogs
    view.utils.closeDialogs();
    
	//make the popup visible
	$('#addAnIdeaDiv').dialog('open');
};

/**
 * Get the array of attributes specified in the add idea dialog
 * @returns attributes Array of attributes for the idea
 */
View.prototype.getIdeaAttributes = function(){
	var attributes = [], form = $('#addAnIdeaForm'), mode = 'addAnIdea';
	$('.attribute',form).each(function(){
		var attribute = {};
		var attrId = $(this).attr('id').replace(mode + '_attribute_','');
		var type = '';
		if($(this).hasClass('label')){
			type = 'label';
		} else if($(this).hasClass('source')){
			type = 'source';
		} else if($(this).hasClass('icon')){
			type = 'icon';
			attribute.value = $('[name=' + mode + '_' + type + '_' + attrId + ']:checked').val();
		} if($(this).hasClass('tags')){
			type = 'tags';
			var tags = [];
			$('[name=' + mode + '_' + type + '_' + attrId + ']:checked').each(function(){
				tags.push($(this).val());
			});
			attribute.value = tags;
		}
		if(type=='label' || type=='source'){
			if($('#' + mode + '_' + type + '_' + attrId).val() == 'Other'){
				attribute.value = 'Other: ' + $('input[name="' + mode + '_other_' + attrId + '"]').val();
			} else {
				attribute.value = $('#' + mode + '_' + type + '_' + attrId).val();
			} 
		}
		attribute.id = attrId, attribute.type = type;
		attributes.push(attribute);
	});
	return attributes;
};

/**
 * Add the idea to the basket and save the basket back to the server
 */
View.prototype.addIdeaToBasket = function() {
	var view = this;
	var imVersion = 1;
	if(this.getProjectMetadata().tools.hasOwnProperty('ideaManagerSettings')){
		imVersion = this.getProjectMetadata().tools.ideaManagerSettings.version;
	}
	
	//get the node id, node name and vle position for the step
	var nodeId = this.getCurrentNode().id;
	var nodeName = this.getCurrentNode().getTitle();
	var vlePosition = this.getProject().getVLEPositionById(nodeId);
	
	//prepend the vlePosition so nodeName will now look something like "2.3: How Airbags Work"
	nodeName = vlePosition + ": " + nodeName;

	//get the idea basket
	var ideaBasket = this.ideaBasket;
	
	if(imVersion > 1){
		if($("#addAnIdeaForm").validate().form()){
			//get the values the student entered
			var text = $('#addAnIdeaText').val();
			var attributes = view.getIdeaAttributes();
			
			//create and add the new idea to the basket
			var idea = ideaBasket.addIdeaToBasketArrayV2(text,attributes,nodeId,nodeName);
			
			//get the signed in workgroup id
			var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
			
			//save the idea basket back to the server
			ideaBasket.saveIdeaBasket(this, 'addPrivateIdea', workgroupId, idea.id);
			
			//close the create an idea popup
			$('#addAnIdeaDiv').dialog('close');		
			
			// update idea count on toolbar
			ideaBasket.updateToolbarCount(1,true);
		}
	} else {
		//get the values the student entered
		var text = $('#addAnIdeaText').val();
		
		if(text == "") {
			alert("Please enter text in the idea field");
		} else {
			
			var source = $('#addAnIdeaSource').val();
			if(source == "Other") {
				var otherText = $('#addAnIdeaOther').val();
				if(view.utils.isNonWSString(otherText)){
					source = "Other: " + otherText;
				} else {
					alert("Please enter a source for your idea");
					return;
				}
			}
			
			if(source == 'empty'){
				alert('Please select a source for your idea.');
			} else {
				var tags = $('#addAnIdeaTags').val();
				var flag = $("input[name=addAnIdeaFlag]:checked").val();
				
				//create and add the new idea to the basket
				ideaBasket.addIdeaToBasketArray(text,source,tags,flag,nodeId,nodeName);
				
				ideaBasket.saveIdeaBasket(this);
				
				//close the create an idea popup
				$('#addAnIdeaDiv').dialog('close');		
				
				// update idea count on toolbar
				ideaBasket.updateToolbarCount(1,true);
			}
		}
	}
};

/**
 * Retrieve the idea basket from the server
 */
View.prototype.getIdeaBasket = function() {
	//set the params we will use in the request to the server
	var ideaBasketParams = {
		action:"getIdeaBasket"	
	};
	
	//request the idea basket from the server
	this.connectionManager.request('GET', 3, this.getConfig().getConfigParam('getIdeaBasketUrl'), ideaBasketParams, this.getIdeaBasketCallback, {thisView:this});
};

/**
 * Callback for when we receive the idea basket from the server
 * @param responseText
 * @param responseXML
 * @param args
 */
View.prototype.getIdeaBasketCallback = function(responseText, responseXML, args) {
	var thisView = args.thisView;
	
	//parse the JSON string
	var ideaBasketJSONObj = $.parseJSON(responseText);
	
	if(ideaBasketJSONObj == null) {
		thisView.notificationManager.notify(thisView.getI18NString("idea_basket_retrieval_error"), 3);
	} else {
		//create the IdeaBasket from the JSON and set it into the view
		thisView.ideaBasket = new IdeaBasket(ideaBasketJSONObj);
		thisView.ideaBasket.updateToolbarCount();
	}
};

/**
 * Retrieve the public idea basket from the server
 * @param basket our idea basket
 * @param displayPublicIdeaBasket whether to display the public idea basket after we retrieve it
 */
View.prototype.getPublicIdeaBasket = function(basket, displayPublicIdeaBasket) {
	//get the period id
	var periodId = parseInt(this.userAndClassInfo.getPeriodId());
	
	//set the params we will use in the request to the server
	var ideaBasketParams = {
		action:"getPublicIdeaBasket",
		periodId:periodId
	};
	
	//request the public idea basket from the server
	this.connectionManager.request('GET', 3, this.getConfig().getConfigParam('getIdeaBasketUrl'), ideaBasketParams, this.getPublicIdeaBasketCallback, {thisView:this, basket:basket, displayPublicIdeaBasket:displayPublicIdeaBasket});
};

/**
 * Callback for when we receive the public idea basket from the server
 * @param responseText
 * @param responseXML
 * @param args
 */
View.prototype.getPublicIdeaBasketCallback = function(responseText, responseXML, args) {
	var thisView = args.thisView;
	var basket = args.basket;
	var isDisplayPublicIdeaBasket = args.displayPublicIdeaBasket;
	
	//parse the JSON string
	var publicIdeaBasketJSONObj = $.parseJSON(responseText);
	
	if(publicIdeaBasketJSONObj == null) {
		//we failed to retrieve the public idea basket
		thisView.notificationManager.notify(this.getI18NString("idea_basket_retrieval_error"), 3);
	} else if(publicIdeaBasketJSONObj.errorMessage != null) {
		//there was an error so we will display the message in a popup
		alert(publicIdeaBasketJSONObj.errorMessage);
	} else {
		//set the updated public idea basket
		basket.setPublicIdeaBasket(publicIdeaBasketJSONObj);
		
		//load the updated public idea basket into the UI
		basket.loadPublicIdeaBasket();
		
		if(isDisplayPublicIdeaBasket) {
			//display the public idea basket
			basket.displayPublicIdeaBasket();
		}
	}
};

View.prototype.displayStudentAssets = function() {
	this.initializeAssetEditorDialog();
};

/**
 * Send a chat message to the chat room
 * @param chatMessage the message
 */
View.prototype.sendChat = function (chatMessage) {
	this.xmpp.sendStudentToChatRoomMessage(chatMessage);
};

/**
 * Display the Chat Room popup
 */
View.prototype.displayChatRoom = function() {
	
	//check if the chatRoomDiv exists
	if($('#chatRoomDiv').size()==0){
		//it does not exist so we will create it
		$('#w4_vle').append('<div id="chatRoomDiv"><div id="chatRoomTextDisplay" style="height:85%;overflow:auto"></div><textarea id="chatRoomTextEntry" style="width:95%;height:40px"></textarea></div>');
		var title = this.getI18NString("chat_room");
		$('#chatRoomDiv').dialog({autoOpen:false,closeText:'',resizable:true,modal:true,show:{effect:"fade",duration:200},hide:{effect:"fade",duration:200},title:title,open:this.chatRoomDivOpen,close:this.chatRoomDivClose});
		
		$('#chatRoomTextEntry').keypress(function(event) {
			if(event.which == 13) {
				//the user has typed the enter key so we will submit the chat message
				var chatMessage = $("#chatRoomTextEntry").val();
				eventManager.fire("chatRoomTextEntrySubmitted", chatMessage);
				$("#chatRoomTextEntry").attr("value","");
				event.preventDefault();
			}
		});
    }
	
	/*
	 * check if the chat room div is hidden before trying to open it.
	 * if it's already open, we don't have to do anything
	 */
	if($('#chatRoomDiv').is(':hidden')) {
		//open the dialog
		var docHeight = $(document).height()-25;
		if(docHeight>499){
			docHeight = 500;
		}
		$('#chatRoomDiv').dialog({width:400,height:500});
		$('#chatRoomDiv').dialog('open');
	}	
};

/**
 * Display the idea basket dialog popup
 * @param responseText the JSON string representing the idea basket data
 * @param responseXML
 * @param args
 */
View.prototype.displayIdeaBasket = function() {

	if(!this.ideaBasket) {
		/*
		 * the vle failed to retrieve the idea basket so we will display
		 * an error message and not display the idea basket popup
		 */
		this.notificationManager.notify(this.getI18NString("idea_basket_retrieval_error"), 3);
		return;
	}
	
	//check if the ideaBasketDiv exists
	if($('#ideaBasketDiv').size()==0){
		//it does not exist so we will create it
		$('#w4_vle').append('<div id="ideaBasketDiv"></div>');
		$('#ideaBasketDiv').html('<iframe id="ideaBasketIfrm" name="ideaBasketIfrm" frameborder="0" width="100%" height="99%"></iframe><div id="ideaBasketOverlay" style="display:none;"></div>');
		
		var title = this.getI18NString("idea_basket");
		if('ideaManagerSettings' in this.getProjectMetadata().tools){
			var imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
			if('basketTerm' in imSettings && this.utils.isNonWSString(imSettings.basketTerm)){
				title = imSettings.basketTerm;
			}
		}
		
		$('#ideaBasketDiv').dialog({autoOpen:false,closeText:'',resizable:true,modal:true,show:{effect:"fade",duration:200},hide:{effect:"fade",duration:200},title:title,open:this.ideaBasketDivOpen,close:this.ideaBasketDivClose,
			// because idea basket content is delivered in an iframe
			// need to show transparent div overlay when dragging/resizing dialog
			// so that iframe does not catch mouse movements and interupt dragging/resizing
			dragStart: function(event, ui) {
				$('#ideaBasketOverlay').show();
			},
			dragStop: function(event, ui) {
				$('#ideaBasketOverlay').hide();
			},
			resizeStart: function(event, ui) {
				$('#ideaBasketOverlay').show();
			},
			resizeStop: function(event, ui) {
				$('#ideaBasketOverlay').hide();
			}
		});
    }
	
	/*
	 * check if the idea basket div is hidden before trying to open it.
	 * if it's already open, we don't have to do anything
	 */
	if($('#ideaBasketDiv').is(':hidden')) {
		// close all dialogs
		view.utils.closeDialogs();
		
		//open the dialog
		var docHeight = $(document).height()-25;
		if(docHeight>499){
			docHeight = 500;
		}
		$('#ideaBasketDiv').dialog({width:800,height:docHeight});
		$('#ideaBasketDiv').dialog('open');
		
		if($('#ideaBasketIfrm').attr('src') == null) {
			//set the src so it will load the ideaManager.html page
			$('#ideaBasketIfrm').attr('src', "ideaManager.html");
		} else {
			//generate the JSON string for the idea basket
			var ideaBasketJSON = $.stringify(this.ideaBasket);
			
			//generate the JSON object for the idea basket
			var ideaBasketJSONObj = $.parseJSON(ideaBasketJSON);
			
			/*
			 * the ideaManager.html has already previously been loaded
			 * so we just need to reload the idea basket contents
			 */
			var imSettings = null;
			if('ideaManagerSettings' in this.getProjectMetadata().tools){
				imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
			}
			window.frames['ideaBasketIfrm'].loadIdeaBasket(ideaBasketJSONObj, true, this, imSettings);
		}		
	}
};

/**
 * Called when the idea basket dialog popup is opened
 */
View.prototype.ideaBasketDivOpen = function() {
	/*
	 * remove href attribute in 'X' close link of ui-dialog, as clicking
	 * X to close dialog results in window request for '/vlewrapper/vle/#'
	 * after deleting/restoring an idea in the basket for some unknown
	 * reason when in preview mode
	 */
	$('.ui-dialog-titlebar-close',$(this).parent()).removeAttr('href');
};

/**
 * Called when the idea basket dialog popup is closed
 */
View.prototype.ideaBasketDivClose = function() {
	//check if the idea basket has changed
	if(window.frames['ideaBasketIfrm'] != null &&
			window.frames['ideaBasketIfrm'].basket != null &&
			window.frames['ideaBasketIfrm'].basket.isBasketChanged()) {
		/*
		 * idea basket has changed so we will save it back to the server
		 * thisView is accessed from window.frames['ideaBasketIfrm'] because
		 * this function is called from the context of the dialog popup
		 */
		window.frames['ideaBasketIfrm'].basket.saveIdeaBasket(window.frames['ideaBasketIfrm'].thisView);
		
		//set this value back to false because we are going to save it back to the server
		window.frames['ideaBasketIfrm'].basket.setBasketChanged(false);
	}
};

/**
 * Called when the ideaBasket has changed. This will be when the student
 * has changed the ideaBasket in the global idea basket or in an explanation
 * builder step and they close or exit them respectively. 
 * 
 * @param ideaBasketStep this is called from IdeaBasket.saveIdeaBasket(). 
 * If the idea basket is being saved from an idea basket step, 
 * the ideaBasketStep parameter will be set to the idea basket step object.
 * This is required because when the idea basket is being saved from
 * an idea basket step, the ideaBasketChanged() function in ideaBasketScript.js
 * does not have access to the global loadIdeaBasket() function and therefore
 * needs the ideaBasketStep object to call ideaBasketStep.loadIdeaBasket(). 
 */
View.prototype.ideaBasketChanged = function(ideaBasketStep) {
	var args = {};
	
	if(ideaBasketStep != null) {
		//set the idea basket step into the args
		args.ideaBasketStep = ideaBasketStep;
	}
	
	this.ideaBasket.updateToolbarCount();
	eventManager.fire('ideaBasketChanged', args);
};

/**
 * Get the idea baskets that are associated with the work that was flagged
 */
View.prototype.getFlaggedIdeaBaskets = function() {
	
	var workgroupIds = [];
	
	//loop through all the flags
	for(var x=0; x<this.flags.annotationsArray.length; x++) {
		//get a flag
		var flag = this.flags.annotationsArray[x];
		
		var nodeId = flag.nodeId;
		var node = this.getProject().getNodeById(nodeId);
		
		if(node.type == 'ExplanationBuilderNode') {
			/*
			 * the flag was for an explanation builder step so we
			 * will need to retrieve the idea basket from the
			 * classmate that this flag is for
			 */
			var toWorkgroup = flag.toWorkgroup;
			
			if(toWorkgroup != null) {
				//add the classmate workgroup id to our array
				workgroupIds.push(parseInt(toWorkgroup));
			}
		}
	}
	
	var workgroupIdsJSONArrayStr = $.stringify(workgroupIds);
	
	//set the params we will use in the request to the server
	var ideaBasketParams = {
		action:"getIdeaBasketsByWorkgroupIds",
		workgroupIds:workgroupIdsJSONArrayStr
	};
	
	//request the idea basket from the server
	this.connectionManager.request('GET', 3, this.getConfig().getConfigParam('getIdeaBasketUrl'), ideaBasketParams, this.getIdeaBasketsByWorkgroupIdCallback, {thisView:this});
};

/**
 * The callback for the getIdeaBasketsByWorkgroupIds request
 * @param text the idea baskets in a JSONArray string
 * @param responseXML
 * @param args
 */
View.prototype.getIdeaBasketsByWorkgroupIdCallback = function(text, responseXML, args) {
	//get the view
	var thisView = args.thisView;
	
	//parse the idea baskets array
	var ideaBasketsJSON = $.parseJSON(text);
	var ideaBaskets = [];
	
	//loop through all the idea basket JSON objects
	for(var x=0; x<ideaBasketsJSON.length; x++) {
		//create an IdeaBasket for each idea basket JSON object
		var ideaBasketJSON = ideaBasketsJSON[x];
		var ideaBasket = new IdeaBasket(ideaBasketJSON);
		
		//add it to our array if IdeaBasket objects
		ideaBaskets.push(ideaBasket);
	}
	
	//set the array of IdeaBasket objects into the view
	thisView.ideaBaskets = ideaBaskets;
	
	//display the flagged work now that we have the idea baskets
	thisView.displayFlaggedWork();
};

/**
 * Load the idea basket into the iframe
 */
View.prototype.loadIdeaBasket = function() {
	//generate the JSON string for the idea basket
	var ideaBasketJSON = $.stringify(this.ideaBasket);
	
	//generate the JSON object for the idea basket
	var ideaBasketJSONObj = $.parseJSON(ideaBasketJSON);
	
	var imSettings = null;
	if('ideaManagerSettings' in this.getProjectMetadata().tools){
		imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
	}
	
	//load the idea basket into the iframe
	window.frames['ideaBasketIfrm'].loadIdeaBasket(ideaBasketJSONObj, true, this, imSettings, this.ideaBasket.publicIdeaBasket);
};

/**
 * Create a new IdeaBasket in the context of the view. This is required because
 * there was an issue with creating the IdeaBasket in the context of basket.js
 * and it causing problems when the student tried to Add New Idea and receiving
 * an Idea not defined error.
 *  
 * @param ideaBasketJSONObj contains all the fields of an idea basket
 * @return a new IdeaBasket with fields populated
 */
View.prototype.createIdeaBasket = function(ideaBasketJSONObj) {
	var imSettings = null;
	if('ideaManagerSettings' in this.getProjectMetadata().tools){
		imSettings = this.getProjectMetadata().tools.ideaManagerSettings;
	}
	return new IdeaBasket(ideaBasketJSONObj,null,null,imSettings);
};

/**
 * Make an idea public
 * @param basket our idea basket
 * @param ideaId the idea id
 */
View.prototype.makeIdeaPublic = function(basket, ideaId) {
	//get the workgroup id
	var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
	
	//get the idea
	var idea = basket.getIdeaById(ideaId);
	
	//set this student's workgroup id into the idea
	idea.workgroupId = workgroupId;
	
	if(idea.publishers == null) {
		//create the publishers array if it does not already exist
		idea.publishers = [];
	}
	
	/*
	 * add an entry into the publishers array which will contain
	 * the idea id and workgroup id so we have a history that
	 * remembers who have published this idea
	 */
	var publisherEntry = {
		ideaId:parseInt(ideaId),
		workgroupId:parseInt(workgroupId)
	};
	
	idea.publishers.push(publisherEntry);
	
	/*
	 * clear out the workgroups that have copied since this will
	 * be a new public idea. workgroupIdsThatHaveCopied may contain
	 * elements if this idea was originally copied from the public
	 * basket.
	 */
	idea.workgroupIdsThatHaveCopied = [];
	
	idea.isPublishedToPublic = true;
	
	//get the idea as a string
	var ideaString = encodeURIComponent($.stringify(idea));
	
	//create the params for the request
	var ideaBasketParams = {
		action:"addPublicIdea",
		ideaId:ideaId,
		ideaString:ideaString,
		workgroupId:workgroupId
	};
	
	//make the request to add this idea as a public idea
	this.connectionManager.request('POST', 3, this.getConfig().getConfigParam('postIdeaBasketUrl'), ideaBasketParams, this.makeIdeaPublicCallback, {thisView:this, basket:basket, ideaId:ideaId});	
};

/**
 * Callback for making an idea public
 * @param responseText the public idea basket JSON string
 * @param responseXML
 * @param args
 */
View.prototype.makeIdeaPublicCallback = function(responseText, responseXML, args) {
	if(responseText != null && responseText != '') {
		//get our basket
		var basket = args.basket
			view = this;
		
		//get the public idea basket as a JSON object
		var publicIdeaBasketJSONObj = $.parseJSON(responseText);
		
		if(publicIdeaBasketJSONObj == null) {
			//we failed to retrieve the public idea basket
			alert(view.getI18NStringWithParams('ideaBasket_public_loadFailure', [basket.publicBasketTerm]));
		} else if(publicIdeaBasketJSONObj.errorMessage != null) {
			//there was an error so we will display the message in a popup
			alert(publicIdeaBasketJSONObj.errorMessage);
		} else {
			//set the sharing status to Public
			basket.setSharingStatusPublic();
			
			//set the updated public idea basket
			basket.setPublicIdeaBasket(publicIdeaBasketJSONObj);
			
			//load the updated public idea basket
			basket.loadPublicIdeaBasket();
			
			//get the idea that we made public
			var ideaId = args.ideaId;
			
			//get the idea
			var idea = basket.getIdeaById(ideaId);
			
			/*
			 * set this isPublishedToPublic field to true so we can easily tell
			 * if this idea is currently in the public idea basket
			 */
			idea.isPublishedToPublic = true;
			
			//make the idea row display the fact that the idea is public
			basket.makeIdeaRowPublic(ideaId);
		}
	}
};

/**
 * Make an idea private. This is makes a public idea no longer public.
 * @param basket our basket
 * @param ideaId the idea id to make private
 */
View.prototype.makeIdeaPrivate = function(basket, ideaId) {
	//get the workgroup id
	var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
	
	//get the params for making the request
	var ideaBasketParams = {
		action:"deletePublicIdea",
		ideaId:ideaId,
		workgroupId:workgroupId
	};
	
	//make the request to make this idea private
	this.connectionManager.request('POST', 3, this.getConfig().getConfigParam('postIdeaBasketUrl'), ideaBasketParams, this.makeIdeaPrivateCallback, {thisView:this, basket:basket, ideaId:ideaId});	
};

/**
 * Callback for making an idea private
 * @param responseText the public idea basket JSON string
 * @param responseXML
 * @param args
 */
View.prototype.makeIdeaPrivateCallback = function(responseText, responseXML, args) {
	if(responseText != null && responseText != '') {
		//get our basket
		var basket = args.basket,
			view = this;
		
		//get the public idea basket as a JSON object
		var publicIdeaBasketJSONObj = $.parseJSON(responseText);
		
		if(publicIdeaBasketJSONObj == null) {
			//we failed to retrieve the public idea basket
			alert(view.getI18NStringWithParams('ideaBasket_public_loadFailure', [basket.publicBasketTerm]));
		} else if(publicIdeaBasketJSONObj.errorMessage != null) {
			//there was an error so we will display it in a popup
			alert(publicIdeaBasketJSONObj.errorMessage);
		} else {
			//set the sharing status to private
			basket.setSharingStatusPrivate();
			
			//set the updated public idea basket
			basket.setPublicIdeaBasket(publicIdeaBasketJSONObj);
			
			//load the updated public idea basket
			basket.loadPublicIdeaBasket();
			
			//get the idea id of the idea we made private
			var ideaId = args.ideaId;
			
			//get the idea
			var idea = basket.getIdeaById(ideaId);
			
			/*
			 * set this isPublishedToPublic field to false so we can easily tell
			 * that this idea is not currently in the public idea basket
			 */
			idea.isPublishedToPublic = false;
			
			/*
			 * set the private idea basket to changed so it will save the 
			 * changes to our idea that we made public
			 */
			basket.setBasketChanged(true);
			
			//make the idea row display the fact that the idea is public
			basket.makeIdeaRowPrivate(ideaId);
		}
	}
};

/**
 * Copy a public idea
 * @param basket our basket
 * @param ideaWorkgroupId the workgroup id that owns the idea
 * @param ideaId the idea id
 */
View.prototype.copyPublicIdea = function(basket, ideaWorkgroupId, ideaId) {
	//get the current workgroup id
	var workgroupId = this.getUserAndClassInfo().getWorkgroupId(),
		view = this;
	
	//check if the idea exists in the private basket
	var isPublicIdeaInPrivateBasket = basket.isPublicIdeaInPrivateBasket(ideaWorkgroupId, ideaId);
	
	if(workgroupId == ideaWorkgroupId) {
		/*
		 * the student is trying to copy their own idea that is in
		 * the public basket which is not allowed
		 */ 
		alert(view.getI18NStringWithParams('ideaBasket_public_copyOwnIdeaError', [basket.ideaTerm]));
	} else if(isPublicIdeaInPrivateBasket) {
		//the public idea is already in the private basket
		alert(view.getI18NStringWithParams('ideaBasket_public_alreadyCopiedError', [basket.ideaTerm]));
	} else {
		//we will copy the public idea into our private basket
		var ideaBasketParams = {
			action:"copyPublicIdea",
			ideaId:ideaId,
			workgroupId:ideaWorkgroupId
		};
			
		//make the request to copy the public idea
		this.connectionManager.request('POST', 3, this.getConfig().getConfigParam('postIdeaBasketUrl'), ideaBasketParams, this.copyPublicIdeaCallback, {thisView:this, basket:basket, ideaWorkgroupId:ideaWorkgroupId, ideaId:ideaId});	
	}
};

/**
 * Callback for copying a public idea
 * @param responseText the public idea basket JSON string
 * @param responseXML
 * @param args
 */
View.prototype.copyPublicIdeaCallback = function(responseText, responseXML, args) {
	//get the view
	var thisView = args.thisView;
	
	//get the workgroup id of the owner of the public idea
	var ideaWorkgroupId = args.ideaWorkgroupId;
	
	//get the idea id
	var ideaId = args.ideaId;
	
	//get our basket
	var basket = args.basket;

	//get the workgroup id of the logged in student
	var workgroupId = thisView.getUserAndClassInfo().getWorkgroupId();
	
	if(responseText != null && responseText != '') {
		//create the public idea basket JSON object
		var publicIdeaBasketJSONObj = $.parseJSON(responseText);
		
		if(publicIdeaBasketJSONObj == null) {
			//we failed to retrieve the public idea basket
			alert(view.getI18NStringWithParams('ideaBasket_public_loadFailure', [basket.publicBasketTerm]));
		} else {
			if(publicIdeaBasketJSONObj.errorMessage != null) {
				//there was an error so we will display it in a popup
				alert(publicIdeaBasketJSONObj.errorMessage);
			}
			
			if(publicIdeaBasketJSONObj.ideas != null) {
				/*
				 * the public idea basket was returned which means we will
				 * copy the public idea and make a private idea from it
				 */
				
				//get all the public ideas
				var publicIdeas = publicIdeaBasketJSONObj.ideas;
				var copiedPublicIdea = null;
				
				if(publicIdeas != null) {
					//loop through all the public ideas
					for(var x=0; x<publicIdeas.length; x++) {
						//get a public idea
						var publicIdea = publicIdeas[x];
						
						//get the public idea workgroup id
						var tempWorkgroupId = publicIdea.workgroupId;
						
						//get the public idea id
						var tempIdeaId = publicIdea.id;
						
						if(ideaWorkgroupId == tempWorkgroupId && ideaId == tempIdeaId) {
							//we have found the public idea that we want to copy
							
							//create a copy of the public idea
							var copiedPublicIdeaString = $.stringify(publicIdea);
							copiedPublicIdea = $.parseJSON(copiedPublicIdeaString);
							
							break;
						}
					}
				}
				
				if(copiedPublicIdea != null) {
					/*
					 * set the workgroup id in the idea to the logged in workgroup id
					 * since the logged in workgroup id is now the owner of this idea
					 * since it is a private idea
					 */
					copiedPublicIdea.workgroupId = workgroupId;
					
					//set the new idea id
					var ideaId = basket.getNextIdeaIdAndIncrement();
					copiedPublicIdea.id = ideaId;
					
					//add the idea to the private idea basket
					copiedPublicIdea.wasCopiedFromPublic = true;
					copiedPublicIdea.isPublishedToPublic = false;
					basket.ideas.push(copiedPublicIdea);
					basket.addRow(0, copiedPublicIdea, true);
					basket.updateToolbarCount();
					basket.setBasketChanged(true);
					
					//save the idea basket back to the server
					basket.saveIdeaBasket(thisView, 'addPrivateIdea', workgroupId, ideaId);
					
					alert(view.getI18NStringWithParams('ideaBasket_public_copySuccess', [basket.ideaTerm, basket.publicBasketTerm]));
				}
				
				//update the public idea basket
				
				//set the updated public idea basket
				basket.setPublicIdeaBasket(publicIdeaBasketJSONObj);
			}
		}		
	}
};

/**
 * Add a workgroup id back into the workgroupIdsThatHaveCopied array for
 * a public idea. This is used when a student copies a public idea, then
 * trashes it, then revives it. When the public idea is revived, we need
 * to add the student's workgroup id back into the workgroupIdsThatHaveCopied
 * array for that public idea.
 * @param basket our idea basket
 * @param ideaWorkgroupId the workgroup id that owns the public idea
 * @param ideaId the idea id
 */
View.prototype.addWorkgroupToWorkgroupIdsThatHaveCopied = function(basket, ideaWorkgroupId, ideaId) {
	//we will make a request to add the workgroup id back into the workgroupIdsThatHaveCopied array
	var ideaBasketParams = {
		action:"copyPublicIdea",
		ideaId:ideaId,
		workgroupId:ideaWorkgroupId
	};
		
	//make the request to copy the public idea
	this.connectionManager.request('POST', 3, this.getConfig().getConfigParam('postIdeaBasketUrl'), ideaBasketParams, this.addWorkgroupToWorkgroupIdsThatHaveCopiedCallback, {thisView:this, basket:basket, ideaWorkgroupId:ideaWorkgroupId, ideaId:ideaId});	
};

/**
 * Callback for adding a workgroup id to the workgroupIdsThatHaveCopied
 * array for a public idea.
 * @param responseText the public idea basket JSON string
 * @param responseXML
 * @param args
 */
View.prototype.addWorkgroupToWorkgroupIdsThatHaveCopiedCallback = function(responseText, responseXML, args) {
	if(responseText != null && responseText != '') {
		//get our basket
		var basket = args.basket,
			view = this;
		
		//get the public idea basket as a JSON object
		var publicIdeaBasketJSONObj = $.parseJSON(responseText);
		
		if(publicIdeaBasketJSONObj == null) {
			//we failed to retrieve the public idea basket
			alert(view.getI18NStringWithParams('ideaBasket_public_loadFailure', [basket.publicBasketTerm]));
		} else if(publicIdeaBasketJSONObj.errorMessage != null) {
			//there was an error so we will display the message in a popup
			alert(publicIdeaBasketJSONObj.errorMessage);
		} else {
			//set the updated public idea basket
			basket.setPublicIdeaBasket(publicIdeaBasketJSONObj);
			
			//load the updated public idea basket
			basket.loadPublicIdeaBasket();
		}
	}
};

/**
 * Uncopy a public idea. This occurs when a public idea is copied and becomes
 * and private idea. Then that private idea is moved to the trash. We need
 * to make a request when this happens because we keep track of all the
 * workgroup ids that have copied the public idea. We will need to remove
 * this workgroup id from that array that is used to keep track.
 * @param basket our idea basket
 * @param ideaId the idea id to uncopy
 */
View.prototype.uncopyPublicIdea = function(basket, ideaId) {
	//get the currently logged in workgroup id
	var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
	
	//get the idea
	var idea = basket.getIdeaById(ideaId);
	
	if(idea.wasCopiedFromPublic) {
		/*
		 * the idea was copied from the public basket so we will
		 * make a request to uncopy it
		 */

		var publishers = idea.publishers;
		var publisherIdeaId = null;
		var publisherWorkgroupId = null;
		
		if(publishers != null && publishers.length > 0) {
			var publisher = null;
			
			if(idea.isPublishedToPublic) {
				/*
				 * the publishers will contain the publisher that originally
				 * pushed the idea to the public basket and will also contain
				 * this workgroup that has copied and also published this idea
				 * to the public basket. we want the publisher that originally
				 * pushed the idea to the public basket so we will get the
				 * element at length - 2 
				 */
				publisher = publishers[publishers.length - 2];
			} else {
				/*
				 * get the publisher that originally pushed the idea to
				 * the public basket
				 */
				publisher = publishers[publishers.length - 1];
			}
			
			if(publisher != null) {
				publisherIdeaId = publisher.ideaId;
				publisherWorkgroupId = publisher.workgroupId;
			}
		}
		
		var ideaBasketParams = {
			action:"uncopyPublicIdea",
			ideaId:publisherIdeaId,
			workgroupId:publisherWorkgroupId
		};

		//make the request to uncopy the idea
		this.connectionManager.request('POST', 3, this.getConfig().getConfigParam('postIdeaBasketUrl'), ideaBasketParams, this.uncopyPublicIdeaCallback, {thisView:this, basket:basket, workgroupId:workgroupId, ideaId:ideaId});	
	}
};

/**
 * Callback for uncopying an idea
 * @param responseText the public idea basket as a JSON string
 * @param responseXML
 * @param args
 */
View.prototype.uncopyPublicIdeaCallback = function(responseText, responseXML, args) {
	var thisView = args.thisView,
		workgroupId = args.workgroupId,
		ideaId = args.ideaId,
		basket = args.basket;
	
	if(responseText != null && responseText != '') {
		//get the public idea basket as a JSON object
		var publicIdeaBasketJSONObj = $.parseJSON(responseText);
		
		if(publicIdeaBasketJSONObj == null) {
			//we failed to retrieve the public idea basket
			alert(thisView.getI18NStringWithParams('ideaBasket_public_loadFailure', [basket.publicBasketTerm]));
		} else if(publicIdeaBasketJSONObj.errorMessage != null) {
			//there was an error so we will display the message in a popup
			alert(publicIdeaBasketJSONObj.errorMessage);
		} else {
			//update the public idea basket
			
			//set the updated public idea basket
			basket.setPublicIdeaBasket(publicIdeaBasketJSONObj);
			
			//load the updated public idea basket
			basket.loadPublicIdeaBasket();
		}
	}
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_topmenu.js');
}
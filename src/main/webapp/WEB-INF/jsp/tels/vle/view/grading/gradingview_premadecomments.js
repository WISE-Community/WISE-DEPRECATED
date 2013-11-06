
/**
 * Opens a new popup window that will be used to display the premade
 * comment UI
 * @param commentBoxId the dom id of the textarea that the premade comment
 * will be inserted into in the grading page
 * @param studentWorkColumnId the dom id of the element that contains the
 * student work in the grading page
 */
View.prototype.openPremadeComments = function(commentBoxId, studentWorkColumnId) {
	/*
	 * close any existing instances of the premade comment window.
	 * we only want to display one popup window at a time because
	 * each popup window is linked to a specific student work since
	 * we need to know which comment box to insert the premade
	 * comment into
	 */
	if(this.premadeCommentsWindow) {
		this.premadeCommentsWindow.close();	
	}
	
	//open the premade comment window
	var premadeCommentsWindow = window.open('./premadecomments.html', 'premadeCommentsWindow', 'width=800,height=600,scrollbars=1');
	
	if(window.focus) {
		//give the premade comment window focus
		premadeCommentsWindow.focus();
	}

	//inject the event manager and script loader and the view
	premadeCommentsWindow.eventManager = this.eventManager;
	premadeCommentsWindow.scriptloader = this.scriptloader;
	premadeCommentsWindow.view = this;
	
	//remember these values so we can access them later
	this.premadeCommentsWindow = premadeCommentsWindow;
	this.commentBoxId = commentBoxId;
	this.studentWorkColumnId = studentWorkColumnId;
	
	if(!this.premadeCommentsSubscribed) {
		/*
		 * subscribe to the scriptsLoaded event for the premade comment window
		 * so that we know when we can begin retrieval of the premade comments.
		 * we only want to perform this subscribe once otherwise the
		 * callback function this.premadeCommentScriptsLoaded will be called
		 * multiple times.
		 */
		eventManager.subscribe('scriptsLoaded', this.premadeCommentScriptsLoaded, {id:'premadeCommentWindow', view:this});
		this.premadeCommentsSubscribed = true;
	}
	
	
	return false;
};

/**
 * Tells the premade comment window to load the scripts it requires to run such
 * as the editinplace and the sortable
 */
View.prototype.premadeCommentWindowLoaded = function() {
	//the loadScripts() function is in premadecomments.html
	this.premadeCommentsWindow.loadScripts();
};

/**
 * The callback function for when all the scripts have been loaded
 * @param type
 * @param args an array that contains the id of the object that
 * originated the call to load scripts, in this case the id is
 * 'premadeCommentWindow'. this is the 3rd argument when 
 * scriptloader.loadScripts() is called in
 * this.premadeCommentsWindow.loadScripts()
 * @param obj an object that contains an id attribute and a view attribute
 * @return
 */
View.prototype.premadeCommentScriptsLoaded = function(type, args, obj) {
	//compare the id
	if(obj.id == args[0]) {
		//obtain the view
		var thisView = obj.view;
		
		//get the premade comments
		thisView.getPremadeComments();		
	}
};

/**
 * Retrieves the premade comments if we haven't before and
 * then renders the premade comments interface. If the
 * user has opened the premade comments window before
 * we should already have the premade comments from before
 * so we don't need to retrieve them again.
 */
View.prototype.getPremadeComments = function() {
	//check if we have retrieved premade comments before
	if(this.premadeCommentLists) {
		//we have retrieved premade comments before so we just need to render them
		this.renderPremadeComments();
	} else {
		//we have not retrieved premade comments before so we need to retrieve them
		
		//get the url that will retrieve the premade comments
		var getPremadeCommentsUrl = this.getConfig().getConfigParam('getPremadeCommentsUrl');
		
		//callback when we have received the premade comments from the server
		var getPremadeCommentsCallback = function(text, xml, args) {
			var thisView = args[0];

			thisView.premadeCommentLists = $.parseJSON(text);
			thisView.renderPremadeComments();
		};
		
		//called when we fail to retrieve the premade comments from the server
		var getPremadeCommentsCallbackFail = function(text, args) {
			//alert("fail: " + text);
		};
		
		var getPremadeCommentsArgs = {};
		
		if(this.authoringMode && this.portalProjectId != null) {
			/*
			 * we are in the authoring tool so we will pass in the project id
			 * that we are currently working on in case we do not have any
			 * premade comments lists for this project and the server needs
			 * to create a new list and give it a name such as
			 * "Project 684 Premade Comment List". the portalProjectId will be
			 * null if the user is opening the premade comments from the teacher
			 * home page. in this case we do not want to set a projectId in
			 * our request because we want to display all their premade comment
			 * lists.
			 */
			getPremadeCommentsArgs['projectId'] = this.portalProjectId;
		}
		
		//make the request for the premade comments
		this.connectionManager.request('GET', 1, getPremadeCommentsUrl, getPremadeCommentsArgs, getPremadeCommentsCallback, [this], getPremadeCommentsCallbackFail);
	}
};

/**
 * Posts premade comment data back to the server. This handles all premade comments
 * posting. Some of the parameters are optional depending on what kind of post
 * request we are making.
 * e.g. if we are changing the premadeComment text, we do not need to pass
 * in the premadeComentLabels
 * @param premadeCommentAction the type of premade comment data we are sending
 * back to the server such as
 * 'addComment'
 * 'editComment'
 * 'deleteComment'
 * 'reOrderCommentList'
 * 
 * @param postPremadeCommentsCallback the callback function that is called after
 * the post has succeeded
 * @param premadeCommentListId the id of the premade comment list
 * @param premadeCommentListLabel the name of the premade comment list
 * @param premadeCommentId the id of the premade comment
 * @param premadeComment the comment string
 * @param isGlobal whether we are dealing with a global element
 * @param premadeCommentListPositions the positions of the premade comments within a list
 * @param premadeCommentLabels the labels string for a premade comment
 * @param projectId the project id
 */
View.prototype.postPremadeComments = function(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId) {
	//get the url that will post the premade comment to the server
	var postPremadeCommentsUrl = this.getConfig().getConfigParam('postPremadeCommentsUrl');
	
	//called when we fail to send the premade comment data to the server
	var postPremadeCommentsCallbackFail = function(text, args) {
		//alert("fail: " + text);
	};
	
	//the post parameters
	var postPremadeCommentsArgs = {
			premadeCommentAction:premadeCommentAction,
			premadeCommentListId:premadeCommentListId,
			premadeCommentListLabel:premadeCommentListLabel,
			premadeCommentId:premadeCommentId,
			premadeComment:premadeComment,
			premadeCommentLabels:premadeCommentLabels,
			isGlobal:isGlobal,
			projectId:projectId,
			premadeCommentListPositions:premadeCommentListPositions
	};
	
	//make the post to the server
	this.connectionManager.request('POST', 1, postPremadeCommentsUrl, postPremadeCommentsArgs, postPremadeCommentsCallback, [this, postPremadeCommentsArgs], postPremadeCommentsCallbackFail);
};

/**
 * Filter the premade comment lists to only contain lists that have the
 * given projectId
 * @param projectId the project id we want premade comment lists for. if null
 * is passed in to this function, we will not perform any filtering.
 * @returns an array of premade comment lists that have the given project id
 */
View.prototype.filterPremadeCommentListsByProjectId = function(projectId) {

	/*
	 * do not perform any filtering if projectId is null. the project id
	 * will be null when the user clicks on "Edit Premade Comments" from
	 * the portal because in that case there is no specific project id they
	 * are trying to open.
	 */
	if(projectId == null) {
		return this.premadeCommentLists;
	}
	
	var filteredPremadeCommentLists = [];
	
	//loop through all the premade comment lists
	for(var x=0; x<this.premadeCommentLists.length; x++) {
		//get a premade comment list
		var premadeCommentList = this.premadeCommentLists[x];
		
		//get the project id of the premade comment list if any
		var premadeCommentListProjectId = premadeCommentList.projectId;
		
		if(premadeCommentListProjectId == projectId) {
			//we have found a premade comment list with the project id we want
			filteredPremadeCommentLists.push(premadeCommentList);
		}
	}
	
	return filteredPremadeCommentLists;
};

/**
 * Render the premade comments interface
 */
View.prototype.renderPremadeComments = function() {
	//get the div that we will put the premade comment lists into
	var premadeCommentsListsDiv = this.premadeCommentsWindow.document.getElementById('premadeCommentsListsDiv');
	
	//check if we are authoring premade comments from the authoring tool
	if(this.authoringMode) {
		//we are in authoring mode
		
		//obtain only the premade comment lists with the current project id we are authoring
		this.premadeCommentLists = this.filterPremadeCommentListsByProjectId(this.portalProjectId);
	} else {
		//we are not in the authoring tool
		
		//get the student work from the element in the original grading page
		var studentWork = $('#' + this.studentWorkColumnId).html();
		
		//get the id of the comment box in the grading page
		var commentBoxId = '#' + this.commentBoxId.replace('.', '\\.');
		
		//get the existing comment
		var existingComment = $(commentBoxId).attr('value');
		
		//populate the premade comment submit box with the existing comment
		$('#premadeCommentsTextArea', this.premadeCommentsWindow.document).attr('value', existingComment);
		
		//find the index of the timestamp in the student work
		var indexOfTimestamp = studentWork.indexOf('<br><br><br><p class="lastAnnotationPostTime">');
		
		//remove the timestamp from the student work
		studentWork = studentWork.substring(0, indexOfTimestamp);
		
		//display the student work in the premade comments window
		$('#premadeCommentsStudentWorkDiv', this.premadeCommentsWindow.document).html(studentWork);	
	}
	
	var userLoginName = '';
	
	//get the user login name that they use to sign in
	if(this.authoringMode) {
		//we are in authoring mode so we will get the username from the config
		userLoginName = this.getConfig().getConfigParam('username');
	} else {
		//we are not in authoring mode so we will get it from the userandclassinfo
		userLoginName = this.getUserAndClassInfo().getUserLoginName();
	}
	
	//loop through all the premade comment lists
	for(var x=0; x<this.premadeCommentLists.length; x++) {
		//get a premade comment list
		var premadeCommentList = this.premadeCommentLists[x];
		
		//check if the signed in user is the owner of this list
		var signedInUserIsOwner = false;
		if(userLoginName == premadeCommentList.owner) {
			signedInUserIsOwner = true;
		}
		
		var premadeCommentsListDiv = this.createPremadeCommentsListDiv(premadeCommentList,signedInUserIsOwner);
		
		//put this premadeCommentsListDiv in the premadeCommentsListsDiv to display it
		$(premadeCommentsListsDiv).append(premadeCommentsListDiv);
		
		//allow user to edit the premadecomment label in place
		if(signedInUserIsOwner) {
			//make the label editable in place if the user owns this list
			this.makePremadeCommentListLabelEditable(premadeCommentList.id);
			
			//make the comments in the list editable in place
			this.makePremadeCommentListEditable(premadeCommentList);
		}
	}
	
	//make the lists that this user owns sortable
	this.makePremadeCommentListsSortable();
		
	//show a drop-down list of premade comment lists. order alphabetically by title.
	this.premadeCommentLists.sort(this.sortPremadeCommentsListByLabelAlphabetical);
	
	//id of premadecommentsList to show at the beginning. See if last-shown list was stored in localstorage.
	var premadeCommentsListIdToShow = this.premadeCommentLists[0].id;
	
	var premadeCommentsListLabelDD = $("<select>").attr("id","premadeCommentsListLabelDD");
	for (var i=0; i<this.premadeCommentLists.length; i++) {
		var premadeCommentLists = this.premadeCommentLists[i];
		
		var premadeCommentsListLabelDDItem = $("<option>").attr("id",'premadeCommentsListLabelDDItem_' + premadeCommentLists.id).attr("value", premadeCommentLists.id).text(premadeCommentLists.label);
		if (premadeCommentsListIdToShow == premadeCommentLists.id) {
			//if this is the premadeCommentListId to show, select it in the select dropdown list
			premadeCommentsListLabelDDItem.attr("selected","selected");
		};
		
		premadeCommentsListLabelDD.append(premadeCommentsListLabelDDItem);
	}
	
	var thisView = this;
	
	premadeCommentsListLabelDD.change({"thisView":thisView}, function() {
		//the teacher has changed the option in the drop down
	
		//get the value of the option chosen
		var listIdChosen = $(this).val();
		
		//now hide all the lists except the last one that user had opened, or the first one if none exists.
		$(premadeCommentsListsDiv).find(".premadeCommentsListDiv").hide();
		
		//show just the selected premadecommentslist div.
		$(premadeCommentsListsDiv).find("#premadeCommentsListDiv_" + listIdChosen).show();		
		
		/*
		 * save the current state of the premade comments so that it
		 * can be restored the next time the user opens up the premade
		 * comments again
		 */
		thisView.savePremadeCommentsState();
	});
	
	//add option to add a new list at the bottom of the drop-down
	var newPremadeCommentsListDDItem = $("<option>").attr("id","newPremadeCommentsListDDItem").attr("value","newPremadeCommentstList").text("CREATE NEW LIST...");
	newPremadeCommentsListDDItem.click({"thisView":this},function(event) {
		var thisView = event.data.thisView;
		//arguments used in the server post
		var premadeCommentAction = 'addCommentList';
		var postPremadeCommentsCallback = thisView.newPremadeCommentListCallback;
		var premadeCommentId = null;
		var premadeComment = null;
		var premadeCommentListId = null;
		var premadeCommentListLabel = "My New List";
		var isGlobal = null;
		var premadeCommentListPositions = null;
		var premadeCommentLabels = null;
		var projectId = null;
		
		if(thisView.authoringMode) {
			/*
			 * we are in authoring mode so we will pass in the project id
			 * and null for the label because the server will generate
			 * the label for us and populate it with the project id, run id,
			 * and project/run name
			 */
			projectId = thisView.portalProjectId;
			premadeCommentListLabel = null;
		}

		//make the request to edit the premade comment on the server
		thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);		
	});
	premadeCommentsListLabelDD.append(newPremadeCommentsListDDItem);
	
	
	$(premadeCommentsListsDiv).prepend(premadeCommentsListLabelDD);
	
	//now hide all the lists except the last one that user had opened, or the first one if none exists.
	$(premadeCommentsListsDiv).find(".premadeCommentsListDiv").hide();
	
	//show just the selected premadecommentslist div.
	$(premadeCommentsListsDiv).find("#premadeCommentsListDiv_"+premadeCommentsListIdToShow).show();
	
	if(this.authoringMode) {
		//we are in authoring mode
		
		//obtain only the premade comment lists with the current project id we are authoring
		this.premadeCommentLists = this.filterPremadeCommentListsByProjectId(this.portalProjectId);
		
		$('#premadeCommentsTextArea', this.premadeCommentsWindow.document).hide();
		$('#premadeCommentsSubmitButton', this.premadeCommentsWindow.document).hide();
	}
	
	//this call will remove the loading message and make the UI elements visible
	this.renderPremadeCommentsComplete();
	
	//display the premade comment list that was last open and check the checkboxes there were previously checked
	this.restorePremadeCommentsState();
};

/**
 * Creates and returns a div for the specified premade comment list.
 * @param premadeCommentList premade comment list
 * @return div for the premade comment list
 */
View.prototype.createPremadeCommentsListDiv = function(premadeCommentList,signedInUserIsOwner) {
	
	//get the id of the list
	var premadeCommentListId = premadeCommentList.id;
	
	//get the label of the list
	var premadeCommentListLabel = premadeCommentList.label;
	
	//sort premade comment list by premade comment listposition
	premadeCommentList.premadeComments = this.sortPremadeCommentList(premadeCommentList.premadeComments);
	
	
	//make a div for this premadecommentslist.
	var premadeCommentsListDiv = $("<div>").attr("id", "premadeCommentsListDiv_"+premadeCommentListId).addClass("premadeCommentsListDiv");
	
	//get the name of the premade comment list
	var premadeCommentListLabelP = $("<p>").attr("id","premadeCommentsListP_"+premadeCommentListId)
		.addClass("premadeCommentsListP").css("display","inline").html(premadeCommentListLabel);
	
	
	//add the premade comment list name to the div
	premadeCommentsListDiv.append(premadeCommentListLabelP);
	premadeCommentsListDiv.append("<br>");
	
	if(signedInUserIsOwner) {
		//create the button that the user will use to add a new premade comment
		var premadeCommentListAddCommentButton = createElement(this.premadeCommentsWindow.document, 'input', {type:'button', id:'premadeCommentListAddCommentButton_' + premadeCommentListId, 'class':'premadeCommentListAddCommentButton', value:'Add New Comment', onclick:'view.addPremadeComment(' + premadeCommentListId + ')'});

		//add the premade comment add comment button to the div
		premadeCommentsListDiv.append(premadeCommentListAddCommentButton);			
		
		//create the button that the user will use to delete this list
		var premadeCommentListDeleteListButton = createElement(this.premadeCommentsWindow.document, 'input', {type:'button', id:'premadeCommentListDeleteListButton_' + premadeCommentListId, 'class':'premadeCommentListDeleteListButton', value:'Delete This List', onclick:'view.deletePremadeCommentList(' + premadeCommentListId + ')'});

		//add the premade comment add comment button to the div
		premadeCommentsListDiv.append(premadeCommentListDeleteListButton);
	}
	
	//create the button that will uncheck all the label checkboxes
	var premadeCommentListUncheckCheckboxesButton = createElement(this.premadeCommentsWindow.document, 'input', {type:'button', id:'premadeCommentListUncheckCheckboxesButton_' + premadeCommentListId, value:'Uncheck All Labels', onclick:'view.premadeCommentListUncheckLabels(' + premadeCommentListId + ')', disabled:true});

	//add the uncheck label checkboxes button to the div
	premadeCommentsListDiv.append(premadeCommentListUncheckCheckboxesButton);
	
	//get an array of unique labels that are used in this list
	var labels = this.getPremadeCommentLabelsFromList(premadeCommentListId);
	
	if(labels.length == 0) {
		//there are no labels so we will disable the "Uncheck All Labels" button
		$(premadeCommentListUncheckCheckboxesButton).attr('disabled', true);
	}
	
	//make the div to contain the label checkboxes
	var premadeCommentsListLabelsDiv = $("<div>").attr("id", "premadeCommentsListLabelsDiv_" + premadeCommentListId);
	
	//generate the label checkboxes inside the div
	this.premadeCommentsGenerateLabelCheckboxes(premadeCommentListId, premadeCommentsListLabelsDiv, labels);
	
	//add the label checkboxes div to the main div
	premadeCommentsListDiv.append(premadeCommentsListLabelsDiv);
	
	/*
	 * if the signed in user is the owner, we will give it the
	 * 'myPremadeCommentList' class so that it will be sortable
	 */
	var premadeCommentListULClass = "";
	if(signedInUserIsOwner) {
		premadeCommentListULClass = 'myPremadeCommentList';
	}
	
	//create the UL element that will hold all the premade comments in this list
	var premadeCommentListUL = createElement(this.premadeCommentsWindow.document, 'ul', {id:'premadeCommentUL_' + premadeCommentListId, style:'margin-left: 0px; padding-left: 0px', 'class':premadeCommentListULClass});
	
	//put this UL into the premadeCommentsListDiv
	premadeCommentsListDiv.append(premadeCommentListUL);
	

	//loop through all the premade comments in the list
	for(var y=0; y<premadeCommentList.premadeComments.length; y++) {
		//get a premade comment
		var premadeComment = premadeCommentList.premadeComments[y];
		
		//get the id of the premade comment
		var premadeCommentId = premadeComment.id;
		
		//get the comment
		var comment = premadeComment.comment;
		
		//get the labels
		var labels = premadeComment.labels;
		
		//create the premade comment LI
		var premadeCommentLI = this.createPremadeCommentLI(premadeCommentId, comment, premadeCommentListId, signedInUserIsOwner, labels);
		
		//add the LI to the UL
		premadeCommentListUL.appendChild(premadeCommentLI);
	}
	
	return premadeCommentsListDiv;
};

/**
 * Sort the premade comment list by premade comment list positions
 * in descending order (largest first, smallest last)
 * @param an array of premade comments
 */
View.prototype.sortPremadeCommentList = function(premadeCommentList) {
	premadeCommentList = premadeCommentList.sort(this.sortPremadeCommentListByListPositions);
	
	return premadeCommentList;
};

/**
 * A sorting function used as an argument to array.sort() to sort premade
 * comment list labels alphabetically
 * @param a some premade comment list
 * @param b some premade comment list
 * @return
 * true if b comes after a
 * false if a comes after b
 */
View.prototype.sortPremadeCommentsListByLabelAlphabetical = function(a, b) {
	var aListLabel = a.label.toLowerCase();
	var bListLabel = b.label.toLowerCase();
	return aListLabel > bListLabel;
};

/**
 * A sorting function used as an argument to array.sort() to sort premade
 * comments in a premade comment list in descending order (largest first,
 * smallest last)
 * @param a some premade comment
 * @param b some premade comment
 * @return
 * true if b comes after a
 * false if a comes after b
 */
View.prototype.sortPremadeCommentListByListPositions = function(a, b) {
	var aListPosition = a.listPosition;
	var bListPosition = b.listPosition;
	
	return aListPosition < bListPosition;
};

/**
 * Make the premade comment lists sortable
 */
View.prototype.makePremadeCommentListsSortable = function() {
	//null check the window and the function in the html page
	if(this.premadeCommentsWindow && this.premadeCommentsWindow.makeSortable) {
		/*
		 * call the function in the premadecomments.html to make the lists
		 * sortable. this is required because for some reason the function
		 * call does not work if I call it here within the view so I had
		 * to call it within the premadecomments.html
		 */ 
		this.premadeCommentsWindow.makeSortable(this);
	}
};

/**
 * Called when the user chooses a premade comment to use
 * @param premadeCommentDOMId the dom id of the element that contains
 * the premade comment text
 */
View.prototype.selectPremadeComment = function(premadeCommentDOMId) {
	//obtain the text already in the text area
	var existingCommentText = $('#premadeCommentsTextArea', this.premadeCommentsWindow.document).attr('value');
	
	if(existingCommentText != '') {
		//add a new line if text already exists in the textarea
		existingCommentText = existingCommentText + '\n';
	}
	
	/*
	 * retrieve the premade comment text that was chosen and append it
	 * into the text area at the bottom of the premade comments window
	 * so the user can view it and modify it if they decide to do so
	 */
	$('#premadeCommentsTextArea', this.premadeCommentsWindow.document).attr('value', existingCommentText + $('#' + premadeCommentDOMId, this.premadeCommentsWindow.document).html());
};

/**
 * Called when the user is satisfied with the premade comment feedback
 * and wants to insert it into the comment box back in the original
 * grading page
 * @return
 */
View.prototype.submitPremadeComment = function() {
	//get the comment text the teacher has chosen to submit
	var commentText = $('#premadeCommentsTextArea', this.premadeCommentsWindow.document).attr('value');
	
	/*
	 * obtain the value in the premade comment text area and insert it
	 * into the comment box in the grading page.
	 * the commentBoxId requires . escaping because the id is comprised
	 * of values one of which includes the nodeId which may contains .
	 * characters and jquery uses . as a special identifier character
	 * 
	 */
	var commentBoxId = '#' + this.commentBoxId.replace('.', '\\.');
	
	/*
	 * set the value and the html because the value is what is saved
	 * and the html is what is displayed
	 */
	$(commentBoxId).attr('value', commentText);
	$(commentBoxId).html(commentText);
	
	//give the comment box back in the original grading page focus
	$(commentBoxId).focus();
	
	//remove the focus so that the textarea will save since it saves on blur
	$(commentBoxId).blur();
	
	//close the premade comment window
	this.premadeCommentsWindow.close();
};

/**
 * Create the call to add a new premade comment to a list
 * @param premadeCommentListId the id of the premade comment list
 */
View.prototype.addPremadeComment = function(premadeCommentListId) {
	//arguments used in the server request to create a new comment
	var premadeCommentAction = 'addComment';
	var postPremadeCommentsCallback = this.addPremadeCommentCallback;
	var premadeCommentListLabel = null;
	var premadeCommentId = null;
	var premadeComment = null;
	var isGlobal = null;
	var premadeCommentListPositions = null;
	var premadeCommentLabels = null;
	var projectId = null;
	
	//make the request to create a new comment
	this.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);
};

/**
 * Called after the server creates a new comment
 * @param text the JSON of the new comment
 * @param xml
 * @param args
 */
View.prototype.addPremadeCommentCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//parse the premade comment
	var premadeComment = $.parseJSON(text);
	
	//obtain the premade comment list id
	var premadeCommentListId = premadeComment.premadeCommentListId;
	
	//obtain the premade comment id
	var premadeCommentId = premadeComment.id;
	
	//this is a new comment so the comment will be empty
	var premadeCommentMessage = premadeComment.comment;
	
	//this is a new comment so the labels will be empty
	var premadeCommentLabels = premadeComment.labels;
	
	//create the LI element for the premade comment
	var premadeCommentLI = thisView.createPremadeCommentLI(premadeCommentId, premadeCommentMessage, premadeCommentListId, true, premadeCommentLabels);
	
	//add the premade comment LI to the top of the premade comment list UL
	$('#premadeCommentUL_' + premadeCommentListId, thisView.premadeCommentsWindow.document).prepend(premadeCommentLI);
	
	//make the premade comment LI editable
	thisView.makePremadeCommentEditable(premadeCommentId);
	
	//make the premade comment labels editable
	thisView.makePremadeCommentLabelsEditable(premadeCommentId);
	
	//add the premade comment to our local array of premade comments
	thisView.addPremadeCommentLocally(premadeCommentListId, premadeComment);
};

/**
 * Add the premade comment to our local copy of the premade comment list
 * @param premadeCommentListId the id of the premade comment list to add
 * the new premade comment to
 * @param premadeComment the new premade comment
 */
View.prototype.addPremadeCommentLocally = function(premadeCommentListId, premadeComment) {
	//get the premade comment list
	var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListId);
	
	/*
	 * add the premade comment to the premade comments array in the
	 * premade comment list object
	 */ 
	premadeCommentList.premadeComments.push(premadeComment);
};


/**
 * Create the call to delete a premade comment list
 * @param premadeCommentListId the id of the premade comment list to delete
 */
View.prototype.deletePremadeCommentList = function(premadeCommentListId) {
	//first confirm with user that they want to delete this list
	var doDelete = this.premadeCommentsWindow.confirm("Are you sure you want to delete this list? This action cannot be undone.");
	if (doDelete) {
		//arguments used in the server request to create a new comment
		var premadeCommentAction = 'deleteCommentList';
		var postPremadeCommentsCallback = this.deletePremadeCommentListCallback;
		var premadeCommentListLabel = null;
		var premadeCommentId = null;
		var premadeComment = null;
		var isGlobal = null;
		var premadeCommentListPositions = null;
		var premadeCommentLabels = null;
		var projectId = null;
		
		//make the request to create a new comment
		this.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);		
	};
};

/**
 * Called after the server delete a premade comment list
 * @param text the JSON of the old premade comment list comment
 * @param xml
 * @param args
 */
View.prototype.deletePremadeCommentListCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//parse the premade comment
	var premadeCommentList = $.parseJSON(text);
	
	//obtain the premade comment list id
	var premadeCommentListId = premadeCommentList.id;
		
	//remove premadecomment list item from dropdown
	$("#premadeCommentsListLabelDDItem_"+premadeCommentListId,thisView.premadeCommentsWindow.document).remove();
	
	//remove premadecomment list div
	$("#premadeCommentsListDiv_"+premadeCommentListId,thisView.premadeCommentsWindow.document).remove();
	
	//get premadecommentlist id of the newly-selected dropdown item after the deletion. selection happens automatically.
	var newlySelectedPremadeCommentListId = $("#premadeCommentsListLabelDD",thisView.premadeCommentsWindow.document).find(":selected").val();
	
	//show the newly-selected premadecommentlist
	$("#premadeCommentsListDiv_"+newlySelectedPremadeCommentListId,thisView.premadeCommentsWindow.document).show();
	
	/*
	 * save the current state of the premade comments so that it
	 * can be restored the next time the user opens up the premade
	 * comments again
	 */
	thisView.savePremadeCommentsState();
		
	//add the premade comment to our local array of premade comments
	thisView.deletePremadeCommentListLocally(premadeCommentListId);
};

/**
 * Delete the premade comment list from our local copy of the premade comment list
 * @param premadeCommentListId the id of the premade comment list to delete
 */
View.prototype.deletePremadeCommentListLocally = function(premadeCommentListId) {	
	var indexOfPremadeCommentList = -1;
	// loop thru the premadecommentslist and find index of premadeCommentList
	for (var i=0; i<this.premadeCommentLists.length;i++) {
		if (this.premadeCommentLists[i].id == premadeCommentListId) {
			indexOfPremadeCommentList = i;
		}	
	};
	if (indexOfPremadeCommentList > -1) {
		// remove from list
		this.premadeCommentLists.splice(indexOfPremadeCommentList,1);
	}
};

/**
 * Create the premade comment LI element
 * @param premadeCommentId the id of the premade comment
 * @param comment the comment text
 * @param premadeCommentListId the id of the premade comment list
 * @param signedInUserIsOwner boolean whether the signed in user is the owner of
 * the list this premade comment is part of
 * @return an LI element that contains a select button, the premade comment text,
 * a drag handle, and a delete button
 */
View.prototype.createPremadeCommentLI = function(premadeCommentId, comment, premadeCommentListId, signedInUserIsOwner, labels) {
	//get the premade comment dom id for the element that will hold the comment text
	var premadeCommentDOMId = this.getPremadeCommentDOMId(premadeCommentId);
	
	//create the LI element that will hold the button, the comment, and the handle
	var premadeCommentLI = createElement(this.premadeCommentsWindow.document, 'li', {id:'premadeCommentLI_' + premadeCommentId, style:'list-style-type:none;margin-left:0px;padding-left:0px', class:'premadeCommentLI'});
	
	if(this.authoringMode != true) {
		/*
		 * the input button the user will click to choose the comment.
		 * this is not displayed in the authoring tool but is displayed
		 * in the grading tool.
		 */
		var premadeCommentSelectButton = createElement(this.premadeCommentsWindow.document, 'input', {id:'premadeCommentSelectButton_' + premadeCommentId, type:'button', value:'Select', onclick:'view.selectPremadeComment("' + premadeCommentDOMId + '")'});
		premadeCommentLI.appendChild(premadeCommentSelectButton);
	}
	
	//the p element that will display the comment
	var premadeCommentP = createElement(this.premadeCommentsWindow.document, 'p', {id:premadeCommentDOMId, style:'display:inline'});
	premadeCommentP.innerHTML = comment;

	//add the elements to the LI
	premadeCommentLI.appendChild(document.createTextNode(' '));
	premadeCommentLI.appendChild(premadeCommentP);

	/*
	 * check if the signed in user is the owner of the list so we can determine
	 * if we want to display the '[Drag Me]' and Delete button UI elements
	 */
	if(signedInUserIsOwner) {
		
		if(labels == null) {
			labels = '';
		}
		
		//the p element that will display the open paren around the labels
		var premadeCommentLabelsOpenParenText = createElement(this.premadeCommentsWindow.document, 'p', {id:'premadeCommentLabelsOpenParenText_' + premadeCommentId, style:'display:inline'});
		premadeCommentLabelsOpenParenText.innerHTML = '(';
		premadeCommentLI.appendChild(document.createTextNode(' '));
		premadeCommentLI.appendChild(premadeCommentLabelsOpenParenText);
		
		//make a p element for the labels
		var premadeCommentLabels = createElement(this.premadeCommentsWindow.document, 'p', {id:'premadeCommentLabels_' + premadeCommentId, style:'display:inline'});
		premadeCommentLabels.innerHTML = labels;
		premadeCommentLI.appendChild(premadeCommentLabels);
		
		//the p element that will display the close paren around the labels
		var premadeCommentLabelsCloseParenText = createElement(this.premadeCommentsWindow.document, 'p', {id:'premadeCommentLabelsCloseParenText_' + premadeCommentId, style:'display:inline'});
		premadeCommentLabelsCloseParenText.innerHTML = ')';
		premadeCommentLI.appendChild(premadeCommentLabelsCloseParenText);
		
		//the p element that will display the handle to use for re-ordering comments in the list
		var premadeCommentDragHandle = createElement(this.premadeCommentsWindow.document, 'p', {id:'premadeCommentHandle_' + premadeCommentId, style:'display:inline', 'class':'premadeCommentHandle'});
		premadeCommentDragHandle.innerHTML = '[Drag Me]';
		
		//make the mouse cursor into a hand when it is over the [Drag Me]
		$(premadeCommentDragHandle).mouseover(function() {$(this).css('cursor', 'pointer');});
		
		//the delete button to delete the premade comment
		var premadeCommentDeleteButton = createElement(this.premadeCommentsWindow.document, 'input', {id:'premadeCommentDeleteButton_' + premadeCommentId, type:'button', value:'Delete', onclick:'view.deletePremadeComment(' + premadeCommentId + ', ' + premadeCommentListId + ')'});
		
		//add the elements to the LI
		premadeCommentLI.appendChild(document.createTextNode(' '));
		premadeCommentLI.appendChild(premadeCommentDragHandle);
		premadeCommentLI.appendChild(document.createTextNode(' '));
		premadeCommentLI.appendChild(premadeCommentDeleteButton);
	}
	
	return premadeCommentLI;
};

/**
 * Called when the user finishes editing the comment in place
 * @param idOfEditor the dom id of the element that contains the comment text
 * @param enteredText the text that the user entered
 * @param originalText the text that was there before the user edited
 * @param args an array that holds extra args, in our case the view
 * @return the entered text
 */
View.prototype.editPremadeComment = function(idOfEditor, enteredText, originalText, args) {
	//get the view
	var thisView = args[0];
	
	//arguments used in the server post
	var premadeCommentAction = 'editComment';
	var postPremadeCommentsCallback = thisView.editPremadeCommentCallback;
	var premadeCommentListId = null;
	var premadeCommentListLabel = null;
	
	//get the premade comment id (an integer)
	var premadeCommentId = idOfEditor.replace('premadeComment_', '');
	var premadeComment = enteredText;
	var isGlobal = null;
	var premadeCommentListPositions = null;
	var premadeCommentLabels = null;
	var projectId = null;
	
	//get the length of the premade comment
	var premadeCommentLength = premadeComment.length;
	
	if(premadeCommentLength > 255) {
		//the database column is varchar(255) so premade comments can only be a max of 255 chars
		
		//display the error message
		thisView.premadeCommentsWindow.alert("Error: Premade comment length must be 255 characters or less. Your premade comment is " + premadeCommentLength + " characters long. Your premade comment will be truncated.");
		
		//truncate the premade comment to 255 chars
		premadeComment = premadeComment.substring(0, 255);
	}
	
	//make the request to edit the premade comment on the server
	thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);
	
	return premadeComment;
};

/**
 * Called when the user finishes editing a comment's labels in place
 * @param idOfEditor the dom id of the element that contains the comment labels
 * @param enteredText the text that the user entered
 * @param originalText the text that was there before the user edited
 * @param args an array that holds extra args, in our case the view
 * @return the entered text
 */
View.prototype.editPremadeCommentLabels = function(idOfEditor, enteredText, originalText, args) {
	//get the view
	var thisView = args[0];
	
	//arguments used in the server post
	var premadeCommentAction = 'editCommentLabels';
	var postPremadeCommentsCallback = thisView.editPremadeCommentLabelsCallback;
	var premadeCommentListId = null;
	var premadeCommentListLabel = null;
	
	//get the premade comment id (an integer)
	var premadeCommentId = idOfEditor.replace('premadeCommentLabels_', '');
	var premadeComment = null;
	var isGlobal = null;
	var premadeCommentListPositions = null;
	var premadeCommentLabels = enteredText;
	var projectId = null;
	
	//get the length of the premade comment
	var premadeCommentLabelsLength = premadeCommentLabels.length;
	
	if(premadeCommentLabelsLength > 255) {
		//the database column is varchar(255) so premade comments can only be a max of 255 chars
		
		//display the error message
		thisView.premadeCommentsWindow.alert("Error: Premade comment labels length must be 255 characters or less. Your premade comment labels is " + premadeCommentLabelsLength + " characters long. Your premade comment labels will be truncated.");
		
		//truncate the premade comment to 255 chars
		premadeCommentLabels = premadeCommentLabels.substring(0, 255);
	}
	
	//make the request to edit the premade comment on the server
	thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);
	
	return premadeCommentLabels;
};

/**
 * Called when the user finishes editing the comment list label in place
 * @param idOfEditor the dom id of the element that contains the comment list label text
 * @param enteredText the text that the user entered
 * @param originalText the text that was there before the user edited
 * @param args an array that holds extra args, in our case the view
 * @return the entered text
 */
View.prototype.editPremadeCommentListLabel = function(idOfEditor, enteredText, originalText, args) {
	//get the view
	var thisView = args[0];
	
	//arguments used in the server post
	var premadeCommentAction = 'editCommentListLabel';
	var postPremadeCommentsCallback = thisView.editPremadeCommentListLabelCallback;
	var premadeCommentId = null;
	var premadeComment = null;
	
	//get the premade comment id (an integer)
	var premadeCommentListId = idOfEditor.replace('premadeCommentsListP_', '');
	var premadeCommentListLabel = enteredText;
	var isGlobal = null;
	var premadeCommentListPositions = null;
	var premadeCommentLabels = null;
	var projectId = null;
	
	//get the length of the premade comment
	var premadeCommentLength = premadeCommentListLabel.length;
	
	if(premadeCommentLength > 255) {
		//the database column is varchar(255) so premade comments can only be a max of 255 chars
		
		//display the error message
		thisView.premadeCommentsWindow.alert("Error: Premade comment list label length must be 255 characters or less. Your label is " + premadeCommentLength + " characters long. Your label will be truncated.");
		
		//truncate the premade comment to 255 chars
		premadeCommentListLabel = premadeCommentListLabel.substring(0, 255);
	}
	
	//make the request to edit the premade comment on the server
	thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);
	
	return premadeCommentListLabel;
};

/**
 * The callback that is called after the server we receive the
 * response from the editComment request
 * @param text the JSON of the edited comment
 * @param xml
 * @param args
 */
View.prototype.editPremadeCommentCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//parse the premade comment
	var premadeComment = $.parseJSON(text);

	//update the premade comment locally
	thisView.editPremadeCommentLocally(premadeComment);
};

/**
 * The callback that is called after the server we receive the
 * response from the editComment request
 * @param text the JSON of the edited comment
 * @param xml
 * @param args
 */
View.prototype.editPremadeCommentLabelsCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//obtain the post args
	var postPremadeCommentsArgs = args[1];

	//get the premade comment list id
	var premadeCommentId = postPremadeCommentsArgs.premadeCommentId;
	
	//parse the premade comment
	var premadeComment = $.parseJSON(text);

	//update the premade comment locally
	thisView.editPremadeCommentLocally(premadeComment);
	
	//update the premade comment list labels
	thisView.updatePremadeCommentListLabels(null, premadeCommentId);
};

/**
 * The callback that is called after the server we receive the
 * response from the editComment request
 * @param text the JSON of the edited comment
 * @param xml
 * @param args
 */
View.prototype.newPremadeCommentListCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//parse the premade comment
	var premadeCommentList = $.parseJSON(text);
	
	//update the premade comment list locally
	thisView.addPremadeCommentListLocally(premadeCommentList);
	
	var premadeCommentListId = premadeCommentList.id;

	//append the list label text on the select dropdown
	var premadeCommentsListLabelDDItem = $("<option>").attr("id",'premadeCommentsListLabelDDItem_' + premadeCommentListId)
		.attr("selected","selected").attr("value", premadeCommentListId).text(premadeCommentList.label);
	
	premadeCommentsListLabelDDItem.click({"thisView":thisView},function(event) {
		var listIdChosen = this.value;
		var thisView = event.data.thisView;
		
		//now hide all the lists
		$("#premadeCommentsListsDiv",thisView.premadeCommentsWindow.document).find(".premadeCommentsListDiv").hide();
		
		//show just the selected premadecommentslist div.
		$("#premadeCommentsListsDiv",thisView.premadeCommentsWindow.document).find("#premadeCommentsListDiv_"+listIdChosen).show();		
		
		/*
		 * save the current state of the premade comments so that it
		 * can be restored the next time the user opens up the premade
		 * comments again
		 */
		thisView.savePremadeCommentsState();
	});
	
	$("#premadeCommentsListLabelDD",thisView.premadeCommentsWindow.document).append(premadeCommentsListLabelDDItem);
	
	//now hide all the lists
	$(".premadeCommentsListDiv",thisView.premadeCommentsWindow.document).hide();


	var signedInUserIsOwner = true;

	var premadeCommentsListDiv = thisView.createPremadeCommentsListDiv(premadeCommentList,signedInUserIsOwner);

	//put this premadeCommentsListDiv in the premadeCommentsListsDiv to display it
	$("#premadeCommentsListsDiv",thisView.premadeCommentsWindow.document).append(premadeCommentsListDiv);

	//make the label editable in place if the user owns this list
	thisView.makePremadeCommentListLabelEditable(premadeCommentList.id);				

	//create and append a new div for this new premadecommentslist
	$("#premadeCommentsListDiv_"+premadeCommentListId,thisView.premadeCommentsWindow.document).show();		
	
	/*
	 * save the current state of the premade comments so that it
	 * can be restored the next time the user opens up the premade
	 * comments again
	 */
	thisView.savePremadeCommentsState();
};

/**
 * Add the new premade comment list to our array of lists
 * @param premadeCommentList the new premade comment list
 */
View.prototype.addPremadeCommentListLocally = function(premadeCommentList) {
	//add the new premade comment list to our array of lists
	this.premadeCommentLists.push(premadeCommentList);
};

/**
 * The callback that is called after the server we receive the
 * response from the editComment request
 * @param text the JSON of the edited comment
 * @param xml
 * @param args
 */
View.prototype.editPremadeCommentListLabelCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//parse the premade comment
	var premadeCommentList = $.parseJSON(text);

	//update the list label text on the select dropdown
	$("#premadeCommentsListLabelDDItem_"+premadeCommentList.id,thisView.premadeCommentsWindow.document).html(premadeCommentList.label);
	
	//update the premade comment list locally
	thisView.editPremadeCommentListLabelLocally(premadeCommentList);
};

/**
 * Updates the the comment text in our local copy of the premade comments
 * @param premadeComment the premade comment that was updated
 */
View.prototype.editPremadeCommentListLabelLocally = function(premadeCommentListIn) {
	//loop through all the premade comment lists
	for(var x=0; x<this.premadeCommentLists.length; x++) {
		//get a premade comment list
		var premadeCommentList = this.premadeCommentLists[x];
		
		if (premadeCommentList.id == premadeCommentListIn.id) {
			premadeCommentList.label = premadeCommentListIn.label;
		};
	};
};

/**
 * Updates the the comment text in our local copy of the premade comments
 * @param premadeComment the premade comment that was updated
 */
View.prototype.editPremadeCommentLocally = function(premadeComment) {
	//loop through all the premade comment lists
	for(var x=0; x<this.premadeCommentLists.length; x++) {
		//get a premade comment list
		var premadeCommentList = this.premadeCommentLists[x];
		
		//get the array of premade comments in the list
		var premadeComments = premadeCommentList.premadeComments;
		
		//loop through all the premade comments
		for(var y=0; y<premadeComments.length; y++) {
			//get a premade comment
			var currentPremadeComment = premadeComments[y];
			
			/*
			 * check if the current premade comment has the same id
			 * as the one we need to update
			 */
			if(currentPremadeComment.id == premadeComment.id) {
				//update the comment text
				currentPremadeComment.comment = premadeComment.comment;
				
				//update the comment labels
				currentPremadeComment.labels = premadeComment.labels;
			}
		}
	}
};

/**
 * Called when the user clicks on the delete button for a premade comment
 * @param premadeCommentId the id of the premade comment
 * @param premadeCommentListId the id of the premade comment list
 */
View.prototype.deletePremadeComment = function(premadeCommentId, premadeCommentListId) {
	//arguments used in the server post
	var premadeCommentAction = 'deleteComment';
	var postPremadeCommentsCallback = this.deletePremadeCommentCallback;
	var premadeCommentListLabel = null;
	var premadeComment = null;
	var isGlobal = null;
	var premadeCommentListPositions = null;
	var premadeCommentLabels = null;
	var projectId = null;
	
	//make the request to delete the premade comment on the server
	this.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);
};

/**
 * Callback called after the server deletes a premade comment
 * @param text the JSON for the premade comment that was deleted
 * @param xml
 * @param args
 */
View.prototype.deletePremadeCommentCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//get the post args
	var postPremadeCommentsArgs = args[1];
	
	//get the premade comment list id
	var premadeCommentListId = postPremadeCommentsArgs.premadeCommentListId;
	
	//parse the premade comment
	var premadeComment = $.parseJSON(text);
	
	//obtain the premade comment id
	var premadeCommentId = premadeComment.id;
	
	//remove the LI for the deleted premade comment
	var premadeCommentLIId = 'premadeCommentLI_' + premadeCommentId;
	
	$("#" + premadeCommentLIId, thisView.premadeCommentsWindow.document).remove();
	
	//delete the premade comment locally
	thisView.deletePremadeCommentLocally(premadeComment);
	
	//update the label checkboxes
	thisView.updatePremadeCommentListLabels(premadeCommentListId, premadeCommentId);
	
	/*
	 * save the current state of the premade comments which includes
	 * which list id is being displayed and which labels are checked
	 */
	thisView.savePremadeCommentsState();
};

/**
 * Delete the premade comment locally
 * @param premadeComment the premade comment to delete
 */
View.prototype.deletePremadeCommentLocally = function(premadeComment) {
	//loop through all the premade comment lists
	for(var x=0; x<this.premadeCommentLists.length; x++) {
		//get a premade comment list
		var premadeCommentList = this.premadeCommentLists[x];
		
		//get the array of premade comments
		var premadeComments = premadeCommentList.premadeComments;
		
		//loop through all the premade comments
		for(var y=0; y<premadeComments.length; y++) {
			//get a premade comment
			var currentPremadeComment = premadeComments[y];
			
			//compare the current premade comment id with the one we need to delete
			if(currentPremadeComment.id == premadeComment.id) {
				//the ids match so we will remove this premade comment from the array
				premadeComments.splice(y, 1);
				
				return;
			}
		}
	}
};

/**
 * Make a premade comment list label editable in place
 * @param premadeCommentId the id of the premade comment list
 */
View.prototype.makePremadeCommentListLabelEditable = function(premadeCommentListId) {
	//make the comment editable in place
	$("#premadeCommentsListP_" + premadeCommentListId, this.premadeCommentsWindow.document).editInPlace({callback:this.editPremadeCommentListLabel, params:[this], text_size:60});	
};

/**
 * Make a premade comment editable in place
 * @param premadeCommentId the id of the premade comment
 */
View.prototype.makePremadeCommentEditable = function(premadeCommentId) {
	//obtain the dom id of the element that holds the comment text
	var premadeCommentDOMId = this.getPremadeCommentDOMId(premadeCommentId);
	
	//make the comment editable in place
	$("#" + premadeCommentDOMId, this.premadeCommentsWindow.document).editInPlace({callback:this.editPremadeComment, params:[this], text_size:60});
};

/**
 * Make a premade comment label editable in place
 * @param premadeCommentId the id of the premade comment
 */
View.prototype.makePremadeCommentLabelsEditable = function(premadeCommentId) {
	//obtain the dom id of the element that holds the comment text
	var premadeCommentLabelsDOMId = this.getPremadeCommentLabelsDOMId(premadeCommentId);
	
	//make the comment editable in place
	$("#" + premadeCommentLabelsDOMId, this.premadeCommentsWindow.document).editInPlace({callback:this.editPremadeCommentLabels, params:[this], text_size:60, default_text:'Edit labels'});
};

/**
 * Get the premade comment dom id of the element that holds the comment
 * text
 * @param premadeCommentId the id of the premade comment (an integer)
 * @return a string containing the dom id
 */
View.prototype.getPremadeCommentDOMId = function(premadeCommentId) {
	return 'premadeComment_' + premadeCommentId;
};

/**
 * Get the premade comment labels dom id of the element that holds the labels
 * text
 * @param premadeCommentId the id of the premade comment (an integer)
 * @return a string containing the dom id
 */
View.prototype.getPremadeCommentLabelsDOMId = function(premadeCommentId) {
	return 'premadeCommentLabels_' + premadeCommentId;
};

/**
 * Called after all the premade comments data is retrieved and rendered.
 * This hides the Loading... message and makes everything else visible
 * such as the student work, premade comment lists, textarea, and submit
 * button
 */
View.prototype.renderPremadeCommentsComplete = function() {
	$('#premadeCommentsLoadingP', this.premadeCommentsWindow.document).hide();
	$('#premadeCommentsTopDiv', this.premadeCommentsWindow.document).show();
};

/**
 * This is used as the function call for when the sortable
 * list fires the update event. This function creates an array
 * that will contain the order of the premade comment ids.
 * 
 * e.g.
 * premade comment 10 = "great job"
 * premade comment 11 = "needs more facts"
 * premade comment 12 = "incorrect"
 * 
 * are in a list and in the list they are sorted in the order
 * 
 * "needs more facts"
 * "great job"
 * "incorrect"
 * 
 * so the array will contain the premade comment ids in this order
 * 
 * 11, 10, 12
 * 
 * the index specifies the list position and the value is the premade comment id
 * 
 * index - premadeCommentId - listPosition
 * [0] - 11 - 1
 * [1] - 10 - 2
 * [2] - 12 - 3
 * 
 * @param event
 * @param ui
 * @param thisView
 */
View.prototype.sortUpdate = function(event, ui, thisView) {
	//the array we will store the premade comment ids in
	var listPositions = [];
	
	//get the id of the UL that was updated
	var ulElementId = $(event.target).attr('id');
	
	//get the list id
	var listId = ulElementId.replace('premadeCommentUL_', '');
	
	//get all the LI elements in the UL
	var liElementsInUL = $(event.target).find('li');
	
	//loop through all the LI elements
	for(var x=0; x<liElementsInUL.length; x++) {
		//get an LI element
		var liElement = liElementsInUL[x];
		
		//get the premade comment id
		var liElementId = liElement.id.replace('premadeCommentLI_', '');
		
		//put the premade comment id into the array
		listPositions.push(parseInt(liElementId));
	}
	
	/*
	 * reverse the array so that the top of the list becomes the end of
	 * the array. we want to do this because we want the top of the
	 * list to have the highest index value since the newer premade
	 * comments should have larger list positions. this is so that
	 * when we add a new premade comment we just set the list position
	 * as the next highest available position as opposed to setting it
	 * to 1 and then having to shift all the other elements by 1.
	 */
	listPositions.reverse();

	//arguments used in the server post
	var premadeCommentAction = 'reOrderCommentList';
	var postPremadeCommentsCallback = thisView.reOrderPremadeCommentCallback;
	var premadeCommentListId = listId;
	var premadeCommentListLabel = null;
	
	//get the premade comment id (an integer)
	var premadeCommentId = null;
	var premadeComment = null;
	var isGlobal = null;
	var premadeCommentListPositions = $.stringify(listPositions);
	var premadeCommentLabels = null;
	var projectId = null;
	
	thisView.postPremadeComments(premadeCommentAction, postPremadeCommentsCallback, premadeCommentListId, premadeCommentListLabel, premadeCommentId, premadeComment, isGlobal, premadeCommentListPositions, premadeCommentLabels, projectId);
};

/**
 * Callback called after we receive the response from a
 * reOrderCommentList request
 * @param text a JSON object containing the list id and an array
 * containing list positions
 * @param xml
 * @param args
 */
View.prototype.reOrderPremadeCommentCallback = function(text, xml, args) {
	//obtain the view
	var thisView = args[0];
	
	//parse the premade comment
	var reOrderReturn = $.parseJSON(text);
	
	//get the premade comment list id
	var premadeCommentListId = reOrderReturn.premadeCommentListId;
	
	//get the list positions
	var listPositions = reOrderReturn.listPositions;
	
	//re-order the premade comments in the list in our local copy
	thisView.reOrderPremadeCommentLocally(premadeCommentListId, listPositions);
};

/**
 * Re-order a premade comment list locally
 * @param premadeCommentListId the id of the premade comment list
 * @param listPositions an array containing premade comment ids in the order
 * that they should be positioned in the list
 * 
 * 
 * e.g.
 * premade comment 10 = "great job"
 * premade comment 11 = "needs more facts"
 * premade comment 12 = "incorrect"
 * 
 * are in a list and in the list they are sorted in the order
 * 
 * "needs more facts"
 * "great job"
 * "incorrect"
 * 
 * so the array will contain the premade comment ids in this order
 * 
 * 11, 10, 12
 * 
 * the index specifies the list position and the value is the premade comment id
 * 
 * index - premadeCommentId - listPosition
 * [0] - 11 - 1
 * [1] - 10 - 2
 * [2] - 12 - 3
 */
View.prototype.reOrderPremadeCommentLocally = function(premadeCommentListId, listPositions) {
	//get the premade comment list with the given id
	var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListId);
	
	//get the array of premade comments from the list
	var premadeComments = premadeCommentList.premadeComments;
	
	//loop through all the premade comments
	for(var x=0; x<premadeComments.length; x++) {
		//get a premade comment
		var currentPremadeComment = premadeComments[x];
		
		//get the id of the premade comment
		var currentPremadeCommentId = currentPremadeComment.id;
		
		//find the index of the premade comment id within the listPositions array
		var listPositionIndex = listPositions.indexOf(currentPremadeCommentId);
		
		//update the listPosition of the premade comment
		currentPremadeComment.listPosition = listPositionIndex + 1;
	}
};

/**
 * Get a premade comment list given the premade comment list id
 * @param premadeCommentListId the id of the premade comment list
 * @return a premade comment list object
 */
View.prototype.getPremadeCommentListLocally = function(premadeCommentListId) {
	//loop through all the premade comment lists
	for(var x=0; x<this.premadeCommentLists.length; x++) {
		//get a premade comment list
		var currentPremadeCommentList = this.premadeCommentLists[x];
		
		//get the id of the premade comment list
		var currentPremadeCommentListId = currentPremadeCommentList.id;
		
		//check if the id matches
		if(currentPremadeCommentListId == premadeCommentListId) {
			//the id matches so we will return the list
			return currentPremadeCommentList;
		}
	}
	
	//the list was not found
	return null;
};

/**
 * Make the comments in the list editable in the DOM
 * @param premadeCommentList the premade comment list
 */
View.prototype.makePremadeCommentListEditable = function(premadeCommentList) {
	//loop through all the premade comments in the list
	for(var y=0; y<premadeCommentList.premadeComments.length; y++) {
		//get a premade comment
		var premadeComment = premadeCommentList.premadeComments[y];
		
		//get the id of the premade comment
		var premadeCommentId = premadeComment.id;
		
		//make the premade comment editable in place in the DOM
		this.makePremadeCommentEditable(premadeCommentId);
		
		//make the premade comment labels editable in place in the DOM
		this.makePremadeCommentLabelsEditable(premadeCommentId);
	}
};

/**
 * Get a unique array of labels from a premade comment list
 * @param premadeCommentListId the id of the list
 * @returns an array that will contain all the unique labels that are
 * used in the list sorted alphabetically
 */
View.prototype.getPremadeCommentLabelsFromList = function(premadeCommentListId) {
	//array to store all the unique labels
	var allLabels = [];
	
	//get the list we want labels from
	var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListId);
	
	//get the array of premade comments
	var premadeComments = premadeCommentList.premadeComments;
	
	//loop through all the premade comments
	for(var x=0; x<premadeComments.length; x++) {
		//get a premade comment
		var currentPremadeComment = premadeComments[x];
		
		//get the labels for the comment
		var currentLabels = currentPremadeComment.labels;
		
		if(currentLabels != null && currentLabels != '') {
			//split the labels by , in case there are comma separated labels
			var currentLabelsArray = currentLabels.split(",");
			
			//loop through each label
			for(var y=0; y<currentLabelsArray.length; y++) {
				//get a label
				var currentLabel = currentLabelsArray[y];
				
				if(currentLabel != null) {
					//remove any leading and trailing white space
					currentLabel = currentLabel.trim();
					
					if(allLabels.indexOf(currentLabel) == -1) {
						//we do not have this label yet so we will add it to our array
						allLabels.push(currentLabel);
					}
				}
			}
		}
	}
	
	//sort the list alphabetically
	allLabels.sort();
	
	return allLabels;
};

/**
 * One of the label checkboxes was clicked
 */
View.prototype.premadeCommentLabelClickedEventListener = function(premadeCommentListId) {
	//get all the labels that are checked
	var labelsChecked = this.premadeCommentsGetLabelsChecked(premadeCommentListId);
	
	//filter the premade comments to only show the ones that have the labels that are checked
	this.filterPremadeComments(premadeCommentListId, labelsChecked);
	
	/*
	 * save the current state of the premade comments which includes
	 * which list id is being displayed and which labels are checked
	 */
	this.savePremadeCommentsState();
};

/**
 * Get all the labels that are checked
 * @param premadeCommentListId the id of the premade comment list
 * @returns an array of labels
 */
View.prototype.premadeCommentsGetLabelsChecked = function(premadeCommentListId) {
	//get the visible checkboxes that are checked
	var checkboxesChecked = $('#premadeCommentsListLabelsDiv_' + premadeCommentListId + ' :checkbox:visible:checked', this.premadeCommentsWindow.document);
	
	var labels = [];
	
	//loop through all the visible checkboxes that are checked
	for(var x=0; x<checkboxesChecked.length; x++) {
		//get a checkbox
		var checkbox = checkboxesChecked[x];
		
		//get the value
		var checkboxValue = checkbox.value;
		
		//add it to our array
		labels.push(checkboxValue);
	}
	
	return labels;
};

/**
 * Only display the premade comments that have the labels that are checked.
 * If there are no labels checked, we will show all the premade comments.
 * @param premadeCommentListId the id of the premade comment list
 * @param labelsChecked an array of the labels that are checked
 */
View.prototype.filterPremadeComments = function(premadeCommentListId, labelsChecked) {
	//get the list
	var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListId);
	
	//get the array of premade comments
	var premadeComments = premadeCommentList.premadeComments;
	
	//whether any of the checkboxes are checked
	var atLeastOneChecked = false;
	
	//loop through all the premade comments
	for(var x=0; x<premadeComments.length; x++) {
		//get a premade comment
		var currentPremadeComment = premadeComments[x];
		
		//get the id of the premade comment
		var premadeCommentId = currentPremadeComment.id;
		
		//whether we will display the premade comment
		var showPremadeComment = false;
		
		//get the labels for the comment
		var currentLabels = currentPremadeComment.labels;
		
		if(currentLabels != null) {
			//split the labels by , in case there are comma separated labels
			var currentLabelsArray = currentLabels.split(",");
			
			//loop through each label
			for(var y=0; y<currentLabelsArray.length; y++) {
				//get a label
				var currentLabel = currentLabelsArray[y];
				
				if(currentLabel != null) {
					//remove any leading and trailing white space
					currentLabel = currentLabel.trim();
					
					if(labelsChecked.indexOf(currentLabel) != -1) {
						showPremadeComment = true;
						atLeastOneChecked = true;
					}
				}
			}
		}
		
		if(showPremadeComment || labelsChecked.length == 0) {
			/*
			 * we want to show this premade comment because it has a label that is checked
			 * or there are no labels checked in which case we show all the premade comments
			 */
			$('#premadeCommentLI_' + premadeCommentId, this.premadeCommentsWindow.document).show();
		} else {
			//do not show this premade comment
			$('#premadeCommentLI_' + premadeCommentId, this.premadeCommentsWindow.document).hide();
		}
	}
	
	if(atLeastOneChecked) {
		//there is at least one label checked so we will enable the "Uncheck All Labels" button
		$('#premadeCommentListUncheckCheckboxesButton_' + premadeCommentListId, this.premadeCommentsWindow.document).removeAttr('disabled');
	} else {
		//there are no checkboxes checked so we will disable the "Uncheck All Labels" button
		$('#premadeCommentListUncheckCheckboxesButton_' + premadeCommentListId, this.premadeCommentsWindow.document).attr('disabled', true);
	}
};

/**
 * Update the label checkboxes in case any labels have been changed
 * or removed.
 * Only one of the two arguments below need to be passed in
 * @param premadeCommentListId the premade comment list id
 * @param premadeCommentId the premade comment id
 */
View.prototype.updatePremadeCommentListLabels = function(premadeCommentListId, premadeCommentId) {
	
	if(premadeCommentListId == null) {
		/*
		 * the premade comment list id was not passed in so we need
		 * to find it from the premade comment id
		 */
		var premadeCommentList = this.getPremadeCommentListByPremadeCommentId(premadeCommentId);
		
		if(premadeCommentList != null) {
			premadeCommentListId = premadeCommentList.id;
		}
	}

	//get the labels that are currently checked
	var labelsChecked = this.premadeCommentsGetLabelsChecked(premadeCommentListId);
	
	//get an array of unique labels that are used in this list
	var labels = this.getPremadeCommentLabelsFromList(premadeCommentListId);
	
	//remove any labels that are no longer used in the list
	labelsChecked = this.premadeCommentsRemoveUnusedLabels(labelsChecked, labels);
	
	//get the div that contains all the label checkboxes
	var premadeCommentsListLabelsDiv = $('#premadeCommentsListLabelsDiv_' + premadeCommentListId, this.premadeCommentsWindow.document);
	
	//clear the existing label checkboxes
	premadeCommentsListLabelsDiv.html('');
	
	//regenerate the label checkboxes
	this.premadeCommentsGenerateLabelCheckboxes(premadeCommentListId, premadeCommentsListLabelsDiv, labels);
	
	//check the labels that were previously checked
	this.premadeCommentsPopulateCheckboxes(premadeCommentListId, labelsChecked);
	
	//filter the premade comments based on the labels that are checked
	this.filterPremadeComments(premadeCommentListId, labelsChecked);
	
	/*
	 * save the current state of the premade comments which includes
	 * which list id is being displayed and which labels are checked
	 */
	this.savePremadeCommentsState();
};

/**
 * Remove any labels that are not used anymore. This is used to handle the
 * corner case when a label is only associated with one premade comment
 * and that label is currently checked and that premade comment gets deleted.
 * The premade comment first gets removed from its list and then we gather
 * the labels that are checked and then we gather the labels that are current.
 * We must then make sure the labels that were checked all still exist in the
 * current labels and remove any that do not exist anymore.
 * 
 * @param previouslyCheckedLabels an array of labels that were previously checked
 * @param currentLabels the array of labels that are currently used
 * @returns an array of labels that were previously checked and still currently exist
 */
View.prototype.premadeCommentsRemoveUnusedLabels = function(previouslyCheckedLabels, currentLabels) {
	//array to keep track of all the previously checked labels that still exist
	var activeCheckedLabels = [];
	
	//loop through all the previously checked labels
	for(var x=0; x<previouslyCheckedLabels.length; x++) {
		//get a previously checked label
		var previouslyCheckedLabel = previouslyCheckedLabels[x];
		
		if(currentLabels.indexOf(previouslyCheckedLabel) == -1) {
			//label is no longer used in the list
		} else {
			//label is used in the list
			activeCheckedLabels.push(previouslyCheckedLabel);
		}
	}
	
	return activeCheckedLabels;
};

/**
 * Create the checkboxes for the labels
 * @param premadeCommentListId the id of the premade comment list
 * @param premadeCommentsListLabelsDiv the div that contains all the checkbox labels for the
 * given premade comment list
 * @param labels the unique labels that are used in the premade comment list
 */
View.prototype.premadeCommentsGenerateLabelCheckboxes = function(premadeCommentListId, premadeCommentsListLabelsDiv, labels) {

	//loop through all the labels
	for(var x=0; x<labels.length; x++) {
		//get a label
		var label = labels[x];
		
		if(label != null) {
			//create the checkbox that the user will use filter the list
			var premadeCommentLabelCheckbox = createElement(this.premadeCommentsWindow.document, 'input', {type:'checkbox', id:'premadeCommentLabelCheckbox_' + '_' + premadeCommentListId + '_' + x, value:label, onclick:'eventManager.fire("premadeCommentLabelClicked", ' + premadeCommentListId + ')'});

			//the p element that will display the comment
			var premadeCommentLabelText = createElement(this.premadeCommentsWindow.document, 'p', {id:'premadeCommentLabelText_' + premadeCommentListId + '_' + x, style:'display:inline'});
			premadeCommentLabelText.innerHTML = label;
			
			//add the label checkbox to the div
			premadeCommentsListLabelsDiv.append(premadeCommentLabelCheckbox);
			premadeCommentsListLabelsDiv.append(premadeCommentLabelText);
			premadeCommentsListLabelsDiv.append('<br>');
		}
	}
	
	if(labels.length == 0) {
		//there are no labels so we will disable the "Uncheck All Labels" button
		$('#premadeCommentListUncheckCheckboxesButton_' + premadeCommentListId, this.premadeCommentsWindow.document).attr('disabled', true);
	} else {
		//there are labels so we will enable the "Uncheck All Labels" button
		$('#premadeCommentListUncheckCheckboxesButton_' + premadeCommentListId, this.premadeCommentsWindow.document).removeAttr('disabled');
	}
};

/**
 * Check the checkboxes that we want to have checked
 * @param premadeCommentListId the id of the premade comment list
 * @param labels the labels that we want checked
 */
View.prototype.premadeCommentsPopulateCheckboxes = function(premadeCommentListId, labels) {
	
	//get all the checkboxes for this premade comment list
	var checkboxes = $('#premadeCommentsListLabelsDiv_' + premadeCommentListId + ' :checkbox', this.premadeCommentsWindow.document);
	
	//loop through all the checkboxes
	for(var x=0; x<checkboxes.length; x++) {
		//get a checkbox
		var checkbox = checkboxes[x];
		
		if(checkbox != null) {
			//get the value of the checkbox
			var value = checkbox.value;
			
			//check if the label is in the array of labels we want checked
			if(labels.indexOf(value) != -1) {
				//the checkbox should be checked
				$(checkbox).attr('checked', true);
			}
		}
	}
};


/**
 * Find the premade comment list that contains the premade comment with the
 * given id
 * @param premadeCommentId the id of the premade comment
 * @returns the premade comment list that contains the premade comment with
 * the given id
 */
View.prototype.getPremadeCommentListByPremadeCommentId = function(premadeCommentId) {
	
	if(premadeCommentId != null) {
		//loop through all the premade comment lists
		for(var x=0; x<this.premadeCommentLists.length; x++) {
			//get a premade comment list
			var tempPremadeCommentList = this.premadeCommentLists[x];
			
			//get the array of premade comments
			var premadeComments = tempPremadeCommentList.premadeComments;
			
			//loop through all the comments
			for(var y=0; y<premadeComments.length; y++) {
				//get a comment
				var tempPremadeComment = premadeComments[y];
				
				if(tempPremadeComment != null) {
					//get the comment id
					var tempPremadeCommentId = tempPremadeComment.id;
					
					if(premadeCommentId == tempPremadeCommentId) {
						//the comment id matches the one we want
						return tempPremadeCommentList;
					}
				}
			}
		}		
	}
	
	//we did not find a premade comment list that contained a premade comment with the given id
	return null;
};

/**
 * Uncheck all the checkboxes for the premade comment list
 * @param premadeCommentListId the if of the premade comment list
 */
View.prototype.premadeCommentListUncheckLabels = function(premadeCommentListId) {
	//get all the checkboxes for this premade comment list and uncheck them
	$('#premadeCommentsListDiv_' + premadeCommentListId + ' :checkbox', this.premadeCommentsWindow.document).removeAttr('checked');
	
	//none of the labels are checked so we will just use an empty array
	var labelsChecked = [];
	
	/*
	 * filter the premade comments (this will basically show all 
	 * the premade comments since none of the labels are checked
	 */
	this.filterPremadeComments(premadeCommentListId, labelsChecked);
	
	/*
	 * save the current state of the premade comments which includes
	 * which list id is being displayed and which labels are checked
	 */
	this.savePremadeCommentsState();
};

/**
 * Save the current state of the premade comments which includes
 * which premade comment list is being shown and which checkboxes
 * are checked
 */
View.prototype.savePremadeCommentsState = function() {
	//get the premade comment list option that is selected and being shown
	var selectedPremadeCommentListOption = $('#premadeCommentsListLabelDD option:selected', this.premadeCommentsWindow.document);
	
	if(selectedPremadeCommentListOption.length > 0) {
		//get the DOM option element for the premade comment list
		var selectedPremadeCommentList = selectedPremadeCommentListOption[0];
		
		//get the premade comment list id
		var premadeCommentListIdSelected = parseInt(selectedPremadeCommentList.value);
		
		//get the labels that are currently checked
		var labelsChecked = this.premadeCommentsGetLabelsChecked(premadeCommentListIdSelected);
		
		//create an object to contain the information we are saving
		var wise4PremadeCommentsState = {
			premadeCommentListIdSelected:premadeCommentListIdSelected,
			labelsChecked:labelsChecked
		};
		
		/*
		 * save the object to local storage so we can retrieve it the next
		 * time the premade comments page is open
		 */
		this.setLocalStorageValue('wise4PremadeCommentsState', wise4PremadeCommentsState);
	}
};

/**
 * Restore the previous state of the premade comments which includes
 * which premade comment list was being shown and which checkboxes
 * were checked
 */
View.prototype.restorePremadeCommentsState = function() {
	//get the local storage item we saved from the previous session
	var wise4PremadeCommentsState = this.getLocalStorageValue('wise4PremadeCommentsState');
	
	if(wise4PremadeCommentsState != null) {
		//create the JSON object
		wise4PremadeCommentsState = JSON.parse(wise4PremadeCommentsState);
		
		if(wise4PremadeCommentsState != null) {
			//get the premade comment list id that was previously shown
			var premadeCommentListIdSelected = wise4PremadeCommentsState.premadeCommentListIdSelected;
			
			//get the labels that were previously checked
			var labelsChecked = wise4PremadeCommentsState.labelsChecked;
			
			if(premadeCommentListIdSelected != null) {
				/*
				 * try to retrieve the list with the given list id to make sure
				 * the id corresponds to one of our lists and not someone else's
				 */
				var premadeCommentList = this.getPremadeCommentListLocally(premadeCommentListIdSelected);
				
				if(premadeCommentList != null) {
					//select the list in the drop down
					$('#premadeCommentsListLabelDDItem_' + premadeCommentListIdSelected, this.premadeCommentsWindow.document).attr('selected', 'selected');

					//hide all the lists
					$(".premadeCommentsListDiv", this.premadeCommentsWindow.document).hide();
					
					//show just the selected premadecommentslist div
					$("#premadeCommentsListDiv_" + premadeCommentListIdSelected, this.premadeCommentsWindow.document).show();
					
					if(labelsChecked != null) {
						//check the labels that were previously checked
						this.premadeCommentsPopulateCheckboxes(premadeCommentListIdSelected, labelsChecked);

						//filter the premade comments based on the labels that are checked
						this.filterPremadeComments(premadeCommentListIdSelected, labelsChecked);
					}					
				}
			}
		}
	}
};

/**
 * Set the key value pair into the localStorage if localStorage exists
 * @param key the key as a string
 * @param value the value as a string, number, or object
 */
View.prototype.setLocalStorageValue = function(key, value) {
	if(localStorage) {
		//localStorage is available on this browser
		
		if(value == null) {
			localStorage.setItem(key, value);
		} else if(typeof value == 'object') {
			/*
			 * the value is an object so we will turn it into a string
			 * since values can only be numbers or strings
			 */
			localStorage.setItem(key, JSON.stringify(value));
		} else if(typeof value == 'string') {
			localStorage.setItem(key, value);
		}
	}
};

/**
 * Get the key value from localStorage if localStorage exists
 * @param key the key as a string
 * @returns the value corresponding to the key, or null if
 * localStorage is not available on this browser
 */
View.prototype.getLocalStorageValue = function(key) {
	var value = null;
	
	if(localStorage) {
		value = localStorage.getItem(key);
	}
	
	return value;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_premadecomments.js');
};
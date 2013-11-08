View.prototype.journalPanelGetElementById = function(id) {
	return window.frames['journalFrame'].document.getElementById(id);
};

View.prototype.journalPanelGetElementsByClassName = function(className) {
	return window.frames['journalFrame'].document.getElementsByClassName(className);
};

/**
 * Displays the journal
 */
View.prototype.showJournal = function() {
	/* create the journal dialog if not already created */
	if($('#vleJournalPanel').size()==0){
		$('<div id="vleJournalPanel"></div>').dialog({autoOpen:false,width:600,height:600,close:this.saveJournalOnClose,title:'Journal'});
		$('#vleJournalPanel').html("<iframe name='journalFrame' id='journalFrame' frameborder='0' width='100%' height='100%' src='journal/journal.html'></iframe>");
		window.frames['journalFrame'].eventManager = eventManager;
		window.frames['journalFrame'].view = this;
	}
	
	/* show the dialog */
	$('#vleJournalPanel').dialog('open');
};


/**
 * Makes a request back to the server to retrieve all the journal
 * pages for the workgroupId and then displays the journal pages
 * in the journal panel
 */
View.prototype.retrieveJournalPages = function() {
	var getJournalDataCallback = function(text, xml, args) {
		//a reference to the view
		var thisView = args[0];
		
		//parse the jsong string to obtain the journal obj
		thisView.journal = Journal.prototype.parseDataJSONString(text);
		
		//display the journal pages in the journal panel
		thisView.displayJournalPages();
	};
	
	if(this.journal == null) {
		//journal is null so we need to retrieve it
		
		//retrieve the location/runId
		var runId = this.getConfig().getConfigParam('runId');
		
		//get the workgroup id
		var workgroupId = this.getUserAndClassInfo().getWorkgroupId();

		/*
		 * make the request to retrieve the journal data, then calls
		 * the getJournalDataCallback() function to display the journal pages
		 * in the journal UI
		 */
		this.connectionManager.request('GET', 1, this.getConfig().getConfigParam('getJournalDataUrl'), {workgroupId: workgroupId, location: runId}, getJournalDataCallback, [this]);
	} else {
		//display the journal pages in the journal panel
		this.displayJournalPages();
	}
};



/**
 * Displays the journal pages in the journal panel
 */
View.prototype.displayJournalPages = function() {
	if(this.journal.workgroupId == null) {
		//set the workgroup id into the journal
		this.journal.workgroupId = this.getUserAndClassInfo().getWorkgroupId();
	}

	//loop through all the journal pages
	for(var x=0; x<this.journal.journalPages.length; x++) {
		//get a journal page
		var journalPage = this.journal.journalPages[x];
		
		//check if the journal page was deleted
		if(journalPage.deleted != true) {
			/*
			 * journal page was not deleted so we will add the 
			 * journal page to the journal UI
			 */
			this.addJournalPageToDisplay(journalPage);			
		}
	}
};

/**
 * Get a journal page id for the new journal page.
 * @return a unique journal page id as an integer
 */
View.prototype.getNewJournalPageId = function() {
	//check if there are any journal pages
	if(this.journal.journalPages.length == 0) {
		//there are no journal pages so we will just return 1
		return 1;
	} else {
		/*
		 * there are existing journal pages so just get the largest
		 * existing journal page id in use and add 1 to it to get
		 * the new journal page id
		 */
		var maxJournalPageId = this.getMaxJournalPageId();
		
		return maxJournalPageId + 1;
	}
};

/**
 * Get the largest existing journal page id
 */
View.prototype.getMaxJournalPageId = function() {
	var maxSoFar = null;
	
	//loop through all the journal pages
	for(var x=0; x<this.journal.journalPages.length; x++) {
		//get the id for a journal page
		var tempJournalPageId = this.journal.journalPages[x].id;
		
		if(maxSoFar == null) {
			//set this id if it is the first one we've seen so far
			maxSoFar = tempJournalPageId;
		} else if(tempJournalPageId > maxSoFar) {
			//set this id if it is larger than our current max
			maxSoFar = tempJournalPageId;
		}
	}
	
	return maxSoFar;
};

/**
 * Creates and displays a new journal page for when the student
 * clicks on the "Create New Page" button
 * @return
 */
View.prototype.journalCreateNewEntry = function() {
	//create a new journal page
	var newJournalPage = new JournalPage();
	
	//obtain a unique id for the new page
	var journalPageId = this.getNewJournalPageId();
	
	//set the id
	newJournalPage.id = journalPageId;
	
	//add the new journal page to the array of journal pages
	this.journal.journalPages.push(newJournalPage);
	
	//add the new journal to the display
	this.addJournalPageToDisplay(newJournalPage, true);
};

/**
 * Removes the journal page from the journal UI and also makes
 * @param id the id of the journal page 
 * 
 */
View.prototype.journalDeletePage = function(id) {
	//obtain the journal page id for the div
	var journalPageDivId = this.getJournalPageDivId(id);

	//obtain the div of the journal page we're about to delete
	var journalPageDiv = this.journalPanelGetElementById(journalPageDivId);

	//remove the journal page div from the parent journal pages div
	this.journalPanelGetElementById('journalPages').removeChild(journalPageDiv);

	/*
	 * set the journal page to modified and deleted so that
	 * the next time the journal is saved back to the server
	 * we can send data to tell the server this page has been
	 * deleted
	 */
	var journalPage = this.journal.getJournalPage(id);
	journalPage.modified = true;
	journalPage.deleted = true;
};

/**
 * This gathers all the data so that the journal page data can be
 * sent back to the server for saving. This only performs saving
 * locally on the client machine. Only when the journal is closed
 * or the user clicks the "Save Journal" button will all
 * of these local changes will be pushed to the server to
 * be saved.
 * @param id the id of the journal page
 */
View.prototype.journalSavePage = function(id) {
	//obtain the journalPage
	var journalPage = this.journal.getJournalPage(id);
	
	//get the latest revision
	var journalPageRevision = journalPage.getLatestRevision();
	
	//obtain all the data values for the journal page from the UI
	var title = this.getJournalPageTitleValueById(id);
	var data = this.getJournalPageDataValueById(id);
	var nodeId = this.getJournalPageNodeIdValueById(id);
	
	if(journalPageRevision != null) {
		//check if there were any changes in the values for the journal page
		if(journalPageRevision.title == title && 
				journalPageRevision.data == data &&
				journalPageRevision.nodeId == nodeId) {
			//there are no differences so we do not need to do anything else
			return;
		}
	}
	
	/*
	 * check if the journal page has actually been modified already during
	 * this opening of the journal
	 */
	if(journalPage.modified == true) {
		/*
		 * the page has previously been modified so we will keep modifying
		 * the latest revision
		 */
		journalPageRevision = journalPage.getLatestRevision();
	} else {
		/*
		 * the page has not been previously modified so we will create
		 * a new revision
		 */
		journalPageRevision = new JournalPageRevision();
		
		//add the revision to the array of revisions for this page
		journalPage.addJournalPageRevision(journalPageRevision);
		journalPage.modified = true;
	}
	
	//get the current time for the revisionLastEditedTime
	var d = new Date();
	var revisionLastEditedTime = d.getTime();
	
	var modifiedTimestampTd = this.journalPanelGetElementById(this.getJournalModifiedTimestampId(id));
	modifiedTimestampLocaleString = new Date(parseInt(revisionLastEditedTime)).toLocaleString();
	modifiedTimestampTd.innerHTML = "Modified: " + modifiedTimestampLocaleString;
	
	var createdTimestampTd = this.journalPanelGetElementById(this.getJournalCreatedTimestampId(id));
	if(createdTimestampTd.innerHTML == "Created: ") {
		createdTimestampTd.innerHTML = "Created: " + modifiedTimestampLocaleString;	
	}
	
	//set the values into the revision
	journalPageRevision.journalPageId = id;
	journalPageRevision.revisionLastEditedTime = revisionLastEditedTime;
	journalPageRevision.nodeId = nodeId;
	journalPageRevision.data = data;
	journalPageRevision.title = title;
};

/**
 * Loops through all the journal page ids and calls journalSavePage()
 * on each of them to make sure all changes are pushed to the server.
 * This is required because if the student is typing in a field and
 * they close the window, the onblur effect will not fire which is
 * usually what calls journalSavePage(). This is a special case
 * so we need to call journalSavePage() for all ids to make sure
 * we obtain the changes the student was just working on. 
 */
View.prototype.journalSaveAllPages = function() {
	if(this.journal != null) {
		//get the journal pages
		var journalPages = this.journal.journalPages;
		
		//loop through all the journal pages
		for(var x=0; x<journalPages.length; x++) {
			//get a journal page
			var journalPage = journalPages[x];
			
			//save any changes made to this current page
			this.journalSavePage(journalPage.id);
		}
		
		this.saveJournalToServer();
	}
};

/**
 * Creates the UI for the journal page.
 */
View.prototype.addJournalPageToDisplay = function(journalPage, newPage) {
	var journalPageId = journalPage.id;
	
	//create the div
	var journalPageDiv = document.createElement('div');

	//set the id for the div
	journalPageDiv.id = this.getJournalPageDivId(journalPageId);

	var latestJournalPageRevision = journalPage.getLatestRevision();
	
	var data = "";
	var createdTimestamp = "";
	var pageLastEditedTime = "";
	var nodeId = "";
	var title = "";
	
	if(latestJournalPageRevision != null) {
		//get the data the student wrote
		title = latestJournalPageRevision.title;
		data = latestJournalPageRevision.data;
		nodeId = latestJournalPageRevision.nodeId;

		//get the timestamps
		createdTimestamp = journalPage.pageCreatedTime;
		pageLastEditedTime = latestJournalPageRevision.revisionLastEditedTime;
	}
	
	var createdTimestampLocaleString = "";
	var modifiedTimestampLocaleString = "";
	
	if(createdTimestamp != null && createdTimestamp != "") {
		//parse the millisecond value into a readable date
		createdTimestampLocaleString = new Date(parseInt(createdTimestamp)).toLocaleString();
	}
	
	if(pageLastEditedTime != null && pageLastEditedTime != "") {
		//parse the millisecond value into a readable date
		modifiedTimestampLocaleString = new Date(parseInt(pageLastEditedTime)).toLocaleString();
	}

	//set the class for the div
	journalPageDiv.className = "journalPage";
	if(nodeId != null && nodeId != "") {
		/*
		 * append the journalPage_[nodeId] class if there is an
		 * associated nodeId
		 */
		journalPageDiv.className += " journalPage_" + nodeId;
	}

	//create the html for the journal page
	var journalPageHTML = "";
	journalPageHTML = "<table border='1'>";
	
	journalPageHTML += "<tr>";
	journalPageHTML += "<td>Title <input type='text' id='journalPageTitle" + journalPageId + "' size='40' onBlur='view.journalSavePage("+ journalPageId + ")' value='" + title + "'/></td>";
	journalPageHTML += "</tr>";
	
	journalPageHTML += "<tr>";

	//add the textarea where the student will type
	journalPageHTML += "<td width='80%'><textarea id='journalPageText" + journalPageId + "' cols='50' rows='10' onBlur='view.journalSavePage("+ journalPageId + ")'>" + data + "</textarea></td>";

	journalPageHTML += "<td width='20%'>";

	//add the associate page to step button
	journalPageHTML += "<input type='button' value='Associate with current step' id='journalAssociate" + journalPageId + "' onClick='view.journalAssociateStep(" + journalPageId + ", true)' />";
	
	//add the unassociate page to step button
	journalPageHTML += "<input type='button' value='Unassociate from step' id='journalAssociate" + journalPageId + "' onClick='view.journalAssociateStep(" + journalPageId + ", false)' />";
	
	//add the delete button
	journalPageHTML += "<input type='button' value='Delete' onclick='view.journalDeletePage(" + journalPageId + ")'/>";

	journalPageHTML += "</td>";
	journalPageHTML += "</tr>";

	journalPageHTML += "<tr>";

	//add the time created timestamp
	journalPageHTML += "<td id='journalCreatedTimestamp" + journalPageId + "'>Created: " + createdTimestampLocaleString + "</td>";

	/*
	 * add the section where we will display messages to the user such as "Changed..."
	 */
	journalPageHTML += "<td id='journalMessage" + journalPageId + "'></td>";
	journalPageHTML += "</tr>";
	journalPageHTML += "<tr>";

	//add the time modified timestamp
	journalPageHTML += "<td id='journalModifiedTimestamp" + journalPageId + "'>Modified: " + modifiedTimestampLocaleString + "</td>";

	//check if this is a new page
	if(newPage) {
		/*
		 * display the message to the user that this is a new page
		 */
		journalPageHTML += "<td id='journalNewPage" + journalPageId + "'></td>";
	}

	journalPageHTML += "</tr>";
	journalPageHTML += "<tr>";

	var title = "";
	if(nodeId != null && nodeId != "") {
		var node = this.getProject().getNodeById(nodeId);
		//check if the node exists
		if(node != null) {
			//get the title of the node if there is a nodeId
			title = node.title;
		}
	}

	/*
	 * display the associated step, there may not be one in which 
	 * case there will be no link
	 */
	journalPageHTML += "<td id='journalNodeId" + journalPageId + "'>Associated Step: <a onClick='eventManager.fire(\"nodeLinkClicked\", [\"" + this.getProject().getPositionById(nodeId) + "\"]); return false;' href=''>" + title + "</a></td>";
	
	journalPageHTML += "</tr>";
	journalPageHTML += "</table>";
	
	journalPageHTML += "<br>";

	//set the html into the journal page div
	journalPageDiv.innerHTML = journalPageHTML;

	var journalPagesElement = this.journalPanelGetElementById('journalPages');
	
	//add the journal page to the beginning of the journalPages div
	if(journalPagesElement.firstChild == null) {
		//there are no other journal pages so we will just append the new page
		journalPagesElement.appendChild(journalPageDiv);
	} else {
		/*
		 * there are other journal pages so we need to add it before the
		 * first page
		 */
		journalPagesElement.insertBefore(journalPageDiv, journalPagesElement.firstChild);
	}
};



/**
 * Associate the specified entry id with the current step
 * @param id the id integer for the journal page
 * @param associate a boolean value whether to associate to
 * current step or to unnassociate 
 */
View.prototype.journalAssociateStep = function(id, associate) {
	//get the div that displays this journal page
	var journalPageDiv = this.journalPanelGetElementById(this.getJournalPageDivId(id));
	
	//get the class of the div
	var className = journalPageDiv.className;
	
	//remove any existing journal page node class
	className = className.replace(/journalPage_\S+/g, "");
	
	if(associate) {
		//associate with current step
		var associatedNodeId = this.getCurrentNode().id;
		
		//get the node position
		var associatedNodePosition = this.getProject().getPositionById(associatedNodeId);
		
		//get the title
		var title = this.getProject().getNodeById(associatedNodeId).title;
		
		/*
		 * set the html to display a link for the associated step that will 
		 * tell the vle to go to that step when clicked
		 */
		this.journalPanelGetElementById(getJournalNodeId(id)).innerHTML = "Associated Step: <a onClick='eventManager.fire(\"nodeLinkClicked\", [\"" + associatedNodePosition + "\"]); return false;' href=''>" + title + "</a>";
		
		//add the new journal page node id class
		className += " journalPage_" + associatedNodeId;
	} else {
		//unassociate from step
		this.journalPanelGetElementById(getJournalNodeId(id)).innerHTML = "Associated Step:";
	}

	//set the new class back to the div
	journalPageDiv.className = className; 
	
	//save any local changes
	this.journalSavePage(id);
};

/**
 * Hides all the journal pages from the display. This is used
 * when the user creates a new page because we want to hide
 * all the pages except for the new page to make it easier
 * for them to see the new page and start writing in it.
 */
View.prototype.journalHideAllPages = function() {
	/*
	 * get all the journal pages by looking up all elements
	 * with the class "journalPage"
	 */
	var journalPageDivs = this.journalPanelGetElementsByClassName("journalPage");

	//loop through all the journal page divs and hide them
	for(var x=0; x<journalPageDivs.length; x++) {
		journalPageDivs[x].style.display = "none";
	}
};

/**
 * Makes all the journal pages viewable in the display.
 */
View.prototype.journalShowAllPages = function() {
	/*
	 * get all the journal pages by looking up all elements
	 * with the class "journalPage"
	 */
	var journalPageDivs = this.journalPanelGetElementsByClassName("journalPage");

	//loop through all the journal page divs and display them
	for(var x=0; x<journalPageDivs.length; x++) {
		journalPageDivs[x].style.display = "block";
	}
};

/**
 * Display only the journal pages associated with
 * the current node the student is on in the vle.
 */
View.prototype.journalShowPagesForCurrentNode = function() {
	this.showAllJournalPagesWithNodeId(this.getCurrentNode().id);
};

/**
 * Display only the journal pages associated with the
 * argument nodeId.
 * @param nodeId the id of the node to display journal
 * 		pages for
 */
View.prototype.showAllJournalPagesWithNodeId = function(nodeId) {
	//hide all journal pages first
	this.journalHideAllPages();

	if(nodeId != null) {
		//get all the journal pages with the class journalPage_[nodeId]
		var pagesWithNodeId = this.journalPanelGetElementsByClassName("journalPage_" + nodeId);

		//display the associated journal pages
		for(var x=0; x<pagesWithNodeId.length; x++) {
			pagesWithNodeId[x].style.display = "block";
		}
	}
};

/**
 * Gets the dom id of the journal page div
 * @param id the integer id of the journal page
 */
View.prototype.getJournalPageDivId = function(id) {
	return "journalPage" + id;
};

/**
 * Gets the dom id of the journal page text area
 * @param id the integer id of the journal page
 */
View.prototype.getJournalPageTextId = function(id) {
	return "journalPageText" + id;
};

/**
 * Get the dom id of the journal page title input text element
 * @param id the integer id of the journal page
 */
View.prototype.getJournalPageTitleId = function(id) {
	return "journalPageTitle" + id;
};

/**
 * Gets the dom id of the journal page modified timestamp td
 * @param id the integer id of the journal page
 */
View.prototype.getJournalModifiedTimestampId = function(id) {
	return "journalModifiedTimestamp" + id;
};


/**
 * Gets the dom id of the journal page created timestamp td
 * @param id the integer id of the journal page
 */
View.prototype.getJournalCreatedTimestampId = function(id) {
	return "journalCreatedTimestamp" + id;
};

/**
 * This gets called automatically when the journal panel is closed
 * @param type
 * @param fireArgs
 * @param subscribeArgs
 */
View.prototype.saveJournalOnClose = function(type, fireArgs, subscribeArgs) {
	this.saveJournalToServer();
};

/**
 * Save the journal changes back to the server
 */
View.prototype.saveJournalToServer = function() {
	var revisionsToSave = [];
	
	//loop through all the journal pages
	for(var x=0; x<this.journal.journalPages.length; x++) {
		//get a journal page
		var journalPage = this.journal.journalPages[x];
		
		//check if the journal page was modified
		if(journalPage.modified) {
			//journal was modified so we need to send the latest revision back to the server
			
			//create an object that will hold the revision data
			var latestRevision = {};
			
			//check if the page was deleted
			if(journalPage.deleted) {
				/*
				 * page was deleted so we only need to set the deleted flag
				 * and the journal page id into the revision object
				 */
				latestRevision.deleted = true;
				latestRevision.journalPageId = journalPage.id;
			} else {
				/*
				 * the journal page data was just modified so we will retrieve
				 * the latest revision from the journal page
				 */
				latestRevision = journalPage.getLatestRevision();
			}
			
			/*
			 * add the revision to the array that we will eventually send back
			 * to the server
			 */
			revisionsToSave.push(latestRevision);
			
			/*
			 * set the modified flag back to false since all changes for this
			 * page will be pushed back to the server
			 */
			journalPage.modified = false;
		}
	}
	
	//get the parameters to create the post request
	var postJournalDataUrl = this.getConfig().getConfigParam('postJournalDataUrl');
	var workgroupId = this.getUserAndClassInfo().getWorkgroupId();
	var runId = this.getConfig().getConfigParam('runId');
	var doNothing = function() {};
	
	//check if there were any revisions
	if(revisionsToSave.length != 0) {
		//obtain the string representation of the revision array
		var revisionsToSaveString = $.stringify(revisionsToSave);
		
		//send the revision array back the server
		this.connectionManager.request('POST', 3, postJournalDataUrl, {revisionsToSave: revisionsToSaveString, workgroupId: workgroupId, location: runId}, doNothing);		
	}
};

/**
 * Get the value of the title for the journal page with the given id
 * @param id the id of the journal page
 * @return the title the student wrote for the journal page
 */
View.prototype.getJournalPageTitleValueById = function(id) {
	//get the dom id for the title element
	var journalPageTitleId = this.getJournalPageTitleId(id);
	
	//get the dom element
	var journalPageTitle = this.journalPanelGetElementById(journalPageTitleId);
	
	//get the value
	var title = journalPageTitle.value;
	return title;
};

/**
 * Get the value of the data for the journal page with the given id
 * @param id the id of the journal page
 * @return the data the student wrote for the journal page
 */
View.prototype.getJournalPageDataValueById = function(id) {
	//get the dom id for the data element
	var journalPageTextId = this.getJournalPageTextId(id);
	
	//get the dom element
	var journalPageTextArea = this.journalPanelGetElementById(journalPageTextId);
	
	//get the value
	var data = journalPageTextArea.value;
	return data;
};

View.prototype.getJournalPageNodeIdValueById = function(id) {
	//get the div that displays this journal page
	var journalPageDiv = this.journalPanelGetElementById(this.getJournalPageDivId(id));
	
	//get the class of the div
	var className = journalPageDiv.className;
	
	var regExp = new RegExp(/journalPage_(\S+)/);
	
	if(className.match(regExp) != null) {
		return RegExp.$1;
	} else {
		return "";
	}
};


/**
 * Gets the dom id of the journal page check box
 * @param id the integer id of the journal page
 */
function getJournalAssociateId(id) {
	return "journalAssociate" + id;
}

/**
 * Gets the dom id of the journal page save button
 * @param id the integer id of the journal page
 */
function getJournalSaveButtonId(id) {
	return "journalSaveButton" + id;
}


/**
 * Gets the dom id of the journal page nodeId section td
 * @param id the integer id of the journal page
 */
function getJournalNodeId(id) {
	return "journalNodeId" + id;
}

/**
 * Gets the dom id of the journal page message td
 * @param id the integer id of the journal page
 */
function getJournalMessageId(id) {
	return "journalMessage" + id;
}

/**
 * Gets the dom id of the journal page new page message td
 * @param id the integer id of the journal page
 */
function getJournalNewPageId(id) {
	return "journalNewPage" + id;
}


/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_journal.js');
};
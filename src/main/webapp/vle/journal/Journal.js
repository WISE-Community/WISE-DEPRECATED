/**
* A Journal manages the Journal and 
* Journal Entry Nodes.
*
* author: patrick lawler
*/

function Journal(){
	//this.journalJSONString = journalJSONString; //the JSON string for the journal
	this.workgroupId = null; //the id of the workgroup this journal belongs to
	this.journalPages = new Array(); //an array of JournalPage objects
}


/**
 * 
 * @param journalJSONString
 * @return
 */
Journal.prototype.parseDataJSONString = function(journalJSONString) {
	if(journalJSONString == "") {
		return new Journal();
	}
	
	var journalJSONObj = $.parseJSON(journalJSONString);
	
	var journal = new Journal();
	journal.workgroupId = journalJSONObj.workgroupId;
	journal.journalPages = new Array();
	
	if(journalJSONObj.journalPages != null) {
		for(var x=0; x<journalJSONObj.journalPages.length; x++) {
			var journalPageJSONObj = journalJSONObj.journalPages[x];
			
			var journalPageObj = JournalPage.prototype.parseDataJSONObj(journalPageJSONObj);
			
			journal.journalPages.push(journalPageObj);
		}
	}
	
	return journal;
};


/**
 * Add the Journal Page object to our array of journal pages
 * @param newJournalPage a Journal Page object
 */
Journal.prototype.addJournalPage = function() {
	
	if(journalPage == null) {
		/*
		 * we don't have a JournalPage with the new id so we will add
		 * the whole JournalPage 
		 */
		this.journalPages.push(newJournalPage);
	} else {
		/*
		 * we already have a JournalPage with the new id so we will
		 * just add the new JournalPage's revision to the old
		 * JournalPage's array of revisions
		 */
		journalPage.journalPageRevisionArray.push(newJournalPage.getLatestRevision());
	}
};

/**
 * Get the JournalPage object with the given id
 * @param id the integer id of the JournalPage we want
 * @return the JournalPage object with the given id
 */
Journal.prototype.getJournalPage = function(id) {
	//loop through all the journal pages
	for(var x=0; x<this.journalPages.length; x++) {
		//check if the id of the journal page matches the argument id
		if(this.journalPages[x].id == id) {
			//return the page if we found a match
			return this.journalPages[x];
		}
	}
	
	//return null if we didn't find a JournalPage with the argument id
	return null;
};

/**
 * Adds the JournalPageRevision to the JournalPage
 * @param journalPageRevision a JournalPageRevision object
 */
Journal.prototype.addJournalPageRevisionToJournalPage = function(journalPageRevision) {
	//get the JournalPage with the same id as the JournalPageRevision
	var journalPage = this.getJournalPage(journalPageRevision.journalPageId);
	
	if(journalPage == null) {
		/*
		 * we did not find a JournalPage with the same id so we will need to
		 * create a JournalPage to put the JournalPageRevision into
		 */
		this.addJournalPage(this.createJournalPageFromJournalPageRevision(journalPageRevision));
	} else {
		/*
		 * we found a JournalPage so we will just stick the JournalPageRevision
		 * into the JournalPage's array
		 */
		journalPage.addJournalPageRevision(journalPageRevision);		
	}
};

/**
 * Creates a JournalPage given a JournalPageRevision
 * @param journalPageRevision a JournalPageRevision
 * @return a JournalPage
 */
Journal.prototype.createJournalPageFromJournalPageRevision = function(journalPageRevision) {
	//create a new JournalPage
	var journalPage = new JournalPage();
	
	//set the id for the JournalPage
	journalPage.id = journalPageRevision.journalPageId;
	
	//add the JournalPageRevision to the JournalPage's array
	journalPage.journalPageRevisionArray.push(journalPageRevision);
	
	//return the new JournalPage
	return journalPage;
};

/**
 * Remove the JournalPage with the argument id 
 * @param id the integer id of the JournalPage to remove
 */
Journal.prototype.removeJournalPage = function(id) {
	//loop through the JournalPage array 
	for(var x=0; x<this.journalPages.length; x++) {
		//check the id to see if it matches the id we want to remove
		if(this.journalPages[x].id == id) {
			/*
			 * cut the current element out of the array, the 1 means to
			 * only cut 1 element starting from position x
			 */
			this.journalPages.splice(x, 1);
		}
	}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/journal/Journal.js');
}
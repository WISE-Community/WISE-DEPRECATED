/**
 * A JournalPage that is used in Journal objects 
 */

function JournalPage() {
	this.id = ""; //the integer id of the JournalPage
	this.pageCreatedTime = new Date().getTime();  	//the time the parent JournalPage was created
	this.journalPageRevisionArray = [];
	this.modified = false;
	this.deleted = false;
}


JournalPage.prototype.parseDataJSONObj = function(journalPageJSONObj) {
	var journalPage = new JournalPage();
	
	journalPage.id = journalPageJSONObj.id;
	//journalPage.data = journalPageJSONObj.data;
	journalPage.nodeId = journalPageJSONObj.nodeId;
	journalPage.pageCreatedTime = journalPageJSONObj.pageCreatedTime;
	journalPage.pageLastEditedTime = journalPageJSONObj.pageLastEditedTime;
	journalPage.journalPageRevisionArray = journalPageJSONObj.journalPageRevisionArray;
	
	return journalPage;
};


/**
 * Add the JournalPageRevision to this JournalPage's array of
 * JournalPageRevisions
 * @param journalPageRevision a JournalPageRevision object
 */
JournalPage.prototype.addJournalPageRevision = function(journalPageRevision) {
	//add the JournalPageRevision to the array of JournalPageRevisions
	this.journalPageRevisionArray.push(journalPageRevision);
}

/**
 * Get the latest JournalPageRevision in this JournalPage
 * @return the latest JournalPageRevision
 */
JournalPage.prototype.getLatestRevision = function() {
	//if there are no revisions return null
	if(this.journalPageRevisionArray.length == 0) {
		return null;
	}
	
	//get the last JournalPageRevision in the array
	return this.journalPageRevisionArray[this.journalPageRevisionArray.length - 1];
}

/**
 * Converts the epoch integer value to milliseconds. The argument epochTime
 * may be in seconds or milliseconds. If it is already in milliseconds,
 * nothing needs to be done and the value is returned without any modification.
 * @param epochTime integer value of seconds or milliseconds
 * @return the epochTime in milliseconds
 */
JournalPage.prototype.obtainEpochMilliseconds = function(epochTime) {
	//check if the time is in seconds
	if(epochTime / 1000000000000 < 1) {
		//the time was in seconds so we will convert it to milliseconds
		epochTime *= 1000;
	}
	
	//return the epoch time which is in milliseconds
	return epochTime;
}


//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/journal/JournalPage.js');
};
/**
 * A JournalPageRevision that contains the actual data of the journal.
 * JournalPageRevisions are used in JournalPage objects. 
 */

function JournalPageRevision(id, revisionLastEditedTime, nodeId, title, data) {
	//the integer id of the parent JournalPage
	this.journalPageId = id;

	//the time this revision was made
	this.revisionLastEditedTime = revisionLastEditedTime;
	
	//the string of the associated nodeId
	this.nodeId = nodeId;
	
	//what the student wrote
	this.data = data;
	
	//the title the student wrote for the journal page
	this.title = title;
}

JournalPageRevision.prototype.parseDataJSONObj = function(journalPageRevisionJSONObj) {
	
};

/**
 * Converts the epoch integer value to milliseconds. The argument epochTime
 * may be in seconds or milliseconds. If it is already in milliseconds,
 * nothing needs to be done and the value is returned without any modification.
 * @param epochTime integer value of seconds or milliseconds
 * @return the epochTime in milliseconds
 */
JournalPageRevision.prototype.obtainEpochMilliseconds = function(epochTime) {
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
	eventManager.fire('scriptLoaded', 'vle/journal/JournalPageRevision.js');
};
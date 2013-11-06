View.prototype.getGradingConfig = function(gradingConfigUrl) {
	this.model = new GradingModel();
	var gradingConfigContent = createContent(gradingConfigUrl);
	this.config = this.createConfig(gradingConfigContent);

	eventManager.fire('getGradingConfigCompleted');
	
	/* set the servlet request urls - assumes that the grading tool is always run in portal mode */
	var loc = window.location.toString();
	var base = loc.substring(0, loc.lastIndexOf('/vlewrapper/vle/'));
	this.minifierUrl = base + '/webapp/router.html';
};

/**
 * Retrieve the student workgroupIds
 */
View.prototype.getStudentUserInfo = function() {
	var userInfoContent = createContent(this.config.getConfigParam('getUserInfoUrl'));

	//parse and load the xml that contains the workgroup ids
	//vle.loadUserAndClassInfo(o.responseXML);
	this.loadUserAndClassInfo(userInfoContent);

	//get the teacher workgroup id
	teacherId = this.getUserAndClassInfo().getWorkgroupId();

	//retrieve all the student users
	this.studentWorkgroupIds = new Array();
	classUsers = this.getUserAndClassInfo().getUsersInClass();

	//loop through all the classmates
	for(var x=0; x<classUsers.length; x++) {
		//all users including the teacher are stored as a classmate right now
		if(classUsers[x].workgroupId != teacherId) {
			/*
			 * if the user is not the teacher, add it to the 
			 * student workgroup ids array
			 */
			this.studentWorkgroupIds.push(classUsers[x].workgroupId);
		}
	}

	eventManager.fire('processUserAndClassInfoCompleted');
};

/** 
 * If the currently loaded project is not minified, we want to minify it.
 */
View.prototype.checkAndMinify = function(){
	/* if project currently loaded exists and is minified, no need
	 * to do anything otherwise, we should minify it. */
	if(!this.isLoadedProjectMinified && this.getProject() && this.getConfig() && this.getConfig().getConfigParam('getProjectPath')){
		var success = function(t,x,o){
			//do not display any messages
			
			/*
			 * if the project was successfuly minified it will have responded
			 * with the new last minified time
			 */
			var lastMinified = parseInt(t);
			
			if(isNaN(lastMinified)) {
				/*
				 * the response was not a number which means the response was
				 * probably the word 'success'. this means the minified project
				 * is already up to date.
				 */
			} else {
				/*
				 * the response was a number representing the timestamp at which
				 * the project was just minified. now we will save the lastMinified
				 * timestamp to the project_metadata table in the server db
				 */
				
				//set the params to post the last minified timestamp
				var postLastMinifiedParams = {
					projectId:o.getConfig().getConfigParam('projectId'),
					command:'postLastMinified',
					lastMinified:lastMinified
				};
				
				var updateLastMinifiedSuccess = function(text, xml, obj) {
					//do nothing
				};
				
				var updateLastMinifiedFailure = function(text, xml, obj) {
					//do nothing
				};
				
				//make the post to save the lastMinified timestamp
				o.connectionManager.request('POST', 1, o.getConfig().getConfigParam('projectMetaDataUrl'), postLastMinifiedParams, updateLastMinifiedSuccess, this, updateLastMinifiedFailure);
			}
		};
	
		var failure = function(t,o){
			//do not display any messages
		};
		
		this.connectionManager.request('POST', 1, this.minifierUrl, {forward:'minifier', projectId:this.getConfig().getConfigParam('projectId'), runId:this.getConfig().getConfigParam('runId'), command:'minifyProject', path:this.getConfig().getConfigParam('getProjectPath')}, success, this, failure);
	};
};



var studentWorkQueryObject;

/**
 * Called after all the js files are loaded
 */
function afterScriptsLoad(){
	//after all the js files have been loaded, render the gradebystep display
	render(contentUrl, userUrl, getDataUrl, contentBaseUrl, getAnnotationsUrl, postAnnotationsUrl, runId);
}

/**
 * Called when the page starts to load
 */
window.onload=function(){
	// lock screen
	lock();
	
	//load all the js files
	if (window.location.search.indexOf("loadScriptsIndividually") != -1) {
       scriptloader.useDeflatedScripts = false;
    }
	scriptloader.initialize(document, afterScriptsLoad, 'gradebystep');
};

/**
 * Handles the saving of any unsaved work when user exits/refreshes/etc
 * @param whether to logout the user
 */
View.prototype.onWindowUnload = function(){
	
	/* tell xmpp server that student is disconnecting */
	if (this.xmpp && this.isXMPPEnabled) {
		if ($("#studentScreenStatus").html() == "paused") {
			// if student screens are paused and teacher tries to exit, warn the teacher to unpause before exiting.
			// this will also save us time to save the chat log. stopgap solution for https://github.com/WISE-Community/WISE-VLE/issues/196
			this.xmpp.doUnPause();
			this.xmpp.disconnect();
			alert("Please remember to unpause students' monitors before closing the classroom monitor next time!");
		} else {
			this.xmpp.disconnect();
		}
	}
};

function projectSummary(){
	window.open("/webapp/student/vle/vle.html?runId=" + runId + "&summary=true", "Project Summary", "height=600, width=800");
};


var newWin = null;
function popUp(strURL, strType, strHeight, strWidth) {
 if (newWin != null && !newWin.closed)
   newWin.close();
 var strOptions="";
 if (strType=="console")
   strOptions="resizable,height="+
     strHeight+",width="+strWidth;
 if (strType=="fixed")
   strOptions="status,height="+
     strHeight+",width="+strWidth;
 if (strType=="elastic")
   strOptions="toolbar,menubar,scrollbars,"+
     "resizable,location,height="+
     strHeight+",width="+strWidth;
 newWin = window.open(strURL, 'newWin', strOptions);
 newWin.focus();
}

/**
 * This gets called by gradebystep.jsp in the topiframeOnLoad() function.
 * We will just remember all the url arguments to use them later when
 * in afterScriptsLoad() when we call render().
 */
function load_old(contentUrl, userUrl, getDataUrl, contentBaseUrl, getAnnotationsUrl, postAnnotationsUrl, runId, getFlagsUrl, postFlagsUrl) {
	//alert("contentURL: " + contentUrl + "\n\nuserURL: " + userUrl + "\n\ngetDataUrl: " + getDataUrl + "\n\ncontentBaseUrl: " + contentBaseUrl + "\n\ngetAnnotationsUrl: " + getAnnotationsUrl + "\n\npostAnnotationsUrl: " + postAnnotationsUrl);
	this.contentUrl = contentUrl;
	this.userUrl = userUrl;
	this.getDataUrl = getDataUrl;
	this.contentBaseUrl = contentBaseUrl;
	this.getAnnotationsUrl = getAnnotationsUrl;
	this.postAnnotationsUrl = postAnnotationsUrl; 
	this.runId = runId;
	this.getFlagsUrl = getFlagsUrl;
	this.postFlagsUrl = postFlagsUrl;
}

var waitingIntervalId = 0;
function addDot() {
	document.getElementById("gradeWorkDiv").innerHTML += ".";
}

function lock() {
	waitingIntervalId = setInterval("addDot()", 1000);	
}

function unlock() {
	document.getElementById("gradeWorkDiv").innerHTML += "";
	clearInterval(waitingIntervalId);
}


function expandMenu(menuId) {
	myMenu.expandMenu(document.getElementById(menuId));
}

/**
 * Setup and display the project
 *
 * @param contentURL a url to the project file, we will use a get
 *		request to obtain the project file
 * @param userURL a url to the user info, we will use a get request
 *		to obtain the user info 
 */
function render(contentURL, userURL, getDataUrl, contentBaseUrl, getAnnotationsUrl, postAnnotationsUrl, runId, getFlagsUrl, postFlagsUrl) {
	vle = new VLE(true);
	vle.runId = runId;

	//load the project content
	//vle.loadProjectForGradeByStep(contentUrl, contentBaseUrl);
	vle.loadProject(contentUrl, contentBaseUrl, true);

	//retrieve the workgroup ids for the students
	getStudentUserInfo();

	//setup events
	vle.eventManager.addEvent('getStudentUserInfoCompleted');
	vle.eventManager.addEvent('retrieveStudentWorkCompleted');
	vle.eventManager.addEvent('retrieveAnnotationsCompleted');

	/*
	 * when we are done retrieving the student workgroup ids, we will
	 * retrieve the work from all the students
	 */
	//vle.eventManager.subscribe("getStudentUserInfoCompleted", getStudentWork);
	vle.eventManager.subscribe("getStudentUserInfoCompleted", initiateDisplaySteps);

	/*
	 * when we are done retrieving the student work, we will retrieve
	 * the annotations
	 */
	//vle.eventManager.subscribe("retrieveStudentWorkCompleted", getAnnotations);

	//vle.eventManager.subscribe("retrieveAnnotationsCompleted", getFlags);
}




//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/grading/gradingview_startup.js');
};
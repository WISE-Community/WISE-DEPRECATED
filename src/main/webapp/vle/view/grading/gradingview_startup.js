View.prototype.getGradingConfig = function(gradingConfigUrl) {
	this.model = new GradingModel();
	var gradingConfigContent = createContent(gradingConfigUrl);
	this.config = this.createConfig(gradingConfigContent);

	eventManager.fire('getGradingConfigCompleted');
	
	/* set the servlet request urls - assumes that the grading tool is always run in portal mode */
	var loc = window.location.toString();
	
	//get the context path e.g. /wise
	var contextPath = this.getConfig().getConfigParam('contextPath');
	
	var base = loc.substring(0, loc.lastIndexOf(contextPath + '/vle/'));
};

/**
 * Retrieve the student workgroupIds
 */
View.prototype.getStudentUserInfo = function() {
	var userInfoContent = createContent(this.config.getConfigParam('userInfoURL'));

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

var studentWorkQueryObject;

/**
 * Called after all the js files are loaded
 */
function afterScriptsLoad(){
	//after all the js files have been loaded, render the gradebystep display
	render(contentUrl, userUrl, getDataUrl, contentBaseUrl, annotationsURL, annotationsURL, runId);
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

};

function projectSummary(){
	//get the context path e.g. /wise
	var contextPath = this.view.getConfig().getConfigParam('contextPath');
	
	window.open(contextPath + "/student/vle/vle.html?runId=" + runId + "&summary=true", "Project Summary", "height=600, width=800");
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
function load_old(contentUrl, userUrl, getDataUrl, contentBaseUrl, annotationsURL, annotationsURL, runId, flagsURL, flagsURL) {
	//alert("contentURL: " + contentUrl + "\n\nuserURL: " + userUrl + "\n\ngetDataUrl: " + getDataUrl + "\n\ncontentBaseUrl: " + contentBaseUrl + "\n\nannotationsURL: " + annotationsURL + "\n\nannotationsURL: " + annotationsURL);
	this.contentUrl = contentUrl;
	this.userUrl = userUrl;
	this.getDataUrl = getDataUrl;
	this.contentBaseUrl = contentBaseUrl;
	this.annotationsURL = annotationsURL;
	this.runId = runId;
	this.flagsURL = flagsURL;
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
function render(contentURL, userURL, getDataUrl, contentBaseUrl, annotationsURL, annotationsURL, runId, flagsURL, flagsURL) {
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
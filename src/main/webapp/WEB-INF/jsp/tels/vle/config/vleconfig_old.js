/**
 * Object for storing VLE Configuration
 * These include:
 * - postDataUrl, where to post student data
 * - getDataUrl, where to get the student data from
 * - contentUrl, where the .project file is
 * - contentBaseUrl, base url of content
 * - userInfoUrl, where to get user information
 * - theme, currently only UCCP and WISE are allowed
 */
function VLEConfig() {
	this.mode;
	this.runId;
	this.postDataUrl;
	this.getDataUrl;
	this.postJournalDataUrl;
	this.getJournalDataUrl;
	this.contentUrl;
	this.contentBaseUrl;
	this.userInfoUrl;
	this.runInfoUrl;
	this.runInfoRequestInterval;
	this.getFlagsUrl;
	this.annotationsUrl;
	this.postCurrentStepUrl;
	this.getCurrentStepUrl;
	this.theme;
	this.playAudioOnStart = false;
	this.postLevel;
}

VLEConfig.prototype.getRunId = function() {
	return this.runId;
}

/**
 * function for parsing the response into attributes.
 * @param response
 * @return
 */
VLEConfig.prototype.parse = function(responseXML) {
	this.mode = responseXML.getElementsByTagName("mode")[0].firstChild.nodeValue;
	this.contentUrl = responseXML.getElementsByTagName("contentUrl")[0].firstChild.nodeValue;
	this.contentBaseUrl = responseXML.getElementsByTagName("contentBaseUrl")[0].firstChild.nodeValue;
	this.userInfoUrl = responseXML.getElementsByTagName("userInfoUrl")[0].firstChild.nodeValue;
	this.theme = responseXML.getElementsByTagName('theme')[0];

	if (this.mode != "preview") {
		this.runId = responseXML.getElementsByTagName('runId')[0].firstChild.nodeValue;
	}

	if (responseXML.getElementsByTagName('startNode') &&
			responseXML.getElementsByTagName('startNode')[0] != null) {
		this.startNode = responseXML.getElementsByTagName('startNode')[0].firstChild.nodeValue;
	}
	
	if (responseXML.getElementsByTagName('mainNav') &&
			responseXML.getElementsByTagName('mainNav')[0] != null) {
		this.mainNav = responseXML.getElementsByTagName('mainNav')[0].firstChild.nodeValue;
	}
	
	
	// use audio 
	if (responseXML.getElementsByTagName('enableAudio') &&
			responseXML.getElementsByTagName('enableAudio')[0] != null) {
		this.useAudio = responseXML.getElementsByTagName('enableAudio')[0].firstChild.nodeValue;
	}
	
	// if use audio, check if audio should start playing on startup
	if (responseXML.getElementsByTagName('playAudioOnStart') &&
			responseXML.getElementsByTagName('playAudioOnStart')[0] != null) {
		this.playAudioOnStart = responseXML.getElementsByTagName('playAudioOnStart')[0].firstChild.nodeValue;
	}
	

	//check to make sure theme was defined in xml, if so, check to see if value is valid and set it,
	//otherwise default to WISE as a theme.
	if(this.theme != null && this.theme.firstChild && this.isValidTheme(this.theme.firstChild.nodeValue)){
		this.theme = this.theme.firstChild.nodeValue;
	} else {
		this.theme = 'WISE';
	};
	
	if (this.mode == "run") {
		this.getFlagsUrl = responseXML.getElementsByTagName("getFlagsUrl")[0].firstChild.nodeValue;
		if (this.theme == 'WISE') {  // grading only enabled in WISE mode.
			this.annotationsUrl = responseXML.getElementsByTagName("annotationsUrl")[0].firstChild.nodeValue;
		} else {
			this.annotationsUrl = "";
		}
		this.getDataUrl = responseXML.getElementsByTagName("getDataUrl")[0].firstChild.nodeValue;
		this.postDataUrl = responseXML.getElementsByTagName("postDataUrl")[0].firstChild.nodeValue;
		
		//check if the getJournalDataUrl tag exists in the xml
		if(responseXML.getElementsByTagName("getJournalDataUrl").length != 0) {
			this.getJournalDataUrl = responseXML.getElementsByTagName("getJournalDataUrl")[0].firstChild.nodeValue;	
		}
		
		//check if the postJournalDataUrl tag exists in the xml
		if(responseXML.getElementsByTagName("postJournalDataUrl").length != 0) {
			this.postJournalDataUrl = responseXML.getElementsByTagName("postJournalDataUrl")[0].firstChild.nodeValue;	
		}
		
		this.runInfoUrl = responseXML.getElementsByTagName("runInfoUrl")[0].firstChild.nodeValue;
		this.runInfoRequestInterval = responseXML.getElementsByTagName("runInfoRequestInterval")[0].firstChild.nodeValue;
		
		//check if the postCurrentStepUrl tag exists in the xml
		if(responseXML.getElementsByTagName("postCurrentStepUrl").length != 0) {
			this.postCurrentStepUrl = responseXML.getElementsByTagName("postCurrentStepUrl")[0].firstChild.nodeValue;
		}
		
		//check if the getCurrentStepUrl tag exists in the xml
		if(responseXML.getElementsByTagName("getCurrentStepUrl").length != 0) {
			this.getCurrentStepUrl = responseXML.getElementsByTagName("getCurrentStepUrl")[0].firstChild.nodeValue;
		}
		
		if(responseXML.getElementsByTagName("postLevel").length != 0) {
			this.postLevel = responseXML.getElementsByTagName("postLevel")[0].firstChild.nodeValue;
		}
	}
}

/**
 * Returns true if theme is an allowableTheme, false otherwise
 */
VLEConfig.prototype.isValidTheme = function(theme){
	var allowableThemes = ['UCCP', 'WISE'];
	return allowableThemes.contains(theme);
};

//used to notify scriptloader that this script has finished loading
scriptloader.scriptAvailable(scriptloader.baseUrl + "vle/config/vleconfig.js");
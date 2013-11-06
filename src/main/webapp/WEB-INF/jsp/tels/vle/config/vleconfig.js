/**
 * Object for storing VLE Configuration
 * These include:
 * - mode: run or preview 
 * - navMode: unspecified/null/default (default), none (no navigation), dropDownTree (simple tree navigation, dropDown button top left)
 * - postDataUrl, where to post student data
 * - getDataUrl, where to get the student data from
 * - contentUrl, where the .project file is
 * - contentBaseUrl, base url of content
 * - userInfoUrl, where to get user information
 * - theme, currently only UCCP and WISE are allowed
 * - userType: type of user who is logged in. {student, teacher,none}. None=not logged in.
 */
function VLEConfig(contentObject) {
	return function(contentObj) {
		var mode;
		var navMode = "none";
		var runId;
		var postDataUrl;
		var getDataUrl;
		var postJournalDataUrl;
		var getJournalDataUrl;
		var contentUrl;
		var contentBaseUrl;
		var userInfoUrl;
		var runInfoUrl;
		var runInfoRequestInterval;
		var getFlagsUrl;
		var annotationsUrl;
		var postCurrentStepUrl;
		var getCurrentStepUrl;
		var theme;
		var playAudioOnStart = false;
		var postLevel;
		var userType = "none";
		var contentObject = contentObj;
		var locale = "en";
		
		/**
		 * Initialize the vle config by parsing the xml
		 */
		var initializeVLEConfig = function() {
			parse(contentObject.getContentXML());
		};
		
		/**
		 * Parse the vle config xml and populate the variables
		 */
		var parse = function(vleConfigXML) {
			mode = vleConfigXML.getElementsByTagName("mode")[0].firstChild.nodeValue;
			contentUrl = vleConfigXML.getElementsByTagName("contentUrl")[0].firstChild.nodeValue;
			contentBaseUrl = vleConfigXML.getElementsByTagName("contentBaseUrl")[0].firstChild.nodeValue;
			userInfoUrl = vleConfigXML.getElementsByTagName("userInfoUrl")[0].firstChild.nodeValue;
			theme = vleConfigXML.getElementsByTagName('theme')[0];

			if (mode != "preview") {
				runId = vleConfigXML.getElementsByTagName('runId')[0].firstChild.nodeValue;
			}

			if (vleConfigXML.getElementsByTagName('startNode') &&
					vleConfigXML.getElementsByTagName('startNode')[0] != null) {
				startNode = vleConfigXML.getElementsByTagName('startNode')[0].firstChild.nodeValue;
			}
			
			if (vleConfigXML.getElementsByTagName('mainNav') &&
					vleConfigXML.getElementsByTagName('mainNav')[0] != null) {
				mainNav = vleConfigXML.getElementsByTagName('mainNav')[0].firstChild.nodeValue;
			}
			
			
			// use audio 
			if (vleConfigXML.getElementsByTagName('enableAudio') &&
					vleConfigXML.getElementsByTagName('enableAudio')[0] != null) {
				useAudio = vleConfigXML.getElementsByTagName('enableAudio')[0].firstChild.nodeValue;
			}
			
			// if use audio, check if audio should start playing on startup
			if (vleConfigXML.getElementsByTagName('playAudioOnStart') &&
					vleConfigXML.getElementsByTagName('playAudioOnStart')[0] != null) {
				playAudioOnStart = vleConfigXML.getElementsByTagName('playAudioOnStart')[0].firstChild.nodeValue;
			}
			

			//check to make sure theme was defined in xml, if so, check to see if value is valid and set it,
			//otherwise default to WISE as a theme.
			if(theme != null && theme.firstChild && isValidTheme(theme.firstChild.nodeValue)){
				theme = theme.firstChild.nodeValue;
			} else {
				theme = 'WISE';
			};
			
			if (mode == "run") {
				getFlagsUrl = vleConfigXML.getElementsByTagName("getFlagsUrl")[0].firstChild.nodeValue;
				if (theme == 'WISE') {  // grading only enabled in WISE mode.
					annotationsUrl = vleConfigXML.getElementsByTagName("annotationsUrl")[0].firstChild.nodeValue;
				} else {
					annotationsUrl = "";
				}
				getDataUrl = vleConfigXML.getElementsByTagName("getDataUrl")[0].firstChild.nodeValue;
				postDataUrl = vleConfigXML.getElementsByTagName("postDataUrl")[0].firstChild.nodeValue;
				
				//check if the getJournalDataUrl tag exists in the xml
				if(vleConfigXML.getElementsByTagName("getJournalDataUrl").length != 0) {
					getJournalDataUrl = vleConfigXML.getElementsByTagName("getJournalDataUrl")[0].firstChild.nodeValue;	
				}
				
				//check if the postJournalDataUrl tag exists in the xml
				if(vleConfigXML.getElementsByTagName("postJournalDataUrl").length != 0) {
					postJournalDataUrl = vleConfigXML.getElementsByTagName("postJournalDataUrl")[0].firstChild.nodeValue;	
				}
				
				runInfoUrl = vleConfigXML.getElementsByTagName("runInfoUrl")[0].firstChild.nodeValue;
				runInfoRequestInterval = vleConfigXML.getElementsByTagName("runInfoRequestInterval")[0].firstChild.nodeValue;
				
				//check if the postCurrentStepUrl tag exists in the xml
				if(vleConfigXML.getElementsByTagName("postCurrentStepUrl").length != 0) {
					postCurrentStepUrl = vleConfigXML.getElementsByTagName("postCurrentStepUrl")[0].firstChild.nodeValue;
				}
				
				//check if the getCurrentStepUrl tag exists in the xml
				if(vleConfigXML.getElementsByTagName("getCurrentStepUrl").length != 0) {
					getCurrentStepUrl = vleConfigXML.getElementsByTagName("getCurrentStepUrl")[0].firstChild.nodeValue;
				}
				
				if(vleConfigXML.getElementsByTagName("postLevel").length != 0) {
					postLevel = vleConfigXML.getElementsByTagName("postLevel")[0].firstChild.nodeValue;
				}
			}
		};
		
		//initialize the vle config
		initializeVLEConfig();
		
		return {
			getMode:function() {
				return mode;
			},
			getNavMode:function() {
				return navMode;
			},
			getRunId:function() {
				return runId;
			},
			getPostDataUrl:function() {
				return postDataUrl;
			},
			getGetDataurl:function() {
				return getDataUrl;
			},
			getPostJournalDataUrl:function() {
				return postJournalDataUrl;
			},
			getGetJournalDataUrl:function() {
				return getJournalDataUrl;
			},
			getContentUrl:function() {
				return contentUrl;
			},
			getContentBaseUrl:function() {
				return contentBaseUrl;
			},
			getUserInfoUrl:function() {
				return userInfoUrl;
			},
			getRunInfoUrl:function() {
				return runInfoUrl;
			},
			getRunInfoRequestInterval:function() {
				return runInfoRequestInterval;
			},
			getGetFlagsUrl:function() {
				return getFlagsUrl;
			},
			getAnnotationsUrl:function() {
				return annotationsUrl;
			},
			getPostCurrentStepUrl:function() {
				return postCurrentStepUrl;
			},
			getGetCurrentStepUrl:function() {
				return getCurrentStepUrl;
			},
			getTheme:function() {
				return theme;
			},
			getPlayAudioOnStart:function() {
				return playAudioOnStart;
			},
			getPostLevel:function() {
				return postLevel;
			},
			getUserType:function() {
				return userType;
			},
			getUserLocale:function() {
				return locale;
			},
			isValidTheme:function(theme) {
				var allowableThemes = ['UCCP', 'WISE'];
				return allowableThemes.contains(theme);
			}
		};
	}(contentObject);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/content/vleconfig.js');
};
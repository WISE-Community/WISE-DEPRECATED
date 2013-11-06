/**
 * Object for storing VLE Configuration, not all config
 * params may be defined depending on the context with
 * which the config is being used whether it be
 * student run, preview, or grading.
 * These include:
 * 
 * mode - run (aka student), preview, grading
 * runId - the id of the run
 * runInfoRequestInterval - how often to poll for special events
 * theme - currently only UCCP and WISE are allowed
 * playAudioOnStart - whether to have tts on at the start
 * runInfoUrl - where to get run info
 * getUserInfoUrl - where to get user information
 * getContentUrl - where the .project file is
 * getContentBaseUrl - base url of content
 * getStudentDataUrl - where to get student work
 * postStudentDataUrl - where to post student work
 * getJournalDataUrl - where to get journal work
 * postJournalDataUrl - where to post journal work
 * getFlagsUrl - where to get flags
 * postFlagsUrl - where to post flags
 * getAnnotationsUrl - where to get annotations
 * postAnnotationsUrl - where to post annotations
 * getCurrentStepUrl - where to get the current step
 * postCurrentStepUrl - where to post the current step
 * postLevel - how often to post back student work
 */
View.prototype.createConfig = function(contentObject) {
	return function(contentObj) {
		//store the content object
		var contentObject = contentObj;
		
		/*
		 * this object is just a json object and will contain 
		 * all the config params they will be referenced by 
		 * asking for
		 * configParams['configParamName']
		 * or
		 * configParams.configParamName
		 * 
		 * note: all the json keys should be named exactly the same
		 * as the config parameter. e.g.
		 * getDataUrl param should be named getDataUrl and not
		 * anything different like dataUrl or getStudentDataUrl, etc.
		 * that way when we try to obtain that config param
		 * we can actually retrieve it
		 */
		var configParams = contentObject.getContentJSON();

		//set any default values if they were not provided
		if(configParams['playAudioOnStart'] == null) {
			configParams['playAudioOnStart'] = false;			
		}
		
		return {
			isValidTheme:function(theme) {
				var allowableThemes = ['UCCP', 'WISE'];
				return allowableThemes.contains(theme);
			},
			getConfigParam:function(configParam) {
				return configParams[configParam];
			},
			/*
			 * allows the ability to insert config params to add
			 * them to the existing config params
			 */ 
			setConfigParam:function(configParamName, configParamValue) {
				configParams[configParamName] = configParamValue;
			}
		};
	}(contentObject);
};

View.prototype.getConfig = function() {
	return this.config;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/config/config.js');
};
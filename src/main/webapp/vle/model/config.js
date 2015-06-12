/**
 * Object for storing VLE Configuration, not all config
 * params may be defined depending on the context with
 * which the config is being used whether it be
 * student run, preview, or grading.
 * These include:
 * 
 * mode - run (aka student), preview, grading
 * runId - the id of the run
 * theme - currently only WISE is allowed
 * runInfoUrl - where to get run info
 * getUserInfoURL - where to get user information
 * getContentUrl - where the .project file is
 * getContentBaseUrl - base url of content
 * studentDataUrl - where to get/post student work
 * flagsUrl - where to get/post flags
 * annotationsURL - where to get/post annotations
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
		 * anything different like dataUrl or studentDataURL, etc.
		 * that way when we try to obtain that config param
		 * we can actually retrieve it
		 */
		var configParams = contentObject.getContentJSON();

		return {
			isValidTheme:function(theme) {
				var allowableThemes = ['WISE'];
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
	eventManager.fire('scriptLoaded', 'vle/model/config.js');
};

/**
 * Load the global tag maps from the project
 */
View.prototype.loadGlobalTagMaps = function() {
	//initialize the array of available global tag maps if necessary
	if(this.availableGlobalTagMaps == null) {
		this.availableGlobalTagMaps = [];
	}
	
	//get the project
	var project = this.getProject();
	
	/*
	 * get the global tag maps that are in the project. this will
	 * be an array of global tag map parameters that we will use
	 * to create the global tag maps.
	 */
	var globalTagMapParameters = project.getGlobalTagMaps();
	
	var globalTagMaps = [];
	
	if(globalTagMapParameters != null) {
		//loop through all the global tag map parameters
		for(var x=0; x<globalTagMapParameters.length; x++) {
			//get a global tag map parameter
			var globalTagMapParameter = globalTagMapParameters[x];
			
			//try to create the global tag map with the given parameters
			var globalTagMap = this.createGlobalTagMap(globalTagMapParameter);
			
			if(globalTagMap != null) {
				/*
				 * we were able to create the global tag map so we will add
				 * it to our array of global tag maps
				 */
				globalTagMaps.push(globalTagMap);
			}
		}
	}
	
	//set the array of global tag maps into the view
	this.globalTagMaps = globalTagMaps;
};

/**
 * Add an available global tag map to our array of available global tag maps.
 * This array will be used to create instances of global tag maps. 
 * Different themes can dynamically add their own global tag maps.
 * @param globalTagMap the global tag map object which should extend the
 * GlobalTagMap object
 */
View.prototype.addAvailableGlobalTagMap = function(globalTagMap) {
	//initialize the array of available global tag maps if necessary
	if(this.availableGlobalTagMaps == null) {
		this.availableGlobalTagMaps = [];
	}
	
	//add the global tag map to the array of available global tag maps
	this.availableGlobalTagMaps.push(globalTagMap);
};

/**
 * Create a global tag map given the global tag map parameters
 * @param globalTagMapParameters the parameters to tell us which
 * global tag map to create
 * @return the global tag map or null if we were unable to create
 * the global tag map
 */
View.prototype.createGlobalTagMap = function(globalTagMapParameters) {
	var globalTagMap = null;
	
	if(globalTagMapParameters != null) {
		//get the function args
		var functionArgs = globalTagMapParameters.functionArgs;
		
		//get the function name
		var functionName = globalTagMapParameters.functionName;
		
		//get the tag name
		var tagName = globalTagMapParameters.tagName;
		
		//get the available global tag maps that we can create
		var availableGlobalTagMaps = this.availableGlobalTagMaps;
		
		if(availableGlobalTagMaps != null) {
			//loop through all the available global tag maps
			for(var x=0; x<availableGlobalTagMaps.length; x++) {
				//get an available global tag map
				var availableGlobalTagMap = availableGlobalTagMaps[x];
				
				if(availableGlobalTagMap != null) {
					//get the function name from the available global tag map
					var tempFunctionName = availableGlobalTagMap.functionName;
					
					//check if the function name matches the one from the parameter
					if(functionName == tempFunctionName) {
						/*
						 * the function name matches so we have found the global tag map
						 * that we want to create. we will create an instance of this
						 * global tag map.
						 */
						globalTagMap = new availableGlobalTagMap(this, globalTagMapParameters);
						
						break;
					}
				}
			}
		}
	}
	
	return globalTagMap;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/vle/vleview_globaltagmaps.js');
}
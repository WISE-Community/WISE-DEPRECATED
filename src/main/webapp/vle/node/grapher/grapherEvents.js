
/*
 * This handles events and calls the appropriate function to handle
 * the event.
 * 
 * TODO: rename grapherDispatcher
 * For example if you are creating a quiz node you would change it to
 * quizDispatcher
 */
View.prototype.grapherDispatcher = function(type,args,obj){
	/*
	 * check to see if the event name matches 
	 * 
	 * TODO: rename grapherUpdatePrompt
	 * wait until you implement the authoring before you rename this
	 */ 
	if(type == 'grapherUpdatePrompt') {
		obj.GrapherNode.updatePrompt();
	} else if(type=='grapherUpdateXAxisName'){
		obj.GrapherNode.updateXAxisName();
	} else if(type=='grapherUpdateXUnits'){
		obj.GrapherNode.updateXUnits();
	} else if(type=='grapherUpdateXMin'){
		obj.GrapherNode.updateXMin();
	} else if(type=='grapherUpdateXMax'){
		obj.GrapherNode.updateXMax();
	} else if(type=='grapherUpdateYAxisName'){
		obj.GrapherNode.updateYAxisName();
	} else if(type=='grapherUpdateYUnits'){
		obj.GrapherNode.updateYUnits();
	} else if(type=='grapherUpdateYMin'){
		obj.GrapherNode.updateYMin();
	} else if(type=='grapherUpdateYMax'){
		obj.GrapherNode.updateYMax();
	} else if(type=='grapherUpdateShowGraphOptions'){
		obj.GrapherNode.updateShowGraphOptions();
	} else if(type=='grapherUpdateEnableCreatePrediction'){
		obj.GrapherNode.updateEnableCreatePrediction();
	} else if(type=='grapherUpdateEasyPrediction'){
		obj.GrapherNode.updateEasyPrediction();
	} else if(type=='grapherNewCustomSeriesLabel'){
		obj.GrapherNode.newCustomSeriesLabel();
	} else if(type=='grapherUpdateSeriesLabel'){
		obj.GrapherNode.updateSeriesLabel(args[0]);
	} else if(type=='grapherUpdateSeriesColor'){
		obj.GrapherNode.updateSeriesColor(args[0]);
	} else if(type=='grapherUpdateShowVelocity'){
		obj.GrapherNode.updateShowVelocity();
	} else if(type=='grapherUpdateShowAcceleration'){
		obj.GrapherNode.updateShowAcceleration();
	} else if(type=='grapherUpdateRequirePredictionBeforeEnter'){
		obj.GrapherNode.updateRequirePredictionBeforeEnter();
	} else if(type=='grapherUpdateGraphTitle'){
		obj.GrapherNode.updateGraphTitle();
	} else if(type=='grapherUpdateAllowUpdateAxisRange'){
		obj.GrapherNode.updateAllowUpdateAxisRange();
	} else if(type=='grapherUpdateAllowAnnotations'){
		obj.GrapherNode.updateAllowAnnotations();
	}
};

/*
 * this is a list of events that can be fired. when the event is fired,
 * the dispatcher function above will be called and then call the
 * appropriate function to handle the event.
 */
var events = [
	/*
	 * TODO: rename grapherUpdatePrompt
	 * wait until you implement the authoring before you rename this
	 */
	'grapherUpdatePrompt',
	'grapherUpdateXAxisName',
	'grapherUpdateXUnits',
	'grapherUpdateXMin',
	'grapherUpdateXMax',
	'grapherUpdateYAxisName',
	'grapherUpdateYUnits',
	'grapherUpdateYMin',
	'grapherUpdateYMax',
	'grapherUpdateShowGraphOptions',
	'grapherUpdateEnableCreatePrediction',
	'grapherUpdateEasyPrediction',
	'grapherNewCustomSeriesLabel',
	'grapherUpdateSeriesLabel',
	'grapherUpdateSeriesColor',
	'grapherUpdateShowVelocity',
	'grapherUpdateShowAcceleration',
	'grapherUpdateRequirePredictionBeforeEnter',
	'grapherUpdateGraphTitle',
	'grapherUpdateAllowUpdateAxisRange',
	'grapherUpdateAllowAnnotations'
];

/*
 * add all the events to the vle so the vle will listen for these events
 * and call the dispatcher function when the event is fired
 */
for(var x=0; x<events.length; x++) {
	/*
	 * TODO: rename grapherDispatcher
	 * For example if you are creating a quiz node you would change it to
	 * quizDispatcher. The name for the dispatcher should match the function
	 * name at the top of this file.
	 */
	componentloader.addEvent(events[x], 'grapherDispatcher');
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	/*
	 * TODO: rename grapher to your new folder name
	 * TODO: rename grapherEvents
	 * 
	 * e.g. if you were creating a quiz step it would look like
	 * 
	 * eventManager.fire('scriptLoaded', 'vle/node/quiz/quizEvents.js');
	 */
	eventManager.fire('scriptLoaded', 'vle/node/grapher/grapherEvents.js');
};
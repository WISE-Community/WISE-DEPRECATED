/* Author: 
 * Jonathan Breitbart
 */

//global variable so it can be accessed by other functions
var basket;

//global variable that specifies whether the idea basket has been changed so we know whether to save to the server
var basketChanged = false;

var subscribedToIdeaBasketChanged = false;

/**
 * Function that is called when the document is ready
 * @param object the jquery $
 * @param createForStep (optional) whether we are loading the basket for an
 * idea basket step or for the idea basket popup
 * @param stepBasket (optional) this IdeaBasket object should be provided if 
 * we are loading the basket for an idea basket step
 * @return
 */
var documentReadyFunction = function(object, createForStep, stepBasket) {
	
	if(stepBasket) {
		//set the idea basket since we are loading the idea basket for an idea basket step
		basket = stepBasket;
	} else {
		if(!basket){
			//create a new idea basket
			basket = new IdeaBasket();
		}
	}

	if(createForStep) {
		//we are loading the basket for an idea basket step
		basket.loadIdeaBasket();
	} else {
		//we are loading the basket for the idea basket popup
		parent.eventManager.fire('ideaBasketDocumentLoaded');	
	}
};

//$(document).ready(documentReadyFunction);

/**
 * Loads the idea basket from the global ideaBasket JSON object
 * that should have been set into the iframe
 * @param ideaBasketJSONObj the idea basket JSON object
 * @param generateUI whether to generate the UI and load the basket
 * or just load the basket
 * @param thisView the view
 */
var loadIdeaBasket = function(ideaBasketJSONObj, generateUI, thisView, settings, publicIdeaBasketJSONObj) {
	//only subscribe to the 'ideaBasketChanged' event once
	if(!subscribedToIdeaBasketChanged) {
		
		if(parent.frames['ideaBasketIfrm'] != null) {
			/*
			 * remember thisView in the iframe so we can access it later.
			 * this is only required if we are loading the basket for
			 * the idea basket popup
			 */
			parent.frames['ideaBasketIfrm'].thisView = thisView;
		}
		
		//subscribe to the event
		thisView.eventManager.subscribe('ideaBasketChanged', ideaBasketChanged, thisView);
		subscribedToIdeaBasketChanged = true;
	}
	
	//load the ideaBasket JSON object that should have been set into the iframe
	basket.load(ideaBasketJSONObj, generateUI, settings, thisView, publicIdeaBasketJSONObj);
};

/**
 * This is called when the 'ideaBasketChanged' event is fired.
 * @param type the name of the event 'ideaBasketChanged'
 * @param args an array containing the args provided when the event is fired
 * @param obj the view
 */
var ideaBasketChanged = function(type,args,obj) {
	if(typeof $ != 'undefined') {
		/*
		 * this branch is taken when the idea basket is loaded from the popup or
		 * an explanation builder step
		 */
		
		var thisView = obj;
		
		//get the idea basket
		var viewIdeaBasket = thisView.ideaBasket;
		
		//generate the JSON string for the idea basket
		var ideaBasketJSON = $.stringify(viewIdeaBasket);
		
		//generate the JSON object for the idea basket
		var ideaBasketJSONObj = $.parseJSON(ideaBasketJSON);
		
		//load the basket so that the newest changes are reflected
		loadIdeaBasket(ideaBasketJSONObj, true, thisView);		
	} else if(args != null && args.length > 0) {
		//this branch is taken when the idea basket is loaded from an idea basket step
		
		//get the first element of the array which contains the object we want
		var args0 = args[0];
		
		if(args0 != null && args0.ideaBasketStep != null) {
			//get the ideaBasketStep object
			var ideaBasketStep = args0.ideaBasketStep;
			
			var thisView = obj;
			
			//get the idea basket
			var viewIdeaBasket = thisView.ideaBasket;
			
			//generate the JSON string for the idea basket
			var ideaBasketJSON = JSON.stringify(viewIdeaBasket);
			
			//generate the JSON object for the idea basket
			var ideaBasketJSONObj = JSON.parse(ideaBasketJSON);
			
			//load the basket so that the newest changes are reflected
			ideaBasketStep.load(ideaBasketJSONObj, true);			
		}
	}
};

function resetForm(target){
	var element = $('#' + target);
	// hide any 'other' text inputs
	$('input.other',element).parent().hide();
	//clear validator messages
	var validator = $("#" + target).validate();
	validator.resetForm();
	//reset form values
	element.find(':input').each(function() {
		switch(this.type) {
		case 'password':
		case 'select-multiple':
			//case 'select-one':
		case 'text':
		case 'textarea':
			$(this).val('');
			break;
			//case 'checkbox':
			//case 'radio':
			// this.checked = false;
		}
	});
	/*$(':input','#' + target)
	 .not(':button, :submit, :reset, :hidden')
	 .val('')
	 .removeAttr('checked')
	 .removeAttr('selected');*/
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/ideaBasket/ideaBasketScript.js');
}
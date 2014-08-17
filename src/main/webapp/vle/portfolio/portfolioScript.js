/* Author: 
 * Hiroki and Eddie
 */

//global variable so it can be accessed by other functions
var portfolio;

//global variable that specifies whether the portfolio has been changed so we know whether to save to the server
var portfolioChanged = false;

var subscribedToPortfolioChanged = false;

/**
 * Function that is called when the document is ready
 * @param object the jquery $
 * @param createForStep (optional) whether we are loading the portfolio for an
 *  portfolio step or for the  portfolio popup
 * @param stepPortfolio (optional) this Portfolio object should be provided if 
 * we are loading the portfolio for an  portfolio step
 * @return
 */
var documentReadyFunction = function(object, createForStep, stepPortfolio) {
	
	if(stepPortfolio) {
		//set the portfolio since we are loading the portfolio for an portfolio step
		portfolio = stepPortfolio;
	} else {
		if(!portfolio){
			//create a new portfolio
			portfolio = new Portfolio();
		}
	}

	if(createForStep) {
		//we are loading the portfolio for an portfolio step
		portfolio.loadPortfolio();
	} else {
		//we are loading the portfolio for the portfolio popup
		parent.eventManager.fire('portfolioDocumentLoaded');	
	}
};

/**
 * Loads the portfolio from the global portfolio JSON object
 * that should have been set into the iframe
 * @param portfolioJSONObj the portfolio JSON object
 * @param generateUI whether to generate the UI and load the portfolio
 * or just load the portfolio
 * @param thisView the view
 */
var loadPortfolio = function(portfolioJSONObj, generateUI, thisView, settings, publicPortfolioJSONObj) {
	console.log('portfolioScript.js, loadPortfolio');
	//only subscribe to the 'portfolioChanged' event once
	if(!subscribedToPortfolioChanged) {
		
		if(parent.frames['portfolioIfrm'] != null) {
			/*
			 * remember thisView in the iframe so we can access it later.
			 * this is only required if we are loading the portfolio for
			 * the portfolio popup
			 */
			parent.frames['portfolioIfrm'].thisView = thisView;
		}
		
		//subscribe to the event
		thisView.eventManager.subscribe('portfolioChanged', portfolioChanged, thisView);
		subscribedToPortfolioChanged = true;
	}
	
	//load the portfolio JSON object that should have been set into the iframe
	parent.frames['portfolioIfrm'].portfolio.load(portfolioJSONObj, generateUI, settings, thisView, publicPortfolioJSONObj);
	
	//display portfolio items
	console.log('displaying portfolio items');
	for (var i=0; i<thisView.portfolio.items.length;i++) {
		createPage(thisView.portfolio.items[i]);
	}
};

var createPage = function(portfolioItem) {
	var nodeId = portfolioItem.nodeId;
	var node = thisView.getProject().getNodeById(nodeId);
	
	//get the latest node visit that has work
	var latestNodeVisitWithWork = thisView.getState().getLatestNodeVisitByNodeId(nodeId, false);
	var latestState = latestNodeVisitWithWork.getLatestState();
	var studentWork = node.translateStudentWork(latestState.getStudentWork());
	if (node.type == "SVGDrawNode") {
        studentWork = thisView.utils.decode64(studentWork);
	} else if (node.type == "OpenResponseNode") {
		studentWork = studentWork.response;
	}
	
	$("#portfolioItems").append("<div>"+portfolioItem.itemType+"</div>")
		.append("<div>"+portfolioItem.title+"</div>")
		.append("<div>"+portfolioItem.nodeId+"</div>")
		.append("<div>"+studentWork+"</div>")
		.append("<div>"+portfolioItem.annotation+"</div>");
	$("#portfolioItems").append("<br/>");
};

/**
 * This is called when the 'portfolioChanged' event is fired.
 * @param type the name of the event 'portfolioChanged'
 * @param args an array containing the args provided when the event is fired
 * @param obj the view
 */
var portfolioChanged = function(type,args,obj) {
	if(typeof $ != 'undefined') {
		/*
		 * this branch is taken when the portfolio is loaded from the popup or
		 * an explanation builder step
		 */
		
		var thisView = obj;
		
		//get the portfolio
		var viewPortfolio = thisView.portfolio;
		
		//generate the JSON string for the portfolio
		var portfolioJSON = $.stringify(viewPortfolio);
		
		//generate the JSON object for the portfolio
		var portfolioJSONObj = $.parseJSON(portfolioJSON);
		
		//load the portfolio so that the newest changes are reflected
		loadPortfolio(portfolioJSONObj, true, thisView);		
	} else if(args != null && args.length > 0) {
		//this branch is taken when the portfolio is loaded from an portfolio step
		
		//get the first element of the array which contains the object we want
		var args0 = args[0];
		
		if(args0 != null && args0.portfolioStep != null) {
			//get the portfolioStep object
			var portfolioStep = args0.portfolioStep;
			
			var thisView = obj;
			
			//get the portfolio
			var viewPortfolio = thisView.portfolio;
			
			//generate the JSON string for the portfolio
			var portfolioJSON = JSON.stringify(viewPortfolio);
			
			//generate the JSON object for the portfolio
			var portfolioJSONObj = JSON.parse(portfolioJSON);
			
			//load the portfolio so that the newest changes are reflected
			portfolioStep.load(portfolioJSONObj, true);			
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
	eventManager.fire('scriptLoaded', 'vle/portfolio/portfolioScript.js');
}
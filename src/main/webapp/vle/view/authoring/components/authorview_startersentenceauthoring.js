
View.prototype.starterSentenceAuthoringManager = function() {
	this.view;
};

View.prototype.starterSentenceAuthoringManager.dispatcher = function(type, args, obj) {
	if(type=='stepStarterSentenceAuthoringOptionChanged') {
		obj.updateStarterSentenceAuthoring();
	} else if(type=='stepStarterSentenceAuthoringSentenceChanged') {
		obj.updateStarterSentenceAuthoring();
	}
};

View.prototype.starterSentenceAuthoringManager.insertStarterSentenceAuthoring = function(view) {
	this.view = view;
	$('#starterSentenceAuthoringContainer').append($('#starterSentenceAuthoringDiv').show().detach());
	
	this.view.populateStarterSentenceAuthoring();
};

View.prototype.starterSentenceAuthoringManager.cleanupStarterSentenceAuthoring = function() {
	$('body').append($('#starterSentenceAuthoringDiv').hide().detach());
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/components/authorview_startersentenceauthoring.js');
};
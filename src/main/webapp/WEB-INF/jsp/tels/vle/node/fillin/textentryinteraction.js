function TEXTENTRYINTERACTION(textInteraction) {
	this.textInteraction = textInteraction;
	this.responseDeclaration = null;
};

TEXTENTRYINTERACTION.prototype.setResponseDeclaration = function(responseDeclarations) {
	for (var i = 0; i < responseDeclarations.length; i++) {
		if (responseDeclarations[i].identifier == this.textInteraction.responseIdentifier) {
			this.responseDeclaration = responseDeclarations[i];
		};
	};
};

TEXTENTRYINTERACTION.prototype.isCorrect = function(studentAnswer) {
	for(var z=0;z<this.responseDeclaration.correctResponses.length;z++){
		if(this.responseDeclaration.correctResponses[z].response==studentAnswer){
			return true;
		};
	};
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/fillin/textentryinteraction.js');
};
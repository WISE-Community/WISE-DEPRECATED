
View.prototype.promptManager = function() {
	this.view;
};

View.prototype.promptManager.dispatcher = function(type, args, obj) {
	if(type=='stepPromptChanged') {
		obj.updatePrompt();
	}
};

View.prototype.promptManager.insertPrompt = function(view) {
	this.view = view;
	var nodeToPromptRowSize = {
			OpenResponseNode:'35',
			BrainstormNode:'28',
			HtmlNode:'50',
			AssessmentListNode:'10',
			MultipleChoiceNode:'8',
			MatchSequenceNode:'10',
			DataGraphNode:'7',
			MySystemNode:'5',
			SVGDrawNode:'10'
	};
	var nodeType = view.resolveType(view.activeNode.type);
	$('#promptInput').attr('rows', nodeToPromptRowSize[nodeType]);
	$('#promptContainer').append($('#promptDiv').show().detach());
	
	this.view.populatePrompt();
	
	var fullpage = false;
	if(nodeType == 'HtmlNode'){
		// if node type is HtmlNode, enable full page editing because the prompt is actually the full page content for html steps (TODO: specify this in the node type itself)
		fullpage = true;
	}
	this.view.addRichTextAuthoring('promptInput',function() {eventManager.fire('stepPromptChanged');},false,fullpage);
};

View.prototype.promptManager.cleanupPrompt = function() {
	$('#promptDiv .rtToggles').remove();
	$('body').append($('#promptDiv').hide().detach());
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/components/authorview_prompt.js');
};
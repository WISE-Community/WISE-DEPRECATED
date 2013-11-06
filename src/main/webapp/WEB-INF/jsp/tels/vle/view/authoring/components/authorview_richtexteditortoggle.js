
View.prototype.richTextEditorToggleManager = function() {
	this.view;
};

View.prototype.richTextEditorToggleManager.dispatcher = function(type, args, obj) {
	if(type=='stepRichTextEditorToggleChanged') {
		obj.updateRichTextEditorToggle();
	}
};

View.prototype.richTextEditorToggleManager.insertRichTextEditorToggle = function(view) {
	this.view = view;
	$('#richTextEditorToggleContainer').append($('#richTextEditorToggleDiv').show().detach());
	
	this.view.populateRichTextEditorToggle();
};

View.prototype.richTextEditorToggleManager.cleanupRichTextEditorToggle = function() {
	$('body').append($('#richTextEditorToggleDiv').hide().detach());
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/components/authorview_richtexteditortoggle.js');
};
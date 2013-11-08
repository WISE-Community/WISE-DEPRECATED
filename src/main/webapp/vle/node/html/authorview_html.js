/**
 * Sets the HtmlNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.HtmlNode = {};
View.prototype.HtmlNode.commonComponents = ['Prompt', 'LinkTo'];

View.prototype.HtmlNode.generatePage = function(view){
	this.view = view;
	this.view.activeNode.baseHtmlContent = createContent(this.view.getProject().makeUrl(this.view.activeContent.getContentJSON().src));
	
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old element */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* create new elements */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	parent.appendChild(pageDiv);
	pageDiv.appendChild(createElement(document, 'div', {id: 'promptContainer'}));
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.HtmlNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.HtmlNode.updateContent = function(){
	var content = '';
	/* update content object */
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce()){
		content = $('#promptInput').tinymce().getContent();
	} else {
		content = $('#promptInput').val();
	}
	
	this.view.activeNode.baseHtmlContent.setContent(content);
};

/**
 * Saves the html content to its file
 */
View.prototype.HtmlNode.save = function(close){
	var success = function(t,x,o){
		o.stepSaved = true;
		o.notificationManager.notify('Updated html content on server', 3);
		o.eventManager.fire('setLastEdited');
		if(close){
			o.eventManager.fire('closeOnStepSaved', [true]);
		};
	};
	
	var failure = function(t,x,o){
		o.notificationManager.notify('Failed update of html content on server', 3);
		if(close){
			o.eventManager.fire('closeOnStepSaved', [false]);
		};
	};
	
	// save .ht file and .html file
	/* get json content as string */
	var contentString = encodeURIComponent($.stringify(this.view.activeContent.getContentJSON(),null,3));

	this.view.connectionManager.request('POST', 3, this.view.requestUrl, {forward:'filemanager', projectId:this.view.portalProjectId, command:'updateFile', fileName:this.view.activeNode.content.getFilename(this.view.getProject().getContentBase()), data:contentString}, success, this.view, failure);
	if($('#promptInput').tinymce() && !$('#promptInput').tinymce().isHidden()){
		this.view.connectionManager.request('POST', 3, this.view.requestUrl, {forward:'filemanager', projectId:this.view.portalProjectId, command:'updateFile', fileName:this.view.activeNode.baseHtmlContent.getFilename(this.view.getProject().getContentBase()), data:encodeURIComponent($('#promptInput').tinymce().getContent())}, success, this.view, failure);
	} else {
		this.view.connectionManager.request('POST', 3, this.view.requestUrl, {forward:'filemanager', projectId:this.view.portalProjectId, command:'updateFile', fileName:this.view.activeNode.baseHtmlContent.getFilename(this.view.getProject().getContentBase()), data:encodeURIComponent(document.getElementById('promptInput').value)}, success, this.view, failure);
	}
};

View.prototype.HtmlNode.populatePrompt = function() {	
	$('#promptInput').val(this.view.activeNode.baseHtmlContent.getContentString());
};

/**
 * Forwards updatePrompt to update content and calls sourceUpdated
 */
View.prototype.HtmlNode.updatePrompt = function(){
	this.updateContent();
	this.view.sourceUpdated();
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/html/authorview_html.js');
};
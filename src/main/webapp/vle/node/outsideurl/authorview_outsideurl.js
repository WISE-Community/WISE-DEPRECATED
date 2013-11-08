/**
 * Sets the OutsideUrlNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.OutsideUrlNode = {};

View.prototype.OutsideUrlNode.commonComponents = [];

View.prototype.OutsideUrlNode.generatePage = function(view){
	this.view = view;
	
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old element */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* create new elements */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	var tInput = createElement(document, 'input', {id:'tInput', type:'text', size:'50', onkeyup:'eventManager.fire("sourceUpdated")'});
	var urlText = document.createTextNode("URL: ");
	
	parent.appendChild(pageDiv);
	pageDiv.appendChild(urlText);
	pageDiv.appendChild(tInput);
	
	tInput.value = this.view.activeContent.getContentJSON().url;
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.OutsideUrlNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.getContentJSON().url = document.getElementById('tInput').value;
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.OutsideUrlNode.getCommonComponents = function() {
	return this.commonComponents;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/outsideurl/authorview_outsideurl.js');
};
/**
 * Sets the PhETNode type as an object of this view
 * @constructor
 * @author hiroki terashima
 */
View.prototype.PhETNode = {};

View.prototype.PhETNode.commonComponents = [];

View.prototype.PhETNode.generatePage = function(view){
	this.view = view;
	
	var parent = document.getElementById('dynamicParent');
	
	/* wipe out old element */
	parent.removeChild(document.getElementById('dynamicPage'));
	
	/* create new elements */
	var pageDiv = createElement(document, 'div', {id:'dynamicPage', style:'width:100%;height:100%'});
	pageDiv.appendChild(document.createTextNode("Enter a PhET Simulation URL or choose one from below:"));
	pageDiv.appendChild(createBreak());

	var tInput = createElement(document, 'input', {id:'tInput', type:'text', size:'75', onkeyup:'eventManager.fire("sourceUpdated")'});
	var urlText = document.createTextNode("URL: ");
	
	parent.appendChild(pageDiv);
	pageDiv.appendChild(urlText);
	pageDiv.appendChild(tInput);
	tInput.value = this.view.activeContent.getContentJSON().url;
	pageDiv.appendChild(createBreak());
	pageDiv.appendChild(createBreak());
	
	// this block is used to talk with phetSimChooserIFrame, which gets added to the DOM below
	var self=this;
	window.onSimulationSelectedParent = function(simUrl) {
		   document.getElementById('tInput').value = simUrl;
		   self.view.eventManager.fire('sourceUpdated');
	}
	
	var phETSimChooser = createElement(document, 'iframe', {id:'phetSimChooserIFrame', width:"100%", height:"100%", src:'node/phet/phetSims.html'});
	pageDiv.appendChild(phETSimChooser);
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.PhETNode.updateContent = function(){
	/* update content object */
	var content = this.view.activeContent.getContentJSON();
	content.url = document.getElementById('tInput').value;
	this.view.activeContent.setContent(content);
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.PhETNode.getCommonComponents = function() {
	return this.commonComponents;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/phet/authorview_phet.js');
};
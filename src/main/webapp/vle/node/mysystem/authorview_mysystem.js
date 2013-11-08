/**
 * Sets the MySystemNode type as an object of this view
 * @constructor
 * @author patrick lawler
 */
View.prototype.MySystemNode = {};
View.prototype.MySystemNode.commonComponents = ['Prompt', 'LinkTo'];
	
/**
 * Sets the view and content and then builds the page
 */
View.prototype.MySystemNode.generatePage = function(view){
	this.view = view;
	this.content = this.view.activeContent.getContentJSON();
	
	this.buildPage();
};

/**
 * Get the array of common components which is an array with
 * string elements being the name of the common component
 */
View.prototype.MySystemNode.getCommonComponents = function() {
	return this.commonComponents;
};

/**
 * Builds the html elements needed to author a my system node
 */
View.prototype.MySystemNode.buildPage = function(){
	var parent = document.getElementById('dynamicParent');
	
	/* remove any old elements */
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	};
	
	/* create new elements */
	var pageDiv = createElement(document, 'div', {id: 'dynamicPage', style:'width:100%;height:100%'});
	var mainDiv = createElement(document, 'div', {id: 'mainDiv'});
	var modulesDiv = createElement(document, 'div', {id: 'modulesDiv'});
	var instructionsText = document.createTextNode("When entering image filenames, make sure to use the asset uploader on the main authoring page to upload your images.");
	
	/* append elements */
	parent.appendChild(pageDiv);
	pageDiv.appendChild(mainDiv);
	mainDiv.appendChild(instructionsText);
	mainDiv.appendChild(createBreak());
	mainDiv.appendChild(document.createTextNode("Enter instructions -- text or html -- here."));
	mainDiv.appendChild(createBreak());
	mainDiv.appendChild(createElement(document, 'div', {id: 'promptContainer'}));
	mainDiv.appendChild(createBreak());
	mainDiv.appendChild(modulesDiv);
	
	this.generateModules();
};

View.prototype.MySystemNode.populatePrompt = function() {
	$('#promptInput').val(this.content.prompt);
};

/**
 * Updates the html with the user entered prompt
 */
View.prototype.MySystemNode.updatePrompt = function(){
	/* update content */
	var content = '';
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce()){
		content = $('#promptInput').tinymce().getContent();
	} else {
		content = $('#promptInput').val();
	}
	
	this.content.prompt = content;
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Generates the modules creation elements
 */
View.prototype.MySystemNode.generateModules = function(){
	var parent = document.getElementById('modulesDiv');
	
	//remove old elements first
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	};
	
	parent.appendChild(createBreak());
	
	if(this.content.modules.length>0){
		var modsText = document.createTextNode("Existing Modules");
	} else {
		var modsText = document.createTextNode("Create Modules");
	};
	
	parent.appendChild(modsText);
	parent.appendChild(createBreak());
	
	//create current mod elements
	for(var a=0;a<this.content.modules.length;a++){
		var modDiv = createElement(document, 'div', {id: 'modDiv_' + a});
		var modText = document.createTextNode('Module');
		var nameText = document.createTextNode("Name: ");
		var imageText = document.createTextNode("Image: ");
		var nameInput = createElement(document, 'input', {id: 'nameInput_' + a, type: 'text', value: this.content.modules[a].name, onchange: 'eventManager.fire("mysystemFieldUpdated",["name","' + a + '"])'});
		var imageInput = createElement(document, 'input', {id: 'imageInput_' + a, type: 'text', value: this.content.modules[a].image, onchange: 'eventManager.fire("mysystemFieldUpdated",["image","' + a + '"])'});
		var removeButt = createElement(document, 'input', {type: 'button', id: 'removeButt', value: 'remove module', onclick: 'eventManager.fire("mysystemRemoveMod","' + a + '")'});
		
		parent.appendChild(modDiv);
		modDiv.appendChild(modText);
		modDiv.appendChild(createBreak());
		modDiv.appendChild(nameText);
		modDiv.appendChild(nameInput);
		modDiv.appendChild(createBreak());
		modDiv.appendChild(imageText);
		modDiv.appendChild(imageInput);
		modDiv.appendChild(createBreak());
		modDiv.appendChild(removeButt);
		modDiv.appendChild(createBreak());
		modDiv.appendChild(createBreak());
	};
	
	//create buttons to create new modules
	var createButt = createElement(document, 'input', {type:'button', value:'add new module', onclick:'eventManager.fire("mysystemAddNew")'});
	parent.appendChild(createButt);
};

/**
 * Updates a module's, at the given index, filed of the given name
 * with the given value.
 */
View.prototype.MySystemNode.fieldUpdated = function(name,ndx){
	this.content.modules[ndx][name] = document.getElementById(name + 'Input_' + ndx).value;
	
	/* for now, the icon is the same as the image */
	if(name=='image'){
		this.content.modules[ndx].icon = document.getElementById(name + 'Input_' + ndx).value;
	};
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Removes a module from the modules
 */
View.prototype.MySystemNode.removeMod = function(ndx){
	this.content.modules.splice(ndx, 1);
	this.generateModules();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Creates a new dummy module object and adds it to the mods array
 */
View.prototype.MySystemNode.addNew = function(){
	this.content.modules.push({name:'', icon:'', image:'', xtype:'MySystemContainer', etype:'source', fields:{efficiency:'1'}});
	this.generateModules();
	
	/* fire source updated event */
	this.view.eventManager.fire('sourceUpdated');
};

/**
 * Updates this content object when requested, usually when preview is to be refreshed
 */
View.prototype.MySystemNode.updateContent = function(){
	/* update content object */
	this.view.activeContent.setContent(this.content);
};

/* used to notify scriptloader that this script has finished loading */
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/mysystem/authorview_mysystem.js');
};
/*
 * NoteNode is a child of openresponse
 */

NoteNode.prototype = new OpenResponseNode();
NoteNode.prototype.constructor = NoteNode;
NoteNode.prototype.parent = OpenResponseNode.prototype;
NoteNode.authoringToolName = "Reflection Note";
NoteNode.authoringToolDescription = "Students write text to answer a question or explain their thoughts";
NoteNode.prototype.i18nEnabled = true;
NoteNode.prototype.i18nPath = "vle/node/openresponse/i18n/";
NoteNode.prototype.supportedLocales = {
			"en":"en",
			"iw":"he",
			"ja":"ja",
			"es":"es",
			"nl":"nl",
            "nl_GE":"nl",
            "nl_DE":"nl",
			"tr":"tr",
            "zh_CN":"zh_CN"
};

/**
 * @constructor
 * @extends Node
 * @param nodeType
 * @param view
 * @returns {NoteNode}
 */
function NoteNode(nodeType, view) {
	this.view = view;
	this.type = nodeType;
	this.prevWorkNodeIds = [];
	this.studentWork;
	this.importableFromNodes = new Array(			
			"NoteNode", 
			"OpenResponseNode" 
			);		
};

/**
 * Note nodes ignore the content panel and just renders in the global note panel.
 * Unlike other nodes, the note does not need to wait for scripts to load. The baseHtmlContent
 * for a note is just a div that gets written within another div, so the content should
 * be loaded during the render.
 * 
 * @param contentPanel
 * @param studentWork
 */
NoteNode.prototype.render = function(contentPanel, studentWork){
	this.fetchI18NFiles();
	
	this.studentWork = studentWork;
	
	/* set the baseHtmlContent if it has not yet been set up */
	if(!this.baseHtmlContent){
		this.baseHtmlContent = this.view.getHTMLContentTemplate(this);
	}
	
	/* Set self as the active note node. Only one note can be active at a time */
	$('#notePanel').html(this.injectKeystrokeManagerScript(this.view.injectVleUrl(this.baseHtmlContent.getContentString())));
	this.view.activeNote = new OPENRESPONSE(this, this.view);
	
	/* disable rich text editing for notes for now */
	this.view.activeNote.content.isRichTextEditorAllowed = false;
	
	/* render the content for this node */
	this.view.activeNote.render();
	
	/* set the dialog title to the node title */
	var title = this.view.getI18NString("note_title") + ': ' + this.view.activeNote.node.getTitle();
	$('#notePanel').dialog({
		title: title
	});
	
	/* show the note panel */
	$('#notePanel').dialog('open');
	
	//apply iframe draggable fix
	$(".ui-draggable").draggable( "option", "iframeFix", true );
	$( ".ui-draggable" ).resizable( "option", "ghost", true );
};

/**
 * Called when the step is exited. This is used for auto-saving.
 */
NoteNode.prototype.onExit = function() {
	try {
		/* check if there is an active note and tell it to save */
		if(this.view.activeNote) {
			this.view.activeNote.save();
		}
	} catch(e) {
		
	}
};

/**
 * Imports and inserts the work from the specified importFromNode
 * @param importFromNode node that has the data for this node to import
 * @return
 */
NoteNode.prototype.importWork = function(importFromNode) {
	if (this.canImportWork(importFromNode)) {
		var studentWork = this.view.getState().getLatestWorkByNodeId(importFromNode.id);
		if (studentWork != null) {
			if(this.view && this.view.activeNote) {
				this.view.activeNote.appendResponse(studentWork);
			};
		};		
	}
};

NoteNode.prototype.getHTMLContentTemplate = function() {
	return createContent('node/openresponse/note.html');
};

NodeFactory.addNode('NoteNode', NoteNode);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/node/openresponse/NoteNode.js');
}
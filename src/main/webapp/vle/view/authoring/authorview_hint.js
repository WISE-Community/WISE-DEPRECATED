/**
 * Get the hints for authoring
 * @return a hint object or null if the step does not have hints
 */
View.prototype.getAuthoringHints = function() {
	var hints = null;
	
    //check if this step already has hints
    if(this.activeContent != null) {
    	if(this.activeContent.getContentJSON() != null) {
    		//get the hints from the active content
    		hints = this.activeContent.getContentJSON().hints;
    	}
    }
    
    return hints;
};

/**
 * Get the hints array for authoring
 * @returns an array or null if the step does not have hints
 */
View.prototype.getAuthoringHintsArray = function() {
	var hintsArray = null;
	
	//get the hints if any
	var hints = this.getAuthoringHints();
	
	if(hints != null) {
		//get the hints array from the hints
		hintsArray = hints.hintsArray;
	}
	
	return hintsArray;
};

/**
 * saves hints to local var
 */
View.prototype.saveHint = function(){
    var hintTextBoxes = $('#hintsTabs').find("textarea"),
    	view = this;
    
    var newHintsArr = [];
    for(var i=0; i<hintTextBoxes.length; i++) {
    	var id = $(hintTextBoxes[i]).attr('id');
    	if(tinymce.get(id)){
    		// rich text editor is active on textarea, so get contents from editor
    		newHintsArr.push(view.getRichTextContent(id));
    	} else {
    		newHintsArr.push(hintTextBoxes[i].value);
    	}
    }    
    var forceShow = $("#forceShowOptions option:selected").val();
    var hintTerm = $("#hintTerm").val();
    var hintTermPlural = $("#hintTermPlural").val();
    var isModal = $('#modalOption').prop('checked');
    var isMustViewAllPartsBeforeClosing = $('#isMustViewAllPartsBeforeClosingOption').prop('checked');
    this.activeContent.getContentJSON().hints = {"hintsArray":newHintsArr,"forceShow":forceShow,"isModal":isModal,"isMustViewAllPartsBeforeClosing":isMustViewAllPartsBeforeClosing,"hintTerm":hintTerm,"hintTermPlural":hintTermPlural};
};

/**
 * saves all hints for current node to server
 */
View.prototype.saveHints = function(){	
	this.saveHint();    
    eventManager.fire("saveStep");    
	$('#editHintsPanel').dialog('close');
};

/**
 * Add new hint to the current node
 */
View.prototype.addHint = function(){
	//get the hints array
	var hintsArr = this.getAuthoringHintsArray();
	
	hintsArr.push(this.getI18NString("authoring_hint_new"));
	eventManager.fire("editHints", [hintsArr.length-1]);
};

/**
 * Deletes the currently opened hint for the current node
 * after deletion, show the next hint if exists. if not exists, show the previous hint
 */
View.prototype.deleteHint = function(){
	// get index of currently-opened tab
	var selectedIndex = $('#hintsTabs').tabs('option', 'selected');
	
	//get the hints array
    var hintsArr = this.getAuthoringHintsArray();
    hintsArr.splice(selectedIndex, 1);
    
    var newTabIndex = 0;  // which tab to open
    if (selectedIndex >= hintsArr.length) {
    	newTabIndex = hintsArr.length - 1;
    } else {
    	newTabIndex = selectedIndex;
    };
    eventManager.fire("editHints", [newTabIndex]);
};

/**
 * opens editHint window
 * @tabIndex which tab index to open
 */
View.prototype.editHints = function(tabIndex){
	var currentNode = this.activeNode;
	if($('#editHintsPanel').size()==0){
    	//the show hintsDiv does not exist so we will create it
		var title = this.getI18NString('authoring_hint_dialog_title');
    	$('<div id="editHintsPanel" style="text-align:left"></div>').dialog({
    		autoOpen:false,
			closeText:'',
			width:650,
			modal:false,
			resizable:true,
			title:title,
			//zIndex:10000, 
			left:0,
			open: function(){
				$(this).parent().css('z-index',10000);
			},
			close: function(){
				eventManager.fire('saveHints');
			},
			buttons:{"Save": function(){
				$(this).dialog('close');
			}}
		}).on( "dialogbeforeclose", {view:currentNode.view}, function(event, ui) {
		    // before the dialog closes, save hintstate
	    	if ($(this).data("ui-dialog").isOpen()) {	    		    		
	    		//var hintState = new HINTSTATE({"action":"hintclosed","nodeId":event.data.view.getCurrentNode().id});
	    		//event.data.view.pushHintState(hintState);
	    	};
	    }).on( "tabsselect", {view:currentNode.view}, function(event, ui) {
	    	//var hintState = new HINTSTATE({"action":"hintpartselected","nodeId":event.data.view.getCurrentNode().id,"partindex":ui.index});
	    	//event.data.view.pushHintState(hintState);
	    });
    } else {
    	// remove any existing tinyMCE instances
		$('.hintTextBox',$('#editHintsPanel')).each(function(){
			var id = $(this).attr('id');
			if(tinymce.get(id)){
				tinymce.get(id).remove();
			}
		});
    }
    
    var hints = {"hintsArray":[],"forceShow":"never"};
    //check if this step already has hints
    if(this.getAuthoringHints() == null) {
    	//there are no hints for this step so we will make them
		this.activeContent.getContentJSON().hints = hints;
    } else {
    	hints = this.getAuthoringHints();
    }
    
    //get the hints array from the content we are authoring
    var hintsArr = this.getAuthoringHintsArray();
    
    // get the hint terminology settings (if any), set defaults
    var hintTerms = {};
    hintTerms.hintDefault = this.getI18NString("hint_hint");
    hintTerms.pluralDefault = this.getI18NString("hint_plural");
    if(this.utils.isNonWSString(hints.hintTerm)){
    	hintTerms.hint = hints.hintTerm;
    } else {
    	hintTerms.hint = hintTerms.hintDefault;
    }
    if(this.utils.isNonWSString(hints.hintTermPlural)){
    	hintTerms.plural = hints.hintTermPlural;
    } else {
    	hintTerms.plural = hintTerms.pluralDefault;
    }
	    
    // generate hints authoring DOM elements
    var settings = $("<div class='featureSettings'></div>");
    var editHintsTerms = $("<div class='setting'>" +
    	"<div class='settingLabel'><span>" + this.getI18NString("authoring_hint_terminology_label") + "</span><span class='details'>" + this.getI18NString("authoring_hint_terminology_instructions") + "</span></div>" +
    	"<ul class='inline'>" + 
    	"<li>" + this.getI18NString("authoring_hint_term_label") + "<input id='hintTerm' name='hintTerm' type='text' class='required' minlength='2' maxlength='20' value='" + hintTerms.hint + "' /></li>" +
    	"<li>" + this.getI18NString("authoring_hint_term_plural_label") + "<input id='hintTermPlural' name='hintTermPlural' type='text' class='required' minlength='2' maxlength='20' type='text' value='" + hintTerms.plural + "' /></li>" + 
    	"</ul></div>");
    var editHintsMenu = $("<div class='setting'>" + 
    	"<div class='settingLabel'><span>" + this.getI18NString("authoring_hint_options_label") + "</span></div>" +
    	"<ul class='inline'>" +
    	"<li>" + this.getI18NString("authoring_hint_forceShow")+" <select id='forceShowOptions'><option value='never'>"+this.getI18NString("authoring_hint_option_never")+"</option><option value='firsttime'>"+this.getI18NString("authoring_hint_option_firstTimeOnly")+"</option><option value='always'>"+this.getI18NString("authoring_hint_option_always")+"</option></select></li>" + 
    	"<li><input type='checkbox' id='modalOption' />" + this.getI18NString("authoring_hint_modal")+"</li>" +
    	"<li><input type='checkbox' id='isMustViewAllPartsBeforeClosingOption' />" + this.getI18NString("authoring_hint_isMustViewAllPartsBeforeClosing")+"</li>" +
    	"</ul></div>");
    settings.append(editHintsMenu).append(editHintsTerms);
    var hintButtons = "<div><input type='button' value='" + this.getI18NString("authoring_hint_add") + "' onclick='eventManager.fire(\"addHint\")'></input>"+
    	"<input type='button' value='" + this.getI18NString("authoring_hint_delete") + "' onclick='eventManager.fire(\"deleteHint\")'></input></div>";
    
    var hintsPart1 = $("<ul></ul>");   // first part will be the <ul> for text on tabs
    var hintsPart2 = $("<div id='hintContent'></div>");   // second part will include the content within each tab
    
    for (var i=0; i< hintsArr.length; i++) {
    	var currentHint = hintsArr[i];
    	hintsPart1.append("<li><a href='#tabs-"+i+"'>" + this.utils.capitalize(this.getI18NString("hint_hint")) + " "+(i+1)+"</a></li>");
    	hintsPart2.append("<div id='tabs-"+i+"'><textarea id='hintInput_" + i + "' class='hintTextBox' onblur='eventManager.fire(\"saveHint\")'>"+currentHint+"</textarea></div>");
    }
    //hintsStringPart1 = "<ul>" + hintsStringPart1 + "</ul>";

    var hintElement = $("<div id='hintsTabs'></div>").append(hintsPart1).append(hintsPart2);
    //set the html into the div
    $('#editHintsPanel').html('').append(settings).append(hintButtons).append(hintElement);
    
    //make the div visible
    $('#editHintsPanel').dialog('open');
    
    //add HTML/Rich Text editing toggles for hint inputs (disable rich text by default)
    for (var i=0; i< hintsArr.length; i++) {
    	var id = 'hintInput_' + i;
    	this.addRichTextAuthoring(id, function(){eventManager.fire('saveHint');});
    }

    // instantiate tabs 
	$("#hintsTabs").tabs({active:tabIndex});		
	
	// set forceshow option
    var hintsForceShow = hints.forceShow;
	$("#forceShowOptions [value='"+hintsForceShow+"']").attr("selected", "selected");
	
	// set the modal option
	var isModal = false;
	if(typeof hints.isModal == 'boolean'){
		isModal = hints.isModal;
	}
	$('#modalOption').prop("checked", isModal);
	
	// set the isMustViewAllPartsBeforeClosing option
	var isMustViewAllPartsBeforeClosing = false;
	if(typeof hints.isMustViewAllPartsBeforeClosing == 'boolean'){
		isMustViewAllPartsBeforeClosing = hints.isMustViewAllPartsBeforeClosing;
	}
	$('#isMustViewAllPartsBeforeClosingOption').prop("checked", isMustViewAllPartsBeforeClosing);
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/authorview_hint.js');
}
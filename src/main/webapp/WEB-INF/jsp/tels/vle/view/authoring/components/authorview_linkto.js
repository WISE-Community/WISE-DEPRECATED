/**
 * The link manager is responsible for inserting links to other steps
 * from an authored step for the authoring tool.
 */
View.prototype.linkManager = function(){
	this.currentStart;
	this.currentEnd;
};

/**
 * Handles event dispatching for the linkManager
 */
View.prototype.linkManager.dispatcher = function(type,args,obj){
	if(type=='nodeSelectorSelected'){
		obj.linkManager.nodeSelected(obj);
	} else if(type=='nodeSelectorCanceled'){
		obj.linkManager.nodeSelectionCanceled(obj);
	} else if(type=='createLink'){
		obj.linkManager.createLink(obj);
	} else if(type=='linkToNodeChanged'){
		obj.linkManager.linkToNodeChanged(obj, args[0]);
	} else if(type=='removeLinkTo'){
		obj.linkManager.removeLinkTo(obj, args[0]);
	} else if(type=='contentRenderCompleted'){
		if(obj.updatePromptAfterPreview){
			obj.updatePromptAfterPreview = false;
			obj.updatePrompt();
		}
	}
};

/**
 * Starts the process of creating a link by retrieving the highlighted text,
 * then passing control to the node selector.
 */
View.prototype.linkManager.createLink = function(view){
	/* check to ensure that the view was injected into the frame */
	if(!view){
		alert('Could not find view which is needed to create the link, aborting.');
		return;
	}
	
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce() && !$('#promptInput').tinymce().isHidden()){
		var selection = $('#promptInput').tinymce().selection.getContent();
		if (selection == ''){
			view.notificationManager.notify('Please select some text before attempting to create a link.',3);
			return;
		}
	} else {
		var ta = document.getElementById('promptInput');
		
		/* get the highlighted text and its start and end positions */
		this.currentStart = ta.selectionStart;
		this.currentEnd = ta.selectionEnd;
		
		if(this.currentStart<0 || this.currentEnd<0 || this.currentStart==this.currentEnd){
			view.notificationManager.notify('Please select some text before attempting to create a link.',3);
			return;
		}
	}
	
	view.populateNodeSelector('nodeSelectorSelected', 'nodeSelectorCanceled');
};

/**
 * Processes the user selected link and creates the link for the node.
 */
View.prototype.linkManager.nodeSelected = function(view){
	var select = document.getElementById('nodeSelectorSelect');
	var colorSelect = document.getElementById('colorSelectorSelect');
	
	/* make sure that the step select element exists */
	if(!select){
		view.notificationManager.notify('Could not find selector for step, unable to proceed.',3);
		return;
	}
	
	/* make sure that the color select element exists */
	if(!colorSelect){
		view.notificationManager.notify('Unable to find color selector for link, unable to proceed.',3);
		return;
	}
	
	/* make sure that a node was selected */
	var ndx = select.selectedIndex;
	if(ndx<0){
		view.notificationManager.notify('Unable to determine selected step, please try again.',3);
		return;
	}
	
	/* make sure that a color was selected */
	var colorNdx = colorSelect.selectedIndex;
	if(colorNdx<0){
		view.notificationManager.notify('Unable to determine selected color, please try again.',3);
		return;
	}
	
	/* create link for node and set link tags in textarea */
	var nodeIdentifier = select.options[ndx].id;
	var color = colorSelect[colorNdx].value;
	var link = this.createLinkForNode(view.activeNode, nodeIdentifier);
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce() && !$('#promptInput').tinymce().isHidden()){
		var linkBefore = '<a style=\"color:' + color + '; cursor:pointer\" onclick=\"node.linkTo(\'' + link.key + '\')\">';
		var linkAfter = '</a>';
		$('#promptInput').tinymce().execCommand('mceReplaceContent',false,linkBefore + '{$selection}' + linkAfter);
	} else {
		var ta = document.getElementById('promptInput');
		var text = ta.value.substring(this.currentStart, this.currentEnd);
		var beginning = ta.value.substring(0,this.currentStart);
		var end = ta.value.substring(this.currentEnd, ta.value.length);
		var linkText = '<a style=\"color:' + color + '; cursor:pointer\" onclick=\"node.linkTo(\'' + link.key + '\')\">' + text + '</a>';
		/* set the text area's text */
		ta.value = beginning + linkText + end;
		
		this.currentStart = undefined;
		this.currentEnd = undefined;
	}
	
	/* clean up and hide dialog */
	
	/* we need to call the active node's update prompt event to catch the changes we just
	 * made. We also need call the source updated method so that the new text in
	 * textarea is added to the content as well as the project save so the node's
	 * link gets saved to the project file.
	 */
	view.updatePrompt();
	view.saveProject();
	view.sourceUpdated(true);
	this.processExistingLinks(view);
	
	$('#nodeSelectorDialog').dialog('close');
};

/**
 * Cleans up when node selection for creating a link is canceled and hides dialog.
 */
View.prototype.linkManager.nodeSelectionCanceled = function(view){
	this.currentStart = undefined;
	this.currentEnd = undefined;
	$('#nodeSelectorDialog').dialog('close');
};

/**
 * Creates a new link object, adds it to the node and returns it.
 */
View.prototype.linkManager.createLinkForNode = function(node, nodeIdentifier){
	var link = {key:node.utils.generateKey(),nodeIdentifier:nodeIdentifier};
	node.addLink(link);
	return link;
};

/**
 * Process the authored nodes existing links. Checks to ensure that the
 * referenced node still exists and that the link still appears in the 
 * prompt. Removes any dangling references from the node and prompt.
 */
View.prototype.linkManager.processExistingLinks = function(view){
	var parent = document.getElementById('existingLinksDiv');
	while(parent.firstChild){
		parent.removeChild(parent.firstChild);
	}
	
	/* clean any links that do not have the associated text in the prompt */
	this.cleanNodeLinks(view.activeNode);
	
	/* after clean up, display remaining links */
	var links = view.activeNode.links;
	for(var d=0;d<links.length;d++){
		var linkDiv = createElement(document, 'div', {id:'linkDiv_' + links[d].key});
		var linkSelect = createElement(document, 'select', {id:'linkSelect_' + links[d].key, onchange:"eventManager.fire('linkToNodeChanged','" + links[d].key + "')"});
		var removeButt = createElement(document, 'input', {type:'button', value:'remove link', onclick:"eventManager.fire('removeLinkTo','" + links[d].key + "')"});
		
		if (links[d].nodePosition) {
			var nodeId = view.getProject().getNodeByPosition(links[d].nodePosition).id;
			this.populateSelectOptionsWithNodes(linkSelect, view.getProject().getRootNode(), nodeId);
		} else {
			this.populateSelectOptionsWithNodes(linkSelect, view.getProject().getRootNode(), links[d].nodeIdentifier);			
		}
		
		parent.appendChild(linkDiv);
		linkDiv.appendChild(linkSelect);
		linkDiv.appendChild(createSpace());
		linkDiv.appendChild(removeButt);
		linkDiv.appendChild(createBreak());
	}
	
	/* clean up any links in the prompt that do not have associated key in the node */
	this.cleanNodePrompt(view, view.activeNode);
};

/**
 * Checks the node links against the current prompt value to make sure that the
 * link exists in the prompt. Removes the link if it does not.
 */
View.prototype.linkManager.cleanNodeLinks = function(node){
	var links = node.links;
	var linkStrings = this.getLinkStrings();
	var removedLink = false;
	
	/* for each link, check to make sure that the key is referenced in the prompt */
	for(var c=links.length-1;c>=0;c--){
		var linkExists = false;
		
		/* if there are no linkStrings found, then we need to remove this link, otherwise,
		 * iterate through linkStrings to determine if this link should stay or go. */
		if(linkStrings){
			for(var d=0;d<linkStrings.length;d++){
				if(linkStrings[d].indexOf(links[c].key)!=-1){
					linkExists = true;
				}
			}
			
			/* if the link was not found, remove it from the node */
			if(!linkExists){
				links.splice(c,1);
				removedLink = true;
			}
		} else {
			links.splice(c,1);
		}
	}
	
	/* if we changed any of the links we need to save the project */
	if(removedLink){
		node.view.saveProject();
	}
};

/**
 * Checks the prompt for node links that no longer exist in the node.
 */
View.prototype.linkManager.cleanNodePrompt = function(view, node){
	var links = node.links;
	var linkStrings = this.getLinkStrings();
	
	/* for each of the links in the prompt, check to make sure that there is an associated key in the node */
	if(linkStrings){
		for(var e=0;e<linkStrings.length;e++){
			var linkExists = false;
			for(var f=0;f<links.length;f++){
				if(linkStrings[e].indexOf(links[f].key)!=-1){
					linkExists = true;
				}
			}
			
			/* link was not found so remove it from the prompt */
			if(!linkExists){
				var words = linkStrings[e].substring(linkStrings[e].indexOf('>') + 1, linkStrings[e].indexOf('</a>'));
				document.getElementById('promptInput').value = document.getElementById('promptInput').value.replace(linkStrings[e],words);
				
				/* set not saved flags so content can be saved on exit and changed text will be reflected */
				view.stepSaved = false;
				view.updatePromptAfterPreview = true;
			}
		}
	}
};

/**
 * Returns any links found in the currently authored prompt.
 */
View.prototype.linkManager.getLinkStrings = function(){
	var ta = '';
	if(typeof tinymce != 'undefined' && $('#promptInput').tinymce() && !$('#promptInput').tinymce().isHidden()){
		ta = $('#promptInput').tinymce().getContent();
	} else {
		ta = document.getElementById('promptInput').value;
	}
	var exp = /<a .*onclick="node\.linkTo\('.{10}'\)">.*<\/a>/g;
	var result = ta.match(exp);
	
	return result;
};

/**
 * Given a html select element a node and the current position for the link, generates
 * the options for the select element and sets the active option as that of the given
 * nodeId.
 */
View.prototype.linkManager.populateSelectOptionsWithNodes = function(select, node, nodeId){
	/* if this node is a sequence node, add all of its children */
	if(node.type=='sequence'){
		for(var a=0;a<node.children.length;a++){
			this.populateSelectOptionsWithNodes(select, node.children[a], nodeId);
		}
	} else {
		var opt = createElement(document, 'option');
		var currPosition = node.view.getProject().getPositionById(node.id);
		opt.value = currPosition;
		opt.text = node.title;
		opt.id = node.id;
		
		select.appendChild(opt);
		
		/* set this option as the selected if this is the position */
		if(node.id==nodeId){
			select.selectedIndex = select.options.length - 1;
		}
	}
};

/**
 * Gets the new user specified node to linkto, updates the nodes links and updates
 * the currently authored textarea to reflect the changes.
 */
View.prototype.linkManager.linkToNodeChanged = function(view, key){
	var select = document.getElementById('linkSelect_' + key);
	var opt = select.options[select.selectedIndex];
	var link = view.activeNode.getLink(key);
	var ta = document.getElementById('promptInput');
	
	if(!link){
		view.notificationManager.notify('Can not find link in step, unable to continue.',3);
		return;
	} else {
		/* save old key and position */
		var oldKey = link.key;
		var oldPos = link.nodePosition;
		
		/* get new key and position */
		link.key = view.activeNode.utils.generateKey();
		link.nodeIdentifier = opt.id;
		
		/* update prompt */
		ta.value = ta.value.replace(oldKey, link.key);
		
		/* we need to save the project and update source */
		view.updatePrompt();
		view.saveProject();
		view.sourceUpdated(true);
		this.processExistingLinks(view);
	}
};


View.prototype.linkManager.removeLinkTo = function(view, key){
	var linkRemovedFromNode = false;
	var linkRemovedFromPrompt = false;
	
	/* first remove the link from the node */
	var links = view.activeNode.links;
	for(var f=0;f<links.length;f++){
		if(links[f].key==key){
			links.splice(f,1);
			linkRemovedFromNode = true;
		}
	}
	
	/* now remove the link from the prompt */
	var linkStrings = this.getLinkStrings();
	if(linkStrings){
		for(var g=0;g<linkStrings.length;g++){
			if(linkStrings[g].indexOf(key)!=-1){
				var words = linkStrings[g].substring(linkStrings[g].indexOf('>') + 1, linkStrings[g].indexOf('</a>'));
				if(typeof tinymce != 'undefined' && $('#promptInput').tinymce() && !$('#promptInput').tinymce().isHidden()){
					var newContent = $('#promptInput').tinymce().getContent().replace(linkStrings[g],words);
					$('#promptInput').tinymce().setContent(newContent);
					linkRemovedFromPrompt = true;
				} else {
					document.getElementById('promptInput').value = document.getElementById('promptInput').value.replace(linkStrings[g],words);
					linkRemovedFromPrompt = true;
				}
			}
		}
	}
	
	/* if successfully removed from node, we need to save the project */
	if(linkRemovedFromNode){
		view.saveProject();
	} else {
		view.notificationManager.notify('Could not find the link to remove from the step!',3);
	}
	
	/* if successfully removed from prompt, we need to update the node prompt */
	if(linkRemovedFromPrompt){
		view.updatePrompt();
	} else {
		view.notificationManager.notify('Could not find the text associated with the link to remove from the prompt!',3);
	}
	
	/* re-populate existing links */
	this.processExistingLinks(view);
};

View.prototype.linkManager.cleanupLinkTo = function() {
	try{
		var linkDiv = document.getElementById('promptDiv').removeChild(document.getElementById('linkDiv'));
		document.getElementById('linkContainer').appendChild(linkDiv);
	} catch (e){/* do nothing */}
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/view/authoring/components/authorview_linkto.js');
}
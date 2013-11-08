/*
 * ext-prompt.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jonathan Breitbart
 *
 * Adds a prompt/instructions tool to svg-edit
 * JQuery UI with dialogs plus accompanying css also required
 * TODO: Perhaps add a prompt setter function
 * 
 */
var promptLoaded = false; // wise4 var to indicate when extension has finished loading
 
svgEditor.addExtension("Prompt", function(S) {
	
	var prompt = 'This is a prompt.'; // initiate prompt text
	
	function addLink(){
		var linktext = '<div id="tool_prompt" class="extension_link">' +
			'<a class="label tool_prompt" title="Review Instructions">Review Instructions</a>' +
			'<img class="tool_prompt" src="/vlewrapper/vle/node/draw/svg-edit/extensions/prompt.png" ' + // image path edited for wise4
			'title="Review Instructions" alt="icon" />' +
			'</div>';
	
		$('#tools_top').append(linktext);
		
		setupDialog();
	};
	
	function setupDialog(){
		var dialogtxt = '<div id="prompt_dialog" title="Instructions" style="display:none;">' +
			'<div id="prompt_text" class="ui-dialog-content-content">' + prompt + '</div></div>';
		
		$('#svg_editor').append(dialogtxt);
		
		$('#prompt_dialog').dialog({
			bgiframe: true,
			resizable: false,
			modal: true,
			autoOpen:false,
			width:650,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
				}
			}
		});
		
		$('.tool_prompt').click(function(){
			$('#prompt_dialog').dialog('open');
		});
		
		promptLoaded = true;
	};
	
	return {
		name: "Prompt",
		callback: function() {
			//add extension css
			var csspath = '/vlewrapper/vle/node/draw/svg-edit/extensions/ext-prompt.css'; // corrected path for wise4
			var fileref=document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", csspath);
			document.getElementsByTagName("head")[0].appendChild(fileref);
			
			addLink();
		}
	};
});
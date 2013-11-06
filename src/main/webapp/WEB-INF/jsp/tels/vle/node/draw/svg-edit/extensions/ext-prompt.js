/*
 * ext-prompt.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Jonathan Lim-Breitbart
 *
 * Adds a dialog to svg-edit that displays a prompt or instructions
 * 
 * Dependencies:
 * - Accompanying css file ('ext-prompt.css' should be included svg-editor.html <head>)
 * - jQuery UI with dialogs plus accompanying css
 * - Icon for link to open prompt (prompt.png)
 * 
 * TODO: i18n; fix link placement
 */
 
svgEditor.addExtension("Prompt", function(S) {
	
	/* Private variables */
	var content = 'This is a prompt.', // String to store the prompt html content
		loaded = false; // Boolean to indicate whether extension has finished loading
	
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_prompt = {
		/** 
		 * Gets or sets the stored prompt text and updates the UI display
		 * 
		 * @param value String prompt content
		 * @returns String prompt content
		 * @returns Object this
		 */
		content: function(val){
			if(!arguments.length){ return content; } // no arguments, so return content
			
			if(typeof val === 'string'){
				setContent(val);
			}
			return this;
		},
		/** 
		 * Gets whether extensions has completely loaded
		 * 
		 * @returns Boolean
		 */
		isLoaded: function(){
			return loaded;
		},
		/**
		 * Opens this prompt dialog
		 * 
		 * @returns Object this
		 */
		show: function(){
			$('#prompt_dialog').dialog('open');
			return this;
		}
	};
	
	/* Private functions */
	function setContent(val){
		content = val;
		$('#prompt_content').html(val);
		
		if(!loaded){
			// on first load, set extension loaded variable to true and call extension loaded listener
			loaded = true;
		}
	}
	
	function setupDisplay(){
		// setup extension UI components
		var linktext = '<div id="tool_prompt" class="extension_link">' +
			'<a class="label tool_prompt" title="Review Instructions">Instructions</a>' +
			'<img class="tool_prompt" src="extensions/prompt.png" ' + // TODO: create svg icon
			'alt="icon" />' +
			'</div>';
		var dialogtxt = '<div id="prompt_dialog" style="display:none;">' +
			'<div id="prompt_content"></div></div>';
		
		// add extension UI components to page
		$('#tools_top').append(linktext);
		$('#svg_editor').append(dialogtxt);
		
		// setup jQuery UI dialog to view prompt content
		$('#prompt_dialog').dialog({
			title: 'Instructions',
			resizable: false,
			modal: true,
			autoOpen:false,
			width:600,
			buttons: [
				{
			    	text: 'OK',
			    	click: function() {
			    		$(this).dialog('close');
					}
			    }
			]
		});
		
		// bind link click event to open prompt dialog
		$('.tool_prompt').on('click', function(){
			$('#prompt_dialog').dialog('open');
		});
		
		setContent(content); // set initial prompt content
	}
	
	return {
		name: "Prompt",
		callback: function() {
			setupDisplay(); // setup extension UI components and events
		}
	};
});
/*
 * ext-description.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Jonathan Lim-Breitbart
 *
 * Allows users to add a description/annotation to their drawing
 * 
 * Dependencies:
 * - Accompanying css file ('ext-description.css' should be included svg-editor.html <head>)
 * - jQuery UI with dialogs and sliders plus accompanying css
 * 
 * TODO: i18n
 */

svgEditor.addExtension("Description", function(S) {
	
	/* Private variables */
	var content = '', // String to store the description text
		loaded = false; // Boolean to indicate whether extension has finished loading
	
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_description = {
		/** 
		 * Gets or sets the stored description text and updates the UI display
		 * 
		 * @param val String description content
		 * @returns String description content
		 * @returns Object this
		 */
		content: function(val){
			if(!arguments.length){ return content; } // no arguments, so return content
			
			if(typeof val === 'string'){
				loading = true;
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
		 * Toggles the UI to be maximized or minimized
		 * 
		 * @param close Boolean to indicate whether we should be closing the input field or not
		 * @returns Object this
		 */
		toggle: function(close){
			toggle(close);
			return this;
		},
		/**
		 * Listener function that is called when the description has been updated
		 */
		changed: function(){
			// optional: override with custom actions
		}
	};
	
	/* Private functions */
	function setContent(value){
		content = value;
		$('#description_content').val(value);
		var $desc = $('#description span.minimized');
		if(value !== ''){
			$desc.text(value);
		} else {
			$desc.text($desc.data('default'));
		}
		
		if(!loaded){
			// on first load, set extension loaded variable to true
			loaded = true;
		}
		
		if(!loading){
			api.changed(); // call content changed listener
		}
		
		loading = false;
	}
	
	function toggle(close){
		if(close){
			$('#description').css('height','30px');
			$('#description_content').hide();
			$('#description_edit').show();
			$('#description_collapse').hide();
			$('#description span.maximized').hide();
			$('#description span.minimized').show();
		}
		else {
			$('#description').css('height','125px');
			$('#description_content').css('height','75px').show().focus();
			$('#description_edit').hide();
			$('#description_collapse').show();
			$('#description span.minimized').hide();
			$('#description span.maximized').show();
		}
	}
	
	function setupDisplay(){
		// setup extension UI components
		var displaytext = '<div id="description"><div id="description_wrapper">'+
			'<div id="description_header" title="Click to edit"><div id="description_header_text"><span class="panel_title">Description:</span>'+
			' <span class="maximized">(Enter your text in the box below)</span><span class="minimized" data-default="(Click to add)">(Click to add)</span>'+
			'</div><div class="description_buttons">'+
			'<a id="description_edit" title="Edit Description">Edit</a>'+
			'<button id="description_collapse" class="ui-button ui-state-default" title="Save">Save</button></div></div>'+
			'<textarea id="description_content" class="description_input"></textarea></div></div>';
		
		// add extension UI components to page
		$('#workarea').append(displaytext);
		
		// save current description text on keyup events in the description content input field
		$('#description_content').on('keyup', function(event){
			var value = $('#description_content').val();
			setContent(value);
		});
		
		// bind click events to toggle the description input display
		$('#description_edit, #description_header span').on('click', function(){
			toggle(false);
		});
		$('#description_collapse').on('click', function(){
			toggle(true);
		});
		
		// set header preview text position
		var left = $('#description .panel_title').width() + 12;
		var right = $('#description .description_buttons').width() + 15;
		$('#description span.minimized').css({'left': left, 'right': right});
		
		api.content(content); // set initial description content
		toggle(true);
	};
	
	return {
		name: "Description",
		callback: function() {
			setupDisplay(); // setup extension UI components and events
		}
	};
});
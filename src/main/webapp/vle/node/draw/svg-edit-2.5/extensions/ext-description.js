/*
 * ext-description.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jonathan Breitbart
 *
 * Allows users to add a description/annotation to their drawing
 * JQuery UI with dialogs and sliders plus accompanying css also required
 */

var descriptionLoaded = false; // wise4 var to indicate when extension has finished loading

svgEditor.addExtension("Description", function(S) {
	
	svgEditor.description = 'Enter text here....'; // initialize default description
	
	function setupDisplay(){
		
		var displaytext = '<div id="description"><div id="description_wrapper">'+
			'<div class="description_header"><div class="description_header_text"><span class="panel_title">Description:</span>'+
			' <span class="maximized">(Enter your text in the box below)</span><span class="minimized"></span>'+
			'</div><div class="description_buttons">'+
			'<a id="description_edit" title="Edit Description">Edit</a>'+
			'<button id="description_collapse" style="display:none" title="Save">Save</button></div></div>'+
			'<textarea id="description_content" class="description_input"></textarea></div></div>';
		
		$('#workarea').append(displaytext);
		
		$('#description_content').keyup(function(){
			var value = $('#description_content').val();
			$('#description span.minimized').text(value);
			$('#description span.minimized').attr('title');
			svgEditor.description = value;
			svgEditor.changed = true;
		});
		
		$('#description_edit, .description_header span').click(function(){
			$('#description_content').focus();
		});
		
		$('#description_collapse').click(function(){
			svgEditor.toggleDescription(true);
		});
		
		$('#description_content').focus(function(){
			svgEditor.toggleDescription(false);
		});
		
		//$('#workarea').css('bottom','100px');
		
		svgEditor.toggleDescription(true);
		
		descriptionLoaded = true;
	};
	
	svgEditor.toggleDescription = function(close){
		if(close){
			$('#description').css('height','28px');
			$('#description_content').hide();
			$('#description_edit').show();
			$('#description_collapse').hide();
			$('#description span.maximized').hide();
			$('#description span.minimized').show();
		}
		else {
			$('#description').css('height','127px');
			$('#description_content').css('height','75px');
			$('#description_content').show();
			$('#description_edit').hide();
			$('#description_collapse').show();
			$('#description span.minimized').hide();
			$('#description span.maximized').show();
		}
	};
	
	return {
		name: "Description",
		callback: function() {
			//add extension css
			var csspath = '/vlewrapper/vle/node/draw/svg-edit/extensions/ext-description.css'; // corrected path for wise4
			var fileref=document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", csspath);
			document.getElementsByTagName("head")[0].appendChild(fileref);
			
			setupDisplay();
		}
	};
});
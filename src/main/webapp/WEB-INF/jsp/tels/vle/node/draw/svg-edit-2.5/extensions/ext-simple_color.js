/*
 * ext-arrows.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jonathan Breitbart
 *
 * This extension removes the jpicker-based and palette color picker and implements a simplified
 * color picker using the Really Simple Color Picker in jQuery by Lakshan Perera (www.laktek.com,
 * http://github.com/laktek/really-simple-color-picker)
 *
 * Note: For this extension to function correctly, the jquery.colorPicker.js
 * must be loaded by svg-edit (e.g. included in head <script> and <link> tags in svg-editor.html)
 * 
 */

 
svgEditor.addExtension("Simple Color", function(S) {
	var mode = '';
	
	function setColors(){
		var svgdocbox = new DOMParser().parseFromString(
			'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="svg_icon">'+
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + 
			'<line fill="none" stroke="#d40000" id="svg_90" y2="24" x2="24" y1="0" x1="0"/>' +
			'<line id="svg_92" fill="none" stroke="#d40000" y2="24" x2="0" y1="0" x1="24"/>' +
			'</svg></svg>', 'text/xml');
		svgdocbox.documentElement.setAttribute('width',24);
		svgdocbox.documentElement.setAttribute('style','margin-left:-4px');
		
		var fill = svgCanvas.getFillColor();
		var stroke = svgCanvas.getStrokeColor();
		$('#fill').val(fill);
		$('#stroke').val(stroke);
		$('#fill ~ div.color_picker').html("&nbsp;");
		$('#stroke ~ div.color_picker').html("&nbsp;");
		
		if(fill=='none'){
			$('#fill ~ div.color_picker').append( document.importNode(svgdocbox.documentElement,true) );
			$('#fill ~ div.color_picker').css('background-color','#fff');
		} else {
			$('#fill').change();
		}
		if(stroke=='none'){
			$('#stroke ~ div.color_picker').append( document.importNode(svgdocbox.documentElement,true) );
			$('#stroke ~ div.color_picker').css('background-color','#fff');
		} else {
			$('#stroke').change();
		}
	}
	
	function changeColor(fill,stroke){
		if (mode=='fill'){
			svgCanvas.setFillColor(fill);
			//svgEditor.updateToolbar();
		} else if (mode=='stroke'){
			svgCanvas.setStrokeColor(stroke);
			//svgEditor.updateToolbar();
		}
	}
	
	return {
		name: "Simple Color",
		callback: function() {
			//add extension css
			var csspath = '/vlewrapper/vle/node/draw/svg-edit/extensions/jquery-rscp/colorPicker.css'; // corrected path for wise4
			var fileref=document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", csspath);
			document.getElementsByTagName("head")[0].appendChild(fileref);
		
			$('#color_picker').remove(); // remove existing color_picker div to avoid naming conflict
			
			$('#tools_left').append('<div id="colors" style="background-color:#F0F0F0; text-align:center; margin-top:4px; border:1px solid #BBBBBB;' +
				'padding:2px 3px 4px; text-align:center; width:28px; border-radius:4px; -moz-border-radius:4px; -webkit-border-radius:4px"><div>' +
				'<label for="fill">Fill</label>' +
				'<input id="fill" name="fill" type="text" value="#000000" /></div>'+
				'<div><label for="stroke">Line</label>' +
				'<input id="stroke" name="stroke" type="text" value="#000000" /></div></div>');
			
			$.fn.colorPicker.defaultColors = ["ffaaaa","ff5656","ff0000","bf0000","7f0000","ffffff","ffd4aa","ffaa56","ff7f00","bf5f00","7f3f00","e5e5e5","ffffaa","ffff56","ffff00","bfbf00","7f7f00","cccccc","d4ffaa","aaff56","7fff00","5fbf00","3f7f00","b2b2b2","aaffaa","56ff56","00ff00","00bf00","007f00","999999","aaffd4","56ffaa","00ff7f","00bf5f","007f3f","7f7f7f","aaffff","56aaff","007fff","005fbf","003f7f","4c4c4c","aaaaff","5656ff","0000ff","0000bf","00007f","333333","d4aaff","aa56ff","7f00ff","5f00bf","3f007f","191919","ffaaff","ff56ff","ff00ff","bf00bf","7f007f","000000","ffaad4","ff56aa","ff007f","bf005f","7f003f","none"];
			
			$('#fill').colorPicker();
			$('#stroke').colorPicker();
			
			setColors();
			
			var svgdocbox = new DOMParser().parseFromString(
				'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="svg_icon">'+
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' + 
				'<line fill="none" stroke="#d40000" id="svg_90" y2="24" x2="24" y1="0" x1="0"/>' +
				'<line id="svg_92" fill="none" stroke="#d40000" y2="24" x2="0" y1="0" x1="24"/>' +
				'</svg></svg>', 'text/xml');
			svgdocbox.documentElement.setAttribute('width',12);
			svgdocbox.documentElement.setAttribute('style','margin-left:-4px');
			$('.color_swatch:last').append( document.importNode(svgdocbox.documentElement,true) );
			$('.color_swatch:last').addClass('no_color');
			
			$('#color_selector').remove(); // remove duplicate #color_selector created by the colorPicker plugin
			
			$('div#color_custom').hide();
			
			$('#stroke_width').appendTo($('#colors')); // move stroke width selector to new colors div
			$('#stroke_width').css({'border':'1px solid #BBBBBB','margin-left':'-1px','margin-top':'3px','padding':'2px 6px 2px 1px'});
			$('#stroke_width').attr('size',1);
			
			$('#color_tools').remove();
			
			// set up click events for the fill and stroke selectors
			$('#fill ~ div.color_picker').click(function(){
				mode = 'fill';
			});
			
			$('#stroke ~ div.color_picker').click(function(){
				mode = 'stroke';
			});
			
			// set up click events for the color swatches
			$('#color_selector > div.color_swatch').click(function(){
				if($(this).hasClass('no_color')){
					var fill = 'none';
					var stroke = 'none';
					$('#color_selector').hide(); // needed because #color_selector doesn't auto-hide in the no color case (because color value is 'false')
					$('#color_selector').hide();
				} else {
					var fill = $('#fill').val();
					var stroke = $('#stroke').val();
				}
				changeColor(fill,stroke);
			});
			 
		},
		selectedChanged: function(opts) {
			setColors();
		}
	};
});

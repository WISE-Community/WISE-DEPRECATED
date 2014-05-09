/*
 * ext-wise.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2014 Jonathan Lim-Breitbart
 *
 * Customizes the svg-edit user interface for use in the WISE learning environment
 * Adds check for drawing size limits and an svgEditor.changed variable for use when saving student data in WISE
 * 
 * TODO: i18n
 */

svgEditor.addExtension("WISE", function(S) {
	/* Private variables */
	var canv = svgEditor.canvas,
		lz77 = new LZ77(), // lz77 compression object
		loaded = false, // Boolean to indicate whether extension has finished loading
		changeNum = 0,
		nodeType = svgEditor.nodeType;
	
	svgEditor.changed = false; // boolean to specify whether data has changed, if no changes, do not post nodestate on exit
	svgEditor.initLoad = false; // boolean to specify whether svgeditor is populating canvas on node entry or on snapshot click
	
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_wise = {
		/** 
		 * Gets whether extensions has completely loaded
		 * 
		 * @returns Boolean
		 */
		isLoaded: function(){
			return loaded;
		}
	};
	
	// fit drawing canvas to workarea (accessible vie svgEditor object)
	svgEditor.resizeCanvas = function() {
		if(nodeType === 'annotator'){
			$('#fit_to_all').mouseup();
		} else {
			$('#fit_to_canvas').mouseup();
		}
	};
	
	// TODO: remove (convert to Bootbox)
	function setupWarnings(){
		var sizeWarning = '<div id="drawlimit_dialog" title="Drawing is Too Big"><div class="ui-state-error">' +
			'<span class="ui-icon ui-icon-alert" style="float:left"></span><span id="drawlimit_warning">Warning! Your current drawing is too large.' +
			'</div><div class="ui-dialog-content-content" id="drawlimit_instructions">If you would like to make any more changes, please delete some of the items in the picture.  Thank you!' +
			'</div></div>';
		$('#svg_editor').append(sizeWarning);
		
		$('#drawlimit_dialog').dialog({
			resizable: false,
			modal: true,
			autoOpen: false,
			width: 420,
			buttons: [
			    {
			    	id: 'drawlimit_confirm',
			    	text: 'OK',
			    	click: function() { $(this).dialog('close'); }
			    }
			]
		});
		
		loaded = true;
	}
	
	function updateDisplay(){
		// remove unused elements in WISE
		$('#tool_wireframe').remove();
		$('#tool_source').remove();
		$('#tool_zoom').remove();
		//$('#tool_fhrect').remove();
		//$('#tool_fhellipse').remove();
		$('.stroke_tool').remove();
		$('#toggle_stroke_tools').remove();
		$('#idLabel').remove();
		$('#tool_blur').remove();
		$('#line_panel').remove();
		$('#circle_panel').remove();
		$('#ellipse_panel').remove();
		$('#rect_panel > .toolset').remove();
		$('#xy_panel').remove();
		$('#tool_font_family').remove();
		$('#tool_node_x').remove();
		$('#tool_node_y').remove();
		$('#tool_topath').remove();
		$('#tool_reorient').remove();
		$('#tool_make_link').remove();
		$('#tool_make_link_multi').remove();
		$('#layerpanel, #sidepanel_handle').remove();
		$('#overview_window_content_pane').hide();
		$('#palette_holder').remove();
		$('#main_button').remove();
		$('#editor_panel > .tool_sep').remove();
		$('#history_panel > .tool_sep').remove();
		$('#tool_image').hide();
		$('#image_panel > .toolset').remove();
		$('#zoom_panel').hide();
		
		if(nodeType === "draw"){
			// move elements and adjust display in WISE
			$('#tools_top').css({'left':'2px','height':'62px'});
			$('#tools_bottom_2').css('width','280px');
			$('#tool_stroke').css('width','auto');
			$('#tools_bottom_2 .icon_label').css('margin-top','4px');
			$('#tools_left').css('top','66px');
			$('#workarea, #sidepanels').css('top','66px');
			$('#sidepanels').css('border-width','0');
		} else if(nodeType === 'annotator'){
			$('#svg_editor').append($('#text'));
			$('#canvasBackground > rect').attr('stroke', '#bbb');
			// TODO: disable right click context menu
		}
		
		svgCanvas.setFontFamily('sans-serif'); // set default font family
		
		svgEditor.resizeCanvas();
		$(window).on('resize.svgedit', function() {
			svgEditor.resizeCanvas();
		});
		
		setupWarnings();
		loaded = true;
	}
	
	// whenever user has modified canvas (for draw nodes), check whether current drawing is too large
	// TODO: add text tool changes to this code (svg-edit bug)
	function drawTooLarge(){
		var current = svgCanvas.getSvgString();
		var compressed = lz77.compress(current);
		
		// if compressed svg string is larger max, alert user and undo latest change
		if(compressed.length * 2 > svgEditor.maxDrawSize){
			$('#tool_undo').click();
			//var msg = 'Warning! Your current drawing is too large.\n\nIf you would like to save this drawing, please delete some of the items in the picture. Thank you!';
			//$.alert(msg);
			// TODO: i18n, convert to Bootbox
			$('#drawlimit_dialog').dialog('open');
			return true;
		} else {
			return false;
		}
	}
		
	return {
		name: "WISE",
		callback: function() {
			updateDisplay();
		},
		elementChanged: function(opts){
			if(svgEditor.loadedWISE) { // check to see if this change is this initial drawing import
				if(nodeType === 'draw' && drawTooLarge()){
					return;
				} else {
					// TODO: figure out how to exclude a change that results from an undo for a drawing that is too big
					svgEditor.changed = true;
				}
			}
		}
	};
});

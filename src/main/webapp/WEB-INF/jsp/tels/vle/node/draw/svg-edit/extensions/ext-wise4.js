/*
 * ext-wise4.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Jonathan Lim-Breitbart
 *
 * Customizes the svg-edit user interface for use in the WISE4 learning environment
 * Adds check for drawing size limits and an svgEditor.changed variable for use when saving student data in WISE4
 * 
 * TODO: i18n
 */
 
svgEditor.addExtension("WISE4", function(S) {
	
	/* Private variables */
	//var svgcontent = S.svgcontent;
	var lz77 = new LZ77(), // lz77 compression object
		loaded = false, // Boolean to indicate whether extension has finished loading
		changeNum = 0;
		
	svgEditor.changed = false; // boolean to specify whether data has changed, if no changes, do not post nodestate on exit
	svgEditor.initLoad = false; // boolean to specify whether svgeditor is populating canvas on node entry or on snapshot click
	
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_wise4 = {
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
		$('#fit_to_canvas').mouseup();
	};
	
	function setupWarnings(){
		var sizeWarning = '<div id="drawlimit_dialog" title="Drawing is Too Big"><div class="ui-state-error">' +
			'<span class="ui-icon ui-icon-alert" style="float:left"></span><span id="drawlimit_warning">Warning! Your current drawing is too large.' +
			'</div><div class="ui-dialog-content-content" id="drawlimit_instructions">If you would like to save this drawing, please delete some of the items in the picture.  Thank you!' +
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
		// remove unused elements in wise4
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
		$('#palette_holder').remove();
		$('#main_button').remove();
		$('#editor_panel > .tool_sep').remove();
		$('#history_panel > .tool_sep').remove();
		$('#tool_image').hide();
		$('#image_panel > .toolset').remove();
		$('#zoom_panel').hide();
		
		// move elements and adjust display in wise4
		$('#tools_top').css({'left':'2px','height':'62px'});
		$('#tools_bottom_2').css('width','280px');
		$('#tool_stroke').css('width','auto');
		$('#tools_bottom_2 .icon_label').css('margin-top','4px');
		$('#tools_left').css('top','66px');
		$('#workarea, #sidepanels').css('top','66px');
		$('#sidepanels').css('border-width','0');
		/*$('#tool_angle').insertAfter('#tool_reorient');
		$('#tool_opacity').insertAfter('#tool_angle');
		$('#tool_move_top').insertAfter('#tool_opacity');
		$('#tool_move_bottom').insertAfter('#tool_move_top');
		$('#tool_position').insertAfter('#tool_move_bottom');
		$('#selected_panel > div.toolset:eq(0) > div.tool_sep:eq(2)').remove();
		$('<div class="tool_sep"></div>').insertAfter('#tool_position');
		$('#cur_position').css({'margin-top':'1px','padding-right':'0'});
		$('#tool_position').css('margin-right','2px');
		$('#tool_opacity').css({'background':'none','position':'inherit'});
		$('#opacity_dropdown').removeClass('dropup');
		$('#group_opacity').css({'padding':'2px 5px 2px 2px','margin-right':'2px'});
		$('#group_opacityLabel').css('margin','0');
		$('#angle').css('padding','2px 10px 2px 2px');
		$('#font_size').css('padding','2px 10px 2px 2px');
		$('#tool_angle').css('margin-left','0');
		$('#cornerRadiusLabel').css('margin-left','0');
		$('.tool_sep').css({'height':'28px','margin':'3px 3px'});
		$('#workarea').css({'top':'60px','bottom':'36px','min-height':'400px','overflow':'visible','right':'5px'});
		$('#sidepanels').css({'top':'60px','bottom':'36px','padding':'0'});
		$('#tools_top').css({'left':'2px','height':'57px'});
		$('#tools_left').css('top','60px');
		$('#tools_bottom').css('height','32px');
		$('#stroke_width').css('width','21px');
		$('#sidepanels').css('border','none');
		$('#zoom_panel').hide();
		$('#sidepanels').css('min-height','402px');*/
		
		svgCanvas.setFontFamily('sans-serif'); // set default font family
		
		svgEditor.resizeCanvas();
		$(window).on('resize.svgedit', function() {
			svgEditor.resizeCanvas();
		});
		
		setupWarnings();
	}
	
	// whenever user has modified drawing canvas, check whether current drawing is too large (>20k)
	// TODO: add text tool changes to this code (svg-edit bug)
	function checkDrawSize(){
		var current = svgCanvas.getSvgString();
		var compressed = lz77.compress(current);
		//alert(current.length*2 + ' ' + compressed.length * 2);
		// if compressed svg string is larger than 20k (or 10k if maxSnaps > 10), alert user and undo latest change
		if(compressed.length * 2 > svgEditor.maxDrawSize){
			$('#tool_undo').click();
			$('#drawlimit_dialog').dialog('open');
		}
	}
		
	return {
		name: "WISE4",
		callback: function() {
			updateDisplay();
		},
		elementChanged: function(opts){
			if(svgEditor.loadedWISE) { // check to see if this change is this initial drawing import
				svgEditor.changed = true;
			}
		}
	};
});

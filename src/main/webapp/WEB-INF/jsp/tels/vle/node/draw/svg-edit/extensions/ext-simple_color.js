/*
 * ext-simple_color.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Jonathan Lim-Breitbart
 *
 * This extension removes the jPicker-based color picker and implements a simplified
 * color picker using Spectrum (http://bgrins.github.io/spectrum/)
 *
 * Note: For this extension to function correctly, the Spectrum jQuery plugin and
 * css must be included in head of svg-editor.html
 * 
 * TODO: i18n
 */

 
svgEditor.addExtension("Simple Color", function(S) {
	// adapted from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	function hexAlphaToRgba(hex,a) {
	    var bigint = parseInt(hex.replace('#',''), 16);
	    var r = (bigint >> 16) & 255;
	    var g = (bigint >> 8) & 255;
	    var b = bigint & 255;

	    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
	}
	
	function setColors(){
		var fill_color = svgCanvas.getStyle().fill,
			fill_opacity = svgCanvas.getStyle().fill_opacity,
			stroke_color = svgCanvas.getStyle().stroke,
			stroke_opacity = svgCanvas.getStyle().stroke_opacity,
			fill = hexAlphaToRgba(fill_color,fill_opacity),
			stroke = hexAlphaToRgba(stroke_color,stroke_opacity);
		$('#fill').spectrum('set',fill);
		$('#stroke').spectrum('set',stroke);
	}
	
	function changeColor(mode,color){
		var paint = new $.jGraduate.Paint({alpha: color.alpha*100, solidColor: color.toHexString().replace('#','')});
		if (mode==='fill'){
			svgCanvas.setPaint('fill',paint);
		} else if (mode==='stroke'){
			svgCanvas.setPaint('stroke',paint);
		}
	}
	
	return {
		name: "Simple Color",
		callback: function() {		
			$('#color_picker').remove(); // remove existing color_picker div
			
			
			// hide original tool_fill and tool_hide elements
			$('#tool_fill > .color_block').hide();
			$('#tool_stroke > .color_block').hide();
			
			$('#tool_fill').append('<input id="fill" name="fill" type="text" value="#000000" />');
			$('#tool_stroke').append('<input id="stroke" name="stroke" type="text" value="#000000" />');
			
			//$.fn.colorPicker.defaults.colors = ["ffaaaa","ff5656","ff0000","bf0000","7f0000","ffffff","ffd4aa","ffaa56","ff7f00","bf5f00","7f3f00","e5e5e5","ffffaa","ffff56","ffff00","bfbf00","7f7f00","cccccc","d4ffaa","aaff56","7fff00","5fbf00","3f7f00","b2b2b2","aaffaa","56ff56","00ff00","00bf00","007f00","999999","aaffd4","56ffaa","00ff7f","00bf5f","007f3f","7f7f7f","aaffff","56aaff","007fff","005fbf","003f7f","4c4c4c","aaaaff","5656ff","0000ff","0000bf","00007f","333333","d4aaff","aa56ff","7f00ff","5f00bf","3f007f","191919","ffaaff","ff56ff","ff00ff","bf00bf","7f007f","000000","ffaad4","ff56aa","ff007f","bf005f","7f003f","transparent"];
			var palette = [
		        ["ffaaaa","ff5656","ff0000","bf0000","7f0000","ffffff"],
		        ["ffd4aa","ffaa56","ff7f00","bf5f00","7f3f00","e5e5e5"],
		        ["ffffaa","ffff56","ffff00","bfbf00","7f7f00","cccccc"],
		        ["d4ffaa","aaff56","7fff00","5fbf00","3f7f00","b2b2b2"],
		        ["aaffaa","56ff56","00ff00","00bf00","007f00","999999"],
		        ["aaffd4","56ffaa","00ff7f","00bf5f","007f3f","7f7f7f"],
		        ["aaffff","56aaff","007fff","005fbf","003f7f","4c4c4c"],
		        ["aaaaff","5656ff","0000ff","0000bf","00007f","333333"],
		        ["d4aaff","aa56ff","7f00ff","5f00bf","3f007f","191919"],
		        ["ffaaff","ff56ff","ff00ff","bf00bf","7f007f","000000"],
		        ["ffaad4","ff56aa","ff007f","bf005f","7f003f","transparent"]
		    ];
			
			$("#fill").spectrum({
			    showPaletteOnly: true,
			    showPalette:true,
			    palette: palette,
			    className: 'sp-svgedit color_block',
			    change: function(color) {
			        changeColor('fill',color);
			    }
			});
			
			$("#stroke").spectrum({
			    showPaletteOnly: true,
			    showPalette:true,
			    palette: palette,
			    className: 'sp-svgedit color_block',
			    change: function(color) {
			        changeColor('stroke',color);
			    }
			});
			
			// bind click events to fill_color and stroke_color to show spectrum color picker
			$('#fill_color').on('click',function(){
				$('#fill').spectrum('toggle');
			});
			$('#stroke_color').on('click',function(){
				$('#stroke').spectrum('toggle');
			});
			
			// set color pickers with initial colors
			setColors();
		},
		selectedChanged: function(opts) {
			// update color pickers
			setColors();
		}
	};
});

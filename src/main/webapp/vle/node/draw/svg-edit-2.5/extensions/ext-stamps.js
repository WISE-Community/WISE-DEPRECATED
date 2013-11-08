/*
 * ext-stamps.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jonathan Breitbart
 *
 * Adds a stamp tool to svg-edit (an alternative to the image tool)
 * Designed for use in the WISE4 learning environment (http://wise4.berkeley.edu)
 */
var stampsLoaded = false; // wise4 var to indicate when extension has finished loading
 
svgEditor.addExtension("Stamps", function(S) {
	//var svgcontent = S.svgcontent;
	var getNextId = S.getNextId,
		addSvgElementFromJson = S.addSvgElementFromJson,
		assignAttributes = S.assignAttributes,
		preventClickDefault = S.preventClickDefault,
		getElem = S.getElem,
		getId = S.getId,
		transformPoint = S.transformPoint;
	
	svgEditor.stamps = []; // initiate stamps array
	
	svgEditor.currStamp = null; // holds active stamp image
	
	svgEditor.setStamp = function(index){
		svgEditor.currStamp = svgEditor.stamps[index];
		$("#stamp" + index).addClass("tool_stamp_current");
		$('.tool_stamp').each(function(){
			var id = 'stamp' + index;
			if ($(this).attr("id") == id) {
				$(this).addClass("tool_stamp_current");
			} else {$(this).removeClass("tool_stamp_current");};
		});
		svgEditor.setStampPreview(index);
	};
	
	svgEditor.setStampImages = function(images) {
		//if(images.length > 0){
			svgEditor.stamps = images;
			addStamps(images);
		//} else {
			//$("tool_stamp").remove(); // if no stamp images specified, remove stamp button
		//}
	};
	
	function addStamps(images){
		var stamps = images;
		for (var i=0; i<stamps.length; i++){
			var num = i*1 + 1;
			// add stamp preview image to stamp selector
			var stamptxt = "<img id='stamp" + i + "' class='tool_stamp' src='" + encodeURI(stamps[i].uri) + "' title='" + stamps[i].title + "' alt='Stamp " + num + "' />";
			$('#stamp_images').append(stamptxt);
			var height = stamps[i].height, width = stamps[i].width;
			if(height > width || height == width){
				if (height > 75){
					var zoom = 75/height;
					height = height * zoom;
					width = width * zoom;
				}
			} else if (width > height){
				if (width > 75){
					var zoom = 75/height;
					height = height * zoom;
					width = width * zoom;
				}
			}
			console.log ("h: " + height + ' width: ' + width);
			$('#stamp' + i).height(height).width(width);
		}
		// set first image as default (selected)
		svgEditor.setStamp(0);
		$("#stamp_images > #0").addClass("tool_stamp_current");
		
		// bind click event to set selected stamp image
		$('.tool_stamp').live('click',function(){
			var index = $(this).attr('id');
			index = index.replace(/^stamp/,'');
			svgEditor.setStamp(index);
			svgEditor.setStampPreview(index);
			$('#tools_stamps').fadeOut("slow");
		});
		
		stampsLoaded = true;
	};
	
	svgEditor.setStampPreview = function(index){
		var stamps = svgEditor.stamps;
		var height = stamps[index].height;
		var width = stamps[index].width;
		
		$('#stamp_preview').attr('src',stamps[index].uri);
		setPreviewSize();
		
		// align stamp preview center point to cursor on mousemove
		$('#svgcanvas').mousemove(function(e){
			var mode = svgCanvas.getMode();
			if(mode == 'stamp'){
				var currStamp = svgEditor.currStamp;
				var current_zoom = svgCanvas.getZoom();
				var offset = $('#workarea').offset();
				var width = currStamp.width*current_zoom;
				var height = currStamp.height*current_zoom;
				var x = e.pageX-offset.left-width/2;
				var y = e.pageY-offset.top-height/2;
				$('#stamp_preview').css({'left': x, 'top': y, 'cursor':'crosshair'});
				$('#stamp_preview').show();
			}
		});
		
		$('#svgcanvas').mouseleave(function(e){
			$('#stamp_preview').hide();
		});
	};
	
	function setPreviewSize(){
		var current_zoom = svgCanvas.getZoom();
		var currStamp = svgEditor.currStamp;
		var height = currStamp.height*current_zoom;
		var width = currStamp.width*current_zoom;
		$('#stamp_preview').height(height).width(width);
	};
	
	return {
		name: "Stamps",
		svgicons: "/vlewrapper/vle/node/draw/svg-edit/extensions/stamp.xml", // corrected path for wise4
		buttons: [{
			id: "tool_stamp",
			type: "mode",
			title: "Stamp Tool", 
			events: {
				'click': function() {
					svgCanvas.setMode("stamp");
					var pos = $('#tool_stamp').offset();
					var w = $('#tool_stamp').outerWidth();
					$('#tools_stamps').css({'left': pos.left+w+6, 'top': pos.top - $('#tools_stamps').height()/2});
					if ($('#tools_stamps')) {
						$('#tools_stamps').toggle(); // show/hide stamp selector
					}
				}
			}
		}],
		callback: function() {
			//add extension css
			var csspath = '/vlewrapper/vle/node/draw/svg-edit/extensions/ext-stamps.css'; // corrected path for wise4
			var fileref=document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", csspath);
			document.getElementsByTagName("head")[0].appendChild(fileref);
		
			setTimeout(function(){
				$('#tool_stamp').insertAfter('#tool_image'); // place stamp tool below image tool
			},500);
			
			var images = []; // initiate stamp images
			
			/*var images = [ // sample images (json) array
	          	{
	                "title": "Hydrogen",
	                "uri": "assets/hydrogen.png",
	                "width": 33,
	                "height": 35
	             },
	             {
	                "title": "NSF",
	                "uri": "assets/NSF-logo.gif",
	                "width": 50,
	                "height": 50
	             }
	          ],*/
			var stampChooser = '<div id="tools_stamps">' +
				'<div class="tools_title">Choose a Stamp:</div>' +
				'<div id="stamp_images"></div>' +
				'</div>';
			
			$('#svg_editor').append(stampChooser);
			
			var preview = '<img id="stamp_preview" />';
			$('#svgcanvas').append(preview);
			
			if(images.length > 0){
				svgEditor.setStampImages(images);
			} else {
				stampsLoaded = true;
			}
			
			$('.tool_button, .push_button').click(function(){
				if($(this).attr('id') != 'tool_stamp'){
					if($('#tools_stamps').is(':visible')){
						$('#tools_stamps').hide();
					}
				}
			});
		},
		
		zoomChanged: function(opts){
			if(svgEditor.stamps.length>0){
				setPreviewSize();
			}
		},
		
		mouseDown: function(opts) {
			var mode = svgCanvas.getMode();
			var e = opts.event;
			var current_zoom = svgCanvas.getZoom(),
				x = opts.start_x / current_zoom,
				y = opts.start_y / current_zoom,
				canvasw = svgCanvas.getResolution().w / current_zoom,
				canvash = svgCanvas.getResolution().h / current_zoom;
			if(mode == 'stamp' && x>0 && x<canvasw && y>0 && y<canvash){ //wise4 - don't create new image if cursor is outside canvas boundaries - avoid extraneous elements
				var currStamp = svgEditor.currStamp;
				var xlinkns = "http://www.w3.org/1999/xlink";
				var newImage = addSvgElementFromJson({
					"element": "image",
					"attr": {
						"x": x-currStamp.width/2,
						"y": y-currStamp.height/2,
						'width': currStamp.width,
						'height': currStamp.height,
						"id": getNextId(),
						"opacity": svgCanvas.getFillOpacity(),
						"style": "pointer-events:inherit; display:none;" //hide stamp image initially, show it on mouseUp
					}
				});
				// set image uri to current stamp uri
        		newImage.setAttributeNS(xlinkns, "xlink:href", currStamp.uri);
				//preventClickDefault(newImage);
				
				$('#tools_stamps').fadeOut("slow");
					
				return {
					started: true
				};
			}
		},
		
		mouseUp: function(opts){
			var e = opts.event;
			var current_zoom = svgCanvas.getZoom(),
				x = opts.mouse_x / current_zoom,
				y = opts.mouse_y / current_zoom;
			var shape = getElem(getId());
			var mode = svgCanvas.getMode();
			if(mode == 'stamp'){
				var currStamp = svgEditor.currStamp;
				// when adding an image (stamp), assign dimensions and coordinates without dragging (on mouse click)
				// image dimensions assigned from currStamp
				assignAttributes(shape,{
					'width': currStamp.width,
					'height': currStamp.height,
					'x': x-currStamp.width/2,
					'y': y-currStamp.height/2,
					"style": "pointer-events:inherit;"
				},1000);
				started = false;
				return {
					keep: true,
					element: shape,
					started: started
				};
			};
		}
		
	};
});
/*
 * ext-stamps.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Jonathan Lim-Breitbart
 *
 * Adds a stamp tool to svg-edit (an alternative to the built-in image tool)
 * 
 * Dependencies:
 * - Accompanying css ('ext-stamps.css' should be included svg-editor.html <head>)
 * 
 * TODO: i18n
 */
 
svgEditor.addExtension("Stamps", function(S) {
	
	/* Private variables */
	var getNextId = S.getNextId,
		addSvgElementFromJson = S.addSvgElementFromJson,
		assignAttributes = S.assignAttributes,
		preventClickDefault = S.preventClickDefault,
		getElem = S.getElem,
		getId = S.getId,
		transformPoint = S.transformPoint,
		activeIndex = -1, // Index to hold active stamp (from 'content' Array)
		// Array to store the stamp images
		content = [
			{
			    "title": "Logo (SVG)",
			    "uri": "extensions/logo.svg",
			    "width": 50,
			    "height": 50
			},
			{
			    "title": "Logo (PNG)",
			    "uri": "extensions/logo.png",
			    "width": 50,
			    "height": 50
			}
		],
		loaded = false; // Boolean to indicate whether extension has finished loading
		
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_stamps = {
		/** 
		 * Gets or sets the stored stamps array and updates the UI display
		 * 
		 * @param _ Array of stamp objects
		 * @returns Array of stamp objects
		 * @returns Object this
		 */
		content: function(val){
			if(!arguments.length){ return content; } // no arguments, so return content
			
			setContent(val);
			return this;
		},
		/** 
		 * Gets or sets the active stamp index
		 * 
		 * @param value Integer of active stamp image
		 * @returns Array active stamp index
		 * @returns Object this
		 */
		active: function(val){
			if(!arguments.length){ return activeIndex; } // no arguments, so return content
			
			if(val > -1){
				setActive(val);
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
		 * Listener function that is called when the prompt content has been updated;
		 * Accessible via svgEditor object
		 * 
		 * @param value String for new prompt content
		 */
		changed: function(){
			// optional: override with custom actions
		}
	};
	
	/* Private functions */
	function setActive(index){
		activeIndex = index;
		$("#stamp" + index).addClass("tool_stamp_current");
		$('.tool_stamp').each(function(){
			var id = 'stamp' + index;
			if ($(this).attr("id") == id) {
				$(this).addClass("tool_stamp_current");
			} else {$(this).removeClass("tool_stamp_current");};
		});
		setPreview();
	}
	
	function setPreview(){
		if(activeIndex > -1){
			var stamp = content[activeIndex];
			var height = stamp.height;
			var width = stamp.width;
			
			$('#stamp_preview').attr('src',stamp.uri);
			setPreviewSize();
			
			// align stamp preview center point to cursor on mousemove
			$('#svgcanvas').on('mousemove', function(e){
				var mode = svgCanvas.getMode();
				if(mode == 'stamp'){
					var current_zoom = svgCanvas.getZoom();
					var offset = $('#workarea').offset();
					var width = stamp.width*current_zoom;
					var height = stamp.height*current_zoom;
					var x = e.pageX-offset.left-width/2;
					var y = e.pageY-offset.top-height/2;
					$('#stamp_preview').css({'left': x, 'top': y, 'cursor':'crosshair'});
					$('#stamp_preview').show();
				}
			});
			
			$('#svgcanvas').on('mouseleave', function(e){
				$('#stamp_preview').hide();
			});
		}
	}
	
	function setPreviewSize(){
		if(activeIndex > -1){
			var stamp = content[activeIndex];
			var current_zoom = svgCanvas.getZoom();
			var height = stamp.height*current_zoom;
			var width = stamp.width*current_zoom;
			$('#stamp_preview').height(height).width(width);
		}
	}
	
	function setContent(stamps){
		content = stamps;
		$('#stamp_images').html(''); // clear out existing stamps
		for (var i=0; i<stamps.length; i++){
			var num = i*1 + 1;
			// add stamp preview image to stamp selector
			var stamptxt = "<img id='stamp" + i + "' class='tool_stamp' src='" + encodeURI(stamps[i].uri) + "' title='" + stamps[i].title + "' alt='Stamp " + num + "' />";
			$('#stamp_images').append(stamptxt);
			/*var height = stamps[i].height, width = stamps[i].width;
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
			//console.log ("h: " + height + ' width: ' + width);
			$('#stamp' + i).height(height).width(width);*/
		}
		// set first image as default (selected)
		setActive(0);
		$("#stamp_images > #0").addClass("tool_stamp_current");
		
		// bind click event to thumbnails to set selected stamp
		$('.tool_stamp').on('click',function(){
			var index = $(this).attr('id');
			index = index.replace(/^stamp/,'');
			setActive(index);
			$('#tools_stamps').fadeOut("slow");
		});
		
		if(!loaded){
			// on first load, set extension loaded variable to true and call extension loaded listener
			loaded = true;
		}
		
	}
	
	function setupDisplay(){
		// setup extension UI components
		var stampChooser = '<div id="tools_stamps">' +
			'<div class="tools_title" id="tools_stamps_title">Choose a Stamp:</div>' +
			'<div id="stamp_images"></div>' +
			'</div>';
		var preview = '<img id="stamp_preview" />';
		
		// add extension UI components to page
		$('#svg_editor').append(stampChooser);
		$('#svgcanvas').append(preview);
		
		// close stamp chooser when user clicks on another tool
		$('.tool_button, .push_button').on('click', function(){
			if($(this).attr('id') !== 'tool_stamp'){
				if($('#tools_stamps').is(':visible')){
					$('#tools_stamps').hide();
				}
			}
		});
		
		setContent(content); // set initial stamp images
	}
	
	return {
		name: "Stamps",
		svgicons: "extensions/stamp.xml",
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
			setupDisplay();
		},
		zoomChanged: function(opts){
			setPreviewSize();
		},
		mouseDown: function(opts) {
			var mode = svgCanvas.getMode();
			var e = opts.event;
			var current_zoom = svgCanvas.getZoom(),
				x = opts.start_x / current_zoom,
				y = opts.start_y / current_zoom,
				canvasw = svgCanvas.getResolution().w / current_zoom,
				canvash = svgCanvas.getResolution().h / current_zoom;
			if(mode === 'stamp' && x>0 && x<canvasw && y>0 && y<canvash){ //wise4 - don't create new image if cursor is outside canvas boundaries - avoid extraneous elements
				svgCanvas.clearSelection(); // prevent image url dialog from opening when another image is selected and selectNew config option is set to false
				var xlinkns = "http://www.w3.org/1999/xlink",
					stamp = content[activeIndex];
				var newImage = addSvgElementFromJson({
					"element": "image",
					"attr": {
						"x": x-stamp.width/2,
						"y": y-stamp.height/2,
						'width': stamp.width,
						'height': stamp.height,
						"id": getNextId(),
						"opacity": svgCanvas.getFillOpacity(),
						"style": "pointer-events:inherit; display:none;" //hide stamp image initially, show it on mouseUp
					}
				});
				// set image uri to current stamp uri
        		newImage.setAttributeNS(xlinkns, "xlink:href", stamp.uri);
				
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
			if(mode === 'stamp'){
				// when adding an image (stamp), assign dimensions and coordinates without dragging (on mouse click)
				// image dimensions assigned from currStamp
				var stamp = content[activeIndex];
				assignAttributes(shape,{
					'width': stamp.width,
					'height': stamp.height,
					'x': x-stamp.width/2,
					'y': y-stamp.height/2,
					"style": "pointer-events:inherit;"
				},1000);
				return {
					keep: true,
					element: shape,
					started: false
				};
			};
		}
		
	};
});
/*
 * ext-snapshots.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Jonathan Lim-Breitbart
 *
 * Adds a snapshot tool which allows users to take "snapshots" or "frames" (copies)
 * of their drawings and save them to a sidepanel. Clicking on a snapshot thumbnail opens that
 * snapshot in the main drawing window. Snapshots can be re-ordered via drag-and-drop.
 * The snapshots sidepanel also includes playback controls that can be used to
 * animate the snapshots/frames in a flip-book like manner at varying speeds.
 * 
 * Dependencies:
 * - Accompanying css file ('ext-snapshots.css' should be included in svg-editor.html <head>)
 * - jQuery Timers (http://plugins.jquery.com/project/timers) plugin (should be included in svg-editor.html <head>)
 * - jQuery UI with dialogs and sliders plus accompanying css
 * 
 * TODO: i18n; fix toggle link placement
 */

svgEditor.addExtension("Snapshots", function(S) {
	
	/* Private variables and classes */
	var resetUndoStack = svgCanvas.undoMgr.resetUndoStack,
		content = [], // Array (of Snapshot objects) to store the saved snapshots/frames
		loaded = false, // Boolean to indicate whether extension has finished loading
		loading = false, // Boolean to indicate whether extension is in the process of loading
		playback = 'pause', // String to indicate current playback mode
		selected = -1, // Integer to store index of currently selected snapshot (from 'content' array)
		selecting = false, // Boolean to indicate whether we are in the process of selecting a snapshot to open
		opened = -1, // Integer to store id of snapshot currently being viewed/edited (from 'content' array)
		active = -1, // Integer to store index of a snapshot being opened or re-ordered (from 'content' array)
		max = 10, // Integer indicating maximum allowed snapshots (10 is default; allowed values are 1+)
		min = 0, // Integer indicating minimum allowed snapshots (0 is default; allowed values are 0 to max value)
		total = 0; // Integer to hold total number of snapshots created (including deleted snapshots) - value reverts to content.length whenever snapshot content is set
	
	// Snapshot class
	function Snapshot(svg, id){
		this.svg = svg;
		this.id = id;
	}
	
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_snapshots = {
		/** 
		 * Gets or sets the stored snapshots content and updates the UI display
		 * 
		 * @param val Array of snapshot objects
		 * @param idToOpen Integer id of snapshot to open after snapshots have loaded (optional)
		 * @param total Integer total number of snapshots created (optional)
		 * @param callback Function to run when content has been set and snapshots have been created (optional)
		 * @returns Array of snapshot objects
		 * @returns Object this
		 */
		content: function(val, idToOpen, total, callback){
			if(!arguments.length){ return content; } // no arguments, so return content
			
			loading = true;
			setContent(val, idToOpen, total, callback);
			
			return this;
		},
		/** 
		 * Gets or sets the maximum allowed snapshots
		 * 
		 * @param val Integer max snapshots
		 * @returns Integer max snapshots
		 * @returns Object this
		 */
		max: function(val) {
			if(!arguments.length){ return max; } // no arguments, so return max value
			
			if(typeof val === 'number' && val > (min-1)){
				setMax(val);
			}
			return this;
		},
		/** 
		 * Gets or sets the minimum allowed snapshots
		 * 
		 * @param val Integer min snapshots
		 * @returns Integer min snapshots
		 * @returns Object this
		 */
		min: function(val) {
			if(!arguments.length){ return min; } // no arguments, so return min value
			
			if(typeof val === 'number' && val < (max+1)){
				setMin(val);
			}
			return this;
		},
		/** 
		 * Gets or sets the currently opened snapshot (by id)
		 * 
		 * @param val Integer snapshot id
		 * @returns Integer snapshot id
		 * @returns Object this
		 */
		open: function(val) {
			if(!arguments.length){ return opened; } // no arguments, so return min value
			
			for(var i=0; i<content.length; i++){
				if(content[i].id === val){
					var index = i;
					openSnapshot(i,false);
					break;
				}
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
		 * Gets the total number of snapshots created (including deleted snapshots)
		 * 
		 * @returns Integer
		 */
		total: function(){
			return total;
		},
		/**
		 * Toggles the snapshots panel open or closed
		 * 
		 * @param close Boolean to indicate whether snapshots panel should be closed or not (optional)
		 * @returns Object this
		 */
		toggleDisplay: function(close){
			toggleSidePanel(close);
			return this;
		},
		/**
		 * Listener function that is called when the snapshots content or currently opened snapshot has changed
		 */
		changed: function(){
			// optional: override with custom actions
		}
	};
	
	/* Private functions */
	function onComplete(callback){
		if(!loaded){
			// on first load, set extension loaded variable to true and call extension loaded listener
			loaded = true;
		}
		if(callback){
			callback();
		}
	}
	
	function setContent(snapshots, idToOpen, totalSnaps, callback){
		content = snapshots;
		
		// clear out any existing snapshots
		$('#snap_images .snap').remove();
		var open = 0;
		selected = 0;
		if(idToOpen && idToOpen > -1){
			open = idToOpen;
		}
		if(totalSnaps && totalSnaps > -1){
			total = totalSnaps;
		} else {
			total = snapshots.length;
		}
		
		if(snapshots.length > 0){
			// add new snapshots
			var x = snapshots.length;
			for (var i=0; i<snapshots.length; i++) {
				var svg = snapshots[i].svg;
				var id = snapshots[i].id;
				if(open === id){ selected = i; }
				addSnapshot(svg,i,id,false, function(){
					--x;
					if(x === 0){
						openSnapshot(selected,false,onComplete(callback));
					}
				});
			}
		} else if(min > 0){
			// 0 snapshots is not allowed, so we need to create minimum number of initial snapshots
			var n = min;
			for(var a=0; a<min; a++){
				newSnapshot(false, function(){
					--n;
					if(n === 0){
						if(open > min){
							open = 0;
							//console.log('request to open snapshot that does not exist);
						}
						openSnapshot(open,false,onComplete(callback));
					}
				});
			}
		} else {
			loading = false;
			onComplete(callback);
		}
	}
	
	/**
	 * Sets the maximum number of allowed snapshots and updates the UI
	 * 
	 * @param num Integer for the max number of snapshots
	 */
	function setMax(num){
		max = num;
		$('#maxSnaps').text(num); // update snapnumber_dialog with new snapshot maximum value	
	}
	
	/**
	 * Sets the minimum number of allowed snapshots and updates the UI
	 * 
	 * @param num Integer for the min number of snapshots
	 */
	function setMin(num){
		min = num;
		
		// if there are less snapshots than new minimum value, add new snapshots to match it
		if(content.length < num){
			loading = true;
			var deficit = num - content.length;
			for(var i=0; i<deficit; i++){
				newSnapshot(true);
			}
			loading = false;
		}
	}
	
	function createThumb(svgString){
		var res = svgCanvas.getResolution();
		var multiplier = 150/res.w;
		var snapHeight = res.h * multiplier;
		var snapWidth = 150;
		var text = svgString.replace('<svg width="' + res.w + '" height="' + res.h + '"', '<svg width="' + snapWidth + '" height="' + snapHeight + '"');
		text = text.replace(/<g>/gi,'<g transform="scale(' + multiplier + ')">');
		return text2xml(text);
	}
	
	/**
	 * Adds a new snapshot/frame to the snapshots panel
	 * 
	 * @param svgString String
	 * @param num Integer
	 * @param id Integer
	 * @param pulsate Boolean
	 * @param callback Function (optional)
	 */
	function addSnapshot(svgString,num,id,pulsate,callback) {
		var pulse = false;
		if(pulsate){
			pulse = pulsate;
		}
		var snapNum = num*1 + 1;
		
		var holder = $('#snapHolder > .snap').clone();
		$('.snap_wrapper',holder).attr('id', 'snap' + id);
		$('.snap_num > span',holder).text(snapNum);
		$("#snap_images").append(holder);
		
		var thumb = createThumb(svgString); // create snapshot thumb
		var $snap = $("#snap_images .snap:eq(" + num + ")");
		bindSnapshot($snap); // Bind snap thumbnail to click function that opens corresponding snapshot
		document.getElementsByClassName("snap_wrapper")[num].appendChild(document.importNode(thumb.documentElement, true)); // add snapshot thumb to snapshots panel
		var container = $('#snap_images');
		container.animate({
			scrollTop: $snap.offset().top - container.offset().top + container.scrollTop() - 5
		}, 250);
		if(pulse){
			$snap.effect("pulsate", { times:1 }, 800);
		}
		if(callback){
			callback();
		}
		if(!loading){
			api.changed();
		}
	}
	
	// create a new snapshot
	function newSnapshot(pulsate,callback) {
		var pulse = true;
		if(pulsate){
			pulse = pulsate;
		}
		var svg = svgCanvas.getSvgString();
		var id = total;
		var newSnap = new Snapshot(svg,id);
		content.push(newSnap);
		var num = content.length-1;
		total = id*1 + 1;
		opened = id;
		addSnapshot(svg,num,id,pulse,function(){
			snapCheck();
			if(callback){
				callback();
			}
		});
	}
	
	function updateSnapshot(index){
		// re-create snapshot thumb
		var svgString = svgCanvas.getSvgString();
		content[index].svg = svgString;
		var thumb = createThumb(svgString);
		var $currWrapper;
		$('#snap_images .snap_wrapper').each(function(i){
			var current = $(this).attr('id');
			current = parseInt(current.replace('snap','') ,10);
			if(current === opened){
				$currWrapper = $(this);
			}
		});
		
		$currWrapper.html(''); // clear out exisitng thumbnail
		$currWrapper.append(document.importNode(thumb.documentElement, true)); // update with new snapshot thumbnail
		
		api.changed(); // call content changed listener
	}
	
	// Open a snapshot as current drawing
	function openSnapshot(index,pulsate,callback) {
		$('#svgcanvas').stop(true,true); // stop and remove any currently running animations
		var svg = content[index].svg;
		svgCanvas.setSvgString(svg);
		var container = $('#snap_images'),
	    	scrollTo = $("div.snap:eq(" + index + ")",container);
		container.animate({
			scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - 5
		}, 250);
		$('#fit_to_canvas').mouseup(); // fit drawing canvas to workarea
		if (pulsate){
			$('#svgcanvas').effect("pulsate", {times: '0'}, 700); // pulsate new canvas
		}
		selected = index;
		opened = content[index].id;
		if(playback !== 'pause'){
			updateSnapClass(index);
		} else {
			snapCheck();
		}
		selecting = false;
		loading = false;
		if(!loading && playback === 'pause'){
			api.changed(); // call content changed listener
		}
		if(callback){
			callback();
		}
		//resetUndoStack(); // reset the undo/redo stack - not sure why this isn't resetting correctly
		svgCanvas.undoMgr.undoStack = [];
		svgCanvas.undoMgr.undoStackPointer = 0;
		$("#tool_undo").addClass("tool_button_disabled").addClass("disabled");
	}
	
	function snapCheck(){
		for (var i=0; i<content.length; i++){
			if(content[i].id === opened){
				selected = i;
				break;
			}
			else {
				selected = -1;
			}
		}
		updateSnapClass(selected);
	}
	
	function toggleSidePanel(close){
		var SIDEPANEL_OPENWIDTH = 202;
		var w = parseInt($('#sidepanels').css('width'), 10);
		var deltax = (w > 2 || close ? 2 : SIDEPANEL_OPENWIDTH) - w;
		var sidepanels = $('#sidepanels');
		var layerpanel = $('#layerpanel');
		var workarea = $('#workarea');
		workarea.css('right', parseInt(workarea.css('right'), 10)+deltax);
		sidepanels.css('width', parseInt(sidepanels.css('width'), 10)+deltax);
		layerpanel.css('width', parseInt(layerpanel.css('width'), 10)+deltax);
		if(w > 2 || close){
			$('#snapshotpanel').hide();
			$('#layerpanel').show();
			$('#sidepanel_handle').show();
		} else {
			$('#snapshotpanel').show();
			$('#layerpanel').hide();
			$('#sidepanel_handle').hide();
			// scroll to currently selected snapshot
			if(selected > -1){
				var container = $('#snap_images'),
			    	scrollTo = $("div.snap:eq(" + selected + ")", container);
				container.animate({
					scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - 5
				}, 250);
			}
		}
		
		$('#fit_to_canvas').mouseup(); // wise4: resize canvas to fit workarea
	}
	
	function updateNumbers(){
		$("#snap_images .snap_num > span").each(function(index){
			var num = "" + (index*1 + 1);
			$(this).text(num);
		});
	}
	
	function checkMax() {
		if(content.length >= max) {
			$('#snapnumber_dialog').dialog('open');
			return;
		}
		newSnapshot();
	}
	
	function changeSpeed(value){
		var speed = 1000/value;
		$('#speed').text(value); // update speed display
		if(playback !== 'pause'){ // if in playback mode, change current playback speed
			$("#svgcanvas").stopTime('play');
			if(playback === 'play'){
				snapPlayback('play',speed);
			} else if (playback === 'loop'){
				snapPlayback('loop',speed);
			}
			
		}
	}
	
	function snapPlayback(mode,speed){
		var index = 0;
		if(selected > -1){
			for (var i=0; i<content.length; i++) {
				if (content[i].id === opened) {
					index = i*1+1;
				}
			}
			if (index > content.length - 1) {
				index = 0;
			}
		}
		if (mode==='play' || mode==='loop'){
			if(mode==='play'){
				playback = 'play';
			} else {
				playback = 'loop';
			}
			$('#snap_images .snap').off('click'); // unbind snap click function
			$('#snap_images .snap_delete').off('click'); // unbind delete click function
			$('#snap_images').sortable('disable');
			$('#snap_play').hide();
			$('#snap_loop').hide();
			$('#snapshot_tools').slideUp(250);
			$('#snap_images').animate({ top: '4px' }, 250);
			$('#snap_pause').show();
			$("#svgcanvas").everyTime(speed,'play',function(){
				openSnapshot(index,false);
				index = index+1;
				if(index > content.length-1){
					if(mode==="loop"){
						index = 0;
					} else {
						snapPlayback("pause",speed);
					}
					
				}
			},0);
		} else if (mode==="pause") {
			$('#snap_images').stop(true, false);
			$("#svgcanvas").stopTime('play');
			playback = 'pause';
			snapCheck();
			$('#snap_pause').hide();
			$('#snap_play').show();
			$('#snap_loop').show();
			$('#snap_images').animate({ top: '32px' }, 250);
			$('#snapshot_tools').slideDown(250);
			setTimeout(function(){
				$('#snap_images .snap').on('click', function(){ snapClick(this); }); // rebind snap click function
				$('#snap_images .snap_delete').on('click', function(){ deleteClick(this); }); // rebind delete click function
				$('#snap_images').sortable('enable');
				selected = $('.snap.active').index();
				openSnapshot(selected,false);
				//opened = $('.snap.active > .snap_wrapper').attr('id').replace('snap','');
				//api.changed();
			}, 300);
		}
	}
	
	// Bind snapshot thumbnail to click function that opens corresponding snapshot, delete function, hover function, sorting function
	function bindSnapshot(item) {
		$(item).on('click', function(){snapClick(this);});
		
		$(item).hover(
			function () {
				if (!$(this).hasClass("active")){
					$(this).addClass('hover');
				}
			}, 
			function () {
				if (!$(this).hasClass("active")){
					$(this).removeClass('hover');
				}
			}
		);
		
		$(item).children(".snap_delete").on('click', function(){deleteClick(this);});
		
		$("#snap_images").sortable('refresh'); // update sortable list of snap images with new item
	}

	function deleteClick(item){
		$(item).parent().off("click");
		var i = $("#snap_images .snap_delete").index(item);
		selected = i;
		$("#deletesnap_dialog").dialog('open');
	}

	function snapClick(item){
		active = item;
		selecting = true;
		selected = $("#snap_images .snap").index(item);
		openSnapshot(selected,true);
	}
	
	function updateSnapClass(num){
		$("#snap_images .snap").each(function(i){
			if(i !== num){
				$(this).removeClass("hover active");
			} else {
				$(this).addClass("hover active");
			}
			
			if(min > 0){
				// hide delete links when number of snapshots equals minimum allowed
				if(content.length > min){
					$(this).children(".snap_delete").show();
				} else {
					$(this).children(".snap_delete").hide();
				}
			}
		});
	}
	
	// from svg-edit code (svgcanvas.js), converts text to xml (svg xml)
	// found this function http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f
	function text2xml(sXML) {
		// NOTE: I'd like to use jQuery for this, but jQuery makes all tags uppercase
		//return $(xml)[0];
		var out;
		try{
			var dXML = ($.browser.msie)?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();
			dXML.async = false;
		} catch(e){ 
			throw new Error("XML Parser could not be instantiated"); 
		}
		try{
			if($.browser.msie) out = (dXML.loadXML(sXML))?dXML:false;
			else out = dXML.parseFromString(sXML, "text/xml");
		}
		catch(e){ throw new Error("Error parsing XML string"); }
		return out;
	}
	
	function setupDisplay(){
		// setup extension sidepanel
		var paneltxt = '<div id="snapshotpanel"><div id="snapshot_header"><h3>Frames</h3>' +
			'<a id="close_snapshots" title="Close">X</a></div>' +
			'<div id="play_controls"><div id="playback">' +
			'<img id="snap_loop" data-mode="loop" class="snap_controls" src="extensions/loop.png" alt="loop" title="Play (Loop)" />' +
			'<img id="snap_play" data-mode="play" class="snap_controls" src="extensions/play.png" alt="play" title="Play (Once)" />' +
			'<img id="snap_pause" data-mode="pause" class="snap_controls" src="extensions/pause.png" alt="pause" title="Pause" />' +
			'<div id="current_speed"><span id="speed"></span><span id="speed_units">/sec</span></div><div id="play_speed" title="Playback Speed"></div>' +
			'<!-- <div id="snap_browse">' +
			'<img id="next" class="snap_controls" src="extensions/previous.png" alt="back" title="Back" />' +
			'<img id="previous" class="snap_controls" src="extensions/next.png" alt="forward" title="Forward" />' +
			'</div> hide forward/back buttons for now, TODO: see whether users want them --></div></div>' +
			'<div id="snapshots"><div id="snapshot_tools">' +
			'<div id="new_snapshot" title="Add New Frame"><img class="snapshot_new" src="extensions/camera.svg" alt="camera" />' +
			'<a class="label snapshot_new">New Frame +</a><hr /></div></div><div id="snap_images"></div></div>';
		
		// add snapshots panel to page
		$('#sidepanels').append(paneltxt);
		
		// add template snapshot holder to page
		var snapHolder = '<div id="snapHolder" style="display:none;">' +
			'<div class="snap" title="Click to Open; Click and Drag to Reorder">' +
			'<div class="snap_wrapper"></div>' + 
			'<div class="snap_delete" title="Delete Frame"><span>X</span></div>' +
			'<div class="snap_num"><span></span></div>' +
			'</div></div>';
		$('#svg_editor').append(snapHolder);
		
		// setup snapshot panel toggle link
		var linktext = '<div id="tool_snapshot" class="extension_link" title="Show/Hide Frames">' +
			'<a class="label tool_snapshot">Frames (Snapshots)</a>' +
			'<img class="tool_snapshot" src="extensions/snapshot.png" ' + // image path edited for wise4
			'alt="icon" />' +
			'</div>';
		
		// add toggle link to page
		$('#tools_top').append(linktext);
		
		// bind toggle links click action
		$('#tool_snapshot, #close_snapshots').on('click', function(){
			toggleSidePanel();
		});
		
		// set snap image sorting events
		$("#snap_images").sortable({
			start: function(event, ui) {
				active = $("#snap_images .snap").index(ui.item);
				ui.item.off("click"); // unbind click function
				$("#svgcanvas").stopTime('play'); // stop snap playback
				$('#snap_images .snap').css('cursor','move');
			},
			stop: function(event, ui) {
				setTimeout(function(){
					ui.item.on('click', function(){snapClick(this);}); // rebind click function
				}, 300);
				$('#snap_images .snap').css('cursor','pointer');
			},
			update: function(event, ui) {
				var newIndex = $("#snap_images .snap").index(ui.item);
				// reorder snapshots array
				var current = content.splice(active,1);
				content.splice(newIndex,0,current[0]);
				api.changed(); // call content changed listener
				setTimeout(function(){
					updateNumbers();  // reorder snapshot thumbnail labels
				},400);
			},
			opacity: 0.6,
			placeholder: 'placeholder'
		});
		
		// setup dialogs elements
		var dialogtxt = '<div id="deletesnap_dialog" title="Delete Frame">' + 
			'<div class="ui-state-error"><span class="ui-icon ui-icon-alert" style="float:left"></span>' +
			'<span id="deletesnap_warning">Warning! This operation is permanent.</span></div>' +
			'<p id="deletesnap_instructions">Are you sure you want to delete this frame for good?</p></div>' +
			'<div id="overlay"></div>' + 
			'<div id="snapnumber_dialog" title="Too Many Frames"><div class="ui-state-error">' +
			'<span class="ui-icon ui-icon-alert" style="float:left"></span>' +
			'<span id="snapnumber_warning">Sorry! You are only allowed <span id="maxSnaps">' + max + '</span> frames.</span></div>' +
			'<p id="snapnumber_instructions">If you want to create another one, please delete one of your current frames by clicking on the \'X\' in the upper right corner of the snapshot you want to delete. Thank you!' +
			'</p></div>';
		
		// add dialog elements to page
		$('#svg_editor').append(dialogtxt);
		
		// initialize dialog alerting user that maximum number of snapshots has been reached
		$('#snapnumber_dialog').dialog({
			resizable: false,
			modal: true,
			autoOpen:false,
			width:550,
			buttons: [
				{
					id: 'snapnumber_confirm',
					text: 'OK',
					click: function() {
						$(this).dialog('close');
					}
				}
			]
		});
		
		// initialize confirmation dialog for deleting a snapshot
		$('#deletesnap_dialog').dialog({
			resizable: false,
			modal: true,
			autoOpen:false,
			width:400,
			buttons: [
			    {
			    	id: 'deletesnap_confirm',
			    	text: 'Yes',
			    	click: function() {
			    		// process delete request
			    		var index = selected;
			    		if ($("#snap_images .snap:eq(" + selected + ")").hasClass("hover")) {
							selected = -1;
						}
						content.splice(index,1);
						$("#snap_images .snap:eq(" + index + ")").fadeOut(1000, function(){
							$(this).remove();
							snapCheck();
							updateNumbers();
							if (min > -1 && selected < 0 && content.length > 0){
								if(content.length > 1){
									var i = index > 0 ? index-1 : 0;
									openSnapshot(i,false);
								} else {
									openSnapshot(0,false);
								}
							} else {
								opened = -1;
								api.changed(); // call content changed listener
							}
						});
						$(this).dialog('close');
			    	}
			    },
			    {
			    	id: 'deletesnap_cancel',
			    	text: 'Cancel',
			    	click: function() {
			    		$(this).dialog('close');
			    	}
			    }
			]
		});
		
		// initialize playback speed slider
		$('#play_speed').slider({
			max: 10,
			min: 1,
			step: 1,
			value: 1,
			slide: function(event, ui) {
				changeSpeed(ui.value);
			}
		});
		
		changeSpeed($('#play_speed').slider('value')); // set initial playback speed
		
		// Bind snapshot playback controls
		$('img.snap_controls').click(function(){
			var mode = $(this).data('mode');
			var speed = 1000/$('#play_speed').slider('value');
			snapPlayback(mode,speed);
		});
		
		//$(".extension_link").off("mouseup");
		
		// bind new snapshot link click action
		$('#new_snapshot').on('click', function(){
			checkMax();
		});
		
		api.content(content); // set initial snapshots
	}
	
	return {
		name: "Snapshots",
		callback: function() {
			setupDisplay();
		},
		elementChanged: function() {
			// update current snapshot with edits
			if(!loading && !selecting && playback === 'pause'){
				for (var i=0; i<content.length; i++){
					if(content[i].id === opened){
						updateSnapshot(i);
					}
				}
			}
		}
	};
});
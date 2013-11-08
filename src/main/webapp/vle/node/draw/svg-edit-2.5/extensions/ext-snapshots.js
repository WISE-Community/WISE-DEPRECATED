/*
 * ext-snapshots.js
 *
 * Licensed under the Apache License, Version 2
 *
 * Copyright(c) 2010 Jonathan Breitbart
 *
 * Adds a snapshot tool to svg-edit, which allows users to take "snapshots" (copies)
 * of their drawings and save them to a sidepanel. Clicking on a snapshot thumbnail
 * opens that snapshot in the main drawing window.
 * Snapshots can be re-ordered via drag-and-drop.
 * The snapshots sidepanel also includes playback controls that can be used to
 * play through the snapshots in a flip-book like manner, at varying speeds.
 * JQuery Timers (http://plugins.jquery.com/project/timers) plugin must be included in the svg-editor.html header
 * JQuery UI with dialogs and sliders plus accompanying css also required
 * TODO: Add max snap number setter, i18n, include required js/css in the plugin?
 */
var snapsLoaded = false; // wise4 var to indicate when extension has finished loading
 
svgEditor.addExtension("Snapshots", function(S) {
	
	svgEditor.snapshots = [];
	svgEditor.snapTotal = 0;
	svgEditor.maxSnaps = 10; // set max number of allowable snapshots (10 is default)
	svgEditor.warningStackSize = 0;
	svgEditor.active = null;
	svgEditor.index = 0;
	svgEditor.selected = null;
	svgEditor.warning = false;
	svgEditor.playback = 'pause';
	svgEditor.initSnap = false;  // boolean to identify whether we are in snapshot loading/click mode
	svgEditor.zeroSnapsAllowed = false; // boolean to indicate whether we allow zero snapshots (and a canvas state where no snapshots are selected)
	
	var getUndoStackSize = svgCanvas.getUndoStackSize,
		resetUndoStack = svgCanvas.getPrivateMethods().resetUndoStack; //getPrivateMethods is being deprecated, change when we next update
	
	var extPath = '/vlewrapper/vle/node/draw/svg-edit/extensions/'; // extensions directory path (wise4)
	
	function Snapshot(svg, id, description){
		this.svg = svg;
		this.id = id;
		if(description)	{
			this.description = description;
		} else {
			this.description = '';
		}
	};
	
	function setupPanel(){
		var paneltxt = '<div id="snapshotpanel"><div id="snapshot_header"><h3>Frames</h3>' +
			'<a id="close_snapshots" title="Close">X</a></div>' +
			'<div id="play_controls" style="display:none;"><div id="playback">' +
			'<img id="loop" class="snap_controls" src="'+extPath+'loop.png" alt="loop" title="Play (Loop)" />' +
			'<img id="play" class="snap_controls" src="'+extPath+'play.png" alt="play" title="Play (Once)" />' +
			'<img id="pause" class="snap_controls" src="'+extPath+'pause.png" alt="pause" title="Pause" />' +
			'<div id="current_speed"></div><div id="play_speed" title="Playback Speed"></div>' +
			'<!-- <div id="snap_browse">' +
			'<img id="next" class="snap_controls" src="'+extPath+'previous.png" alt="back" title="Back" />' +
			'<img id="previous" class="snap_controls" src="'+extPath+'next.png" alt="forward" title="Forward" />' +
			'</div> hide forward/back buttons for now, TODO: see whether users want them --></div></div>' +
			'<div id="snapshots"><div id="snapshot_tools">' +
			'<img class="snapshot_new" src="'+extPath+'camera.png" alt="camera" title="Add New Frame" />' +
			'<a class="label snapshot_new" title="Add a new frame">Add New Frame</a><hr /></div><div id="snap_images"></div></div></div>';
		
		$('#sidepanels').append(paneltxt);
		
		addLink();
	};
	
	svgEditor.toggleSidePanel = function(close){
		var SIDEPANEL_OPENWIDTH = 205;
		var w = parseInt($('#sidepanels').css('width'));
		var deltax = (w > 2 || close ? 2 : SIDEPANEL_OPENWIDTH) - w;
		var sidepanels = $('#sidepanels');
		var layerpanel = $('#layerpanel');
		workarea.css('right', parseInt(workarea.css('right'))+deltax);
		sidepanels.css('width', parseInt(sidepanels.css('width'))+deltax);
		layerpanel.css('width', parseInt(layerpanel.css('width'))+deltax);
		svgEditor.resizeCanvas();
	};
	
	function addLink(){
		var linktext = '<div id="tool_snapshot" class="extension_link">' +
			'<a class="label tool_snapshot" title="Show/Hide Frames">Frames (Snapshots)</a>' +
			'<img class="tool_snapshot" src="'+extPath+'snapshot.png" ' + // image path edited for wise4
			'title="Show Frames" alt="icon" />' +
			'</div>';
		
		$('#tools_top').append(linktext);
		
		$('.tool_snapshot, #close_snapshots').click(function(){
			svgEditor.toggleSidePanel();
		});
		
		addDialogs();
	};
	
	function addDialogs(){
		var dialogtxt = //'<div id="new_snap_dialog" title="New Snapshot" style="display:none;">' +
			//'<div class="ui-dialog-content-content">Create new snapshot from current drawing?</div></div>' +
			/*'<div id="snapwarning_dialog" title="Open Snapshot" style="display:none;">' +
			'<div class="ui-state-error"><span class="ui-icon ui-icon-alert" style="float:left"></span>' +
			'Warning! Opening this snapshot will delete your current drawing.</div>' +
			'<div class="ui-dialog-content-content">If you would like to save this drawing, click \'Cancel\' and create a new snapshot.' +
			'<br /><br />Otherwise, click \'Continue\'.</div</div>' +*/
			'<div id="deletesnap_dialog" title="Delete Frame">' + 
			'<div class="ui-state-error"><span class="ui-icon ui-icon-alert" style="float:left"></span>' +
			'Warning! This operation is permanent.</div>' +
			'<div class="ui-dialog-content-content">Are you sure you want to delete this frame for good?</div></div>' +
			'<div id="overlay"></div>' + 
			'<div id="snapnumber_dialog" title="Too Many Frames"><div class="ui-state-error">' +
			'<span id="snapnum_warning" class="ui-icon ui-icon-alert" style="float:left"></span>' +
			'Sorry! You are only allowed <span id="maxSnaps">' + svgEditor.maxSnaps + '</span> frames.</div>' +
			'<div class="ui-dialog-content-content">If you want to create another one, please delete one of your current frames by clicking on the \'X\' in the upper right corner of the snapshot you want to delete. Thank you!' +
			'</div></div>';
		
		$('#svg_editor').append(dialogtxt);
		
		/*$('#new_snap_dialog').dialog({
			bgiframe: true,
			resizable: false,
			modal: true,
			autoOpen:false,
			buttons: {
				'Yes': function() {
					newSnapshot();
					$(this).dialog('close');
				},
				Cancel: function() {
					$(this).dialog('close');
				}
			}
		});*/
		
		$('#snapwarning_dialog').dialog({
			bgiframe: true,
			resizable: false,
			modal: true,
			autoOpen:false,
			width:550,
			buttons: {
				'Continue': function() {
					svgEditor.openSnapshot(svgEditor.index,true);
					$(this).dialog('close');
				},
				Cancel: function() {
					$(this).dialog('close');
				}
			}
		});
		
		$('#snapnumber_dialog').dialog({
			bgiframe: true,
			resizable: false,
			modal: true,
			autoOpen:false,
			width:550,
			buttons: {
				'OK': function() {
					$(this).dialog('close');
				}
			}
		});
		
		$('#deletesnap_dialog').dialog({
			bgiframe: true,
			resizable: false,
			modal: true,
			autoOpen:false,
			width:350,
			buttons: {
				'Yes': function() {
					if ($(".snap:eq(" + svgEditor.index + ")").hasClass("hover")) {
						svgEditor.snapWarning = true;
						svgEditor.selected = false;
					}
					svgEditor.snapshots.splice(svgEditor.index,1);
					$(".snap:eq(" + svgEditor.index + ")").fadeOut(1000, function(){$(this).remove()});
					$(this).dialog('close');
					svgEditor.changed = true;
					var index = svgEditor.index;
					setTimeout(function(){
						svgEditor.snapCheck();
						updateNumbers();
						if (!svgEditor.zeroSnapsAllowed && svgEditor.selected == false){
							if(svgEditor.snapshots.length > 1){
								svgEditor.openSnapshot(index,false);
							} else {
								svgEditor.openSnapshot(0,false);
							}
						}
						if(svgEditor.snapshots.length < 2){ // hide playback controls if less than 2 snapshots remain
							$('#snapshots').css('top','26px');
							$('#play_controls').hide();
						}
			    	},1100);
				},
				Cancel: function() {
					$(this).dialog('close');
					/*svgEditor.snapCheck();
					$(".snap:eq(" + svgEditor.index + ")").click(function(){snapClick(this);}, 300);*/
				}
			}
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
		
		changeSpeed($('#play_speed').slider('value')); // update playback speed
		
		// Bind snapshot playback controls
		$('img.snap_controls').click(function(){
			var mode = $(this).attr('id');
			var speed = 1000/$('#play_speed').slider('value');
			snapPlayback(mode,speed);
		});
		
		svgEditor.warningStackSize = 0; // set warning stack checker to 0 on intial load
		
		$(".extension_link").unbind("mouseup");
		
		$('.snapshot_new').click(function(){
			//$('#new_snap_dialog').dialog('open');
			checkSnapshots();
		});
		if(svgEditor.snapshots.length > 0){
			svgEditor.initSnap = true;
			svgEditor.loadSnapshots(svgEditor.snapshots);
			svgEditor.initSnap = false;
		} else {  // TODO: fix this (currently I'm adding the new snapshot in svgdraw.js as a work-around)
			if (!svgEditor.zeroSnapsAllowed){
				svgEditor.initSnap = true;
				newSnapshot(false); // create an initial default snapshot
				svgEditor.initSnap = false;
			}
			setTimeout(function(){
				snapsLoaded = true;
			},1000);
		}
	};
	
	function newSnapshot(pulsate) {
		var pulse = true;
		if(pulsate != null){
			pulse = pulsate;
		}
		var current = svgCanvas.getSvgString();
		var id = svgEditor.snapTotal;
		var newSnap = new Snapshot(current,svgEditor.snapTotal);
		svgEditor.snapshots.push(newSnap);
		svgEditor.snapTotal = id*1 + 1;
		var num = svgEditor.snapshots.length-1;
		svgEditor.warningStackSize = getUndoStackSize();
		svgEditor.active = id;
		svgEditor.index = num;
		svgEditor.selected = true;
		svgEditor.snapWarning = false;
		svgEditor.addSnapshot(current,num,id,pulse);
		setTimeout(function(){
			svgEditor.snapCheck();
		},100);
		svgEditor.changed = true;
	};
	
	svgEditor.addSnapshot = function(svgString,num,id,pulsate) {
		var pulse = true;
		if(pulsate != null){
			pulse = pulsate;
		}
		svgEditor.warningStackSize = getUndoStackSize();
		var res = svgCanvas.getResolution();
		var multiplier = 150/res.w;
		var snapHeight = res.h * multiplier;
		var snapWidth = 150;
		var snapNum = num*1 + 1;
		var snapHolder = '<div class="snap" title="Click to Open; Click and Drag to Reorder">' +
			'<div class="snap_wrapper" id="snap' + id + '"></div>' + 
			'<div class="snap_delete" title="Delete Frame"><span>X</span></div>' +
			'<div class="snap_num"><span>' + snapNum + '</span></div>' +
			'</div>';
		$("#snap_images").append(snapHolder);
		
		// create snapshot thumb
		// TODO: remove hard-coded width and height (600, 450)
		var snapshot = svgString.replace('<svg width="600" height="450"', '<svg width="' + snapWidth + '" height="' + snapHeight + '"');
		snapshot = snapshot.replace(/<g>/gi,'<g transform="scale(' + multiplier + ')">');
		var snapSvgXml = text2xml(snapshot);
		var $snap = $("div.snap:eq(" + num + ")");
		bindSnapshot($snap); // Bind snap thumbnail to click function that opens corresponding snapshot
		document.getElementsByClassName("snap_wrapper")[num].appendChild(document.importNode(snapSvgXml.documentElement, true)); // add snapshot thumb to snapshots panel
		$("#snap_images").attr({ scrollTop: $("#snap_images").attr("scrollHeight") });
		if(pulse){
			$(".snap:eq(" + num + ")").effect("pulsate", { times:1 }, 800);
		}
		if(svgEditor.snapshots.length > 1){
			$('#snapshots').css('top','52px');
			$('#play_controls').show();
		}
	};
	
	function updateSnapshot(index){
		// re-create snapshot thumb
		var svgString = svgCanvas.getSvgString();
		svgEditor.snapshots[index].svg = svgString;
		var res = svgCanvas.getResolution();
		var multiplier = 150/res.w;
		var snapHeight = res.h * multiplier;
		var snapWidth = 150;
		// TODO: remove hard-coded width and height (600, 450)
		var snapshot = svgString.replace('<svg width="600" height="450"', '<svg width="' + snapWidth + '" height="' + snapHeight + '"');
		snapshot = snapshot.replace(/<g>/gi,'<g transform="scale(' + multiplier + ')">');
		var snapSvgXml = text2xml(snapshot);
		var $currWrapper;
		$('.snap_wrapper').each(function(i){
			var current = $(this).attr('id');
			current = current.replace('snap','');
			if(current == svgEditor.active){
				$currWrapper = $(this);
			}
		});
		//var $currWrapper = document.getElementsByClassName("snap_wrapper")[num];
		$currWrapper.html(''); // clear out exisitng thumbnail
		$currWrapper.append(document.importNode(snapSvgXml.documentElement, true)); // update with new snapshot thumbnail
	};
	
	// Open a snapshot as current drawing
	svgEditor.openSnapshot = function(index,pulsate) {
		if(pulsate){
			pulse = pulsate;
		} else {
			pulse = false;
		}
		$('#svgcanvas').stop(true,true); // stop and remove any currently running animations
		var snap = svgEditor.snapshots[index].svg;
		svgCanvas.setSvgString(snap);
		
		svgEditor.resizeCanvas(); // fit drawing canvas to workarea

		resetUndoStack(); // reset the undo/redo stack
		svgEditor.warningStackSize = 0;
		$("#tool_undo").addClass("tool_button_disabled").addClass("disabled");
		if (pulse==true){
			$('#svgcanvas').effect("pulsate", {times: '1'}, 700); // pulsate new canvas
		}
		svgEditor.selected = true;
		svgEditor.index = index;
		svgEditor.active = svgEditor.snapshots[index].id;
		svgEditor.updateClass(index);
		svgEditor.snapCheck();
		svgEditor.snapWarning = false;
		svgEditor.initSnap = false;
	};
	
	svgEditor.snapCheck = function(){
		if(svgEditor.playback == "pause"){
			//if(svgEditor.warningStackSize == getUndoStackSize()){
				for (var i=0; i<svgEditor.snapshots.length; i++){
					if(svgEditor.snapshots[i].id == svgEditor.active){
						svgEditor.index = i;
						break;
					}
					else {
						svgEditor.index = -1;
					}
				}
				svgEditor.selected = true;
				svgEditor.updateClass(svgEditor.index);
			//} else {
				//svgEditor.selected = false;
				//svgEditor.updateClass(-1);
			//}
		}
	};
	
	function updateNumbers(){
		$(".snap_num > span").each(function(index){
			var num = "" + (index*1 + 1);
			$(this).text(num);
		});
	};
	
	function checkSnapshots() {
		if (svgEditor.snapshots.length >= svgEditor.maxSnaps) {
			$('#snapnumber_dialog').dialog('open');
			return;
		}
		//$('#new_snap_dialog').dialog('open');
		newSnapshot();
	};
	
	function changeSpeed(value){
		var speed = 1000/value;
		var label;
		if (value == 1){
			label = value + " snap/sec";
		} else {
			label = value + " snaps/sec";
		}
		$('#current_speed').text(label); // update speed display
		if(svgEditor.playback != 'pause'){ // if in playback mode, change current playback speed
			$("#svgcanvas").stopTime('play');
			if(svgEditor.playback=='play'){
				snapPlayback('play',speed);
			} else if (svgEditor.playback=='loop'){
				snapPlayback('loop',speed);
			}
			
		}
	};
	
	function snapPlayback(mode,speed){
		var index = 0;
		if(svgEditor.selected == true){
			for (var i=0; i<svgEditor.snapshots.length; i++) {
				if (svgEditor.snapshots[i].id == svgEditor.active) {
					index = i*1+1;
				}
			}
			if (index > svgEditor.snapshots.length - 1) {
				index = 0;
			}
		}
		if (mode=='play' || mode=='loop'){
			if(mode=='play'){
				svgEditor.playback = 'play';
			} else {
				svgEditor.playback = 'loop';
			}
			$('.snap').unbind('click'); // unbind snap click function
			$('.snap_delete').unbind('click'); // unbind delete click function
			$('#snap_images').sortable('disable');
			$('#play').hide();
			$('#loop').hide();
			$('#snapshot_tools').hide();
			$('#pause').attr("style","display:inline !important");
			$("#svgcanvas").everyTime(speed,'play',function(){
				svgEditor.openSnapshot(index,false);
				var page = Math.floor(index/3);
				$("#snap_images").attr({ scrollTop: page * 375 }); //TODO: Replace hard-coded page height
				index = index+1;
				if(index > svgEditor.snapshots.length-1){
					if(mode=="loop"){
						index = 0;
					} else {
						snapPlayback("pause",speed);
					}
					
				}
			},0);
		} else if (mode=="pause") {
			$("#svgcanvas").stopTime('play');
			svgEditor.playback = 'pause';
			svgEditor.snapCheck();
			$('#pause').attr("style","display:none !important");
			$('#play').attr("style","display:inline");
			$('#loop').attr("style","display:inline");
			$('#snapshot_tools').show();
			setTimeout(function(){
	        	$('.snap').click(function(){snapClick(this);}); // rebind snap click function
	        	$('.snap_delete').click(function(){deleteClick(this);}); // rebind delete click function
	        	$('#snap_images').sortable('enable');
	        }, 300);
		}
	};
	
	// Bind snapshot thumbnail to click function that opens corresponding snapshot, delete function, hover function, sorting function
	function bindSnapshot(item) {
		$(item).click(function(){snapClick(this);});
		
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
		
		$(item).children(".snap_delete").click(function(){deleteClick(this);});
		
		// TODO: Make this sortable binder initiate only once (after first snapshot has been saved)
		$("#snap_images").sortable({
			start: function(event, ui) {
				svgEditor.index = $(".snap").index(ui.item);
				ui.item.unbind("click"); // unbind click function
				$("#svgcanvas").stopTime('play'); // stop snap playback
				$('.snap').css('cursor','move');
		    },
		    stop: function(event, ui) {
		        setTimeout(function(){
		        	ui.item.click(function(){snapClick(this);}); // rebind click function
		        }, 300);
		        $('.snap').css('cursor','pointer');
		    },
		    update: function(event, ui) {
		    	var newIndex = $(".snap").index(ui.item);
		    	// reorder snapshots array
		    	var current = svgEditor.snapshots.splice(svgEditor.index,1);
		    	svgEditor.snapshots.splice(newIndex,0,current[0]);
		    	svgEditor.changed = true;
		    	setTimeout(function(){
		    		//svgEditor.active = svgEditor.snapshots[newIndex].id;
		    		updateNumbers();  // reorder snapshot thumbnail labels
		    	},400);
		    },
		    opacity: .6,
		    placeholder: 'placeholder'
		});

	};

	function deleteClick(item){
		$(item).parent().unbind("click");
		var i = $(".snap_delete").index(item);
		svgEditor.index = i;
		$("#deletesnap_dialog").dialog('open');
	};

	function snapClick(item){
		svgEditor.initSnap = true;
		svgEditor.index = $("div.snap").index(item);
		if((svgEditor.warningStackSize == getUndoStackSize() && svgEditor.warning == false) || svgEditor.selected == true){
			svgEditor.openSnapshot(svgEditor.index,true);
		} else {
			$('#snapwarning_dialog').dialog("open");
		}
	};
	
	svgEditor.updateClass = function(num){
		$(".snap").each(function(i){
			if(i != num){
				$(this).removeClass("hover active");
			} else {
				$(this).addClass("hover active");
			}
			
			if(!svgEditor.zeroSnapsAllowed){
				// remove delete link if there is only 1 snapshot
				if(svgEditor.snapshots.length > 1){
					$(this).children(".snap_delete").show();
				} else {
					$(this).children(".snap_delete").hide();
				}
			}
		});
	};
	
	svgEditor.loadSnapshots = function(snapshots,callback){
		// clear out any existing snapshots
		$('.snap').remove();
		svgEditor.snapshots = [];
		
		for (var i=0; i<snapshots.length; i++) {
			svgEditor.snapshots.push(snapshots[i]);
			var current = svgEditor.snapshots[i].svg;
			var id = svgEditor.snapshots[i].id;
			svgEditor.addSnapshot(current,i,id,false); // add snap to snapshot panel
		};
		snapsLoaded = true;
		// run optional callback function
		if(callback){
			callback.call();
		}
	};
	
	/**
	 * Sets the maximum number of allowed snapshots
	 * @param num - the max number of snapshots
	 */
	svgEditor.setMaxSnaps = function(num){
		if (svgEditor.maxSnaps != num){
			svgEditor.maxSnaps = num;
			$('#maxSnaps').text(num); // updated checkSnapshots dialog with new snapshot maximum value
		}
			
	};
	
	// from svg-edit code (svgcanvas.js), converts text to xml (svg xml)
	//found this function http://groups.google.com/group/jquery-dev/browse_thread/thread/c6d11387c580a77f
	function text2xml(sXML) {
		// NOTE: I'd like to use jQuery for this, but jQuery makes all tags uppercase
		//return $(xml)[0];
		var out;
		try{
			var dXML = ($.browser.msie)?new ActiveXObject("Microsoft.XMLDOM"):new DOMParser();
			dXML.async = false;
		} catch(e){ 
			throw new Error("XML Parser could not be instantiated"); 
		};
		try{
			if($.browser.msie) out = (dXML.loadXML(sXML))?dXML:false;
			else out = dXML.parseFromString(sXML, "text/xml");
		}
		catch(e){ throw new Error("Error parsing XML string"); };
		return out;
	};
	
	return {
		name: "Snapshots",
		callback: function() {
			//add extension css
			var csspath = extPath+'ext-snapshots.css';
			var fileref=document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", csspath);
			document.getElementsByTagName("head")[0].appendChild(fileref);
			setupPanel();
		},
		elementChanged: function() {
			//svgEditor.snapCheck();
			// update current snapshot with edits
			if(!svgEditor.initSnap && svgEditor.playback == 'pause'){
				for (var i=0; i<svgEditor.snapshots.length; i++){
					if(svgEditor.snapshots[i].id == svgEditor.active){
						updateSnapshot(i);
					}
				}
			}
		}
	};
});
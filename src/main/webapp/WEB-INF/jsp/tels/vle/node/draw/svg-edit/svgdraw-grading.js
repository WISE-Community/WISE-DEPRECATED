function SVGDRAW() {
	this.descriptionActive = false;
	this.snapshotsActive = false;
	this.svgString = '';
	this.description = '';
	this.drawObj = null;
	this.snapObj = null;
	this.instructions = '';
	this.snapshots = [];
	this.snapDescriptions = {};
	this.nodeData = null;
	this.nodeTitle = '';
	this.loadModules(this);
};

SVGDRAW.prototype.loadModules = function(context){
	// load instructions here
	//this.instructions = '';
	
	var contentUrl = window.opener.$('#'+divId+'_contentUrl').text();
	
	$.getJSON(contentUrl, 
		function(data){
			context.nodeData = data;
			if(data.snapshots_active){
				context.snapshotsActive = data.snapshots_active;
			}
			if(data.description_active){
				context.descriptionActive = data.description_active;
			}
			if(data.prompt){
				context.instructions = data.prompt;
			}
			context.init(context);
	});
};

//populate description/annotation text and snapshots
SVGDRAW.prototype.init = function(context) {
	if(svgEditor.ext_snapshots && svgEditor.ext_snapshots.isLoaded() && svgEditor.ext_prompt && svgEditor.ext_prompt.isLoaded() &&
		svgEditor.ext_stamps && svgEditor.ext_stamps.isLoaded() && svgEditor.ext_description && svgEditor.ext_description.isLoaded()){
	
		var promptExt = svgEditor.ext_prompt,
			descriptionExt = svgEditor.ext_description,
			stampsExt = svgEditor.ext_stamps,
			snapshotsExt = svgEditor.ext_snapshots;
		
		context.nodeTitle = window.opener.$('.objectToGradeTd').text();
		var drawObj = window.opener.$('#'+divId);
		var snapObj = window.opener.$('#'+divId+'_snaps');
		
		if(drawObj.length>0){
			context.svgString = xml2Str(drawObj[0].childNodes[0]);
			context.svgString = context.svgString.replace(/<svg.*>/, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:se="http://svg-edit.googlecode.com" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="450">');
			context.svgString = context.svgString.replace(/<g transform="scale(.*)">/gmi,'<g>');
			// load saved drawing
			svgEditor.loadFromString(context.svgString);
			$('#tool_snapshot').remove();
			$('#snapshotpanel').remove();
			descriptionObj = window.opener.$('#'+divId+'_description');
			if(descriptionObj){
				//context.descriptionActive = true;
				context.description = descriptionObj.text();
			}
		} else if(snapObj.length>0){
			//context.snapshotsActive = true;
			var multiplier = 150/600;
			var snapHeight = 450 * multiplier;
			var snapWidth = 150;
			window.opener.$('#'+divId+'_snaps > .snapCell').each(function(index) {
				var current = this.childNodes[0];
				var svg = xml2Str(current);
				svg = svg.replace(/<svg.*>/, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:se="http://svg-edit.googlecode.com" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="450">');
				svg = svg.replace(/<g transform="scale(.*)">/gmi,'<g>');
				var description = window.opener.$('#'+divId+'_snap_'+index+'_description').text();
				var current = new Snapshot(svg,index,description);
				context.snapshots.push(current);
			});
		}
		
		//initiate snapshots
		if(context.snapshotsActive){
			snapshotsExt.max(context.snapshots_max);
			if(context.snapshots.length > 0){
				// load existing snapshots
				snapshotsExt.content(context.snapshots, null, null, function(){
					snapshotsExt.open(context.snapshots[0].id).toggleDisplay(false);
					if(context.descriptionActive){
						descriptionExt.content(context.snapshots[0].description);
						$('#description').show();
					}
				});
			}
		} else {
			// snapshots are disabled, so remove UI elements
			$('#tool_snapshot').remove();
			$('#snapshotpanel').remove();
			svgEditor.loadFromString(context.svgString);
		}
		
		// initialize prompt
		if(context.instructions!=''){
			promptExt.content(context.instructions);
		} else {
			$('#tool_prompt').remove();
		}
		
		// initiate description/annotation
		if(context.descriptionActive){
			if (context.snapshotsActive) { // check whether snapshots are active
				// populate descriptions object
				var numSnaps = context.snapshots.length;
				if (numSnaps > 0){
					i = 0;
					for (i; i<context.snapshots.length; i++) {
						var snap = context.snapshots[i];
						context.snapDescriptions[snap.id] = snap.description;
					}
				}
				
				// hide description display on playback
				$('#snap_loop, #snap_play').on('mouseup', function(){
					$('#description').hide();
					$('#snap_images').css('top','4px');
				});
				// show description display when paused
				$('#snap_pause').on('mouseup', function(){
					$('#description').show();
					$('#snap_images').css('top','4px');
				});
				// update description header text
				$('.description_header_text span.panel_title').text('Frame Description:');
				// set header preview text position
				var left = $('#description .panel_title').width() + 12;
				var right = $('#description .description_buttons').width() + 15;
				$('#description span.minimized').css({'left': left, 'right': right});
			} else {
				descriptionExt.content(context.description);
			}
		} else {
			$('#description').remove();
		}
		
		// setup content changed listener functions
		snapshotsExt.changed = function(){
			if(context.descriptionActive){
				var activeId = snapshotsExt.open();
				if(activeId > -1){
					var snaps = snapshotsExt.content(),
						snapDescriptions = context.snapDescriptions;
					// add descriptions to each snapshot
					var description  = '';
					if(snapDescriptions.hasOwnProperty(activeId)){
						description = snapDescriptions[activeId];
					}
					descriptionExt.content(description);
					$('#description').show();
					// set header preview text position
					var left = $('#description .panel_title').width() + 12;
					var right = $('#description .description_buttons').width() + 15;
					$('#description span.minimized').css({'left': left, 'right': right});
				} else {
					$('#description').hide();
				}
			}
		};
		
		// update teacher view display (editing tools disabled for now)
		//$('#zoom_panel').show().css({'margin':'0','height':'32px'});
		//$('#zoom_panel > .tool_sep').remove();
		$('#history_panel').hide();
		$('#tools_top').css({'height':'30px'});
		$('#tools_left').hide();
		$('#workarea').css({'top':'32px','left':'8px'});
		$('#sidepanels').css('top','32px');
		$('#snapshot_tools').remove();
		$('#snap_images').css('top','4px');
		$('.snap_delete').hide();
		$('#tools_top > div').each(function(){
			if($(this).attr('id') !== 'tool_prompt' && $(this).attr('id') !== 'tool_snapshot'){
				$(this).remove();
			}
		});
		var titleDiv = '<div id="node_title" style="font-size:1.1em; font-weight:bold; left:8px; position:absolute;">Student Work for Step '+context.nodeTitle+'</div>';
		$('#tools_top').prepend(titleDiv);
		$('#snap_images').sortable('disable');
		$('#description_collapse').text('Hide');
		$('#description span.maximized').text('');
		$('#tools_bottom').hide();
		
		setTimeout(function(){
			$('#fit_to_canvas').mouseup();
			$('#loading_overlay').fadeOut();
		},500);
		
	}
	else {
		setTimeout(function(){
			context.init(context);
		},100);
	}
};

function Snapshot(svg, id, description){
	this.svg = svg;
	this.id = id;
	if(description)	{
		this.description = description;
	} else {
		this.description = '';
	}
};

function xml2Str(xmlNode){
  try {
    // Gecko-based browsers, Safari, Opera.
    return (new XMLSerializer()).serializeToString(xmlNode);
  }
  catch (e) {
    try {
      // Internet Explorer.
      return xmlNode.xml;
    }
    catch (e)
    {//Strange Browser ??
     alert('XMLSerializer not supported');
    }
  }
  return false;
};
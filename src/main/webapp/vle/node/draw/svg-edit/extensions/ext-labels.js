/*
 * ext-labels.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2014 Jonathan Lim-Breitbart (http://wise.berkeley.edu)
 * 
 * Creates a label element (which consists of a small circle and a text element connected
 * by a connector line) when user clicks on drawing canvas after activating the tool.
 * Label anchor (the circle) is placed at the location of the mouse click and text element
 * is offset to the top/right by default.
 * Uses portions of and requires ext-connector.js to be enabled to create connector line.
 * 
 * TODO: svg-edit i18n
 *
 */

svgEditor.addExtension('labels', function() {'use strict';
	/* Private variables */
	var canv = svgEditor.canvas,
		getElem = canv.getElem,
		addElem = canv.addSvgElementFromJson,
		getNextId = canv.getNextId,
		curConfig = svgEditor.curConfig,
		selManager = canv.selectorManager,
		conn_sel = "se_connector",
		cur_zoom, x, y,
		anchorId = null, textId = null, lineId = null,
		batchCmd,
		svgroot = canv.getRootElem(),
		elData = $.data,
		loaded = false,
		loading = false,
		color = 'FF0000', // default label color
		textColor = 'FFFFFF', // default text color
		aRadius = 8, // radius of label anchor (TODO: make editable via extension parameter?),
		lText = "A new label", // default label text
		tOffset = 8, // amount to increase edge length of wrapper for label text
		lWidth = 200, // max width of label text
		content = { // content object
			total: 0, // Integer to store total number of labels created (including deleted labels)
			labels: [] // Array (of Label objects) to store saved labels
		},
		currentEl = [],
		current = {}, // Object to hold Label currently being created
		max = Infinity, // Integer indicating maximum allowed labels (Unlimited is default; allowed values are integers > 0)
		min = 0, // Integer indicating minimum allowed labels (0 is default; allowed values are 0 to max value)
		maxCheck = false; // Boolean indicating whether a check for max labels is necessary
	
	// Label class
	function Label(text, id, location, textLocation, color){
		this.text = text;
		this.id = id;
		this.location = location;
		this.textLocation = textLocation;
		this.color = color;
		this.textColor = textColor;
	}
	
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_labels = {
			/** 
			 * Gets or sets the stored label content and optionally updates the UI display
			 * 
			 * @param val Object content
			 * @param callback Function to run when content has been set and snapshots have been created (optional)
			 * @param noUpdate Boolean specifying whether or not to update the labels svg display
			 * @returns Array of Label objects
			 * @returns Object this
			 */
			content: function(val, callback, noUpdate){
				if(!arguments.length){ return content; } // no arguments, so return content
				
				content = val;
				loading = true;
				if (content.labels.length > max){
					var overflow = content.labels.length-max;
					content.labels.splice(-1*overflow, overflow);
				}
				if(!content.total || typeof content.total != 'number' || content.total < content.labels.length){
					content.total = content.labels.length;
				}
				setContent(callback, noUpdate);
				
				return this;
			},
			/** 
			 * Gets or sets the maximum allowed labels
			 * 
			 * @param val Integer max labels
			 * @returns Integer max labels
			 * @returns Object this
			 */
			max: function(val) {
				if(!arguments.length){ return max; } // no arguments, so return max value
				
				if(typeof val === 'number'){
					if(val > 0 && val > (min-1)){
						max = val;
					} else if(val == 0){
						max = Infinity;
					}
				}
				return this;
			},
			/** 
			 * Gets or sets the minimum allowed labels
			 * 
			 * @param val Integer min labels
			 * @returns Integer min labels
			 * @returns Object this
			 */
			min: function(val) {
				if(!arguments.length){ return min; } // no arguments, so return min value
				
				if(typeof val === 'number' && val > -1 && val < (max+1)){
					min = val;
				}
				return this;
			},
			/** 
			 * Gets or sets the label color
			 * 
			 * @param val String label color
			 * @returns String label color
			 * @returns Object this
			 */
			color: function(val) {
				if(!arguments.length){ return color; } // no arguments, so return color
				
				if(typeof val === 'string'){
					color = val;
				}
				return this;
			},
			/** 
			 * Gets or sets the text color
			 * 
			 * @param val String text color
			 * @returns String text color
			 * @returns Object this
			 */
			textColor: function(val) {
				if(!arguments.length){ return textColor; } // no arguments, so return color
				
				if(typeof val === 'string'){
					textColor = val;
				}
				return this;
			},
			/** 
			 * Checks whether the maximum number of labels has been reached
			 * 
			 * @param alert Boolean whether to alert user or not
			 * @returns Boolean
			 */
			maxReached: function(alert){
				// check for max existing labels
				if(!loading && content.labels.length >= max){
					if(alert){
						//Sorry, you have reached the maximum number of lables (' + max + '). If you would like to add more, please delete some existing labels and try again.
						var msg = '<p style="text-align: center;">' + view.getI18NStringWithParams('annotator_maxWarning', [max], 'SVGDrawNode') + '</p>'; // WISE
						//$.alert(msg);
						bootbox.alert(msg); // WISE
					}
					annotator.setLabelMode(false); // WISE
					return true;
				} else {
					return false;
				}
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
			 * Gets or sets the total number of labels created (including deleted labels)
			 * 
			 * @param val Integer total labels
			 * @returns Integer total labels
			 * @returns Object this
			 */
			total: function(val){
				if(!arguments.length){ return content.total; } // no arguments, so return total value
				
				if(typeof val === 'number' && val < (max+1)){
					content.total = total;
				}
				return this;
			},
			/** 
			 * Opens a prompt dialog to edit text for the label with the specified id
			 * 
			 * @param ladelId String label id
			 */
			promptEditLabelText: function(labelId){
				var text_id = $('text[data-labelid="' + labelId + '"]').attr('id'),
					target = getElem(text_id),
					labelText = '';
				canv.clearSelection();
				canv.addToSelection([target]);
				
				var i = content.labels.length;
				while(i--){
					if(content.labels[i].id === labelId){
						labelText = content.labels[i].text;
						break;
					}
				}
				//labelText = target.textContent;
				
				/*$.prompt('Edit label text:', labelText, function(newText){
					if (!newText) {
						canv.leaveContext();
						canv.clearSelection();
						return;
					}
					canv.leaveContext();
					api.editLabel(labelId, newText);
				});*/
				// WISE - use Bootbox dialog instead of svg-edit prompt; include delete link
				var msg = $('<div id="editLabel">\
						<form role="form" class="form-horizontal" onsubmit="return false;">\
							<div class="form-group">\
							<label class="control-label col-sm-2" id="editLabelText" for="labelTextInput">' + view.getI18NString('annotator_editLabelText','SVGDrawNode') + '</label>\
							<div class="col-sm-10"><input type="text" class="form-control" id="labelTextInput" value="' + labelText + '" /></div>\
						</div>\
						</form>\
						<hr />\
						<div style="text-align: center;"><a id="delete" class="text-danger" style="font-weight: bold;">' + view.getI18NString('annotator_deleteLabel','SVGDrawNode') + '</a></div>\
					</div>');
				var editModal = bootbox.dialog({
					message: msg,
					title: view.getI18NString('annotator_edit_title','SVGDrawNode'),
					buttons: {
						cancel: {
							label: view.getI18NString('Cancel','SVGDrawNode'),
							callback: function(){
								canv.leaveContext();
								canv.clearSelection();
							}
						},
						ok: {
							label: view.getI18NString('OK','SVGDrawNode'),
							callback: function(){
								var newText = $('#labelTextInput').val();
								if (newText !== labelText){
									canv.leaveContext();
									api.editLabel(labelId, newText);
								} else {
									canv.leaveContext();
									canv.clearSelection();
								}
							}
						}
					}
				});
				$('#delete').on('click', function(){
					editModal.modal('hide');
					api.deleteLabel(labelId);
				});
				
				//give the text input focus when the modal dialog appears
				editModal.on('shown.bs.modal', function() {
					//give the text input focus
					$('#labelTextInput').focus();
					
					//get the value in the text input
					var labelTextInputVal = $('#labelTextInput').val();
					
					//get the length of the text input value
					var labelTextInputValLength = labelTextInputVal.length;
					
					//set the cursor to the end of the input text
					$('#labelTextInput')[0].setSelectionRange(labelTextInputValLength, labelTextInputValLength);
				});
			},
			/** 
			 * Edits the label with the specified id with the specified attributes
			 * 
			 * @param labelId String label id
			 * @param txt String label text content
			 * @param color String label color
			 * @param textColor String text color
			 */
			editLabel: function(labelId, txt, color, textColor){
				if(txt){
					var textId = $('text[data-labelid="' + labelId + '"]').attr('id'),
						target = getElem(textId);
					
					target.textContent = txt;
					resizeLabelText(labelId);
					canv.clearSelection();
					canv.addToSelection([target]);
					canv.textActions.start(target);
					canv.textActions.clear();
					canv.clearSelection();
				}
				
				if(color){
					var anchorId = $('circle[data-labelid="' + labelId + '"]').attr('id'),
						anchor = getElem(textId);
						anchor.attr('fill', '#' + color);
					
					var lineId = $('polyline[data-labelid="' + labelId + '"]').attr('id'),
						line = getElem(lineId);
						line.attr('fill', '#' + color);
						
					var tBoxId = $('rect[data-labelid="' + labelId + '"]').attr('id'),
						tBox = getElem(tBoxId);
						tBox.attr('fill', '#' + color);
				}
				if(textColor){
					var textId = $('text[data-labelid="' + labelId + '"]').attr('id'),
						text = getElem(textId);
						text.attr('fill', '#' + textColor);
				}
				
				updateLabel(labelId, txt, color, textColor);
			},
			/** 
			 * Adds a new label
			 * 
			 * @param ax Number anchor x coordinate
			 * @param ay Number anchor y coordinate
			 * @param labelText String label text
			 * @param labelColor String (Hex) label color
			 * @param textColor String (Hex) text color
			 * @param labelId Integer label id
			 * @param textx Number label text x coordinate
			 * @param texty Number label text y coordinate
			 * 
			 */
			addLabel: function(ax, ay, labelText, labelColor, textColor, labelId, textx, texty){
				addLabel(ax, ay, labelText, labelColor, textColor, labelId, textx, texty);
			},
			/** 
			 * Deletes a label
			 * 
			 * @param labelId String label id
			 * @param noConfirm Boolean whether to warn user before deleting
			 */
			deleteLabel: function(labelId, noConfirm){
				deleteLabel(labelId, noConfirm);
			},
			/**
			 * Sets svg-editor mode to 'ext-label' and updates mouse cursor
			 */
			setLabelMode: function(){
				setLabelMode();
			},
			/**
			 * Listener function that is called when a label is created, deleted, or modified
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
	
	function setContent(callback, noUpdate){
		//content.labels = labels;
		//content.total = total;
		
		if(!noUpdate){
			// create labels elements for each item in labels array
			var labels = content.labels,
				i = labels.length;
			while(i--){
				var label = labels[i];
				addLabel(label.location.x, label.location.y, label.text, label.color, label.textColor, label.id, label.textLocation.x, label.textLocation.y);
			}
		}
		
		loading = false;
		onComplete(callback);
	}
	
	// from ext-connector.js
	function getBBintersect(x, y, bb, offset) {
		if(offset) {
			offset -= 0;
			bb = $.extend({}, bb);
			bb.width += offset;
			bb.height += offset;
			bb.x -= offset/2;
			bb.y -= offset/2;
		}
	
		var mid_x = bb.x + bb.width/2;
		var mid_y = bb.y + bb.height/2;
		var len_x = x - mid_x;
		var len_y = y - mid_y;
		
		var slope = Math.abs(len_y/len_x);
		
		var ratio;
		
		if(slope < bb.height/bb.width) {
			ratio = (bb.width/2) / Math.abs(len_x);
		} else {
			ratio = (bb.height/2) / Math.abs(len_y);
		}
		
		
		return {
			x: mid_x + len_x * ratio,
			y: mid_y + len_y * ratio
		};
	}
	
	
	// from ext-connector.js
	function getOffset(side, line) {
		var give_offset = !!line.getAttribute('marker-' + side);
		// var give_offset = $(line).data(side+'_off');

		// TODO: Make this number (5) be based on marker width/height
		var size = line.getAttribute('stroke-width') * 5;
		return give_offset ? size : 0;
	}
	
	// Modified from http://bl.ocks.org/mbostock/7555321
	function wrapText(el, width) {
		var words = el.textContent.split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.2, // ems
			y = el.getAttribute("y"),
			x = el.getAttribute("x"),
			tspan = addElem({ "element": "tspan", "attr": {"x": x, "y": y, "dy": "0", "id": canv.getNextId()} });
		tspan.setAttribute('class', 'se_label');
		el.textContent = '';
		el.appendChild(tspan);
		while (word = words.pop()) {
			line.push(word);
			tspan.textContent = line.join(" ");
			if (tspan.getComputedTextLength() > width) {
				line.pop();
				tspan.textContent = line.join(" ");
				line = [word];
				tspan = addElem({ "element": "tspan", "attr": {"x": x, "y": y, "dy": ++lineNumber * lineHeight + "em", "id": canv.getNextId()} });
				tspan.setAttribute('class', 'se_label');
				tspan.textContent = word;
				el.appendChild(tspan);
			}
		}
	}
	
	function addLabel(ax, ay, labelText, labelColor, tColor, labelId, textx, texty){
		if(api.maxReached(true)){
			return;
		}
		
		if(typeof (content.total+1) === 'number'){
			var lTxt = labelText ? labelText : lText,
				id = labelId ? labelId : 'label_' + (content.total+1),
				fillColor = labelColor ? labelColor : curConfig.initFill.color,
				strokeColor = labelColor ? labelColor : curConfig.initStroke.color,
				textFill = tColor ? tColor : textColor,
				x = ax,
				y = ay,
				tx = textx ? textx : (x+50),
				ty = texty ? texty : (y-50);

			// override aRadius if specified in the content
			if (content.defaultAnchorRadius) {
				aRadius = content.defaultAnchorRadius;
			}

			// create anchor (circle)
			var anchor = addElem({
				'element': 'circle',
				//"curStyles": true,
				'attr': {
					'cx': x,
					'cy': y,
					'r': aRadius,
					'id': canv.getNextId(),
					'opacity': curConfig.initStroke.opacity,
					//'stroke-width': curConfig.initStroke.width,
					'stroke-width': 1,
					//'stroke': '#' + strokeColor,
					'stroke': '#555555',
					'fill': '#' + fillColor,
					'style': 'pointer-events:inherit',
					"cursor": "move" // WISE
				}
			});
			anchor.setAttribute('class', 'se_label_anchor se_label');
			anchor.setAttribute('data-labelid', id);
			currentEl.push(anchor);
			
			// create text element for label content
			var labelFontSize = 18;
			if (content.labelDefaultFontSize) {
				labelFontSize = content.labelDefaultFontSize;
			}
			var text = addElem({
				"element": "text",
				//"curStyles": true,
				"attr": {
					"x": tx,
					"y": ty,
					"id": canv.getNextId(),
					"opacity": curConfig.initStroke.opacity,
					"stroke-width": 0,
					//"fill": '#' + fillColor,
					"fill": '#' + textColor, // WISE
					//"font-size": canv.getFontSize(),
					"font-size": labelFontSize, // WISE
					"font-family": canv.getFontFamily(),
					"text-anchor": "left",
					"xml:space": "preserve"
				}
			});
			text.textContent = lTxt;
			text.setAttribute('class', 'se_label_text se_label');	
			text.setAttribute('data-labelid', id);
			currentEl.push(text);
			
			// create rectangle to serve as background for label text
			var textBox = addElem({
				"element": "rect",
				"curStyles": true,
				"attr": {
					//"x": text_x - tOffset,
					//"y": text_y - tOffset - 1,
					//"width": text_bb.width + (tOffset*2),
					//"height": text_bb.height + (tOffset*2),
					'rx': '2',
					'ry': '2',
					"id": canv.getNextId(),
					"fill": '#' + fillColor,
					//"stroke": '#' + strokeColor,
					"stroke": '#555555',
					//"stroke-width": curConfig.initStroke.width,
					"stroke-width": 1,
					"opacity": 1
				}
			});
			
			textBox.setAttribute('class', 'se_label_textbox se_label');
			textBox.setAttribute('data-labelid', id);
			resizeLabelText(id);
			currentEl.push(textBox);
			
			// create group element to hold label text elements
			var textGroup = addElem({
				"element": "g",
				"attr": {
					"id": canv.getNextId(),
					"cursor": "pointer" // WISE
				}
			});
			textGroup.setAttribute('class', 'se_label_textgroup se_label');
			textGroup.setAttribute('data-labelid', id);
			currentEl.push(textGroup);
			textGroup.appendChild(textBox);
			textGroup.appendChild(text);
			
			// Get center of source element (anchor)
			var anchor_bb = svgCanvas.getStrokedBBox([anchor]),
				anchor_x = anchor_bb.x + anchor_bb.width/2,
				anchor_y = anchor_bb.y + anchor_bb.height/2;
			
			var start_id = anchor.id, end_id = text.id,
				conn_str = start_id + " " + end_id,
				alt_str = end_id + " " + start_id;
			
			var bb = svgCanvas.getStrokedBBox([text]);
			var text_x = bb.x + bb.width/2,
				text_y = bb.y + bb.height/2;
			
			// add connector line (from ext-connector.js)
			var cur_line = addElem({
				"element": "polyline",
				"attr": {
					"id": canv.getNextId(),
					"points": (anchor_x+','+anchor_y+' '+anchor_x+','+anchor_y+' '+text_x+','+text_y),
					"stroke": '#' + strokeColor,
					"stroke-width": 3,
					"fill": "none",
					"opacity": curConfig.initStroke.opacity,
					"style": "pointer-events:none"
				}
			});
			elData(cur_line, 'start_bb', bb);
			
			$(cur_line)
				.data("c_start", start_id)
				.data("c_end", end_id)
				.data("end_bb", bb);
			var se_ns = canv.getEditorNS(true);
			cur_line.setAttributeNS(se_ns, "se:connector", conn_str);
			//cur_line.setAttribute('class', conn_sel + ' ' + label_sel);
			cur_line.setAttribute('class', conn_sel);
			cur_line.setAttribute('data-labelid', id);
			cur_line.setAttribute('data-labelels', conn_str);
			//cur_line.setAttribute('opacity', 1);
			canv.addToSelection([cur_line]);
			canv.moveUpDownSelected('Down');
			canv.moveUpDownSelected('Down');
			canv.removeFromSelection([cur_line]);
			//canv.clearSelection();
			//selManager.releaseSelector(cur_line);
			//selManager.requestSelector(cur_line).showGrips(false);
			currentEl.push(cur_line);
			
			// add to undo/redo stack
			batchCmd = new svgedit.history.BatchCommand('Insert Label'); // batch cmd to hold undo/redo history
			batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(anchor));
			batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(text));
			batchCmd.addSubCommand(new svgedit.history.InsertElementCommand(cur_line));
			
			
			if(!loading){
				var loc = {x: x, y: y},
					tLoc = {x: tx, y: ty};
				current = new Label(lText, id, loc, tLoc, labelColor, textColor);
			}
			
			// setup anchor mousedown/touchstart event
			$(anchor).on('mousedown.labels touchstart.labels', function(e){
				$(anchor).data('p0', { x: e.pageX, y: e.pageY });
				canv.clearSelection();
				canv.addToSelection([anchor, cur_line, textGroup]);
			});
			
			// setup anchor mouseup/touchend event
			$(anchor).on('mouseup.labels touchend.labels', function(e){
				setTimeout(function(){
					var p0 = $(anchor).data('p0'),
		        		p1 = { x: e.pageX, y: e.pageY };
					if(p0 && (p0.x !== p1.x || p0.y !== p1.y)){
						updateLabel(id, null, null, null, {x: $(anchor).attr('cx'), y: $(anchor).attr('cy')}, {x: $(text).attr('x'), y: $(text).attr('y')});
					}
				}, 500);
			});
			
			// setup text element mousedown/touchstart event
			$(text).add(textBox).on('mousedown.labels touchstart.labels', function(e){
				$(text).data('p0', { x: e.pageX, y: e.pageY }).data('moving', false);
				canv.clearSelection();
				canv.addToSelection([textGroup]);
			});
			
			$(text).add(textBox).on('mousemove.labels touchmove.labels', function(e){
				$(text).data('moving', true);
			});
			
			// setup text element mouseup/touchend event
			$(text).add(textBox).on('mouseup.labels touchend.labels', function(e){
				setTimeout(function(){
					var p0 = $(text).data('p0'),
			        	p1 = { x: e.pageX, y: e.pageY };
					if(p0 && (p0.x !== p1.x || p0.y !== p1.y)){
						updateLabel(id, null, null, null, {x: $(anchor).attr('cx'), y: $(anchor).attr('cy')}, {x: $(text).attr('x'), y: $(text).attr('y')});
					}
				}, 500);
			});
			
			// setup text element click
			$(text).add(textBox).on('click.labels.edit touchend.labels.edit', function(e){
				if(!$(text).data('moving')) {
					api.promptEditLabelText(id);
				}
			});
			
			finishLabel();
		}
	}
	
	//function finishLabel(click){
	function finishLabel(){
		canv.addedNew = true;
		
		// add undo/redo command
		canv.undoMgr.addCommandToHistory(batchCmd);
		
		canv.call("changed", currentEl);
		
		if(!loading){
			content.total = content.total + 1;
			content.labels.push(current);
			api.changed();
		}
		
		canv.setMode('select');  // WISE
	}
	
	function updateLabel(labelId, txt, color, textColor, loc, tLoc){
		var i = content.labels.length;
		while(i--){
			if(content.labels[i].id === labelId){
				var label = content.labels[i];
				if(txt) { label.text = txt; }
				if(color){ label.color = color; }
				if(textColor){ label.textColor = textColor; }
				if(loc){ label.location = loc; }
				if(tLoc){ label.textLocation = tLoc; }
				break;
			}
		}
		
		api.changed();
	}
	
	function resizeLabelText(labelId){
		var tbox_id = $('rect[data-labelid="' + labelId + '"]').attr('id'),
			text_id = $('text[data-labelid="' + labelId + '"]').attr('id'),
			textBox = getElem(tbox_id),
			text = getElem(text_id);
		
		// wrap text when it is wider than max width
		wrapText(text, lWidth);
		
		// Get center of source element (text)
		var text_bb = svgCanvas.getStrokedBBox([text]),
			text_x = text_bb.x,
			text_y = text_bb.y;
		
		// resize text box
		textBox.setAttribute('x', text_x - tOffset);
		textBox.setAttribute('y', text_y - tOffset);
		textBox.setAttribute('width', text_bb.width + (tOffset*2) + 1);
		textBox.setAttribute('height', text_bb.height + (tOffset*2));
	}
	
	function deleteLabel(id, noConfirm){
		var labels = content.labels;
		// check for minimum number of labels (TODO: removed for now; just using minimum as check for step completion in WISE)
		//if(labels.length > min){
			if(!noConfirm){
				/*$.confirm('Are you sure you want to permanently delete this label?'), function(ok){
					if (ok) {
						var i = labels.length;
						while(i--){
							if(labels[i].id === id){
								labels.splice(i);
								$('[data-labelid="' + id + '"]').remove();
								api.changed();
								break;
							}
						}
					}
				});*/
				// WISE: use Bootbox
				bootbox.confirm(view.getI18NString('annotator_deleteConfirm','SVGDrawNode'), function(ok){
					if(ok){
						removeLabel(id);
					}
					canv.leaveContext();
					canv.clearSelection();
				});
			} else {
				removeLabel(id);
			}
		/*} else {
			//var msg = '<p style="text-align: center;">Sorry, you cannot delete this label. You must have at least ' + min + ' active labels.</p>';
			var msg = '<p style="text-align: center;">' + view.getI18NStringWithParams('annotator_minWarning', [min], 'SVGDrawNode') + '</p>'; // WISE
			//$.alert(msg);
			bootbox.alert(msg); // WISE
			return;
		}*/
	}
	
	function removeLabel(id){
		var labels = content.labels,
			i = labels.length;
		while(i--){
			if(labels[i].id === id){
				labels.splice(i,1);
				$('[data-labelid="' + id + '"]').remove();
				api.changed();
			}
		}
	}
	
	function setLabelMode(){
		canv.setMode('ext-labels');
		$('#workarea').css('cursor','crosshair');
	}
	
	return {
		//svgicons: svgEditor.curConfig.extPath + 'ext-labels.xml',
		buttons: [{
			id: 'tool_label',
			type: 'mode',
			//position: 7,
			title: 'Add Label',
			events: {
				click: function() {
					setLabelMode();
				}
			}
		}],
		
		callback: function(){
			setContent(); // set initial labels
		},
		
		selectedChanged: function(opts){},
		
		elementChanged: function(opts){
			if(svgCanvas.undoMgr.undoStack[svgCanvas.undoMgr.undoStackPointer-1].text === 'Delete Elements') {
				var elems = opts.elems,
					i = elems.length;
				while(i--){
					var elem = opts.elems[i];
					if(elem.classList.contains('se_label')){
						var labelId = elem.getAttribute('data-labelid')
						api.deleteLabel(labelId, true);
						break;
					}
				}
			}
		},
		
		mouseDown: function(opts){
			var e = opts.event,
				mode = canv.getMode(),
				target = e.target;
			if(mode !== 'ext-labels'){ return; }
			//if(e.button === 2 || mode === 'ext-panning'){ return; }; // ignore right click
			
			var x = opts.start_x,
				y = opts.start_y;
			
			// don't allow label anchor locations outside of canvas
			if(x < 0 || x > canv.contentW || y < 0 || y > canv.contentH) { return; }
			addLabel(x-aRadius/2, y-aRadius/2, lText, color, textColor);
		},
		
		mouseMove: function(opts){},
		
		mouseUp: function(opts){
			var e = opts.event,
				mode = canv.getMode(),
				target = e.target;
			
			if(mode !== 'ext-labels'){ return; }
			//canv.clearSelection();
			canv.setMode('select'); // WISE
			
			return {
				keep: true,
				started: false
			};
		}
	}
});
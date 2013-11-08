function starmap() {

	// public variables with default settings
	var margin = {top: 50, right: 50, bottom: 50, left: 50},
		width = 1024, // default height
		height = 600, // default width
		fluid = true, // default for fluid layout (if true, layout scales according to parent DOM element's size; if false, width and height are static
		title = '',
		stepTerm = '',
		editable = false, // default for whether project nodes (positions, etc.) can be edited (authoring mode)
		attributes = {}, // optional object of node IDs and any corresponding layout attributes (currently only 'x' and 'y' values are supported, which define set coordinate positions for a node)
		view = {}, // object to hold WISE view object (provides access to WISE project and its nodes)
		complete = function(){}; // optional callback function to execute once map has finished loading

	// private variables
	var start,
		g,
		masterIds = [],
		layoutIsSet = true,
		zoomed = false,
		zoomInit = false,
		loaded = false,
		forceW = width,
		forceH = height,
		forceX1 = 0,
		forceY1 = 0,
		forceX2 = width,
		forceY2 = height,
		forceXMid = forceW/2,
		forceYMid = forceH/2;

	function chart(selection) {
		selection.each(function(data) {

			var map = $(this);
			
			forceW = width - margin.left - margin.right;
			forceH = height - margin.top - margin.bottom;
			forceX1 = margin.left;
			forceY1 = margin.top;
			forceX2 = width - margin.right;
			forceY2 = height - margin.bottom;
			forceXMid = forceW/2 + forceX1;
			forceYMid = forceH/2 + forceY1;

			// get the start sequence, step term
			start = data.startPoint;
			var stepTerm = data.stepTerm,
				k = 2.5;  // zoom (scale level) when zooming in on an activity
				//r = 6; // radius for step node circles

			// get the activities and steps
			var seqs = data.sequences,
				steps = data.nodes;

			// iterate through sequences (starting with master sequence) and create hierarchy object
			var master;
			$.each(seqs, function(i,d){
				if(d.identifier === start){
					master = d;
				}
			});

			// iterate through items in the master sequence to build full hierarchy
			projectFull = getItem(master.identifier, seqs, steps, true);

			var fullNodes = flatten(projectFull);
			// remove root node and add position information to each node
			var i=0;
			for(;i<fullNodes.length;++i){
				var o = fullNodes[i],
					nodeId = o.identifier;;
				if(nodeId === start){
					fullNodes.splice(i,1);
				} else {
					if(o.master){
						o.radius = 20;
					} else {
						o.radius = 16;
					}
					// add any stored node attribute values
					if(attributes.hasOwnProperty(nodeId)){
						var attrs = attributes[nodeId];
						for(var key in attrs){
							o[key] = attrs[key];
						}
						if(typeof attributes[nodeId].x === "number" && typeof attributes[nodeId].y === "number"){
							o.isFixed = true;
						} else {
							layoutIsSet = false;
						}
					} else {
						layoutIsSet = false;
					}
					o.fixed = true;
				}
			}

			// Select the svg, g elements, if they exists
			var svg = d3.select(this).select("svg#chart");
			g = d3.select("g#wrap");

			// Otherwise, create the map and inner wrap element    	
			if (svg.empty()) {
				svg = d3.select(this).append("svg:svg")
					.attr('id','chart');

				// zoom layer
				svg.append('svg:g')
					//.call(d3.behavior.zoom().on("zoom", pan)) // disable pan for now
					.append('svg:g')
					.attr('id', 'wrap');
				g = d3.select('g#wrap');
				g.append('svg:rect')
					.attr('width', width)
					.attr('height', height)
					.attr('id','mapBg')
					.attr('fill', 'rgba(255,255,255,.03)');
				
				// create activity controls
				map.append('<div id="activityControls">' +
					'<div id="currentAct"><span class="pos"></div>' +
					'<a id="prevAct" href="javascript:void(0);"></a>' +
					'<a id="reset" href="javascript:void(0);"></a>' +
					'<a id="nextAct" href="javascript:void(0);"></a>' +
					'</div>');
				
				$('#reset').on('click', function(){
					reset();
				});
			}

			// Update the outer dimensions
			if(fluid){
				svg.attr({
					"viewBox": "0 0 " + width + " " + height,
					"preserveAspectRatio": "xMidYMid meet",
					'height': '100%',
					'width': '100%',
					'pointer-events': 'all'
				});
			} else {
				svg.attr({
					'width': width,
					'height': height
				});
			}

			// Update the inner dimensions with padding
			// g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			// function to build a group's (activity) hull path
			/*var groupPath = function(d) {
				return "M" + d3.geom.hull(d.values.map(function(i) {return [i.x, i.y];})).join("L") + "Z";
			};*/
			
			// setup force layout and add nodes
			var force = d3.layout.force()
				.nodes(fullNodes)
				//.charge(-320)
				.gravity(.2)
				.friction(.55)
				.size([width, height])
				.start();
			
			// create force layout of used nodes
			var links = d3.layout.tree().links(fullNodes);
			
			// add links between activities and steps to links array
			projectFull.children.forEach(function(o,i) {
				if(i<projectFull.children.length-1){
					var next = projectFull.children[i+1];
					o.next = next;
					links.push({source: o.index, target: next.index, type: 'seq-seq'});
				}
				if(i>0){
					var prev = projectFull.children[i-1];
					o.prev = prev;
				}
				if(o.hasOwnProperty("children") && o.children.length > 0){
					o.children.forEach(function(n,a){
						if(a<o.children.length-1){
							var source = 0,
								target = 0,
								group = '';
							fullNodes.forEach(function(u,x){
								if(o.children[a].identifier === u.identifier){
									source = u.index;
									group = u.group;
								}
								if(o.children[a+1].identifier === u.identifier){
									target = u.index;
								}
							});
							links.push({source: source, target: target, type: 'seq-node', group: group});
							//links.push({source: o.index, target: target, type: 'seqToPath', group: group});
						}
					});
				}
			});

			// add links to force layout
			force.links(links)
				.linkDistance(function(d) { 
					if(d.type === 'seq-node'){
						return 26;
					} else if(d.type === 'seq-seq'){
						return 50;
					} else {
						return 6;
					}
				})
				.charge(function(d) { return d.master ? -600 : -500 });

			function sDragStart(d,i) {
				forceSeq.each(function(s) { s.fixed = true; }); // set all activities to fixed position
				force.stop(); // stops the force auto positioning before you start dragging
			}
			
			function getIcon(d) {
				var project = view.getProject(),
					metadata = view.getProjectMetadata(),
					node = project.getNodeById(d.identifier),
					isValid = false,
						nodeClass = '',
						nodeIconPath = '';
					if(node.getNodeClass() && node.getNodeClass()!=='null' && node.getNodeClass()!==''){
						nodeClass = node.getNodeClass();
						for(var a=0;a<view.nodeClasses[node.type].length;a++){
							if(view.nodeClasses[node.type][a].nodeClass === nodeClass){
								isValid = true;
								nodeIconPath = view.nodeClasses[node.type][a].icon;
								break;
							}
						}
					}

					if(!isValid){
						nodeClass = view.nodeClasses[node.type][0].nodeClass;
						nodeIconPath = view.nodeClasses[node.type][0].icon;
					}
					return nodeIconPath;
				}

			function sDragMove(elem,i) {
				var group = elem.group;
				// on activity drag, drag all associated steps as well
				d3.selectAll('.item').each(function(d){ 
					if(d.group === group && (d.type === 'sequence' || !d3.select(this).classed('active'))){
						d.px += d3.event.dx;
						d.py += d3.event.dy;
						d.x += d3.event.dx;
						d.y += d3.event.dy;
						d3.select(this).attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					}
				});
				force.tick(); // this is the key to make it work together with updating both px,py,x,y on d !
				force.resume();
			}

			function sDragEnd(d,i) {
				d.fixed = true; // set the node to fixed so the force doesn't include the node in its auto positioning stuff
				force.stop();
			}

			var sDrag = d3.behavior.drag()
				.on("dragstart",sDragStart)
				.on("drag",sDragMove)
				.on("dragend",sDragEnd);

			function pan() {
				if(zoomed){ // only allow panning if we are in the zoomed state
					if (d3.event.sourceEvent.type !== "wheel" && d3.event.sourceEvent.type !== "mousewheel" 
						&& d3.event.sourceEvent.type !== 'DOMMouseScroll'){ // disable mouse scroll
						//console.log("here", d3.event.translate, d3.event.scale);
						//var scale = d3.transform(g.attr('transform')).scale,
							//translate = d3.transform(g.attr('transform')).translate;

						/*g.attr("transform", "translate(" + translate + ")"+ " scale(3)");*/
						var trans = d3.event.translate,
							scale = d3.event.scale,
							newTrans;
						if(zoomInit){
							trans = d3.transform(g.attr('transform')).translate;
							scale = d3.transform(g.attr('transform')).scale;
							//} else {
							//newTrans = (trans[0] + ((width - (width * k))/2)) + ',' + (trans[1] + ((height - (height * k))/2));
						}
						newTrans = (trans[0] + ((width - (width * k))/2)) + ',' + (trans[1] + ((height - (height * k))/2));
						//console.log("event translate: " + trans);
						//console.log("scale: " + scale);
						//console.log("new translate: " + newTrans);
						g.attr("transform", "translate(" + newTrans + ")scale(" + k + ")");
						zoomInit = false;
					}
				}
			}

			function renderNode(d){
				var nodePosition = view.getProject().getPositionById(d.identifier);
				//go to the node position that was clicked if it is available
				view.eventManager.fire('navigationNodeClicked', nodePosition);
			};
			
			var masters = force.nodes().filter(function(d){ return d.master; }),
				children = force.nodes().filter(function(d){ return !d.master; });

			// Resolves collisions between node and all other nodes
			function collide(node) {
				var r = node.radius,
					nx1 = node.x - r,
					nx2 = node.x + r,
					ny1 = node.y - r,
					ny2 = node.y + r;
				return function(quad, x1, y1, x2, y2) {
					if (quad.point && (quad.point !== node)) {
						var x = node.x - quad.point.x,
							y = node.y - quad.point.y,
							l = Math.sqrt(x * x + y * y),
							r = node.radius + quad.point.radius;
						if (l < r) {
							l = (l - r) / l * .5;
							node.x -= x *= l;
							node.y -= y *= l;
							quad.point.x += x;
							quad.point.y += y;
						}
					}
					return x1 > nx2
						|| x2 < nx1
						|| y1 > ny2
						|| y2 < ny1;
				};
			}

			function zoom(elem, d){
				//console.log("here", d3.event.x, d3.event.y);
				forceSeq.each(function(s) { s.fixed = true; }); // set all activities to fixed position
				var x = 0,
					y = 0;

				//var group = d.dataset.group,
				var group = elem.getAttribute('data-group');
				//current = {};

				/*d3.selectAll('.item, .link, .target, .hull')
	  	  			.classed('active',function(d){ return this.getAttribute('data-group') === group; });

				d3.selectAll('.item, .link, .hull')
					.classed('inactive',function(d){ return this.getAttribute('data-group') !== group; });*/

				if(elem.classList.contains('seq')){
					/*d3.selectAll('.node.active').each(function(n,i){
						if(i===0){
							n.current = true;
						}
						if(n.current === true){
							x = n.x;
							y = n.y;
						}
					});*/

					x = d.x;
					y = d.y;

					d3.select(elem).each(function(n){
						$('#currentAct').html("<span class='pos'>#" + (n.position+1) + "</span> " + n.title); 
					});

					// hide activity info displays
					d3.select(view.escapeIdForJquery("#" + elem.id + "_info"))
						.transition()
						.duration(125)
						.style("opacity",0);
					d3.select(view.escapeIdForJquery("#" + elem.id + "_radial"))
						.transition()
						.attr("width", 0)
						.attr("height", 0)
						.attr("x", 0)
						.attr("y", 0)
						.duration(100)
						.delay(200)
						.each("end", function(){
							setTimeout(function(){
								d3.selectAll('.item, .link, .target, .hull')
								.classed('active',function(d){ return this.getAttribute('data-group') === group; });
	
								d3.selectAll('.item, .link, .hull')
								.classed('inactive',function(d){ return this.getAttribute('data-group') !== group; });
	
								d3.select('#mapBgImg').classed('zoom',true);
								$('#activityControls').delay(600).slideDown(250);
							}, 200);
						});

					// set next and previous link actions
					// TODO: perhaps move html element creation inside starmap
					var prevAct = d.prev,
						nextAct = d.next;
					$('#prevAct, #nextAct').off('click');
					if(prevAct){
						$('#prevAct').on('click', function(){
							zoom(d3.select(view.escapeIdForJquery('#' + prevAct.identifier))[0][0], prevAct);
						});
						$('#prevAct').removeClass('disabled');
					} else {
						$('#prevAct').addClass('disabled');
					}
					if(nextAct){
						$('#nextAct').on('click', function(){
							zoom(d3.select(view.escapeIdForJquery('#' + nextAct.identifier))[0][0], nextAct);
						});
						$('#nextAct').removeClass('disabled');
					} else {
						$('#nextAct').addClass('disabled');
					}
				}

				// translate target coordinates
				x = width/2/k - x;
				y = height/2/k - y;

				// perform zoom
				g.transition()
					.duration(750)
					.delay(500)
					.ease("cubic-in-out")
					.attr("transform", "scale(" + k + "," + k + ") translate(" + x + "," + y + ")");

				zoomed = true;
				zoomInit = true;
				g.classed("zoom", true);
			};

			function draw(){
				var zoomRatio = 1.5/k;

				// Use a timeout to allow the rest of the page to load first.
				setTimeout(function() {

					// Run the layout a fixed number of times.
					// The ideal number of times scales with graph complexity.
					// Of course, don't run too longÑyou'll hang the page!
					if(!layoutIsSet){
						  force.start();
					      var n = 5;
					      for (var i = n * n; i > 0; --i) force.tick();
					      force.stop();
				  	}
					
					//force.start();
					// Update the step items
					forceNode = g.selectAll("g.item")
						.data(force.nodes().filter(function(d) { return (d.type !== "sequence") && (!d.master); }))
						.enter().append("svg:g")
						.attr("class", function(d){ return d.current === true ? "item node current" : "item node"; })
						.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
						.attr("data-group", function(d){ return d.group; })
						.attr("id", function(d){ return d.identifier })
						.on("click", function(d){ renderNode(d); })
						.on("touchstart", function(d){ renderNode(d); });
					if(editable){
						// map is editable (authoring mode), so allow dragging of step items
						forceNode.call(force.drag);
					}
					/*forceCircle = forceNode.append("svg:circle")
						.attr("id",function(d){ return "anchor_" + d.identifier; })
						.attr("class","main")
						.attr("r", r);*/
					forceNode.append("svg:image")
						.attr("xlink:xlink:href","themes/starmap/navigation/map/images/menu-radial.png")
						.attr("width", 0)
						.attr("height", 0)
						.attr("x", 0)
						.attr("y", 0)
						.attr("id", function(d){ return d.identifier + "_radial"; })
						.attr("class", "radial");
					
					forceNode.append("svg:image")
						.attr("id",function(d){ return "anchor_" + d.identifier; })
						.attr("xlink:xlink:href",getIcon)
						.attr("x", -18*zoomRatio)
						.attr("y", -18*zoomRatio)
						.attr("width", 36*zoomRatio)
						.attr("height", 36*zoomRatio)
						.attr("class", "icon")
						.on("mouseover", function(d){
							this.parentNode.parentNode.appendChild(this.parentNode);
							// adjust position of rollover info (left or right of icon) to ensure it doesn't get cut off by edge of layout
							var bgX = 16/k,
							titleOffset = 14/k,
							lockedOffset = 168/k,
							bgWidth = 199/k + 4/k;
							if(d.x > (width-bgWidth)){
								bgX = -bgWidth - bgX;
							}
							
							var titleX = bgX + titleOffset,
								lockedX = bgX + lockedOffset;
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info")).select(".titleBg").attr("x",bgX);
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info")).select(".title").attr("x",titleX);
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info")).select(".locked").attr("x",lockedX);
							if(d3.select(view.escapeIdForJquery("#" + d.identifier)).classed("active")){
								d3.select(view.escapeIdForJquery("#" + d.identifier + "_radial"))
									.transition()
										.attr("width", 80*zoomRatio)
										.attr("height", 80*zoomRatio)
										.attr("x", -40*zoomRatio)
										.attr("y", -40*zoomRatio)
										.duration(125);
								d3.select(view.escapeIdForJquery("#" + d.identifier + "_info"))
									.transition()
										.style("opacity",1)
										.duration(250)
										.delay(200);
							}
						})
						.on("mouseout", function(d){
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info"))
								.transition()
								.duration(250)
								.style("opacity",0);
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_radial"))
								.transition()
								.attr("width", 0)
								.attr("height", 0)
								.attr("x", 0)
								.attr("y", 0)
								.duration(100)
								.delay(250);
						});
					
					var forceNodeInfo = forceNode.append("svg:g")
						.attr("class","nodeInfo")
						.attr("id", function(d){ return d.identifier + "_info"; });
					
					forceNodeInfo.append("svg:image")
						.attr("xlink:xlink:href","themes/starmap/navigation/map/images/menu-locked.png")
						.attr("width", 24/k)
						.attr("height", 16/k)
						.attr("x", 168/k)
						.attr("y", -52/k)
						.attr("class", "locked");
	
					forceNodeInfo.append("svg:image")
						.attr("xlink:xlink:href","themes/starmap/navigation/map/images/menu-header-blank.png")
						.attr("width", 199/k)
						.attr("height", 36/k)
						.attr("x", 16/k)
						.attr("y", -36/k)
						.attr("class", "titleBg");
	
					var forceNodeText = forceNodeInfo.append("svg:text")
						.attr("x", 30/k)
						.attr("y", -13/k)
						.attr("class", "title")
						.style("font-size", function(){ return 12/k + 'pt'; });
	
					forceNodeText.append("svg:tspan")
						.text(function(d){ return "#" + (d.position+1) + ""; })
						.attr("class", "pos");
	
					forceNodeText.append("svg:tspan")
						.text(function(d){ return  "" + (d.title) + ""; })
						.attr("class", "name")
						.attr("dx", 4/k);
					/*forceNode.append("svg:circle")
						.attr("class","detail")
						.attr("r", 3.5)
						.attr("cx",5)
						.attr("cy",5);
					forceNode.append("svg:text")
						.text(function(d){ return "" + (d.position+1) + ""; })
						.attr("class","detail")
						.attr("text-anchor", "middle")
						.attr('x',5)
						.attr("y",7);*/
	
					// add neighboring nodes to each node
					/*links.filter(function(d){ return d.type === "path"; }).forEach(function(link) {
					    var source = force.nodes()[link.source], target = force.nodes()[link.target];
					    if(source && target){
					    	(source.neighbors || (source.neighbors = [])).push(target);
						    (target.neighbors || (target.neighbors = [])).push(source);
					    }
					});*/
	
					// update the activity (or top-level step) items
					forceSeq = g.selectAll("g.seq")
						.data(force.nodes().filter(function(d) {
							return (d.type === "sequence") || (d.hasOwnProperty("master") && d.master);
						}))
						.enter().append("svg:g")
						.attr("class", "item seq")
						.attr("data-group", function(d){ return d.group; })
						.attr('id', function(d){ return d.identifier })
						.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
						.on("click", function(d){
							if(d.type === "sequence"){
								zoom(this, d);
							} else {
								renderNode(d);
							}
						})
						.on("touchstart", function(d){ zoom(this, d); });
					if(editable){
						// map is editable (authoring mode), so allow dragging of activity items
						forceSeq.call(sDrag);
					}
	
					forceSeq.append("svg:image")
						.attr("xlink:xlink:href","themes/starmap/navigation/map/images/menu-radial.png")
						.attr("width", 0)
						.attr("height", 0)
						.attr("x", 0)
						.attr("y", 0)
						.attr("id", function(d){ return d.identifier + "_radial"; })
						.attr("class", "radial");
	
					forceSeq.append("svg:image")
						.attr("id",function(d){ return "anchor_" + d.identifier; })
						.attr("xlink:xlink:href", function(d){
							if(d.type === "sequence"){
								return "themes/starmap/navigation/map/images/star-bronze.png"; // TODO: replace with default icon as specified in theme config
							} else {
								return getIcon(d); // item is a step (not an activity), so use step icon
							}
						}) 
						.attr("x", -18)
						.attr("y", -18)
						.attr("width", 36)
						.attr("height", 36)
						.attr("transform", function(d){
							if(d.type === "sequence"){
								var num = Math.floor(Math.random()*2),
								flip = (num>0) ? true : false,
										flipTrans = "";
								if(flip){
									flipTrans = " scale(-1 1)";
								}
								return "rotate(" + (Math.floor((Math.random()*60))-30) + ")" + flipTrans;
							} else {
								return "";
							}
						})
						.attr("class", "icon")
						// bind mouse hover events to show and hide item details
						.on("mouseover", function(d){
							this.parentNode.parentNode.appendChild(this.parentNode);
							// adjust position of rollover info (left or right of icon) to ensure it doesn't get cut off by edge of layout
							var bgX = 16,
							titleOffset = 14,
							lockedOffset = 168,
							bgWidth = 199 + 4;
							if(d.x > (width-bgWidth)){
								bgX = -bgWidth - bgX;
							}
							
							var titleX = bgX + titleOffset,
								lockedX = bgX + lockedOffset;
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info")).select(".titleBg").attr("x",bgX);
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info")).select(".title").attr("x",titleX);
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info")).select(".locked").attr("x",lockedX);
							if(!d3.select(view.escapeIdForJquery("#" + d.identifier)).classed("active")){
								d3.select(view.escapeIdForJquery("#" + d.identifier + "_radial"))
									.transition()
										.attr("width", 96)
										.attr("height", 96)
										.attr("x", -48)
										.attr("y", -48)
										.duration(125);
								d3.select(view.escapeIdForJquery("#" + d.identifier + "_info"))
									.transition()
										.style("opacity",1)
										.duration(250)
										.delay(200);
							}
						})
						.on("mouseout", function(d){
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_info"))
								.transition()
								.duration(250)
								.style("opacity",0);
							d3.select(view.escapeIdForJquery("#" + d.identifier + "_radial"))
								.transition()
								.attr("width", 0)
								.attr("height", 0)
								.attr("x", 0)
								.attr("y", 0)
								.duration(100)
								.delay(250);
						});
	
					var forceSeqInfo = forceSeq.append("svg:g")
						.attr("class","seqInfo")
						.attr("id", function(d){ return d.identifier + "_info"; });
	
					forceSeqInfo.append("svg:image")
						.attr("xlink:xlink:href","themes/starmap/navigation/map/images/menu-header-blank.png")
						.attr("width", 199)
						.attr("height", 36)
						.attr("x", 16)
						.attr("y", -36)
						.attr("class", "titleBg");
					
					forceSeqInfo.append("svg:image")
						.attr("xlink:xlink:href","themes/starmap/navigation/map/images/menu-locked.png")
						.attr("width", 24)
						.attr("height", 16)
						.attr("x", 168)
						.attr("y", -52)
						.attr("class", "locked");
	
					var forceSeqText = forceSeqInfo.append("svg:text")
						.attr("x", 30)
						.attr("y", -13)
						.attr("class", "title");
	
					forceSeqText.append("svg:tspan")
						.text(function(d){ return "#" + (d.position+1) + ""; })
						.attr("class", "pos");
	
					forceSeqText.append("svg:tspan")
						.text(function(d){ return  "" + (d.title) + ""; })
						.attr("class", "name")
						.attr("dx", 4);
	
					// Update the links
					g.selectAll("path.link")
						.data(force.links().filter(function(d){ return d.type; }))
						.enter().insert("path", ".node")
						.attr("class", function(d){
							if(d.type==="seq-path"){
								return "link path";
							} else if(d.type==="seq-seq"){
								return "link seq";
							}
						})
						.attr("d",function(d){ return "M" + d.source.x + " " + d.source.y + " L" + d.target.x + " " + d.target.y; })
						.attr("data-group", function(d){ return d.group; })
						.style("stroke-dasharray", ("2, 2"));
	
					// update the hulls
					/*g.selectAll("path.hull")
					    .data(groups)
					      .attr("d", groupPath)
					    .enter().insert("path",".node")
					      .attr("class", "hull")
					      .attr("id", function(d){ return d.key + "-wrap"; })
					      .attr('data-group', function(d){ return d.key })
					      .style("stroke-linejoin", "round")
					      .attr("d", groupPath)
					      .attr('stroke-width',40);*/
	
					/*g.selectAll("path.target")
					    .data(groups)
					    	.attr("d", groupPath)
					    .enter().insert("path",".seq")
							.attr("class", "target")
							.attr("id", function(d){ return d.key + "-target"; })
							.attr('data-group', function(d){ return d.key })
							.style("stroke-linejoin", "round")
							.attr("d", groupPath)
							.attr('stroke-width',40)
							.on("click", function(){ zoom(this); })
							.on("touchstart", function(){ zoom(this); });*/

					// run layout a fixed number of times again to finish convergence
					
					g.selectAll('.item').each(function(d){
						if(!d.isFixed){
							d.fixed = false;
						} 
					});
					force.start();
					if(!layoutIsSet){
						n = 10;
						for (i = n * n; i > 0; --i) force.tick();
					} else {
						force.tick();
					}
					force.stop();
					g.selectAll('.item').each(function(d){
						d.fixed = true;
						// ensure each node item is rendered above links
						this.parentNode.appendChild(this);
					});
					loaded = true;
					
					// fire completion callback
					complete();
				}, 10);
			}

			function tick(e){
				//g.selectAll("circle.item")
					//.attr("cx", function(d) { return d.x; })
					//.attr("cy", function(d) { return d.y; });
	
				/*g.selectAll("g.item").attr("transform", function(d) { 
					//var zoom = d.current ? "1.25" : "1";
					//return "translate(" + d.x + "," + d.y + ")scale(" + zoom + "," + zoom + ")"; 
					return "translate(" + d.x + "," + d.y + ")scale(1,1)";
				});*/
	
				/*g.selectAll("g.item circle.main").attr("r", function(d){
					return (d3.select(this).classed('mouseover') || d.current) ? r+2 : r;
				});*/
				
				// adjust positions for offset
				g.selectAll("g.item.seq").each(function(d) {
					// adjust positions for offset
					d.x += (forceXMid - width/2)*.2*e.alpha;
					d.y += (forceYMid - height/2)*.2*e.alpha;
				});
				
				// move children towards parents
				/*g.selectAll("g.item.node").each(function(d) {
					var groupX = 0,
						groupY = 0;
					d3.selectAll(view.escapeIdForJquery('#' + d.group)).each(function(t){
						groupX = t.x;
						groupY = t.y;
					});
					d.x += (d.x-groupX)*.005*e.alpha;
					d.y += (d.y-groupY)*.005*e.alpha;
				});*/

				// constrain items to map bounds
				g.selectAll("g.item").each(function(d) {
					// ensure node positions are numerical
					// TODO: not sure if this is helping at all; need to figure out why we sometimes get NaN values
					if(isNaN(d.x)) d.x = width/2;
					if(isNaN(d.y)) d.y = height/2;
					if(isNaN(d.px)) d.px = d.x;
					if(isNaN(d.py)) d.py = d.y;
					
					var pad = d.master ? 0 : 20,
						xMax = forceX2+pad,
						xMin = forceX1-pad,
						yMax = forceY2+pad,
						yMin = forceY1-pad;
						
					if(d.x > xMax) d.x = xMax;
					if(d.x < xMin) d.x = xMin;
					if(d.y > yMax) d.y = yMax;
					if(d.y < yMin) d.y = yMin;
				});
				
				if(!loaded){
					var i = 0,
						n = force.nodes().length,
						qm = d3.geom.quadtree(masters),
						qc = d3.geom.quadtree(children);
						q = d3.geom.quadtree(force.nodes());

					while (++i < n) {
						qm.visit(collide(force.nodes()[i]));
					}
					
					i = 0;
					while (++i < n) {
						qc.visit(collide(force.nodes()[i]));
					}
				}
				
				/*if(!loaded){
					var i = 0,
						n = masters.length,
						qm = d3.geom.quadtree(masters),
						qc = d3.geom.quadtree(children);
						q = d3.geom.quadtree(force.nodes());
					var group = [];
					while (++i < n) {
						qm.visit(collide(masters[i]));
						var a = 
						group = d3.selectAll(view.escapeIdForJquery('#' + masters[i].group));
						qg = d3.geom.quadtree(group);
						for(var a=0; a<qg.length; a++){
							qg.visit(collide(group[a]));
						}
					}
				}*/

				g.selectAll("g.item").attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

				g.selectAll("path.link").attr("d",function(d){ return "M" + d.source.x + " " + d.source.y + " L" + d.target.x + " " + d.target.y; });

				//g.selectAll("path.hull").attr("d", groupPath);

				//g.selectAll("path.target").attr("d", groupPath);
			};

			force.on("tick", function(e) {
				tick(e);
			});

			draw();
		});
	};
	
	// private functions
	
	// returns a list of all nodes under the root
	function flatten(root) {
		var nodes = [], a = 0, s = 0,
			n = masterIds.length,
			spacing = forceW/n,
			startX = forceXMid - spacing*n/2;

		function recurse(node,id) {
			var isMaster = ($.inArray(node.identifier,masterIds) > -1),
				hasChildren = (typeof node.children !== "undefined");
			if (hasChildren || isMaster) {
				node.group = node.identifier;
				var x = startX + s*spacing;
				//var y = Math.random()*height;
				var y = forceYMid + Math.random()*6 - 6;
				//var x = 10*(s%10);
				node.x = x;
				node.y = y;
				if(hasChildren){
					for(var i=0; i<node.children.length; i++){
						node.children[i].position = i;
						//var e = 10*i;
						//node.children[i].x = x+e;
						//node.children[i].y = y+e;
						node.children[i].x = node.x*1;
						node.children[i].y = node.y*1;
						recurse(node.children[i],node.identifier);
					}
				}
				if(isMaster){
					++s;
					node.master = true;
				}
				//node.children.forEach(recurse);
			} else {
				node.group = id;
			}
			++a;
			//if (!node.id) node.id = a;
			nodes.push(node);
		};

		recurse(root);
		return nodes;
	};

	function getChildren(d,seqs,steps,full){
		if(d.hasOwnProperty('refs')){
			d.children = [];
			var refs = d.refs;
			for(var i=0;i<refs.length;i++){
				var id = refs[i],
					item = getItem(id,seqs,steps,full);
				d.children.push(item);
			}
		}
		return d;
	};

	function getItem(id,seqs,steps,full){
		var item,
			i = 0;
		for(;i<seqs.length;++i){
			//$.each(seqs, function(i,d){
			var d = seqs[i];
			if(d.identifier === id){
				if(id === start){
					// loop through master sequence and set 'master' variable to true for each item
					if(d.hasOwnProperty('refs')){
						var refs = d.refs;
						for(var i=0;i<refs.length;i++){
							masterIds.push(refs[i]);
						}
					}
					item = getChildren(d,seqs,steps);
				}
				// item is a sequence, get children and return seq object
				if(full){
					item = getChildren(d,seqs,steps,full);
				} else {
					item = d;  
				}
				break;
			}
		}
		i = 0;
		for(;i<steps.length;++i){
			//$.each(steps, function(i,d){
			var d = steps[i];
			if(d.identifier === id){
				if(d.position===0){
					d.current = true;
				}
				// item is a step, return step object
				item = d;
				break;
			}
		}

		return item;
	};
	
	function getAttributes(){
		var nodeAttributes = {};
		g.selectAll("g.item").each(function(d) { 
			var id = d.identifier,
				x = d.x,
				y = d.y,
				attr = {"x": x, "y": y};
			nodeAttributes[id] = attr;
		});
		return nodeAttributes;
	}
	
	function reset(){
		$('#activityControls').delay(250).slideUp(250);
		d3.select('#mapBgImg').classed('zoom',false);
		g.classed("zoom", false)
			.transition()
			.duration(750)
			.delay(600)
			.ease("cubic-out")
			.attr("transform", "scale(1) translate(1)");

		d3.selectAll('.item, .link, .target, .hull')
			.classed('active',false);

		d3.selectAll('.item, .link, .hull')
			.classed('inactive',false);

		zoomed = false;
	}
	
	// public API functions and variables
	chart.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return chart;
	};

	chart.width = function(_) {
		if (!arguments.length) return width;
		width = _;
		return chart;
	};

	chart.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		return chart;
	};

	chart.title = function(_) {
		if(!arguments.length) return title;
		title = _;
		return chart;
	};

	chart.stepTerm = function(_) {
		if(!arguments.length) return stepTerm;
		stepTerm = _;
		return chart;
	};

	chart.fluid = function(_) {
		if(!arguments.length) return fluid;
		fluid = _;
		return chart;
	};

	chart.editable = function(_) {
		if(!arguments.length) return editable;
		editable = _;
		return chart;
	};

	chart.view = function(_) {
		if(!arguments.length) return view;
		view = _;
		return chart;
	};

	chart.complete = function(_) {
		if(!arguments.length) return complete;
		complete = _;
		return chart;
	};
	
	chart.attributes = function(_){
		if(!arguments.length) return getAttributes();
		attributes = _;
		return chart;
	};

	chart.reset = function() {
		reset();
		return chart;
	};

	return chart;
};

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/themes/starmap/navigation/map/js/starmap.js');
}
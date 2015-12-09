/** Create World object - a child of the easeljs Continer that contains all box2d elements a. */
	(function (window){
		function World(width_px, height_px){
			this.Container_constructor();
			this.createWorld(width_px, height_px);			
		}
		var p = createjs.extend(World, createjs.Container);	
		p.Container_initialize = World.prototype.initialize;
		p.Container_tick = World.prototype._tick;

		/** This function is used at the end of a trial to store data appropriately */
		p.completeTrial = function (){
			if (this.trial_ticks >= 0){
				// if this is not first trial add previous trial data to table
				if (this.trial_count > 0){
					// add values from previous trial to table
					var newvals = {};
					for (var key in worldSpecs.uivars){
						var uivar = worldSpecs.uivars[key];
						// I should have already attached in_table in all cases
						if (uivar.in_table){
							// can either get value from eval of table_value
							var value = "";
							//checkbox
							if (typeof uivar.table_type !== "undefined" && uivar.table_type == "checkbox"){
								value = "checkbox";
							} else if (typeof uivar.table_value  !== "undefined"){
								value = eval(uivar.table_value);
							} else if (typeof uivar.in_ui  !== "undefined"){
								// use the value from the dom object
								if (uivar.type == "slider"){
									value = $("#"+uivar.type+"-"+key).slider("option", "value");
								} else {
									value = $("#"+uivar.type+"-"+key).attr("value");
								}						
							} else if (typeof uivar.value !== "undefined"){
								value = uivar.value
							}
							if (value != null) newvals[uivar.table_name] = {text:value};
							if (typeof uivar.table_style === "string") newvals[uivar.table_name].style = uivar.table_style;
						}
					}
					// now that we have new vals go through table and update
					for (var ci = 0; ci < this.tableData.length; ci++){
						// check type of variable
						if (newvals[this.tableData[ci][0].text] != null && newvals[this.tableData[ci][0].text].text != null){
							var cell;
							if (newvals[this.tableData[ci][0].text].text == "checkbox"){
								cell = {checked:true,uneditable:false};
							} else {
								cell = {text:newvals[this.tableData[ci][0].text].text,uneditable:true};
							}	
							if (newvals[this.tableData[ci][0].text].style != null)
								cell.style = newvals[this.tableData[ci][0].text].style;
							this.tableData[ci].push(cell);
						} 
					}

					// store trial in worldSpecs plots array
					if (worldSpecs.plots != null){
						for (key in worldSpecs.plots){
							// find data from current run
							var plot = this.plots[key];
							var plotSpecs = worldSpecs.plots[key];
							
							for (var i = 0; i < plotSpecs.series.length; i++){
								if (plot.series[plot.currentSeriesIndex+i] != null){
									// plot has the full "HighCharts" data, the plotSpecs have just x,y
									var data = plot.series[plot.currentSeriesIndex+i].data.slice();
									var pdata = [];
									// manually copy so that new changes don't update previous
									for (var j = 0; j < data.length; j++){
										pdata.push({x:data[j].x, y:data[j].y});
									}
									plotSpecs.series[i].previousData[this.trial_count] = pdata;
								}
							}
						}
					}
				}
			}
			//this.renderTable("table1");
			this.trial_ticks = -1;
		}

		/** This function sets up data for the next trial */
		p.newTrial = function(doNotIncrement){
			doNotIncrement = doNotIncrement != null ? doNotIncrement : false;			
			// setup new data arrays for top-level objects
			for (var i=0; i < worldSpecs.objects.length; i++){
				var specs = worldSpecs.objects[i];
				if (typeof specs.data !== "undefined" && specs.data.length > 0){
					var object = this.getObjectBySpecs(specs);
					if (object != null){
						// automatically get "position"
						if (specs.data.indexOf("position") == -1) specs.data.push("position");
						// automatically get "direction_change_count"
						if (specs.data.indexOf("direction_change_count") == -1) specs.data.push("direction_change_count");
						// if acceleration is present automatically get velocity
						if (specs.data.indexOf("acceleration") > -1) specs.data.push("velocity");
										
						object.data = {};
						for (var j=0; j < specs.data.length; j++){
							var datum = specs.data[j];
							object.data[datum] = [];
						}
					}
				}
			}
			if (!doNotIncrement) this.trial_count++;
		}

		/** After any objects have been replaced */
		p.startTrial = function(){
			this.trial_ticks = 0;
			// update series data for the start of this trial
			this.updateSeriesData(5);
			this.lostStarted = false;
			
			// empty data from plots
			for (var plotid in this.plots){
				var plot = this.plots[plotid];
				var plotSpecs = worldSpecs.plots[plotid];
				// set an index to point at the latest added series
				plot.currentSeriesIndex = plot.series.length;
					
				// search through ui variables to make sure that this plot is active (y value)
				var foundThisPlot = false;
				for (var key in worldSpecs.uivars){
					var uivar = worldSpecs.uivars[key];
					if (typeof uivar.plot_id === "string" && uivar.plot_id == plotid){
						var value = eval(uivar.value);
						if (value != null && uivar.axis == "y"){
							foundThisPlot = true;
						}
					}
				}

				if (foundThisPlot){
					if (plot.legend != null){
						plot.legend.group.show();
					} 
					
					// if we exceed the showPreviousCount, then remove the first series
					if (typeof plotSpecs.showPreviousCount === "number" && (plotSpecs.showPreviousCount * plotSpecs.series.length) <= plot.series.length && plot.series.length > 0){
						// remove the first series
						for (var i = 0; i < plotSpecs.series.length; i++){
							plot.series[0].remove();
						}
						plot.currentSeriesIndex = plot.series.length;
					}

					for (var i = 0; i < plotSpecs.series.length; i++){
						var series = plotSpecs.series[i];
						// copy series from worldSpecs
						var newSeries = {};
						for (var key in series){
							if (typeof series[key] === "number" || typeof series[key] === "string" || typeof series[key] === "boolean"){
								newSeries[key] = plotSpecs.series[i][key];
							}
						}
						newSeries.id = newSeries.id + "-T" + this.trial_count;
						newSeries.name = newSeries.name + " #" + this.trial_count;
						newSeries.data = [];
						if (newSeries.color == null) newSeries.color = this.getSeededColor(this.trial_count);
						
						plot.addSeries(newSeries);					
					}
				}
			}
			// save initial values of uivars that are in ui
			for (var key in worldSpecs.uivars){
				var uivar = worldSpecs.uivars[key];
				if (uivar.in_ui || uivar.in_table){
					uivar.value_trial_start = uivar.value;
				}
			}
		}

		/** This handler is permanent, so in uivars "show_plot" must be used as a key to get this functionality */
		p.handle_show_plot_change = function (ui){
			// make sure that we can gather the trial # from the table
			var trial = -1;
			var trow = parseInt(ui.id.match("[0-9]+")[0]);
			if (trow > 0 && trow < this.tableData[0].length){
				var tcol = -1;
				for (var ci = 0; ci < this.tableData.length; ci++){
					if (this.tableData[ci][0].text == "Trial #" || this.tableData[ci][0].text == "Trial" || this.tableData[ci][0].text == "#"){
						tcol = ci;
						break;
					}
				}
				if (tcol >= 0 && tcol < this.tableData.length){
					trial = parseInt(this.tableData[tcol][trow].text);
				} else {
					console.log("Cannot find column for the trial", ui);
					return;
				}
			} else {
				console.log("Cannot find row for the trial", ui);
				return;
			}

			if (ui.checked){
				// add a previous trial
				for (var plotid in worldSpecs.plots){
					var plotSpecs = worldSpecs.plots[plotid];
					for (var i = 0; i < plotSpecs.series.length; i++){
						var series = plotSpecs.series[i];
						var pdata = plotSpecs.series[i].previousData[trial];
						if (pdata != null && pdata.length > 0){
							// copy previous series
							var previousSeries = {};
							for (var key in series){
								if (typeof series[key] === "number" || typeof series[key] === "string" || typeof series[key] === "boolean"){
									previousSeries[key] = plotSpecs.series[i][key];
								}
							}
							previousSeries.id = previousSeries.id + "-T" + trial;
							previousSeries.name = previousSeries.name + " #" + trial;
							previousSeries.data = pdata;
							previousSeries.color = this.getSeededColor(trial); // random color
							this.plots[plotid].addSeries(previousSeries);
						} else {
							console.log("No previous data here", plotsepcs.series[i]);
						}
					}
				}				
			} else {
				// search through current plots looking for trial, then remove
				for (var plotid in this.plots){
					var plot = this.plots[plotid];
					for (var i = 0; i < plot.series.length; i++){
						var series = plot.series[i];
						if (series.userOptions.id.search("-T"+trial) > -1){
							series.remove();		
							// if we are currently running change the currentSeriesIndex
							if (i < this.plots[plotid].currentSeriesIndex){
								this.plots[plotid].currentSeriesIndex--;	
							}
						}
					}
				} 
			}
		}

///////////////////////// OBJECT CREATION AND DELETION /////////////////////////
		p.createWorld = function(width_px, height_px){
			for (var key in worldSpecs.settings){
				this[key] = worldSpecs.settings[key];
			}
			// easel js
			this.width_px = width_px;
			this.height_px = height_px;
			this.wall_width_px = 7;
			this.ground_height_px = 14;
			this.width_units = this.width_px / this.SCALE;
			this.height_units = this.height_px / this.SCALE;
			this.wall_width_units = this.wall_width_px / this.SCALE;
			this.ground_height_units = this.ground_height_px / this.SCALE / 2;

			this.shelf_y_px = height_px / 2;
			this.shelf_y = this.shelf_y_px / this.SCALE;
			this.shelf_width_px = width_px * 2/3;
			this.shelf_width = this.shelf_width_px / this.SCALE;
			this.shelf_height_px = 7;
			this.shelf_height = this.shelf_height_px / this.SCALE;
			this.shelf_x_px = (this.width_px - this.shelf_width_px) / 2;
			this.shelf_x = this.shelf_x_px / this.SCALE;
			
			// saves details of current object
			this.dragging_object = null;

			////////// easel
			var g = this.g = new createjs.Graphics();
			this.shape = new createjs.Shape(g);
			this.addChild(this.shape);
			
			
			// draw a shelf
			if (worldSpecs.settings.draw_shelf)
				this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,this.shelf_y_px,0,this.shelf_y_px + this.shelf_height_px).moveTo(this.shelf_x_px, this.shelf_y_px).lineTo(this.shelf_x_px, this.shelf_y_px+this.shelf_height_px).lineTo(this.shelf_x_px+this.shelf_width_px, this.shelf_y_px+this.shelf_height_px).lineTo(this.shelf_x_px+this.shelf_width_px, this.shelf_y_px).lineTo(this.shelf_x_px,this.shelf_y_px).endFill();

			
			this.position_x = 0;
			this.position_y = 0;
			///////// b2 
			this.b2 = new b2World(new b2Vec2(0, 10), true);
			this.activeBodies = {};
			this.activeJoints = {};
			this.activeForces = {};
			this.composites = {};

			// ground shape drawing is offloaded because it can be changed
			this.groundShape = new createjs.Shape();
			this.addChild(this.groundShape);
			this.createGround(.5);

			if (typeof worldSpecs.settings.draw_left_wall === "boolean" && worldSpecs.settings.draw_left_wall){
		  		var leftWallFixture = new b2FixtureDef;
		  		leftWallFixture.density = 1;
		  		leftWallFixture.restitution = 0;
		  		leftWallFixture.filter.categoryBits = 2;
		  		leftWallFixture.filter.maskBits = 3;
		  		leftWallFixture.shape = new b2PolygonShape;
		  		leftWallFixture.shape.SetAsBox(this.wall_width_units / 2 , this.height_units / 2);
		  		var leftWallBodyDef = new b2BodyDef;
		  		leftWallBodyDef.type = b2Body.b2_staticBody;
		  		leftWallBodyDef.position.x = this.position_x + this.wall_width_units / 2;
		  		leftWallBodyDef.position.y = this.position_y + this.height_units / 2;
		  		var leftWall = this.b2.CreateBody(leftWallBodyDef);
		  		leftWall.CreateFixture(leftWallFixture);
		  		leftWall.SetUserData({type:"static"});

		  		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,0,this.wall_width_px,0).moveTo(0,0).lineTo(this.wall_width_px,0).lineTo(this.wall_width_px,this.height_px - this.wall_width_px).lineTo(0, this.height_px).lineTo(0,0).endFill();

		  	}

		  	if (typeof worldSpecs.settings.draw_right_wall === "boolean" && worldSpecs.settings.draw_right_wall){	  	
		  		var rightWallFixture = new b2FixtureDef;
		  		rightWallFixture.density = 1;
		  		rightWallFixture.restitution = 0;
		  		rightWallFixture.filter.categoryBits = 2;
		  		rightWallFixture.filter.maskBits = 3;
		  		rightWallFixture.shape = new b2PolygonShape;
		  		rightWallFixture.shape.SetAsBox(this.wall_width_units / 2, this.height_units / 2);
		  		var rightWallBodyDef = new b2BodyDef;
		  		rightWallBodyDef.type = b2Body.b2_staticBody;
		  		rightWallBodyDef.position.x = this.position_x + this.width_units - this.wall_width_units / 2;
		  		rightWallBodyDef.position.y = this.position_y + this.height_units / 2;
		  		var rightWall = this.b2.CreateBody(rightWallBodyDef);
		  		rightWall.CreateFixture(rightWallFixture);
		  		rightWall.SetUserData({type:"static"});
		  		// walls
		  		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],this.width_px - this.wall_width_px,0,this.width_px, 0).moveTo(this.width_px,0).lineTo(this.width_px-this.wall_width_px,0).lineTo(this.width_px-this.wall_width_px,this.height_px - this.wall_width_px).lineTo(this.width_px, this.height_px).lineTo(this.width_px,0).endFill();
			
		  	}

		  	// draw ground
		  	this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0], 0, this.height_px - this.wall_width_px, 0, this.height_px).moveTo(0,this.height_px).lineTo(this.width_px,this.height_px).lineTo(this.width_px-this.wall_width_px,this.height_px-this.wall_width_px).lineTo(this.wall_width_px, this.height_px-this.wall_width_px).lineTo(0,this.height_px).endFill();


	  		if (typeof worldSpecs.settings.draw_shelf === "boolean" &&worldSpecs.settings.draw_shelf){
		  		var shelfFixture = new b2FixtureDef;
		  		shelfFixture.density = 1;
		  		shelfFixture.restitution = 0.2;
		  		shelfFixture.filter.categoryBits = 2;
		  		shelfFixture.filter.maskBits = 3;
		  		shelfFixture.shape = new b2PolygonShape;
		  		shelfFixture.shape.SetAsBox(this.shelf_width / 2, this.shelf_height / 2);
				var shelfBodyDef = new b2BodyDef;
		  		shelfBodyDef.type = b2Body.b2_staticBody;
		  		shelfBodyDef.position.x = this.position_x + this.shelf_x + this.shelf_width/2;
		  		shelfBodyDef.position.y = this.position_y + this.shelf_y + this.shelf_height/2;
		  		var shelf = this.shelf = this.b2.CreateBody(shelfBodyDef);
		  		shelf.CreateFixture(shelfFixture);
		  		shelf.SetUserData({type:"static"});
		  	}
			
			if (debug){
				var debugDraw = this.debugDraw = new b2DebugDraw;
				debugDraw.SetSprite(document.getElementById("debugcanvas").getContext("2d"));
				debugDraw.SetDrawScale(this.SCALE);
				debugDraw.SetFillAlpha(1.0);
				debugDraw.SetLineThickness(1.0);
				debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_controllerBit);
				this.b2.SetDebugDraw(debugDraw);
			}

			// setup trial information
			// set up a table using same format as the table step top level is columns, second level is the rows, values are in objects
			this.plots = [];
			this.tableData = [];
			for (var key in worldSpecs.uivars){
				if ((typeof worldSpecs.uivars[key].in_table !== "undefined" && worldSpecs.uivars[key].in_table) || typeof worldSpecs.uivars[key].table_name !== "undefined" || typeof worldSpecs.uivars[key].table_value !== "undefined"){
					worldSpecs.uivars[key].in_table = true;
					var name = typeof worldSpecs.uivars[key].table_name === "string" ? worldSpecs.uivars[key].table_name : (typeof worldSpecs.uivars[key].name === "string" ? worldSpecs.uivars[key].name : key);
					worldSpecs.uivars[key].table_name = name;
					var cell = {text:name,  uneditable:true};
					if (typeof worldSpecs.uivars[key].table_style === "string")
						cell.style = worldSpecs.uivars[key].table_style;
					this.tableData.push([cell]);					
				} else {
					worldSpecs.uivars[key].in_table = false;
				}
			}
			this.trial_count = 0; //increments in newTrial
			this.trial_ticks = -1;
			this.lostStarted = false; // for loss of kinetic energy

			// add all objects
	  		for (var i = 0; i < worldSpecs.objects.length; i++){
	  			this.createObjectInWorld(worldSpecs.objects[i], null, null, true);
	  		}
	  		
	  		// define forces on objects
	  		if (typeof worldSpecs.forces !== "undefined"){
		  		for (i = 0; i < worldSpecs.forces.length; i++){
		  			var force = {};
		  			if (worldSpecs.forces[i].id_body != null){
		  				var bodyFound = false;
		  				for (var key in this.activeBodies){
		  					if (worldSpecs.forces[i].id_body == this.activeBodies[key].specs.id){
		  						force.body = this.activeBodies[key].body;
		  						bodyFound = true;
		  						break;
		  					}
		  				}
		  				if (bodyFound){
		  					force.impulse = typeof worldSpecs.forces[i].impulse === "boolean" ? worldSpecs.forces[i].impulse : false;
		  					force.id = typeof worldSpecs.forces[i].id === "string" ? worldSpecs.forces[i].id : ("f"+i);
		  					force.id_body = typeof worldSpecs.forces[i].id_body === "string" ? worldSpecs.forces[i].id_body : null;
		  					force.force = typeof worldSpecs.forces[i].force !== "undefined" ? worldSpecs.forces[i].force : new b2Vec2(0,0);
		  					force.max_force = typeof worldSpecs.forces[i].max_force !== "undefined" ? worldSpecs.forces[i].max_force : 1000;
		  					force.max_force_change = typeof worldSpecs.forces[i].max_force_change !== "undefined" ? worldSpecs.forces[i].max_force_change : force.max_force;
		  					force.direction = typeof worldSpecs.forces[i].direction !== "undefined" ? worldSpecs.forces[i].direction : new b2Vec2(1,0);
		  					force.point = force.body.GetWorldCenter();
		  					force.prev_force = new b2Vec2(0, 0);
		  					force.spillover_force = new b2Vec2(0, 0);

		  					if (typeof worldSpecs.forces[i].pointRelativeBody !== "undefined"){
		  						force.point.x += worldSpecs.forces[i].pointRelativeBody.x;
		  						force.point.y += worldSpecs.forces[i].pointRelativeBody.y;
		  					}
		  					this.activeForces[force.id] = force;		  					
		  				}
		  			}
		  		}
			}

			// we will be saving previous trials in the worldSpecs, create a space here
			if (worldSpecs.plots != null){
				for (var key in worldSpecs.plots){
					var plotSpecs = worldSpecs.plots[key];
					// for each original series add a previous data
					for (var si = 0; si < plotSpecs.series.length; si++){
						plotSpecs.series[si].previousData = {}; // will associate trial num with data array
					}
				}
			}		
		}

		p.createGround = function(friction){
			if (this.ground != null) this.b2.DestroyBody(this.ground);
			worldSpecs.uivars.ground_friction.value = friction;
			var groundFixture = new b2FixtureDef;
			groundFixture.friction = friction;
	  		groundFixture.filter.categoryBits = 2;
	  		groundFixture.filter.maskBits = 3;
	  		groundFixture.shape = new b2PolygonShape;
	  		// if we don't have walls need to extend floor
	  		var w = this.width_units;
	  		if ((typeof worldSpecs.settings.draw_right_wall === "boolean" && !worldSpecs.settings.draw_right_wall) || (typeof worldSpecs.settings.draw_left_wall === "boolean" && !worldSpecs.settings.draw_left_wall)){
	  			w = 200;
	  		}
	  		/// NOTE EXTENDING FLOOR SO THAT IF WE DON'T HAVE A WALL IT DOESN'T FALL OFF THE 
	  		groundFixture.shape.SetAsBox(w / 2, 1.0 / 4 );
			var groundBodyDef = new b2BodyDef;
	  		groundBodyDef.type = b2Body.b2_staticBody;
	  		groundBodyDef.position.x = this.position_x + this.width_units / 2;
	  		groundBodyDef.position.y = this.position_y + this.height_units - this.ground_height_units / 2;
	  		var ground = this.ground = this.b2.CreateBody(groundBodyDef);
	  		ground.CreateFixture(groundFixture);
	  		ground.SetUserData({type:"static"});

			var shape = this.groundShape;
			var graphics = shape.graphics;
			//draw ground
			var r = Math.floor(100 + 155 - 155 * friction)
			var g = Math.floor(100 + 155 - 155 * friction);
			var b = Math.floor(50 + 55 - 55 * friction);
			graphics.clear().beginLinearGradientFill(["rgba("+r+","+g+","+b+",1.0)","rgba("+r+","+g+","+b+",1.0)"],[0,1.0],0,this.height_px-100,this.width_px,this.height_px).drawRect(this.wall_width_px, this.height_px-this.ground_height_px-this.wall_width_px, this.width_px-2*this.wall_width_px, this.ground_height_px).endFill();
		}

		/** Given specifications for an object will draw the b2 object and the easel graphics */
		p.createObjectInWorld = function(specs, shape, parent_position, initial_setup){
			var fd, bd, jd, body, joint, g, shape, ud, key, i, wp;
			parent_position = parent_position != null ? parent_position : new b2Vec2(0, 0); 
			initial_setup = initial_setup != null ? initial_setup : false; 
			// some objects are set to not be displayed in initial setup, if that is the case return here
			if (initial_setup && typeof specs.initial_setup === "boolean" && !specs.initial_setup) return;

			if (typeof specs.type === undefined){
				return;
			} else if (specs.class == "circle" || specs.class == "wheel" || specs.class == "rect"|| specs.class == "roundRect" || specs.class == "polygon"){
				// create fixture
				fd = new b2FixtureDef;
				if (specs.class == "circle" || specs.class == "wheel"){
					fd.shape = new b2CircleShape(specs.radius);
				} else if (specs.class == "rect" || specs.class == "roundRect"){
					fd.shape = new b2PolygonShape;
					fd.shape.SetAsBox(specs.width / 2, specs.height / 2);
				} else if (specs.class == "polygon"){
					fd.shape = new b2PolygonShape;
					fd.shape.SetAsArray(specs.b2FixtureDef.vertices);
				}
				if (specs.b2FixtureDef != null){
					for (key in specs.b2FixtureDef){
						if (key != "vertices") fd[key] = specs.b2FixtureDef[key];
					}
				}
				
				bd = new b2BodyDef();
				if (specs.b2BodyDef != null){
					for (key in specs.b2BodyDef){
						bd[key] = specs.b2BodyDef[key];
					}
					if (typeof specs.b2BodyDef.type === "undefined"){
						bd.type = b2Body.b2_dynamicBody;
					}
				}
				
				if (typeof bd.relative_position !== "undefined"){
					bd.position = new b2Vec2(bd.relative_position.x + parent_position.x, bd.relative_position.y + parent_position.y);
				}
				
				if (specs.class == "wheel" && typeof worldSpecs.uivars.wheel_friction !== "undefined"){
					//bd["angularDamping"] = worldSpecs.uivars.wheel_friction.value;
					bd["linearDamping"] = worldSpecs.uivars.wheel_friction.value;
				}
				//bd.position = specs.position
				body = this.b2.CreateBody(bd);
				body.CreateFixture(fd);
				ud = {};
				// add a shape if one is not give
				if (shape == null){
					g = new createjs.Graphics();
					ud.shape = new createjs.Shape(g);
					this.addChild(ud.shape); 			
				} else {
					ud.shape = shape;
				}
				if (specs.class == "circle" || specs.class == "wheel"){	
					ud.shape.width_px = 2 * specs.radius * this.SCALE;
					ud.shape.height_px = 2 * specs.radius * this.SCALE;
				} else if (specs.class == "rect" || specs.class == "roundRect"){	
					ud.shape.width_px = specs.width * this.SCALE;
					ud.shape.height_px = specs.height * this.SCALE;	
				} else if (specs.class == "polygon"){
					ud.shape.vertices = specs.b2FixtureDef.vertices;
					var minx = 1000;
					var maxx = 0;
					var miny = 1000;
					var maxy = 0;
					for (var i = 0; i < ud.shape.vertices.length; i++){
						if (ud.shape.vertices[i].x < minx){
							minx = ud.shape.vertices[i].x;
						}
						if (ud.shape.vertices[i].x > maxx){
							maxx = ud.shape.vertices[i].x;
						}
						if (ud.shape.vertices[i].y < miny){
							miny = ud.shape.vertices[i].y;
						}
						if (ud.shape.vertices[i].y > maxy){
							maxy = ud.shape.vertices[i].y;
						}
					}
					ud.shape.width_px = maxx - minx;
					ud.shape.height_px = maxy - miny;
				}
				ud.shape.left_px = -ud.shape.width_px / 2;
				ud.shape.right_px = ud.shape.width_px / 2;
				ud.shape.above_px = -ud.shape.height_px / 2;
				ud.shape.below_px = ud.shape.height_px / 2;
					
				// put mouse handler if this is a direct child of the world, otherwise the handler should be on the top container
				if (ud.shape.parent == this && this.mouseEnabled) ud.shape.addEventListener("mousedown", function(evt){evt.currentTarget.parent.shapePressHandler(evt);});
				ud.shape.body = body;
				ud.shape.specs = specs;
				ud.shape.initialized = false;
				ud.specs = specs;
				body.SetUserData(ud);	
				this.activeBodies[ud.specs.id] = ud.shape;
				this.updateForces();
				return ud.shape;		
			} else if (specs.class == "ramp"){
				// create body
				bd = new b2BodyDef();
				if (specs.b2BodyDef != null){
					for (key in specs.b2BodyDef){
						bd[key] = specs.b2BodyDef[key];
					}
					if (typeof specs.b2BodyDef.type === "undefined"){
						bd.type = b2Body.b2_staticBody;
					}
				}
				body = this.b2.CreateBody(bd);
				// create a series of trapezoidal fixtures to simulate concavity of the ramp
				var curx = 0;
				var cury = 0;
				var curp;
				var width = specs.width
				var pow = typeof specs.exponent !== "undefined" ? specs.exponent : 2;
				var a = typeof specs.coefficient !== "undefined" ? specs.coefficient : 0.1;
				var res = typeof specs.resolution !== "undefined" ? specs.resolution : 10;
				var incx = width / res;
				var edgevertices = [new b2Vec2(-width, 0)]; // used for drawing
				for (var i = 0; i < res; i++){
					fd = new b2FixtureDef();
					fd.shape = new b2PolygonShape;
					var vertices = [];
					curx = -i*incx; cury = -a*Math.pow(i*incx,pow); curp = new b2Vec2(curx, cury);
					vertices.push(curp); // edge
					edgevertices.push(curp);
					curx = -width; cury = -a*Math.pow(i*incx,pow); curp = new b2Vec2(curx, cury);
					vertices.push(curp); // back-bottom
					curx = -width; cury = -a*Math.pow((i+1)*incx,pow); curp = new b2Vec2(curx, cury);
					vertices.push(curp); // back-top
					// at top should be a triangle, not a trapezoid
					if (width - (i+1)*incx != 0){
						curx = -(i+1)*incx; cury = -a*Math.pow((i+1)*incx,pow); curp = new b2Vec2(curx, cury);
						vertices.push(curp); // edge-top
					} else {
						edgevertices.push(curp); // get top corner from back-top
					}
					fd.shape.SetAsArray(vertices);
					if (specs.b2FixtureDef != null){
						for (key in specs.b2FixtureDef){
							fd[key] = specs.b2FixtureDef[key];
						}
					}
					body.CreateFixture(fd);			
				}
				ud = {};
				if (shape == null){
					g = new createjs.Graphics();
					ud.shape = new createjs.Shape(g);
					this.addChild(ud.shape); 			
				} else {
					ud.shape = shape;
				}
				ud.shape.x = specs.b2BodyDef.position.x * this.SCALE;
				ud.shape.y = specs.b2BodyDef.position.y * this.SCALE;
				var gradient = typeof specs.easel.fill_colors !== "undefined" ? true : false;
				if (gradient){
					var fill_colors = typeof specs.easel.fill_colors !== "undefined" ? specs.easel.fill_colors : ['rgba(100, 100, 100, 1.0)'];
					var fill_ratios = typeof specs.easel.fill_ratios !== "undefined" ? specs.easel.fill_ratios : [0];
					var stroke_colors = typeof specs.easel.stroke_colors !== "undefined" ? specs.easel.stroke_colors : 'rgba(0, 0, 0, 1.0)';
					var stroke_ratios = typeof specs.easel.stroke_ratios !== "undefined" ? specs.easel.stroke_ratios : [0];
					var gradient_direction = typeof specs.easel.direction !== "undefined" ? specs.easel.direction : new b2Vec2(1, 1);
					var tl_x = -width*this.SCALE;
					var tl_y = 0;
					var br_x = edgevertices[Math.floor(edgevertices.length/2)].x*this.SCALE;
					var br_y = edgevertices[Math.floor(edgevertices.length/2)].y*this.SCALE;
					g.clear().beginLinearGradientStroke(stroke_colors, stroke_ratios, tl_x, tl_y, br_x, br_y).beginLinearGradientFill(fill_colors, fill_ratios, tl_x, tl_y, br_x, br_y);
					for (var i = 0; i < edgevertices.length; i++){
						var addx = 0; addy = 0;
						//if (i == 0){/*nothing*/}
						//else if (i == 1){ addx = 5; }
						//else if (i == edgevertices.length-1){addy = -5;}
						//else {addx = 5; addy = -5;}
						g.lineTo(edgevertices[i].x*this.SCALE+addx, edgevertices[i].y*this.SCALE+addy);
					}
					g.lineTo(edgevertices[0].x*this.SCALE, edgevertices[0].y*this.SCALE).endStroke().endFill();
				} else {
					var fill_color = typeof specs.easel.fill_color !== "undefined" ? specs.easel.fill_color : 'rgba(100, 100, 100, 1.0)';
					var stroke_color = typeof specs.easel.stroke_color !== "undefined" ? specs.easel.stroke_color : 'rgba(0, 0, 0, 1.0)';
					g.clear().beginStroke(stroke_color).beginFill(fill_color);
					for (var i = 0; i < edgevertices.length; i++){
						g.lineTo(edgevertices[i].x*this.SCALE+10, edgevertices[i].y*this.SCALE-5);
					}
					g.lineTo(edgevertices[0].x*this.SCALE, edgevertices[0].y*this.SCALE).endStroke().endFill();
				}				
				ud.shape.body = body;
				ud.shape.specs = specs;
				ud.specs = specs;
				this.activeBodies[ud.specs.id] = ud.shape;
				body.SetUserData(ud);					
				this.updateForces();
				return ud.shape;		
			} else if (specs.class == "distanceJoint" || specs.class == "prismaticJoint" || specs.class == "revoluteJoint"){
				if (specs.class == "distanceJoint"){
					jd = new b2DistanceJointDef();
				} else if (specs.class == "prismaticJoint"){
					jd = new b2PrismaticJointDef();
				} else if (specs.class == "revoluteJoint"){
					jd = new b2RevoluteJointDef();
				}
				
				var setlength = false;
				if (specs.b2JointDef != null){
					for (key in specs.b2JointDef){
						if (key == "bodyA" || key == "bodyB"){
							// this body should match an id, lookup in active bodies
							body = this.activeBodies[specs.b2JointDef[key]].body;
							if (body != null){
								jd[key] = body;
							} else {
								console.log("Could not find body", specs.b2JointDef[key]);
							}							
						} else {
							if (key == "length") setlength = true;
							jd[key] = specs.b2JointDef[key];	
						}						
					}
				}

				if (jd.bodyA == null || jd.bodyB == null) return;

				// if length was not set make it the distance between the two bodies
				if (!setlength){
					jd.length = Math.sqrt(Math.pow((jd.bodyA.GetPosition().x+jd.localAnchorA.x) - (jd.bodyB.GetPosition().x+jd.localAnchorB.x), 2)+Math.pow((jd.bodyA.GetPosition().y+jd.localAnchorA.y) - (jd.bodyA.GetPosition().y+jd.localAnchorB.y), 2));
				}
				
				joint = this.b2.CreateJoint(jd);
				joint.prevLength = 0;
				joint.prevAngle = 0;
				ud = {};
				if (shape == null){
					g = new createjs.Graphics();
					ud.shape = new createjs.Shape(g);	
					this.addChild(ud.shape); 			
				} else {
					ud.shape = shape;
				}
				ud.shape.body = joint;
				ud.shape.specs = specs;
				ud.specs = specs;
				joint.SetUserData(ud);	
				this.activeJoints[ud.specs.id] = ud.shape;
				return ud.shape;
			} else if (specs.class == "composite"){
				// in this case we'll be making a container easel object for each of these pieces
				ud = {};
				// add a shape if one is not give
				if (shape == null){
					ud.shape = new createjs.Container();		
					this.addChild(ud.shape); 		
				} else {
					ud.shape = shape;
				}
				wp = specs.position;
				ud.shape.x = wp.x * this.SCALE;
				ud.shape.y = wp.y * this.SCALE;
				// put mouse handler
				if (ud.shape.parent == this) ud.shape.addEventListener("mousedown", function(evt){evt.currentTarget.parent.shapePressHandler(evt);});
				// create bodies for all of the children
				ud.shape.bodies = [];
				ud.shape.joints = [];
				ud.shape.Total_Mass = 0;
				var minx = 1000, maxx = 0, miny = 1000, maxy = 0;
				for (i = 0; i < specs.objects.length; i++){
					var tshape = new createjs.Shape();
					ud.shape.addChildAt(tshape, 0);
					var returnedBody = this.createObjectInWorld(specs.objects[i], tshape, wp);
					if (returnedBody != null){
						// is body
						if(typeof returnedBody.specs.b2BodyDef !== "undefined" || typeof returnedBody.specs.b2FixtureDef !== "undefined"){
							ud.shape.bodies.push(returnedBody);
							ud.shape.Total_Mass += returnedBody.body.GetMass();
							var swp = returnedBody.body.GetPosition();
							tshape.x = (swp.x - wp.x) * this.SCALE;
							tshape.y = (swp.y - wp.y) * this.SCALE;
							
							// set minimum and maximum x and y position of composite shapes
							if (swp.x * this.SCALE - tshape.width_px/2 < minx){
								minx = swp.x * this.SCALE + tshape.left_px;
							}
							if (swp.x * this.SCALE + tshape.width_px/2 > maxx){
								maxx = swp.x * this.SCALE + tshape.right_px;
							}
							if (swp.y * this.SCALE - tshape.height_px/2 < miny){
								miny = swp.y * this.SCALE + tshape.above_px;
							}
							if (swp.y * this.SCALE + tshape.height_px/2 > maxy){
								maxy = swp.y * this.SCALE + tshape.below_px;
							}
						} else if(typeof returnedBody.specs.b2JointDef !== "undefined"){
							// if this is a distance joint we are setting a reference for the purpose of collecting potential energy
							// will be the last distance joint in the list of objects.
							if (returnedBody.specs.class == "distanceJoint"){
								console.log(specs.id, "springJoint set to", returnedBody.specs.id);
								ud.shape.springJoint = returnedBody;
							}
							ud.shape.joints.push(returnedBody);
						}
					}					
				}

				// find placement relative to this shape
				var left_px = 0, right_px = 0, above_px = 0, below_px = 0;
				for (i = 0; i < ud.shape.bodies.length; i++){
					var tshape = ud.shape.bodies[i];
					if (tshape.x + tshape.left_px < left_px){
						left_px = tshape.x + tshape.left_px;
					}
					if (tshape.x + tshape.right_px > right_px){
						right_px = tshape.x + tshape.right_px;
					}
					if (tshape.y + tshape.above_px < above_px){
						above_px = tshape.y + tshape.above_px;
					}
					if (tshape.y + tshape.below_px > below_px){
						below_px = tshape.y + tshape.below_px;
					}
				}
				ud.shape.width_px = maxx - minx;
				ud.shape.height_px = maxy - miny;
				ud.shape.left_px = left_px;
				ud.shape.right_px = right_px;
				ud.shape.above_px = above_px;
				ud.shape.below_px = below_px;

				if (edebug){
					ud.shape.shape =  new createjs.Shape();	
					ud.shape.addChildAt(ud.shape.shape, 0);
				}
				ud.shape.specs = specs;
				ud.specs = specs;
				// put this shape in composites
				this.composites[ud.specs.id] = ud.shape;
				return null;
			}
			
		}
		
		p.getObjectBySpecs = function(specs){
			if (specs.class == "composite"){
				object = this.composites[specs.id];
			} else if (specs.class.toLowerCase().find("joint") >= 0){
				object = this.activeJoints[specs.id];
			} else {
				object = this.activeBodies[specs.id];
			}
			return object;
		}

		// should descend into objects
		p.getObjectSpecsById = function(id){
			for (var i = 0; i < worldSpecs.objects.length; i++){
				if (id == worldSpecs.objects[i]["id"]){
					return worldSpecs.objects[i];
				} else if (worldSpecs.objects[i].class == "composite" && worldSpecs.objects[i].objects != null && worldSpecs.objects[i].objects.length > 0){
					for (var j = 0; j < worldSpecs.objects[i].objects.length; j++){
						if (id == worldSpecs.objects[i].objects[j]["id"]){
							return worldSpecs.objects[i].objects[j];
						}
					}
				}
			}
			return null;
		}

		p.getObjectById = function(id){
			var specs = this.getObjectSpecsById(id);
			return this.getObjectBySpecs(specs);
		}


		/** Only works for top-level objects */
		p.createObjectById = function(id){
			var specs = this.getObjectSpecsById(id);
			if (specs != null){
				this.createObjectInWorld(specs);
				return true;
			} else {
				return false;
			}
		}

		p.removeObjectById = function (id){
			var specs = this.getObjectSpecsById(id);
			if (specs != null){
				if (specs.class == "composite"){
					return this.removeCompositeById(specs.id);
				} else if (specs.class.match("Joint") != null){
					return this.removeJointById(specs.id);
				} else {
					// assume is body
					return this.removeBodyById(specs.id);
				}
			}
		}

		p.removeCompositeById = function(id){
			var composite = this.composites[id];
			if (composite != null){
				// remove all children
				for (var k = 0; k < composite.bodies.length; k++){
					this.removeBody(composite.bodies[k]);
				}
				for (k = 0; k < composite.joints.length; k++){
					this.removeJoint(composite.joints[k]);
				}
				delete this.composites[id];
				this.removeChild(composite);
				stage.needs_to_update;
				return true;
			} 
			return false;
		}

		/* Will remove any body - composite or otherwise */
		p.removeBodyById = function (id){
			if (this.activeBodies[id] != null){						
				var val = this.removeBody(this.activeBodies[id]);	
				if (val) delete this.activeBodies[id];	
				return val;
			} else {
				return false;
			}
		}

		p.removeBody = function(actor){
			var body = actor.body;
			if (body != null ){
				// if this is a composite must destroy children as well
				this.b2.DestroyBody(body);
				body.GetUserData().shape.parent.removeChild(body.GetUserData().shape);
				stage.needs_to_update;
				return true;
			}
			return false;
		}

		p.removeJointById = function (id){
			if (this.activeJoints[id] != null){							
				var val = this.removeJoint(this.activeJoints[id]);
				if (val) delete this.activeJoints[id];	 	
				return val;
			} else {
				return false;
			}
		}

		/* Will remove any body - composite or otherwise */
		p.removeJoint = function (actor){
			var joint = actor.body;
			if (joint != null){
				// if this is a composite must destroy children as well
				this.b2.DestroyJoint(joint);
				joint.GetUserData().shape.parent.removeChild(joint.GetUserData().shape);
				stage.needs_to_update;
				return true;
			}
			return false;
		}

/////////////////////////////  OUTPUT /////////////////////////////////////////////

		/** Will copy details from the plotSpecs, without changing plotSpecs
			Needs to leave series as blank because the series will be added at a new trial
		 */
		p.renderPlot = function (id){
			var divId = id;
			//check if the div exists
			if($('#' + divId).length > 0) {
				//get the highcharts object from the div
				var highchartsObject = $('#' + divId).highcharts();

				if(highchartsObject != null) {
					//destroy the existing chart because we will be making a new one
					highchartsObject.destroy();
				}
			}
			//set the divId into the chart object so we can access it in other contexts
			worldSpecs.plots[id].chart.renderTo = divId;
			// set the original plot count, needed if we are going to add "previous series plots later"
			worldSpecs.plots[id].seriesCount = worldSpecs.plots[id].series.length;

			var newSpecs = {};
			for (var key in worldSpecs.plots[id]){
				if (key != "series"){
					newSpecs[key] = worldSpecs.plots[id][key];
				}
			}
			// if there is a legend, remove for now
			newSpecs.series = []; // empty series

			//render the highcharts chart
			this.plots[id] = new Highcharts.Chart(newSpecs);
			this.plots[id].legend.group.hide(); // hide until a series is shown
		}

		p.renderTable = function(id, tableData){
			var divId = id;
			$('#' + divId).empty()
			var tableData = tableData != null ? tableData : this.tableData;

			var elem = "<div id='resultsTableDiv'><br/>";
			elem += "<table style='background-color:#eef;'><tbody>";
			for (var ri = 0; ri < tableData[0].length; ri++){
				elem += "<tr>";
				for (var ci = 0; ci < tableData.length; ci++){
					var style = "border: 1px solid black; padding: 5px;"
					if (typeof tableData[ci][ri].style !== "undefined")
						style = style + tableData[ci][ri].style;
					elem += "<td style='" + style + "'>";
					if (ri == 0) elem += "<strong>";
					var val;
					if (typeof tableData[ci][ri].checked === "boolean"){
						var checked = tableData[ci][ri].checked ? "checked" : "";
						val = "<input type='checkbox' id='checkbox-"+ri+"' onclick='world.handle_show_plot_change(this);'" + checked+" />";
					} else if (tableData[ci][ri].text != null){
						val = "<span>" + tableData[ci][ri].text + "</span>";
					}
					//if (typeof val === "string") val = val.replace(/_/g, " ");	
					elem += val;				
					if (ri == 0) elem += "</strong>";
					elem += "</td>";
				}
				elem += "</tr>";
			}
			elem += "</tbody></table></br></div>";

			$('#' + divId).append(elem);
		}

//////////////////// MOUSE INTERACTIONS //////////////////////////////////////
		
		/** Removes object from its current parent, allows movement based on current*/
		p.shapePressHandler = function (evt){
			if (this.dragging_object != null) return;
			var target = evt.currentTarget;
			target.offset = target.globalToLocal(evt.stageX, evt.stageY);

			var lp = this.localToLocal(target.x, target.y, this);
			
			this.dragging_object = target;
			this.addChild(target); // will add this to front
			target.x = lp.x;
			target.y = lp.y;
			target.rotation = 0;

			// if this body is being plotted, stop the plot.
			if (typeof target.specs.plot !== "undefined" && target.specs.plot.length > 0){
				this.resetTrial();
			}
			
			// remove b2 bodies
			if (target.body != null){
				// has a body (not a composite)
				delete this.activeBodies[target.specs.id];
				this.b2.DestroyBody(target.body);
			} else {
				// remove bodies of composite's children (that sounds pretty creepy)
				for (var i = 0; i < target.bodies.length; i++){
					delete this.activeBodies[target.bodies[i].specs.id];
					this.b2.DestroyBody(target.bodies[i].body);
				}
				// remove joints of composite's children (still pretty creepy)
				for (i = 0; i < target.joints.length; i++){
					delete this.activeJoints[target.joints[i].specs.id];
					this.b2.DestroyJoint(target.joints[i].body);
				}
				target.bodies = null;
				target.joints = null;				
			}			

			// remove listener and add new ones
			target.removeEventListener("mousedown", function(evt){target.parent.shapePressHandler(evt);});
			target.addEventListener("pressmove", function(evt){target.parent.shapeMoveHandler(evt);});
			target.addEventListener("pressup", function(evt){target.parent.shapeReleaseHandler(evt);});
			stage.needs_to_update = true;	
		}

		/** allows movement based on current*/
		p.shapeMoveHandler = function (evt){
			if (this.dragging_object == null) return;
			var target = evt.currentTarget;
			var parent = target.parent;
			var lpoint = this.globalToLocal(evt.stageX-target.offset.x, evt.stageY-target.offset.y);
			var newX = lpoint.x;
			var newY = lpoint.y;
			
			//console.log(newY, this.y, this.y + this.height_px - target.height_px_below, this.height_px , target.height_px_below);
			if (newX > -target.left_px + this.wall_width_px && newX < this.width_px - target.right_px - this.wall_width_px){ 
				target.x = newX;
			}
			if (newY > -target.left_px && newY < this.height_px - target.right_px / 2){
				target.y = newY;
			}
			stage.needs_to_update = true;
		}

		/** When user drops object will create a new body */
		p.shapeReleaseHandler = function (evt){
			if (this.dragging_object == null) return;
			var target = evt.currentTarget;
			var parent = target.parent;
			// set position based on place in world
			this.setPlaceInWorldInSpecs(evt, this.dragging_object);
			if (target.removeAllChildren != null) target.removeAllChildren();
			
			// remove object from parent, will re-establish in create
			target.removeEventListener("pressmove", function(evt){parent.shapeMoveHandler(evt);});
			target.removeEventListener("pressup", function(evt){parent.shapeReleaseHandler(evt);});
			this.createObjectInWorld(parent.dragging_object.specs, target, null);
			this.updateForces();

			this.dragging_object = null;
			stage.needs_to_update = true;			
		}

			// recursive function that uses current place in easel world to establish place in box2d world
			p.setPlaceInWorldInSpecs = function(evt, target){
				var specs = target.specs;
				if (typeof specs !== "undefined"){
					if (specs.class == "composite"){
						for (var i = 0; i < target.numChildren; i++){
							this.setPlaceInWorldInSpecs(evt, target.getChildAt(i));
							var wpoint = this.globalToLocal(evt.stageX-target.offset.x, evt.stageY-target.offset.y);
							specs.position = new b2Vec2(wpoint.x / this.SCALE, wpoint.y / this.SCALE);
						}
					} else if (specs.b2BodyDef != null && specs.b2BodyDef.position != null){
						if (target.parent == world){
							// directly attached to world so has an offset based on press
							var wpoint = this.globalToLocal(evt.stageX-target.offset.x, evt.stageY-target.offset.y);
							wpoint.x /= this.SCALE;
							wpoint.y /= this.SCALE;
							specs.b2BodyDef.position = new b2Vec2(wpoint.x, wpoint.y);
						} else {
							// attached to a composite, so position is relative to parent
							var wpoint = target.parent.localToLocal(target.x, target.y, world);
							wpoint.x /= this.SCALE;
							wpoint.y /= this.SCALE;
						}			
					}
				}			
			}

		
//////////////////// easel.js work //////////////////////////////////////
		/** Redraws awake objects  */
		p.redraw = function (){
			var ud, specs, g, shape, p, key;
			for (key in this.activeBodies){
				var body = this.activeBodies[key].body;
				ud = body.GetUserData();
				if (ud == null || ud.specs == null || (body.IsAwake != null && !body.IsAwake() && ud.shape.initialized)){
					// do nothing, static objects don't need to be redrawn, nor do asleep ones
				} else if (ud.specs.class == "circle" || ud.specs.class == "wheel" || ud.specs.class == "rect" || ud.specs.class == "roundRect" || ud.specs.class == "polygon"){
					specs = ud.specs;
					if (!ud.shape.initialized){
						ud.shape.initialized = true;						
						g = ud.shape.graphics;
						var gradient = typeof specs.easel.fill_colors !== "undefined" ? true : false;
						if (gradient){
							var fill_colors = typeof specs.easel.fill_colors !== "undefined" ? specs.easel.fill_colors : ['rgba(100, 100, 100, 1.0)'];
							var fill_ratios = typeof specs.easel.fill_ratios !== "undefined" ? specs.easel.fill_ratios : [0];
							var stroke_colors = typeof specs.easel.stroke_colors !== "undefined" ? specs.easel.stroke_colors : 'rgba(0, 0, 0, 1.0)';
							var stroke_ratios = typeof specs.easel.stroke_ratios !== "undefined" ? specs.easel.stroke_ratios : [0];
							var gradient_direction = typeof specs.easel.direction !== "undefined" ? specs.easel.direction : new b2Vec2(1, 1);
						} else {
							var fill_color = typeof specs.easel.fill_color !== "undefined" ? specs.easel.fill_color : 'rgba(100, 100, 100, 1.0)';
							var stroke_color = typeof specs.easel.stroke_color !== "undefined" ? specs.easel.stroke_color : 'rgba(0, 0, 0, 1.0)';
						}
						if (ud.specs.class == "circle" || ud.specs.class == "wheel"){
							if (gradient){
								var tl_x = -specs.radius * this.SCALE * gradient_direction.x;
								var br_x = specs.radius * this.SCALE * gradient_direction.x;
								var tl_y = -specs.radius * this.SCALE * gradient_direction.y;
								var br_y = specs.radius * this.SCALE * gradient_direction.y;

								g.clear().beginLinearGradientStroke(stroke_colors, stroke_ratios, tl_x, tl_y, br_x, br_y).beginLinearGradientFill(fill_colors, fill_ratios, tl_x, tl_y, br_x, br_y).drawCircle(0, 0, specs.radius * this.SCALE);
															
							} else {
								g.clear().beginStroke(stroke_color).beginFill(fill_color).drawCircle(0, 0, specs.radius * this.SCALE);
							}
							if (ud.specs.class == "wheel"){
								g.beginRadialGradientFill(["rgba(255,255,255,0.2)","rgba(255,255,255,0.2)","rgba(255,255,255,0.05)","rgba(255,255,255,0)"],[0, 0.8, 0.95, 1.0], 0, 0, 0, 0, 0, specs.radius * this.SCALE,specs.radius * this.SCALE).drawCircle(0, 0, specs.radius * this.SCALE);
								g.beginFill("rgba(225,225,255,1.0)").drawCircle(0, 0, specs.radius * this.SCALE/4);
								g.beginFill("rgba(25,25,25,1.0)").drawCircle(0, 0, typeof specs.easel.axle_ratio !== "undefined" ? specs.radius * this.SCALE/4 * specs.easel.axle_ratio : specs.radius * this.SCALE/8);
							}		
							g.endFill().endStroke();				
						} else if (ud.specs.class == "rect" || ud.specs.class == "roundRect"){
							if (gradient){
								var tl_x = -specs.width / 2 * this.SCALE * gradient_direction.x;
								var br_x = specs.width / 2 * this.SCALE * gradient_direction.x;
								var tl_y = -specs.height / 2 * this.SCALE * gradient_direction.y;
								var br_y = specs.height / 2 * this.SCALE * gradient_direction.y;

								g.clear().beginLinearGradientStroke(stroke_colors, stroke_ratios, tl_x, tl_y, br_x, br_y).beginLinearGradientFill(fill_colors, fill_ratios, tl_x, tl_y, br_x, br_y);
							} else {
								g.clear().beginStroke(stroke_color).beginFill(fill_color);
							}
							if (ud.specs.class == "rect"){
								g.drawRect(-specs.width * this.SCALE / 2, -specs.height * this.SCALE / 2, specs.width * this.SCALE, specs.height * this.SCALE);
							} else if (ud.specs.class == "roundRect"){
								g.drawRoundRect(-specs.width * this.SCALE / 2, -specs.height * this.SCALE / 2, specs.width * this.SCALE, specs.height * this.SCALE, typeof specs.easel.radius !== "undefined" ? specs.easel.radius: 5);
							}
							g.endFill().endStroke();
							
						} else if (ud.specs.class == "polygon"){
							if (gradient){
								var tl_x = ud.shape.left_px * Math.abs(gradient_direction.x);
								var br_x = ud.shape.right_px * Math.abs(gradient_direction.x);
								if (gradient_direction.x < 0){temp_x = tl_x; tl_x = br_x; br_x = temp_x}
								var tl_y = ud.shape.above_px * Math.abs(gradient_direction.y);
								var br_y = ud.shape.below_px * Math.abs(gradient_direction.y);
								if (gradient_direction.y < 0){temp_y = tl_y; tl_y = br_y; br_y = temp_y}
								
								g.clear().beginLinearGradientStroke(stroke_colors, stroke_ratios, tl_x, tl_y, br_x, br_y).beginLinearGradientFill(fill_colors, fill_ratios, tl_x, tl_y, br_x, br_y);
								for (var j = 1; j < ud.shape.vertices.length; j++){
									g.lt(ud.shape.vertices[j].x*this.SCALE, ud.shape.vertices[j].y*this.SCALE);
								}
								g.lt(ud.shape.vertices[0].x*this.SCALE, ud.shape.vertices[0].y*this.SCALE).endFill().endStroke();	
							} else {
								g.clear().beginStroke(stroke_color).beginFill(fill_color);
								g.mt(ud.shape.vertices[0].x*this.SCALE, ud.shape.vertices[0].y*this.SCALE);
								for (var j = 1; j < ud.shape.vertices.length; j++){
									g.lt(ud.shape.vertices[j].x*this.SCALE, ud.shape.vertices[j].y*this.SCALE);
								}
								g.lt(ud.shape.vertices[0].x*this.SCALE, ud.shape.vertices[0].y*this.SCALE).endFill().endStroke();	
							}
						}
					}
					// get location. If on top level (not-composite, get position directly). If child of composite simply
					// use relative position to parent.
					var p_x, p_y;
					p = body.GetPosition();
					p_x = p.x * this.SCALE;
					p_y = p.y * this.SCALE;
					if (ud.shape.parent != null && ud.shape.parent != world && ud.shape.parent.specs.class == "composite"){
						var lp = this.localToLocal(p_x, p_y, ud.shape.parent);
						p_x = lp.x;
						p_y = lp.y;
					}
						 
					ud.shape.x = p_x;
					ud.shape.y = p_y;	
					ud.shape.rotation = body.GetAngle() * 180 / Math.PI;
					stage.needs_to_update = true;
				}
			}

			// update composites position on screen
			for (key in this.composites){
				var composite = this.composites[key];
				// find a child body and use the relative_position to find the position of this
				if (composite != null && composite.bodies != null && composite.bodies.length > 0){
					var refbody = composite.bodies[0].body;
					var specs = refbody.GetUserData().specs;
					p = refbody.GetPosition();
					composite.x = (p.x - specs.b2BodyDef.relative_position.x) * this.SCALE;
					composite.y = (p.y - specs.b2BodyDef.relative_position.y) * this.SCALE;
					if (edebug){
						composite.shape.graphics.clear().beginFill("rgba(255, 100, 100, 0.5)").drawRect(refbody.GetUserData().shape.left_px,refbody.GetUserData().shape.above_px, composite.width_px, composite.height_px).endFill();
						//composite.shape.rotation = refbody.GetAngle() * 180 / Math.PI;				
					}
				}
			}
			
			// update all joints
			for (key in this.activeJoints){
				var joint = this.activeJoints[key].body;
				ud = joint.GetUserData();
				var point_A = joint.GetAnchorA();
				var point_B = joint.GetAnchorB();
				var dist = this.distance(point_A,point_B);
				var angle = Math.atan((point_B.y - point_A.y)/(point_B.x - point_A.x));
				if (ud == null || ud.specs == null || (joint.GetBodyA().IsAwake != null && !joint.GetBodyA().IsAwake()) || (joint.GetBodyB().IsAwake != null && !joint.GetBodyB().IsAwake()) || ((ud.specs.class == "distanceJoint" && Math.abs(dist - joint.prevLength) < 0.01) && (ud.specs.class == "distanceJoint" && Math.abs(angle - joint.prevAngle) < (1/180 * Math.PI)))){
					// do nothing, static objects don't need to be redrawn, nor do asleep ones
				} else if (ud.specs.class == "distanceJoint"){
					joint.prevLength = dist;
					joint.prevAngle = angle;
					specs = ud.specs;
					g = ud.shape.graphics;
					var gradient = typeof specs.easel.fill_colors !== "undefined" ? true : false;
					if (gradient){
						var fill_colors = typeof specs.easel.fill_colors !== "undefined" ? specs.easel.fill_colors : ['rgba(100, 100, 100, 1.0)'];
						var fill_ratios = typeof specs.easel.fill_ratios !== "undefined" ? specs.easel.fill_ratios : [0];
						var stroke_colors = typeof specs.easel.stroke_colors !== "undefined" ? specs.easel.stroke_colors : 'rgba(0, 0, 0, 1.0)';
						var stroke_ratios = typeof specs.easel.stroke_ratios !== "undefined" ? specs.easel.stroke_ratios : [0]
					} else {
						var fill_color = typeof specs.easel.fill_color !== "undefined" ? specs.easel.fill_color : 'rgba(100, 100, 100, 1.0)';
						var stroke_color = typeof specs.easel.stroke_color !== "undefined" ? specs.easel.stroke_color : 'rgba(0, 0, 0, 1.0)';
					}

					if (ud.specs.class == "distanceJoint"){
						// if these objects are children of a composite, change points to relative to that composite parent
						if (ud.shape.parent != null && ud.shape.parent != world){
							point_A.x -= (ud.shape.parent.x / this.SCALE);
							point_A.y -= (ud.shape.parent.y / this.SCALE);
							point_B.x -= (ud.shape.parent.x / this.SCALE);
							point_B.y -= (ud.shape.parent.y / this.SCALE);
						}
						var centerp = new b2Vec2((point_B.x + point_A.x) / 2, (point_B.y + point_A.y) / 2)
						var width = dist; //Math.cos(angle) * dist;
						var width_px = width * this.SCALE;
						var tl_x = -width/2 * this.SCALE;
						var br_x = width/2 * this.SCALE;
						
						if (typeof ud.specs.easel.style === "undefined" || ud.specs.easel.style === "rect"){var height = 0.25;
							var height_px = height * this.SCALE;
							var tl_y = -height_px/2;
							var br_y = height_px/2;
							
							// draw a joint from point A to point B
							if (gradient){
								/// NOT WORKING
								g.clear().beginLinearGradientStroke(stroke_colors, stroke_ratios, tl_x, tl_y, br_x, br_y).beginLinearGradientFill(fill_colors, fill_ratios, tl_x, tl_y, br_x, br_y).drawRect(0, 0, specs.radius * this.SCALE).endFill().endStroke();
							} else {
								g.clear().beginStroke(stroke_color).beginFill(fill_color).drawRect(-width * this.SCALE / 2, -height * this.SCALE / 2, width * this.SCALE, height * this.SCALE).endFill().endStroke();	
							}
						} else if (ud.specs.easel.style === "spiral"){
							var height = typeof joint.GetBodyA().GetUserData().specs.height !== "undefined" ? joint.GetBodyA().GetUserData().specs.height: 2.0;
							var height_px = height * this.SCALE;
							var tl_y = -height_px/2;
							var br_y = height_px/2;
							var coil_thickness = 4;
							// change the y values
							var ncoils = 8;//beaker.fluid_density * 5 + 12; 
							g.clear();
							for (var j = 0; j < ncoils+1; j++){
								g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(80,80,80,1.0)","rgba(100,100,100,1.0)"],[0,0.5,1.0], 0, tl_y, 0, br_y).drawRect(tl_x+width_px*j/ncoils, tl_y, coil_thickness, height_px).endFill();
							}
							for (j = 0; j < ncoils; j++){
								g.beginLinearGradientFill(["rgba(120,120,120,1.0)","rgba(220,220,220,1.0)","rgba(120,120,120,1.0)"],[0,0.5,1.0],0, tl_y, 0, br_y).
								moveTo(tl_x + width_px*j/ncoils-coil_thickness*0/2, tl_y).
								lineTo(tl_x + width_px*j/ncoils+coil_thickness*2/2, tl_y).
								lineTo(tl_x + width_px*(j+1)/ncoils+coil_thickness*2/2, br_y).
								lineTo(tl_x + width_px*(j+1)/ncoils-coil_thickness*0/2, br_y).
								lineTo(tl_x + width_px*j/ncoils-coil_thickness*0/2, tl_y).
								endFill();
							}
						}
						p = centerp;
						ud.shape.x = p.x * this.SCALE;
						ud.shape.y = p.y * this.SCALE;
						ud.shape.rotation = angle * 180 / Math.PI;
					}
					
					//ud.shape.onPress = this.actorPressHandler.bind(this);
					stage.needs_to_update = true;
				} 
			}			

		}

		
		    
////////////////// box2d work on tick ///////////////////////////////////////////////////

		/* Used when we create objects so that forces will be attached to the correct bodies */
		p.updateForces = function(){
			// now that we have new bodies in the world check to see if we need to update any forces
			for (var key in this.activeForces){
				var force = this.activeForces[key];
				var id = force.id_body;
				if (this.activeBodies[id] != null && this.activeBodies[id].body != null){
					force.body = this.activeBodies[id].body;
					force.prev_force = new b2Vec2(0, 0);
					force.spillover_force = new b2Vec2(0, 0);	
				}	
			}	
		}
		   
		/** Tick function called on every step, if update, redraw */
		p._tick = function (){
			this.Container_tick();
			// apply forces
			for (var key in this.activeForces){
				var f = this.activeForces[key];
				// update force to include spillover
				f.force.x += f.spillover_force.x;
				f.force.y += f.spillover_force.y;
				f.spillover_force.x = 0;
				f.spillover_force.y = 0;
				if (f.force.x != 0 || f.force.y != 0){
					if (f.impulse){
						f.body.ApplyImpulse(f.force, f.body.GetWorldCenter());
					} else {
						if (Math.abs(f.force.x - f.prev_force.x) > f.max_force_change){
							var dir = f.force.x / Math.abs(f.force.x);
							f.spillover_force.x = dir * (Math.abs(f.force.x - f.prev_force.x) - f.max_force_change);
							//console.log(f.force.x, f.prev_force.x, f.force.x - f.spillover_force.x, Math.abs(f.force.x - f.prev_force.x), f.spillover_force.x);
							f.force.x -= f.spillover_force.x;
							
						}
						if (Math.abs(f.force.y - f.prev_force.y) > f.max_force_change){
							var dir = f.force.y / Math.abs(f.force.y);
							f.spillover_force.y = dir * (Math.abs(f.force.y - f.prev_force.y) - f.max_force_change);
							f.force.y -= f.spillover_force.y;
						}
						
						f.body.ApplyForce(f.force, f.body.GetWorldCenter());
						f.body.force = f.force;
						f.body.prev_force = new b2Vec2(f.force.x, f.force.y);
						f.prev_force = new b2Vec2(f.force.x, f.force.y);
					}
				}
			}
			
			// update graphs
			if (this.trial_ticks >= 0){
				var collectOnMod = 5;
				// to minimize data collection don't collect on every tick
				if (this.trial_ticks % collectOnMod == 0){
					// update objects for relevant plottable data
					// we already did 0, so don't start there
					if (this.trial_ticks > 0) this.updateSeriesData(collectOnMod);

					// each plot's series needs a new point which will be null until filled in
					for (var key in this.plots){	
						for (var i=0; i < this.plots[key].series.length; i++){
							this.plots[key].series[i].newpoint = new b2Vec2(null, null);
						}	
					}

					// search for plotted values in uivars to fill new point
					for (var key in worldSpecs.uivars){
						var uivar = worldSpecs.uivars[key];
						if (typeof uivar.plot_id === "string" && this.plots[uivar.plot_id] != null){
							var value = eval(uivar.value);
							if (value != null){
								if (uivar.axis == "x"){
									// update all series
									for (var i=0; i < this.plots[uivar.plot_id].series.length; i++){
										this.plots[uivar.plot_id].series[i].newpoint.x = value;
									}
								} else if (uivar.axis == "y"){
									var seriesIndex = typeof uivar.seriesIndex !== "undefined" ? uivar.seriesIndex : 0; 
									// should be updating last series
									var currentSeriesIndex = this.plots[uivar.plot_id].currentSeriesIndex + seriesIndex;
									this.plots[uivar.plot_id].series[currentSeriesIndex].newpoint.y = value;
								}
							}
						}
					}

					// redraw plots with full newpoints (no null)
					for (var key in this.plots){		
						for (var i=0; i < this.plots[key].series.length; i++){
							if (this.plots[key].series[i].newpoint.x != null && this.plots[key].series[i].newpoint.y != null){
								this.plots[key].series[i].addPoint({
									x:this.plots[key].series[i].newpoint.x, 
									y:this.plots[key].series[i].newpoint.y
								}, true); //world.trial_ticks % 5 == 0);
							}
						}
					}
				}
				
				this.trial_ticks++;

				//console.log(this.trial_ticks / createjs.Ticker.getFPS(), worldSpecs.uivars['max_trial_time'], this.endTrial);
				// we may do a hard stop if uivar max_trial_time is set
				if (typeof worldSpecs.uivars['max_trial_time'] !== "undefined" && typeof worldSpecs.uivars['max_trial_time'].value === "number" &&
					worldSpecs.uivars['max_trial_time'].value < (this.trial_ticks / createjs.Ticker.getFPS()) &&
					typeof this.endTrial !== "undefined"){
					this.endTrial();
				}

			}
			
			this.b2.Step(1/createjs.Ticker.getFPS(), 10, 10);
			this.b2.DrawDebugData();
			this.b2.ClearForces();
			this.redraw();

		}

		/* update objects for relevant plottable data */
		p.updateSeriesData = function(collectOnMod){
			for (var i=0; i < worldSpecs.objects.length; i++){
				var positionSet = false, speedSet = false, velocitySet = false, kineticSet = false;
				var specs = worldSpecs.objects[i];
				if (typeof specs.data !== "undefined" && specs.data.length > 0){
					var object = this.getObjectBySpecs(specs);						
					if (object != null && object.data != null){
						for (key in object.data){
							if (key == "position"){
								object.data[key].push(new b2Vec2(object.x / this.SCALE, object.y / this.SCALE));
								positionSet = true;
							} else if (key == "direction_change_count"){
								if (object.data[key].length < 2){
									object.data[key].push(0);
								} else {
									var pindex = positionSet ? object.data["position"].length-2 : object.data["position"].length-1;
									var p = object.data["position"][pindex];
									var ppindex = positionSet ? object.data["position"].length-3 : object.data["position"].length-2;
									var pp = object.data["position"][ppindex];
									var np = new b2Vec2(object.x / this.SCALE, object.y / this.SCALE);
									var dir1 = (np.x - p.x)/Math.abs(np.x - p.x);
									var dir2 = (p.x - pp.x)/Math.abs(p.x - pp.x);											
									if (dir1 * -dir2 == 1){
										object.data[key].push(object.data[key][object.data[key].length-1]+1);
									} else {
										object.data[key].push(object.data[key][object.data[key].length-1]);	
									}
								}
							} else if (key == "x"){
								object.data[key].push(object.x / this.SCALE);
							} else if (key == "y"){
								object.data[key].push(object.y / this.SCALE);
							} else if (key == "distance"){
								// for distance need position
								if (object.data["position"] == null || object.data["position"].length == 0 || (positionSet && object.data["position"].length == 1)){
									object.data[key].push(0);
								} else {
									var pindex = positionSet ? object.data["position"].length-2 : object.data["position"].length-1;
									var p = object.data["position"][pindex];
									var np = new b2Vec2(object.x / this.SCALE, object.y / this.SCALE);
									var d = this.distance(np, p);
									object.data[key].push(d);						
								}								
							} else if (key == "velocity"){
								// for velocity need position
								if (object.data["position"] == null || object.data["position"].length == 0 || (positionSet && object.data["position"].length == 1)){
									object.data[key].push(0);
								} else {
									var pindex = positionSet ? object.data["position"].length-2 : object.data["position"].length-1;
									var p = object.data["position"][pindex];
									var np = new b2Vec2(object.x / this.SCALE, object.y / this.SCALE);
									var d = this.distance(np, p);
									if (np.x < p.x) d *= -1;
									object.data[key].push(d / (collectOnMod/createjs.Ticker.getFPS()));						
								}
								velocitySet = true;
							} else if (key == "speed"){
								// for speed need position
								if (object.data["position"] == null || object.data["position"].length == 0 || (positionSet && object.data["position"].length == 1)){
									object.data[key].push(0);
								} else {
									var pindex = positionSet ? object.data["position"].length-2 : object.data["position"].length-1;
									var p = object.data["position"][pindex];
									var np = new b2Vec2(object.x / this.SCALE, object.y / this.SCALE);
									var d = this.distance(np, p);
									object.data[key].push(d / (collectOnMod/createjs.Ticker.getFPS()));						
								}
								speedSet = true;
							} else if (key == "acceleration"){
								// for acceleration need speed or velocity and position
								if (object.data["position"] == null || object.data["position"].length == 0 || (positionSet && object.data["position"].length == 1) || ((object.data["speed"] == null || object.data["speed"].length == 0 || (speedSet && object.data["speed"].length == 1)) && (object.data["velocity"] == null || object.data["velocity"].length == 0 || (velocitySet && object.data["velocity"].length == 1)))){
									object.data[key].push(0);
								} else {
									var pindex = positionSet ? object.data["position"].length-2 : object.data["position"].length-1;
									var p = object.data["position"][pindex];							
									var np = new b2Vec2(object.x / this.SCALE, object.y / this.SCALE);
									var d = this.distance(np, p);
									var nv = d / (collectOnMod/createjs.Ticker.getFPS());
									var v;
									if (velocitySet){
										v = object.data["velocity"][object.data["velocity"].length-2];
										if (np.x < p.x) nv *= -1;
									} else if (speedSet){
										v = object.data["speed"][object.data["speed"].length-2];
									} else if (object.data["velocity"] != null && object.data["velocity"].length > 0){
										v = object.data["velocity"][object.data["velocity"].length-1];
										if (np.x < p.x) nv *= -1;
									} else {
										v =  object.data["speed"][object.data["speed"].length-1];
									}
									object.data[key].push((nv - v) / (collectOnMod/createjs.Ticker.getFPS()));						
								}
							} else if (key == "time"){
								object.data[key].push(this.trial_ticks/createjs.Ticker.getFPS());
							} else if (key == "kinetic_energy"){
								var pe;
								if (object.data["gravitational_potential_energy"] != null && object.data["gravitational_potential_energy"].length > 0){
									pe = Math.max.apply(null, object.data["gravitational_potential_energy"]);
								} else if (object.data["elastic_potential_energy"] != null && object.data["elastic_potential_energy"].length > 0){
									pe = Math.max.apply(null, object.data["elastic_potential_energy"]);
								} else {
									pe = 0;
								}
								
								var ke = Math.min(this.calcKineticEnergy(object), pe);
								object.data[key].push(ke);
								kineticSet = true
							} else if (key == "gravitational_potential_energy"){
								object.data[key].push(this.calcGravitationalPotentialEnergy(object));
							} else if (key == "elastic_potential_energy"){
								object.data[key].push(this.calcElasticPotentialEnergy(object));
							} else if (key == "energy_lost"){
								// is ke still rising
								//console.log("ke 2, ke 1", object.data["kinetic_energy"].slice(-2)[0], object.data["kinetic_energy"].slice(-1)[0])
								if (object.data["kinetic_energy"] == null || object.data["kinetic_energy"].length < 1){ //6 || (object.data["gravitational_potential_energy"] == null && object.data["elastic_potential_energy"] == null) || (object.data["kinetic_energy"].slice(-2)[0] - object.data["kinetic_energy"].slice(-1)[0] < -20 && !this.lostStarted)){
									object.data[key].push(0);											
								} else {
									this.lostStarted = true;
									var ke = kineticSet ? object.data["kinetic_energy"].slice(-1)[0] : this.calcKineticEnergy(object);
									var max_pe = 0, pe = 0;
									if (object.data["gravitational_potential_energy"] != null){
										max_pe = Math.max.apply(null, object.data["gravitational_potential_energy"]);
										pe = object.data["gravitational_potential_energy"].slice(-1)[0];
									} else {
										max_pe = Math.max.apply(null, object.data["elastic_potential_energy"]);
										pe = object.data["elastic_potential_energy"].slice(-1)[0];
									}
									
									var lost = max_pe-(ke+pe);
									// if lost is less than previous remove that energy from potential (a hack)
									var extra = 0;
									if (lost < object.data[key].slice(-1)[0]){
										extra = object.data[key].slice(-1)[0] - lost;
										object.data["kinetic_energy"][object.data["kinetic_energy"].length-1] -= extra;
										lost = object.data[key].slice(-1)[0];
									}

									object.data[key].push(lost);
									//console.log("max_pe", max_pe, "ke", ke ,"pe",pe, "therm",lost, "extra", extra);
								}
								
							}
						}
					}
				}
			}
		}
//////////////////////////////////// MATH UTILITIES ////////////////////////////////////

		p.distance = function (p1,p2){return(Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2)))}

		p.calcGravitationalPotentialEnergy = function (composite){
			var m = composite.Total_Mass * (typeof worldSpecs.settings.gravityMassFudge === "numeric" ? worldSpecs.settings.gravityMassFudge : 0.33);
			var g = this.b2.GetGravity().Length();
			var p = composite.bodies[0].body.GetPosition().y + composite.below_px / this.SCALE;
			var h = this.ground.GetPosition().y - 0.25 - p;
			var E = Math.max(0, m * g * h);
			return (E);
		}
		
		/* use force on this body to calculate k (F = -kx)
		   then use potential energy equation to find E (PE = -(kx^2)/2)
			
			alternatively -> but doesn't seem to work, mass seems wrong
			frequency (w) = sqrt(k /m), thus PE = m*w^2*x^2 / 2
		   */
		p.calcElasticPotentialEnergy = function (composite){
			if (composite.springJoint == null) return 0;
			var djoint = composite.springJoint.body;
			var springBody = djoint.GetBodyA();
			var x = this.distance(djoint.GetAnchorA(),djoint.GetAnchorB()) - djoint.GetLength(); 
			
			// which method are we using?
			if (false){ // force
				// use the force being applied to find the spring constant, set once with full force and leave
				if (typeof djoint.spring_constant === "undefined"){
					if (typeof composite.springJoint.specs.force_id !== "string"){
						// didn't set an explicit force id, just use the first force and hope to the best
						composite.springJoint.specs.force_id = worldSpecs.forces[0].id;
					}
					var F = Math.sqrt(Math.pow(this.activeForces[composite.springJoint.specs.force_id].prev_force.x,2),Math.pow(this.activeForces[composite.springJoint.specs.force_id].prev_force.y,2));
					djoint.spring_constant = F / x;
				}
				var k = djoint.spring_constant;
				var E = -k*Math.pow(x,2)/2;
			} else { // frequency
				var lever_mass = 0;
				var leverspecs = this.getObjectSpecsById("lever");
				if (leverspecs != null){
					lever_mass = leverspecs.width * leverspecs.height * leverspecs.b2FixtureDef.density; 
				}
				// I have no idea why the mass doesn't work, using a fudge factor here
				var m = (composite.Total_Mass + lever_mass) * (typeof worldSpecs.settings.elasticMassFudge === "numeric" ? worldSpecs.settings.gravityMassFudge : 1.9);;			
				var w = djoint.GetFrequency();
				var E = 0.5*m*(w*w*x*x); // + springBody.GetLinearVelocity().LengthSquared());
			}
			//console.log(x, E);
			return E;
		}

		p.calcKineticEnergy = function (composite){
			if (composite.bodies.length > 0){
				var m = composite.Total_Mass;
				var body = composite.bodies[2].body;
				var v = body.GetLinearVelocityFromLocalPoint(body.GetLocalCenter());
				var w = body.GetAngularVelocity();
			    var I = body.GetInertia();			        
			    var E = 0.5*m*v.LengthSquared();// + 0.5*I*w*w;
			    return E;
			} else {
				return 0;
			}
		}

///////////////////////////////// OTHER UTILITITIES ////////////////////////////////////
	p.descendByString = function(o, s) {
		    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
		    s = s.replace(/^\./, '');           // strip a leading dot
		    var a = s.split('.');
		    for (var i = 0, n = a.length; i < n; ++i) {
		        var k = a[i];
		        if (k in o) {
		            o = o[k];
		        } else {
		            return;
		        }
		    }
		    return o;
		}

	p.hexToComponents = function (hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16),
	        a:1
	    } : null;
	}

	p.rgbaToComponents = function (rgba){
		var result = rgba.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
		return result ? {
			r: parseInt(result[0]),
			g: parseInt(result[1]),
	        b: parseInt(result[2]),
	        a: result.length > 3 ? parseFloat(result[3]) : 1
	    } : null;
	}

	p.getSeededColor = function (seed){
		return "#"+((1<<24)*((seed%10)/10)|0).toString(16);
	}

		window.World = createjs.promote(World, "Container");
	}(window));

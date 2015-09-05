(function (window)
{
	/** This actor in the world creates its own skin based upon dimensions */
	function Beakerb2Actor (material, liquid, width_units, height_units, depth_units, init_liquid_volume_perc, spilloff_volume_perc, showRuler)
	{
		this.initialize (material, liquid, width_units, height_units, depth_units, typeof init_liquid_volume_perc === "undefined"? 0: init_liquid_volume_perc, typeof spilloff_volume_perc === "undefined"? 0 : spilloff_volume_perc, typeof showRuler === "undefined"?true:showRuler);
	}

	var p = Beakerb2Actor.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	//parameters
	p.BEAKER_WALL_THICKNESS = 2;
	p.NUM_RULER_TICKS = 10;
	p.DRAINING_PER_SECOND = 5;
	p.ALLOW_FILL_INTERIOR = true;
	
	p.initialize = function (material, liquid, width_units, height_units, depth_units, init_liquid_volume_perc, spilloff_volume_perc, showRuler)
	{
		this.Container_initialize();
		this.material = material;
		this.liquid = liquid;
		this.width_units = width_units;
		this.height_units = height_units;
		this.depth_units = depth_units;
		this.savedObject = {};

		this.init_liquid_volume_perc = init_liquid_volume_perc;
		this.beaker_volume = this.width_units * this.height_units * this.depth_units;
		this.init_liquid_volume = init_liquid_volume_perc * this.beaker_volume;
		this.liquid_volume = this.init_liquid_volume;
		this.spilloff_volume_perc = spilloff_volume_perc;
		this.spilloff_height = height_units * spilloff_volume_perc;
		this.showRuler = showRuler;

		// save
		this.savedObject.id = "bk" + GLOBAL_PARAMETERS.total_beakers_made++;
		this.savedObject.width_units = width_units;
		this.savedObject.height_units = height_units;
		this.savedObject.depth_units = depth_units;
		this.savedObject.init_liquid_volume = this.init_liquid_volume;
		this.savedObject.init_liquid_volume_perc = init_liquid_volume_perc;
		this.savedObject.spilloff_volume_perc = spilloff_volume_perc;
		this.savedObject.liquid_volume = this.init_liquid_volume;
		this.savedObject.liquid_volume_perc = init_liquid_volume_perc;
		this.savedObject.liquid_density = liquid != null ? liquid.density : 0;
		this.savedObject.liquid_name = liquid != null ? (typeof liquid.name === "string" ? liquid.name : liquid.display_name) : "";
		this.savedObject.display_name = liquid != null ? (typeof liquid.display_name === "string" ? liquid.display_name : this.savedObject.liquid_name) : "";

		this.skin = new BeakerShape(this, width_units*GLOBAL_PARAMETERS.SCALE, height_units*GLOBAL_PARAMETERS.SCALE, depth_units*GLOBAL_PARAMETERS.SCALE, init_liquid_volume_perc, spilloff_volume_perc, showRuler, this.savedObject);
		this.addChild(this.skin.backContainer);
		this.addChild(this.skin.frontContainer);
		// for use when dragging
		this.height_px_below = this.skin.height_px_below;
		this.height_px_above = this.skin.height_px_above;
		this.width_px_left = this.skin.width_px_left;
		this.width_px_right = this.skin.width_px_right;
		this.height_from_depth = this.skin.height_from_depth;
		this.width_from_depth = this.skin.width_from_depth;

		this.height_units_below = this.skin.height_px_below / GLOBAL_PARAMETERS.SCALE;
		this.height_units_above = this.skin.height_px_above / GLOBAL_PARAMETERS.SCALE;
		this.width_units_left = this.skin.width_px_left / GLOBAL_PARAMETERS.SCALE;
		this.width_units_right = this.skin.width_px_right / GLOBAL_PARAMETERS.SCALE;
		
		this.justAddedActorToBuoyancy = null;
		this.actorsInBeakerCount = 0;
		this.onPress = this.skin.frontContainer.onPress;
		this.onMouseMove = this.skin.frontContainer.onMouseMove;
		this.onMouseUp = this.skin.frontContainer.onMouseUp;
		
		var bodyDef = this.bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.angularDamping = 0.5;
		bodyDef.position.x = 0;
		bodyDef.position.y = 0;
		bodyDef.userData = {"actor":this}
		
		this.viewing_rotation = 0;
		this.refillElement = null;
		this.releaseElement = null;

		this.puddles = [];
		this.constructFixtures();
	}

	p.hitTestPoint = function (x, y){
		if (x >= -this.width_px_left && x <= this.width_px_right && y >= -this.height_px_above && y <= this.height_px_below){
			return true;
		} else {
			return false;
		}
	}

	p.hitTestUnderPoint = function (x,y){
		if (x >= -this.width_px_left && x <= this.width_px_right && y <= this.height_px_below){
			return true;
		} else {
			return false;
		}
	}

	p.constructFixtures = function (){
		var i, j;
		var skin = this.skin;
		// beaker
		var beakerFloorFixture = this.beakerFloorFixtureDef = new b2FixtureDef;
		beakerFloorFixture.density = this.material.density;
		beakerFloorFixture.filter.categoryBits = 2;
		beakerFloorFixture.filter.maskBits = 3;
		beakerFloorFixture.friction = 0.5;
		beakerFloorFixture.shape = new b2PolygonShape;
		beakerFloorFixture.shape.SetAsOrientedBox(this.width_units / 2 + this.BEAKER_WALL_THICKNESS / GLOBAL_PARAMETERS.SCALE, this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE, new b2Vec2(0, -this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE));
		
		var beakerLeftWallFixture = this.beakerLeftWallFixtureDef = new b2FixtureDef;
		beakerLeftWallFixture.density = this.material.density * 2;
		beakerLeftWallFixture.filter.categoryBits = 2;
		beakerLeftWallFixture.filter.maskBits = 3;
		beakerLeftWallFixture.friction = 0.0;
		beakerLeftWallFixture.shape = new b2PolygonShape;
		beakerLeftWallFixture.shape.SetAsOrientedBox(this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE, this.height_units / 2, new b2Vec2(-this.width_units / 2 -this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE , -this.height_units/2-this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE) );
		
		var beakerRightWallFixture = this.beakerRightWallFixtureDef = new b2FixtureDef;
		beakerRightWallFixture.density = this.material.density * 2;
		beakerRightWallFixture.filter.categoryBits = 2;
		beakerRightWallFixture.filter.maskBits = 3;
		beakerRightWallFixture.friction = 0.0;
		beakerRightWallFixture.shape = new b2PolygonShape;
		beakerRightWallFixture.shape.SetAsOrientedBox(this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE, this.height_units / 2, new b2Vec2(this.width_units / 2 +this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE , -this.height_units/2-this.BEAKER_WALL_THICKNESS / 2 / GLOBAL_PARAMETERS.SCALE) );
		//this.drawSpout();
		
	}

	p.setupInWorld = function (position_x, position_y, b2world){
		var bodyDef = this.bodyDef;
		bodyDef.position.x = position_x;
		bodyDef.position.y = position_y;
		this.b2world = b2world;
		this.contents_volume = 0;
		this.controlledByBuoyancy = false;
	
		// first destroy any current body on actor
		if (typeof this.body !== "undefined" && this.body != null) b2world.DestroyBody(this.body);
		
		var body = this.body = b2world.CreateBody(bodyDef);

		this.beakerFloorFixture = body.CreateFixture(this.beakerFloorFixtureDef);
		this.beakerLeftWallFixture = body.CreateFixture(this.beakerLeftWallFixtureDef);
		this.beakerRightWallFixture = body.CreateFixture(this.beakerRightWallFixtureDef);
		
		// put aabb, i.e. upper and lower limit onto the body and area
		//body.local_width_right = mainbeaker.width_px_right / GLOBAL_PARAMETERS.SCALE;
		//body.local_height_below = mainbeaker.height_px_below / GLOBAL_PARAMETERS.SCALE;
		
		body.SetFixedRotation(true);
		body.ResetMassData();
		this.x = (this.body.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x;
		this.y = (this.body.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
		// buoyancy controller
		
		var controller = this.controller = this.b2world.AddController(new Myb2BuoyancyController());
		controller.density = this.liquid != null ? this.liquid.density : 0;
		var normal = new b2Vec2(); normal.Set(0, -1);
		controller.normal = normal;
		controller.SetY(position_y)
		controller.SetInitialOffset(-this.liquid_volume / this.beaker_volume * this.height_units);
		controller.surfaceArea = this.width_units* this.depth_units;
		// include mass of water
		var massData = new b2MassData();
		body.GetMassData(massData);
		massData.mass += controller.density * this.liquid_volume;
		body.SetMassData(massData);
		body.volume = this.beaker_volume;
		body.percentSubmerged = 0;
		this.skin.redraw(-this.controller.offset, true);
		
		this.draining = false;

		this.actors = [];
		
		// draw spout first time
		if (this.refillElement != null) $("#refill-button-" + this.id).show();
		if (this.releaseElement != null){ $("#release-button-" + this.id).show();}
		else { this.drawReleaseButton();}

		/*
		g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);	
		g.beginFill("rgba(250,0,0,1.0)");
		g.drawCircle(0, 5, 5);
		g.endFill();
		this.addChild(this.shape);
		*/
	}

	/** Remove the body of this beaker as well as the buoyancy controller */
	p.removeFromWorld = function (){
		for (var i = this.actors.length-1; i >= 0; i--){
			this.removeActor(this.actors[i]);
		}
		
		this.contents_volume = 0;

		this.b2world.DestroyBody(this.body);
		this.b2world.DestroyController(this.controller);
		this.controller.SetInitialOffset(NaN);
		this.body = null;
		this.controller = null;
		this.world = null;
		this.drawRefillButton();
		this.skin.redraw(this.liquid_volume / this.beaker_volume * this.height_units * GLOBAL_PARAMETERS.SCALE, false);
	}

	/** Check to see whether actor is within the domain of this beaker */
	p.addIfWithin= function (actor)
	{
		//let's not be redundant;
		if (typeof(actor.controlledByBuoyancy) == "undefined" || !actor.controlledByBuoyancy){
			// add only if within confines of beaker
			//console.log(actor.y + actor.height_px_below, this.y + this.controller.offset * GLOBAL_PARAMETERS.SCALE, actor.x - actor.width_px_left, this.x - this.width_px_left,actor.x + actor.width_px_right , this.x + this.width_px_right);
			if (actor.skin.width_px <= this.skin.width_px && actor.y + actor.height_px_below >= this.y - this.height_units * GLOBAL_PARAMETERS.SCALE && actor.y + actor.height_px_below <= this.y && actor.x - actor.width_px_left/2 >= this.x - this.width_px_left && actor.x + actor.width_px_right/2 <= this.x + this.width_px_right){
				var body = typeof actor.body !== "undefined"? actor.body : actor.base;
				var f = body.GetFixtureList();
				var p1 = new b2Vec2(this.beakerLeftWallFixture.GetAABB().upperBound.x, (f.GetAABB().lowerBound.y + f.GetAABB().upperBound.y)/2);
				var p2 = new b2Vec2(this.beakerRightWallFixture.GetAABB().lowerBound.x, (f.GetAABB().lowerBound.y + f.GetAABB().upperBound.y)/2);
				var ray_in = new Box2D.Collision.b2RayCastInput(p1, p2, 1);
				var ray_out = new Box2D.Collision.b2RayCastOutput();
				f.RayCast(ray_out, ray_in);
				if (ray_out.fraction >= 0 && ray_out.fraction <= 1){
					eventManager.fire('add-to-beaker',[actor.skin.savedObject, this.savedObject], box2dModel);
					if (actor instanceof Scaleb2Actor){
						this.contents_volume += actor.base.volume;
						this.controller.MyAddBody(actor.base);
						this.contents_volume += actor.pan.volume;
						this.controller.MyAddBody(actor.pan);	
						this.justAddedActorToBuoyancy = actor;
					} else if (actor instanceof Balanceb2Actor){
						this.contents_volume += actor.base.volume;
						this.controller.MyAddBody(actor.base);
						this.contents_volume += actor.beam.volume;
						this.controller.MyAddBody(actor.beam);
						this.contents_volume += actor.leftPan.volume;
						this.controller.MyAddBody(actor.leftPan);	
						this.contents_volume += actor.rightPan.volume;
						this.controller.MyAddBody(actor.rightPan);	
						this.justAddedActorToBuoyancy = actor;
					}else {
						this.contents_volume += actor.body.volume;
						this.controller.MyAddBody(actor.body);	
						this.justAddedActorToBuoyancy = actor;
					}

					// set a reference so we can look for initial contact with this object
					
					this.justAddedActorToBuoyancy.bobbing = true;
					this.justAddedActorToBuoyancy.stationaryCount = 0;
					this.justAddedActorToBuoyancy.prevPosition = new b2Vec2(-10000, -10000);
					actor.controlledByBuoyancy = true;
					actor.containedWithin = this;
					this.addChildAt(actor, 1 + this.actors.length);
					this.actors.push(actor);
					actor.x = actor.x - this.x;
					actor.y = actor.y - this.y;
					this.drawReleaseButton();		
					this.sortActorsDisplayDepth();	
				} else {
					actor.controlledByBuoyancy = false;
				}
			} else {
				actor.controlledByBuoyancy = false;
			}
		}
	}

	/** Remove a single actor from this beaker */
	p.removeActor = function (actor){
		eventManager.fire('remove-from-beaker',[actor.skin.savedObject, this.savedObject], box2dModel);
		if (actor instanceof Scaleb2Actor){
			this.controller.RemoveBody(actor.base);
			this.contents_volume -= actor.base.volume;
			actor.base.SetAwake(true);
			this.controller.RemoveBody(actor.pan);
			this.contents_volume -= actor.pan.volume;
			actor.pan.SetAwake(true);
		} else {
			this.controller.RemoveBody(actor.body);
			this.contents_volume -= actor.body.volume;
			actor.body.percentSubmerged2d = [];
			for (j = 0; j < actor.skin.array2d.length; j++) {
				actor.body.percentSubmerged2d[j] = [];
				for (k = 0; k < actor.skin.array2d[0].length; k++){
					actor.body.percentSubmerged2d[j][k] = 0;
				}
			}
			actor.body.percentSubmerged2d = actor.bodyDef.percentSubmerged2d;
			actor.body.fullySubmerged = false;
			actor.body.fullyEmerged = true;
			actor.body.percentSubmergedChangedFlag = false;
			actor.body.soaked = false;
			actor.body.SetAwake(true);
		}		
		
		actor.update_flag = true;
		actor.containedWithin = null;
		actor.controlledByBuoyancy = false;
		if (this.justAddedActorToBuoyancy == actor) this.justAddedActorToBuoyancy = null;
		this.actors.splice(this.actors.indexOf(actor),1);
		actor.containedWithin = null;	
		var lp = this.localToLocal(actor.x, actor.y, this.parent);
		this.parent.addChild(actor);
		actor.x = lp.x;
		actor.y = lp.y;
		this.drawRefillButton();
	}

	/** Called from world */
	p.BeginContact = function (bodyA, bodyB){
		if (this.justAddedActorToBuoyancy == null) return;
		var body = typeof this.justAddedActorToBuoyancy.body !== "undefined"?this.justAddedActorToBuoyancy.body:(typeof this.justAddedActorToBuoyancy.base !== "undefined"?this.justAddedActorToBuoyancy.base:(typeof this.justAddedActorToBuoyancy.pan !== "undefined"?this.justAddedActorToBuoyancy.pan:(typeof this.justAddedActorToBuoyancy.leftPan !== "undefined"?this.justAddedActorToBuoyancy.leftPan:(null))));
		if (body == null) return;	
		if (bodyA == body || bodyB == body){
			bodyA.SetAwake(true);
			bodyB.SetAwake(true);
		}
	}
	p.EndContact = function (bodyA, bodyB){
		return;
	}

	/**
	*
	*/
	p.drawRefillButton = function (){
		if (this.refillElement == null && this.liquid_volume + this.contents_volume < this.init_liquid_volume){
			var refillButtonName = "refill-button-" + this.id;
			$('#beaker-button-holder').append('<input type="submit" id="'+refillButtonName+'" value="Refill" style="font-size:14px; position:absolute"/>');
			var htmlElement = $('#' + refillButtonName).button().bind('click', {parent: this}, this.refillBeaker);
			this.refillElement = new createjs.DOMElement(htmlElement[0]);
			this.addChild(this.refillElement);
			
			this.refillElement.x = -20;
			this.refillElement.y = -(this.height_units + this.depth_units * Math.sin(GLOBAL_PARAMETERS.view_topAngle) ) * GLOBAL_PARAMETERS.SCALE;
		}
	}
		/* Refills beaker to inital liquid level.  Removes the button */
		p.refillBeaker = function (evt){
			var beaker = evt.data.parent;
			//if (!beaker.draining && (beaker.contents_volume + beaker.liquid_volume) < beaker.init_liquid_volume) {
			if (!beaker.draining) {
				//eventManager.fire("press-refill-beaker", [beaker.init_liquid_volume - (beaker.contents_volume + beaker.liquid_volume)], box2dModel);
				// wake up any actors in this
				for (var i = 0; i < beaker.actors.length; i++){
					if (beaker.actors[i] instanceof Scaleb2Actor){
						beaker.actors[i].base.SetAwake(true);
						beaker.actors[i].pan.SetAwake(true);
					} else {
						beaker.actors[i].body.SetAwake(true);
					}					
				}
				// find puddles with liquid from this beaker, and replace
				beaker.parent.removeLiquidAssociatedWithBeaker(beaker);
				// remove refill button
				beaker.removeChild(beaker.refillElement);
				$("#refill-button-" + beaker.id).remove();
				beaker.refillElement = null;
				beaker.drawReleaseButton();
			}
		}

	/** If there is a spout we can release if volume is over spout line */
	p.drawReleaseButton = function (){
		if (this.releaseElement == null && this.spilloff_volume_perc > 0 && this.spilloff_volume_perc < 1 && -this.controller.offset > this.spilloff_height){
			var releaseButtonName = "release-button-" + this.id;
			$('#beaker-button-holder').append('<input type="submit" id="'+releaseButtonName+'" value="Release" style="font-size:14px; position:absolute"/>');
			var htmlElement = $('#' + releaseButtonName).button().bind('click', {parent: this}, this.pressRelease);
			this.releaseElement = new createjs.DOMElement(htmlElement[0]);
			this.addChild(this.releaseElement);			
			this.releaseElement.x = 20 + this.width_units/2 * GLOBAL_PARAMETERS.SCALE;
			this.releaseElement.y = -70 - this.spilloff_height * GLOBAL_PARAMETERS.SCALE;
		}
	}
		p.pressRelease = function (evt){
			var beaker = evt.data.parent;
			if (!beaker.draining){
				// wake up any actors in this
				for (var i = 0; i < beaker.actors.length; i++){
					if (beaker.actors[i] instanceof Scaleb2Actor){
						beaker.actors[i].base.SetAwake(true);
						beaker.actors[i].pan.SetAwake(true);
					} else {
						beaker.actors[i].body.SetAwake(true);
					}
				}
				beaker.draining = true;
				beaker.initial_liquid_volume = beaker.liquid_volume;
				$('#release-button-' + beaker.id).attr('value', 'Stop');
			} else {
				beaker.draining = false;
				$('#release-button-' + beaker.id).attr('value', 'Release');
			}
		}

	/** For pouring or replacing liquid in this beaker.
		If poured from another beaker the reference is saved

	*/
	p.addLiquidVolume = function(volume, beaker){
		// wake up any actors in this
		for (var i = 0; i < this.actors.length; i++){
			if (this.actors[i] instanceof Scaleb2Actor){
				this.actors[i].base.SetAwake(true);
				this.actors[i].pan.SetAwake(true);
			} else {
				this.actors[i].body.SetAwake(true);
			}
		}
		if (typeof beaker !== "undefined"){
			// make sure that the liquids match or that the beaker underneath has no liquid
			if (this.liquid == null || beaker.liquid.name == this.liquid.name){
				this.liquid = beaker.liquid; // make sure the two match now in case of null
				var beaker_found = false;
				for (var i = 0; i < this.puddles.length; i++){
					if (this.puddles[i].beaker == beaker){
						beaker_found = true;
						this.puddles[i].volume += volume;
						break;
					}
				}
				if (!beaker_found){
					var puddle = {};
					puddle.beaker = beaker;
					puddle.volume = volume;
					this.puddles.push(puddle);
				}
			} else {
				return false;
			}
		}
		this.liquid_volume += volume;
		// update saved object
		this.savedObject.liquid_volume = this.liquid_volume;
		this.savedObject.liquid_volume_perc = this.liquid_volume / this.beaker_volume;
		this.savedObject.liquid_density = this.liquid != null ? this.liquid.density : 0;
		this.savedObject.liquid_name = this.liquid != null ? (typeof this.liquid.name === "string" ? this.liquid.name : this.liquid.display_name) : "";
		this.savedObject.display_name = this.liquid != null ? (typeof this.liquid.display_name === "string" ? this.liquid.display_name : this.savedObject.liquid_name) : "";

		this.controller.ChangeOffset (-volume/(this.width_units * this.depth_units));
		return true;
	}	

	/** Remove another beaker's liquid */
	p.removeLiquidAssociatedWithBeaker = function (beaker){
		for (var i = this.puddles.length-1; i >= 0; i--){
			if (this.puddles[i].beaker == beaker){
				// wake up any actors in this
				for (var j = 0; j < this.actors.length; j++){
					if (beaker.actors[i] instanceof Scaleb2Actor){
						beaker.actors[i].base.SetAwake(true);
						beaker.actors[i].pan.SetAwake(true);
					} else {
						beaker.actors[i].body.SetAwake(true);
					}
				}
				var volume = this.puddles[i].volume;
				this.liquid_volume -= volume;
				if (this.liquid_volume == 0){
					this.liquid = null;
					this.savedObject.liquid_density = 0;
					this.savedObject.liquid_name = "";
					this.savedObject.display_name = "";
				}
				// update saved object
				this.savedObject.liquid_volume = this.liquid_volume;
				this.savedObject.liquid_volume_perc = this.liquid_volume / this.beaker_volume;

				this.controller.ChangeOffset (volume/(this.width_units * this.depth_units));
				this.puddles.splice(i, 1);
				this.skin.redraw(-this.controller.offset * GLOBAL_PARAMETERS.SCALE, false);
				return volume;
			}
		}
		return 0;
	}

	/**
	*	Will sort by the highest objects on top, then right-most objects
	*/
	p.sortActorsDisplayDepth = function(){
		var actors = this.actors;
		for (var i = actors.length-1; i >= 0; i--){
			if (actors[i].parent == this){
				var i_index = this.getChildIndex(actors[i]);
				var bodyi = typeof actors[i].body !== "undefined" ? actors[i].body : actors[i].base; 
				for (var j = i+1; j < actors.length; j++){
					if (actors[j].parent == this){
						var j_index = this.getChildIndex(actors[j]);
						var bodyj = typeof actors[j].body !== "undefined" ? actors[j].body : actors[j].base; 
						// do the position of these two objects overlap vertically?
						//console.log(actors[i].x - actors[i].width_px_left , "[",actors[j].x- actors[j].width_px_left, actors[j].x + actors[j].width_px_right, "] OR ", actors[i].x + actors[i].width_px_right, "[", actors[j].x - actors[j].width_px_left, actors[j].x + actors[j].width_px_right,"]");
						// is one object completely above the other object?
						if (actors[i].y + actors[i].height_px_below - 1 <= actors[j].y - actors[j].height_px_above){
							// actor i is above actor j
							if (i_index < j_index){
								console.log("switch by yvalue, i < j", i_index, j_index);
								this.swapChildrenAt(i_index, j_index);
								i_index = j_index;								
							} else {
								continue;
							}
						} else if (actors[j].y + actors[j].height_px_below - 1 <= actors[i].y - actors[i].height_px_above){
							// actor j is above actor i
							if (j_index < i_index){
								console.log("switch by yvalue, j < i", j_index, i_index);
								this.swapChildrenAt(j_index, i_index);
								j_index = i_index;								
							} else {
								continue;
							}
						} 
						else if ( (actors[i].x - actors[i].width_px_left >= actors[j].x - actors[j].width_px_left && actors[i].x - actors[i].width_px_left <= actors[j].x + actors[j].width_px_right) || (actors[i].x + actors[i].width_px_right >= actors[j].x - actors[j].width_px_left && actors[i].x + actors[i].width_px_left <= actors[j].x + actors[j].width_px_right)){
							// compare center of mass
							// is object i higher than j, and therefore should have a larger display index?
							if (bodyi.GetWorldCenter().y < bodyj.GetWorldCenter().y){
								if (i_index < j_index){
									console.log("switch by yvalue (overlap), i < j", i_index, j_index);
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;									
								}
							} else {
								if (j_index < i_index){
									console.log("switch by yvalue (overlap), j < i", j_index, i_index);
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;									
								}
							}
						} else {
							// these objects don't overlap, put them in order of right-most-point
							if (actors[i].x + actors[i].width_px_right > actors[j].x + actors[j].width_px_right){
								if (i_index < j_index){
									console.log("switch by xvalue, i < j", i_index, j_index);
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;									
								}
							} else {
								if (j_index < i_index){
									console.log("switch by xvalue, j < i", j_index, i_index);
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;									
								}
							}
						}
					}
				}
			}
		}
	}
	/*
	p.sortActorsDisplayDepth = function(){
		var actors = this.actors;
		for (var i = actors.length-1; i >= 0; i--){
			if (actors[i].parent == this){
				var i_index = this.getChildIndex(actors[i]);
				var bodyi = typeof actors[i].body !== "undefined" ? actors[i].body : (typeof actors[i].base !== "undefined" ? actors[i].base : null); 
				for (var j = i+1; j < actors.length; j++){
					if (actors[j].parent == this){
						var j_index = this.getChildIndex(actors[j]);
						var bodyj = typeof actors[j].body !== "undefined" ? actors[j].body : (typeof actors[j].base !== "undefined" ? actors[j].base : null); 
						// is one object completely above the other object?
						if (actors[i].y + actors[i].height_px_below <= actors[j].y - actors[j].height_px_above){
							// actor i is above actor j
							if (i_index < j_index){
								this.swapChildrenAt(i_index, j_index);
								i_index = j_index;
							}
						} else if (actors[j].y + actors[j].height_px_below <= actors[i].y - actors[i].height_px_above){
							// actor j is above actor i
							if (j_index < i_index){
								this.swapChildrenAt(j_index, i_index);
								j_index = i_index;
							}
						} 
						// do the position of these two objects overlap vertically?
						else if ( (actors[i].x - actors[i].width_px_left >= actors[j].x - actors[j].width_px_left && actors[i].x - actors[i].width_px_left <= actors[j].x + actors[j].width_px_right) || (actors[i].x + actors[i].width_px_right >= actors[j].x - actors[j].width_px_left && actors[i].x + actors[i].width_px_left <= actors[j].x + actors[j].width_px_right)){
							// compare center of mass
							// is object i higher than j, and therefore should have a larger display index?
							if (bodyi.GetWorldCenter().y < bodyj.GetWorldCenter().y){
								if (i_index < j_index){
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;
								}
							} else {
								if (j_index < i_index){
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;
								}
							}
						} else {
							// these objects don't overlap, put them in order of x
							if (actors[i].x > actors[j].x){
								if (i_index < j_index){
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;
								}
							} else {
								if (j_index < i_index){
									this.swapChildrenAt(i_index, j_index);
									i_index = j_index;
								}
							}
						}
					}
				}
			}
		}
	}
	*/

	/** Update skin to reflect position of b2 body on screen */
	p.update = function ()
	{
		prevx = this.x;
		prevy = this.y;
		

		// when we have an active body;
		if (this.body != null){
			this.x = (this.body.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x;
			this.y = (this.body.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
			//overflow
			if (-this.controller.offset > this.height_units){
				var volume = (-this.controller.offset - this.height_units) * this.width_units * this.depth_units;
				this.liquid_volume -= volume;
				this.controller.ChangeOffset (-(this.height_units + this.controller.offset));
				this.parent.addLiquidVolumeToWorld(this.x + this.width_px_right, this.y - this.height_px_above, volume, this);
				this.drawRefillButton();
			}
			//draining
			if (this.draining){
				var spilloff = this.DRAINING_PER_SECOND/createjs.Ticker.getFPS();
				var spilloff_dheight = spilloff / (this.width_units * this.depth_units);
				// have we reached the spilloff hole? if so stop draining
				if (-this.controller.offset + spilloff_dheight <= this.spilloff_height){
					spilloff_dheight = -this.controller.offset - this.spilloff_height;
					spilloff = spilloff_dheight * this.width_units * this.depth_units;
					this.draining = false;
					
					// remove release button
					this.removeChild(this.releaseElement);
					$("#release-button-" + this.id).remove();
					this.releaseElement = null;
				}
				this.liquid_volume -= spilloff;
				this.controller.ChangeOffset(spilloff_dheight);
				var beaker_underneath = this.parent.addLiquidVolumeToWorld(this.x+this.skin.spout_point.x, this.y+this.skin.spout_point.y, spilloff, this);
				if (!this.draining){
					this.savedObject.liquid_volume = this.liquid_volume;
					this.savedObject.liquid_volume_perc = this.liquid_volume / this.beaker_volume;
					eventManager.fire("release-from-beaker", [{'Volume_released':this.initial_liquid_volume - this.liquid_volume,'Volume_collected':(beaker_underneath != null ? beaker_underneath.liquid_volume : 0)}], box2dModel);
				}
				this.drawRefillButton();
			}
			if (-this.controller.offset > this.spilloff_height) this.drawReleaseButton();

			if (prevx != this.x || prevy != this.y){
				if (this.refillElement != null){
					this.refillElement.x = -20;
					this.refillElement.y = -(this.height_units + this.depth_units * Math.sin(GLOBAL_PARAMETERS.view_topAngle) ) * GLOBAL_PARAMETERS.SCALE;
				}
				this.controller.SetY(this.body.GetPosition().y);
				this.skin.redraw(-this.controller.offset * GLOBAL_PARAMETERS.SCALE, true);	
			} else {
				this.skin.redraw(-this.controller.offset * GLOBAL_PARAMETERS.SCALE, false);
			}	
		} else {
			if (this.refillElement != null) $("#refill-button-" + this.id).hide();
			if (this.releaseElement != null) $("#release-button-" + this.id).hide();
		}

		// is there a just added body which is bobbing?
		if (this.justAddedActorToBuoyancy != null && this.justAddedActorToBuoyancy.bobbing){
			// is it stationary-ish
			//console.log("from (", this.justAddedActorToBuoyancy.prevPosition.x,",",this.justAddedActorToBuoyancy.prevPosition.y,") to (",this.justAddedActorToBuoyancy.GetPosition().x,",",this.justAddedActorToBuoyancy.GetPosition().y,"");
			var body = typeof this.justAddedActorToBuoyancy.body !== "undefined"?this.justAddedActorToBuoyancy.body:(typeof this.justAddedActorToBuoyancy.base !== "undefined"?this.justAddedActorToBuoyancy.base:(typeof this.justAddedActorToBuoyancy.pan !== "undefined"?this.justAddedActorToBuoyancy.pan:(typeof this.justAddedActorToBuoyancy.leftPan !== "undefined"?this.justAddedActorToBuoyancy.leftPan:(null))));
			if (body == null || (Math.abs(this.justAddedActorToBuoyancy.prevPosition.x - body.GetPosition().x) < 0.01 &&
				Math.abs(this.justAddedActorToBuoyancy.prevPosition.y - body.GetPosition().y) < 0.01)){
				this.justAddedActorToBuoyancy.stationaryCount++;
				if (this.justAddedActorToBuoyancy.stationaryCount > 5){
					eventManager.fire('test-in-beaker',[this.justAddedActorToBuoyancy.skin.savedObject, this.savedObject], box2dModel);
					this.justAddedActorToBuoyancy.bobbing = false;	
				}			
			}
			if (body != null){
				this.justAddedActorToBuoyancy.prevPosition = new b2Vec2(body.GetPosition().x, body.GetPosition().y);
			} else {
				this.justAddedActorToBuoyancy.prePosition = null;
			}	
		}

	}

	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	window.Beakerb2Actor = Beakerb2Actor;
}(window));

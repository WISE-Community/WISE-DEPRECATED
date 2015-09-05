(function (window)
{

	function Labb2World (width_units, height_units, shelf_height_units, wall_width_units, position_x, position_y)
	{
		this.initialize (width_units, height_units, shelf_height_units, wall_width_units, position_x, position_y);
	}

	var p = Labb2World.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.NUM_BACK_OBJECTS = 5;
	p.FLOOR_HEIGHT_UNITS = 0.4;
	p.WALL_WIDTH_UNITS = 0.3;

	p.initialize = function (width_units, height_units, shelf_height_units, wall_width_units, position_x, position_y)
	{
		this.Container_initialize();
		this.width_units = width_units;
		this.height_units = height_units;
		this.shelf_height_units = shelf_height_units;
		this.width_px = width_units * GLOBAL_PARAMETERS.SCALE;
		this.height_px = height_units * GLOBAL_PARAMETERS.SCALE;
		this.wall_width_units = wall_width_units;
		this.shelf_height_px = shelf_height_units * GLOBAL_PARAMETERS.SCALE;
		this.position_x = position_x;
		this.position_y = position_y;
		this.position_x_px = position_x * GLOBAL_PARAMETERS.SCALE;
		this.position_y_px = position_y * GLOBAL_PARAMETERS.SCALE;
		this.dragging_object = null;

		this.skin = new LabShape(this.width_px, this.height_px, this.wall_width_units * GLOBAL_PARAMETERS.SCALE, 7 * GLOBAL_PARAMETERS.SCALE * Math.sin(GLOBAL_PARAMETERS.view_topAngle), this.shelf_height_px);
		this.addChild(this.skin);

		this.b2world = new b2World(new b2Vec2(0, 10), true);

		var floorFixture = new b2FixtureDef;
		floorFixture.density = 1;
		floorFixture.restitution = 0.2;
		floorFixture.filter.categoryBits = 2;
		floorFixture.filter.maskBits = 3;
		floorFixture.shape = new b2PolygonShape;
		floorFixture.shape.SetAsBox(this.width_units / 2, 1.0 / 2 );
		var floorBodyDef = new b2BodyDef;
		floorBodyDef.type = b2Body.b2_staticBody;
		floorBodyDef.position.x = this.position_x + this.width_units / 2;
		floorBodyDef.position.y = this.position_y + this.height_units - this.FLOOR_HEIGHT_UNITS / 2;
		var floor = this.floor = this.b2world.CreateBody(floorBodyDef);
		floor.CreateFixture(floorFixture);

		var leftWallFixture = new b2FixtureDef;
		leftWallFixture.density = 1;
		leftWallFixture.restitution = 0.2;
		leftWallFixture.filter.categoryBits = 2;
		leftWallFixture.filter.maskBits = 3;
		leftWallFixture.shape = new b2PolygonShape;
		leftWallFixture.shape.SetAsBox(this.wall_width_units / 2 , this.height_units / 2);
		var leftWallBodyDef = new b2BodyDef;
		leftWallBodyDef.type = b2Body.b2_staticBody;
		leftWallBodyDef.position.x = this.position_x + this.wall_width_units / 2;
		leftWallBodyDef.position.y = this.position_y + this.height_units / 2;
		var leftWall = this.b2world.CreateBody(leftWallBodyDef);
		leftWall.CreateFixture(leftWallFixture);

		var rightWallFixture = new b2FixtureDef;
		rightWallFixture.density = 1;
		rightWallFixture.restitution = 0.2;
		rightWallFixture.filter.categoryBits = 2;
		rightWallFixture.filter.maskBits = 3;
		rightWallFixture.shape = new b2PolygonShape;
		rightWallFixture.shape.SetAsBox(this.wall_width_units / 2, this.height_units / 2);
		var rightWallBodyDef = new b2BodyDef;
		rightWallBodyDef.type = b2Body.b2_staticBody;
		rightWallBodyDef.position.x = this.position_x + this.width_units - this.wall_width_units / 2;
		rightWallBodyDef.position.y = this.position_y + this.height_units / 2;
		var rightWall = this.b2world.CreateBody(rightWallBodyDef);
		rightWall.CreateFixture(rightWallFixture);

		var shelfFixture = new b2FixtureDef;
		shelfFixture.density = 1;
		shelfFixture.restitution = 0.2;
		shelfFixture.filter.categoryBits = 2;
		shelfFixture.filter.maskBits = 3;
		shelfFixture.shape = new b2PolygonShape;
		shelfFixture.shape.SetAsBox(this.width_units / 2, this.FLOOR_HEIGHT_UNITS / 2);
		var shelfBodyDef = new b2BodyDef;
		shelfBodyDef.type = b2Body.b2_staticBody;
		shelfBodyDef.position.x = this.position_x + this.width_units / 2;
		shelfBodyDef.position.y = this.position_y + this.shelf_height_units;
		var shelf = this.shelf = this.b2world.CreateBody(shelfBodyDef);
		shelf.CreateFixture(shelfFixture);


		this.actors = [];
		this.objects_on_shelf = [];
		this.beakers = [];
		this.puddles = [];
		this.scales = [];
		this.balances = [];
		this.pouring = false;
		this.dragging_object = null;


		// contact listener
		var contactListener = new b2ContactListener;
		contactListener.BeginContact = this.BeginContact.bind(this);
		contactListener.EndContact = this.EndContact.bind(this);
		this.b2world.SetContactListener(contactListener);

		if (GLOBAL_PARAMETERS.DEBUG){
			var debugDraw = this.debugDraw = new b2DebugDraw;
			debugDraw.SetSprite(document.getElementById("debugcanvas").getContext("2d"));
			debugDraw.SetDrawScale(GLOBAL_PARAMETERS.SCALE);
			debugDraw.SetFillAlpha(1.0);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_controllerBit);
			this.b2world.SetDebugDraw(debugDraw);
		}
	}

	/** Place an object directly in the world */
	p.createObjectInWorld = function (savedObject, x, y, rotation, type, overrideEvent, premade_name){
		// when loading previous models, may load a deleted model, we don't make it but we do add to the objects made array
		if (typeof savedObject.is_deleted === "undefined" || !savedObject.is_deleted){
			var object_count = 0;
			for (var i = 0; i < GLOBAL_PARAMETERS.objects_made.length; i++) if (!GLOBAL_PARAMETERS.objects_made[i].is_deleted) object_count++;
			if (object_count >= GLOBAL_PARAMETERS.MAX_OBJECTS_IN_WORLD) return false;

			var compShape;
			if (typeof savedObject.blockArray3d != "undefined"){
				if (savedObject.is_container){
					compShape = new ContainerCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, savedObject);
				} else{
					compShape = new BlockCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, savedObject);
				} 
			} else if (typeof savedObject.cylinderArrays != "undefined"){
				compShape = new CylinderCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, 5,  savedObject);
			} else if (typeof savedObject.rectPrismArrays != "undefined"){
				compShape = new RectPrismCompShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, 5, savedObject);
			}

			// Give a new name only if this object doesn't already have a name
			if (typeof savedObject.id === "undefined"){
				if (typeof premade_name !== "undefined" && premade_name.length > 0) {
					savedObject.id = premade_name;
					savedObject.premade_name = premade_name;
				} else {
					GLOBAL_PARAMETERS.custom_objects_made_count++;
					savedObject.id = "Obj-" + (GLOBAL_PARAMETERS.custom_objects_made_count);
				}
			}
			GLOBAL_PARAMETERS.total_objects_made++;

			/*
			if (typeof savedObject.id === "undefined" || (typeof premade_name !== "undefined" && premade_name.length > 0)){
				savedObject.id = "Obj-" + (GLOBAL_PARAMETERS.total_objects_made+1);
				GLOBAL_PARAMETERS.total_objects_made++;
				savedObject.premade_name = typeof premade_name !== "undefined" ? premade_name : ""; 
			} else {
				// in the case where we are picking up an old id, extract the number and make it the total_objects_made
				var total_objects_made = parseInt(savedObject.id.substr(4))
				GLOBAL_PARAMETERS.total_objects_made = Math.max(GLOBAL_PARAMETERS.total_objects_made+1, total_objects_made);
			}
			*/
			 

			// draw to imgstage
			if (typeof compShape.shape !== "undefined" && compShape.shape != null){
				//imgstage.drawQueue.push(compShape);
				var s = new createjs.Shape(compShape.shape.graphics);
				s.x = compShape.width_px_left;
				s.y = 220 - compShape.height_px_below;
				imgstage.addChild(s);
				imgstage.update();
				var png = Canvas2Image.convertToPNG($("#imgcanvas")[0], 220*GLOBAL_PARAMETERS.IMAGE_SCALE, 220*GLOBAL_PARAMETERS.IMAGE_SCALE);
				png.setAttribute('id', savedObject.id);
				// simplify object
				var img = {"id":png.id, "src":png.src, "width":220*GLOBAL_PARAMETERS.IMAGE_SCALE, "height":220*GLOBAL_PARAMETERS.IMAGE_SCALE};
				GLOBAL_PARAMETERS.images.push(img);
				imgstage.removeChild(s);
				imgstage.update();
			}
			
			var actor;
			if (compShape.is_blockComp){
				actor = new BlockCompb2Actor(compShape); 
			} else if (compShape.is_cylinder){
				actor = new Cylinderb2Actor(compShape); 
			} else if (compShape.is_rectPrism){
				actor = new RectPrismb2Actor(compShape); 
			}
			
			if (y < 0) y = this.height_units;
			
			this.addActor(actor, x, this.height_units - this.FLOOR_HEIGHT_UNITS - y);
			actor.orig_parent = this;
			if (type == "dynamic"){
				actor.onPress = this.actorPressHandler.bind(this);
			}
			GLOBAL_PARAMETERS.objects_made.push(savedObject);
			if (typeof overrideEvent === "undefined" || !overrideEvent) 
				eventManager.fire('make-model',[actor.skin.savedObject], box2dModel);
			return actor;
		} else {
			GLOBAL_PARAMETERS.objects_made.push(savedObject);
			return null;
		}		
	}	

	/** Place an interactive beaker in the testing world */
	p.createBeakerInWorld = function (b, x, y, type){
		var liquid = typeof b.liquid_name === "string" && b.liquid_name.length > 0 && GLOBAL_PARAMETERS.liquids[b.liquid_name] != null ? GLOBAL_PARAMETERS.liquids[b.liquid_name] : null;
		var beaker = new Beakerb2Actor(GLOBAL_PARAMETERS.materials[b.material_name], liquid, b.width_units, b.height_units, b.depth_units, b.init_liquid_volume_perc, b.spilloff_volume_perc, b.showRuler);
		if (y < 0) y = this.height_units;
		this.addBeaker(beaker, x, this.height_units - this.FLOOR_HEIGHT_UNITS - y);
		beaker.orig_parent = this;
		if (typeof type !== "undefined" && type == "dynamic"){
			beaker.skin.backContainer.onPress = this.actorPressHandler.bind(this);
		}
		eventManager.fire('make-beaker',[beaker.skin.savedObject], box2dModel);
		return true;		
	}

	p.createScaleInWorld = function (x, y, pan_width_units, type){
		var scale = new Scaleb2Actor(pan_width_units, 0.1);
		if (y < 0) y = this.height_units;
		this.addScale (scale, x, this.height_units - this.FLOOR_HEIGHT_UNITS - y);
		scale.orig_parent = this;
		if (typeof type !== "undefined" && type == "dynamic"){
			scale.onPress = this.actorPressHandler.bind(this);
		}

		eventManager.fire('make-scale',[scale.skin.savedObject], box2dModel);
		return true;
	}

	p.createBalanceInWorld = function (x, y, height_units, pan_width_units, type){
		var balance = new Balanceb2Actor(height_units, pan_width_units, 0.1);
		if (y < 0) y = this.height_units;
		this.addBalance (balance, x, this.height_units - this.FLOOR_HEIGHT_UNITS - y);
		balance.orig_parent = this;
		if (typeof type !== "undefined" && type == "dynamic"){
			balance.onPress = this.actorPressHandler.bind(this);
		}

		eventManager.fire('make-balance',[balance.skin.savedObject], box2dModel);
		return true;
	}
	
	p.addActor = function (actor, x, y){
		
		this.addChild(actor);
		if (y < this.shelf_height_units){
			var point = this.addActorToShelf(actor, x, y);
			x = point.x;
			y = point.y;
			actor.on_shelf = true;
		} else {
			actor.on_shelf = false;
		}

		actor.setupInWorld(this.position_x + x, this.position_y + y, this.b2world);
		actor.world = this;
		
		this.actors.push(actor);
		// set a flag so we can look for initial contact with this object
		this.justAddedActor = actor;
		this.justRemovedActor = null;
		this.update_mass_flag = true;
		//this.updateMassOnPan();

		// figure out where to place this object based on it's relative position to other actors.
		for (var i = 0; i < this.actors.length; i++){ this.actors[i].body.SetAwake(true); } 
		this.sortActorsDisplayDepth();
	}

	p.addBeaker = function (beaker, x, y){
		this.addChild(beaker);
		if (y < this.shelf_height_units){
			var point = this.addActorToShelf(beaker, x, y);
			x = point.x;
			y = point.y;
			beaker.on_shelf = true;
		} else {
			beaker.on_shelf = false;
		}

		beaker.setupInWorld(this.position_x + x , this.position_y + y , this.b2world);
		this.sortActorsDisplayDepth();

		beaker.world = this;
		this.beakers.push(beaker);
		
	}

	p.addScale = function (scale, x, y){
		this.addChild(scale);
		if (y < this.shelf_height_units){
			var point = this.addActorToShelf(scale, x,  y);
			x = point.x;
			y = point.y;
			scale.on_shelf = true;
		} else {
			scale.on_shelf = false;
		}
		scale.setupInWorld(this.position_x + x , this.position_y + y , this.b2world);
		
		scale.world = this;
		this.scales.push(scale);
		this.sortActorsDisplayDepth();
	}

	p.addBalance = function (balance, x, y){
		this.addChild(balance);
		if (y < this.shelf_height_units){
			var point = this.addActorToShelf(balance, x, y);
			x = point.x;
			y = point.y;
			balance.on_shelf = true;
		} else {
			balance.on_shelf = false;
		}

		balance.setupInWorld(this.position_x + x , this.position_y + y , this.b2world);
		
		balance.world = this;
		this.balances.push(balance);
		this.sortActorsDisplayDepth();
	}

	p.addActorToShelf = function(actor, x, y){
		// if the y position is negative will be placed on shelf in open space
		if (y < 0){
			var running_left_x = GLOBAL_PARAMETERS.SCALE;
			var placed = false;
			var o = null;
			for (var i = 0; i < this.objects_on_shelf.length; i++){
				o = this.objects_on_shelf[i];
				var right_x = o.x - o.width_px_left - GLOBAL_PARAMETERS.SCALE;
				if (right_x - running_left_x > (actor.width_px_left + actor.width_px_right + GLOBAL_PARAMETERS.SCALE)){
					x = running_left_x + GLOBAL_PARAMETERS.SCALE;
					placed = true; break;
				} else {
					running_left_x = o.x + o.width_px_right + GLOBAL_PARAMETERS.SCALE;
				}
			}
			if (!placed){
				x = running_left_x;
				var height_above = 0;
				if (x > this.width_px){
					if (o != null && typeof o.height_units_above !== "undefined" && !isNaN(o.height_units_above)) height_above = o.height_units_above + o.height_units_below;
					x = (this.width_px - actor.width_px_right)  * Math.random();
				}
				y = this.shelf_height_units - actor.height_units_below -  height_above;
			} else {
				y = this.shelf_height_units - actor.height_units_below;
			}
			actor.x = x;
			x /= GLOBAL_PARAMETERS.SCALE; 
		}
		
		actor.on_shelf = true;
		this.objects_on_shelf.push(actor);
		
		if(!(actor instanceof Beakerb2Actor) && !(actor instanceof Scaleb2Actor) && !(actor instanceof Balanceb2Actor))
			this.attachHTMLToShelf(actor);

		return new b2Vec2(x , y);
	}

	p.removeActor = function (actor)
	{
		var savedObject = actor.skin.savedObject;
		this.justRemovedActor = actor;
		this.justAddedActor = null;
		
		this.removeActorFromShelf(actor);
		this.actors.splice(this.actors.indexOf(actor), 1);
		
		if (actor.controlledByBuoyancy){
			actor.containedWithin.removeActor(actor);	
		}
		this.b2world.DestroyBody(actor.body);
		actor.body = null;
		actor.world = null;
		if (typeof actor.button !== "undefined") this.removeChild(actor.button);
		if (typeof actor.html !== "undefined" && actor.html != null) actor.html.remove();
		actor.parent.removeChild(actor);
		//eventManager.fire('delete-model',[savedObject], box2dModel);

		this.sortActorsDisplayDepth();
		// since we are deleting an actor we may be opening a spot for a new actor
		if(typeof builder !== "undefined" && builder != null && typeof builder.reachedMax !== "undefined" && builder.reachedMax){
			builder.drawCurrentMaterial();
		}
	}

	/** When a beaker is removed from this world take the skin objects that were on the world and put them on the beaker */
	p.removeBeaker = function (beaker){
		// set skin containers to zero because they are now nested in single beaker object
		var savedObject = beaker.skin.savedObject;
		this.removeActorFromShelf(beaker);
		this.beakers.splice(this.beakers.indexOf(beaker), 1);
		
		if (beaker.controlledByBuoyancy){
			beaker.containedWithin.removeActor(beaker);	
		}

		beaker.removeFromWorld();
		//eventManager.fire('delete-beaker',[savedObject], box2dModel);
		
	}

	p.removeScale = function (scale){
		// set skin containers to zero because they are now nested in single beaker object
		var savedObject = scale.skin.savedObject;
		this.removeActorFromShelf(scale);
		this.scales.splice(this.scales.indexOf(scale), 1);
		
		if (scale.controlledByBuoyancy){
			scale.containedWithin.removeActor(scale);	
		}
		scale.removeFromWorld();
		//eventManager.fire('delete-scale',[savedObject], box2dModel);
		
	}

	p.removeBalance = function (balance){
		// set skin containers to zero because they are now nested in single beaker object
		var savedObject = balance.skin.savedObject;
		this.removeActorFromShelf(balance);
		this.balances.splice(this.balances.indexOf(balance), 1);
		
		if (balance.controlledByBuoyancy){
			balance.containedWithin.removeActor(balance);	
		}
		balance.removeFromWorld();
		//eventManager.fire('delete-balance',[savedObject], box2dModel);
		
	}

	p.removeActorFromShelf = function(actor){
		if (actor.on_shelf){
			this.objects_on_shelf.splice(this.objects_on_shelf.indexOf(actor),1);
			actor.on_shelf = false;
		}
	}

	/** This works for objecs where the width_px_left, height_px_above, width_px_right, width_px_below are defined
	    i.e., there is no assumption of where 0,0 is relative to the object.
	    Both objects must be on the stage, i.e. must have parents */
	p.hitTestObject = function (o)
	{
		if (typeof(o.width_px_left) != "undefined" && typeof(o.width_px_right) != "undefined" && typeof(o.height_px_above) != "undefined" && typeof(o.height_px_below) != "undefined")
		{
			if (typeof(o.parent) != "undefined" && typeof(this.parent) != "undefined")
			{
				var gp = o.parent.localToGlobal(o.x, o.y);
				var lp = this.globalToLocal(gp.x, gp.y);
				if (this.hitTest(lp.x-o.width_px_left, lp.y+o.height_px_below) && this.hitTest(lp.x+o.width_px_right, lp.y+o.height_px_below))
				{
					return true;
				} else
				{
					return false;
				}
			} else		
			{
				return false;
			}
		} else
		{
			console.log("The height and width next to the object are not defined.");
			return false;
		}

	}

	/** Removes object from its current parent, allows movement based on current*/
	p.actorPressHandler = function (evt)
	{
		if (this.dragging_object != null) return;
		var is_beaker = false;
		if (typeof evt.target.beakerShape !== "undefined"){
			is_beaker = true;
			evt.target = evt.target.beakerShape.relativeParent;
		}
		var source_parent = evt.target.parent;
		//some special processing here for a beaker because the beaker has its front and back directly as children on world, put on beaker itself
		var offset = evt.target.globalToLocal(evt.stageX, evt.stageY);

		var lp = source_parent.localToLocal(evt.target.x, evt.target.y, this);
		// if object was in libarary remove
		if (source_parent instanceof Beakerb2Actor) source_parent = source_parent.parent;
		if (evt.target instanceof Beakerb2Actor) {
			source_parent.removeBeaker(evt.target);
		} else if (evt.target instanceof Scaleb2Actor) {
			source_parent.removeScale(evt.target);
		} else if (evt.target instanceof Balanceb2Actor) {
			source_parent.removeBalance(evt.target);
		} else {
			source_parent.removeActor(evt.target);
		}

		this.dragging_object = evt.target;
		this.addChild(evt.target);
		evt.target.x = lp.x;
		evt.target.y = lp.y;
		evt.target.rotation = 0;
		evt.target.update();
		evt.onMouseMove = function (ev){
			var parent = this.target.parent;
			var lpoint = parent.globalToLocal(ev.stageX-offset.x, ev.stageY-offset.y);
			var newX = lpoint.x;
			var newY = lpoint.y;
			//console.log(newY, source_parent.y, source_parent.y + source_parent.height_px - this.target.height_px_below, source_parent.height_px , this.target.height_px_below);
			if (newX > this.target.width_px_left && newX < source_parent.width_px - this.target.width_px_right) this.target.x = newX;
			if (newY > 0 && newY < source_parent.height_px - this.target.height_px_below) this.target.y = newY;
			stage.needs_to_update = true;
		}
		evt.onMouseUp = function (ev)
		{
			var parent = this.target.parent;
			var wpoint = parent.globalToLocal(ev.stageX-offset.x, ev.stageY-offset.y);
			wpoint.x /= GLOBAL_PARAMETERS.SCALE;
			wpoint.y /= GLOBAL_PARAMETERS.SCALE;
			if (this.target instanceof Beakerb2Actor){
				parent.addBeaker(this.target, wpoint.x, wpoint.y);
			} else if (this.target instanceof Scaleb2Actor){
				parent.addScale(this.target, wpoint.x, wpoint.y);
			} else if (this.target instanceof Balanceb2Actor){
				parent.addBalance(this.target, wpoint.x, wpoint.y);
			} else {
				parent.addActor(this.target, wpoint.x, wpoint.y);
			}
			parent.dragging_object = null;
			stage.needs_to_update = true;			
		}
	}

	/** Called whenever anything touches anything.  Useful for knowing when something happens in world */
	p.BeginContact = function (contact)
	{
		this.sortActorsDisplayDepth();
		// deal with contacts for each beaker scale and balance
		for (var i = 0; i < this.beakers.length; i++){
			this.beakers[i].BeginContact(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body);
		}
		for (var i = 0; i < this.scales.length; i++){
			this.scales[i].BeginContact(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body);
		}
		for (var i = 0; i < this.balances.length; i++){
			this.balances[i].BeginContact(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body);
		}
	}

	p.EndContact = function (contact){
		// deal with contacts for each beaker scale and balance
		for (var i = 0; i < this.beakers.length; i++){
			this.beakers[i].EndContact(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body);
		}
		for (var i = 0; i < this.scales.length; i++){
			this.scales[i].EndContact(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body);
		}
		for (var i = 0; i < this.balances.length; i++){
			this.balances[i].EndContact(contact.GetFixtureA().m_body, contact.GetFixtureB().m_body);
		}
	}

	/**
	*	Will sort by the highest objects on top, then right-most objects
	*/
	p.sortActorsDisplayDepth = function(){
		var actors = this.beakers.concat(this.actors).concat(this.scales).concat(this.beakers);
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

	p.getNumBackgroundChildren = function (){
		return 1;
	}

	/** Some volume of liquid is being released from the given x,y point.  Look for any beakers below this point, else make a puddle */
	p.addLiquidVolumeToWorld = function (x, y, volume, beaker){
		var beaker_underneath = null;
		for (var b = 0; b < this.beakers.length; b++){
			var testbeaker = this.beakers[b];
			var bx = x - testbeaker.x;
			var by = y -testbeaker.y;
			// make sure the beaker is actuallly underneath and does not contain a different liquid than this one
			if (beaker != testbeaker && testbeaker.hitTestUnderPoint(bx, by) && (testbeaker.liquid == null ||  beaker.liquid.name == testbeaker.liquid.name)){
				if (beaker_underneath != null){
					if (testbeaker.y < beaker_underneath.y){
						beaker_underneath = testbeaker;
					}
				} else {
					beaker_underneath = testbeaker;
				}
			}
		}
		this.pouring = true;
		if (beaker_underneath == null){
			this.addToPuddle(x, volume, beaker);
			// draw from beaker to ground
			this.skin.drawPour(beaker.liquid.fill_color, x-4, y, 4, this.height_px - this.FLOOR_HEIGHT/2 - y);
			return null;
		} else {
			beaker_underneath.addLiquidVolume(volume, beaker);
			// draw from beaker to beaker
			this.skin.drawPour(beaker.liquid.fill_color, x - 4, y, 4, beaker_underneath.y - beaker_underneath.width_from_depth/2 - y);
			return beaker_underneath;
		}
	}

	/** When a beaker is refilled all of its liquid needs to be removed from  puddles and other beakers. */
	p.removeLiquidAssociatedWithBeaker = function (beaker){
		// puddles
		this.removePuddlesAssociatedWithBeaker(beaker);
		// other beakers
		for (var i = 0; i < this.beakers.length; i++){
			if (this.beakers[i] != beaker){
				var volume = this.beakers[i].removeLiquidAssociatedWithBeaker(beaker);
				if (volume > 0){
					beaker.addLiquidVolume (volume);	
				} 
			}
		}
	}

	/** Create an inital puddle object and add to puddles array */
	p.createPuddle = function (x, volume, beaker){
		var puddle = {};
		var liquid = beaker.liquid;
		puddle.beakers = [beaker];
		puddle.volumes = [volume];
		puddle.volume = volume;
		puddle.x = x;
		puddle.liquid = liquid;
		// assume a depth of .1
		var width_px = Math.sqrt(volume / 10.0) * Math.cos(GLOBAL_PARAMETERS.view_sideAngle) * GLOBAL_PARAMETERS.SCALE;
		var height_px = Math.sqrt(volume / 10.0) * Math.sin(GLOBAL_PARAMETERS.view_topAngle) * GLOBAL_PARAMETERS.SCALE;
		if (height_px > this.FLOOR_HEIGHT){
			//move extra liquid from height to width
			width_px += (height_px - this.FLOOR_HEIGHT);
			height_px = this.FLOOR_HEIGHT;
		} 
		var shape = this.skin.createPuddleShape(liquid.fill_color, x, width_px, height_px);
		puddle.width_px = width_px;
		puddle.height_px = height_px;
		puddle.shape = shape;
		this.puddles.push(puddle);
	}

	/** Find a puddle under the object if one exists, else create a new puddle */
	p.addToPuddle = function(x, volume, beaker){
		// find this reference see if the 
		var liquid = beaker.liquid;
		for (var i = 0; i < this.puddles.length; i++){
			var puddle = this.puddles[i];
			if (liquid == puddle.liquid && x >= puddle.x - puddle.width_px/2 && x <= puddle.x + puddle.width_px/2){
				// search for a reference to this beaker
				var beaker_found = false;
				for (var j = puddle.beakers.length-1; j >= 0; j--){
					if (puddle.beakers[j] == beaker){
						beaker_found = true;
						puddle.volumes[j] += volume;
						break;
					}
				}
				if (!beaker_found){
					puddle.beakers.push(beaker);
					puddle.volumes.push(volume);
				}
				puddle.volume += volume;
				var width_px = Math.sqrt(volume / 10.0) * Math.cos(GLOBAL_PARAMETERS.view_sideAngle) * GLOBAL_PARAMETERS.SCALE;
				var height_px = Math.sqrt(volume / 10.0) * Math.sin(GLOBAL_PARAMETERS.view_topAngle) * GLOBAL_PARAMETERS.SCALE;
				if (height_px + puddle.height_px > this.FLOOR_HEIGHT){
					//move extra liquid from height to width
					width_px += (height_px + puddle.height_px - this.FLOOR_HEIGHT);
					puddle.height_px = this.FLOOR_HEIGHT;
					puddle.width_px += width_px;
				} else {
					puddle.height_px += height_px;
					puddle.width_px += width_px;
				}
				width_px = puddle.width_px;
				height_px = puddle.height_px;
				// don't bother drawing if width is greater than screen
				if (width_px < 2*$("#b2canvas").width()){
					this.skin.updatePuddleShape(puddle.shape, beaker.liquid.fill_color, width_px, height_px);
				}
				return;
			}
		}
		this.createPuddle(x, volume, beaker);
	} 

	/** For an object remove (or decrease) puddles associated with an object */
	p.removePuddlesAssociatedWithBeaker = function(beaker){
		for (var i = this.puddles.length-1; i >= 0; i--){
			var puddle = this.puddles[i];
			for (var j = puddle.beakers.length-1; j >= 0; j--){
				if (puddle.beakers[j] == beaker){
					// beaker contributed to this puddle
					var volume = puddle.volumes[j];
					beaker.addLiquidVolume (volume);
					puddle.volume -= volume;
					var width_px = Math.sqrt(volume / 10.0) * Math.cos(GLOBAL_PARAMETERS.view_sideAngle) * GLOBAL_PARAMETERS.SCALE;
					var height_px = Math.sqrt(volume / 10.0) * Math.sin(GLOBAL_PARAMETERS.view_topAngle) * GLOBAL_PARAMETERS.SCALE;
					if (height_px > this.FLOOR_HEIGHT){
						//move extra liquid from height to width
						width_px += (height_px - this.FLOOR_HEIGHT);
						height_px = this.FLOOR_HEIGHT;
					} 
					puddle.width_px -= width_px;
					puddle.height_px -= height_px;
					puddle.beakers.splice(j, 1);
					puddle.volumes.splice(j, 1);
				}
				if (puddle.beakers.length == 0) break;
			}
			if (puddle.beakers.length == 0){
				this.skin.removePuddleShape(puddle.shape);
				this.puddles.splice(i, 1);
			} else {
				this.skin.updatePuddleShape(puddle.shape, beaker.liquid.fill_color, puddle.width_px, puddle.height_px);
			}	
		}
	}


	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
		for (var i = 0; i < this.beakers.length; i++){
			this.beakers[i].update();
		}

		for(i = 0; i < this.actors.length; i++){
			if (this.actors[i].body.IsAwake()){
				for (var j = 0; j < this.beakers.length; j++){
					this.beakers[j].addIfWithin(this.actors[i]);
				}
			} 
			this.actors[i].update();
		}

		for (i = 0; i < this.scales.length; i++){
			if (this.scales[i].base.IsAwake()){
				for (var j = 0; j < this.beakers.length; j++){
					this.beakers[j].addIfWithin(this.scales[i]);
				}
			} 
			this.scales[i].update();
		}

		for (i = 0; i < this.balances.length; i++){
			if (this.balances[i].beam.IsAwake()){
				for (var j = 0; j < this.beakers.length; j++){
					this.beakers[j].addIfWithin(this.balances[i]);
				}
			} 
			this.balances[i].update();
		}

		// are we pouring? if not clear pouring graphics
		if (!this.pouring){
			this.skin.drawPour();
		}
		this.pouring = false;

		this.b2world.Step(1/createjs.Ticker.getFPS(), 10, 10);
		if (GLOBAL_PARAMETERS.DEBUG) this.b2world.DrawDebugData();
		this.b2world.ClearForces();
	}


	
	/////////////// HTMLS
	p.attachHTMLToShelf = function (o){
		// do we need to add html?
		var b_id = "library-button-" + o.id;
		var htmlText;
		if (o.skin.savedObject.is_deletable && GLOBAL_PARAMETERS.INCLUDE_BUILDER){
			if (o.skin.savedObject.is_revisable && GLOBAL_PARAMETERS.INCLUDE_BUILDER){
				if (o.skin.savedObject.is_duplicable && GLOBAL_PARAMETERS.INCLUDE_BUILDER){
					htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Duplicate</a></li><li><a href="#">Delete</a></li><li><a href="#">Revise</a></li></ul></div>';
				} else {
					htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Delete</a></li><li><a href="#">Revise</a></li></ul></div>';
				}
			} else {
				if (o.skin.savedObject.is_duplicable && GLOBAL_PARAMETERS.INCLUDE_BUILDER){
					htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Duplicate</a></li><li><a href="#">Delete</a></li></ul></div>';
				} else {
					htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Delete</a></li></ul></div>';
				}
			}
		} else {
			if (o.skin.savedObject.is_revisable && GLOBAL_PARAMETERS.INCLUDE_BUILDER){
				if (o.skin.savedObject.is_duplicable && GLOBAL_PARAMETERS.INCLUDE_BUILDER){
					htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Duplicate</a></li><li><a href="#">Revise</a></li></ul></div>';	
				} else {
					htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Revise</a></li></ul></div>';	
				}
			} else {
				if (o.skin.savedObject.is_duplicable && GLOBAL_PARAMETERS.INCLUDE_BUILDER){
					htmlText = '<div id ="' + b_id + '" style="font-size:14px; position:absolute"><input type="submit"/><ul><li><a href="#">Duplicate</a></li></ul></div>';			
				} else {
					htmlText = '';
				}
			}
		}

		//if (htmlText.length > 0){
		$('#library-button-holder').append(htmlText);id ="' + b_id + '"
		$('#library-button-holder').find("ul").menu().hide();
			var htmlElement = $("#" + b_id).find("input").button({
		        label: "Actions",
		        icons: {
		            primary: 'ui-icon-triangle-1-s'
		        }}).click(function() {
				    var menu = $(this).parent().find("ul").show().position({
					my: "left top",
			        at: "left bottom",
			        of: this
					});
					$( document ).one( "click",function(event) {
					    if ($(event.target).text() == "Duplicate"){
					        labWorld.duplicateObjectFromHTML($(event.target).parent().parent().parent());
						} else if ($(event.target).text() == "Delete"){
					        labWorld.deleteObjectFromHTML($(event.target).parent().parent().parent());
					    } else if ($(event.target).text() == "Revise"){
					        labWorld.reviseObjectFromHTML($(event.target).parent().parent().parent());
					    }
					    menu.hide();
					    return false;
		            });
		            return false;
				});
		                
		var element = new createjs.DOMElement(htmlElement[0]);
		this.addChild(element);
		element.x = o.x;// + o.width_px_right/4 - o.width_px_left/4;
		element.y = 10 ;
				
		o.html = htmlElement.parent();
		o.button = element;
	}

	p.reviseObjectFromHTML = function (html){
		for (var i = 0; i < this.actors.length; i++){
			if (this.actors[i].html.attr("id") == html.attr("id")){
				var savedObject = this.actors[i].skin.savedObject;
				this.reviseObject(this.actors[i]);
				eventManager.fire("revise-model", [savedObject]);
				return true;
			}
		}
		return false;
	}
		p.reviseObject = function (o){
			o.skin.savedObject.is_revisable = true;
			var savedObject = o.skin.savedObject;
			if (builder.restoreSavedObject(savedObject)){
				o.skin.savedObject.is_deleted = true;
				this.removeActor(o);
				return true;
			} else {
				return false;
			}
		}

	p.duplicateObjectFromHTML = function (html){
		for (var i = 0; i < this.actors.length; i++){
			if (this.actors[i].html.attr("id") == html.attr("id")){
				var savedObject = this.duplicateObject(this.actors[i]).skin.savedObject;	
				eventManager.fire("duplicate-model", [savedObject]);
				return true;
			}
		}
		return false;
	}

		p.duplicateObject = function (o){
			// always make duplicates deletable
			o.skin.savedObject.is_deletable = true;
			o.skin.savedObject.is_duplicable = false;
			var actor = this.createObjectInWorld(this.duplicateSavedObject(o.skin.savedObject), 0, -1, 0, "dynamic", true);
			// since we are deleting an actor we may be opening a spot for a new actor
			if(typeof builder !== "undefined" && builder != null ){
				builder.drawCurrentMaterial();
			}
			return actor;
		}

	p.deleteObjectFromHTML = function (html){
		for (var i = 0; i < this.actors.length; i++){
			if (this.actors[i].html.attr("id") == html.attr("id")){
				var savedObject = this.actors[i].skin.savedObject;
				this.actors[i].skin.savedObject.is_deleted = true;
				this.removeActor(this.actors[i]);
				eventManager.fire("delete-model", [savedObject]);
				return true;
			}
		}
		return false;
	}

	p.duplicateSavedObject = function (savedObject){
		var out = {};
		for (var key in savedObject){
			out[key] = savedObject[key];
		}
		return out;
	}

	
	window.Labb2World = Labb2World;
}(window));

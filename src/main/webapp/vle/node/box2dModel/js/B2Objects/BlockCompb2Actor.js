(function (window)
{

	function BlockCompb2Actor (skin)
	{
		this.initialize (skin);
	}

	var p = BlockCompb2Actor.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;


	p.initialize = function (skin)
	{
		this.Container_initialize();
		this.skin = skin;
		this.is_container = this.skin.is_container;

		this.addChild(this.skin);
		this.width_px_left = skin.width_px_left;
		this.width_px_right = skin.width_px_right;
		this.height_px_above = skin.height_px_above;
		this.height_px_below = skin.height_px_below;
		this.height_units_below = this.skin.height_px_below / GLOBAL_PARAMETERS.SCALE;
		this.height_units_above = this.skin.height_px_above / GLOBAL_PARAMETERS.SCALE;
		this.width_units_left = this.skin.width_px_left / GLOBAL_PARAMETERS.SCALE;
		this.width_units_right = this.skin.width_px_right / GLOBAL_PARAMETERS.SCALE;
		

		this.world = null;
		this.body = null;
		// create an array of Fixture Definitions and Body Definitions and put them in relative space from each other
		this.fixDefs = new Array();
		
		var bodyDef = this.bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.angularDamping = 0.5;
		bodyDef.position.x = 0;
		bodyDef.position.y = 0;
		bodyDef.userData = {"actor":this}
		
		this.viewing_rotation = 0;

		this.update_flag = false;
		this.constructFixtures();
	}

	p.constructFixtures = function ()
	{
		var i, j;
		var skin = this.skin;
		// go from bottom up.
		this.fixDefs = [];
		for (j = 0; j < skin.array2d[0].length; j++)
		{
			for (i = 0; i < skin.array2d.length; i++)
			{
				if (skin.array2d[i][j].mass > 0)
				{
					var fixDef = new b2FixtureDef;
					fixDef.x_index = i;
					fixDef.y_index = j;
					fixDef.area = 1;
					fixDef.density = skin.array2d[i][j].mass*1;
					fixDef.friction = 0.5;
					fixDef.restitution = 0.2;
					fixDef.filter.categoryBits = 1;
					fixDef.filter.maskBits = 3;
					var vec = new b2Vec2();
					vec.Set (((i+0.5)*skin.unit_width_px)/GLOBAL_PARAMETERS.SCALE, ((j+0.5)*skin.unit_width_px)/GLOBAL_PARAMETERS.SCALE);
					fixDef.shape = new b2PolygonShape;
					fixDef.shape.SetAsOrientedBox(skin.unit_width_px/2/GLOBAL_PARAMETERS.SCALE, (skin.unit_height_px/2/GLOBAL_PARAMETERS.SCALE), vec, 0.0);
					// we need information about how many open spaces are in this fixture
					fixDef.totalSpaces = skin.array2d[i][j].totalSpaces;
					fixDef.materialSpaces = skin.array2d[i][j].materialSpaces;
					fixDef.exteriorSpaces = skin.array2d[i][j].exteriorSpaces;
					fixDef.interiorSpaces = skin.array2d[i][j].interiorSpaces;
					fixDef.protectedSpaces = skin.array2d[i][j].protectedSpaces;
					fixDef.materialDensity = skin.array2d[i][j].mass / skin.array2d[i][j].materialSpaces;
					this.fixDefs.push(fixDef);	
				}						
			}
		}
	}

	p.setupInWorld = function (position_x, position_y, b2world){
		var bodyDef = this.bodyDef;
		bodyDef.position.x = position_x;
		bodyDef.position.y = position_y;
		this.b2world = b2world;
		
		if (typeof this.body !== "undefined" && this.body != null) b2world.DestroyBody(this.body);
		var body = this.body = this.b2world.CreateBody(bodyDef);
		
		var area = 0;
		var volume = 0;
		var volume_enclosed = 0;
		for (var i = 0; i < this.fixDefs.length; i++)
		{
			var fixDef = this.fixDefs[i];
			var f = body.CreateFixture(fixDef);
			f.x_index = fixDef.x_index;
			f.y_index = fixDef.y_index;
			f.materialDensity = fixDef.materialDensity;
			f.totalSpaces = fixDef.totalSpaces;
			f.materialSpaces = fixDef.materialSpaces;
			f.exteriorSpaces = fixDef.exteriorSpaces;
			f.percentSubmerged = 0;
			if (typeof(fixDef.interiorSpaces) != "undefined"){f.interiorSpaces = fixDef.interiorSpaces;}else{f.interiorSpaces = 0;}
			if (typeof(fixDef.protectedSpaces) != "undefined"){f.protectedSpaces = fixDef.protectedSpaces;}else{f.protectedSpaces = 0;}
			// set density for the length of the entire depth
			f.area = fixDef.area;
			//f.SetDensity((f.materialDensity * f.materialSpaces)/f.area);

			volume += f.materialSpaces + f.protectedSpaces + f.interiorSpaces;
			volume_enclosed += f.materialSpaces + f.protectedSpaces;

			var lowerBound = f.GetAABB().lowerBound;
			var upperBound = f.GetAABB().upperBound;
			area += f.area;
			if (typeof(f.emptySpaces) != "undefined") body.emptySpaces += f.emptySpaces;

		}
		// put aabb, i.e. upper and lower limit onto the body and area
		body.local_width_right = this.width_px_right / GLOBAL_PARAMETERS.SCALE;
		body.local_height_below = this.height_px_below / GLOBAL_PARAMETERS.SCALE;
		body.area = area;
		body.volume = volume;
		body.fullySubmerged = false;
		body.fullyEmerged = true;
		body.percentSubmerged = 0;
		body.percentSubmerged2d = bodyDef.percentSubmerged2d;
		body.percentSubmergedChangedFlag = false;
		body.soaked = false;
		body.is_container = this.is_container;
		body.percentSubmerged2d = [];
		for (i = 0; i < this.skin.array2d.length; i++) {
			body.percentSubmerged2d[i] = [];
			for (j = 0; j < this.skin.array2d[0].length; j++){
				body.percentSubmerged2d[i][j] = 0;
			}
		}
		if (GLOBAL_PARAMETERS.DEBUG_DEEP){
			g = this.g = new createjs.Graphics();
			this.shape = new createjs.Shape(g);	
			g.beginFill("rgba(250,0,0,1.0)");
			g.drawCircle(0, 5, 5);
			g.endFill();
			this.addChild(this.shape);
		}
	}

	
	/** Update skin to reflect position of b2 body on screen */
	p.update = function (){
		if (this.body != null && typeof(this.body) != "undefined" && typeof(this.parent) != "undefined" && this.parent != null)
		{
			if (this.parent.parent == null){
				this.x = (this.body.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x;
				this.y = (this.body.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
			} else {
				this.x = (this.body.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x - this.parent.parent.x;
				this.y = (this.body.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y - this.parent.parent.y;
			}
			this.rotation = this.body.GetAngle() * (180 / Math.PI);

			if (this.update_flag || Math.abs (this.viewing_rotation - this.rotation) > 10 || (typeof this.body.percentSubmergedChangedFlag != "undefined" && this.body.percentSubmergedChangedFlag))
			{
				this.viewing_rotation = Math.round(this.rotation/10) * 10;
				this.skin.redraw(this.viewing_rotation, this.body.percentSubmerged2d);
				this.update_flag = false;
			}
			
		} else
		{
			this.viewing_rotation = 0;
			this.skin.redraw();
		}
	}
	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	
	window.BlockCompb2Actor = BlockCompb2Actor;
}(window));

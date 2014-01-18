(function (window)
{
	/** This actor in the world creates its own skin based upon dimensions */


	function Balanceb2Actor (height_units, pan_width_units, pan_height_units)
	{
		this.initialize (height_units, pan_width_units, pan_height_units);
	}

	var p = Balanceb2Actor.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	// constants
	// constants
	p.MAX_TILT_ANGLE = Math.PI/2*0.7;
	p.BEAM_MASS = 1000;
	p.ROPE_WIDTH = 0.01;

	p.initialize = function (height_units, pan_width_units, pan_height_units)
	{
		this.Container_initialize();
		this.height_units = height_units;
		this.width_units = pan_width_units * 4;
		this.pan_width_units = pan_width_units;
		this.pan_height_units = pan_height_units;
		this.pan_dy_units = pan_width_units/2;
		this.beam_length_x_units = pan_width_units;
		this.beam_length_y_units = this.beam_length_x_units/5;
		this.beam_height_units = 0.4;
		this.beam_height_edge_units = 0.2;
		this.beam_length_units = Math.sqrt(Math.pow(this.beam_length_x_units, 2) + Math.pow(this.beam_length_y_units, 2));
		this.beam_angle = Math.tan(this.beam_length_y_units/this.beam_length_x_units)
		this.stem_width_units = 0.5;
		this.stem_height_units = height_units - this.beam_height_units;
		this.base_width_units = this.stem_width_units;
		this.base_height_units = 1;
		this.base_height_edge_units = 0.5;
		

		this.savedObject = {};
		this.savedObject.id = "ba"+GLOBAL_PARAMETERS.total_scales_made++;
		
		this.savedObject.pan_width_units = pan_width_units;
		
		this.skin = new BalanceShape(this.pan_width_units * GLOBAL_PARAMETERS.SCALE, this.pan_height_units * GLOBAL_PARAMETERS.SCALE, this.pan_dy_units * GLOBAL_PARAMETERS.SCALE, this.pan_width_units * GLOBAL_PARAMETERS.SCALE, 0.2 * GLOBAL_PARAMETERS.SCALE, 0.2 * GLOBAL_PARAMETERS.SCALE, this.stem_width_units * GLOBAL_PARAMETERS.SCALE, this.stem_height_units * GLOBAL_PARAMETERS.SCALE, this.beam_length_x_units * GLOBAL_PARAMETERS.SCALE, this.beam_length_y_units * GLOBAL_PARAMETERS.SCALE, this.beam_height_units * GLOBAL_PARAMETERS.SCALE, this.beam_height_edge_units * GLOBAL_PARAMETERS.SCALE, this.savedObject);
		this.addChild(this.skin);
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

		var bodyDef = this.bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.angularDamping = 0.5;
		bodyDef.position.x = 0;
		bodyDef.position.y = 0;
		bodyDef.userData = {"actor":this}
		
		this.viewing_rotation = 0;
		this.justAddedBody = null;
	
		this.constructFixtures();
	}

	p.constructFixtures = function (){
		var vecs, vec;

		var baseFixtureDef = this.baseFixtureDef = new b2FixtureDef;
		baseFixtureDef.density = 10000;
		baseFixtureDef.restitution = 0.2;
		baseFixtureDef.friction = 1.0;
		baseFixtureDef.filter.categoryBits = 2;
		baseFixtureDef.filter.maskBits = 7;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(0,0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(this.stem_width_units/2, this.stem_height_units - this.base_height_units); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(this.base_width_units/2, this.stem_height_units - this.base_height_edge_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(this.base_width_units/2, this.stem_height_units); vecs[3] = vec;
		vec = new b2Vec2(); vec.Set(-this.base_width_units/2, this.stem_height_units); vecs[4] = vec;
		vec = new b2Vec2(); vec.Set(-this.base_width_units/2, this.stem_height_units - this.base_height_edge_units); vecs[5] = vec;
		vec = new b2Vec2(); vec.Set(-this.stem_width_units/2, this.stem_height_units - this.base_height_units); vecs[6] = vec;
		baseFixtureDef.shape = new b2PolygonShape;
		baseFixtureDef.shape.SetAsArray(vecs, vecs.length);
		var baseBodyDef = this.baseBodyDef = new b2BodyDef;
		baseBodyDef.type = b2Body.b2_dynamicBody;
		
		var leftBeamFixtureDef = this.leftBeamFixtureDef = new b2FixtureDef;
		leftBeamFixtureDef.density = 100;
		leftBeamFixtureDef.friction = 0.5;
		leftBeamFixtureDef.filter.categoryBits = 4;
		leftBeamFixtureDef.filter.maskBits = 6;
		leftBeamFixtureDef.restitution = 0.0;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(-this.beam_length_x_units, this.beam_length_y_units); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(-this.beam_length_x_units, this.beam_length_y_units-this.beam_height_edge_units); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(0, -this.beam_height_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(0, 0); vecs[3] = vec;
		leftBeamFixtureDef.shape = new b2PolygonShape;
		leftBeamFixtureDef.shape.SetAsArray(vecs, vecs.length);
		
		var rightBeamFixtureDef = this.rightBeamFixtureDef = new b2FixtureDef;
		rightBeamFixtureDef.density = 100;
		rightBeamFixtureDef.friction = 0.5;
		rightBeamFixtureDef.restitution = 0.0;
		rightBeamFixtureDef.filter.categoryBits = 4;
		rightBeamFixtureDef.filter.maskBits = 6;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(0, 0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(0, -this.beam_height_units); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(this.beam_length_x_units, this.beam_length_y_units-this.beam_height_edge_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(this.beam_length_x_units, this.beam_length_y_units); vecs[3] = vec;
		rightBeamFixtureDef.shape = new b2PolygonShape;
		rightBeamFixtureDef.shape.SetAsArray(vecs, vecs.length);
		
		var beamBodyDef = this.beamBodyDef = new b2BodyDef;
		beamBodyDef.type = b2Body.b2_dynamicBody;
		
		// join beam with stem
		var beamJointDef = this.beamJointDef = new b2RevoluteJointDef();
		
		var panDip = 0.01;
		var leftPanFixtureLDef = this.leftPanFixtureLDef = new b2FixtureDef;
		leftPanFixtureLDef.density = 500;
		leftPanFixtureLDef.restitution = 0.0;
		leftPanFixtureLDef.friction = 1.0;
		leftPanFixtureLDef.filter.categoryBits = 2;
		leftPanFixtureLDef.filter.maskBits = 7;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(-this.pan_width_units / 2, 0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(0, panDip); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(0, panDip+this.pan_height_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(-this.pan_width_units / 2, this.pan_height_units); vecs[3] = vec;
		leftPanFixtureLDef.shape = new b2PolygonShape;
		leftPanFixtureLDef.shape.SetAsArray(vecs, vecs.length);

		var leftPanFixtureRDef = this.leftPanFixtureRDef = new b2FixtureDef;
		leftPanFixtureRDef.density = 500;
		leftPanFixtureRDef.restitution = 0.0;
		leftPanFixtureRDef.friction = 1.0;
		leftPanFixtureRDef.filter.categoryBits = 2;
		leftPanFixtureRDef.filter.maskBits = 7;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(0, panDip); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(this.pan_width_units / 2, 0); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(this.pan_width_units / 2, this.pan_height_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(0, panDip+this.pan_height_units); vecs[3] = vec;
		leftPanFixtureRDef.shape = new b2PolygonShape;
		leftPanFixtureRDef.shape.SetAsArray(vecs, vecs.length);

		
		var leftPanBodyDef = this.leftPanBodyDef = new b2BodyDef;
		leftPanBodyDef.type = b2Body.b2_dynamicody;
		
		var leftPanJointDef = this.leftPanJointDef = new b2RevoluteJointDef();
		leftPanJointDef.collideConnected = true;
		leftPanJointDef.enableLimit = true;
		leftPanJointDef.lowerAngle = -Math.PI/4;
		leftPanJointDef.upperAngle = Math.PI/4;
		
		var rightPanFixtureLDef = this.rightPanFixtureLDef = new b2FixtureDef;
		rightPanFixtureLDef.density = 500;
		rightPanFixtureLDef.restitution = 0.0;
		rightPanFixtureLDef.friction = 1.0;
		rightPanFixtureLDef.filter.categoryBits = 2;
		rightPanFixtureLDef.filter.maskBits = 7;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(-this.pan_width_units / 2, 0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(0, panDip); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(0, panDip+this.pan_height_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(-this.pan_width_units / 2, this.pan_height_units); vecs[3] = vec;
		rightPanFixtureLDef.shape = new b2PolygonShape;
		rightPanFixtureLDef.shape.SetAsArray(vecs, vecs.length);

		var rightPanFixtureRDef = this.rightPanFixtureRDef = new b2FixtureDef;
		rightPanFixtureRDef.density = 500;
		rightPanFixtureRDef.restitution = 0.0;
		rightPanFixtureRDef.friction = 1.0;
		rightPanFixtureRDef.filter.categoryBits = 2;
		rightPanFixtureRDef.filter.maskBits = 7;
		vecs = new Array();
		vec = new b2Vec2(); vec.Set(0, panDip); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(this.pan_width_units / 2, 0); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(this.pan_width_units / 2, this.pan_height_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(0, panDip+this.pan_height_units); vecs[3] = vec;
		rightPanFixtureRDef.shape = new b2PolygonShape;
		rightPanFixtureRDef.shape.SetAsArray(vecs, vecs.length);


		var rightPanBodyDef = this.rightPanBodyDef = new b2BodyDef;
		rightPanBodyDef.type = b2Body.b2_dynamicody;
				
		var rightPanJointDef = this.rightPanJointDef = new b2RevoluteJointDef();
		rightPanJointDef.collideConnected = true;
		rightPanJointDef.enableLimit = true;
		rightPanJointDef.lowerAngle = -Math.PI/4;
		rightPanJointDef.upperAngle = Math.PI/4;
		
		// contact listener
		//var contactListener = new b2ContactListener;
		//contactListener.BeginContact = this.BeginContact.bind(this);
		//this.b2world.SetContactListener(contactListener);
		
	}

	p.setupInWorld = function (position_x, position_y, b2world){
		this.b2world = b2world;
		this.controlledByBuoyancy = false;

		// first destroy any current body on actor
		if (typeof this.base !== "undefined" && this.base != null) b2world.DestroyBody(this.base);
		
		var baseBodyDef = this.baseBodyDef;
		baseBodyDef.position.x = position_x;
		baseBodyDef.position.y = position_y - this.stem_height_units;
		var base = this.base = this.b2world.CreateBody(baseBodyDef);
		this.baseFixture = base.CreateFixture(this.baseFixtureDef);
		// triangle of stem
		base.volume = 0.5 * (this.stem_height_units-this.base_height_units) * this.stem_width_units * this.stem_width_units;
		// trapezoid at top of base
		base.volume += 0.5 * (this.stem_width_units + this.base_width_units) * (this.base_height_units - this.base_height_edge_units) * this.base_width_units;
		// rectangle underneath
		base.volume += this.base_width_units * this.base_height_edge_units * this.base_width_units;
		base.percentSubmerged = 0;
		base.SetFixedRotation(true);
		this.baseFixture.materialSpaces = base.volume;
		this.baseFixture.protectedSpaces = 0;
		this.baseFixture.interiorSpaces = 0;
		this.baseFixture.area = 0.5 * (this.stem_height_units-this.base_height_units) * this.stem_width_units;
		this.baseFixture.area += 0.5 * (this.stem_width_units + this.base_width_units) * (this.base_height_units - this.base_height_edge_units);
		this.baseFixture.area += this.base_width_units * this.base_height_edge_units;

		var beamBodyDef = this.beamBodyDef;
		beamBodyDef.position.x = position_x;
		beamBodyDef.position.y = position_y - this.stem_height_units;
		beamBodyDef.enableLimit = true;
		beamBodyDef.upperLimit = this.MAX_TILT_ANGLE;
		beamBodyDef.lowerLimit = -this.MAX_TILT_ANGLE;
		var beam = this.beam = this.b2world.CreateBody(beamBodyDef);
		beam.SetAngularDamping(0.4);
		this.leftBeamFixture = beam.CreateFixture(this.leftBeamFixtureDef);
		this.rightBeamFixture = beam.CreateFixture(this.rightBeamFixtureDef);
		beam.volume = 2 * ((this.beam_length_x_units * this.beam_height_units - this.beam_length_x_units * this.beam_height_edge_units) * this.beam_height_units );
		beam.percentSubmerged = 0;
		this.leftBeamFixture.materialSpaces = beam.volume/2;
		this.leftBeamFixture.protectedSpaces = 0;
		this.leftBeamFixture.interiorSpaces = 0;
		this.leftBeamFixture.area = this.beam_length_x_units * this.beam_height_units - this.beam_length_x_units * this.beam_height_edge_units;
		this.rightBeamFixture.materialSpaces = beam.volume/2;
		this.rightBeamFixture.protectedSpaces = 0;
		this.rightBeamFixture.interiorSpaces = 0;
		this.rightBeamFixture.area = this.beam_length_x_units * this.beam_height_units - this.beam_length_x_units * this.beam_height_edge_units;
	
		var beamJointDef = this.beamJointDef;	
		beamJointDef.Initialize(base, beam, new b2Vec2(position_x, position_y - this.stem_height_units));
		this.beamJoint = this.b2world.CreateJoint (beamJointDef);
		this.beamJoint.SetLimits(-Math.PI/4, Math.PI/4);
		
		var leftPanBodyDef = this.leftPanBodyDef;
		leftPanBodyDef.position.x = position_x - this.beam_length_x_units;
		leftPanBodyDef.position.y = position_y - this.stem_height_units + this.beam_length_y_units + this.pan_dy_units;
		leftPanBodyDef.userData = {"type":"leftPan", "contact":null}
		var leftPan = this.leftPan = this.b2world.CreateBody(leftPanBodyDef);
		this.leftPanFixtureL = leftPan.CreateFixture(this.leftPanFixtureLDef);
		this.leftPanFixtureR = leftPan.CreateFixture(this.leftPanFixtureRDef);
		leftPan.SetFixedRotation(true);
		this.leftPanFixtureL.area = this.pan_height_units * this.pan_width_units/2;
		this.leftPanFixtureL.materialSpaces = this.leftPanFixtureL.area * this.pan_width_units; this.leftPanFixtureL.protectedSpaces = 0; this.leftPanFixtureL.interiorSpaces = 0;
		this.leftPanFixtureR.area = this.pan_height_units * this.pan_width_units/2;
		this.leftPanFixtureR.materialSpaces = this.leftPanFixtureR.area * this.pan_width_units; this.leftPanFixtureR.protectedSpaces = 0; this.leftPanFixtureR.interiorSpaces = 0;
		leftPan.volume = this.leftPanFixtureL.materialSpaces + this.leftPanFixtureR.materialSpaces;
		leftPan.percentSubmerged = 0;
		this.leftPanJointDef.Initialize(beam, leftPan, new b2Vec2(position_x - this.beam_length_x_units, position_y - this.stem_height_units + this.beam_length_y_units));
		this.leftPanJoint = this.b2world.CreateJoint (this.leftPanJointDef);
		
		var rightPanBodyDef = this.rightPanBodyDef;
		rightPanBodyDef.position.x = position_x + this.beam_length_x_units;
		rightPanBodyDef.position.y = position_y - this.stem_height_units + this.beam_length_y_units + this.pan_dy_units;
		rightPanBodyDef.userData = {"type":"rightPan", "contact":null}
		var rightPan = this.rightPan = this.b2world.CreateBody(rightPanBodyDef);
		this.rightPanFixtureL = rightPan.CreateFixture(this.rightPanFixtureLDef);
		this.rightPanFixtureR = rightPan.CreateFixture(this.rightPanFixtureRDef);
		rightPan.SetFixedRotation(true);
		this.rightPanFixtureL.area = this.pan_height_units * this.pan_width_units/2;
		this.rightPanFixtureL.materialSpaces = this.rightPanFixtureL.area * this.pan_width_units; this.rightPanFixtureL.protectedSpaces = 0; this.rightPanFixtureL.interiorSpaces = 0;
		this.rightPanFixtureR.area = this.pan_height_units * this.pan_width_units/2;
		this.rightPanFixtureR.materialSpaces = this.rightPanFixtureR.area * this.pan_width_units; this.rightPanFixtureR.protectedSpaces = 0; this.rightPanFixtureR.interiorSpaces = 0;
		rightPan.volume = this.rightPanFixtureL.materialSpaces + this.rightPanFixtureR.materialSpaces;
		rightPan.percentSubmerged = 0;
		this.rightPanJointDef.Initialize(beam, rightPan, new b2Vec2(position_x + this.beam_length_x_units, position_y - this.stem_height_units + this.beam_length_y_units));
		this.rightPanJoint = this.b2world.CreateJoint (this.rightPanJointDef);
		
		this.beamAngle = 0;

		this.x = (this.base.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x;
		this.y = (this.height_units + this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
		
		this.leftContactedBodies = [this.leftPan];	
		this.massOnLeftPan = 0;

		this.rightContactedBodies = [this.rightPan];	
		this.massOnRightPan = 0;

		/*	
		g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);	
		g.beginFill("rgba(250,0,0,1.0)");
		g.drawCircle(0, 5, 5);
		g.endFill();
		this.addChild(this.shape);
		*/
	}

	/** Remove the bodies of this scale */
	p.removeFromWorld = function (){
		this.b2world.DestroyBody(this.base);
		this.b2world.DestroyBody(this.beam);
		this.b2world.DestroyBody(this.leftPan);
		this.b2world.DestroyBody(this.rightPan);
		this.b2world.DestroyJoint(this.leftPanJoint);
		this.b2world.DestroyJoint(this.rightPanJoint);
		this.b2world.DestroyJoint(this.beamJoint);
		this.leftPan = null;
		this.rightPan = null;
		this.base = null;
		this.beam = null;
		this.leftPanJoint = null;
		this.rightPanJoint = null;
		this.beamJoint = null;
		this.world = null;
		//this.skin.redraw();
		this.leftContactedBodies = [];	
		this.massOnLeftPan = 0;
		this.rightContactedBodies = [];	
		this.massOnRightPan = 0;
		this.parent.removeChild(this);
	}	

	p.BeginContact = function (bodyA, bodyB){
		this.PanBeginContact("left", bodyA, bodyB);
		this.PanBeginContact("right", bodyA, bodyB);
	}
	p.EndContact = function (bodyA, bodyB){
		this.PanEndContact("left", bodyA, bodyB);
		this.PanEndContact("right", bodyA, bodyB);
	}

	p.PanBeginContact = function (leftOrRight, bodyA, bodyB){
		// is one body directly touching the pan?
		var pan;
		var contactedBodies;
		var massOnPan;
		var contactLinkToPan;
		if (leftOrRight == "left"){
			pan = this.leftPan;
			contactedBodies = this.leftContactedBodies;
			massOnPan = this.massOnLeftPan;
			contactLinkToPan = "contactLinkToLeftPan";
		} else {
			pan = this.rightPan;
			contactedBodies = this.rightContactedBodies;
			massOnPan = this.massOnRightPan;
			contactLinkToPan = "contactLinkToRightPan";
		}

		if ((bodyA == pan) || (bodyB == pan)){
			var obody = bodyA == pan ? bodyB : bodyA;
			if (contactedBodies.indexOf(obody) == -1 && obody.GetUserData() != null && typeof obody.GetUserData().actor !== "undefined"){
				contactedBodies.push(obody);
				massOnPan += obody.GetMass();
				obody[contactLinkToPan] = pan;
				//console.log(obody);
				this.justAddedBody = obody;
				just_added = true;
			}
		} else {
			// are either body touching a body that is in the contact list?
			for (var i = 0; i < contactedBodies.length; i++){
				if (contactedBodies[i] == bodyA){
					if (contactedBodies.indexOf(bodyB) == -1 && bodyB.GetUserData() != null && typeof bodyB.GetUserData().actor !== "undefined"){
						contactedBodies.push(bodyB);
						massOnPan += bodyB.GetMass();
						bodyB[contactLinkToPan] = bodyA;
						this.justAddedBody = bodyB;
						just_added = true;
					}
					break;
				} else if (contactedBodies[i] == bodyB){
					if (contactedBodies.indexOf(bodyA) == -1 && bodyA.GetUserData() != null && typeof bodyA.GetUserData().actor !== "undefined"){
						contactedBodies.push(bodyA);
						massOnPan += bodyA.GetMass();
						bodyA[contactLinkToPan] = bodyB;
						this.justAddedBody = bodyA;
						just_added = true;
					} 
					break;
				}
			}
		}
		// mass doesn't change by reference
		if (leftOrRight == "left"){this.massOnLeftPan = massOnPan;}
		else {this.massOnRightPan = massOnPan;}

		if (just_added){
			this.justAddedBody.bobbing = true;
			this.justAddedBody.stationaryCount = 0;
			this.justAddedBody.prevPosition = new b2Vec2(-10000, -10000);
			eventManager.fire('add-to-balance',[this.justAddedBody.GetUserData()['actor'].skin.savedObject], box2dModel);
		}
	}
	p.PanEndContact = function (leftOrRight, bodyA, bodyB){
		var pan;
		var contactedBodies;
		var massOnPan;
		var contactLinkToPan;
		if (leftOrRight == "left"){
			pan = this.leftPan;
			contactedBodies = this.leftContactedBodies;
			massOnPan = this.massOnLeftPan;
			contactLinkToPan = "contactLinkToLeftPan";
		} else {
			pan = this.rightPan;
			contactedBodies = this.rightContactedBodies;
			massOnPan = this.massOnRightPan;
			contactLinkToPan = "contactLinkToRightPan";
		}
		// was one body directly touching the pan?
		if (bodyA == pan || bodyB == pan){
			var obody = bodyA == pan ? bodyB : bodyA;
			var index = contactedBodies.indexOf(obody); 
			if (index != -1){
				contactedBodies.splice(index, 1);
				massOnPan -= obody.GetMass();
				obody[contactLinkToPan] = null;
				if (obody == this.justAddedBody) this.justAddedBody = null;
				eventManager.fire('remove-from-balance',[obody.GetUserData()['actor'].skin.savedObject], box2dModel);
			}
		} else {
			// if both are on contact list then remove one
			var indexA = contactedBodies.indexOf(bodyA); 
			var indexB = contactedBodies.indexOf(bodyB); 
			if (indexA > -1 && indexB > -1){
				if (bodyA[contactLinkToPan] == bodyB){
					contactedBodies.splice(indexA, 1);
					massOnPan -= bodyA.GetMass();
					bodyA[contactLinkToPan] = null;
					if (bodyA == this.justAddedBody) this.justAddedBody = null;
					eventManager.fire('remove-from-balance',[bodyA.GetUserData()['actor'].skin.savedObject], box2dModel);
				} else if (bodyB[contactLinkToPan] == bodyA){
					contactedBodies.splice(indexB, 1);
					massOnPan -= bodyB.GetMass();
					bodyB[contactLinkToPan] = null;
					if (bodyB == this.justAddedBody) this.justAddedBody = null;
					eventManager.fire('remove-from-balance',[bodyB.GetUserData()['actor'].skin.savedObject], box2dModel);
				}				
			}
		}
		// mass doesn't change by reference
		if (leftOrRight == "left"){this.massOnLeftPan = massOnPan;}
		else {this.massOnRightPan = massOnPan;}
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
	
	p.update = function (){
		if (this.base != null){
			var leftPanPoint, rightPanPoint;
			if (this.parent.parent == null){
				this.x = (this.base.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x;
				this.y = (this.stem_height_units + this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
				//this.y = (this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
				//console.log(this.y)
				leftPanPoint = new b2Vec2(this.leftPan.GetPosition().x * GLOBAL_PARAMETERS.SCALE - this.x -  this.parent.x, this.leftPan.GetPosition().y * GLOBAL_PARAMETERS.SCALE - this.y - this.parent.y)
				rightPanPoint = new b2Vec2(this.rightPan.GetPosition().x * GLOBAL_PARAMETERS.SCALE - this.x - this.parent.x, this.rightPan.GetPosition().y * GLOBAL_PARAMETERS.SCALE - this.y - this.parent.y)	
			} else {
				this.x = (this.base.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x - this.parent.parent.x;
				this.y = (this.stem_height_units + this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y - this.parent.parent.y;
				//this.y = (this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y - this.parent.parent.y;
				//console.log(this.y)
				leftPanPoint = new b2Vec2(this.leftPan.GetPosition().x * GLOBAL_PARAMETERS.SCALE - this.x - this.parent.x - this.parent.parent.x, this.leftPan.GetPosition().y * GLOBAL_PARAMETERS.SCALE - this.y - this.parent.y - this.parent.parent.y)
				rightPanPoint = new b2Vec2(this.rightPan.GetPosition().x * GLOBAL_PARAMETERS.SCALE - this.x - this.parent.x - this.parent.parent.x, this.rightPan.GetPosition().y * GLOBAL_PARAMETERS.SCALE - this.y - this.parent.y - this.parent.parent.y)
			}
			if (this.beamAngle != this.beam.GetAngle()){
				//console.log(lrF, rrF, rrF-lrF, lrF-rrF, rrF - lrF > 0.01, lrF - rrF > 0.01);
				this.beamAngle = this.beam.GetAngle(); 
				if (true){
					//console.log(this.massOnLeftPan, this.massOnRightPan);
					if (this.massOnRightPan - this.massOnLeftPan > 0.3){
						this.skin.redraw(this.beamAngle, leftPanPoint, rightPanPoint,"#CC9999", "#99CC99");
					} else if (this.massOnLeftPan - this.massOnRightPan > 0.3){
						this.skin.redraw(this.beamAngle, leftPanPoint, rightPanPoint, "#99CC99","#CC9999");
					} else {
						this.skin.redraw(this.beamAngle, leftPanPoint, rightPanPoint,  "#CCCCCC",  "#CCCCCC");
					}
				} else {
					var lrF = -1*this.leftPanJoint.GetReactionForce(createjs.Ticker.getFPS()).y;
					var rrF = -1*this.rightPanJoint.GetReactionForce(createjs.Ticker.getFPS()).y;
					if (rrF - lrF > 0.1){
						this.skin.redraw(this.beamAngle, leftPanPoint, rightPanPoint,"#CC9999", "#99CC99");
					} else if (lrF - rrF > 0.1){
						this.skin.redraw(this.beamAngle, leftPanPoint, rightPanPoint, "#99CC99","#CC9999");
					} else {
						this.skin.redraw(this.beamAngle, leftPanPoint, rightPanPoint,  "#CCCCCC",  "#CCCCCC");
					}
				}
			}
			// is there a just added body which is bobbing?
			if (this.justAddedBody != null && this.justAddedBody.bobbing){
				// is it stationary-ish
				//console.log("from (", this.justAddedBody.prevPosition.x,",",this.justAddedBody.prevPosition.y,") to (",this.justAddedBody.GetPosition().x,",",this.justAddedBody.GetPosition().y,"");
				if (Math.abs(this.justAddedBody.prevPosition.x - this.justAddedBody.GetPosition().x) < 0.01 &&
					Math.abs(this.justAddedBody.prevPosition.y - this.justAddedBody.GetPosition().y) < 0.01){
					this.justAddedBody.stationaryCount++;
					if (this.justAddedBody.stationaryCount > 5){
						eventManager.fire('test-on-balance',[this.justAddedBody.GetUserData()['actor'].skin.savedObject, this.savedObject], box2dModel);
						this.justAddedBody.bobbing = false;	
					}			
				}
				this.justAddedBody.prevPosition = new b2Vec2(this.justAddedBody.GetPosition().x, this.justAddedBody.GetPosition().y);	
			}
		}
	}

	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	window.Balanceb2Actor = Balanceb2Actor;
}(window));

(function (window)
{
	/** This actor in the world creates its own skin based upon dimensions */


	function Scaleb2Actor (pan_width_units, pan_height_units)
	{
		this.initialize (pan_width_units, pan_height_units);
	}

	var p = Scaleb2Actor.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function (pan_width_units, pan_height_units)
	{
		this.Container_initialize();
		this.pan_width_units = pan_width_units;
		this.pan_height_units = pan_height_units;
		this.pan_dy_units = pan_width_units / 2;
		this.base_width_units = pan_width_units * 3/4;
		this.base_width_top_units = pan_width_units * 1/2;
		this.base_height_units = this.base_width_units / 2;
		this.savedObject = {};
		this.savedObject.id = "sc"+GLOBAL_PARAMETERS.total_scales_made++;
		
		this.savedObject.pan_width_units = pan_width_units;
		
		this.skin = new ScaleShape(this.pan_width_units * GLOBAL_PARAMETERS.SCALE, this.pan_height_units * GLOBAL_PARAMETERS.SCALE, this.pan_dy_units * GLOBAL_PARAMETERS.SCALE, this.base_width_units * GLOBAL_PARAMETERS.SCALE, this.base_width_top_units * GLOBAL_PARAMETERS.SCALE, this.base_height_units * GLOBAL_PARAMETERS.SCALE, this.savedObject);
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
		
		this.tareFlagForUpdate = false; // when set to true next update will set tare value
		this.tareValue = 0;
		// set up tare button
		var tareButtonName = "tare-button-" + this.id;
		$('#scale-button-holder').append('<input type="submit" id="'+tareButtonName+'" value="Set to 0" style="font-size:14px; position:absolute"/>');
		var htmlElement = $('#' + tareButtonName).button().bind('click', {parent: this}, this.tare);
		this.tareElement = new createjs.DOMElement(htmlElement[0]);
		this.addChild(this.tareElement);
			
		this.tareElement.x = -this.base_width_top_units/2 * GLOBAL_PARAMETERS.SCALE-5;
		this.tareElement.y = -this.base_height_units * GLOBAL_PARAMETERS.SCALE-4;


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
		var vecs, vec;

		var baseFixtureDef = this.baseFixtureDef = new b2FixtureDef;
		baseFixtureDef.density = 600;
		baseFixtureDef.restitution = 0.2;
		baseFixtureDef.friction = 1.0;
		baseFixtureDef.filter.categoryBits = 2;
		baseFixtureDef.filter.maskBits = 7;
		vecs = [];
		vec = new b2Vec2(); vec.Set(this.base_width_top_units/2 , 0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(this.base_width_units/2 , this.base_height_units); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(-this.base_width_units/2 , this.base_height_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(-this.base_width_top_units/2 , 0); vecs[3] = vec;
		baseFixtureDef.shape = new b2PolygonShape;
		baseFixtureDef.shape.SetAsArray(vecs, vecs.length);
		var baseBodyDef = this.baseBodyDef = new b2BodyDef;
		baseBodyDef.type = b2Body.b2_dynamicBody;
		
		var panFixtureDef = this.panFixtureDef = new b2FixtureDef;
		panFixtureDef.density = 600;
		panFixtureDef.restitution = 0.0;
		panFixtureDef.linearDamping = 1.0;
		panFixtureDef.friction = 5.0;
		panFixtureDef.filter.categoryBits = 2;
		panFixtureDef.filter.maskBits = 7;
		vecs = [];
		vec = new b2Vec2(); vec.Set(-this.pan_width_units / 2 , 0); vecs[0] = vec;
		vec = new b2Vec2(); vec.Set(this.pan_width_units / 2 , 0); vecs[1] = vec;
		vec = new b2Vec2(); vec.Set(this.pan_width_units / 2 , this.pan_height_units); vecs[2] = vec;
		vec = new b2Vec2(); vec.Set(-this.pan_width_units / 2 , this.pan_height_units); vecs[3] = vec;
		panFixtureDef.shape = new b2PolygonShape;
		panFixtureDef.shape.SetAsArray(vecs, vecs.length);
		var panBodyDef = this.panBodyDef = new b2BodyDef;
		panBodyDef.type = b2Body.b2_dynamicBody;

		var panPrismJointDef = this.panPrismJointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
		var panDistJointDef = this.panDistJointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef();		
	}

	p.setupInWorld = function (position_x, position_y, b2world){
		this.b2world = b2world;
		this.controlledByBuoyancy = false;

		// first destroy any current body on actor
		if (typeof this.base !== "undefined" && this.base != null){b2world.DestroyBody(this.base); b2world.DestroyBody(this.pan); }
		
		var baseBodyDef = this.baseBodyDef;
		var baseFixtureDef = this.baseFixtureDef;
		baseBodyDef.position.x = position_x;
		baseBodyDef.position.y = position_y - this.base_height_units;
		var base = this.base = this.b2world.CreateBody(baseBodyDef);
		this.baseFixture = base.CreateFixture(baseFixtureDef);
		base.volume = (this.base_width_units + this.base_width_top_units) / 2 * this.base_height_units * this.base_width_units;
		this.baseFixture.materialSpaces = base.volume;
		this.baseFixture.protectedSpaces = 0;
		this.baseFixture.interiorSpaces = 0;
		this.baseFixture.area = (this.base_width_units + this.base_width_top_units) / 2 * this.base_height_units;

		var panBodyDef = this.panBodyDef;
		var panFixtureDef = this.panFixtureDef;
		panBodyDef.position.x = position_x;
		panBodyDef.position.y = position_y - this.base_height_units - this.pan_dy_units;
		var pan = this.pan = this.b2world.CreateBody(panBodyDef);
		this.panFixture = pan.CreateFixture(panFixtureDef);
		pan.SetFixedRotation(true);
		pan.volume = Math.pow(this.pan_width_units, 2) * this.pan_height_units;
		this.panFixture.materialSpaces = pan.volume;
		this.panFixture.protectedSpaces = 0;
		this.panFixture.interiorSpaces = 0;
		this.panFixture.area = this.pan_width_units * this.pan_height_units;
		this.pan.ResetMassData();

		var panPrismJointDef = this.panPrismJointDef;
		var vec = new b2Vec2(); vec.Set(0, 1);
		panPrismJointDef.Initialize(base, pan, base.GetPosition(), vec);
		//panPrismJointDef.localAnchorA = new b2Vec2(-this.base_width_top_units/2, 0);
		//panPrismJointDef.localAnchorB = new b2Vec2(-this.base_width_top_units/2, 0);
		panPrismJointDef.referenceAngle = 0;
		panPrismJointDef.collideConnected = true;
		this.panPrismJoint = this.b2world.CreateJoint (panPrismJointDef);
		
		var panDistJointDef = this.panDistJointDef;
		panDistJointDef.Initialize(pan, base, pan.GetPosition(), base.GetPosition());
		//panDistJointDef.localAnchorA = new b2Vec2(-this.base_width_top_units/2, 0);
		//panDistJointDef.localAnchorB = new b2Vec2(-this.base_width_top_units/2, 0);
		panDistJointDef.dampingRatio = 0.008;
		panDistJointDef.frequencyHz = 1.0;
		this.panDistJoint = this.b2world.CreateJoint (panDistJointDef);

		// put aabb, i.e. upper and lower limit onto the body and area
		//body.local_width_right = mainbeaker.width_px_right / GLOBAL_PARAMETERS.SCALE;
		//body.local_height_below = mainbeaker.height_px_below / GLOBAL_PARAMETERS.SCALE;
		
		this.x = (this.base.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x;
		this.y = (this.base_height_units + this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
		
		var pan_y = (this.pan.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
		this.prev_pan_y = pan_y;
		this.prev_rF = 0;
		//this.faceShape.onClick = this.haltBeam.bind(this);
		
		this.contactedBodies = [this.pan];	
		this.massOnPan = 0;

		this.savedObject.mass = this.base.GetMass() + this.pan.GetMass();

		this.skin.redraw(pan_y - this.y, this.panPrismJoint.GetMotorForce());

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
		this.b2world.DestroyBody(this.pan);
		this.b2world.DestroyBody(this.base);
		this.b2world.DestroyJoint(this.panPrismJoint);
		this.b2world.DestroyJoint(this.panDistJoint);
		this.pan = null;
		this.base = null;
		this.panPrismJoint = null;
		this.panDistJoint = null;
		this.world = null;
		//this.skin.redraw();
		this.parent.removeChild(this);
		this.contactedBodies = [];
		this.massOnPan = 0;
	}	

	p.BeginContact = function (bodyA, bodyB){
		// is one body directly touching the pan?
		var just_added = false;
		if ((bodyA == this.pan) || (bodyB == this.pan)){
			var obody = bodyA == this.pan ? bodyB : bodyA;
			if (this.contactedBodies.indexOf(obody) == -1 && obody.GetUserData() != null && typeof obody.GetUserData().actor !== "undefined"){
				this.contactedBodies.push(obody);
				this.massOnPan += obody.GetMass();
				obody.contactLinkToScalePan = this.pan;
				//console.log(obody)
				this.justAddedBody = obody;
				just_added = true;
			}
		} else {
			// are either body touching a body that is in the contact list?
			for (var i = 0; i < this.contactedBodies.length; i++){
				if (this.contactedBodies[i] == bodyA){
					if (this.contactedBodies.indexOf(bodyB) == -1 && bodyB.GetUserData() != null && typeof bodyB.GetUserData().actor !== "undefined"){
						this.contactedBodies.push(bodyB);
						this.massOnPan += bodyB.GetMass();
						bodyB.contactLinkToScalePan = bodyA;
						this.justAddedBody = bodyB;
						just_added = true	
					}
					break;
				} else if (this.contactedBodies[i] == bodyB){
					if (this.contactedBodies.indexOf(bodyA) == -1 && bodyA.GetUserData() != null && typeof bodyA.GetUserData().actor !== "undefined"){
						this.contactedBodies.push(bodyA);
						this.massOnPan += bodyA.GetMass();
						bodyA.contactLinkToScalePan = bodyB;
						this.justAddedBody = bodyA;
						just_added = true;
					} 
					break;
				}
			}
		}
		//console.log("Begin - distance", this.justAddedBody != null ? this.pan.GetPosition().y - this.justAddedBody.GetPosition().y:"");
		
		if (just_added){
			this.justAddedBody.bobbing = true;
			this.justAddedBody.stationaryCount = 0;
			this.justAddedBody.prevPosition = new b2Vec2(-10000, -10000);
			eventManager.fire('add-to-scale',[this.justAddedBody.GetUserData()['actor'].skin.savedObject], box2dModel);
		}
	}
	p.EndContact = function (bodyA, bodyB){
		//console.log("End", this.justAddedBody != null ? this.pan.GetPosition().y - this.justAddedBody.GetPosition().y:"");
		// was one body directly touching the pan?
		if (bodyA == this.pan || bodyB == this.pan){
			var obody = bodyA == this.pan ? bodyB : bodyA;
			var index = this.contactedBodies.indexOf(obody); 
			if (index != -1){
				this.contactedBodies.splice(index, 1);
				this.massOnPan -= obody.GetMass();
				obody.contactLinkToScalePan = null;
				//if (obody == this.justAddedBody) this.justAddedBody = null;
				eventManager.fire('remove-from-scale',[obody.GetUserData()['actor'].skin.savedObject], box2dModel);
			}
		} else {
			// if both are on contact list then remove one
			var indexA = this.contactedBodies.indexOf(bodyA); 
			var indexB = this.contactedBodies.indexOf(bodyB); 
			if (indexA > -1 && indexB > -1){
				if (bodyA.contactLinkToScalePan == bodyB){
					this.contactedBodies.splice(indexA, 1);
					this.massOnPan -= bodyA.GetMass();
					bodyA.contactLinkToScalePan = null;
					//if (bodyA == this.justAddedBody) this.justAddedBody = null;
					eventManager.fire('remove-from-scale',[bodyA.GetUserData()['actor'].skin.savedObject], box2dModel);
				} else if (bodyB.contactLinkToScalePan == bodyA){
					this.contactedBodies.splice(indexB, 1);
					this.massOnPan -= bodyB.GetMass();
					bodyB.contactLinkToScalePan = null;
					//if (bodyB == this.justAddedBody) this.justAddedBody = null;
					eventManager.fire('remove-from-scale',[bodyB.GetUserData()['actor'].skin.savedObject], box2dModel);
				}				
			}
		}
	}
	
	/** When user presses the tare button (marked "Reset"), the currently displayed force down 
	*	will be subtracted (during update)
	*   from all future displays.
	*/
	p.tare = function (evt){
		evt.data.parent.tareValue = 0;
		evt.data.parent.tareFlagForUpdate = true;
	}

	p.update = function (){
		if (this.base != null){
			var pan_y;
			if (this.parent.parent == null){
				this.x = (this.base.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x;
				this.y = (this.base_height_units + this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
				pan_y = (this.pan.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y;
			} else {
				this.x = (this.base.GetPosition().x) * GLOBAL_PARAMETERS.SCALE - this.parent.x - this.parent.parent.x;
				this.y = (this.base_height_units + this.base.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y - this.parent.parent.y;
				pan_y = (this.pan.GetPosition().y) * GLOBAL_PARAMETERS.SCALE - this.parent.y - this.parent.parent.y;
			}
			// make sure pan is centered
			var panp = this.pan.GetPosition();
			panp.x = this.base.GetPosition().x;
			this.pan.SetPosition(panp);

			//console.log(this.panDistJoint.GetReactionForce(1/createjs.Ticker.getFPS()).y);
			var rF = this.panDistJoint.GetReactionForce(createjs.Ticker.getFPS()).y;
			var displayrF;
			// acount for liqiud if necessary
			if (false){
				displayrF = this.massOnPan;
			} else {
				//console.log(rF, this.pan.GetMass(),this.pan.GetMass()/1000*10);
					//displayrF = rF/1000;
					//if (typeof this.controlledByBuoyancy !== "undefined" && this.controlledByBuoyancy && this.containedWithin != null){
					//	displayrF = (rF - this.pan.GetMass()*10 + this.pan.volume*this.containedWithin.liquid.density*10)/100;
					//} else {
				if (GLOBAL_PARAMETERS.SCALE_UNITS.toLowerCase().match("lb|lbs|p|Lb") != null){
					displayrF = (rF - this.pan.GetMass())/0.2248;	
				} else if (GLOBAL_PARAMETERS.SCALE_UNITS.toLowerCase().match("k") != null){
					displayrF = (rF - this.pan.GetMass()*10);	
				} else if (GLOBAL_PARAMETERS.SCALE_UNITS.toLowerCase().match("g|c") != null){
					displayrF = (rF - this.pan.GetMass()*10)/1000;
				} 
				//}
			}
			
			//displayrF = (rF - this.pan.GetMass()*10)/1000;
			var displayVal = displayrF;
			if (GLOBAL_PARAMETERS.SCALE_UNITS.toLowerCase().match("lb|lbs|p|Lb") != null){
				displayVal = displayrF*0.2248;	
			} else if (GLOBAL_PARAMETERS.SCALE_UNITS.toLowerCase().match("k") != null){
				displayVal = displayrF/10;	
			} else if (GLOBAL_PARAMETERS.SCALE_UNITS.toLowerCase().match("g|c") != null){
				displayVal = displayrF/10*1000;	
			} 
			// if we are taring, set value here
			if (this.tareFlagForUpdate){
				this.tareValue = displayVal;
			}
			displayVal -= this.tareValue;

			// either update display or fire event
			if (this.prev_rF != rF || this.tareFlagForUpdate){
				this.skin.redraw(pan_y - this.y, displayVal);
				this.prev_rF = rF;
				this.tareFlagForUpdate = false;
			} else {
				// is there a just added body which is bobbing?
				if (this.justAddedBody != null && this.justAddedBody.bobbing){
					// is it stationary-ish
					//console.log("from (", this.justAddedBody.prevPosition.x,",",this.justAddedBody.prevPosition.y,") to (",this.justAddedBody.GetPosition().x,",",this.justAddedBody.GetPosition().y,"");
					if (Math.abs(this.justAddedBody.prevPosition.x - this.justAddedBody.GetPosition().x) < 0.01 &&
						Math.abs(this.justAddedBody.prevPosition.y - this.justAddedBody.GetPosition().y) < 0.01){
						this.justAddedBody.stationaryCount++;
						if (this.justAddedBody.stationaryCount > 5){
							// add relevant information into this event

							var scaleDetails = {
								'Weight':rF,
								'Weight_displayed':displayVal,
								'Units':GLOBAL_PARAMETERS.SCALE_UNITS,
								'Mass_on_pan':this.massOnPan,
								'Mass_of_pan':this.pan.GetMass(),
								'Tare_amount':this.tareValue,
							};
							eventManager.fire('test-on-scale',[this.justAddedBody.GetUserData()['actor'].skin.savedObject, scaleDetails], box2dModel);
							this.justAddedBody.bobbing = false;	
							this.justAddedBody = null;
						}			
					}
					if (this.justAddedBody != null) this.justAddedBody.prevPosition = new b2Vec2(this.justAddedBody.GetPosition().x, this.justAddedBody.GetPosition().y);	
				}
			}
		}
	}

	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	window.Scaleb2Actor = Scaleb2Actor;
}(window));

(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depthArray: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var BeakerShape = function(relativeParent, width_px, height_px, depth_px, init_liquid_volume_perc, spilloff_volume_perc, showRuler, savedObject)
	{
		this.initialize(relativeParent, width_px, height_px, depth_px, init_liquid_volume_perc, spilloff_volume_perc, showRuler, savedObject);
	} 
	var p = BeakerShape.prototype = new createjs.Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	// parameters
	p.NUM_BACK_OBJECTS = 3;
	p.WALL_THICKNESS = 2;
	p.SPOUT_WIDTH = 50;
	p.SPOUT_HEIGHT = 50;
	p.CACHING = false;

	p.initialize = function(relativeParent, width_px, height_px, depth_px, init_liquid_volume_perc, spilloff_volume_perc, showRuler, savedObject)
	{
		this.relativeParent = relativeParent;
		this.material = this.relativeParent.material;
		this.liquid = this.relativeParent.liquid;
		this.width_px = width_px;
		this.height_px = height_px;
		this.depth_px = depth_px;
		var width_from_depth = this.width_from_depth = depth_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle);
		var height_from_depth = this.height_from_depth = depth_px * Math.sin(GLOBAL_PARAMETERS.view_topAngle);
		this.height_px_below = 0;
		this.height_px_above = height_px;
		this.width_px_left = width_px/2;
		this.width_px_right = width_px/2;

		this.spilloff_volume_perc = spilloff_volume_perc;
		this.spout_height_px = this.spilloff_volume_perc * this.height_px;
		this.volume_px = width_px * height_px * depth_px;
		this.volume_units = this.volume_px / Math.pow(GLOBAL_PARAMETERS.SCALE, 3);
		this.NUM_RULER_TICKS = Math.ceil(height_px / GLOBAL_PARAMETERS.SCALE);
		this.showRuler = showRuler;
		this.savedObject = savedObject;

		this.liquid_color = this.liquid != null ? this.liquid.fill_color : null;
		this.liquid_stroke_color = this.liquid != null ? this.liquid.stroke_color : null;

		this.backContainer = new createjs.Container();
		this.backContainer.mouseEnabled = true;
		//this.backContainer.onPress = this.backOnPress.bind(this);
		this.backContainer.beakerShape = this;
		this.frontContainer = new createjs.Container();	
		this.frontContainer.mouseEnabled = false;
		this.rulerTextContainer = new createjs.Container();
		this.backWaterGraphics = new createjs.Graphics();
		this.backWaterShape = new createjs.Shape(this.backWaterGraphics);
		this.backWaterLineGraphics = new createjs.Graphics();
		this.backWaterLineShape = new createjs.Shape(this.backWaterLineGraphics);
		this.backGraphics = new createjs.Graphics();
		this.backShape = new createjs.Shape(this.backGraphics);
		this.frontWaterGraphics = new createjs.Graphics();
		this.frontWaterShape = new createjs.Shape(this.frontWaterGraphics);
		this.frontWaterLineGraphics = new createjs.Graphics();
		this.frontWaterLineShape = new createjs.Shape(this.frontWaterLineGraphics);
		this.frontGraphics = new createjs.Graphics();
		this.frontShape = new createjs.Shape(this.frontGraphics);
		this.spoutGraphics = new createjs.Graphics();
		this.spoutShape = new createjs.Shape(this.spoutGraphics);
		if (this.showRuler){
			this.rulerGraphics = new createjs.Graphics();
			this.rulerShape = new createjs.Shape(this.rulerGraphics);
			this.pointerGraphics = new createjs.Graphics();
			this.pointerShape = new createjs.Shape(this.pointerGraphics);
			this.pointerText = new createjs.Text(Math.round(this.total_volume), "1.0em Bold Arial", "#222");
		}
		
		// add to display
		//this.addChild(this.backContainer); 
		//this.addChild(this.frontContainer); 
		this.backContainer.addChild(this.backShape);
		this.backContainer.addChild(this.backWaterShape);
		this.backContainer.addChild(this.backWaterLineShape);
		this.frontContainer.addChild(this.frontWaterShape);
		this.frontContainer.addChild(this.frontShape);
		this.frontContainer.addChild(this.spoutShape);
		if (this.showRuler){
			this.frontContainer.addChild(this.rulerTextContainer);
			this.rulerTextContainer.addChild(this.rulerShape);
			this.frontContainer.addChild(this.pointerShape);
			this.frontContainer.addChild(this.pointerText);
		}
		

		//relative position to container
		this.backShape.x = this.width_from_depth; 
		this.backShape.y = -this.height_from_depth;
		this.backWaterShape.x = this.width_from_depth; 
		this.backWaterShape.y = -this.height_from_depth;
		this.backWaterLineShape.x = this.width_from_depth; 
		this.spoutShape.x = this.width_px/2 + this.width_from_depth/2; 
		this.spoutShape.y = -this.spout_height_px - this.height_from_depth/2;	
		if (this.showRuler){
			this.rulerTextContainer.x = -this.width_px/2;	
			this.pointerShape.x = -this.width_px/2;
			this.pointerText.x = this.pointerShape.x - 63;
		}
		
		this.initDraw();

	}

	p.initDraw = function(){
		var g;

		// draw liquid line
		if (this.liquid_stroke_color != null) {
			g = this.backWaterLineGraphics;
			g.clear();
			g.beginFill(this.liquid_stroke_color);
			g.moveTo(-this.width_px / 2, 0);
			g.lineTo(this.width_px / 2, 0);
			g.lineTo(this.width_px / 2 - this.width_from_depth * 4 / 4, this.height_from_depth * 4 / 4);
			g.lineTo(-this.width_px / 2 - this.width_from_depth * 4 / 4, this.height_from_depth * 4 / 4);
			g.lineTo(-this.width_px / 2, 0)
			g.endFill();
			if (this.CACHING) this.backWaterLineShape.cache(-this.width_px / 2 - this.width_from_depth * 4 / 4, 0, this.width_px + this.width_from_depth * 4 / 4, this.height_from_depth * 4 / 4);
		}

		// initial drawing
		var g = this.backGraphics;
		g.clear();
		// back wall
		g.setStrokeStyle(this.BEAKER_WALL_THICKNESS);
		g.beginLinearGradientStroke(this.material.stroke_colors, this.material.stroke_ratios, -this.width_px/2, 0, this.width_px/2, 0);
		g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, -this.width_px/2, 0, this.width_px/2, 0);
		g.drawRect(-this.width_px/2, -this.height_px, this.width_px, this.height_px);
		g.endFill();


		// draw left side wall
		g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, -this.width_px/2-this.width_from_depth, 0, -this.width_px/2, 0);
		g.moveTo(-this.width_px/2, -this.height_px);
		g.lineTo(-this.width_px/2 - this.width_from_depth, -this.height_px+this.height_from_depth);
		g.lineTo(-this.width_px/2 - this.width_from_depth, this.height_from_depth);
		g.lineTo(-this.width_px/2, 0);
		g.lineTo(-this.width_px/2, -this.height_px);
		g.endFill();

		// draw bottom
		g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, -this.width_px/2-this.width_from_depth, 0, this.width_px/2, 0);
		g.moveTo(-this.width_px/2 - this.width_from_depth, this.height_from_depth);
		g.lineTo(this.width_px/2 - this.width_from_depth, this.height_from_depth);
		g.lineTo(this.width_px/2, 0);
		g.lineTo(-this.width_px/2, 0);
		g.lineTo(-this.width_px/2 - this.width_from_depth, this.height_from_depth);
		g.endFill();
		g.endStroke();

		if (this.CACHING) this.backShape.cache(-this.width_px/2 - this.width_from_depth, -this.height_px, this.width_px + this.width_from_depth, this.height_px + this.height_from_depth);

		// draw liquid line, actually half the top suface
		if (this.liquid_stroke_color != null) {
			g = this.frontWaterLineGraphics;
			g.clear();
			g.beginFill(this.liquid_stroke_color);
			g.moveTo(-this.width_px / 2, 0);
			g.lineTo(this.width_px / 2, 0);
			g.lineTo(this.width_px / 2 + this.width_from_depth / 4, -this.height_from_depth / 4);
			g.lineTo(-this.width_px / 2 + this.width_from_depth / 4, -this.height_from_depth / 4);
			g.lineTo(-this.width_px / 2, 0)
			g.endFill();
			if (this.CACHING) this.frontWaterLineShape.cache(-this.width_px / 2, -this.height_from_depth / 4, this.width_px + this.width_from_depth / 4, this.height_from_depth / 4);
		}

		// initial drawing
		g = this.frontGraphics;
		g.clear();
		// cylinder
		g.setStrokeStyle(this.BEAKER_WALL_THICKNESS);
		g.beginLinearGradientStroke(this.material.stroke_colors, this.material.stroke_ratios, -this.width_px/2, 0, this.width_px/2, 0);
		g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, -this.width_px/2, 0, this.width_px/2, 0);
		g.drawRect(-this.width_px/2, -this.height_px, this.width_px, this.height_px);
		g.endFill();
		// spilloff line
		if (this.spilloff_volume_perc > 0 && this.spilloff_volume_perc < 1.0){
			g.setStrokeStyle(1.0).beginStroke("rgba(250,0,0,0.5)")
				.moveTo(-this.width_px/2, -this.height_px*this.spilloff_volume_perc)
				.lineTo(this.width_px/2, -this.height_px*this.spilloff_volume_perc)
				.lineTo(this.width_px/2+ this.width_from_depth, -this.height_px*this.spilloff_volume_perc-this.height_from_depth).endStroke();
		}
		// right side wall
		g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, this.width_px/2, 0, this.width_px/2 + this.width_from_depth, 0);
		g.moveTo(this.width_px/2, -this.height_px).lineTo(this.width_px/2 + this.width_from_depth, -this.height_px-this.height_from_depth).lineTo(this.width_px/2 + this.width_from_depth, -this.height_from_depth).lineTo(this.width_px/2, 0).lineTo(this.width_px/2, -this.height_px);
		g.endFill();
		g.endStroke();
		if (this.CACHING) this.frontShape.cache(-this.width_px/2, -this.height_px-this.height_from_depth, this.width_px + this.width_from_depth, this.height_px+this.height_from_depth);

		// draw spout
		if (this.spilloff_volume_perc > 0 && this.spilloff_volume_perc < 1){
			var spoutDiameter = 15;
			var p1, p2, p3, p4, p5, p6;
			p1 = new createjs.Point(0, 0);
			p3 = new createjs.Point (this.SPOUT_WIDTH, this.SPOUT_HEIGHT);

			var spoutIncline = Math.atan((p3.y-p1.y)/(p3.x-p1.x));
			var spoutWidth = p3.x - p1.x; var spoutHeight = p3.y - p1.y;
			var spoutLength = Math.sqrt((p3.y-p1.y)*(p3.y-p1.y) + (p3.x-p1.x)*(p3.x-p1.x));
			p4 = new createjs.Point(p3.x + spoutDiameter * Math.sin(spoutIncline), p3.y - spoutDiameter * Math.cos(spoutIncline));
			p6 = new createjs.Point(0, -spoutDiameter/Math.cos(spoutIncline));

			g = this.spoutGraphics;
			g.clear();
			g.setStrokeStyle(0.5);
			g.beginStroke("rgba(100, 100, 100, 1.0)");
			g.beginLinearGradientFill(["rgba(127,127,127,1.0)", "rgba(200,200,200,1.0)","rgba(225,225,255,1.0)", "rgba(200,200,200,1.0)", "rgba(127,127,127,1.0)"], [0, 0.1, 0.5, 0.9, 1], p1.x, p1.y, p1.x + spoutDiameter*Math.sin(spoutIncline), p1.y - spoutDiameter*Math.cos(spoutIncline));
			g.moveTo(p1.x, p1.y); g.lineTo(p3.x, p3.y); g.lineTo(p4.x, p4.y); g.lineTo(p6.x, p6.y); g.curveTo(p1.x-4, (p1.y-p6.y)/2 + p6.y, p1.x, p1.y);
			g.endFill();
			g.endStroke();

			var mp = new createjs.Point ((p3.x + p4.x)/2, (p3.y + p4.y)/2);
			g.setStrokeStyle(1);
			g.beginStroke("rgba(160, 160, 160, 1.0)");
			g.beginFill("rgba(200,200, 200, 1.0)");
			g.drawEllipse(mp.x-spoutDiameter/2*Math.sin(spoutIncline)-2, mp.y-spoutDiameter/2*Math.cos(spoutIncline), spoutDiameter*Math.sin(spoutIncline), spoutDiameter*Math.cos(spoutIncline));
			g.endStroke();
			g.endFill();

			this.spout_point = new createjs.Point (this.spoutShape.x + mp.x, this.spoutShape.y + mp.y);
			this.spoutShape.cache(0, -20, 120, 70);
		}

		// draw a ruler
		if (this.showRuler){
			g = this.rulerGraphics;
			g.clear();
			g.setStrokeStyle(1);
			//g.beginLinearGradientStroke(["rgba(56,56,56,0.6)", "rgba(100,100,100,0.4)","rgba(127,127,127,0.2)", "rgba(100,100,100,0.4)", "rgba(56,56,56,0.6)"], [0, 0.1, 0.5, 0.9, 1], -this.width_px/2, 0, this.width_px/2, 0);
			g.beginStroke("rgba(50, 50, 50, 1.0)")

			for (var i=0; i <= this.NUM_RULER_TICKS; i++){
				var ry = -this.height_px*i/this.NUM_RULER_TICKS;
				var beaker_volume = this.width_px / GLOBAL_PARAMETERS.SCALE * this.height_px/ GLOBAL_PARAMETERS.SCALE * this.depth_px/ GLOBAL_PARAMETERS.SCALE;
				var vstr = Math.round(beaker_volume*i/this.NUM_RULER_TICKS);
				var text = new createjs.Text(vstr, "1.0em Bold Arial", "#4D4");
				g.moveTo(0, ry);
				g.lineTo(-10, ry);
				text.x = -43;
				text.y = ry - 10;
				this.rulerTextContainer.addChild(text);
			}

			// draw pointer to liquid line
			g = this.pointerGraphics;
			g.clear();
			g.setStrokeStyle(1);
			g.beginStroke("rgba(100, 100, 100, 1)");
			g.beginFill("rgba(255,255,255, 1.0)");
			g.moveTo(0, 0).lineTo(-8, -10).lineTo(-66, -10).lineTo(-66, 10).lineTo(-8, 10).lineTo(0, 0);
			g.endFill();
			g.endStroke();
		}
	}

	p.backOnPress = function (evt){
		evt.target.beakerShape.dispatchEvent(evt, evt.target.beakerShape);
	}

	p.redraw = function(liquid_height_px, resetPosition){
		// are we placing a new liquid inside?
		if (this.liquid == null && this.relativeParent.liquid != null) {
			this.liquid = this.relativeParent.liquid;
			this.liquid_color = this.liquid != null ? this.liquid.fill_color : null;
			this.liquid_stroke_color = this.liquid != null ? this.liquid.stroke_color : null;
			this.initDraw();
		}

		this.liquid_height_px = liquid_height_px;
		var liquid_y = -liquid_height_px;
		if (liquid_y != this.frontWaterLineShape.y || this.backWaterLineShape.alpha ==1 && liquid_height_px == 0 || (typeof resetPosition !== "undefined" && resetPosition)){
			// draw liquid
			var g = this.backWaterGraphics;
			g.clear();
			if (this.liquid_height_px > 0 && this.liquid_color != null){
				g.beginFill(this.liquid_color);
				g.drawRect(-this.width_px/2, -this.liquid_height_px, this.width_px, this.liquid_height_px);
				g.endFill();
				g.beginFill(this.liquid_color);
				g.moveTo(-this.width_px/2, 0);
				g.lineTo(-this.width_px/2-this.width_from_depth, this.height_from_depth);
				g.lineTo(-this.width_px/2-this.width_from_depth, -this.liquid_height_px + this.height_from_depth);
				g.lineTo(-this.width_px/2, -this.liquid_height_px);
				g.endFill();
				this.backWaterLineShape.alpha = 1;
			} else {
				this.backWaterLineShape.alpha = 0;
			}
			
			g = this.frontWaterGraphics;
			g.clear();
			if (this.liquid_height_px > 0 && this.liquid_color != null){
				g.beginFill(this.liquid_color);
				g.drawRect(-this.width_px/2, -this.liquid_height_px, this.width_px, this.liquid_height_px);
				g.endFill();
				g.beginFill(this.liquid_color);
				g.moveTo(this.width_px/2, 0);
				g.lineTo(this.width_px/2+this.width_from_depth, -this.height_from_depth);
				g.lineTo(this.width_px/2+this.width_from_depth, -this.liquid_height_px- this.height_from_depth);
				g.lineTo(this.width_px/2, -this.liquid_height_px);
				g.endFill();
				this.frontWaterLineShape.alpha = 1;
			} else {
				this.frontWaterLineShape.alpha = 0;
			}
			
			this.frontWaterLineShape.y = -this.liquid_height_px;
			this.backWaterLineShape.y = this.frontWaterLineShape.y - this.height_from_depth;

			if (this.showRuler){
				this.pointerShape.y = this.frontWaterLineShape.y;
				this.pointerText.y = this.pointerShape.y - 10;
				var val = Math.round(10*this.liquid_height_px / this.height_px * this.volume_units)/10;
				this.pointerText.text = val.toString() + " " + (GLOBAL_PARAMETERS.SHOW_UNITS_ON_BEAKER ? GLOBAL_PARAMETERS.VOLUME_UNITS : "");
			}			
		} 	
	}

	window.BeakerShape = BeakerShape;
}(window));
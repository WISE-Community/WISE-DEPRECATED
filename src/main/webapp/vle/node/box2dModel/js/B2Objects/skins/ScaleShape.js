(function (window)
{
	/** This actor in the world creates its own skin based upon dimensions */
	function ScaleShape (pan_width_px, pan_height_px, pan_dy_px, base_width_px, base_width_top_px, base_height_px, savedObject){
		this.initialize (pan_width_px, pan_height_px, pan_dy_px, base_width_px, base_width_top_px, base_height_px, savedObject);
	}

	var p = ScaleShape.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function (pan_width_px, pan_height_px, pan_dy_px, base_width_px, base_width_top_px, base_height_px, savedObject){
		this.Container_initialize();

		this.pan_width_px = pan_width_px;
		this.pan_height_px = pan_height_px;
		this.pan_dy_px = pan_dy_px
		this.base_width_px = base_width_px;
		this.base_width_top_px = base_width_top_px;
		this.base_height_px = base_height_px;
		this.max_pan_dy_px = pan_dy_px;

		var width_from_depth = this.width_from_depth = pan_width_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle);
		var height_from_depth = this.height_from_depth = pan_width_px * Math.sin(GLOBAL_PARAMETERS.view_topAngle);
		this.width_top_from_depth = base_width_top_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle);
		this.height_top_from_depth = base_width_top_px * Math.sin(GLOBAL_PARAMETERS.view_topAngle);
		this.height_px = this.max_pan_dy_px + this.base_height_px + this.pan_height_px;
		this.height_px_below = 0;
		this.height_px_above = this.height_px;
		this.width_px_left = this.pan_width_px/2;
		this.width_px_right = this.pan_width_px/2;
		this.width_px = this.pan_width_px;
		
		this.savedObject = savedObject;

		var dw = this.base_width_top_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle);
		var dh = this.base_width_top_px * Math.sin(GLOBAL_PARAMETERS.view_topAngle);

		// draw the base
		var g = this.baseg = new createjs.Graphics();
		this.baseShape = new createjs.Shape(g);
		this.addChild(this.baseShape);
		g.setStrokeStyle(0.5);
		g.beginStroke("#AA9900");
		g.beginLinearGradientFill(["rgba(150,150,150,1.0)", "rgba(200,200,150,1.0)", "rgba(250,250,150,1.0)", "rgba(200,200,150,1.0)", "rgba(150,150,150,1.0)"], [0, 0.25, 0.5, 0.75, 1], -this.base_width_px/2, 0, this.base_width_px/2, 0);
		g.moveTo(-this.base_width_top_px/2, -this.base_height_px);
		g.lineTo(this.base_width_top_px/2, -this.base_height_px);
		g.lineTo(this.base_width_px/2, 0);
		g.lineTo(-this.base_width_px/2, 0);
		g.lineTo(-this.base_width_top_px/2, -this.base_height_px);
		g.endFill();
		g.beginStroke("#AA9900");
		g.beginLinearGradientFill(["rgba(100,100,100,1.0)", "rgba(150,150,125,1.0)", "rgba(200,200,150,1.0)", "rgba(150,150,125,1.0)", "rgba(100,100,100,1.0)"], [0, 0.25, 0.5, 0.75, 1], -this.base_width_px/2, 0, this.base_width_px/2, 0);
		g.moveTo(-this.base_width_top_px/2, -this.base_height_px);
		g.lineTo(-this.base_width_top_px/2+dw, -this.base_height_px-dh);
		g.lineTo(this.base_width_top_px/2+dw, -this.base_height_px-dh);
		g.lineTo(this.base_width_px/2+dw, -dh);
		g.lineTo(this.base_width_px/2, 0);
		g.lineTo(this.base_width_top_px/2, -this.base_height_px);
		g.lineTo(-this.base_width_top_px/2, -this.base_height_px);
		g.lineTo(-this.base_width_top_px/2, -this.base_height_px);
		g.endFill();
		//this.baseShape.cache();
		
		// face
		g = this.faceg = new createjs.Graphics();
		this.faceShape = new createjs.Shape(g);
		this.faceShape.x = 0;
		this.faceShape.y = -this.base_height_px/2;
		this.addChild(this.faceShape);
		g.setStrokeStyle(2);
		g.beginFill("#EEEEEE");
		g.drawEllipse (-this.MASS_DISPLAY_WIDTH/2, -this.MASS_DISPLAY_WIDTH/2, this.MASS_DISPLAY_WIDTH, this.MASS_DISPLAY_WIDTH);
		g.endFill();
		
		
		g = this.massTextGraphics= new createjs.Graphics();
		this.massTextBackground = new createjs.Shape(g);
		g.setStrokeStyle(4).beginStroke("#000000").beginFill("#FFFFFF")
			.drawRoundRect(0, 0, this.base_width_px - 30, this.base_height_px/2, 4, 4)
			.endFill().endStroke();
		this.addChild(this.massTextBackground);
		this.massTextBackground.x = -this.base_width_px/2 + 15;
		this.massTextBackground.y = -this.base_height_px/2+2;

		this.massText = new TextContainer("0", "16px Arial bold", "rgba(100,100,50,1.0)", this.MASS_DISPLAY_WIDTH, this.MASS_DISPLAY_WIDTH, null, null, 0, "center", "center", 0, 0,"rect" ,true)
		this.addChild(this.massText);
		this.massText.x = 0;
		this.massText.y = -this.base_height_px/4;			
		
		
		// pans
		// easel
		g = this.pang = new createjs.Graphics();
		this.panShape = new createjs.Shape(g);
		this.panShape.x = 0;
		this.panShape.y = this.y-this.max_pan_height_px;
		this.addChild(this.panShape);

		this.drawPan();
		
	}

	/** A separate function so that we can draw the pan color based on the heavir of the two pans */
	p.drawPan = function (){
		var panColor;
		//if (this.mass_on_pan != 0){panColor = "#99CC99";}
		//else {panColor = "#CCCCCC";}
		panColor = "#CCCCCC";
		var g = this.panShape.graphics;
		g.clear();
		g.setStrokeStyle(1);
		g.beginStroke("#888888");
		g.beginFill("#AAAAAA");
		g.drawRect(-5 + this.width_top_from_depth/2, 0, 10, -this.panShape.y - this.base_height_px - this.height_top_from_depth/2);
		g.endFill();
		g.endStroke();
		g.setStrokeStyle(2);
		g.beginStroke("#AAAAAA");
		g.beginFill(panColor);
		g.moveTo(-this.pan_width_px/2, 0);
		g.lineTo(this.pan_width_px/2, 0);
		g.lineTo(this.pan_width_px/2 + this.width_from_depth, -this.height_from_depth);
		g.lineTo(-this.pan_width_px/2 + this.width_from_depth, -this.height_from_depth);
		g.lineTo(-this.pan_width_px/2, 0);
		g.endFill();
	}

	p.redraw = function (pan_y, force){
		var t = Math.round(force*100)/100;
		if (GLOBAL_PARAMETERS.SHOW_UNITS_ON_SCALE) t = t + " " + GLOBAL_PARAMETERS.SCALE_UNITS;
		this.massText.setText(t);
		
		pan_y = typeof pan_y === "undefined"? 0 : pan_y;
		if (pan_y != this.panShape.y){
			//console.log(this.max_pan_dy_px,-pan_y - this.base_height_px + this.pan_height_px, pan_y, this.base_height_px, this.pan_height_px);
			this.panShape.y = pan_y;
			this.height_px = -pan_y;// + this.pan_height_px;
			this.height_px_above = this.height_px;
			//console.log(this.height_px);
			this.drawPan();
			
		}
	}

	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	window.ScaleShape = ScaleShape;
}(window));
(function (window)
{
	/** This actor in the world creates its own skin based upon dimensions */
	function BalanceShape (pan_width_px, pan_height_px, pan_dy_px, base_width_px, base_height_px, base_height_edge_px, stem_width_px, stem_height_px, beam_length_x_px, beam_length_y_px, beam_height_px, beam_height_edge_px, savedObject){
		this.initialize (pan_width_px, pan_height_px, pan_dy_px, base_width_px, base_height_px, base_height_edge_px, stem_width_px, stem_height_px, beam_length_x_px, beam_length_y_px, beam_height_px, beam_height_edge_px, savedObject);
	}

	var p = BalanceShape.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function (pan_width_px, pan_height_px, pan_dy_px, base_width_px, base_height_px, base_height_edge_px, stem_width_px, stem_height_px, beam_length_x_px, beam_length_y_px, beam_height_px, beam_height_edge_px, savedObject){
		this.Container_initialize();

		this.pan_width_px = pan_width_px;
		this.pan_height_px = pan_height_px;
		this.pan_dy_px = pan_dy_px
		this.base_width_px = base_width_px;
		this.base_height_px = base_height_px;
		this.base_height_edge_px = base_height_edge_px;
		this.stem_width_px = stem_width_px;
		this.stem_height_px = stem_height_px;
		this.beam_length_x_px = beam_length_x_px;
		this.beam_length_y_px = beam_length_y_px;
		this.beam_height_px = beam_height_px;
		this.beam_height_edge_px = beam_height_edge_px;
		this.beam_length_y_px = beam_length_y_px;
		this.width_px = this.pan_width_px * 4;
		this.height_px = this.stem_height_px + this.beam_height_px;

		var width_from_depth = this.width_from_depth = pan_width_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle);
		var height_from_depth = this.height_from_depth = pan_width_px * Math.sin(GLOBAL_PARAMETERS.view_topAngle);
		var base_width_from_depth = base_width_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle);
		var base_height_from_depth = base_width_px * Math.sin(GLOBAL_PARAMETERS.view_topAngle);
		this.height_px_below = 0;
		this.height_px_above = beam_height_px + stem_height_px;
		this.width_px_left = beam_length_x_px/2 + pan_width_px/2;
		this.width_px_right = beam_length_x_px/2 + pan_width_px/2;

		this.savedObject = savedObject;

		
		// draw the base
		var g = this.baseg = new createjs.Graphics();
		this.baseShape = new createjs.Shape(g);
		this.baseShape.y = -this.stem_height_px;
		this.addChild(this.baseShape);
		g.clear();
		g.setStrokeStyle(0.5);
		g.beginStroke("#AA9900");
		g.beginLinearGradientFill(["rgba(150,150,50,1.0)", "rgba(200,200,50,1.0)", "rgba(250,250,50,1.0)", "rgba(200,200,50,1.0)", "rgba(150,150,50,1.0)"], [0, 0.25, 0.5, 0.75, 1], -this.base_width_px/2, 0, this.base_width_px/2, 0);
		g.moveTo(-this.base_width_px/2-base_width_from_depth/2, this.stem_height_px );
		g.lineTo(-this.base_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_edge_px );
		g.lineTo(-this.stem_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_px );
		g.lineTo(+this.stem_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_px );
		g.lineTo(+this.base_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_edge_px );
		g.lineTo(+this.base_width_px/2-base_width_from_depth/2, this.stem_height_px );
		g.lineTo(-this.base_width_px/2-base_width_from_depth/2, this.stem_height_px );
		g.endFill();
		g.beginLinearGradientFill(["rgba(120,120,35,1.0)", "rgba(150,150,40,1.0)", "rgba(200,200,45,1.0)", "rgba(150,150,40,1.0)", "rgba(120,120,35,1.0)"], [0, 0.25, 0.5, 0.75, 1], -this.base_width_px/2, 0, this.base_width_px/2, 0);
		g.moveTo(-this.base_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_edge_px );
		g.lineTo(-this.base_width_px/2+base_width_from_depth/2, this.stem_height_px - this.base_height_edge_px - base_height_from_depth);
		g.lineTo(-this.stem_width_px/2+base_width_from_depth/2, this.stem_height_px - this.base_height_px - base_height_from_depth);
		g.lineTo(+this.stem_width_px/2+base_width_from_depth/2, this.stem_height_px - this.base_height_px - base_height_from_depth);
		g.lineTo(this.base_width_px/2+base_width_from_depth/2, this.stem_height_px - this.base_height_edge_px - base_height_from_depth);
		g.lineTo(this.base_width_px/2+base_width_from_depth/2, this.stem_height_px - base_height_from_depth);
		g.lineTo(this.base_width_px/2-base_width_from_depth/2, this.stem_height_px );
		g.lineTo(this.base_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_edge_px );
		g.lineTo(+this.stem_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_px );
		g.lineTo(-this.stem_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_px );
		g.lineTo(-this.base_width_px/2-base_width_from_depth/2, this.stem_height_px - this.base_height_edge_px );
		g.beginLinearGradientFill(["rgba(150,150,50,1.0)",  "rgba(200,200,50,1.0)","rgba(250,250,50,1.0)",  "rgba(200,200,50,1.0)", "rgba(150,150,500,1.0)"], [0, 0.1, 0.5, 0.9, 1], -this.stem_width_px/2, 0, this.stem_width_px/2, 0);
		g.moveTo(-this.stem_width_px/2, this.stem_height_px - this.base_height_px - base_height_from_depth/2);
		g.lineTo(-this.stem_width_px/2, this.base_height_px);
		g.lineTo(0, 0);
		g.lineTo(+this.stem_width_px/2, this.base_height_px);
		g.lineTo(+this.stem_width_px/2, this.stem_height_px - this.base_height_px - base_height_from_depth/2);
		g.lineTo(-this.stem_width_px/2, this.stem_height_px - this.base_height_px - base_height_from_depth/2);
		g.endFill();
		//this.baseShape.cache();
		
		g = this.beamg = new createjs.Graphics();
		this.beamShape = new createjs.Shape(g);
		this.beamShape.y = -this.stem_height_px;
		this.addChild(this.beamShape);
		g.clear();
		g.setStrokeStyle(1);
		g.beginStroke("#AA9900");
		g.beginFill("#DDCC00");
		g.moveTo(-this.beam_length_x_px, this.beam_length_y_px);
		g.curveTo(-this.beam_length_x_px/2, this.beam_length_y_px, 0, 0);
		g.curveTo(this.beam_length_x_px/2, this.beam_length_y_px, this.beam_length_x_px, this.beam_length_y_px);
		g.lineTo(this.beam_length_x_px, this.beam_length_y_px-this.beam_height_edge_px);
		g.curveTo(this.beam_length_x_px/2, this.beam_length_y_px-this.beam_height_edge_px, 0, -this.beam_height_px);
		g.curveTo(-this.beam_length_x_px/2, this.beam_length_y_px-this.beam_height_edge_px, -this.beam_length_x_px, this.beam_length_y_px-this.beam_height_edge_px);
		g.lineTo(-this.beam_length_x_px, this.beam_length_y_px);	
		g.endFill();

		this.leftPanShape = new createjs.Shape();
		this.rightPanShape = new createjs.Shape();
		this.addChild(this.leftPanShape);
		this.addChild(this.rightPanShape);
		this.leftPanShape.x = -this.beam_length_x_px;
		this.rightPanShape.x = this.beam_length_x_px;
		this.leftPanShape.y = this.beam_length_y_px + this.pan_dy_px; 
		this.rightPanShape.y = this.beam_length_y_px + this.pan_dy_px; 

		this.drawPan("left");
		this.drawPan("right");
	}
	
	/** A separate function so that we can draw the pan color based on the heavir of the two pans */
	p.drawPan = function (leftOrRight, color){
		color = typeof color === "undefined"? "#CCCCCC" : color;
		
		var g;
		if (leftOrRight == "left"){
			g = this.leftPanShape.graphics;	
		} else {
			g = this.rightPanShape.graphics;
		}
		
		g.clear();
		g.setStrokeStyle(2);
		g.beginStroke("#AAAAAA");
		g.beginFill(color);
		g.moveTo(-this.pan_width_px/2, 0);
		g.lineTo(this.pan_width_px/2, 0);
		g.lineTo(this.pan_width_px/2 + this.width_from_depth, -this.height_from_depth);
		g.lineTo(-this.pan_width_px/2 + this.width_from_depth, -this.height_from_depth);
		g.lineTo(-this.pan_width_px/2, 0);
		g.endFill();
		g.moveTo(-this.pan_width_px/2 + this.width_from_depth/2, -this.pan_height_px - this.height_from_depth/2);
		g.lineTo(0, -this.pan_dy_px)
		g.moveTo(this.pan_width_px/2 + this.width_from_depth/2, -this.pan_height_px - this.height_from_depth/2);
		g.lineTo(0, -this.pan_dy_px);
		g.endFill();

	}

	p.redraw = function (angle, leftPanPoint, rightPanPoint, leftColor, rightColor){
		var rotation = angle * 180 / Math.PI;
		this.beamShape.rotation = rotation;
		this.leftPanShape.x = leftPanPoint.x;
		this.leftPanShape.y = leftPanPoint.y;
		this.rightPanShape.x = rightPanPoint.x;
		this.rightPanShape.y = rightPanPoint.y;
		if (typeof leftColor !== "undefined") this.drawPan("left", leftColor);
		if (typeof rightColor !== "undefined") this.drawPan("right", rightColor);
	}

	/** Tick function called on every step, if update, redraw */
	p._tick = function ()
	{
		this.Container_tick();
	}
	
	window.BalanceShape = BalanceShape;
}(window));
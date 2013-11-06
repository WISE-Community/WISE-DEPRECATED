(function (window)
{

	function LabShape (width_px, height_px, wall_width_px, floor_height_px, shelf_height_px){
		this.initialize (width_px, height_px, wall_width_px, floor_height_px, shelf_height_px);
	}

	var p = LabShape.prototype = new createjs.Container();
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function(width_px, height_px, wall_width_px, floor_height_px, shelf_height_px){
		this.width_px = width_px;
		this.height_px = height_px;
		this.wall_width_px = wall_width_px;
		this.floor_height_px = floor_height_px;
		this.shelf_height_px = shelf_height_px;

		var g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);
		this.addChild(this.shape);

		g.beginLinearGradientFill(["rgba(250,250,250,1.0)","rgba(230,210,220,1.0)"],[0,1.0],0,0,this.width_px,this.height_px);
		g.drawRect(0, 0, this.width_px, this.height_px);
		g.endFill();
		
		// draw border
		var export_offsetL = 250;
		var export_offsetR = 50;
		
		

		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,0,this.wall_width_px,0);
		this.g.moveTo(0,0);
		this.g.lineTo(this.wall_width_px,0);
		this.g.lineTo(this.wall_width_px,this.height_px - this.wall_width_px);
		this.g.lineTo(0, this.height_px);
		this.g.lineTo(0,0);
		this.g.endFill();

		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0], 0, this.height_px - this.wall_width_px, 0, this.height_px);
		this.g.moveTo(0,this.height_px);
		this.g.lineTo(this.width_px,this.height_px);
		this.g.lineTo(this.width_px-this.wall_width_px,this.height_px-this.wall_width_px);
		this.g.lineTo(this.wall_width_px, this.height_px-this.wall_width_px);
		this.g.lineTo(0,this.height_px);
		this.g.endFill();

		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],this.width_px - this.wall_width_px,0,this.width_px, 0);
		this.g.moveTo(this.width_px,0);
		this.g.lineTo(this.width_px-this.wall_width_px,0);
		this.g.lineTo(this.width_px-this.wall_width_px,this.height_px - this.wall_width_px);
		this.g.lineTo(this.width_px, this.height_px);
		this.g.lineTo(this.width_px,0);
		this.g.endFill();

		/*
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,0,0,this.wall_width_px);
		this.g.moveTo(0,0);
		this.g.lineTo(this.width_px-export_offsetL-this.wall_width_px,0);
		this.g.lineTo(this.width_px-export_offsetL,this.wall_width_px);
		this.g.lineTo(this.wall_width_px, this.wall_width_px);
		this.g.lineTo(0,0);
		this.g.endFill();
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],this.width_px-export_offsetL-this.wall_width_px,0,this.width_px-export_offsetL,0);
		this.g.moveTo(this.width_px-export_offsetL-this.wall_width_px,-this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetL,-this.wall_width_px - this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetL,this.wall_width_px);
		this.g.lineTo(this.width_px-export_offsetL-this.wall_width_px,0);
		this.g.lineTo(this.width_px-export_offsetL-this.wall_width_px,-this.EXPORT_HEIGHT);
		this.g.endFill();
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,0,0,this.wall_width_px);
		this.g.moveTo(this.width_px-export_offsetR,0);
		this.g.lineTo(this.width_px-export_offsetR-this.wall_width_px,this.wall_width_px);
		this.g.lineTo(this.width_px-this.wall_width_px,this.wall_width_px);
		this.g.lineTo(this.width_px,0);
		this.g.lineTo(this.width_px-export_offsetR,0);
		this.g.endFill();
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],this.width_px-export_offsetR-this.wall_width_px,0,this.width_px-export_offsetR,0);
		this.g.moveTo(this.width_px-export_offsetR-this.wall_width_px,-this.wall_width_px- this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetR,-this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetR,0);
		this.g.lineTo(this.width_px-export_offsetR-this.wall_width_px,this.wall_width_px);
		this.g.lineTo(this.width_px-export_offsetR-this.wall_width_px,-this.wall_width_px- this.EXPORT_HEIGHT);
		this.g.endFill();
		*/

		
		//draw floor
		g.beginLinearGradientFill(["rgba(120,120,120,1.0)","rgba(80,80,80,1.0)"],[0,1.0],0,this.height_px-100,this.width_px,this.height_px);
		g.drawRect(this.wall_width_px, this.height_px-this.floor_height_px-this.wall_width_px, this.width_px-2*this.wall_width_px, this.floor_height_px);
		g.endFill();

		// draw shelf
		var fw = this.floor_height_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle) / Math.sin(GLOBAL_PARAMETERS.view_topAngle);
		this.drawHinge(this.wall_width_px + fw + 10,0, 30, this.shelf_height_px - this.floor_height_px);
		this.drawHinge(this.width_px/2, 0, 30, this.shelf_height_px - this.floor_height_px);
		this.drawHinge(this.width_px - this.wall_width_px - 10 - 30, 0, 30, this.shelf_height_px - this.floor_height_px);

		// draw shadow
		g.beginFill("rgba(100, 100, 100, 1.0");
		g.moveTo(this.width_px - this.wall_width_px, this.shelf_height_px - this.floor_height_px + 10);
		g.lineTo(this.width_px - this.wall_width_px, this.shelf_height_px - this.floor_height_px + 40);
		g.lineTo(this.width_px - this.wall_width_px - 40, this.shelf_height_px - this.floor_height_px + 40);
		g.lineTo(this.width_px - this.wall_width_px, this.shelf_height_px - this.floor_height_px + 10);
		g.endFill();

		g.beginStroke("rgba(100,100,100,1.0)");
		g.beginLinearGradientFill(["rgba(200,245,200,1.0)","rgba(180,210,180,1.0)"],[0,1.0], 0, 0, this.width_px, 0);
		g.moveTo(this.wall_width_px, this.shelf_height_px);
		g.lineTo(this.wall_width_px + fw, this.shelf_height_px - this.floor_height_px);
		g.lineTo(this.width_px - this.wall_width_px, this.shelf_height_px - this.floor_height_px);
		g.lineTo(this.width_px - this.wall_width_px - fw, this.shelf_height_px);
		g.lineTo(this.wall_width_px, this.shelf_height_px);
		g.drawRect(this.wall_width_px, this.shelf_height_px, this.width_px-2*this.wall_width_px-fw, 10);

		g.beginLinearGradientFill(["rgba(100,145,100,1.0)","rgba(80,110,80,1.0)"],[0,1.0], this.width_px-fw, 0, this.width_px, 0);
		g.moveTo(this.width_px - this.wall_width_px - fw, this.shelf_height_px);
		g.lineTo(this.width_px - this.wall_width_px - fw, this.shelf_height_px + 10);
		g.lineTo(this.width_px - this.wall_width_px, this.shelf_height_px - this.floor_height_px + 10);
		g.lineTo(this.width_px - this.wall_width_px, this.shelf_height_px - this.floor_height_px);
		g.lineTo(this.width_px - this.wall_width_px - fw, this.shelf_height_px);
		g.endFill();

		// graphics for pouring of liquid
		var g = this.pourGraphics = new createjs.Graphics();
		this.pourShape = new createjs.Shape(g);
		this.addChild(this.pourShape);
		
		this.puddleShapes = [];
	}

	p.drawHinge = function (x, y, width_px, height_px){
		var g = this.g;
		// hinges
		g.beginStroke("rgba(100, 100, 100, 1.0)");
		g.beginLinearGradientFill(["rgba(200,200,200,1.0)","rgba(240,240,240,1.0)","rgba(200,200,200,1.0)"],[0,0.5,1.0], x, y+height_px, x+width_px, y);
		g.drawRect(x, y, width_px, height_px).endFill().endStroke();
		g.beginFill("rgba(100, 100, 100, 1.0)");
		g.drawCircle(x + width_px/2, y + height_px/4, 4);
		g.drawCircle(x + width_px/2, y + height_px/2, 4);
		g.drawCircle(x + width_px/2, y + height_px*3/4, 4);
		g.endFill().endStroke();
	}

	p.drawPour = function(color, x, y, width_px, height_px){
		var g = this.pourGraphics;
		g.clear();
		if (typeof color !== "undefined") g.beginFill(color).drawRoundRect(x, y, width_px, height_px, width_px/2).endFill();
	}

	p.createPuddleShape = function (color, x, width_px, height_px){
		var puddleShape = new createjs.Shape();
		puddleShape.graphics.beginFill(color, 0.4).drawEllipse(-width_px/2, -height_px/2, width_px, height_px).endFill();
		this.addChild(puddleShape);
		puddleShape.x = x;
		puddleShape.y = this.height_px - this.floor_height_px/2;
		return puddleShape;
	}

	p.updatePuddleShape = function (puddleShape, color, width_px, height_px){
		puddleShape.graphics.clear();
		if (height_px > this.floor_height_px) height_px = this.floor_height_px;
		puddleShape.graphics.beginFill(color, 0.4).drawEllipse(-width_px/2, -height_px/2, width_px, height_px).endFill();
	}

	p.removePuddleShape = function (puddleShape){
		this.removeChild(puddleShape);
	}

	window.LabShape = LabShape;
}(window));



(function (window)
{
	/** Construct a container with a background color and text 
	default values:
	width_px, height_px: 0 (on zero, replace with width and height of text)
	backgroundColor: white
	hAlign, vAlign: location of text within container - "left", "center", "right", "top", "bottom"
	*/
	var TextContainer = function(textString, font, textColor, width_px, height_px, backgroundColor, strokeColor, strokeSize, hAlign, vAlign, padding_x, padding_y, shapeType, orient_at_center)
	{
		this.initialize(textString, font, textColor, width_px, height_px, backgroundColor, strokeColor, strokeSize, hAlign, vAlign, padding_x, padding_y, shapeType, orient_at_center);
	}
	var p = TextContainer.prototype = new createjs.Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.mouseEnabled = true;
	p.Container_tick = p._tick;

	p.initialize = function(textString, font, textColor, width_px, height_px, backgroundColor, strokeColor, strokeSize, hAlign, vAlign, padding_x, padding_y, shapeType, orient_at_center)
	{
		this.Container_initialize();
		this.textString = textString;
		this.font = font;
		this.textColor = textColor;
		this.width_px = (typeof width_px === "undefined") ? 0 : width_px;
		this.height_px = (typeof height_px === "undefined") ? 0 : height_px;
		this.backgroundColor = (typeof backgroundColor === "undefined" || backgroundColor == null) ? "rgba(255,255,255,0)" : backgroundColor;
		this.strokeColor = (typeof strokeColor === "undefined") ? this.backgroundColor : strokeColor;
		this.strokeSize = (typeof strokeSize === "undefined") ? 0 : strokeSize;
		this.hAlign = (typeof hAlign === "undefined") ? "center" : hAlign;
		this.vAlign = (typeof vAlign === "undefined") ? "center" : vAlign;
		this.padding_x = (typeof padding_x === "undefined") ? 0 : padding_x;
		this.padding_y = (typeof padding_y === "undefined") ? 0 : padding_y;
		this.shapeType = (typeof shapeType === "undefined") ? "rect" : shapeType;
		this.orient_at_center = (typeof orient_at_center === "undefined") ? false : orient_at_center;
		
		//background
		this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(this.g);
		this.shape.mouseEventsEnabled = true;
		
		this.addChild(this.shape);
		// create text
		this.text = new createjs.Text(this.textString, this.font, this.textColor);
		this.text.textBaseline = "top";
		if (this.width_px > 0){ this.text.lineWidth = this.width_px;}
		else {this.width_px = this.text.getMeasuredWidth(); this.text.lineWidth = this.width_px;}
		this.text.mouseEnabled = false;
		this.addChild(this.text);

		// take max of text width and height and given width and height
		//this.width_px = Math.max(this.text.getMeasuredWidth(), this.width_px);
		this.height_px = Math.max(this.text.getMeasuredLineHeight(), this.height_px);
		this.original_width_px = this.width_px;
		this.original_height_px = this.height_px;

		if (this.orient_at_center)
		{
			// align text
			if (this.hAlign == "left"){this.text.x = -this.width_px/2 + this.padding_x;}
			else if (this.hAlign == "right"){this.text.x = -this.text.getMeasuredWidth()+this.padding_x;}
			else {this.text.x = -this.text.getMeasuredWidth()/2+this.padding_x;}

			if (this.vAlign == "top"){this.text.y = -this.height_px/2 + this.padding_y;}
			else if (this.vAlign == "bottom"){this.text.y = -this.text.getMeasuredLineHeight() + this.padding_y;}
			else {this.text.y = -this.text.getMeasuredLineHeight()/2+this.padding_y;}		
		} else
		{
			// align text
			if (this.hAlign == "left"){this.text.x = this.padding_x;}
			else if (this.hAlign == "right"){this.text.x = this.width_px-this.text.getMeasuredWidth()+this.padding_x;}
			else {this.text.x = ( this.width_px-this.text.getMeasuredWidth())/2+this.padding_x;}

			if (this.vAlign == "top"){this.text.y = this.padding_y;}
			else if (this.vAlign == "bottom"){this.text.y = this.height_px-this.text.getMeasuredLineHeight()+this.padding_y;}
			else {this.text.y = ( this.height_px-this.text.getMeasuredLineHeight())/2+this.padding_y;}
			
		}
		this.redraw();
	}

	p._tick = function ()
	{
		this.Container_tick();
	}
	
	//// UPDATING FUNCTIONS
	p.setText = function (textString, width_px, height_px)
	{
		this.textString = textString;
		if (this.text != null) this.removeChild(this.text);

		this.text = new createjs.Text(this.textString, this.font, this.textColor);
		this.text.textBaseline = "top";
		this.text.mouseEnabled = false;
		this.addChild(this.text);
		
		this.width_px = typeof (width_px) === "undefined" ? this.original_width_px : width_px;
		this.height_px = typeof (height_px) === "undefined" ? this.original_height_px: height_px;
		if (this.orient_at_center)
		{
			// align text
			if (this.hAlign == "left"){this.text.x = -this.width_px/2 + this.padding_x;}
			else if (this.hAlign == "right"){this.text.x = -this.text.getMeasuredWidth()+this.padding_x;}
			else {this.text.x = -this.text.getMeasuredWidth()/2+this.padding_x;}

			if (this.vAlign == "top"){this.text.y = -this.height_px/2 + this.padding_y;}
			else if (this.vAlign == "bottom"){this.text.y = -this.text.getMeasuredLineHeight() + this.padding_y;}
			else {this.text.y = -this.text.getMeasuredLineHeight()/2+this.padding_y;}		
		} else
		{
			// align text
			if (this.hAlign == "left"){this.text.x = this.padding_x;}
			else if (this.hAlign == "right"){this.text.x = this.width_px-this.text.getMeasuredWidth()+this.padding_x;}
			else {this.text.x = ( this.width_px-this.text.getMeasuredWidth())/2+this.padding_x;}

			if (this.vAlign == "top"){this.text.y = this.padding_y;}
			else if (this.vAlign == "bottom"){this.text.y = this.height_px-this.text.getMeasuredLineHeight()+this.padding_y;}
			else {this.text.y = ( this.height_px-this.text.getMeasuredLineHeight())/2+this.padding_y;}
			
		}

		this.redraw();
	}

	p.setBackgroundColor = function(c)
	{
		this.backgroundColor = c;
		this.redraw();
	}

	p.redraw = function ()
	{
		var offset;
		if (this.orient_at_center)
		{
			offset = new createjs.Point (-this.width_px/2, -this.height_px/2);		
		} else
		{
			offset = new createjs.Point (0, 0);
		}

		this.g.clear();
		// draw background shape
		if (this.strokeSize > 0)
		{
			this.g.setStrokeStyle(this.strokeSize);
			this.g.beginStroke(this.strokeColor);
		}
		this.g.beginFill(this.backgroundColor);
		if (this.shapeType == "rect"){ this.g.drawRect(offset.x, offset.y, this.width_px, this.height_px);}
		else if (this.shapeType == "ellipse"){this.g.drawEllipse(offset.x, offset.y, this.width_px, this.height_px);}
		else if (this.shapeType == "roundRect"){this.g.drawRoundRect(offset.x, offset.y, this.width_px, this.height_px, this.width_px/2, this.height_px/2);}
		this.g.endFill();
		if (this.strokeSize > 0) this.g.endStroke();

		if (stage != null) stage.needs_to_update;
	}
	window.TextContainer = TextContainer;
}(window));
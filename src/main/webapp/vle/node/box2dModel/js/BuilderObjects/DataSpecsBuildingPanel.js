(function (window)
{
	/** A space for displaying the names of materials, clickable/draggable materials
	 and a grid space for putting them together */
	function DataSpecsBuildingPanel (isGraph, width_px, height_px, wall_width_px)
	{
		this.initialize(isGraph,width_px, height_px, wall_width_px);
	}
	var p = DataSpecsBuildingPanel.prototype = new createjs.Container();
	p.Container_initialize = DataSpecsBuildingPanel.prototype.initialize;
	p.Container_tick = p._tick;
	p.BACKGROUND_COLORS = ["rgba(250,250,250,1.0)","rgba(230,210,220,1.0)","rgba(245,230,240,1.0)", "rgba(240,225,235,1.0)"];
	p.BACKGROUND_RATIOS = [0, 0.5, 0.8, 1.0];
	p.TEXT_COLOR = "rgba(0, 0, 200, 1.0)";
	p.TITLE_COLOR = "rgba(40,40,40,1.0";
	p.BLOCK_COUNT_COLOR = "rgba(255, 255, 255, 1.0)"
	p.TITLE_HEIGHT = 40;
	p.EXPORT_HEIGHT = 80;

	p.initialize = function(isGraph, width_px, height_px, wall_width_px)
	{
		this.Container_initialize();
		this.isGraph = isGraph;
		this.include_vv = false;
		this.width_px = width_px;
		this.height_px = height_px;
		this.wall_width_px = wall_width_px;
		this.view_sideAngle = GLOBAL_PARAMETERS.view_sideAngle;
		this.view_topAngle = GLOBAL_PARAMETERS.view_topAngle;

		//background
		this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(this.g);
		this.addChild(this.shape);

		// the list of material names
		this.dataViewer = {};
		this.dataViewer.max_volume = GLOBAL_PARAMETERS.MAX_WIDTH_UNITS * GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS * GLOBAL_PARAMETERS.MAX_DEPTH_UNITS;
		this.dataViewer.max_mass = this.dataViewer.max_volume;
		this.dataViewer.min_mass = GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS;
		this.dataViewer.min_volume = GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS;
		this.dataViewer.width_px = 400;
		this.dataViewer.height_px = 400;
		this.dataViewer.element = null;
		//this.addChild(this.dataViewer);
		this.dataViewer.x = this.wall_width_px+1;
		this.dataViewer.y = this.wall_width_px+this.TITLE_HEIGHT;

		if (this.include_vv) {
			this.vv = new RectPrismViewer(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.MAX_WIDTH_UNITS, GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS, GLOBAL_PARAMETERS.MAX_DEPTH_UNITS);
			this.addChild(this.vv);
			this.vv.x = this.width_px - 150;
			this.vv.y = this.TITLE_HEIGHT + 100;
		}
		this.dragging_object = null;

		var export_offsetL = 250;
		var export_offsetR = 0;
		this.block_space_width = this.include_vv ? this.width_px - this.dataViewer.width_px - export_offsetL - wall_width_px : GLOBAL_PARAMETERS.MAX_WIDTH_UNITS * 1.8 * GLOBAL_PARAMETERS.SCALE;
		this.block_space_height = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS * 1.8 * GLOBAL_PARAMETERS.SCALE;

		this.g.beginLinearGradientFill(this.BACKGROUND_COLORS,this.BACKGROUND_RATIOS,0, 0, this.width_px, this.height_px);
		this.g.drawRect(0, 0, this.width_px, this.height_px- this.EXPORT_HEIGHT);
		this.g.drawRect(this.width_px-export_offsetL-this.wall_width_px, this.height_px- this.EXPORT_HEIGHT, export_offsetL-export_offsetR+this.wall_width_px, this.EXPORT_HEIGHT);
		this.g.endFill();
		// draw border
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,0,this.wall_width_px,0);
		this.g.moveTo(0,0);
		this.g.lineTo(this.wall_width_px,this.wall_width_px);
		this.g.lineTo(this.wall_width_px,this.height_px - this.wall_width_px - this.EXPORT_HEIGHT);
		this.g.lineTo(0, this.height_px- this.EXPORT_HEIGHT);
		this.g.lineTo(0,0);
		this.g.endFill();
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,0,0,this.wall_width_px);
		this.g.moveTo(0,0);
		this.g.lineTo(this.width_px,0);
		this.g.lineTo(this.width_px-this.wall_width_px,this.wall_width_px);
		this.g.lineTo(this.wall_width_px, this.wall_width_px);
		this.g.lineTo(0,0);
		this.g.endFill();
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],this.width_px,0,this.width_px-this.wall_width_px,0);
		this.g.moveTo(this.width_px,0);
		this.g.lineTo(this.width_px-this.wall_width_px,this.wall_width_px);
		this.g.lineTo(this.width_px-this.wall_width_px,this.height_px);
		this.g.lineTo(this.width_px, this.height_px);
		this.g.lineTo(this.width_px,0);
		this.g.endFill();
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,this.height_px- this.EXPORT_HEIGHT,0,this.height_px-this.wall_width_px- this.EXPORT_HEIGHT);
		this.g.moveTo(0,this.height_px- this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-this.wall_width_px-export_offsetL,this.height_px- this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetL,this.height_px-this.wall_width_px - this.EXPORT_HEIGHT);
		this.g.lineTo(this.wall_width_px, this.height_px-this.wall_width_px - this.EXPORT_HEIGHT);
		this.g.lineTo(0,this.height_px- this.EXPORT_HEIGHT);
		this.g.endFill();

		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],this.width_px-export_offsetL-this.wall_width_px,0,this.width_px-export_offsetL,0);
		this.g.moveTo(this.width_px-export_offsetL-this.wall_width_px,this.height_px- this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetL,this.height_px-this.wall_width_px - this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetL,this.height_px);
		this.g.lineTo(this.width_px-export_offsetL-this.wall_width_px,this.height_px);
		this.g.lineTo(this.width_px-export_offsetL-this.wall_width_px,this.height_px- this.EXPORT_HEIGHT);
		this.g.endFill();

		// titles
		if (this.include_vv) {
			var ltitle = new createjs.Text("Choose Mass and Volume", "20px Arial", this.TITLE_COLOR);
			this.addChild(ltitle);
			ltitle.x = 20;
			ltitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;
		}

		var mtitle  = new createjs.Text("Reshape your block", "20px Arial", this.TITLE_COLOR);
		this.addChild(mtitle);
		mtitle.x = this.include_vv ? (this.width_px/2 + 40)/2 : this.width_px - 240;
		mtitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		if (this.include_vv) {
			var rtitle = new TextContainer("Drop your blocks here", "20px Arial", this.TITLE_COLOR);
			this.addChild(rtitle);
			rtitle.x = this.width_px / 2 + (this.width_px / 2 - 120) / 2;
			rtitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;
		}

		this.displayed_block = null;
		var incPow = 0;
		var iWidth = GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-1;
		var iHeight = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS-1;
		var iDepth = GLOBAL_PARAMETERS.MAX_DEPTH_UNITS-1;
		this.width_units = GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - iWidth;
		this.height_units = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS -iHeight;
		this.depth_units = GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - iDepth;

		var htmlText, htmlElement;
		// jquery ui
		if ($("#make-object").length == 0){
			htmlText = '<input type="submit" id="make-object" value="Export Model"/>';
			$("#builder-button-holder").append(htmlText);
			$("#make-object")
				.button()
				.click(function( event ) {
					event.preventDefault();
					builder.createObject();
				}).hide();

			htmlText = '<div id="slider-width" style="width: 100px"></div>';
			$("#builder-button-holder").append(htmlText);
			$("#slider-width")
				.slider({
					orientation: "horizontal",
					range: "max",
					min: 0,
					max: GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
					value: iWidth,
					step: GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
					slide: function( event, ui ) {
						$( "#amount" ).val( ui.value );
						builder.update_width(GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-ui.value);
					}
				}).hide();
			$("#slider-width").load(function (){$( "#amount" ).val( $( "#slider-width" ).slider( "value" ) );});

			htmlText = '<div id="slider-height" style="height: 100px"></div>';
			$("#builder-button-holder").append(htmlText);
			$("#slider-height")
				.slider({
					orientation: "vertical",
					range: "max",
					min: 0,
					max: GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS-GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
					value: iHeight,
					step: GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
					slide: function( event, ui ) {
						$( "#amount" ).val( ui.value );
						builder.update_height(GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS-ui.value);
					}
				}).hide();
			$("#slider-height").load(function (){$( "#amount" ).val( $( "#slider-height" ).slider( "value" ) );});

			htmlText = '<div id="slider-depth" style="height: 100px"></div>';
			$("#builder-button-holder").append(htmlText);
			$("#slider-depth")
				.slider({
					orientation: "vertical",
					range: "max",
					min: 0,
					max: GLOBAL_PARAMETERS.MAX_DEPTH_UNITS-GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
					value: iDepth,
					step: GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
					slide: function( event, ui ) {
						$( "#amount" ).val( ui.value );
						builder.update_depth(GLOBAL_PARAMETERS.MAX_DEPTH_UNITS-ui.value);
					}
				}).hide();
			$("#slider-depth").load(function (){$( "#amount" ).val( $( "#slider-depth" ).slider( "value" ) );});

			if (this.include_vv) {
				htmlText = '<div id="slider-topAngle" style="height: 100px"></div>';
				$("#builder-button-holder").append(htmlText);
				$("#slider-topAngle")
					.slider({
						orientation: "vertical",
						range: "min",
						min: 0,
						max: 90,
						value: 20,
						step: 10,
						slide: function (event, ui) {
							$("#amount").val(ui.value);
							builder.update_view_topAngle(ui.value);
						}
					}).hide();
				$("#slider-topAngle").load(function () {
					$("#amount").val($("#slider-topAngle").slider("value"));
				});

				htmlText = '<div id="slider-sideAngle" style="width: 100px;"></div>';
				$("#builder-button-holder").append(htmlText);
				$("#slider-sideAngle")
					.slider({
						orientation: "horizontal",
						range: "max",
						min: 0,
						max: 90,
						value: 80,
						step: 10,
						slide: function (event, ui) {
							$("#amount").val(ui.value);
							builder.update_view_sideAngle(90 - ui.value);
						}
					}).hide();
				$("#slider-sideAngle").load(function () {
					$("#amount").val($("#slider-sideAngle").slider("value"));
				});
			}
			// setup buttons for volume viewer	
			var element = new createjs.DOMElement($("#make-object")[0]);
			this.addChild(element);
			element.x = this.width_px - export_offsetL/2 - $("#make-object").width()*3/4;
			element.y = this.height_px - (this.EXPORT_HEIGHT);
			element = new createjs.DOMElement($("#slider-width")[0]);
			this.addChild(element);
			element.x = this.include_vv ? this.dataViewer.width_px + this.width_px/3 - 100 : this.width_px - 50 - this.block_space_width/2 -  $("#slider-width").width()/2;
			element.y = this.TITLE_HEIGHT + this.block_space_height + 20;

			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.widthText = new createjs.Text("Width: "+ (GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - iWidth).toFixed(incPow) + " " + GLOBAL_PARAMETERS.LENGTH_UNITS, "20px Arial", this.textColor);
				this.widthText.x = element.x + 50;
				this.widthText.y = element.y + $("#slider-width").height() + 10;
				this.widthText.lineWidth = 60;
				this.widthText.textAlign = "center";
				this.addChild(this.widthText);
			}
			element = new createjs.DOMElement($("#slider-height")[0]);
			this.addChild(element);
			element.x = this.include_vv ? this.dataViewer.x + this.dataViewer.width_px + this.block_space_width / 2 + 150 : this.width_px - 50;
			element.y = this.TITLE_HEIGHT*1.5;
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.heightText = new createjs.Text("Height: "+ (GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - iHeight).toFixed(incPow) + " " + GLOBAL_PARAMETERS.LENGTH_UNITS, "20px Arial", this.textColor);
				this.heightText.x = element.x + 10;
				this.heightText.y = element.y + $("#slider-height").height() + 10;
				this.heightText.lineWidth = 60;
				this.heightText.textAlign = "center";
				this.addChild(this.heightText);
			}
			element = new createjs.DOMElement($("#slider-depth")[0]);
			this.addChild(element);
			//element.rotation = GLOBAL_PARAMETERS.view_sideAngle*180/Math.PI;
			element.x = this.include_vv ? this.dataViewer.x + this.dataViewer.width_px + 50 : this.width_px - 50 - this.block_space_width;
			element.y = this.TITLE_HEIGHT*1.5;
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.depthText = new createjs.Text("Depth: " + (GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - iDepth).toFixed(incPow) + " "+ GLOBAL_PARAMETERS.LENGTH_UNITS, "20px Arial", this.textColor);
				this.depthText.x = element.x + 10;
				this.depthText.y = element.y + $("#slider-depth").height() + 10;
				this.depthText.lineWidth = 60;
				this.depthText.textAlign = "center";
				this.addChild(this.depthText);
			}

			if (this.include_vv) {
				element = new createjs.DOMElement($("#slider-sideAngle")[0]);
				this.addChild(element);
				element.x = this.width_px - 200;
				element.y = this.dataViewer.y + this.dataViewer.height_px - $("#slider-sideAngle").height() - 20;
				element = new createjs.DOMElement($("#slider-topAngle")[0]);
				this.addChild(element);
				element.x = this.width_px - this.wall_width_px - 30;
				element.y = 80;
			}

			$("#make-object").show();
			$("#slider-width").show();
			$("#slider-height").show();
			$("#slider-depth").show();
			if (this.include_vv) {
				$("#slider-sideAngle").show();
				$("#slider-topAngle").show();
			}

			this.reachedMax = false;
		}

		this.enabled = true;
		stage.ready_to_update = true;
	}

	/* This object will display either a graph or a table, but that element will be created in box2dModel.js and passed in here for display

	 */
	p.addDataElement = function (elem){
		if (this.dataViewer.element != null){
			this.removeChild(this.dataViewer.element);
		}
		this.dataViewer.element = new createjs.DOMElement(elem);
		this.addChildAt(this.dataViewer.element, 1);
		this.dataViewer.element.x = 10;
		this.dataViewer.element.y = 10;

	}

	p.createObject = function()
	{
		if (this.validObject())
		{
			var savedObject = this.saveObject();

			// save to global parameters
			//if(GLOBAL_PARAMETERS.DEBUG) console.log(JSON.stringify(savedObject));
			labWorld.createObjectInWorld(savedObject, 0, -1, 0, "dynamic");

			this.resetMaterials();
		} else
		{
			console.log("no object to make");
		}
	}

	/** Used to revise a model */
	p.restoreSavedObject = function (savedObject){
		if (typeof savedObject.rectPrismArrays != "undefined"){
			this.resetMaterials();
			var widths = savedObject.rectPrismArrays.widths;
			var depths = savedObject.rectPrismArrays.depths;
			var heights = savedObject.rectPrismArrays.heights;
			var materials = savedObject.rectPrismArrays.materials;
			var y_offset = 0;
			for (var i=heights.length-1; i >= 0; i--){
				var mass = materials[i].density *  widths[i] * depths[i] * heights[i];
				var o = this.newBlock( mass, widths[i], depths[i], heights[i]);
				// place object in viewer
				if (this.include_vv) {
					this.vv.placeBlockAtIndex(o, 1, GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - 1 - y_offset);
					this.vv.setBlock(o, true);
				} else {
					this.placeBlock(o);
				}
				y_offset += heights[i];
			}
			return true;
		} else {
			return false;
		}
	}

	/** Disable is primarilly to be used when the library is full */
	p.disableWithText = function (str){
		if (this.enabled){
			var g = new createjs.Graphics();
			this.screen = new createjs.Shape(this.g);
			this.addChild(this.screen);
			g.beginFill("rgba(255,255,255,0.5)");
			g.drawRect(0, 0, this.width_px, this.height_px);
			g.endFill();

			this.screenText = new createjs.Text(str, "20px Arial", "#444");
			this.screenText.x = (this.width_px - str.length*10)/2;
			this.screenText.y = (this.height_px - 20)/2;
			this.addChild(this.screenText);
			this.enabled = false;
			$("#make-object").hide();
			$("#slider-width").hide();
			$("#slider-height").hide();
			$("#slider-depth").hide();
			$("#slider-sideAngle").hide();
			$("#slider-topAngle").hide();
		}
	}

	/** Reverses disableWithText function */
	p.enable = function (){
		if (!this.enabled){
			this.removeChild(this.screen);
			this.removeChild(this.screenText);
			this.enabled = true;
			$("#make-object").show();
			$("#slider-width").show();
			$("#slider-height").show();
			$("#slider-depth").show();
			$("#slider-sideAngle").show();
			$("#slider-topAngle").show();
		}
	}

	////////////////////// CLASS SPECIFIC ////////////////////
	// when we update width or depth we add or subtract from height (leave other dimension alone)
	// when we update height we add or subtract equally to width and depth, maintaining ratio of width to depth
	p.update_width = function (width_units){
		var volume = this.height_units * this.depth_units * this.width_units;
		this.height_units = volume / (width_units * this.depth_units);
		// if height exceeds max, set to max then readjust width
		if (this.height_units > GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS){
			this.height_units = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS;
			width_units = volume / (this.height_units * this.depth_units);
			if (this.displayed_block != null){
				$('#slider-width').slider('option','value',GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - width_units);
			}
		}
		this.width_units = width_units;
		$('#slider-height').slider('option','value',GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - this.height_units);
		$('#slider-depth').slider('option','value',GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - this.depth_units);

		if (this.displayed_block != null){
			this.displayed_block.set_width_units(this.width_units);
			this.displayed_block.set_height_units(this.height_units);
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.widthText.text = "Width: " + Math.round(10*this.width_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
				this.heightText.text = "Height: " + Math.round(10*this.height_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
			}
		}
	}

	p.update_depth = function (depth_units){
		var volume = this.height_units * this.depth_units * this.width_units;
		this.height_units = volume / (depth_units * this.width_units);
		// if height exceeds max, set to max then readjust width
		if (this.height_units > GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS){
			this.height_units = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS;
			depth_units = volume / (this.height_units * this.width_units);
			if (this.displayed_block != null){
				$('#slider-depth').slider('option','value',GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - depth_units);
			}
		}
		this.depth_units = depth_units;

		$('#slider-width').slider('option','value',GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - this.width_units);
		$('#slider-height').slider('option','value',GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - this.height_units);

		if (this.displayed_block != null){
			this.displayed_block.set_depth_units(this.depth_units);
			this.displayed_block.set_height_units(this.height_units);
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.depthText.text = "Depth: " + Math.round(10*this.depth_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
				this.heightText.text = "Height: " + Math.round(10*this.height_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
			}
		}
	}
	p.update_height = function (height_units){
		var volume = this.height_units * this.depth_units * this.width_units;
		var wdratio = this.width_units / this.depth_units;
		var depth_units = Math.sqrt(volume / (height_units * wdratio));
		var width_units = depth_units * wdratio;

		// if width or depth exceeds max, set to max then readjust width
		if (wdratio > 1) { // width is larger
			if (width_units > GLOBAL_PARAMETERS.MAX_WIDTH_UNITS) {
				width_units = GLOBAL_PARAMETERS.MAX_WIDTH_UNITS;
				depth_units = width_units / wdratio;
				height_units = volume / (width_units * depth_units);
				if (this.displayed_block != null) {
					$('#slider-height').slider('option','value',GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - height_units);
				}
			}
		} else {
			if (depth_units > GLOBAL_PARAMETERS.MAX_DEPTH_UNITS) {
				depth_units = GLOBAL_PARAMETERS.MAX_DEPTH_UNITS;
				width_units = depth_units * wdratio;
				height_units = volume / (width_units * depth_units);
				if (this.displayed_block != null) {
					$('#slider-height').slider('option','value',GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - height_units);
				}
			}
		}

		this.width_units = width_units;
		this.depth_units = depth_units;
		this.height_units = height_units;

		$('#slider-width').slider('option','value',GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - this.width_units);
		$('#slider-depth').slider('option','value',GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - this.depth_units);

		if (this.displayed_block != null){
			this.displayed_block.set_width_units(this.width_units);
			this.displayed_block.set_depth_units(this.depth_units);
			this.displayed_block.set_height_units(this.height_units);

			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.widthText.text = "Width: " + Math.round(10*this.width_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
				this.depthText.text = "Depth: " + Math.round(10*this.depth_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
				this.heightText.text = "Height: " + Math.round(10*this.height_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
			}
		}
	}

	p.update_view_sideAngle = function (degrees)
	{
		this.view_sideAngle = degrees * Math.PI / 180;
		if (this.displayed_block != null) this.displayed_block.update_view_sideAngle(this.view_sideAngle);
		this.vv.update_view_sideAngle(this.view_sideAngle);
	}

	p.update_view_topAngle = function (degrees)
	{
		this.view_topAngle = degrees * Math.PI / 180;
		if (this.displayed_block != null) this.displayed_block.update_view_topAngle(this.view_topAngle);
		this.vv.update_view_topAngle(this.view_topAngle);
	}

	p.buttonClickHandler  = function(material_name)
	{
		this.drawMaterial(material_name);
	}

	p.drawCurrentMaterial = function (){
		this.drawMaterial(this.dataViewer.current_material_name);
	}

	p.drawMaterial = function (mass, volume)
	{
		var o;
		// if blocks array is not empty remove these from display
		if (this.displayed_block != null)
		{
			this.removeChild(this.displayed_block);
			this.displayed_block = null
		}

		// check to make sure the max object limit has not been reached
		// get # of undeleted objects
		var object_count = 0;
		for (var i = 0; i < GLOBAL_PARAMETERS.objects_made.length; i++) if (!GLOBAL_PARAMETERS.objects_made[i].is_deleted) object_count++;
		if (object_count < GLOBAL_PARAMETERS.MAX_OBJECTS_IN_WORLD){
			if (this.reachedMax){
				this.removeChild(this.reachedMaxText);
				this.reachedMax = false;
			}
			o = this.newBlock(mass, Math.cbrt(volume), Math.cbrt(volume), Math.cbrt(volume));
			this.placeBlock(o);
			stage.ready_to_update = true;
		} else {
			if (!this.reachedMax){
				// we have reached the limit, display a textField to tell user to delete an object
				this.reachedMaxText  = new createjs.Text("Reached max number of objects. \nDelete an object to make more.", "20px Arial","#880000");
				this.addChild(this.reachedMaxText);
				this.reachedMaxText.x = this.dataViewer.x + this.dataViewer.width_px + 80;
				this.reachedMaxText.y = this.TITLE_HEIGHT + 30;
				this.reachedMax = true;
			}
		}
	}

	/** Create a new block with the given material name and index along the depth_arrays array */
	p.newBlock = function (mass, width, depth, height)
	{
		this.width_units = width;
		this.height_units = height;
		this.depth_units = depth;
		$('#slider-width').slider('option','value',GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - this.width_units);
		$('#slider-height').slider('option','value',GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - this.height_units);
		$('#slider-depth').slider('option','value',GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - this.depth_units);

		this.widthText.text = "Width: " + Math.round(10*this.width_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
		this.heightText.text = "Height: " + Math.round(10*this.height_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
		this.depthText.text = "Depth: " + Math.round(10*this.depth_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;

		var volume = width * height * depth;
		var density = mass / volume;
		var angle = Math.atan(density);
		var max_angle = Math.atan(this.dataViewer.max_mass / this.dataViewer.min_volume);
		var min_angle = this.dataViewer.min_mass / this.dataViewer.max_volume;
		// what is percent makeup of this material based on difference from max_angle (density) to min_angle?
		var perB = Math.round(100 * angle / (min_angle + max_angle));
		var perA = Math.round(100 - perB);
		var display_name = perA+"% light, " + perB+"% dark";
		var material_name = "dual-composite";
		var color = "rgba(" + Math.floor(25+perA/100*230) + "," + Math.floor(25+perA/100*230) + "," + Math.floor(25+perA/100*230) + ",1.0)";
		var color_shadow = "rgba(" + Math.floor(perA/100*230) + "," + Math.floor(perA/100*230) + "," + Math.floor(perA/100*230) + ",1.0)";
		var color_stroke = "rgba(" + Math.floor(perA/100*210) + "," + Math.floor(perA/100*210) + "," + Math.floor(perA/100*210) + ",1.0)";

		var material =	{
			"display_name":display_name,
			"density":density,
			"fill_colors":[color, color],
			"fill_ratios":[0,1],
			"fill_colors_shadow":[color_shadow, color_shadow],
			"fill_ratios_shadow":[0, 1],
			"stroke_colors":[color_stroke, color_stroke],
			"stroke_ratios":[0, 1],
			"is_container":false
		}

		var o = new RectBlockShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, [1,0,0,0,0], this.view_sideAngle, this.view_topAngle, material_name, material);

		o.set_width_units(width);
		o.set_depth_units(depth);
		o.set_height_units(height);

		o.onPress = this.blockPressHandler.bind(this);
		this.addChild(o);
		o.orig_parent = this;
		o.depth_array_index = 0;
		return o;

	}
	// WORKING WITH OBJECTS
	p.placeBlock = function (o)
	{
		if (o != null)
		{
			o.x = this.width_px - (50 + 40);
			o.y = 2*this.TITLE_HEIGHT;
			this.displayed_block = o;
		}
	}

	/** When a block is pressed it should either be in the display area or on the volume viewer.
	 In the case of the volume viewer there are special rules that allow or do not allow it to be removed.
	 */
	p.blockPressHandler = function (evt)
	{
		if (this.dragging_object != null || !this.include_vv) return;
		this.dragging_object = evt.target;
		var offset = evt.target.globalToLocal(evt.stageX, evt.stageY);
		var source_parent = evt.target.parent;
		if (source_parent instanceof RectPrismViewer){
			// if this object is in the volume viewer remove it and place on this
			if (source_parent.clearBlock(evt.target)){
				this.addChild(evt.target);
				this.placeBlock(evt.target);
			} else {
				return;
			}
		} else
		{
			source_parent.addChild(evt.target);
			var lpoint = source_parent.globalToLocal(evt.stageX-offset.x, evt.stageY-offset.y);
			evt.target.x = lpoint.x;
			evt.target.y = lpoint.y;
		}

		evt.onMouseMove = function (ev)
		{
			var parent = this.target.parent;
			var lpoint, newX, newY;
			lpoint = parent.globalToLocal(ev.stageX-offset.x, ev.stageY-offset.y);
			newX = lpoint.x;
			newY = lpoint.y;
			// place within bounds of this object
			if (parent instanceof DataSpecsBuildingPanel)
			{
				if (newX < 0){this.target.x = 0;
				} else if (newX > parent.width_px){ this.target.x = parent.width_px;
				} else { this.target.x = newX;
				}

				if (newY < 0){this.target.y = 0;
				} else if (newY > parent.height_py){this.target.y = parent.height_py;
				} else {this.target.y = newY;
				}

				parent.vv.placeBlock(this.target, this.target.x, this.target.y);
			} else if (parent instanceof RectPrismViewer)
			{
				//this.target.x = newX;
				//this.target.y = newY;
				parent.placeBlock(this.target, newX, newY);
			}
			stage.needs_to_update = true;
		}
		evt.onMouseUp = function (ev)
		{
			var parent = this.target.parent;
			var o = this.target;
			builder.dragging_object = null;
			if (parent instanceof DataSpecsBuildingPanel)
			{
				// the source matters
				if (source_parent instanceof RectPrismViewer)
				{
					// if there is already an object in this spot we don't need to add a new one
					if (parent.displayed_block == null)
					{
						//parent.addChild(o);
						parent.placeBlock(o);
					} else
					{
						//parent.removeChild(o);
						parent.placeBlock(o);
					}
				} else if (source_parent instanceof DataSpecsBuildingPanel)
				{
					// place object back
					source_parent.placeBlock(o);
				}
			} else if (parent instanceof RectPrismViewer)
			{
				if (source_parent instanceof RectPrismViewer)
				{
					// move within volume viewer, is this move valid?
					if (parent.setBlock(o))
					{
						// yes, do nothing no change
					} else
					{
						// no, we need to add this object back to the DataSpecsBuildingPanel
						//if (GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]+1 >= GLOBAL_PARAMETERS.materials[o.material_name].block_max[o.depth_array_index]){
						//	var no = o.orig_parent.newBlock(o.mass, Math.cbrt(o.volume), Math.cbrt(o.volume), Math.cbrt(o.volume));
						//	o.orig_parent.placeBlock(no, o.depth_array_index);
						//}
					}
				} else if (source_parent instanceof DataSpecsBuildingPanel)
				{
					// move from outside to inside of volume viewer
					// is the move valid
					if (parent.setBlock(o))
					{
						// yes, update count and create a new object
						//var volume = o.width_units * o.depth_units * o.height_units;
						//var mass = o.material.density * volume;
						//no = o.orig_parent.newBlock(mass, Math.cbrt(volume), Math.cbrt(volume), Math.cbrt(volume));
						//o.orig_parent.placeBlock(no);
						o.orig_parent.displayed_block = null;
					} else
					{
						// not valid move, place back in DataSpecsBuildingPanel area
						o.redraw();
						o.orig_parent.addChild(o);
						o.orig_parent.placeBlock(o);
					}
				}
			}
		}
	}

	p.validObject = function (){
		if (this.include_vv) {
			return (this.vv.getNumChildren() > 3);
		} else if (this.displayed_block != null){
			return true;
		} else {
			return false;
		}
	}

	/** This function is used to end the creation of a specific block
	 *   In current version objects are moved to the bottom-left.
	 */
	p.saveObject = function()
	{
		// go through the 2d array of volume viewer and replace objects with their depth arrays
		var savedObject = {};
		var is_container = true;

		var blockArray;
		if (this.include_vv) {
			blockArray = this.vv.blockArray;
		} else if (this.displayed_block != null){
			blockArray = [this.displayed_block];
		} else {
			return null;
		}
		var rectPrismArrays = {}
		rectPrismArrays.materials = [];
		rectPrismArrays.heights = [];
		rectPrismArrays.widths = [];
		rectPrismArrays.depths = [];
		for (var i = blockArray.length-1; i >= 0; i--)
		{
			var index = blockArray.length - i - 1;
			rectPrismArrays.heights[index] = blockArray[i].height_units;
			rectPrismArrays.widths[index] = blockArray[i].width_units;
			rectPrismArrays.depths[index] = blockArray[i].depth_units;
			rectPrismArrays.materials[index] = blockArray[i].material;
			is_container = false;
		}
		savedObject.rectPrismArrays = rectPrismArrays;
		savedObject.unique_materials = [];
		savedObject.is_container = is_container;
		// some other parameters of the object we'll fill in later, when the object is put together
		savedObject.max_height = 0;
		savedObject.max_width = 0;
		savedObject.max_depth = 0;
		savedObject.mass = 0;
		savedObject.volume = 0;
		savedObject.density = 0;
		savedObject.material_volume = 0;
		savedObject.interior_volume = 0;
		savedObject.liquid_mass = 0;
		savedObject.liquid_volume = 0;
		savedObject.liquid_perc_volume = 0;
		savedObject.is_deletable = true;
		if (GLOBAL_PARAMETERS.ALLOW_REVISION){ savedObject.is_revisable = true; } else { savedObject.is_revisable = false; }
		if (GLOBAL_PARAMETERS.ALLOW_DUPLICATION){ savedObject.is_duplicable = true; } else { savedObject.is_duplicable = false; }

		return savedObject;
	}

	p.resetMaterials = function (){
		if (this.include_vv){
			this.vv.clearBlocks();
		} else if (this.displayed_block != null){
			this.removeChild(this.displayed_block);
			this.displayed_block = null
		}
	}

	p._tick = function(){this.Container_tick();}

	p.redraw = function(){stage.ready_to_update = true;}
	window.DataSpecsBuildingPanel = DataSpecsBuildingPanel;
}(window));

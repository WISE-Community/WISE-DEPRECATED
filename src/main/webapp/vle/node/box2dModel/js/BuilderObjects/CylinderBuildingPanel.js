(function (window)
{
	/** A space for displaying the names of materials, clickable/draggable materials
	and a grid space for putting them together */
	function CylinderBuildingPanel (width_px, height_px, wall_width_px)
	{
		this.initialize(width_px, height_px, wall_width_px);
	}
	var p = CylinderBuildingPanel.prototype = new createjs.Container();
	p.Container_initialize = CylinderBuildingPanel.prototype.initialize;
	p.Container_tick = p._tick;
	p.BACKGROUND_COLORS = ["rgba(250,250,250,1.0)","rgba(230,210,220,1.0)","rgba(245,230,240,1.0)", "rgba(240,225,235,1.0)"];
	p.BACKGROUND_RATIOS = [0, 0.5, 0.8, 1.0];	
	p.TEXT_COLOR = "rgba(0, 0, 200, 1.0)";
	p.TITLE_COLOR = "rgba(40,40,40,1.0";
	p.BLOCK_COUNT_COLOR = "rgba(255, 255, 255, 1.0)"
	p.TITLE_HEIGHT = 40;
	p.EXPORT_HEIGHT = 40;
	
	p.initialize = function(width_px, height_px, wall_width_px)
	{
		
		this.Container_initialize();
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
		this.materialsMenu = new MaterialsMenu(GLOBAL_PARAMETERS.materials_available, this.width_px/8, this.height_px-2*this.wall_width_px-this.TITLE_HEIGHT- this.EXPORT_HEIGHT-55);
		this.addChild(this.materialsMenu);
		this.materialsMenu.x = this.wall_width_px+1;
		this.materialsMenu.y = this.wall_width_px+this.TITLE_HEIGHT;

		
		this.vv = new CylinderViewer(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.MAX_WIDTH_UNITS, GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS, GLOBAL_PARAMETERS.MAX_DEPTH_UNITS);
		this.addChild(this.vv);
		this.vv.x = this.width_px - 150;
		this.vv.y = this.TITLE_HEIGHT + 100;
		
		this.dragging_object = null;

		var export_offsetL = 250;
		var export_offsetR = 0;
		this.block_space_width = this.width_px - this.materialsMenu.width_px - export_offsetL - wall_width_px;
		this.block_space_height = this.height_px; 

		//this.g.beginFill("rgba(225,225,255,1.0)");
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
		/*
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],0,this.height_px- this.EXPORT_HEIGHT,0,this.height_px-this.wall_width_px- this.EXPORT_HEIGHT);
		this.g.moveTo(this.width_px-export_offsetR,this.height_px- this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px,this.height_px- this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-this.wall_width_px,this.height_px-this.wall_width_px - this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-this.wall_width_px-export_offsetR, this.height_px-this.wall_width_px - this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetR,this.height_px- this.EXPORT_HEIGHT);
		this.g.endFill();
		this.g.beginLinearGradientFill(["rgba(100,100,100,1.0)","rgba(150,150,150,1.0)","rgba(200,200,200,1.0)","rgba(150,150,150,1.0)","rgba(100,100,100,1.0)"],[0,0.2,0.5,0.8,1.0],this.width_px-export_offsetR-this.wall_width_px,0,this.width_px-export_offsetR,0);
		this.g.moveTo(this.width_px-export_offsetR-this.wall_width_px,this.height_px-this.wall_width_px- this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetR,this.height_px - this.EXPORT_HEIGHT);
		this.g.lineTo(this.width_px-export_offsetR,this.height_px);
		this.g.lineTo(this.width_px-export_offsetR-this.wall_width_px,this.height_px-this.wall_width_px);
		this.g.lineTo(this.width_px-export_offsetR-this.wall_width_px,this.height_px-this.wall_width_px- this.EXPORT_HEIGHT);
		this.g.endFill();
		*/
				
		// titles
		var ltitle  = new createjs.Text("Materials", "20px Arial", this.TITLE_COLOR);
		this.addChild(ltitle);
		ltitle.x = 20;
		ltitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		var mtitle  = new createjs.Text("Shape your blocks", "20px Arial", this.TITLE_COLOR);
		this.addChild(mtitle);
		mtitle.x = (this.width_px/2 + 40)/2;
		mtitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		var rtitle  = new TextContainer("Drop your blocks here", "20px Arial", this.TITLE_COLOR);
		this.addChild(rtitle);
		rtitle.x = this.width_px/2 + (this.width_px/2 - 120)/2;
		rtitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		// a single text to show how many of this block can be applied
		var text = new TextContainer("Blocks remaining:", "20px Arial", this.BLOCK_COUNT_COLOR, this.materialsMenu.width_px, 50, this.TEXT_COLOR, this.TEXT_COLOR, 0, "left", "top", 4, 0);
		text.x = this.materialsMenu.x;
		text.y = this.height_px - text.height_px - this.wall_width_px- this.EXPORT_HEIGHT;
		this.addChild(text);
		this.blockText = new TextContainer("0", "20px Arial", this.BLOCK_COUNT_COLOR, this.block_space_width, 50, this.TEXT_COLOR, this.TEXT_COLOR, 0, "center", "center", -4, 0);
		this.blockText.x = this.materialsMenu.x + this.materialsMenu.width_px;
		this.blockText.y = this.height_px - text.height_px - this.wall_width_px- this.EXPORT_HEIGHT;
		this.addChild(this.blockText);

		this.displayed_block = null;
		var incPow = (GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS + "").split(".").length == 2 ? (GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS + "").split(".")[1].length : 0;
		var iWidth = GLOBAL_PARAMETERS.BUILDER_RANDOMIZE_INITIAL_SLIDER_VALUES ? Math.round(GLOBAL_PARAMETERS.MAX_WIDTH_UNITS * Math.random() / GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS) * GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS: GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-1;
		var iHeight = GLOBAL_PARAMETERS.BUILDER_RANDOMIZE_INITIAL_SLIDER_VALUES ? Math.round(GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS * Math.random() / GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS) * GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS: GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS-1;
		this.width_units = GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - iWidth;
		this.height_units = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS -iHeight;
		
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

			htmlText = '<div id="slider-diameter" style="width: 100px"></div>';
			$("#builder-button-holder").append(htmlText);
			$("#slider-diameter")
			    .slider({
                   orientation: "horizontal",
                   range: "max",
                   min: 0,
                   max: GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
                   value: iWidth,
                   step: GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS,
                   slide: function( event, ui ) {
                       $( "#amount" ).val( ui.value );
                       builder.update_diameter(GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-ui.value);
                   }
               }).hide();
		     $("#slider-diameter").load(function (){$( "#amount" ).val( $( "#slider-diameter" ).slider( "value" ) );});
			
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
                   slide: function( event, ui ) {
                       $( "#amount" ).val( ui.value );
                       builder.update_view_topAngle(ui.value);
                   }
               }).hide();
		    $("#slider-topAngle").load(function (){$( "#amount" ).val( $( "#slider-topAngle" ).slider( "value" ) );});
			
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
	               slide: function( event, ui ) {
	                   $( "#amount" ).val( ui.value );
	                    builder.update_view_sideAngle(90-ui.value);
	               }
	              }).hide();
		     $("#slider-sideAngle").load(function (){$( "#amount" ).val( $( "#slider-sideAngle" ).slider( "value" ) );});
			
			// setup buttons for volume viewer	
			var element = new createjs.DOMElement($("#make-object")[0]);
			this.addChild(element);
			element.x = this.width_px - export_offsetL/2 - $("#make-object").width()*3/4;
			element.y = this.height_px - this.EXPORT_HEIGHT - 2*$("#make-object").height();;
			element = new createjs.DOMElement($("#slider-diameter")[0]);
			this.addChild(element);
			element.x = this.materialsMenu.width_px + this.width_px/3 - 100;
			element.y = this.materialsMenu.y + this.materialsMenu.height_px - 4 * $("#slider-diameter").height();
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.diameterText = new createjs.Text("Diameter: "+ (GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - iWidth).toFixed(incPow) + " " + GLOBAL_PARAMETERS.LENGTH_UNITS, "20px Arial", this.textColor);
				this.diameterText.x = element.x + 50;
				this.diameterText.y = element.y + $("#slider-diameter").height() + 10;
				this.diameterText.lineWidth = 60;
				this.diameterText.textAlign = "center";
				this.addChild(this.diameterText);
			}
			element = new createjs.DOMElement($("#slider-height")[0]);
			this.addChild(element);
			element.x = this.materialsMenu.x + this.materialsMenu.width_px + this.block_space_width / 2 + 150;
			element.y = this.TITLE_HEIGHT*1.5;
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.heightText = new createjs.Text("Height: "+ (GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - iHeight).toFixed(incPow) + " " + GLOBAL_PARAMETERS.LENGTH_UNITS, "20px Arial", this.textColor);
				this.heightText.x = element.x + 10;
				this.heightText.y = element.y + $("#slider-height").height() + 10;
				this.heightText.lineWidth = 60;
				this.heightText.textAlign = "center";
				this.addChild(this.heightText);
			}
			element = new createjs.DOMElement($("#slider-sideAngle")[0]);
			this.addChild(element);
			element.x = this.width_px - 200;
			element.y = this.materialsMenu.y + this.materialsMenu.height_px - $("#slider-sideAngle").height() - 20;						
			element = new createjs.DOMElement($("#slider-topAngle")[0]);
			this.addChild(element);
			element.x = this.width_px - this.wall_width_px - 30;
			element.y = 80;
			$("#make-object").show();
			$("#slider-diameter").show();
			$("#slider-height").show();
			$("#slider-sideAngle").show();
			$("#slider-topAngle").show();

			this.reachedMax = false;
			this.drawMaterial(this.materialsMenu.current_material_name);

		}
		this.enabled = true;
		stage.ready_to_update = true; 
	}

	p.createObject = function()	{
		if (this.validObject())
		{
			var savedObject = this.saveObject();
			
			// save to global parameters
			if(GLOBAL_PARAMETERS.DEBUG) console.log(JSON.stringify(savedObject));
			labWorld.createObjectInWorld(savedObject, 0, -1, 0, "dynamic");
			this.resetMaterials();
		} else 
		{
			console.log("no object to make");
		}
	}

	/** Used to revise a model */
	p.restoreSavedObject = function (savedObject){
		if (typeof savedObject.cylinderArrays != "undefined"){
			this.resetMaterials();
			var diameters = savedObject.cylinderArrays.diameters;
			var heights = savedObject.cylinderArrays.heights;
			var materials = savedObject.cylinderArrays.materials;
			var y_offset = 0;
			for (var i=heights.length-1; i >= 0; i--){
				var material_name = materials[i];
				if (material_name != ""){
					var o = this.newBlock(material_name, diameters[i], heights[i]);
					// yes, update count and create a new object
					GLOBAL_PARAMETERS.materials[material_name].block_count[o.depth_array_index]++;
					this.updateCountText(material_name);
					// place object in viewer
					this.vv.placeBlockAtIndex(o, 1, GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS-1 - y_offset);
					this.vv.setBlock(o, true);
					y_offset += heights[i];
				}
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
			$("#slider-diameter").hide();
			$("#slider-height").hide();
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
			$("#slider-diameter").show();
			$("#slider-height").show();
			$("#slider-sideAngle").show();
			$("#slider-topAngle").show();
		}
	}

	////////////////////// CLASS SPECIFIC ////////////////////
	p.update_diameter = function (units){
		if (this.displayed_block != null){
			this.displayed_block.set_diameter_units(units);
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.diameterText.text = "Diameter: " + Math.round(10*units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
			}
		}	
		this.width_units = units;			
	}
	p.update_height = function (units){
		if (this.displayed_block != null){
			this.displayed_block.set_height_units(units);
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.heightText.text = "Height: " + Math.round(10*units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
			}
		}
		this.height_units = units;
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
		this.drawMaterial(this.materialsMenu.current_material_name);
	}

	p.drawMaterial = function (material_name)
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
			o = this.newBlock(material_name);
			this.placeBlock(o);	
			this.updateCountText(material_name);
			stage.ready_to_update = true;
		} else {
			if (!this.reachedMax){
				// we have reached the limit, display a textField to tell user to delete an object
				this.reachedMaxText  = new createjs.Text("Reached max number of objects. \nDelete an object to make more.", "20px Arial","#880000");
				this.addChild(this.reachedMaxText);
				this.reachedMaxText.x = this.materialsMenu.x + this.materialsMenu.width_px + 80;
				this.reachedMaxText.y = this.TITLE_HEIGHT + 30;
				this.reachedMax = true;
			}
		}
	}
	
	/** Create a new block with the given material name and index along the depth_arrays array */
	p.newBlock = function (material_name, diameter_override, height_override)
	{
		if (GLOBAL_PARAMETERS.materials[material_name].block_count[0] < GLOBAL_PARAMETERS.materials[material_name].block_max[0])
		{
			// if necessary re-randomize
			if (GLOBAL_PARAMETERS.BUILDER_RANDOMIZE_INITIAL_SLIDER_VALUES){
				var incPow = (GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS + "").split(".").length == 2 ? (GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS + "").split(".")[1].length : 0;
				var iWidth = Math.round(GLOBAL_PARAMETERS.MAX_WIDTH_UNITS * Math.random() / GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS) * GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS;
				var iHeight = Math.round(GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS * Math.random() / GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS) * GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS;
				this.width_units = GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - iWidth;
				this.height_units = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS -iHeight;
				$('#slider-diameter').slider('option','value',iWidth);
				$('#slider-height').slider('option','value',iHeight);
				if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
					this.diameterText.text = "Diameter: " + Math.round(10*this.width_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
					this.heightText.text = "Height: " + Math.round(10*this.height_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
				}
			} else {
				this.width_units = 1;
				this.height_units = 1;
				$('#slider-diameter').slider('option','value',GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - this.width_units);
				$('#slider-height').slider('option','value',GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS - this.height_units);
				if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
					this.diameterText.text = "Diameter: " + Math.round(10*this.width_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
					this.heightText.text = "Height: " + Math.round(10*this.height_units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
				}
			}
			
			var o = new CylinderShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE,[1,0,0,0,0], this.view_sideAngle, this.view_topAngle, material_name, GLOBAL_PARAMETERS.materials[material_name]);
			if (typeof diameter_override !== "undefined" && typeof height_override !== "undefined"){
				o.set_diameter_units(diameter_override);
				o.set_height_units(height_override);
			} else {
				o.set_diameter_units(this.width_units);
				o.set_height_units(this.height_units);
			}
			o.onPress = this.blockPressHandler.bind(this);
			this.addChild(o);
			o.orig_parent = this;
			o.depth_array_index = 0;
			this.updateCountText(material_name);
			
			return o;
		} else
		{
			this.displayed_block = null;
			this.updateCountText(material_name);
			return null;
		}
	}
	// WORKING WITH OBJECTS
	p.placeBlock = function (o)
	{
		if (o != null)
		{	
			o.x = this.materialsMenu.width_px + this.width_px/3;
			o.y = 2*this.TITLE_HEIGHT;
			this.displayed_block = o;	
		}
	}
	p.updateCountText = function (material_name)
	{
		if (this.materialsMenu.current_material_name == material_name){
			// update count
			this.blockText.setText(GLOBAL_PARAMETERS.materials[material_name].block_max[0] - GLOBAL_PARAMETERS.materials[material_name].block_count[0]);
		}
	}

	/** When a block is pressed it should either be in the display area or on the volume viewer.
		In the case of the volume viewer there are special rules that allow or do not allow it to be removed.
	*/
	p.blockPressHandler = function (evt)
	{
		if (this.dragging_object != null) return;
		this.dragging_object = evt.target;
		var offset = evt.target.globalToLocal(evt.stageX, evt.stageY);
		var source_parent = evt.target.parent;		
		if (source_parent instanceof CylinderViewer)
		{ // if this object is in the volume viewer remove it and place on this 	
			if (source_parent.clearBlock(evt.target)){
				this.addChild(evt.target);
				source_parent.placeBlock(evt.target);	
			} else {
				return;
			}			
		} else
		{ 
			source_parent.addChild(evt.target);
		}

		evt.onMouseMove = function (ev)
		{
			var parent = this.target.parent;
			var lpoint, newX, newY;
			lpoint = parent.globalToLocal(ev.stageX-offset.x, ev.stageY-offset.y);
			newX = lpoint.x;
			newY = lpoint.y;
			// place within bounds of this object
			if (parent instanceof CylinderBuildingPanel)
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
			} else if (parent instanceof CylinderViewer)	
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
			if (parent instanceof CylinderBuildingPanel)
			{
				// the source matters
				if (source_parent instanceof CylinderViewer)
				{
					// if this object is on the volume viewer, and already been replaced, then remove it from display
					GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]--;
					o.orig_parent.updateCountText(o.material_name);
					// if there is already an object in this spot we don't need to add a new one
					if (parent.displayed_block == null)
					{	
						//parent.addChild(o);
						parent.placeBlock(o);
					} else
					{
						parent.removeChild(o);
					}
				} else if (source_parent instanceof CylinderBuildingPanel)
				{
					// place object back
					source_parent.placeBlock(o);
				}
			} else if (parent instanceof CylinderViewer)	
			{
				if (source_parent instanceof CylinderViewer)
				{
					// move within volume viewer, is this move valid?
					if (parent.setBlock(o))
					{
						// yes, do nothing no change
					} else
					{
						// no, we need to add this object back to the CylinderBuildingPanel
						GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]--;
						o.orig_parent.updateCountText(o.material_name);
						if (GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]+1 >= GLOBAL_PARAMETERS.materials[o.material_name].block_max[o.depth_array_index]){
							var no = o.orig_parent.newBlock(o.material_name, o.depth_array_index);
							o.orig_parent.placeBlock(no, o.depth_array_index);
						}
					}
				} else if (source_parent instanceof CylinderBuildingPanel)
				{
					// move from outside to inside of volume viewer
					// is the move valid
					if (parent.setBlock(o))
					{
						// yes, update count and create a new object
						GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]++;
						o.orig_parent.updateCountText(o.material_name);
						no = o.orig_parent.newBlock(o.material_name);
						o.orig_parent.placeBlock(no);
						
					} else
					{
						// not valid move, place back in CylinderBuildingPanel area
						o.redraw();
						o.orig_parent.addChild(o);
						o.orig_parent.placeBlock(o);
					}					
				}
			}
		}
	}

	p.validObject = function ()
	{
		return (this.vv.getNumChildren() > 3);
	}

	/** This function is used to end the creation of a specific block 
	*   In current version objects are moved to the bottom-left.
	*/
	p.saveObject = function()
	{
		// go through the 2d array of volume viewer and replace objects with their depth arrays
		var savedObject = {};
		var is_container = true;

		var blockArray = this.vv.blockArray;
		var cylinderArrays = {}
		cylinderArrays.materials = [];
		cylinderArrays.heights = [];
		cylinderArrays.diameters = [];
		for (var i = blockArray.length-1; i >= 0; i--)
		{
			var index = blockArray.length - i - 1;
			cylinderArrays.heights[index] = blockArray[i].height_units;
			cylinderArrays.diameters[index] = blockArray[i].depth_units;
			//cylinderArrays.depths[index] = blockArray[i].depth_units;
			//cylinderArrays.widths[index] = blockArray[i].depth_units;
			cylinderArrays.materials[index] = blockArray[i].material_name;
			if (!GLOBAL_PARAMETERS.materials[blockArray[i].material_name].is_container) is_container = false;
		}
		savedObject.cylinderArrays = cylinderArrays;
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

		// clean up
		// reset counts of blocks, remove object on screen
		for (var key in GLOBAL_PARAMETERS.materials)
		{
			for (i = 0; i < GLOBAL_PARAMETERS.materials[key].block_max.length; i++)
			{
				GLOBAL_PARAMETERS.materials[key].block_count[i] = 0;
			}
		}
		this.drawMaterial(this.materialsMenu.current_material_name);
		this.vv.clearBlocks();	
	}

	p._tick = function(){this.Container_tick();}

	p.redraw = function(){stage.ready_to_update = true;}
	window.CylinderBuildingPanel = CylinderBuildingPanel;
}(window));

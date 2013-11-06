(function (window)
{
	/** A space for displaying the names of materials, clickable/draggable materials
	and a grid space for putting them together */
	function BeakerBuildingPanel (width_px, height_px, wall_width_px)
	{
		this.initialize(width_px, height_px, wall_width_px);
	}
	var p = BeakerBuildingPanel.prototype = new createjs.Container();
	p.Container_initialize = BeakerBuildingPanel.prototype.initialize;
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
		this.materialsMenu = new MaterialsMenu(GLOBAL_PARAMETERS.beaker_materials_available, this.width_px/8, this.height_px-2*this.wall_width_px-this.TITLE_HEIGHT- this.EXPORT_HEIGHT-55);
		this.addChild(this.materialsMenu);
		this.materialsMenu.x = this.wall_width_px+1;
		this.materialsMenu.y = this.wall_width_px+this.TITLE_HEIGHT;

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
		
				
		// titles
		var ltitle  = new createjs.Text("Materials", "20px Arial", this.TITLE_COLOR);
		this.addChild(ltitle);
		ltitle.x = 20;
		ltitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		var mtitle  = new createjs.Text("Size your beaker", "20px Arial", this.TITLE_COLOR);
		this.addChild(mtitle);
		mtitle.x = (this.width_px/2 + 100)/2;
		mtitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		var htmlText, htmlElement;
		var incPow = (GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS + "").split(".").length == 2 ? (GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS + "").split(".")[1].length : 0;
		var iWidth = GLOBAL_PARAMETERS.BUILDER_RANDOMIZE_INITIAL_SLIDER_VALUES ? Math.round(GLOBAL_PARAMETERS.MAX_WIDTH_UNITS * Math.random() / GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS) * GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS: GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-3;
		var iHeight = GLOBAL_PARAMETERS.BUILDER_RANDOMIZE_INITIAL_SLIDER_VALUES ? Math.round(GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS * Math.random() / GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS) * GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS: GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS-3;
		var iDepth = GLOBAL_PARAMETERS.BUILDER_RANDOMIZE_INITIAL_SLIDER_VALUES ? Math.round(GLOBAL_PARAMETERS.MAX_DEPTH_UNITS * Math.random() / GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS) * GLOBAL_PARAMETERS.BUILDER_SLIDER_INCREMENTS: GLOBAL_PARAMETERS.MAX_DEPTH_UNITS-3;
		this.width_units = GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - iWidth;
		this.height_units = GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS -iHeight;
		this.depth_units = GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - iDepth;
					    
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
                       builder.update_height(GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-ui.value);
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
                       builder.update_depth(GLOBAL_PARAMETERS.MAX_WIDTH_UNITS-ui.value);
                   }
               }).hide();
		     $("#slider-depth").load(function (){$( "#amount" ).val( $( "#slider-depth" ).slider( "value" ) );});
			
			/// liquid menu
			//htmlText = '<ul id="menu-liquid" style="width:100px"> <li><a href="#">Liquid</a><ul><li><a href="#">Water</a></li><li><a href="#">Oil</a></li></ul></li></ul>';
			//htmlText = '<ul id="menu-liquid" style="width:100px"><li><a href="#menu-liquid">Water</a></li><li><a href="#menu-liquid">Oil</a></li></ul>';
			/*
			$("#builder-button-holder").append(htmlText);
			$('#menu-liquid').menu({
				position: {my:"bottom left", at:"bottom+30"},
				select: function( event , ui) {
                       console.log(event, ui);
                   }
			}).hide();
			$('#menu-liquid').menu();
			*/
			

			// liquid height
			htmlText = '<div id="slider-lperc" style="height: 100px"></div>';
			$("#builder-button-holder").append(htmlText);
			$("#slider-lperc").slider({
			    orientation: "vertical",
			    range: "min",
			    min: 0,
			    max: 100,
			    value: 0,
			    step: 5,
			    slide: function( event, ui ) {
			      	$( "#amount" ).val( ui.value );
			       	builder.update_lperc(ui.value);
			    }
			 }).hide();
			$("#slider-lperc").load(function (){$( "#amount" ).val( $( "#slider-lperc" ).slider( "value" ) );});
			
			htmlText = '<select id="menu-liquid" style="width:100px position:absolute">';
			for (var l = 0; l < GLOBAL_PARAMETERS.liquids_available.length; l++){
				// made sure liquid is valid
				var liquid = GLOBAL_PARAMETERS.liquids_available[l];
				if (typeof GLOBAL_PARAMETERS.liquids[liquid] !== "undefined"){
					htmlText += '<option value="' + liquid + '">' + liquid +'</option>';
					//htmlText += '<option>' + liquid +'</option>';
				}
			}
			htmlText += '</select>';
			$("#builder-button-holder").append(htmlText);
			$("#menu-liquid").change(function(evt){builder.update_liquid(evt)});
			/*
			$("#menu-liquid").selectmenu(
			{
				change: function (event, ui){
					console.log(event, ui, builder);
					//builder.update_liquid(event);
				},
				click: function (event, ui){
					console.log(event, ui, builder);
				}
			})
*/
			// spout height
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SPOUT){
				htmlText = '<div id="slider-sperc" style="height: 100px"></div>';
				$("#builder-button-holder").append(htmlText);
				$("#slider-sperc").slider({
				    orientation: "vertical",
				    range: "min",
				    min: 0,
				    max: 95,
				    value: 0,
				    step: 5,
				    slide: function( event, ui ) {
				      	$( "#amount" ).val( ui.value );
				       	builder.update_sperc(ui.value);
				    }
				 }).hide();
				 $("#slider-sperc").load(function (){$( "#amount" ).val( $( "#slider-sperc" ).slider( "value" ) );});
			}		
			//this.drawMaterial(this.materialsMenu.current_material_name);
			this.material = GLOBAL_PARAMETERS.materials[this.materialsMenu.current_material_name];
			this.liquid = GLOBAL_PARAMETERS.liquids[typeof GLOBAL_PARAMETERS.liquids_available.length > 0 ? GLOBAL_PARAMETERS.liquids_available[0] : "Water"];
			this.liquid_volume_perc = 0;
			this.spilloff_volume_perc = 0;
						
			// setup buttons for volume viewer	
			var element = new createjs.DOMElement($("#make-object")[0]);
			this.addChild(element);
			element.x = this.width_px - export_offsetL/2 - $("#make-object").width()*3/4;
			element.y = this.height_px - this.EXPORT_HEIGHT - 2*$("#make-object").height();;
			element = new createjs.DOMElement($("#slider-width")[0]);
			this.addChild(element);
			element.x = this.materialsMenu.width_px + this.width_px/3 - 100;
			element.y = this.materialsMenu.y + this.materialsMenu.height_px - 4 * $("#slider-width").height();
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.widthText = new createjs.Text("Width: "+ (GLOBAL_PARAMETERS.MAX_WIDTH_UNITS - iWidth) + " " + GLOBAL_PARAMETERS.LENGTH_UNITS, "20px Arial", this.textColor);
				this.widthText.x = element.x + 50;
				this.widthText.y = element.y + $("#slider-width").height() + 10;
				this.widthText.lineWidth = 60;
				this.widthText.textAlign = "center";
				this.addChild(this.widthText);
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
			element = new createjs.DOMElement($("#slider-depth")[0]);
			this.addChild(element);
			element.x = this.materialsMenu.x + this.materialsMenu.width_px + 50;
			element.y = this.TITLE_HEIGHT*1.5;
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.depthText = new createjs.Text("Depth: " + (GLOBAL_PARAMETERS.MAX_DEPTH_UNITS - iDepth).toFixed(incPow) + " "+ GLOBAL_PARAMETERS.LENGTH_UNITS, "20px Arial", this.textColor);
				this.depthText.x = element.x + 10;
				this.depthText.y = element.y + $("#slider-depth").height() + 10;
				this.depthText.lineWidth = 60;
				this.depthText.textAlign = "center";
				this.addChild(this.depthText);
			}
			
			element = new createjs.DOMElement($("#menu-liquid")[0]);
			this.addChild(element);
			element.x = this.materialsMenu.x + this.materialsMenu.width_px + this.block_space_width / 2 + 230;
			element.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;
			
			element = new createjs.DOMElement($("#slider-lperc")[0]);
			this.addChild(element);
			element.x = this.materialsMenu.x + this.materialsMenu.width_px + this.block_space_width / 2 + 250;
			element.y = this.TITLE_HEIGHT*1.5;
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
				this.lpercText = new createjs.Text(this.liquid.display_name + ": 0 %", "20px Arial", this.textColor);
				this.lpercText.x = element.x + 10;
				this.lpercText.y = element.y + $("#slider-lperc").height() + 10;
				this.lpercText.lineWidth = 60;
				this.lpercText.textAlign = "center";
				this.addChild(this.lpercText);
			}
			if (GLOBAL_PARAMETERS.BUILDER_SHOW_SPOUT){
				element = new createjs.DOMElement($("#slider-sperc")[0]);
				this.addChild(element);
				element.x = this.materialsMenu.x + this.materialsMenu.width_px + this.block_space_width / 2 + 350;
				element.y = this.TITLE_HEIGHT*1.5;
				if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
					this.spercText = new createjs.Text("Spout at: 0 %", "20px Arial", this.textColor);
					this.spercText.x = element.x + 10;
					this.spercText.y = element.y + $("#slider-sperc").height() + 10;
					this.spercText.lineWidth = 80;
					this.spercText.textAlign = "center";
					this.addChild(this.spercText);
				}
			}

			this.beakerShape = null
			this.drawBeaker();
		
			$("#make-object").show();
			$("#slider-width").show();
			$("#slider-height").show();
			$("#slider-depth").show();
			//$("#menu-liquid").show();
			$("#slider-lperc").show();
			$("#slider-sperc").show();
		}
		this.enabled = true;
		stage.ready_to_update = true; 
	}

	p.createObject = function() 
	{
		if (this.validObject())
		{
			var savedObject = this.saveObject();
			
			// save to global parameters
			if(GLOBAL_PARAMETERS.DEBUG) console.log(JSON.stringify(savedObject));
			labWorld.createBeakerInWorld(savedObject, 0, -1, "dynamic");
		} else 
		{
			console.log("no object to make");
		}
	}

	/** Used to revise a model */
	p.restoreSavedObject = function (savedObject){
		if (typeof savedObject.modelType !== "undefined" && savedObject.modelType == "beaker"){
			this.width_units = savedObject.width_units;
			this.height_units = savedObject.height_units;
			this.depth_units = savedObject.depth_units;
			this.liquid_volume_perc = savedObject.init_liquid_volume_perc;
			this.spilloff_volume_perc = savedObject.spilloff_volume_perc
			var liquid = savedObject.liquid_name;
			this.liquid = GLOBAL_PARAMETERS.liquids[typeof GLOBAL_PARAMETERS.liquids[liquid] !== "undefined"? liquid : "Water"];
			var material = savedObject.material_name;
			this.material = GLOBAL_PARAMETERS.materials[typeof GLOBAL_PARAMETERS.materials[material] !== "undefined"? material : "Pyrex"];
			this.drawBeaker();
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
			$("#slider-lperc").hide();
			$("#slider-sperc").hide();
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
			$("#slider-lperc").show();
			$("#slider-sperc").show();
		}
	}

	////////////////////// CLASS SPECIFIC ////////////////////
	p.update_width = function (units){
		if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
			this.widthText.text = "Width: " + Math.round(10*units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
		}
		this.width_units = units;
		this.drawBeaker();			
	}
	p.update_height = function (units){
		if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
			this.heightText.text = "Height: " + Math.round(10*units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
		}
		this.height_units = units;
		this.drawBeaker();
	}
	p.update_depth = function (units){
		if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
			this.depthText.text = "Depth: " + Math.round(10*units)/10 + " " + GLOBAL_PARAMETERS.LENGTH_UNITS;
		}
		this.depth_units = units;
		this.drawBeaker();
	}
	p.update_liquid = function (evt){
		var liquid = evt.currentTarget.value;
		this.liquid = GLOBAL_PARAMETERS.liquids[liquid];
		if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
			this.lpercText.text = liquid + ": " + Math.round(this.liquid_volume_perc*100) + " %";
		}
		this.drawBeaker();
	}
	p.update_lperc = function (units){
		if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
			this.lpercText.text = this.liquid.display_name + ": " + Math.round(10*units)/10 + " %";
		}
		this.liquid_volume_perc = units/100;
		this.drawBeaker();
	}
	p.update_sperc = function (units){	 
		if (GLOBAL_PARAMETERS.BUILDER_SHOW_SLIDER_VALUES){
			this.spercText.text = "Spout at: " + Math.round(10*units)/10 + " %";
		}
		this.spilloff_volume_perc = units/100;
		this.drawBeaker();
	}

	p.buttonClickHandler  = function(material_name){
		this.material = GLOBAL_PARAMETERS.materials[material_name];
		this.drawBeaker();
	}

	p.drawBeaker = function (){
		if (this.beakerShape != null){
			this.removeChild(this.beakerShape.backContainer);
			this.removeChild(this.beakerShape.frontContainer)
		}
		// place a beaker skin in the viewer
		this.beakerShape =  new BeakerShape(this, this.width_units*GLOBAL_PARAMETERS.SCALE, this.height_units*GLOBAL_PARAMETERS.SCALE, this.depth_units*GLOBAL_PARAMETERS.SCALE, this.liquid_volume_perc, this.spilloff_volume_perc, false, {});
		this.addChild(this.beakerShape.backContainer);
		this.addChild(this.beakerShape.frontContainer);
		this.beakerShape.backContainer.x = this.materialsMenu.width_px + this.width_px/2 - 100  - this.beakerShape.width_px/2- this.beakerShape.width_from_depth/2;
		this.beakerShape.backContainer.y = 2 * this.TITLE_HEIGHT + this.beakerShape.height_px + this.beakerShape.height_from_depth;
		this.beakerShape.frontContainer.x = this.materialsMenu.width_px + this.width_px/2 - 100 - this.beakerShape.width_px/2 - this.beakerShape.width_from_depth/2;
		this.beakerShape.frontContainer.y = 2 * this.TITLE_HEIGHT + this.beakerShape.height_px + this.beakerShape.height_from_depth;
		this.beakerShape.redraw(this.liquid_volume_perc * this.height_units * GLOBAL_PARAMETERS.SCALE);
	}
	
	p.validObject = function (){
		return (true);
	}

	/** This function is used to end the creation of a specific block 
	*   In current version objects are moved to the bottom-left.
	*/
	p.saveObject = function(){
		// go through the 2d array of volume viewer and replace objects with their depth arrays
		var savedObject = {};
		savedObject.width_units = this.width_units;
		savedObject.height_units = this.height_units;
		savedObject.depth_units = this.depth_units;
		savedObject.init_liquid_volume_perc = this.liquid_volume_perc;
		savedObject.spilloff_volume_perc = this.spilloff_volume_perc;
		savedObject.liquid_name = this.liquid.display_name;
		savedObject.material_name = this.material.display_name;
		savedObject.modelType = "beaker";
		savedObject.type = "dynamic";
		return savedObject;
	}

	p._tick = function(){
		this.Container_tick();
	}

	p.redraw = function(){
		stage.ready_to_update = true;
	}

	window.BeakerBuildingPanel = BeakerBuildingPanel;
}(window));

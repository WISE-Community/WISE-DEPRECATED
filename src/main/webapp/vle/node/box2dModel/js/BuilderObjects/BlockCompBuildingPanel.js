(function (window)
{
	/** A space for displaying the names of materials, clickable/draggable materials
	and a grid space for putting them together */
	function BlockCompBuildingPanel (width_px, height_px, wall_width_px)
	{
		this.initialize(width_px, height_px, wall_width_px);
	}
	var p = BlockCompBuildingPanel.prototype = new createjs.Container();
	p.Container_initialize = BlockCompBuildingPanel.prototype.initialize;
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
		
		this.vv = new BlockCompViewer(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.MAX_WIDTH_UNITS, GLOBAL_PARAMETERS.MAX_HEIGHT_UNITS, GLOBAL_PARAMETERS.MAX_DEPTH_UNITS);
		this.addChild(this.vv);
		this.vv.x = this.width_px - 150;
		this.vv.y = this.TITLE_HEIGHT + 100;
		
		this.dragging_object = null;

		var export_offsetL = 250;
		var export_offsetR = 0;
		this.block_space_width = this.width_px - this.materialsMenu.width_px - export_offsetL - wall_width_px;
		this.block_space_height = this.height_px; 

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

		var mtitle  = new createjs.Text("Pick your blocks", "20px Arial", this.TITLE_COLOR);
		this.addChild(mtitle);
		mtitle.x = (this.width_px/2 - 60)/2;
		mtitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		var rtitle  = new TextContainer("Build your model", "20px Arial", this.TITLE_COLOR);
		this.addChild(rtitle);
		rtitle.x = this.width_px/2 + (this.width_px/2 - 60)/2;
		rtitle.y = this.wall_width_px + GLOBAL_PARAMETERS.PADDING;

		// a set of text to display the number of blocks that can be used
		this.blockTexts = [];
		var current_material_block_count = GLOBAL_PARAMETERS.materials[this.materialsMenu.current_material_name].block_max.length;	
		var text = new TextContainer("Blocks remaining:", "20px Arial", this.BLOCK_COUNT_COLOR, this.materialsMenu.width_px, 50, this.TEXT_COLOR, this.TEXT_COLOR, 0, "left", "top", 4, 0);
		text.x = this.materialsMenu.x;
		text.y = this.height_px - text.height_px - this.wall_width_px- this.EXPORT_HEIGHT;
		this.addChild(text);
		for (i = 0; i < current_material_block_count; i++)
		{
			text = new TextContainer("0", "20px Arial", this.BLOCK_COUNT_COLOR, this.block_space_width / current_material_block_count, 50, this.TEXT_COLOR, this.TEXT_COLOR, 0, "center", "center", -4, 0);
			text.x = this.materialsMenu.x + this.materialsMenu.width_px + i * this.block_space_width / current_material_block_count;
			text.y = this.height_px - text.height_px - this.wall_width_px- this.EXPORT_HEIGHT;
			this.addChild(text);
			this.blockTexts.push(text);
		}
		this.reachedMax = false;
		this.blocks = [];
		this.drawMaterial(this.materialsMenu.current_material_name);

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
	
		    htmlText = '<div id="slider-topAngle" style="height: 100px;"></div>';
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
			element.y = this.height_px - this.EXPORT_HEIGHT - 2*$("#make-object").height();
			element = new createjs.DOMElement($("#slider-sideAngle")[0]);
			this.addChild(element);
			element.x = this.width_px - 200;
			element.y =  this.materialsMenu.y + this.materialsMenu.height_px - $("#slider-sideAngle").height() - 20;					
			element = new createjs.DOMElement($("#slider-topAngle")[0]);
			this.addChild(element);
			element.x = this.width_px - this.wall_width_px - 30;
			element.y = 80;
			$("#make-object").show();
			$("#slider-sideAngle").show();
			$("#slider-topAngle").show();
		}

		this.enabled = true;
		stage.ready_to_update = true;
	}

	p.createObject = function() 
	{
		if (this.validObject())	{
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
		if (typeof savedObject.blockArray3d != "undefined"){
			this.resetMaterials();
			for (var i=0; i < savedObject.blockArray3d.length; i++){
				for (var j=0; j < savedObject.blockArray3d[0].length; j++){
					var depth_array = [];
					var material_name = "";
					for (var k=0; k < savedObject.blockArray3d[0][0].length; k++){
						depth_array[k] = savedObject.blockArray3d[i][j][k] != "" ? 1 : 0;
						if (material_name == "" && depth_array[k] == 1) material_name = savedObject.blockArray3d[i][j][k];
					}
					if (material_name != ""){
						// get index of block where depth arrays match
						var index = -1;
						for (var l=0; l < GLOBAL_PARAMETERS.materials[material_name].depth_arrays.length; l++){
							if (GLOBAL_PARAMETERS.materials[material_name].depth_arrays[l].join(",") == depth_array.join(",")){
								index = l; break;
							}
						}
						if (index >= 0){
							// create a new object to match the depth count and material
							var o = this.newBlock(material_name, index);
							GLOBAL_PARAMETERS.materials[material_name].block_count[index]++;
							this.updateCountText(material_name);
							// place object in viewer
							this.vv.placeBlockAtIndex(o, savedObject.blockArray3d.length - i - 1, j);
							this.vv.setBlock(o, true);
						}
					}				
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
		}	
	}

	/** Reverses disableWithText function */
	p.enable = function (){
		if (!this.enabled){
			this.removeChild(this.screen);
			this.removeChild(this.screenText);
			this.enabled = true;
		}
	}

	////////////////////// CLASS SPECIFIC ////////////////////
	p.update_view_sideAngle = function (degrees)
	{
		this.view_sideAngle = degrees * Math.PI / 180;
		for (var i = 0; i < this.blocks.length; i++) 
		{
			if (this.blocks[i] != null) this.blocks[i].update_view_sideAngle(this.view_sideAngle);
		}
		this.vv.update_view_sideAngle(this.view_sideAngle);
	}

	p.update_view_topAngle = function (degrees)
	{
		this.view_topAngle = degrees * Math.PI / 180;
		for (var i = 0; i < this.blocks.length; i++) 
		{
			if (this.blocks[i] != null) this.blocks[i].update_view_topAngle(this.view_topAngle);
		}
		this.vv.update_view_topAngle(this.view_topAngle);
	}

	/** User clicked on a tab along the materials menu */
	p.buttonClickHandler  = function(material_name)
	{
		this.drawMaterial(material_name);
	}

	p.drawCurrentMaterial = function (){
		this.drawMaterial(this.materialsMenu.current_material_name);
	}

	/** Place blocks in the "pick your block" area */
	p.drawMaterial = function (material_name){
		var o;
		// if blocks array is not empty remove these from display
		if (this.blocks.length != 0)
		{
			for (i = 0; i < this.blocks.length; i++)
			{
				this.removeChild(this.blocks[i])
			}
			this.blocks = new Array();
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
			for (var i = 0; i < GLOBAL_PARAMETERS.materials[material_name].depth_arrays.length; i++)
			{
				o = this.newBlock(material_name, i);
				this.placeBlock(o, i);			
			}
			this.updateCountText(material_name);
			stage.ready_to_update = true;
		} else {
			if (!this.reachedMax){
				// we have reached the limit, display a textField to tell user to delete an object
				this.reachedMaxText  = new createjs.Text("Reached max number of objects. \nDelete an object to make more.", "20px Arial","#880000");
				this.addChild(this.reachedMaxText);
				this.reachedMaxText.x = this.materialsMenu.x + this.materialsMenu.width_px + 50;
				this.reachedMaxText.y = this.height_px/2;
				this.reachedMax = true;
			}
		}
	}

	/** Create a new block with the given material name and index along the depth_arrays array */
	p.newBlock = function (material_name, depth_arrays_index)
	{
		if (GLOBAL_PARAMETERS.materials[material_name].block_count[depth_arrays_index] < GLOBAL_PARAMETERS.materials[material_name].block_max[depth_arrays_index])
		{
			var o = new RectBlockShape(GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE,GLOBAL_PARAMETERS.materials[material_name].depth_arrays[depth_arrays_index], this.view_sideAngle, this.view_topAngle, material_name, GLOBAL_PARAMETERS.materials[material_name]);
			o.onPress = this.blockPressHandler.bind(this);
			this.addChild(o);
			o.orig_parent = this;
			o.depth_array_index = depth_arrays_index;
			this.updateCountText(material_name);
			return o;
		} else
		{
			this.blocks[depth_arrays_index] = null;
			this.updateCountText(material_name);
			return null;
		}
	}
	// WORKING WITH OBJECTS
	p.placeBlock = function (o, depth_arrays_index)
	{
		if (o != null)
		{	
			var material_block_count = GLOBAL_PARAMETERS.materials[o.material_name].block_max.length;
			o.x = this.materialsMenu.x + this.materialsMenu.width_px + (depth_arrays_index+1) * this.block_space_width/material_block_count;
			o.y = depth_arrays_index * this.height_px/2/material_block_count + 2 * GLOBAL_PARAMETERS.PADDING + this.TITLE_HEIGHT;	
			this.blocks[depth_arrays_index] = o;
		}
	}
	p.updateCountText = function (material_name)
	{
		if (this.materialsMenu.current_material_name == material_name){
			// update count
			for (i = 0; i < GLOBAL_PARAMETERS.materials[material_name].block_max.length; i++)
			{
				this.blockTexts[i].setText(GLOBAL_PARAMETERS.materials[material_name].block_max[i] - GLOBAL_PARAMETERS.materials[material_name].block_count[i]);
			}
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
		if (source_parent instanceof BlockCompViewer)
		{ // if this object is in the volume viewer remove it and place on this 	
			if (source_parent.clearBlock(evt.target)){
				this.addChild(evt.target);
				source_parent.placeBlock(evt.target);	
			} else {
				return;
			}			
		} else
		{ 
			var i = source_parent.blocks.indexOf(evt.target);
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
			if (parent instanceof BlockCompBuildingPanel)
			{
				if (newX < 0){this.target.x = 0;
				} else if (newX > parent.width_px){ this.target.x = parent.width_px;
				} else { this.target.x = newX;
				}

				if (newY < 0){this.target.y = 0;
				} else if (newY > parent.height_py){this.target.y = parent.height_py;
				} else {this.target.y = newY;
				} 

				parent.vv.placeBlock(this.target);
			} else if (parent instanceof BlockCompViewer)	
			{
				this.target.x = newX;
				this.target.y = newY;
				parent.placeBlock(this.target);
			}
			stage.needs_to_update = true;
		}
		evt.onMouseUp = function (ev)
		{
			var parent = this.target.parent;
			var o = this.target; 
			builder.dragging_object = null;
			if (parent instanceof BlockCompBuildingPanel)
			{
				// the source matters
				if (source_parent instanceof BlockCompViewer)
				{
					// if this object is on the volume viewer, and already been replaced, then remove it from display
					GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]--;
					o.orig_parent.updateCountText(o.material_name);
					// if there is already an object in this spot we don't need to add a new one
					if (parent.blocks[o.depth_array_index] == null)
					{	
						//parent.addChild(o);
						parent.placeBlock(o, o.depth_array_index);
					} else
					{
						parent.removeChild(o);
					}
				} else if (source_parent instanceof BlockCompBuildingPanel)
				{
					// place object back
					source_parent.placeBlock(o, o.depth_array_index);
				}
			} else if (parent instanceof BlockCompViewer)	
			{
				if (source_parent instanceof BlockCompViewer)
				{
					// move within volume viewer, is this move valid?
					if (parent.setBlock(o))
					{
						// yes, do nothing no change
					} else
					{
						// no, we need to add this object back to the BlockCompBuildingPanel
						GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]--;
						o.orig_parent.updateCountText(o.material_name);
						if (GLOBAL_PARAMETERS.materials[o.material_name].block_count[o.depth_array_index]+1 >= GLOBAL_PARAMETERS.materials[o.material_name].block_max[o.depth_array_index]){
							var no = o.orig_parent.newBlock(o.material_name, o.depth_array_index);
							o.orig_parent.placeBlock(no, o.depth_array_index);
						}
					}
				} else if (source_parent instanceof BlockCompBuildingPanel)
				{
					// move from outside to inside of volume viewer
					// is the move valid
					if (parent.setBlock(o))
					{
						// yes, update count and create a new object
						i = o.orig_parent.blocks.indexOf(o);
						if (i >= 0)
						{
							GLOBAL_PARAMETERS.materials[o.material_name].block_count[i]++;
							o.orig_parent.updateCountText(o.material_name);
							var no = o.orig_parent.newBlock(o.material_name, i);
							o.orig_parent.placeBlock(no, i);
						}
					} else
					{
						// not valid move, place back in BlockCompBuildingPanel area
						o.redraw();
						o.orig_parent.addChild(o);
						o.orig_parent.placeBlock(o, o.depth_array_index);
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
		var blockArray3d = [];
		var i_rev, i, j, k, block_count=0;
		var is_container = true;

		var blockArray2d = this.vv.blockArray2d;
		for (i = 0; i < blockArray2d.length; i++){
			i_rev = blockArray2d.length - 1 - i;
			blockArray3d[i_rev] = [];
			for (j = 0; j < blockArray2d[i].length; j++){
				if (blockArray2d[i][j] != null){
					blockArray3d[i_rev][j] = [];
					for (k = 0; k < blockArray2d[i][j].depth_array.length; k++){
						if (blockArray2d[i][j].depth_array[k] == 1)	{
							blockArray3d[i_rev][j][k] = blockArray2d[i][j].material_name;
							if (!GLOBAL_PARAMETERS.materials[blockArray2d[i][j].material_name].is_container) is_container = false;
						} else 	{
							blockArray3d[i_rev][j][k] = "";
						}
					}
					block_count++;
				} else {
					blockArray3d[i_rev][j] = ["", "", "", "", ""];
				}
			}
		}
		savedObject.blockArray3d = blockArray3d;
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
	window.BlockCompBuildingPanel = BlockCompBuildingPanel;
}(window));

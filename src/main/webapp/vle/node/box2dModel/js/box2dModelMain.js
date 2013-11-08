var b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
        , b2World = Box2D.Dynamics.b2World
        , b2MassData = Box2D.Collision.Shapes.b2MassData
        , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
        , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
        , b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef
        , b2FrictionJointDef = Box2D.Dynamics.Joints.b2FrictionJointDef
        , b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
        , b2ContactListener = Box2D.Dynamics.b2ContactListener
        , b2BuoyancyController = Box2D.Dynamics.Controllers.b2BuoyancyController;
        ;

// GLOBAL VARIABLES, with default values
var b2m;
var GLOBAL_PARAMETERS;
var canvas;
var stage;
var imgstage;
var builder;
var labWorld;
		
function init(wiseData, previousModels, forceDensityValue, tableData){
	if (typeof canvas !== "undefined" && canvas != null){
		// this means we are not working with a clear canvas
		var ctx = canvas.getContext('2d');
		ctx.save();
		// Use the identity matrix while clearing the canvas
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.restore();
	}
			
	GLOBAL_PARAMETERS = {};
	GLOBAL_PARAMETERS["DEBUG"] = false;
	GLOBAL_PARAMETERS["DEBUG_DEEP"] =false;
	GLOBAL_PARAMETERS["LAB_HEIGHT"] =560;
	GLOBAL_PARAMETERS["INCLUDE_BUILDER"] =false;
	GLOBAL_PARAMETERS["INCLUDE_CYLINDER_BUILDER"] = false;
	GLOBAL_PARAMETERS["INCLUDE_RECTPRISM_BUILDER"] = false;
	GLOBAL_PARAMETERS["INCLUDE_BEAKER_BUILDER"] = false;
	GLOBAL_PARAMETERS["INCLUDE_LIBRARY"] = true;
	GLOBAL_PARAMETERS["ALLOW_REVISION"] = true;
	GLOBAL_PARAMETERS["BUILDER_SHOW_SLIDER_VALUES"] = true;
	GLOBAL_PARAMETERS["BUILDER_RANDOMIZE_INITIAL_SLIDER_VALUES"] = false;
	GLOBAL_PARAMETERS["BUILDER_SLIDER_INCREMENTS"] =1.0;	
	GLOBAL_PARAMETERS["BUILDER_SHOW_SPOUT"] = false;
	GLOBAL_PARAMETERS["INCLUDE_EMPTY"] =false;
	GLOBAL_PARAMETERS["INCLUDE_BALANCE"] =false;
	GLOBAL_PARAMETERS["INCLUDE_SCALE"] =true;
	GLOBAL_PARAMETERS["INCLUDE_BEAKER"] =true;
	GLOBAL_PARAMETERS["SHOW_UNITS_ON_SCALE"] =false;
	GLOBAL_PARAMETERS["SHOW_UNITS_ON_BEAKER"] =true;
	GLOBAL_PARAMETERS["SCALE"] = 30;
	GLOBAL_PARAMETERS["IMAGE_SCALE"] = 0.5;
	GLOBAL_PARAMETERS["LENGTH_UNITS"] = "cm";
	GLOBAL_PARAMETERS["VOLUME_UNITS"] = "ml";
	GLOBAL_PARAMETERS["MASS_UNITS"] = "g";
	GLOBAL_PARAMETERS["SCALE_UNITS"] = "N";
	GLOBAL_PARAMETERS["MAX_WIDTH_UNITS"] = 5;
	GLOBAL_PARAMETERS["MAX_HEIGHT_UNITS"] = 5;
	GLOBAL_PARAMETERS["MAX_DEPTH_UNITS"] = 5;
	GLOBAL_PARAMETERS["PADDING"] = 10;
	GLOBAL_PARAMETERS["view_sideAngle"] = 10*Math.PI/180;
	GLOBAL_PARAMETERS["view_topAngle"] = 20*Math.PI/180;
	GLOBAL_PARAMETERS["liquid_volume_perc"] = 0.50;
	GLOBAL_PARAMETERS["tableData"] = [
		[{"text":"id", "uneditable":true}],
		[{"text":"Materials", "uneditable":true}],
		[{"text":"Total_Mass", "uneditable":true}],
		[{"text":"Total_Volume", "uneditable":true}],
		[{"text":"Widths", "uneditable":true}],
		[{"text":"Heights", "uneditable":true}],
		[{"text":"Depths", "uneditable":true}],
		[{"text":"Width", "uneditable":true}],
		[{"text":"Height", "uneditable":true}],
		[{"text":"Depth", "uneditable":true}],
		[{"text":"Total_Density", "uneditable":true}],
		[{"text":"Material_Mass", "uneditable":true}],
		[{"text":"Material_Volume", "uneditable":true}],
		[{"text":"Material_Density", "uneditable":true}],
		[{"text":"Open_Mass", "uneditable":true}],
		[{"text":"Open_Volume", "uneditable":true}],
		[{"text":"Open_Density", "uneditable":true}],
		[{"text":"Tested_on_Scale", "uneditable":true}],
		[{"text":"Tested_on_Balance", "uneditable":true}]];
	GLOBAL_PARAMETERS["objects_made"] = [];		
	GLOBAL_PARAMETERS["total_beakers_made"] = 0;
	GLOBAL_PARAMETERS["total_scales_made"] = 0;
	GLOBAL_PARAMETERS["total_balances_made"] = 0;
	GLOBAL_PARAMETERS["materials_available"] = [];
	GLOBAL_PARAMETERS["images"] = [];
	GLOBAL_PARAMETERS["liquids_available"] = ["Water"];
	GLOBAL_PARAMETERS["beaker_materials_available"] = ["Pyrex"];
	GLOBAL_PARAMETERS["materials"] ={};
	GLOBAL_PARAMETERS["premades_available"] = [];
	GLOBAL_PARAMETERS["premades_in_world"] = [];
	GLOBAL_PARAMETERS["beakers_in_world"] = [];
	GLOBAL_PARAMETERS["premades"] = {};
	GLOBAL_PARAMETERS["MAX_OBJECTS_IN_WORLD"] = 20;
	GLOBAL_PARAMETERS["feedbackEvents"] = [];

	$(document).ready( function (){
		GLOBAL_PARAMETERS.STAGE_WIDTH = $("#b2canvas").width();
		//GLOBAL_PARAMETERS.LAB_HEIGHT = $("#b2canvas").height();
		// load from WISE
		var obj;
		if (typeof wiseData !== "undefined"){
			for (var key in wiseData){ 
				obj = wiseData[key];
				if (typeof obj === "object" && typeof obj.branching !== "undefined"){
					if (typeof obj.branching.branchingFunction !== "undefined"){
						var fun = obj.branching.branchingFunction;
						if (fun == "mod" && typeof obj.branching.branchingFunctionParams !== "undefined" && obj.branching.branchingFunctionParams.length == 2){
							if (obj.branching.branchingFunctionParams[0] == "WISE_WORKGROUP_ID"){
								var wg = box2dModel.view.getUserAndClassInfo().getWorkgroupId();
								if (typeof wg !== "undefined" && !isNaN(wg)){
									var map = wg % obj.branching.branchingFunctionParams[1].length;
									GLOBAL_PARAMETERS[key] = obj.branching.branchingFunctionParams[1][map];
								} else if (typeof obj.branching.default !== "undefined"){
									GLOBAL_PARAMETERS[key] = obj.branching.default;
								}	
							} else if (typeof obj.branching.default !== "undefined"){
								GLOBAL_PARAMETERS[key] = obj.branching.default;
							}		
						} else if (typeof obj.branching.default !== "undefined"){
							GLOBAL_PARAMETERS[key] = obj.branching.default;
						}	
					}
				} else {
					GLOBAL_PARAMETERS[key] = obj;
				}
			}	
		} else {
			$.getJSON('box2dModelTemplate.b2m', function(data) {
				for (var key in data) { 
					if (typeof obj !== "object" || typeof obj.branching === "undefined")
						GLOBAL_PARAMETERS[key] = data[key]; 
				}
			});
		}
	// can't manually change stage height, only lab height
		GLOBAL_PARAMETERS.STAGE_HEIGHT = GLOBAL_PARAMETERS.LAB_HEIGHT;
		
		if (GLOBAL_PARAMETERS.INCLUDE_BUILDER || GLOBAL_PARAMETERS.INCLUDE_RECTPRISM_BUILDER || GLOBAL_PARAMETERS.INCLUDE_CYLINDER_BUILDER || GLOBAL_PARAMETERS.INCLUDE_BEAKER_BUILDER){
			 GLOBAL_PARAMETERS.BUILDER_HEIGHT = GLOBAL_PARAMETERS.SCALE * 3 * 5;
		} else {
			 GLOBAL_PARAMETERS.BUILDER_HEIGHT = 0;
		}
		GLOBAL_PARAMETERS.STAGE_HEIGHT = GLOBAL_PARAMETERS.BUILDER_HEIGHT + GLOBAL_PARAMETERS.STAGE_HEIGHT;
		// did we change size?
		if (GLOBAL_PARAMETERS.STAGE_WIDTH != $("#b2canvas").width()) $("#b2canvas").attr('width',GLOBAL_PARAMETERS.STAGE_WIDTH);	
		if (GLOBAL_PARAMETERS.STAGE_HEIGHT != $("#b2canvas").height()) $("#b2canvas").attr('height',GLOBAL_PARAMETERS.STAGE_HEIGHT);	
			
		// are wed debugging if so, append a debug canvase
		if (!GLOBAL_PARAMETERS.DEBUG){
			//$("#canvas-holder").append('<canvas width='+GLOBAL_PARAMETERS.STAGE_WIDTH+' height='+GLOBAL_PARAMETERS.STAGE_HEIGHT+' id="debugcanvas" ></canvas>');
			$("#debugcanvas").remove();
		}

		if (typeof GLOBAL_PARAMETERS.view_sideAngle_degrees != "undefined") GLOBAL_PARAMETERS.view_sideAngle = GLOBAL_PARAMETERS.view_sideAngle_degrees * Math.PI / 180;
		if (typeof GLOBAL_PARAMETERS.view_topAngle_degrees != "undefined") GLOBAL_PARAMETERS.view_topAngle = GLOBAL_PARAMETERS.view_topAngle_degrees * Math.PI / 180;
		GLOBAL_PARAMETERS.MATERIAL_COUNT = GLOBAL_PARAMETERS.materials_available.length;
				
		GLOBAL_PARAMETERS.TESTER_HEIGHT = GLOBAL_PARAMETERS.STAGE_HEIGHT - GLOBAL_PARAMETERS.BUILDER_HEIGHT;
		GLOBAL_PARAMETERS.ALLOW_REVISION = GLOBAL_PARAMETERS.INCLUDE_BUILDER || GLOBAL_PARAMETERS.INCLUDE_CYLINDER_BUILDER || GLOBAL_PARAMETERS.INCLUDE_RECTPRISM_BUILDER ? GLOBAL_PARAMETERS.ALLOW_REVISION : false; 
		GLOBAL_PARAMETERS.INCLUDE_LIBRARY = !GLOBAL_PARAMETERS.INCLUDE_BUILDER && !GLOBAL_PARAMETERS.INCLUDE_CYLINDER_BUILDER && !GLOBAL_PARAMETERS.INCLUDE_RECTPRISM_BUILDER ? GLOBAL_PARAMETERS.INCLUDE_LIBRARY : true; 
		if (typeof forceDensityValue != "undefined" && forceDensityValue > 0){
			for (var key in GLOBAL_PARAMETERS.materials){
				GLOBAL_PARAMETERS.materials[key].density = forceDensityValue;
			}
		}
		if(typeof GLOBAL_PARAMETERS.materials["Pyrex"] === "undefined"){
			GLOBAL_PARAMETERS.materials["Pyrex"] = 
			{
				"display_name":"Pyrex",
				"density":2.21,
				"fill_colors":["rgba(127,127,127,0.4)", "rgba(200,200,200,0.4)","rgba(225,225,255,0.4)", "rgba(200,200,200,0.4)", "rgba(127,127,127,0.4)"],
				"fill_ratios":[0, 0.1, 0.4, 0.9, 1],
				"fill_colors_shadow":["rgba(127,127,127,0.4)", "rgba(200,200,200,0.4)","rgba(225,225,255,0.4)", "rgba(200,200,200,0.4)", "rgba(127,127,127,0.4)"],
				"fill_ratios_shadow":[0, 0.1, 0.4, 0.9, 1],
				"stroke_colors":["rgba(56,56,56,0.4)", "rgba(56,56,56,0.4)"],
				"stroke_ratios":[0, 1],
				"depth_arrays":[[1, 1, 1, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]],
				"block_max":[10, 10, 10],
				"block_count":[0, 0, 0],
				"is_container":true,
				"container_thickness":1				
			};	
		}
		if (typeof GLOBAL_PARAMETERS.liquids["Water"] === "undefined"){
			GLOBAL_PARAMETERS.liquids["Water"] =
			{
				"display_name":"Water",
				"density":1.0,
				"fill_color":"rgba(180,180,255,0.4)",
				"stroke_color": "rgba(160,160,255,0.8)",
				"fill_color_container":"rgba(100,160,255,1.0)",
				"stroke_color_container":"rgba(50,80,255,1.0)"
			}
		}
		if (GLOBAL_PARAMETERS.beakers_in_world.length > 0 || GLOBAL_PARAMETERS.INCLUDE_BEAKER){
			GLOBAL_PARAMETERS.INCLUDE_BEAKER = true;
			if (GLOBAL_PARAMETERS.beakers_in_world.length == 0){
				var beaker_in_world = {
					"x":5,
					"y":0,
					"material_name":"Pyrex",
					"liquid_name":"Water",
					"width_units":5,
					"height_units":8,
					"depth_units":5,
					"init_liquid_volume_perc":0.75,
					"spilloff_volume_perc": 0,
					"type": "dynamic"
				};
				GLOBAL_PARAMETERS.beakers_in_world.push(beaker_in_world);
			}
		}
		// copy over liquids available to liquids in world
		GLOBAL_PARAMETERS.liquids_in_world = [];
		//for (var key in ) 
		for (var i = 0; i < GLOBAL_PARAMETERS.beakers_in_world.length; i++){
			var liquid_name = typeof GLOBAL_PARAMETERS.beakers_in_world[i].liquid !== "undefined" ? GLOBAL_PARAMETERS.beakers_in_world[i].liquid : (typeof GLOBAL_PARAMETERS.beakers_in_world[i].liquid_name !== "undefined" ? GLOBAL_PARAMETERS.beakers_in_world[i].liquid_name : "");
			if (liquid_name.length > 0 && GLOBAL_PARAMETERS.liquids_in_world.indexOf(liquid_name) == -1) 
				GLOBAL_PARAMETERS.liquids_in_world.push(liquid_name);
		}

		//if (GLOBAL_PARAMETERS.INCLUDE_BEAKER_BUILDER){
			for (var i = 0; i < GLOBAL_PARAMETERS.liquids_available.length; i++){
				var liquid_name = GLOBAL_PARAMETERS.liquids_available[i];
				if (GLOBAL_PARAMETERS.liquids_in_world.indexOf(liquid_name) == -1) 	
					GLOBAL_PARAMETERS.liquids_in_world.push(liquid_name);
			}
		//}
		// use old table or update new one?
		if (tableData != null){
			GLOBAL_PARAMETERS.tableData = tableData;
		} else {
			for (var i = 0; i < GLOBAL_PARAMETERS.liquids_in_world.length; i++){
				var liquid_name = GLOBAL_PARAMETERS.liquids_in_world[i];
				GLOBAL_PARAMETERS.tableData.push([{"text":"Volume_Displaced_in_"+liquid_name, "uneditable":true}]);
				GLOBAL_PARAMETERS.tableData.push([{"text":"Mass_Displaced_in_"+liquid_name, "uneditable":true}]);
				GLOBAL_PARAMETERS.tableData.push([{"text":"Sink_in_"+liquid_name, "uneditable":true}]);
				GLOBAL_PARAMETERS.tableData.push([{"text":"Percent_Above_"+liquid_name, "uneditable":true}]),
				GLOBAL_PARAMETERS.tableData.push([{"text":"Percent_Submerged_in_"+liquid_name, "uneditable":true}]);
				GLOBAL_PARAMETERS.tableData.push([{"text":"Tested_in_"+liquid_name, "uneditable":true}]);
			}
		}	
		start(previousModels);
	});
}

function start(previousModels){
	canvas = document.getElementById("b2canvas");
	stage = new createjs.Stage(canvas);
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver();
	createjs.Touch.enable(stage);
	stage.needs_to_update = false;
	imgstage = new createjs.Stage(document.getElementById("imgcanvas"));
	// setup builder
	var labWorld_y;
	var wall_width_units = 0.3;
	if (GLOBAL_PARAMETERS.INCLUDE_BUILDER)
	{
		builder = new BlockCompBuildingPanel(GLOBAL_PARAMETERS.STAGE_WIDTH, GLOBAL_PARAMETERS.BUILDER_HEIGHT, wall_width_units*GLOBAL_PARAMETERS.SCALE);
		labWorld_y = builder.height_px;	
	} else if (GLOBAL_PARAMETERS.INCLUDE_CYLINDER_BUILDER){
		builder = new CylinderBuildingPanel(GLOBAL_PARAMETERS.STAGE_WIDTH, GLOBAL_PARAMETERS.BUILDER_HEIGHT, wall_width_units*GLOBAL_PARAMETERS.SCALE);
		labWorld_y = builder.height_px;	
	} else if (GLOBAL_PARAMETERS.INCLUDE_RECTPRISM_BUILDER){
		builder = new RectPrismBuildingPanel(GLOBAL_PARAMETERS.STAGE_WIDTH, GLOBAL_PARAMETERS.BUILDER_HEIGHT, wall_width_units*GLOBAL_PARAMETERS.SCALE);
		labWorld_y = builder.height_px;	
	} else if (GLOBAL_PARAMETERS.INCLUDE_BEAKER_BUILDER){
		builder = new BeakerBuildingPanel(GLOBAL_PARAMETERS.STAGE_WIDTH, GLOBAL_PARAMETERS.BUILDER_HEIGHT, wall_width_units*GLOBAL_PARAMETERS.SCALE);
		labWorld_y = builder.height_px;	
	} else {
		labWorld_y = 0;	
	}
	var world_width_units = GLOBAL_PARAMETERS.STAGE_WIDTH / GLOBAL_PARAMETERS.SCALE;
	var world_height_units = GLOBAL_PARAMETERS.TESTER_HEIGHT / GLOBAL_PARAMETERS.SCALE
	var labWorld = this.labWorld = new Labb2World(world_width_units , world_height_units , 7, wall_width_units, 0, labWorld_y / GLOBAL_PARAMETERS.SCALE) ;
	stage.addChild(labWorld);
	labWorld.y = labWorld_y;
	if (builder != null) stage.addChild(builder);

	// make scale or balance
	if (GLOBAL_PARAMETERS.INCLUDE_SCALE) {
		labWorld.createScaleInWorld(world_width_units * 2/3, 0, 5, "dynamic");
	} else if (GLOBAL_PARAMETERS.INCLUDE_BALANCE) {
		labWorld.createBalanceInWorld(world_width_units * 2/3, 0, 10, 5, "dynamic");
	}	
	// make beakers
	for (var i = 0; i < GLOBAL_PARAMETERS.beakers_in_world.length; i++){
		var premade = GLOBAL_PARAMETERS.beakers_in_world[i];
		var px = typeof premade.x !== "undefined" ? premade.x : 0;
		var py = typeof premade.y !== "undefined" ? premade.y : 0; 
		var ptype = typeof premade.type !== "undefined" ? premade.type : "dynamic"; 
		// rename some old variables
		if (typeof premade.width_units === "undefined" && typeof premade.width !== "undefined") premade.width_units = premade.width;
		if (typeof premade.height_units === "undefined" && typeof premade.height !== "undefined") premade.height_units = premade.height;
		if (typeof premade.depth_units === "undefined" && typeof premade.depth !== "undefined") premade.depth_units = premade.depth;
		if (typeof premade.material_name === "undefined" && typeof premade.material !== "undefined") premade.material_name = premade.material;
		if (typeof premade.liquid_name === "undefined" && typeof premade.liquid !== "undefined") premade.liquid_name = premade.liquid;
		// add liquid in the beaker to the list of liquids in the world
		if (GLOBAL_PARAMETERS.liquids_in_world.indexOf(premade.liquid_name) == -1){
			GLOBAL_PARAMETERS.liquids_in_world.push(premade.liquid_name);
		}

		labWorld.createBeakerInWorld(premade, px, py, ptype);
	}

	// make premades in world
	if (GLOBAL_PARAMETERS.premades_available.length > 0){
		for (var i = 0; i < GLOBAL_PARAMETERS.premades_available.length; i++){
			var premade_in_world = {};
			premade_in_world.premade = GLOBAL_PARAMETERS.premades_available[i];
			premade_in_world.x = 0;
			premade_in_world.y = -1;
			if (GLOBAL_PARAMETERS.premades_in_world.indexOf(premade_in_world) == -1)
				GLOBAL_PARAMETERS.premades_in_world.push(premade_in_world);
		}		
	}
	
	for (i = 0; i < GLOBAL_PARAMETERS.premades_in_world.length; i++){
		var premade = GLOBAL_PARAMETERS.premades_in_world[i];
		if(typeof premade.premade !== "undefined" && GLOBAL_PARAMETERS.premades[premade.premade] !== "undefined"){
			var px = typeof premade.x !== "undefined" ? premade.x : 0;
			var py = typeof premade.y !== "undefined" ? premade.y : -1; 
			var protation = typeof premade.rotation !== "undefined" ? premade.rotation : 0; 
			var ptype = typeof premade.type !== "undefined" ? premade.type : "dynamic"; 
			if (GLOBAL_PARAMETERS.objects_made.indexOf(GLOBAL_PARAMETERS.premades[premade.premade]) == -1 && typeof GLOBAL_PARAMETERS.premades[premade.premade] !== "undefined")
				labWorld.createObjectInWorld(GLOBAL_PARAMETERS.premades[premade.premade], px, py, protation, ptype);
		} 
	}

	// custom models built on previous visits (ones not already here)
	for (i = 0; i < previousModels.length; i++){
		if (GLOBAL_PARAMETERS.objects_made.indexOf(previousModels[i]) == -1){
			labWorld.createObjectInWorld(previousModels[i], 0, -1, 0, "dynamic");
		}				
	}

	createjs.Ticker.setFPS(24);
	createjs.Ticker.addListener(window);
}		

function tick() { 
	if (labWorld != null) labWorld._tick();
	if (stage != null && stage.needs_to_update)	stage.update();
}






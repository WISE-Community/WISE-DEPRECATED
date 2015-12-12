(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depthArray: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var RectPrismCompShape = function(unit_width_px, unit_height_px, unit_depth_px, max_depth_units, savedObject)
	{
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, max_depth_units, savedObject);
	} 
	var p = RectPrismCompShape.prototype = new createjs.Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, max_depth_units, savedObject)
	{
		this.Container_initialize();
		this.mouseEnabled = true;
		this.placed = false;
		this.is_blockComp = false;
		this.is_rectPrism = false;
		this.is_rectPrism = true;
		this.is_container = savedObject.is_container;
		this.unit_width_px = unit_width_px;
		this.unit_height_px = unit_height_px;
		this.unit_depth_px = unit_depth_px;
		this.unit_volume = this.unit_width_px/GLOBAL_PARAMETERS.SCALE * this.unit_depth_px/GLOBAL_PARAMETERS.SCALE * this.unit_height_px/GLOBAL_PARAMETERS.SCALE;
		this.savedObject = savedObject;
		this.rectPrismArrays = savedObject.rectPrismArrays;
		this.widths = this.rectPrismArrays.widths;
		this.depths = this.rectPrismArrays.depths;
		this.heights = this.rectPrismArrays.heights;
		this.materials = this.rectPrismArrays.materials;
		this.width_units = Math.max.apply(null, this.widths);
		this.depth_units = Math.max.apply(null, this.depths);
		this.max_depth_units = Math.max(this.depth_units, max_depth_units);
		this.height_units = this.heights.reduce(function(a, b) { return a + b; }, 0);  
		this.view_sideAngle = GLOBAL_PARAMETERS.view_sideAngle;
		this.view_topAngle = GLOBAL_PARAMETERS.view_topAngle;
		this.is_mystery = typeof savedObject.is_mystery != "undefined" ? savedObject.is_mystery : false; 
		this.reveal_mystery = false;
		this.DEBUG = false;
		// composition vars
		var g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);
		this.addChild(this.shape);
		this.shape.x = (this.max_depth_units - this.depth_units)/2 * this.unit_width_px * Math.sin(GLOBAL_PARAMETERS.view_sideAngle);
		

		this.update_array2d();
		// draw figure
		this.redraw();

		this.width_px_left = 0;
		this.width_px_right = this.width_units * this.unit_width_px;
		this.height_px_above = this.depth_units*Math.sin(this.view_topAngle) * this.unit_depth_px;
		this.height_px_below = this.height_units * this.unit_height_px;
		this.width_px = this.width_px_right + this.width_px_left;
		this.height_px = this.height_px_below + this.height_px_above;

		if (this.DEBUG)
		{
			var dg = new createjs.Graphics();
			var dshape = new createjs.Shape(dg);
			this.addChild(dshape);
			dg.beginFill("rgba(255,0,0,0.5)");
			dg.drawCircle(0, 0, 2);
			dg.endFill();
		}
		//console.log("after", this.shape.x, this.shape.y);
	}

	p._tick = function ()
	{
		this.Container_tick();
	}

////////////////////// UTILITY FUNCTIONS FOR THE ARRAY ///////////////////
	
	p.update_array2d = function ()
	{
		if (typeof(this.array2d) == "undefined")
		{
			var array2d = this.array2d = new Array();
			var o_mass = 0, o_materialSpaces = 0, o_exteriorSpaces = 0, o_interiorSpaces = 0, o_protectedSpaces = 0;
			
			// go through rows and columns adding up mass in depths
			var i, d, height_to = 0;
			var unique_materials = [];
			var max_width = 0, max_height = 0, max_depth = 0;
			for (i = 0; i < this.heights.length; i++){
				var mass = 0, materialSpaces = 0, exteriorSpaces = 0, interiorSpaces = 0, protectedSpaces = 0;
				if (this.widths[i] > max_width) max_width = this.widths[i];
				max_height += this.heights[i];
				if (this.depths[i] > max_depth) max_depth = this.depths[i];
				materialSpaces = this.widths[i] * this.depths[i] * this.heights[i];
				var material = typeof this.materials[i] === "string" ? GLOBAL_PARAMETERS.materials[this.materials[i]] : this.materials[i];
				var material_name = material.display_name;
				if (unique_materials.indexOf(material_name) == -1) unique_materials.push(material_name);	
				mass = material.density * materialSpaces;
				o_mass += mass;
				o_materialSpaces += materialSpaces;
				o_exteriorSpaces += exteriorSpaces;
				o_interiorSpaces += interiorSpaces;
				o_protectedSpaces += protectedSpaces;
			
				array2d[i] = {"mass":mass, "x_offset":(this.width_units-this.widths[i])/2, "y_offset":height_to,"width":this.widths[i], "height":this.heights[i], "depth":this.depths[i], "area":this.heights[i]*this.widths[i], "totalSpaces":materialSpaces, "materialSpaces":materialSpaces, "exteriorSpaces":exteriorSpaces, "interiorSpaces":interiorSpaces, "protectedSpaces":protectedSpaces};
				height_to += this.heights[i];
			} 
			this.savedObject.unique_materials = unique_materials;
			this.savedObject.widths = this.widths;
			this.savedObject.heights = this.heights;
			this.savedObject.depths = this.depths;			
			this.savedObject.max_height = max_height;
			this.savedObject.max_width = max_width;
			this.savedObject.max_depth = max_depth;
			this.savedObject.mass = o_mass;
			this.savedObject.volume = o_materialSpaces;
			this.savedObject.total_volume = o_materialSpaces + o_protectedSpaces + o_interiorSpaces;
			this.savedObject.enclosed_volume = o_materialSpaces + o_protectedSpaces;
			this.savedObject.density = this.savedObject.mass/ this.savedObject.volume;
			this.savedObject.material_volume = o_materialSpaces;
			this.savedObject.interior_volume = o_interiorSpaces;
			this.savedObject.liquid_mass = 0;
			this.savedObject.liquid_volume = 0;
			this.savedObject.liquid_perc_volume = 0;

			return this.array2d;
			
		} else
		{
			return this.array2d;
		}	
	}

	
////////////////////// DRAWING STUFF /////////////////////////
	p.redraw = function(r, percentSubmerged2d)
	{
		var rotation;
		if (typeof(r) != "undefined") {rotation = r} else {rotation = 0}
		rotation = (rotation + 360 * 10) % 360;
		//this.rotation = 330;
		//rotation = 330;	
		var btr_x, btr_y, btl_x, btl_y, bbr_x, bbr_y, bbl_x, bbl_y, ftr_x, ftr_y, ftl_x, ftl_y, fbr_x, fbr_y, fbl_x, fbl_y;
		var mtr_x, mtr_y, mtl_x, mtl_y, mbr_x, mbr_y, mbl_x, mbl_y;
		var g = this.g;
		g.clear();
		var i, row, ik, i_shift, j_shift;
		this.tr_x = NaN;
		this.tr_y = NaN;


		var view_sideAngle = this.view_sideAngle * Math.cos(rotation * Math.PI / 180) - this.view_topAngle * Math.sin(rotation * Math.PI / 180);
		var view_topAngle = this.view_topAngle * Math.cos(rotation * Math.PI / 180) +  this.view_sideAngle * Math.sin(rotation * Math.PI / 180);
		
		var rowarr = []; index = 0; var row; var index = 0;
		if (view_topAngle < 0){
			for (row = 0; row < this.heights.length; row++){rowarr[index] = row; index++}
		} else{
			for (row = this.heights.length-1; row >= 0; row--){rowarr[index] = row; index++}
		}
		
		if (this.is_mystery && !this.reveal_mystery){
			g.beginStroke("rgba(0,0,0,1.0)");
			g.beginFill("rgba(60,60,60, 1.0)");
			var tl = new createjs.Point(0, -(this.height_units - (this.lowest_row - this.highest_row) - 1) * GLOBAL_PARAMETERS.SCALE)
			g.drawRect(tl.x, tl.y, this.width_units * GLOBAL_PARAMETERS.SCALE, this.height_units * GLOBAL_PARAMETERS.SCALE);
			g.endFill();
			g.endStroke();
			g.setStrokeStyle(4);
			g.beginStroke("rgba(255,255,255,1.0)");
			g.arc(2.5*GLOBAL_PARAMETERS.SCALE, tl.y+2*GLOBAL_PARAMETERS.SCALE, GLOBAL_PARAMETERS.SCALE, Math.PI, Math.PI/2, false); 
			g.lineTo(2.5*GLOBAL_PARAMETERS.SCALE, tl.y+3.5*GLOBAL_PARAMETERS.SCALE);
			g.moveTo(2.5*GLOBAL_PARAMETERS.SCALE, tl.y+4.25*GLOBAL_PARAMETERS.SCALE);
			g.drawCircle(2.5*GLOBAL_PARAMETERS.SCALE, tl.y+4.55*GLOBAL_PARAMETERS.SCALE, 0.25*GLOBAL_PARAMETERS.SCALE);
			g.endStroke();
		} else {
			for (i = 0; i < rowarr.length; i++)
			{
				row = rowarr[i];

				var material = typeof this.materials[row] === "string" ? GLOBAL_PARAMETERS.materials[this.materials[row]] : this.materials[row];
				var width = this.widths[row];
				var depth = this.depths[row];
				var height = this.heights[row];
				var height_to = this.heights.slice(0, row).reduce(function(a, b) { return a + b; }, 0);  
				ftl_x = (this.width_units - width)/2 * this.unit_width_px;
				ftl_y = height_to * this.unit_height_px - (this.max_depth_units - depth)/2 * this.unit_depth_px*Math.sin(view_topAngle);
				fbl_x = ftl_x;
				fbl_y = ftl_y + height * this.unit_height_px;
				ftr_x = (this.width_units - (this.width_units - width)/2) * this.unit_width_px;
				ftr_y = ftl_y;
				fbr_x = ftr_x;
				fbr_y = fbl_y;

				btl_x = ftl_x + depth*this.unit_depth_px*Math.sin(view_sideAngle);
				btl_y = ftl_y - depth*this.unit_depth_px*Math.sin(view_topAngle);
				bbl_x = btl_x;
				bbl_y = btl_y + height * this.unit_height_px;
				btr_x = ftr_x + depth*this.unit_depth_px*Math.sin(view_sideAngle);
				btr_y = btl_y;
				bbr_x = btr_x;
				bbr_y = bbl_y;

				// setup overall corners
				if (isNaN(this.tr_x) || isNaN(this.tr_y))
				{ 
					this.tr_x = btr_x; this.tr_y = btr_y;
				}
				// continuously override bottom left
				this.bl_x = fbl_x; this.bl_y = fbl_y;
				// draw front
				g.setStrokeStyle(1);
				g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftl_x, ftl_y, btr_x, ftl_y);
				g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, btr_x, ftl_y);
				g.moveTo(fbl_x, fbl_y).lineTo(ftl_x,ftl_y).lineTo(ftr_x,ftr_y).lineTo(fbr_x,fbr_y).lineTo(fbl_x,fbl_y);
				g.endStroke();
				g.endFill();	

				var ang = Math.atan((btl_y-ftl_y)/(btl_x-ftl_x))+ Math.PI/2;
				var cang = ang > Math.PI/2 ? ang - Math.PI : ang;
				
				if (view_topAngle < 0)
				{
					// draw bottom
					g.setStrokeStyle(1);
					g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, fbl_x, fbl_y, fbl_x+width*this.unit_width_px*Math.cos(cang), fbl_y+width*this.unit_width_px*Math.sin(ang));
					g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, fbl_x, fbl_y, fbl_x+width*this.unit_width_px*Math.cos(cang), fbl_y+width*this.unit_width_px*Math.sin(ang));
					g.moveTo(fbl_x, fbl_y).lineTo(bbl_x,bbl_y).lineTo(bbr_x,bbr_y).lineTo(fbr_x,fbr_y).lineTo(fbl_x,fbl_y);
					g.endStroke();
					g.endFill();
				} else
				{
					// draw top
					//console.log(Math.round(180/Math.PI*view_sideAngle),Math.round(180/Math.PI*ang),ftl_x, ftl_y, ftl_x+width*this.unit_width_px*Math.cos(cang), ftl_y+width*this.unit_width_px*Math.sin(ang));
					g.setStrokeStyle(1);
					g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftl_x, ftl_y, ftl_x+width*this.unit_width_px*Math.cos(cang), ftl_y+width*this.unit_width_px*Math.sin(ang));
					g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, ftl_x+width*this.unit_width_px*Math.cos(cang), ftl_y+width*this.unit_width_px*Math.sin(ang));
					g.moveTo(ftl_x, ftl_y).lineTo(btl_x,btl_y).lineTo(btr_x,btr_y).lineTo(ftr_x,ftr_y).lineTo(ftl_x,ftl_y);
					g.endStroke();
					g.endFill();					
				}

				if (view_sideAngle < 0){
					// draw left
					g.setStrokeStyle(1);
					g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftl_x, ftl_y, btl_x, ftl_y);
					g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, btl_x, ftl_y);
					g.moveTo(btl_x, btl_y).lineTo(ftl_x,ftl_y).lineTo(fbl_x,fbl_y).lineTo(bbl_x,bbl_y).lineTo(btl_x,btl_y);
					g.endStroke();
					g.endFill();
				} else {
					// draw right
					g.setStrokeStyle(1);
					g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftr_x, ftr_y, btr_x, ftr_y);
					g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftr_x, ftr_y, btr_x, ftr_y);
					g.moveTo(btr_x, btr_y).lineTo(ftr_x,ftr_y).lineTo(fbr_x,fbr_y).lineTo(bbr_x,bbr_y).lineTo(btr_x,btr_y);
					g.endStroke();
					g.endFill();
				}
				var percentSubmerged = typeof percentSubmerged2d == "undefined" ? 0 : percentSubmerged2d[row];
				// draw liquid in front
				if (percentSubmerged > 0 && percentSubmerged < 1 && typeof this.parent.containedWithin.liquid !== "undefined"){
					var liquid = this.parent.containedWithin.liquid;
					var angle = rotation / 180 * Math.PI;
					var pheightSubmerged;
					if (angle % (Math.PI/2) != 0){
						var divisor = Math.sin(angle)/Math.cos(angle) + Math.cos(angle)/Math.sin(angle);
						pheightSubmerged = Math.sqrt(2*percentSubmerged / divisor);								
					} else {
						pheightSubmerged = percentSubmerged;
					}

					//console.log("percentSubmerged", percentSubmerged, "pheightSubmerged", pheightSubmerged, "divisor", divisor);
					// four points in parent's coordinates.
					var g_ftl = this.localToLocal(ftl_x, ftl_y, this.parent.parent);
					var g_ftr = this.localToLocal(ftr_x, ftr_y, this.parent.parent);
					var g_fbl = this.localToLocal(fbl_x, fbl_y, this.parent.parent);
					var g_fbr = this.localToLocal(fbr_x, fbr_y, this.parent.parent);
					var g_miny = Math.min(g_ftl.y, g_ftr.y, g_fbl.y, g_fbr.y);
					var g_maxy = Math.max(g_ftl.y, g_ftr.y, g_fbl.y, g_fbr.y);
					var g_minx = Math.min(g_ftl.x, g_ftr.x, g_fbl.x, g_fbr.x);
					var g_maxx = Math.max(g_ftl.x, g_ftr.x, g_fbl.x, g_fbr.x);
					// associate back with local points
					//var lmin = this.parent.parent.localToLocal(g_minx, g_miny, this);
					var bl = this.parent.parent.localToLocal(g_minx, g_maxy, this);
					var br = this.parent.parent.localToLocal(g_maxx, g_maxy, this);
					var tl = this.parent.parent.localToLocal(g_minx, g_maxy - (g_maxy - g_miny)*percentSubmerged, this);
					var tr = this.parent.parent.localToLocal(g_maxx, g_maxy - (g_maxy - g_miny)*percentSubmerged, this);
					g.setStrokeStyle(0);
					//g.beginStroke(liquid.stroke_color);
					g.beginFill(liquid.fill_color);
					g.moveTo(tl.x, tl.y);
					g.lineTo(tr.x, tr.y);
					g.lineTo(br.x, br.y);
					g.lineTo(bl.x, bl.y);
					g.lineTo(tl.x, tl.y);
					//g.endStroke();
					g.endFill();

					g.setStrokeStyle(2);
					g.beginStroke(liquid.stroke_color);
					g.moveTo(tl.x, tl.y);
					g.lineTo(tr.x, tr.y);
					g.endStroke();
				}
			}
		}
		this.shape.x = (this.max_depth_units - this.depth_units)/2 * this.unit_width_px * Math.sin(view_sideAngle);
		/*
		if(this.DEBUG) {
			g.beginFill("rgba(0,0,0,1.0)");
			g.drawCircle(0,0, 2);
			g.endFill();
		}
		*/
		if (stage != null) stage.needs_to_update = true;
	}

	window.RectPrismCompShape = RectPrismCompShape;
}(window));
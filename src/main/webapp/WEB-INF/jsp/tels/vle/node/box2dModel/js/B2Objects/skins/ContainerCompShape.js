(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depthArray: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var ContainerCompShape = function(unit_width_px, unit_height_px, unit_depth_px, savedObject)
	{
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, savedObject);
	} 
	var p = ContainerCompShape.prototype = new createjs.Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, savedObject)
	{
		this.Container_initialize();
		this.mouseEnabled = true;
		this.is_blockComp = true;
		this.is_cylinder = false
		this.is_rectPrism = false;
		this.placed = false;
		this.liquid_unit_width_px = unit_width_px;
		this.liquid_unit_height_px = unit_height_px;
		this.liquid_unit_depth_px = unit_depth_px;
		this.liquid_unit_volume = this.liquid_unit_width_px/GLOBAL_PARAMETERS.SCALE * this.liquid_unit_depth_px/GLOBAL_PARAMETERS.SCALE * this.liquid_unit_height_px/GLOBAL_PARAMETERS.SCALE;
		this.unit_width_px = unit_width_px;
		this.unit_height_px = unit_height_px;
		this.unit_depth_px = unit_depth_px;
		this.unit_volume = this.unit_width_px/GLOBAL_PARAMETERS.SCALE * this.unit_depth_px/GLOBAL_PARAMETERS.SCALE * this.unit_height_px/GLOBAL_PARAMETERS.SCALE;
		this.savedObject = savedObject;
		this.blockArray3d = savedObject.blockArray3d;
		this.is_container = savedObject.is_container;
		this.width_units = this.blockArray3d.length;
		this.height_units = this.blockArray3d[0].length;
		this.depth_units = this.blockArray3d[0][0].length;
		this.view_sideAngle = GLOBAL_PARAMETERS.view_sideAngle;
		this.view_topAngle = GLOBAL_PARAMETERS.view_topAngle;
	
		this.liquid_name = GLOBAL_PARAMETERS.liquid_available;
		this.liquid = GLOBAL_PARAMETERS.liquids[GLOBAL_PARAMETERS.liquid_available];
		this.material_name = "";
		// since this can only be one type of material, find out what it is
		for (var i = 0; i < this.blockArray3d.length; i++)
		{
			for (var j = 0; j < this.blockArray3d[i].length; j++)
			{
				for (var k = 0; k < this.blockArray3d[i][j].length; k++)
				{
					if (this.blockArray3d[i][j][k] != "")
					{
						this.material_name = this.blockArray3d[i][j][k];
						break;
					}
				}
				if (this.material_name != "") break;	
			}	
			if (this.material_name != "") break;	
		}
		this.material = GLOBAL_PARAMETERS.materials[this.material_name];

		// create an array to account for the number of cubes on each height level
		// on the current height level how many cubes are there
		this.cube_count_at_y_index = [];
		this.filled_volume = 0;
		this.cube_count = 0;
		for (var j = 0; j < this.blockArray3d[0].length; j++)
		{
			this.cube_count_at_y_index[j] = 0;
			for (var i = 0; i < this.blockArray3d.length; i++)
			{
				for (var k = 0; k < this.blockArray3d[i][j].length; k++)
				{
					if (this.blockArray3d[i][j][k] != ""){this.cube_count++; this.cube_count_at_y_index[j]++;}
				}
			}
		}
		this.available_volume = this.cube_count * this.liquid_unit_volume;
		this.current_volume_on_y_index = 0;
		this.isFull = false;

		// composition vars
		var g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);
		this.addChild(this.shape);
		this.getHighestRow();
		this.getLowestRow();
		this.getLeftmostColumn();
		this.getRightmostColumn();
		this.update_array2d();

		// for filling up
		this.x_index = this.getLeftmostColumn();
		this.y_index = this.getLowestRow();
		if (GLOBAL_PARAMETERS.fill_spilloff_depth_from_middle) {this.z_index = Math.floor(this.depth_units/2);}
		else {this.z_index = this.depth_units-1;}

		// draw figure
		this.redraw();

		this.width_px_left = 0;
		this.width_px_right = (this.rightmostColumn + 1 - this.leftmost_column) * this.unit_width_px;
		this.height_px_above = this.blockArray3d[1][1].length*Math.sin(this.view_topAngle) * this.unit_depth_px;
		this.height_px_below = (this.lowest_row+1 - this.highest_row) * this.unit_height_px;
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
	}

	p._tick = function ()
	{
		this.Container_tick();
	}

////////////////////// UTILITY FUNCTIONS FOR THE ARRAY ///////////////////
	p.getLowestRow = function ()
	{
		if (typeof(this.lowest_row) == "undefined")	
		{
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (j = this.blockArray3d[1].length-1; j >= 0; j--)
			{
				for (i = 0; i < this.blockArray3d.length; i++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.lowest_row = j;
							return this.lowest_row ;
						}
					}
				}
			}
			this.lowest_row = -1;
			return this.lowest_row;
		} else
		{
			return this.lowest_row; 
		}
	}
	p.getHighestRow = function ()
	{
		if ( typeof(this.highest_row) == "undefined")
		{	
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (j = 0; j < this.blockArray3d[1].length; j++)
			{
				for (i = 0; i < this.blockArray3d.length; i++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.highest_row = j;
							return this.highest_row;
						}
					}
				}
			}
			this.highest_row = -1;
			return this.highest_row;
		} else
		{
			return this.highest_row;
		}
	}
	p.getLeftmostColumn = function ()
	{
		if (typeof(this.leftmost_column) == "undefined")
		{	
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (i = 0; i < this.blockArray3d.length; i++)
			{
				for (j = 0; j < this.blockArray3d[1].length; j++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.leftmost_column = i;
							return this.leftmost_column;
						}
					}
				}
			}
			this.leftmost_column = -1
			return this.leftmost_column;
		} else 
		{
			return this.leftmost_column;
		}
	}
	p.getRightmostColumn = function ()
	{
		if (typeof(this.rightmostColumn) == "undefined")
		{
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (i = this.blockArray3d.length-1; i >= 0; i--)
			{
				for (j = 0; j < this.blockArray3d[1].length; j++)
				{
					for (k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						if (this.blockArray3d[i][j][k] != "")
						{
							this.rightmostColumn = i;
							return this.rightmostColumn;
						}
					}
				}
			}
			this.rightmostColumn = -1;
			return this.rightmostColumn;
		} else
		{
			return this.rightmostColumn;
		}
	}

	p.getDeepestIndex = function ()
	{
		if (typeof(this.deepestColumn) == "undefined")
		{
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (k = this.blockArray3d[0][0].length - 1; k >= 0; k--)
			{
				for (i = this.blockArray3d.length-1; i >= 0; i--)
				{
					for (j = 0; j < this.blockArray3d[0].length; j++)
					{
					
						if (this.blockArray3d[i][j][k] != "")
						{
							this.deepestColumn = k;
							return this.deepestColumn;
						}
					}
				}
			}
			this.deepestColumn = -1;
			return this.deepestColumn;
		} else
		{
			return this.deepestColumn;
		}
	}

	p.getShallowistIndex = function ()
	{
		if (typeof(this.shallowistColumn) == "undefined")
		{
			// start at bottom and find the lowest row with any blocks in it
			var i, j, k
			
			for (k = 0; k < this.blockArray3d[0][0].length; k++)
			{
				for (i = this.blockArray3d.length-1; i >= 0; i--)
				{
					for (j = 0; j < this.blockArray3d[0].length; j++)
					{
					
						if (this.blockArray3d[i][j][k] != "")
						{
							this.shallowistColumn = k;
							return this.shallowistColumn;
						}
					}
				}
			}
			this.shallowistColumn = -1;
			return this.shallowistColumn;
		} else
		{
			return this.shallowistColumn;
		}
	}
	
	/** For the block composition shape the standard array3d, which states the materials at each index
	  * is sufficient.  Here we need more information, including which faces should be placed.  The mass 
	  	considering these faces, etc.
	  */
	p.update_array3d_details = function ()
	{
		if (typeof(this.array3d_details) == "undefined")
		{
			var left_x = this.getLeftmostColumn();
			var right_x = this.getRightmostColumn();
			var top_y = this.getHighestRow();
			var bottom_y = this.getLowestRow();
			var thickness = 0.5; //this.material.container_thickness;
			if (typeof(thickness) == "undefined") thickness = 0;
			// go through rows and columns adding up mass in depths
			this.array3d_details = [];
			for (var i = 0; i < this.blockArray3d.length; i++)
			{
				this.array3d_details[i] = [];
				for (var j = 0; j < this.blockArray3d[i].length; j++)
				{
					this.array3d_details[i][j] = [];
					for (var k = 0; k < this.blockArray3d[i][j].length; k++)
					{
						this.array3d_details[i][j][k] = {};
						var mass = 0;
						var volume = this.unit_volume;
						if (this.blockArray3d[i][j][k] != "")
						{
							// top
							if (j == top_y || (j > top_y && this.blockArray3d[i][j-1][k] == ""))
							{
								this.array3d_details[i][j][k].top = true;
								mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
								volume += thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
							} else
							{
								this.array3d_details[i][j][k].top = false;
							}

							// front
							if (k == 0 || this.blockArray3d[i][j][k-1] == "")
							{
								this.array3d_details[i][j][k].front = true;
								mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
								volume += thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
							} else
							{
								this.array3d_details[i][j][k].front = false;
							}

							// right
							if (i == right_x || this.blockArray3d[i+1][j][k] == "")
							{
								this.array3d_details[i][j][k].right = true;
								mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
								volume += thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
							} else
							{
								this.array3d_details[i][j][k].right = false;
							}

							// bottom
							if (j == bottom_y || (j < bottom_y && this.blockArray3d[i][j+1][k] == ""))
							{
								this.array3d_details[i][j][k].bottom = true;
								mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
								volume += thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
							} else
							{
								this.array3d_details[i][j][k].bottom = false;
							}

							// back
							if (k == this.blockArray3d[i][j].length-1 || this.blockArray3d[i][j][k+1] == "")
							{
								this.array3d_details[i][j][k].back = true;
								mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
								volume += thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
							} else
							{
								this.array3d_details[i][j][k].back = false;
							}

							// left
							if (i == left_x || this.blockArray3d[i-1][j][k] == "")
							{
								this.array3d_details[i][j][k].left = true;
								mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
								volume += thickness / GLOBAL_PARAMETERS.SCALE * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE;
							} else
							{
								this.array3d_details[i][j][k].left = false;
							}

							// deal with mass of container at edges
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].front){ volume += this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].back){ volume +=  this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].right){ volume +=  this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].left){ volume += this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].front){ volume += this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].back){ volume += this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_width_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].right){ volume += this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].left){ volume += this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_depth_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE}
							if (this.array3d_details[i][j][k].left && this.array3d_details[i][j][k].front){ volume += this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].front && this.array3d_details[i][j][k].right){ volume += this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].right && this.array3d_details[i][j][k].back){ volume += this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].back && this.array3d_details[i][j][k].left){ volume += this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * this.unit_height_px / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}												

							// deal with mass of corners
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].front && this.array3d_details[i][j][k].right){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].right && this.array3d_details[i][j][k].back){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].back && this.array3d_details[i][j][k].left){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].top && this.array3d_details[i][j][k].left && this.array3d_details[i][j][k].front){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].front && this.array3d_details[i][j][k].right){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].right && this.array3d_details[i][j][k].back){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].back && this.array3d_details[i][j][k].left){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							if (this.array3d_details[i][j][k].bottom && this.array3d_details[i][j][k].left && this.array3d_details[i][j][k].front){ volume += thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE; mass += this.material.density * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE * thickness / GLOBAL_PARAMETERS.SCALE;}
							
							this.array3d_details[i][j][k].baseMass = mass;
							this.array3d_details[i][j][k].mass = mass;
							this.array3d_details[i][j][k].volume = volume;
							this.array3d_details[i][j][k].baseDensity = mass/volume;
							this.array3d_details[i][j][k].density = mass/volume;
							this.array3d_details[i][j][k].liquidVolume = 0;
						} else
						{
							this.array3d_details[i][j][k].baseMass = 0;
							this.array3d_details[i][j][k].mass = 0;
							this.array3d_details[i][j][k].volume = 0;
							this.array3d_details[i][j][k].density = 0;
							this.array3d_details[i][j][k].liquidVolume = 0;
						}
					}
				}
			} 
			return this.array3d_details;
		} else
		{
			return this.array3d_details;
		}
	}

	p.update_array2d = function ()
	{
		var array2d = this.array2d = [];		

		var array3d_details = this.update_array3d_details();
		var spaces3d = this.classifyOpenSpaces();
		var left_x = this.getLeftmostColumn();
		var right_x = this.getRightmostColumn();
		var top_y = this.getHighestRow();
		var bottom_y = this.getLowestRow();
		var o_mass = 0, o_materialSpaces = 0, o_exteriorSpaces = 0, o_interiorSpaces = 0, o_protectedSpaces = 0, o_liquid_volume = 0, o_liquid_mass = 0;
			
		// go through rows and columns adding up mass in depths
		for (var i = left_x; i <= right_x; i++)
		{
			array2d[i - left_x] = new Array();
			for (var j = top_y; j <= bottom_y; j++)
			{
				var mass = 0, materialSpaces = 0, exteriorSpaces = 0, interiorSpaces = 0, protectedSpaces = 0, liquid_volume = 0, liquid_mass = 0;
				for (var k = 0; k < this.blockArray3d[i][j].length; k++)
				{
					if (this.blockArray3d[i][j][k] != "")
					{

						liquid_mass += array3d_details[i][j][k].liquidVolume * this.liquid.density;
						liquid_volume += array3d_details[i][j][k].liquidVolume;						
						mass += (array3d_details[i][j][k].baseMass + array3d_details[i][j][k].liquidVolume * this.liquid.density) / array3d_details[i][j][k].volume;
					}
					if (spaces3d[i][j][k] == "B")
					{
						materialSpaces++;
					} else if (spaces3d[i][j][k] == "E")
					{
						exteriorSpaces++;
					} else if (spaces3d[i][j][k] == "I")
					{
						interiorSpaces++;
					} else if (spaces3d[i][j][k] == "P")
					{
						protectedSpaces++;
					}
				}
				o_mass += mass;
				o_materialSpaces += materialSpaces;
				o_exteriorSpaces += exteriorSpaces;
				o_interiorSpaces += interiorSpaces;
				o_protectedSpaces += protectedSpaces;
				o_liquid_volume += liquid_volume;
				o_liquid_mass += liquid_mass;
				array2d[i - left_x][j - top_y] = {"mass":mass, "totalSpaces":spaces3d[0][0].length, "materialSpaces":materialSpaces, "exteriorSpaces":exteriorSpaces, "interiorSpaces":interiorSpaces, "protectedSpaces":protectedSpaces};
			}
		} 
		this.savedObject.max_height = Math.abs(this.getLowestRow()+1 - this.getHighestRow());
		this.savedObject.max_width = Math.abs(this.getRightmostColumn()+1 - this.getLeftmostColumn());
		this.savedObject.max_depth = Math.abs(this.getDeepestIndex()+1 - this.getShallowistIndex());
		this.savedObject.mass = o_mass;
		this.savedObject.volume = (o_materialSpaces + o_interiorSpaces + o_protectedSpaces) * this.unit_volume;
		this.savedObject.density = this.savedObject.mass/ this.savedObject.volume;
		this.savedObject.material_volume = (o_materialSpaces) * this.unit_volume;
		this.savedObject.interior_volume = (o_interiorSpaces + o_protectedSpaces) * this.unit_volume;
		this.savedObject.liquid_mass = o_liquid_mass;
		this.savedObject.liquid_volume = o_liquid_volume;
		this.savedObject.liquid_perc_volume = this.savedObject.liquid_volume/this.savedObject.volume;
		return this.array2d;
	}

	/** This function classifies each space as either "B" (has a block within it), "I" (empty space is on the interior of the hull), "E" (Empty space is on the exterior of the hull)
		Works from lowest level up, makes three passes from a corner to see if the left-bottom-below spaces are occupied/interior or exterior, if temporarily interior given a temporary designation of "L".  
		Does the same from top-right point looking at top-right-below space, given temporary designation of "R".  One more pass, R spaces converted to I if left-bottom-below okay. */
	p.classifyOpenSpaces = function ()
	{
		var input = this.blockArray3d;
		var output = new Array();
		var i, j, k
		// populate interior array with "", exterior with B or E
		for (i = 0; i < input.length; i++)
		{
			output[i] = new Array(); 
			for (j = 0; j < input[0].length; j++)
			{
				output[i][j] = new Array();
				for (k = 0; k < input[0][0].length; k++)
				{
					if (i == 0 || i == input.length-1 || j == input[0].length-1 || k == 0 || k == input[0][0].length-1)
					{
						// is this exterior space occupied
						if (input[i][j][k] != "")
						{
							output[i][j][k] = "B";
						} else
						{
							output[i][j][k] = "E";
						}
					} else
					{
						// is this exterior space occupied
						if (input[i][j][k] != "")
						{
							output[i][j][k] = "B";
						} else
						{
							output[i][j][k] = "";
						}
					}
				}
			}
		}
		// first pass, from bottom up. from 0,0  Don't bother with exterior
		for (j = output[0].length - 2; j >= 0; j--)
		{
			i = 0;
			k = 0;
			for (d = 1; d < output.length + output[0][0].length - 2; d++)
			{
				i = d;
				k = 0;
				// a diagonal
				while (i >= 0)
				{
					// just need interior
					if (i > 0 && i < output.length-1 && k > 0 && k < output[0][0].length-1)
					{
						// ((output[i][j+1][k] != "E") && (output[i-1][j][k] != "E") && (output[i][j][k-1] != "E"))
						if (output[i][j][k] == "")
						{
							if ((output[i][j+1][k] == "B" || output[i][j+1][k] == "I" || output[i][j+1][k] == "L") && (output[i-1][j][k] == "B" || output[i-1][j][k] == "I" || output[i-1][j][k] == "L") && (output[i][j][k-1] == "B" || output[i][j][k-1] == "I" || output[i][j][k-1] == "L"))
							{
								output[i][j][k] = "L";
							} else
							{
								output[i][j][k] = "E";
							}
						}
						
					}
					i--;
					k++;
				}
			}
		}
		// second pass, from length-1, length-1
		for (j = output[0].length - 2; j >= 0; j--)
		{
			i = 0;
			k = 0;
			for (d = output.length + output[0][0].length - 3; d >= 1; d--)
			{
				k = d;
				i = 0;
				// a diagonal
				while (k >= 0)
				{
					// just need interior
					if (i > 0 && i < output.length-1 && k > 0 && k < output[0][0].length-1)
					{
						if (output[i][j][k] == "L")
						{
							if ((output[i][j+1][k] == "B" || output[i][j+1][k] == "I" || output[i][j+1][k] == "R") && (output[i+1][j][k] == "B" || output[i+1][j][k] == "I" || output[i+1][j][k] == "R") && (output[i][j][k+1] == "B" || output[i][j][k+1] == "I" || output[i][j][k+1] == "R"))
							{
								output[i][j][k] = "R";
							} else 
							{
								output[i][j][k] = "E";
							}
						}
						
					}
					i++;
					k--;
				}
			}
		}
		// final pass, make sure all R's are okay and turn into I
		for (j = output[0].length - 2; j >= 0; j--)
		{
			i = 0;
			k = 0;
			for (d = 1; d < output.length + output[0][0].length - 2; d++)
			{
				i = d;
				k = 0;
				// a diagonal
				while (i >= 0 && k < output[0][0].length)
				{
					// just need interior
					if (i > 0 && i < output.length-1 && k > 0 && k < output[0][0].length-1)
					{
						if (output[i][j][k] == "R")
						{
							if ((output[i][j+1][k] == "B" || output[i][j+1][k] == "I" || output[i][j+1][k] == "R") && (output[i-1][j][k] == "B" || output[i-1][j][k] == "I" || output[i-1][j][k] == "R") && (output[i][j][k-1] == "B" || output[i][j][k-1] == "I" || output[i][j][k-1] == "R"))
							{
								output[i][j][k] = "I";
							} else
							{
								output[i][j][k] = "E";
							}
						}
						
					}
					i--;
					k++;
				}
			}
		}
		////////////////////////////////////////////////////////////
		// repeat process above starting at the top of the structure
		var output_top = new Array();
		// populate interior array with "", exterior with B or E
		for (i = 0; i < input.length; i++)
		{
			output_top[i] = new Array(); 
			for (j = 0; j < input[0].length; j++)
			{
				output_top[i][j] = new Array();
				for (k = 0; k < input[0][0].length; k++)
				{
					if (i == 0 || i == input.length-1 || j == input[0].length-1 || k == 0 || k == input[0][0].length-1)
					{
						// is this exterior space occupied
						if (input[i][j][k] != "")
						{
							output_top[i][j][k] = "B";
						} else
						{
							output_top[i][j][k] = "E";
						}
					} else
					{
						// is this exterior space occupied
						if (input[i][j][k] != "")
						{
							output_top[i][j][k] = "B";
						} else
						{
							output_top[i][j][k] = "";
						}
					}
				}
			}
		}
		// first pass, from bottom up. from 0,0  Don't bother with exterior
		for (j = 1; j < output_top[0].length - 1; j++)
		{
			i = 0;
			k = 0;
			for (d = 1; d < output_top.length + output_top[0][0].length - 2; d++)
			{
				i = d;
				k = 0;
				// a diagonal
				while (i >= 0)
				{
					// just need interior
					if (i > 0 && i < output_top.length-1 && k > 0 && k < output_top[0][0].length-1)
					{
						if (output_top[i][j][k] == "")
						{
							if ((output_top[i][j-1][k] == "B" || output_top[i][j-1][k] == "I" || output_top[i][j-1][k] == "L") && (output_top[i-1][j][k] == "B" || output_top[i-1][j][k] == "I" || output_top[i-1][j][k] == "L") && (output_top[i][j][k-1] == "B" || output_top[i][j][k-1] == "I" || output_top[i][j][k-1] == "L"))
							{
								output_top[i][j][k] = "L";
							} else
							{
								output_top[i][j][k] = "E";
							}
						}
						
					}
					i--;
					k++;
				}
			}
		}
		// second pass, from length-1, length-1
		for (j = 1; j < output_top[0].length - 1; j++)
		{
			i = 0;
			k = 0;
			for (d = output_top.length + output_top[0][0].length - 3; d >= 1; d--)
			{
				k = d;
				i = 0;
				// a diagonal
				while (k >= 0)
				{
					// just need interior
					if (i > 0 && i < output_top.length-1 && k > 0 && k < output_top[0][0].length-1)
					{
						// ((output_top[i][j-1][k] != "E") && (output_top[i-1][j][k] != "E") && (output_top[i][j][k-1] != "E"))
						if (output_top[i][j][k] == "L")
						{
							if ((output_top[i][j-1][k] == "B" || output_top[i][j-1][k] == "I" || output_top[i][j-1][k] == "R") && (output_top[i+1][j][k] == "B" || output_top[i+1][j][k] == "I" || output_top[i+1][j][k] == "R") && (output_top[i][j][k+1] == "B" || output_top[i][j][k+1] == "I" || output_top[i][j][k+1] == "R"))
							{
								output_top[i][j][k] = "R";
							} else 
							{
								output_top[i][j][k] = "E";
							}
						}
						
					}
					i++;
					k--;
				}
			}
		}
		// final pass, make sure all R's are okay and turn into I
		for (j = 1; j < output_top[0].length - 1; j++)
		{
			i = 0;
			k = 0;
			for (d = 1; d < output_top.length + output_top[0][0].length - 2; d++)
			{
				i = d;
				k = 0;
				// a diagonal
				while (i >= 0 && k < output_top[0][0].length)
				{
					// just need interior
					if (i > 0 && i < output_top.length-1 && k > 0 && k < output_top[0][0].length-1)
					{
						if (output_top[i][j][k] == "R")
						{
							if ((output_top[i][j-1][k] == "B" || output_top[i][j-1][k] == "I" || output_top[i][j-1][k] == "R") && (output_top[i-1][j][k] == "B" || output_top[i-1][j][k] == "I" || output_top[i-1][j][k] == "R") && (output_top[i][j][k-1] == "B" || output_top[i][j][k-1] == "I" || output_top[i][j][k-1] == "R"))
							{
								output_top[i][j][k] = "I";
							} else
							{
								output_top[i][j][k] = "E";
							}
						}
						
					}
					i--;
					k++;
				}
			}
		}

		// Check both arrays, if both have I, then change to P (protected), else leave as is
		for (i = 0; i < output.length; i++)
		{
			for (j = 0; j < output[0].length; j++)
			{
				for (k = 0; k < output[0][0].length; k++)
				{
					if (output[i][j][k] == "I" && output_top[i][j][k] == "I")
					{
						output[i][j][k] = "P";
					}
				}
			}
		}

		//this.printArray3d(output);
		return (output);
	}

	p.printArray3d = function (arr)
	{
		var i, j, k, e;
		var str;
		console.log("_________________start________________________________");
		for (j = 0; j < arr[0].length; j++)
		{
			for (k = arr[0][0].length-1; k >= 0; k--)
			{
				str = ""
				for (e = 0; e < k; e++)
				{
					str = str + " ";
				}

				for (i = 0; i < arr.length; i ++)
				{
					if (arr[i][j][k] == "")
					{
						str = str + "  ";
					} else
					{
						str = str + arr[i][j][k] + " ";	
					}				
				}
				console.log (str);
			}
		}
		console.log("_________________stop________________________________");
		
	}
	/**
	*	Remove all liquid.
	*/
	p.empty= function (){
		this.isFull = false;
		this.overflowing = false;
		for (var i = 0; i < this.blockArray3d.length; i++){
			for (var j = 0; j < this.blockArray3d[i].length; j++){
				for (var k = 0; k < this.blockArray3d[i][j].length; k++){
					this.array3d_details[i][j][k].liquidVolume = 0;					
				}
			}
		}
		this.available_volume = this.cube_count * this.liquid_unit_volume;
		this.filled_volume = 0;
		this.current_volume_on_y_index = 0;
		this.perc_filled = 0;
		this.x_index = this.getLeftmostColumn();
		this.y_index = this.getLowestRow();
		if (GLOBAL_PARAMETERS.fill_spilloff_depth_from_middle) {this.z_index = Math.floor(this.depth_units/2);}
		else {this.z_index = this.depth_units-1;}

		this.update_array2d();
		this.redraw();
		console.log("overflowing",this.overflowing)
	}
	
	/** Fill the unit cube with the current index with the given volume, if filled move to the next */
	p.fillWithVolume = function (volume)
	{
		if (typeof(this.overflowing) == "undefined") this.overflowing = false;
		if (this.overflowing) return;

		var volume_distributed = 0;
		var volume_remaining = volume;
		var liquid_unit_volume_remaining;
		var go_to_next = false;

		if (GLOBAL_PARAMETERS.fill_spilloff_by_height)
		{
			while (volume_distributed < volume)
			{
				var total_volume_on_y_index = this.cube_count_at_y_index[this.y_index] * this.liquid_unit_volume;
				if (total_volume_on_y_index > 0)
				{
					var volume_remaining_on_y_index = total_volume_on_y_index - this.current_volume_on_y_index;
					var volume_to_distribute_on_y_index = Math.min(volume_remaining_on_y_index, volume_remaining);
					var volume_per_cube = volume_to_distribute_on_y_index / this.cube_count_at_y_index[this.y_index];
					// add volume to each cube
					for (var i = 0; i < this.blockArray3d.length; i++)
					{
						for (var k = 0; k < this.blockArray3d[i][this.y_index].length; k++)
						{
							if (this.blockArray3d[i][this.y_index][k] != "")
							{
								this.array3d_details[i][this.y_index][k].liquidVolume += volume_per_cube;
							}
						}
					}
					volume_distributed += volume_to_distribute_on_y_index;
					volume_remaining -= volume_to_distribute_on_y_index;
					this.current_volume_on_y_index += volume_to_distribute_on_y_index;
				}

				if (volume_remaining > 0.0001)
				{
					this.y_index--;
					this.current_volume_on_y_index = 0;
					if (this.y_index < this.getHighestRow())
					{
						this.overflowing = true; return;
					}
				} else
				{
					volume_distributed = volume;
					volume_remaining = 0;
				}

			}
		} else
		{
			var cur_liquid_unit_volume = this.array3d_details[this.x_index][this.y_index][this.z_index].liquidVolume;
			while (volume_distributed < volume)
			{

				if (cur_liquid_unit_volume < this.liquid_unit_volume)
				{
					liquid_unit_volume_remaining = this.liquid_unit_volume - cur_liquid_unit_volume;
					if (volume_remaining <= liquid_unit_volume_remaining)
					{
						this.array3d_details[this.x_index][this.y_index][this.z_index].liquidVolume += volume_remaining;
						volume_distributed = volume;
						volume_remaining = 0;
					} else
					{
						this.array3d_details[this.x_index][this.y_index][this.z_index].liquidVolume = this.liquid_unit_volume;
						volume_distributed += liquid_unit_volume_remaining;
						volume_remaining -= liquid_unit_volume_remaining;
						go_to_next = true;
					}
				} else
				{	// already filled
					go_to_next = true;
				}

				if (go_to_next && volume_remaining > 0.0001)
				{
					// rules for next index, start in middle of depth, iterate from front to back until furthest back unit is filled, then move to right, once plane is done move up
					if (this.z_index > 0)
					{
						if (GLOBAL_PARAMETERS.fill_spilloff_depth_from_middle)
						{
							var dist_from_middle = this.z_index - Math.floor(this.depth_units/2);
							if (dist_from_middle <= 0)
							{
								this.z_index = Math.floor(this.depth_units/2) + Math.abs(dist_from_middle) + 1;
							} else
							{
								this.z_index = Math.floor(this.depth_units/2) - dist_from_middle;
							}
						} else
						{
							this.z_index--;
						}
					} else 
					{
						if (this.x_index < this.width_units - 1)
						{
							if (GLOBAL_PARAMETERS.fill_spilloff_depth_from_middle) {this.z_index = Math.floor(this.depth_units/2);}
							else {this.z_index = this.depth_units-1;}
							this.x_index++;
							if (this.x_index > this.max_x_index)
							{
								this.max_x_index = this.x_index;
							}

						} else
						{
							if (this.z_index < this.height_units -1)
							{
								if (GLOBAL_PARAMETERS.fill_spilloff_depth_from_middle) {this.z_index = Math.floor(this.depth_units/2);}
								else {this.z_index = this.depth_units-1;}
								this.x_index = 0;
								this.y_index--;
								if (this.y_index < this.max_y_index)
								{
									this.max_y_index = this.y_index;
								}
							} else
							{
								this.redraw();
								return;
							}
						}
					}

					cur_liquid_unit_volume = 0;
					go_to_next = false;
				}
			}
		}
		this.available_volume -= volume_distributed;
		this.filled_volume += volume_distributed;
		this.perc_filled = this.filled_volume / (this.available_volume + this.filled_volume);
		if (this.available_volume < .0001){ this.isFull = true; } else {this.isFull = false;}
		this.update_array2d();
		this.redraw();
	}
////////////////////// DRAWING STUFF /////////////////////////
	p.redraw = function(r, percentSubmerged2d)
	{
		var rotation;
		if (typeof(r) != "undefined") {rotation = r} else {rotation = 0}
		rotation = (rotation + 360 * 10) % 360;

		var openTop;
		if (typeof(this.openTop) == "undefined")
		{
			openTop = false;
		} else
		{
			openTop = this.openTop;
		}
		
		var thickness = this.material.container_thickness;
		if (typeof(thickness) == "undefined") thickness = 0;
		var array3d_details = this.array3d_details;
		var i, j, k, k_rev, i_shift, j_shift;
		var btr_x, btr_y, btl_x, btl_y, bbr_x, bbr_y, ftr_x, ftr_y, ftl_x, ftl_y, fbr_x, fbr_y, fbl_x, fbl_y;
		var c_btr_x, c_btr_y, c_btl_x, c_btl_y, c_bbr_x, c_bbr_y, c_ftr_x, c_ftr_y, c_ftl_x, c_ftl_y, c_fbr_x, c_fbr_y, c_fbl_x, c_fbl_y;
		var g = this.g;
		g.clear();
		var i, j, k, row, col, ik;
		this.tr_x = NaN;
		this.tr_y = NaN;


		var view_sideAngle = this.view_sideAngle * Math.cos(rotation * Math.PI / 180) - this.view_topAngle * Math.sin(rotation * Math.PI / 180);
		var view_topAngle = this.view_topAngle * Math.cos(rotation * Math.PI / 180) +  this.view_sideAngle * Math.sin(rotation * Math.PI / 180);
		var colarr = []; var index = 0;
		
		if (view_sideAngle < 0)
		{
			for (col = this.rightmostColumn; col >= this.leftmost_column; col--){colarr[index] = col; index++}
		} else
		{
			for (col = this.leftmost_column; col <= this.rightmostColumn; col++){colarr[index] = col; index++}
		}

		var rowarr = []; index = 0;
		if (view_topAngle < 0) //90 && rotation < 270)
		{
			for (row = this.highest_row; row <= this.lowest_row; row++){rowarr[index] = row; index++}
		} else
		{
			for (row = this.lowest_row; row >= this.highest_row; row--){rowarr[index] = row; index++}
		}

		for (k = 0; k < this.blockArray3d[0][0].length; k++)
		{
			k_rev = this.blockArray3d[0][0].length - k - 1;
			for (i = 0; i < colarr.length; i++)
			{
				col = colarr[i];
				for (j = 0; j < rowarr.length; j++)
				{
					row = rowarr[j];			
					
					var material = GLOBAL_PARAMETERS.materials[this.blockArray3d[col][row][k]];
					
					// is there a cube at this depth?
					if (this.blockArray3d[col][row][k_rev] != "")
					{	
						var highlightColors = []; 
						if (this.isFull)
						{
							for (var c = 0; c < material.stroke_colors.length; c++)
							{
								highlightColors[c] =  "rgba(0,255,0,1.0)";
							}
						} else
						{
							highlightColors = material.stroke_colors;
						}	
								
						i_shift = col - this.leftmost_column;
						j_shift = row - this.highest_row;
						
						// the contents of containers, just the liquid
						fbl_x = i_shift*this.unit_width_px + k_rev*this.unit_depth_px*Math.sin(view_sideAngle);
						fbl_y = (j_shift+1)*this.unit_height_px - k_rev*this.unit_depth_px*Math.sin(view_topAngle);
						ftl_x = fbl_x;
						ftl_y = fbl_y - this.unit_height_px * array3d_details[col][row][k_rev].liquidVolume/this.liquid_unit_volume;
						
						fbr_x = fbl_x + this.unit_width_px;
						fbr_y = fbl_y;
						ftr_x = fbr_x;
						ftr_y = fbl_y - this.unit_height_px * array3d_details[col][row][k_rev].liquidVolume/this.liquid_unit_volume;
									
						bbl_x = fbl_x + this.unit_depth_px*Math.sin(view_sideAngle);
						bbl_y = fbl_y - this.unit_depth_px*Math.sin(view_topAngle);
						btl_x = bbl_x;
						btl_y = bbl_y - this.unit_height_px * array3d_details[col][row][k_rev].liquidVolume/this.liquid_unit_volume;
						
						bbr_x = bbl_x + this.unit_width_px;
						bbr_y = bbl_y;
						btr_x = bbr_x;
						btr_y = bbr_y - this.unit_height_px * array3d_details[col][row][k_rev].liquidVolume/this.liquid_unit_volume;
						
						// the actual container
						c_ftl_x = i_shift*this.unit_width_px + k_rev*this.unit_depth_px*Math.sin(view_sideAngle) - thickness;
						c_ftl_y = j_shift*this.unit_height_px - k_rev*this.unit_depth_px*Math.sin(view_topAngle) - thickness;
						c_fbl_x = c_ftl_x;
						c_fbl_y = c_ftl_y + this.unit_height_px + 2*thickness;
						
						c_ftr_x = c_ftl_x + this.unit_width_px + 2*thickness;
						c_ftr_y = c_ftl_y;
						c_fbr_x = c_ftr_x;
						c_fbr_y = c_ftr_y + this.unit_height_px + 2*thickness;
						
						c_btl_x = c_ftl_x + this.unit_depth_px*Math.sin(view_sideAngle);
						c_btl_y = c_ftl_y - this.unit_depth_px*Math.sin(view_topAngle);
						c_bbl_x = c_btl_x;
						c_bbl_y = c_btl_y + this.unit_height_px + 2*thickness;
						
						c_btr_x = c_btl_x + this.unit_width_px + 2*thickness;
						c_btr_y = c_btl_y;
						c_bbr_x = c_btr_x;
						c_bbr_y = c_btr_y + this.unit_height_px + 2*thickness;
						
						// setup overall corners
						if (isNaN(this.tr_x) || isNaN(this.tr_y))
						{ 
							this.tr_x = btr_x; this.tr_y = btr_y;
						}
						// continuously override bottom left
						this.bl_x = fbl_x; this.bl_y = fbl_y;
						
						// get the back side
						if (view_topAngle >= 0)
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(bbr_x, bbr_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(bbr_x, bbr_y);
								g.endStroke();
								g.endFill();
							}

							if (array3d_details[col][row][k_rev].bottom)
							{
								//console.log("draw bottom");
								// draw bottom
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, fbl_x, fbl_y, bbr_x, fbl_y);
								g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, fbl_x, fbl_y, bbr_x, fbl_y);
								g.moveTo(c_bbr_x, c_bbr_y);
								g.lineTo(c_bbl_x, c_bbl_y);
								g.lineTo(c_fbl_x, c_fbl_y);
								g.lineTo(c_fbr_x, c_fbr_y);
								g.lineTo(c_bbr_x, c_bbr_y);	
								g.endStroke();
								g.endFill();
							}
						} else
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btr_x, btr_y);
								g.lineTo(btl_x, btl_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(ftr_x, ftr_y);
								g.lineTo(btr_x, btr_y);
								g.endStroke();
								g.endFill();
							}

							if (array3d_details[col][row][k_rev].top && !openTop)
							{
								// draw top
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, btr_x, ftl_y);
								g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, btr_x, ftl_y);
								g.moveTo(c_btr_x, c_btr_y);
								g.lineTo(c_btl_x, c_btl_y);
								g.lineTo(c_ftl_x, c_ftl_y);
								g.lineTo(c_ftr_x, c_ftr_y);
								g.lineTo(c_btr_x, c_btr_y);
								g.endStroke();
								g.endFill();
							}
						}

						if (view_sideAngle >= 0)
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								// draw left
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btl_x, btl_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(btl_x, btl_y);
								g.endStroke();
								g.endFill();
							}

							if (array3d_details[col][row][k_rev].left)
							{
								// draw left
								//console.log("draw left");
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, btl_x, ftl_y);
								g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, btl_x, ftl_y);
								g.moveTo(c_btl_x, c_btl_y);
								g.lineTo(c_ftl_x, c_ftl_y);
								g.lineTo(c_fbl_x, c_fbl_y);
								g.lineTo(c_bbl_x, c_bbl_y);
								g.lineTo(c_btl_x, c_btl_y);
								g.endStroke();
								g.endFill();
							}
						}
						else 
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btr_x, btr_y);
								g.lineTo(ftr_x, ftr_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(bbr_x, bbr_y);
								g.lineTo(btr_x, btr_y);
								g.endFill();
								g.endStroke();
							}

							if (array3d_details[col][row][k_rev].right)
							{
								// draw right
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftr_x, ftr_y, btr_x, ftr_y);
								g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios_shadow, ftr_x, ftr_y, btr_x, ftr_y);
								g.moveTo(c_btr_x, c_btr_y);
								g.lineTo(c_ftr_x, c_ftr_y);
								g.lineTo(c_fbr_x, c_fbr_y);
								g.lineTo(c_bbr_x, c_bbr_y);
								g.lineTo(c_btr_x, c_btr_y);
								g.endStroke();
								g.endFill();
							}
						}
						
						
						if (view_sideAngle >= 0 )
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btr_x, btr_y);
								g.lineTo(btl_x, btl_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(bbr_x, bbr_y);
								g.lineTo(btr_x, btr_y);
								g.endFill();
							}
									
							if (array3d_details[col][row][k_rev].back)
							{
								// draw back
								//console.log("draw back");
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, btl_x, btl_y, btr_x, btr_y);
								if (k != this.blockArray3d[0][0].length-1) {g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, btl_x, btl_y, btr_x, btl_y);}
								else {g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, btl_x, btl_y, btr_x, btl_y);}
								g.moveTo(c_btr_x, c_btr_y);
								g.lineTo(c_btl_x, c_btl_y);
								g.lineTo(c_bbl_x, c_bbl_y);
								g.lineTo(c_bbr_x, c_bbr_y);
								g.lineTo(c_btr_x, c_btr_y);
								g.endStroke();
								g.endFill();
							}
						} else
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(ftr_x, ftr_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(ftr_x, ftr_y);
								g.endStroke();
								g.endFill();
							}
							// draw front
							if (array3d_details[col][row][k_rev].front)
							{
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, ftr_x, ftr_y);
								if (k != 0){ g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, ftr_x, ftr_y);}
								else {g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios, ftl_x, ftl_y, ftr_x, ftr_y);}
								g.moveTo(c_ftr_x, c_ftr_y);
								g.lineTo(c_ftl_x, c_ftl_y);
								g.lineTo(c_fbl_x, c_fbl_y);
								g.lineTo(c_fbr_x, c_fbr_y);
								g.lineTo(c_ftr_x, c_ftr_y);
								g.endStroke();
								g.endFill();
							}
						}

						// get the front side
						if (view_topAngle < 0)
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(bbr_x, bbr_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(bbr_x, bbr_y);
								g.endStroke();
								g.endFill();
							}

							if (array3d_details[col][row][k_rev].bottom)
							{
								// draw bottom
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, fbl_x, fbl_y, bbr_x, fbl_y);
								g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, fbl_x, fbl_y, bbr_x, fbl_y);
								g.moveTo(c_bbr_x, c_bbr_y);
								g.lineTo(c_bbl_x, c_bbl_y);
								g.lineTo(c_fbl_x, c_fbl_y);
								g.lineTo(c_fbr_x, c_fbr_y);
								g.lineTo(c_bbr_x, c_bbr_y);	
								g.endStroke();
								g.endFill();
							}
						} else
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btr_x, btr_y);
								g.lineTo(btl_x, btl_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(ftr_x, ftr_y);
								g.lineTo(btr_x, btr_y);
								g.endStroke();
								g.endFill();
							}

							if (array3d_details[col][row][k_rev].top && !openTop)
							{
								// draw top
								//console.log("draw top");
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, btr_x, ftl_y);
								g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, btr_x, ftl_y);
								g.moveTo(c_btr_x, c_btr_y);
								g.lineTo(c_btl_x, c_btl_y);
								g.lineTo(c_ftl_x, c_ftl_y);
								g.lineTo(c_ftr_x, c_ftr_y);
								g.lineTo(c_btr_x, c_btr_y);
								g.endStroke();
								g.endFill();
							}
						}

						if (view_sideAngle < 0)
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								// draw left
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btl_x, btl_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(btl_x, btl_y);
								g.endStroke();
								g.endFill();
							}

							if (array3d_details[col][row][k_rev].left)
							{
								// draw left
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, btl_x, btl_y);
								g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios_shadow, ftl_x, ftl_y, btl_x, btl_y);
								g.moveTo(c_btl_x, c_btl_y);
								g.lineTo(c_ftl_x, c_ftl_y);
								g.lineTo(c_fbl_x, c_fbl_y);
								g.lineTo(c_bbl_x, c_bbl_y);
								g.lineTo(c_btl_x, c_btl_y);
								g.endStroke();
								g.endFill();
							}
						}
						else 
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btr_x, btr_y);
								g.lineTo(ftr_x, ftr_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(bbr_x, bbr_y);
								g.lineTo(btr_x, btr_y);
								g.endFill();
								g.endStroke();
							}

							if (array3d_details[col][row][k_rev].right)
							{
								// draw right
								//console.log("draw right");
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftr_x, ftr_y, btr_x, ftr_y);
								g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios_shadow, ftr_x, ftr_y, btr_x, ftr_y);
								g.moveTo(c_btr_x, c_btr_y);
								g.lineTo(c_ftr_x, c_ftr_y);
								g.lineTo(c_fbr_x, c_fbr_y);
								g.lineTo(c_bbr_x, c_bbr_y);
								g.lineTo(c_btr_x, c_btr_y);
								g.endStroke();
								g.endFill();
							}
						}
						
						
						if (view_sideAngle < 0 )
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(btr_x, btr_y);
								g.lineTo(btl_x, btl_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(bbr_x, bbr_y);
								g.lineTo(btr_x, btr_y);
								g.endFill();
							}
									
							if (array3d_details[col][row][k_rev].back)
							{
								// draw back
								g.setStrokeStyle(thickness);
								g.beginLinearGradientStroke(highlightColors, material.stroke_ratios, btl_x, btl_y, btr_x, btr_y);
								if (k != this.blockArray3d[0][0].length-1) {g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, btl_x, btl_y, btr_x, btl_y);}
								else {g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, btl_x, btl_y, btr_x, btl_y);}
								g.moveTo(c_btr_x, c_btr_y);
								g.lineTo(c_btl_x, c_btl_y);
								g.lineTo(c_bbl_x, c_bbl_y);
								g.lineTo(c_bbr_x, c_bbr_y);
								g.lineTo(c_btr_x, c_btr_y);
								g.endStroke();
								g.endFill();
							}
						} else
						{
							if (array3d_details[col][row][k_rev].liquidVolume > 0)
							{
								g.setStrokeStyle(1);
								g.beginStroke(this.liquid.stroke_color_container);
								g.beginFill(this.liquid.fill_color_container);
								g.moveTo(ftr_x, ftr_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(ftr_x, ftr_y);
								g.endStroke();
								g.endFill();
							}
							// draw front
							if (array3d_details[col][row][k_rev].front)
							{
								//console.log("draw front");
								g.moveTo(c_ftr_x, c_ftr_y);		
								if (array3d_details[col][row][k_rev].top){ g.setStrokeStyle(thickness).beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, ftr_x, ftr_y); g.lineTo(c_ftl_x, c_ftl_y); g.endStroke();} else {g.moveTo(c_ftl_x, c_ftl_y);};
								if (array3d_details[col][row][k_rev].left){ g.setStrokeStyle(thickness).beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, ftr_x, ftr_y); g.lineTo(c_fbl_x, c_fbl_y); g.endStroke();} else {g.moveTo(c_fbl_x, c_fbl_y);} 
								if (array3d_details[col][row][k_rev].bottom){ g.setStrokeStyle(thickness).beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, ftr_x, ftr_y); g.lineTo(c_fbr_x, c_fbr_y); g.endStroke();} else{g.moveTo(c_fbr_x, c_fbr_y);} 
								if (array3d_details[col][row][k_rev].right){ g.setStrokeStyle(thickness).beginLinearGradientStroke(highlightColors, material.stroke_ratios, ftl_x, ftl_y, ftr_x, ftr_y); g.lineTo(c_ftr_x, c_ftr_y); g.endStroke();} else{g.moveTo(c_ftr_x, c_ftr_y);} 
								
								if (k != 0){ g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, ftr_x, ftr_y);}
								else {g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios, ftl_x, ftl_y, ftr_x, ftr_y);}
								g.drawRect(c_ftl_x, c_ftl_y, c_ftr_x - c_ftl_x, c_fbl_y - c_ftl_y);
								g.endFill();
								//g.endStroke();
								
							}
						}
						//console.log("_________________");
					
						var percentSubmerged = typeof percentSubmerged2d == "undefined" ? 0 : percentSubmerged2d[i_shift][j_shift];
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
					} else if (this.DEBUG && k == 0)
					{
						g.beginFill("rgba(255,255,0,0.5)");
						g.drawRect((i-1)*this.unit_width_px, j*this.unit_height_px, this.unit_width_px, this.unit_height_px);
						g.endFill();
					}
				}
			}
		}
		if (this.DEBUG)
		{
			g.beginFill("rgba(0,0,0,1.0)");
			g.drawCircle(0,0, 2);
			g.endFill();
		}
		stage.needs_to_update = true;
	}


	window.ContainerCompShape = ContainerCompShape;
}(window));
(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depthArray: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var BlockCompShape = function(unit_width_px, unit_height_px, unit_depth_px, savedObject)
	{
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, savedObject);
	} 
	var p = BlockCompShape.prototype = new createjs.Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, savedObject)
	{
		this.Container_initialize();
		this.is_blockComp = true;
		this.is_cylinder = false
		this.is_rectPrism = false;
		this.mouseEnabled = true;
		this.placed = false;
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
		this.is_mystery = typeof savedObject.is_mystery != "undefined" ? savedObject.is_mystery : false; 
		this.reveal_mystery = false;
		this.DEBUG = false;
		// composition vars
		var g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);
		this.addChild(this.shape);

		this.getHighestRow();
		this.getLowestRow();
		this.getLeftmostColumn();
		this.getRightmostColumn();
		this.update_array2d();
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
		//console.log("after", this.shape.x, this.shape.y);
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
			
			for (j = this.blockArray3d[0].length-1; j >= 0; j--)
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
			
			for (j = 0; j < this.blockArray3d[0].length; j++)
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
				for (j = 0; j < this.blockArray3d[0].length; j++)
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
				for (j = 0; j < this.blockArray3d[0].length; j++)
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
	
	p.update_array2d = function ()
	{
		if (typeof(this.array2d) == "undefined")
		{
			var array2d = this.array2d = new Array();
			var spaces3d = this.classifyOpenSpaces();
			var left_x = this.getLeftmostColumn();
			var right_x = this.getRightmostColumn();
			var top_y = this.getHighestRow();
			var bottom_y = this.getLowestRow();
			var o_mass = 0, o_materialSpaces = 0, o_exteriorSpaces = 0, o_interiorSpaces = 0, o_protectedSpaces = 0;
			// go through rows and columns adding up mass in depths
			//var max_width = 0, max_height = 0, max_depth = 0;
			var unique_materials = [];
			for (var i = left_x; i <= right_x; i++) {
				array2d[i - left_x] = [];
				for (var j = top_y; j <= bottom_y; j++)	{
					var mass = 0, materialSpaces = 0, exteriorSpaces = 0, interiorSpaces = 0, protectedSpaces = 0;
					for (var k = 0; k < this.blockArray3d[i][j].length; k++) {
						if (this.blockArray3d[i][j][k] != ""){
							var material = GLOBAL_PARAMETERS.materials[this.blockArray3d[i][j][k]];
							mass += material.density;
							var material_name = material.display_name;
							if (unique_materials.indexOf(material_name) == -1) unique_materials.push(material_name);
						}

						if (spaces3d[i][j][k] == "B"){
							materialSpaces++;
						} else if (spaces3d[i][j][k] == "E"){
							exteriorSpaces++;
						} else if (spaces3d[i][j][k] == "I"){
							interiorSpaces++;
						} else if (spaces3d[i][j][k] == "P"){
							protectedSpaces++;
						}
					}
					o_mass += mass;
					o_materialSpaces += materialSpaces;
					o_exteriorSpaces += exteriorSpaces;
					o_interiorSpaces += interiorSpaces;
					o_protectedSpaces += protectedSpaces;
			
					array2d[i - left_x][j - top_y] = {"mass":mass, "totalSpaces":spaces3d[0][0].length, "materialSpaces":materialSpaces, "exteriorSpaces":exteriorSpaces, "interiorSpaces":interiorSpaces, "protectedSpaces":protectedSpaces};
				}
			} 
			// go through again to find the width and depth at each height level
			this.widths = [];
			this.heights = [];
			this.depths = [];
			for (var j = top_y; j <= bottom_y; j++){
				var max_width = 0;
				var max_depth = 0;
				var width = 0;
				for (var i = left_x; i <= right_x; i++) {
					var depth = 0;
					for (var k = 0; k < this.blockArray3d[i][j].length; k++) {
						if (this.blockArray3d[i][j][k] != ""){
							depth++;
						}
					}
					if (depth > 0) width++;
					if (depth > max_depth) max_depth = depth;
				}
				if (width > max_width) max_width = width;
				this.heights.push(1);
				this.widths.push(max_width);
				this.depths.push(max_depth);
			}

			this.savedObject.unique_materials = unique_materials;
			this.savedObject.widths = this.widths;
			this.savedObject.heights = this.heights;
			this.savedObject.depths = this.depths;			
			this.savedObject.max_height = Math.abs(this.getLowestRow()+1 - this.getHighestRow());
			this.savedObject.max_width = Math.abs(this.getRightmostColumn()+1 - this.getLeftmostColumn());
			this.savedObject.max_depth = Math.abs(this.getDeepestIndex()+1 - this.getShallowistIndex());
			this.savedObject.mass = o_mass;
			this.savedObject.volume = (o_materialSpaces + o_interiorSpaces + o_protectedSpaces) * this.unit_volume;
			this.savedObject.total_volume = (o_materialSpaces + o_interiorSpaces + o_protectedSpaces) * this.unit_volume;
			this.savedObject.enclosed_volume = (o_materialSpaces + o_protectedSpaces) * this.unit_volume
			this.savedObject.density = this.savedObject.mass/ this.savedObject.volume;
			this.savedObject.material_volume = (o_materialSpaces) * this.unit_volume;
			this.savedObject.interior_volume = (o_interiorSpaces + o_protectedSpaces) * this.unit_volume;
			this.savedObject.liquid_mass = 0;
			this.savedObject.liquid_volume = 0;
			this.savedObject.liquid_perc_volume = 0;

			return this.array2d;
			
		} else
		{
			return this.array2d;
		}	
	}

	/** This function classifies each space as either "B" (has a block within it), "I" (empty space is on the interior of the hull), "E" (Empty space is on the exterior of the hull)
		Works from lowest level up, makes three passes from a corner to see if the left-bottom-below spaces are occupied/interior or exterior, if temporarily interior given a temporary designation of "L".  
		Does the same from top-right point looking at top-right-below space, given temporary designation of "R".  One more pass, R spaces converted to I if left-bottom-below okay. */
	p.classifyOpenSpaces = function ()
	{
		var input = this.blockArray3d;
		var output = new Array();
		// populate interior array with "", exterior with B or E
		for (var i = 0; i < input.length; i++)
		{
			output[i] = new Array(); 
			for (var j = 0; j < input[0].length; j++)
			{
				output[i][j] = new Array();
				for (var k = 0; k < input[0][0].length; k++)
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
			for (var d = 1; d < output.length + output[0][0].length - 2; d++)
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

////////////////////// DRAWING STUFF /////////////////////////
	p.redraw = function(r, percentSubmerged2d)
	{
		var rotation;
		if (typeof(r) != "undefined") {rotation = r} else {rotation = 0}
		rotation = (rotation + 360 * 10) % 360;
		//this.rotation = 330;
		//rotation = 330;	
		var btr_x, btr_y, btl_x, btl_y, bbr_x, bbr_y, bbl_x, bbl_y, ftr_x, ftr_y, ftl_x, ftl_y, fbr_x, fbr_y, fbl_x, fbl_y;
		var g = this.g;
		g.clear();
		var i, j, k, row, col, ik, i_shift, j_shift;
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

		
		if (this.is_mystery && !this.reveal_mystery){
			g.beginStroke("rgba(0,0,0,1.0)");
			g.beginFill("rgba(60,60,60, 1.0)");
			//console.log(this.leftmost_column, this.rightmostColumn, this.highest_row, this.lowest_row)
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
			for (k = 0; k < this.blockArray3d[0][0].length; k++)
			{
				k_rev = this.blockArray3d[0][0].length - k - 1;
				for (i = 0; i < colarr.length; i++)
				{
					col = colarr[i];
					for (j = 0; j < rowarr.length; j++)
					{
						row = rowarr[j];						
						
						// is there a cube at this depth?
						if (this.blockArray3d[col][row][k] != "")
						{		
							var material = GLOBAL_PARAMETERS.materials[this.blockArray3d[col][row][k]];
							
							i_shift = col - this.leftmost_column;
							j_shift = row - this.highest_row;
							
							ftl_x = i_shift*this.unit_width_px + k_rev*this.unit_depth_px*Math.sin(view_sideAngle);
							ftl_y = j_shift*this.unit_height_px - k_rev*this.unit_depth_px*Math.sin(view_topAngle);
							fbl_x = ftl_x;
							fbl_y = ftl_y + this.unit_height_px;

							ftr_x = ftl_x + this.unit_width_px;
							ftr_y = ftl_y;
							fbr_x = ftr_x;
							fbr_y = ftr_y + this.unit_height_px;

							btl_x = ftl_x + this.unit_depth_px*Math.sin(view_sideAngle);
							btl_y = ftl_y - this.unit_depth_px*Math.sin(view_topAngle);
							bbl_x = btl_x;
							bbl_y = btl_y + this.unit_height_px;

							btr_x = btl_x + this.unit_width_px;
							btr_y = btl_y;
							bbr_x = btr_x;
							bbr_y = btr_y + this.unit_height_px;

							// setup overall corners
							if (isNaN(this.tr_x) || isNaN(this.tr_y))
							{ 
								this.tr_x = btr_x; this.tr_y = btr_y;
							}
							// continuously override bottom left
							this.bl_x = fbl_x; this.bl_y = fbl_y;
							
							if (view_topAngle < 0)
							{
								// draw bottom
								g.setStrokeStyle(1);
								g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, fbl_x, fbl_y, bbr_x, fbl_y);
								g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, fbl_x, fbl_y, bbr_x, fbl_y);
								g.moveTo(bbr_x, bbr_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(bbr_x, bbr_y);
								g.endStroke();
								g.endFill();
							} else
							{
								// draw top
								g.setStrokeStyle(1);
								g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftl_x, ftl_y, btr_x, ftl_y);
								g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, btr_x, ftl_y);
								g.moveTo(btr_x, btr_y);
								g.lineTo(btl_x, btl_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(ftr_x, ftr_y);
								g.lineTo(btr_x, btr_y);
								g.endStroke();
								g.endFill();						
							}

							if (view_sideAngle < 0)
							{
								// draw left
								g.setStrokeStyle(1);
								g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftl_x, ftl_y, btl_x, btl_y);
								g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios_shadow, ftl_x, ftl_y, btl_x, btl_y);
								g.moveTo(btl_x, btl_y);
								g.lineTo(ftl_x, ftl_y);
								g.lineTo(fbl_x, fbl_y);
								g.lineTo(bbl_x, bbl_y);
								g.lineTo(btl_x, btl_y);
								g.endStroke();
								g.endFill();
							}
							else 
							{
								// draw right
								g.setStrokeStyle(1);
								g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftr_x, ftr_y, btr_x, btr_y);
								g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios_shadow, ftr_x, ftr_y, btr_x, btr_y);
								g.moveTo(btr_x, btr_y);
								g.lineTo(ftr_x, ftr_y);
								g.lineTo(fbr_x, fbr_y);
								g.lineTo(bbr_x, bbr_y);
								g.lineTo(btr_x, btr_y);
								g.endStroke();
								g.endFill();
							}
							
							
							/*
							// draw back
							g.setStrokeStyle(1);
							g.beginLinearGradientStroke(this.getMaterialStrokeColors(materialName), this.getMaterialStrokeRatios(materialName), btl_x, btl_y, btr_x, btr_y);
							if (k != 0) {g.beginLinearGradientFill(this.getMaterialFillColors(materialName), this.getMaterialFillRatios(materialName), btl_x, btl_y, btr_x, btl_y);}
							else {g.beginLinearGradientFill(this.getMaterialFillColorsShadow(materialName), this.getMaterialFillRatios(materialName), btl_x, btl_y, btr_x, btl_y);}
							g.moveTo(btr_x, btr_y);
							g.lineTo(btl_x, btl_y);
							g.lineTo(bbl_x, bbl_y);
							g.lineTo(bbr_x, bbr_y);
							g.lineTo(btr_x, btr_y);
							g.endStroke();
							g.endFill();
							*/

							// draw front
							g.setStrokeStyle(1);
							g.beginLinearGradientStroke(material.stroke_colors, material.stroke_ratios, ftl_x, ftl_y, ftr_x, ftr_y);
							if (k != 0){ g.beginLinearGradientFill(material.fill_colors, material.fill_ratios, ftl_x, ftl_y, ftr_x, ftr_y);}
							else {g.beginLinearGradientFill(material.fill_colors_shadow, material.fill_ratios, ftl_x, ftl_y, ftr_x, ftr_y);}
							g.moveTo(ftr_x, ftr_y);
							g.lineTo(ftl_x, ftl_y);
							g.lineTo(fbl_x, fbl_y);
							g.lineTo(fbr_x, fbr_y);
							g.lineTo(ftr_x, ftr_y);
							g.endStroke();
							g.endFill();

							var percentSubmerged = typeof percentSubmerged2d == "undefined" ? 0 : percentSubmerged2d[i_shift][j_shift];
							// draw liquid in front
							if (percentSubmerged > 0 && percentSubmerged < 1 && (k != 0 || this.parent.body.soaked) && typeof this.parent.containedWithin.liquid !== "undefined"){ 
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
		}

		if (this.DEBUG)
		{
			g.beginFill("rgba(0,0,0,1.0)");
			g.drawCircle(0,0, 2);
			g.endFill();
		}
		if (stage != null) stage.needs_to_update = true;
	}

	window.BlockCompShape = BlockCompShape;
}(window));
(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depth_array: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var RectBlockShape = function(unit_width_px, unit_height_px, unit_depth_px, depth_array, view_sideAngle, view_topAngle, material_name, material)
	{
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, depth_array, view_sideAngle, view_topAngle, material_name, material);
	}
	var p = RectBlockShape.prototype = new createjs.Container();
	
	// public properties
	p.mouseEventsEnabled = true;
	p.Container_initialize = p.initialize;
	p.Container_tick = p._tick;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, depth_array, view_sideAngle, view_topAngle, material_name, material)
	{
		this.Container_initialize();
		this.mouseEnabled = true;
		this.placed = false;
		this.unit_width_px = unit_width_px;
		this.unit_height_px = unit_height_px;
		this.unit_depth_px = unit_depth_px;
		this.depth_array = depth_array;
		this.view_topAngle = view_topAngle;
		this.view_sideAngle = view_sideAngle;
		this.material_name = material_name;
		this.material = material;
		this.is_container = material.is_container;

		this.min_x = 0;
		this.min_y = 0;
		this.max_x = 0;
		this.max_y = 0;
		this.isHighestBlock = false;
		this.areBoundsSet = false;
		this.leftBlock = null;
		this.rightBlock = null;
		this.aboveBlock = null;
		this.belowBlock = null;

		// composition vars
		var g = this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(g);
		this.addChild(this.shape);
		//this.shape.mouseEnabled = false;
		this.width_units = 1;
		this.height_units = 1;
		this.depth_units = 1;
		this.width_px = this.width_units * unit_width_px;
		this.height_px = this.height_units * unit_height_px;
		this.depth_px = this.depth_units * unit_depth_px;
		
		this.cubes = [];
		this.cubeCount = 0;
		this.updateCubes();
		this.cubes_projected = this.cubes;
		this.updateProjected();
		this.updateProjected2d();
		
		// draw figure
		this.redraw();

	}
	p.set_width_units = function(width){
		this.width_units = width;
		this.width_px = this.width_units * this.unit_width_px;
		this.updateCubes();
		this.updateProjected();
		this.updateProjected2d();
		this.redraw();
	}
	p.set_height_units = function(height){
		this.height_units = height;
		this.height_px = this.height_units * this.unit_height_px;
		this.updateCubes();
		this.updateProjected();
		this.updateProjected2d();
		this.redraw();
	}
	p.set_depth_units = function(depth){
		this.depth_units = depth;
		this.depth_px = this.depth_units * this.unit_depth_px;
		this.updateCubes();
		this.updateProjected();
		this.updateProjected2d();
		this.redraw();
	}
	
	p.update_view_sideAngle = function (angle)
	{
		this.view_sideAngle = angle;
		this.updateProjected();
		this.updateProjected2d();
		this.redraw();
	}

	p.update_view_topAngle = function (angle)
	{
		this.view_topAngle = angle;
		this.updateProjected();
		this.updateProjected2d();
		this.redraw();
	}
	p.updateCubes = function (){
		// use depth array to set up 3d point vertices
		for (var i=0; i < this.depth_array.length; i++)
		{
			if (this.depth_array[i] == 1)
			{
				this.cubes[i] = {};
				var points3d = []; 
				points3d.push(new Point3D(0, 0, i*this.depth_units)); 
				points3d.push(new Point3D(-this.width_units, 0, i*this.depth_units));
				points3d.push(new Point3D(-this.width_units, 0, (i+1)*this.depth_units));
				points3d.push(new Point3D(0, 0, (i+1)*this.depth_units));
				this.cubes[i].top = points3d;
				var points3d = [];
				points3d.push(new Point3D(0, this.height_units, i*this.depth_units));
				points3d.push(new Point3D(-this.width_units, this.height_units, i*this.depth_units));
				points3d.push(new Point3D(-this.width_units, this.height_units, (i+1)*this.depth_units));
				points3d.push(new Point3D(0, this.height_units, (i+1)*this.depth_units));
				this.cubes[i].bottom = points3d;
				points3d = [];
				points3d.push(new Point3D(0, 0, (i+1)*this.depth_units));
				points3d.push(new Point3D(-this.width_units, 0, (i+1)*this.depth_units));
				points3d.push(new Point3D(-this.width_units, this.height_units, (i+1)*this.depth_units));
				points3d.push(new Point3D(0, this.height_units, (i+1)*this.depth_units));
				this.cubes[i].front = points3d;
				points3d = [];
				points3d.push(new Point3D(0, 0, i*this.depth_units));
				points3d.push(new Point3D(0, 0, (i+1)*this.depth_units));
				points3d.push(new Point3D(0, this.height_units, (i+1)*this.depth_units));
				points3d.push(new Point3D(0, this.height_units, i*this.depth_units));
				this.cubes[i].right = points3d;
				points3d = [];
				points3d.push(new Point3D(-this.width_units, 0, i*this.depth_units));
				points3d.push(new Point3D(-this.width_units, 0, (i+1)*this.depth_units));
				points3d.push(new Point3D(-this.width_units, this.height_units, (i+1)*this.depth_units));
				points3d.push(new Point3D(-this.width_units, this.height_units, i*this.depth_units));
				this.cubes[i].left = points3d;
				points3d = [];
				points3d.push(new Point3D(0, 0, i*this.depth_units));
				points3d.push(new Point3D(-this.width_units, 0, i*this.depth_units));
				points3d.push(new Point3D(-this.width_units, this.height_units, i*this.depth_units));
				points3d.push(new Point3D(0, this.height_units, i*this.depth_units));
				this.cubes[i].back = points3d;
				this.cubeCount++;
				
			} else
			{
				this.cubes[i] = null;
			}
		}
	}
	/** This function converts the main set of vertices to a transformed set of 3dvertices */
	p.updateProjected = function ()
	{
		this.cubes_projected = [];
		var i, j, point, npoint;
		for (i=0; i < this.cubes.length; i++)
		{
			this.cubes_projected[i] = {}
			if (this.cubes[i] != null)
			{
				this.cubes_projected[i].back = [];
				for (j = 0; j < this.cubes[i].back.length; j++)
				{
					point = this.cubes[i].back[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].back[j] = npoint;
				}

				this.cubes_projected[i].top = [];
				for (j = 0; j < this.cubes[i].top.length; j++)
				{
					point = this.cubes[i].top[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].top[j] = npoint;
				}

				this.cubes_projected[i].bottom = [];
				for (j = 0; j < this.cubes[i].bottom.length; j++)
				{
					point = this.cubes[i].bottom[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].bottom[j] = npoint;
				}

				this.cubes_projected[i].front = [];
				for (j = 0; j < this.cubes[i].front.length; j++)
				{
					point = this.cubes[i].front[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].front[j] = npoint;
				}

				this.cubes_projected[i].right = [];
				for (j = 0; j < this.cubes[i].right.length; j++)
				{
					point = this.cubes[i].right[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].right[j] = npoint;
				}

				this.cubes_projected[i].left = [];
				for (j = 0; j < this.cubes[i].left.length; j++)
				{
					point = this.cubes[i].left[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].left[j] = npoint;
				}
			} else
			{
				this.cubes_projected[i] = null;
			}
		}
		return this.cubes_projected;
	}
	/* Thsi function converts from a transformed set of 3d unit vertices to a 2d screen pixels */
	p.updateProjected2d = function()
	{
		this.cubes_projected2d = [];
		var i, j, point, npoint;
		for (i=0; i < this.cubes_projected.length; i++)
		{
			this.cubes_projected2d[i] = {}
			if (this.cubes_projected[i] != null)
			{
				this.cubes_projected2d[i].back = [];
				for (j = 0; j < this.cubes_projected[i].back.length; j++)
				{
					point = this.cubes_projected[i].back[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].back[j] = npoint;
				}

				this.cubes_projected2d[i].top = [];
				for (j = 0; j < this.cubes_projected[i].top.length; j++)
				{
					point = this.cubes_projected[i].top[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].top[j] = npoint;
				}

				this.cubes_projected2d[i].bottom = [];
				for (j = 0; j < this.cubes_projected[i].bottom.length; j++)
				{
					point = this.cubes_projected[i].bottom[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].bottom[j] = npoint;
				}

				this.cubes_projected2d[i].front = [];
				for (j = 0; j < this.cubes_projected[i].front.length; j++)
				{
					point = this.cubes_projected[i].front[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].front[j] = npoint;
				}

				this.cubes_projected2d[i].right = [];
				for (j = 0; j < this.cubes_projected[i].right.length; j++)
				{
					point = this.cubes_projected[i].right[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].right[j] = npoint;
				}

				this.cubes_projected2d[i].left = [];
				for (j = 0; j < this.cubes_projected[i].left.length; j++)
				{
					point = this.cubes_projected[i].left[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].left[j] = npoint;
				}
			} else
			{
				this.cubes_projected2d[i] = null;
			}
		}
		return this.cubes_projected2d;
	}
	p.redraw = function(highlightColor)
	{
		//if (typeof(highlightColor) == "undefined"){highlightColor = this.material_name;}
		var i;
		if (typeof(highlightColor) == "undefined")
		{
			highlightColors = this.material.stroke_colors;
		} else if (highlightColor == "correct")
		{
			highlightColors = [];
			for (i = 0; i < this.material.stroke_ratios.length; i++)
			{
				highlightColors[i] = "rgba(0,255,0,1.0)"
			}
		} else if (highlightColor == "incorrect")
		{
			highlightColors = [];
			for (i = 0; i < this.material.stroke_ratios.length; i++)
			{
				highlightColors[i] = "rgba(255,0,0,1.0)"
			}
		} else 
		{
			highlightColors = this.material.stroke_colors;
		}
		var g = this.g;
		g.clear();
		var i, j, point;
		for (i = 0; i < this.cubes_projected2d.length; i++)
		{
			if (this.cubes_projected2d[i] != null)
			{
				// draw bottom face, but only if this is a container and there is nothing below it
				
				if (this.is_container && (typeof(this.belowBlock) == "undefined" || this.belowBlock == null || this.belowBlock.depth_array[i] == 0))
				{
					//console.log("draw bottom");
					g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, this.cubes_projected2d[i].bottom[0].x, this.cubes_projected2d[i].bottom[0].y, this.cubes_projected2d[i].bottom[1].x, this.cubes_projected2d[i].bottom[1].y);
					g.beginLinearGradientFill(this.material.fill_colors_shadow, this.material.fill_ratios_shadow, this.cubes_projected2d[i].bottom[0].x, this.cubes_projected2d[i].bottom[0].y, this.cubes_projected2d[i].bottom[1].x, this.cubes_projected2d[i].bottom[1].y);
					point = this.cubes_projected2d[i].bottom[0];
					g.moveTo(point.x, point.y);
					for (j = 1; j < this.cubes_projected2d[i].bottom.length; j++)
					{
						point = this.cubes_projected2d[i].bottom[j];
						g.lineTo(point.x, point.y);
					}
					point = this.cubes_projected2d[i].bottom[0];
					g.lineTo(point.x, point.y);g.endStroke();
					g.endFill();
				}	
				
				if (this.is_container && (typeof(this.leftBlock) == "undefined" || this.leftBlock == null || this.leftBlock.depth_array[i] == 0))
				{
					// draw left face
					g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, this.cubes_projected2d[i].left[0].x, this.cubes_projected2d[i].left[0].y, this.cubes_projected2d[i].left[1].x, this.cubes_projected2d[i].left[0].y);
					g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, this.cubes_projected2d[i].left[0].x, this.cubes_projected2d[i].left[0].y, this.cubes_projected2d[i].left[1].x, this.cubes_projected2d[i].left[0].y);
					point = this.cubes_projected2d[i].left[0];
					g.moveTo(point.x, point.y);
					for (j = 1; j < this.cubes_projected2d[i].left.length; j++)
					{
						point = this.cubes_projected2d[i].left[j];
						g.lineTo(point.x, point.y);
					}
					point = this.cubes_projected2d[i].left[0];
					g.lineTo(point.x, point.y);g.endStroke();
					g.endFill();
				}
				
				//draw back, only if this is rear face, or last block is uninhabited 
				if (i == 0 || this.cubes_projected2d[i-1] == null )
				{
					//console.log("draw back");
					g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, this.cubes_projected2d[i].back[0].x, this.cubes_projected2d[i].back[0].y, this.cubes_projected2d[i].back[1].x, this.cubes_projected2d[i].back[0].y);
					g.beginLinearGradientFill(this.material.fill_colors_shadow, this.material.fill_ratios_shadow, this.cubes_projected2d[i].back[0].x, this.cubes_projected2d[i].back[0].y, this.cubes_projected2d[i].back[1].x, this.cubes_projected2d[i].back[0].y);
					point = this.cubes_projected2d[i].back[0];
					g.moveTo(point.x, point.y);
					for (j = 1; j < this.cubes_projected2d[i].back.length; j++)
					{
						point = this.cubes_projected2d[i].back[j];
						g.lineTo(point.x, point.y);
					}
					point = this.cubes_projected2d[i].back[0];
					g.lineTo(point.x, point.y);g.endStroke();
					g.endFill();
					firstBackFaceFound = true;
				}
				
				// draw top face, but if this is a container, only if there is nothing above
				//if (!this.is_container || (this.isPlaced && !this.isHighestBlock && (typeof(this.aboveBlock) == "undefined" || this.aboveBlock == null || this.aboveBlock.depth_array[i] == 0)))
				if (!this.is_container || (typeof(this.aboveBlock) == "undefined" || this.aboveBlock == null || this.aboveBlock.depth_array[i] == 0))
				{
					var ang = (Math.PI/2 + Math.atan((this.cubes_projected2d[i].top[3].y-this.cubes_projected2d[i].top[0].y)/(this.cubes_projected2d[i].top[3].x-this.cubes_projected2d[i].top[0].x)))%Math.PI;
					if (isNaN(ang)) ang = Math.PI/2;
					var d = Math.sqrt(Math.pow(this.cubes_projected2d[i].top[0].y-this.cubes_projected2d[i].top[1].y, 2)+Math.pow(this.cubes_projected2d[i].top[0].x-this.cubes_projected2d[i].top[1].x, 2))
					var x1 = this.cubes_projected2d[i].top[0].x-d*Math.cos(ang);
					var y1 = this.cubes_projected2d[i].top[0].y-d*Math.sin(ang);
					g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, this.cubes_projected2d[i].top[0].x, this.cubes_projected2d[i].top[0].y, x1, y1);
					g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, this.cubes_projected2d[i].top[0].x, this.cubes_projected2d[i].top[0].y, x1, y1);
					point = this.cubes_projected2d[i].top[0];
					g.moveTo(point.x, point.y);
					for (j = 1; j < this.cubes_projected2d[i].top.length; j++)
					{
						point = this.cubes_projected2d[i].top[j];
						g.lineTo(point.x, point.y);
					}
					point = this.cubes_projected2d[i].top[0];
					g.lineTo(point.x, point.y);g.endStroke();
					g.endFill();
				}
				
				// draw front face, only if this is the front face, or next face is uninhabited
				if (i == this.cubes_projected2d.length-1 || this.cubes_projected2d[i+1] == null)
				{				
					//console.log("draw front");
					g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, this.cubes_projected2d[i].front[0].x, this.cubes_projected2d[i].front[0].y, this.cubes_projected2d[i].front[1].x, this.cubes_projected2d[i].front[0].y);
					g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, this.cubes_projected2d[i].front[0].x, this.cubes_projected2d[i].front[0].y, this.cubes_projected2d[i].front[1].x, this.cubes_projected2d[i].front[0].y);
					point = this.cubes_projected2d[i].front[0];
					g.moveTo(point.x, point.y);
					for (j = 1; j < this.cubes_projected2d[i].front.length; j++)
					{
						point = this.cubes_projected2d[i].front[j];
						g.lineTo(point.x, point.y);
					}
					point = this.cubes_projected2d[i].front[0];
					g.lineTo(point.x, point.y);
					g.endStroke();
					g.endFill();
				}
				if (!this.is_container || typeof(this.rightBlock) == "undefined" || this.rightBlock == null || this.rightBlock.depth_array[i] == 0)
				{
					//console.log("draw right");
					// draw right face
					g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, this.cubes_projected2d[i].right[0].x, this.cubes_projected2d[i].right[0].y, this.cubes_projected2d[i].right[1].x, this.cubes_projected2d[i].right[0].y);
					g.beginLinearGradientFill(this.material.fill_colors_shadow, this.material.fill_ratios_shadow, this.cubes_projected2d[i].right[0].x, this.cubes_projected2d[i].right[0].y, this.cubes_projected2d[i].right[1].x, this.cubes_projected2d[i].right[0].y);
					point = this.cubes_projected2d[i].right[0];
					g.moveTo(point.x, point.y);
					for (j = 1; j < this.cubes_projected2d[i].right.length; j++)
					{
						point = this.cubes_projected2d[i].right[j];
						g.lineTo(point.x, point.y);
					}
					point = this.cubes_projected2d[i].right[0];
					g.lineTo(point.x, point.y);g.endStroke();
					g.endFill();
				}
			}
		}
		stage.needs_to_update = true;
	}
	

	/** Checks to see whether this object matches an object of the same type so that they can
		be connected.  Right now, just limited to the case of 5 objects, with only 
		"empty spaced" object 1,0,0,0,1 */
	p.connectsToOther = function(o)
	{
		var c_this = this.depth_array[Math.floor(this.depth_array.length/2)];
		var c_other = o.depth_array[Math.floor(o.depth_array.length/2)];

		if (!this.is_container && !o.is_container)
		{
			if ( (c_this > 0 && c_other) > 0 || (c_this == 0 && c_other == 0))
			{
				return true;
			} else
			{
				if (c_this == 0)
				{
					if (o.depth_array[Math.floor(o.depth_array.length/2)-1] == 1)
					{
						return true;
					} else
					{ 
						return false;
					}
				} else if (c_other == 0)
				{
					if (this.depth_array[Math.floor(this.depth_array.length/2)-1] == 1)
					{
						return true;
					} else 
					{
						return false;
					}
				} else 
				{
					return true;
				}
			}
		} else
		{
			return false;
		}
	}

	p.connectsToOtherContainer = function(o, alignment)
	{
		var c_this = this.depth_array[Math.floor(this.depth_array.length/2)];
		var c_other = o.depth_array[Math.floor(o.depth_array.length/2)];

		if (this.is_container && o.is_container)
		{
			if (c_this > 0 && c_other > 0 )
			{
				if (alignment == "horizontal" || alignment == "left"  || alignment == "right" )
				{
					return true;
				} else if (alignment == "above")
				{
					if (o.cubeCount <= this.cubeCount)
					{
						return true;
					} else
					{
						return false;
					}
				} else if (alignment == "below")
				{
					if (o.cubeCount >= this.cubeCount)
					{
						return true;
					} else
					{
						return false;
					}
				} else
				{
					return false;
				}
			} else
			{
				return false;
			}
		}
	}
	/** Necessary to ensure that all blocks are connected */
	p.allBlocksConnected = function ()
	{
		var firstBlockFound = false;
		var endBlockFound = false;
		for (var i = 0; i < this.depth_array.length; i++)
		{
			if (this.depth_array[i] == 1)
			{
				if (!firstBlockFound)
				{
					firstBlockFound = true;
				} else 
				{
					if (endBlockFound) return false;
				}
			} else
			{
				if (firstBlockFound)
				{
					endBlockFound = true;
				} 
			}
		}
		if (firstBlockFound)
		{
			return true;
		} else
		{
			return false;
		}
	}
	
	p.highlightCorrect = function ()
	{
		this.redraw("correct");
	}
	p.highlightIncorrect = function()
	{
		this.redraw("incorrect")
	}
	p.highlightDefault = function()
	{
		this.redraw();
	}
	p._tick = function ()
	{
		this.Container_tick();
	}

 window.RectBlockShape = RectBlockShape;
}(window));
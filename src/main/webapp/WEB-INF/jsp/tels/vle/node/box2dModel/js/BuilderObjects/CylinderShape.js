(function (window)
{
	/** Construct a "block" of cube like figures that extend into the depth.  Viewed from top-right.
	*	width_px, height_px, depth_px are the "real" height, width, and depth (of the object)
	*   depth_array: an array of binary values indicating if a cube is in a space, back-to-front. example [1, 0, 0, 0, 1]
	*	view_topAngle, view_sideAngle: the angle which the object is being viewed (radians).  0, 0, is front and center
	*/
	var CylinderShape = function(unit_width_px, unit_height_px, unit_depth_px, depth_array, view_sideAngle, view_topAngle, material_name, material)
	{
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, depth_array, view_sideAngle, view_topAngle, material_name, material);
	}
	var p = CylinderShape.prototype = new createjs.Container();
	
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
	p.set_height_units = function(height){
		this.height_units = height;
		this.height_px = this.height_units * this.unit_height_px;
		this.updateCubes();
		this.updateProjected();
		this.updateProjected2d();
		this.redraw();
	}
	p.set_diameter_units = function(diameter){
		this.width_units = diameter;
		this.width_px = this.width_units * this.unit_width_px;
		this.updateCubes();
		this.depth_units = diameter;
		this.depth_px = this.depth_units * this.unit_depth_px;
		this.updateProjected();
		this.updateProjected2d();
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
		this.zerop = new Point3D(0, 0, 0);
		this.xunitp = new Point3D(-this.width_units, 0, 0);
		this.yunitp = new Point3D(0, this.height_units, 0);
		this.zunitp = new Point3D(0, 0, this.depth_units);
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
				var points3d = []; 
				points3d.push(new Point3D(-this.width_units/2, this.height_units, i*this.depth_units)); 
				points3d.push(new Point3D(-this.width_units, this.height_units, (i+0.5)*this.depth_units));
				points3d.push(new Point3D(-this.width_units/2, this.height_units, (i+1)*this.depth_units));
				points3d.push(new Point3D(0, this.height_units, (i+0.5)*this.depth_units));
				this.cubes[i].bottomCenter = points3d;
				var points3d = []; 
				points3d.push(new Point3D(-this.width_units/2, 0, i*this.depth_units)); 
				points3d.push(new Point3D(-this.width_units, 0, (i+0.5)*this.depth_units));
				points3d.push(new Point3D(-this.width_units/2, 0, (i+1)*this.depth_units));
				points3d.push(new Point3D(0, 0, (i+0.5)*this.depth_units));
				this.cubes[i].topCenter = points3d;
				points3d = [];
				points3d.push(new Point3D(-this.width_units/2, 0, i*this.depth_units));
				points3d.push(new Point3D(-this.width_units/2, 0, (i+1)*this.depth_units));
				points3d.push(new Point3D(-this.width_units/2, this.height_units, (i+1)*this.depth_units));
				points3d.push(new Point3D(-this.width_units/2, this.height_units, i*this.depth_units));
				this.cubes[i].center = points3d;
				points3d = [];
				points3d.push(new Point3D(0, 0, (i+0.5)*this.depth_units));
				points3d.push(new Point3D(-this.width_units, 0, (i+0.5)*this.depth_units));
				points3d.push(new Point3D(-this.width_units, this.height_units, (i+0.5)*this.depth_units));
				points3d.push(new Point3D(0, this.height_units, (i+0.5)*this.depth_units));
				this.cubes[i].mid = points3d;
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
		npoint = this.zerop.rotateY(-this.view_sideAngle);
		this.zerop_projected = npoint.rotateX(-this.view_topAngle);
		npoint = this.xunitp.rotateY(-this.view_sideAngle);
		this.xunitp_projected = npoint.rotateX(-this.view_topAngle);
		npoint = this.yunitp.rotateY(-this.view_sideAngle);
		this.yunitp_projected = npoint.rotateX(-this.view_topAngle);
		npoint = this.zunitp.rotateY(-this.view_sideAngle);
		this.zunitp_projected = npoint.rotateX(-this.view_topAngle);
		
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
				this.cubes_projected[i].bottomCenter = [];
				for (j = 0; j < this.cubes[i].bottomCenter.length; j++)
				{
					point = this.cubes[i].bottomCenter[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].bottomCenter[j] = npoint;
				}
				this.cubes_projected[i].topCenter = [];
				for (j = 0; j < this.cubes[i].topCenter.length; j++)
				{
					point = this.cubes[i].topCenter[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].topCenter[j] = npoint;
				}
				this.cubes_projected[i].left = [];
				for (j = 0; j < this.cubes[i].left.length; j++)
				{
					point = this.cubes[i].left[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].left[j] = npoint;
				}
				this.cubes_projected[i].center = [];
				for (j = 0; j < this.cubes[i].center.length; j++)
				{
					point = this.cubes[i].center[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].center[j] = npoint;
				}
				this.cubes_projected[i].mid = [];
				for (j = 0; j < this.cubes[i].mid.length; j++)
				{
					point = this.cubes[i].mid[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].mid[j] = npoint;
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
		point = this.zerop_projected;
		npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
		this.zerop_projected2d = npoint;
		point = this.xunitp_projected;
		npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
		this.xunitp_projected2d = npoint;
		point = this.yunitp_projected;
		npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
		this.yunitp_projected2d = npoint;
		point = this.zunitp_projected;
		npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
		this.zunitp_projected2d = npoint;
		
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
				this.cubes_projected2d[i].bottomCenter = [];
				for (j = 0; j < this.cubes_projected[i].bottomCenter.length; j++)
				{
					point = this.cubes_projected[i].bottomCenter[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].bottomCenter[j] = npoint;
				}
				this.cubes_projected2d[i].topCenter = [];
				for (j = 0; j < this.cubes_projected[i].topCenter.length; j++)
				{
					point = this.cubes_projected[i].topCenter[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].topCenter[j] = npoint;
				}
				this.cubes_projected2d[i].center = [];
				for (j = 0; j < this.cubes_projected[i].center.length; j++)
				{
					point = this.cubes_projected[i].center[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].center[j] = npoint;
				}
				this.cubes_projected2d[i].mid = [];
				for (j = 0; j < this.cubes_projected[i].mid.length; j++)
				{
					point = this.cubes_projected[i].mid[j];
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].mid[j] = npoint;
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
		
		if(GLOBAL_PARAMETERS.DEBUG) g.beginStroke("#F00").moveTo(this.zerop_projected2d.x, this.zerop_projected2d.y).lineTo(this.xunitp_projected2d.x, this.xunitp_projected2d.y).endStroke().beginStroke("#0F0").moveTo(this.zerop_projected2d.x, this.zerop_projected2d.y).lineTo(this.yunitp_projected2d.x, this.yunitp_projected2d.y).endStroke().beginStroke("#00F").moveTo(this.zerop_projected2d.x, this.zerop_projected2d.y).lineTo(this.zunitp_projected2d.x, this.zunitp_projected2d.y).endStroke();
		
		for (i = 0; i < this.cubes_projected2d.length; i++)
		{
			var cp2 = this.cubes_projected2d[i];
			if (this.cubes_projected2d[i] != null)
			{
				var bcx = (cp2.bottomCenter[0].x + cp2.bottomCenter[2].x)/2;
				var bcy = (cp2.bottomCenter[0].y + cp2.bottomCenter[2].y)/2;
				var tcx = (cp2.topCenter[0].x + cp2.topCenter[2].x)/2;
				var tcy = (cp2.topCenter[0].y + cp2.topCenter[2].y)/2;
				var dw = Math.sqrt(Math.pow(this.width_px * Math.cos(this.view_sideAngle),2) + Math.pow(this.depth_px * Math.sin(this.view_sideAngle),2));
				var dd = dw * Math.sin(this.view_topAngle);
					
				g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, tcx-dw/2, tcy, tcx+dw/2, tcy);
				g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, tcx-dw/2, tcy, tcx+dw/2, tcy);
				g.drawEllipse(bcx-dw/2, bcy-dd/2, dw, dd);
				g.endStroke();
				g.endFill();
					
				g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, tcx-dw/2, tcy, tcx+dw/2, tcy);
				g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, tcx-dw/2, tcy, tcx+dw/2, tcy);
				g.moveTo(tcx-dw/2, bcy).lineTo(tcx-dw/2, tcy).lineTo(tcx+dw/2, tcy).lineTo(tcx+dw/2, bcy);
				g.endStroke();
				g.lineTo(tcx-dw/2, bcy);
				//g.drawRect(tcx-dw/2-0.5, tcy, dw+1, bcy-tcy)
				g.endFill();
				
				g.beginLinearGradientStroke(highlightColors, this.material.stroke_ratios, tcx-dw/2, tcy, tcx+dw/2, tcy+dd/2);
				g.beginLinearGradientFill(this.material.fill_colors, this.material.fill_ratios, tcx-dw/2, tcy, tcx+dw/2, tcy+dd/2);
				g.drawEllipse(tcx-dw/2, tcy-dd/2, dw, dd);
				g.endStroke();
				g.endFill();
				
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

	p.drawEllipse = function (g, centerX, centerY, radiusX, radiusY, angle){
		for (var i = 0 * Math.PI; i < 2 * Math.PI; i += 0.01 ) {
		    var xPos = centerX - (radiusX * Math.sin(i)) * Math.sin(angle) + (radiusY * Math.cos(i)) * Math.cos(angle);
		    var yPos = centerY + (radiusY * Math.cos(i)) * Math.sin(angle) + (radiusX * Math.sin(i)) * Math.cos(angle);

		    if (i == 0) {
		        g.moveTo(xPos, yPos);
		    } else {
		       g.lineTo(xPos, yPos);
		    }
		}
	}

	p._tick = function ()
	{
		this.Container_tick();
	}

 window.CylinderShape = CylinderShape;
}(window));
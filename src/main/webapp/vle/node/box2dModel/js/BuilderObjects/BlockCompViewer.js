(function (window)
{
	function BlockCompViewer (unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units)
	{
		
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units);
	}
	var p = BlockCompViewer.prototype = new createjs.Container();
	p.Container_initialize = BlockCompViewer.prototype.initialize;

	p.initialize = function(unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units)
	{
		this.unit_width_px = unit_width_px;
		this.unit_height_px = unit_height_px;
		this.unit_depth_px = unit_depth_px;
		this.width_units = width_units;
		this.depth_units = depth_units;
		this.height_units = height_units;
		this.view_topAngle = GLOBAL_PARAMETERS.view_topAngle;
		this.view_sideAngle = GLOBAL_PARAMETERS.view_sideAngle;
		this.width_px_3d = unit_width_px * width_units;
		this.height_px_3d = unit_height_px * height_units;
		this.depth_px_3d = unit_depth_px * depth_units;

		this.g = new createjs.Graphics();
		this.shape = new createjs.Shape(this.g);
		this.addChild(this.shape);

		this.backHingeG = new createjs.Graphics();
		this.backHinge = new createjs.Shape(this.backHingeG);
		this.addChild(this.backHinge);

		this.frontHingeG = new createjs.Graphics();
		this.frontHinge = new createjs.Shape(this.frontHingeG);
		this.addChild(this.frontHinge);

		
		this.width_from_depth = this.unit_depth_px*this.depth_units*Math.sin(this.view_sideAngle);
		this.height_from_depth = this.unit_depth_px*this.depth_units*Math.sin(this.view_topAngle);
		
		this.width_px = this.unit_width_px*this.width_units + this.width_from_depth;
		this.height_px = this.unit_height_px*this.height_units + this.height_from_depth;
		
		//this.shape.x = this.width_px / 2;

		this.currentObject = null;

		// create a 2d array and fill with nulls (references)
		var i, j, k, ti, tj, tk, index;
		this.blockArray2d = [];		
		for (i = 0; i < this.width_units; i++)
		{
			this.blockArray2d[i] = [];
			for (j = 0; j < this.height_units; j++)
			{
				this.blockArray2d[i][j] = null;
			}
		}
		
		this.cubes = [];
		for (i = 0; i < this.width_units; i++)
		{
			for (j = 0; j < this.height_units; j++)
			{
				for (k = 0; k < this.depth_units; k++)
				{
					if (j == this.height_units-1 || k == 0)
					{
						index = this.cubes.length;
						ti = i - this.width_units/2;
						tj = j - this.height_units/2;
						tk = k - this.depth_units/2;
						this.cubes[index] = {};	
						if (k == 0)
						{
							points3d = [];
							points3d.push(new Point3D(-ti, tj, tk));
							points3d.push(new Point3D(-ti-1, tj, tk));
							points3d.push(new Point3D(-ti-1, tj+1, tk));
							points3d.push(new Point3D(-ti, tj+1, tk));
							this.cubes[index].back = points3d;
						} else
						{
							this.cubes[index].back = null;
						}
						if (j == this.height_units-1)
						{
							points3d = [];
							points3d.push(new Point3D(-ti, tj+1, tk));
							points3d.push(new Point3D(-ti-1, tj+1, tk));
							points3d.push(new Point3D(-ti-1, tj+1, tk+1));
							points3d.push(new Point3D(-ti, tj+1, tk+1));
							this.cubes[index].bottom = points3d;
						} else
						{
							this.cubes[index].bottom = null;
						}
					} else{}					
				}
			}
		}
		this.topRight = new Point3D(-this.width_units/2, -this.height_units/2, -this.depth_units/2);
		this.topLeft = new Point3D(-this.width_units/2 + this.width_units, -this.height_units/2, -this.depth_units/2);
		this.bottomRight = new Point3D(-this.width_units/2, -this.height_units/2 + this.height_units, -this.depth_units/2);
		this.bottomLeft = new Point3D(-this.width_units/2 + this.width_units, -this.height_units/2 + this.height_units, -this.depth_units/2);
		this.backCenter = new Point3D(0, 0, -this.depth_units/2);
		var off = 2;
		this.frontHingeA = new Point3D(-this.width_units/2 + this.width_units, -this.height_units/2 + this.height_units-off, this.depth_units/2);
		this.frontHingeB = new Point3D(-this.width_units/2 + this.width_units, -this.height_units/2 + this.height_units, this.depth_units/2-off);
		this.frontHingeC = new Point3D(-this.width_units/2 + this.width_units, -this.height_units/2 + this.height_units, this.depth_units/2);
		this.backHingeA = new Point3D(-this.width_units/2, -this.height_units/2 + this.height_units-off, this.depth_units/2);
		this.backHingeB = new Point3D(-this.width_units/2, -this.height_units/2 + this.height_units, this.depth_units/2-off);
		this.backHingeC = new Point3D(-this.width_units/2, -this.height_units/2 + this.height_units, this.depth_units/2);
	
		this.highest_index = this.height_units;

		this.cubes_projected = this.cubes;
		this.updateProjected();
		this.updateProjected2d();
		this.redraw();
		stage.needs_to_update = true;
	}

	p.update_view_sideAngle = function (angle)
	{
		this.view_sideAngle = angle;
		
		this.updateProjected();
		this.updateProjected2d();
					
		for (var i = 0; i < this.blockArray2d.length; i++)
		{
			for (var j = 0; j < this.blockArray2d[0].length; j++)
			{
				if (this.blockArray2d[i][j] != null)
				{
					this.blockArray2d[i][j].update_view_sideAngle(angle);
					// also update position within volume viewer
					// calculate an indices 0 to 5 from right to left, 0 to 5 top to bottom
					var point = new Point3D(i-this.width_units/2, j-this.height_units/2, -this.depth_units/2);
					var npoint = point.rotateY(this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);

					this.blockArray2d[i][j].x = -npoint.x * this.unit_width_px;
					this.blockArray2d[i][j].y = npoint.y * this.unit_height_px;
					 

				}
			}
		}
		this.redraw();
	}

	p.update_view_topAngle = function (angle)
	{
		this.view_topAngle = angle;
		
		this.updateProjected();
		this.updateProjected2d();
		for (var i = 0; i < this.blockArray2d.length; i++)
		{
			for (var j = 0; j < this.blockArray2d[0].length; j++)
			{
				if (this.blockArray2d[i][j] != null)
				{
					this.blockArray2d[i][j].update_view_topAngle(angle);
					// also update position within volume viewer
					// calculate an indices 0 to 5 from right to left, 0 to 5 top to bottom
					var point = new Point3D(i-this.width_units/2, j-this.height_units/2, -this.depth_units/2);
					var npoint = point.rotateY(this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);

					this.blockArray2d[i][j].x = -npoint.x * this.unit_width_px;
					this.blockArray2d[i][j].y = npoint.y * this.unit_height_px;
				}
			}
		}
		this.redraw();
	}
	/** This function converts the main set of vertices to a transformed set of 3dvertices */
	p.updateProjected = function ()
	{
		this.cubes_projected = [];
		var i, j, point, npoint;
		for (i=0; i < this.cubes.length; i++)
		{
			this.cubes_projected[i] = {}
			if (this.cubes[i].back != null)
			{
				this.cubes_projected[i].back = [];
				for (j = 0; j < this.cubes[i].back.length; j++)
				{
					point = this.cubes[i].back[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].back[j] = npoint;
				}
			} else
			{
				this.cubes_projected[i].back = null;
			}

			if (this.cubes[i].bottom != null)
			{
				this.cubes_projected[i].bottom = [];
				for (j = 0; j < this.cubes[i].bottom.length; j++)
				{
					point = this.cubes[i].bottom[j];
					npoint = point.rotateY(-this.view_sideAngle);
					npoint = npoint.rotateX(-this.view_topAngle);
					this.cubes_projected[i].bottom[j] = npoint;
				}
			} else
			{
				this.cubes_projected[i].bottom = null;
			}
		}
		// transform some markers
		this.topRight_projected = this.topRight.rotateY(this.view_sideAngle);
		this.topRight_projected = this.topRight_projected.rotateX(-this.view_topAngle); 
		this.topLeft_projected = this.topLeft.rotateY(this.view_sideAngle);
		this.topLeft_projected = this.topLeft_projected.rotateX(-this.view_topAngle); 
		this.bottomRight_projected = this.bottomRight.rotateY(this.view_sideAngle);
		this.bottomRight_projected = this.bottomRight_projected.rotateX(-this.view_topAngle); 
		this.bottomLeft_projected = this.bottomLeft.rotateY(this.view_sideAngle);
		this.bottomLeft_projected = this.bottomLeft_projected.rotateX(-this.view_topAngle); 
		this.backCenter_projected = this.backCenter.rotateY(this.view_sideAngle);
		this.backCenter_projected = this.backCenter_projected.rotateX(-this.view_topAngle); 
		this.backHingeA_projected = this.backHingeA.rotateY(this.view_sideAngle);
		this.backHingeA_projected = this.backHingeA_projected.rotateX(this.view_topAngle);
		this.backHingeB_projected = this.backHingeB.rotateY(this.view_sideAngle);
		this.backHingeB_projected = this.backHingeB_projected.rotateX(this.view_topAngle);
		this.backHingeC_projected = this.backHingeC.rotateY(this.view_sideAngle);
		this.backHingeC_projected = this.backHingeC_projected.rotateX(this.view_topAngle);
		this.frontHingeA_projected = this.frontHingeA.rotateY(this.view_sideAngle);
		this.frontHingeA_projected = this.frontHingeA_projected.rotateX(this.view_topAngle);
		this.frontHingeB_projected = this.frontHingeB.rotateY(this.view_sideAngle);
		this.frontHingeB_projected = this.frontHingeB_projected.rotateX(this.view_topAngle);
		this.frontHingeC_projected = this.frontHingeC.rotateY(this.view_sideAngle);
		this.frontHingeC_projected = this.frontHingeC_projected.rotateX(this.view_topAngle);

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
			if (this.cubes_projected[i].back != null)
			{
				this.cubes_projected2d[i].back = [];
				for (j = 0; j < this.cubes_projected[i].back.length; j++)
				{
					point = this.cubes_projected[i].back[j];
					//npoint = new createjs.Point(point.x*this.unit_width_px-point.z*this.unit_depth_px*Math.tan(this.view_sideAngle), point.y*this.unit_height_px+point.z*this.unit_depth_px*Math.tan(this.view_topAngle));
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].back[j] = npoint;
				}
			} else
			{
				this.cubes_projected2d[i].back = null;
			}

			if (this.cubes_projected[i].bottom != null)
			{
				this.cubes_projected2d[i].bottom = [];
				for (j = 0; j < this.cubes_projected[i].bottom.length; j++)
				{
					point = this.cubes_projected[i].bottom[j];
					//npoint = new createjs.Point(point.x*this.unit_width_px-point.z*this.unit_depth_px*Math.tan(this.view_sideAngle), point.y*this.unit_height_px+point.z*this.unit_depth_px*Math.tan(this.view_topAngle));
					npoint = new createjs.Point(point.x*this.unit_width_px, point.y*this.unit_height_px);
					this.cubes_projected2d[i].bottom[j] = npoint;
				}

			} else
			{
				this.cubes_projected2d[i].bottom = null;
			}
		}

		// project markers to 2d
		this.topRight_projected2d = new createjs.Point(this.topRight_projected.x*this.unit_width_px, this.topRight_projected.y*this.unit_height_px);
		this.topLeft_projected2d = new createjs.Point(this.topLeft_projected.x*this.unit_width_px, this.topLeft_projected.y*this.unit_height_px);
		this.bottomRight_projected2d = new createjs.Point(this.bottomRight_projected.x*this.unit_width_px, this.bottomRight_projected.y*this.unit_height_px);
		this.bottomLeft_projected2d = new createjs.Point(this.bottomLeft_projected.x*this.unit_width_px, this.bottomLeft_projected.y*this.unit_height_px);
		this.backCenter_projected2d = new createjs.Point(this.backCenter_projected.x*this.unit_width_px, this.backCenter_projected.y*this.unit_height_px);
		this.backHingeA_projected2d = new createjs.Point(this.backHingeA_projected.x*this.unit_width_px, this.backHingeA_projected.y*this.unit_height_px);
		this.backHingeB_projected2d = new createjs.Point(this.backHingeB_projected.x*this.unit_width_px, this.backHingeB_projected.y*this.unit_height_px);
		this.backHingeC_projected2d = new createjs.Point(this.backHingeC_projected.x*this.unit_width_px, this.backHingeC_projected.y*this.unit_height_px);
		this.frontHingeA_projected2d = new createjs.Point(this.frontHingeA_projected.x*this.unit_width_px, this.frontHingeA_projected.y*this.unit_height_px);
		this.frontHingeB_projected2d = new createjs.Point(this.frontHingeB_projected.x*this.unit_width_px, this.frontHingeB_projected.y*this.unit_height_px);
		this.frontHingeC_projected2d = new createjs.Point(this.frontHingeC_projected.x*this.unit_width_px, this.frontHingeC_projected.y*this.unit_height_px);
		return this.cubes_projected2d;
	}

	p.redraw = function ()
	{
		var g = this.g;
		g.clear();
		g.setStrokeStyle(0.5);
		g.beginStroke("rgba(100,100,100,1.0)");
		g.beginLinearGradientFill(["rgba(250,250,250,1.0)","rgba(230,210,220,1.0)"],[0,1.0],this.topRight_projected2d.x,this.topRight_projected2d.y,this.bottomLeft_projected2d.x,this.bottomLeft_projected2d.y);
		var i, j, point;
		for (i = 0; i < this.cubes_projected2d.length; i++)
		{
			if (this.cubes_projected2d[i].back != null)
			{
				point = this.cubes_projected2d[i].back[0];
				g.moveTo(point.x, point.y);
				for (j = 1; j < this.cubes_projected2d[i].back.length; j++)
				{
					point = this.cubes_projected2d[i].back[j];
					g.lineTo(point.x, point.y)
				}
				point = this.cubes_projected2d[i].back[0];
				g.lineTo(point.x, point.y);
			}
		}
		g.endFill();
		g.endStroke();
		g.beginStroke("rgba(0,0,0,1.0)");
		g.beginFill("rgba(200,245,200,1.0)");
		g.beginLinearGradientFill(["rgba(200,245,200,1.0)","rgba(180,210,180,1.0)"],[0,1.0],this.bottomRight_projected2d.x,this.bottomRight_projected2d.y,this.bottomLeft_projected2d.x,this.bottomLeft_projected2d.y);
		for (i = 0; i < this.cubes_projected2d.length; i++)
		{
			if (this.cubes_projected2d[i].bottom != null)
			{
				point = this.cubes_projected2d[i].bottom[0];
				g.moveTo(point.x, point.y);
				for (j = 1; j < this.cubes_projected2d[i].bottom.length; j++)
				{
					point = this.cubes_projected2d[i].bottom[j];
					g.lineTo(point.x, point.y)
				}
				point = this.cubes_projected2d[i].bottom[0];
				g.lineTo(point.x, point.y);
			}
		}
		g.endFill();
		g.endStroke(); 

		// draw "hinges"
		//console.log()
		var g = this.backHingeG;
		g.clear();
		g.setStrokeStyle(1);
		g.beginStroke("rgba(100,100,100,1.0)");
		g.beginFill("rgba(200,200,200,1.0)");
		g.moveTo(this.backHingeA_projected2d.x, this.backHingeA_projected2d.y);
		g.lineTo(this.backHingeB_projected2d.x, this.backHingeB_projected2d.y);
		g.lineTo(this.backHingeC_projected2d.x, this.backHingeC_projected2d.y);
		g.endFill();
		g.endStroke();
		
		var g = this.frontHingeG;
		g.clear();
		g.setStrokeStyle(1);
		g.beginStroke("rgba(100,100,100,1.0)");
		g.beginFill("rgba(200,200,200,1.0)");
		g.moveTo(this.frontHingeA_projected2d.x, this.frontHingeA_projected2d.y);
		g.lineTo(this.frontHingeB_projected2d.x, this.frontHingeB_projected2d.y);
		g.lineTo(this.frontHingeC_projected2d.x, this.frontHingeC_projected2d.y)
		g.endFill();
		g.endStroke();
		
	}
	p.blocksInViewer = function (o){
		var count = 0;
		for (var i = 0; i < this.blockArray2d.length; i++){
			for (var j = 0; j < this.blockArray2d[i].length; j++){
				if (this.blockArray2d[i][j] != null) count++;
			}
		}
		return count;
	}
	/** Releases object from the hold of this container */
	p.releaseBlock = function (o)
	{
		if (this.currentObject != null && o == this.currentObject)
		{
			this.currentObject = null;
		 	return true;
		} else
		{
			return false;
		}
	}
	/** This function takes an object that is placed within bounds and snaps to the grid */
	p.placeBlock = function (o)
	{

		var lo = o.parent.localToLocal(o.x, o.y, this); 
		var skew = Math.atan((this.topRight_projected2d.y - this.topLeft_projected2d.y)/(this.topLeft_projected2d.x - this.topRight_projected2d.x));
		var tx = -lo.x - this.backCenter_projected2d.x;
		var ty = lo.y - this.backCenter_projected2d.y + tx * Math.tan(skew);
		var cur_width = Math.abs(this.topLeft_projected2d.x - this.topRight_projected2d.x);
		var cur_height = Math.abs(this.bottomLeft_projected2d.y - this.topLeft_projected2d.y);
		var x_index_p = tx/(cur_width/this.width_units);
		var y_index_p = ty/(cur_height/this.height_units);
		var x_index = Math.round(x_index_p + this.width_units/2);
		var y_index = Math.round(y_index_p + this.height_units/2);
		this.placeBlockAtIndex (o, x_index, y_index);
	} 
	p.placeBlockAtIndex = function (o, x_index, y_index) {
		// calculate an indices 0 to 5 from right to left, 0 to 5 top to bottom
		var point = new Point3D(x_index-this.width_units/2, y_index-this.height_units/2, -this.depth_units/2);
		var npoint = point.rotateY(this.view_sideAngle);
		npoint = npoint.rotateX(-this.view_topAngle);

		var rx = -npoint.x * this.unit_width_px;
		var ry = npoint.y * this.unit_height_px;
		if (x_index >= 0 && x_index < this.width_units && y_index >= 0 && y_index < this.height_units)
		{
			// if o is not alread placed here in container add it
			if (!o.placed)
			{
				o.x_index = -1;
				o.y_index = -1;
				this.addChild(o);
				o.placed = true;
			} 
			// are we in a different location from before
			if (x_index != o.x_index || y_index != o.y_index)
			{
				//place this object in the correct place in the array
				var i, j, underCount = 0;
				for (i = this.width_units-1; i >= x_index; i--)
				{
					for (j = this.height_units-1; j >= 0; j--)
					{
						if ((i > x_index || j > y_index) && this.blockArray2d[i][j] != null ){
							underCount++;
						}
					}
				}
				// swap array index based on number of objects under o after background shape
				this.addChildAt(o, underCount+2);
				var goodLocation = this.canAddToCell(o, x_index, y_index);
				
				// if in a good location highlight and set boolean properties
				if (goodLocation)
				{
					this.updateBlockRelations(o, x_index, y_index, true);
					o.highlightCorrect();
					o.correct = true;
					o.incorrect = false;					
				} else 
				{
					this.updateBlockRelations(o, x_index, y_index, false);
					o.highlightIncorrect();
					o.correct = false;
					o.incorrect = true;
				}				
			}
			o.x_index = x_index;
			o.y_index = y_index;
			o.x = rx; 
			o.y = ry;
		} else
		{
			// if o is contained here add it to parent of this, object viewer
			if (o.placed) 
			{
				this.updateBlockRelations(o, o.x_index, o.y_index, false);
				var go = this.localToLocal(o.x, o.y, o.parent);
				this.parent.addChild(o);
				o.x = go.x; 
				o.y = go.y;
				o.placed = false;
				o.correct = false;
				o.incorrect = false;
				o.highlightDefault();
			}
		}
		return o.placed;
	}

		/** Can the object o be added to the cell in the 2d array indicated by x_index and y_index */
		p.canAddToCell = function (o, x_index, y_index){
			// Use rules
			// is this space occupied?
			var goodLocation = false;
			if (this.blockArray2d[x_index][y_index]  == null)
			{
				// is this the first block?
				if (this.getNumChildren() == 4)
				{
					// cannot be an "ends" piece
					if (o.allBlocksConnected())
					{
						goodLocation = true;
					} else
					{
						goodLocation = false;
					}
				}  else
				{	
					// separate rules for container
					if (GLOBAL_PARAMETERS.materials[o.material_name].is_container)
					{
						// is this block attached to another, and is the block below the same size or smaller
						if (y_index < this.height_units-1 && this.blockArray2d[x_index][y_index+1] != null && o.connectsToOtherContainer(this.blockArray2d[x_index][y_index+1], "below")) {goodLocation = true;}
						else if (x_index > 0 && this.blockArray2d[x_index-1][y_index] != null && o.connectsToOtherContainer(this.blockArray2d[x_index-1][y_index], "left")) {goodLocation = true;}
						else if (x_index < this.width_units-1 && this.blockArray2d[x_index+1][y_index] != null && o.connectsToOtherContainer(this.blockArray2d[x_index+1][y_index], "right")) {goodLocation = true;}
						else if (y_index > 0 && this.blockArray2d[x_index][y_index-1] != null && o.connectsToOtherContainer(this.blockArray2d[x_index][y_index-1], "above")) {goodLocation = true;}
						else {goodLocation = false;}
					} else
					{
						// is this block attached to another?
						// bottom-left, bottom-center,...
						if (x_index > 0 && y_index < this.height_units-1 && this.blockArray2d[x_index-1][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index+1])) {goodLocation = true;}
						else if (y_index < this.height_units-1 && this.blockArray2d[x_index][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index][y_index+1])) {goodLocation = true;}
						else if (x_index < this.width_units-1 && y_index < this.height_units-1 && this.blockArray2d[x_index+1][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index+1])) {goodLocation = true;}
						else if (x_index > 0 && this.blockArray2d[x_index-1][y_index] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index])) {goodLocation = true;}
						else if (x_index < this.width_units-1 && this.blockArray2d[x_index+1][y_index] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index])) {goodLocation = true;}
						else if (x_index > 0 && y_index > 0 && this.blockArray2d[x_index-1][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index-1])) {goodLocation = true;}
						else if (y_index > 0 && this.blockArray2d[x_index][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index][y_index-1])) {goodLocation = true;}
						else if (x_index < this.width_units-1 && y_index > 0 && this.blockArray2d[x_index+1][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index-1])) {goodLocation = true;}
						else {goodLocation = false;}
					}
				}					
			} else
			{
				goodLocation = false;
			}
			return goodLocation;
		}

	p.setBlock = function(o, overrideIsCorrect)
	{
		if (o.correct || (typeof overrideIsCorrect != "undefined" && overrideIsCorrect))
		{
			if (o.x_index >= 0 && o.x_index < this.width_units && o.y_index >= 0 && o.y_index < this.height_units)
			{
				this.blockArray2d[o.x_index][o.y_index] = null;
			}
			this.blockArray2d[o.x_index][o.y_index] = o;
			o.highlightDefault();
			return true;
		} else if (o.incorrect)
		{
			this.removeChild(o);
			return false;
		}
	}
	p.clearBlock = function (o)
	{
		if (this.canRemoveFromCell(o.x_index, o.y_index)){
			this.updateBlockRelations(o, o.x_index, o.y_index, false);
			this.blockArray2d[o.x_index][o.y_index] = null;
			this.removeChild(o);
			return true;
		} else {
			return false;
		}		
	}
		/** Can the object o be removed from the cell in the 2d array indicated by x_index and y_index */
		p.canRemoveFromCell = function (x_index, y_index){
			// temporarily take o off of the 2d block array, then go through each object in the 2d array
			// around the objects position to see if the
			var obj = this.blockArray2d[x_index][y_index];
			this.blockArray2d[x_index][y_index] = null;
			var blockCount = this.blocksInViewer();
			if (blockCount == 0) return true;

			var goodLocation = true;

			// create a boolean array to tell whether we've processed the current index
			var processedArr2d = [];
			for (var i = 0; i < this.blockArray2d.length; i++){
				processedArr2d[i] = [];
				for (var j = 0; j < this.blockArray2d[i].length; j++){
					processedArr2d[i][j] = false;
				}
			}

			// iterate through block2d to find a block
			var obreak = false;
			for (i = 0; i < this.blockArray2d.length; i++){
				for (j = 0; j < this.blockArray2d[i].length; j++){
					if (this.blockArray2d[i][j] != null){
						var connectionCount = this.getSizeOfObjectFromIndex(i, j, processedArr2d);
						obreak = true; break;
					} else {
						processedArr2d[i][j] = true;
					}					
				}
				if (obreak) break;
			}
			// put back in array
			this.blockArray2d[x_index][y_index] = obj;
			// is the block we found connected to all other blocks?
			if (connectionCount < blockCount){
				return false;
			} else {
				return true;
			}
		}	 

			/** This function starts from an upper-left index to find all connected blocks, recursively */
			p.getSizeOfObjectFromIndex = function (x_index, y_index, processedArr2d, x_index_prev, y_index_prev){
				if (this.blockArray2d[x_index][y_index] != null && !processedArr2d[x_index][y_index] && !(x_index == x_index_prev && y_index == y_index_prev)){
					if (typeof x_index_prev == "undefined") x_index_prev = -1;
					if (typeof y_index_prev == "undefined") y_index_prev = -1;
					var o = this.blockArray2d[x_index][y_index];
					processedArr2d[x_index][y_index] = true;
					var count = 1;					
					// circle all around and process
					if (x_index > 0 && y_index < this.height_units-1 && this.blockArray2d[x_index-1][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index+1])) {count +=this.getSizeOfObjectFromIndex(x_index-1, y_index+1,processedArr2d, x_index, y_index);}
					if (y_index < this.height_units-1 && this.blockArray2d[x_index][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index][y_index+1])) {count +=this.getSizeOfObjectFromIndex(x_index, y_index+1, processedArr2d, x_index, y_index);}
					if (x_index < this.width_units-1 && y_index < this.height_units-1 && this.blockArray2d[x_index+1][y_index+1] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index+1])) {count +=this.getSizeOfObjectFromIndex(x_index+1, y_index+1,processedArr2d, x_index, y_index);}
					if (x_index > 0 && this.blockArray2d[x_index-1][y_index] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index])) {count +=this.getSizeOfObjectFromIndex(x_index-1, y_index, processedArr2d, x_index, y_index);}
					if (x_index < this.width_units-1 && this.blockArray2d[x_index+1][y_index] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index])) {count +=this.getSizeOfObjectFromIndex(x_index+1, y_index, processedArr2d, x_index, y_index);}
					if (x_index > 0 && y_index > 0 && this.blockArray2d[x_index-1][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index-1][y_index-1])) {count +=this.getSizeOfObjectFromIndex(x_index-1, y_index-1, processedArr2d, x_index, y_index);}
					if (y_index > 0 && this.blockArray2d[x_index][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index][y_index-1])) {count +=this.getSizeOfObjectFromIndex(x_index, y_index-1, processedArr2d, x_index, y_index);}
					if (x_index < this.width_units-1 && y_index > 0 && this.blockArray2d[x_index+1][y_index-1] != null && o.connectsToOther(this.blockArray2d[x_index+1][y_index-1])) {count +=this.getSizeOfObjectFromIndex(x_index+1, y_index-1, processedArr2d, x_index, y_index);}
					
					return count;
				} else {
					return 0;
				}
			}

	/**  Empty the viewer*/
 	p.clearBlocks = function ()
	{
		var i, j;
		for (i = this.getNumChildren()-2; i > 1; i--)
		{
			this.removeChildAt(i);
		}
		
		for (i = 0; i < this.width_units; i++)
		{			
			for (j = 0; j < this.height_units; j++)
			{
				if (this.blockArray2d[i][j] != null)
				{
					this.updateBlockRelations(this.blockArray2d[i][j], i, j, false);
				}
				this.blockArray2d[i][j] = null;
			}
		}
		this.blockArray2d = [];		
		for (i = 0; i < this.width_units; i++)
		{
			this.blockArray2d[i] = [];
			for (j = 0; j < this.height_units; j++)
			{
				this.blockArray2d[i][j] = null;
			}
		}
	}

	/** When a block is moved around, added or deleted we should be checking whether the spatial relations between blocks have been
	altered, this can affect the way they are drawn, particularly with containers. 
	*/
	p.updateBlockRelations = function (o, x_index, y_index, successful)
	{
		var i;

		if (successful)
		{
			// blocks adjacent to this block
			if (x_index < this.width_units-1){ o.leftBlock = this.blockArray2d[x_index+1][y_index]; if(o.leftBlock !=null){ o.leftBlock.rightBlock = o; o.leftBlock.redraw();}}
			if (x_index > 0){o.rightBlock = this.blockArray2d[x_index-1][y_index]; if(o.rightBlock !=null){ o.rightBlock.leftBlock = o; o.rightBlock.redraw();}}
			if (y_index > 0){ o.aboveBlock = this.blockArray2d[x_index][y_index-1]; if(o.aboveBlock !=null){ o.aboveBlock.belowBlock = o; o.aboveBlock.redraw();}}
			if (y_index < this.height_units-1){ o.belowBlock = this.blockArray2d[x_index][y_index+1]; if(o.belowBlock !=null){ o.belowBlock.aboveBlock = o; o.belowBlock.redraw();}} 
		
			// is this block higher than the rest?
			if (y_index < this.highest_index)
			{
				// if there were already objects that were previously highest, adjust them
				if (this.highest_index < this.height_units)
				{
					for (i = 0; i < this.width_units; i++)
					{
						this.blockArray2d[i][this.highest_index].isHighestBlock = false;
						this.blockArray2d[i][this.highest_index].redraw();
					}
					o.isHighestBlock = true;
					this.highest_index = y_index;
				} else if (this.highest_index == this.height_units)
				{
					o.isHighestBlock = true;
				} else
				{
					o.isHighestBlock = true;
					this.highest_index = y_index;
				}
			}
		} else
		{
			if (o.leftBlock != null){o.leftBlock.rightBlock = null; o.leftBlock.redraw(); o.leftBlock = null;}
			if (o.rightBlock != null){o.rightBlock.leftBlock = null; o.rightBlock.redraw(); o.rightBlock = null;}
			if (o.aboveBlock != null){o.aboveBlock.belowBlock = null; o.aboveBlock.redraw(); o.aboveBlock = null;}
			if (o.belowBlock != null){o.belowBlock.aboveBlock = null; o.belowBlock.redraw(); o.belowBlock = null;}

			if (y_index < this.highest_index)
			{	
				// means this was never set, so nothing to do
			} else if (y_index == this.highest_index)
			{
				// find out if there are any more blocks at this height
				var other_found = false;

				for (i = 0; i < this.width_units; i++)
				{
					if (this.blockArray2d[i][this.highest_index] != null)
					{
						other_found = true;
						o.isHighestBlock = false;
						break;
					}
				}
				
				// if no other was found at this height, we must adjust the level down a notch
				if (!other_found)
				{
					o.isHighestBlock = false;
					this.highest_index++;
					if (this.highest_index < this.height_units)
					{
						for (i = 0; i < this.width_units; i++)
						{
							if (this.blockArray2d[i][this.highest_index] != null)
							{
								this.blockArray2d[i][this.highest_index].isHighestBlock = true;
								this.blockArray2d[i][this.highest_index].redraw();
							}
						}
					}
				}
			}
		}
	}

	window.BlockCompViewer = BlockCompViewer;
}(window));

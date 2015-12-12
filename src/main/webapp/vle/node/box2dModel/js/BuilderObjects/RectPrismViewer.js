(function (window)
{
	function RectPrismViewer (unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units)
	{
		
		this.initialize(unit_width_px, unit_height_px, unit_depth_px, width_units, height_units, depth_units);
	}
	var p = RectPrismViewer.prototype = new createjs.Container();
	p.Container_initialize = RectPrismViewer.prototype.initialize;

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
		this.currentHeight_units = 0;

		// create a 2d array and fill with nulls (references)
		var i, j, k, ti, tj, tk, index;
		this.blockArray = [];		
		
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
					}
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
		for (var i = 0; i < this.blockArray.length; i++)
		{
			if (this.blockArray[i] != null){
				this.blockArray[i].update_view_sideAngle(angle);
				// calculate an indices 0 to 5 from right to left, 0 to 5 top to bottom
				var point = new Point3D(this.blockArray[i].x_index-this.width_units/2, this.blockArray[i].y_index-this.height_units/2, -this.blockArray[i].depth_units/2);
				var npoint = point.rotateY(this.view_sideAngle);
				npoint = npoint.rotateX(-this.view_topAngle);
				this.blockArray[i].x = -npoint.x * this.unit_width_px;
				this.blockArray[i].y = npoint.y * this.unit_height_px;		
			}
		}
		this.redraw();
	}

	p.update_view_topAngle = function (angle)
	{
		this.view_topAngle = angle;
		this.updateProjected();
		this.updateProjected2d();
		for (var i = 0; i < this.blockArray.length; i++)
		{			
			if (this.blockArray[i] != null)
			{
				this.blockArray[i].update_view_topAngle(angle);
				var point = new Point3D(this.blockArray[i].x_index-this.width_units/2, this.blockArray[i].y_index-this.height_units/2, -this.blockArray[i].depth_units/2);
				var npoint = point.rotateY(this.view_sideAngle);
				npoint = npoint.rotateX(-this.view_topAngle);
				this.blockArray[i].x = -npoint.x * this.unit_width_px;
				this.blockArray[i].y = npoint.y * this.unit_height_px;
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
		g.beginFill("rgba(245,245,245,1.0)");
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
		for (var i = 0; i < this.blockArray.length; i++){
			if (this.blockArray[i] != null) count++;
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
	p.placeBlock = function (o, x, y)
	{

		var lo = o.parent.localToLocal(x, y, this); 
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
		//console.log("placeBlock", x_index, y_index);
		if (x_index >= 0 && x_index < this.width_units && y_index >= 0 && y_index < this.height_units)
		{
			// if o is not alread placed here in container add it
			if (!o.placed)
			{
				o.x_index = -1;
				o.y_index = -1;
				o.x_index_pre = -1; // before placing
				o.y_index_pre = -1; 
				this.addChild(o);
				
			} 
			//console.log("placeBlock, within bounds", o.placed, this.blockArray.length);
			// are we in a different location from before
			if (!o.placed || x_index != o.x_index_pre || y_index != o.y_index_pre)
			{
				var curheight = o.placed? this.currentHeight_units :  this.currentHeight_units + o.height_units;
				//var curheight = this.currentHeight_units + o.height_units;
				//console.log("placeBlock, moved, not placed",this.currentHeight_units,o.height_units , this.currentHeight_units + o.height_units, this.height_units);
				if (curheight <= this.height_units)
				{
					//console.log("within height limits");
					//place this object in the correct place in the array
					var i, underCount = 0;
					var index = this.blockArray.indexOf(o);
					if (index >= 0 && o.placed) this.blockArray.splice(index,1);
					for (i = 0; i < this.blockArray.length; i++){
						if (y_index < this.blockArray[i].y_index) underCount++
					}					
					this.addChildAt(o, underCount+2);
					this.blockArray.splice(underCount,0,o);
					o.correct = true;
					o.incorrect = false;	
					this.resetBlocks();
					o.highlightCorrect();	
					o.placed = true;					
				} else 
				{
					//console.log("outside height limits");
					o.highlightIncorrect();
					o.correct = false;
					o.incorrect = true;		
					o.x = rx; 
					o.y = ry;	
					o.placed = false;	
				}
				o.x_index_pre = x_index;
				o.y_index_pre = y_index;
			}
			
		} else
		{
			//console.log("placeBlock, out of bounds")
			// if o is contained here add it to parent of this, object viewer
			if (o.parent == this) 
			{
				//console.log("placeBlock, placed, control by parent")
				var go = this.localToLocal(o.x, o.y, o.parent);
				this.clearBlock(o);
				this.parent.addChild(o);
				o.x = go.x; 
				o.y = go.y;				
			}
		}
		return o.placed;
	}
	p.resetBlocks = function (){
		// reset x-indices and y-indices
		var y_offset = 0;
		for (i = 0; i < this.blockArray.length; i++){
			this.blockArray[i].x_index = (this.width_units - this.blockArray[i].width_units)/2;
			this.blockArray[i].y_index = this.height_units-y_offset-this.blockArray[i].height_units;
			y_offset += this.blockArray[i].height_units;
		}
		this.update_view_topAngle(this.view_topAngle);
		this.currentHeight_units = y_offset;
	}
		
	p.setBlock = function(o, overrideIsCorrect)
	{
		if (o.correct || (typeof overrideIsCorrect != "undefined" && overrideIsCorrect))
		{
			this.resetBlocks();
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
		o.placed = false;
		o.x_index = -1; o.y_index = -1;
		o.correct = false;
		o.incorrect = false;
		var index = this.blockArray.indexOf(o);
		if (index >= 0) this.blockArray.splice(index,1);
		this.removeChild(o);
		this.resetBlocks();
		o.highlightDefault();
		return true;
	}
	
	p.clearBlocks = function ()
	{
		var i;
		for (var i = 0; i < this.blockArray.length; i++)
		{
			var o = this.blockArray[i];
			o.placed = false;
			this.removeChild(o);
		}
		this.blockArray = [];	
		this.resetBlocks();	
	}
	window.RectPrismViewer = RectPrismViewer;
}(window));

(function (window)
{
    var Point3D = function(x,y,z) {
         this.x = x;
         this.y = y;
         this.z = z;
    }
  
    var p = Point3D.prototype;

    p.rotateX = function(rad) {
        var cosa, sina, y, z
           cosa = Math.cos(rad);
           sina = Math.sin(rad);
           y = this.y * cosa - this.z * sina;
           z = this.y * sina + this.z * cosa;
           return new Point3D(this.x, y, z);
       }
    
    p.rotateY = function(rad) {
           var cosa, sina, x, z;
           cosa = Math.cos(rad);
           sina = Math.sin(rad);
           z = this.z * cosa - this.x * sina;
           x = this.z * sina + this.x * cosa;
           return new Point3D(x,this.y, z);
       }
    
    p.rotateZ = function(rad) {
           var cosa, sina, x, y;
           cosa = Math.cos(rad);
           sina = Math.sin(rad);
           x = this.x * cosa - this.y * sina;
           y = this.x * sina + this.y * cosa;
           return new Point3D(x, y, this.z);
       }
    
    p.un_rotateX = function(point, rad)
    {
        var x, y;
    }

      p.project = function(viewWidth, viewHeight, fov, viewDistance) {
           var factor, x, y;
           factor = fov / (viewDistance + this.z);
           x = this.x * factor + viewWidth / 2;
           y = this.y * factor + viewHeight / 2;
           return new Point3D(x, y, this.z);
       }           
    window.Point3D = Point3D;
}(window));
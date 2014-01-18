function Myb2BuoyancyController() {
      Myb2BuoyancyController.Myb2BuoyancyController.apply(this, arguments);
   };

Box2D.inherit(Myb2BuoyancyController, Box2D.Dynamics.Controllers.b2Controller);
   Myb2BuoyancyController.prototype.__super = Box2D.Dynamics.Controllers.b2Controller.prototype;
   Myb2BuoyancyController.Myb2BuoyancyController = function () {
      Box2D.Dynamics.Controllers.b2Controller.b2Controller.apply(this, arguments);
      this.normal = new b2Vec2(0, (-1));
      this.offset = 0;
      this.initial_offset = this.offset;
      this.y = 0;
      this.density = 0;
      this.velocity = new b2Vec2(0, 0);
      this.linearDrag = 3;
      this.angularDrag = 1;
      this.useDensity = false;
      this.useWorldGravity = true;
      this.gravity = null;
      this.surfaceArea = 0;
   };
   Myb2BuoyancyController.prototype.MyAddBody = function(body){
      this.linearDrag = 3;
      this.AddBody(body);
   }
   Myb2BuoyancyController.prototype.Step = function (step) {
      if (!this.m_bodyList){
         this.offset = this.initial_offset;
         return;
      } 
      if (this.useWorldGravity) {
         this.gravity = this.GetWorld().GetGravity().Copy();
      }
      var offset = this.initial_offset;
      // find out if any are awake
      var any_awake = false;
      for (var i = this.m_bodyList; i; i = i.nextBody) {
        if (i.body.IsAwake() && (Math.abs(i.body.GetLinearVelocity().x) <= 0.00001 || Math.abs(i.body.GetLinearVelocity().y) <= 0.00001)) {
            //console.log(i.body.GetLinearVelocity().x, i.body.GetLinearVelocity().y);
            any_awake = true; break;
         }
      }
      if (!any_awake){
         this.linearDrag = 3;
         //return;
      } else {
         this.linearDrag = Math.min(this.linearDrag+0.02, 20); // increment the drag to ensure that the object stops
      }
      
      for (var i = this.m_bodyList; i; i = i.nextBody) {
         var body = i.body;
         body.percentSubmergedChangedFlag = false;
         body.percentSubmerged = 0;
         //if (body.IsAwake() == false) {
           // continue;
        // }
         if (any_awake && body.IsAwake() == false) body.SetAwake(true);
         var areac = new b2Vec2();
         var massc = new b2Vec2();
         var area = 0.0;
         var mass = 0.0;
         var total_area = 0;
         for (var fixture = body.GetFixtureList(); fixture; fixture = fixture.GetNext()) {
            var sc = new b2Vec2();
            var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, -1*(this.y + this.offset), body.GetTransform(), sc);
            //console.log(sarea, this.normal, -1*(this.y + this.offset), this.y, this.offset);
            if (sarea != fixture.percentSubmerged){
               body.percentSubmergedChangedFlag = true;
               fixture.percentSubmerged = sarea/fixture.area;
               if (typeof body.percentSubmerged2d !== "undefined") body.percentSubmerged2d[fixture.x_index][fixture.y_index] = fixture.percentSubmerged;
            }
            total_area += fixture.area;
           
            area += sarea;
            areac.x += sarea * sc.x;
            areac.y += sarea * sc.y;
            var shapeDensity = 0;
            if (this.useDensity) {
               shapeDensity = 1;
            }
            else {
               if (typeof fixture.materialSpaces !== "undefined" && typeof fixture.interiorSpaces !== "undefined" && typeof fixture.protectedSpaces !== "undefined" && typeof fixture.area !== "undefined"){
                  shapeDensity = (fixture.materialSpaces + fixture.interiorSpaces + fixture.protectedSpaces) / fixture.area;
               } else {
                  // if we don't have the details about the fixtures try to calculate
                  shapeDensity = Math.sqrt(this.surfaceArea);
                  if (shapeDensity == 0) depth = 5;
               }
            }
            mass += sarea * shapeDensity;
            massc.x += sarea * sc.x * shapeDensity;
            massc.y += sarea * sc.y * shapeDensity;

            // adjust offset based on the amount of object submerged
            if (this.surfaceArea > 0) { offset -= sarea * shapeDensity / this.surfaceArea;}
         }
         body.percentSubmerged = area/total_area;
         areac.x /= area;
         areac.y /= area;
         massc.x /= mass;
         massc.y /= mass;
         if (mass < Number.MIN_VALUE) continue;
         if (body.IsAwake()) {                 
            var buoyancyForce = this.gravity.GetNegative();
            buoyancyForce.Multiply(this.density * mass);
            body.ApplyForce(buoyancyForce, massc);
            var dragForce = body.GetLinearVelocityFromWorldPoint(massc);
            dragForce.Subtract(this.velocity);
            dragForce.Multiply((-this.linearDrag * mass));
            body.ApplyForce(dragForce, massc);
            body.ApplyTorque((-body.GetInertia() / body.GetMass() * mass * body.GetAngularVelocity() * this.angularDrag));
         }
      }
      this.offset = offset;
         
   }

   Myb2BuoyancyController.prototype.SetInitialOffset = function(offset)
   {
      this.offset = offset;
      this.initial_offset = offset;
   }

   Myb2BuoyancyController.prototype.ChangeOffset = function(doffset)
   {   
      this.initial_offset += doffset;
      this.offset += doffset;
   }

   Myb2BuoyancyController.prototype.SetY = function(y)
   {   
      this.y = y;
   }

   Myb2BuoyancyController.prototype.Draw = function (debugDraw) {
      if (!isNaN(this.offset)){
         var r = 1000;
         var p1 = new b2Vec2();
         var p2 = new b2Vec2();
         p1.x = this.normal.x * this.offset + this.normal.y * r;
         p1.y = -this.normal.y * (this.y + this.offset) - this.normal.x * r;
         p2.x = this.normal.x * this.offset - this.normal.y * r;
         p2.y = -this.normal.y * (this.y + this.offset) + this.normal.x * r;
         var color = new Box2D.Common.b2Color(0, 0, 1);
         debugDraw.DrawSegment(p1, p2, color);
      }
   }



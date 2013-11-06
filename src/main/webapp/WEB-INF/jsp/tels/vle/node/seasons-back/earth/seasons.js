(function() {

var seasons = {};
var root = this;
seasons.VERSION = '0.1.0';

//
// Utilities ...
//

function bind(scope, fn) {
    return function () {
        fn.apply(scope, arguments);
    };
}


function getRadioSelection (form_element) {
    for(var i = 0; i < form_element.elements.length; i++) {
        if (form_element.elements[i].checked) {
            return form_element.elements[i].value;
        }
    }
    return false;
}

function setRadioSelection (form_element, value) {
    for(var i = 0; i < form_element.elements.length; i++) {
        if (form_element.elements[i].value = value) {
            form_element.elements[i].checked = true;
        } else {
            form_element.elements[i].checked = false;
        }
    }
    return false;
}

//
// The Main Object: seasons.Scene

seasons.Scene = function(options) {
    options = options || {};

    this.debugging          = (options.debugging || false);

    // Setting up the scene ...
    
    this.scene              = SceneJS.withNode(options.theScene || "theScene");
    this.camera             = SceneJS.withNode(options.camera || "theCamera");
    this.canvas             = document.getElementById(options.canvas || "theCanvas");
    this.optics             = this.camera.get("optics");

    this.linked_scene       = (options.linked_scene || false);

    this.setAspectRatio();

    this.look               = SceneJS.withNode(options.look || "lookAt");
    
    this.circleOrbit        = SceneJS.withNode("earthCircleOrbitSelector");

    if (options.orbitGridSelector !== false) {
        this.orbitGridSelector  = SceneJS.withNode(options.orbitGridSelector || "orbit-grid-selector");
    };
        
    if (options.earth_tilt !== false) {
        this.earth_tilt  = SceneJS.withNode(options.earth_tilt || "earthRotationalAxisQuaternion");
    };

    this.look_at_selection  = (options.look_at_selection || 'orbit');
    
    if (options.latitude_line) {
        this.latitude_line = new LatitudeLine(options.latitude_line)
    };

    if (options.earth_surface_location) {
        this.earth_surface_location = new EarthSurfaceLocationIndicator("earth-surface-location-destination")
    };

    if (options.choose_view === false) {
        this.choose_view = false;
    } else {
        this.choose_view = document.getElementById(options.choose_view || "choose-view");
        this.view_selection = getRadioSelection(this.choose_view);
    };

    if (options.orbital_grid === false) {
        this.orbital_grid = false;
    } else {
        this.orbital_grid = document.getElementById(options.orbital_grid || "orbital-grid");
    };

    if (options.earth_pointer === false) {
        this.earth_pointer = false;
    } else {
        this.earth_pointer      = SceneJS.withNode(options.earth_pointer || "earth-pointer");
    };

    if (options.circle_orbit === false) {
        this.circle_orbit = false;
    } else {
        this.circle_orbit = document.getElementById(options.circle_orbit || "circle-orbit");
    };

    this.earth_label        = (options.earth_label || false);
    if (this.earth_label) {
        this.earth_info_label   = document.getElementById(options.earth_info_label || "earth-info-label");
    };

    this.choose_tilt        = (options.choose_tilt || false);
    if (this.choose_tilt) {
        this.choose_tilt = document.getElementById(options.choose_tilt || "choose-tilt");
    };
    
    this.selected_tilt = document.getElementById(options.selected_tilt || "selected-tilt");

    this.earth_position      = SceneJS.withNode(options.earth_position || "earth-position");
    this.earth_rotation      = SceneJS.withNode(options.earth_rotation || "earth-rotation");
    
    if (options.earth_sun_line === false) {
        this.earth_sun_line = false;
    } else {
        this.earth_sun_line = true;
        this.earth_sun_line_rotation    = SceneJS.withNode(options.earth_sun_line_rotation || "earth-sun-line-rotation");
        this.earth_sun_line_translation = SceneJS.withNode(options.earth_sun_line_translation || "earth-sun-line-translation");

        this.earth_sun_line_rotation =    SceneJS.withNode(options.earth_sun_line_rotation || "earth-sun-line-rotation");
        this.earth_sun_line_translation = SceneJS.withNode(options.earth_sun_line_translation || "earth-sun-line-translation");
        this.earth_sun_line_scale =       SceneJS.withNode(options.earth_sun_line_scale || "earth-sun-line-scale");
    };
    

    this.ellipseOrbitSelector = SceneJS.withNode(options.ellipseOrbitSelector || "earthEllipseOrbitSelector");
    this.earthTextureSelector = SceneJS.withNode(options.earthTextureSelector || "earthTextureSelector");

    this.canvas_properties  = function () {
        return this.canvas.getBoundingClientRect();
    };

    this.sun_yaw =   0;
    this.sun_pitch = 0;

    this.earth_yaw =   0;
    this.earth_pitch = 0;

    this.normalized_earth_eye      =   normalized_initial_earth_eye;

    this.normalized_earth_eye_side =   normalized_initial_earth_eye_side;
    this.normalized_earth_eye_top  =   normalized_initial_earth_eye_side;

    // Some useful variables
    
    this.month_data = {
        "jan": { index:  0, num:   1, short_name: 'Jan', long_name: 'January' },
        "feb": { index:  1, num:   2, short_name: 'Feb', long_name: 'February' },
        "mar": { index:  2, num:   3, short_name: 'Mar', long_name: 'March' },
        "apr": { index:  3, num:   4, short_name: 'Apr', long_name: 'April' },
        "may": { index:  4, num:   5, short_name: 'May', long_name: 'May' },
        "jun": { index:  5, num:   6, short_name: 'Jun', long_name: 'June' },
        "jul": { index:  6, num:   7, short_name: 'Jul', long_name: 'July' },
        "aug": { index:  7, num:   8, short_name: 'Aug', long_name: 'August' },
        "sep": { index:  8, num:   9, short_name: 'Sep', long_name: 'September' },
        "oct": { index:  9, num:  10, short_name: 'Oct', long_name: 'October' },
        "nov": { index: 10, num:  11, short_name: 'Nov', long_name: 'Novemeber' },
        "dec": { index: 11, num:  12, short_name: 'Dec', long_name: 'December' }
    };

    this.month_names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

    this.seasons = ["Fall", "Winter", "Spring", "Summer"];

    // Setting up callbacks for ...
    var self = this;
    
    // Selecting a Perspective: top, side 
    this.choose_view = document.getElementById(options.choose_view || "choose-view");
    
    if (this.choose_view) {
        this.choose_view.onchange = (function() {
            return function() {
                self.perspectiveChange(this);
            }
        })();
        this.choose_view.onchange();
    }
    
    // Selecting the time of year: jun, sep, dec, mar
    this.choose_month = document.getElementById(options.choose_month || "choose-month");

    // optional dom element to update textContent with long name of month
    this.selected_month = document.getElementById(options.selected_month || "selected-month");

    this.month = this.choose_month.value
    this.choose_month.onchange = (function() {
        return function() {
            self.timeOfYearChange(this);
        }
    })();
    this.choose_month.onchange();

    // Circular Orbital Path selector ...
    if (this.circle_orbit) {
        this.circle_orbit.onchange = (function() {
            return function() {
                self.circleOrbitPathChange(this);
            }
        })();
        this.circle_orbit.onchange();
    };
    
    // Orbital Grid selector ...
    if (this.orbital_grid) {
        this.orbital_grid.onchange = (function() {
            return function() {
                self.orbitalGridChange(this);
            }
        })();
        this.orbital_grid.onchange();
    }

    // Selecting an Earth Tilt: yes, no 
    if (this.choose_tilt) {
        this.tilt = getRadioSelection(this.choose_tilt);
        this.choose_tilt.onchange = (function() {
            return function() {
                self.updateTilt(this);
            }
        })();
        this.choose_tilt.onchange();
    } else {
        this.tilt = true;
    }

    //
    // Rendering bits ...
    //
    
    this.earthLabel();
    this.earthPointer();

    this.ellipseOrbitSelector.set("selection", [2]);
    this.earthTextureSelector.set("selection", [1]);

    //
    // Mouse interaction bits ...
    //
    
    this.earth_lastX;
    this.earth_lastY;

    this.earth_yaw          = normalized_initial_earth_eye.x;
    this.earth_pitch        = normalized_initial_earth_eye.y;

    this.sun_lastX;
    this.sun_lastY;

    this.sun_yaw            = 0;
    this.sun_pitch          = 0;


    this.dragging           = false;

    this.canvas.addEventListener('mousedown', (function() {
        return function(event) {
            self.mouseDown(event, this);
        }
    })(), true);

    this.canvas.addEventListener('mouseup', (function() {
        return function(event) {
            self.mouseUp(event, this);
        }
    })(), true);

    this.canvas.addEventListener('mouseout', (function() {
        return function(event) {
            self.mouseOut(event, this);
        }
    })(), true);

    this.canvas.addEventListener('mousemove', (function() {
        return function(event) {
            self.mouseMove(event, this);
        }
    })(), true);
    
};

seasons.Scene.prototype.toJSON = function() {
    var state = {
        month: this.month,
        circle_orbit: this.circle_orbit ? this.circle_orbit.checked : this.circle_orbit,
        orbital_grid: this.orbital_grid ? this.orbital_grid.checked : this.orbital_grid,
        tilt: this.choose_tilt ? getRadioSelection(this.choose_tilt) : this.choose_tilt, 
        view_selection: this.view_selection,
        look_at_selection: this.look_at_selection,
        look_at: {
            eye: JSON.stringify(this.look.get("eye")),
            look: JSON.stringify(this.look.get("look")),
            up: JSON.stringify(this.look.get("up")),
        }
    };
    return state
};

seasons.Scene.prototype.toJSONStr = function() {
    return JSON.stringify(this.toJSON());
};

seasons.Scene.prototype.fromJSON = function(state) {
    this._timeOfYearChange(state.month);
    this._circleOrbitPathChange(state.circle_orbit);
    this._orbitalGridChange(state.orbital_grid);
    this._perspectiveChange(state.view_selection);
    this.look_at_selection = state.look_at_selection;
    this.look.set("eye", JSON.parse(state.look_at.eye));
    this.look.set("up", JSON.parse(state.look_at.up));
    this.look.set("look", JSON.parse(state.look_at.look));
};

seasons.Scene.prototype.fromJSONstr = function(json_state_str) {
    this.fromJSON(JSON.parse(json_state_str));
};

seasons.Scene.prototype.render = function() {
    this.scene.render();
};

seasons.Scene.prototype.updateTilt = function(form_element) {
    this._updateTilt(getRadioSelection(form_element));
};

seasons.Scene.prototype._updateTilt = function(tilt) {
    this.tilt = tilt;
    var tilt_str;
    switch (tilt) {
        case "yes":
            this.earth_tilt.set("rotation", { x : 0, y : 0, z : 1, angle : 23.5 });
            tilt_str = "Tilted";
            break;

        case "no":
            this.earth_tilt.set("rotation", { x : 0, y : 0, z : 1, angle : 0 });
            tilt_str = "No Tilt";
            break;
    };
    if (this.selected_tilt) {
        this.selected_tilt.textContent = tilt_str;
    }
};

seasons.Scene.prototype.get_earth_position = function() {
    var ep = this.earth_position.get();
    return [ep.x, ep.y, ep.z];
}

seasons.Scene.prototype.set_earth_position = function(newpos) {
    this.earth_position.set({ x: newpos[0], y: newpos[1], z: newpos[2] })
}

seasons.Scene.prototype.get_earth_distance = function() {
    return earth_ellipse_distance_from_sun_by_month(this.month);
}

seasons.Scene.prototype.get_solar_flux = function() {
    return earth_ephemerides_solar_constant_by_month(this.month);
}

seasons.Scene.prototype.get_normalized_earth_eye = function() {
    var normalized_eye = {};
    var eye = this.lookat.get("eye");
    var ep = this.earth_position.get();
    normalized_eye.x = eye.x - ep.x;
    normalized_eye.y = eye.y - ep.y;
    normalized_eye.z = eye.z - ep.z;
    return normalized_eye;
}

seasons.Scene.prototype.set_normalized_earth_eye = function(normalized_eye) {
    var eye = {}
    var ep = this.earth_position.get();
    eye.x = normalized_eye.x + ep.x;
    eye.y = normalized_eye.y + ep.y;
    eye.z = normalized_eye.z + ep.z;
    var eye = this.look.set("eye", eye);
}

seasons.Scene.prototype.update_earth_look_at = function(normalized_eye) {
    var eye = {};
    var ep = this.earth_position.get();
    eye.x = normalized_eye.x + ep.x;
    eye.y = normalized_eye.y + ep.y;
    eye.z = normalized_eye.z + ep.z;
    this.look.set("look", ep );
    this.look.set("eye",  eye );
}

seasons.Scene.prototype.mouseDown = function(event, element) {
    switch(this.look_at_selection) {
        case "orbit":
            this.sun_lastX = event.clientX;
            this.sun_lastY = event.clientY;
            break;
            
        case "earth":
            this.earth_lastX = event.clientX;
            this.earth_lastY = event.clientY;
            break;
    }
    this.dragging = true;
    this.canvas.style.cursor = "pointer";
}

seasons.Scene.prototype.mouseUp = function(event, element) {
    this.dragging = false;
}


seasons.Scene.prototype.mouseOut = function(event, element) {
    this.dragging = false;
}


seasons.Scene.prototype.mouseMove = function(event, element, new_yaw, new_pitch, linked) {
    if (this.dragging) {

        this.canvas.style.cursor = "pointer";
        var look, eye, eye4, neweye;
        var up_downQ, up_downQM, left_rightQ, left_rightQM;
        var f, up_down_axis, angle, new_yaw, new_pitch;
        
        var normalized_eye;

        switch(this.look_at_selection) {
            case "orbit":
                if (!new_yaw) {                                  
                    new_yaw   = (event.clientX - this.sun_lastX) * -0.2;
                    new_pitch = (event.clientY - this.sun_lastY) * -0.2;
                    this.sun_lastX = event.clientX;
                    this.sun_lastY = event.clientY;
                };
                
                // test for NaN
                if (new_yaw !== new_yaw) new_yaw = 0;
                if (new_yaw !== new_yaw) new_pitch = 0;

                this.sun_yaw   += new_yaw;
                this.sun_pitch += new_pitch;

                switch(this.view_selection) {
                    case "top":
                        eye4 = [initial_sun_eye_top.x, initial_sun_eye_top.y, initial_sun_eye_top.z, 1];
                        break;

                    case "side":
                        eye4 = [initial_sun_eye_side.x, initial_sun_eye_side.y, initial_sun_eye_side.z, 1];
                        break;
                }

                left_rightQ = new SceneJS.Quaternion({ x : 0, y : 1, z : 0, angle : this.sun_yaw });
                left_rightQM = left_rightQ.getMatrix();

                neweye = SceneJS._math_mulMat4v4(left_rightQM, eye4);
                console.log("dragging: yaw: " + sprintf("%3.0f", this.sun_yaw) + ", eye: x: " + 
                    sprintf("%3.0f", neweye[0]) + " y: " + sprintf("%3.0f", neweye[1]) + " z: " + sprintf("%3.0f", neweye[2]));

                eye4 = SceneJS._math_dupMat4(neweye);

                up_downQ = new SceneJS.Quaternion({ x : left_rightQM[0], y : 0, z : left_rightQM[2], angle : this.sun_pitch });
                up_downQM = up_downQ.getMatrix();

                neweye = SceneJS._math_mulMat4v4(up_downQM, eye4);

                console.log("dragging: pitch: " + sprintf("%3.0f", this.sun_pitch) + ", eye: x: " + 
                    sprintf("%3.0f", neweye[0]) + " y: " + sprintf("%3.0f", neweye[1]) + " z: " + sprintf("%3.0f", neweye[2]) );

                this.look.set("eye",  { x: neweye[0], y: neweye[1], z: neweye[2] } );
                break;

            case "earth":
                if (!new_yaw) {
                    new_yaw   = (event.clientX - this.earth_lastX) * -0.2;
                    new_pitch = (event.clientY - this.earth_lastY) * -0.2;

                    this.earth_lastX = event.clientX;
                    this.earth_lastY = event.clientY;
                };
                
                // test for NaN
                if (new_yaw !== new_yaw) new_yaw = 0;
                if (new_yaw !== new_yaw) new_pitch = 0;
        
                normalized_eye = this.normalized_earth_eye;
                
                this.earth_yaw   += new_yaw;
                this.earth_pitch += new_pitch;
            
                eye4 = [normalized_initial_earth_eye_side.x, normalized_initial_earth_eye_side.y, normalized_initial_earth_eye_side.z, 1];

                left_rightQ = new SceneJS.Quaternion({ x : 0, y : 1, z : 0, angle : this.earth_yaw });
                left_rightQM = left_rightQ.getMatrix();

                neweye = SceneJS._math_mulMat4v4(left_rightQM, eye4);

                console.log("dragging: yaw: " + sprintf("%3.0f", this.earth_yaw) + ", eye: x: " + 
                    sprintf("%3.0f", neweye[0]) + " y: " + sprintf("%3.0f", neweye[1]) + " z: " + sprintf("%3.0f", neweye[2]));

                eye4 = SceneJS._math_dupMat4(neweye);

                up_downQ = new SceneJS.Quaternion({ x : left_rightQM[0], y : 0, z : left_rightQM[2], angle : this.earth_pitch });
                up_downQM = up_downQ.getMatrix();

                neweye = SceneJS._math_mulMat4v4(up_downQM, eye4);

                console.log("dragging: pitch: " + sprintf("%3.0f", this.earth_pitch) + ", eye: x: " + 
                    sprintf("%3.0f", neweye[0]) + " y: " + sprintf("%3.0f", neweye[1]) + " z: " + sprintf("%3.0f", neweye[2]));

                this.normalized_earth_eye =  { x: neweye[0], y: neweye[1], z: neweye[2] };
                this.set_normalized_earth_eye(this.normalized_earth_eye);
                break;
        };
        
        console.log("");
        this.earthLabel();
        // if (this.linked_scene && !linked) {
        //     this.linked_scene.dragging = true;
        //     this.linked_scene.mouseMove(event, element, new_yaw, new_pitch, true);
        //     this.linked_scene.dragging = false;
        // };
    };
};

seasons.Scene.prototype.earthPointer = function() {
    if (this.earth_pointer) {
        var earth_pos = this.get_earth_position();
        this.earth_pointer.set({ x: earth_pos[0], y: earth_pos[1], z: earth_pos[2] });

    }
};

seasons.Scene.prototype.earthLabel = function() {
    var getY = function getY(el) {
        var ypos = 0;
        while( el != null ) {
            ypos += el.offsetTop;
            el = el.offsetParent;
        }
        return ypos;
    };
    var getX = function getX(el) {
        var xpos = 0;
        while( el != null ) {
            xpos += el.offsetLeft;
            el = el.offsetParent;
        }
        return xpos;
    };

    if (this.earth_label) {
        this.earth_info_label.style.top = this.canvas_properties().top + window.pageYOffset + 5 + "px";
        // this.earth_info_label.style.left = this.canvas_properties().left + getX(this.canvas) + window.pageXOffset + 5 + "px";
        // this.earth_info_label.style.left = getX(this.canvas) + 5 + "px";
        // this.earth_info_label.style.left = "5px";
        // this.earth_info_label.style.top = getY(this.canvas) + 5 + "px";
        this.earth_info_label.style.left = getX(this.canvas) - getX(document.getElementById("content")) + 15 + "px";
        var edist = earth_ellipse_distance_from_sun_by_month(this.month);
        var solar_flux = earth_ephemerides_solar_constant_by_month(this.month);
        var labelStr = "";
        labelStr += sprintf("Earth Distance: %6.0f km<br>", edist * scale_factor);
        labelStr += sprintf("Solar Radiation:  %4.1f W/m2<br>", solar_flux);
        if (this.debugging) {
            var earth_pos = this.get_earth_position();
            var eye_pos = this.look.get("eye");
            var look_pos = this.look.get("look");

            labelStr += "<br>debug:";
            labelStr += sprintf("<br>earth x: %6.0f   y: %6.0f   z: %6.0f", earth_pos[0], earth_pos[1], earth_pos[2]);
            labelStr += sprintf("<br>look  x: %6.0f   y: %6.0f   z: %6.0f", look_pos.x, look_pos.y, look_pos.z);
            labelStr += sprintf("<br>eye   x: %6.0f   y: %6.0f   z: %6.0f", eye_pos.x, eye_pos.y, eye_pos.z);

            if ( this.look_at_selection === 'orbit') {
                if (this.earth_pointer) {
                    var lpos = this.earth_pointer.get();
                    labelStr += sprintf("<br>point x: %6.0f y: %6.0f z: %6.0f", lpos.x, lpos.y, lpos.z);
                }
            };
        };
        this.earth_info_label.innerHTML = labelStr;
    };
};


seasons.Scene.prototype.setAspectRatio = function() {
    this.optics.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.set("optics", this.optics);
}


seasons.Scene.prototype.setCamera = function(settings) {
    for(prop in settings) this.optics[prop] = settings[prop];
    this.camera.set("optics", optics);
}


seasons.Scene.prototype.perspectiveChange = function(form_element) {
    this._perspectiveChange(getRadioSelection(form_element));
};

seasons.Scene.prototype._perspectiveChange = function(view_selection) {
    this.view_selection = view_selection;
    switch(this.view_selection) {
        case "top":
        switch(this.look_at_selection) {
            case "orbit":
                this.look.set("eye",  initial_sun_eye_top );
                this.look.set("look", { x: sun_x_pos, y : 0.0, z : 0.0 } );
                this.look.set("up",  { x: 0.0, y: 1.0, z: 0.0 } );
                break;

            case 'earth':
                this.look.set("eye",  initial_earth_eye_top );
                this.look.set("look", { x: earth_x_pos, y : 0.0, z : 0.0 } );
                this.look.set("up",  { x: 0.0, y: 1.0, z: 0.0 } );
            
                this.update_earth_look_at(normalized_initial_earth_eye_top);
                break;

            case "surface" :
            break;
        }
        
        break;

        case "side":
        switch(this.look_at_selection) {
            case "orbit":
                this.look.set("eye",  initial_sun_eye_side );
                this.look.set("look", { x: sun_x_pos, y : 0.0, z : 0.0 } );
                this.look.set("up",   { x: 0.0, y: 1.0, z: 0.0 } );
                break;

            case 'earth':
                this.look.set("eye",  initial_earth_eye_side );
                this.look.set("look", { x: earth_x_pos, y : 0.0, z : 0.0 } );
                this.look.set("up",  { x: 0.0, y: 1.0, z: 0.0 } );
            
                this.update_earth_look_at(normalized_initial_earth_eye_side);
                break;

            case "surface" :
            break;
        }
        
        break;
  }

  if (this.linked_scene) {
      this.linked_scene._perspectiveChange(this.view_selection);
  };
}


seasons.Scene.prototype.setEarthSunLine = function() {
    var scale = {};
    var distance2 = earth_ellipse_distance_from_sun_by_month(this.month) / 2;
    // var distance = earth_ephemerides_datum_by_month('jun').rg * au2km * factor;
    
    switch(this.month) {
        case "dec":
        this.earth_sun_line_rotation.set("angle", 1.0030);
        this.earth_sun_line_translation.set({ x: -distance2 , y: 0.0, z: 0 });
        scale.x = distance2;
        switch(this.look_at_selection) {
            case "orbit":
            scale.y = sun_earth_line_size_large;
            scale.z = sun_earth_line_size_large;
            break;

            case "earth":
            scale.y = sun_earth_line_size_med;
            scale.z = sun_earth_line_size_med;
            break;
        }
        break;

        case "sep":
        this.earth_sun_line_rotation.set("angle", -2.4025);
        this.earth_sun_line_translation.set({ x: sun_x_pos, y: 0.0, z: -distance2 });
        scale.z = distance2 * 1.1;
        switch(this.look_at_selection) {
            case "orbit":
            scale.x = sun_earth_line_size_large;
            scale.y = sun_earth_line_size_large;
            break;

            case "earth":
            // scale.x = sun_earth_line_size_large / 400;
            // scale.y = sun_earth_line_size_large / 400;
            scale.x = sun_earth_line_size_med;
            scale.y = sun_earth_line_size_med;
            break;
        }
        break;

        case "jun":
        this.earth_sun_line_rotation.set("angle", 0);
        this.earth_sun_line_translation.set({ x: distance2 , y: 0.0, z: 0 });
        scale.x = distance2;
        switch(this.look_at_selection) {
            case "orbit":
            scale.y = sun_earth_line_size_large;
            scale.z = sun_earth_line_size_large;
            break;

            case "earth":
            scale.y = sun_earth_line_size_med;
            scale.z = sun_earth_line_size_med;
            break;
        }
        break;

        case "mar":
        this.earth_sun_line_rotation.set("angle", 182.4025);
        this.earth_sun_line_translation.set({ x: sun_x_pos, y: 0.0, z: distance2 });
        scale.z = distance2 * 1.0004;
        switch(this.look_at_selection) {
            case "orbit":
            scale.x = sun_earth_line_size_large;
            scale.y = sun_earth_line_size_large;
            break;

            case "earth":
            scale.x = sun_earth_line_size_med;
            scale.y = sun_earth_line_size_med;
            break;
        }
        break;
    }
    this.earth_sun_line_scale.set(scale);
    if (this.linked_scene) {
        this.linked_scene.setEarthSunLine();
    };
}


seasons.Scene.prototype.timeOfYearChange = function(form_element) {
    this._timeOfYearChange(this.choose_month.value);
};

seasons.Scene.prototype._timeOfYearChange = function(month) {
    var mi_1 = this.month_data[this.month].index;
    this.month = month;
    var mi_2 = this.month_data[month].index;
    if (mi_2 < mi_1) mi_2 = mi_2 + 12;
    var rotation_increment = (mi_2 - mi_1) * 30;

    this.set_earth_position(earth_ellipse_location_by_month(this.month));

    this._perspectiveChange(this.view_selection);
    this.earth_rotation.set("angle", this.earth_rotation.get("angle") + rotation_increment);
    this.setEarthSunLine();
    this.earthLabel();
    this.earthPointer();
    if (this.selected_month) {
        this.selected_month.textContent = this.month_data[this.month].long_name;
    };
    if (this.linked_scene) {
        this.linked_scene._timeOfYearChange(month);
    };
}


// Orbital Paths Indicators

seasons.Scene.prototype.circleOrbitPathChange = function(checkbox) {
    this._circleOrbitPathChange(checkbox.checked);
};

seasons.Scene.prototype._circleOrbitPathChange = function(circle_orbit) {
  if (circle_orbit) {
      switch(this.look_at_selection) {
         case "orbit": this.circleOrbit.set("selection", [2]);
          break;
         case 'earth': this.circleOrbit.set("selection", [1]);
          SceneJS.withNode("earthCircleOrbitSelector").set("selection", [1]);
          break;
      }
  } else {
      this.circleOrbit.set("selection", [0]);
  }
};


// Orbital Grid

seasons.Scene.prototype.orbitalGridChange = function(checkbox) {
  this._orbitalGridChange(checkbox.checked)
};

seasons.Scene.prototype._orbitalGridChange = function(orbital_grid) {
  if (orbital_grid) {
      switch(this.look_at_selection) {
          case "orbit":
              this.orbitGridSelector.set("selection", [2]);
              break;

          case 'earth':
              this.orbitGridSelector.set("selection", [1]);
              break;

          case "surface" :
          break;
      }
  } else {
      this.orbitGridSelector.set("selection", [0]);
  };
  if (this.linked_scene) {
      this.linked_scene._orbitalGridChange(orbital_grid);
  };
};

var seasonsActivity = {};

seasons.Activity = function(options) {
    this.version = options.version;
    this.scenes = options.scenes;
};

seasons.Activity.prototype.toJSON = function() {
    var scenes= {};
    scenes.scene1 = this.scenes.scene1.toJSON();
    if (this.version !== "1.1") {
        scenes.scene3 = this.scenes.scene3.toJSON();
    }
    return { 
        version: this.version,
        scenes: scenes,
        table: experimentDataToJSON()
    };
};

seasons.Activity.prototype.fromJSON = function(state) {
    switch (state.version) {
        case 1.1:
        this.scenes.scene.fromJSON(state.scenes.scene);
        break;

        case 1.2:
        this.scenes.scene1.fromJSON(state.scenes.scene1);
        this.scenes.scene3.fromJSON(state.scenes.scene3);
        experimentDataFromJSON(state.table);
        break;

        case 1.3:
        this.scenes.scene1.fromJSON(state.scenes.scene1);
        this.scenes.scene3.fromJSON(state.scenes.scene3);
        experimentDataFromJSON(state.table);
        break;
    }
};

// export namespace
if (root !== 'undefined') root.seasons = seasons;
})();

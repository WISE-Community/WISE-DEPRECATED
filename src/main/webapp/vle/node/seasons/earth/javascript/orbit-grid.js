
// Orbit Grid

var grid = function(scale, segments) {
    var points = [];
    var p;
    var grid_increment = scale * 2 / segments;
    for (var i = 0; i <= segments; i++) {
        p = i * grid_increment - scale;
        points.push(p, 0, -scale);
        points.push(p, 0, +scale);
        points.push(-scale, 0, p);
        points.push(+scale, 0, p);
    }
    return points;
}

var orbit_grid_orbit_positions = grid(earth_orbital_radius_km, 10);
var orbit_grid_orbit_indices = [];
var orbit_grid_orbit_lines = orbit_grid_orbit_positions.length / 3;
for (var i = 0; i < orbit_grid_orbit_lines; i++) { orbit_grid_orbit_indices.push(i) };

var orbit_grid_earth_positions = grid(earth_radius_km * 2.5, 30);
var orbit_grid_earth_indices = [];
var orbit_grid_earth_lines = orbit_grid_earth_positions.length / 3;
for (var i = 0; i < orbit_grid_earth_lines; i++) { orbit_grid_earth_indices.push(i) };

var orbitGrid = SceneJS.createNode({

    type: "library",
    
    nodes: [
        
        {
            type: "material",
            id: "orbit-grid",
            baseColor:      { r: 0.4, g: 0.6, b: 0.4 },
            specularColor:  { r: 0.4, g: 0.6, b: 0.4 },
            specular:       1.0,
            shine:          2.0,
            emit:           1.0,

            nodes: [
            
                {
                    type: "translate",
                    x: sun_x_pos,
                    y: 0,
                    z: 0,

                    nodes: [ 
                        {
                            type: "scale",
                            x: 1,
                            y: 0,
                            z: 1,
                            
                            nodes: [

                                {

                                    type: "selector",
                                    id: "orbit-grid-selector",
                                    selection: [2],
                                    nodes: [ 
                        
                                        // 0: off
                         
                                        {  },

                                        // 1: on: orbit grid for Orbit view
                        
                                        {
                                            type: "geometry",
                                            id: "orbit-grid-orbit-geometry",
                                            primitive: "lines",

                                            positions: orbit_grid_orbit_positions,
                                            indices : orbit_grid_orbit_indices

                                        }                    
                                        
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
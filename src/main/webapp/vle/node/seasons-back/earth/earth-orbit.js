
//  Circular Orbit

var earth_circle_orbit_segments = 1024;

var circlePoints = function(scale) {
    var points = [];
    var pi2 = Math.PI * 2;
    var increment = pi2 / earth_circle_orbit_segments;
    var angle = 0;
    if (typeof(scale) === "number") {
        for (var i = 0; i < earth_circle_orbit_segments; i++, angle += increment) {
            points.push(Math.sin(angle) * scale, 0, Math.cos(angle) * scale);
        }
    } else {
        for (var i = 0; i < earth_circle_orbit_segments; i++, angle += increment) {
            points.push(Math.sin(angle), 0, Math.cos(angle));
        }
    }
    return points;
}

var earth_circle_orbit_positions = circlePoints(earth_orbital_radius_km);
var earth_circle_orbit_indices = [];
for (var i = 0; i < earth_circle_orbit_segments; i++) { earth_circle_orbit_indices.push(i) };

var earth_circle_location_by_month = function(month) {
    var day2 = 0;
    var loc = [earth_circle_orbit_positions[day2], earth_circle_orbit_positions[day2 + 1]];
    switch(month) {
        case "dec":
        day2 = 182 * 3;
        loc = [earth_circle_orbit_positions[day2] + earth_orbital_radius_km, 0, earth_circle_orbit_positions[day2 + 2]];
        break;
        case "mar":
        day2 = 273 * 3;
        loc = [earth_circle_orbit_positions[day2] + earth_orbital_radius_km, 0, earth_circle_orbit_positions[day2 + 2]];
        break;
        case "jun":
        day2 = 0;
        loc = [earth_circle_orbit_positions[day2] + earth_orbital_radius_km, 0, earth_circle_orbit_positions[day2 + 2]];
        break;
        case "sep":
        day2 = 91 * 3;
        loc = [earth_circle_orbit_positions[day2] + earth_orbital_radius_km, 0, earth_circle_orbit_positions[day2 + 2]];
        break;
    }
    return loc;
}

var earthCircleOrbit = SceneJS.createNode({
    type: "library",    
    nodes: [
        {
            id: "earthCircleOrbit",
            type: "translate",
            x: sun_x_pos,
            y: 0,
            z: 0,
            nodes: [ 
                {
                    type: "scale",
                    x: 1,
                    y: 1,
                    z: 1,
                    nodes: [ 
                    
                        {
                            type: "node",
                            
                            flags: {
                                transparent: true
                            },
                            
                            nodes: [
                                { 
                    
                                    type: "material",
                    
                                    baseColor:          { r: 1.0, g: 0.01, b: 1.0 },
                                    specularColor:      { r: 1.0, g: 0.01, b: 1.0 },
                                    specular:           1.0,
                                    shine:              2.0,
                                    emit:               20.0,
                    
                                    nodes: [
                            
                                        {

                                            type: "selector",
                                            id: "earthCircleOrbitSelector",
                                            selection: [1],
                                            nodes: [ 

                                                {  },
                                        
                                                {
                            
                                                    type: "disk", 
                                                    id: "earth-in-space-circular-orbital-path" ,                                         
                                                    radius: earth_orbital_radius_km,
                                                    innerRadius : earth_orbital_radius_km - earth_orbit_line_size_med,
                                                    height: earth_orbit_line_size_med,
                                                    rings: 360
                                                },
                                    
                                                {
                            
                                                    type: "disk",                                           
                                                    id: "sun-earth-circular-orbital-path" ,                                         
                                                    radius: earth_orbital_radius_km,
                                                    innerRadius : earth_orbital_radius_km - earth_orbit_line_size_large,
                                                    height: earth_orbit_line_size_large,
                                                    rings: 360
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
        }
    ]
});

//  Elliptical Orbit

var earth_ellipse_orbit_segments = 1024;

var ellipse = function(scale) {
    var points = [];
    var pi2 = Math.PI * 2;
    var increment = pi2 / earth_ellipse_orbit_segments;
    var angle = 0;
    if (typeof(scale) === "number") {
        for (var i = 0; i < earth_ellipse_orbit_segments; i++, angle += increment) {
            points.push(Math.sin(angle) * scale, 0, Math.cos(angle) * scale);
        }
    } else {
        for (var i = 0; i < earth_ellipse_orbit_segments; i++, angle += increment) {
            points.push(Math.sin(angle), 0, Math.cos(angle));
        }
    }
    return points;
}

var earth_ellipse_orbit_positions = circlePoints(earth_orbital_radius_km);
var earth_ellipse_orbit_indices = [];
for (var i = 0; i < earth_circle_orbit_segments; i++) { earth_ellipse_orbit_indices.push(i) };

var earth_ellipse_points = function(index) {
    earth_orbital_radius_km
    var y = (1 / earthOrbitData.semiMajorAxis) * Math.sin(index * 2 * Math.PI);
    var x =  earthOrbitData.semiMajorAxis * Math.cos(index * 2 * Math.PI);

    x = x * earth_orbital_radius_km  + sun_focus * 2;
    y = y * earth_orbital_radius_km;

    // x = x * au2km * factor - sun_focus * 2;
    // y = y * au2km * factor;

    return [ x, 0, y ];
}

var earth_ellipse_location_by_month = function(month) {
    var ellipse;
    var month_rotation = 0;
    switch(month) {
        case "jun":
        ellipse = earth_ellipse_points(0/365 - month_rotation);
        break;

        case "sep":
        ellipse = earth_ellipse_points(274/365 - month_rotation);
        break;

        case "dec":
        ellipse = earth_ellipse_points(182/365 - month_rotation);
        break;

        case "mar":
        ellipse = earth_ellipse_points(91/365 - month_rotation);
        break;
    }
    return ellipse;
}

var earth_ellipse_distance_from_sun_by_month = function(month) {
    var ep = earth_ellipse_location_by_month(month);
    var distance = Math.sqrt(ep[0] * ep[0] + ep[1] * ep[1] + ep[2] * ep[2])
    return distance;
}

var earth_ellipse_solar_constant_by_month = function(month) {
    var ep = earth_ellipse_location_by_month(month);
    var distance = Math.sqrt(ep[0] * ep[0] + ep[1] * ep[1] + ep[2] * ep[2])
    return distance;
}


// var earth_ellipse_location_points_by_month = function(month) {
//     var day2 = 0;
//     var loc = [earth_circle_orbit_positions[day2], earth_circle_orbit_positions[day2 + 1]];
//     switch(month) {
//         case "dec":
//         day2 = 182 * 2;
//         loc = [earth_circle_orbit_positions[day2], earth_circle_orbit_positions[day2 + 1]];
//         break;
//         case "mar":
//         day2 = 273 * 2;
//         loc = [earth_circle_orbit_positions[day2], earth_circle_orbit_positions[day2 + 1]];
//         break;
//         case "jun":
//         day2 = 0;
//         loc = [earth_circle_orbit_positions[day2], earth_circle_orbit_positions[day2 + 1]];
//         break;
//         case "sep":
//         day2 = 91 * 2;
//         loc = [earth_circle_orbit_positions[day2], earth_circle_orbit_positions[day2 + 1]];
//         break;
//     }
//     return loc;
// }

var earthEllipseOrbit = SceneJS.createNode({
    type: "library",    
    nodes: [
        {
            id: "earthEllipseOrbit",
            type: "translate",
            x: sun_x_pos + sun_focus * 2,
            y: 0,
            z: 0,
            nodes: [ 
                {
                    type: "scale",
                    x: 1,
                    y: 1,
                    z: 1,
                    nodes: [ 
                    
                        {
                            type: "node",
                            
                            flags: {
                                transparent: true
                            },
                            
                            nodes: [

                                { 
                    
                                    type: "material",

                                    baseColor:          { r: 1.0, g: 1.0, b: 0.0 },
                                    specularColor:      { r: 1.0, g: 1.0, b: 0.0 },
                                    specular:           5.0,
                                    shine:              5.0,
                                    emit:               20.0,

                                    nodes: [
                            
                                        {

                                            type: "selector",
                                            id: "earthEllipseOrbitSelector",
                                            selection: [2],
                                            nodes: [ 

                                                {  },

                                                // Earth in Space
                                                {
                                                                    
                                                    type: "disk", 
                                                    id: "earth-in-space-elliptical-orbital-path" ,                                         
                                                    radius: earth_orbital_radius_km,
                                                    innerRadius : earth_orbital_radius_km - earth_orbit_line_size_med,
                                                    semiMajorAxis: earthOrbitData.semiMajorAxis,
                                                    height: earth_orbit_line_size_med,
                                                    rings: 360
                                                },
                                                                            

                                                // Sun-Earth Orbit
                                                {
                                                                    
                                                    type: "disk",                                           
                                                    id: "sun-earth-elliptical-orbital-path" ,                                         
                                                    radius: earth_orbital_radius_km,
                                                    innerRadius : earth_orbital_radius_km - earth_orbit_line_size_large,
                                                    semiMajorAxis: earthOrbitData.semiMajorAxis,
                                                    height: earth_orbit_line_size_large,
                                                    rings: 360
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
        }
    ]
});

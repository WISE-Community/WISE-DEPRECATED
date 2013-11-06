
var dark_side = 0.3;

SceneJS.createNode({
    id: "EarthPointerSprite",
    type: "billboard",
    nodes: [
        {
            type: "texture",
            layers: [ { uri: "images/earth-arrow.png" } ],
            nodes: [
            
                {
                    type: "node",
                    
                    flags: {
                        transparent: true
                    },
                    
                    nodes: [
                    
                        {
                    
                            type: "material",
                            specular: 0.0,
                            emit: 10,
                            
                            nodes: [
                                
                                {
                                    type: "translate",
                                    y: sun_radius_km * 22,
                                    
                                    nodes: [
                                        {
                                            type: "quad",
                                            xSize: sun_radius_km * 20, ySize: sun_radius_km * 20,
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


/*----------------------------------------------------------------------
 * Canvases 1 and 3
 *---------------------------------------------------------------------*/


SceneJS.createNode({
    
    type: "node",
    
    nodes: [
    
        {

            type: "scene",
            id: "theScene1",
            canvasId: "theCanvas1",
            loggingElementId: "theLoggingDiv1",


            nodes: [

                {
                    type: "lookAt", 
                    id: "lookAt1",
                    eye : initial_earth_eye,
                    look : { x : earth_x_pos, y : 0, z : 0.0 },
                    up : { x: 0.0, y: 1.0, z: 0.0 },

                    nodes: [

                        {                            
                            type: "camera",
                            id: "theCamera1",
                            optics: {
                                type: "perspective",
                                fovy : 50.0,
                                aspect : 1.43,
                                near : earth_view_small_offset,
                                far : milky_way_apparent_radius * 10,
                            },

                            nodes: [
                            
                                {
                                    type: "node",
                                    // lineWidth: 3,
                                    
                                    nodes: [
                        
                                        {
                                            type: "rotate",
                                            angle: 0,
                                            y: 1.0,
                            
                                            nodes: [
                        
                                                // First simulate the milky-way with a stationary background sphere
                                                {
                                                    type: "stationary",    
                        
                                                    nodes: [
                        
                                                        // Size of sky sphere
                                                        {
                                                            type: "scale",
                                                            x: milky_way_apparent_radius,
                                                            y: milky_way_apparent_radius,
                                                            z: milky_way_apparent_radius,
                                                            nodes: [
                        
                                                                // Starry texture
                                                                {
                                                                    type: "texture",
                                                                    layers: [
                                                                        {
                                                                            uri: "images/milky_way_panorama_3000x1500.jpg",
                                                                            wrapS: "clampToEdge",
                                                                            wrapT: "clampToEdge",
                                                                            applyTo:"baseColor",
                                                                            blendMode:"multiply"
                                                                        }
                                                                    ],
                                                                    nodes: [
                        
                                                                        // Material for texture to apply to
                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                                                            specular:       0.0,
                                                                            shine:          0.0,
                                                                            emit:           1.0,
                        
                                                                            nodes: [
                        
                                                                                // Tilt the milky way a little bit
                                                                                {
                                                                                    type: "rotate",
                                                                                    z: 1,
                                                                                    angle: 45.0,
                                                                                    nodes: [
                        
                                                                                        // Sphere geometry
                                                                                        {
                                                                                            type: "sphere"
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
                                        },

                                        // Integrate our sun, which is defined in sun.js

                                        {
                                            type : "instance",
                                            target :"sun"
                                        },

                                        // Integrate our earth elliptical orbit, which is defined in earth-orbit.js
                                        {
                                            type : "instance",
                                            target :"earthEllipseOrbit"
                                        },

                                        {
                                            type   : "instance",
                                            target : "orbit-grid"
                                        },
                                
                                        // {
                                        //     type   : "instance",
                                        //     target : "earth-circle-orbit-sun-line"
                                        // },

                                        {
                                            type: "material",
                                            baseColor:      { r: 1.0, g: 0.0, b: 0.0 },
                                            specularColor:  { r: 1.0, g: 0.0, b: 0.0 },
                                            specular:       20.0,
                                            shine:          20.0,
                                            emit:           20.0,

                                            nodes: [

                                                {
                                                    type: "selector",
                                                    id: "earthSunLineSelector1",
                                                    selection: [0],

                                                    nodes: [

                                                        {

                                                            type: "translate", // Example translation
                                                            id: "earth-sun-line-translation1",
                                                            x: 0,
                                                            y: 0.0,
                                                            z: earth_x_pos / 2,

                                                            nodes : [

                                                                {

                                                                    type: "rotate",
                                                                    id: "earth-sun-line-rotation1",
                                                                    angle: 270.0,
                                                                    y : 1.0,

                                                                    nodes: [

                                                                        {

                                                                            type: "scale",
                                                                            id: "earth-sun-line-scale1",
                                                                            x: earth_orbital_radius_km / 2,
                                                                            y: sun_earth_line_size_large,
                                                                            z: sun_earth_line_size_large,

                                                                            nodes: [

                                                                                { 
                                                                                    type: "box",
                                                                                },
                                                                            ]
                                                                        },
                                                                    ]
                                                                }
                                                            ]
                                                        },

                                                        {
                                                            type: "geometry",
                                                            primitive: "line-loop",

                                                            positions: [
                                                                 sun_x_pos,     0.0,    0.0,
                                                                 earth_x_pos,   0.0,    0.0
                                                            ],

                                                            indices : [ 0, 1 ]

                                                        },
                                                    ]
                                                }
                                            ]
                                        },

                                        {
                                            type: "translate",
                                            id: "earth-pointer1",
                                            x: earth_x_pos, y: sun_radius_km * 10.5, z: 0,
                                            nodes: [
                                                {
                                                    id: "EarthPointerSprite",
                                                    type: "billboard",
                                                    nodes: [
                                                        {
                                                            type: "texture",
                                                            layers: [ { uri: "images/earth-arrow.png" } ],
                                                            nodes: [

                                                                {
                                                                    type: "node",

                                                                    flags: {
                                                                        transparent: true
                                                                    },

                                                                    nodes: [

                                                                        {

                                                                            type: "material",
                                                                            specular: 0.0,
                                                                            emit: 10,

                                                                            nodes: [

                                                                                {
                                                                                    type: "translate",
                                                                                    y: sun_radius_km * 22,

                                                                                    nodes: [
                                                                                        {
                                                                                            type: "quad",
                                                                                            xSize: sun_radius_km * 20, ySize: sun_radius_km * 20,
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
                                        },

                                        {
                                            id : "earth-sphere1",
                                            type: "material",
                                            baseColor:      { r: 0.45, g: 0.45, b: 0.45 },
                                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                            specular:       0.0,
                                            shine:          2.0,
                                            emit:           4.0,
                                
                                            nodes: [
                                
                                                {
                                                    type: "translate",
                                                    id: "earth-position1",
                                                    x: earth_x_pos,
                                                    y: 0,
                                                    z: 0,
                                            
                                                    nodes: [
                                
                                                        {
                                                            type: "quaternion",
                                                            id: "earthRotationalAxisQuaternion1",
                                                            x: 0.0, y: 0.0, z: 0.0, angle: 0.0,
                                
                                                            rotations: [ { x : 0, y : 0, z : 1, angle : 23.5 } ],
                                
                                                            nodes: [
                                
                                                               {
                                                                    type: "scale",
                                                                    x: earth_radius_km,
                                                                    y: earth_radius_km,
                                                                    z: earth_radius_km,
                                
                                                                    nodes: [
                                
                                                                        {
                                                                            type: "rotate",
                                                                            id: 'earth-rotation1',
                                                                            angle: 0,
                                                                            y: 1.0,
                                
                                                                            nodes: [ 
                                
                                                                                { type: "sphere", id: "esphere1", slices: 45 },
                                
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
                                }
                            ]
                        }
                    ]
                }
            ]
        },
    
        {

            type: "scene",
            id: "theScene3",
            canvasId: "theCanvas3",
            loggingElementId: "theLoggingDiv3",
    
            nodes: [

                {
                    type: "lookAt", 
                    id: "lookAt3",
                    eye : initial_earth_eye,
                    look : { x : earth_x_pos, y : 0, z : 0.0 },
                    up : { x: 0.0, y: 1.0, z: 0.0 },

                    nodes: [

                        {
                            type: "camera",
                            id: "theCamera3",
                            optics: {
                                type: "perspective",
                                fovy : 50.0,
                                aspect : 1.43,
                                near : earth_view_small_offset,
                                far : milky_way_apparent_radius * 10,
                            },

                            nodes: [
                            
                                {
                                    type: "node",
                                    // lineWidth: 3,
                                
                                    nodes: [
                            
            
                                        // {
                                        //     type : "instance",
                                        //     target :"sky-sphere"
                                        // },

                                        {
                                            type: "rotate",
                                            angle: 0,
                                            y: 1.0,
                            
                                            nodes: [
                        
                                                // First simulate the milky-way with a stationary background sphere
                                                {
                                                    type: "stationary",    
                        
                                                    nodes: [
                        
                                                        // Size of sky sphere
                                                        {
                                                            type: "scale",
                                                            x: milky_way_apparent_radius,
                                                            y: milky_way_apparent_radius,
                                                            z: milky_way_apparent_radius,
                                                            nodes: [
                        
                                                                // Starry texture
                                                                {
                                                                    type: "texture",
                                                                    layers: [
                                                                        {
                                                                            uri: "images/milky_way_panorama_3000x1500.jpg",
                                                                            wrapS: "clampToEdge",
                                                                            wrapT: "clampToEdge",
                                                                            applyTo:"baseColor",
                                                                            blendMode:"multiply"
                                                                        }
                                                                    ],
                                                                    nodes: [
                        
                                                                        // Material for texture to apply to
                                                                        {
                                                                            type: "material",
                                                                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                                                                            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                                                            specular:       0.0,
                                                                            shine:          0.0,
                                                                            emit:           1.0,
                        
                                                                            nodes: [
                        
                                                                                // Tilt the milky way a little bit
                                                                                {
                                                                                    type: "rotate",
                                                                                    z: 1,
                                                                                    angle: 45.0,
                                                                                    nodes: [
                        
                                                                                        // Sphere geometry
                                                                                        {
                                                                                            type: "sphere"
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
                                        },

                                        {

                                            id: "sun3",
                                            type: "material",
                                            baseColor:      { r: 1.0, g: 0.95, b: 0.6 },
                                            specularColor:  { r: 1.0, g: 0.95, b: 0.6 },
                                            specular:       2.0,
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
                                                            x: sun_radius_km,
                                                            y: sun_radius_km,
                                                            z: sun_radius_km,

                                                            nodes: [  { type: "sphere", slices: 60, rings: 60 } ]

                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                
                                        {
                                            type: "material",
                                            baseColor:      { r: 1.0, g: 0.3, b: 0.1 },
                                            specularColor:  { r: 1.0, g: 0.3, b: 0.1 },
                                            specular:       5.0,
                                            shine:          5.0,
                                            emit:           1.0,

                                            nodes: [

                                                {
                                                    type: "selector",
                                                    id: "earthSunLineSelector3",
                                                    selection: [0],

                                                    nodes: [

                                                        {

                                                            type: "translate", // Example translation
                                                            id: "earth-sun-line-translation3",
                                                            x: 0,
                                                            y: 0.0,
                                                            z: earth_x_pos / 2,

                                                            nodes : [

                                                                {

                                                                    type: "rotate",
                                                                    id: "earth-sun-line-rotation3",
                                                                    angle: 270.0,
                                                                    y : 1.0,

                                                                    nodes: [

                                                                        {

                                                                            type: "scale",
                                                                            id: "earth-sun-line-scale3",
                                                                            x: earth_orbital_radius_km / 2,
                                                                            y: sun_earth_line_size_large,
                                                                            z: sun_earth_line_size_large,

                                                                            nodes: [

                                                                                { 
                                                                                    type: "box",
                                                                                },
                                                                            ]
                                                                        },
                                                                    ]
                                                                }
                                                            ]
                                                        },

                                                        {
                                                            type: "geometry",
                                                            primitive: "line-loop",

                                                            positions: [
                                                                 sun_x_pos,     0.0,    0.0,
                                                                 earth_x_pos,   0.0,    0.0
                                                            ],

                                                            indices : [ 0, 1 ]

                                                        },
                                                    ]
                                                }
                                            ]
                                        },

                                        {
                                            type: "light",
                                            mode:                   "point",
                                            pos:                    { x: sun_x_pos, y: 0, z: 0 },
                                            color:                  { r: 3.0, g: 3.0, b: 3.0 },
                                            diffuse:                true,
                                            specular:               true,

                                            constantAttenuation: 1.0,
                                            quadraticAttenuation: 0.0,
                                            linearAttenuation: 0.0
                                        },

                                        {
                                            type: "light",
                                            mode:                   "dir",
                                            color:                  { r: dark_side, g: dark_side, b: dark_side },
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: 1.0, y: 0.0, z: -0.75 }
                                        },

                                        {
                                            type: "light",
                                            mode:                   "dir",
                                            color:                  { r: dark_side, g: dark_side, b: dark_side },
                                            diffuse:                true,
                                            specular:               true,
                                            dir:                    { x: 1.0, y: 0.0, z: 0.75 }
                                        },
                                
                                        {
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

                                                                    baseColor:          { r: 0.1, g: 0.8, b: 2.0 },
                                                                    specularColor:      { r: 0.1, g: 0.8, b: 2.0 },
                                                                    specular:           1.0,
                                                                    shine:              2.0,
                                                                    emit:               2.0,
                                                                    alpha:              0.4,

                                                                    nodes: [

                                                                        // {
                                                                        //     type: "instance",
                                                                        //     target: "earth-in-space-elliptical-orbital-path"
                                                                        // }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                } 
                                            ]
                                        },
                
                                        {
                                            type: "material",
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
                                                                    id: "earth-orbit-grid-selector3",
                                                                    selection: [0],
                                                                    nodes: [ 

                                                                        // 0: off

                                                                        {  },

                                                                        // 1: on: orbit grid for Earth view

                                                                        {
                                                                            type: "geometry",
                                                                            primitive: "lines",

                                                                            positions: orbit_grid_earth_positions,
                                                                            indices : orbit_grid_earth_indices

                                                                        },

                                                                        // 2: on: orbit grid for Orbit view

                                                                        {
                                                                            type: "geometry",
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
                                        },


                                        {

                                            type: "selector",
                                            id: "earthTextureSelector3",
                                            selection: [1],
                                            nodes: [

                                                {
                                                    id: "earthTemperatureTextureSelector3",
                                                    type: "selector",
                                                    selection: [0],
                                                    nodes: [


                                                        // selection [0], March
                                                        {
                                                            type: "texture",
                                                            layers: [
                                                                { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                                { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                                { uri:"images/temperature/grads-temperature-2009-03.png", blendMode: "multiply" }
                                                            ],
                                                            nodes: [ { type : "instance", target : "earth-sphere3"  } ]

                                                        },

                                                        // selection [1], June
                                                        {
                                                            type: "texture",
                                                            layers: [
                                                                { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                                { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                                { uri:"images/temperature/grads-temperature-2009-06.png", blendMode: "multiply" }
                                                            ],
                                                            nodes: [ { type : "instance", target : "earth-sphere3"  } ]
                        
                                                        },

                                                        // selection [2], September
                                                        {
                                                            type: "texture",
                                                            layers: [
                                                                { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                                { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                                { uri:"images/temperature/grads-temperature-2009-09.png", blendMode: "multiply" }
                                                            ],
                                                            nodes: [ { type : "instance", target : "earth-sphere3"  } ]

                                                        },


                                                        // selection [3], December
                                                        {
                                                            type: "texture",
                                                            layers: [
                                                                { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                                { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                                { uri:"images/temperature/grads-temperature-2009-12.png", blendMode: "multiply" }
                                                            ],
                                                            nodes: [ { type : "instance", target : "earth-sphere3"  } ]

                                                        }                                
                                                    ]
                                                },
                                                {
                                                    type: "translate",
                                                    id: "earth-position3",
                                                    x: earth_x_pos,
                                                    y: 0,
                                                    z: 0,

                                                    nodes: [

                                                        {
                                                            type: "quaternion",
                                                            id: "earthRotationalAxisQuaternion3",
                                                            x: 0.0, y: 0.0, z: 0.0, angle: 0.0,

                                                            rotations: [ { x : 0, y : 0, z : 1, angle : 23.5 } ],

                                                            nodes: [

                                                                {
                                                                     type: "node",
                                                                     id: "latitude-line-destination3",
                                                                },

                                                                {
                                                                    id : "earth-sphere3",
                                                                    type: "material",
                                                                    baseColor:      { r: 0.45, g: 0.45, b: 0.45 },
                                                                    specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                                                    specular:       0.0,
                                                                    shine:          2.0,

                                                                    nodes: [

                                                                        {
                                                                            type: "scale",
                                                                            x: earth_radius_km,
                                                                            y: earth_radius_km,
                                                                            z: earth_radius_km,

                                                                            nodes: [

                                                                                {
                                                                                    type: "rotate",
                                                                                    id: 'earth-rotation3',
                                                                                    angle: 0,
                                                                                    y: 1.0,

                                                                                    nodes: [ 

                                                                                        {

                                                                                            id: "earth-terrain-texture3",
                                                                                            type: "texture",
                                                                                            layers: [

                                                                                                { 
                                                                                                   uri:"images/lat-long-grid-invert-units-1440x720-15.png",
                                                                                                   blendMode: "add",

                                                                                                },
                                                                                                { 
                                                                                                    uri:"images/earth3.jpg",

                                                                                                    minFilter: "linear",
                                                                                                    magFilter: "linear",
                                                                                                    wrapS: "repeat",
                                                                                                    wrapT: "repeat",
                                                                                                    isDepth: false,
                                                                                                    depthMode:"luminance",
                                                                                                    depthCompareMode: "compareRToTexture",
                                                                                                    depthCompareFunc: "lequal",
                                                                                                    flipY: false,
                                                                                                    width: 1,
                                                                                                    height: 1,
                                                                                                    internalFormat:"lequal",
                                                                                                    sourceFormat:"alpha",
                                                                                                    sourceType: "unsignedByte",
                                                                                                    applyTo:"baseColor",
                                                                                                    blendMode: "multiply",

                                                                                                    /* Texture rotation angle in degrees
                                                                                                     */
                                                                                                    rotate: 180.0,

                                                                                                    /* Texture translation offset
                                                                                                     */
                                                                                                    translate : {
                                                                                                        x: 0,
                                                                                                        y: 0
                                                                                                    },

                                                                                                    /* Texture scale factors
                                                                                                     */
                                                                                                    scale : {
                                                                                                        x: -1.0,
                                                                                                        y: 1.0
                                                                                                    }
                                                                                                }
                                                                                            ],

                                                                                            nodes: [

                                                                                                { type: "sphere", id: "esphere3", slices: 45 }
                                                                                            ]
                                                                                        },

                                                                                        {
                                                                                             type: "node",
                                                                                             id: "earth-surface-location-destination",
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        },

                                                                        {
                                                                            type: "selector",
                                                                            id: "earthAxisSelector3",
                                                                            selection: [1],

                                                                            nodes: [

                                                                                // 0: no axis indicator
                                                                                { },

                                                                                // 1: display axis indicator
                                                                                {

                                                                                    type: "scale",
                                                                                    x: earth_radius_km * 0.02,
                                                                                    y: earth_radius_km * 1.2,
                                                                                    z: earth_radius_km * 0.02,

                                                                                    nodes: [ { type: "sphere" } ]
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
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
});

var scenejs_compilation = false;

SceneJS.setDebugConfigs({
    compilation : {
        enabled : scenejs_compilation
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var scene1 = new seasons.Scene({
    theScene:                    "theScene1",
    camera:                      "theCamera1",
    canvas:                      "theCanvas1",
    look:                        "lookAt1",
    earth_position:              "earth-position3",
    earth_rotation:              "earth-rotation3",

    earth_sun_line_rotation:     "earth-sun-line-rotation1",
    earth_sun_line_translation:  "earth-sun-line-translation1",
    earth_sun_line_scale:        "earth-sun-line-scale1",

    earth_tilt:                  "earthRotationalAxisQuaternion1",
    selected_tilt:               "selected-tilt",

    choose_view:                 "choose-view",
    choose_month:                "choose-month",
    selected_month:              "selected-month",
    earth_pointer:               "earth-pointer1",
    earth_label:                 true,
    earth_info_label:            "earth-info-label1",
    debugging:                   false,
});

var scene3 = new seasons.Scene({
    theScene:                    "theScene3",
    camera:                      "theCamera3",
    canvas:                      "theCanvas3",
    look:                        "lookAt3",
    earth_position:              "earth-position3",
    earth_rotation:              "earth-rotation3",
    latitude_line:               "latitude-line-destination3",
    look_at_selection:           "earth",
    orbitGridSelector:           "earth-orbit-grid-selector3",
    earth_sun_line_rotation:     "earth-sun-line-rotation3",
    earth_sun_line_translation:  "earth-sun-line-translation3",
    earth_sun_line_scale:        "earth-sun-line-scale3",
    earth_tilt:                  "earthRotationalAxisQuaternion3",
    selected_tilt:               "selected-tilt",

    choose_view:                 "choose-view",
    choose_month:                "choose-month",
    selected_month:              "selected-month",
    choose_tilt:                 "choose-tilt",
    linked_scene:                scene1,
    earth_surface_location:      true,
    earth_pointer:               false,
    earth_label:                 false,
    earth_info_label:            "earth-info-label3",
    debugging:                   true,
});

var seasons_activity = new seasons.Activity({
    version: 1.3, 
    scenes: { scene1: scene1, scene3: scene3 }
});

// scene1.linked_scene = scene3;

function seasonsRender() {
    scene1.render();
    scene3.render();
};

var earth_rotation = document.getElementById("earth-rotation");

function seasonsAnimate(t) {
    sampleTime = new Date().getTime();
    if (keepAnimating) requestAnimFrame(seasonsAnimate);
    if (sampleTime > nextAnimationTime) {
        nextAnimationTime = nextAnimationTime + updateInterval;
        if (sampleTime > nextAnimationTime) nextAnimationTime = sampleTime + updateInterval;
        if (earth_rotation.checked) {
            scene3.earth_rotation.set("angle", scene3.earth_rotation.get("angle") + 0.25);
        }
        seasonsRender();
    }
};

SceneJS.bind("error", function() {
    keepAnimating = false;
});

SceneJS.bind("reset", function() {
    keepAnimating = false;
});

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();

var updateRate = 30;
var updateInterval = 1000/updateRate;
var nextAnimationTime = new Date().getTime(); + updateInterval;
var keepAnimating = true;

requestAnimFrame(seasonsAnimate);

//
// city data experiment table and graph
//

var month_data = {
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

var month_names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

var seasons = ["Fall", "Winter", "Spring", "Summer"];

var selected_city_latitude = document.getElementById("selected-city-latitude");
var city_option;
var active_cities = [];
var city, city_location;

// FIXME: refactor access to key
var c1 = 0;
for (var c = 0; c < cities.length; c++) {
    var this_city = cities[c];
    if (cities[c].active) {
        this_city.key = this_city.name.replace(/\W/, '') + '_' + c1 + '_' + this_city.location.latitude + '_' + this_city.location.longitude;
        active_cities.push(cities[c]);
        c1++
    };
};

for (var i = 0; i < active_cities.length; i++) {
    city_option = document.createElement('option');
    city = active_cities[i];
    city_location = city.location;
    city_option.value = i;
    city_option.textContent = city.name + ', ' + city.country + ', ' + 
        sprintf("%2.0f", city_location.latitude) + ' degrees ' + city_location.lat_dir;
    selected_city_latitude.appendChild(city_option);
}

var city_latitude_temperature = document.getElementById("city-latitude-temperature");
var city_latitude_temperature_label = document.getElementById("city-latitude-temperature-label");
var city_latitude_temperature_prediction = document.getElementById("city-latitude-temperature-prediction");

function updateLatitudeLineAndCity() {
    var city_index = Number(selected_city_latitude.value);
    var city = active_cities[city_index];
    var city_location = city.location;
    scene3.latitude_line.setLatitude(city_location.signed_latitude);
    scene3.earth_surface_location.setLocation(city_location.signed_latitude, city_location.signed_longitude)
};

selected_city_latitude.onchange = updateLatitudeLineAndCity;

var city_data_table = document.getElementById("city-data-table");
var city_data_table_body = document.getElementById("city-data-table-body");

var table_row, table_data;

var graph_checkbox_callbacks = {};

var city_data_to_plot = [];
for (var i = 0; i < active_cities.length; i++) {
    city_data_to_plot.push({});
    var city_data = city_data_to_plot[i * 2];
    var city = active_cities[i];
    city_data.label = city.name;
    city_data.color = city.color;
    city_data.lines = { show: true };
    city_data.points = { show: true };
    city_data.data = [];
    for (var m = 0; m < 12; m++) {
        city_data.data.push([m, null]);
    };

    city_data_to_plot.push({});
    city_data = city_data_to_plot[i * 2 + 1];
    city_data.label = city.name + ' no tilt';
    city_data.color = city.color;
    city_data.lines = { show: true };
    city_data.points = { show: true };
    city_data.data = [];
    for (var m = 0; m < 12; m++) {
        city_data.data.push([m, null]);
    };

};

var city_x_axis_tics = [];
for (var i = 0; i < 12; i++) {
    var shifted_index = (i + 1) % 12;
    city_x_axis_tics.push([i , month_data[month_names[shifted_index]].long_name]);
};

function calc_ave_temp(average_temperatures, month_index, tilt_value) {
    var ave_temp;
    if (tilt_value === "yes") {
        ave_temp = average_temperatures[month_index];
    } else {
        var i;
        ave_temp = average_temperatures[0]
        for (i = 1; i < average_temperatures.length; i++) {
            ave_temp += average_temperatures[i];
        };
        var seasonal_shift = 2;
        var seasonal_shift_factor = 12 - seasonal_shift;
        var galapagos_variation = 5.5;
        var shifted_day_number = day_number_by_month[month_names[(month_index + seasonal_shift_factor) % 12]]
        var seasonal_offset = Math.cos(shifted_day_number / 365 * 2 * Math.PI) * (galapagos_variation / 2);
        // var seasonal_factor = earth_ephemerides_solar_constant_by_month(month_names[month_index]) / SOLAR_CONSTANT
        ave_temp = (ave_temp / average_temperatures.length) + seasonal_offset;
    }
    return ave_temp;
}

var table_row_index = 0;

function addExperimentData() {
    if (selected_city_latitude.value == 'city ...' ||
        city_latitude_temperature_prediction.value == '') {
        return false;
    }
    var city_index = Number(selected_city_latitude.value);
    var city = active_cities[city_index];
    var city_location = city.location;

    // FIXME: hard-coded to scene3
    var the_tilt = scene3.tilt;
    
    var the_month = scene1.month;
    var month = month_data[the_month];


    // FIXME: refactor so this can be changed without affecting _graph_checkbox_callback
    // 0: "Fairbanks"
    // 1: "0"
    // 2: "64.51"
    // 3: "147.43"
    // 4: "jun"
    // 5: "no"
    var city_element_id = city.key + '_' + the_month + '_' + the_tilt;;

    var ave_temp;
    
    // if the City/Month row already exists in the 
    // data table return without adding a new one
    if (document.getElementById(city_element_id)) return false;
    
    table_row = document.createElement('tr');
    table_row.id = city_element_id;
    
    table_row_index++;
    table_data = document.createElement('td');
    table_data.textContent = table_row_index;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    if (the_tilt == "yes") {
        table_data.textContent = city.name;
    } else {
        table_data.textContent = city.name + ' no tilt';
    }
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    table_data.textContent = month.short_name;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    table_data.textContent = the_tilt;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    
    ave_temp = calc_ave_temp(city.average_temperatures, month.index, the_tilt);
    if (use_fahrenheit) ave_temp = Math.round(ave_temp * 9 / 5 + 32);
    table_data.textContent = sprintf("%3.1f", ave_temp);
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    table_data.textContent = city_latitude_temperature_prediction.value;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    var select, option;
    select = document.createElement('select');
    select.name = 'season_' + city_element_id;
    // select.id = 'season_city_' + city_element_id;

    option = document.createElement('option');
    option.disabled = true;
    option.textContent = "choose...";
    select.appendChild(option);

    for (i = 0; i < seasons.length; i++) {
        option = document.createElement('option');
        option.value = seasons[i];
        option.textContent = seasons[i];
        select.appendChild(option);
    };
    option = document.createElement('option');
    option.value = "I'm not sure";
    option.textContent = "not sure";
    select.appendChild(option);
    table_data.appendChild(select);
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    var graph_checkbox = document.createElement('input');
    graph_checkbox.id = 'graph_' + city_element_id;    
    graph_checkbox.type = "checkbox";
    graph_checkbox.checked = true;
    table_data.appendChild(graph_checkbox);
    table_row.appendChild(table_data);

    var graph_checkbox_callback = function(event) {
        _graph_checkbox_callback(this);
    };
    
    graph_checkbox_callbacks[graph_checkbox.id] = graph_checkbox_callback;
    graph_checkbox.onchange = graph_checkbox_callback;
    _graph_checkbox_callback(graph_checkbox);

    city_data_table_body.appendChild(table_row);
    SortableTable.load();
    return false;
}

// 0: "graph"
// 1: "Fairbanks"
// 2: "64.51"
// 3: "147.43"
// 4: "jun"
// 5: "yes"
function _graph_checkbox_callback(element) {
    var graph_id_parts = element.id.split(/_/)
    var city_index = graph_id_parts[2];
    var tilt = graph_id_parts[6];
    var city_data;
    if (tilt === "yes") {
         city_data = city_data_to_plot[city_index * 2];
    } else {
        city_data = city_data_to_plot[city_index * 2 + 1];
    };
    var city = active_cities[city_index];
    var city_location = city.location;
    var month = month_data[graph_id_parts[5]];
    var temperature = calc_ave_temp(city.average_temperatures, month.index, tilt);
    if (use_fahrenheit) temperature = temperature * 9 / 5 + 32;
    var shifted_index = month.index - 1;
    if (element.checked) {
        city_data.data[shifted_index] = [shifted_index, temperature]
    } else {
        city_data.data[shifted_index] = [shifted_index, null]
    };
    plotCityData();
};

city_latitude_temperature.onsubmit = addExperimentData;

function experimentDataToJSON() {
    var exp_table = { rows: [] };
    var rows = city_data_table_body.childElements();
    var row_count = city_data_table_body.childElementCount;
    for (var r = 0; r < row_count; r++) {
        var row = rows[r];
        var cells = row.childElements();
        exp_table.rows.push({
            id:      row.id,
            index:   cells[0].textContent,
            city:    cells[1].textContent,
            month:   cells[2].textContent,
            tilt:    cells[3].textContent,
            temp:    cells[4].textContent,
            pred:    cells[5].textContent,
            seasons: cells[6].childElements()[0].value,
            graph:   cells[7].childElements()[0].value,
            state:   {
                scene1: JSON.stringify(scene1.toJSON()),
                scene3: JSON.stringify(scene3.toJSON())
            }
        });
    }
    return exp_table;
}


function experimentDataFromJSON(exp_table) {
    var table_rows = city_data_table_body.rows.length;
    for (var i = 0; i < table_rows; i++) {
        city_data_table_body.deleteRow(0);
    };
    
    for (var i = 0; i < city_data_to_plot.length; i++) {
        var city_data = city_data_to_plot[i];
        for (var j = 0; j < city_data.data.length; j++) {
            city_data.data[j] = [j, null];
        }
    };
    
    var table_row, table_data;
    for (var i = 0; i < exp_table.rows.length; i++) {
        var row = exp_table.rows[i];
        
        table_row = document.createElement('tr');
        table_row.id = row.id;

        table_data = document.createElement('td');
        table_data.textContent = row.index;
        table_row.appendChild(table_data);

        table_data = document.createElement('td');
        table_data.textContent = row.city;
        table_row.appendChild(table_data);

        table_data = document.createElement('td');
        table_data.textContent = row.month;
        table_row.appendChild(table_data);

        table_data = document.createElement('td');
        table_data.textContent = row.tilt;
        table_row.appendChild(table_data);

        table_data = document.createElement('td');
        table_data.textContent = row.temp;
        table_row.appendChild(table_data);

        table_data = document.createElement('td');
        table_data.textContent = row.pred;
        table_row.appendChild(table_data);

        table_data = document.createElement('td');
        var select, option;
        select = document.createElement('select');
        select.name = 'season_' + row.id;
        select.id = 'season_' + row.id; 
        option = document.createElement('option');
        option.disabled = true;
        option.textContent = "choose...";
        select.appendChild(option);

        for (j = 0; j < seasons.length; j++) {
            option = document.createElement('option');
            option.value = seasons[j];
            option.textContent = seasons[j];
            select.appendChild(option);
        };
        option = document.createElement('option');
        option.value = "I'm not sure";
        option.textContent = "I'm not sure";
        select.appendChild(option);
        select.value = row.seasons
        table_data.appendChild(select);
        table_row.appendChild(table_data);

        table_data = document.createElement('td');
        var graph_checkbox = document.createElement('input');
        graph_checkbox.id = 'graph_' + row.id;    
        graph_checkbox.type = "checkbox";
        
        if(row.graph == "on") {
            graph_checkbox.checked = true;
        } else {
            graph_checkbox.checked = false;
        }
        table_data.appendChild(graph_checkbox);
        table_row.appendChild(table_data);

        var graph_checkbox_callback = function(event) {
            _graph_checkbox_callback(this);
        };

        graph_checkbox_callbacks[graph_checkbox.id] = graph_checkbox_callback;
        graph_checkbox.onchange = graph_checkbox_callback;
        _graph_checkbox_callback(graph_checkbox);

        city_data_table_body.appendChild(table_row);
    };
    plotCityData();
};

//
// Graphs ...
//

var use_fahrenheit = true;

if (use_fahrenheit) {
    city_latitude_temperature_label.textContent = 
    city_latitude_temperature_label.textContent.replace(/(C|F)$/, 'F')
} else {
    city_latitude_temperature_label.textContent = 
    city_latitude_temperature_label.textContent.replace(/(C|F)$/, 'C')    
}

var y_axis = { title: 'Temperature deg F', min: -20, max: 80 };
var graph_degree_string = "deg F";

if (!use_fahrenheit) {
    graph_degree_string = "deg F"
    y_axis.title = 'Temperature deg C';
    y_axis.min = -30;
    y_axis.max = 30;
}


function plotCityData() {
    var f = Flotr.draw($('theCanvas4'), city_data_to_plot, 
      {
        xaxis:{ 
          labelsAngle: 60, 
          ticks: city_x_axis_tics,
          title: 'Month', 
          noTics: city_x_axis_tics.length,
          min: 0, max: city_x_axis_tics.length - 1,
        },
        yaxis: y_axis,
        title: "Average Monthly Temperatures",
        grid:{ verticalLines: true, backgroundColor: 'white' },
        HtmlText: false,
        legend: false,
        // legend: { position: 'nw', margin: 1, backgroundOpacity: 0.1 },
        mouse:{
          track: true,
          lineColor: 'purple',
          relative: true,
          position: 'nw',
          sensibility: 1, // => The smaller this value, the more precise you've to point
          trackDecimals: 1,
          trackFormatter: function(obj) { 
            return obj.series.label + ': ' + month_data[month_names[Number(obj.x)]].short_name +  ', ' + obj.y + ' ' + graph_degree_string;
          }
        },
        crosshair:{ mode: 'xy' }
      }
    );
};

plotCityData();

var city_color_keys = document.getElementById("city-color-keys");

function generateCityColorKeys() {
    // remove the existing list
    var color_key_list = document.getElementById("color-key-list");
    city_color_keys.removeChild(color_key_list);

    // create a new color-key-list
    var color_key_list = document.createElement('ul');
    // color_key_list.className = "vlist";
    color_key_list.id = "color-key-list";

    for (var i = 0; i < active_cities.length; i++) {
        var city = active_cities[i];

        // create a list item
        var color_key_item = document.createElement('li');

        // create and add a colored patch
        var color_patch = document.createElement('div');
        color_patch.className = "colorKeyPatch";
        color_patch.style.backgroundColor = city.color;
        color_key_item.appendChild(color_patch);
        
        // add the city name
        var city_name = document.createElement('span');
        city_name.textContent = city.name;
        color_key_item.appendChild(city_name);
        
        // add the new list item to the list
        color_key_list.appendChild(color_key_item);
    }
    // insert the new color key list into the document
    city_color_keys.appendChild(color_key_list);
};

generateCityColorKeys();

var dark_green = '#355506';

function plotSolarRadiationAndEarthDistanceGraph() {
    var d1 = [];
    var d2 = [];
    
    for(var i = 0; i < 12; i++) {
        d1.push([i + 1, earth_ephemerides_solar_constant_by_month(monthNamesShort[i])]);
        d2.push([i + 1, 
            earth_ephemerides_distance_from_sun_by_month(monthNamesShort[i]) / 1000000 / factor]);
    }

    var f = Flotr.draw(
        $('theCanvas4'),[ 
        {data:d1, label:'W/m2', lines: {show: false}, points: {show: true}}, 
        {data:d2, label:'Million km', yaxis:2, lines: {show: false}, points: {show: true}}, 

        ],{
            title: "Earth's Solar Radiation and Distance from the Sun",
            subtitle: "Solar Radiation Measured outside the atmosphere.",
            xaxis:{
                ticks: [1, 3, 6, 9, 12],
                // tickFormatter: function(n){ return '('+n+')'; }, // => displays tick values between brackets.
                tickFormatter: function(n) { 
                    var ticlabel = monthNamesShort[Number(n - 1)];
                    return ticlabel 
                }, // => displays tick values between brackets.
                min: 1,
                max: 12,
                labelsAngle: 45,
                title: 'Season'
            },
            yaxis:{
                ticks: [1300, 1350, 1400, 1450, 1500],
                min: 1300,
                max: 1500,
                title: 'Solar Radiation (W/m2)'
            },
            y2axis: {
                color: dark_green, 
                ticks: [140, 145, 150, 155, 160],
                min: 140,
                max: 160, 
                title: 'Distance from Sun (Million km)'
            },
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			
            HtmlText: false,
            legend: {
                position: 'nw'
            },
            
            mouse:{
				track: true,
				lineColor: 'purple',
				relative: true,
				position: 'nw',
				sensibility: 1, // => The smaller this value, the more precise you've to point
				trackDecimals: 1,
                trackFormatter: function(obj) {
                    var monthName = monthNamesShort[Number(obj.x - 1)];
                    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    return  monthName + ', ' + obj.y + ' ' +obj.series.label;;
                }
			},
			crosshair:{
				mode: 'xy'
			}
        });
};

function plotSolarRadiationGraph() {
    var d1 = [];
    var d2 = [[0,0]];
    
    for(var i = 0; i < 12; i++) {
        d1.push([i + 1, earth_ephemerides_solar_constant_by_month(monthNamesShort[i])]);
        // d2.push([i + 1, 
        //     earth_ephemerides_distance_from_sun_by_month(monthNamesShort[i]) / 1000000 / factor]);
    }

    var f = Flotr.draw(
        $('theCanvas4'),[ 
        {data:d1, label:'W/m2', lines: {show: false}, points: {show: true}}, 
        {data:d2, label:'Million km', yaxis:2, lines: {show: false}, points: {show: true}}, 

        ],{
            title: "Earth's Solar Radiation",
            subtitle: "Solar Radiation Measured outside the atmosphere.",
            xaxis:{
                ticks: [1, 3, 6, 9, 12],
                tickFormatter: function(n) { 
                    var ticlabel = monthNamesShort[Number(n - 1)];
                    return ticlabel 
                },
                min: 1,
                max: 12,
                labelsAngle: 45,
                title: 'Season'
            },
            yaxis:{
                ticks: [1300, 1350, 1400, 1450, 1500],
                min: 1300,
                max: 1500,
                title: 'Solar Radiation (W/m2)'
            },
            y2axis: {
                color: dark_green, 
                ticks: [140, 145, 150, 155, 160],
                min: 140,
                max: 160, 
                title: 'Distance from Sun (Million km)'
            },
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			
            HtmlText: false,
            legend: {
                position: 'nw'
            },
            
            mouse:{
				track: true,
				lineColor: 'purple',
				relative: true,
				position: 'nw',
				sensibility: 1, // => The smaller this value, the more precise you've to point
				trackDecimals: 1,
                trackFormatter: function(obj) { 
                    var monthName = monthNamesShort[Number(obj.x - 1)];
                    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    return  monthName + ', ' + obj.y + ' ' +obj.series.label;;
                }
			},
			crosshair:{
				mode: 'xy'
			}
        });
};

function plotEarthDistanceGraph() {
    var d1 = [[0,0]];
    var d2 = [];
    
    for(var i = 0; i < 12; i++) {
        // d1.push([i + 1, earth_ephemerides_solar_constant_by_month(monthNamesShort[i])]);
        d2.push([i + 1, 
            earth_ephemerides_distance_from_sun_by_month(monthNamesShort[i]) / 1000000 / factor]);
    }

    var f = Flotr.draw(
        $('theCanvas4'),[ 
        {data:d1, label:'W/m2', lines: {show: false}, points: {show: true}}, 
        {data:d2, label:'Million km', yaxis:2, lines: {show: false}, points: {show: true}}, 

        ],{
            title: "Earth's distance from the Sun",
            subtitle: "Measured in Millions of kms",
            xaxis:{
                ticks: [1, 3, 6, 9, 12],
                tickFormatter: function(n) { 
                    var ticlabel = monthNamesShort[Number(n - 1)];
                    return ticlabel 
                },
                min: 1,
                max: 12,
                labelsAngle: 45,
                title: 'Season'
            },
            yaxis:{
                ticks: [1300, 1350, 1400, 1450, 1500],
                min: 1300,
                max: 1500,
                title: 'Solar Radiation (W/m2)'
            },
            y2axis: {
                color: dark_green, 
                ticks: [140, 145, 150, 155, 160],
                min: 140,
                max: 160, 
                title: 'Distance from Sun (Million km)'
            },
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			
            HtmlText: false,
            legend: {
                position: 'nw'
            },
            
            mouse:{
				track: true,
				lineColor: 'purple',
				relative: true,
				position: 'nw',
				sensibility: 1, // => The smaller this value, the more precise you've to point
				trackDecimals: 1,
                trackFormatter: function(obj) { 
                    var monthName = monthNamesShort[Number(obj.x - 1)];
                    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    return  monthName + ', ' + obj.y + ' ' +obj.series.label;;
                }
			},
			crosshair:{
				mode: 'xy'
			}
        });
};


function plotNothingGraph() {
    var d1 = [[0,0]];
    var d2 = [[0,0]];

    var f = Flotr.draw(
        $('theCanvas4'),[ 
        {data:d1, label:'W/m2', lines: {show: false}, points: {show: true}}, 
        {data:d2, label:'Million km', yaxis:2, lines: {show: false}, points: {show: true}}, 

        ],{
            title: "Earth's Solar Radiation and Distance from the Sun",
            subtitle: "Solar Radiation Measured outside the atmosphere.",
            xaxis:{
                ticks: [1, 3, 6, 9, 12],
                // tickFormatter: function(n){ return '('+n+')'; }, // => displays tick values between brackets.
                tickFormatter: function(n) { 
                    var ticlabel = monthNamesShort[Number(n - 1)];
                    return ticlabel 
                }, // => displays tick values between brackets.
                min: 1,
                max: 12,
                labelsAngle: 45,
                title: 'Season'
            },
            yaxis:{
                ticks: [1300, 1350, 1400, 1450, 1500],
                min: 1300,
                max: 1500,
                title: 'Solar Radiation (W/m2)'
            },
            y2axis: {
                color: dark_green, 
                ticks: [140, 145, 150, 155, 160],
                min: 140,
                max: 160, 
                title: 'Distance from Sun (Million km)'
            },
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			
            HtmlText: false,
            legend: {
                position: 'nw'
            },
            
            mouse:{
				track: true,
				lineColor: 'purple',
				relative: true,
				position: 'nw',
				sensibility: 1, // => The smaller this value, the more precise you've to point
				trackDecimals: 0,
                trackFormatter: function(obj) { 
                    var monthName = monthNamesShort[Number(obj.x - 1)];
                    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                    return  monthName + ', ' + obj.y + ' ' +obj.series.label;;
                }
			},
			crosshair:{
				mode: 'xy'
			}
        });
};

// Graph selection

function showGraphChange() {
    if (solar_radiation_graph.checked && sun_earth_distance_graph.checked) {
        plotSolarRadiationAndEarthDistanceGraph();
    } else if (solar_radiation_graph.checked) {
        plotSolarRadiationGraph();
    } else if (sun_earth_distance_graph.checked) {
        plotEarthDistanceGraph();
    } else {
        plotNothingGraph();
    }
}

// show_graph.onchange = showGraphChange;
// show_graph.onchange();




var scaleCanvas = function(canvas, width, height) {
    if (width && height) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width+"px";
        canvas.style.height = height+"px";

        var oSaveCtx = canvas.getContext("2d");

        oSaveCtx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iHeight);
        return oSaveCanvas;
    }
    return oCanvas;
}
function takeSnapshot() {
    var png = canvas3.toDataURL();
    var aspect = canvas3.clientWidth / canvas3.clientHeight;
    var s1_full = document.getElementById("s1-full");
    s1_full.src = png;
    s1_full.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.height = 64;
        canvas.width = 64 * aspect;
        var context = canvas.getContext('2d');
        context.drawImage(s1_full, 0, 0, 64 * aspect, 64);
        var png_small = canvas.toDataURL();
        var s1_small = document.getElementById("s1-small");
        s1_small.src = png_small;
    }
}

if (document.getElementById("editor")) {
    var editor = ace.edit("editor");
    var session = editor.getSession();
    var renderer = editor.renderer;
    renderer.setShowGutter(false);
    session.setUseWrapMode(true);
}


/**
 * adapted from SceneJS Examples
 *
 */

var earth_diameter_km_actual = 12742.0;
var earth_orbital_radius_km_actual = 150000000.0;

var factor = 0.001

var earth_radius_km = earth_diameter_km_actual * factor;
var earth_orbital_radius_km = earth_orbital_radius_km_actual * factor;
var milky_way_apparent_radius = earth_orbital_radius_km * 10;

var earth_x_pos = 0;

/*----------------------------------------------------------------------
 * Canvas 1
 *---------------------------------------------------------------------*/

SceneJS.createNode({
    
    type: "scene",
    id: "theScene1",
    canvasId: "theCanvas1",
    loggingElementId: "theLoggingDiv1",
    
    nodes: [

        {
            type: "library",

            nodes: [

                {
                    type: "camera",
                    id: "theCamera1",
                    optics: {
                        type: "perspective",
                        fovy : 50.0,
                        aspect : 1.43,
                        near : 0.10,
                        far : milky_way_apparent_radius * 10,
                    },

                    nodes: [

                        // First simulate the milky-way with a stationary background sphere
                        {
                            type: "stationary",    
                            id: "sky-sphere1",

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
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 3.0, g: 3.0, b: 3.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.0, z: 0.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.1, g: 0.1, b: 0.1 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.1, g: 0.1, b: 0.1 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },

                        {
                            type: "quaternion",
                            id: "earthRotationalAxisQuaternion1",
                            x: 0.0, y: 0.0, z: 0.0, angle: 0.0,

                            rotations: [ { x : 0, y : 0, z : 1, angle : -23.44 } ],

                            nodes: [

                                {

                                    type: "selector",
                                    id: "earthTextureSelector1",
                                    selection: [1],
                                    nodes: [

                                        {
                                            id: "earthTemperatureTextureSelector1",
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
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                },

                                                // selection [1], June
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                        { uri:"images/temperature/grads-temperature-2009-06.png", blendMode: "multiply" }
                                                    ],
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                },

                                                // selection [2], September
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                        { uri:"images/temperature/grads-temperature-2009-09.png", blendMode: "multiply" }
                                                    ],
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                },


                                                // selection [3], December
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                        { uri:"images/temperature/grads-temperature-2009-12.png", blendMode: "multiply" }
                                                    ],
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                }                                
                                            ]
                                        },

                                        {

                                            id: "earth-terrain-texture1",
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

                                                /* Specify the amounts of ambient, diffuse and specular
                                                 * lights our object reflects
                                                 */
                                                {
                                                    id : "earth-sphere1",
                                                    type: "material",
                                                    baseColor:      { r: 0.6, g: 0.6, b: 0.6 },
                                                    specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                                    specular:       0.0,
                                                    shine:          2.0,

                                                    nodes: [

                                                        {
                                                            type: "translate",
                                                            x: earth_x_pos,
                                                            y: 0,
                                                            z: 0,

                                                            nodes: [

                                                                {

                                                                    type: "scale",
                                                                    x: earth_radius_km,
                                                                    y: earth_radius_km,
                                                                    z: earth_radius_km,

                                                                    nodes: [

                                                                        {

                                                                            type: "rotate",
                                                                            id: 'spin1',
                                                                            angle: 0,
                                                                            y: 1.0,

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
        },
        {
            type: "lookAt", 
            id: "lookAt1",
            eye : { x: earth_x_pos, y: 0, z: earth_radius_km * -3 },
            look : { x : earth_x_pos, y : 0.0, z : 0.0 },
            up : { x: 0.0, y: 1.0, z: 0.0 },

            nodes: [ 
        
                { 
                    type: "instance", 
                    target: "theCamera1"
                } 
            ]
        }
    ]
});

/*----------------------------------------------------------------------
 * Canvas 2
 *---------------------------------------------------------------------*/

SceneJS.createNode({
    
    type: "scene",
    id: "theScene2",
    canvasId: "theCanvas2",
    loggingElementId: "theLoggingDiv2",
    
    nodes: [

        {
            type: "library",

            nodes: [

                {
                    type: "camera",
                    id: "theCamera2",
                    optics: {
                        type: "perspective",
                        fovy : 50.0,
                        aspect : 1.43,
                        near : 0.10,
                        far : milky_way_apparent_radius * 10,
                    },

                    nodes: [

                        // First simulate the milky-way with a stationary background sphere
                        {
                            type: "stationary",    
                            id: "sky-sphere2",

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
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 3.0, g: 3.0, b: 3.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.0, z: 0.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.1, g: 0.1, b: 0.1 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.1, g: 0.1, b: 0.1 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },

                        {
                            type: "quaternion",
                            id: "earthRotationalAxisQuaternion2",
                            x: 0.0, y: 0.0, z: 0.0, angle: 0.0,

                            rotations: [ { x : 0, y : 0, z : 1, angle : -23.44 } ],

                            nodes: [

                                {

                                    type: "selector",
                                    id: "earthTextureSelector2",
                                    selection: [1],
                                    nodes: [

                                        {
                                            id: "earthTemperatureTextureSelector2",
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
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                },

                                                // selection [1], June
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                        { uri:"images/temperature/grads-temperature-2009-06.png", blendMode: "multiply" }
                                                    ],
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                },

                                                // selection [2], September
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                        { uri:"images/temperature/grads-temperature-2009-09.png", blendMode: "multiply" }
                                                    ],
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                },


                                                // selection [3], December
                                                {
                                                    type: "texture",
                                                    layers: [
                                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                                        { uri:"images/temperature/grads-temperature-2009-12.png", blendMode: "multiply" }
                                                    ],
                                                    nodes: [ { type : "instance", target : "earth-sphere2"  } ]

                                                }                                
                                            ]
                                        },

                                        {

                                            id: "earth-terrain-texture2",
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

                                                /* Specify the amounts of ambient, diffuse and specular
                                                 * lights our object reflects
                                                 */
                                                {
                                                    id : "earth-sphere2",
                                                    type: "material",
                                                    baseColor:      { r: 0.6, g: 0.6, b: 0.6 },
                                                    specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
                                                    specular:       0.0,
                                                    shine:          2.0,

                                                    nodes: [

                                                        {
                                                            type: "translate",
                                                            x: earth_x_pos,
                                                            y: 0,
                                                            z: 0,

                                                            nodes: [

                                                                {

                                                                    type: "scale",
                                                                    x: earth_radius_km,
                                                                    y: earth_radius_km,
                                                                    z: earth_radius_km,

                                                                    nodes: [

                                                                        {

                                                                            type: "rotate",
                                                                            id: 'spin2',
                                                                            angle: 0,
                                                                            y: 1.0,

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
        },
        {
            type: "lookAt", 
            id: "lookAt2",
            eye : { x: earth_x_pos, y: earth_radius_km * 3, z: 0 },
            look : { x : earth_x_pos, y : 0.0, z : 0.0 },
            up : { x: 0.0, y: 0.0, z: 1.0 },

            nodes: [ 
        
                { 
                    type: "instance", 
                    target: "theCamera2"
                } 
            ]
        }
    ]
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var yaw1 = 0;
var pitch1 = 0;
var lastX1;
var lastY1;
var dragging1 = false;

var yaw2 = 0;
var pitch2 = 0;
var lastX2;
var lastY2;
var dragging2 = false;

var canvas1 = document.getElementById("theCanvas1");
var canvas2 = document.getElementById("theCanvas2");

var earth_surface = document.getElementById("earth_surface");

// Time of year changes inclination of Earths orbit with respect to the orbital plane

var time_of_year = document.getElementById("time_of_year");
var color_map = document.getElementById("temperature-color-map");
color_map.style.display='none';

var seasonal_rotations = {};
seasonal_rotations.jun = { x :  0,  y : 0,  z : -1,  angle : 23.44 };
seasonal_rotations.sep = { x :  1,  y : 0,  z :  0,  angle : 23.44 };
seasonal_rotations.dec = { x :  0,  y : 0,  z :  1,  angle : 23.44 };
seasonal_rotations.mar = { x : -1,  y : 0,  z :  0,  angle : 23.44 };

function setTemperatureTexture(month) {
    switch (month) {
        case 'mar' : 
            SceneJS.withNode("earthTemperatureTextureSelector1").set("selection", [0]); 
            SceneJS.withNode("earthTemperatureTextureSelector2").set("selection", [0]); 
            break;
        case 'jun' : 
            SceneJS.withNode("earthTemperatureTextureSelector1").set("selection", [1]); 
            SceneJS.withNode("earthTemperatureTextureSelector2").set("selection", [1]); 
            break;
        case 'sep' : 
            SceneJS.withNode("earthTemperatureTextureSelector1").set("selection", [2]); 
            SceneJS.withNode("earthTemperatureTextureSelector2").set("selection", [2]); 
            break;
        case 'dec' : 
            SceneJS.withNode("earthTemperatureTextureSelector1").set("selection", [3]); 
            SceneJS.withNode("earthTemperatureTextureSelector2").set("selection", [3]); 
            break;
    };    
}

function timeOfYearChange() {
  var month = this.value;
  SceneJS.Message.sendMessage({ 
    command: "update", 
    target: "earthRotationalAxisQuaternion1", 
    set: { rotation: seasonal_rotations[month] }
  });
  SceneJS.Message.sendMessage({ 
    command: "update", 
    target: "earthRotationalAxisQuaternion2", 
    set: { rotation: seasonal_rotations[month] }
  });
  setTemperatureTexture(month);
  if (earth_surface.value === 'terrain') {
      SceneJS.withNode("earthTextureSelector1").set("selection", [1]);
      SceneJS.withNode("earthTextureSelector2").set("selection", [1]);
  } else {
      SceneJS.withNode("earthTextureSelector1").set("selection", [0]);
      SceneJS.withNode("earthTextureSelector2").set("selection", [0]);
  }
}

time_of_year.onchange = timeOfYearChange;
time_of_year.onchange();

// Texture mapping onto the Earth's surface

function earthSurfaceChange() {
  var new_surface = this.value;
  if (new_surface === 'terrain') {
      SceneJS.withNode("earthTextureSelector1").set("selection", [1]);
      SceneJS.withNode("earthTextureSelector2").set("selection", [1]);
      color_map.style.display='none';
  } else {
      SceneJS.withNode("earthTextureSelector1").set("selection", [0]);
      SceneJS.withNode("earthTextureSelector2").set("selection", [0]);
      setTemperatureTexture(time_of_year.value);
      color_map.style.display='inline';  
  }
}

earth_surface.onchange = earthSurfaceChange;
earth_surface.onchange();

function mouseDown1(event) {
    lastX1 = event.clientX;
    lastY1 = event.clientY;
    dragging1 = true;
}

function mouseUp1() {
    dragging1 = false;
}

function mouseOut1() {
    dragging1 = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove1(event) {
    if (dragging1) {
        var look, eye, eye4, eye4dup, neweye, up_down, up_downQ, left_right, left_rightQ, f, up_down_axis, angle;
        yaw1 = (event.clientX - lastX1);
        pitch1 = (event.clientY - lastY1);

        lastX1 = event.clientX;
        lastY1 = event.clientY;

        look = SceneJS.withNode("lookAt1");
        eye = look.get("eye");
        eye4 = [eye.x, eye.y, eye.z, 1];

        left_rightQ = new SceneJS.Quaternion({ x : 0, y : 1, z : 0, angle : yaw1 * -0.2 });
        left_right = left_rightQ.getMatrix();

        neweye = SceneJS._math_mulMat4v4(left_right, eye4);
        // console.log("drag   yaw1: " + yaw1 + ", eye: x: " + neweye[0] + " y: " + neweye[1] + " z: " + neweye[2]);

        eye4 = SceneJS._math_dupMat4(neweye);
        f = 1.0 / SceneJS._math_lenVec4(eye4);
        eye4dup = SceneJS._math_dupMat4(eye4);
        up_down_axis = SceneJS._math_mulVec4Scalar(eye4dup, f);
        up_downQ = new SceneJS.Quaternion({ x : up_down_axis[2], y : 0, z : up_down_axis[0], angle : pitch1 * -0.2 });
        angle = up_downQ.getRotation().angle;
        up_down = up_downQ.getMatrix();

        neweye = SceneJS._math_mulMat4v4(up_down, eye4);
        // console.log("drag pitch1: " + pitch1 + ", eye: x: " + neweye[0] + " y: " + neweye[1] + " z: " + neweye[2] + ", angle: " + angle);

        look.set("eye", { x: neweye[0], y: neweye[1], z: neweye[2] });
        SceneJS.withNode("theScene1").render();
        eye = look.get("eye");
        // console.log("");

    }
}

function mouseDown2(event) {
    lastX2 = event.clientX;
    lastY2 = event.clientY;
    dragging2 = true;
}

function mouseUp2() {
    dragging2 = false;
}

function mouseOut2() {
    dragging2 = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove2(event) {
    if (dragging2) {
        var look, eye, eye4, eye4dup, neweye, up_down, up_downQ, left_right, left_rightQ, f, up_down_axis, angle;
        yaw2 = (event.clientX - lastX2);
        pitch2 = (event.clientY - lastY2);

        lastX2 = event.clientX;
        lastY2 = event.clientY;

        look = SceneJS.withNode("lookAt2");
        eye = look.get("eye");
        eye4 = [eye.x, eye.y, eye.z, 1];

        left_rightQ = new SceneJS.Quaternion({ x : 0, y : 1, z : 0, angle : yaw2 * -0.2 });
        left_right = left_rightQ.getMatrix();

        neweye = SceneJS._math_mulMat4v4(left_right, eye4);
        // console.log("drag   yaw2: " + yaw2 + ", eye: x: " + neweye[0] + " y: " + neweye[1] + " z: " + neweye[2]);

        eye4 = SceneJS._math_dupMat4(neweye);
        f = 1.0 / SceneJS._math_lenVec4(eye4);
        eye4dup = SceneJS._math_dupMat4(eye4);
        up_down_axis = SceneJS._math_mulVec4Scalar(eye4dup, f);
        up_downQ = new SceneJS.Quaternion({ x : up_down_axis[2], y : 0, z : up_down_axis[0], angle : pitch2 * -0.2 });
        angle = up_downQ.getRotation().angle;
        up_down = up_downQ.getMatrix();

        neweye = SceneJS._math_mulMat4v4(up_down, eye4);
        // console.log("drag pitch2: " + pitch2 + ", eye: x: " + neweye[0] + " y: " + neweye[1] + " z: " + neweye[2] + ", angle: " + angle);

        look.set("eye", { x: neweye[0], y: neweye[1], z: neweye[2] });
        SceneJS.withNode("theScene2").render();
        eye = look.get("eye");
        // console.log("");

    }
}

canvas1.addEventListener('mousedown', mouseDown1, true);
canvas1.addEventListener('mousemove', mouseMove1, true);
canvas1.addEventListener('mouseup', mouseUp1, true);
canvas1.addEventListener('mouseout', mouseOut1, true);

// canvas2.addEventListener('mousedown', mouseDown2, true);
// canvas2.addEventListener('mousemove', mouseMove2, true);
// canvas2.addEventListener('mouseup', mouseUp2, true);
// canvas2.addEventListener('mouseout', mouseOut2, true);

var spin1 = SceneJS.withNode("spin1");
var spin2 = SceneJS.withNode("spin2");

window.render = function() {
    SceneJS.withNode("theScene1").render();
    SceneJS.withNode("theScene2").render();
    spin1.set("angle", spin1.get("angle") + 0.15);
    spin2.set("angle", spin2.get("angle") + 0.15);
};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.render()", 30);

var zBufferDepth = 0;

SceneJS.withNode("theScene1").bind("loading-status", 
    function(event) {
        if (zBufferDepth == 0) {
            zBufferDepth = SceneJS.withNode("theScene1").get("ZBufferDepth");
            var mesg = "using webgl context with Z-buffer depth of: " + zBufferDepth + " bits";
            SceneJS._loggingModule.info(mesg);            
        }
    });

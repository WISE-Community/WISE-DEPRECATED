
var earth = SceneJS.createNode({

    type: "library",

    nodes: [
        {

            id: "earth",
            type: "boundingBox",

            xmin: -earth_radius_km,
            ymin: -earth_radius_km,
            zmin: -earth_radius_km,
            xmax:  earth_radius_km,
            ymax:  earth_radius_km,
            zmax:  earth_radius_km,

            /* We'll do level-of-detail selection with this
             * boundingBox - two representations at
             * different sizes:
             */
            levels: [
                0,     // Level 1
                100    // Level 2
            ],

            nodes:[

                /* Level 1 - a sphere to at least show a dot on the horizon
                 */
                {
                    type: "material",
                    baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                    specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                    specular:       1.0,
                    shine:          2.0,

                    nodes: [

                        {
                            type: "scale", x: sun_radius_km, y: sun_radius_km, z: sun_radius_km,

                            nodes: [ { type: "sphere"  } ]
                        }
                    ]
                },

                {

                    type: "selector",
                    id: "earthTextureSelector",
                    selection: [1],
                    nodes: [

                        {
                            id: "earthTemperatureTextureSelector",
                            type: "selector",
                            selection: [0],
                            nodes: [

                                // selection [0], January
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-01.png", blendMode: "multiply" }

                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [1], February
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-02.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [2], March
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-03.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [3], April
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-04.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [4], May
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-05.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [5], June
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-06.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [6], July
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-07.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [7], August
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-08.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [8], September
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-09.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [9], October
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-10.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [10], NOvember
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-11.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                },

                                // selection [11], December
                                {
                                    type: "texture",
                                    layers: [
                                        { uri:"images/earth-continental-outline-edges-invert.png", blendMode: "multiply" },
                                        { uri:"images/lat-long-grid-invert-units-1440x720-15.png", blendMode: "add" },
                                        { uri:"images/temperature/grads-temperature-2009-12.png", blendMode: "multiply" }
                                    ],
                                    nodes: [ { type : "instance", target : "earth-sphere"  } ]

                                }

                            ]
                        },

                        {

                            id: "earth-terrain-texture",
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

                                {
                                    type : "instance",
                                    target : "earth-sphere"
                                }

                            ]
                        }
                    ]
                }
            ]
        }
    ]
});
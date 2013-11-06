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

SceneJS.createNode({
    id: "SunPointerSprite",
    type: "billboard",
    nodes: [
        {
            type: "texture",
            layers: [ { uri: "images/sun-arrow.png" } ],
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

SceneJS.createNode({

    type: "scene",
    id: "theScene",
    canvasId: "theCanvas",
    loggingElementId: "theLoggingDiv",

    nodes: [

        {
            type: "library",

            nodes: [
                {
                    type: "camera",
                    id: "theCamera",
                    optics: {
                        type: "perspective",
                        fovy : 45.0,
                        aspect : 1.365,
                        near : earth_radius_km,
                        far : milky_way_apparent_radius * 10,
                    },

                    nodes: [

                        // Integrate our sky sphere, which is defined in sky-sphere.js
                        {
                            type : "instance",
                            target :"sky-sphere"
                        },

                        // Integrate our sun, which is defined in sun.js
                        {
                            type : "instance",
                            target :"sun"
                        },

                        {
                            type: "instance",
                            target: "SunPointerSprite"
                        },

                        // Integrate our earth circular orbit, which is defined in earth-orbit.js
                        {
                            type : "instance",
                            target :"earthCircleOrbit"
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
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 3.0, g: 3.0, b: 3.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 0.0, z: 1.0 }
                        },

                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                            specular:       1.0,
                            shine:          2.0,
                            emit:           1.0,

                            // nodes: [
                            //

                            //     {
                            //         type   : "instance",
                            //         target : "earth-circle-orbit-sun-line"
                            //     }
                            //

                            //   ]
                        },

                        {
                            type   : "instance",
                            target : "earth-circle-orbit-sun-line"
                        },

                        {
                            type: "translate",
                            id: "earth-pointer",
                            x: earth_x_pos, y: 0, z: 0,
                            nodes: [
                                {
                                    type: "instance",
                                    target: "EarthPointerSprite"
                                }
                            ]
                        },

                        {
                            type: "quaternion",
                            id: "x",
                            x: 0.0, y: 0.0, z: 0.0, angle: 0.0,

                            rotations: [ { x : 0, y : 0, z : 1, angle : -23.5 } ],

                            nodes: [

                                {
                                    type : "instance",
                                    target :"earth-axis"
                                },

                                {
                                    type : "instance",
                                    target :"earth"
                                }
                            ]
                        }
                    ]
                }
            ]
        },

        {
            type: "lookAt",

            id: "lookAt",
            eye : { x: 0, y: earth_orbital_radius_km * 3, z: earth_orbital_radius_km * 0.3 },
            look : { x : earth_orbital_radius_km, y : 0.0, z : 0.0 },
            up : { x: 0.0, y: 0.0, z: 1.0 },
            nodes: [ { type: "instance", target: "theCamera" } ]
        }
    ]
});

var scenejs_compilation = true;

SceneJS.setDebugConfigs({
    compilation : {
        enabled : scenejs_compilation
    }
});

/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/

var scene = new seasons.Scene({
    theScene:                    "theScene",
    camera:                      "theCamera",
    canvas:                      "theCanvas",
    look:                        "lookAt",
    earth_label:                 true,
    earth_info_label:            "earth-info-label",
    choose_view:                 "choose-view",
    choose_month:                "choose-month"
});

var seasons_activity = new seasons.Activity({
    version: 1.1,

    scenes: { scene: scene }
});

window.render = function() {
    SceneJS.withNode("theScene").start();
};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval("window.render()", 30);

var zBufferDepth = 0;

var completelyLoaded = false;

/**
 * callback when the scene object has completely finished loading.
 * check to see if this is embedded inside an iframe (has parent). If yes,
 * assume that this is in WISE4 mode, so let WISE4 know that seasons model has loaded.
 * @return
 */
function sceneCompletelyLoaded() {
	if (parent && parent.eventManager) {
		if (typeof parent.eventManager != "undefined") {
			parent.eventManager.fire("seasonsModelIFrameLoaded");
		}
	}
}

SceneJS.withNode("theScene").bind("loading-status",

    function(event) {

        if (zBufferDepth == 0) {
            zBufferDepth = SceneJS.withNode("theScene").get("ZBufferDepth");
            var mesg = "using webgl context with Z-buffer depth of: " + zBufferDepth + " bits";
            SceneJS._loggingModule.info(mesg);

        }
        var params = event.params;

        if (params.numNodesLoading > 0) {
        } else {
          if (!completelyLoaded) {
            sceneCompletelyLoaded();
            completelyLoaded = true;
          }
        }
    });
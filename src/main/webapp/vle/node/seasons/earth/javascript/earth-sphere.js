

var earthSphere = SceneJS.createNode({

    type: "library",

    nodes: [

        /* Specify the amounts of ambient, diffuse and specular
         * lights our object reflects
         */
        {
            id : "earth-sphere",
            type: "material",
            baseColor:      { r: 0.45, g: 0.45, b: 0.45 },
            specularColor:  { r: 0.0, g: 0.0, b: 0.0 },
            specular:       0.0,
            shine:          2.0,

            nodes: [

                {
                    type: "translate",
                    id: "earth-position",
                    x: earth_x_pos,
                    y: 0,
                    z: 0,

                    nodes: [

                        {
                            type: "quaternion",
                            id: "earthRotationalAxisQuaternion",
                            x : 0, y : 0, z : 1, angle : 23.5,

                            nodes: [

                                {
                                     type: "node",

                                     nodes: [
                                        {
                                            type: "node",
                                            id: "latitude-line-destination"
                                        }
                                    ]
                                },

                                {
                                    type: "scale",
                                    id: "earth-scale",
                                    x: earth_radius_km,
                                    y: earth_radius_km,
                                    z: earth_radius_km,

                                    nodes: [

                                        {
                                            type: "rotate",
                                            id: 'earth-rotation',
                                            angle: 0,
                                            y: 1.0,

                                            nodes: [

                                                { type: "sphere", id: "esphere" },

                                                {
                                                    type: "node",
                                                    id: "earth-surface-location-destination"
                                                }
                                            ]
                                        }
                                    ]
                                },

                                {
                                    type: "selector",
                                    id: "earthAxisSelector",
                                    selection: [1],

                                    nodes: [

                                        // 0: no axis indicator
                                        { },

                                        // 1: display regular-size axis indicator
                                        {

                                            type: "scale",
                                            x: earth_radius_km * 0.02,
                                            y: earth_radius_km * 1.2,
                                            z: earth_radius_km * 0.02,

                                            nodes: [ { type: "sphere" } ]
                                        },
                                        // 2: display huge-size axis indicator
                                        {

                                            type: "scale",
                                            x: earth_radius_km * 0.5,
                                            y: earth_radius_km * 200,
                                            z: earth_radius_km * 0.5,

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
});

var earth_position = SceneJS.withNode("earth-position");

var get_earth_postion = function() {
    var ep = earth_position.get();
    return [ep.x, ep.y, ep.z];
}

var set_earth_postion = function(newpos) {
    earth_position.set({ x: newpos[0], y: newpos[1], z: newpos[2] })
}

var get_normalized_earth_eye = function(look_at) {
    var normalized_eye = {};
    var eye = look_at.get("eye");
    var ep = earth_position.get();
    normalized_eye.x = eye.x - ep.x;
    normalized_eye.y = eye.y - ep.y;
    normalized_eye.z = eye.z - ep.z;
    return normalized_eye;
}

var set_normalized_earth_eye = function(look_at, normalized_eye) {
    var eye = {}
    var ep = earth_position.get();
    eye.x = normalized_eye.x + ep.x;
    eye.y = normalized_eye.y + ep.y;
    eye.z = normalized_eye.z + ep.z;
    var eye = look_at.set("eye", eye);
}

var update_earth_look_at = function(look_at, normalized_eye) {
    var eye = {};
    var ep = earth_position.get();
    eye.x = normalized_eye.x + ep.x;
    eye.y = normalized_eye.y + ep.y;
    eye.z = normalized_eye.z + ep.z;

    look_at.set("look", ep );
    look_at.set("eye",  eye );
}

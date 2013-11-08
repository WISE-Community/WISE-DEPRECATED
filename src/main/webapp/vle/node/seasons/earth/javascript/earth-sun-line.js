var earthSunLine = SceneJS.createNode({

    type: "library",

    nodes: [

        {
            type: "material",
            id: "earth-circle-orbit-sun-line",
            baseColor:      { r: 1.0, g: 0.3, b: 0.1 },
            specularColor:  { r: 1.0, g: 0.3, b: 0.1 },
            specular:       5.0,
            shine:          5.0,
            emit:           1.0,

            nodes: [

                {
                    type: "selector",
                    id: "earthSunLineSelector",
                    selection: [0],

                    nodes: [

                        {

                            type: "translate", // Example translation
                            id: "earth-sun-line-translation",
                            x: 0,
                            y: 0.0,
                            z: earth_x_pos / 2,

                            nodes : [

                                {

                                    type: "rotate",
                                    id: "earth-sun-line-rotation",
                                    angle: 270.0,
                                    y : 1.0,

                                    nodes: [

                                        {

                                            type: "scale",
                                            id: "earth-sun-line-scale",
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

                        // {
                        //

                        //     type: "translate", // Example translation
                        //     id: "earth-sun-line-translation",
                        //     x: earth_x_pos / 2,
                        //     y: 0.0,
                        //     z: 0.0,
                        //

                        //     nodes : [
                        //

                        //         // {
                        //         //

                        //         //     type: "rotate",
                        //         //     id: "earth-sun-line-rotation",
                        //         //     angle: 0.0,
                        //         //     y : 0.0,
                        //         //

                        //         //     nodes: [
                        //

                        //                 {
                        //

                        //                     type: "scale",
                        //                     x: earth_x_pos,
                        //                     y: earth_radius_km * 100,
                        //                     z: earth_radius_km * 100,
                        //

                        //                     nodes: [
                        //

                        //                         {

                        //

                        //                             type: "box",
                        //

                        //                         },
                        //                     ]
                        //                 }
                        //         //     ]
                        //         // }
                        //     ]
                        // },

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
        }
    ]
});

var earth_sun_line_rotation = SceneJS.withNode("earth-sun-line-rotation");
var earth_sun_line_translation = SceneJS.withNode("earth-sun-line-translation");
var earth_sun_line_scale = SceneJS.withNode("earth-sun-line-scale");

var earth_sun_line_selector = SceneJS.withNode("earthSunLineSelector");

var set_earth_sun_line = function(month, view) {
    var scale = {};
    var distance2 = earth_ellipse_distance_from_sun_by_month(month) / 2;
    // var distance = earth_ephemerides_datum_by_month('jun').rg * au2km * factor;

    switch(month) {
        case "dec":
        earth_sun_line_rotation.set("angle", 180);
        earth_sun_line_translation.set({ x: -distance2 , y: 0.0, z: 0 });
        scale.x = distance2;
        switch(view) {
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
        earth_sun_line_rotation.set("angle", 0);
        earth_sun_line_translation.set({ x: sun_x_pos, y: 0.0, z: -distance2 });
        scale.z = distance2;
        switch(view) {
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

        case "jun":
        earth_sun_line_rotation.set("angle", 0);
        earth_sun_line_translation.set({ x: distance2 , y: 0.0, z: 0 });
        scale.x = distance2;
        switch(view) {
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
        earth_sun_line_rotation.set("angle", 180);
        earth_sun_line_translation.set({ x: sun_x_pos, y: 0.0, z: distance2 });
        scale.z = distance2;
        switch(view) {
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
    earth_sun_line_scale.set(scale);
}

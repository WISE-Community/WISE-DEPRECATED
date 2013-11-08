var earthAxis = SceneJS.createNode({

    type: "library",

    nodes: [
        {
            id: "earth-axis-position",
            type: "translate",
            x: earth_x_pos,
            y: 0,
            z: 0,

            nodes: [

                {

                    type: "scale",
                    x: earth_radius_km * 0.02,
                    y: earth_radius_km * 1.2,
                    z: earth_radius_km * 0.02,

                    nodes: [
        
                        {
              
                            type: "rotate",
                            id: 'gnomon-spin',
                            angle: 0,
                            x: 0.0,
                            y: 1.0,
                            z: 0.0,

                            nodes: [ { type: "sphere" } ]
                        }
                    ]
                },
                // Interpolates the Earth spin - this node could be anywhere in the scene
                {
                    type: "interpolator",
                    target: "gnomon-spin",
                    targetProperty: "angle",
                    // over 1000 seconds rotate 360 degrees 20 times
                    keys: [0.0, 1000],
                    values: [0.0, 360.0*50]
                }
            ]
        }
    ]
});

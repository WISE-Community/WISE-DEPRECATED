var sun = SceneJS.createNode({

    type: "library",
    
    nodes: [
        {
    
            id: "sun",
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
        }
    ]
});

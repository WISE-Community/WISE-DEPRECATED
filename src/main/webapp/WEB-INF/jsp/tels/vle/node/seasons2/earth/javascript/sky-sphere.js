var skySphere = SceneJS.createNode({

    // Prevent sky sphere from moving as lookat.eye moves
    type: "stationary",    
    id: "sky-sphere",
    
    nodes: [

        // Size of sky sphere
        {
            // id: "sky-sphere",
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
});

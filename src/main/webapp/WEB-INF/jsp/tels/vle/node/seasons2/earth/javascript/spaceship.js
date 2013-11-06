var spaceship = SceneJS.createNode({
    type: "library",
    nodes: [
        {
            id: "spaceship",
            type: "translate",
            nodes: [
                {
                    type: "scale",
                    x: 1.0,
                    y: 1.0,
                    z: 2.0,
                    nodes: [
                        {
                            type: "material",
                            baseColor:      { r: 0.1, g: 0.2, b: 1.0 },
                            specularColor:  { r: 0.1, g: 0.2, b: 1.0 },
                            specular:       1.0,
                            shine:          1.0,
                            emit:           0.8,
                            nodes: [
                                {
                                    type: "sphere",
                                    slices: 30,
                                    rings: 30,
                                    semiMajorAxis: 2
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "translate",
                    x: 2.0,
                    y: 0.0,
                    z: 0.0,
                    nodes: [
                        {
                            type: "scale",
                            x: 0.5,
                            y: 0.5,
                            z: 0.5,
                            nodes: [
                                {
                                    type: "rotate",
                                    angle: 90,
                                    z: 1.0,
                                    nodes: [
                                        {
                                            type: "material",
                                            baseColor:      { r: 0.1, g: 1.0, b: 0.1 },
                                            specularColor:  { r: 0.1, g: 1.0, b: 0.1 },
                                            specular:       1.0,
                                            shine:          1.0,
                                            emit:           0.5,
                                            nodes: [
                                                {
                                                    type: "disk",
                                                    radius: 1,
                                                    height: 0.8,
                                                    rings: 12
                                                }
                                            ]
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                },
                {
                    type: "translate",
                    x: 2.0,
                    y: 0.0,
                    z: 0.0,
                    nodes: [
                        {
                            type: "scale",
                            x: 3,
                            y: 0.3,
                            z: 0.3,
                            nodes: [
                                {
                                    type: "material",
                                    baseColor:      { r: 1.0, g: 0.4, b: 0.2 },
                                    specularColor:  { r: 1.0, g: 0.4, b: 0.2 },
                                    specular:       1.0,
                                    shine:          2.0,
                                    emit:           1.0,
                                    nodes: [
                                        {
                                            type: "rotate",
                                            angle: 0,
                                            z: 1.0,
                                            nodes: [
                                                {
                                                    type: "sphere",
                                                    slices: 30,
                                                    rings: 30,
                                                    semiMajorAxis: 1
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "material",
                            baseColor:      { r: 1.0, g: 0.4, b: 0.2 },
                            specularColor:  { r: 1.0, g: 0.4, b: 0.2 },
                            specular:       1.0,
                            shine:          2.0,
                            emit:           0.5,
                            nodes: [
                                {
                                    type: "rotate",
                                    angle: 20,
                                    z: 1.0,
                                    nodes: [
                                        {
                                            type: "scale",
                                            x: 2.0,
                                            y: 0.2,
                                            z: 0.2,
                                            nodes: [
                                                {
                                                    type: "sphere",
                                                    slices: 30,
                                                    rings: 30,
                                                    semiMajorAxis: 1
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "rotate",
                                    angle: -20,
                                    z: 1.0,
                                    nodes: [
                                        {
                                            type: "scale",
                                            x: 2.0,
                                            y: 0.2,
                                            z: 0.2,
                                            nodes: [
                                                {
                                                    type: "sphere",
                                                    slices: 30,
                                                    rings: 30,
                                                    semiMajorAxis: 1
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "rotate",
                                    angle: 20,
                                    y: 1.0,
                                    nodes: [
                                        {
                                            type: "scale",
                                            x: 2.0,
                                            y: 0.2,
                                            z: 0.2,
                                            nodes: [
                                                {
                                                    type: "sphere",
                                                    slices: 30,
                                                    rings: 30,
                                                    semiMajorAxis: 1
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    type: "rotate",
                                    angle: -20,
                                    y: 1.0,
                                    nodes: [
                                        {
                                            type: "scale",
                                            x: 2.0,
                                            y: 0.2,
                                            z: 0.2,
                                            nodes: [
                                                {
                                                    type: "sphere",
                                                    slices: 30,
                                                    rings: 30,
                                                    semiMajorAxis: 1
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
})

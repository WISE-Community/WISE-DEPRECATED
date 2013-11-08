
var EarthSurfaceLocationIndicator = function(parentNodeId) {

    /* IDs for nodes in our subgraph
    */
    const EARTH_SURFACE_LOCATION_INDICATOR_NODE_ID = "earth-surface-location-indicator";

    this._latitude  = 0;
    this._longitude = 0;

    /* Create the subgraph
    */
    SceneJS.withNode(parentNodeId).add("node",  

    {
        type: "node",
        id: EARTH_SURFACE_LOCATION_INDICATOR_NODE_ID,

        flags: {
            transparent: false
        },

        nodes: [


            // {
            //     type: "light",
            //     mode:                 "dir",
            //     color:                  {r: 0.1, g: 0.1, b: 0.1},
            //     diffuse:                true,
            //     specular:               true,
            //     dir:                    { x: -1.0, y: -1.0, z: -1.0 }
            // },
            // 
            // {
            //     type: "light",
            //     mode:                 "dir",
            //     color:                  {r: 0.1, g: 0.1, b: 0.1},
            //     diffuse:                true,
            //     specular:               true,
            //     dir:                    { x: 1.0, y: 1.0, z: 1.0 }
            // },
            
            {
                type: "light",
                mode:                 "dir",
                color:                  {r: 1.0, g: 1.0, b: 1.0},
                diffuse:                true,
                specular:               true,
                dir:                    { x: -1.0, y: 0.0, z: -1.0 }
            },

            { 
                type: "material",
                baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                specular:       10,
                shine:          0.1,

                nodes: [
                    
                    {

                        type: "quaternion",
                        x: 0.0, y: 0.0, z: 1.0, angle: 90.0,
                        
                        nodes: [
                        
                            {

                                type: "quaternion",
                                id: EARTH_SURFACE_LOCATION_INDICATOR_NODE_ID + "_longitude",
                                x: -1.0, y: 0.0, z: 0.0, angle: 0.0,

                                nodes: [

                                    {

                                        type: "quaternion",
                                        id: EARTH_SURFACE_LOCATION_INDICATOR_NODE_ID + "_latitude",
                                        x: 0.0, y: 0.0, z: -1.0, angle: 0.0,

                                        nodes: [
                                            {

                                                type: "translate",
                                                x: 0,
                                                y: earth_radius_km / 6.3,
                                                z: 0,
                                
                                                nodes: [
                                
                                                    {
                                                        type: "disk",
                                                        radius: 0.03,
                                                        innerRadius: 0.02,
                                                        height: 0.01,
                                                        rings: 16
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

    /* Get reference to the node for use later
    */
    this.earthSurfaceLocationIndicatorNode = SceneJS.withNode(EARTH_SURFACE_LOCATION_INDICATOR_NODE_ID);
    this._latitudeNode = SceneJS.withNode(EARTH_SURFACE_LOCATION_INDICATOR_NODE_ID + "_latitude");
    this._longitudeNode = SceneJS.withNode(EARTH_SURFACE_LOCATION_INDICATOR_NODE_ID + "_longitude");
};

EarthSurfaceLocationIndicator.prototype.setLocation = function(latitude, longitude) {
    this._latitude = latitude;
    this._longitude = longitude;
    this._latitudeNode.set("rotation", { x: 0.0, y: 0.0, z: -1.0, angle: latitude });
    this._longitudeNode.set("rotation", { x: -1.0, y: 0.0, z: 0.0, angle: longitude });
};

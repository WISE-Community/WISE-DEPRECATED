
var LatitudeLine = function(parentNodeId) {

    /* IDs for nodes in our subgraph
    */
    const LATITUDE_LINE_NODE_ID = "latitude-line";

    this._latitude = 0;

    /* Create the subgraph
    */
    SceneJS.withNode(parentNodeId).add("node",  

    {
        type: "node",
        id: LATITUDE_LINE_NODE_ID,

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
            
            // {
            //     type: "light",
            //     mode:                 "dir",
            //     color:                  {r: 1.0, g: 1.0, b: 1.0},
            //     diffuse:                true,
            //     specular:               true,
            //     dir:                    { x: -1.0, y: 0.0, z: -1.0 }
            // },

            { 
                type: "material",
                baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
                specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
                specular:       1.0,
                shine:          1.0,
                emit: 10.0,

                nodes: [
                    
                    {
                        type: "translate",
                        id: LATITUDE_LINE_NODE_ID + "_translate",
                        x: 0,
                        y: earth_radius_km * Math.sin(this._latitude * deg2rad),
                        z: 0,
                        
                        nodes: [
                        
                            {
                                type: "scale",
                                id: LATITUDE_LINE_NODE_ID + "_scale",
                                x: Math.cos(this._latitude * deg2rad),
                                z: Math.cos(this._latitude * deg2rad),
                            
                                nodes: [

                                    {
                                        type: "disk",
                                        radius: earth_radius_km * 1.02,
                                        // radius: earth_radius_km / 2 + earth_orbit_line_size_med,
                                        innerRadius: earth_radius_km * 1.01,
                                        height: earth_orbit_line_size_med * 1,
                                        rings: 360
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
    this._latitudeLineNode = SceneJS.withNode(LATITUDE_LINE_NODE_ID);
    this._translateNode = SceneJS.withNode(LATITUDE_LINE_NODE_ID + "_translate");
    this._scaleNode = SceneJS.withNode(LATITUDE_LINE_NODE_ID + "_scale");
};

LatitudeLine.prototype.setLatitude = function(latitude) {
    this._latitude = latitude;
    this._translateNode.set({ y: earth_radius_km * Math.sin(this._latitude * deg2rad) });
    this._scaleNode.set({ x: Math.cos(this._latitude * deg2rad) });
    this._scaleNode.set({ z: Math.cos(this._latitude * deg2rad) });
};

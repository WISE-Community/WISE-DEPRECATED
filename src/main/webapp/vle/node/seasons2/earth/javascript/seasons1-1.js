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
                                            xSize: sun_radius_km * 20, ySize: sun_radius_km * 20
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
                                            xSize: sun_radius_km * 20, ySize: sun_radius_km * 20
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
    id: "SunPointerVectorText",
    type: "translate",
    x: 0, y: 0, z: 0,
    nodes: [
        {
            type: "material",
            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
            specular:       0.2,
            shine:          0.2,
            emit:           1.0,
            nodes: [
                {
                    type: "translate",
                    y: sun_radius_km * 20,
                    x: sun_radius_km * -20,
                    nodes: [
                        {
                            type: "billboard",
                            nodes: [
                                {
                                    type: "scale",
                                    x: 6000,
                                    y: 6000,
                                    z: 6000,
                                    nodes: [
                                        {
                                            type: "text",
                                            mode: "vector",
                                            text: "Sun"
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
    id: "EarthPointerVectorText",
    type: "translate",
    x: earth_x_pos, y: 0, z: 0,
    nodes: [
        {
            type: "material",
            baseColor:      { r: 1.0, g: 1.0, b: 1.0 },
            specularColor:  { r: 1.0, g: 1.0, b: 1.0 },
            specular:       0.2,
            shine:          0.2,
            emit:           1.0,
            nodes: [
                {
                    type: "translate",
                    y: sun_radius_km * 20,
                    nodes: [
                        {
                            type: "billboard",
                            nodes: [
                                {
                                    type: "scale",
                                    x: 4000,
                                    y: 4000,
                                    z: 4000,
                                    nodes: [
                                        {
                                            type: "text",
                                            mode: "vector",
                                            text: "Earth"
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
                        far : milky_way_apparent_radius * 10
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
                            type: "translate",
                            x: 0, y: 0, z: 0,
                            nodes: [
                                {
                                    type: "material",
                                    baseColor:          { r: 1.0, g: 1.0, b: 0.0 },
                                    specularColor:      { r: 1.0, g: 1.0, b: 0.0 },
                                    specular:           5.0,
                                    shine:              5.0,
                                    emit:               20.0,
                                    nodes: [
                                        {
                                            type: "translate",
                                            y: 0,
                                            x: earth_orbital_radius_km * 1.15,
                                            z: earth_orbital_radius_km * -0.2,
                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x: 10000,
                                                    y: 10000,
                                                    z: 10000,
                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            angle: -90,
                                                            x:     1.0,
                                                            y:     0.0,
                                                            z:     0.0,
                                                            nodes: [
                                                                {
                                                                    type: "rotate",
                                                                    angle: -90,
                                                                    x:     0.0,
                                                                    y:     0.0,
                                                                    z:     1.0,
                                                                    nodes: [
                                                                        {
                                                                            type: "text",
                                                                            mode: "vector",
                                                                            text: "Jun"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "translate",
                                            y: 0,
                                            x: earth_orbital_radius_km * -0.2,
                                            z: earth_orbital_radius_km * -1.15,
                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x: 10000,
                                                    y: 10000,
                                                    z: 10000,
                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            angle: -90,
                                                            x:     1.0,
                                                            y:     0.0,
                                                            z:     0.0,
                                                            nodes: [
                                                                {
                                                                    type: "rotate",
                                                                    angle: 0,
                                                                    x:     0.0,
                                                                    y:     0.0,
                                                                    z:     1.0,
                                                                    nodes: [
                                                                        {
                                                                            type: "text",
                                                                            mode: "vector",
                                                                            text: "Sep"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "translate",
                                            y: 0,
                                            x: earth_orbital_radius_km * -1.15,
                                            z: earth_orbital_radius_km * 0.2,
                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x: 10000,
                                                    y: 10000,
                                                    z: 10000,
                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            angle: -90,
                                                            x:     1.0,
                                                            y:     0.0,
                                                            z:     0.0,
                                                            nodes: [
                                                                {
                                                                    type: "rotate",
                                                                    angle: 90,
                                                                    x:     0.0,
                                                                    y:     0.0,
                                                                    z:     1.0,
                                                                    nodes: [
                                                                        {
                                                                            type: "text",
                                                                            mode: "vector",
                                                                            text: "Dec"
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "translate",
                                            y: 0,
                                            x: earth_orbital_radius_km * 0.2,
                                            z: earth_orbital_radius_km * 1.15,
                                            nodes: [
                                                {
                                                    type: "scale",
                                                    x: 10000,
                                                    y: 10000,
                                                    z: 10000,
                                                    nodes: [
                                                        {
                                                            type: "rotate",
                                                            angle: -90,
                                                            x:     1.0,
                                                            y:     0.0,
                                                            z:     0.0,
                                                            nodes: [
                                                                {
                                                                    type: "rotate",
                                                                    angle: 180,
                                                                    x:     0.0,
                                                                    y:     0.0,
                                                                    z:     1.0,
                                                                    nodes: [
                                                                        {
                                                                            type: "text",
                                                                            mode: "vector",
                                                                            text: "Mar"
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
                            emit:           1.0

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
    choose_month:                "choose-month",
    choose_month_callbacks:       chooseMonthLogger
});

var seasons_activity = new seasons.Activity({
    version: 1.1,

    scenes: { scene: scene }
});

var scene = seasons_activity.scenes.scene;

var choose_month = document.getElementById("choose-month");

function chooseMonthLogger(month) {
  seasons_activity.logInteraction({ "choose month": month });
}

window.render = function() {
    SceneJS.withNode("theScene").start();
};

SceneJS.bind("error", function() {
    window.clearInterval(pInterval);
});

SceneJS.bind("reset", function() {
    window.clearInterval(pInterval);
});

var pInterval = setInterval(function () {
  window.render();
}, 30);

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

        if (zBufferDepth === 0) {
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

//
// month-distance experiment table and graph
//

var month_data = {
    "jan": { index:  0, num:   1, short_name: 'JAN', long_name: 'January' },
    "feb": { index:  1, num:   2, short_name: 'FEB', long_name: 'February' },
    "mar": { index:  2, num:   3, short_name: 'MAR', long_name: 'March' },
    "apr": { index:  3, num:   4, short_name: 'APR', long_name: 'April' },
    "may": { index:  4, num:   5, short_name: 'MAY', long_name: 'May' },
    "jun": { index:  5, num:   6, short_name: 'JUN', long_name: 'June' },
    "jul": { index:  6, num:   7, short_name: 'JUL', long_name: 'July' },
    "aug": { index:  7, num:   8, short_name: 'AUG', long_name: 'August' },
    "sep": { index:  8, num:   9, short_name: 'SEP', long_name: 'September' },
    "oct": { index:  9, num:  10, short_name: 'OCT', long_name: 'October' },
    "nov": { index: 10, num:  11, short_name: 'NOV', long_name: 'Novemeber' },
    "dec": { index: 11, num:  12, short_name: 'DEC', long_name: 'December' }
};

var month_names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

var seasons = ["Fall", "Winter", "Spring", "Summer"];

var month_data_table = document.getElementById("month-data-table");
var month_data_table_body = document.getElementById("month-data-table-body");

var month_distance = document.getElementById("month-distance");

var table_row_index = 0;

function addExperimentData() {

    var the_month = scene.month;
    var month = month_data[the_month];
    var distance_str = (scene.get_earth_distance()/1000).toPrecision(4);

    var month_element_id = 'table-row-id-' + the_month;

    // if the Month row already exists in the
    // data table return without adding a new one
    if (document.getElementById(month_element_id)) return false;

    table_row = document.createElement('tr');
    table_row.id = month_element_id;

    table_row_index++;
    table_data = document.createElement('td');
    table_data.textContent = table_row_index;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    table_data.textContent = month.short_name;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    table_data.textContent = distance_str;
    table_row.appendChild(table_data);

    month_data_table_body.appendChild(table_row);

    distance_data_to_plot[0].data[month.index+1][1] = +distance_str;
    plotEarthDistanceGraph();

    SortableTable.sort(month_data_table);
    return false;
}

function experimentDataToJSON() {
    var exp_table = { rows: [] };
    if (month_data_table_body) {
      var rows = month_data_table_body.childElements();
      var row_count = month_data_table_body.childElementCount;
      for (var r = 0; r < row_count; r++) {
          var row = rows[r];
          var cells = row.childElements();
          exp_table.rows.push({
              id:       row.id,
              index:    cells[0].textContent,
              month:    cells[1].textContent,
              distance: cells[2].textContent,
              state: {
                scene: JSON.stringify(scene.toJSON())
              }
          });
      }
      exp_table.table_row_index = table_row_index;
    }
    return exp_table;
}

function experimentDataFromJSON(exp_table) {
  var i, j;
  if (!month_data_table_body) { return; }
  var table_rows = month_data_table_body.rows.length;
  for (i = 0; i < table_rows; i++) {
      month_data_table_body.deleteRow(0);
  }

  var distance_data = distance_data_to_plot[0];
  for (j = 0; j < distance_data.data.length; j++) {
    distance_data.data[j] = [j, null];
  }

  var table_row, table_data;
  for (i = 0; i < exp_table.rows.length; i++) {
    var row = exp_table.rows[i],
        month = month_data[row.month.toLowerCase()],
        distance_str = row.distance;

    table_row = document.createElement('tr');
    table_row.id = row.id;

    table_data = document.createElement('td');
    table_data.textContent = row.index;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    table_data.textContent = row.month;
    table_row.appendChild(table_data);

    table_data = document.createElement('td');
    table_data.textContent = distance_str;
    table_row.appendChild(table_data);

    table_row.appendChild(table_data);

    distance_data_to_plot[0].data[month.index+1][1] = +distance_str;

    month_data_table_body.appendChild(table_row);
  }
  plotEarthDistanceGraph();
  table_row_index = exp_table.table_row_index;
}

var distance_data_to_plot = [];
distance_data_to_plot.push({
  "label": "Distance",
  "color": "#0000ff",
  "lines": {
    "show": false
  },
  "bars": {
    "show": true,
    "barWidth": 0.9
  },
  "data": [
    [0, null],
    [1, null],
    [2, null],
    [3, null],
    [4, null],
    [5, null],
    [6, null],
    [7, null],
    [8, null],
    [9, null],
    [10, null],
    [11, null],
    [12, null],
    [13, null]
  ]
});

var distance_x_axis_tics = [];
distance_x_axis_tics.push([0 , ""]);
for (var i = 1; i < 13; i++) {
  distance_x_axis_tics.push([i , month_data[month_names[i-1]].short_name]);
}
distance_x_axis_tics.push([13 , ""]);

function plotEarthDistanceGraph() {
    var f = Flotr.draw($('theCanvas4'), distance_data_to_plot,
      {
        xaxis:{
          labelsAngle: 60,
          ticks: distance_x_axis_tics,
          title: 'Month',
          noTics: distance_x_axis_tics.length,
          min: 0, max: distance_x_axis_tics.length - 1
        },
        yaxis: {
          title: 'Distance (millions of km)',
          min: 140,
          max: 160
        },
        title: "Distance from Sun to Earth by Month",
        grid:{ verticalLines: true, backgroundColor: 'white' },
        HtmlText: false,
        legend: false,
        // legend: { position: 'nw', margin: 1, backgroundOpacity: 0.1 },
        mouse:{
          track: true,
          lineColor: 'purple',
          relative: false,
          position: 'nw',
          sensibility: 1, // => The smaller this value, the more precise you've to point
          trackDecimals: 1,
          trackFormatter: function(obj) {
            return obj.series.label + ': ' + month_data[month_names[Number(obj.x) - 1]].short_name +  ', ' + obj.y;
          }
        },
        crosshair:{ mode: 'xy' }
      }
    );
}


SortableTable.load();

choose_month.onchange();

month_distance.onsubmit = addExperimentData;

plotEarthDistanceGraph();



function getRadioSelection(form_element) {
    for(var i = 0; i < form_element.elements.length; i++) {
        if (form_element.elements[i].checked) {
            return form_element.elements[i].value;
        }
    }
    return false;
};

var selected_city = document.getElementById("selected-city");
var city_option;
var active_cities = [];
var city, city_location;

for (var c = 0; c < cities.length; c++) {
    if (cities[c].active) active_cities.push(cities[c]);
};

for (var i = 0; i < active_cities.length; i++) {
    city_option = document.createElement('option');
    city = active_cities[i];
    city_location = city.location;
    city_option.value = i;
    city_option.textContent = city.name + ', ' + city.country;
    selected_city.appendChild(city_option);
};

function selectedCityHandler() {
    var city_index = Number(selected_city.value);
    var city = active_cities[city_index];
    var city_location = city.location;
    setLatitude(city_location.signed_latitude);
    setLongitude(city_location.signed_longitude);
};

selected_city.onchange = selectedCityHandler;

var choose_month = document.getElementById("choose-month");

function chooseMonthHandler(event) {
    var mon = getRadioSelection(choose_month);
    setEarthPositionByMon(mon)
};

choose_month.onchange = chooseMonthHandler;
chooseMonthHandler();

var choose_tilt = document.getElementById("choose-tilt");
var earth_tilt_quaternion = SceneJS.withNode("earth-tilt-quaternion");

function chooseTiltHandler() {
    var tilt = getRadioSelection(choose_tilt);
    switch (tilt) {
        case "yes":
            earth.tilt = orbitalTilt;
            break;

        case "no":
            earth.tilt = 0;
            break;
    };
    earth_tilt_quat = quat4.axisAngleDegreesCreate(0, 0, 1,  earth.tilt);
    earth_tilt_mat4 = quat4.toMat4(earth_tilt_quat);
    earth_tilt_quaternion.set("rotation", { 
        x: earth_tilt_axis[0], 
        y: earth_tilt_axis[1], 
        z: earth_tilt_axis[2],
        angle : earth.tilt });
    infoLabel();
};

choose_tilt.onchange = chooseTiltHandler;
chooseTiltHandler();


//
// Experiment Panel
//

var experiment_panel   = document.getElementById("experiment-panel");
var experiment_content = document.getElementById("experiment-content");
var experiment_view = document.getElementById("experiment-view");

function experimentPanel() {
    if (experiment_panel) {
        if (experiment_view.checked) {
            experiment_panel.style.opacity = 0.6;
            experiment_content.style.display = null;
        } else {
            experiment_content.style.display = "none";
            experiment_panel.style.opacity = null;
        };

        // var panelStr = "";
        // panelStr += "<br><hr><br>";
        // panelStr += "prediction ...<br />";
        // panelStr += "<br><hr><br>";
        // panelStr += "table ...<br />";
        // panelStr += "<br><hr><br>";
        // panelStr += "graph ...<br />";
        // panelStr += "<br><hr><br>";
        // experiment_content.innerHTML = panelStr;

        var canvas_properties = the_canvas.getBoundingClientRect();
        var container_properties = container.getBoundingClientRect();
        
        experiment_panel.style.top = canvas_properties.top + window.pageYOffset + 5 + "px";
        experiment_panel.style.left = canvas_properties.right - elementGetX(document.getElementById("content")) - experiment_panel.offsetWidth + "px";
    };
};

experiment_view.onchange = experimentPanel;
experimentPanel();

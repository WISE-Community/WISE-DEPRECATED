// some constants
var deg2rad = Math.PI/180;
var min2rad = Math.PI/(180*60);
var sec2rad = Math.PI/(180*60*60);
var rad2deg = 180/Math.PI;
var au2km = 149597870.691;
var earthMass = 5.9736e24;        // km
var earthRadius = 6378.1;         // km
var earthOrbitalPeriod = 365.256363004; // days
var earthRotationPeriod = 0.99726968;   // days
var twoPI  = Math.PI * 2;
var fourPI = Math.PI * 4;
var sqrt2 = Math.sqrt(2);
var orbitalTilt = 23.45;

var AU = 149597870.691;

var jun_day_number = day_number_by_month['jun'];
var jul_day_number = day_number_by_month['jul'];
var aug_day_number = day_number_by_month['aug'];
var sep_day_number = day_number_by_month['sep'];
var oct_day_number = day_number_by_month['oct'];
var nov_day_number = day_number_by_month['nov'];
var dec_day_number = day_number_by_month['dec'];
var jan_day_number = day_number_by_month['jan'];
var feb_day_number = day_number_by_month['feb'];
var mar_day_number = day_number_by_month['mar'];
var apr_day_number = day_number_by_month['apr'];
var may_day_number = day_number_by_month['may'];

var day_numbers = [
  jun_day_number,
  jul_day_number,
  aug_day_number,
  sep_day_number,
  oct_day_number,
  nov_day_number,
  dec_day_number,
  jan_day_number,
  feb_day_number,
  mar_day_number,
  apr_day_number,
  may_day_number,
];

var day_of_year_angles = []
for(var i=360; i >= 0; i -= 30) {
  day_of_year_angles.push((i + 90) % 360);
}

var initial_day_number = jun_day_number;

var day_of_year_angle = day_of_year_angles[0];

var initial_earth_rotation = 0;

var earth = {
    tilt: orbitalTilt,
    day_number: initial_day_number,
    month: 'jun',
    rotation: initial_earth_rotation,
};

function lat_long_to_cartesian(lat, lon, r) {
    r = r || 1;
    return [-r * Math.cos(lat * deg2rad) * Math.cos(lon * deg2rad),
             r * Math.sin(lat * deg2rad),
            -r * Math.cos(lat * deg2rad) * Math.sin(lon * deg2rad), 1];
}

function solar_altitude(lat, lon) {
    var corrected_tilt = Math.sin(day_of_year_angle * deg2rad) * orbitalTilt;
    var center   = lat_long_to_cartesian(corrected_tilt, earth.rotation);

    var loc      = lat_long_to_cartesian(lat, lon);
    var xd = center[0] - loc[0];
    var yd = center[1] - loc[1];
    var zd = center[2] - loc[2];
    var d1 = Math.sqrt(xd * xd + yd * yd + zd * zd);
    var alt = (Math.asin(d1 / 2) * 2 * rad2deg - 90) * -1;
    return alt;
}

function solar_flux() {
    return earth_ephemerides_solar_constant_by_day_number(earth.day_number);
}

function simpleSolarRadiation(alt) {
    var result = solar_flux() * Math.sin(alt * deg2rad) * SOLAR_FACTOR_AM1;
    return result < 0 ? 0 : result;
}

function solar_flux() {
    return earth_ephemerides_solar_constant_by_day_number(earth.day_number);
};

function simpleSolarRadiation(alt) {
    var result = solar_flux() * Math.sin(alt * deg2rad) * SOLAR_FACTOR_AM1;
    return result < 0 ? 0 : result; 
};

function spectralSolarRadiation(alt) {
  var radiation, normalized, flags;
  if (use_horizontal_flux) {
    radiation = totalHorizontalDirectInsolation(earth.day_number, alt);
  } else {
    radiation = totalDirectInsolation(earth.day_number, alt);
  };
  if (use_diffuse_correction) {
    radiation.total = radiation.total * DIFFUSE_CORRECTION_FACTOR;
    radiation.red   = radiation.red   * DIFFUSE_CORRECTION_FACTOR;
    radiation.green = radiation.green * DIFFUSE_CORRECTION_FACTOR;
    radiation.blue  = radiation.blue  * DIFFUSE_CORRECTION_FACTOR;
  }
  return radiation;
};

function solarRadiation(alt) {
  var radiation, rad, flags;
  if (alt > 0) {
    if (use_airmass) {
      radiation = spectralSolarRadiation(alt);
      rad = radiation.total;
    } else {
      if (use_horizontal_flux) {
        rad = simpleSolarRadiation(alt);
      } else {
        rad = simpleSolarRadiation(90);
      };
    };
  } else {
    rad = 0;
  };
  return rad
};

var datatable_table = document.getElementById("datatable")

var active_cities = [];

for (var c = 0; c < cities.length; c++) {
  if (cities[c].active) active_cities.push(cities[c]);
};

city_data = [];

use_horizontal_flux = true;
use_airmass = true;
use_diffuse_correction = true;

var i_formatter = d3.format(" 2d");
var f_formatter = d3.format(" 3.2f");
var column_titles = [];
var formatters = [];

column_titles.push('city', 'latitude');
formatters.push(String, f_formatter);
for (var d = 0; d < day_numbers.length; d++) {
  daynumber = day_numbers[d];
  column_titles.push(date_by_day_number[daynumber]);
  formatters.push(f_formatter);
}

for (var i = 0; i < active_cities.length; i++) {
  var row = [],
      name = active_cities[i].name
      latitude = active_cities[i].location.signed_latitude, 
      longitude = active_cities[i].location.signed_longitude;

  earth.rotation = longitude;
  row.push(name, latitude);
  for (var d = 0; d < day_numbers.length; d++) {
    earth.day_number = day_numbers[d];
    day_of_year_angle = day_of_year_angles[d];
    row.push(solar_altitude(latitude, longitude));
  }
  city_data.push(row)
}

render_datatable(city_data, column_titles, formatters);

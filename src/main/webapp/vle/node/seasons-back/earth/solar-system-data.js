
var AU = 149597870.691;

var sun_diameter_km_actual = 1392000.0;
var earth_diameter_km_actual = 12742.0;
var earth_orbital_radius_km_actual = AU;

var scale_factor = 1000;

var sun_radius_km =             (sun_diameter_km_actual  / 2)   / scale_factor;
var earth_radius_km =           (earth_diameter_km_actual / 2)  / scale_factor;
var earth_orbital_radius_km =    earth_orbital_radius_km_actual / scale_factor;

var milky_way_apparent_radius = earth_orbital_radius_km * 10;

var earth_x_pos = -earth_orbital_radius_km;
var sun_x_pos = 0;

var earth_view_small_offset = earth_radius_km / 5;
var earth_view_large_offset = earth_radius_km * 3;

var initial_earth_eye =      { x: earth_x_pos + earth_view_small_offset, y: earth_view_small_offset, z: earth_view_large_offset };
var initial_earth_eye_side = initial_earth_eye;
var initial_earth_eye_top =  { x: earth_x_pos, y: earth_view_large_offset, z: earth_view_small_offset };

var normalized_initial_earth_eye =      { x: 0, y: earth_view_small_offset, z: earth_view_large_offset };
var normalized_initial_earth_eye_side = normalized_initial_earth_eye;
var normalized_initial_earth_eye_top =  { x: 0, y: earth_view_large_offset, z: earth_view_small_offset };

var initial_earth_camera = {
    fovy : 40.0,
    near : 0.10,
    far : milky_way_apparent_radius * 10,    
}

var sun_view_small_offset = earth_orbital_radius_km * 0.3;
var sun_view_large_offset =  earth_orbital_radius_km * 2.5;

var initial_sun_eye = { x: sun_x_pos, y: sun_view_small_offset, z: sun_view_large_offset };
var initial_sun_eye_side = initial_sun_eye;
var initial_sun_eye_top = { x: sun_x_pos, y: sun_view_large_offset, z: sun_view_small_offset }

var initial_sun_camera = {
    fovy : 40.0,
    near : sun_view_large_offset / 10,
    far : milky_way_apparent_radius * 10,    
}

var earth_orbit_line_size_med = earth_radius_km / 100;
var earth_orbit_line_size_large = earth_radius_km * 150;

var sun_earth_line_size_med =   earth_radius_km / 250;
var sun_earth_line_size_large = earth_radius_km * 150;

monthNamesShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

var deg2rad = Math.PI/180;
var min2rad = Math.PI/(180*60);
var sec2rad = Math.PI/(180*60*60);
var rad2deg = 180/Math.PI;
var au2km = 149597870.7;
var earthMass = 5.9736e24;        // km
var earthRadius = 6378.1;         // km
var earthOrbitalPeriod = 365.256363004; // days
var earthRotationPeriod = 0.99726968;   // days
var t_day = 0.0001;
var fourPI = Math.PI * 4;

var solar_constant = 1367.6;

var earthOrbitData = {
  aphelion: 1.01671388,
  perihelion: 0.98329134,
  semiMajorAxis: 1.00000261,
  radius: 1.00,
  period: 1.00,
  inclination: 7.25*deg2rad,
  eccentricity : 0.01671123,
  longitude : 348.73936*deg2rad,
  argument : 114.20783*deg2rad
}


var sun_focus = earthOrbitData.eccentricity / earthOrbitData.semiMajorAxis / 2 * au2km / scale_factor;

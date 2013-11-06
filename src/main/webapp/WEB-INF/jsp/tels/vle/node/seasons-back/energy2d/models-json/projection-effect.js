var projection_effect = {
  "model": {
    "convective": "false",
    "solar_power_density": "2000.0",
    "viewupdate_interval": "20",
    "structure": {
      "part": {
        "label": "Surface",
        "specific_heat": "1300.0",
        "emissivity": "0.0",
        "reflection": "0.0",
        "rectangle": {
          "x": "-0.099999905",
          "y": "8.0",
          "height": "2.0",
          "width": "10.2"
        },
        "color": "333333",
        "constant_temperature": "false",
        "transmission": "0.0",
        "absorption": "1.0",
        "temperature": "0.0",
        "thermal_conductivity": "0.0010",
        "density": "25.0"
      }
    },
    "buoyancy_approximation": "1",
    "solar_ray_speed": "0.0010",
    "sun_angle": "1.5707964",
    "boundary": {
      "temperature_at_border": {
        "left": "0.0",
        "lower": "0.0",
        "upper": "0.0",
        "right": "0.0"
      }
    },
    "timestep": "500.0",
    "sunny": "true",
    "photon_emission_interval": "1",
    "solar_ray_count": "24",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.0",
    "ruler": "true",
    "maximum_temperature": "40.0",
    "text": {
      "name": "Arial",
      "size": "14",
      "x": "0.5",
      "y": "9.5",
      "color": "ffffff",
      "string": "Press 'Q' or 'W' to change the sun angle",
      "style": "0"
    },
    "minimum_temperature": "0.0",
    "rainbow_w": "0.0",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0",
    "isotherm": "true"
  },
  "sensor": {
    "thermometer": {
      "x": "5.0",
      "y": "7.0"
    }
  }
};
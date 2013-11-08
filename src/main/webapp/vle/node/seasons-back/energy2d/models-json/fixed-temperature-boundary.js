var fixed_temperature_boundary = {
  "model": {
    "convective": "false",
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "structure": {
      "part": {
        "specific_heat": "1300.0",
        "ellipse": {
          "a": "1.0",
          "b": "1.0",
          "x": "5.0",
          "y": "5.0"
        },
        "emissivity": "0.0",
        "reflection": "0.0",
        "power": "20.0",
        "constant_temperature": "false",
        "transmission": "0.0",
        "absorption": "1.0",
        "temperature": "0.0",
        "thermal_conductivity": "1.0",
        "density": "25.0"
      }
    },
    "buoyancy_approximation": "1",
    "solar_ray_speed": "0.1",
    "sun_angle": "1.5707964",
    "boundary": {
      "temperature_at_border": {
        "left": "0.0",
        "lower": "0.0",
        "upper": "0.0",
        "right": "0.0"
      }
    },
    "background_conductivity": "0.25",
    "timestep": "100.0",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.0",
    "maximum_temperature": "40.0",
    "text": {
      "name": "Arial",
      "size": "12",
      "x": "0.5",
      "y": "9.0",
      "color": "ffffff",
      "string": "Fixed temperature boundary",
      "style": "0"
    },
    "minimum_temperature": "0.0",
    "rainbow_w": "0.0",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0",
    "isotherm": "true"
  },
  "sensor": "\n"
};
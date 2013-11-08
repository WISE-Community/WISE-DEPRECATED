var wind_effect = {
  "model": {
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "structure": {
      "part": [
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "draggable": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.5166665",
            "y": "0.68333364",
            "height": "7.683333",
            "width": "0.183333"
          },
          "wind_speed": "0.05",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "visible": "false",
          "temperature": "0.0",
          "thermal_conductivity": "0.08",
          "density": "25.0"
        },
        {
          "label": "Ground",
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "draggable": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "8.3",
            "height": "1.6",
            "width": "10.0"
          },
          "color": "333333",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.0010",
          "density": "25.0"
        },
        {
          "label": "Wall",
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "2.0",
            "y": "6.4",
            "height": "2.0",
            "width": "0.25"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Wall",
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "7.5",
            "y": "6.4",
            "height": "2.0",
            "width": "0.25"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Roof",
          "specific_heat": "100.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "1.7",
            "y": "2.7",
            "height": "0.3",
            "width": "6.3"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "5.0",
          "density": "1.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "2.0",
            "y": "3.000001",
            "height": "1.0",
            "width": "0.25"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "7.5",
            "y": "3.0",
            "height": "1.0",
            "width": "0.25"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Heating board",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "3.1333332",
            "y": "7.883333",
            "height": "0.366667",
            "width": "3.466667"
          },
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "50.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Window",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "2.1000001",
            "y": "3.65",
            "height": "2.5",
            "width": "0.1"
          },
          "color": "ccccff",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.01",
          "density": "25.0"
        },
        {
          "label": "Window",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "7.5499997",
            "y": "3.65",
            "height": "2.5",
            "width": "0.1"
          },
          "color": "ccccff",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.01",
          "density": "25.0"
        }
      ]
    },
    "background_density": "1.0",
    "buoyancy_approximation": "0",
    "background_viscosity": "2.0E-4",
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
    "background_specific_heat": "1000.0",
    "background_conductivity": "1.0",
    "timestep": "0.1",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "1.0E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.0",
    "maximum_temperature": "50.0",
    "text": {
      "name": "Arial",
      "size": "14",
      "x": "1.0",
      "y": "9.0",
      "color": "ffffff",
      "string": "East Wind",
      "style": "0"
    },
    "minimum_temperature": "0.0",
    "rainbow_w": "0.0",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0",
    "velocity": "true"
  },
  "sensor": "\n"
};
var different_specific_heat2 = {
  "model": {
    "convective": "false",
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "model_height": "1.0",
    "structure": {
      "part": [
        {
          "label": "%specific_heat",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.19999999",
            "y": "0.3",
            "height": "0.4",
            "width": "0.3"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "40.0",
          "thermal_conductivity": "1.0",
          "density": "1.204"
        },
        {
          "label": "%specific_heat",
          "specific_heat": "500.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.49999997",
            "y": "0.3",
            "height": "0.4",
            "width": "0.3"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "10.0",
          "thermal_conductivity": "1.0",
          "density": "1.204"
        }
      ]
    },
    "buoyancy_approximation": "1",
    "solar_ray_speed": "0.1",
    "sun_angle": "1.5707964",
    "boundary": {
      "flux_at_border": {
        "left": "0.0",
        "lower": "0.0",
        "upper": "0.0",
        "right": "0.0"
      }
    },
    "background_specific_heat": "1.0",
    "background_conductivity": "1.0E-9",
    "timestep": "0.01",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "model_width": "1.0",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.033333335",
    "maximum_temperature": "60.0",
    "rainbow": "true",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.8333333",
    "rainbow_x": "0.083333336",
    "rainbow_y": "0.033333335",
    "grid": "true"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "0.35",
        "y": "0.45000005"
      },
      {
        "x": "0.65",
        "y": "0.45000005"
      }
    ]
  }
};
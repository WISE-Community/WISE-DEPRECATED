var natural_convection = {
  "model": {
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "structure": {
      "part": [
        {
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "0.0",
            "height": "1.0",
            "width": "10.0"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "5.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "4.9",
            "height": "0.2",
            "width": "10.0"
          },
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "40.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "9.0",
            "height": "1.0",
            "width": "10.0"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "5.0"
        }
      ]
    },
    "buoyancy_approximation": "0",
    "background_viscosity": "5.0E-5",
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
    "background_conductivity": "0.5",
    "timestep": "0.25",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.033333335",
    "maximum_temperature": "50.0",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.8333333",
    "rainbow_x": "0.083333336",
    "rainbow_y": "0.033333335"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "5.0",
        "y": "9.25"
      },
      {
        "x": "5.0",
        "y": "0.75"
      }
    ]
  }
};
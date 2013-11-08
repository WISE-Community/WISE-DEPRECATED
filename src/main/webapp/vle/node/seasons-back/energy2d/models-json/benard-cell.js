var benard_cell = {
  "model": {
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "structure": {
      "part": [
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "4.0",
            "height": "1.0",
            "width": "10.0"
          },
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Insulator",
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "7.0",
            "height": "1.0",
            "width": "10.0"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0E-6",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "6.8",
            "height": "0.2",
            "width": "10.0"
          },
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "20.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        }
      ]
    },
    "buoyancy_approximation": "1",
    "background_viscosity": "0.0010",
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
    "background_conductivity": "5.0",
    "timestep": "0.5",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.033333335",
    "maximum_temperature": "20.0",
    "rainbow": "true",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.8333333",
    "rainbow_x": "0.083333336",
    "rainbow_y": "0.033333335",
    "velocity": "true"
  },
  "sensor": "\n"
};
var laminar_turbulent = {
  "model": {
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "structure": {
      "part": {
        "specific_heat": "1300.0",
        "emissivity": "0.0",
        "reflection": "0.0",
        "rectangle": {
          "x": "0.0",
          "y": "4.0",
          "height": "2.0",
          "width": "0.5"
        },
        "wind_speed": "0.1",
        "constant_temperature": "true",
        "transmission": "0.0",
        "absorption": "1.0",
        "temperature": "20.0",
        "thermal_conductivity": "0.08",
        "density": "25.0"
      }
    },
    "buoyancy_approximation": "1",
    "background_viscosity": "5.0E-4",
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
    "background_conductivity": "0.5",
    "timestep": "0.2",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "0.0",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.033333335",
    "maximum_temperature": "40.0",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.49333334",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "2.0",
        "y": "5.0"
      },
      {
        "x": "4.0",
        "y": "5.0"
      },
      {
        "x": "8.0",
        "y": "5.0"
      }
    ]
  }
};
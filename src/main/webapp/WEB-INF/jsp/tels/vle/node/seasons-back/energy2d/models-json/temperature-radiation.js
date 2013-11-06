var temperature_radiation = {
  "model": {
    "convective": "false",
    "solar_power_density": "2000.0",
    "viewupdate_interval": "20",
    "structure": {
      "part": [
        {
          "label": "Mirror",
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "1.0",
          "rectangle": {
            "x": "4.9",
            "y": "0.0",
            "height": "10.0",
            "width": "0.2"
          },
          "color": "ccccff",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "0.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "4.25",
            "y": "4.5",
            "height": "1.0",
            "width": "0.5"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "5.0",
          "density": "10.0"
        },
        {
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "5.25",
            "y": "4.5",
            "height": "1.0",
            "width": "0.5"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "5.0",
          "density": "10.0"
        },
        {
          "label": "%temperature",
          "specific_heat": "1000.0",
          "emissivity": "1.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.55",
            "y": "2.5",
            "height": "5.0",
            "width": "0.5"
          },
          "uid": "left_radiator",
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "100.0",
          "thermal_conductivity": "0.1",
          "density": "25.0"
        },
        {
          "label": "%temperature",
          "specific_heat": "1000.0",
          "emissivity": "1.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "8.95",
            "y": "2.5",
            "height": "5.0",
            "width": "0.5"
          },
          "uid": "right_radiator",
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "500.0",
          "thermal_conductivity": "0.1",
          "density": "25.0"
        }
      ]
    },
    "background_density": "10.0",
    "buoyancy_approximation": "1",
    "background_viscosity": "1.568E-4",
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
    "background_conductivity": "1.0E-9",
    "timestep": "0.1",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.0",
    "clock": "false",
    "maximum_temperature": "100.0",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.0",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "5.5",
        "y": "5.0"
      },
      {
        "x": "4.5",
        "y": "5.0"
      }
    ]
  }
};
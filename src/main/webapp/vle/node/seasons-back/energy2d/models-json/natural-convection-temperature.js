var natural_convection_temperature = {
  "model": {
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "structure": {
      "part": [
        {
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "draggable": "false",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "0.0",
            "height": "2.0",
            "width": "10.0"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Insulator",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "draggable": "false",
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
          "thermal_conductivity": "1.0E-9",
          "density": "25.0"
        },
        {
          "label": "%temperature",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "draggable": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "6.8",
            "height": "0.2",
            "width": "4.8"
          },
          "uid": "left_heater",
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "50.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "-10.0",
            "y": "6.0",
            "height": "0.8",
            "width": "5.0"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.08",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "10.0",
            "y": "6.0",
            "height": "0.8",
            "width": "5.0"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.08",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "draggable": "false",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "-0.0333333",
            "y": "8.05",
            "height": "2.05",
            "width": "10.016666"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0E-9",
          "density": "25.0"
        },
        {
          "label": "%temperature",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "5.2",
            "y": "6.8",
            "height": "0.2",
            "width": "4.8"
          },
          "uid": "right_heater",
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "25.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Insulator",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "4.8",
            "y": "1.3000001",
            "height": "6.0",
            "width": "0.4"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0E-9",
          "density": "25.0"
        }
      ]
    },
    "background_density": "1.0",
    "buoyancy_approximation": "1",
    "background_viscosity": "2.0E-4",
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
    "background_specific_heat": "1000.0",
    "background_conductivity": "1.0",
    "timestep": "0.25",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.0",
    "ruler": "true",
    "maximum_temperature": "50.0",
    "rainbow": "true",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.0",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "2.5",
        "y": "1.75"
      },
      {
        "x": "7.5",
        "y": "1.75"
      }
    ]
  }
};
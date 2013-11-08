var compare_convection_conduction = {
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
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "draggable": "false",
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
          "temperature": "30.0",
          "thermal_conductivity": "1.0",
          "density": "25.0"
        },
        {
          "label": "Solid",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "draggable": "false",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "5.0666647",
            "y": "2.0500002",
            "height": "4.7",
            "width": "4.9"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "1.0"
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
          "label": "Insulator",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "draggable": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "4.666666",
            "y": "1.9833333",
            "height": "4.766667",
            "width": "0.4"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0E-9",
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
        }
      ]
    },
    "background_density": "1.0",
    "buoyancy_approximation": "0",
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
    "text": {
      "name": "Arial",
      "size": "14",
      "x": "2.0",
      "y": "5.5",
      "color": "ffffff",
      "string": "Air",
      "style": "0"
    },
    "rainbow": "true",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.0",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "2.1833334",
        "y": "1.7666668"
      },
      {
        "x": "7.75",
        "y": "1.7833334"
      }
    ]
  }
};
var forced_convection = {
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
            "x": "0.0",
            "y": "0.0",
            "height": "5.0",
            "width": "0.2"
          },
          "wind_speed": "0.025",
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
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "5.0",
            "height": "5.0",
            "width": "0.2"
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
          "reflection": "0.0",
          "rectangle": {
            "x": "0.1999999",
            "y": "4.9",
            "height": "0.2",
            "width": "9.6"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.0",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "ellipse": {
            "a": "1.0",
            "b": "1.0",
            "x": "2.5",
            "y": "7.5"
          },
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "30.0",
          "thermal_conductivity": "10.0",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "ellipse": {
            "a": "1.0",
            "b": "1.0",
            "x": "2.5",
            "y": "2.5"
          },
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "30.0",
          "thermal_conductivity": "10.0",
          "density": "25.0"
        }
      ]
    },
    "buoyancy_approximation": "1",
    "background_viscosity": "1.0E-4",
    "solar_ray_speed": "0.1",
    "sun_angle": "1.5707964",
    "boundary": {
      "flux_at_border": {
        "left": "0.0",
        "lower": "0.0",
        "upper": "0.0",
        "right": "-2.0"
      }
    },
    "background_conductivity": "1.0",
    "timestep": "0.5",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "0.0",
    "measurement_interval": "50"
  },
  "view": {
    "rainbow_h": "0.033333335",
    "maximum_temperature": "40.0",
    "text": [
      {
        "name": "Arial",
        "size": "12",
        "x": "0.5",
        "y": "0.5",
        "color": "ffffff",
        "string": "No fan",
        "style": "0"
      },
      {
        "name": "Arial",
        "size": "12",
        "x": "0.5",
        "y": "5.75",
        "color": "ffffff",
        "string": "Fan",
        "style": "0"
      }
    ],
    "minimum_temperature": "0.0",
    "rainbow_w": "0.49333334",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "2.525",
        "y": "7.55"
      },
      {
        "x": "2.525",
        "y": "2.4500003"
      }
    ]
  }
};
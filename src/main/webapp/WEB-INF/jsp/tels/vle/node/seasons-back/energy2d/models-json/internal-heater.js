var internal_heater = {
  "model": {
    "convective": "false",
    "solar_power_density": "2000.0",
    "viewupdate_interval": "20",
    "structure": {
      "part": [
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "8.0",
            "y": "7.0",
            "height": "1.0",
            "width": "0.5"
          },
          "power": "1.92",
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
            "x": "1.0",
            "y": "7.0",
            "height": "1.0",
            "width": "0.5"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.0010",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "1.0",
            "y": "4.0",
            "height": "1.0",
            "width": "0.5"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.0010",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "polygon": {
            "vertices": "0.5, 4.0, 0.5, 3.5, 5.0, 1.0, 9.5, 3.5, 9.5, 4.0",
            "count": "5"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.0010",
          "density": "25.0"
        },
        {
          "label": "Ground",
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "-0.099999905",
            "y": "8.0",
            "height": "2.0",
            "width": "10.2"
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
            "x": "8.5",
            "y": "4.0",
            "height": "4.0",
            "width": "0.5"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.0010",
          "density": "25.0"
        },
        {
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "reflection": "0.0",
          "rectangle": {
            "x": "1.15",
            "y": "5.0",
            "height": "2.0",
            "width": "0.2"
          },
          "color": "ffffff",
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.0010",
          "density": "25.0"
        }
      ]
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
    "timestep": "5000.0",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "thermal_buoyancy": "2.5E-4",
    "measurement_interval": "100"
  },
  "view": {
    "rainbow_h": "0.033333335",
    "ruler": "true",
    "maximum_temperature": "40.0",
    "minimum_temperature": "0.0",
    "rainbow_w": "0.49333334",
    "rainbow_x": "0.0",
    "rainbow_y": "0.0",
    "isotherm": "true"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "0.9",
        "y": "6.0"
      },
      {
        "x": "1.65",
        "y": "6.0"
      },
      {
        "x": "8.15",
        "y": "6.0"
      }
    ]
  }
};
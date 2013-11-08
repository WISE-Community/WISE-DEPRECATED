var parallel_circuit_analogy = {
  "model": {
    "convective": "false",
    "solar_power_density": "2000.0",
    "viewupdate_interval": "10",
    "model_height": "0.1",
    "structure": {
      "part": [
        {
          "label": "%temperature",
          "specific_heat": "1300.0",
          "emissivity": "0.0",
          "draggable": "false",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.0",
            "y": "0.024",
            "height": "0.05",
            "width": "0.02"
          },
          "constant_temperature": "true",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "50.0",
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
            "x": "0.08",
            "y": "0.024",
            "height": "0.05",
            "width": "0.02"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.08",
          "density": "25.0"
        },
        {
          "label": "R2",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.02",
            "y": "0.026",
            "height": "0.01",
            "width": "0.06"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.01",
          "density": "900.0"
        },
        {
          "label": "R1",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.02",
            "y": "0.038",
            "height": "0.01",
            "width": "0.06"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "900.0"
        },
        {
          "label": "R1",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.02",
            "y": "0.061999995",
            "height": "0.01",
            "width": "0.06"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "1.0",
          "density": "900.0"
        },
        {
          "label": "R2",
          "specific_heat": "1000.0",
          "emissivity": "0.0",
          "filled": "false",
          "reflection": "0.0",
          "rectangle": {
            "x": "0.02",
            "y": "0.049999997",
            "height": "0.01",
            "width": "0.06"
          },
          "constant_temperature": "false",
          "transmission": "0.0",
          "absorption": "1.0",
          "temperature": "0.0",
          "thermal_conductivity": "0.01",
          "density": "900.0"
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
    "background_conductivity": "1.0E-9",
    "photon_emission_interval": "20",
    "solar_ray_count": "24",
    "model_width": "0.1",
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
    "rainbow_y": "0.0",
    "grid": "true"
  },
  "sensor": {
    "thermometer": [
      {
        "x": "0.09",
        "y": "0.05"
      },
      {
        "x": "0.062",
        "y": "0.032"
      },
      {
        "x": "0.062",
        "y": "0.044"
      },
      {
        "x": "0.062",
        "y": "0.055999998"
      },
      {
        "x": "0.062000003",
        "y": "0.067833334"
      }
    ]
  }
};
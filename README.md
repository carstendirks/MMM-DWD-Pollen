# MMM-DWD-Pollen
This Magic Mirror Module display the Pollen information from DWD (=Deutscher Wetterdienst)

For the data source & region data: egions: https://opendata.dwd.de/climate_environment/health/alerts/Beschreibung_pollen_s31fg.pdf

This module is derived from: https://github.com/vincep5/MMM-Pollen

## Preview
![screenshot](screenshot.PNG)

## Installation
1. Navigate to `modules`
2. Run git clone https://github.com/carstendirks/MMM-DWD-Pollen from inside your MagicMirror/modules folder

## Configuratin
Add `MMM-DWD-Pollen` module to the `modules` array in the `config/config.js` file:

````javascript
modules: [
  {
    module: "MMM-DWD-Pollen",
    position: "bottom_righ",
    header: "Pollenwarnung",
    config: {
        updateInterval: 1 * 60 * 60 * 1000, // every 1 hour1
        DWD_region: 92, //
    }
  },
]

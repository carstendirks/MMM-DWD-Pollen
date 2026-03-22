# MMM-DWD-Pollen

A [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) module that displays pollen forecast data from the DWD (Deutscher Wetterdienst) for Germany.

Data source: [DWD Open Data](https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json) — no API key required.

## Display Modes

The module supports three display modes:

| Mode | Description |
|------|-------------|
| `"number"` | Coloured numeric values (original style) |
| `"icon"` | Star-based severity icons (original style) |
| `"visual"` | **New** — SVG pollen icons + gradient severity bars |

## Installation

Clone this repository into your MagicMirror `modules` folder:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/carstendirks/MMM-DWD-Pollen.git
```

**No `npm install` needed** — v2.0 has zero external dependencies.

### Upgrading from v1.x

If you previously ran `npm install`, you can safely delete `node_modules` and `package-lock.json` from the module folder. The deprecated `request` package is no longer used.

## Configuration

Add to your `config/config.js`:

```js
{
    module: "MMM-DWD-Pollen",
    position: "bottom_right",
    header: "Pollenwarnung",
    config: {
        updateInterval: 1 * 60 * 60 * 1000, // every 1 hour
        DWD_region: 92,                       // Rhein-Main
        displayMode: "visual",                // "number", "icon", or "visual"
        pollenList: "Hasel,Erle,Esche,Birke,Graeser,Roggen,Beifuss,Ambrosia",
        showNullValue: false,
    }
},
```

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `updateInterval` | How often to fetch new data (ms). DWD updates once daily at ~11:00 CET. | `3600000` (1h) |
| `DWD_region` | DWD sub-region ID (see list below) | `92` |
| `displayMode` | `"number"`, `"icon"`, or `"visual"` | `"visual"` |
| `pollenList` | Comma-separated pollen types to display | all 8 types |
| `showNullValue` | Show rows even when severity is 0 | `false` |
| `fadeSpeed` | DOM update fade duration (ms) | `2000` |

## DWD Regions

```
10  Schleswig-Holstein und Hamburg
11  Inseln und Marschen
12  Geest, Schleswig-Holstein und Hamburg
20  Mecklenburg-Vorpommern
30  Niedersachsen und Bremen
31  Westl. Niedersachsen/Bremen
32  Östl. Niedersachsen
40  Nordrhein-Westfalen
41  Rhein.-Westfäl. Tiefland
42  Ostwestfalen
43  Mittelgebirge NRW
50  Brandenburg und Berlin
60  Sachsen-Anhalt
61  Tiefland Sachsen-Anhalt
62  Harz
70  Thüringen
71  Tiefland Thüringen
72  Mittelgebirge Thüringen
80  Sachsen
81  Tiefland Sachsen
82  Mittelgebirge Sachsen
90  Hessen
91  Nordhessen und hess. Mittelgebirge
92  Rhein-Main
100 Rheinland-Pfalz und Saarland
101 Rhein, Pfalz, Nahe und Mosel
102 Mittelgebirgsbereich Rheinland-Pfalz
103 Saarland
110 Baden-Württemberg
111 Oberrhein und unteres Neckartal
112 Hohenlohe/mittlerer Neckar/Oberschwaben
113 Mittelgebirge Baden-Württemberg
120 Bayern
121 Allgäu/Oberbayern/Bay. Wald
122 Donauniederungen
123 Bayern nördl. der Donau, o. Bayr. Wald, o. Mainfranken
124 Mainfranken
```

Region map: [DWD Gebiete](https://www.dwd.de/DE/leistungen/gefahrenindizespollen/Gebiete.html)

## Changes in v2.0

- **New visual display mode** with SVG pollen icons and gradient severity bars
- **Zero dependencies** — replaced deprecated `request` package with built-in Node.js `https`
- **Improved reliability** — request timeout, size limiting, automatic retry with exponential back-off
- **Bug fix** — date comparison now uses full date instead of `getDay()` (which wraps weekly)
- **Error handling** — displays error state instead of silently failing
- **Cleaner code** — lookup tables, ES6+ syntax, consistent architecture

## License

MIT © 2020 Carsten Dirks

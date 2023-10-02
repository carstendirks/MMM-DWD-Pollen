"use strict";

Module.register("MMM-DWD-Pollen", {
  result: [],
  availablePollenType: "Hasel,Erle,Esche,Birke,Graeser,Roggen,Beifuss,Ambrosia",
  // Default module config.
  defaults: {
    updateInterval: 60 * 60 * 1000, // every 1 hour
    fadeSpeed: 2000,
    DWD_region: 92,
    icon: false,
    pollenList: this.availablePollenType,
    showNullValue: false
  },

  start: function () {
    this.loaded = false;
    this.getData();
    this.scheduleUpdate();
  },

  getStyles: function () {
    return ["MMM-DWD-Pollen.css"];
  },

  // Override dom generator.
  getDom: function () {
    function writePollen(
      pollenTabelle,
      pollenArt,
      pollenToday,
      pollenTomorrow,
      pollenDayafter_to,
      timestamp
    ) {
      function designPollen(tableElement, pollenValue) {
        // Determine color:
        // Low (0-1) and (1) -> Green
        // Low-Medium (1-2)  -> Yellow
        // Medium (2) -> Yellow
        // Medium-High (2-3) -> red
        // High (3) -> red

        //var iconPollen = false; //this.config.icon;

        if (iconPollen) {
          // Show as icons

          if (pollenValue === "3") {
            tableElement.innerHTML = '<div class="fa fa-star"></div>';
            tableElement.innerHTML += '<div class="fa fa-star"></div>';
            tableElement.innerHTML += '<div class="fa fa-star"></div>';
            tableElement.className = "pollen-high";
          } else if (pollenValue === "2-3") {
            tableElement.innerHTML = '<div class="fa fa-star"></div>';
            tableElement.innerHTML += '<div class="fa fa-star"></div>';
            tableElement.innerHTML += '<div class="fa fa-star-half"></div>';
            tableElement.className = "pollen-mediumhigh";
          } else if (pollenValue === "2") {
            tableElement.innerHTML = '<div class="fa fa-star"></div>';
            tableElement.innerHTML += '<div class="fa fa-star"></div>';
            tableElement.className = "pollen-medium";
          } else if (pollenValue === "1-2") {
            tableElement.innerHTML = '<div class="fa fa-star"></div>';
            tableElement.innerHTML += '<div class="fa fa-star-half"></div>';
            tableElement.className = "pollen-lowmedium";
          } else if (pollenValue === "1") {
            tableElement.innerHTML = '<div class="fa fa-star"></div>';
            tableElement.className = "pollen-low";
          } else if (pollenValue === "0-1") {
            tableElement.innerHTML = '<div class="fa fa-star-half"></div>';
            tableElement.className = "pollen-low";
          } else if (pollenValue === "0") {
            tableElement.innerHTML = '<div class="fa fa-star-o"></div>';
            tableElement.className = "pollen-low";
          } else if (pollenValue === "Keine Werte") {
            tableElement.className = "pollen-nodata";
          } else if (pollenValue === "-") {
            tableElement.className = "pollen-nodata";
          }
        } else {
          // Show as numbers

          tableElement.innerHTML = pollenValue;

          if (pollenValue === "3") {
            tableElement.className = "pollen-high";
          } else if (pollenValue === "2-3") {
            tableElement.className = "pollen-mediumhigh";
          } else if (pollenValue === "2") {
            tableElement.className = "pollen-medium";
          } else if (pollenValue === "1-2") {
            tableElement.className = "pollen-lowmedium";
          } else if (pollenValue === "1") {
            tableElement.className = "pollen-low";
          } else if (pollenValue === "0-1") {
            tableElement.className = "pollen-low";
          } else if (pollenValue === "0") {
            tableElement.className = "pollen-low";
          } else if (pollenValue === "Keine Werte") {
            tableElement.className = "pollen-nodata";
          } else if (pollenValue === "-") {
            tableElement.className = "pollen-nodata";
          }
        }
      }

      const td1 = document.createElement("td");
      if (pollenArt === "Graeser") {
	td1.innerHTML = "Gr&aumlser";
      } else if (pollenArt === "Beifuss") {
	td1.innerHTML = "Beifu&szlig";
      } else {
      	td1.innerHTML = pollenArt;
      }
      td1.className = "xsmall";

      const td2 = document.createElement("td");
      //when data is from yesterday then output tomorrow's data as today's
      if (timestamp.getDay() === new Date().getDay() - 1) {
        designPollen(td2, pollenTomorrow);
      } else {
        designPollen(td2, pollenToday);
      }

      const td3 = document.createElement("td");
        //when data is from yesterday then output day after tomorrow's data as tomorrow's
      if (timestamp.getDay() === new Date().getDay()) {
        designPollen(td3, pollenTomorrow);
      } else {
        // when data is not from tomorrow then display '-'
        designPollen(td3, pollenDayafter_to);
      }
      
      const td4 = document.createElement("td");
      if (timestamp.getDay() === new Date().getDay()) {
        designPollen(td4, pollenDayafter_to);
      } else {
        // when data is not from day after tomorrow then display '-'
        designPollen(td4, "-");
      }

      const tr = document.createElement("tr");
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      pollenTabelle.appendChild(tr);
    }

    const DWDRegion = this.config.DWD_region;
    const iconPollen = this.config.icon;
    const pollenList = this.config.pollenList;
    const showNullValue = this.config.showNullValue;

    const wrapper = document.createElement("pollen");

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    wrapper.className = "small bright";

    //header row
    const tbl = document.createElement("table");
    const tr = document.createElement("tr");
    const td1 = document.createElement("th");
    td1.innerHTML = "";
    td1.width="25%";
    const td2 = document.createElement("th");
    td2.innerHTML = "Heute";
    td2.className = "tab-center xsmall";
    td2.width="25%";
    const td3 = document.createElement("th");
    td3.innerHTML = "Morgen";
    td3.className = "tab-center xsmall";
    td3.width="25%";
    const td4 = document.createElement("th");
    td4.innerHTML = "&Uumlbermorgen";
    td4.className = "tab-center xsmall";
    td4.width="25%";
  

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tbl.appendChild(tr);

    let pollenDataAvailable = 0;

    // Check if you got a result set
    if (this.result) {
      const lastUpdateString = this.result.last_update.replace(" Uhr", "");
      const lastUpdate = new Date(lastUpdateString);

      const checkData = (r, name) => {
        if (pollenList.indexOf(name) !== -1) {
          if (
            showNullValue ||
            r.Pollen[name].today !== "0" ||
            r.Pollen[name].tomorrow !== "0" ||
	    r.Pollen[name].dayafter_to !== "0"
          ) {
            writePollen(
              tbl,
              name,
              r.Pollen[name].today,
              r.Pollen[name].tomorrow,
	      r.Pollen[name].dayafter_to,
              lastUpdate
            );
            pollenDataAvailable = 1;
          }
        }
      };

      // Go through the result set
      this.result.content.forEach((r) => {
        // Check Region Match
        if (
          r.partregion_id === DWDRegion ||
          (r.region_id === DWDRegion && r.partregion_id === -1)
        ) {
          // Check for each pollenType
          this.availablePollenType
            .split(",")
            .forEach((pollen) => checkData(r, pollen));
        }
      });
    }
    // No Data available
    if (pollenDataAvailable === 0) {
      writePollen(tbl, "", "Keine Werte", "Keine Werte", new Date());
    }
    wrapper.appendChild(tbl);
    return wrapper;
  },

  scheduleUpdate: function (delay) {
    let nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    setInterval(() => {
      this.getData();
    }, nextLoad);
  },

  getData: function () {
    const url =
      "https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json";
    this.sendSocketNotification(url);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "DWD_POLLEN_RESULT") {
      this.result = payload;
      this.loaded = true;
      this.updateDom(this.config.fadeSpeed);
    }
  }
});

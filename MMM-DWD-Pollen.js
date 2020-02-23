'use strict';


Module.register("MMM-DWD-Pollen", {

    result: [],
    // Default module config.
    defaults: {
        updateInterval: 1 * 60 * 60 * 1000, // every 1 hour
        fadeSpeed: 2000,
	DWD_region: 92,
    },

    start: function() {
        this.loaded = false;
        this.getData();
        this.scheduleUpdate();
    },

    getStyles: function() {
        return ["MMM-DWD-Pollen.css"];
    },


   // Override dom generator.
    getDom: function() {

	
	function writePollen(pollenTabelle, pollenArt, pollenToday, pollenTomorrow) {
	

	var td1 = document.createElement("td");
	td1.innerHTML = pollenArt;
	
	var td2 = document.createElement("td");
	td2.innerHTML = pollenToday;
	
	var td3 = document.createElement("td");
	td3.innerHTML = pollenTomorrow;
	

	//determine color
        // Low (0-1) and (1)
        // Low-Medium (1-2) 
        // Medium (2) 
        // Medium-High (2-3) 
        // High (3) 
        
	if(pollenToday == "3") {
        	td2.className = "pollen-high";
        } else if(pollenToday == "2-3") {
        	td2.className = "pollen-mediumhigh";
        } else if(pollenToday == "2") {
        	td2.className = "pollen-medium";
        } else if(pollenToday == "1-2") {
        	td2.className = "pollen-lowmedium";	
        } else if(pollenToday == "1") {
        	td2.className = "pollen-low";	
        } else if(pollenToday == "0-1") {
        	td2.className = "pollen-low";
	} else if(pollenToday == "Keine Werte") {
		td2.className = "pollen-nodata";
	};
	
	if(pollenTomorrow == "3") {
        	td3.className = "pollen-high";
        } else if(pollenTomorrow == "2-3") {
        	td3.className = "pollen-mediumhigh";
        } else if(pollenTomorrow == "2") {
        	td3.className = "pollen-medium";
        } else if(pollenTomorrow == "1-2") {
        	td3.className = "pollen-lowmedium";
        } else if(pollenTomorrow == "1") {
        	td3.className = "pollen-low";
        } else if(pollenTomorrow == "0-1") {
        	td3.className = "pollen-low";
	} else if(pollenTomorrow == "Keine Werte") {
		td3.className = "pollen-nodata";
	};
	
	var tr = document.createElement("tr");
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
                
        pollenTabelle.appendChild(tr);
    }

   	var DWDRegion = this.config.DWD_region;

        var wrapper = document.createElement("pollen");

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("LOADING");
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        wrapper.className = 'small bright';

        //header row
        var tbl = document.createElement("table");
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.innerHTML = "";
        var td2 = document.createElement("td");
        td2.innerHTML = "Heute";
	td2.className = "tab-center";
        var td3 = document.createElement("td");
        td3.innerHTML = "Morgen";
	td3.className = "tab-center";
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbl.appendChild(tr);
	
	// Check if you got a result set
        if (this.result) { 
		
		// Go through the result set
		this.result.content.forEach(function(r) {
			
			// Check Region Match
			if (r.partregion_id == DWDRegion) {
				
				var pollenDataAvailable = 0;
				
				// Erle
				if ((r.Pollen.Erle.today > 0) || (r.Pollen.Erle.tomorrow > 0)) {
					writePollen(tbl, "Erle", r.Pollen.Erle.today, r.Pollen.Erle.tomorrow);
                			pollenDataAvailable = 1;
				};
				// Roggen
				if ((r.Pollen.Roggen.today > 0) || (r.Pollen.Roggen.tomorrow > 0)) {
					writePollen(tbl, "Roggen", r.Pollen.Roggen.today, r.Pollen.Roggen.tomorrow);
                			pollenDataAvailable = 1;
				};
				// Ambrosia
				if ((r.Pollen.Ambrosia.today > 0) || (r.Pollen.Ambrosia.tomorrow > 0)) {
					writePollen(tbl, "Ambrosia", r.Pollen.Ambrosia.today, r.Pollen.Ambrosia.tomorrow);
                			pollenDataAvailable = 1;
				};
				// Esche
				if ((r.Pollen.Esche.today > 0) || (r.Pollen.Esche.tomorrow > 0)) {
					writePollen(tbl, "Esche", r.Pollen.Esche.today, r.Pollen.Esche.tomorrow);
                			pollenDataAvailable = 1;
				};
				// Gräßer
				if ((r.Pollen.Graeser.today > 0) || (r.Pollen.Graeser.tomorrow > 0)) {
					writePollen(tbl, "Graeser", r.Pollen.Graeser.today, r.Pollen.Graeser.tomorrow);
                			pollenDataAvailable = 1;
				};
				// Hasel
				if ((r.Pollen.Hasel.today > 0) || (r.Pollen.Hasel.tomorrow > 0)) {
					writePollen(tbl, "Hasel", r.Pollen.Hasel.today, r.Pollen.Hasel.tomorrow);
                			pollenDataAvailable = 1;
				};
				// Birke
				if ((r.Pollen.Birke.today > 0) || (r.Pollen.Birke.tomorrow > 0)) {
					writePollen(tbl, "Birke", r.Pollen.Birke.today, r.Pollen.Birke.tomorrow);
                			pollenDataAvailable = 1;
				};
				// Beifuss
				if ((r.Pollen.Beifuss.today > 0) || (r.Pollen.Beifuss.tomorrow > 0)) {
					writePollen(tbl, "Beifuss", r.Pollen.Beifuss.today, r.Pollen.Beifuss.tomorrow);
                			pollenDataAvailable = 1;
				};

				// No Data available
				if (pollenDataAvailable == 0) {
					writePollen(tbl, "", "Keine Werte", "Keine Werte");
				};


                		
			};
		});
            
        }

        wrapper.appendChild(tbl);
        return wrapper;
    },

    

    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        setInterval(function() {
            self.getData();
        }, nextLoad);
    },

    getData: function () {
        var url = "https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json"; 
        this.sendSocketNotification(url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "DWD_POLLEN_RESULT") {
            this.result = payload;
            this.loaded = true;
            this.updateDom(this.config.fadeSpeed);
        }
    },

});
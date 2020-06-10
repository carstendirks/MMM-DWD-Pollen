'use strict';


Module.register("MMM-DWD-Pollen", {

    result: [],
    // Default module config.
    defaults: {
        updateInterval: 1 * 60 * 60 * 1000, // every 1 hour
        fadeSpeed: 2000,
	DWD_region: 92,
	icon: false,
	pollenList: "Hasel,Erle,Esche,Birke,Graeser,Roggen,Beifuss,Ambrosia",
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
	
		function designPollen(tableElement, pollenValue) {
			
			
			// Determine color:
	        	// Low (0-1) and (1) -> Green
	        	// Low-Medium (1-2)  -> Yellow
	        	// Medium (2) -> Yellow
	        	// Medium-High (2-3) -> red
	        	// High (3) -> red

			//var iconPollen = false; //this.config.icon;
			

			if (iconPollen) { // Show as icons
			
				if(pollenValue == "3") {
					tableElement.innerHTML="<div class=\"fa fa-star\"></div>";
					tableElement.innerHTML+="<div class=\"fa fa-star\"></div>";
					tableElement.innerHTML+="<div class=\"fa fa-star\"></div>";
	        			tableElement.className = "pollen-high";
				} else if(pollenValue == "2-3") {
					tableElement.innerHTML="<div class=\"fa fa-star\"></div>";
					tableElement.innerHTML+="<div class=\"fa fa-star\"></div>";
					tableElement.innerHTML+="<div class=\"fa fa-star-half\"></div>";
					tableElement.className = "pollen-mediumhigh";
	        		} else if(pollenValue == "2") {
					tableElement.innerHTML="<div class=\"fa fa-star\"></div>";
					tableElement.innerHTML+="<div class=\"fa fa-star\"></div>";
					tableElement.className = "pollen-medium";
	        		} else if(pollenValue == "1-2") {
					tableElement.innerHTML="<div class=\"fa fa-star\"></div>";
					tableElement.innerHTML+="<div class=\"fa fa-star-half\"></div>";
					tableElement.className = "pollen-lowmedium";	
	        		} else if(pollenValue == "1") {
					tableElement.innerHTML="<div class=\"fa fa-star\"></div>";
					tableElement.className = "pollen-low";	
	        		} else if(pollenValue == "0-1") {
					tableElement.innerHTML="<div class=\"fa fa-star-half\"></div>";
					tableElement.className = "pollen-low";
				} else if(pollenValue == "Keine Werte") {
					tableElement.className = "pollen-nodata";
				}; 
			}  else { // Show as numbers

				tableElement.innerHTML=pollenValue;

				if(pollenValue == "3") {
	        			tableElement.className = "pollen-high";
				} else if(pollenValue == "2-3") {
					tableElement.className = "pollen-mediumhigh";
	        		} else if(pollenValue == "2") {
					tableElement.className = "pollen-medium";
	        		} else if(pollenValue == "1-2") {
					tableElement.className = "pollen-lowmedium";	
	        		} else if(pollenValue == "1") {
					tableElement.className = "pollen-low";	
	        		} else if(pollenValue == "0-1") {
					tableElement.className = "pollen-low";
	        		} else if(pollenValue == "0") {
					tableElement.className = "pollen-low";
				} else if(pollenValue == "Keine Werte") {
					tableElement.className = "pollen-nodata";
				}; 
			};


		};

		var td1 = document.createElement("td");
		td1.innerHTML = pollenArt;
		
		var td2 = document.createElement("td");
		designPollen(td2, pollenToday);
		
		var td3 = document.createElement("td");
		designPollen(td3, pollenTomorrow);
			        
		var tr = document.createElement("tr");

	        tr.appendChild(td1);
	        tr.appendChild(td2);
	        tr.appendChild(td3);
	                
	        pollenTabelle.appendChild(tr);
    	}

   	var DWDRegion = this.config.DWD_region;
	var iconPollen = this.config.icon;
	var pollenList = this.config.pollenList;

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

	var pollenDataAvailable = 0;
	
	// Check if you got a result set
        if (this.result) { 
		

		// Go through the result set
		this.result.content.forEach(function(r) {
			
			// Check Region Match
			if ((r.partregion_id == DWDRegion) || ((r.region_id == DWDRegion) && (r.partregion_id == -1))) {
						

				// Erle
				if (pollenList.indexOf("Erle") != -1) {
					if ((r.Pollen.Erle.today != 0) || (r.Pollen.Erle.tomorrow != 0)) {
						writePollen(tbl, "Erle", r.Pollen.Erle.today, r.Pollen.Erle.tomorrow);
                				pollenDataAvailable = 1;
					};
				};
				// Roggen
				if (pollenList.indexOf("Roggen") != -1) {
					if ((r.Pollen.Roggen.today != 0) || (r.Pollen.Roggen.tomorrow != 0)) {
						writePollen(tbl, "Roggen", r.Pollen.Roggen.today, r.Pollen.Roggen.tomorrow);
                				pollenDataAvailable = 1;
					};
				};
				// Ambrosia
				if (pollenList.indexOf("Ambrosia") != -1) {
					if ((r.Pollen.Ambrosia.today != 0) || (r.Pollen.Ambrosia.tomorrow != 0)) {
						writePollen(tbl, "Ambrosia", r.Pollen.Ambrosia.today, r.Pollen.Ambrosia.tomorrow);
                				pollenDataAvailable = 1;
					};
				};
				// Esche
				if (pollenList.indexOf("Esche") != -1) {
					if ((r.Pollen.Esche.today != 0) || (r.Pollen.Esche.tomorrow != 0)) {
						writePollen(tbl, "Esche", r.Pollen.Esche.today, r.Pollen.Esche.tomorrow);
                				pollenDataAvailable = 1;	
					};
				};
				// Gräser
				if (pollenList.indexOf("Graeser") != -1) {
					if ((r.Pollen.Graeser.today != 0) || (r.Pollen.Graeser.tomorrow != 0)) {
						writePollen(tbl, "Gr&aumlser", r.Pollen.Graeser.today, r.Pollen.Graeser.tomorrow);
                				pollenDataAvailable = 1;
					};
				};
				// Hasel
				if (pollenList.indexOf("Hasel") != -1) {
					if ((r.Pollen.Hasel.today != 0) || (r.Pollen.Hasel.tomorrow != 0)) {
						writePollen(tbl, "Hasel", r.Pollen.Hasel.today, r.Pollen.Hasel.tomorrow);
                				pollenDataAvailable = 1;
					};
				};
				// Birke
				if (pollenList.indexOf("Birke") != -1) {
					if ((r.Pollen.Birke.today != 0) || (r.Pollen.Birke.tomorrow != 0)) {
						writePollen(tbl, "Birke", r.Pollen.Birke.today, r.Pollen.Birke.tomorrow);
                				pollenDataAvailable = 1;
					};
				};
				// Beifuß
				if (pollenList.indexOf("Beifuss") != -1) {
					if ((r.Pollen.Beifuss.today != 0) || (r.Pollen.Beifuss.tomorrow != 0)) {
						writePollen(tbl, "Beifu&szlig", r.Pollen.Beifuss.today, r.Pollen.Beifuss.tomorrow);
                				pollenDataAvailable = 1;
					};
				};

			}; 
		}); 
		
		};
	

	// No Data available
	if (pollenDataAvailable == 0) {
		writePollen(tbl, "", "Keine Werte", "Keine Werte");
	};
            
    

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
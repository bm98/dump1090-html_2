
// EXTENSION to get route data in the plane object  Martin Burri

"use strict";


// Extend the planeObject.js
PlaneObject.prototype.from_icao = null; // Airport from ICAO 4 letter code
PlaneObject.prototype.from_iata = null; // Airport from IATA 3 letter code
PlaneObject.prototype.from_name = null; // Airport from descriptive
PlaneObject.prototype.to_icao = null; // Same as above for the destination
PlaneObject.prototype.to_iata = null;
PlaneObject.prototype.to_name = null;

PlaneObject.prototype.icaotype_name = null;
PlaneObject.prototype.icaotype_manuf = null;

// update the route data 
PlaneObject.prototype.getFlightPlanData = function() {

  // tries to load from a flight ref (if already available it may succeed)
  gp_route.getFlightPlanData(this.flight) // returns a DeferredObj which is resolved with the data
    .done($.proxy( function(data) {  // handler for the done method of the returned object
                        // this referst to the outer scope this i.e. planeObj)
                        if ("fic" in data) {
                                this.from_icao = data.fic;
                        }
                        if ("fia" in data) {
                                this.from_iata = data.fia;
                        }
                        if ("fn" in data) {
                                this.from_name = data.fn;
                        }
                        if ("tic" in data) {
                                this.to_icao = data.tic;
                        }
                        if ("tia" in data) {
                                this.to_iata = data.tia;
                        }
                        if ("tn" in data) {
                                this.to_name = data.tn;
                        }
                        if (this.selected) {
                          refreshSelected();
                        }
                   }
            , this)// scopes inner this to the outerscope this
    );  // done
}
// prototype.getFlightPlanData


// extending a method for the plane object
PlaneObject.prototype.getAircraftData = function() {

// tries to load from an icao ref (if already available it may succeed)
  gp_loader.getAircraftData(this.icao) // returns a DeferredObj which is resolved with the data
    .done($.proxy( function(data) {  // handler for the done method of the returned object
                        // this referst to the outer scope this i.e. planeObj)
                        if ("r" in data) {
                          this.registration = data.r;
                        }

                        if ("t" in data) {
                          this.icaotype = data.t;
                        }

                        if ("tn" in data) {
                          this.icaotype_name = data.tn;
                        }

                        if ("tm" in data) {
                          this.icaotype_manuf = data.tm;
                        }

                        if ("desc" in data) {
                          this.typeDescription = data.desc;
                        }

                        if ("wtc" in data) {
                          this.wtc = data.wtc;
                        }

                        if (this.selected) {
                         refreshSelected();
                        }
                    }
            , this)// scopes inner this to the outerscope this
    ); // done
}


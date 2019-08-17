// -*- mode: javascript; indent-tabs-mode: nil; c-basic-offset: 8 -*-

// Part of dump1090, a Mode S message decoder for RTLSDR devices.
//
// dbloader.js: load aircraft metadata from static json files
//
// Copyright (c) 2014,2015 Oliver Jowett <oliver@mutability.co.uk>
//
// This file is free software: you may copy, redistribute and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 2 of the License, or (at your
// option) any later version.
//
// This file is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// EXTENSION to inquire via PHP  Martin Burri
// derived from dbloader.js

"use strict";

// define the class and used variables
function Gp_loader(){
  
  this._aircraft_cache = {};
  this._aircraft_type_cache = null; // the cached aircrafts
  // ajax stuff
  this._request_count = 0;
  this._request_queue = [];
  this._request_cache = {};
  this.MAX_REQUESTS = 2;
}

// MAIN entry to be called from scripts
Gp_loader.prototype.getAircraftData = function(icao) {
  var defer;

  if (icao.length != 6) {
    defer = this._aircraft_cache[icao] = $.Deferred();
    defer.reject();
    return defer;
  }

  icao = icao.toUpperCase();

  if (icao in this._aircraft_cache) {
    defer = this._aircraft_cache[icao];
  } else {
    // load from blocks:
    defer = this._aircraft_cache[icao] = $.Deferred();
    this._request_from_db(icao, defer);
  }
  return defer;
}

// INTERNAL - awaits the response from the query
Gp_loader.prototype._request_from_db = function(icao, defer) {

  var req = this._db_ajax(icao);
  var self = this;
  
  req.done(function(data) {
     // this context is asynch and not the one from gp_loader...
     // we use the allocated variables - NOT NICE but then...
    if (icao in data) {
      self._getIcaoAircraftTypeData(data[icao], defer, self);
      return;
    }
    defer.reject();
  });

  req.fail(function(jqXHR,textStatus,errorThrown) {
    defer.reject();
  });
}


// INTERNAL - queries the aircraft types (as per original for the moment)
// this context is asynch and not the one from gp_loader...
// we use the allocated variables - NOT NICE but then...
Gp_loader.prototype._getIcaoAircraftTypeData = function(aircraftData, defer, context) {

  if (context._aircraft_type_cache === null) {
    $.getJSON("db/aircraft_types/icao_aircraft_types.json")
      .done(function(typeLookupData) {
        context._aircraft_type_cache = typeLookupData;
      })
      .always(function() {
        context._lookupIcaoAircraftType(aircraftData, defer);
      });
  }
  else {
    context._lookupIcaoAircraftType(aircraftData, defer);
  }
}

// INTERNAL - queries the aircraft types (as per original for the moment)
Gp_loader.prototype._lookupIcaoAircraftType = function(aircraftData, defer) {
  if (this._aircraft_type_cache !== null && "t" in aircraftData) {
    var typeDesignator = aircraftData.t.toUpperCase();
    if (typeDesignator in this._aircraft_type_cache) {
      var typeData = this._aircraft_type_cache[typeDesignator];
      if (typeData.desc != undefined && aircraftData.desc === undefined && typeData.desc != null && typeData.desc.length == 3) {
        aircraftData.desc = typeData.desc;
      }
      if (typeData.wtc != undefined && aircraftData.wtc === undefined) {
        aircraftData.wtc = typeData.wtc;
      }
    }
  }

  defer.resolve(aircraftData);
}

// INTERNAL - issues the query
Gp_loader.prototype._db_ajax = function(bkey) {
  var defer;

  if (bkey in this._request_cache) {
    return this._request_cache[bkey];
  }

  if (this._request_count < this.MAX_REQUESTS) {
    // just do ajax directly
    ++this._request_count;
    defer = this._request_cache[bkey] = $.ajax({ url: 'fa-query.php?icao=' + bkey,
                                            cache: true,
                                            timeout: 5000,
                                            dataType : 'json' });
    defer.always(this._db_ajax_request_complete);
  } else {
    // put it in the queue
    defer = this._request_cache[bkey] = $.Deferred();
    defer.bkey = bkey;
    this._request_queue.push(defer);
  }

  return defer;
}

// INTERNAL - completion, handles the queued requests
// this context is asynch and not the one from gp_loader...
// we use the allocated variables - NOT NICE but then...
Gp_loader.prototype._db_ajax_request_complete = function() {
  var req;
  var ajaxreq;
  
  if (gp_loader._request_queue.length == 0) {
    --gp_loader._request_count;
  } else {
    req = gp_loader._request_queue.shift();
    ajaxreq = $.ajax({ url: 'fa-query.php?icao=' + req.bkey,
                       cache: true,
                       timeout: 5000,
                       dataType : 'json' });
    ajaxreq.done(function(data) { req.resolve(data); });
    ajaxreq.fail(function(jqxhr, status, error) { req.reject(jqxhr, status, error); });
    ajaxreq.always(gp_loader._db_ajax_request_complete);
  }
}

// SOLE INSTANCE of the Aircraft loader object
const gp_loader = new Gp_loader(); 


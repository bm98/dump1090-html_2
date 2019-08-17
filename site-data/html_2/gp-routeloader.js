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
function Gp_route(){

  this._route_cache = {}; // the cached routes
  // ajax stuff
  this._request_count = 0;
  this._request_queue = [];
  this._request_cache = {};
  this.MAX_REQUESTS = 2;
}

// MAIN entry to be called from scripts
Gp_route.prototype.getFlightPlanData = function(flight) {

  var routeReply;
  // handle the cannot... case
  if ( flight == null) {
    return null;
  }
  
  // Fligth may have a trailing space !!!
  flight = flight.toUpperCase().replace(/\s+$/, ''); 

  if (flight in this._route_cache) {
    routeReply = this._route_cache[flight];
  } else {
    // load from blocks:
    routeReply = this._route_cache[flight] = $.Deferred();
    this._request_from_db(flight, routeReply);
  }

  return routeReply; // a deferred RouteReply
}

// INTERNAL - awaits the response from the query
Gp_route.prototype._request_from_db = function(flight, routeReply) {

  var req = this._db_ajax(flight); // a deferred reply
  // handles the outcome, once available
  req.done(function(data) {
    if (flight in data) {
      // populate the cache with content
      var x;
      for (x in data[flight]) {
        routeReply.x = data[flight].x;
      }
      routeReply.resolve(data[flight]); // callers done() function
      return;
    }
    routeReply.reject();
  });

  req.fail(function(jqXHR,textStatus,errorThrown) {
    routeReply.reject();
  });
}

// INTERNAL - issues the query
Gp_route.prototype._db_ajax = function(bkey) {
  var defer;

  if (bkey in this._request_cache) {
          return this._request_cache[bkey];
  }

  if (this._request_count < this.MAX_REQUESTS) {
    // just do ajax directly
    ++this._request_count;
    defer = this._request_cache[bkey] = $.ajax({ url: 'route-query.php?flight=' + bkey,
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
// this context is asynch and not the one from gp_route...
// we use the allocated variables - NOT NICE but then...
Gp_route.prototype._db_ajax_request_complete = function() {
  var req;
  var ajaxreq;

  if (gp_route._request_queue.length == 0) {
    --gp_route._request_count;
  } else {
    req = gp_route._request_queue.shift();
    ajaxreq = $.ajax({ url: 'route-query.php?icao=' + req.bkey,
                       cache: true,
                       timeout: 5000,
                       dataType : 'json' });
    ajaxreq.done(function(data) { req.resolve(data); });
    ajaxreq.fail(function(jqxhr, status, error) { req.reject(jqxhr, status, error); });
    ajaxreq.always(gp_route._db_ajax_request_complete);
  }
}

// SOLE INSTANCE of the Route object
const gp_route = new Gp_route();


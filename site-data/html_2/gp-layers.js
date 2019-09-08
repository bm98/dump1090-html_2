// JavaScript Document
// Glas Panel Extention for Layer Support

"use strict";
// *** Class
function Layer_obj()
{
  this.navVorDmeLayer = null;
  this.navNdbLayer = null;

  this.aptSmallLayer = null;
  this.aptMidLargeLayer = null;
  
  this.awyLoLayer = null;
  this.awyHiLayer = null;

  this._showSelectedAsSheet = false;
  this._showSelectedAs3D = false;
  this._showLayerNavNdb = false;
  this._showLayerNavVor = false;
  this._showLayerAptMidLarge = false;
  this._showLayerAptOther = false;

  this._showLayerAwyLo = false;
  this._showLayerAwyHi = false;
  this._showLayerAwyFix = false;
}

// *** Instances
const layer_obj = new Layer_obj();  // Layer display

// *** prototype methods

// Initialize the regional layers
Layer_obj.prototype.init = function(layers)
{
  if ( layers === null ) return;
  
  // Navaids
  this.navVorDmeLayer = new ol.layer.Vector({
    name: 'navvordme', type: 'overlay', title: 'VOR/DME',
    source: new ol.source.Vector({ url: 'layers/nav-vordme-region.geojson',
      format: new ol.format.GeoJSON({ defaultDataProjection :'EPSG:4326', projection: 'EPSG:3857' })
    }),
    style: (function() {
      var style = new ol.style.Style({
        image: new ol.style.Icon({ src: 'layers/img/vor-dme-2.png' }),
        text: new ol.style.Text({ text: 'Name', scale: 1, offsetX: 1, offsetY: -11, fill: new ol.style.Fill({ color: '#003300' }), })
      });
      var styles = [style];
      return function(feature, resolution) {
        style.getText().setText(feature.get("Ident"));
        return styles;
      };
    })()
  });
  this.navVorDmeLayer.setVisible(false);

  this.navNdbLayer = new ol.layer.Vector({
    name: 'navndb', type: 'overlay', title: 'NDB',
    source: new ol.source.Vector({ url: 'layers/nav-ndb-region.geojson',
      format: new ol.format.GeoJSON({ defaultDataProjection :'EPSG:4326', projection: 'EPSG:3857' })
    }),
    style: (function() {
      var style = new ol.style.Style({
        image: new ol.style.Icon({ src: 'layers/img/ndb-2.png' }),
        text: new ol.style.Text({ text: 'Name', scale: 1, offsetX: 1, offsetY: -11, fill: new ol.style.Fill({ color: '#000033' }), })
      });
      var styles = [style];
      return function(feature, resolution) {
        style.getText().setText(feature.get("Ident"));
        return styles;
      };
    })()
  });
  this.navNdbLayer.setVisible(false);

  // Airports
  this.aptSmallLayer = new ol.layer.Vector({
    name: 'aptsmall', type: 'overlay', title: 'Airports Others',
    source: new ol.source.Vector({ url: 'layers/apt-others-region.geojson',
      format: new ol.format.GeoJSON({ defaultDataProjection :'EPSG:4326', projection: 'EPSG:3857' })
    }),
    style: (function() {
      var style = new ol.style.Style({
        image: new ol.style.Icon({ src: 'layers/img/airport-small-2.png' }),
        text: new ol.style.Text({ text: 'Name', scale: 1, offsetX: 1, offsetY: -11,  fill: new ol.style.Fill({ color: '#330000' }), })
      });
      var styles = [style];
      return function(feature, resolution) {
        style.getText().setText(feature.get("Ident"));
        return styles;
      };
    })()
  });
  this.aptSmallLayer.setVisible(false);

  this.aptMidLargeLayer = new ol.layer.Vector({
    name: 'aptsmall', type: 'overlay', title: 'Airports Mid/Large',
    source: new ol.source.Vector({ url: 'layers/apt-midlarge-region.geojson',
      format: new ol.format.GeoJSON({ defaultDataProjection :'EPSG:4326', projection: 'EPSG:3857' })
    }),
    style: (function() {
      var style = new ol.style.Style({
        image: new ol.style.Icon({ src: 'layers/img/airport-large-2.png',scale: 1 }),
        text: new ol.style.Text({ text: 'Name', scale: 1, offsetX: 1, offsetY: -11, fill: new ol.style.Fill({ color: '#330000' }), })
      });
      var styles = [style];
      return function(feature, resolution) {
        style.getText().setText(feature.get("Ident"));
        return styles;
      };
    })()
  });
  this.aptMidLargeLayer.setVisible(false);

  // Airways LO
  this.awyLoLayer = new ol.layer.Vector({
    name: 'awylo', type: 'overlay', title: 'Airways Low Altitude',
    opacity: 0.3,
    source: new ol.source.Vector({ url: 'layers/navx-awy-lo-region.geojson',
      format: new ol.format.GeoJSON({ defaultDataProjection :'EPSG:4326', projection: 'EPSG:3857' })
    }),
    style: (function() {
      var style = new ol.style.Style({
        stroke: new ol.style.Stroke({ width:  5, color:  '#345783' })
      });
      var styles = [style];
      return function(feature, resolution) {
        return styles;
      };
    })()
  });
  this.awyLoLayer.setVisible(false);

  // Airways HI
  this.awyHiLayer = new ol.layer.Vector({
    name: 'awyhi', type: 'overlay', title: 'Airways High Altitude',
    opacity: 0.3,
    source: new ol.source.Vector({ url: 'layers/navx-awy-hi-region.geojson',
      format: new ol.format.GeoJSON({ defaultDataProjection :'EPSG:4326', projection: 'EPSG:3857' })
    }),
    style: (function() {
      var style = new ol.style.Style({
        stroke: new ol.style.Stroke({ width:  5, color:  '#842663' })
      });
      var styles = [style];
      return function(feature, resolution) {
        return styles;
      };
    })()
  });
  this.awyHiLayer.setVisible(false);

  // Airways Fixes
  this.awyFixLayer = new ol.layer.Vector({
    name: 'awyFix', type: 'overlay', title: 'Airways Fixes',
    source: new ol.source.Vector({ url: 'layers/navx-awy-fix-region.geojson',
      format: new ol.format.GeoJSON({ defaultDataProjection :'EPSG:4326', projection: 'EPSG:3857' })
    }),
    style: (function() {
      var style = new ol.style.Style({
        image: new ol.style.Icon({ src: 'layers/img/awyFix.png',scale: 1 }),
        text: new ol.style.Text({ text: 'Name', scale: 1, offsetX: 1, offsetY: -11, fill: new ol.style.Fill({ color: '#842663' }), })
      });
      var styles = [style];
      return function(feature, resolution) {
        style.getText().setText(feature.get("Ident")); // set from item Ident
        return styles;
      };
    })()
  });
  this.awyFixLayer.setVisible(false);

  layers.push(new ol.layer.Group({
      title: 'Regional GP Extension',
      layers: [
          this.navVorDmeLayer,
          this.navNdbLayer,
          this.aptSmallLayer,
          this.aptMidLargeLayer,
          this.awyLoLayer,
          this.awyHiLayer,
          this.awyFixLayer
      ]
  })); 
  
  // trigger on load
  var self = this;
  self.toggleSheetDisplay(false, self);
  self.toggle3DDisplay(false, self);
  self.toggleLayerNavVor(false, self);
  self.toggleLayerNavNdb(false, self);
  self.toggleLayerAptMidLarge(false, self);
  self.toggleLayerAptOther(false, self);
  self.toggleLayerAwyLo(false, self);
  self.toggleLayerAwyHi(false, self);
  
}

// Add Hooks
Layer_obj.prototype.addHooks = function() {
  var self = this;
  $('#gp_selected_sheet_checkbox').on('click', function() {
    self.toggleSheetDisplay(true, self);
    refreshSelected();
  });

  $('#gp_selected_3d_checkbox').on('click', function() {
    self.toggle3DDisplay(true, self);
    refreshSelected();
  });

  $('#gp_navaid_vor_checkbox').on('click', function() {
    self.toggleLayerNavVor(true, self); // setting callback
  });

  $('#gp_navaid_ndb_checkbox').on('click', function() {
    self.toggleLayerNavNdb(true, self); // setting callback
  });

  $('#gp_apt_largemid_checkbox').on('click', function() {
    self.toggleLayerAptMidLarge(true, self); // setting callback
  });

  $('#gp_apt_other_checkbox').on('click', function() {
    self.toggleLayerAptOther(true, self); // setting callback
  });
  
  $('#gp_awy_lo_checkbox').on('click', function() {
    self.toggleLayerAwyLo(true, self); // setting callback
  });
  
  $('#gp_awy_hi_checkbox').on('click', function() {
    self.toggleLayerAwyHi(true, self); // setting callback
  });
  
  $('#gp_awy_fix_checkbox').on('click', function() {
    self.toggleLayerAwyFix(true, self); // setting callback
  });
  
  $('#gp-settingsCog').on('click', function() {
    $('#gp_settings_infoblock').toggle();
  });
  
  $('#gp_settings_close').on('click', function() {
    $('#gp_settings_infoblock').hide();
  });
  
  // to make the infoblock responsive 
  $('#sidebar_container').on('resize', function() {
    if ( layer_obj._showSelectedAsSheet === false && layer_obj._showSelectedAs3D === true){
      $('#Fd3dPanel').css('height', $('#sidebar_container').width());
      // notify the renderer of the size change
      fd3d_obj.resize( );
    }
  });
  
}

// Status
Layer_obj.prototype.showSelectedAsSheet = function()
{
  return this._showSelectedAsSheet;
}

Layer_obj.prototype.showSelectedAs3D = function()
{
  return this._showSelectedAs3D;
}

// Handlers
Layer_obj.prototype.toggleSheetDisplay = function(switchFilter, context) {
  if (typeof localStorage['gp_sheetDisplaySelector'] === 'undefined') {
    localStorage['gp_sheetDisplaySelector'] = 'not_shown';
  }
  var sheetDisplay = localStorage['gp_sheetDisplaySelector'];
  if (switchFilter === true) {
    sheetDisplay = (sheetDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (sheetDisplay === 'shown') {
    $('#gp_selected_sheet_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_selected_sheet_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['gp_sheetDisplaySelector'] = sheetDisplay;
  context._showSelectedAsSheet = (sheetDisplay === 'shown');
}

Layer_obj.prototype.toggle3DDisplay = function(switchFilter, context) {
  if (typeof localStorage['gp_3DDisplaySelector'] === 'undefined') {
    localStorage['gp_3DDisplaySelector'] = 'not_shown';
  }
  var _3DDisplay = localStorage['gp_3DDisplaySelector'];
  if (switchFilter === true) {
    _3DDisplay = (_3DDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (_3DDisplay === 'shown') {
    $('#gp_selected_3d_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_selected_3d_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['gp_3DDisplaySelector'] = _3DDisplay;
  context._showSelectedAs3D = (_3DDisplay === 'shown');
}

Layer_obj.prototype.toggleLayerNavVor = function(switchFilter, context) {
  if (typeof localStorage['toggleLayerNavVor'] === 'undefined') {
    localStorage['toggleLayerNavVor'] = 'not_shown';
  }
  var layerDisplay = localStorage['toggleLayerNavVor'];
  if (switchFilter === true) {
    layerDisplay = (layerDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (layerDisplay === 'shown') {
    $('#gp_navaid_vor_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_navaid_vor_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['toggleLayerNavVor'] = layerDisplay;
  context._showLayerNavVor = (layerDisplay === 'shown');
  context.navVorDmeLayer.setVisible(context._showLayerNavVor);
}

Layer_obj.prototype.toggleLayerNavNdb = function(switchFilter, context) {
  if (typeof localStorage['gp_toggleLayerNavNdb'] === 'undefined') {
    localStorage['gp_toggleLayerNavNdb'] = 'not_shown';
  }
  var layerDisplay = localStorage['gp_toggleLayerNavNdb'];
  if (switchFilter === true) {
    layerDisplay = (layerDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (layerDisplay === 'shown') {
    $('#gp_navaid_ndb_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_navaid_ndb_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['gp_toggleLayerNavNdb'] = layerDisplay;
  context._showLayerNavNdb = (layerDisplay === 'shown');
  context.navNdbLayer.setVisible(context._showLayerNavNdb);
}

Layer_obj.prototype.toggleLayerAptMidLarge = function(switchFilter, context) {
  if (typeof localStorage['toggleLayerAptMidLarge'] === 'undefined') {
    localStorage['toggleLayerAptMidLarge'] = 'not_shown';
  }
  var layerDisplay = localStorage['toggleLayerAptMidLarge'];
  if (switchFilter === true) {
    layerDisplay = (layerDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (layerDisplay === 'shown') {
    $('#gp_apt_largemid_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_apt_largemid_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['toggleLayerAptMidLarge'] = layerDisplay;
  context._showLayerAptMidLarge = (layerDisplay === 'shown');
  context.aptMidLargeLayer.setVisible(context._showLayerAptMidLarge);
}

Layer_obj.prototype.toggleLayerAptOther = function(switchFilter, context) {
  if (typeof localStorage['toggleLayerAptOther'] === 'undefined') {
    localStorage['toggleLayerAptOther'] = 'not_shown';
  }
  var layerDisplay = localStorage['toggleLayerAptOther'];
  if (switchFilter === true) {
    layerDisplay = (layerDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (layerDisplay === 'shown') {
    $('#gp_apt_other_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_apt_other_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['toggleLayerAptOther'] = layerDisplay;
  context._showLayerAptOther = (layerDisplay === 'shown');
  context.aptSmallLayer.setVisible(context._showLayerAptOther);
}

Layer_obj.prototype.toggleLayerAwyLo = function(switchFilter, context) {
  if (typeof localStorage['toggleLayerAwyLo'] === 'undefined') {
    localStorage['toggleLayerAwyLo'] = 'not_shown';
  }
  var layerDisplay = localStorage['toggleLayerAwyLo'];
  if (switchFilter === true) {
    layerDisplay = (layerDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (layerDisplay === 'shown') {
    $('#gp_awy_lo_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_awy_lo_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['toggleLayerAwyLo'] = layerDisplay;
  context._showLayerAwyLo = (layerDisplay === 'shown');
  context.awyLoLayer.setVisible(context._showLayerAwyLo);
}

Layer_obj.prototype.toggleLayerAwyHi = function(switchFilter, context) {
  if (typeof localStorage['toggleLayerAwyHi'] === 'undefined') {
    localStorage['toggleLayerAwyHi'] = 'not_shown';
  }
  var layerDisplay = localStorage['toggleLayerAwyHi'];
  if (switchFilter === true) {
    layerDisplay = (layerDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (layerDisplay === 'shown') {
    $('#gp_awy_hi_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_awy_hi_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['toggleLayerAwyHi'] = layerDisplay;
  context._showLayerAwyHi = (layerDisplay === 'shown');
  context.awyHiLayer.setVisible(context._showLayerAwyHi);
}

Layer_obj.prototype.toggleLayerAwyFix = function(switchFilter, context) {
  if (typeof localStorage['toggleLayerAwyFix'] === 'undefined') {
    localStorage['toggleLayerAwyFix'] = 'not_shown';
  }
  var layerDisplay = localStorage['toggleLayerAwyFix'];
  if (switchFilter === true) {
    layerDisplay = (layerDisplay === 'not_shown') ? 'shown' : 'not_shown';
  }
  if (layerDisplay === 'shown') {
    $('#gp_awy_fix_checkbox').addClass('settingsCheckboxChecked');
  } else {
    $('#gp_awy_fix_checkbox').removeClass('settingsCheckboxChecked');
  }
  localStorage['toggleLayerAwyFix'] = layerDisplay;
  context._showLayerAwyFix = (layerDisplay === 'shown');
  context.awyFixLayer.setVisible(context._showLayerAwyFix);
}



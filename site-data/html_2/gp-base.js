// JavaScript Document
// Glas Panel Base
// GP assumes a 1000x1000 canvas - 
//  should be possible to scale it down by drawing them to the real canvas
// Expects a Canvas with ID  'GlasPanel'
"use strict";

// Panel geometries
function Gp_obj()
{
  // absolute pix in the canvas
  this.X    = 0;   // X pos
  this.Y    = 0;  // Y pos
  this.W    = 1000;  // width
  this.H    = 1000;  // height
  // relative pix in the rect
  this.XC = this.W / 2; // rel center X
  this.YC = this.H / 2; // rel center Y
  //
  this.RollXC = 420;    // Roll Center X
  this.RollYC = 373;    // Roll Center Y
  
  this.Div1X = 352;
  this.Div2X = 822;
  
  this.HeadH = 77;  // Headline height
  
  this.FootH = 40; 
  this.FootX = 0; this.FootY = this.X+this.H-this.FootH; 
  
  //
  this.CallRegX = 10;
  this.CallRegY = 27;
  this.CallRegW = 328;
  this.CallRegH = 35;
  this.CallRegXC = this.CallRegW/2;
  this.CallRegYC = this.CallRegH/2;
  
  this.TNameX = 10;
  this.TNameY = this.CallRegY - 5; // above CallReg
  this.TNameW = 328;
  this.TNameH = 10;
  this.TNameXC = this.TNameW/2;
  this.TNameYC = this.TNameH/2;
  
  
  this.IacoX = this.Div2X+4;
  this.IacoY = 4;
  this.IacoW = 170;
  this.IacoH = 70;
  this.IacoXC = this.IacoW/2;
  this.IacoYC = this.IacoH/2;

  this.ModesX = this.X;
  this.ModesY = this.HeadH;
  this.ModesW = this.CallRegW;
  this.ModesH = this.HeadH/2;
  this.ModesXC = this.ModesW/2;
  this.ModesYC = this.ModesH/2;
  this.ModesApprXC = 25;
  this.ModesLNavXC = this.ModesApprXC+75;
  this.ModesApXC = this.ModesLNavXC+60;
  this.ModesVNavXC = this.ModesApXC+ 60;
  this.ModesTcasXC = this.ModesVNavXC+75;
  

  this.SqkW = 236;
  this.SqkH = 40;
  this.SqkX = 596;
  this.SqkY = this.H-this.FootH-this.SqkH-1;
  this.SqkXC = this.SqkW/2;
  this.SqkYC = this.SqkH/2;
  
  this.UtcW = 168;
  this.UtcH = 40;
  this.UtcX = 832;
  this.UtcY = this.H-this.FootH-this.UtcH-1;
  this.UtcXC = this.UtcW/2;   this.UtcYC = this.UtcH/2;
  
  
  this.LblX = this.Div1X+8;   this.LblY = 1;
  this.LblW = 25;    this.LblH = 36;
  this.FldW = 120;   this.FldH = 36;
  this.LblCX = this.LblW/2;   this.LblCY = this.LblH/2;
  this.FldCX = this.FldW/2;   this.FldCY = this.FldH/2;
  
  this.AptX = 0;	this.AptY = this.UtcY; // as UTC label
  this.AptW = this.UtcW;      this.AptH = this.UtcH; 
  this.AptXC = this.AptW/2;   this.AptYC = this.AptH/2;
  
  
  this.offset     = 65; // offset of the Scale items
  this.scale      = 10; // the scale number steps
  
  this.Canvas = null;
  this.FlagLoaded = false;
  this.FlagImg = null;
}

// INSTANCEs
const gp_obj = new Gp_obj();        // Instrument panel base

const alt_obj = new Alt_obj();      // Altitude instruments
const vs_obj = new Vs_obj();        // Vertical Speed instruments
const at_obj = new At_obj();        // Attitude display
const comp_obj = new Comp_obj();    // Compass/Heading instrument
const as_obj = new As_obj();        // Airspeed instrument
const iw_obj = new Iw_obj();        // Information window


// hooks into FA V 3.7.1


// ****************************************************************************
// ********* HOOKS that are used above in manual modifications
//
// extends or replaces original code from FA

// This is a hook to handle the refresh of items incl Glass Panel
Gp_obj.prototype.RefreshSelectedGpHook = function(selected)
{

    if (!selected) {
        $('#dump1090_infoblock').css('display','block');
        $('#dump1090_version').text(Dump1090Version);
        $('#dump1090_total_ac').text(TrackedAircraft);
        $('#dump1090_total_ac_positions').text(TrackedAircraftPositions);
        $('#dump1090_total_history').text(TrackedHistorySize);
        
        if (MessageRate !== null) {
                $('#dump1090_message_rate').text(MessageRate.toFixed(1));
        } else {
                $('#dump1090_message_rate').text("n/a");
        }
        return;
    }    

    $('#dump1090_infoblock').css('display','none');
    if ( layer_obj.showSelectedAsSheet() === false ) {
        gp_update("GlasPanel", selected); // name as in HTML... bad but then..
    }

    if (selected.flight !== null && selected.flight !== "") {
        $('#selected_callsign').text(selected.flight);
        $('#selected_links').css('display','inline');
        $('#selected_fr24_link').attr('href','http://fr24.com/'+selected.flight);
        $('#selected_flightstats_link').attr('href','http://www.flightstats.com/go/FlightStatus/flightStatusByFlight.do?flightNumber='+selected.flight);
        $('#selected_planefinder_link').attr('href','https://planefinder.net/flight/'+selected.flight);
    } else {
        $('#selected_callsign').text('n/a');
        $('#selected_links').css('display','none');
    }
}

// This is a hook to handle the visibility of the Glass Panel
Gp_obj.prototype.setSelectedInfoBlockVisibilityGpHook = function(planeSelected, mapIsVisible)
{
    $('#selected_gpanel').hide();
    $('#selected_infoblock').hide();
    if (planeSelected && mapIsVisible) {
      if ( layer_obj.showSelectedAsSheet() === true ) {
          $('#selected_infoblock').show(); 
      } else {
          $('#selected_gpanel').show();
      }
    }
}    


// Draw basic elements of the GP
Gp_obj.prototype.drawHeader = function(selPlane)
{
  // top
  var ctx = this.Canvas.getContext("2d");
  ctx.fillStyle = gpGUI.colBGLabel;
  ctx.strokeStyle = gpGUI.colFrame; ctx.lineWidth = 2;
  ctx.fillRect(this.X, this.Y, this.W, this.HeadH); ctx.strokeRect(this.X, this.Y, this.W, this.HeadH);
  ctx.fillRect(this.X, this.Y+this.H-this.FootH, this.W, this.FootH); ctx.strokeRect(this.X, this.Y+this.H-this.FootH, this.W, this.FootH);

  ctx.strokeStyle = gpGUI.colFrame;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(this.Div1X, this.Y);
  ctx.lineTo(this.Div1X, this.Y+this.HeadH);
  ctx.moveTo(this.Div2X, this.Y);
  ctx.lineTo(this.Div2X, this.Y+this.HeadH);
  // hor
  ctx.moveTo(this.Div1X, this.Y+this.HeadH/2);
  ctx.lineTo(this.Div2X, this.Y+this.HeadH/2);
  ctx.stroke();
  
  ctx.globalAlpha=1.0; // opaque

  // flag and country
  ctx.font = gpGUI.font18s;
  ctx.fillStyle = gpGUI.colWhite;
  ctx.textAlign = "left";	ctx.textBaseline="top";
  ctx.fillText(selPlane.icaorange.country, this.X+40,5);
  // load the flag image
  if ( selPlane.icaorange.flag_image !== null) {
    if ( this.FlagLoaded === false ){
      this.FlagImg = new Image();
      this.FlagImg.onload = function() {
        this.FlagLoaded=true; // have to wait until the flag is loaded (first time only)
      }
      this.FlagImg.src = "flags-tiny/" + selPlane.icaorange.flag_image; // can also be a remote URL e.g. http://
    }
    
    if (this.FlagImg !== null ) {
      ctx.drawImage(this.FlagImg, this.X+6, 5); // now draw it
    }
  }
  // airframe type
  ctx.textAlign = "right"; ctx.textBaseline="top";
  // sanity for null values
  var icaotype = "- - - ";
  var flight = "- - - ";
  var registration =  "- - - ";
  var atname = "";
  if ( selPlane.icaotype != null ) {
    icaotype = selPlane.icaotype;
  }
  if (selPlane.icaotype_name != null) {
    atname = selPlane.icaotype_name;
  }
  if ( selPlane.flight != null ) {
    flight = selPlane.flight;
  }
  if ( selPlane.registration != null ) {
    registration = selPlane.registration;
  }
  ctx.font = gpGUI.font16s;
  // Airframe type
  ctx.fillText(icaotype, this.Div1X-10, 5);
  // typename
  ctx.fillText(atname, this.Div1X-10, this.TNameY);

  // callsign - register
  ctx.font = gpGUI.font24s;
  ctx.fillStyle = gpGUI.colWhite;
  ctx.textAlign = "center"; ctx.textBaseline="top";
  ctx.save();
    ctx.translate(this.CallRegX, this.CallRegY);
    // sanity for null values
    ctx.fillText( flight + "   " + registration, this.CallRegXC, this.CallRegYC); // middle align
  ctx.restore();

  ctx.save();
  // IACO
    ctx.textAlign = "center"; ctx.textBaseline="middle";
    ctx.font = gpGUI.font32;
    ctx.fillStyle = gpGUI.colYellow;
    ctx.translate(this.IacoX, this.IacoY);
    ctx.fillText( selPlane.icao, this.IacoXC, this.IacoYC); // middle align
  ctx.restore();

  ctx.save();
  // Fld Labels- upper half LAT, LON, DIS
    ctx.font = gpGUI.font18;
    ctx.textBaseline="bottom";
    ctx.textAlign = "left";
    ctx.fillStyle = gpGUI.colWhite;
    ctx.translate(this.LblX, this.LblY); // go from Div1 divider
    ctx.fillText( "LAT", 0, this.LblH); // bottom align
    ctx.fillText( "LON", this.LblW+this.FldW+8, this.LblH); // bottom align
    ctx.fillText( "DIS", (this.LblW+this.FldW+8)*2, this.LblH); // bottom align
    ctx.font = gpGUI.font24;
    ctx.textAlign = "right";
    ctx.fillStyle = gpGUI.colPurple;
    if ( selPlane.position != null){
      //20190823 fix Lat[1] Lon[0] ..
      ctx.fillText( selPlane.position[1].toFixed(4).toString() + "°" , this.LblW+this.FldW, this.LblH);
      ctx.fillText( selPlane.position[0].toFixed(4).toString() + "°" , (this.LblW+this.FldW)*2+4, this.LblH);
    }
    if ( selPlane.sitedist != null ){
      ctx.fillText( (selPlane.sitedist/1852).toFixed(0).toString() + " NM" , (this.LblW+this.FldW)*3+5, this.LblH);
    }
  ctx.restore();

    ctx.save();
  // Fld Labels- lower half ROLL, TRACK, GS
    ctx.font = gpGUI.font18;
    ctx.textBaseline="bottom";
    ctx.textAlign = "left";
    ctx.fillStyle = gpGUI.colWhite;
    ctx.translate(this.LblX, this.LblY+this.LblH); // go from Div1 divider
    ctx.fillText( "Roll", 0, this.LblH); // bottom align
    ctx.fillText( "Track", this.LblW+this.FldW+8, this.LblH); // bottom align
    ctx.fillText( "GS", (this.LblW+this.FldW+8)*2, this.LblH); // bottom align
    ctx.font = gpGUI.font24;
    ctx.textAlign = "right";
    ctx.fillStyle = gpGUI.colPurple;
    if ( selPlane.roll != null ){
      ctx.fillText( selPlane.roll.toFixed(2).toString() + "°" , this.LblW+this.FldW, this.LblH);
    }
    else {
      ctx.fillText( "- - - " , this.LblW+this.FldW, this.LblH);
    }
    if ( selPlane.track_rate != null ){
      ctx.fillText( selPlane.track_rate.toFixed(2).toString() + "r", (this.LblW+this.FldW)*2+4, this.LblH);
    }
    else {
      ctx.fillText( "- - - ", (this.LblW+this.FldW)*2+4, this.LblH);
    }
    if ( selPlane.gs != null ){
      ctx.fillText( selPlane.gs.toFixed(0).toString() + " KT" , (this.LblW+this.FldW)*3+5, this.LblH);
    }
    else {
      ctx.fillText( "- - - " , (this.LblW+this.FldW)*3+5, this.LblH);
    }
    ctx.restore();
}

Gp_obj.prototype.drawModes = function(selPlane)
{
  if ( selPlane.nav_modes == null) return;
  // top
  var ctx = this.Canvas.getContext("2d");

  ctx.save();
    ctx.translate(this.ModesX, this.ModesY);
    ctx.fillStyle = gpGUI.colBGLabel;
    ctx.strokeStyle = gpGUI.colFrame; ctx.lineWidth = 2;
    ctx.fillRect(0, 0, this.ModesW, this.ModesH); ctx.strokeRect(0, 0, this.ModesW, this.ModesH);
    ctx.font = gpGUI.font24;
    ctx.fillStyle = gpGUI.colModes;
    ctx.textAlign = "center";
    ctx.textBaseline="middle";

    if  ( selPlane.nav_modes.includes("approach")){
      ctx.fillText("APR", this.ModesApprXC, this.ModesYC);
    }
    if  ( selPlane.nav_modes.includes("lnav")){
      ctx.fillText("LNAV", this.ModesLNavXC, this.ModesYC);
    }
    if  ( selPlane.nav_modes.includes("autopilot")){
      ctx.fillText("AP", this.ModesApXC, this.ModesYC);
    }
    if  ( selPlane.nav_modes.includes("althold")){
      ctx.fillText("ALT", this.ModesVNavXC, this.ModesYC);
    } else if  ( selPlane.nav_modes.includes("vnav")){
      ctx.fillText("VNAV", this.ModesVNavXC, this.ModesYC);
    }
    if  ( selPlane.nav_modes.includes("tcas")){
      ctx.fillText("TCAS", this.ModesTcasXC, this.ModesYC);
    }
  ctx.restore();
}


Gp_obj.prototype.drawSquawk = function(selPlane)
{
  if ( selPlane.squawk == null) return;
  // top
  var ctx = this.Canvas.getContext("2d");
  
  const sqw = selPlane.squawk.toString();

  ctx.save();
    ctx.translate(this.SqkX, this.SqkY);

    ctx.strokeStyle = gpGUI.colFrame; ctx.lineWidth = 2;
    ctx.font = gpGUI.font24;
    ctx.fillStyle = gpGUI.colWhite;
    ctx.textAlign = "center";
    ctx.textBaseline="bottom";
    if ( sqw === "7500" ){ //Aircraft Hijacking
      ctx.fillStyle = gpGUI.colHJack; ctx.fillRect(0, 0, this.SqkW, this.SqkH); ctx.strokeRect(0, 0, this.SqkW, this.SqkH);
      ctx.font = gpGUI.font24; ctx.fillStyle = gpGUI.colWhite;
      ctx.fillText("XPDR               ", this.SqkXC, this.SqkH-2);
      ctx.font = gpGUI.font32; ctx.fillStyle = gpGUI.colSqw;
      ctx.fillText("  " + sqw.toString() + " HJ", this.SqkXC, this.SqkH);
    } else if ( sqw === "7600" ){ // Radio Failure
      ctx.fillStyle = gpGUI.colRadioF; ctx.fillRect(0, 0, this.SqkW, this.SqkH); ctx.strokeRect(0, 0, this.SqkW, this.SqkH);
      ctx.font = gpGUI.font24; ctx.fillStyle = gpGUI.colWhite;
      ctx.fillText("XPDR               ", this.SqkXC, this.SqkH-2);
      ctx.font = gpGUI.font32; ctx.fillStyle = gpGUI.colSqw;
      ctx.fillText("  " + sqw.toString() + " RF", this.SqkXC, this.SqkH);
    } else if ( sqw === "7700" )  { // General Emergency
      ctx.fillStyle = gpGUI.colEmerg; ctx.fillRect(0, 0, this.SqkW, this.SqkH); ctx.strokeRect(0, 0, this.SqkW, this.SqkH);
      ctx.font = gpGUI.font24; ctx.fillStyle = gpGUI.colWhite;
      ctx.fillText("XPDR               ", this.SqkXC, this.SqkH-2);
      ctx.font = gpGUI.font32; ctx.fillStyle = gpGUI.colSqw;
      ctx.fillText("  " + sqw.toString() + " GE", this.SqkXC, this.SqkH);	
    } else { // normal
      ctx.fillStyle = gpGUI.colBGLabel; ctx.fillRect(0, 0, this.SqkW, this.SqkH); ctx.strokeRect(0, 0, this.SqkW, this.SqkH);
      ctx.font = gpGUI.font24; ctx.fillStyle = gpGUI.colWhite;
      ctx.fillText("XPDR               ", this.SqkXC, this.SqkH-2);
      ctx.font = gpGUI.font32; ctx.fillStyle = gpGUI.colSqw;
      ctx.fillText("  " + sqw.toString(), this.SqkXC, this.SqkH);
    }
    
  ctx.restore();		
}

Gp_obj.prototype.fmtAptText = function(iata, name){
  var s = "";
  if ( iata != null ) s = iata + " - ";
  if ( name!= null ) s = s + name;
  return s;
}

Gp_obj.prototype.drawApts = function(selPlane)
{
  // top
  var ctx = this.Canvas.getContext("2d");
  
  ctx.save();
    ctx.translate(this.FootX, this.FootY);

    ctx.strokeStyle = gpGUI.colFrame; ctx.lineWidth = 2;
    ctx.textAlign = "left";
    ctx.textBaseline="bottom";
    ctx.fillStyle = gpGUI.colBGLabel; ctx.fillRect(0, 0, this.FootW, this.FootH); ctx.strokeRect(0, 0, this.FootW, this.FootH);
    ctx.font = gpGUI.font18s; ctx.fillStyle = gpGUI.colRoute;
    var apF = this.fmtAptText(selPlane.from_iata, selPlane.from_name); 
    var apT = this.fmtAptText(selPlane.to_iata, selPlane.to_name); 
    ctx.fillText(apF + " ► " + apT, this.FootX+5, this.FootH-5);
  ctx.restore();		
}

Gp_obj.prototype.drawRoute = function(selPlane)
{
  // top
  var ctx = this.Canvas.getContext("2d");
  
  ctx.save();
    ctx.translate(this.AptX, this.AptY);

    ctx.strokeStyle = gpGUI.colFrame; ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.textBaseline="bottom";
    ctx.fillStyle = gpGUI.colBGLabel; ctx.fillRect(0, 0, this.AptW, this.AptH); ctx.strokeRect(0, 0, this.AptW, this.AptH);
    ctx.font = gpGUI.font24; ctx.fillStyle = gpGUI.colRoute;
    var apF = "- - -"; 
    var apT = "- - -";
    if ( selPlane.from_icao != null ) apF = selPlane.from_icao;
    if ( selPlane.to_icao != null ) apT = selPlane.to_icao;
    ctx.fillText(apF + " ► " + apT, this.AptXC, this.AptH-2);
  ctx.restore();		
}

Gp_obj.prototype.drawUtc = function()
{
  // top
  var ctx = this.Canvas.getContext("2d");
  
  const today = new Date();
  const us = today.toISOString().slice(11, 19); //		"2018-09-01T23:01:38.021Z"
  ctx.save();
    ctx.translate(this.UtcX, this.UtcY);

    ctx.strokeStyle = gpGUI.colFrame; ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.textBaseline="bottom";
    ctx.fillStyle = gpGUI.colBGLabel; ctx.fillRect(0, 0, this.UtcW, this.UtcH); ctx.strokeRect(0, 0, this.UtcW, this.UtcH);
    ctx.font = gpGUI.font24; ctx.fillStyle = gpGUI.colWhite;
    ctx.fillText("UTC " + us, this.UtcXC, this.UtcH-2);
  ctx.restore();		
}


// GLOBAL 

// all initialization
function gp_init()
{
  // create our 1000x1000 canvas for hidden drawing
  gp_obj.Canvas = document.createElement('canvas');
  gp_obj.Canvas.id = "GPanel";
  gp_obj.Canvas.width = 1000;
  gp_obj.Canvas.height = 1000;
  gp_obj.Canvas.style.zIndex = 8;
  gp_obj.Canvas.style.position = "absolute";
  gp_obj.Canvas.style.border = "0px solid";
}

// Update all of the Glas Planel (selPlane is planeObject Type)
function gp_update(canvasName, selPlane)
{
  if (typeof selPlane === 'undefined') {
    return;
  }
  
  // Update the flight plan 
  // The flight may come in only late or not at all - so care for it
  if ( selPlane.flight != null ) {
    if ( (selPlane.from_icao === null) && (selPlane.to_icao === null) ) {
      // we do not yet have a valid content (assuming at least one of the icao fields must have a value if loaded
      selPlane.getFlightPlanData(); // update via PHP
    }
  }
  
  //our drawing canvas
  var ctx = gp_obj.Canvas.getContext("2d");
  // clear area
  ctx.clearRect(0, 0, gp_obj.Canvas.width, gp_obj.Canvas.height);
  
  at_obj.drawAttitude(selPlane.roll, selPlane.gs, selPlane.vert_rate); // ROLL, GS, VR - roll , ground speed, vertical rate

  gp_obj.drawHeader(selPlane);
  gp_obj.drawModes(selPlane);
  gp_obj.drawSquawk(selPlane);
  gp_obj.drawRoute(selPlane);
  gp_obj.drawApts(selPlane);
  gp_obj.drawUtc();
  
  ctx.save();
    // restrict to main area w/o header and footer
    ctx.rect(gp_obj.X, gp_obj.Y+gp_obj.HeadH, gp_obj.W, gp_obj.H-gp_obj.HeadH-gp_obj.FootH ); // inner part only
    ctx.clip()
    as_obj.draw(selPlane.ias, selPlane.tas, selPlane.mach); // IAS, TAS, MACH
    // sanity for null values
    var setaltm = null;
    if ( selPlane.nav_altitude != null) {
      setaltm = convert_altitude(selPlane.nav_altitude, "metric");
    }
    alt_obj.draw(selPlane.altitude, selPlane.nav_qnh, 
          selPlane.nav_altitude, setaltm ); // IALT, BARO, SETALT, SETALTM
    vs_obj.draw(selPlane.vert_rate);
    comp_obj.draw(selPlane.mag_heading, selPlane.nav_heading, selPlane.track, selPlane.track_rate); //THEAD, NHEAD, TRACK, TRACKRATE
    iw_obj.drawInfowindow(selPlane);
  ctx.restore();

  // finally - paint it streched / reduced onto the HTML canvas
  // external canvas to draw to 
  var dstCanvas = document.getElementById(canvasName);
  var destCtx = dstCanvas.getContext("2d");
  destCtx.clearRect(0, 0, dstCanvas.width, dstCanvas.height);
  destCtx.drawImage(gp_obj.Canvas, 0, 0, gp_obj.Canvas.width, gp_obj.Canvas.height, 
                  0, 0, dstCanvas.width, dstCanvas.width); // square image where width is the master
  
  if ( GP_DUMMY ) {
    gp_dummy.update();
  }

}




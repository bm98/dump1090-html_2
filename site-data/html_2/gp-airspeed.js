// JavaScript Document
// Handles the GlasPanel Airspeed items
// this is a Vscale of 
"use strict";

// an object carrying the geometrical positions
// based on a 1000x1000 canvas - 
// some are calculated to avoid inconsistencies
function As_obj()
{
  // absolute pix in the canvas
  this.X    = 20;   // X pos
  this.Y    = 158;  // Y pos
  this.W    = 114;  // width
  this.H    = 430;  // height
  // TAS (true airspeed) label
  this.TasX = this.X;   		// X pos
  this.TasY = this.Y+this.H; 	// Y pos (below indicator)
  this.TasW = this.W;  		// width
  this.TasH = 40;   			// height
  // TAS (true airspeed) label
  this.MachX = this.X;   		// X pos
  this.MachY = this.TasY+this.TasH; 	// Y pos (below TAS)
  this.MachW = this.W;  		// width
  this.MachH = 40;   			// height

  // relative pix in the rect
  this.XC = this.W / 2; // rel center X
  this.YC = this.H / 2; // rel center Y
  // TAS (true airspeed) label
  this.TasXC = this.TasW / 2; // rel center X
  this.TasYC = this.TasH / 2; // rel center Y
  // Mach label
  this.MachXC = this.MachW / 2; // rel center X
  this.MachYC = this.MachH / 2; // rel center Y
  
  //
  this.offset     = 65; // offset of the Scale items
  this.scale      = 10; // the scale number steps
  this.nPad       = "   "; // number pad format # digits expected
}

// The airspeed object to use outside 
//   as_obj.draw() will do the job
  // draw Mach label
As_obj.prototype.draw_mach = function(MACH)
{
  // sanity check
  if ( MACH == null) return; // don't even draw the field

  var ctx = gp_obj.Canvas.getContext("2d");
  // set the origin to pos of TAS field and assume a relative drawing 
  ctx.save();
    ctx.translate(this.MachX, this.MachY); 
    // frame and background		
    ctx.fillStyle = gpGUI.colBGLabel;
    ctx.strokeStyle = gpGUI.colFrame;
    ctx.fillRect(0,0, this.MachW, this.MachH);
    ctx.lineWidth = 2;
    ctx.strokeRect(0,0, this.MachW, this.MachH);
    // for the rest clip the usable area
    ctx.rect(1,1, this.MachW-2, this.MachH-2);
    ctx.clip();
    // finally the indicated number
    ctx.globalAlpha=1.0; // opaque
    ctx.font = gpGUI.font24;
    ctx.fillStyle = gpGUI.colWhite;
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    ctx.fillText( "M " + MACH.toFixed(3).toString(), this.MachXC, this.MachYC); // middle align
  ctx.restore();
}

// draw TAS label
As_obj.prototype.draw_tas = function(TAS)
{
  // sanity check
  if ( TAS != null) {
    TAS = Math.round(TAS);
  }

  var ctx = gp_obj.Canvas.getContext("2d");
  // set the origin to pos of TAS field and assume a relative drawing 
  ctx.save();
    ctx.translate(this.TasX, this.TasY); 
    // frame and background		
    ctx.fillStyle = gpGUI.colBGLabel;
    ctx.strokeStyle = gpGUI.colFrame;
    ctx.fillRect(0,0, this.TasW, this.TasH);
    ctx.lineWidth = 2;
    ctx.strokeRect(0,0, this.TasW, this.TasH);
    // for the rest clip the usable area
    ctx.rect(1,1, this.TasW-2, this.TasH-2);
    ctx.clip();
    // finally the indicated number
    ctx.globalAlpha=1.0; // opaque
    ctx.font = gpGUI.font24;
    ctx.fillStyle = gpGUI.colWhite;
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    if ( TAS != null ) {				
      ctx.fillText( "TAS " + pad(this.nPad, TAS.toString(), true) + "KT", this.TasXC, this.TasYC); // middle align
    }
    else {
      ctx.fillText( "- - - ", this.TasXC, this.TasYC); // middle align
    }
  ctx.restore();
}

// local only - draw the scale of the airspeed indicator
As_obj.prototype.drawScale = function(value)
{
  var ctx = gp_obj.Canvas.getContext("2d");

  var part = value % this.scale;	// MOD operation
  
  ctx.save();
    ctx.translate(0, part*(this.offset/10)); // set origin to pos of AS indicator
    ctx.beginPath();
    ctx.strokeStyle = gpGUI.colFrame;
    ctx.lineWidth=1;
    // dashes to the right, drawing from the vert center to aling nicely
    var i;
    for ( i=-5; i<7; i++) {
      ctx.moveTo( this.W-10, this.YC + (i*this.offset/2));
      ctx.lineTo( this.W, this.YC + (i*this.offset/2));
    }
    // larger ones for the set indicator
    ctx.lineWidth=2;
    for ( i=-3; i<4; i++) {
      ctx.moveTo(this.W-20, this.YC + (i*this.offset));
      ctx.lineTo(this.W, this.YC + (i*this.offset));
    }
    // draw it
    ctx.stroke();
  ctx.restore();
}

// MAIN call to draw the airspeed instrument
As_obj.prototype.draw = function(IAS, TAS, MACH) 
{
  var ctx = gp_obj.Canvas.getContext("2d");
  var value = 0; // used as Input later
  // sanity check
  if ( IAS != null ) {
    IAS = Math.round(IAS);
    value = IAS; // set from IAS if available
  }
  ctx.save();
    // set the origin to pos of AS indicator and assume a relative drawing 
    ctx.translate(this.X, this.Y); 

    // frame and background		
    ctx.fillStyle = gpGUI.colFrame;
    ctx.strokeStyle = gpGUI.colFrame;
    ctx.globalAlpha=0.2; // draw transparent rectangle
    ctx.fillRect(0,0, this.W, this.H);
    ctx.globalAlpha=0.8; // draw transparent rectangle frame
    ctx.lineWidth = 2;
    ctx.strokeRect(0,0, this.W, this.H);

    // for the rest clip the usable area
    ctx.rect(1,1, this.W-2, this.H-2);
    ctx.clip();
    // makes the scale indicators
    this.drawScale(value);
    
    // draw scale numbers
    ctx.globalAlpha=1.0; // opaque
    ctx.font = gpGUI.font32;
    ctx.fillStyle = gpGUI.colSmoke; // almost white
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    // calc the in-betweens..
    var part = value % this.scale;	// MOD operation
    var scaleValue = Math.floor(value/this.scale) * this.scale; // DIV operation
    // the number band
    ctx.rect(1,1, this.W-2, this.H-2);
    ctx.clip();
    var i;
    for ( i=-3; i<5; i++) {
      // vert pos of the number is centerY - Offset*Step +  Offset/Scale*part	
      ctx.fillText( pad(alt_obj.nPad, scaleValue + i * this.scale .toString(), true), 
        this.XC, 
        this.YC - i*this.offset + this.offset/this.scale * part); 
    }
    // Show the set value on a black rect
    ctx.fillStyle = gpGUI.colBGLabel;
    ctx.fillRect(2, this.YC-gpGUI.size32, this.W-20, gpGUI.size32*2);
    // Marker triangle
    ctx.beginPath();
    ctx.strokeStyle = gpGUI.colBGLabel;
    ctx.moveTo(this.W-20, this.YC - 8);
    ctx.lineTo(this.W-2, this.YC);
    ctx.lineTo(this.W-20, this.YC+8);
    ctx.closePath();
    ctx.fill();
    // finally the indicated number
    ctx.fillStyle = gpGUI.colWhite;
    if ( IAS != null ) {
      ctx.fillText( pad(this.nPad, value.toString(), true), this.XC, this.YC); // middle align
    }
    else { 
      // IAS not available
      ctx.fillText( "- - - ", this.XC, this.YC); // middle align
    }

    // leave with the origin reset to the canvas origin
  ctx.restore();
  
  this.draw_tas(TAS);
  this.draw_mach(MACH);
}






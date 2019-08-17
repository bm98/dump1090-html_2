// JavaScript Document
// Handles the GlasPanel Compass / Heading items
"use strict";

// an object carrying the geometrical positions
// based on a 1000x1000 canvas - 
// some are calculated to avoid inconsistencies
function Comp_obj()
{
  // absolute pix in the canvas
  this.R    = 208;    // Radius
  this.W    = this.R*2;  // width 
  this.H    = this.W;  // height
  this.X    = gp_obj.RollXC-this.R;   // X pos relative to Turn Center
  this.Y    = 760-this.R;  // Y pos

  // DEVELOP
//	this.X    = 0;   // X pos relative to Turn Center
//	this.Y    = gp_obj.RollYC;  // Y pos

  // relative pix in the rect
  this.XC = this.W / 2; // rel center X
  this.YC = this.H / 2; // rel center Y
  
  //  Heading relative to main
  this.HeadW = 100;  		// width
  this.HeadH = 45; 		// height MASTER for the others
  this.HeadX = this.XC-this.HeadW/2;   //  X pos
  this.HeadY = -this.HeadH; // Y pos (above compass)

  this.HeadXC = this.HeadW / 2; // rel center X
  this.HeadYC = this.HeadH / 2; // rel center Y
  
  //  NAV-Heading relative to main
  this.HeadNavW = 110;  	// width
  this.HeadNavH = 40; 	// height
  this.HeadNavX = 0;   	//  X pos
  this.HeadNavY = 0; 		// Y pos (above compass)

  this.HeadNavXC = this.HeadNavW / 2; // rel center X
  this.HeadNavYC = this.HeadNavH / 2; // rel center Y
  
  //
  this.offset     = 20; // offset of the Scale items
  this.scale      = 10; // the scale number steps
  this.nPad       = "   "; // number pad format # digits expected
}

// The verticalSpeed object to use outside 
//   as_obj.draw() will do the job

// local only - draw the scale of the compasss
Comp_obj.prototype.drawScale = function()
{
  var ctx = gp_obj.Canvas.getContext("2d");

  //	we are at relative 0/0
  ctx.save();
    // set the origin to center
    ctx.translate(this.R, this.R); 

    // dashes at 45 deg
    ctx.strokeStyle = gpGUI.colFrame;
    ctx.fillStyle = gpGUI.colFrame;
    ctx.lineWidth = 2 ;
    ctx.beginPath();
    var i;
    for ( i=0; i<8; i++) {
      ctx.moveTo(0, -this.R+this.offset);
      ctx.lineTo(0, -this.R);
      ctx.rotate(Math.PI/4);
      // toggle the lineWith for major, minor
    }
    ctx.stroke();
    // 
    // Mark triangle			
    ctx.beginPath();
    ctx.moveTo(-10, -this.R);
    ctx.lineTo(0, -this.R+this.offset);
    ctx.lineTo(10, -this.R);
    ctx.closePath();
    ctx.fill();
    ctx.fill();

    // major
    ctx.lineWidth = 4;
    ctx.beginPath();
    for ( i=0; i<4; i++) {
      ctx.moveTo(0, -this.R+this.offset);
      ctx.lineTo(0, -this.R);
      ctx.rotate(Math.PI/2);
      // toggle the lineWith for major, minor
    }
    ctx.stroke();

    // Center Plane little drawing..
    ctx.lineWidth = 1 ;
    ctx.beginPath();
    ctx.moveTo(0, -20); 
    ctx.lineTo( -2, -18); ctx.lineTo( -4, -14); ctx.lineTo(-4, -6); ctx.lineTo(-20, 4); ctx.lineTo( -20, 8); ctx.lineTo( -4, 6); ctx.lineTo( -4, 14); ctx.lineTo(-8, 18); ctx.lineTo(-8, 20);
    ctx.lineTo(0, 20); 
    ctx.lineTo(8, 20); ctx.lineTo(8, 18); ctx.lineTo( 4, 14); ctx.lineTo( 4, 6); ctx.lineTo( 20, 8); ctx.lineTo(20, 4); ctx.lineTo(4, -6); ctx.lineTo( 4, -14); ctx.lineTo( 2, -18); 
    ctx.closePath();
    ctx.fill();

    // Track Heading scale -18..18°
    ctx.lineWidth = 2 ;
    ctx.rotate(-18*Math.PI/180);
    ctx.beginPath();
    for ( i=-2; i<3; i++) {
      ctx.moveTo(0, -this.R+this.offset);
      ctx.lineTo(0, -this.R);
      ctx.rotate(9*Math.PI/180);
    }
    ctx.stroke();
  ctx.restore();
},

// draw the compass rose
Comp_obj.prototype.draw_compass = function (THEAD)
{
  if ( THEAD == null) return; // dont draw compass if not available

  var ctx = gp_obj.Canvas.getContext("2d");

  //	we are at relative 0/0
  ctx.save();
    // set the origin to center
    ctx.translate(this.R, this.R); 

    // inner area
    ctx.fillStyle = gpGUI.colCompass;
    ctx.globalAlpha=0.4; // draw transparent rectangle frame
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0,0,this.R-this.offset,0,2*Math.PI);
    ctx.moveTo(0, 0);
    ctx.arc(0,0,this.R,(-90-24)*Math.PI/180, (-90+24)*Math.PI/180 );
    ctx.fill();
    ctx.globalAlpha=1.0;

    // Set to heading
    ctx.rotate(-THEAD*Math.PI/180);
    
    // draw inner scale and labels
    ctx.font = gpGUI.font24s;
    ctx.fillStyle = gpGUI.colSmoke; // almost white
    ctx.textAlign = "center";
    ctx.textBaseline="top";
  
    ctx.strokeStyle = gpGUI.colSmoke;
    ctx.lineWidth=2;
    var y = -this.R+this.offset;
    ctx.beginPath();
    var i;
    for ( i=0; i<72; i++) {
      ctx.moveTo(0, y);
      if (( i % 2)==0){
        ctx.lineTo(0, y+this.offset);
        switch (i){
          case 0:
            ctx.fillText("N", 0, y+this.offset);
          break;
          case 18:
            ctx.fillText("E", 0, y+this.offset);
          break;
          case 36:
            ctx.fillText("S", 0, y+this.offset);
          break;
          case 54:
            ctx.fillText("W", 0, y+this.offset);
          break;
          case 6:
            ctx.fillText("3", 0, y+this.offset);
          break;
          case 12:
            ctx.fillText("6", 0, y+this.offset);
          break;
          case 24:
            ctx.fillText("12", 0, y+this.offset);
          break;
          case 30:
            ctx.fillText("15", 0, y+this.offset);
          break;
          case 42:
            ctx.fillText("21", 0, y+this.offset);
          break;
          case 48:
            ctx.fillText("24", 0, y+this.offset);
          break;
          case 60:
            ctx.fillText("30", 0, y+this.offset);
          break;
          case 66:
            ctx.fillText("33", 0, y+this.offset);
          break;
        }
      }
      else {
        ctx.lineTo(0, y+this.offset/2);
      }
      ctx.rotate(Math.PI/36.0);
      // toggle the lineWith for major, minor
    }
    // draw it
    ctx.stroke();
    
    // leave with the origin reset to the canvas origin
  ctx.restore();
},

// print Heading and Track
Comp_obj.prototype.draw_heading = function(THEAD)
{
  if ( THEAD != null) {
    THEAD = Math.round(THEAD);
  }

  var ctx = gp_obj.Canvas.getContext("2d");
  // set the origin to pos of HEAD field and assume a relative drawing 
  ctx.save();
    ctx.translate(this.HeadX, this.HeadY); 
    // frame and background		
    ctx.fillStyle = gpGUI.colBGLabel;
    ctx.strokeStyle = gpGUI.colFrame;
    ctx.fillRect(0,0, this.HeadW, this.HeadH);
    // for the rest clip the usable area
    ctx.rect(1,1, this.HeadW-2, this.HeadH-2);
    ctx.clip();
    // finally the indicated number
    ctx.globalAlpha=1.0; // opaque
    ctx.font = gpGUI.font32;
    ctx.fillStyle = gpGUI.colWhite;
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    if ( THEAD != null ) {
      ctx.fillText( THEAD.toString() + "°", this.HeadXC, this.HeadYC); // middle align
    } 
    else {
      ctx.fillText( "- - -", this.HeadXC, this.HeadYC); // middle align
    }
  // leave with the origin reset to the canvas origin
  ctx.restore();
},


// print Track - give TRACK and HEADING
Comp_obj.prototype.draw_track = function(TRACK, HEADING)
{
  if ( TRACK == null) return;
  if ( HEADING == null) return;
  
  var ctx = gp_obj.Canvas.getContext("2d");
  // set the origin to pos of HEAD field and assume a relative drawing 
  ctx.save();
    ctx.translate(this.R, this.R); 
    // Set to track offset vs heading
    ctx.rotate(-(HEADING-TRACK)*Math.PI/180);

    ctx.fillStyle = gpGUI.colPurple;
    var y = -this.R + 2*this.offset; // middle base of indicator
    ctx.beginPath();
    ctx.moveTo(0, y); 
    ctx.lineTo(-5, y-this.offset/2);
    ctx.lineTo(0, y-this.offset);
    ctx.lineTo(+5, y-this.offset/2);
    ctx.closePath();
    ctx.fill();
  ctx.restore();
},


// print Track - give TRACK and HEADING
Comp_obj.prototype.draw_headingNavBug = function(NAVHEAD, HEADING)
{
  if ( NAVHEAD == null) return;
  if ( HEADING == null) return; // don't show navBug if heading is not avail
  
  var ctx = gp_obj.Canvas.getContext("2d");
  ctx.save();
    ctx.translate(this.R, this.R); 
    // Set to Nav Heading
    ctx.rotate(-(HEADING-NAVHEAD)*Math.PI/180);

    ctx.fillStyle = gpGUI.colNav;
    var y = -this.R + this.offset; // middle base of indicator
    ctx.beginPath();
    ctx.moveTo(0, y+10); 
    ctx.lineTo(-8, y); ctx.lineTo(-15, y+2); ctx.lineTo(-15, y+20); ctx.lineTo(-13, y+18); 
    ctx.lineTo(+13, y+18); ctx.lineTo(+15, y+20); ctx.lineTo(+15, y+2); ctx.lineTo(+8, y); 
    ctx.closePath();
    ctx.fill();
  ctx.restore();
},


// print Nav Heading
Comp_obj.prototype.draw_headingNav = function(NAVHEAD)
{
  if ( NAVHEAD == null) return;
  NAVHEAD = Math.round(NAVHEAD);

  var ctx = gp_obj.Canvas.getContext("2d");
  // set the origin to pos of HEAD field and assume a relative drawing 
  ctx.save();
    ctx.translate(this.HeadNavX, this.HeadNavY); 
    // frame and background		
    ctx.fillStyle = gpGUI.colBGLabel;
    ctx.strokeStyle = gpGUI.colFrame;
    ctx.fillRect(0,0, this.HeadNavW, this.HeadNavH);
    ctx.strokeRect(0,0, this.HeadNavW, this.HeadNavH);
    // for the rest clip the usable area
    ctx.rect(1,1, this.HeadNavW-2, this.HeadNavH-2);
    ctx.clip();
    // finally the indicated number
    ctx.globalAlpha=1.0; // opaque
    ctx.font = gpGUI.font24;
    ctx.fillStyle = gpGUI.colNav;
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    ctx.fillText( "HDG " + NAVHEAD.toString() + "°", this.HeadNavXC, this.HeadNavYC); // middle align
  // leave with the origin reset to the canvas origin
  ctx.restore();
},


// print TrackIndicator 
Comp_obj.prototype.draw_trackIndicator = function(TRACKRATE)
{
  if ( TRACKRATE == null) return;
  if ( Math.abs(TRACKRATE) < 0.05 ) return; // don't show if small
  var trate = ( Math.abs(TRACKRATE)>4.0 ) ? 4.0 : TRACKRATE; // limit, some seem to just report crap... i.e. above 4 r is killed off		
  
  var ctx = gp_obj.Canvas.getContext("2d");
  // set the origin to pos of HEAD field and assume a relative drawing 
  ctx.save();
    // set the origin to center
    ctx.translate(this.R, this.R); 
    ctx.strokeStyle = gpGUI.colPurple;
    ctx.lineWidth = 3;
    var trkDeg = trate * 18; //deg for now
    // Track Heading scale -18..18°
    ctx.beginPath();
    if (TRACKRATE<0) {
      ctx.arc(0,0,this.R-this.offset+4,-90*Math.PI/180, (-90+trkDeg)*Math.PI/180, true ); // left of north
    } else {
      ctx.arc(0,0,this.R-this.offset+4,-90*Math.PI/180, (-90+trkDeg)*Math.PI/180 );
    }
    ctx.stroke();
  ctx.restore();
},


// MAIN call to draw the airspeed instrument
Comp_obj.prototype.draw = function(THEAD, NHEAD, TRACK, TRACKRATE) 
{
  var ctx = gp_obj.Canvas.getContext("2d");

  var value = THEAD; // set to uniform the routines
//		value = CenterValue; // DEVELOP we take it from global until having a real number

  ctx.save();
    // set the origin to pos of AS indicator and assume a relative drawing 
    ctx.translate(this.X, this.Y); 

    // draw the compass 
    this.draw_compass(THEAD);
    // makes the scale indicators
    this.drawScale();
    this.draw_headingNavBug(NHEAD, THEAD);
    this.draw_track(TRACK, THEAD); //TRACK, HEADING

    this.draw_heading(THEAD);
    this.draw_headingNav(NHEAD);
    this.draw_trackIndicator(TRACKRATE);
  // leave with the origin reset to the canvas origin
  ctx.restore();
}






// JavaScript Document
// Glas Panel Attitude display
// GP assumes a 1000x1000 canvas - sould be possible to scale it down
// Expects a Canvas wtih ID  'GlasPanel'
"use strict";


// Panel geometries
function At_obj()
{
  // absolute pix in the canvas
  this.X    = gp_obj.X;   // X pos
  this.Y    = gp_obj.Y;  // Y pos
  this.W    = gp_obj.W;  // width
  this.H    = gp_obj.H;  // height
  // relative pix in the rect
  this.XC = this.W / 2; // rel center X
  this.YC = this.H / 2; // rel center Y
  //
  this.RollXC = gp_obj.RollXC;    // Roll Center X
  this.RollYC = gp_obj.RollYC;    // Roll Center Y
  
  this.HeadH = gp_obj.HeadH;  // Headline heigt
  this.FootH = gp_obj.FootH;
  //
  
  // plane fixup
  this.FixX = 420; this.FixY = 373; 
  this.FixW = 200; this.FixH = 80;
  
  this.TIndX = this.RollXC; this.TIndY = 128; 
  
  this.DegOffset = 10;  // pixel offset per degree vertical
  
  this.DegScaleMax = +20; // max angle show at level
  this.DegScaleMin = -15; // min angle show at level
  this.DegShownMax = +50; // max angle of the plane to show
  this.DegShownMin = -50; // min angle of the plane to show
}


// calc the ascent, descent angle in Rad
At_obj.prototype.ad_angleRad = function(GS, VR){ // GroundSpeed [KN], vert.rate [ft/min]
  const ftPerNM = 6078.1;
  /*
    atan ( VR / ( GS*ftPerKN / 60 ) )
  */
  return Math.atan2( (VR * 60.0), (GS * ftPerNM) );
}
// as above in Deg
At_obj.prototype.ad_angleDeg = function(GS, VR){ // GroundSpeed [KN], vert.rate [ft/min]
  return (this.ad_angleRad(GS, VR) * 180 / Math.PI );
}

// background - sky and ground
At_obj.prototype.drawBack = function(ROLL, GS, VR)
{
  // some preCalc
  // defaults at plane -> level (or data not available)
  var rollAngle = 0;
  var canRoll = false;
  if ( ROLL != null ){
    rollAngle = ROLL;
    canRoll = true;
  }
  
  var adAngleDeg = 0;
  var maxAngle  = this.DegScaleMax;
  var minAngle  = this.DegScaleMin;
  var canAD = false;
  if ( GS != null && VR != null){
    adAngleDeg = this.ad_angleDeg(GS, VR);
    adAngleDeg = (adAngleDeg > this.DegShownMax) ? this.DegShownMax : adAngleDeg ; // limit to not kill the display
    adAngleDeg = (adAngleDeg < this.DegShownMin) ? this.DegShownMin : adAngleDeg ; // limit to not kill the display
    maxAngle += adAngleDeg; minAngle += adAngleDeg; // new scale adjusted to current AD angle
    maxAngle = Math.floor(maxAngle / 5) * 5;
    minAngle = Math.ceil(minAngle / 5) * 5;
    canAD = true;
  }
  const adOffset = adAngleDeg * this.DegOffset; // pos angle -> pos offset (shifts the background down)

  // use a second canvas to draw the background with roll 
  // then blit it into our master canvas
  var canvasL = document.createElement('canvas');
  canvasL.width = 1800; canvasL.height = 1800; // big enough to not clip at turns
  canvasL.style.zIndex = 8;
  canvasL.style.position = "absolute";
  canvasL.style.border = "0px solid";
  var ctxL = canvasL.getContext("2d");
  // set center of roll to 0/0
  ctxL.translate(canvasL.width/2, canvasL.height/2);
  // -rot around the roll rate (to draw upright)
  ctxL.rotate(-rollAngle*Math.PI/180);
  ctxL.translate(0, +adOffset); // shift correct
  
  // paint with center of the canvas = 0/0
  // gradients are made of plane size to not bleed out the middle section
  var sky_gradient = ctxL.createLinearGradient(-canvasL.width/2, -canvasL.height/2, -canvasL.width/2, canvasL.height*0.75);
  sky_gradient.addColorStop(0, gpGUI.colSky);
  sky_gradient.addColorStop(1, gpGUI.colSmoke);
  var ground_gradient = ctxL.createLinearGradient(-canvasL.width/2, -canvasL.height/2, -canvasL.width/2, canvasL.height );
  ground_gradient.addColorStop(0, gpGUI.colSmoke);
  ground_gradient.addColorStop(1, gpGUI.colGround);
  // fill sky half
  ctxL.fillStyle=sky_gradient;
  ctxL.fillRect(-canvasL.width/2, -canvasL.height/2, canvasL.width, canvasL.height/2);
  // fill ground half
  ctxL.fillStyle=ground_gradient;
  ctxL.fillRect(-canvasL.width/2, 0, canvasL.width, canvasL.height/2);

  // horizon line
  ctxL.strokeStyle = gpGUI.colSmoke;
  ctxL.lineWidth=3;
  ctxL.beginPath();
  ctxL.moveTo(-canvasL.width/2, 0); ctxL.lineTo(canvasL.width/2, 0);
  ctxL.stroke();

  // turn scale
  if (canRoll===true) {
    ctxL.save();
      ctxL.translate(0, -adOffset); // shift correct
      const rollYC = this.RollYC; 
      // marker triangle
      ctxL.fillStyle = gpGUI.colSmoke;
      ctxL.beginPath();
      ctxL.moveTo(0,this.TIndY-rollYC); // point bottom
      ctxL.lineTo(-15, this.TIndY-rollYC-26); ctxL.lineTo(+15, this.TIndY-rollYC-26);  
      ctxL.closePath();
      ctxL.fill();
      // circle
      ctxL.lineWidth = 3;
      ctxL.strokeStyle = gpGUI.colSmoke;
      ctxL.beginPath(); 
        ctxL.arc(0, 0, rollYC-this.TIndY, (-90-60)*Math.PI/180, (-90+60)*Math.PI/180 );
      ctxL.stroke();
      // Scale markers at -60,-45,-30,-20,-10, +10,+20,+30,+45,+60
      ctxL.rotate(-60.0*Math.PI/180);
      ctxL.beginPath();ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-26); 
      ctxL.stroke();
      ctxL.rotate(15.0*Math.PI/180); // -45
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-13); 
      ctxL.stroke();
      ctxL.rotate(15.0*Math.PI/180); // -30
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-26); 
      ctxL.stroke();
      ctxL.rotate(10.0*Math.PI/180); // -20
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-13); 
      ctxL.stroke();
      ctxL.rotate(10.0*Math.PI/180); // -10
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-13); 
      ctxL.stroke();

      ctxL.rotate(10.0*Math.PI/180); // at N
      
      ctxL.rotate(10.0*Math.PI/180); // +10 
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-13); 
      ctxL.stroke();
      ctxL.rotate(10.0*Math.PI/180); // +20
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-13); 
      ctxL.stroke();
      ctxL.rotate(10.0*Math.PI/180); // +30
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-26); 
      ctxL.stroke();
      ctxL.rotate(15.0*Math.PI/180); // +45
      ctxL.beginPath(); ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-13); 
      ctxL.stroke();
      ctxL.rotate(15.0*Math.PI/180); // +60
      ctxL.beginPath();ctxL.moveTo(0,this.TIndY-rollYC); ctxL.lineTo(0, this.TIndY-rollYC-26); 
      ctxL.stroke();
    ctxL.restore();
  }

  // the vertical scale ad angle
  if ( canAD === true ) {
    ctxL.font = gpGUI.font24s;
    ctxL.textBaseline="middle";
    ctxL.fillStyle = gpGUI.colSmoke;

    ctxL.lineWidth = 3;
    ctxL.strokeStyle = gpGUI.colSmoke;
    ctxL.beginPath();
    var i;
    for (i=minAngle; i<=maxAngle; i+=5){
      if ( (i%10)==0 ) {
        ctxL.moveTo(-50, -i*this.DegOffset); ctxL.lineTo(50, -i*this.DegOffset);
        ctxL.textAlign = "right"; ctxL.fillText(i.toString(), -55, -i*this.DegOffset );
        ctxL.textAlign = "left"; ctxL.fillText(i.toString(), +55, -i*this.DegOffset );
      } else {
        ctxL.moveTo(-25, -i*this.DegOffset); ctxL.lineTo(25, -i*this.DegOffset);
      }
    }
    ctxL.stroke();
  }
  
  // blit it into our canvas with center of our center of rotation
  var ctx = gp_obj.Canvas.getContext("2d");
  ctx.save();
    ctx.rect(this.X, this.Y+this.HeadH, this.W, this.H-this.HeadH-this.FootH ); // inner part only
    ctx.clip(); // clip usable area
    // copy drawn canvas center adjusted to AD and Roll into our used canvas
    const xcorr = Math.tan(rollAngle*Math.PI/180)*adOffset;
//			ctx.drawImage(canvasL, canvasL.width/2-this.RollXC-xcorr, canvasL.height/2-this.RollYC-adOffset, this.W, this.H, 0, 0, this.W, this.H);
    ctx.drawImage(canvasL, canvasL.width/2-this.RollXC, canvasL.height/2-this.RollYC, this.W, this.H, 0, 0, this.W, this.H);
  ctx.restore();
}

// fixed plane horizon
At_obj.prototype.drawFixup = function()
{
  var ctx = gp_obj.Canvas.getContext("2d");
  ctx.save();
    ctx.translate(this.FixX, this.FixY);

    var gradient = ctx.createLinearGradient(0,0,0,this.FixH*2);
    gradient.addColorStop(0, gpGUI.colYellow);
    gradient.addColorStop(1, gpGUI.colBlack);
  
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(-this.FixW/2, this.FixH); ctx.lineTo(-this.FixW/2+10, this.FixH); 
    ctx.lineTo(0, this.FixH/3);
    ctx.lineTo(+this.FixW/2-10, this.FixH); ctx.lineTo(+this.FixW/2, this.FixH); 
    ctx.closePath();
    ctx.fill();
    
    gradient.addColorStop(0.03, gpGUI.colBlack);
    ctx.strokeStyle = gradient;
    // left side			
    ctx.beginPath();
    ctx.moveTo(-this.FixW, -3); ctx.lineTo(-this.FixW/2, -3); 
    ctx.lineTo(-this.FixW/2+5, 0);
    ctx.lineTo(-this.FixW/2, +3); ctx.lineTo(-this.FixW, +3);
    ctx.closePath();
    ctx.fill();
    // right side
    ctx.beginPath();
    ctx.moveTo(+this.FixW, -3); ctx.lineTo(+this.FixW/2, -3); 
    ctx.lineTo(+this.FixW/2-5, 0);
    ctx.lineTo(+this.FixW/2, +3); ctx.lineTo(+this.FixW, +3);
    ctx.closePath();
    ctx.fill();
  ctx.restore();
}

// Turn Indicator 
At_obj.prototype.drawTurnIndicator = function()
{
  var ctx = gp_obj.Canvas.getContext("2d");
  // turn indicator
  ctx.save();
    // turn center
    ctx.translate(this.RollXC, this.RollYC); 
    // turn to draw upright
    // turn triangle
    ctx.fillStyle = gpGUI.colSmoke;
    ctx.beginPath();
    ctx.moveTo(0,this.TIndY-this.RollYC); // point top
    ctx.lineTo(-15, this.TIndY-this.RollYC+26); ctx.lineTo(+15, this.TIndY-this.RollYC+26);  
    ctx.closePath();
    ctx.fill();
  ctx.restore();
}

// Draw all of this
At_obj.prototype.drawAttitude = function(ROLL, GS, VR) // roll , ground speed, vertical_rate
{
  this.drawBack(ROLL, GS, VR);
  this.drawFixup();
  this.drawTurnIndicator();
}

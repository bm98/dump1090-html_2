// JavaScript Document
// 3d Flight Display
// (c) 2019 Martin Burri
// LICENSE MIT
// uses Three.js (extensive WebGL library at https://threejs.org)
// Expects a Canvas with ID  'FlightDisplay'
"use strict";

function Fd3d_obj()
{
	/**
	 * Exposed Properties
	 */
	this.UpdateInterval = 2000; // milliseconds

	// LOCAL 
	const LatLon = LatLon_NvectorEllipsoidal;

	const NBSP='\u00a0';
	const DEGREES='\u00b0'
	const UP_TRIANGLE='\u25b2'; // U+25B2 BLACK UP-POINTING TRIANGLE
	const DOWN_TRIANGLE='\u25bc'; // U+25BC BLACK DOWN-POINTING TRIANGLE
	
	// standard Three items
    let container = null;
	let scene = null;
	let groupSkyBox = null; // shall contain the skybox, grids etc.
	let groupPlane = null;  // shall contain the plane track

	let camera = null;
	let renderer = null;
	let labelRenderer = null;
	let lut = null;
    let controls = null;
    const stats = new Stats();
    const keyboard = new THREEx.KeyboardState();
    const clock = new THREE.Clock();

	// prefabs
	// this.geometryHead = new THREE.SphereGeometry( 5, 16, 8 ); // larger dot
	const geometryHead = new THREE.ConeGeometry( 5, 16, 12 ); // larger cone
	const geometryTail = new THREE.SphereGeometry( 1, 16, 8 ); // small dot

	// Center of the area
	let CenterLat = 0.0;
	let CenterLon = 0.0;
	let CenterLL = new LatLon(47,9);

	// 3D scene setup:
	// Local space: (1000,1000,1000)
	// Lon {-180..0..+180}
	// Alt {0..50000} ft
	// Lat {-90..0..+90}
	// Station Circle Radius == ~300nm @ 0|0|0 (our coords) 1nm=1852.2m
	// x: Left->Right (-500..0..500) 	=> Lon {-5..0..+5} Deg @Lat 0; 
	// y: Bottom->Top (0..1000)			=> Alt {0..50000}
	// z: Back->Front (-500..0..500)	=> Lat {-5..0..+5} Deg
	// x=Lon, y=Alt, z=Lat 
	// DegLon per 300nm ~ y = 0.0001x3 - 0.0079x2 + 0.1728x + 4.9702  / fits to |75|Deg
	const _localDimX = 1000; 	// scene measure Lon
	const _localDimY = 500; 	// scene measure Alt
	const _localDimZ = 1000; 	// scene measure Lat

	const _maxAlt = 40000; 	// ft

	const _mPerNm = 1852.01; // Conversion/Scaling
	const _mPerFt = 0.3048;  // Conversion

	const _maxRad = 200*_mPerNm; // meter

	const AltScale = _localDimY / _maxAlt; // Scale {Alt} to (local)
	let LocalTx = new THREE.Matrix4();

	let Canvas = null;
	
	let PlaneSelected = null; // keep track to clear scene if changed
	let PlanesTracked = [];   // object {pos,alt,lastItem}

	let lastTime = 0;

	// FUNCTIONS 		

	// Helpers (using Arrow function with implicite return..)
	const _mFromNm = (nm) => nm * _mPerNm; 
	const _mToNm = (m) => m / _mPerNm; 
	const _mFromFt = (ft) => ft * _mPerFt; 
	const _mToFt = (m) =>  m / _mPerFt; 
	const _tailID = (name) => name + '-';


	/**
	 * Private:
	 *  Return one of flight, registration, icao
	 */
	const planeLabel = ( plane ) =>
	{
		let lbl = '';
		if ( plane.flight != null ) { lbl = plane.flight; }
		else if ( plane.registration != null ) { lbl = plane.registration; }	
		else { lbl = plane.icao; }

		if (plane.vert_rate > 128) { lbl += ' ' + UP_TRIANGLE;
		} else if (plane.vert_rate < -128) { lbl += ' ' + DOWN_TRIANGLE;
		} else { lbl += ' ' + NBSP; }

		if ( plane.altitude != null ){
			lbl += ' ' + plane.altitude.toString() + 'ft';
		}
		if ( plane.speed != null ){
			lbl += ' ' + plane.speed.toString() + 'kt';
		}
		return lbl;
	}

	/**
	 * Private:
	 * Add an item (point) to the 3d display (not taking altitude projection into account...)
	 * @param {Array} position lon, lat of the plane position
	 * @param {Int} alt altitude [ft] of the item to add
	 * @param {PlaneObject} plane the plane obj to add from
	*/
	const addItem = ( position, alt, plane ) =>
	{
		const name = plane.icao; // we use this as ID
		const label = planeLabel( plane ); 

		// clip Alt for Lut use
		let lAlt = (alt>_maxAlt) ? _maxAlt : alt;
		lAlt = (lAlt<0) ? 0 : lAlt;

		// replace old head
		const old = groupPlane.getObjectByName( name );
		let oldGeo = null;
		let oldLabel = null;
		if ( old !== undefined ){
			oldGeo = old.geometry;
			old.geometry = geometryTail; // attach standard element
			old.name = _tailID(name);
			oldLabel = old.getObjectByName( name );
			old.remove( oldLabel );
		}

		// calc position
		const planeLL = new LatLon( position[1], position[0], _mFromFt(alt) );
		const ned = CenterLL.deltaTo(planeLL);
		// scale into our scene - order is Lon, Alt, Lat
		const lPos = new THREE.Vector3(ned.east, alt, ned.north); 
		lPos.applyMatrix4( LocalTx) ; // scale to local

		const tx = new THREE.Matrix4();
		let mesh = null;
		let rot = new THREE.Euler(-Math.PI/2,0,0); // initial rotation for brand new elements

		if ( oldGeo !== null ) {
			rot = old.rotation; // use old (maybe)
			// set direction of the cone (plane etc.) if movement is substantial enough..
			const dist = lPos.distanceTo(old.position);
			if ( dist > 0.5 ){
				tx.lookAt( old.position, lPos, new THREE.Vector3(0,1,0) );
				tx.multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2) ); // cone basic orientation
				rot.setFromRotationMatrix (tx); // new rot
			}
			// re-use old geomentry
			mesh = new THREE.Mesh( oldGeo, lut.getMaterial(_maxAlt - lAlt) );
		}
		else {
			// add new head (default orientation is yUp)
			mesh = new THREE.Mesh( geometryHead.clone(), lut.getMaterial( _maxAlt - lAlt ) );

			const labelDiv = document.createElement( 'div' );
			labelDiv.className = 'planeLabel';
			labelDiv.textContent = label;
			labelDiv.style.marginTop = '-1em';
			oldLabel = new THREE.CSS2DObject( labelDiv );
			oldLabel.position.set( 0, 10, 0 );
			oldLabel.name = name;
		}
		// set rot and pos of the object added
		mesh.position.copy( lPos ); 
		mesh.rotation.copy( rot );
		oldLabel.element.textContent = label;
		mesh.add( oldLabel );
		
		// apply a name (icao) to find it later
		mesh.name = name;
		groupPlane.add( mesh );
	}

	/**
	 * Private:
	 *  Add the track as Items
	*/
	const addTrack = ( plane ) =>
	{
		let i=0;
		for ( i=0; i<plane.track_linesegs.length; i++){
			if ( plane.track_linesegs[i].ground === false ) {
				addItem( plane.track_linesegs[i].position, plane.track_linesegs[i].altitude, plane );
			}
		}
	}

	/**
	 * Private:
	 *  Remove this plane from tracking
	 */
	const removePlane = ( plane ) => 
	{		
		const name = plane.icao; // our ID
		// remove tail
		let pItem = groupPlane.getObjectByName( _tailID(name) );
		while( pItem !== undefined ) {
			groupPlane.remove(pItem);
			pItem = groupPlane.getObjectByName( _tailID(name) );
		}
		// find head
		pItem = groupPlane.getObjectByName( name );
		if ( pItem !== undefined ) {
			// remove label
			if ( pItem.children.length>0 ){
				pItem.remove(pItem.children[0]);
			}
			// remove item from scene
			groupPlane.remove(pItem);
		}
		// remove that one from tracked
		PlanesTracked.splice( PlanesTracked.indexOf(plane), 1 ); 
	}

	/**
	 * Private:
	 *  Clean the groupPlane from any items..
	 */
	const clearPlanes = () => 
	{		
		let i=0;
		for ( i=0; i<groupPlane.children.length; i++ ){
			const item = groupPlane.children[i];
			if ( item.name !== undefined ){
				if ( item.children.length>0 ){
					item.remove(item.children[0]);
				}
			}
		}
	}

	/**
	 * Private:
	 *  Update method
	*/
	const update = () =>
	{
		if ( keyboard.pressed("c") )  {	
			// Init or cleared plane in backstore
			clearPlanes();
			scene.remove( groupPlane );
			PlanesTracked = []; PlaneSelected = null;
			// init new
			groupPlane = new THREE.Group();
			groupPlane.name = 'Plane';
			scene.add( groupPlane );
		}
		controls.update();
		stats.update();
	}


	/**
	 * Private:
	 *  Render method
	*/
	const render = () =>
	{
		renderer.render( scene, camera );
		labelRenderer.render( scene, camera );
	}

	/**
	 * Public:
	 * Register the selected plane and clear scene if needed
	 * @param {PlaneObject} selPlane selected plane
	*/
	this.registerPlane = ( selPlane ) =>
	{
		if ( selPlane === null ) return;

		if ( PlanesTracked.find(x=> x.icao===selPlane.icao ) == undefined ) {
			PlanesTracked.push(selPlane);
		}

		if ( PlaneSelected === null ) {
			// Init or cleared plane in backstore
			PlaneSelected = selPlane;
			groupPlane = new THREE.Group();
			groupPlane.name = 'Plane';
			scene.add( groupPlane );
			addTrack(selPlane);
			this.resize();
		} 
		else {
			if ( selPlane.icao !== PlaneSelected.icao ){
				// have to cleare current Scene to show a new plane 
				//this.scene.remove( this.groupPlane );
				// create a new plane
				PlaneSelected = selPlane;
				//this.groupPlane = new THREE.Group();
				//this.groupPlane.name = 'Plane';
				//this.scene.add( this.groupPlane );
				addTrack(selPlane);
				this.resize();
			}
		}
	}


	/**
	 * Internal Init custom elements for the scene
	*/
	const _initCustom = ( ) =>
	{
		groupSkyBox = new THREE.Group();
		groupSkyBox.name = 'SkyBox';
		/*	
		// FLOOR
		var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
		floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
		floorTexture.repeat.set( 10, 10 );
		var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.position.y = -0.5;
		floor.rotation.x = Math.PI / 2;
		this.scene.add(floor);
		*/
		// SKYBOX
		const skyBoxGeometry = new THREE.CubeGeometry( _localDimX*10, _localDimY*10, _localDimZ*10 );
		const skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x070722, side: THREE.BackSide } );
		const skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		groupSkyBox.add( skyBox );
		
		const  axes = new THREE.AxisHelper(50);    
		axes.position.set( 40,40,40 );
		groupSkyBox.add( axes );

		// Plane (XZ) is set when defining the center
		// Lon Grid (X up)
		const gridXY = new GridHelper2( _localDimX, _localDimY, 4, new THREE.Color(0x0000DD), new THREE.Color(0x000088));
		gridXY.position.set( 0, _localDimY/2, 0 );
		gridXY.rotation.x = Math.PI/2;
		groupSkyBox.add( gridXY );
		// Lat Grid (Z up)
		const gridYZ = new GridHelper2(_localDimZ, _localDimY, 4, new THREE.Color(0xDD0000), new THREE.Color(0x660000) );
		gridYZ.position.set( 0 ,_localDimY/2, 0 );
		gridYZ.rotation.x = Math.PI/2;
		gridYZ.rotation.z = Math.PI/2;
		groupSkyBox.add( gridYZ );
		


		// direction (normalized), origin, length, color(hex)
		const origin = new THREE.Vector3(50,100,50);
		const terminus  = new THREE.Vector3(75,75,75);
		const direction = new THREE.Vector3().subVectors(terminus, origin).normalize();
		const arrow = new THREE.ArrowHelper(direction, origin, 50, 0x884400);
		groupSkyBox.add( arrow );

		// hook to scene
		scene.add( groupSkyBox );
		this.registerPlane(null); // imply resize
	}


	/**
	 * Public:
	 * 	Init method
	 * @param {String} docID the Container DOM element name for the Display
	*/
	this.init = ( docID ) =>
	{
		// CONTAINER
		container = document.getElementById( docID );

		// SCENE
		scene = new THREE.Scene();
		scene.position.setY(-_localDimY/2); // shift a bit down..
		// CAMERA
		const SCREEN_WIDTH = container.clientWidth, SCREEN_HEIGHT = container.clientHeight;
		const VIEW_ANGLE = 40, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 10000;
		camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
		scene.add( camera );
		camera.position.set( _localDimX, _localDimY, _localDimZ );
		camera.lookAt( scene.position );	
		// RENDERER
		if ( Detector.webgl )
			renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			renderer = new THREE.CanvasRenderer(); 
			
		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		container.appendChild( renderer.domElement );

		labelRenderer = new THREE.CSS2DRenderer();
		labelRenderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		labelRenderer.domElement.style.position = 'absolute';
		labelRenderer.domElement.style.top = 0;
		container.appendChild( labelRenderer.domElement );

		// EVENTS
		THREEx.WindowResize( container, renderer, camera );
		THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
		// CONTROLS
	//	this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		controls = new THREE.MapControls( camera, labelRenderer.domElement );
		controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
		controls.dampingFactor = 0.05;
		controls.screenSpacePanning = true;
		controls.minDistance = 100;
		controls.maxDistance = 2000;
		controls.maxPolarAngle = Math.PI / 2;

		// STATS
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
		// LIGHT
		let light = new THREE.PointLight(0xffffff);
		light.position.set( _localDimX, 0, _localDimZ );
		scene.add( light );

		light = new THREE.PointLight(0xffffff);
		light.position.set( -_localDimX, _localDimY*1.5, -_localDimZ );
		scene.add( light );

		light = new THREE.AmbientLight( 0xFFFFFF );
		//light = new THREE.DirectionalLight( 0xffffff, 0.8 );
		//light.position.set(0,this._maxAlt+1000,0);
		scene.add( light );

		// MATERIAL  LUT
		// var material = new THREE.MeshLambertMaterial( { color: 0x000088 } );
		const refMaterial = new THREE.MeshStandardMaterial( ); // reference material
		lut = new LutMaterial( "dump1090", 256, refMaterial);
		lut.setMax( _maxAlt );

		// INIT CUSTOM ELEMENTS
		_initCustom();
	}


	/**
	 * Public:
	 * 	Set the receivers center location 
	 * @param {Array} center lon, lat of the center position
	*/
	this.setCenter = ( center ) => 
	{
		CenterLon = center[0];
		CenterLat = center[1];
		CenterLL = new LatLon(CenterLat, CenterLon);
		// create new Local Scaling Matrix
		LocalTx = new THREE.Matrix4();
		LocalTx.makeScale( _localDimX / (2 * _maxRad), // EW (Lon)
							AltScale,
							_localDimZ / (2 * _maxRad) * -1); // NS (Lat)
		// Ground Circle intended to show radials at 50,100, 150, 200 nm (but right now it's off... TODO)
		const gridP = new GeoGridHelper( LocalTx, _maxRad, 12, 4, 144, new THREE.Color(0x003300), new THREE.Color(0x007700));
		gridP.position.set( 0,0,0 );
		groupSkyBox.add( gridP );
	}

	/**
	 * Public:
	 * 	Animation Loop routine
	 */
	const loop = () => 
	{
		render();
		update();
	}

	/**
	 * Public:
	 *  Update all tracked planes
	 */
	const updatePlanes = () =>
	{
		// go through tracked list
		for(let key in PlanesTracked) {
			const plane = PlanesTracked[key];
			if ( plane.visible ) {
				addItem( plane.position, plane.altitude, plane );
			}
			else {
				removePlane(plane);
			}
		}
	}

	/**
	 * Animation Update function, called by Three system
	*/
	this.animate = (timestamp) =>
	{
		if (!lastTime) lastTime = timestamp;
		const dT = timestamp - lastTime;
		requestAnimationFrame( this.animate ); // re-trigger myself..	
		loop(); // our own animation loop

		// update scene if timeout only for performance reasons
		if (dT > this.UpdateInterval) {
			lastTime = timestamp;		
			updatePlanes();  // update tracked planes
		}
	}

	/**
	 * Public:
	 *  Resize
	*/
	this.resize = () =>
	{
		// notify the renderer of the size change
		const SCREEN_WIDTH = container.clientWidth, SCREEN_HEIGHT = container.clientHeight;
		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		labelRenderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		// update the camera
		camera.aspect	= SCREEN_WIDTH / SCREEN_HEIGHT;
		camera.updateProjectionMatrix();
	}

}//object


// INSTANCE
const fd3d_obj = new Fd3d_obj();      // Flight Display 3d base

// global , assumes the var above...

/**
 * Startup code for the 3d Flight Display
 * @param {String} docID the Container DOM element name for the Display
 * @param {Array} center lon, lat of the center position
*/
function fd3d_init ( docID, center ) 
{	
	fd3d_obj.init( docID );
	fd3d_obj.setCenter( center );
	// start animation loop for THREE
    fd3d_obj.animate(0);
}


/**
 * Flight Update, called by SkyView Loop
 * @param {PlaneObject} selPlane selected plane
*/
function fd3d_update ( selPlane )
{
	if (typeof selPlane === 'undefined') { return; }
	fd3d_obj.registerPlane( selPlane );
}

/*
Fd3d_obj.prototype._locLat = function (lat)
{
	var lLat = lat - this.CenterLat;
	// this should take care around the poles
	if ( lLat<-90.0) lLat =  2*90.0+lat - this.CenterLat;
	if ( lLat> 90.0) lLat = -2*90.0+lat - this.CenterLat;
	return lLat * -1.0; // Lat grid is inverse ?? check S-Hemi..
}
Fd3d_obj.prototype._locLon = function (lon)
{
	var lLon = lon - this.CenterLon;
	// this should take care of the +180*-180 deg line
	if ( lLon<-180.0) lLon =  2*180.0+lon - this.CenterLon;
	if ( lLon> 180.0) lLon = -2*180.0+lon - this.CenterLon;
	return lLon;
}
*/

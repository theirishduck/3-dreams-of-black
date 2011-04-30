var CityWorld = function ( shared ) {

	var that = this;

	var cityMaterials = [];
	var cityMaterialGrassStart = new THREE.Vector3();
	var cityMaterialGrassEnd = new THREE.Vector3();

	var ENABLE_LENSFLARES = true;

	this.scene = new THREE.Scene();
	this.scene.collisions = new THREE.CollisionSystem();
	
	// Portal

	var portal = new THREE.Vector3( 1094.090, -99.358, 246.713  );	

	// Fog

	this.scene.fog = new THREE.FogExp2( 0x535758, 0.000047 );
	
	// Lights

	var ambientLight = new THREE.AmbientLight( 0x334433 );
	this.scene.addLight( ambientLight );

	var directionalLight1 = new THREE.DirectionalLight( 0xffffff );
	directionalLight1.castShadow = false;
	this.scene.addLight( directionalLight1 );

	var directionalLight2 = new THREE.DirectionalLight( 0xffffff );
	directionalLight2.castShadow = false;
	this.scene.addLight( directionalLight2 );

	// Set up settings
   
	var settings = { "fogDensity": 0.0000264, "fogColor": {  "h": 0,  "s": 0.3235,  "v": 0.347 }, "ambientLight": {  "h": 0.465,  "s": 0.494,  "v": 0 }, "directionalLight1": {  "h": 0.565,  "s": 0.329,  "v": 0.841,  "x": 0.5176767580772196,  "y": 0.7138857482214859,  "z": -0.4715696264952919,  "phi": 0.7757647058823531,  "theta": -0.7388235294117651 }, "directionalLight2": {  "h": 0,  "s": 0,  "v": 0.18235294117647058,  "x": -0.8372195027957865,  "y": -0.4114343306911316,  "z": -0.3602572631705248,  "phi": -1.9948235294117649,  "theta": 0.4063529411764706 }, "effectEnabled": true, "effectType": "noise", "postprocessingNoise": {  "nIntensity": 0.2411764705882353,  "sIntensity": 0,  "sCount": 4096 }, "postprocessingBloom": {  "opacity": 1 }, "flarex": 18.52941176470588, "flarey": 358, "flyCamera": {  "position": {   "x": 16.574202591686277,   "y": 462.26953453589,   "z": -10184.707948888321  },  "target": {   "x": 13.49395371115724,   "y": 486.5924391778843,   "z": -10281.655916255411  } }, "sceneScale": 1};
	
	this.scene.fog.color.setHSV( settings.fogColor.h,  settings.fogColor.s, settings.fogColor.v );
	this.scene.fog.density = settings.fogDensity;

	//ambientLight.color.setHSV( settings.ambientLight.h, settings.ambientLight.s, settings.ambientLight.v );
	directionalLight1.color.setHSV( settings.directionalLight1.h, settings.directionalLight1.s, settings.directionalLight1.v );
	directionalLight2.color.setHSV( settings.directionalLight2.h, settings.directionalLight2.s, settings.directionalLight2.v );

	directionalLight1.position.set( settings.directionalLight1.x, settings.directionalLight1.y, settings.directionalLight1.z );
	directionalLight2.position.set( settings.directionalLight2.x, settings.directionalLight2.y, settings.directionalLight2.z );
	
	// Lens flares

	if ( ENABLE_LENSFLARES ) {

		this.lensFlare = null;
		this.lensFlareRotate = null;

		var flaresPosition = new THREE.Vector3( 0, 0, -5000 );
		var sx = 20, sy = 358;
		initLensFlares( that, flaresPosition, sx, sy );		

	}

	// Scene

	var loader = new THREE.SceneLoader();

	loader.onLoadStart = function () { shared.signals.loadItemAdded.dispatch() };
	loader.onLoadComplete = function () { shared.signals.loadItemCompleted.dispatch() };

	function sceneLoaded( result ) {

		var i, l, scene = result.scene;

		hideColliders( scene );
		makeSceneStatic( scene );
		preInitScene( result, shared.renderer );

		scene.scale.set( 0.1, 0.1, 0.1 );
		scene.updateMatrix();
		that.scene.addChild( scene );
		
		if ( scene.collisions ) {
		
			that.scene.collisions.merge( scene.collisions );
			
		}
		
		TriggerUtils.setupCityTriggers( result );

		// fix texture wrapping for skydome
		
		result.objects[ "Backdrop_City" ].materials[ 0 ].map.wrapS = THREE.RepeatWrapping;
		result.objects[ "Backdrop_City" ].materials[ 0 ].map.wrapT = THREE.RepeatWrapping;
		
		// setup custom materials

		var excludeIds = [ "Backdrop_City" ];
		applyCityShader( result, excludeIds, cityMaterialGrassStart, cityMaterialGrassEnd, cityMaterials, CityShader );

		that.scene.update( undefined, true );
		
	};


	if ( !shared.debug ) {

		loader.load( "files/models/city/City.js", sceneLoaded );

	}
	
	var time = 0;
	var last_time = 0;
	var cameraPosition, targetPosition, d;

	this.update = function ( delta, camera, portalsActive ) {
		
		cameraPosition = camera.matrixWorld.getPosition();		

		time += (new Date().getTime() - last_time) / 50000.0;
		last_time = new Date().getTime();
		if( time > 1.0 )
			time = 0.0;
		
		TriggerUtils.effectorRadius = 300;
		TriggerUtils.update();

		targetPosition = camera.target.position;

		updateCityShader( cityMaterialGrassStart, cityMaterialGrassEnd, cityMaterials, cameraPosition, targetPosition, time );
		
		if ( portalsActive ) {
			
			d = portal.distanceTo( cameraPosition );
			
			if ( d < 100 ) {
				
				shared.signals.startexploration.dispatch( "dunes" );

			}
			
		}
		
	};

};


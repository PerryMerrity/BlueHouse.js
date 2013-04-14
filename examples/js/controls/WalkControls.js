/**
 * @author mrdoob / http://mrdoob.com/
 * @author DLar
 */

THREE.WalkControls = function ( camera ) {

	var scope = this;

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 55; //Eye Level
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	
	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();
	var movementX = 0;
	var movementY = 0;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;
	
	var onMouseDown = function ( event ) {

		if ( event.button === 2 ) {

			rotateStart.set( event.clientX, event.clientY );
			document.addEventListener( 'mousemove', onMouseMove, false );

		}

		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseUp = function ( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		movementX -= ( Math.PI * rotateDelta.x / 5000);
		movementY -= ( Math.PI * rotateDelta.y / 4500);

		yawObject.rotation.y -= movementX;
		pitchObject.rotation.x -= movementY;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

		rotateStart.copy( rotateEnd );

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ moveRight = true; break;

			case 27: /*Esc*/
			case 80: /*P*/
				if ( scope.enabled === false ) {
					
					document.getElementById( 'blocker' ).style.display = 'none';
					document.getElementById( 'instructions' ).style.display = 'none';
					
				} else {
					
					document.getElementById( 'instructions' ).innerHTML = '<span style="font-size:50px">Paused</span>'
					document.getElementById( 'blocker' ).style.display = 'block';
					document.getElementById( 'instructions' ).style.display = 'block';
					
				}
				
				scope.enabled = !scope.enabled; break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ moveRight = false; break;

		}

	};

	document.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	document.addEventListener( 'mousedown', onMouseDown, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};
	
	this.getDirection = function () {
		
		return velocity;
		
	};

	this.update = function ( delta ) {

		if ( scope.enabled === false ) return;

		delta *= 0.1;

		velocity.x += ( - velocity.x ) * 0.05 * delta;
		velocity.z += ( - velocity.z ) * 0.05 * delta;

		if ( moveForward ) velocity.z -= 0.1 * delta;
		if ( moveBackward ) velocity.z += 0.1 * delta;

		if ( moveLeft ) velocity.x -= 0.1 * delta;
		if ( moveRight ) velocity.x += 0.1 * delta;

		yawObject.translateX( velocity.x );
		yawObject.translateZ( velocity.z );

		movementX = 0;
		movementY = 0;

	};

};
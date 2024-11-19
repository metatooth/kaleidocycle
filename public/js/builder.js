import * as THREE from "three";

function Builder( object, domElement ) {

    this.object = object;

    this.domElement = ( domElement !== undefined ) ? domElement : document;

    this.tetras = function() {
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [], 3 ) );

	const lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
	const meshMaterial = new THREE.MeshPhongMaterial( { color: 0xff33bb, emissive: 0xff33bb, side: THREE.DoubleSide, flatShading: false } );

	const material = new THREE.LineBasicMaterial( { color: 0x00bbee } );
	const points = [];
	points.push( new THREE.Vector3(0, 3, 0) );
	points.push( new THREE.Vector3(0, -3, 0) );
	const geom = new THREE.BufferGeometry().setFromPoints( points );

	const group = new THREE.Group();
	
	for (let i = 0; i < 2; ++i) {
	    group.add( new THREE.LineSegments( geometry, lineMaterial ) );
	    group.add( new THREE.Mesh( geometry, meshMaterial ) );

	    group.add( new THREE.Line( geom, material ) );
	    
	    group.children[ 3*i ].geometry.dispose();
	    group.children[ 3*i+1 ].geometry.dispose();

	    const tetra = new THREE.TetrahedronGeometry( Math.sqrt(3), 0 );

	    const origin = new THREE.Matrix4().makeTranslation( 0, -1, 0 );
	    tetra.applyMatrix4(origin);  

	    if (i % 2 == 1) {
		const flipMat = new THREE.Matrix4().makeRotationX( Math.PI );   
		tetra.applyMatrix4(flipMat);
            
		const flopMat = new THREE.Matrix4().makeRotationY( Math.PI/2 );   
		tetra.applyMatrix4(flopMat);
	    }
	    
	    group.children[ 3*i ].geometry = new THREE.WireframeGeometry( tetra );
	    group.children[ 3*i+1 ].geometry = tetra;

	}

	return group;
    }
};

export { Builder };

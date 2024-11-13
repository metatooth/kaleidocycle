main = function () {
    const frustum = 1000;
    const aspect = window.innerWidth / window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(frustum * aspect / -2,
                                                frustum * aspect / 2,
                                                frustum / 2,
                                                frustum / -2,
                                                1,
                                                1000);
    camera.lookAt(0, 0, 0);
    camera.zoom = 100;
    camera.updateProjectionMatrix();

    scene.add(camera);

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    const group = new THREE.Group();
    const build = new Builder();

    for (let i = 0; i < 4; i++) {
        const tetras = build.tetras();

        const set_x = new THREE.Matrix4().makeRotationY(Math.PI/4);
        tetras.applyMatrix(set_x);

        const translate = new THREE.Matrix4().makeTranslation(1.155, 0, 0);
        tetras.applyMatrix(translate);

        const rotate = new THREE.Matrix4().makeRotationZ(i * Math.PI/2);
        tetras.applyMatrix(rotate);
        
        group.add(tetras);
    }

    scene.add(group);

    const axes = new THREE.AxesHelper( 10 );
    scene.add( axes );
    
    let stop = false;
    let theta = 0;
    let phi = 0;
    const twist = 0.02; // Math.PI/4;
    const sine = Math.sin(Math.PI/4);
    const dir = new THREE.Vector3(sine, 0, sine);
    
    const animate = function () {
//        setTimeout(() => {
            requestAnimationFrame(animate);
//        }, 5000);
        
        controls.update();

        const next = Math.PI/4*Math.sin(theta);
        const delta = next - phi;
        phi = next;
        
        console.log(`theta ${theta}`);
        console.log(`sin(theta) ${Math.sin(theta)}`);
        console.log(`delta ${delta}`);
        
        const pos_flap = new THREE.Matrix4().makeRotationAxis(dir, - delta);
        const neg_flap = new THREE.Matrix4().makeRotationAxis(dir, delta);

        for (let i = 0; i < 4; i++) {
            group.children[i].children[0].geometry.applyMatrix(pos_flap);
            group.children[i].children[1].geometry.applyMatrix(pos_flap);
            group.children[i].children[2].geometry.applyMatrix(neg_flap);
            group.children[i].children[3].geometry.applyMatrix(neg_flap);
        }
      
        group.children[0].rotation.y -= twist;
        group.children[1].rotation.x += twist;
        group.children[2].rotation.y += twist;
        group.children[3].rotation.x -= twist;

        theta += twist;
        
        renderer.render(scene, camera);
    };

    document.addEventListener('keydown', (e) => {
        console.log(`${e.key} - ${e.keyCode}`);
        
        if (e.keyCode === 83) { // s
	    current += flip * increment;
        }
    });
    
    animate();
};

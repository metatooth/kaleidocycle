const frustumSize = 1000;

main = function () {
  function degrees_to_radians(degrees) {
    const pi = Math.PI;
    return degrees * (pi / 180);
  }

  function radians_to_degrees(radians) {
    const pi = Math.PI;
    return radians * (180 / pi);
  }

  const aspect = window.innerWidth / window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
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

  const r = 1;

  const thirty = degrees_to_radians(30);
  const forty_five = degrees_to_radians(45);
  const sixty = degrees_to_radians(60);
  const ninety = degrees_to_radians(90);
  const one_twenty = degrees_to_radians(120);
  const one_eighty = degrees_to_radians(180);

  const tan_thirty = Math.tan(thirty);
  const sin_sixty = Math.sin(sixty);
  const sin_forty_five = Math.sin(forty_five);

  const s = Math.sqrt(2) * 2 * r * sin_forty_five;

  const h = s * sin_sixty;

  const theta = Math.acos(s / 2 / h);

  console.log(r);
  console.log(s);
  console.log(h);
  console.log(theta);

  const initial = new THREE.Vector3(-sin_forty_five, sin_forty_five, 0);
  const q = new THREE.Quaternion();
  const build = new Builder();

  for (let i = 0; i < 3; i++) {
    const tetras = build.tetras();
    q.setFromAxisAngle(initial, i * one_twenty);

    tetras.starting_rotation = new THREE.Matrix4().makeRotationAxis(initial, i * one_twenty);


    tetras.spin = new THREE.Vector3(0, 0, 1);
    tetras.spin.applyQuaternion(q);

    tetras.applyMatrix(tetras.starting_rotation);


    tetras.translate_to_origin = new THREE.Vector3(tan_thirty, tan_thirty, 0);
    tetras.translate_to_origin.applyQuaternion(q);

    group.add(tetras);
  }

  scene.add(group);

  // const axes = new THREE.AxesHelper( 10 );
  // scene.add( axes );

  let _current = 0;
  let _flip = -1;
  let _stop = false;

  const flap_incr = 0.01;// * spin_incr / ( 2 * Math.PI );
  const spin_incr = 0.01;// theta * flap_incr / ( 2 * Math.PI );

  const animate = function () {
    requestAnimationFrame(animate);

    if (_stop == true) {
	    return;
    }

    controls.update();

    _current += _flip * flap_incr;

    if (_current > theta) {
      _flip *= -1;
    } else if (_current < -theta) {
      _flip *= -1;
    }

    for (let i = 0; i < 3; ++i) {
	    const sub = group.children[i];

	    {
        const flap = new THREE.Vector3(-sin_forty_five, -sin_forty_five, 0);
        const rotation = new THREE.Matrix4().makeRotationAxis(flap, _flip * flap_incr);

        sub.children[0].geometry.applyMatrix(rotation);
        sub.children[1].geometry.applyMatrix(rotation);
	    }

	    {
        const flap = new THREE.Vector3(sin_forty_five, sin_forty_five, 0);
        const rotation = new THREE.Matrix4().makeRotationAxis(flap, _flip * flap_incr);

        sub.children[2].geometry.applyMatrix(rotation);
        sub.children[3].geometry.applyMatrix(rotation);
	    }

	    const forward = new THREE.Matrix4().makeTranslation(sub.translate_to_origin.x, sub.translate_to_origin.y, sub.translate_to_origin.z);
	    const back = new THREE.Matrix4().makeTranslation(-1 * sub.translate_to_origin.x, -1 * sub.translate_to_origin.y, -1 * sub.translate_to_origin.z);

	    const spinner = new THREE.Matrix4().makeRotationAxis(sub.spin, spin_incr);

	    sub.applyMatrix(forward);
	    sub.applyMatrix(spinner);
	    sub.applyMatrix(back);
    }

    // group.rotation.x += 0.01;
    // group.rotation.y += 0.01;

    renderer.render(scene, camera);
  };

  document.addEventListener('keydown', (e) => {
    console.log(e);

    if (e.keyCode == 83) {
	    _stop = !_stop;
    }
  });

  animate();
};

import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

import {Builder} from "./builder.js";

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.object.rotation.x = - Math.PI / 2;
    controls.enablePan = false;
    controls.enableDamping = true;
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
        tetras.applyMatrix4(set_x);

        const translate = new THREE.Matrix4().makeTranslation(2, 0, 0);
        tetras.applyMatrix4(translate);

        const rotate = new THREE.Matrix4().makeRotationZ(i * Math.PI/2);
        tetras.applyMatrix4(rotate);
        
        group.add(tetras);
    }

    scene.add(group);

    /* debug */
    const grid0 = new THREE.GridHelper(5,20);
    scene.add(grid0);
/*
    const grid1 = new THREE.GridHelper(5,20);
    grid1.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI/2));
    scene.add(grid1);

    const grid2 = new THREE.GridHelper(5,20);
    grid2.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
    scene.add(grid2);
*/    
    const axes = new THREE.AxesHelper(2.5);
    scene.add( axes );

    let stop = true;
    let phi = 0;
    let theta = 0;
    let twist = 0.01;
    const sine = Math.sin(Math.PI/4);
    const cosine = Math.cos(Math.PI/4);
    const dir = new THREE.Vector3(cosine, 0, sine);
    
    const animate = function () {
        requestAnimationFrame(animate);
        
        controls.update();

	if (stop === false) {
	    const position = -0.5 * Math.sin(theta);

            const next_phi = Math.PI/4 * Math.sin(theta);
            const delta_phi = next_phi - phi;
            phi = next_phi;
	    
            const pos_flap = new THREE.Matrix4().makeRotationAxis(dir, - delta_phi);
            const neg_flap = new THREE.Matrix4().makeRotationAxis(dir, delta_phi);

            const next_shift = (4 * Math.sin(Math.PI/4) - 2) * Math.sin(theta);

            group.children[0].rotation.y -= twist;
	    group.children[0].position.x = 2 + next_shift;

	    group.children[1].rotation.x += twist;
	    group.children[1].position.y = 2 + next_shift;

            group.children[2].rotation.y += twist;
	    group.children[2].position.x = - (2 + next_shift);

            group.children[3].rotation.x -= twist;	    
	    group.children[3].position.y = - (2 + next_shift);

            theta += twist;

            for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 6; j++) {
		    if (j < 3) {
			group.children[i].children[j].geometry.applyMatrix4(pos_flap);
		    } else {
			group.children[i].children[j].geometry.applyMatrix4(neg_flap);
		    }
		}
	    }

	    //group.position.z = position

        }
	
        renderer.render(scene, camera);
    };
    
    document.addEventListener('keydown', (e) => {
        console.log(`${e.key} - ${e.keyCode}`);

	if (e.keyCode === 83) { // s
	    stop = !stop;
	} else if (e.keyCode === 84) { // t
	    twist *= -1;
	}
    });
    
    animate();


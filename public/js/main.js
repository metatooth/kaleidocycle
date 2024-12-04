import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { Builder } from "./builder.js";

const frustum = 1000;
const aspect = window.innerWidth / window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  (frustum * aspect) / -2,
  (frustum * aspect) / 2,
  frustum / 2,
  frustum / -2,
  1,
  1000,
);
camera.up = new THREE.Vector3(0, 0, 1);
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
//controls.object.rotation.x = -Math.PI / 2;
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 100;
controls.maxDistance = 500;
controls.maxPolarAngle = 2 * Math.PI;

const lights = [];

lights[0] = new THREE.AmbientLight(0xfdfdfd, 0.25);

lights[1] = new THREE.DirectionalLight(0xff33bb, 1.0);
lights[1].position.set(-100, 0, 100);

lights[2] = new THREE.DirectionalLight(0x00bbee, 0.75);
lights[2].position.set(100, 0, 100);

lights[2] = new THREE.DirectionalLight(0xfdfdfd, 1.0);
lights[2].position.set(100, 0, -100);

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);
scene.add(lights[3]);

const group = new THREE.Group();
const build = new Builder();

for (let i = 0; i < 4; i++) {
  const tetras = build.tetras();

  const set_x = new THREE.Matrix4().makeRotationY(Math.PI / 4);
  tetras.applyMatrix4(set_x);

  const translate = new THREE.Matrix4().makeTranslation(2, 0, 0);
  tetras.applyMatrix4(translate);

  const rotate = new THREE.Matrix4().makeRotationZ((i * Math.PI) / 2);
  tetras.applyMatrix4(rotate);

  group.add(tetras);
}

scene.add(group);

/* debug */
const grid0 = new THREE.GridHelper(5, 20);
//scene.add(grid0);
/*
  const grid1 = new THREE.GridHelper(5,20);
  grid1.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI/2));
  scene.add(grid1);

  const grid2 = new THREE.GridHelper(5,20);
  grid2.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2));
  scene.add(grid2);
*/
const axes = new THREE.AxesHelper(2.5);
//scene.add(axes);

let stop = false;

const mean = (2 + 4 * Math.sin(Math.PI / 4)) / 2;
const distance = 4 * Math.sin(Math.PI / 4) - 2;
const half_distance = distance / 2;

const compute_phi = function (theta) {
  return (Math.PI / 4) * Math.cos(theta);
};

let theta = Math.PI / 2;
let phi = 0;
let twist = 0.01;

const flap_dir = new THREE.Vector3(
  Math.cos(Math.PI / 4),
  0,
  Math.cos(Math.PI / 4),
);

const animate = function () {
  requestAnimationFrame(animate);

  controls.update();

  if (stop === false) {
    const shift = mean + half_distance * Math.cos(2 * theta);

    let pos_turn = new THREE.Matrix4().makeRotationY(twist);
    let neg_turn = new THREE.Matrix4().makeRotationY(-twist);

    group.children[0].position.x = 0;
    group.children[0].applyMatrix4(pos_turn);
    group.children[0].position.x = shift;

    group.children[2].position.x = 0;
    group.children[2].applyMatrix4(neg_turn);
    group.children[2].position.x = -shift;

    pos_turn = new THREE.Matrix4().makeRotationX(twist);
    neg_turn = new THREE.Matrix4().makeRotationX(-twist);

    group.children[1].position.y = 0;
    group.children[1].applyMatrix4(neg_turn);
    group.children[1].position.y = shift;

    group.children[3].position.y = 0;
    group.children[3].applyMatrix4(pos_turn);
    group.children[3].position.y = -shift;

    const next_phi = compute_phi(theta);
    const delta_phi = next_phi - phi;
    phi = next_phi;

    const pos_flap = new THREE.Matrix4().makeRotationAxis(flap_dir, delta_phi);
    const neg_flap = new THREE.Matrix4().makeRotationAxis(flap_dir, -delta_phi);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (j < 2) {
          group.children[i].children[j].applyMatrix4(neg_flap);
        } else {
          group.children[i].children[j].applyMatrix4(pos_flap);
        }
      }
    }

    theta += twist;
  }

  renderer.render(scene, camera);
};

document.addEventListener("keydown", (e) => {
  console.log(`${e.key} - ${e.keyCode}`);

  if (e.keyCode === 83) {
    // s
    stop = !stop;
  } else if (e.keyCode === 84) {
    // t
    twist *= -1;
  }
});

animate();

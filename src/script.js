import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/* PARTICLES */
const parameters = {
  size: 0.02,
  number: 200000,
  branches: 6,
  radius: 20,
  rotated: 0.2,
  randomness: 2,
  randomnessPower: 2,
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};
const buildParticles = () => {
  const bufferGeometry = new THREE.BufferGeometry();
  const particlesArray = new Float32Array(parameters.number * 3);
  const colors = new Float32Array(parameters.number * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.number; i++) {
    const i3 = i * 3;

    // POSITION
    const galaxyBranches = ((i % parameters.branches) / parameters.branches) * 2 * Math.PI;
    const radius = Math.random() * parameters.radius;
    const rotate = radius * parameters.rotated;

    const randomY = Math.pow(Math.random() * 1.5, parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomX = Math.pow(Math.random() * 1.5, parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
    const randomZ = Math.pow(Math.random() * 1.5, parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

    particlesArray[i3 + 0] = Math.cos(galaxyBranches + rotate) * radius + randomX;
    particlesArray[i3 + 1] = randomY;
    particlesArray[i3 + 2] = Math.sin(galaxyBranches + rotate) * radius + randomZ;

    // COLOR
    const mixedColor = colorInside.clone().lerp(colorOutside, radius / (parameters.radius / 1.2));

    colors[i3 + 0] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }
  const particlesAttributes = new THREE.BufferAttribute(particlesArray, 3);
  const colorsAttributes = new THREE.BufferAttribute(colors, 3);
  const particlesMaterial = new THREE.PointsMaterial({
    size: parameters.size,
    depthWrite: false,
    sizeAttenuation: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });
  bufferGeometry.setAttribute("position", particlesAttributes);
  bufferGeometry.setAttribute("color", colorsAttributes);
  const points = new THREE.Points(bufferGeometry, particlesMaterial);
  scene.add(points);
};
buildParticles();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

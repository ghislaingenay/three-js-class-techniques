import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const gui = new GUI();
gui.close();
const canvas = document.querySelector<HTMLCanvasElement>("#webgl");
if (!canvas) {
  throw new Error("Canvas element not found");
}

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

let parameters = {
  count: 100000,
  size: 0.02,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.4,
  randomnessPower: 3, // how much the randomness will be applied
  insideColor: "#ff6030",
  outsideColor: "#1b3984",
};

let geometry: THREE.BufferGeometry | null = null;
let material: THREE.PointsMaterial | null = null;
let points: THREE.Points | null = null;

const generateGalaxy = () => {
  // destroy old galaxy
  if (points !== null) {
    geometry?.dispose();
    material?.dispose();
    scene.remove(points);
  }
  geometry = new THREE.BufferGeometry();

  const insideColor = new THREE.Color(parameters.insideColor);
  const outsideColor = new THREE.Color(parameters.outsideColor);
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameters.radius;
    const branchIndex = i % parameters.branches;
    const branchAngle = (branchIndex / parameters.branches) * Math.PI * 2;
    // const branchAngleRandomize = branchAngle + (Math.random() - 0.5) * 0.1;
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? -1 : 1) *
      parameters.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? -1 : 1) *
      parameters.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? -1 : 1) *
      parameters.randomness *
      radius;

    const spinAngle = radius * parameters.spin; // more radius => more spin
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    // positions[i3] = (Math.random() - 0.5) * 10;
    // positions[i3 + 1] = (Math.random() - 0.5) * 10;
    // positions[i3 + 2] = (Math.random() - 0.5) * 10;

    // one further from the center will have to move faster

    // Color
    // Create third color based on the radius
    const mixedColor = insideColor.clone();
    // Use .lerp to mix the inside and outside colors based on the radius
    mixedColor.lerp(outsideColor, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  material = new THREE.PointsMaterial({
    size: parameters.size,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  points = new THREE.Points(geometry, material);

  scene.add(points);
};
generateGalaxy();

gui
  .add(parameters, "count")
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "spin")
  .min(-5)
  .max(5)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .add(parameters, "randomnessPower")
  .min(0)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);

gui
  .addColor(parameters, "insideColor")

  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);
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
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
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
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // move the camera around the center
  camera.position.x = Math.cos(elapsedTime * 0.1) * 3;
  camera.position.z = Math.sin(elapsedTime * 0.1) * 3;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

export default tick;

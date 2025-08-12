import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { texture } from "three/tsl";
import gsap from "gsap";

const gui = new GUI();
gui.close(); // Close the GUI by default
const canvas = document.querySelector<HTMLCanvasElement>("#webgl");
if (!canvas) {
  throw new Error("Canvas element not found");
}

// Scene
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
const bakedShadow = textureLoader.load("/shadow/bakedShadow.jpg");
bakedShadow.colorSpace = THREE.SRGBColorSpace;

const simpleShadow = textureLoader.load("/shadow/simpleShadow.jpg");

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
gui
  .add(ambientLight, "intensity")
  .min(0)
  .max(3)
  .step(0.001)
  .name("Ambient Light Intensity");
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(2, 2, -1);
gui.add(directionalLight, "intensity").min(0).max(3).step(0.001);
gui
  .add(directionalLight.position, "x")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Dir Light X");
gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Dir Light Y");
gui
  .add(directionalLight.position, "z")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("Dir Light Z");
scene.add(directionalLight);

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
// amplitude of the shadow => needs to fit the scene

// camera frame of the shadow directional light
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;

// directionalLight.shadow.radius = 10;
// shadow map algorithm

// Spot light
const pointLight = new THREE.SpotLight(0xffffff, 2.7);
pointLight.castShadow = true;
pointLight.position.set(-1, 1, 0);
pointLight.shadow.mapSize.set(1024, 1024);
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 5;
scene.add(pointLight);

// Positions of last 6 renders
const pointLightHelper = new THREE.SpotLightHelper(pointLight); // Helper to visualize the spot light
pointLightHelper.visible = false;
scene.add(pointLightHelper);

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.7;
gui.add(material, "metalness").min(0).max(1).step(0.001);
gui.add(material, "roughness").min(0).max(1).step(0.001);

/**
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.castShadow = true;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.5;
plane.receiveShadow = true;

scene.add(sphere, plane);
const sphereShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 1.5),
  new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    alphaMap: simpleShadow,
  })
);
sphereShadow.rotation.x = -Math.PI * 0.5;
sphereShadow.position.y = plane.position.y + 0.01; // Slightly above the plane to avoid z-fighting
scene.add(sphereShadow);

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
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
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
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // or THREE.VSMShadowMap for VSM shadows

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update sphere
  sphere.position.x = Math.sin(elapsedTime) * 1.5;
  sphere.position.z = Math.cos(elapsedTime) * 1.5;
  sphere.position.y = Math.abs(Math.sin(elapsedTime) + 0.5);

  // update shadow position
  sphereShadow.position.x = sphere.position.x;
  sphereShadow.position.z = sphere.position.z;
  gsap.to(sphereShadow.material, {
    duration: 0.5,
    opacity: Math.max(0, 1 - sphere.position.y * 2), // Fade out shadow as sphere goes up
    ease: "power2.out",
  });
  // OR
  // sphereShadow.material.opacity = Math.max(0, 1 - sphere.position.y * 2);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

export default tick;

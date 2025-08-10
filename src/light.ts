import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";

const gui = new GUI();
const canvas = document.querySelector<HTMLCanvasElement>("#webgl");
if (!canvas) {
  throw new Error("Canvas element not found");
}

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// Ambient light
// Omnidirectional light that affects all objects in the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
ambientLight.name = "Ambient Light";
gui
  .add(ambientLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Ambient Light Intensity");
gui.addColor(ambientLight, "color").name("Ambient Light Color");
scene.add(ambientLight);

// Directional light
// Simulates sunlight, casting shadows and illuminating objects in a specific direction
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.5);
directionalLight.name = "Directional Light";
scene.add(directionalLight);
directionalLight.position.set(1, 0.25, 0);
gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Directional Light Intensity");
gui.addColor(directionalLight, "color").name("Directional Light Color");
// Directional light helper
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  0.2
);
directionalLightHelper.name = "Directional Light Helper";
scene.add(directionalLightHelper);

// Hemisphere light
// Generates light from two hemispheres, one for the sky and one for the ground
// Simulates the sky and ground light, providing a gradient effect
const HemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
HemisphereLight.name = "Hemisphere Light";
scene.add(HemisphereLight);

// Point light
// Emits light in all directions from a single point, similar to a light bulb
const pointLight = new THREE.PointLight(0xff9000, 0.5);
pointLight.name = "Point Light";
pointLight.position.y = 1;
pointLight.distance = 0; // Set to 0 for infinite range
pointLight.decay = 2; // How quickly the light fades with distance
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
pointLightHelper.name = "Point Light Helper";
scene.add(pointLightHelper);
scene.add(pointLight);

// RectArea light
// WOrks like a big rectangle lights you can see on the photoshoot set.
// Mix between directional light AND diffuse light

// works only with MeshStandardMaterial and MeshPhysicalMaterial
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.name = "Rect Area Light";
// helper
rectAreaLight.castShadow = true;
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
rectAreaLightHelper.name = "Rect Area Light Helper";
scene.add(rectAreaLight);
scene.add(rectAreaLightHelper);

// SpotLight
// Emits a cone of light, useful for simulating spotlights
const spotLight = new THREE.SpotLight("purple", 0.5);
spotLight.name = "Spot Light";
spotLight.target.position.x = -0.75;
spotLight.castShadow = true; // Enable shadow casting
spotLight.position.z = 0;
spotLight.angle = Math.PI * 0.1; // Angle of the spotlight cone
spotLight.penumbra = 0.2; // Softness of the edge of the spotlight cone
spotLight.decay = 1; // How quickly the light fades with distance
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
spotLightHelper.name = "Spot Light Helper";
scene.add(spotLightHelper);
scene.add(spotLight);
/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
);
torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube, torus, plane);

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

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  sphere.rotation.y = 0.1 * elapsedTime;
  cube.rotation.y = 0.1 * elapsedTime;
  torus.rotation.y = 0.1 * elapsedTime;

  sphere.rotation.x = 0.15 * elapsedTime;
  cube.rotation.x = 0.15 * elapsedTime;
  torus.rotation.x = 0.15 * elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

export default tick;

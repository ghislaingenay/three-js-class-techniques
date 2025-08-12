import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const gui = new GUI();
const canvas = document.querySelector<HTMLCanvasElement>("#webgl");
if (!canvas) {
  throw new Error("Canvas element not found");
}

// Scene
const scene = new THREE.Scene();

/**
 * House
 */
// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial()
);
floor.rotation.x = -Math.PI * 0.5; // Rotate the floor to be horizontal
scene.add(floor);

// House container
const house = new THREE.Group();
scene.add(house);

// House walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial()
);
walls.position.y += 1.25; // Position the walls above the floor
house.add(walls);

// No pyramid standard geometry in Three.js, so we create a custom geometry => Cone
//  radialSegments to 4 creates a cone with 4 sides, which is a pyramid with a square base.
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 2, 4),
  new THREE.MeshStandardMaterial()
);
roof.position.y = 2.5 + 0.75; // Position the roof above the walls
roof.rotation.y = Math.PI * 0.25; // Rotate the roof to align with
house.add(roof);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2),
  new THREE.MeshStandardMaterial()
);
door.position.y = 1 + 0.01;
door.position.z = 2 + 0.01; // Position the door in front of the house
house.add(door);

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial();

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(1, 0.5, 2.5);
house.add(bush1);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.65, 0.65, 0.65);
bush2.position.set(-1.8, 0.1, 2.1);
house.add(bush2);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(1.8, 0.3, 2.3);
house.add(bush3);

// Graves
const graveGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial();

const graves = new THREE.Group();
scene.add(graves);

for (let i = 0; i < 30; i++) {
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  // Place around the house => Trigonometric functions
  const angle = Math.random() * Math.PI * 2; // Random angle
  const radius = 4 + Math.random() * 5; // Random distance from the house
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const y = Math.random() * 0.4; // Random height variation
  grave.position.set(x, y, z);
  const ROTATION_FACTOR = 0.4;
  grave.rotation.set(
    ROTATION_FACTOR * (Math.random() - 0.5),
    ROTATION_FACTOR * (Math.random() - 0.5),
    ROTATION_FACTOR * (Math.random() - 0.5)
  ); // Random rotation
  graves.add(grave);
}

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#ffffff", 1.5);
directionalLight.position.set(3, 2, -8);
scene.add(directionalLight);

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
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
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
const timer = new THREE.Timer();

const tick = () => {
  // Timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

export default tick;

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
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

const particuleGeometry = new THREE.BufferGeometry();
const count = 1000;
const positions = new Float32Array(count * 3); // (x,y,z)
const colors = new Float32Array(count * 3); // (x,y,z)
const particuleMaterial = new THREE.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true,
});

particuleMaterial.size = 0.1;
// particuleMaterial.color = new THREE.Color("#ff88cc");

const particleTexture = textureLoader.load("/particle/2.png");
particleTexture.colorSpace = THREE.SRGBColorSpace;

particuleMaterial.transparent = true;
particuleMaterial.alphaMap = particleTexture;

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshBasicMaterial()
);
// scene.add(cube);

particuleMaterial.depthWrite = false; // ask not to write
// particuleMaterial.alphaTest = 0.001; // btw 0 and 1 => enqbles the WebGL to know when not to render the pixel according to that's pixel transparency
// default 0 => pixel will be rendred anyway
// if small value === 0.001 => pixel won't be rendered if the alpha is 0
// particuleMaterial.depthTest = false; // when drawinf, webGL tests if what's being drawn is closer than whas's aready draws
// deactivate depthTest might create bugs if you have other objects in your scene

particuleMaterial.blending = THREE.AdditiveBlending;
for (let i = 0; i < count * 500; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
  colors[i] = Math.random();
}

particuleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
particuleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

particuleMaterial.vertexColors = true;

const particules = new THREE.Points(particuleGeometry, particuleMaterial);

scene.add(particules);
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

  for (let i = 0; i < count; i++) {
    const tripleI = i * 3;

    const x = particuleGeometry.attributes.position.array[tripleI];

    particuleGeometry.attributes.position.array[tripleI + 1] = Math.sin(
      elapsedTime + x
    );
    particuleGeometry.attributes.position.needsUpdate = true;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
export default tick;

// particuleMaterial.alphaTest = 0.001;
// What it does: Sets a threshold for pixel transparency rendering.

// Range: 0 to 1
// Default: 0 (renders all pixels regardless of transparency)
// When set to 0.001: Pixels with alpha < 0.001 won't be rendered at all

// Why use it:

// Eliminates completely transparent pixels from rendering
// Improves performance by skipping invisible pixels
// Reduces visual artifacts from transparent edges
// Better than depthTest = false because it doesn't break depth sorting

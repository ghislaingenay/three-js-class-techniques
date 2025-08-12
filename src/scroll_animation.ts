import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";

const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
  objectDistance: 4,
  particleCount: 1000,
};

const canvas = document.querySelector<HTMLCanvasElement>("#webgl");
if (!canvas) {
  throw new Error("Canvas element not found");
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load(
  "/scroll_animation/textures/gradients/3.jpg"
);
gradientTexture.magFilter = THREE.NearestFilter;

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
);
scene.add(mesh1, mesh2, mesh3);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const changeMeshYPositions = () => {
  mesh1.position.y = -parameters.objectDistance * 0;
  mesh2.position.y = -parameters.objectDistance * 1;
  mesh3.position.y = -parameters.objectDistance * 2;
};

changeMeshYPositions();
mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;

const sectionMeshes = [mesh1, mesh2, mesh3];

/**
 * Cursor
 */
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
});

gui
  .add(parameters, "objectDistance")
  .min(1)
  .max(5)
  .step(0.1)
  .onFinishChange(changeMeshYPositions);

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
 * Particules
 */
const particleCount = 1000;
const vertices = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
  const i3 = i * 3;
  vertices[i3] = (Math.random() - 0.5) * 10;
  vertices[i3 + 1] =
    parameters.objectDistance * 0.5 -
    Math.random() * parameters.objectDistance * sectionMeshes.length;
  vertices[i3 + 2] = (Math.random() - 0.5) * 10;
}

const paticleGeometry = new THREE.BufferGeometry();
paticleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(vertices, 3)
);

const paticleMaterial = new THREE.PointsMaterial({
  size: 0.03,
  sizeAttenuation: true,
  color: parameters.materialColor,
});
const particles = new THREE.Points(paticleGeometry, paticleMaterial);
scene.add(particles);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35, // Field of view is vertical
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
scene.add(camera);

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  paticleMaterial.color.set(parameters.materialColor);
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, // Enable transparency
});
renderer.setClearAlpha(0); // Set clear color to transparent
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll Animation
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height); // cut at 0.5
  if (newSection !== currentSection) {
    currentSection = newSection;
    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1,
      x: "+=6",
      y: "+=3",
      ease: "power2.inOut",
      z: "+=1.5",
    });
  }
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * parameters.objectDistance;

  // Parallax effect
  const parallaxX = cursor.x * 0.5;
  const parallaxY = cursor.y * 0.5;
  camera.position.x += (parallaxX - camera.position.x) * 2 * deltaTime;
  camera.position.y += (parallaxY - camera.position.y) * 2 * deltaTime;

  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1;
    mesh.rotation.y += deltaTime * 0.12;
  }
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

export default tick;

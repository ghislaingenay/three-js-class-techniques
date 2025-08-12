import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/examples/jsm/Addons.js";

const gui = new GUI();
gui.close(); // Close the GUI to avoid cluttering the console
const canvas = document.querySelector<HTMLCanvasElement>("#webgl");
if (!canvas) {
  throw new Error("Canvas element not found");
}

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */

const FILE_TEXTURE_FLOOR_PATH = "/haunted/floor/aerial_rocks_01_1k/textures/";
const loaderManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loaderManager);
const floorAlphaTexture = textureLoader.load("/haunted/floor/alpha.jpg");

const floorColorTexture = textureLoader.load(
  FILE_TEXTURE_FLOOR_PATH + "aerial_rocks_01_diff_1k.jpg"
);
floorColorTexture.colorSpace = THREE.SRGBColorSpace; // Set color space to sRGB
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorColorTexture.wrapT = THREE.RepeatWrapping;
floorColorTexture.repeat.set(8, 8); // Repeat the texture 8 times in

const floorARMTexture = textureLoader.load(
  FILE_TEXTURE_FLOOR_PATH + "aerial_rocks_01_arm_1k.jpg"
);
floorARMTexture.wrapS = THREE.RepeatWrapping;
floorARMTexture.wrapT = THREE.RepeatWrapping;
floorARMTexture.repeat.set(8, 8); // Repeat the texture 8 times in
const floorNormalTexture = textureLoader.load(
  FILE_TEXTURE_FLOOR_PATH + "aerial_rocks_01_nor_gl_1k.jpg"
);
floorNormalTexture.wrapS = THREE.RepeatWrapping;
floorNormalTexture.wrapT = THREE.RepeatWrapping;
floorNormalTexture.repeat.set(8, 8); // Repeat the texture 8 times in
const floorDisplacementTexture = textureLoader.load(
  FILE_TEXTURE_FLOOR_PATH + "aerial_rocks_01_disp_1k.jpg"
);
floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
floorDisplacementTexture.wrapT = THREE.RepeatWrapping;
floorDisplacementTexture.repeat.set(8, 8); // Repeat the texture 8 times

// helpers to check files
loaderManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  console.log(`Loading: ${url}, Loaded: ${itemsLoaded}/${itemsTotal}`);
};

/**
 * House
 */
// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20, 100, 100),
  new THREE.MeshStandardMaterial({
    transparent: true, // needs to be true for alphaMap to work
    alphaMap: floorAlphaTexture,
    map: floorColorTexture,
    aoMap: floorARMTexture,
    metalnessMap: floorARMTexture,
    normalMap: floorNormalTexture,
    displacementMap: floorDisplacementTexture, // displacement map for height => needs vertex displacement
    displacementScale: 0.2,
    displacementBias: -0.05, // to adjust the height
  })
);

gui
  .add(floor.material, "displacementScale")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Displacement Scale");
gui
  .add(floor.material, "displacementBias")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("Bias Displacement");
floor.rotation.x = -Math.PI * 0.5; // Rotate the floor to be horizontal
scene.add(floor);

// House container
const house = new THREE.Group();
scene.add(house);

const FILE_TEXTURE_WALL_PATH = "/haunted/wall/dark_brick_wall_1k/textures/";

const wallColorTexture = textureLoader.load(
  FILE_TEXTURE_WALL_PATH + "dark_brick_wall_diff_1k.jpg"
);
wallColorTexture.colorSpace = THREE.SRGBColorSpace; // Set color space to sRGB
wallColorTexture.wrapS = THREE.RepeatWrapping;
wallColorTexture.wrapT = THREE.RepeatWrapping;
wallColorTexture.repeat.set(4, 4); // Repeat the texture 4 times in

const wallNormalTexture = textureLoader.load(
  FILE_TEXTURE_WALL_PATH + "dark_brick_wall_nor_gl_1k.jpg"
);
wallNormalTexture.wrapS = THREE.RepeatWrapping;
wallNormalTexture.wrapT = THREE.RepeatWrapping;
wallNormalTexture.repeat.set(4, 4); // Repeat the texture 4 times in

const wallARMTexture = textureLoader.load(
  FILE_TEXTURE_WALL_PATH + "dark_brick_wall_arm_1k.jpg"
);
wallARMTexture.wrapS = THREE.RepeatWrapping;
wallARMTexture.wrapT = THREE.RepeatWrapping;
wallARMTexture.repeat.set(4, 4); // Repeat the texture 4 times in

// House walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    normalMap: wallNormalTexture,
    aoMap: wallARMTexture,
    roughnessMap: wallARMTexture,
    metalnessMap: wallARMTexture,
  })
);
walls.position.y += 1.25; // Position the walls above the floor
house.add(walls);

const FILE_TEXTURE_ROOF_PATH = "/haunted/roof/reed_roof_04_1k/textures/";

const roofColorTexture = textureLoader.load(
  FILE_TEXTURE_ROOF_PATH + "reed_roof_04_diff_1k.jpg"
);

roofColorTexture.colorSpace = THREE.SRGBColorSpace; // Set color space to sRGB
// unless repeat.y is higher thn one, no need to repeat the texture
// roofColorTexture.repeat.set(1, 3);
// roofColorTexture.wrapS = THREE.RepeatWrapping;

const roofNormalTexture = textureLoader.load(
  FILE_TEXTURE_ROOF_PATH + "reed_roof_04_nor_gl_1k.jpg"
);
roofNormalTexture.repeat.set(1, 3);
roofNormalTexture.wrapS = THREE.RepeatWrapping;

const roofARMTexture = textureLoader.load(
  FILE_TEXTURE_ROOF_PATH + "reed_roof_04_arm_1k.jpg"
);

// roofARMTexture.repeat.set(1, 3);
// roofARMTexture.wrapS = THREE.RepeatWrapping;

// No pyramid standard geometry in Three.js, so we create a custom geometry => Cone
//  radialSegments to 4 creates a cone with 4 sides, which is a pyramid with a square base.
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 2, 4),
  new THREE.MeshStandardMaterial({
    map: roofColorTexture,
    normalMap: roofNormalTexture,
    aoMap: roofARMTexture,
    roughnessMap: roofARMTexture,
    metalnessMap: roofARMTexture,
  })
);
roof.position.y = 2.5 + 0.75; // Position the roof above the walls
roof.rotation.y = Math.PI * 0.25; // Rotate the roof to align with
house.add(roof);

const FILE_PATH_DOOR_TEXTURE = "/haunted/door/";

const doorColorTexture = textureLoader.load(
  FILE_PATH_DOOR_TEXTURE + "color.jpg"
);
doorColorTexture.colorSpace = THREE.SRGBColorSpace; // Set color space to sRGB

const doorNormalTexture = textureLoader.load(
  FILE_PATH_DOOR_TEXTURE + "normal.jpg"
);

const doorAlphaTexture = textureLoader.load(
  FILE_PATH_DOOR_TEXTURE + "alpha.jpg"
);

const doorAmbientOcclusionTexture = textureLoader.load(
  FILE_PATH_DOOR_TEXTURE + "ambientOcclusion.jpg"
);

const doorMetalnessTexture = textureLoader.load(
  FILE_PATH_DOOR_TEXTURE + "metalness.jpg"
);

const doorRoughnessTexture = textureLoader.load(
  FILE_PATH_DOOR_TEXTURE + "roughness.jpg"
);

const doorHeightTexture = textureLoader.load(
  FILE_PATH_DOOR_TEXTURE + "height.jpg"
);

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
  new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true, // needs to be true for alphaMap to work
    normalMap: doorNormalTexture,
    alphaMap: doorAlphaTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    displacementBias: -0.05, // to adjust the height
    aoMap: doorAmbientOcclusionTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
);
door.position.y = 1 + 0.01;
door.position.z = 2 + 0.01; // Position the door in front of the house
house.add(door);

const FILE_PATH_BUSH_TEXTURE =
  "/haunted/bush/leaves_forest_ground_1k/textures/";

const bushColorTexture = textureLoader.load(
  FILE_PATH_BUSH_TEXTURE + "leaves_forest_ground_diff_1k.jpg"
);
bushColorTexture.colorSpace = THREE.SRGBColorSpace; // Set color space to sRGB
bushColorTexture.wrapS = THREE.RepeatWrapping;
bushColorTexture.repeat.set(2, 1); // Repeat the texture 2 times in X and 1 time in Y

const bushNormalTexture = textureLoader.load(
  FILE_PATH_BUSH_TEXTURE + "leaves_forest_ground_nor_gl_1k.jpg"
);
bushNormalTexture.wrapS = THREE.RepeatWrapping;
bushNormalTexture.repeat.set(2, 1); // Repeat the texture 2 times in X and 1 time in Y

const bushARMTexture = textureLoader.load(
  FILE_PATH_BUSH_TEXTURE + "leaves_forest_ground_arm_1k.jpg"
);
bushARMTexture.wrapS = THREE.RepeatWrapping;
bushARMTexture.repeat.set(2, 1); // Repeat the texture 2 times in X and 1 time in Y

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({
  map: bushColorTexture,
  normalMap: bushNormalTexture,
  aoMap: bushARMTexture,
  color: "#ccffcc", // White color to let the texture show
  roughnessMap: bushARMTexture,
  metalnessMap: bushARMTexture,
});

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.5, 0.5, 0.5);
bush1.position.set(1, 0.5, 2.5);
bush1.rotation.x = -0.75;
house.add(bush1);

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.65, 0.65, 0.65);
bush2.position.set(-1.8, 0.1, 2.1);
bush2.rotation.x = -0.75;

house.add(bush2);

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
bush3.scale.set(0.4, 0.4, 0.4);
bush3.position.set(1.8, 0.3, 2.3);
bush3.rotation.x = -0.75;

house.add(bush3);

const FILE_PATH_GRAVE_TEXTURE =
  "/haunted/grave/gravel_embedded_concrete_1k/textures/";

const graveColorTexture = textureLoader.load(
  FILE_PATH_GRAVE_TEXTURE + "gravel_embedded_concrete_diff_1k.jpg"
);
graveColorTexture.colorSpace = THREE.SRGBColorSpace; // Set color space to sRGB
graveColorTexture.repeat.set(0.3, 0.3); // Repeat the texture 0.3 times in X and Y
const graveNormalTexture = textureLoader.load(
  FILE_PATH_GRAVE_TEXTURE + "gravel_embedded_concrete_nor_gl_1k.jpg"
);
graveNormalTexture.repeat.set(0.3, 0.3); // Repeat the texture 0.3 times in X and Y
const graveARMTexture = textureLoader.load(
  FILE_PATH_GRAVE_TEXTURE + "gravel_embedded_concrete_arm_1k.jpg"
);
graveARMTexture.repeat.set(0.3, 0.3); // Repeat the texture

// Graves
const graveGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
  normalMap: graveNormalTexture,
  map: graveColorTexture,
  aoMap: graveARMTexture,
  roughnessMap: graveARMTexture,
  metalnessMap: graveARMTexture,
  color: "#cccccc", // Light gray color to let the texture show
});

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
const ambientLight = new THREE.AmbientLight("#86cdff", 0.275);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#86cdff", 0.7);
directionalLight.position.set(3, 2, -8);
scene.add(directionalLight);

// Door Light
const doorLight = new THREE.PointLight("#ff7d46", 0.5, 4);
doorLight.position.set(0, 2.2, 2.25); // Position the light slightly in front of the door
house.add(doorLight);

// Ghosts
const ghost1 = new THREE.PointLight("#8800ff", 6);
const ghost2 = new THREE.PointLight("#ff0088", 6);
const ghost3 = new THREE.PointLight("#ff0000", 6);
ghost1.castShadow = true; // Enable shadow casting for the ghost
ghost2.castShadow = true; // Enable shadow casting for the ghost
ghost3.castShadow = true; // Enable shadow casting for the ghost
ghost1.shadow.mapSize.set(256, 256); // Set the shadow map size for the ghost
ghost2.shadow.mapSize.set(256, 256); // Set the shadow map size for the ghost
ghost3.shadow.mapSize.set(256, 256); // Set the

// no need for the door => doesn't make a huge difference => removed for improved performance
walls.receiveShadow = true;
walls.castShadow = true;
roof.castShadow = true;
floor.receiveShadow = true;
scene.add(ghost1, ghost2, ghost3);

for (const grave of graves.children) {
  grave.castShadow = true; // Enable shadow casting for the graves
  grave.receiveShadow = true; // Enable shadow receiving for the graves
}

// Mapping
// Optimize shadow map and make sure that fit the scene nicely
directionalLight.shadow.mapSize.set(256, 256); // Set the shadow
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;

for (const ghost of [ghost1, ghost2, ghost3]) {
  ghost.shadow.mapSize.set(256, 256);
  ghost.shadow.camera.far = 10; // Set the far plane for the shadow camera
}

/**
 * Skybox
 */
const sky = new Sky();
// Atmospheric scattering parameters for realistic sky rendering
sky.material.uniforms["turbidity"].value = 10; // Atmospheric haze/pollution (1-20, higher = hazier/more polluted sky)
sky.material.uniforms["rayleigh"].value = 2; // Blue light scattering (0-4, higher = more blue sky)
sky.material.uniforms["mieCoefficient"].value = 0.005; // Particle scattering for clouds/fog (0-0.1, higher = more hazy)
sky.material.uniforms["mieDirectionalG"].value = 0.8; // Sun glow intensity (-1 to 1, higher = brighter sun halo)
sky.material.uniforms["sunPosition"].value.set(0.3, -0.038, -0.95); // Position of the sun in the sky
// sky.scale.setScalar(450000); // Scale the skybox to cover the entire scene
sky.scale.setScalar(450000); // Scale the skybox to cover the entire scene

scene.add(sky);

/**
 * Fog
 */
// scene.fog = new THREE.Fog("#ff0000", 1, 13);
scene.fog = new THREE.FogExp2("#04343f", 0.07); // the further away the object is, the more fog it will have

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
renderer.shadowMap.enabled = true; // Enable shadow map
/**
 * Animate
 */
const timer = new THREE.Timer();

const handleGhostPosition = (
  ghost: THREE.PointLight,
  radius = 4,
  direction = 1,
  frequency = 0.5
) => {
  const elapsedTime = timer.getElapsed();
  const angle = direction * elapsedTime * frequency;
  ghost.position.x = Math.cos(angle * 0.5) * radius;
  ghost.position.z = Math.sin(angle * 0.5) * radius;
  ghost.position.y =
    Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45) + 1.5; // Add some vertical movement
};

const tick = () => {
  // Timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  handleGhostPosition(ghost1, 4);
  handleGhostPosition(ghost2, 5, -1);
  handleGhostPosition(ghost2, 5, -1, 0.33);
  // const ghost1Angle = elapsedTime * 0.5;
  // ghost1.position.x = Math.cos(ghost1Angle * 0.5) * 4;
  // ghost1.position.z = Math.sin(ghost1Angle * 0.5) * 4;

  // ghost1.position.y =
  //   Math.sin(ghost1Angle) *
  //     Math.sin(ghost1Angle * 2.34) *
  //     Math.sin(ghost1Angle * 3.45) +
  //   1.5; // Add some vertical movement

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

export default tick;

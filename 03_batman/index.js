const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  50000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 800;

const directionalLight = new THREE.DirectionalLight(0xffccaa, 3);
directionalLight.position.set(0, 0, -1);
scene.add(directionalLight);

const circleGeo = new THREE.CircleGeometry(250, 50);
const circleMat = new THREE.MeshBasicMaterial({ color: 0xffccaa });
const circle = new THREE.Mesh(circleGeo, circleMat);
circle.position.set(0, 0, -500);
circle.scale.setX(1.2);
scene.add(circle);

const loader = new THREE.GLTFLoader();
let bat;
loader.load('scene.gltf', (gltf) => {
  bat = gltf.scene.children[0];
  bat.scale.set(80, 80, 80);
  bat.position.set(140, -100, 50);
  scene.add(gltf.scene);
  animate();
});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();

const godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, circle, {
  resolutionScale: 1,
  density: 0.8,
  decay: 0.9,
  weight: 0.9,
  samples: 100,
});

const renderPass = new POSTPROCESSING.RenderPass(scene, camera);

const areaImage = new Image();
areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
const searchImage = new Image();
searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
const smmaEffect = new POSTPROCESSING.SMAAEffect(searchImage, areaImage, 1);
const effectPass = new POSTPROCESSING.EffectPass(
  camera,
  smmaEffect,
  godraysEffect
);
effectPass.renderToScreen = true;

const composer = new POSTPROCESSING.EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(effectPass);

const animate = () => {
  composer.render(0.1);
  requestAnimationFrame(animate);
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

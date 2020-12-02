const cloudParticles = [];
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.z = 1;
camera.rotation.x = 1.16;
camera.rotation.y = -0.12;
camera.rotation.z = 0.27;

const ambient = new THREE.AmbientLight(0x555555);
scene.add(ambient);

const directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer();
scene.fog = new THREE.FogExp2(0x11111f, 0.00002);

renderer.setClearColor(scene.fog.color);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
loader.load('smoke.png', (texture) => {
  const cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
  });

  for (let p = 0; p < 25; p++) {
    const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
    cloud.position.set(
      Math.random() * 800 - 400,
      500,
      Math.random() * 500 - 450
    );
    cloud.rotation.x = 1.16;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random() * 360;
    cloud.material.opacity = 0.6;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
  animate();
});

const flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
flash.position.set(200, 300, 100);
scene.add(flash);

const animate = () => {
  cloudParticles.forEach((p) => {
    p.rotation.z -= 0.002;
  });

  if (Math.random() > 0.93 || flash.power > 100) {
    if (flash.power < 100) {
      flash.position.set(Math.random() * 400, 300 + Math.random() * 200, 100);
    }
    flash.power = 50 + Math.random() * 500;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// window.addEventListener('mousemove', (e) => {
//   camera.position.x = e.x / 10;
//   camera.position.y = e.y / 10;
// });

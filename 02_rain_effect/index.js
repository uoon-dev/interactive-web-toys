const cloudParticles = [];
const rainCount = 15000;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
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

const renderer = new THREE.WebGLRenderer();
// // const controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.update();

// camera.lookAt(controls.target);

const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);

const directionalLight = new THREE.DirectionalLight(0x522b04);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

scene.fog = new THREE.FogExp2(0x11111f, 0.00002);

renderer.setClearColor(scene.fog.color);
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();

loader.load('light_cloud.png', (texture) => {
  const cloudGeo = new THREE.PlaneBufferGeometry(700, 700);
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
    // console.log(cloud.position);
    cloud.rotation.x = 1.16;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random() * 360;
    cloud.material.opacity = 0.6;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
  animate();
});

const imgLoader = new THREE.TextureLoader();

imgLoader.load('shine.jpeg', (image) => {
  const imgGeo = new THREE.PlaneGeometry(11, 10 * 0.75);
  const imgMaterial = new THREE.MeshLambertMaterial({
    map: image,
    transparent: true,
  });

  imgMaterial.opacity = 0.95;

  const imgMesh = new THREE.Mesh(imgGeo, imgMaterial);
  imgMesh.position.set(50.00261553895746, 420, -171.3866390197795);
  imgMesh.scale.set(40, 40, 40);
  imgMesh.rotation.set(1.16, -0.12, 0.32);
  scene.add(imgMesh);
});

const flash = new THREE.PointLight(0x87ceeb, 10, 300, 1.7);
flash.position.set(200, 300, 400);
scene.add(flash);

const rainGeo = new THREE.Geometry();
const rainSprite = new THREE.TextureLoader().load('snow.png');
// const rainGeo = new THREE.CircleGeometry(1000, 1000);

for (let i = 0; i < rainCount; i++) {
  rainDrop = new THREE.Vector3(
    Math.random() * 400 - 200,
    Math.random() * 500 - 250,
    Math.random() * 400 - 200
  );
  rainDrop.velocity = {};
  rainDrop.velocity = 0;
  rainGeo.vertices.push(rainDrop);
}

const rainMaterial = new THREE.PointsMaterial({
  map: rainSprite,
  color: 0xffffff,
  size: 0.3,
  transparent: true,
});

const rain = new THREE.Points(rainGeo, rainMaterial);
scene.add(rain);

const animate = () => {
  cloudParticles.forEach((p) => {
    p.rotation.z -= 0.002;
  });

  if (Math.random() > 0.97 || flash.power > 80) {
    if (flash.power < 80) {
      flash.position.set(Math.random() * 400, 300 + Math.random() * 200, 100);
    }
    flash.power = 3 + Math.random() * 30;
  }

  rainGeo.vertices.forEach((p) => {
    p.velocity -= 0.001 + Math.random() * 0.0001;
    p.y += p.velocity;
    if (p.y < -200) {
      p.y = 200;
      p.velocity = 0;
    }
  });
  rainGeo.verticesNeedUpdate = true;
  rain.rotation.y += 0.002;

  requestAnimationFrame(animate);
  // controls.update();
  renderer.render(scene, camera);
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (e) => {
  camera.position.x = e.x / 100 - 1.16;
  // camera.position.y = e.y / 1000 + 0.02;
  camera.position.z = e.y / 100 + 0.02;
});

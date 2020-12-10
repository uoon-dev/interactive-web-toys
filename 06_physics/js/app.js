import * as THREE from 'three';
import * as CANNON from 'cannon';
import '../style.scss';

import jokerImage from '../joker.jpg';
// import leafImage from '../red-leaf.png';
import batmanImage from '../batman_joker.jpg';

let OrbitControls = require('three-orbit-controls')(THREE);

const book = document.querySelector('.book');
const whyImgWrapper = document.querySelector('.why-img-wrapper');
const audioSerious = document.querySelector('.audio-serious');
const audioSwoosh = document.querySelector('.audio-swoosh');
const audioEvening = document.querySelector('.audio-evening');
const audioLaugh = document.querySelector('.audio-laugh');
const wallpaperImg = document.querySelector('.wallpaper-img');

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.lastTime = 0;

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.fixedTimeStep = 1.0 / 60.0;
    this.maxSubSteps = 3;

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    // this.camera.position.set(0, -4, 4);
    this.camera.position.set(
      -0.019277666383123473,
      -7.905617767933359,
      1.7344480745711834
    );
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', () => {
      console.log(this.camera.position);
    });
    this.time = 0;

    this.isPlaying = true;

    this.setupPhysics();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.stop();
    // this.settings();
  }

  settings() {
    let that = this;
    this.settings = {
      progress: 0,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  setupPhysics() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -1.5);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    this.phObjects = [];
    this.number = 200;
    for (let i = 0; i < this.number; i++) {
      let body = new CANNON.Body({
        mass: 0.01, // kg
        // cannon body position
        position: new CANNON.Vec3(
          20 * (Math.random() - 0.5),
          20 * (Math.random() - 0.5),
          10 + 4 * Math.random()
        ),
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.01, 0.5)),
      });
      body.angularVelocity.set(Math.random(), Math.random(), 0);
      this.phObjects.push(body);
      this.world.addBody(body);
    }

    let matrix = [];
    let sizeX = 20;
    let sizeY = 20;
    for (let i = 0; i < sizeX; i++) {
      matrix.push([]);
      for (let j = 0; j < sizeY; j++) {
        // matrix[i].push(Math.random() / 100);
        matrix[i].push(Math.random() / 10);
      }
    }

    let hfShape = new CANNON.Heightfield(matrix, {
      elementSize: 5,
    });
    this.hfBody = new CANNON.Body([{ mass: 0 }]);
    this.hfBody.addShape(hfShape);
    // this.world.add(this.hfBody);

    this.groundBody = new CANNON.Body({
      mass: 0,
    });
    this.groundShape = new CANNON.Plane();
    this.groundBody.addShape(this.groundShape);
    this.groundBody.position.set(0, 0, -0.5);
    this.world.addBody(this.groundBody);
  }

  addObjects() {
    this.objects = [];
    this.batmanImage = new THREE.TextureLoader().load(batmanImage);

    for (let i = 0; i < this.number; i++) {
      const geometry0 = new THREE.PlaneBufferGeometry(1, 1.5);
      geometry0.rotateX(Math.PI / 2);
      const material0 = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        // color: 0x000000,
        map: new THREE.TextureLoader().load(jokerImage),
      });
      const mesh = new THREE.Mesh(geometry0, material0);
      this.objects.push(mesh);
      this.scene.add(mesh);
    }

    // const geometry1 = new THREE.PlaneBufferGeometry(5, 20, 32);
    const geometry1 = new THREE.CircleBufferGeometry(7, 100);
    const material1 = new THREE.MeshBasicMaterial({
      // Render geometry as wireframe. Default is false (i.e. render as flat polygons)
      wireframe: false,
      color: 0xaaaaaa,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry1, material1);
    // this.scene.add(plane);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if (!this.isPlaying) {
      this.render();
      this.isPlaying = true;
    }
  }

  bomb() {
    this.world.remove(this.groundBody);
    this.world.gravity.set(0, 0, 4.5);
    setTimeout(() => {
      this.world.gravity.set(0, 0, -1);
      for (let i = 0; i < this.number; i++) {
        if (i % 2 == 0) {
          this.objects[i].material.map = this.batmanImage;
          this.objects[i].material.needsUpdate = true;
          // this.objects[i].scale.y = 1;
          this.objects[i].color = '0xffffff';

          this.phObjects[i].quaternion = new CANNON.Quaternion(
            this.phObjects[i].quaternion.x,
            this.phObjects[i].quaternion.y,
            this.phObjects[i].quaternion.z
          );
        }
      }
    }, 1000);
    // this.world.gravity.set(0, 0, 2);
    // this.world.remove(this.hfBody);
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;

    if (this.lastTime !== undefined) {
      const dt = (this.time - this.lastTime) / 1000;
      // this.world.step(this.fixedTimeStep, dt, this.maxSubSteps);
      this.world.step(this.fixedTimeStep);
      if (this.world.stepnumber > 1026) {
        wallpaperImg.style.opacity = 1;
        wallpaperImg.style.visibility = 'visible';
      }
    }
    this.lastTime = this.time;

    for (let i = 0; i < this.number; i++) {
      this.objects[i].position.copy(this.phObjects[i].position);
      this.objects[i].quaternion.copy(this.phObjects[i].quaternion);
    }

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

const sketch = new Sketch({
  dom: document.getElementById('container'),
});

let step = 1;

book.addEventListener('click', function () {
  audioSwoosh.play();

  if (step === 1) {
    [...book.children].forEach((img) => {
      img.style.cssText = `
        transform: rotate(0) scale(2) translateY(-30px);
        opacity: 0;
      `;
      // book.style.opacity = 0;
      book.style.pointerEvents = 'none';
    });
    const first = new Promise((resolve) =>
      setTimeout(function () {
        sketch.play();
        sketch.render();
        resolve();
      }, 1000)
    );

    first.then(() => {
      setTimeout(() => {
        // [...book.children].forEach((img) => {
        //   book.style.pointerEvents = 'initial';
        //   // book.style.opacity = 1;
        //   // img.style.cssText = `
        //   //   transform: rotate(0) scale(2);
        //   //   opacity: 1;
        //   // `;
        // });
        whyImgWrapper.style.opacity = 1;
        whyImgWrapper.style.visibility = 'visible';
        audioEvening.play();
      }, 5000);
    });
    step = 2;
  } else {
    // [...book.children].forEach((img) => {
    //   img.style.cssText = `
    //     transform: rotate(0) scale(0) translateY(-500px);
    //   `;
    //   book.style.opacity = 0;
    // });
    whyImgWrapper.style.opacity = 0;
  }
});

whyImgWrapper.addEventListener('click', function () {
  whyImgWrapper.style.opacity = 0;
  whyImgWrapper.style.pointerEvents = 'none';
  audioLaugh.play();
  sketch.bomb();
});

import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';

// '../assets/skybox/posx.jpg',
//     '../assets/skybox/negx.jpg',
//     '../assets/skybox/posy.jpg',
//     '../assets/skybox/negy.jpg',
//     '../assets/skybox/posz.jpg',
//     '../assets/skybox/negz.jpg',


export default class BasicWorld {
    constructor() {
    }

    initialize() {

        this.threejs_ = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.threejs_.shadowMap.enabled = true;
        this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threejs_.setPixelRatio(window.devicePixelRatio);
        this.threejs_.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(this.threejs_.domElement);

        window.addEventListener('resize', () => {
            this.onWindowResize_();
        }, false);

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;
        this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera_.position.set(75, 20, 0);

        this.scene_ = new THREE.Scene();

        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(20, 100, 10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        this.scene_.add(light);

        light = new THREE.AmbientLight(0x101010);
        this.scene_.add(light);

        const controls = new OrbitControls(
            this.camera_, this.threejs_.domElement);
        controls.target.set(0, 20, 0);
        controls.update();

        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '../assets/skybox/posx.jpg',
            '../assets/skybox/negx.jpg',
            '../assets/skybox/posy.jpg',
            '../assets/skybox/negy.jpg',
            '../assets/skybox/posz.jpg',
            '../assets/skybox/negz.jpg',
        ]);
        this.scene_.background = texture;

        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(100, 1, 100),
            new THREE.MeshStandardMaterial({color: 0x404040}));
        ground.castShadow = false;
        ground.receiveShadow = true;
        this.scene_.add(ground);

        this.countdown_ = 1.0;
        this.count_ = 0;
        this.previousRAF_ = null;
        this.raf_();
    }

    onWindowResize_() {
        this.camera_.aspect = window.innerWidth / window.innerHeight;
        this.camera_.updateProjectionMatrix();
        this.threejs_.setSize(window.innerWidth, window.innerHeight);
    }

    raf_() {
        requestAnimationFrame((t) => {
            if (this.previousRAF_ === null) {
                this.previousRAF_ = t;
            }

            this.step_(t - this.previousRAF_);
            this.threejs_.render(this.scene_, this.camera_);
            this.raf_();
            this.previousRAF_ = t;
        });
    }


    step_(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;

        this.countdown_ -= timeElapsedS;
        if (this.countdown_ < 0 && this.count_ < 10) {
            this.countdown_ = 0.25;
            this.count_ += 1;
        }
    }

}

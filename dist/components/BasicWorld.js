import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';

export default class BasicWorld {
    constructor() {
        this.initialize_()
    }

    initialize_() {

        this.initalizeRenderer_()
        this.initializeLights_()
        this.initializeScene_()



        const controls = new OrbitControls(
            this.camera_, this.threejs_.domElement);
        controls.target.set(0, 20, 0);
        controls.update();

        this.countdown_ = 1.0;
        this.count_ = 0;
        this.previousRAF_ = null;
        this.raf_();
    }

    initalizeRenderer_() {
        this.threejs_ = new THREE.WebGLRenderer({
            antialias: false,
        })
        this.threejs_.shadowMap.enabled = true
        this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap
        this.threejs_.setPixelRatio(window.devicePixelRatio)
        this.threejs_.setSize(window.innerWidth, window.innerHeight)
        this.threejs_.physicallyCorrectLights = true
        this.threejs_.outputEncoding = THREE.sRGBEncoding

        document.body.appendChild(this.threejs_.domElement)

        window.addEventListener('resize', () => {
            this.onWindowResize_();
        }, false)

        const fov = 60
        const aspect = 1920 / 1080
        const near = 1.0
        const far = 1000.0
        this.camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera_.position.set(0, 2, 0)

        this.scene_ = new THREE.Scene()

        this.uiCamera_ = new THREE.OrthographicCamera(
            -1, 0, 1 * aspect, -1 * aspect, 1, 1000)
        this.uiScene_ = new THREE.Scene()
    }

    initializeLights_() {
        const distance = 50.0
        const angle = Math.PI / 4.0
        const penumbra = 0.5
        const decay = 1.0

        let light = new THREE.SpotLight(0xFFFFFF, 100.0, distance, angle, penumbra, decay);
        light.castShadow = true
        light.shadow.bias = -0.00001
        light.shadow.mapSize.width = 4096
        light.shadow.mapSize.height = 4096
        light.shadow.camera.near = 1
        light.shadow.camera.far = 100.0

        light.position.set(25, 25, 0)
        light.lookAt(0, 0, 0)
        this.scene_.add(light);

        const upColour = 0xFFFF80
        const downColour = 0x808080
        light = new THREE.HemisphereLight(upColour, downColour, 0.5)
        light.color.setHSL(0.6, 1, 0.6)
        light.groundColor.setHSL(0.095, 1, 0.75)
        light.position.set(0, 4, 0)
        this.scene_.add(light)
    }

    initializeScene_() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '../assets/skybox/posx.jpg',
            '../assets/skybox/negx.jpg',
            '../assets/skybox/posy.jpg',
            '../assets/skybox/negy.jpg',
            '../assets/skybox/posz.jpg',
            '../assets/skybox/negz.jpg',
        ])

        texture.encoding = THREE.sRGBEncoding
        this.scene_.background = texture

        const mapLoader = new THREE.TextureLoader()
        const maxAnisotropy = this.threejs_.capabilities.getMaxAnisotropy()
        const checkerboard = mapLoader.load('../assets/checkerboard.png')
        checkerboard.anisotropy = maxAnisotropy
        checkerboard.wrapS = THREE.RepeatWrapping
        checkerboard.wrapT = THREE.RepeatWrapping
        checkerboard.repeat.set(32, 32)
        checkerboard.encoding = THREE.sRGBEncoding

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({map: checkerboard})
        )
        plane.castShadow = false
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        this.scene_.add(plane)

        const box = new THREE.Mesh(
            new THREE.BoxGeometry(4, 4, 4),
            this.loadMaterial_('vintage-tile1_', 0.2))
        box.position.set(10, 2, 0)
        box.castShadow = true
        box.receiveShadow = true
        this.scene_.add(box)

    }

    loadMaterial_(name, tiling) {
        const mapLoader = new THREE.TextureLoader()
        const maxAnisotropy = this.threejs_.capabilities.getMaxAnisotropy()

        const metalMap = mapLoader.load('../assets/freepbr/' + name + 'metallic.png')
        metalMap.anisotropy = maxAnisotropy
        metalMap.wrapS = THREE.RepeatWrapping
        metalMap.wrapT = THREE.RepeatWrapping
        metalMap.repeat.set(tiling, tiling)

        const albedo = mapLoader.load('../assets/freepbr/' + name + 'albedo.png')
        albedo.anisotropy = maxAnisotropy
        albedo.wrapS = THREE.RepeatWrapping
        albedo.wrapT = THREE.RepeatWrapping
        albedo.repeat.set(tiling, tiling)
        albedo.encoding = THREE.sRGBEncoding

        const normalMap = mapLoader.load('../assets/freepbr/' + name + 'normal.png')
        normalMap.anisotropy = maxAnisotropy
        normalMap.wrapS = THREE.RepeatWrapping
        normalMap.wrapT = THREE.RepeatWrapping
        normalMap.repeat.set(tiling, tiling)

        const roughnessMap = mapLoader.load('../assets/freepbr/' + name + 'roughness.png')
        roughnessMap.anisotropy = maxAnisotropy
        roughnessMap.wrapS = THREE.RepeatWrapping
        roughnessMap.wrapT = THREE.RepeatWrapping
        roughnessMap.repeat.set(tiling, tiling)

        const material = new THREE.MeshStandardMaterial({
            metalnessMap: metalMap,
            map: albedo,
            normalMap: normalMap,
            roughnessMap: roughnessMap
        })

        return material
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

import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import {InputController} from './InputController.js'

const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68
}

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b)
}

export class FirstPersonCamera {

    constructor(camera, objects) {
        this.camera_ = camera
        this.input_ = new InputController()
        this.rotation_ = new THREE.Quaternion()
        this.translation_ = new THREE.Vector3(0, 2, 0)
        this.phi_ = 0
        this.phiSpeed_ = 8
        this.theta_ = 0
        this.thetaSpeed_ = 5
        this.headBobActive_ = false
        this.headBobTimer_ = 0
        this.objects_ = objects
    }

    update(timeElapsedS) {
        this.updateRotation_(timeElapsedS)
    }

    updateRotation_(timeElapsedS) {
        const xh = this.input_.current_.mouseXDelta / window.innerWidth
        const yh = this.input_.current_.mouseYDelta / window.innerHeight

        this.phi_ += -xh * this.phiSpeed_
        this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3)

        const qx = new THREE.Quaternion()
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_)
        const qz = new THREE.Quaternion()
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_)

        const q = new THREE.Quaternion()
        q.multiply(qx)
        q.multiply(qz)

        this.rotation_.copy(q)
    }

}

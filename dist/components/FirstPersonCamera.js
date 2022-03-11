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
        this.updateCamera_(timeElapsedS)

        this.input_.update(timeElapsedS)
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

    updateCamera_(_) {
        this.camera_.quaternion.copy(this.rotation_)
        this.camera_.position.copy(this.translation_)
        this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * 1.5

        const forward = new THREE.Vector3(0, 0, -1)
        forward.applyQuaternion(this.rotation_)

        const dir = forward.clone()

        forward.multiplyScalar(1)
        forward.add(this.translation_)

        let closest = forward;
        const result = new THREE.Vector3();
        const ray = new THREE.Ray(this.translation_, dir)
        for (let i = 0; i < this.objects_.length; ++i) {
            if (ray.intersectBox(this.objects_[i], result)) {
                if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
                    closest = result.clone()
                }
            }
        }

        this.camera_.lookAt(closest);
    }

}

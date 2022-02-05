import { glMatrix, vec3 } from 'gl-matrix'
import { FirstPersonCamera } from '.'

const { toRadian } = glMatrix

export class OrbitCamera extends FirstPersonCamera {
    private distance = 0

    private origin = vec3.fromValues(0, 0, 0)
    private originFront = vec3.fromValues(0, 0, 0)

    constructor(position: vec3, pitch: number, yaw: number) {
        super(position, pitch, yaw)
        this.distance = vec3.distance(this.position, this.origin)
    }

    override rotate(offsetPitch: number, offsetYaw: number) {
        console.log('distance=', this.distance)

        this.pitch += offsetPitch
        this.yaw += offsetYaw

        vec3.scaleAndAdd(this.origin, this.position, this.front, this.distance)

        this.originFront[0] = -Math.cos(toRadian(this.pitch)) * Math.cos(toRadian(this.yaw))
        this.originFront[1] = -Math.sin(toRadian(this.pitch))
        this.originFront[2] = -Math.cos(toRadian(this.pitch)) * Math.sin(toRadian(this.yaw))
        vec3.normalize(this.originFront, this.originFront)

        vec3.scaleAndAdd(this.position, this.origin, this.originFront, this.distance)

        this.updateView()
    }
}

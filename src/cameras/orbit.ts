import { glMatrix, vec3 } from 'gl-matrix'
import { FirstPersonCamera } from '.'

const { toRadian } = glMatrix

const zoomRate = 0.025

export class OrbitCamera extends FirstPersonCamera {
    private distance = 0

    private origin = vec3.fromValues(0, 0, 0)
    private originFront = vec3.fromValues(0, 0, 0)

    constructor(position: vec3, pitch: number, yaw: number) {
        super(position, pitch, yaw)
        this.distance = vec3.distance(this.position, this.origin)
    }

    addMouseListener(canvas: HTMLCanvasElement): void {
        super.addMouseListener(canvas)
        canvas.addEventListener('wheel', this.handleWheel)
    }

    removeMouseListener(): void {
        super.removeMouseListener()
        this.canvas.removeEventListener('wheel', this.handleWheel)
    }

    override rotate(offsetPitch: number, offsetYaw: number) {
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

    private handleWheel = (ev: WheelEvent) => {
        if (ev.deltaY !== 0) {
            this.zoom(ev.deltaY)
        }
    }

    private zoom(delta: number) {
        const velocity = delta * zoomRate
        vec3.scaleAndAdd(this.position, this.position, this.front, -velocity)
        this.distance = vec3.distance(this.position, this.origin)
        this.updateView()
    }
}

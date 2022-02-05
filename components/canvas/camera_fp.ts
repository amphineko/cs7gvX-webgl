import { glMatrix, mat4, vec3 } from 'gl-matrix'

const { toRadian } = glMatrix

const worldUp = vec3.fromValues(0, 1, 0)

export class FirstPersonCamera {
    #position: vec3
    #pitch: number
    #yaw: number

    #front: vec3 = vec3.create()
    #right: vec3 = vec3.create()
    #up: vec3 = vec3.create()

    #view: mat4 = mat4.create()

    constructor(position: vec3, pitch: number, yaw: number) {
        this.#position = vec3.clone(position)
        this.#pitch = pitch
        this.#yaw = yaw
        this.#updateView()
    }

    get view() {
        return this.#view
    }

    setPosition(x: number, y: number, z: number) {
        this.#position = vec3.fromValues(x, y, z)
        this.#updateView()
    }

    setRotation(pitch: number, yaw: number) {
        this.#pitch = pitch
        this.#yaw = yaw
        this.#updateView()
    }

    #updateView() {
        this.#front[0] = Math.cos(toRadian(this.#pitch)) * Math.cos(toRadian(this.#yaw))
        this.#front[1] = Math.sin(toRadian(this.#pitch))
        this.#front[2] = Math.cos(toRadian(this.#pitch)) * Math.sin(toRadian(this.#yaw))
        vec3.normalize(this.#front, this.#front)

        vec3.cross(this.#right, worldUp, this.#front)
        vec3.normalize(this.#right, this.#right)

        vec3.cross(this.#up, this.#front, this.#right)
        vec3.normalize(this.#up, this.#up)

        mat4.lookAt(this.#view, this.#position, vec3.add(vec3.create(), this.#position, this.#front), this.#up)
    }
}

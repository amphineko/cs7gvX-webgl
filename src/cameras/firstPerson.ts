import { glMatrix, mat4, vec3 } from 'gl-matrix'

const { toRadian } = glMatrix

const worldUp = vec3.fromValues(0, 1, 0)
const zero = vec3.fromValues(0, 0, 0)

const keyboardTranslateRate = 10
const mouseRotateRate = 5000.0

export class FirstPersonCamera {
    #position: vec3
    #pitch: number
    #yaw: number

    #front: vec3 = vec3.create()
    #right: vec3 = vec3.create()
    #up: vec3 = vec3.create()

    #view: mat4 = mat4.create()

    keyboardInterval = 0
    keyboardLastTime = 0
    keyboardNegative = vec3.fromValues(0, 0, 0)
    keyboardPositive = vec3.fromValues(0, 0, 0)

    #keydownHandler: (e: KeyboardEvent) => void
    #keyupHandler: (e: KeyboardEvent) => void
    #mousedownHandler: (e: MouseEvent) => void
    #mousemoveHandler: (e: MouseEvent) => void

    #canvas: HTMLCanvasElement

    constructor(position: vec3, pitch: number, yaw: number) {
        this.#position = vec3.clone(position)
        this.#pitch = pitch
        this.#yaw = yaw
        this.#updateView()
    }

    get view() {
        return this.#view
    }

    addKeyboardListener() {
        document.addEventListener(
            'keydown',
            this.#keydownHandler || (this.#keydownHandler = (e: KeyboardEvent) => this.#handleKeydown(e))
        )
        document.addEventListener(
            'keyup',
            this.#keyupHandler || (this.#keyupHandler = (e: KeyboardEvent) => this.#handleKeyup(e))
        )
    }

    addMouseListener(canvas: HTMLCanvasElement) {
        this.#canvas = canvas
        this.#canvas.addEventListener(
            'mousedown',
            this.#mousedownHandler || (this.#mousedownHandler = () => this.#handleMouseDown())
        )
    }

    removeKeyboardListener() {
        this.#keydownHandler && document.removeEventListener('keydown', this.#keydownHandler)
        this.#keyupHandler && document.removeEventListener('keyup', this.#keyupHandler)
    }

    removeMouseListener() {
        this.#mousedownHandler && this.#canvas.removeEventListener('mousedown', this.#mousedownHandler)
        this.#mousemoveHandler && document.removeEventListener('mousemove', this.#mousemoveHandler)
    }

    rotate(offsetPitch: number, offsetYaw: number) {
        this.#pitch += offsetPitch
        this.#yaw += offsetYaw
        this.#updateView()
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

    translate(offset: vec3) {
        vec3.add(this.#position, this.#position, offset)
        this.#updateView()
    }

    #handleKeydown(e: KeyboardEvent) {
        if (e.key === 'w' || e.key === 'W') {
            this.keyboardNegative[2] = keyboardTranslateRate
        }
        if (e.key === 'a' || e.key === 'A') {
            this.keyboardNegative[0] = keyboardTranslateRate
        }
        if (e.key === 'f' || e.key === 'F') {
            this.keyboardNegative[1] = keyboardTranslateRate
        }
        if (e.key === 's' || e.key === 'S') {
            this.keyboardPositive[2] = keyboardTranslateRate
        }
        if (e.key === 'd' || e.key === 'D') {
            this.keyboardPositive[0] = keyboardTranslateRate
        }
        if (e.key === 'r' || e.key === 'R') {
            this.keyboardPositive[1] = keyboardTranslateRate
        }

        if (vec3.distance(this.keyboardNegative, zero) > 0 || vec3.distance(this.keyboardPositive, zero) > 0) {
            this.keyboardLastTime = performance.now()
            this.keyboardInterval = setInterval(() => {
                const deltaTime = (performance.now() - this.keyboardLastTime) / 1000
                const offset = vec3.fromValues(
                    (-this.keyboardNegative[0] + this.keyboardPositive[0]) * deltaTime,
                    (-this.keyboardNegative[1] + this.keyboardPositive[1]) * deltaTime,
                    (-this.keyboardNegative[2] + this.keyboardPositive[2]) * deltaTime
                )
                this.translate(offset)
                this.keyboardLastTime = performance.now()
            }) as unknown as number
        }
    }

    #handleKeyup(e: KeyboardEvent) {
        if (e.key === 'w' || e.key === 'W') {
            this.keyboardNegative[2] = 0
        }
        if (e.key === 'a' || e.key === 'A') {
            this.keyboardNegative[0] = 0
        }
        if (e.key === 'f' || e.key === 'F') {
            this.keyboardNegative[1] = 0
        }
        if (e.key === 's' || e.key === 'S') {
            this.keyboardPositive[2] = 0
        }
        if (e.key === 'd' || e.key === 'D') {
            this.keyboardPositive[0] = 0
        }
        if (e.key === 'r' || e.key === 'R') {
            this.keyboardPositive[1] = 0
        }

        if (vec3.distance(this.keyboardNegative, zero) === 0 || vec3.distance(this.keyboardPositive, zero) === 0) {
            clearInterval(this.keyboardInterval)
        }
    }

    #handleMouseDown() {
        if (document.pointerLockElement !== this.#canvas) {
            this.#canvas.requestPointerLock()
            document.addEventListener(
                'mousemove',
                this.#mousemoveHandler || (this.#mousemoveHandler = (e: MouseEvent) => this.#handleMouseMove(e))
            )
        } else {
            this.#mousemoveHandler && document.removeEventListener('mousemove', this.#mousemoveHandler)
            document.exitPointerLock()
        }
    }

    #handleMouseMove(e: MouseEvent) {
        this.rotate(
            toRadian((-e.movementY / this.#canvas.clientHeight) * mouseRotateRate),
            toRadian((e.movementX / this.#canvas.clientWidth) * mouseRotateRate)
        )
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

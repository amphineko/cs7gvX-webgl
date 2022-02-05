import type { mat4 } from 'gl-matrix'

export { FirstPersonCamera } from './firstPerson'
export { OrbitCamera } from './orbit'

export interface ICamera {
    get viewMatrix(): mat4

    addKeyboardListener(): void

    addMouseListener(canvas: HTMLCanvasElement): void

    removeKeyboardListener(): void

    removeMouseListener(): void
}

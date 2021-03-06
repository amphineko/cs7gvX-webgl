import type { GUI } from 'dat.gui'
import { useEffect, useRef } from 'react'
import { Euler, Object3D, PerspectiveCamera, PointLight, Scene, sRGBEncoding, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { degToRad } from 'three/src/math/MathUtils'

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const PropellerPage = () => {
    const canvas = useRef<HTMLCanvasElement>()
    const container = useRef<HTMLDivElement>()
    const fpsIndicator = useRef<HTMLSpanElement>()

    useEffect(() => {
        if (!canvas.current) {
            return
        }

        // renderer initialization

        const resizeObserver = new ResizeObserver(() => {
            const width = (canvas.current.width = container.current.clientWidth)
            const height = (canvas.current.height = container.current.clientHeight)

            orbitCamera.aspect = width / height
            orbitCamera.updateProjectionMatrix()

            renderer.setViewport(0, 0, width, height)
        })
        resizeObserver.observe(container.current)

        const renderer = new WebGLRenderer({
            antialias: true,
            canvas: canvas.current,
        })
        renderer.outputEncoding = sRGBEncoding

        // camera initialization

        const orbitCamera = new PerspectiveCamera(75, window?.innerWidth / window?.innerHeight, 0.1, 1000)
        orbitCamera.position.x = 2.5
        orbitCamera.position.y = 2.5
        orbitCamera.position.z = -2.5

        const controlledCamera = new PerspectiveCamera(75, window?.innerWidth / window?.innerHeight, 0.1, 1000)

        const cameraOptions = { firstPerson: false }

        const light = new PointLight(0xffffff, 1, 100)
        orbitCamera.add(light)

        // camera controls

        const orbinControls = new OrbitControls(orbitCamera, renderer.domElement)
        orbinControls.enableDamping = true
        orbinControls.update()

        // scene initialization

        const scene = new Scene()
        let plane: Object3D | null = null
        let propeller: Object3D | null = null
        scene.add(orbitCamera)
        let gui: GUI | undefined
        gltfLoader.load(
            '/models/propeller/scene.gltf',
            (gltf) => {
                scene.add(gltf.scene)
                plane = gltf.scene.getObjectByName('Root')
                propeller = gltf.scene.getObjectByName('Propeller')

                plane.add(controlledCamera)
                controlledCamera.translateY(1.5)
                controlledCamera.rotateY(degToRad(90))

                import('dat.gui')
                    .then((dat) => {
                        gui = new dat.GUI()
                        const planeFolder = gui.addFolder('Plane')
                        planeFolder.add(plane.rotation, 'x', degToRad(-90), degToRad(90)).step(0.01).listen()
                        planeFolder.add(plane.rotation, 'y', degToRad(-90), degToRad(90)).step(0.01).listen()
                        planeFolder.add(plane.rotation, 'z', degToRad(-90), degToRad(90)).step(0.01).listen()
                        planeFolder.open()
                        const propellerFolder = gui.addFolder('Propeller')
                        propellerFolder.add(propeller.rotation, 'x', degToRad(-90), degToRad(90)).step(0.01).listen()
                        propellerFolder.add(propeller.rotation, 'y', degToRad(-90), degToRad(90)).step(0.01).listen()
                        propellerFolder.add(propeller.rotation, 'z', degToRad(-90), degToRad(90)).step(0.01).listen()
                        propellerFolder.open()
                        const cameraFolder = gui.addFolder('Camera')
                        cameraFolder.add(cameraOptions, 'firstPerson')
                        cameraFolder.open()
                    })
                    .catch((error) => console.error(error))
            },
            (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
            (error) => console.error(error)
        )

        // keyboard controls

        const keydownTimestamp = { pX: 0, pY: 0, pZ: 0, nX: 0, nY: 0, nZ: 0 }
        const onKeydown = (event: KeyboardEvent) => {
            if ((event.key === 'w' || event.key === 'W') && keydownTimestamp.nZ === 0) {
                keydownTimestamp.pZ = performance.now()
            }
            if ((event.key === 's' || event.key === 'S') && keydownTimestamp.pZ === 0) {
                keydownTimestamp.nZ = performance.now()
            }
            if ((event.key === 'a' || event.key === 'A') && keydownTimestamp.nX === 0) {
                keydownTimestamp.pX = performance.now()
            }
            if ((event.key === 'd' || event.key === 'D') && keydownTimestamp.pX === 0) {
                keydownTimestamp.nX = performance.now()
            }
            if ((event.key === 'q' || event.key === 'Q') && keydownTimestamp.nY === 0) {
                keydownTimestamp.pY = performance.now()
            }
            if ((event.key === 'e' || event.key === 'E') && keydownTimestamp.pY === 0) {
                keydownTimestamp.nY = performance.now()
            }

            if (event.key === ' ') {
                plane?.setRotationFromEuler(new Euler(0, 0, 0))
            }
        }
        const onKeyup = (event: KeyboardEvent) => {
            if (event.key === 'w' || event.key === 'W') {
                keydownTimestamp.pZ = 0
            }
            if (event.key === 's' || event.key === 'S') {
                keydownTimestamp.nZ = 0
            }
            if (event.key === 'a' || event.key === 'A') {
                keydownTimestamp.pX = 0
            }
            if (event.key === 'd' || event.key === 'D') {
                keydownTimestamp.nX = 0
            }
            if (event.key === 'q' || event.key === 'Q') {
                keydownTimestamp.pY = 0
            }
            if (event.key === 'e' || event.key === 'E') {
                keydownTimestamp.nY = 0
            }
        }
        document.addEventListener('keydown', onKeydown)
        document.addEventListener('keyup', onKeyup)

        // render loop

        let cancelled = false
        const frameTimes: number[] = []
        let lastFrameClock = performance.now()
        let totalFrameTime = 0
        const render = (now: DOMHighResTimeStamp) => {
            if (cancelled) {
                return
            }

            requestAnimationFrame(render)

            const delta = now - lastFrameClock
            lastFrameClock = now

            propeller?.rotateX(degToRad(delta))

            if (plane) {
                const step = 0.0001

                plane.rotateX(
                    (keydownTimestamp.nX !== 0 ? -(performance.now() - keydownTimestamp.nX) * step : 0) +
                        (keydownTimestamp.pX !== 0 ? (performance.now() - keydownTimestamp.pX) * step : 0)
                )
                plane.rotateY(
                    (keydownTimestamp.nY !== 0 ? -(performance.now() - keydownTimestamp.nY) * step : 0) +
                        (keydownTimestamp.pY !== 0 ? (performance.now() - keydownTimestamp.pY) * step : 0)
                )
                plane.rotateZ(
                    (keydownTimestamp.nZ !== 0 ? -(performance.now() - keydownTimestamp.nZ) * step : 0) +
                        (keydownTimestamp.pZ !== 0 ? (performance.now() - keydownTimestamp.pZ) * step : 0)
                )
            }

            if (cameraOptions.firstPerson) {
                renderer.render(scene, controlledCamera)
            } else {
                orbinControls.update()
                renderer.render(scene, orbitCamera)
            }

            totalFrameTime += delta
            frameTimes.push(delta)

            if (totalFrameTime > 1000) {
                const fps = (frameTimes.length / totalFrameTime) * 1000
                const fAvg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
                const fVar = Math.sqrt(frameTimes.reduce((a, b) => a + Math.pow(b - fAvg, 2), 0) / frameTimes.length)

                const innerText = `fps=${fps.toFixed(2)}, avg=${fAvg.toFixed(2)}, var=${fVar.toFixed(2)}`
                if (fpsIndicator.current) fpsIndicator.current.innerText = innerText

                totalFrameTime = 0
                frameTimes.length = 0
            }
        }
        render(performance.now())

        return () => {
            cancelled = true

            gui?.destroy()
            document.removeEventListener('keydown', onKeydown)
            document.removeEventListener('keyup', onKeyup)
            resizeObserver.disconnect()
            orbinControls.dispose()
            renderer.dispose()
        }
    }, [])

    return (
        <div className="canvas-container" ref={container}>
            <canvas className="canvas" ref={canvas}>
                <p>The canvas element is not supported by your browser</p>
            </canvas>

            <span className="fps-indicator" ref={fpsIndicator} />

            <style jsx>
                {`
                    .canvas {
                        max-height: 100%;
                        position: absolute;
                    }

                    .canvas-container {
                        content: ' ';
                        height: 100%;
                        max-height: 100%;
                        position: absolute;
                        width: 100%;
                    }

                    .fps-indicator {
                        background: black;
                        color: green;
                        font-family: monospace;
                        font-size: 2vh;
                        left: 0;
                        position: absolute;
                        top: 0;
                    }
                `}
            </style>
        </div>
    )
}

export default PropellerPage

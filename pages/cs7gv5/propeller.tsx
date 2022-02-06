import { useEffect, useRef } from 'react'
import { Object3D, PerspectiveCamera, PointLight, Scene, sRGBEncoding, WebGLRenderer } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const PropellerPage = () => {
    const canvas = useRef<HTMLCanvasElement>()
    const container = useRef<HTMLDivElement>()

    useEffect(() => {
        if (!canvas.current) {
            return
        }

        // renderer initialization

        const resizeObserver = new ResizeObserver(() => {
            const width = (canvas.current.width = container.current.clientWidth)
            const height = (canvas.current.height = container.current.clientHeight)

            camera.aspect = width / height
            camera.updateProjectionMatrix()

            renderer.setViewport(0, 0, width, height)
        })
        resizeObserver.observe(container.current)

        const renderer = new WebGLRenderer({
            antialias: true,
            canvas: canvas.current,
        })
        renderer.outputEncoding = sRGBEncoding

        // camera initialization

        const camera = new PerspectiveCamera(75, window?.innerWidth / window?.innerHeight, 0.1, 1000)
        camera.position.z = 5

        const light = new PointLight(0xffffff, 1, 100)
        camera.add(light)

        // camera controls

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.update()

        // scene initialization

        const scene = new Scene()
        let propeller: Object3D | null = null
        scene.add(camera)
        gltfLoader.load(
            '/models/propeller/scene.gltf',
            (gltf) => {
                scene.add(gltf.scene)
                propeller = gltf.scene.getObjectByName('Propeller')
            },
            (xhr) => console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`),
            (error) => console.error(error)
        )

        // render loop

        let cancelled = false
        let lastFrameTime = performance.now()
        const render = () => {
            if (cancelled) {
                return
            }

            requestAnimationFrame(render)

            const now = performance.now()
            const delta = now - lastFrameTime
            lastFrameTime = now
            propeller?.rotation.set(propeller?.rotation.x + 0.01 * delta, 0, 0)

            controls.update()
            renderer.render(scene, camera)
        }
        render()

        return () => {
            cancelled = true

            resizeObserver.disconnect()
            controls.dispose()
            renderer.dispose()
        }
    }, [])

    return (
        <div className="canvas-container" ref={container}>
            <canvas className="canvas" ref={canvas}>
                <p>The canvas element is not supported by your browser</p>
            </canvas>

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

                    .fps {
                        color: white;
                        font-family: monospace;
                        right: 0;
                        position: absolute;
                        top: 0;
                    }
                `}
            </style>
        </div>
    )
}

export default PropellerPage

import { useEffect, useRef } from 'react'
import {
    AmbientLight,
    BoxGeometry,
    CubeCamera,
    CubeTextureLoader,
    LinearMipmapLinearFilter,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PointLight,
    RGBAFormat,
    Scene,
    ShaderMaterial,
    SphereGeometry,
    sRGBEncoding,
    TextureLoader,
    WebGLCubeRenderTarget,
    WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import FragmentShader from '../../resources/cs7gv3/transmittance/fragment.glsl'
import VertexShader from '../../resources/cs7gv3/transmittance/vertex.glsl'

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
gltfLoader.setDRACOLoader(dracoLoader)

const cubeLoader = new CubeTextureLoader()

const textureLoader = new TextureLoader()

const TransmittancePage = () => {
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
        camera.position.x = 0
        camera.position.y = 0
        camera.position.z = 20

        // camera controls

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.autoRotate = true
        controls.enableDamping = true
        controls.update()

        // scene initialization

        const scene = new Scene()
        scene.add(camera)

        // envmap

        const envmapRenderTarget = new WebGLCubeRenderTarget(512, {
            format: RGBAFormat,
            generateMipmaps: true,
            minFilter: LinearMipmapLinearFilter,
        })

        const cubeCamera = new CubeCamera(0.1, 1000, envmapRenderTarget)
        scene.add(cubeCamera)

        // content

        textureLoader.load(
            new URL('../../resources/cs7gv3/transmittance/checkerboard.png', import.meta.url).href,
            (tex) => {
                const table = new BoxGeometry(40, 20, 40)

                const tableMaterial = new MeshBasicMaterial({
                    color: 0xffffff,
                    map: tex,
                })

                const tableMesh = new Mesh(table, tableMaterial)
                tableMesh.position.set(0, -20, 0)

                scene.add(tableMesh)
            }
        )

        let sphereMesh: Mesh | undefined
        cubeLoader.load(
            [
                new URL('../../resources/skybox/posx.jpeg', import.meta.url).href,
                new URL('../../resources/skybox/negx.jpeg', import.meta.url).href,
                new URL('../../resources/skybox/posy.jpeg', import.meta.url).href,
                new URL('../../resources/skybox/negy.jpeg', import.meta.url).href,
                new URL('../../resources/skybox/posz.jpeg', import.meta.url).href,
                new URL('../../resources/skybox/negz.jpeg', import.meta.url).href,
            ],
            (tex) => {
                tex.encoding = sRGBEncoding

                // skybox

                scene.background = tex

                // sphere

                const sphere = new SphereGeometry(10, 50, 50)

                // const sphereMaterial = new MeshLambertMaterial({
                //     color: 0xffffff,
                //     envMap: envmapRenderTarget.texture,
                // })

                const sphereMaterial = new ShaderMaterial({
                    defines: {
                        PI: Math.PI,
                    },
                    uniforms: {
                        envMap: { value: envmapRenderTarget.texture },
                        etaR: { value: 0.65 },
                        etaG: { value: 0.66 },
                        etaB: { value: 0.67 },
                        flipEnvMap: { value: -1 },
                        fresnelBias: { value: 0.1 },
                        fresnelScale: { value: 5.0 },
                        fresnelPower: { value: 2.0 },
                    },
                    fragmentShader: FragmentShader,
                    vertexShader: VertexShader,
                })
                sphereMaterial.needsUpdate = true

                sphereMesh = new Mesh(sphere, sphereMaterial)
                sphereMesh.position.set(0, 0, 0)

                scene.add(sphereMesh)
            }
        )

        // lights

        const pointLight = new PointLight(0xffffff, 1, 100)
        pointLight.position.set(0, 25, 25)
        scene.add(pointLight)

        const ambientLight = new AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        // render loop

        let cancelled = false
        const frameTimes: number[] = []
        let lastFrameClock = performance.now()
        let totalFrameTime = 0
        const render = () => {
            if (cancelled) {
                return
            }

            requestAnimationFrame(render)

            controls.update()

            if (sphereMesh) {
                sphereMesh.visible = false
                cubeCamera.position.copy(sphereMesh.position)
                cubeCamera.update(renderer, scene)
                sphereMesh.visible = true
            }

            renderer.render(scene, camera)

            const now = performance.now()
            const frameTime = now - lastFrameClock
            lastFrameClock = now

            totalFrameTime += frameTime
            frameTimes.push(frameTime)

            if (totalFrameTime > 1000) {
                const fps = (frameTimes.length / totalFrameTime) * 1000
                const fAvg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
                const fVar = Math.sqrt(frameTimes.reduce((a, b) => a + Math.pow(b - fAvg, 2), 0) / frameTimes.length)
                fpsIndicator.current.innerText = `fps=${fps.toFixed(2)}, avg=${fAvg.toFixed(2)}, var=${fVar.toFixed(2)}`

                totalFrameTime = 0
                frameTimes.length = 0
            }
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

            <span className="fps" ref={fpsIndicator} />

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

export default TransmittancePage

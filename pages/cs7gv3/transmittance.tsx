import { useEffect, useRef } from 'react'
import {
    AmbientLight,
    CubeTextureLoader,
    Mesh,
    PerspectiveCamera,
    PointLight,
    Scene,
    ShaderMaterial,
    SphereGeometry,
    sRGBEncoding,
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

const TransmittancePage = () => {
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
        camera.position.x = -20
        camera.position.y = 20
        camera.position.z = 20

        // camera controls

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.update()

        // scene initialization

        const scene = new Scene()
        scene.add(camera)

        // skybox

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
                //     envMap: tex,
                // })

                const sphereMaterial = new ShaderMaterial({
                    defines: {
                        PI: Math.PI,
                    },
                    uniforms: {
                        envMap: { value: tex },
                        flipEnvMap: { value: -1 },
                        fresnelBias: { value: 0.5 },
                        fresnelScale: { value: 5.0 },
                        fresnelPower: { value: 2.0 },
                    },
                    fragmentShader: FragmentShader,
                    vertexShader: VertexShader,
                })

                const sphereMesh = new Mesh(sphere, sphereMaterial)
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
        const render = () => {
            if (cancelled) {
                return
            }

            requestAnimationFrame(render)

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

export default TransmittancePage

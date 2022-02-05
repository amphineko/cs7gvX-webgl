import { glMatrix, mat4, vec3 } from 'gl-matrix'
import { NextPage } from 'next'
import { useRef } from 'react'
import { ShaderProgram } from '../../components/canvas'
import { FirstPersonCamera } from '../../components/canvas/camera_fp'
import { WebGLCanvas } from '../../components/canvas/canvas'
import FragmentShader from '../../resources/cs7gv5/hello-triangle.frag'
import VertexShader from '../../resources/cs7gv5/hello-triangle.vert'

const { toRadian } = glMatrix

const vertices = new Float32Array(
    [
        [-1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0],
        [1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0],
        [-1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 1.0],

        [-1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0],
        [1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0],
        [1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0],

        [-1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0],
        [1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0],

        [-1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0],
        [-1.0, 1.0, -1.0, 1.0, 1.0, 0.0, 1.0],

        [1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0],
        [1.0, -1.0, -1.0, 1.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0],
    ].flat()
)

const HelloTrianglePage: NextPage = () => {
    const currentAspectRatio = useRef(1.0)
    const currentCamera = useRef<FirstPersonCamera>(new FirstPersonCamera(vec3.fromValues(0.0, 0.0, 5.0), 0, 270))
    const currentShader = useRef<ShaderProgram>()

    const projection = mat4.create()
    const model = mat4.identity(mat4.create())

    const initialize = (gl: WebGL2RenderingContext) => {
        currentShader.current = new ShaderProgram(
            [
                { name: 'vertex', source: VertexShader, type: gl.VERTEX_SHADER },
                { name: 'fragment', source: FragmentShader, type: gl.FRAGMENT_SHADER },
            ],
            gl
        )

        const vao = gl.createVertexArray()
        gl.bindVertexArray(vao)

        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

        const f32size = Float32Array.BYTES_PER_ELEMENT
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 7 * f32size, 0)
        gl.enableVertexAttribArray(0)

        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 7 * f32size, 3 * f32size)
        gl.enableVertexAttribArray(1)
    }

    const draw = (gl: WebGL2RenderingContext) => {
        const camera = currentCamera.current
        const shader = currentShader.current

        mat4.perspective(projection, toRadian(45), currentAspectRatio.current, 0.1, 100)

        mat4.identity(model)
        mat4.translate(model, model, vec3.fromValues(0, 0, 0))

        shader.use()
        shader.setMat4('projection', projection)
        shader.setMat4('model', model)
        shader.setMat4('view', camera.view)

        for (let i = 0; i < 5; i++) {
            gl.drawArrays(gl.TRIANGLES, i * 3, 3)
        }
    }

    return (
        <>
            <WebGLCanvas
                onDraw={draw}
                onError={(error) => {
                    console.error(error)
                }}
                onInitialize={initialize}
                onResize={(width, height) => (currentAspectRatio.current = width / height)}
            />
        </>
    )
}

export default HelloTrianglePage

import { useEffect, useRef } from 'react'

interface Props {
    onDeinitialize: (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) => void
    onDraw: (gl: WebGL2RenderingContext) => void
    onError: (error: Error) => void
    onInitialize: (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) => void
    onResize: (width: number, height: number) => void
}

export const WebGLCanvas = ({ onDraw, onError, onInitialize, onResize }: Props) => {
    const container = useRef<HTMLDivElement>()
    const canvas = useRef<HTMLCanvasElement>()
    const context = useRef<WebGL2RenderingContext>()
    const fpsDisplay = useRef<HTMLElement>()

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            canvas.current.width = container.current.offsetWidth
            canvas.current.height = container.current.offsetHeight
            onResize(canvas.current.width, canvas.current.height)
        })
        observer.observe(container.current)

        context.current?.viewport(0, 0, canvas.current.width, canvas.current.height)

        return () => {
            observer.disconnect()
        }
    }, [canvas, container, onResize])

    useEffect(() => {
        if (!canvas.current) {
            return
        }

        let fps = 0
        let lastFrameTime = performance.now()
        const frameTimes = Array.from({ length: 16384 }, () => 0)

        const gl = canvas.current.getContext('webgl2', {
            antialias: true,
            depth: true,
            desynchronized: true,
            stencil: true,
        })
        context.current = gl

        if (!gl) {
            onError(new Error('Failed to get WebGL context'))
            return
        } else {
            console.debug('DEBUG:', 'WebGL context created')
        }

        onInitialize(gl, canvas.current)

        const drawLoopInterval = setInterval(() => {
            gl.viewport(0, 0, canvas.current.width, canvas.current.height)

            gl.clearColor(0.1, 0.1, 0.1, 1)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

            onDraw(gl)

            gl.flush()

            frameTimes[++fps] = performance.now() - lastFrameTime
            lastFrameTime = performance.now()
        })

        const clearFpsInterval = setInterval(() => {
            const fAvg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
            const fVar = frameTimes.reduce((a, b) => a + Math.pow(b - fAvg, 2), 0) / frameTimes.length

            fpsDisplay.current.innerHTML = `FPS=${fps}, frame_avg=${fAvg.toFixed(2)}, frame_var=${fVar.toFixed(2)}`
            fpsDisplay.current.style.color = fVar > 1 ? 'red' : 'white'
            fps = 0
        }, 1000)

        return () => {
            clearInterval(drawLoopInterval)
            clearInterval(clearFpsInterval)
            console.debug('DEBUG:', 'Unmounting WebGLCanvas')
        }
    }, [canvas, onDraw, onError, onInitialize])

    return (
        <div className="canvas-container" ref={container}>
            <canvas className="canvas" ref={canvas}>
                <p>The canvas element is not supported by your browser</p>
            </canvas>

            <span className="fps" ref={fpsDisplay} />

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

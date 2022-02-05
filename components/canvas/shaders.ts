import { mat4 } from 'gl-matrix'

export interface ShaderProperties {
    name?: string
    source: string
    type: number
}

class Shader {
    #ctx: WebGL2RenderingContext
    #name: string
    #shader: WebGLShader

    constructor({ name, source, type }: ShaderProperties, ctx: WebGL2RenderingContext) {
        const shader = ctx.createShader(type)
        ctx.shaderSource(shader, source)
        ctx.compileShader(shader)

        this.#ctx = ctx
        this.#name = name
        this.#shader = shader
    }

    get name() {
        return this.#name
    }

    get shader() {
        return this.#shader
    }

    get infoLog() {
        return this.#ctx.getShaderInfoLog(this.#shader)
    }
}

class ShaderCompilationError extends Error {
    constructor(programInfoLog: string, shaderInfoLog: { name?: string; infoLog: string }[]) {
        const message =
            `Shader compilation error:${programInfoLog}\n` +
            `${shaderInfoLog.map(({ name, infoLog }, idx) => `Shader ${name ?? `#${idx}`}: ${infoLog}`).join('\n\t')}`
        super(message)
    }
}

export class ShaderProgram {
    #ctx: WebGL2RenderingContext
    #program: WebGLProgram

    constructor(shaderProps: ShaderProperties[], ctx: WebGL2RenderingContext) {
        const program = ctx.createProgram()
        const shaders = shaderProps.map((props) => new Shader(props, ctx))
        shaders.forEach((shader) => ctx.attachShader(program, shader.shader))

        ctx.linkProgram(program)

        if (ctx.getProgramParameter(program, ctx.LINK_STATUS) === false) {
            throw new ShaderCompilationError(
                ctx.getProgramInfoLog(program),
                shaders.map((shader) => ({ name: shader.name, infoLog: shader.infoLog }))
            )
        }

        this.#ctx = ctx
        this.#program = program
    }

    get program() {
        return this.#program
    }

    get infoLog() {
        return this.#ctx.getProgramInfoLog(this.#program)
    }

    setMat4(name: string, value: mat4) {
        this.#ctx.uniformMatrix4fv(this.#ctx.getUniformLocation(this.#program, name), false, value)
    }

    use() {
        this.#ctx.useProgram(this.#program)
    }
}

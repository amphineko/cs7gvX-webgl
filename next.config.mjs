/**
 * @type {import('next').NextConfig}
 */
const config = {
    /**
     * @param {import('webpack').Configuration} config
     * @returns {import('webpack').Configuration}
     */
    webpack: (config) => {
        return {
            ...config,
            module: {
                ...config.module,
                rules: [
                    ...config.module.rules,
                    {
                        // fragment/vertex shader source
                        test: /\.(frag|glsl|vert)/,
                        type: 'asset/source',
                    },
                ],
            },
        }
    },
}

export default config

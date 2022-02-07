uniform float fresnelBias;
uniform float fresnelPower;
uniform float fresnelScale;

uniform vec3 color;
uniform samplerCube envMap;

// varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

varying vec3 vViewDirection;

void main() {
    float reflectionFactor = clamp(fresnelBias + fresnelScale * pow(1.0 + dot(normalize(vViewDirection), vWorldNormal), fresnelPower), 0.0, 1.0);
    vec3 reflectionDirection = reflect(vViewDirection, vWorldNormal);
    vec4 envMapColor = textureCube(envMap, vec3(-reflectionDirection.x, reflectionDirection.yz));

    gl_FragColor = vec4(mix(color, envMapColor.xyz, reflectionFactor), 1.0);
}
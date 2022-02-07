// varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

varying vec3 vViewDirection;

void main() {
    vec4 vPosition = modelViewMatrix * vec4(position, 1.0);

    vec3 vWorldPosition = vec3(modelMatrix * vec4(position, 1.0));
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

    vViewDirection = vWorldPosition.xyz - cameraPosition;

    gl_Position = projectionMatrix * vPosition;
}
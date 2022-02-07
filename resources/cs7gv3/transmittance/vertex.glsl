uniform float etaR;
uniform float etaG;
uniform float etaB;

varying vec3 vWorldNormal;

varying vec3 vViewDirection;

varying vec3 reflectDirection;
varying vec3 refractDirectionR;
varying vec3 refractDirectionG;
varying vec3 refractDirectionB;

void main() {
    vec4 vPosition = modelViewMatrix * vec4(position, 1.0);

    vec3 vWorldPosition = vec3(modelMatrix * vec4(position, 1.0));
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

    vViewDirection = vWorldPosition.xyz - cameraPosition;

    reflectDirection = reflect(vViewDirection, vWorldNormal);
    refractDirectionR = refract(vViewDirection, vWorldNormal, etaR);
    refractDirectionG = refract(vViewDirection, vWorldNormal, etaG);
    refractDirectionB = refract(vViewDirection, vWorldNormal, etaB);

    gl_Position = projectionMatrix * vPosition;
}
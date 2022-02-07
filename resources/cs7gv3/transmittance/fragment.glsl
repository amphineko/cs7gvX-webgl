uniform float fresnelBias;
uniform float fresnelPower;
uniform float fresnelScale;

uniform samplerCube envMap;

varying vec3 vWorldNormal;

varying vec3 vViewDirection;

varying vec3 reflectDirection;
varying vec3 refractDirectionR;
varying vec3 refractDirectionG;
varying vec3 refractDirectionB;

void main() {
    float ratio = clamp(fresnelBias + fresnelScale * pow(1.0 + dot(normalize(vViewDirection), vWorldNormal), fresnelPower), 0.0, 1.0);

    vec3 reflectColor = textureCube(envMap, vec3(-reflectDirection.x, reflectDirection.yz)).rgb;

    float refractColorR = textureCube(envMap, vec3(refractDirectionR.x, refractDirectionR.yz)).r;
    float refractColorG = textureCube(envMap, vec3(refractDirectionG.x, refractDirectionG.yz)).g;
    float refractColorB = textureCube(envMap, vec3(refractDirectionB.x, refractDirectionB.yz)).b;
    vec3 refractColor = vec3(refractColorR, refractColorG, refractColorB);

    gl_FragColor = vec4(mix(refractColor.rgb, reflectColor.rgb, ratio), 1.0);
}
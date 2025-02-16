import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { EffectShader } from "./EffectShader.js";
import { AssetManager } from './AssetManager.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import {
    MeshBVH,
    MeshBVHVisualizer,
    MeshBVHUniformStruct,
    FloatVertexAttributeTexture,
    shaderStructs,
    shaderIntersectFunction,
    SAH
} from 'https://unpkg.com/three-mesh-bvh@0.5.10/build/index.module.js';
async function main() {
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(clientWidth, clientHeight);

    document.querySelector('#bg').appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 50);

    camera.lookAt(scene.position);
    // Skybox
    const bluesky = [
        "dist/skybox/Box_Right.bmp",
        "dist/skybox/Box_Left.bmp",
        "dist/skybox/Box_Top.bmp",
        "dist/skybox/Box_Bottom.bmp",
        "dist/skybox/Box_Front.bmp",
        "dist/skybox/Box_Back.bmp"
    ];
    const colorfulbg = [
        'dist/crystal.png',
        'dist/crystal.png',
        'dist/crystal.png',
        'dist/crystal.png',
        'dist/crystal.png',
        'dist/crystal.png']
    const white=[
        'dist/blue.png',
        'dist/blue.png',
        'dist/blue.png',
       'dist/blue.png',
        'dist/blue.png',
       'dist/blue.png',
    ]
    const environment = await new THREE.CubeTextureLoader().loadAsync(bluesky);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x000000, 1);
    scene.add(ambientLight);

    let diamondGeo = (await AssetManager.loadGLTFAsync("./dist/models/diamond.glb")).scene.children[0].children[0].children[0].children[0].children[0].geometry;
    diamondGeo.scale(15, 15, 15);
    diamondGeo.translate(0, 0, 0);
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    const cubeCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
    scene.add(cubeCamera);

    const makeDiamond = (geo, {
        color = new THREE.Color(1, 1, 1),
        ior = 2.4
    } = {}) => {
        const mergedGeometry = geo;
        mergedGeometry.boundsTree = new MeshBVH(mergedGeometry.toNonIndexed(), { lazyGeneration: false, strategy: SAH });
        const collider = new THREE.Mesh(mergedGeometry);
        collider.material.wireframe = true;
        collider.material.opacity = 0.5;
        collider.material.transparent = true;
        collider.visible = false;
        collider.boundsTree = mergedGeometry.boundsTree;
        scene.add(collider);
        const visualizer = new MeshBVHVisualizer(collider, 20);
        visualizer.visible = false;
        visualizer.update();
        scene.add(visualizer);
        const diamond = new THREE.Mesh(geo, new THREE.ShaderMaterial({
            uniforms: {
                envMap: { value: environment },
                bvh: { value: new MeshBVHUniformStruct() },
                bounces: { value: 3 },
                color: { value: color },
                ior: { value: ior },
                correctMips: { value: true },
                projectionMatrixInv: { value: camera.projectionMatrixInverse },
                viewMatrixInv: { value: camera.matrixWorld },
                chromaticAberration: { value: true },
                aberrationStrength: { value: 0.01 },
                resolution: { value: new THREE.Vector2(clientWidth, clientHeight) }
            },
            vertexShader: /*glsl*/ `
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            uniform mat4 viewMatrixInv;
            void main() {
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vNormal = (viewMatrixInv * vec4(normalMatrix * normal, 0.0)).xyz;
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
            }
            `,
            fragmentShader: /*glsl*/ `
            precision highp isampler2D;
            precision highp usampler2D;
            varying vec3 vWorldPosition;
            varying vec3 vNormal;
            uniform samplerCube envMap;
            uniform float bounces;
            ${shaderStructs}
            ${shaderIntersectFunction}
            uniform BVH bvh;
            uniform float ior;
            uniform vec3 color;
            uniform bool correctMips;
            uniform bool chromaticAberration;
            uniform mat4 projectionMatrixInv;
            uniform mat4 viewMatrixInv;
            uniform vec2 resolution;
            uniform bool chromaticAbberation;
            uniform float aberrationStrength;
            vec3 totalInternalReflection(vec3 ro, vec3 rd, vec3 normal, float ior) {
                vec3 rayOrigin = ro;
                vec3 rayDirection = rd;
                rayDirection = refract(rayDirection, normal, 1.0 / ior);
                rayOrigin = vWorldPosition + rayDirection * 0.001;
                for(float i = 0.0; i < bounces; i++) {
                    uvec4 faceIndices = uvec4( 0u );
                    vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
                    vec3 barycoord = vec3( 0.0 );
                    float side = 1.0;
                    float dist = 0.0;
                    bvhIntersectFirstHit( bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist );
                    vec3 hitPos = rayOrigin + rayDirection * max(dist - 0.001, 0.0);
                   // faceNormal *= side;
                    vec3 tempDir = refract(rayDirection, faceNormal, ior);
                    if (length(tempDir) != 0.0) {
                        rayDirection = tempDir;
                        break;
                    }
                    rayDirection = reflect(rayDirection, faceNormal);
                    rayOrigin = hitPos + rayDirection * 0.01;
                }
                return rayDirection;
            }
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution;
                vec3 directionCamPerfect = (projectionMatrixInv * vec4(uv * 2.0 - 1.0, 0.0, 1.0)).xyz;
                directionCamPerfect = (viewMatrixInv * vec4(directionCamPerfect, 0.0)).xyz;
                directionCamPerfect = normalize(directionCamPerfect);
                vec3 normal = vNormal;
                vec3 rayOrigin = vec3(cameraPosition);
                vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
                vec3 finalColor;
                if (chromaticAberration) {
                vec3 rayDirectionR = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 - aberrationStrength), 1.0));
                vec3 rayDirectionG = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0));
                vec3 rayDirectionB = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 + aberrationStrength), 1.0));
                float finalColorR = textureGrad(envMap, rayDirectionR, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).r;
                float finalColorG = textureGrad(envMap, rayDirectionG, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).g;
                float finalColorB = textureGrad(envMap, rayDirectionB, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).b;
                finalColor = vec3(finalColorR, finalColorG, finalColorB) * color;
                } else {
                    rayDirection = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0));
                    finalColor = textureGrad(envMap, rayDirection, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection)).rgb;
                    finalColor *= color;
                }
                gl_FragColor = vec4(vec3(finalColor), 1.0);
            }
            `
        }));
        diamond.material.uniforms.bvh.value.updateFrom(collider.boundsTree);
        diamond.castShadow = true;
        diamond.receiveShadow = true;
        return diamond;
    }
    const diamond = makeDiamond(diamondGeo);
    scene.add(diamond);
    // Build postprocessing stack
    // Render Targets
    const defaultTexture = new THREE.WebGLRenderTarget(clientWidth, clientHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter
    });
    defaultTexture.depthTexture = new THREE.DepthTexture(clientWidth, clientHeight, THREE.FloatType);
    // Post Effects
    const composer = new EffectComposer(renderer);
    const smaaPass = new SMAAPass(clientWidth, clientHeight);
    const effectPass = new ShaderPass(EffectShader);
    composer.addPass(effectPass);
    composer.addPass(new ShaderPass(GammaCorrectionShader));
    composer.addPass(smaaPass);
    const effectController = {
        bounces: 3.0,
        ior: 2.4,
        correctMips: true,
        chromaticAberration: true,
        aberrationStrength: 0.01
    };
    // const gui = new GUI();
    // gui.add(effectController, "bounces", 1.0, 10.0, 1.0).name("Bounces");
    // gui.add(effectController, "ior", 1.0, 5.0, 0.01).name("IOR");
    // gui.add(effectController, "correctMips");
    // gui.add(effectController, "chromaticAberration");
    // gui.add(effectController, "aberrationStrength", 0.00, 1.0, 0.0001).name("Aberration Strength");

    function animate() {
        renderer.render(scene, camera);
        diamond.rotation.y += 0.001;
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

export default main;

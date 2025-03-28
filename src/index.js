import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import * as THREEx from "@ar-js-org/ar.js/three.js/build/ar-threex.js";

const sliderTrack = document.querySelector(".slider-track");
const lowerHandle = document.getElementById("lowerHandle");
const upperHandle = document.getElementById("upperHandle");
const lowerBoundValue = document.getElementById("lowerBoundValue");
const upperBoundValue = document.getElementById("upperBoundValue");
const lowerOverlay = document.getElementById("lowerOverlay");
const upperOverlay = document.getElementById("upperOverlay");

let isDragging = null;

function setHandlePosition(handle, value) {
    handle.style.left = `${value}%`;
}

function updateOverlays() {
    const lowerValue = parseInt(lowerHandle.style.left);
    const upperValue = parseInt(upperHandle.style.left);
    lowerOverlay.style.width = `${lowerValue}%`;
    upperOverlay.style.left = `${upperValue}%`;
    upperOverlay.style.width = `${100 - upperValue}%`;
}

function updateValues() {
    const lowerValue = parseInt(lowerHandle.style.left);
    const upperValue = parseInt(upperHandle.style.left);
    lowerBoundValue.textContent = lowerValue;
    upperBoundValue.textContent = upperValue;
    updateOverlays();
}

function handleMouseDown(e) {
    isDragging = e.target;
}

function handleMouseUp() {
    isDragging = null;
}

function handleMouseMove(e) {
    if (!isDragging) return;

    const rect = sliderTrack.getBoundingClientRect();
    let value = ((e.clientX - rect.left) / rect.width) * 100;
    value = Math.min(Math.max(value, 0), 100);

    if (isDragging === lowerHandle) {
        const upperValue = parseInt(upperHandle.style.left);
        if (value < upperValue) {
            setHandlePosition(lowerHandle, value);
        }
    } else if (isDragging === upperHandle) {
        const lowerValue = parseInt(lowerHandle.style.left);
        if (value > lowerValue) {
            setHandlePosition(upperHandle, value);
        }
    }

    updateValues();
}

setHandlePosition(lowerHandle, 0);
setHandlePosition(upperHandle, 100);
updateValues();

lowerHandle.addEventListener("mousedown", handleMouseDown);
upperHandle.addEventListener("mousedown", handleMouseDown);
document.addEventListener("mouseup", handleMouseUp);
// Touch events for mobile support
lowerHandle.addEventListener("touchstart", (e) => {
    handleMouseDown(e.touches[0]);
});
upperHandle.addEventListener("touchstart", (e) => {
    handleMouseDown(e.touches[0]);
});
document.addEventListener("touchend", handleMouseUp);

// Scene setup
let scene, camera, controls;
let arToolkitSource, arToolkitContext, markerRoot;
scene = new THREE.Scene();
markerRoot = new THREE.Group();
camera = new THREE.Camera();

// GUI setup
const gui = new GUI();
const guiHelper = { mode: "Visualize mode", name: "Select File" };
const guiMode = gui
    .add(guiHelper, "mode", ["Normal", "AR"])
    .onChange((value) => {
        if (value === "Normal") {
            switchMode(false);
        } else {
            switchMode(true);
        }
    });
const guiItem = gui
    .add(guiHelper, "name", ["01_column", "02_ground", "03_ground", "04_groundKB526", "05_groundLE3", "06_Column533",
                                "Aging_building_Straight_retaining_wall", "Aging_building_Straight_retaining_wall_2",
                                "Aging_building_Curved_strut", "Aging_building_Stair_ground",
                                "Aging_building_Stair_side", "Aging_building_Stair_side_2",
                                "Aging_building_Lintel", "Muiwo-1", "Muiwo-2", "Muiwo-3", "Muiwo-4"])
    .name("GPR Example")
    .onChange((value) => load(value));
let folderArray = [];
// GUI setup

const loadingManager = new THREE.LoadingManager();
const loadingOverlay = document.createElement("div");

loadingOverlay.style.position = "fixed";
loadingOverlay.style.top = "0";
loadingOverlay.style.left = "0";
loadingOverlay.style.width = "100%";
loadingOverlay.style.height = "100%";
loadingOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
loadingOverlay.style.display = "flex";
loadingOverlay.style.flexDirection = "column";
loadingOverlay.style.justifyContent = "center";
loadingOverlay.style.alignItems = "center";
loadingOverlay.style.zIndex = "1000";
loadingOverlay.style.display = "none";

// 3D loading animation setup
const loadingScene = new THREE.Scene();
const loadingCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
loadingCamera.position.z = 2;

const loadingRenderer = new THREE.WebGLRenderer({ alpha: true });
loadingRenderer.setSize(200, 200);
loadingRenderer.setClearColor(0x000000, 0);

const loadingGeometry = new THREE.IcosahedronGeometry(1, 0);
const loadingMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0xf3f3f3,
});
const loadingMesh = new THREE.Mesh(loadingGeometry, loadingMaterial);
function animateLoading() {
    requestAnimationFrame(animateLoading);
    loadingMesh.rotation.y += 0.02;
    loadingRenderer.render(loadingScene, loadingCamera);
}

loadingScene.add(loadingMesh);
loadingOverlay.appendChild(loadingRenderer.domElement);
document.body.appendChild(loadingOverlay);

animateLoading();
loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    loadingOverlay.style.display = "flex";
    scene.clear();
    markerRoot.clear();
    folderArray.forEach((folder) => {
        folder.destroy();
    });
};
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {};
loadingManager.onLoad = function () {
    loadingOverlay.style.display = "none";
};
loadingManager.onError = function (url) {
    loadingOverlay.style.display = "none";
};

const loader = new PLYLoader(loadingManager);

let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0px";
renderer.domElement.style.left = "0px";
// document.body.appendChild(renderer.domElement);

function load(name) {
    loader.load(`./data/${name}.ply`, function (plyGeometry) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
                plyGeometry.attributes.position.array,
                3
            )
        );
        geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(
                plyGeometry.attributes.color.array,
                3
            )
        );
        geometry.needsUpdate = true;

        const planes = [
            new THREE.Vector4(1, 0, 0, 0),
            new THREE.Vector4(0, 1, 0, 0),
            new THREE.Vector4(0, 0, 1, 0),
        ];
        let dir = new THREE.Vector3(1, 1, 1);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            vertexColors: true,
            clipping: true,
            uniforms: {
                L: { value: 0 },
                R: { value: 100 },
                xPlane: { value: planes[0] },
                yPlane: { value: planes[1] },
                zPlane: { value: planes[2] },
                dir: { value: dir },
            },
            vertexShader: `
                    vec3 interpolateColor(float ratio, vec3 color1, vec3 color2) {
                        return mix(color1, color2, ratio);
                    }
    
                    vec3 intensityToRGB(float intensity) {
                        if (intensity <= 0.333) {
                            return interpolateColor(intensity / 0.333, vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 0.0)); // Blue -> Green
                        } else if (intensity <= 0.666) {
                            return interpolateColor((intensity - 0.333) / 0.333, vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0)); // Green -> Yellow
                        } else {
                            return interpolateColor((intensity - 0.666) / 0.334, vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0)); // Yellow -> Red
                        }
                    }
    
                    uniform float L;
                    uniform float R;
                    varying vec3 vColor;
                    varying vec3 vPosition;
    
                    void main() {
                        vPosition = position;
    
                        float intensity = color[0];
                        vColor = intensityToRGB(intensity);
    
                        if (intensity < L - 1e-6 || intensity > R + 1e-6) {
                            gl_Position = vec4(0.0, 0.0, 1e10, 1.0);
                        } else {
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
    
                        gl_PointSize = 6.0;
                    }
                `,
            fragmentShader: `
                    varying vec3 vColor;
                    varying vec3 vPosition;
                    uniform vec4 xPlane;
                    uniform vec4 yPlane;
                    uniform vec4 zPlane;
                    uniform vec3 dir;
                    
                    void main() {
                        if ((dir.x == 1.0 && dot(vPosition, xPlane.xyz) > xPlane.w) ||
                            (dir.x == -1.0 && dot(vPosition, xPlane.xyz) < xPlane.w)) {
                            discard;
                        }
                        if ((dir.y == 1.0 && dot(vPosition, yPlane.xyz) > yPlane.w) ||
                            (dir.y == -1.0 && dot(vPosition, yPlane.xyz) < yPlane.w)) {
                            discard;
                        }
                        if ((dir.z == 1.0 && dot(vPosition, zPlane.xyz) > zPlane.w) ||
                            (dir.z == -1.0 && dot(vPosition, zPlane.xyz) < zPlane.w)) {
                            discard;
                        }
    
                        gl_FragColor = vec4(vColor, 1.0);
                    }
                `,
        });

        document.addEventListener("mousemove", (e) => {
            handleMouseMove(e);
            const lowerValue = parseInt(lowerHandle.style.left);
            const upperValue = parseInt(upperHandle.style.left);
            material.uniforms.L.value = lowerValue / 100;
            material.uniforms.R.value = upperValue / 100;
        });

        document.addEventListener("touchmove", (e) => {
            handleMouseMove(e.touches[0]);
            const lowerValue = parseInt(lowerHandle.style.left);
            const upperValue = parseInt(upperHandle.style.left);
            material.uniforms.L.value = lowerValue / 100;
            material.uniforms.R.value = upperValue / 100;
        });

        geometry.computeVertexNormals();
        geometry.center();

        // Create and add the point cloud to the scene
        const pointCloud = new THREE.Points(geometry, material);
        scene.add(pointCloud);

        // Create an ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 10000);
        scene.add(ambientLight);
        // Create a hemispheric light
        const hemisphereLight = new THREE.HemisphereLight(
            0xffffff,
            0x444444,
            10000
        );
        scene.add(hemisphereLight);

        geometry.computeBoundingBox();
        if (isAR) {
            scene.add(markerRoot);
            markerRoot.add(pointCloud);
            geometry.computeBoundingBox();

            // Get the bounding box
            const boundingBox = geometry.boundingBox;

            // Calculate the center of the bounding box
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);

            // Create a translation matrix to move the geometry to the origin
            const translationMatrix = new THREE.Matrix4().makeTranslation(
                -center.x,
                -center.y,
                -center.z
            );

            // Apply the translation to the geometry
            geometry.applyMatrix4(translationMatrix);

            // Calculate the maximum dimension of the bounding box
            const maxDimension = Math.max(
                boundingBox.max.x - boundingBox.min.x,
                boundingBox.max.y - boundingBox.min.y,
                boundingBox.max.z - boundingBox.min.z
            );

            // Calculate the scale factor to fit the geometry within a 1x1x1 cube
            const scaleFactor = 10 / maxDimension;

            // Create a scale matrix
            const scaleMatrix = new THREE.Matrix4().makeScale(
                scaleFactor,
                scaleFactor,
                scaleFactor
            );

            // Apply the scale to the geometry
            geometry.applyMatrix4(scaleMatrix);

            // Update the geometry's attributes
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
        } else {
            // Compute the bounding box of the point cloud
            const boundingBox = new THREE.Box3().setFromObject(pointCloud);
            boundingBox.getCenter(camera.position);

            // Adjust the camera position
            const size = boundingBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            camera.position.set(
                camera.position.x,
                camera.position.y,
                cameraZ * 1.5
            );
            // Make the camera look at the center of the point cloud
            camera.lookAt(boundingBox.getCenter(new THREE.Vector3()));

            // GUI setup
            const planeNames = ["X", "Y", "Z"];
            const planeHelpers = [
                new THREE.PlaneHelper(new THREE.Plane(), 1.3, 0xff0000),
                new THREE.PlaneHelper(new THREE.Plane(), 1.3, 0x00ff00),
                new THREE.PlaneHelper(new THREE.Plane(), 1.3, 0x0000ff),
            ];
            planeHelpers.forEach((planeHelper) => {
                scene.add(planeHelper);
                planeHelper.visible = true;
            });

            planes.forEach((plane, index) => {
                plane.w =
                    boundingBox.max[planeNames[index].toLowerCase()] + 1e-6;
                planeHelpers[index].plane = new THREE.Plane(
                    new THREE.Vector3().fromArray(plane.toArray()),
                    -plane.w
                );

                const planeFolder = gui.addFolder(`plane${planeNames[index]}`);
                planeFolder.domElement
                    .querySelector(".title")
                    .style.setProperty(
                        "color",
                        `#${planeHelpers[index].material.color.getHexString()}`
                    );
                planeFolder
                    .add(planeHelpers[index], "visible")
                    .name("displayHelper");
                planeFolder
                    .add(plane, "w")
                    .name("position")
                    .min(
                        boundingBox.min[planeNames[index].toLowerCase()] - 1e-6
                    )
                    .max(
                        boundingBox.max[planeNames[index].toLowerCase()] + 1e-6
                    )
                    .onChange((value) => {
                        plane.w = value;
                        planeHelpers[index].plane = new THREE.Plane(
                            new THREE.Vector3().fromArray(plane.toArray()),
                            -value
                        );
                    });
                planeFolder
                    .add({ mirror: false }, "mirror")
                    .onChange((value) => {
                        dir[planeNames[index].toLowerCase()] =
                            -dir[planeNames[index].toLowerCase()];
                    });
                planeFolder.open();
                folderArray.push(planeFolder);
            });
        }
    });
}

let isAR = false;

function swithchToNormal() {
    renderer.setClearColor(new THREE.Color("black"), 1);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    controls = new TrackballControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth orbiting
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 1.2;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 1.0;
    controls.target.set(0, 0, 0);
}

function switchToAR() {
    scene = new THREE.Scene();
    camera = new THREE.Camera();
    scene.add(camera);
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: "webcam",
    });

    // Handle resizing
    arToolkitSource.init(function onReady() {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(
                arToolkitContext.arController.canvas
            );
        }
    });

    // Create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: "./data/camera_para.dat",
        detectionMode: "mono",
    });

    // Initialize it
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // Create a marker group
    markerRoot = new THREE.Group();
    scene.add(markerRoot);

    // Create marker controls
    controls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: "pattern",
        patternUrl: "./data/patt.hiro",
    });
}

function switchMode(mode) {
    isAR = mode;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    document.getElementById("threed-container").innerHTML = "";
    document
        .getElementById("threed-container")
        .appendChild(renderer.domElement);
    if (isAR) {
        switchToAR();
    } else {
        arToolkitSource = null;
        arToolkitContext = null;
        swithchToNormal();
    }
    if (guiItem.getValue() !== "Select File") {
        load(guiItem.getValue());
    }
}

guiMode.setValue("Normal");

// stats setup
let stats = new Stats();
// document.body.appendChild(stats.dom);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    if (!isAR) controls.update();
    else if (isAR && arToolkitSource && arToolkitSource.ready !== false) {
        arToolkitContext.update(arToolkitSource.domElement);
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer.domElement);
    }
    stats.begin();
    renderer.render(scene, camera);
    stats.end();
}
animate();
// Handle window resize
window.addEventListener("resize", () => {
    if (!isAR) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    if (isAR && arToolkitSource) {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(
                arToolkitContext.arController.canvas
            );
        }
    }
});

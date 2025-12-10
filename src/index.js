import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as THREEx from "@ar-js-org/ar.js/three.js/build/ar-threex.js";
import { debug } from "three/tsl";

const file_content = [
    {
        name: "01_column",
        url: "./data/01_column.ply",
        description:
            "Ground-penetrating radar (GPR) is a non-invasive geophysical method that uses radar pulses to image the subsurface, helping to locate buried objects and map underground features without disturbing the ground. It is commonly used in fields like archaeology, construction, and environmental studies to detect utilities, geological changes, and unmarked graves.",
        image: "./image/20250416_105229.JPG",
        bounds: [60, 90],
    },
    {
        name: "02_ground",
        url: "./data/02_ground.ply",
        description: "11111111111111111111111111111111111111111",
        image: "",
        bounds: [50, 60],
    },
    {
        name: "03_ground",
        url: "./data/03_ground.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "04_groundKB526",
        url: "./data/04_groundKB526.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "04_groundKB526_mod",
        url: "./data/04_groundKB526_mod.ply",
        description: "The rebar grid is at a depth of 10cm underground; the spacing rebars is around 20cm.",
        image: "/image/KB_526.png",
        bounds: [0, 100],
    },
    {
        name: "05_groundLE3",
        url: "./data/05_groundLE3.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "06_Column533",
        url: "./data/06_Column533.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Aging_building_Straight_retaining_wall",
        url: "./data/Aging_building_Straight_retaining_wall.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Aging_building_Straight_retaining_wall_2",
        url: "./data/Aging_building_Straight_retaining_wall_2.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Aging_building_Curved_strut",
        url: "./data/Aging_building_Curved_strut.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Aging_building_Stair_ground",
        url: "./data/Aging_building_Stair_ground.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Aging_building_Stair_side",
        url: "./data/Aging_building_Stair_side.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Aging_building_Stair_side_2",
        url: "./data/Aging_building_Stair_side_2.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Aging_building_Lintel",
        url: "./data/Aging_building_Lintel.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Muiwo-1",
        url: "./data/Muiwo-1.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Muiwo-2",
        url: "./data/Muiwo-2.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Muiwo-3",
        url: "./data/Muiwo-3.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Muiwo-4",
        url: "./data/Muiwo-4.ply",
        description: "",
        image: "",
        bounds: [0, 100],
    },
    {
        name: "Survey_MWWT_Ground1_Floor3_251209",
        url: "./data/Survey_MWWT_Ground1_Floor3_251209.ply",
        description:
            "Muiwo watchtower Site Stair, Floor 1:\n" +
            "- Scan area: 90cm × 70cm.\n" +
            "- Condition: Protective layer above the scan site has spalled, exposing corroded reinforcement.\n" +
            "- Vertical rebar diameter: 11–15mm.\n" +
            "- Horizontal rebar diameter: approx. 3.52mm.\n" +
            "- Vertical rebar spacing: 16cm.\n" +
            "- Horizontal rebar spacing: approx. 17cm (spacing does not include bar diameter).\n" +
            "- Schematic layout:\n" +
            "  - 80cm / 60cm indicated for SD1 and SD2 reference directions.",
        image: "/image/Survey_MWWT_Ground1_Floor3_251209.png",
        bounds: [0, 100],
    },
    {
        name: "TreeRoot_t186_250918",
        url: "./data/TreeRoot_t186_250918.ply",
        description: "The treeroot condition of the treeroot t186_250918 by GPR.",
        image: "/image/TreeRoot_t186_250918_scanSite.png",
        bounds: [0, 100],
    },
];

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

const overlayDescription = document.getElementById("myOverlay");
const overlayContent = document.getElementById("myOverlayContent");
overlayDescription.onclick = function () {
    overlayDescription.style.display = "none";
};
overlayContent.onclick = function (event) {
    event.stopPropagation();
    overlayDescription.style.display = "none";
};

let selected_description = "";
let selected_image = "";
const gui = new GUI();
const guiHelper = {
    mode: "Visualize mode",
    name: "Select File",
    showDescription: function () {
        if (!selected_description) return;
        overlayDescription.style.display = "flex";
        overlayContent.innerHTML = selected_description;
        if (selected_image) {
            overlayContent.innerHTML += `<br><br><img src="${selected_image}" alt="Image" style="width: 60%; height: auto;">`;
        }
    },
};
const guiMode = gui
    .add(guiHelper, "mode", ["Normal" , "AR"])
    .onChange((value) => {
        if (value === "Normal") {
            switchMode(false);
        } else {
            switchMode(true);
        }
    });
const guiItem = gui
    .add(
        guiHelper,
        "name",
        file_content.map((item) => item.name)
    )
    .name("GPR Example")
    .onChange((value) => load(value));
const guiDescription = gui
    .add(guiHelper, "showDescription")
    .name("Show Description");
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

const pointMarkerList = [];
const pointMarkerList2 = [];
const lineMarkerList = [];
const annotationList = [];
const pointMaterial = new THREE.MeshBasicMaterial({
    color: 0xff5555,
});
const pointMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x5555ff,
});
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff5555,
});

/**
 * 0: 空
 * 1: 两点测距
 * 2: 三点测面积
 */
let measurementStatus = 0;
let lengthBtn = document.getElementById("measure-length");
let areaBtn = document.getElementById("measure-area");
let measureClearBtn = document.getElementById("measure-clear");

function statusChangeClear(sceneClear = false) {
    if (measurementStatus === 1) {
        if (pointMarkerList.length % 2 != 0)
            scene.remove(pointMarkerList.pop());
    } else if (measurementStatus === 2) {
        if (pointMarkerList2.length % 3 != 0)
            scene.remove(pointMarkerList2.pop());
    }

    measurementStatus = 0;
    lengthBtn.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    areaBtn.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    lengthBtn.removeAttribute("disabled");
    areaBtn.removeAttribute("disabled");

    if (sceneClear) {
        pointMarkerList.forEach((marker) => {
            scene.remove(marker);
        });
        pointMarkerList2.forEach((marker) => {
            scene.remove(marker);
        });
        lineMarkerList.forEach((line) => {
            scene.remove(line);
        });
        annotationList.forEach((annotation) => {
            scene.remove(annotation);
        });
        pointMarkerList.length = 0;
        pointMarkerList2.length = 0;
        lineMarkerList.length = 0;
        annotationList.length = 0;
    }
}

lengthBtn.onclick = function () {
    if (measurementStatus === 0) {
        lengthBtn.removeAttribute("disabled");
        measurementStatus = 1;
        lengthBtn.style.backgroundColor = "rgb(21, 142, 10)";
        areaBtn.setAttribute("disabled", "true");
    } else statusChangeClear();
};

areaBtn.onclick = function () {
    if (measurementStatus === 0) {
        areaBtn.removeAttribute("disabled");
        measurementStatus = 2;
        areaBtn.style.backgroundColor = "rgb(21, 142, 10)";
        lengthBtn.setAttribute("disabled", "true");
    } else statusChangeClear();
};

measureClearBtn.onclick = function () {
    statusChangeClear(true);
};

function getIntersections(event, _camera, L, R) {
    for (const child of scene.children) {
        if (child.type !== "Points") continue;
        var vector = new THREE.Vector2();
        vector.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(vector, _camera);
        raycaster.params.Points.threshold = 0.005;
        let result = raycaster.intersectObjects([child], true);
        // ! GPT 生成
        result = result.filter((intersect) => {
            const point = intersect.index;

            const intensity = child.geometry.attributes.color.getX(point);
            const { xPlane, yPlane, zPlane, dir } = child.material.uniforms;

            // 判断 intensity 是否在 Shader 中允许的范围内
            if (intensity < L - 1e-6 || intensity > R + 1e-6) {
                return false;
            }

            // 判断是否被 clipping plane discard 掉
            const pos = new THREE.Vector3().fromBufferAttribute(
                child.geometry.attributes.position,
                point
            );

            if (
                (dir.x === 1 && xPlane.normal.dot(pos) > xPlane.constant) ||
                (dir.x === -1 && xPlane.normal.dot(pos) < xPlane.constant)
            ) {
                return false;
            }

            if (
                (dir.y === 1 && yPlane.normal.dot(pos) > yPlane.constant) ||
                (dir.y === -1 && yPlane.normal.dot(pos) < yPlane.constant)
            ) {
                return false;
            }

            if (
                (dir.z === 1 && zPlane.normal.dot(pos) > zPlane.constant) ||
                (dir.z === -1 && zPlane.normal.dot(pos) < zPlane.constant)
            ) {
                return false;
            }

            return true;
        });
        // ! GPT 生成
        return result;
    }

    return [];
}

const textMaterials = [
    new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
    new THREE.MeshPhongMaterial({ color: 0xffffff }), // side
];

const fontLoader = new FontLoader();
let font;
fontLoader.load("optimer_regular.typeface.json", function (response) {
    debugger;
    font = response;
});
function pointMeasurement(coordinate) {
    if (measurementStatus === 0) return;
    const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 10, 20),
        measurementStatus === 1 ? pointMaterial : pointMaterial2
    );
    marker.position.copy(coordinate);
    if (measurementStatus === 1) pointMarkerList.push(marker);
    else pointMarkerList2.push(marker);
    scene.add(marker);
    if (pointMarkerList.length % 2 == 0 && measurementStatus === 1) {
        const p1 = pointMarkerList[pointMarkerList.length - 2].position;
        const p2 = marker.position;

        const lineMarker = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([p1, p2]),
            lineMaterial
        );

        lineMarkerList.push(lineMarker);
        scene.add(lineMarker);

        const distance = p1.distanceTo(p2).toFixed(2);
        const textGeo = new TextGeometry(`${distance}`, {
            font: font,
            size: 0.05,
            height: 0.01,
            curveSegments: 12,
        });
        const textMesh = new THREE.Mesh(textGeo, textMaterials);
        textMesh.position.copy(
            new THREE.Vector3().addVectors(p1, p2).divideScalar(2)
        );
        annotationList.push(textMesh);
        scene.add(textMesh);
    } else if (pointMarkerList2.length % 3 == 0 && measurementStatus === 2) {
        const p1 = pointMarkerList2[pointMarkerList2.length - 3].position;
        const p2 = pointMarkerList2[pointMarkerList2.length - 2].position;
        const p3 = marker.position;

        const triangle = new THREE.Mesh(
            new THREE.BufferGeometry().setFromPoints([p1, p2, p3]),
            new THREE.MeshBasicMaterial({
                color: 0x5555ff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5,
            })
        );
        scene.add(triangle);
        lineMarkerList.push(triangle);

        const area = Math.abs(
            (p1.x * (p2.y - p3.y) +
                p2.x * (p3.y - p1.y) +
                p3.x * (p1.y - p2.y)) /
                2
        ).toFixed(2);
        const textGeo = new TextGeometry(`${area}`, {
            font: font,
            size: 0.05,
            height: 0.01,
            curveSegments: 12,
        });
        const textMesh = new THREE.Mesh(textGeo, textMaterials);
        textMesh.position.copy(
            new THREE.Vector3(
                (p1.x + p2.x + p3.x) / 3,
                (p1.y + p2.y + p3.y) / 3,
                (p1.z + p2.z + p3.z) / 3
            )
        );
        annotationList.push(textMesh);
        scene.add(textMesh);
    }
}

function load(name) {
    // find url using name
    const file = file_content.find((item) => item.name === name);

    if (!file || !file.url) {
        console.error("File not found:", name);
        return;
    }

    setHandlePosition(lowerHandle, file.bounds[0]);
    setHandlePosition(upperHandle, file.bounds[1]);
    updateValues();

    loader.load(file.url, function (plyGeometry) {
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

        // Prevent duplicate event listeners by adding them only once, outside the loader callback
        if (!window.__customEventListenersAdded) {
            document.addEventListener("mousemove", (e) => {
                if (measurementStatus !== 0) return;
                handleMouseMove(e);
                const lowerValue = parseInt(lowerHandle.style.left);
                const upperValue = parseInt(upperHandle.style.left);
                // Update all ShaderMaterials in the scene if needed
                scene.traverse((obj) => {
                    if (
                        obj.material &&
                        obj.material.uniforms &&
                        obj.material.uniforms.L &&
                        obj.material.uniforms.R
                    ) {
                        obj.material.uniforms.L.value = lowerValue / 100;
                        obj.material.uniforms.R.value = upperValue / 100;
                    }
                });
            });

            document.addEventListener("touchmove", (e) => {
                if (measurementStatus !== 0) return;
                handleMouseMove(e.touches[0]);
                const lowerValue = parseInt(lowerHandle.style.left);
                const upperValue = parseInt(upperHandle.style.left);
                scene.traverse((obj) => {
                    if (
                        obj.material &&
                        obj.material.uniforms &&
                        obj.material.uniforms.L &&
                        obj.material.uniforms.R
                    ) {
                        obj.material.uniforms.L.value = lowerValue / 100;
                        obj.material.uniforms.R.value = upperValue / 100;
                    }
                });
            });

            document.addEventListener("click", (e) => {
                if (measurementStatus === 0) return;
                camera.updateMatrixWorld();
                camera.updateProjectionMatrix();
                const intersects = getIntersections(
                    e,
                    camera,
                    parseInt(lowerHandle.style.left) / 100,
                    parseInt(upperHandle.style.left) / 100
                );
                if (intersects.length > 0) {
                    const intersect = intersects[0];
                    const coordinate = intersect.point;
                    pointMeasurement(coordinate);
                }
            });

            document.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                if (measurementStatus === 0) return;
                statusChangeClear();
            });

            window.__customEventListenersAdded = true;
        }

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

            selected_description = file.description;
            selected_image = file.image;
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

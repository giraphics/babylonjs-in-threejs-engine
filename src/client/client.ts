import * as THREE from 'three'
import { Scene } from '@babylonjs/core/scene'
import * as BABYLON from '@babylonjs/core'

// Reserve width and height
window.innerWidth = 800
window.innerHeight = 800

// Create WebGL 2 Context
const canvas = document.createElement('canvas')
const context = canvas.getContext('webgl2') as WebGL2RenderingContext

/*************************************************/
/***************** BABYLON SCENE *****************/
/*************************************************/

let bjsEngine: BABYLON.Engine
let bjsScene: Scene

function createBabylonJSEngine(glContext: WebGL2RenderingContext) {
    return new BABYLON.Engine(glContext, true, { preserveDrawingBuffer: true })
}

function createBabylonJSScene(engine: BABYLON.Engine) {
    bjsScene = new BABYLON.Scene(engine)
    bjsScene.activeCamera = new BABYLON.Camera('mapbox-Camera', new BABYLON.Vector3(), bjsScene)
    bjsScene.autoClear = false
    bjsScene.autoClearDepthAndStencil = false
    bjsScene.detachControl()

    const mat = new BABYLON.StandardMaterial("mat1", bjsScene);
    mat.wireframe = true;
    const box = BABYLON.MeshBuilder.CreateBox('box', { size: 4 }, bjsScene);
    box.material = mat;
    box.position.y = 0;

    const axis = new BABYLON.Vector3(0, 1, 0)
    bjsScene.registerBeforeRender(function () {
        box.rotate(axis, 0.01)
    })

    return bjsScene
}

function renderBabylonJS(cam: THREE.PerspectiveCamera) {
    const matrix = cam.matrix.elements;
    const engine = bjsScene.getEngine()

    if (bjsScene) {
        const projection = BABYLON.Matrix.FromArray(matrix)
        engine.wipeCaches(false)
        // scene.beforeRender = () => {
        //   engine.wipeCaches(true);
        // };
        if (!bjsScene.activeCamera) {
            console.log('scene.activeCamera is null')
            return
        }

        bjsScene.activeCamera.freezeProjectionMatrix(projection)
        let invert = bjsScene.activeCamera.getProjectionMatrix().clone().invert()
        bjsScene.activeCamera.position = BABYLON.Vector3.TransformCoordinates(
            new BABYLON.Vector3(),
            invert
        )
        bjsScene.render(false)
    }
}

/*************************************************/
/***************** THREEJS SCENE *****************/
/*************************************************/

const threeJsRenderer = new THREE.WebGLRenderer({
    context: context,
})

document.body.appendChild(canvas)
threeJsRenderer.setSize(window.innerWidth, window.innerHeight)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const sceneThreeJS = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

/*************************************************/
/*******CREATE BABYLON JS ENGINE AND SCENE********/
bjsEngine = createBabylonJSEngine(context)
bjsScene = createBabylonJSScene(bjsEngine)
/*************************************************/

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})

const cube = new THREE.Mesh(geometry, material)
sceneThreeJS.add(cube)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    threeJsRenderer.setSize(window.innerWidth, window.innerHeight)
    renderThreeJS(camera)
}

function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderThreeJS(camera)
    renderBabylonJS(camera)
}

function renderThreeJS(cam: THREE.PerspectiveCamera) {
    threeJsRenderer.render(sceneThreeJS, cam)
}

//setInterval(() => {console.log(camera);}, 5000);

animate()

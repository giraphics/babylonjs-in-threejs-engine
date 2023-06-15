import * as THREE from 'three'
import { Scene } from '@babylonjs/core/scene'
import * as BABYLON from '@babylonjs/core'

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

    const box = BABYLON.MeshBuilder.CreateBox('box', { size: 5 }, bjsScene)
    //box.position.y = -10;

    let a = 0
    const axis = new BABYLON.Vector3(0, 1, 0)
    bjsScene.registerBeforeRender(function () {
        box.rotate(axis, (a = 0.01))
    })

    return bjsScene
}

function renderBabylonJS(matrix: any) {
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
/***************** BABYLON SCENE *****************/
/*************************************************/

window.innerWidth = 800
window.innerHeight = 800

const useThreeJSDomElement = false
let canvas
let renderer: THREE.WebGLRenderer
let context: WebGL2RenderingContext
if (useThreeJSDomElement) {
    renderer = new THREE.WebGLRenderer()
    canvas = renderer.domElement
    context = canvas.getContext('webgl2') as WebGL2RenderingContext
} else {
    canvas = document.createElement('canvas')
    context = canvas.getContext('webgl2') as WebGL2RenderingContext
    renderer = new THREE.WebGLRenderer({
        context: context,
    })
    //   renderer.setClearColor( 0x000000, 1);
}

document.body.appendChild(canvas)
renderer.setSize(window.innerWidth, window.innerHeight)
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const sceneThreeJS = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2
bjsEngine = createBabylonJSEngine(context)
bjsScene = createBabylonJSScene(bjsEngine)

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
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderThreeJS()
}

function animate() {
    requestAnimationFrame(animate)
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderThreeJS()
    renderBabylonJS(camera.matrix.elements)
}

function renderThreeJS() {
    renderer.render(sceneThreeJS, camera)
}

//setInterval(() => {console.log(camera);}, 5000);

animate()

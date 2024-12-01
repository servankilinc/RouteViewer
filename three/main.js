import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const _canvas = document.getElementById("canvas");
const scene = new THREE.Scene()
scene.background = new THREE.Color().setRGB( 0.5, 0.5, 0.5 );
const renderer = new THREE.WebGLRenderer()
renderer.setSize(1200, 700)
renderer.setAnimationLoop( animate );
_canvas.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set( 0, 2, 5 );

const controls = new OrbitControls(camera, renderer.domElement)
const light = new THREE.DirectionalLight( 0xFFFFFF );
scene.add( light );

 
scene.add(new THREE.AxesHelper(5))

const loader = new GLTFLoader();

loader.load( './untitled.glb', function ( gltf ) {
    const model = gltf.scene;
        // Bounding Box Hesaplama
        const box = new THREE.Box3().setFromObject(model);
    
        // Boyutları Hesapla
        const size = box.getSize(new THREE.Vector3());
        console.log('Genişlik:', box.getSize(new THREE.Vector3()));
        console.log('Genişlik:', size.x);
        console.log('Yükseklik:', size.y);
        console.log('Derinlik:', size.z);
    gltf.scene.scale.setScalar(4/1)
    gltf.scene.position.x =  2
    gltf.scene.position.z =  2.9
    
	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );

const edges = [
    {
      id: "a2e854d9-7718-4a7f-ba6e-7a9f5824b7c8",
      x: 145,
      y: 176,
    },
    {
      id: "7ed721e8-be5a-417f-a0eb-6247a43156ea",
      x: 155,
      y: 392,
    },
    {
      id: "e95224d8-95a2-4079-89c4-6aa4b3663287",
      x: 707,
      y: 398,
    },
  ];

 
  edges.forEach((edge) => { 
    const geometry = new THREE.SphereGeometry( 0.2,  10, 10 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
const cube = new THREE.Mesh( geometry, material );
cube.position.set(edge.x/150,0, edge.y/150)
scene.add( cube );
  });


function animate() {
    
  requestAnimationFrame(animate)
 
  controls.update();
  renderer.render(scene, camera)
}
 
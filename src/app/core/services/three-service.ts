import { Injectable } from "@angular/core";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Flight } from "./flight-service";
import { degToRad } from "three/src/math/MathUtils.js";
@Injectable({
  providedIn: "root",
})
export class ThreeService {


  private renderer !: THREE.WebGLRenderer;
  private scene !: THREE.Scene;
  private camera !: THREE.PerspectiveCamera;
  private orbitControls!: OrbitControls;
  private earth!: THREE.Mesh;

threeInit( canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();

    //Asigning renderer to canvas HTML element
    canvas?.appendChild(this.renderer.domElement);
    this.renderer.setSize(
      canvas.clientWidth,
      canvas.clientHeight
    );

    //Camera initialization
   this.camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      2000
    );
    
    //OrbitControls configuration
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement); // Orbit contrils must be initialized after camera and renderer
    this.orbitControls.maxDistance = 17;
    this.orbitControls.autoRotate = false;
   // this.orbitControls.minPolarAngle = Math.PI / 3;
    this.orbitControls.minDistance = 5.1;
    //this.orbitControls.maxPolarAngle = (Math.PI / 3) * 2;
    this.orbitControls.dampingFactor = 0.08;
    this.orbitControls.enableDamping = true;


    this.renderer.setClearColor(0x171717);


    this.camera.position.set(8, 6, 8);

    this.orbitControls.update();
}

aircraftsMap = new Map<string, THREE.Group>
//Map o(1) - item acces time - Hashing and adressing - direct jump to memory
// airctaftsMap.has(id) - checking if contains
// aircraftsMap.get(id) - gets object with id

updateScene(newFlights : Flight[]){
const activeIds = new Set(newFlights.map(flight => flight.icao24))

//deleding planes - new flight data id did not match with old id
this.aircraftsMap.forEach((mesh, icao24) =>{
if(!activeIds.has(icao24)){
  this.scene.remove(mesh); // delete mesh from 3D scene
  this.disposeGroup(mesh)
  this.aircraftsMap.delete(icao24) // Delete icao from aircraftsMap
}
})
//Updating planes and adding New ones
newFlights.forEach((flight)=>{

const newPosition = this.calcVector3(flight.latitude,flight.longitude,5.05);

if(this.aircraftsMap.has(flight.icao24)){
const mesh = this.aircraftsMap.get(flight.icao24)
if(mesh){
  mesh.position.copy(newPosition);
  this.orientPlane(mesh,newPosition,flight.heading)
}
}else{
const newMesh = this.createAircraftMesh()
newMesh.position.copy(newPosition)
this.orientPlane(newMesh,newPosition,flight.heading)


this.scene.add(newMesh);
this.aircraftsMap.set(flight.icao24, newMesh)
}
}


)
console.log('active planes: ', this.aircraftsMap)
}

//AI generater function
private orientPlane(mesh: THREE.Object3D, position: THREE.Vector3, heading: number) {
  const upVector = position.clone().normalize();
  const northVector = new THREE.Vector3(0, 1, 0);
  const eastVector = new THREE.Vector3().crossVectors(northVector, upVector).normalize();
  const localNorth = new THREE.Vector3().crossVectors(upVector, eastVector).normalize();

  const headingRad = THREE.MathUtils.degToRad(heading);
  const flightDirection = new THREE.Vector3();
  flightDirection.addScaledVector(localNorth, Math.cos(headingRad));
  flightDirection.addScaledVector(eastVector, Math.sin(headingRad));

  const matrix = new THREE.Matrix4();
  // matrix.lookAt ustawia przód w stronę flightDirection
  matrix.lookAt(new THREE.Vector3(0, 0, 0), flightDirection, upVector);
  mesh.quaternion.setFromRotationMatrix(matrix);

  // KOREKTA: Jeśli samolot leci tyłem, obracamy go o 180 stopni (PI) wokół jego własnej osi Y.
  // Jeśli leci bokiem, spróbuj Math.PI / 2 (90 stopni).
  mesh.rotateY(Math.PI); 
}

/**
 * Clears GPU resources (geometry and material)
 * @param group - Three.Js group
 */
private disposeGroup(group :THREE.Group){
  group.traverse(object =>{
    if(object instanceof THREE.Mesh){
      object.geometry.dispose()
      object.material.dispose()
    }
  })
}

addLights(): void {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

  directionalLight.position.set(5, 10, 7.5);
  this.scene.add(directionalLight);
  this.scene.add(ambientLight);

}


 animate(): void {
    requestAnimationFrame(() => this.animate());

    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }


  onWindowResize(canvasRef: HTMLCanvasElement): void {
    this.camera.aspect =
      canvasRef.clientWidth / canvasRef.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      canvasRef.clientWidth,
      canvasRef.clientHeight
    );
  }


  createEarth() {
    const loader = new THREE.TextureLoader();
    
    // loading earth texture (color map)
    const earthTexture = loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  
    // loading earth texture(bump map)
    const bumpTexture = loader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
  
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,          // main texture
      bumpMap: bumpTexture,      // bump map
      bumpScale: 0.8,           // bump scale
      specular: new THREE.Color('grey'), // specular
      shininess: 5               // shininess
    });
  
    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
  }


  placeGeometryOnGlobe(lat:number, lon :number){

    const cube = this.createAircraftMesh()
    const radius = 5;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    cube.position.x = -radius * Math.sin(phi) * Math.cos(theta);
    cube.position.z = radius * Math.sin(phi) * Math.sin(theta);
    cube.position.y = radius * Math.cos(phi);
    cube.lookAt(new THREE.Vector3(0,0,0))
    cube.rotateX(-Math.PI/2)
    this.scene.add(cube);
  }



  //AI generated
  private createAircraftMesh(): THREE.Group {
  const aircraftGroup = new THREE.Group();

  // Plane parts material
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000, // Wyraźny żółty/pomarańczowy
    flatShading: true,
    metalness: 0.3,
    roughness: 0.7
  });

  // 1. body
  const bodyGeom = new THREE.CylinderGeometry(0.02, 0.01, 0.2, 8);
  const body = new THREE.Mesh(bodyGeom, material);
  
 
  body.rotation.x = Math.PI / 2;
  aircraftGroup.add(body);

  // 2. wings
 
  const wingsGeom = new THREE.BoxGeometry(0.16, 0.01, 0.05);
  const wings = new THREE.Mesh(wingsGeom, material);
  

  wings.position.z = 0.03; 
  aircraftGroup.add(wings);

  // 3. tail
  const tailHorizGeom = new THREE.BoxGeometry(0.06, 0.005, 0.03);
  const tailHoriz = new THREE.Mesh(tailHorizGeom, material);
  

  tailHoriz.position.z = -0.08;
  aircraftGroup.add(tailHoriz);

  // 4. fin
  const tailVertGeom = new THREE.BoxGeometry(0.005, 0.04, 0.03);
  const tailVert = new THREE.Mesh(tailVertGeom, material);
  
 
  tailVert.position.set(0, 0.02, -0.08);
  aircraftGroup.add(tailVert);

  //scale
  aircraftGroup.scale.set(0.15, 0.15, 0.15);

  return aircraftGroup;
}


/**
 * Calculates vector from earth coordinates (lat, lan, radius)
 */
private calcVector3(lat: number, lon: number, radius: number = 5): THREE.Vector3 {

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}
}
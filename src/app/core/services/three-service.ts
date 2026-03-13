import { inject, Injectable } from "@angular/core";
import * as THREE from "three";
import { EffectComposer, OrbitControls, OutlinePass, RenderPass } from "three/examples/jsm/Addons.js";
import { Flight, FlightService, GlobalFlightData } from "./flight-service";
import { degToRad } from "three/src/math/MathUtils.js";
import { map } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class ThreeService {
flightService = inject(FlightService)

  private renderer !: THREE.WebGLRenderer;
  private scene !: THREE.Scene;
  private camera !: THREE.PerspectiveCamera;
  private orbitControls!: OrbitControls;
  private earth!: THREE.Mesh;
  private clouds !: THREE.Mesh

  //Raycaster elements
  private raycaster !: THREE.Raycaster;
  private clickedVector !: THREE.Vector2;

  //Post processing effect composer
  private composer!: EffectComposer
  private outlinePass !: OutlinePass


aircraftsMap = new Map<string, THREE.Group>
//Map o(1) - item acces time - Hashing and adressing - direct jump to memory
// airctaftsMap.has(id) - checking if contains
// aircraftsMap.get(id) - gets object with id

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
    this.orbitControls.enablePan = false;
    this.orbitControls.rotateSpeed = 0.3;
    this.orbitControls.zoomSpeed = 0.6;
    this.orbitControls.dampingFactor = 0.15
    this.scene.background = new THREE.Color(0xffffff)
    this.renderer.setClearColor(0x171717);


    this.camera.position.set(8, 6, 8);

    this.orbitControls.update();
//raycaster configuration
this.raycaster = new THREE.Raycaster()
//composer and post processing configuration
const windowVector = new THREE.Vector2(canvas.clientWidth, canvas.clientHeight);
this.outlinePass = new OutlinePass(windowVector,this.scene,this.camera)
const renderPass = new RenderPass(this.scene,this.camera)
this.composer = new EffectComposer(this.renderer)


//Most important line in composer - we are passing renderer pass. 
this.composer.addPass(renderPass)
this.composer.addPass(this.outlinePass)

}



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
  //Updating active plane position
  mesh.position.copy(newPosition);
  this.orientPlane(mesh,newPosition,flight.heading)
}
}else{

  //Adding not existing plane
  const userData = {icao24: flight.icao24}
const newMesh = this.createAircraftMesh(userData)
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
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);

  directionalLight.position.set(20, 10, 20);
  //this.scene.add(directionalLight);
  this.scene.add(ambientLight);

}


animate(): void {
    requestAnimationFrame(() => this.animate());

    if(this.clouds){

      this.clouds.rotateY(0.00001);
    }
    this.orbitControls.update();

    //If we are using composer, we are rendering scene through it
    this.composer.render()
    //we are not using renderer.render now
    //this.renderer.render(this.scene, this.camera);
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

createClouds(){
  const textureLoader = new THREE.TextureLoader()

  const geometry = new THREE.SphereGeometry(5.1,64,64)

  const cloudMaterial = new THREE.MeshLambertMaterial({
  color: 0xffffff, 
  alphaMap: textureLoader.load('textures/clouds.jpg'), 
  opacity: 1,
  transparent: true,
  depthWrite: false ,
  blending: THREE.NormalBlending,
  side: THREE.DoubleSide
})

this.clouds = new THREE.Mesh(geometry,cloudMaterial),
this.scene.add(this.clouds)
}


createEarth() {
    const loader = new THREE.TextureLoader();
    
    // loading earth texture (color map)
    const earthTexture = loader.load('textures/earth.jpg');
  
    // loading earth texture(bump map)
    const bumpTexture = loader.load('textures/earth-bump.jpg');
    //loading earth at night - in material set as emissive map
    const earthNightTexture = loader.load('textures/earth-night.jpg')

    const geometry = new THREE.SphereGeometry(5, 64, 64);
    
    const material = new THREE.MeshStandardMaterial({
      map: earthTexture,          // main texture
      bumpMap: bumpTexture,      // bump map
      bumpScale: 0.8,           // bump scale
      roughness: 0.8
 
    });
    
    const nightEmissiveMaterial = new THREE.MeshStandardMaterial({
      map:earthTexture,
      emissiveMap: earthNightTexture,
      emissive: new THREE.Color(0xffff88), // Kolor świateł miast
      emissiveIntensity: 0.5
    })

    this.earth = new THREE.Mesh(geometry, material);
    this.scene.add(this.earth);
  }


placeGeometryOnGlobe(lat:number, lon :number){

    const cube = this.createAircraftMesh({icao24:"X-Jet BlackBird"})
    const radius = 5;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    cube.position.x = -radius * Math.sin(phi) * Math.cos(theta);
    cube.position.z = radius * Math.sin(phi) * Math.sin(theta);
    cube.position.y = radius * Math.cos(phi);
    cube.lookAt(new THREE.Vector3(0,0,0))
    cube.rotateX(-Math.PI/2)
    this.scene.add(cube);
    this.aircraftsMap.set( 'N/A',cube)
  }



  //AI generated
private createAircraftMesh(userData:Object): THREE.Group {
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
  aircraftGroup.userData = userData;
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

onClickedObject(e:PointerEvent, canvas : HTMLCanvasElement) {

  let boundaries = canvas.getBoundingClientRect();
  
  let windowWidth = canvas.clientWidth;
  let windowHeight = canvas.clientHeight
  
  

  
 
  console.log(this.outlinePass.selectedObjects);
  
this.configureOutlinePass()

let normal_x = ((e.clientX - boundaries.left)/windowWidth) *2 -1
let normal_y = -((e.clientY - boundaries.top)/windowHeight) *2 +1
console.log('normals: ', normal_x, normal_y  );


this.clickedVector = new THREE.Vector2(normal_x , normal_y)

this.raycaster.setFromCamera(this.clickedVector, this.camera)

const aircrafts = [...this.aircraftsMap.values()]

const objects = this.raycaster.intersectObjects(aircrafts,true)

if(objects.length>0){

const aircraftObject = objects[0].object.parent
this.outlinePass.selectedObjects = [];
if(aircraftObject){
this.outlinePass.selectedObjects = [aircraftObject]

}
const clickedAircraft :string= aircraftObject?.userData["icao24"]
if(clickedAircraft){
  console.log(clickedAircraft);
  this.flightService.$globalFlightsSubject.pipe(map((globalData)=>{
    const flight = globalData?.flights.find((flight)=>{ if(flight.icao24 == clickedAircraft){return 1}else{return 0}})
    return flight}
  )
).subscribe((flight)=>{
    console.log(flight);  this.outlinePass.selectedObjects = [];
    if(flight){
      this.flightService.detailsOfFlightSignal.set(flight)
    }
  })
  
}

}

}

configureOutlinePass(){
  if(this.outlinePass){
    this.outlinePass.edgeStrength = 5.0;      // emission strength
    this.outlinePass.edgeGlow = 1.0;          // glow strength
    this.outlinePass.edgeThickness = 2.0;     // edge thickness
    this.outlinePass.visibleEdgeColor.set('#5500ff'); // edge colors
   // this.outlinePass.hiddenEdgeColor.set('#00330000');  // edge color when plane is on other side
  
}}

}
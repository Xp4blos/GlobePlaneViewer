import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
@Component({
  selector: 'app-flight-visualizer',
  templateUrl: './flight-visualizer.html',
  styleUrl: './flight-visualizer.css',
})
export class FlightVisualizer implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  get canvasRef() {
    return this.canvas.nativeElement;
  }

  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;

  helper: THREE.GridHelper = new THREE.GridHelper(10, 10, 0xffffff);
  orbitControls!: OrbitControls;
  

  //earth mesh
  earth!: THREE.Mesh;

  //Lights
  ambientLight: THREE.AmbientLight = new THREE.AmbientLight(0xffffff, 1);
  directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(
    0xffffff,
    3
  );

  createScene(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.scene = new THREE.Scene();

    this.canvasRef?.appendChild(this.renderer.domElement);
    this.renderer.setSize(
      this.canvasRef.clientWidth,
      this.canvasRef.clientHeight
    );

    //Camera initialization
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.canvasRef.clientWidth / this.canvasRef.clientHeight,
      0.1,
      2000
    );
    //OrbitControls initialization
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    //OrbitControls configuration
    this.orbitControls.maxDistance = 20;
    this.orbitControls.minDistance = 6;
    this.orbitControls.autoRotate = false;
    this.orbitControls.minPolarAngle = Math.PI / 3;
    this.orbitControls.maxPolarAngle = (Math.PI / 3) * 2;
    this.orbitControls.dampingFactor = 0.08;
    this.orbitControls.enableDamping = true;


    this.renderer.setClearColor(0x171717);
    this.scene.add(this.helper);
    this.scene.add(this.ambientLight);
    this.scene.add(this.directionalLight);

    this.camera.position.set(8, 6, 8);
    this.orbitControls.update();
  }

  

  animate(): void {
    requestAnimationFrame(() => this.animate());

    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect =
      this.canvasRef.clientWidth / this.canvasRef.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.canvasRef.clientWidth,
      this.canvasRef.clientHeight
    );
  }


 

private createEarth() {
  const loader = new THREE.TextureLoader();
  
  // Ładowanie tekstury
  // Jeśli masz plik lokalnie: 'assets/textures/earth_map.jpg'
  const earthTexture = loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

  // Opcjonalnie: tekstura wypukłości (bump map), by góry wyglądały na 3D
  const bumpTexture = loader.load('https://unpkg.com/three-globe/example/img/earth-topology.jpg');

  const geometry = new THREE.SphereGeometry(5, 64, 64);
  
  const material = new THREE.MeshPhongMaterial({
    map: earthTexture,          // Główna tekstura kolorystyczna
    bumpMap: bumpTexture,      // Dodaje efekt 3D dla terenu
    bumpScale: 0.05,           // Siła efektu wypukłości
    specular: new THREE.Color('grey'), // Jak bardzo odbija światło (ocean będzie błyszczeć)
    shininess: 5               // Intensywność połysku
  });

  this.earth = new THREE.Mesh(geometry, material);
  this.scene.add(this.earth);
}


  ngOnInit(): void {
    this.createScene();
    this.animate();
    window.addEventListener('resize', () => this.onWindowResize(), false);
    console.log(this.canvas);

     this.createEarth();
  }
}

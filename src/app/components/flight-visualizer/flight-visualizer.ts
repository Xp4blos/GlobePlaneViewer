import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ThreeService } from '../../core/services/three-service';
import { FlightService } from '../../core/services/flight-service';
import { DatePipe } from '@angular/common';
@Component({
  imports: [DatePipe],
  selector: 'app-flight-visualizer',
  templateUrl: './flight-visualizer.html',
  styleUrl: './flight-visualizer.css',
})
export class FlightVisualizer implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  flightService = inject(FlightService)
  threeService = inject(ThreeService);
  

  lastUpdateTime = new Date();

  get canvasRef() {
    return this.canvas.nativeElement;
  }

fetchData(){
  console.log('fetching data');
  this.flightService.getAllFlights()
  this.flightService.$globalFlightsSubject.subscribe((globalFlightData)=>{
    if(globalFlightData?.flights){
  this.threeService.updateScene(globalFlightData?.flights)
  this.lastUpdateTime = new Date(globalFlightData.time)
  console.log('fetching...', globalFlightData);
  
    }
  })
}

 
  ngOnInit(): void {
  this.threeService.threeInit(this.canvasRef);
  this.threeService.addLights();
  this.threeService.animate();
  this.threeService.onWindowResize(this.canvasRef);
  this.threeService.createEarth();
  this.threeService.placeGeometryOnGlobe(50.27,18.69)


  this.fetchData()
  const intervalId = setInterval(() => {
    this.fetchData();
  }, 500000);

  
  }



}

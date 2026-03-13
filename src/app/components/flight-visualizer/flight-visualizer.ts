import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { ThreeService } from '../../core/services/three-service';
import { Flight, FlightService, GlobalFlightData } from '../../core/services/flight-service';
import { DatePipe } from '@angular/common';
import { FlightDetails } from '../flight-details/flight-details';
@Component({
  imports: [DatePipe, FlightDetails],
  selector: 'app-flight-visualizer',
  templateUrl: './flight-visualizer.html',
  styleUrl: './flight-visualizer.css',
})
export class FlightVisualizer implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  flightService = inject(FlightService)
  threeService = inject(ThreeService);
  globalDataHandler !: GlobalFlightData // localy stores api fetched data

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
  this.globalDataHandler = globalFlightData;
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
  this.threeService.createClouds()
  this.threeService.placeGeometryOnGlobe(50.27,18.69)

/*
   this.fetchData()
   const intervalId = setInterval(() => {
      this.fetchData();
   }, 50000000);

  */
  }

saveToStorage() {
 
  localStorage.setItem('aircrafts', JSON.stringify(this.globalDataHandler));
  console.log('saved global data to local storage: ', this.globalDataHandler);
  
}
loadFromStorage() {
 const rawData = localStorage.getItem('aircrafts');
  if (!rawData){ console.log('No data to load');
   return};

  const parsed = JSON.parse(rawData);

  try{
    this.flightService.$globalFlightsSubject.next(parsed)
    this.threeService.updateScene(parsed.flights)
    console.log('global data loaded from local storage');
    
  }
catch(err){
console.log('Cannot load data from local storage: ', err);

}
}
clearFromStorage(){
localStorage.removeItem('aircrafts')
}


onMouseClick($event: PointerEvent) {
  console.log(this.canvasRef);
  
  this.threeService.onClickedObject($event, this.canvasRef);
}
}




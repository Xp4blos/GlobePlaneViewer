import { Component, inject, OnInit } from "@angular/core";
import { FlightService } from "../../core/services/flight-service";

@Component({
  selector: "app-flight-details",
  imports: [],
  templateUrl: "./flight-details.html",
  styleUrl: "./flight-details.css",
})
export class FlightDetails implements OnInit{
flightService = inject(FlightService)
ngOnInit(): void {
  
}
}

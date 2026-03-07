import { Component, inject, OnInit } from "@angular/core";
import { FlightService } from "../../../core/services/flight-service";

@Component({
  selector: "app-footer",
  imports: [],
  templateUrl: "./footer.html",
  styleUrl: "./footer.css",
})
export class Footer implements OnInit {
  flights = inject(FlightService)


  ngOnInit(): void {
   
  }

}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import {BehaviorSubject, map} from 'rxjs'
import { all, velocity } from 'three/tsl';


export interface Flight {
  icao24: string;
  callsign: string;
  orgin_country: string,
  longitude: number;
  latitude: number;
  altitude: number;
  heading: number;
  vertical_rate: number;
  velocity:number
}
export interface GlobalFlightData {
  time: number;
  flights:Flight[];
}
export interface StatesAllResponse{
  time:number,
  states:any[]
}
export interface FlightsFilters{
  nationality:string
}
@Injectable({
  providedIn: 'root',
})
export class FlightService {
 private http = inject(HttpClient);

  defaulatFilters : FlightsFilters = {
    nationality: ''
  }


  flightFiltersSignal = signal<FlightsFilters>(this.defaulatFilters);
  followedFlightSignal = signal<string | null>(null);
  public detailsOfFlightSignal = signal<Flight | null>(null)
  $globalFlightsSubject = new BehaviorSubject<GlobalFlightData | null>(null);

  getAllFlights():void{
    this.http.get<StatesAllResponse>('https://opensky-network.org/api/states/all').pipe(map((response)=>{

      const allFlights = response.states.map(flight=>{
        return <Flight> {
          icao24: flight[0],
          callsign: flight[1].trim() || " ",
          orgin_country: flight[2],
          longitude: flight[5],
          latitude: flight[6],
          altitude: flight[7],
          heading: flight[10],
          vertical_rate: flight[11] || 0,
          velocity: flight[9] || 0
        }
      }).filter(flight=>{return flight.latitude && flight.longitude}).slice(0,500)


      return <GlobalFlightData> { time:response.time , flights: allFlights }

      
    }))
    .subscribe(
      (res)=>{
        this.$globalFlightsSubject.next(res)
       console.log(res);
       
      }
    )
  }

  //not finished
getFlightByIcao(icao:string){
  this.http.get(`https://opensky-network.org/api/states/all?icao24=${icao}`).subscribe((response)=>{
    console.log(response);
    
  })
}

}

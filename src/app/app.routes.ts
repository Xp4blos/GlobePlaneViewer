import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'flight-visualizer', pathMatch: 'full'},
    {path: 'flight-visualizer', loadComponent: () => import('./components/flight-visualizer/flight-visualizer').then(m => m.FlightVisualizer)},
];
